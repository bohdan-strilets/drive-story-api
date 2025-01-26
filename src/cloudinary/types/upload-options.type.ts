import { Document, Model } from 'mongoose';

export type UploadOptions<T extends Document> = {
  model: Model<T>;
  modelId: string;
  folderPath: string;
  fieldToUpdate: string;
};
