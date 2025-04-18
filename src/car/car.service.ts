import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { calculateSkip } from 'src/common/helpers/calculate-skip.helper';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarHelper } from './car.helper';
import { CarRepository } from './car.repository';
import { CarDto } from './dto/car.dto';
import { CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
    private readonly carHelper: CarHelper,
  ) {}

  async create(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const payload = { owner: userId, ...dto };
    const car = await this.carRepository.createCar(payload);

    return this.responseService.createSuccessResponse(HttpStatus.CREATED, car);
  }

  async update(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCarById(carId);

    checkAccess(car.owner, userId);
    this.carHelper.isValidCar(car);

    const updatedCar = await this.carRepository.updateCar(carId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async delete(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCarById(carId);

    checkAccess(car.owner, userId);
    this.carHelper.isValidCar(car);

    const deletedCar = await this.carRepository.deleteCar(carId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedCar,
    );
  }

  async getById(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCarById(carId);

    checkAccess(car.owner, userId);
    this.carHelper.isValidCar(car);

    return this.responseService.createSuccessResponse(HttpStatus.OK, car);
  }

  async getAll(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<ApiResponse<CarDocument[]>> {
    const skip = calculateSkip(page, limit);
    const cars = await this.carRepository.findAllCars(userId, skip, limit);

    return this.responseService.createSuccessResponse(HttpStatus.OK, cars);
  }
}
