import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import {
  CarInsurance,
  CarInsuranceDocument,
} from './schemas/car-insurance.schema';

export class CarInsuranceRepository {
  private readonly logger = new Logger(CarInsuranceRepository.name);

  constructor(
    @InjectModel(CarInsurance.name)
    private carInsuranceModel: Model<CarInsuranceDocument>,
    private readonly carRepository: CarRepository,
  ) {}

  async findInsurance(
    insuranceId: Types.ObjectId,
  ): Promise<CarInsuranceDocument> {
    const insurance = await this.carInsuranceModel
      .findById(insuranceId)
      .populate('photos')
      .populate('contactId');

    if (!insurance) {
      this.logger.error(errorMessages.FUELING_NOT_FOUND);
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
  ): Promise<CarInsuranceDocument> {
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
  ): Promise<CarInsuranceDocument> {
    await this.findInsuranceAndCheckAccessRights(insuranceId, carId, userId);

    return await this.carInsuranceModel
      .findByIdAndUpdate(insuranceId, dto, { new: true })
      .populate('photos')
      .populate('contactId');
  }

  async bindImage(
    insuranceId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<CarInsuranceDocument> {
    await this.findInsurance(insuranceId);
    return await this.carInsuranceModel.findByIdAndUpdate(
      insuranceId,
      { photos: data },
      { new: true },
    );
  }
}
