import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BasicInfoDocument = HydratedDocument<BasicInfo>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class BasicInfo {
  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true, length: 4 })
  year: string;

  @Prop({ default: null })
  shortName?: string | null;

  @Prop({ default: null })
  generation?: string | null;

  @Prop({ default: null })
  trimsId?: string | null;
}
