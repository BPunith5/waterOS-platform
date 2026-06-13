import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AlertsService } from '../alerts/alerts.service';
import { calculateHealthScore, getHealthLevel } from '../devices/device.utils';
import { Device } from '../devices/schemas/device.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { Telemetry, TelemetryDocument } from './schemas/telemetry.schema';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    private readonly alertsService: AlertsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async ingest(deviceIdParam: string, key: string | undefined, dto: IngestTelemetryDto): Promise<{ success: true }> {
    const deviceId = deviceIdParam.toUpperCase();
    const device = await this.deviceModel.findOne({ deviceId }).select('+secretKey').exec();
    if (!device || !key || device.secretKey !== key) {
      throw new UnauthorizedException('Invalid device or key');
    }

    const previous = await this.telemetryModel.findOne({ deviceId }).sort({ timestamp: -1 }).exec();

    const timestamp = new Date();
    const telemetry = await this.telemetryModel.create({
      deviceId,
      deviceRef: device._id,
      tankId: device.tankId ?? undefined,
      waterLevel: dto.waterLevel,
      waterQuantity: dto.waterQuantity ?? 0,
      dissolvedOxygen: dto.dissolvedOxygen ?? 0.8,
      ph: dto.ph ?? 7,
      turbidity: dto.turbidity ?? 0,
      tds: dto.tds ?? 0,
      temperature: dto.temperature ?? 22,
      lat: dto.lat,
      lng: dto.lng,
      speed: dto.speed ?? 0,
      battery: dto.battery ?? device.battery,
      signal: dto.signal ?? device.signal,
      timestamp,
    });

    device.battery = telemetry.battery;
    device.signal = telemetry.signal;
    device.lastSeen = timestamp;
    device.healthScore = calculateHealthScore({ battery: device.battery, signal: device.signal, lastSeen: timestamp });
    device.healthLevel = getHealthLevel(device.healthScore);
    if (device.status === 'offline') device.status = 'active';
    await device.save();

    await this.alertsService.evaluateTelemetryAlerts(device, telemetry, previous);

    this.realtimeGateway.emitDeviceUpdate(device.deviceId, device.tankId, { device, telemetry });

    return { success: true };
  }

  async getLogs(userId: Types.ObjectId, deviceIdParam: string, limit: number): Promise<TelemetryDocument[]> {
    const device = await this.deviceModel.findOne({ deviceId: deviceIdParam.toUpperCase() }).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (!device.userId.equals(userId)) throw new ForbiddenException('Not your device');

    return this.telemetryModel.find({ deviceId: device.deviceId }).sort({ timestamp: -1 }).limit(limit).exec();
  }
}
