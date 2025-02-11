import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InsuranceType } from '../enums/insurance-type.enum';
import { PaymentStatus } from './payment-status.schema';

export type InsuranceDocument = HydratedDocument<Insurance>;

@Schema({ versionKey: false, timestamps: true })
export class Insurance {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  contactId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ required: true })
  insurerName: string;

  @Prop({ required: true })
  policyNumber: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: InsuranceType.OC, enum: InsuranceType })
  insuranceType?: InsuranceType;

  @Prop({ required: true })
  coverageAmount: number;

  @Prop({ type: PaymentStatus, default: {} })
  paymentStatus?: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);
