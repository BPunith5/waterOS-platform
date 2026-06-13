import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Telemetry {
  @Prop({ required: true, uppercase: true, index: true })
  deviceId: string;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  deviceRef: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tank', index: true })
  tankId?: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 1 })
  waterLevel: number;

  @Prop({ default: 0 })
  waterQuantity: number;

  @Prop({ min: 0, max: 1, default: 0.8 })
  dissolvedOxygen: number;

  @Prop({ default: 7 })
  ph: number;

  @Prop({ default: 0 })
  turbidity: number;

  @Prop({ default: 0 })
  tds: number;

  @Prop({ default: 22 })
  temperature: number;

  @Prop()
  lat?: number;

  @Prop()
  lng?: number;

  @Prop({ default: 0 })
  speed: number;

  @Prop({ default: 100 })
  battery: number;

  @Prop({ default: 100 })
  signal: number;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export type TelemetryDocument = HydratedDocument<Telemetry>;

export const TelemetrySchema = SchemaFactory.createForClass(Telemetry);
TelemetrySchema.index({ deviceId: 1, timestamp: -1 });
