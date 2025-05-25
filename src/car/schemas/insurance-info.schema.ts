import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InsuranceInfoDocument = HydratedDocument<InsuranceInfo>;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class InsuranceInfo {
  @Prop({ type: Types.ObjectId, ref: 'Insurance', default: null })
  insuranceId?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  insuranceEnds?: Date | null;
}
