import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { MaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceRepository } from './maintenance.repository';
import { MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceService {
  constructor(
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
    checkAccessRights(car.owner, userId);

    const payload = this.maintenanceRepository.buildPayload<MaintenanceDto>(
      carId,
      userId,
      dto,
    );

    const maintenance =
      await this.maintenanceRepository.create<MaintenanceDto>(payload);

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
    const maintenance =
      await this.maintenanceRepository.findById(maintenanceId);
    checkAccessRights(maintenance.owner, userId);
    checkAccessRights(maintenance.carId, carId);

    const updatedMaintenance =
      await this.maintenanceRepository.updateById<MaintenanceDto>(
        maintenanceId,
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
      await this.maintenanceRepository.findById(maintenanceId);
    checkAccessRights(maintenance.owner, userId);
    checkAccessRights(maintenance.carId, carId);

    await this.maintenanceRepository.deleteImages(
      maintenance,
      EntityType.MAINTENANCE,
      maintenance._id,
    );

    const deletedMaintenance =
      await this.maintenanceRepository.deleteById(maintenanceId);

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
      await this.maintenanceRepository.findById(maintenanceId);
    checkAccessRights(maintenance.owner, userId);
    checkAccessRights(maintenance.carId, carId);

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
    const maintenances = await this.maintenanceRepository.getAll(
      carId,
      userId,
      page,
      limit,
    );

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
    const maintenance =
      await this.maintenanceRepository.findById(maintenanceId);
    checkAccessRights(maintenance.owner, userId);
    checkAccessRights(maintenance.carId, carId);

    const updatedMaintenance = await this.maintenanceRepository.updateById(
      maintenanceId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedMaintenance,
    );
  }
}
