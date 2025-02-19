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
import { InspectionDto } from './dto/inspection.dto';
import { InspectionRepository } from './inspection.repository';
import { InspectionDocument } from './schemas/inspection.schema';

@Injectable()
export class InspectionService {
  private readonly logger = new Logger(InspectionService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly inspectionRepository: InspectionRepository,
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
    dto: InspectionDto,
  ): Promise<ApiResponse<InspectionDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const inspection =
      await this.inspectionRepository.createInspection(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      inspection,
    );
  }

  private isValidInspection(inspection: InspectionDocument): void {
    if (!inspection) {
      this.logger.error(errorMessages.INSPECTION_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSPECTION_NOT_FOUND,
      );
    }
  }

  private checkInspectionAccess(
    inspection: InspectionDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(inspection.owner, userId);
    checkAccess(inspection.carId, carId);
  }

  async update(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: InspectionDto,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.isValidInspection(inspection);
    this.checkInspectionAccess(inspection, userId, carId);

    const updatedInspection = await this.inspectionRepository.updateInspection(
      inspectionId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInspection,
    );
  }

  private async deletePhotos(
    inspection: InspectionDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = inspection.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        inspection._id,
      );
    }
  }

  async delete(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.isValidInspection(inspection);
    this.checkInspectionAccess(inspection, userId, carId);

    await this.deletePhotos(inspection, EntityType.INSPECTION);

    const deletedInspection =
      await this.inspectionRepository.deleteInspection(inspectionId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInspection,
    );
  }

  async getById(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.isValidInspection(inspection);
    this.checkInspectionAccess(inspection, userId, carId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      inspection,
    );
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<InspectionDocument[]>> {
    const skip = calculateSkip(page, limit);

    const inspections =
      await this.inspectionRepository.findAllInspectionsByUser(
        carId,
        userId,
        skip,
        limit,
      );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      inspections,
    );
  }

  async bindContact(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.isValidInspection(inspection);
    this.checkInspectionAccess(inspection, userId, carId);

    const updatedInspection = await this.inspectionRepository.updateInspection(
      inspectionId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInspection,
    );
  }
}
