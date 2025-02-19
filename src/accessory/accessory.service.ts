import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarHelper } from 'src/car/car.helper';
import { CarRepository } from 'src/car/car.repository';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { AccessoryHelper } from './accessory.helper';
import { AccessoryRepository } from './accessory.repository';
import { AccessoryDto } from './dto/accessory.dto';
import { AccessoryDocument } from './schemas/accessory.schema';

@Injectable()
export class AccessoryService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly carHelper: CarHelper,
    private readonly accessoryRepository: AccessoryRepository,
    private readonly accessoryHelper: AccessoryHelper,
  ) {}

  async create(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.carHelper.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const accessory = await this.accessoryRepository.createAccessory(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      accessory,
    );
  }

  async update(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.accessoryHelper.isValidAccessory(accessory);
    this.accessoryHelper.checkAccessoryAccess(accessory, userId, carId);

    const updatedAccessory = await this.accessoryRepository.updateAccessory(
      accessoryId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedAccessory,
    );
  }

  async delete(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory =
      await this.accessoryRepository.findAccessoryById(accessoryId);
    this.accessoryHelper.isValidAccessory(accessory);
    this.accessoryHelper.checkAccessoryAccess(accessory, userId, carId);

    await this.accessoryHelper.deletePhotos(accessory, EntityType.ACCESSORY);

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
    this.accessoryHelper.isValidAccessory(accessory);
    this.accessoryHelper.checkAccessoryAccess(accessory, userId, carId);

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
    this.accessoryHelper.isValidAccessory(accessory);
    this.accessoryHelper.checkAccessoryAccess(accessory, userId, carId);

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
