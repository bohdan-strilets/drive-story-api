import { Types } from 'mongoose';

export type Payload<D> = {
  carId: Types.ObjectId;
  owner: Types.ObjectId;
} & D;
