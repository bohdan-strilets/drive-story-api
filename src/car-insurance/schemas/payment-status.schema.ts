import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentStatusDocument = HydratedDocument<PaymentStatus>;

@Schema({ versionKey: false })
export class PaymentStatus {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: 0 })
  isPaid: boolean;

  @Prop({ default: 0 })
  installmentsCount?: number;

  @Prop({ default: 0 })
  installmentCost?: number;

  @Prop({ default: 0 })
  totalInstallmentsSum?: number;

  @Prop({ default: 0 })
  paymentDates?: Date[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
