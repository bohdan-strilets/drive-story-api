import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FuelType } from '../enums/fuel-type.enum';

export type FuelingDocument = HydratedDocument<Fueling>;

@Schema({ versionKey: false, timestamps: true })
export class Fueling {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  contactId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ required: true, enum: FuelType })
  fuelType: FuelType;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  pricePerUnit: number;

  @Prop({ required: true, default: 0 })
  totalCost: number;

  @Prop({ default: new Date() })
  fuelingDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const FuelingSchema = SchemaFactory.createForClass(Fueling);
