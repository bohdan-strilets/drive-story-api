import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InstallmentsCount } from '../enums/installments-count.enum';

export type PaymentStatusDocument = HydratedDocument<PaymentStatus>;

@Schema({ versionKey: false })
export class PaymentStatus {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: InstallmentsCount.ONE_TIME, enum: InstallmentsCount })
  installmentsCount?: InstallmentsCount;

  @Prop({ default: 0 })
  installmentCost?: number;

  @Prop({ default: 0 })
  totalInstallmentsSum?: number;

  @Prop({ default: [] })
  paymentDates?: Date[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
