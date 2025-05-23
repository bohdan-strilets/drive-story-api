import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NumberRates } from '../enums/number-rates.enum';

export type PaymentStatusDocument = HydratedDocument<PaymentStatus>;

@Schema({ versionKey: false })
export class PaymentStatus {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: NumberRates.one, enum: NumberRates })
  installmentsCount?: NumberRates;

  @Prop({ default: 0 })
  totalInstallmentsSum?: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
