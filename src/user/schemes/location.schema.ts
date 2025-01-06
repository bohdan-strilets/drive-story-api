import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Location {
  @Prop({ default: null })
  country: string | null;

  @Prop({ default: null })
  city: string | null;

  @Prop({ default: null })
  postalCode: string | null;
}
