import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const DEVICE_STATUSES = ['pending', 'active', 'offline'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const HEALTH_LEVELS = ['healthy', 'good', 'warning', 'critical'] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number];

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  deviceId: string;

  @Prop({ required: true, trim: true })
  deviceName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tank', default: null, index: true })
  tankId: Types.ObjectId | null;

  @Prop({ enum: DEVICE_STATUSES, default: 'pending' })
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

  @Prop({ enum: HEALTH_LEVELS, default: 'healthy' })
  healthLevel: HealthLevel;
}

export type DeviceDocument = HydratedDocument<Device>;

export const DeviceSchema = SchemaFactory.createForClass(Device);
