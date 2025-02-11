import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReminderDocument = HydratedDocument<Reminder>;

@Schema({ versionKey: false, timestamps: true })
export class Reminder {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  reminderDate: Date;

  @Prop({ default: false })
  isSent: boolean;

  @Prop({ default: null })
  message?: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
