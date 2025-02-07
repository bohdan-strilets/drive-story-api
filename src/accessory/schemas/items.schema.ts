import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ItemsDocument = HydratedDocument<Items>;

@Schema({ versionKey: false })
export class Items {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ default: 0 })
  name: string;

  @Prop({ default: 0 })
  price?: number;

  @Prop({ default: 0 })
  quantity?: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
