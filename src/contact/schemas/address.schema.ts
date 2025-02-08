import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  houseNumber: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: null })
  postalCode?: string | null;
}
