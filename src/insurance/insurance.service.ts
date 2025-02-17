import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InsuranceDto } from './dto/insurance.dto';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceDocument } from './schemas/insurance.schema';

@Injectable()
export class InsuranceService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly insuranceRepository: InsuranceRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: InsuranceDto,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const car = await this.carRepository.findCar(carId);
    checkAccessRights(car.owner, userId);

    const payload = this.insuranceRepository.buildPayload<InsuranceDto>(
      carId,
      userId,
      dto,
    );

    const insurance =
      await this.insuranceRepository.create<InsuranceDto>(payload);

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
    const insurance = await this.insuranceRepository.findById(insuranceId);
    checkAccessRights(insurance.owner, userId);
    checkAccessRights(insurance.carId, carId);

    const updatedInsurance =
      await this.insuranceRepository.updateById<InsuranceDto>(insuranceId, dto);

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
    const insurance = await this.insuranceRepository.findById(insuranceId);
    checkAccessRights(insurance.owner, userId);
    checkAccessRights(insurance.carId, carId);

    await this.insuranceRepository.deleteImages(
      insurance,
      EntityType.INSURANCE,
      insurance._id,
    );

    const deletedInsurance =
      await this.insuranceRepository.deleteById(insuranceId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedInsurance,
    );
  }

  async byId(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance = await this.insuranceRepository.findById(insuranceId);
    checkAccessRights(insurance.owner, userId);
    checkAccessRights(insurance.carId, carId);

    return this.responseService.createSuccessResponse(HttpStatus.OK, insurance);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<InsuranceDocument[]>> {
    const insurances = await this.insuranceRepository.getAll(
      carId,
      userId,
      page,
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
    const insurance = await this.insuranceRepository.findById(insuranceId);
    checkAccessRights(insurance.owner, userId);
    checkAccessRights(insurance.carId, carId);

    const updatedInsurance = await this.insuranceRepository.updateById(
      insuranceId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }
}
