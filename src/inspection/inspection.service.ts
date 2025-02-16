import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InspectionDto } from './dto/inspection.dto';
import { InspectionRepository } from './inspection.repository';
import { Inspection, InspectionDocument } from './schemas/inspection.schema';

@Injectable()
export class InspectionService {
  constructor(
    @InjectModel(Inspection.name)
    private inspectionModel: Model<InspectionDocument>,
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
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = { carId, owner: userId, ...dto };
    const inspection = await this.inspectionModel.create(data);

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
    const inspection = await this.inspectionRepository.updateInspection(
      inspectionId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      inspection,
    );
  }

  async delete(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const inspection =
      await this.inspectionRepository.findInspectionAndCheckAccessRights(
        inspectionId,
        carId,
        userId,
      );

    await this.inspectionRepository.deleteImages(inspection);

    const deletedInspection = await this.inspectionModel
      .findByIdAndDelete(inspectionId)
      .populate('photos')
      .populate('contactId');

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
    const inspection =
      await this.inspectionRepository.findInspectionAndCheckAccessRights(
        inspectionId,
        carId,
        userId,
      );

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
    const skip = (page - 1) * limit;

    const inspection = await this.inspectionModel
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
      inspection,
    );
  }

  async bindContact(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    const updatedInspection = await this.inspectionRepository.updateInspection(
      inspectionId,
      carId,
      userId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInspection,
    );
  }
}
