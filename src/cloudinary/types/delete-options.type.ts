import { Document, Model } from 'mongoose';

export type DeleteOptions<T extends Document> = {
  model: Model<T>;
  publicId: string;
  userId: string;
  fieldToUpdate: string;
};
