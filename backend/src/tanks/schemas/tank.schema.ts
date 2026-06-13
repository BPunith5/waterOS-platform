import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const TANK_TYPES = ['drinking', 'aquaculture', 'industrial', 'irrigation'] as const;
export type TankType = (typeof TANK_TYPES)[number];

@Schema({ timestamps: true })
export class Tank {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  tankName: string;

  @Prop({ required: true, enum: TANK_TYPES })
  tankType: TankType;

  @Prop({ required: true, min: 0 })
  capacity: number;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  description?: string;
}

export type TankDocument = HydratedDocument<Tank>;

export const TankSchema = SchemaFactory.createForClass(Tank);
