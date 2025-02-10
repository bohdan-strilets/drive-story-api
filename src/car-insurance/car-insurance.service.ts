import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarInsuranceDto } from './dto/car-insurance.dto';
import {
  CarInsurance,
  CarInsuranceDocument,
} from './schemas/car-insurance.schema';

@Injectable()
export class CarInsuranceService {
  private readonly logger = new Logger(CarInsuranceService.name);

  constructor(
    @InjectModel(CarInsurance.name)
    private carInsuranceModel: Model<CarInsuranceDocument>,
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: CarInsuranceDto,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    const car = await this.carRepository.findCar(carId);
    this.carRepository.checkAccessRights(car.owner, userId);

    const data = { carId, owner: userId, ...dto };
    const carInsurance = await this.carInsuranceModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      carInsurance,
    );
  }
}
