import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarHelper } from 'src/car/car.helper';
import { CarRepository } from 'src/car/car.repository';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { FuelingDto } from './dto/fueling.dto';
import { FuelingHelper } from './fueling.helper';
import { FuelingRepository } from './fueling.repository';
import { FuelingDocument } from './schemas/fueling.schema';

@Injectable()
export class FuelingService {
  private readonly logger = new Logger(FuelingService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly carHelper: CarHelper,
    private readonly fuelingRepository: FuelingRepository,
    private readonly fuelingHelper: FuelingHelper,
  ) {}

  async create(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: FuelingDto,
  ): Promise<ApiResponse<FuelingDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.carHelper.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const fueling = await this.fuelingRepository.createFueling(payload);

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
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.fuelingHelper.isValidFueling(fueling);
    this.fuelingHelper.checkFuelingAccess(fueling, userId, carId);

    const updatedFueling = await this.fuelingRepository.updateFueling(
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
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.fuelingHelper.isValidFueling(fueling);
    this.fuelingHelper.checkFuelingAccess(fueling, userId, carId);

    await this.fuelingHelper.deletePhotos(fueling, EntityType.FUELING);

    const deletedFueling =
      await this.fuelingRepository.deleteFueling(fuelingId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedFueling,
    );
  }

  async getById(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.fuelingHelper.isValidFueling(fueling);
    this.fuelingHelper.checkFuelingAccess(fueling, userId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, fueling);
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<FuelingDocument[]>> {
    const skip = calculateSkip(page, limit);

    const fueling = await this.fuelingRepository.findAllFuelingByUser(
      carId,
      userId,
      skip,
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
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.fuelingHelper.isValidFueling(fueling);
    this.fuelingHelper.checkFuelingAccess(fueling, userId, carId);

    const updatedFueling = await this.fuelingRepository.updateFueling(
      fuelingId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedFueling,
    );
  }
}
