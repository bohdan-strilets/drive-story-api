import { forwardRef, HttpStatus, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { Inspection, InspectionDocument } from './schemas/inspection.schema';

export class InspectionRepository {
  private readonly logger = new Logger(InspectionRepository.name);

  constructor(
    @InjectModel(Inspection.name)
    private inspectionModel: Model<InspectionDocument>,
    private readonly carRepository: CarRepository,
    @Inject(forwardRef(() => ImageRepository))
    private readonly imageRepository: ImageRepository,
  ) {}

  async findInspection(
    inspectionId: Types.ObjectId,
  ): Promise<InspectionDocument> {
    const inspection = await this.inspectionModel
      .findById(inspectionId)
      .populate('photos')
      .populate('contactId');

    if (!inspection) {
      this.logger.error(errorMessages.INSPECTION_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSPECTION_NOT_FOUND,
      );
    }

    return inspection;
  }

  async findInspectionAndCheckAccessRights(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<InspectionDocument> {
    const inspection = await this.findInspection(inspectionId);
    this.carRepository.checkAccessRights(inspection.carId, carId);
    this.carRepository.checkAccessRights(inspection.owner, userId);
    return inspection;
  }

  async updateInspection(
    inspectionId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<InspectionDocument> {
    await this.findInspectionAndCheckAccessRights(inspectionId, carId, userId);

    return await this.inspectionModel
      .findByIdAndUpdate(inspectionId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async bindImage(
    inspectionId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<InspectionDocument> {
    await this.findInspection(inspectionId);
    return await this.inspectionModel.findByIdAndUpdate(
      inspectionId,
      { photos: data },
      { new: true },
    );
  }

  async deleteImages(inspection: InspectionDocument): Promise<void> {
    const photos = inspection.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        EntityType.INSPECTION,
        inspection._id,
      );
    }
  }
}
