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
    const updatedMaintenance = await this.fuelingRepository.updateFueling(
      fuelingId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedMaintenance,
    );
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

    const deletedMaintenance = await this.fuelingModel
      .findByIdAndDelete(fuelingId)
      .populate('photos');

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedMaintenance,
    );
  }

  async byId(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const maintenance =
      await this.fuelingRepository.findFuelingAndCheckAccessRights(
        fuelingId,
        carId,
        userId,
      );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      maintenance,
    );
  }
}
