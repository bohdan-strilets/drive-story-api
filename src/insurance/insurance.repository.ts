import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Insurance, InsuranceDocument } from './schemas/insurance.schema';

export class InsuranceRepository {
  private readonly logger = new Logger(InsuranceRepository.name);

  constructor(
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    private readonly carRepository: CarRepository,
  ) {}

  async findInsurance(insuranceId: Types.ObjectId): Promise<InsuranceDocument> {
    const insurance = await this.insuranceModel
      .findById(insuranceId)
      .populate('photos')
      .populate('contactId');

    if (!insurance) {
      this.logger.error(errorMessages.INSURANCE_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSURANCE_NOT_FOUND,
      );
    }

    return insurance;
  }

  async findInsuranceAndCheckAccessRights(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<InsuranceDocument> {
    const insurance = await this.findInsurance(insuranceId);
    this.carRepository.checkAccessRights(insurance.carId, carId);
    this.carRepository.checkAccessRights(insurance.owner, userId);
    return insurance;
  }

  async updateInsurance(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<InsuranceDocument> {
    await this.findInsuranceAndCheckAccessRights(insuranceId, carId, userId);

    return await this.insuranceModel
      .findByIdAndUpdate(insuranceId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async bindImage(
    insuranceId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<InsuranceDocument> {
    await this.findInsurance(insuranceId);
    return await this.insuranceModel.findByIdAndUpdate(
      insuranceId,
      { photos: data },
      { new: true },
    );
  }
}
