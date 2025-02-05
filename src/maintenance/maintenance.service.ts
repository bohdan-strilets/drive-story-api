import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { MaintenanceDto } from './dto/maintenance.dto';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const car = await this.carRepository.findCar(carId);
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = {
      carId,
      owner: userId,
      photos: {
        default: defaultImages.NOT_IMAGE,
        selected: defaultImages.NOT_IMAGE,
      },
      ...dto,
    };

    const newMaintenance = await this.maintenanceModel.create(data);
    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      newMaintenance,
    );
  }

  private async findMaintenance(
    maintenanceId: Types.ObjectId,
  ): Promise<MaintenanceDocument> {
    const maintenance = await this.maintenanceModel.findById(maintenanceId);

    if (!maintenance) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.MAINTENANCE_NOT_FOUND,
      );
    }

    return maintenance;
  }

  private async findMaintenanceAndCheckAccessRights(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const maintenance = await this.findMaintenance(maintenanceId);
    this.carRepository.checkAccessRights(maintenance.carId, carId);
    this.carRepository.checkAccessRights(maintenance.owner, userId);
  }

  private async updateMaintenance(
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

    const params = { new: true };
    return await this.maintenanceModel.findByIdAndUpdate(
      maintenanceId,
      dto,
      params,
    );
  }

  async update(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const updatedMaintenance = await this.updateMaintenance(
      maintenanceId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedMaintenance,
    );
  }

  async delete(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    await this.findMaintenanceAndCheckAccessRights(
      maintenanceId,
      carId,
      userId,
    );

    const deletedMaintenance =
      await this.maintenanceModel.findByIdAndDelete(maintenanceId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedMaintenance,
    );
  }

  async byId(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const maintenance = await this.findMaintenance(maintenanceId);
    this.carRepository.checkAccessRights(maintenance.carId, carId);
    this.carRepository.checkAccessRights(maintenance.owner, userId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      maintenance,
    );
  }
}
