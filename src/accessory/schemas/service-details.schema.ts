import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceDetailsDocument = HydratedDocument<ServiceDetails>;

@Schema({ versionKey: false })
export class ServiceDetails {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: 0 })
  duration?: number;

  @Prop({ default: [] })
  servicesList?: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
