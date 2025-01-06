import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums/gender.enum';
import { Location, LocationDocument } from './location.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  activationToken: string;

  @Prop({ default: false })
  isActivated: boolean;

  @Prop({ default: null })
  firstName?: string | null;

  @Prop({ default: null })
  lastName?: string | null;

  @Prop({ default: null })
  nickname?: string | null;

  @Prop({ default: null })
  birthDate?: Date | null;

  @Prop({ default: null })
  phoneNumber?: string | null;

  @Prop({ default: Gender.NOT_SELECTED, enum: Gender })
  gender?: Gender;

  @Prop({ default: [], type: [String] })
  avatars?: string[];

  @Prop({ default: [], type: [String] })
  posters?: string[];

  @Prop({ type: Location, default: null })
  location?: LocationDocument | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
