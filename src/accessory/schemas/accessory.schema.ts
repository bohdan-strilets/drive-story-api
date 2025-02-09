import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccessoryType } from '../enums/accessory.type';
import { Items } from './items.schema';
import { ServiceDetails } from './service-details.schema';

export type AccessoryDocument = HydratedDocument<Accessory>;

@Schema({ versionKey: false, timestamps: true })
export class Accessory {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  contactId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: AccessoryType })
  type: AccessoryType;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  description?: string | null;

  @Prop({ default: 0 })
  quantity?: number;

  @Prop({ type: [ServiceDetails], default: [] })
  serviceDetails: ServiceDetails[];

  @Prop({ type: [Items], default: [] })
  itemsUsed: Items[];

  @Prop({ default: 0 })
  totalCost?: number;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AccessorySchema = SchemaFactory.createForClass(Accessory);
