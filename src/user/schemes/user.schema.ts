import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender } from '../enums/gender.enum';
import { Location, LocationDocument } from './location.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  activationToken: string;

  @Prop({ default: null })
  resetToken?: string | null;

  @Prop({ default: false })
  isActivated: boolean;

  @Prop({ default: null })
  nickname?: string | null;

  @Prop({ default: null })
  birthDate?: Date | null;

  @Prop({ default: null })
  phoneNumber?: string | null;

  @Prop({ default: Gender.NOT_SELECTED, enum: Gender })
  gender?: Gender;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  avatars: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  posters: Types.ObjectId | null;

  @Prop({ type: Location, default: null })
  location: LocationDocument | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
