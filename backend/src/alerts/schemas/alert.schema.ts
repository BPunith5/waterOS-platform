import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ALERT_SEVERITIES, ALERT_TYPES } from '../alert-thresholds';
import type { AlertSeverity, AlertType } from '../alert-thresholds';

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tank', index: true })
  tankId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true, index: true })
  deviceId: Types.ObjectId;

  @Prop({ type: String, enum: ALERT_TYPES, required: true })
  type: AlertType;

  @Prop({ type: String, enum: ALERT_SEVERITIES, required: true })
  severity: AlertSeverity;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type AlertDocument = HydratedDocument<Alert>;

export const AlertSchema = SchemaFactory.createForClass(Alert);
