import { Types } from 'mongoose';

export type Payload = {
  _id: Types.ObjectId;
  email: string;
  isActivated: boolean;
};
