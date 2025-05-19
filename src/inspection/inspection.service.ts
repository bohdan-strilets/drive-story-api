import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarHelper } from 'src/car/car.helper';
import { CarRepository } from 'src/car/car.repository';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InspectionDto } from './dto/inspection.dto';
import { InspectionHelper } from './inspection.helper';
import { InspectionRepository } from './inspection.repository';
import { InspectionDocument } from './schemas/inspection.schema';

@Injectable()
export class InspectionService {
  private readonly logger = new Logger(InspectionService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly carHelper: CarHelper,
    private readonly inspectionRepository: InspectionRepository,
    private readonly inspectionHelper: InspectionHelper,
  ) {}

  async create(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: InspectionDto,
  ): Promise<ApiResponse<InspectionDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.carHelper.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const inspection =
      await this.inspectionRepository.createInspection(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      inspection,
    );
  }

  async update(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: InspectionDto,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.inspectionHelper.isValidInspection(inspection);
    this.inspectionHelper.checkInspectionAccess(inspection, carId, userId);

    const updatedInspection = await this.inspectionRepository.updateInspection(
      inspectionId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInspection,
    );
  }

  async delete(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);
    this.inspectionHelper.isValidInspection(inspection);
    this.inspectionHelper.checkInspectionAccess(inspection, carId, userId);

    await this.inspectionHelper.deletePhotos(inspection, EntityType.INSPECTION);

    const deletedInspection =
      await this.inspectionRepository.deleteInspection(inspectionId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInspection,
    );
  }

  async getById(
    inspectionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionById(inspectionId);

    this.inspectionHelper.isValidInspection(inspection);
    this.inspectionHelper.checkInspectionAccess(
      inspection,
      inspection.carId,
      userId,
    );

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
    this.inspectionHelper.isValidInspection(inspection);
    this.inspectionHelper.checkInspectionAccess(inspection, carId, userId);

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
