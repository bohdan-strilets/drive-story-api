import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImageDocument } from 'src/image/schemas/image.schema';
import { Address } from './address.schema';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ versionKey: false, timestamps: true })
export class Contact {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ default: null })
  email?: string | null;

  @Prop({ type: Address, default: [] })
  address: Address;

  @Prop({ default: null })
  mapLink?: string | null;

  @Prop({ default: null })
  website?: string | null;

  @Prop({ default: null })
  workingHours?: [string, string] | null;

  @Prop({ default: [] })
  specializations?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | ImageDocument | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
