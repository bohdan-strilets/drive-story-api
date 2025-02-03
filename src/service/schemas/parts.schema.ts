import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PartsDocument = HydratedDocument<Parts>;

@Schema({ versionKey: false, timestamps: false })
export class Parts {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: [] })
  partNumbers: string[];

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: null })
  url?: string | null;
}
