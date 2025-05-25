import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarHelper } from 'src/car/car.helper';
import { CarRepository } from 'src/car/car.repository';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { PaginationService } from 'src/pagination/pagination.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InsuranceDto } from './dto/insurance.dto';
import { PaidStatusDto } from './dto/paid-status.dto';
import { InsuranceHelper } from './insurance.helper';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceDocument } from './schemas/insurance.schema';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly carHelper: CarHelper,
    private readonly insuranceRepository: InsuranceRepository,
    private readonly insuranceHelper: InsuranceHelper,
    private readonly paginationService: PaginationService,
  ) {}

  async create(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: InsuranceDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const car = await this.carRepository.findCarById(carId);

    this.carHelper.isValidCar(car);
    checkAccess(car.owner, userId);

    const payload = { carId, owner: userId, ...dto };
    const insurance = await this.insuranceRepository.createInsurance(payload);

    await this.carRepository.updateCar(carId, {
      $set: {
        insurance: {
          insuranceId: insurance._id,
          insuranceEnds: insurance.endDate,
        },
      },
    });

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      insurance,
    );
  }

  async update(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: InsuranceDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.insuranceHelper.isValidInsurance(insurance);
    this.insuranceHelper.checkInsuranceAccess(insurance, carId, userId);

    const updatedInsurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }

  async updatePaidStatus(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: PaidStatusDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.insuranceHelper.isValidInsurance(insurance);
    this.insuranceHelper.checkInsuranceAccess(insurance, carId, userId);

    const updatedInsurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      { $set: { 'paymentStatus.isPaid': dto.isPaid } },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }

  async delete(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.insuranceHelper.isValidInsurance(insurance);
    this.insuranceHelper.checkInsuranceAccess(insurance, carId, userId);

    await this.insuranceHelper.deletePhotos(insurance, EntityType.INSURANCE);

    const deletedInsurance =
      await this.insuranceRepository.deleteInsurance(insuranceId);

    await this.carRepository.updateCar(carId, { $set: { insurance: null } });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInsurance,
    );
  }

  async getById(
    insuranceId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);

    this.insuranceHelper.isValidInsurance(insurance);
    this.insuranceHelper.checkInsuranceAccess(
      insurance,
      insurance.carId,
      userId,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, insurance);
  }

  async bindContact(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    contactId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceById(insuranceId);
    this.insuranceHelper.isValidInsurance(insurance);
    this.insuranceHelper.checkInsuranceAccess(insurance, carId, userId);

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
