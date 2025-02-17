import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarRepository } from './car.repository';
import { CarDto } from './dto/car.dto';
import { CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.createCar(userId, dto);
    return this.responseService.createSuccessResponse(HttpStatus.CREATED, car);
  }

  async update(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar = await this.carRepository.updateCar<CarDto>(
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async delete(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const deletedCar = await this.carRepository.deleteCar(carId, userId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedCar,
    );
  }

  async byId(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCar(carId);
    checkAccessRights(car.owner, userId);
    return this.responseService.createSuccessResponse(HttpStatus.OK, car);
  }

  async all(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<CarDocument[]>> {
    const cars = await this.carRepository.getAllCars(userId, page, limit);
    return this.responseService.createSuccessResponse(HttpStatus.OK, cars);
  }
}
