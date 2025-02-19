import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

export class MaintenanceRepository {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
  ) {}

  async findMaintenanceById(
    maintenanceId: Types.ObjectId,
  ): Promise<MaintenanceDocument> {
    return this.maintenanceModel
      .findById(maintenanceId)
      .populate('photos')
      .populate('contactId');
  }

  async findAllMaintenanceByUser(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<MaintenanceDocument[]> {
    return await this.maintenanceModel
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async createMaintenance(dto: any): Promise<MaintenanceDocument> {
    return this.maintenanceModel.create(dto);
  }

  async updateMaintenance(
    maintenanceId: Types.ObjectId,
    dto: any,
  ): Promise<MaintenanceDocument> {
    return this.maintenanceModel
      .findByIdAndUpdate(maintenanceId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteMaintenance(
    maintenanceId: Types.ObjectId,
  ): Promise<MaintenanceDocument> {
    return this.maintenanceModel
      .findByIdAndDelete(maintenanceId)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    maintenanceId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<MaintenanceDocument> {
    return this.updateMaintenance(maintenanceId, { photos: data });
  }
}
