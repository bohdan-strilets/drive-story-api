import { Document, Model, Types } from 'mongoose';

export type DeleteOptions<T extends Document> = {
  model: Model<T>;
  publicId: string;
  modelId: Types.ObjectId;
  fieldToUpdate: string;
};
