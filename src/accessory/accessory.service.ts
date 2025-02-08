import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { AccessoryRepository } from './accessory.repository';
import { AccessoryDto } from './dto/accessory.dto';
import { Accessory, AccessoryDocument } from './schemas/accessory.schema';

@Injectable()
export class AccessoryService {
  constructor(
    @InjectModel(Accessory.name)
    private accessoryModel: Model<AccessoryDocument>,
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
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = { carId, owner: userId, ...dto };
    const fueling = await this.accessoryModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      fueling,
    );
  }

  async update(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: AccessoryDto,
  ): Promise<ApiResponse<AccessoryDocument>> {
    const accessory = await this.accessoryRepository.updateAccessory(
      accessoryId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }

  async delete(
    accessoryId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    await this.accessoryRepository.findAccessoryAndCheckAccessRights(
      accessoryId,
      carId,
      userId,
    );

    const deletedAccessory = await this.accessoryModel
      .findByIdAndDelete(accessoryId)
      .populate('photos');

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
    const accessory =
      await this.accessoryRepository.findAccessoryAndCheckAccessRights(
        accessoryId,
        carId,
        userId,
      );

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<AccessoryDocument[]>> {
    const skip = (page - 1) * limit;

    const accessory = await this.accessoryModel
      .find({
        carId,
        owner: userId,
      })
      .skip(skip)
      .limit(limit)
      .populate('photos');

    return this.responseService.createSuccessResponse(HttpStatus.OK, accessory);
  }
}
