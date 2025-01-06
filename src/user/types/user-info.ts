import { Types } from 'mongoose';
import { Gender } from '../enums/gender.enum';
import { LocationDocument } from '../schemes/location.schema';

export type UserInfo = {
  _id: Types.ObjectId;
  email: string;
  gender: Gender;
  avatars: string[];
  posters: string[];
  createdAt: Date;
  updatedAt: Date;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  birthDate?: Date | null;
  phoneNumber?: string | null;
  isActivated?: boolean;
  location?: LocationDocument | null;
};
