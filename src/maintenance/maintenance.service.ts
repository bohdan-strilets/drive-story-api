import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { MaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceRepository } from './maintenance.repository';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly maintenanceRepository: MaintenanceRepository,
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
      ...dto,
    };

    const maintenance = await this.maintenanceModel.create(data);
    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      maintenance,
    );
  }

  async update(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const updatedMaintenance =
      await this.maintenanceRepository.updateMaintenance(
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
    const maintenance =
      await this.maintenanceRepository.findMaintenanceAndCheckAccessRights(
        maintenanceId,
        carId,
        userId,
      );

    await this.maintenanceRepository.deleteImages(maintenance);

    const deletedMaintenance = await this.maintenanceModel
      .findByIdAndDelete(maintenanceId)
      .populate('photos')
      .populate('contactId');

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
    const maintenance =
      await this.maintenanceRepository.findMaintenanceAndCheckAccessRights(
        maintenanceId,
        carId,
        userId,
      );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      maintenance,
    );
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<MaintenanceDocument[]>> {
    const skip = (page - 1) * limit;

    const maintenances = await this.maintenanceModel
      .find({
        carId,
        owner: userId,
      })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      maintenances,
    );
  }

  async bindContact(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const updatedAccessory = await this.maintenanceRepository.updateMaintenance(
      maintenanceId,
      carId,
      userId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedAccessory,
    );
  }
}
