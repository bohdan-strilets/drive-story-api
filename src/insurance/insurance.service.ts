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
import { InsuranceDto } from './dto/insurance.dto';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceDocument } from './schemas/insurance.schema';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly insuranceRepository: InsuranceRepository,
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
    dto: InsuranceDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const insurance = await this.insuranceRepository.createInsurance(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      insurance,
    );
  }

  private isValidInsurance(insurance: InsuranceDocument): void {
    if (!insurance) {
      this.logger.error(errorMessages.INSURANCE_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSURANCE_NOT_FOUND,
      );
    }
  }

  private checkInsuranceAccess(
    insurance: InsuranceDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(insurance.owner, userId);
    checkAccess(insurance.carId, carId);
  }

  async update(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: InsuranceDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.isValidInsurance(insurance);
    this.checkInsuranceAccess(insurance, userId, carId);

    const updatedInsurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }

  private async deletePhotos(
    insurance: InsuranceDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = insurance.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        insurance._id,
      );
    }
  }

  async delete(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.isValidInsurance(insurance);
    this.checkInsuranceAccess(insurance, userId, carId);

    await this.deletePhotos(insurance, EntityType.INSURANCE);

    const deletedInsurance =
      await this.insuranceRepository.deleteInsurance(insuranceId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInsurance,
    );
  }

  async getById(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.isValidInsurance(insurance);
    this.checkInsuranceAccess(insurance, userId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, insurance);
  }

  async getAll(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<InsuranceDocument[]>> {
    const skip = calculateSkip(page, limit);

    const insurances = await this.insuranceRepository.findAllInsuranceByUser(
      carId,
      userId,
      skip,
      limit,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      insurances,
    );
  }

  async bindContact(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.isValidInsurance(insurance);
    this.checkInsuranceAccess(insurance, userId, carId);

    const updatedInsurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }
}
