import { forwardRef, HttpStatus, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { AccessoryDto } from './dto/accessory.dto';
import { Accessory, AccessoryDocument } from './schemas/accessory.schema';
import { Payload } from './types/payload.type';

export class AccessoryRepository {
  private readonly logger = new Logger(AccessoryRepository.name);

  constructor(
    @InjectModel(Accessory.name)
    private accessoryModel: Model<AccessoryDocument>,
    private readonly carRepository: CarRepository,
    @Inject(forwardRef(() => ImageRepository))
    private readonly imageRepository: ImageRepository,
  ) {}

  async findAccessory(accessoryId: Types.ObjectId): Promise<AccessoryDocument> {
    const accessory = await this.accessoryModel
      .findById(accessoryId)
      .populate('photos')
      .populate('contactId');

    if (!accessory) {
      this.logger.error(errorMessages.SERVICE_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.SERVICE_NOT_FOUND);
    }

    return accessory;
  }

  async findAccessoryAndCheckAccessRights(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<AccessoryDocument> {
    const accessory = await this.findAccessory(accessoryId);
    this.carRepository.checkAccessRights(accessory.carId, carId);
    this.carRepository.checkAccessRights(accessory.owner, userId);
    return accessory;
  }

  async updateAccessory(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<AccessoryDocument> {
    await this.findAccessoryAndCheckAccessRights(accessoryId, carId, userId);

    return await this.accessoryModel
      .findByIdAndUpdate(accessoryId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async bindImage(
    accessoryId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<AccessoryDocument> {
    await this.findAccessory(accessoryId);
    return await this.accessoryModel.findByIdAndUpdate(
      accessoryId,
      { photos: data },
      { new: true },
    );
  }

  async deleteImages(accessory: AccessoryDocument): Promise<void> {
    const photos = accessory.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        EntityType.ACCESSORY,
        accessory._id,
      );
    }
  }

  async deleteAccessory(
    accessoryId: Types.ObjectId,
  ): Promise<AccessoryDocument> {
    return await this.accessoryModel
      .findByIdAndDelete(accessoryId)
      .populate('photos')
      .populate('contactId');
  }

  buildPayload(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: AccessoryDto,
  ): Payload {
    return { carId, owner: userId, ...dto };
  }

  async createAccessory(payload: Payload): Promise<AccessoryDocument> {
    return this.accessoryModel.create(payload);
  }

  async listAccessories(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<AccessoryDocument[]> {
    const skip = (page - 1) * limit;
    return await this.accessoryModel
      .find({
        carId,
        owner: userId,
      })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }
}
