import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Accessory, AccessoryDocument } from './schemas/accessory.schema';

export class AccessoryRepository {
  constructor(
    @InjectModel(Accessory.name)
    private accessoryModel: Model<AccessoryDocument>,
  ) {}

  async findAccessoryById(
    accessoryId: Types.ObjectId,
  ): Promise<AccessoryDocument> {
    return this.accessoryModel
      .findById(accessoryId)
      .populate('photos')
      .populate('contactId');
  }

  async findAllAccessoryByUser(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<AccessoryDocument[]> {
    return await this.accessoryModel
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async createAccessory(dto: any): Promise<AccessoryDocument> {
    return this.accessoryModel.create(dto);
  }

  async updateAccessory(
    accessoryId: Types.ObjectId,
    dto: any,
  ): Promise<AccessoryDocument> {
    return this.accessoryModel
      .findByIdAndUpdate(accessoryId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteAccessory(
    accessoryId: Types.ObjectId,
  ): Promise<AccessoryDocument> {
    return this.accessoryModel
      .findByIdAndDelete(accessoryId)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    accessoryId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<AccessoryDocument> {
    return this.updateAccessory(accessoryId, { photos: data });
  }
}
