import { Document, Model, Types } from 'mongoose';

export type SelectFileOptions<T extends Document> = {
  model: Model<T>;
  publicId: string;
  modelId: Types.ObjectId;
  fieldToUpdate: string;
  resourcesPath: string;
};
