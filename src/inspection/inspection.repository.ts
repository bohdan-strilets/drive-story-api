import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inspection, InspectionDocument } from './schemas/inspection.schema';

export class InspectionRepository {
  constructor(
    @InjectModel(Inspection.name)
    private inspectionModel: Model<InspectionDocument>,
  ) {}

  async findInspectionById(
    inspectionId: Types.ObjectId,
  ): Promise<InspectionDocument> {
    return this.inspectionModel
      .findById(inspectionId)
      .populate('photos')
      .populate('contactId');
  }

  async findAllInspectionsByUser(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<InspectionDocument[]> {
    return await this.inspectionModel
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async createInspection(dto: any): Promise<InspectionDocument> {
    return this.inspectionModel.create(dto);
  }

  async updateInspection(
    inspectionId: Types.ObjectId,
    dto: any,
  ): Promise<InspectionDocument> {
    return this.inspectionModel
      .findByIdAndUpdate(inspectionId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteInspection(
    inspectionId: Types.ObjectId,
  ): Promise<InspectionDocument> {
    return this.inspectionModel
      .findByIdAndDelete(inspectionId)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    inspectionId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<InspectionDocument> {
    return this.updateInspection(inspectionId, { photos: data });
  }
}
