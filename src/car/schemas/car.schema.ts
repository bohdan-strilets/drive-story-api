import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BasicInfo } from './basic-info.schema';
import { Ownership } from './ownership.schema';
import { Registration } from './registration.schema';
import { Specifications } from './specifications.schema';

export type CarDocument = HydratedDocument<Car>;

@Schema({ versionKey: false, timestamps: true })
export class Car {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: BasicInfo, default: {} })
  basicInfo: BasicInfo;

  @Prop({ type: Specifications, default: {} })
  specifications: Specifications;

  @Prop({ type: Registration, default: {} })
  registration: Registration;

  @Prop({ type: Ownership, default: {} })
  ownership: Ownership;

  @Prop({ default: null })
  description?: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Insurance', default: null })
  insuranceId?: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CarSchema = SchemaFactory.createForClass(Car);
