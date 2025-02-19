import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Insurance, InsuranceDocument } from './schemas/insurance.schema';

export class InsuranceRepository {
  constructor(
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
  ) {}

  async findInsuranceById(
    insuranceId: Types.ObjectId,
  ): Promise<InsuranceDocument> {
    return this.insuranceModel
      .findById(insuranceId)
      .populate('photos')
      .populate('contactId');
  }

  async findAllInsuranceByUser(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<InsuranceDocument[]> {
    return await this.insuranceModel
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async createInsurance(dto: any): Promise<InsuranceDocument> {
    return this.insuranceModel.create(dto);
  }

  async updateInsurance(
    insuranceId: Types.ObjectId,
    dto: any,
  ): Promise<InsuranceDocument> {
    return this.insuranceModel
      .findByIdAndUpdate(insuranceId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteInsurance(
    insuranceId: Types.ObjectId,
  ): Promise<InsuranceDocument> {
    return this.insuranceModel
      .findByIdAndDelete(insuranceId)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    insuranceId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<InsuranceDocument> {
    return this.updateInsurance(insuranceId, { photos: data });
  }
}
