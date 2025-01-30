import { Document, Model, Types } from 'mongoose';

export type UploadOptions<T extends Document> = {
  model: Model<T>;
  modelId: Types.ObjectId;
  folderPath: string;
  fieldToUpdate: string;
};
