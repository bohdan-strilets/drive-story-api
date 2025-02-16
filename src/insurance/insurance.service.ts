import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { InsuranceDto } from './dto/insurance.dto';
import { InsuranceRepository } from './insurance.repository';
import { Insurance, InsuranceDocument } from './schemas/insurance.schema';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
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
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = { carId, owner: userId, ...dto };
    const insurance = await this.insuranceModel.create(data);

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
    const insurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, insurance);
  }

  async delete(
    insuranceId: Types.ObjectId,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    const insurance =
      await this.insuranceRepository.findInsuranceAndCheckAccessRights(
        insuranceId,
        carId,
        userId,
      );

    await this.insuranceRepository.deleteImages(insurance);

    const deletedInsurance = await this.insuranceModel
      .findByIdAndDelete(insuranceId)
      .populate('photos')
      .populate('contactId');

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
    const insurance =
      await this.insuranceRepository.findInsuranceAndCheckAccessRights(
        insuranceId,
        carId,
        userId,
      );

    return this.responseService.createSuccessResponse(HttpStatus.OK, insurance);
  }

  async all(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<InsuranceDocument[]>> {
    const skip = (page - 1) * limit;

    const insurances = await this.insuranceModel
      .find({
        carId,
        owner: userId,
      })
      .skip(skip)
      .limit(limit)
      .populate('photos')
      .populate('contactId');

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
    const updatedInsurance = await this.insuranceRepository.updateInsurance(
      insuranceId,
      carId,
      userId,
      { contactId },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedInsurance,
    );
  }
}
