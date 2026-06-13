import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { calculateHealthScore, getHealthLevel } from '../devices/device.utils';
import { Device } from '../devices/schemas/device.schema';
import { Telemetry } from '../telemetry/schemas/telemetry.schema';
import { Tank, TankType } from '../tanks/schemas/tank.schema';
import { AlertsService } from '../alerts/alerts.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const SIM_INTERVAL_MS = 5000;
const BASE_LAT = 12.9716;
const BASE_LNG = 77.5946;

const TANK_TEMPERATURE_BASE: Record<TankType, number> = {
  drinking: 22,
  aquaculture: 26,
  industrial: 28,
  irrigation: 24,
};

const randomAround = (base: number, spread: number) => base + (Math.random() - 0.5) * spread;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

@Injectable()
export class SimulationService implements OnModuleInit {
  private readonly intervals = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
    @InjectModel(Tank.name) private readonly tankModel: Model<Tank>,
    private readonly alertsService: AlertsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const activeDevices = await this.deviceModel.find({ status: 'active' }).select('deviceId').exec();
    for (const device of activeDevices) {
      this.start(device.deviceId);
    }
  }

  start(deviceId: string): void {
    const id = deviceId.toUpperCase();
    if (this.intervals.has(id)) return;

    void this.tick(id);
    const interval = setInterval(() => void this.tick(id), SIM_INTERVAL_MS);
    this.intervals.set(id, interval);
  }

  stop(deviceId: string): void {
    const id = deviceId.toUpperCase();
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
  }

  private async tick(deviceId: string): Promise<void> {
    try {
      const device = await this.deviceModel.findOne({ deviceId }).exec();
      if (!device || device.status !== 'active') {
        this.stop(deviceId);
        return;
      }

      const tank = device.tankId ? await this.tankModel.findById(device.tankId).exec() : null;
      const previous = await this.telemetryModel.findOne({ deviceId }).sort({ timestamp: -1 }).exec();

      const prevLevel = previous?.waterLevel ?? 0.7;
      let waterLevel = prevLevel - Math.random() * 0.01;
      if (waterLevel < 0.15 && Math.random() < 0.3) {
        waterLevel = prevLevel + Math.random() * 0.25;
      }
      waterLevel = clamp(waterLevel, 0, 1);

      const capacity = tank?.capacity ?? 1000;
      const waterQuantity = Math.round(waterLevel * capacity);

      const dissolvedOxygen = clamp(randomAround(previous?.dissolvedOxygen ?? 0.85, 0.04), 0.3, 1);
      const ph = clamp(randomAround(previous?.ph ?? 7, 0.1), 5, 9);
      const turbidity = clamp(randomAround(previous?.turbidity ?? 1.5, 0.6), 0, 10);
      const tds = clamp(randomAround(previous?.tds ?? 200, 15), 0, 1000);

      const tempBase = TANK_TEMPERATURE_BASE[tank?.tankType ?? 'drinking'];
      const temperature = clamp(randomAround(previous?.temperature ?? tempBase, 0.6), tempBase - 6, tempBase + 8);

      const battery = clamp((previous?.battery ?? device.battery) - Math.random() * 0.05, 0, 100);
      const signal = clamp(randomAround(previous?.signal ?? device.signal, 4), 0, 100);

      const lat = clamp(randomAround(previous?.lat ?? BASE_LAT, 0.0006), -90, 90);
      const lng = clamp(randomAround(previous?.lng ?? BASE_LNG, 0.0006), -180, 180);

      const timestamp = new Date();
      const telemetry = await this.telemetryModel.create({
        deviceId,
        deviceRef: device._id,
        tankId: device.tankId ?? undefined,
        waterLevel,
        waterQuantity,
        dissolvedOxygen,
        ph,
        turbidity,
        tds,
        temperature,
        lat,
        lng,
        speed: 0,
        battery,
        signal,
        timestamp,
      });

      device.battery = battery;
      device.signal = signal;
      device.lastSeen = timestamp;
      device.healthScore = calculateHealthScore({ battery, signal, lastSeen: timestamp });
      device.healthLevel = getHealthLevel(device.healthScore);
      await device.save();

      await this.alertsService.evaluateTelemetryAlerts(device, telemetry, previous);

      this.realtimeGateway.emitDeviceUpdate(device.deviceId, device.tankId, { device, telemetry });
    } catch (err) {
      console.error(`[Simulation] tick failed for ${deviceId}:`, err);
    }
  }
}
