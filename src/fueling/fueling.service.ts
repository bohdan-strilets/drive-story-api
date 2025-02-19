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
import { FuelingDto } from './dto/fueling.dto';
import { FuelingRepository } from './fueling.repository';
import { FuelingDocument } from './schemas/fueling.schema';

@Injectable()
export class FuelingService {
  private readonly logger = new Logger(FuelingService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly fuelingRepository: FuelingRepository,
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
    dto: FuelingDto,
  ): Promise<ApiResponse<FuelingDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const fueling = await this.fuelingRepository.createFueling(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      fueling,
    );
  }

  private isValidFueling(fueling: FuelingDocument): void {
    if (!fueling) {
      this.logger.error(errorMessages.FUELING_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.FUELING_NOT_FOUND);
    }
  }

  private checkFuelingAccess(
    fueling: FuelingDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(fueling.owner, userId);
    checkAccess(fueling.carId, carId);
  }

  async update(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: FuelingDto,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.isValidFueling(fueling);
    this.checkFuelingAccess(fueling, userId, carId);

    const updatedFueling = await this.fuelingRepository.updateFueling(
      fuelingId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedFueling,
    );
  }

  private async deletePhotos(
    fueling: FuelingDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = fueling.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        fueling._id,
      );
    }
  }

  async delete(
    fuelingId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    const fueling = await this.fuelingRepository.findFuelingById(fuelingId);
    this.isValidFueling(fueling);
    this.checkFuelingAccess(fueling, userId, carId);

    await this.deletePhotos(fueling, EntityType.FUELING);

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
    this.isValidFueling(fueling);
    this.checkFuelingAccess(fueling, userId, carId);

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
    this.isValidFueling(fueling);
    this.checkFuelingAccess(fueling, userId, carId);

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
