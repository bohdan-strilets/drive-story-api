import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { CarDocument } from 'src/car/schemas/car.schema';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { MaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceRepository } from './maintenance.repository';
import { MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  private isValidCar(car: CarDocument) {
    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }
  }

  async create(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const maintenance =
      await this.maintenanceRepository.createMaintenance(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      maintenance,
    );
  }

  private isValidMaintenance(maintenance: MaintenanceDocument): void {
    if (!maintenance) {
      this.logger.error(errorMessages.MAINTENANCE_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.MAINTENANCE_NOT_FOUND,
      );
    }
  }

  private checkMaintenanceAccess(
    maintenance: MaintenanceDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(maintenance.owner, userId);
    checkAccess(maintenance.carId, carId);
  }

  async update(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const maintenance =
      await this.maintenanceRepository.findMaintenanceById(maintenanceId);
    this.isValidMaintenance(maintenance);
    this.checkMaintenanceAccess(maintenance, userId, carId);

    const updatedMaintenance =
      await this.maintenanceRepository.updateMaintenance(maintenanceId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedMaintenance,
    );
  }

  private async deletePhotos(
    maintenance: MaintenanceDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = maintenance.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        maintenance._id,
      );
    }
  }

  async delete(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const maintenance =
      await this.maintenanceRepository.findMaintenanceById(maintenanceId);
    this.isValidMaintenance(maintenance);
    this.checkMaintenanceAccess(maintenance, userId, carId);

    await this.deletePhotos(maintenance, EntityType.MAINTENANCE);

    const deletedMaintenance =
      await this.maintenanceRepository.deleteMaintenance(maintenanceId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedMaintenance,
    );
  }

  async getById(
    maintenanceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const maintenance =
      await this.maintenanceRepository.findMaintenanceById(maintenanceId);
    this.isValidMaintenance(maintenance);
    this.checkMaintenanceAccess(maintenance, userId, carId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      maintenance,
    );
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<MaintenanceDocument[]>> {
    const skip = calculateSkip(page, limit);

    const maintenances =
      await this.maintenanceRepository.findAllMaintenanceByUser(
        carId,
        userId,
        skip,
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
      await this.maintenanceRepository.findMaintenanceById(maintenanceId);
    this.isValidMaintenance(maintenance);
    this.checkMaintenanceAccess(maintenance, userId, carId);

    const updatedMaintenance =
      await this.maintenanceRepository.updateMaintenance(maintenanceId, {
        contactId,
      });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedMaintenance,
    );
  }
}
