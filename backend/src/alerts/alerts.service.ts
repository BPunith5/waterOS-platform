import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DeviceDocument } from '../devices/schemas/device.schema';
import { TelemetryDocument } from '../telemetry/schemas/telemetry.schema';
import { Alert, AlertDocument } from './schemas/alert.schema';
import { ALERT_DEDUP_WINDOW_MS, AlertSeverity, AlertType } from './alert-thresholds';

type CreateAlertInput = {
  userId: Types.ObjectId;
  tankId?: Types.ObjectId | null;
  deviceRef: Types.ObjectId;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private readonly alertModel: Model<Alert>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createAlert(input: CreateAlertInput): Promise<AlertDocument | null> {
    const recent = await this.alertModel
      .findOne({
        deviceId: input.deviceRef,
        type: input.type,
        createdAt: { $gte: new Date(Date.now() - ALERT_DEDUP_WINDOW_MS) },
      })
      .exec();

    if (recent && input.type !== 'device_offline') return null;

    const alert = await this.alertModel.create({
      userId: input.userId,
      tankId: input.tankId ?? undefined,
      deviceId: input.deviceRef,
      type: input.type,
      severity: input.severity,
      title: input.title,
      description: input.description,
      metadata: input.metadata,
    });

    this.realtimeGateway.emitAlert(input.deviceId, input.tankId ?? null, alert);
    return alert;
  }

  async evaluateTelemetryAlerts(
    device: DeviceDocument,
    telemetry: TelemetryDocument,
    previous: TelemetryDocument | null,
  ): Promise<void> {
    const base = {
      userId: device.userId,
      tankId: device.tankId,
      deviceRef: device._id,
      deviceId: device.deviceId,
    };

    if (telemetry.waterLevel < 0.05) {
      await this.createAlert({
        ...base,
        type: 'tank_empty',
        severity: 'critical',
        title: 'Tank empty',
        description: `${device.deviceName} reports the tank is nearly empty (${Math.round(telemetry.waterLevel * 100)}%).`,
        metadata: { waterLevel: telemetry.waterLevel },
      });
    } else if (telemetry.waterLevel < 0.2) {
      await this.createAlert({
        ...base,
        type: 'low_water_level',
        severity: 'warning',
        title: 'Low water level',
        description: `${device.deviceName} reports a low water level (${Math.round(telemetry.waterLevel * 100)}%).`,
        metadata: { waterLevel: telemetry.waterLevel },
      });
    }

    if (telemetry.dissolvedOxygen < 0.4) {
      await this.createAlert({
        ...base,
        type: 'low_oxygen',
        severity: 'warning',
        title: 'Low dissolved oxygen',
        description: `${device.deviceName} reports dissolved oxygen at ${Math.round(telemetry.dissolvedOxygen * 100)}%.`,
        metadata: { dissolvedOxygen: telemetry.dissolvedOxygen },
      });
    }

    if (telemetry.turbidity > 5) {
      await this.createAlert({
        ...base,
        type: 'high_turbidity',
        severity: 'warning',
        title: 'High turbidity',
        description: `${device.deviceName} reports turbidity of ${telemetry.turbidity.toFixed(1)} NTU.`,
        metadata: { turbidity: telemetry.turbidity },
      });
    }

    const qualityScore =
      (telemetry.dissolvedOxygen +
        Math.max(0, 1 - telemetry.turbidity / 10) +
        Math.max(0, 1 - Math.abs(telemetry.ph - 7) / 3.5)) /
      3;
    if (qualityScore < 0.5) {
      await this.createAlert({
        ...base,
        type: 'poor_water_quality',
        severity: 'warning',
        title: 'Poor water quality',
        description: `${device.deviceName} reports a degraded water quality score of ${Math.round(qualityScore * 100)}%.`,
        metadata: { qualityScore },
      });
    }

    if (telemetry.ph < 5.5 || telemetry.ph > 9.5) {
      await this.createAlert({
        ...base,
        type: 'abnormal_ph',
        severity: 'critical',
        title: 'Abnormal pH',
        description: `${device.deviceName} reports a critically abnormal pH of ${telemetry.ph.toFixed(2)}.`,
        metadata: { ph: telemetry.ph },
      });
    } else if (telemetry.ph < 6.5 || telemetry.ph > 8.5) {
      await this.createAlert({
        ...base,
        type: 'abnormal_ph',
        severity: 'warning',
        title: 'Abnormal pH',
        description: `${device.deviceName} reports a pH of ${telemetry.ph.toFixed(2)}, outside the optimal range.`,
        metadata: { ph: telemetry.ph },
      });
    }

    if (telemetry.battery < 10) {
      await this.createAlert({
        ...base,
        type: 'low_battery',
        severity: 'critical',
        title: 'Critical battery',
        description: `${device.deviceName} battery is critically low (${Math.round(telemetry.battery)}%).`,
        metadata: { battery: telemetry.battery },
      });
    } else if (telemetry.battery < 20) {
      await this.createAlert({
        ...base,
        type: 'low_battery',
        severity: 'warning',
        title: 'Low battery',
        description: `${device.deviceName} battery is low (${Math.round(telemetry.battery)}%).`,
        metadata: { battery: telemetry.battery },
      });
    }

    if (telemetry.signal < 30) {
      await this.createAlert({
        ...base,
        type: 'weak_signal',
        severity: 'warning',
        title: 'Weak signal',
        description: `${device.deviceName} has a weak signal (${Math.round(telemetry.signal)}%).`,
        metadata: { signal: telemetry.signal },
      });
    }

    if (telemetry.lat == null || telemetry.lng == null || (telemetry.lat === 0 && telemetry.lng === 0)) {
      await this.createAlert({
        ...base,
        type: 'gps_lost',
        severity: 'info',
        title: 'GPS signal lost',
        description: `${device.deviceName} is not reporting a GPS location.`,
      });
    }

    if (telemetry.temperature > 40) {
      await this.createAlert({
        ...base,
        type: 'high_temperature',
        severity: 'critical',
        title: 'Critical temperature',
        description: `${device.deviceName} reports a critical water temperature of ${telemetry.temperature.toFixed(1)}°C.`,
        metadata: { temperature: telemetry.temperature },
      });
    } else if (telemetry.temperature > 35) {
      await this.createAlert({
        ...base,
        type: 'high_temperature',
        severity: 'warning',
        title: 'High temperature',
        description: `${device.deviceName} reports a high water temperature of ${telemetry.temperature.toFixed(1)}°C.`,
        metadata: { temperature: telemetry.temperature },
      });
    }

    if (previous && Math.abs(telemetry.waterLevel - previous.waterLevel) > 0.15) {
      await this.createAlert({
        ...base,
        type: 'rapid_sensor_change',
        severity: 'info',
        title: 'Rapid water level change',
        description: `${device.deviceName} water level changed rapidly from ${Math.round(previous.waterLevel * 100)}% to ${Math.round(telemetry.waterLevel * 100)}%.`,
        metadata: { previous: previous.waterLevel, current: telemetry.waterLevel },
      });
    }
  }
}
