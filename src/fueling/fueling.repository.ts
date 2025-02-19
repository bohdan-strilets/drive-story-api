import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fueling, FuelingDocument } from './schemas/fueling.schema';

export class FuelingRepository {
  constructor(
    @InjectModel(Fueling.name)
    private fuelingModel: Model<FuelingDocument>,
  ) {}

  async findFuelingById(fuelingId: Types.ObjectId): Promise<FuelingDocument> {
    return this.fuelingModel
      .findById(fuelingId)
      .populate('photos')
      .populate('contactId');
  }

  async findAllFuelingByUser(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<FuelingDocument[]> {
    return await this.fuelingModel
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async createFueling(dto: any): Promise<FuelingDocument> {
    return this.fuelingModel.create(dto);
  }

  async updateFueling(
    fuelingId: Types.ObjectId,
    dto: any,
  ): Promise<FuelingDocument> {
    return this.fuelingModel
      .findByIdAndUpdate(fuelingId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteFueling(fuelingId: Types.ObjectId): Promise<FuelingDocument> {
    return this.fuelingModel
      .findByIdAndDelete(fuelingId)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    fuelingId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<FuelingDocument> {
    return this.updateFueling(fuelingId, { photos: data });
  }
}
