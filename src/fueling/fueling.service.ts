import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { FuelingDto } from './dto/fueling.dto';
import { FuelingRepository } from './fueling.repository';
import { Fueling, FuelingDocument } from './schemas/fueling.schema';

@Injectable()
export class FuelingService {
  constructor(
    @InjectModel(Fueling.name) private fuelingModel: Model<FuelingDocument>,
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly fuelingRepository: FuelingRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: FuelingDto,
  ): Promise<ApiResponse<FuelingDocument>> {
    const car = await this.carRepository.findCar(carId);
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = { carId, owner: userId, ...dto };
    const fueling = await this.fuelingModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      fueling,
    );
  }

  async update(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: FuelingDto,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.updateFueling(
      fuelingId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async delete(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    await this.fuelingRepository.findFuelingAndCheckAccessRights(
      fuelingId,
      carId,
      userId,
    );

    const deletedFueling = await this.fuelingModel
      .findByIdAndDelete(fuelingId)
      .populate('photos')
      .populate('contactId');

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedFueling,
    );
  }

  async byId(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling =
      await this.fuelingRepository.findFuelingAndCheckAccessRights(
        fuelingId,
        carId,
        userId,
      );

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<FuelingDocument[]>> {
    const skip = (page - 1) * limit;

    const fueling = await this.fuelingModel
      .find({
        carId,
        owner: userId,
      })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async bindContact(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const updatedFueling = await this.fuelingRepository.updateFueling(
      fuelingId,
      carId,
      userId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedFueling,
    );
  }
}
