import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EntityType } from './enums/entity-type.enum';
import { Image, ImageDocument } from './schemas/image.schema';
import { Payload } from './types/payload.type';

export class ImageRepository {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async findImage(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
  ): Promise<ImageDocument> {
    return this.imageModel.findOne({
      owner: userId,
      entityId,
      entityType,
    });
  }

  async findImageById(imageId: Types.ObjectId): Promise<ImageDocument> {
    return this.imageModel.findById(imageId);
  }

  async createImage(payload: Payload): Promise<ImageDocument> {
    return this.imageModel.create(payload);
  }

  async updateImage(imageId: Types.ObjectId, dto: any): Promise<ImageDocument> {
    return this.imageModel.findByIdAndUpdate(imageId, dto, {
      new: true,
    });
  }

  async deleteImage(imageId: Types.ObjectId): Promise<ImageDocument> {
    return this.imageModel.findByIdAndDelete(imageId);
  }
}
