import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceRepository {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    private readonly carRepository: CarRepository,
  ) {}

  async findMaintenance(
    maintenanceId: Types.ObjectId,
  ): Promise<MaintenanceDocument> {
    const maintenance = await this.maintenanceModel
      .findById(maintenanceId)
      .populate('photos')
      .populate('contactId');

    if (!maintenance) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.MAINTENANCE_NOT_FOUND,
      );
    }

    return maintenance;
  }

  async findMaintenanceAndCheckAccessRights(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<MaintenanceDocument> {
    const maintenance = await this.findMaintenance(maintenanceId);
    this.carRepository.checkAccessRights(maintenance.carId, carId);
    this.carRepository.checkAccessRights(maintenance.owner, userId);
    return maintenance;
  }

  async updateMaintenance(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<MaintenanceDocument> {
    await this.findMaintenanceAndCheckAccessRights(
      maintenanceId,
      carId,
      userId,
    );

    return await this.maintenanceModel
      .findByIdAndUpdate(maintenanceId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async bindImage(
    maintenanceId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<MaintenanceDocument> {
    await this.findMaintenance(maintenanceId);
    return await this.maintenanceModel.findByIdAndUpdate(
      maintenanceId,
      { photos: data },
      { new: true },
    );
  }
}
