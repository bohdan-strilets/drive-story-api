import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Accessory, AccessoryDocument } from './schemas/accessory.schema';

export class AccessoryRepository {
  private readonly logger = new Logger(AccessoryRepository.name);

  constructor(
    @InjectModel(Accessory.name)
    private accessoryModel: Model<AccessoryDocument>,
    private readonly carRepository: CarRepository,
  ) {}

  async findAccessory(accessoryId: Types.ObjectId): Promise<AccessoryDocument> {
    const accessory = await this.accessoryModel
      .findById(accessoryId)
      .populate('photos');

    if (!accessory) {
      this.logger.error(errorMessages.FUELING_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.FUELING_NOT_FOUND);
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
      .populate('photos');
  }
}
