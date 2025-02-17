import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InspectionDto } from './dto/inspection.dto';
import { InspectionRepository } from './inspection.repository';
import { InspectionDocument } from './schemas/inspection.schema';

@Injectable()
export class InspectionService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly inspectionRepository: InspectionRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: InspectionDto,
  ): Promise<ApiResponse<InspectionDocument>> {
    const car = await this.carRepository.findCar(carId);
    checkAccessRights(car.owner, userId);

    const payload = this.inspectionRepository.buildPayload<InspectionDto>(
      carId,
      userId,
      dto,
    );

    const inspection =
      await this.inspectionRepository.create<InspectionDto>(payload);

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
    const inspection = await this.inspectionRepository.findById(inspectionId);
    checkAccessRights(inspection.owner, userId);
    checkAccessRights(inspection.carId, carId);

    const updatedInspection =
      await this.inspectionRepository.updateById<InspectionDto>(
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
    const inspection = await this.inspectionRepository.findById(inspectionId);
    checkAccessRights(inspection.owner, userId);
    checkAccessRights(inspection.carId, carId);

    await this.inspectionRepository.deleteImages(
      inspection,
      EntityType.INSPECTION,
      inspection._id,
    );

    const deletedInspection =
      await this.inspectionRepository.deleteById(inspectionId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInspection,
    );
  }

  async byId(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    checkAccessRights(inspection.owner, userId);
    checkAccessRights(inspection.carId, carId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      inspection,
    );
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<InspectionDocument[]>> {
    const inspection = await this.inspectionRepository.getAll(
      carId,
      userId,
      page,
      limit,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      inspection,
    );
  }

  async bindContact(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    checkAccessRights(inspection.owner, userId);
    checkAccessRights(inspection.carId, carId);

    const updatedInspection = await this.inspectionRepository.updateById(
      inspectionId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInspection,
    );
  }
}
