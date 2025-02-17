import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { AccessoryRepository } from './accessory.repository';
import { AccessoryDto } from './dto/accessory.dto';
import { AccessoryDocument } from './schemas/accessory.schema';

@Injectable()
export class AccessoryService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly accessoryRepository: AccessoryRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const car = await this.carRepository.findCar(carId);
    checkAccessRights(car.owner, userId);

    const payload = this.accessoryRepository.buildPayload<AccessoryDto>(
      carId,
      userId,
      dto,
    );

    const accessory =
      await this.accessoryRepository.create<AccessoryDto>(payload);

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
    const accessory = await this.accessoryRepository.findById(accessoryId);
    checkAccessRights(accessory.owner, userId);
    checkAccessRights(accessory.carId, carId);

    const updatedAccessory =
      await this.accessoryRepository.updateById<AccessoryDto>(accessoryId, dto);

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
    const accessory = await this.accessoryRepository.findById(accessoryId);
    checkAccessRights(accessory.owner, userId);
    checkAccessRights(accessory.carId, carId);

    await this.accessoryRepository.deleteImages(
      accessory,
      EntityType.ACCESSORY,
      accessory._id,
    );

    const deletedAccessory =
      await this.accessoryRepository.deleteById(accessoryId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedAccessory,
    );
  }

  async byId(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory = await this.accessoryRepository.findById(accessoryId);
    checkAccessRights(accessory.owner, userId);
    checkAccessRights(accessory.carId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<AccessoryDocument[]>> {
    const accessory = await this.accessoryRepository.getAll(
      carId,
      userId,
      page,
      limit,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }

  async bindContact(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory = await this.accessoryRepository.findById(accessoryId);
    checkAccessRights(accessory.owner, userId);
    checkAccessRights(accessory.carId, carId);

    const updatedAccessory = await this.accessoryRepository.updateById(
      accessoryId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedAccessory,
    );
  }
}
