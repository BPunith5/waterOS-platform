import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemConfigDocument = HydratedDocument<SystemConfig>;

@Schema({ timestamps: true })
export class SystemConfig {
  @Prop({ enum: ['mqtt', 'http'], default: 'mqtt' })
  telemetryProtocol: 'mqtt' | 'http';
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);
