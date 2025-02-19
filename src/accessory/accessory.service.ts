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
import { AccessoryRepository } from './accessory.repository';
import { AccessoryDto } from './dto/accessory.dto';
import { AccessoryDocument } from './schemas/accessory.schema';

@Injectable()
export class AccessoryService {
  private readonly logger = new Logger(AccessoryService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly accessoryRepository: AccessoryRepository,
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
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const accessory = await this.accessoryRepository.createAccessory(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      accessory,
    );
  }

  private isValidAccessory(accessory: AccessoryDocument): void {
    if (!accessory) {
      this.logger.error(errorMessages.SERVICE_OR_ACCESSORY_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.SERVICE_OR_ACCESSORY_NOT_FOUND,
      );
    }
  }

  private checkAccessoryAccess(
    accessory: AccessoryDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(accessory.owner, userId);
    checkAccess(accessory.carId, carId);
  }

  async update(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.isValidAccessory(accessory);
    this.checkAccessoryAccess(accessory, userId, carId);

    const updatedAccessory = await this.accessoryRepository.updateAccessory(
      accessoryId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedAccessory,
    );
  }

  private async deletePhotos(
    accessory: AccessoryDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = accessory.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        accessory._id,
      );
    }
  }

  async delete(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.isValidAccessory(accessory);
    this.checkAccessoryAccess(accessory, userId, carId);

    await this.deletePhotos(accessory, EntityType.ACCESSORY);

    const deletedAccessory =
      await this.accessoryRepository.deleteAccessory(accessoryId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedAccessory,
    );
  }

  async getById(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.isValidAccessory(accessory);
    this.checkAccessoryAccess(accessory, userId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<AccessoryDocument[]>> {
    const skip = calculateSkip(page, limit);

    const accessories = await this.accessoryRepository.findAllAccessoryByUser(
      carId,
      userId,
      skip,
      limit,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      accessories,
    );
  }

  async bindContact(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.isValidAccessory(accessory);
    this.checkAccessoryAccess(accessory, userId, carId);

    const updatedAccessory = await this.accessoryRepository.updateAccessory(
      accessoryId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedAccessory,
    );
  }
}
