import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarRepository } from './car.repository';
import { CarDto } from './dto/car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private readonly responseService: ResponseService,
    private readonly carRepository: CarRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const data = {
      owner: userId,
      images: {
        default: defaultImages.CAR_POSTER,
        selected: defaultImages.CAR_POSTER,
      },
      ...dto,
    };

    const newCar = await this.carModel.create(data);
    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      newCar,
    );
  }

  async update(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar = await this.carRepository.updateCar(carId, userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async delete(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCar(carId);
    this.carRepository.checkAccessRights(car.owner, userId);

    const deletedCar = await this.carModel
      .findByIdAndDelete(carId)
      .populate('images');

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
    this.carRepository.checkAccessRights(car.owner, userId);
    return this.responseService.createSuccessResponse(HttpStatus.OK, car);
  }

  async all(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<CarDocument[]>> {
    const skip = (page - 1) * limit;

    const cars = await this.carModel
      .find({ owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('images');

    return this.responseService.createSuccessResponse(HttpStatus.OK, cars);
  }
}
