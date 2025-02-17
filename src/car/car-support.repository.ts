import { HttpStatus, Logger } from '@nestjs/common';
import { Document, Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { Payload } from './types/payload.type';

export abstract class CarSupportRepository<T extends Document> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly model: Model<T>,
    protected readonly imageRepository: ImageRepository,
  ) {}

  buildPayload<D>(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Payload<D> {
    return { carId, owner: userId, ...dto };
  }

  async create<D>(payload: Payload<D>): Promise<T> {
    return this.model.create(payload);
  }

  async findById(id: Types.ObjectId): Promise<T> {
    const entity = await this.model
      .findById(id)
      .populate('photos')
      .populate('contactId');

    if (!entity) {
      this.logger.error(errorMessages.SERVICE_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.SERVICE_NOT_FOUND);
    }

    return entity;
  }

  async updateById<D>(id: Types.ObjectId, dto: D): Promise<T> {
    await this.findById(id);
    return await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async deleteById(id: Types.ObjectId): Promise<T> {
    await this.findById(id);
    return await this.model
      .findByIdAndDelete(id)
      .populate('photos')
      .populate('contactId');
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<T[]> {
    const skip = (page - 1) * limit;
    return await this.model
      .find({ carId, owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');
  }

  async setImage(
    id: Types.ObjectId,
    payload: Types.ObjectId | null,
  ): Promise<T> {
    await this.findById(id);
    return await this.model.findByIdAndUpdate(
      id,
      { photos: payload },
      { new: true },
    );
  }

  async deleteImages(
    entity: T,
    entityType: EntityType,
    entityId: Types.ObjectId,
  ): Promise<void> {
    const photos = entity['photos'];

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        entityId,
      );
    }
  }
}
