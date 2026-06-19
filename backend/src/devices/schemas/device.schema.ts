import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const DEVICE_STATUSES = ['pending', 'active', 'offline', 'unclaimed', 'decommissioned'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const HEALTH_LEVELS = ['healthy', 'good', 'warning', 'critical'] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number];

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  deviceId: string;

  @Prop({ required: true, trim: true })
  deviceName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Tank', default: null, index: true })
  tankId: Types.ObjectId | null;

  @Prop({ type: String, enum: DEVICE_STATUSES, default: 'pending' })
  status: DeviceStatus;

  @Prop({ default: 100 })
  battery: number;

  @Prop({ default: 100 })
  signal: number;

  @Prop({ type: Date, default: null })
  lastSeen: Date | null;

  @Prop({ required: true })
  activationPin: string;

  @Prop({ required: true, select: false })
  secretKey: string;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ default: 100 })
  healthScore: number;

  @Prop({ type: String, enum: HEALTH_LEVELS, default: 'healthy' })
  healthLevel: HealthLevel;

  @Prop({ type: String, default: null })
  registrationCode: string | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignedAdminIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  claimedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  claimedAt: Date | null;

  @Prop({ type: String, enum: ['user_created', 'provisioned'], default: 'user_created' })
  provisionSource: string;

  @Prop({ type: Object, default: null })
  alertThresholds: Record<string, number> | null;
}

export type DeviceDocument = HydratedDocument<Device>;

export const DeviceSchema = SchemaFactory.createForClass(Device);
