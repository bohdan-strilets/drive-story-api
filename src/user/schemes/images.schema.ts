import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImagesDocument = HydratedDocument<Images>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Images {
  @Prop({ required: true })
  default: string;

  @Prop({ type: [String], default: [] })
  resources: string[];

  @Prop({ required: true })
  selected: string;
}
