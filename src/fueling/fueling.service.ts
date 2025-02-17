import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { FuelingDto } from './dto/fueling.dto';
import { FuelingRepository } from './fueling.repository';
import { FuelingDocument } from './schemas/fueling.schema';

@Injectable()
export class FuelingService {
  constructor(
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
    checkAccessRights(car.owner, userId);

    const payload = this.fuelingRepository.buildPayload<FuelingDto>(
      carId,
      userId,
      dto,
    );

    const fueling = await this.fuelingRepository.create<FuelingDto>(payload);

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
    const fueling = await this.fuelingRepository.findById(fuelingId);
    checkAccessRights(fueling.owner, userId);
    checkAccessRights(fueling.carId, carId);

    const updatedFueling = await this.fuelingRepository.updateById<FuelingDto>(
      fuelingId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedFueling,
    );
  }

  async delete(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.findById(fuelingId);
    checkAccessRights(fueling.owner, userId);
    checkAccessRights(fueling.carId, carId);

    await this.fuelingRepository.deleteImages(
      fueling,
      EntityType.FUELING,
      fueling._id,
    );

    const deletedFueling = await this.fuelingRepository.deleteById(fuelingId);

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
    const fueling = await this.fuelingRepository.findById(fuelingId);
    checkAccessRights(fueling.owner, userId);
    checkAccessRights(fueling.carId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<FuelingDocument[]>> {
    const fueling = await this.fuelingRepository.getAll(
      carId,
      userId,
      page,
      limit,
    );
    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async bindContact(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.findById(fuelingId);
    checkAccessRights(fueling.owner, userId);
    checkAccessRights(fueling.carId, carId);

    const updatedFueling = await this.fuelingRepository.updateById(fuelingId, {
      contactId,
    });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedFueling,
    );
  }
}
