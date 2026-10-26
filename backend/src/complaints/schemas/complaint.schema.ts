import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const COMPLAINT_STATUSES = ['open', 'resolved'] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

@Schema({ timestamps: true })
export class Complaint {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tank', default: null })
  tankId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Device', default: null })
  deviceMongoId: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: String, enum: COMPLAINT_STATUSES, default: 'open' })
  status: ComplaintStatus;
}

export type ComplaintDocument = HydratedDocument<Complaint>;
export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
