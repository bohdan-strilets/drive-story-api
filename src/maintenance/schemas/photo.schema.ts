import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PhotosDocument = HydratedDocument<Photos>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Photos {
  @Prop({ required: true })
  default: string;

  @Prop({ type: [String], default: [] })
  resources: string[];

  @Prop({ required: true })
  selected: string;
}
