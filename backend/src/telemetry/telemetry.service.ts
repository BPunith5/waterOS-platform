import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AlertsService } from '../alerts/alerts.service';
import { calculateHealthScore, getHealthLevel } from '../devices/device.utils';
import { Device } from '../devices/schemas/device.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { Telemetry, TelemetryDocument } from './schemas/telemetry.schema';

type IngestOptions = {
  source?: 'hardware' | 'manual';
  pushedBy?: Types.ObjectId | null;
  note?: string | null;
};

@Injectable()
export class TelemetryService {
  constructor(
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    private readonly alertsService: AlertsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private validateTelemetryValues(dto: Partial<IngestTelemetryDto>): void {
    const errors: string[] = [];
    if (dto.ph !== undefined && (dto.ph < 0 || dto.ph > 14)) errors.push('ph must be between 0 and 14');
    if (dto.waterLevel !== undefined && (dto.waterLevel < 0 || dto.waterLevel > 1)) errors.push('waterLevel must be between 0 and 1');
    if (dto.temperature !== undefined && (dto.temperature < -10 || dto.temperature > 85)) errors.push('temperature must be between -10 and 85');
    if (dto.battery !== undefined && (dto.battery < 0 || dto.battery > 100)) errors.push('battery must be between 0 and 100');
    if (dto.signal !== undefined && (dto.signal < 0 || dto.signal > 100)) errors.push('signal must be between 0 and 100');
    if (errors.length > 0) throw new BadRequestException({ message: 'Invalid telemetry values', errors });
  }

  async ingest(
    deviceIdParam: string,
    key: string | undefined,
    dto: IngestTelemetryDto,
    options: IngestOptions = {},
  ): Promise<{ success: true }> {
    const deviceId = deviceIdParam.toUpperCase();
    const device = await this.deviceModel.findOne({ deviceId }).select('+secretKey').exec();
    if (!device || !key || device.secretKey !== key) {
      throw new UnauthorizedException('Invalid device or key');
    }

    this.validateTelemetryValues(dto);

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
      source: options.source ?? 'hardware',
      pushedBy: options.pushedBy ?? null,
      note: options.note ?? null,
    });

    device.battery = telemetry.battery;
    device.signal = telemetry.signal;
    device.lastSeen = timestamp;
    device.healthScore = calculateHealthScore({ battery: device.battery, signal: device.signal, lastSeen: timestamp });
    device.healthLevel = getHealthLevel(device.healthScore);
    if (device.status === 'offline' || device.status === 'pending') device.status = 'active';
    await device.save();

    await this.alertsService.evaluateTelemetryAlerts(device, telemetry, previous);

    this.realtimeGateway.emitDeviceUpdate(device.deviceId, device.tankId, { device, telemetry });

    return { success: true };
  }

  async getLogs(userId: Types.ObjectId, deviceIdParam: string, limit: number): Promise<TelemetryDocument[]> {
    const device = await this.deviceModel.findOne({ deviceId: deviceIdParam.toUpperCase() }).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (!device.userId || !device.userId.equals(userId)) throw new ForbiddenException('Not your device');

    return this.telemetryModel.find({ deviceId: device.deviceId }).sort({ timestamp: -1 }).limit(limit).exec();
  }

  async getAdminDeviceTelemetry(adminId: Types.ObjectId, deviceId: string, limit: number): Promise<TelemetryDocument[]> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    const isAssigned = device.assignedAdminIds?.some((id) => id.equals(adminId));
    if (!isAssigned) throw new ForbiddenException('Not assigned to this device');

    return this.telemetryModel.find({ deviceId: device.deviceId }).sort({ timestamp: -1 }).limit(limit).exec();
  }
}
