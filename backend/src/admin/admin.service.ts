import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { generateSecretKey } from '../devices/device.utils';
import { Device, DeviceDocument } from '../devices/schemas/device.schema';
import { Telemetry, TelemetryDocument } from '../telemetry/schemas/telemetry.schema';
import { ANALYTICS_RANGES, AnalyticsRange } from '../analytics/dto/analytics-query.dto';
import { TelemetryService } from '../telemetry/telemetry.service';
import { AdminPushTelemetryDto } from './dto/push-telemetry.dto';

function qualityScore(dissolvedOxygen: number, turbidity: number, ph: number): number {
  return (dissolvedOxygen + Math.max(0, 1 - turbidity / 10) + Math.max(0, 1 - Math.abs(ph - 7) / 3.5)) / 3;
}

const RANGE_DAYS: Record<AnalyticsRange, number> = { '7D': 7, '30D': 30, '90D': 90 };

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
    private readonly telemetryService: TelemetryService,
  ) {}

  getAssignedDevices(adminId: Types.ObjectId): Promise<DeviceDocument[]> {
    return this.deviceModel
      .find({ assignedAdminIds: adminId })
      .select('+secretKey')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDeviceTelemetry(adminId: Types.ObjectId, deviceId: string, limit: number): Promise<TelemetryDocument[]> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    const isAssigned = device.assignedAdminIds?.some((id) => id.equals(adminId));
    if (!isAssigned) throw new ForbiddenException('Not assigned to this device');

    return this.telemetryModel
      .find({ deviceId: device.deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getDeviceAnalytics(adminId: Types.ObjectId, deviceId: string, range: string) {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    const isAssigned = device.assignedAdminIds?.some((id) => id.equals(adminId));
    if (!isAssigned) throw new ForbiddenException('Not assigned to this device');

    const analyticsRange: AnalyticsRange = ANALYTICS_RANGES.includes(range as AnalyticsRange)
      ? (range as AnalyticsRange)
      : '7D';
    const days = RANGE_DAYS[analyticsRange];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const series = await this.telemetryModel
      .aggregate<{
        _id: string;
        waterLevel: number;
        dissolvedOxygen: number;
        ph: number;
        turbidity: number;
        temperature: number;
        battery: number;
        signal: number;
      }>([
        { $match: { deviceId: device.deviceId, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            waterLevel: { $avg: '$waterLevel' },
            dissolvedOxygen: { $avg: '$dissolvedOxygen' },
            ph: { $avg: '$ph' },
            turbidity: { $avg: '$turbidity' },
            temperature: { $avg: '$temperature' },
            battery: { $avg: '$battery' },
            signal: { $avg: '$signal' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    const [summaryAgg] = await this.telemetryModel
      .aggregate<{
        avgWaterLevel: number;
        avgDissolvedOxygen: number;
        avgPh: number;
        avgTurbidity: number;
        avgTemperature: number;
        count: number;
      }>([
        { $match: { deviceId: device.deviceId, timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            avgWaterLevel: { $avg: '$waterLevel' },
            avgDissolvedOxygen: { $avg: '$dissolvedOxygen' },
            avgPh: { $avg: '$ph' },
            avgTurbidity: { $avg: '$turbidity' },
            avgTemperature: { $avg: '$temperature' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    return {
      range: analyticsRange,
      device: { deviceId: device.deviceId, deviceName: device.deviceName, status: device.status },
      series: series.map((s) => ({
        date: s._id,
        waterLevel: s.waterLevel,
        dissolvedOxygen: s.dissolvedOxygen,
        ph: s.ph,
        turbidity: s.turbidity,
        temperature: s.temperature,
        battery: s.battery,
        signal: s.signal,
        quality: qualityScore(s.dissolvedOxygen, s.turbidity, s.ph),
      })),
      summary: {
        avgWaterLevel: summaryAgg?.avgWaterLevel ?? null,
        avgQuality: summaryAgg
          ? qualityScore(summaryAgg.avgDissolvedOxygen, summaryAgg.avgTurbidity, summaryAgg.avgPh)
          : null,
        avgTemperature: summaryAgg?.avgTemperature ?? null,
        avgPh: summaryAgg?.avgPh ?? null,
        sampleCount: summaryAgg?.count ?? 0,
      },
    };
  }

  async pushTelemetry(
    adminId: Types.ObjectId,
    deviceId: string,
    dto: AdminPushTelemetryDto,
  ): Promise<{ success: true }> {
    const device = await this.deviceModel.findById(deviceId).select('+secretKey').exec();
    if (!device) throw new NotFoundException('Device not found');
    const isAssigned = device.assignedAdminIds?.some((id) => id.equals(adminId));
    if (!isAssigned) throw new ForbiddenException('Not assigned to this device');

    return this.telemetryService.ingest(
      device.deviceId,
      device.secretKey,
      {
        waterLevel: dto.waterLevel ?? 0.5,
        waterQuantity: 0,
        dissolvedOxygen: dto.dissolvedOxygen,
        ph: dto.ph,
        turbidity: dto.turbidity,
        tds: dto.tds,
        temperature: dto.temperature,
        battery: dto.battery,
        signal: dto.signal,
      },
      { source: 'manual', pushedBy: adminId, note: dto.note ?? null },
    );
  }

  async rotateSecretKey(adminId: Types.ObjectId, deviceId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    const isAssigned = device.assignedAdminIds?.some((id) => id.equals(adminId));
    if (!isAssigned) throw new ForbiddenException('Not assigned to this device');

    device.secretKey = generateSecretKey();
    await device.save();
    return device;
  }
}
