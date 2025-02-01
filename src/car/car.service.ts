import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { defaultImages } from 'src/helpers/default-images';
import { errorMessages } from 'src/helpers/error-messages';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarDto } from './dto/car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private readonly responseService: ResponseService,
  ) {}

  private isValidDto(dto: any): void {
    if (!dto) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.CHECK_ENTERED_DATA,
      );
    }
  }

  async addCar(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    this.isValidDto(dto);

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

  private async updateCarModel(
    carId: Types.ObjectId,
    dto: any,
  ): Promise<CarDocument> {
    const updatedCar = await this.carModel.findByIdAndUpdate(carId, dto, {
      new: true,
    });

    if (!updatedCar) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return updatedCar;
  }

  async updateCar(
    carId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    this.isValidDto(dto);
    const updatedCar = await this.updateCarModel(carId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  private isValidCar(car: CarDocument): void {
    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }
  }

  async deleteCar(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    const deletedCar = await this.carModel.findByIdAndDelete(carId);
    this.isValidCar(deletedCar);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async getById(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    const car = await this.carModel.findById(carId);
    this.isValidCar(car);
    return this.responseService.createSuccessResponse(HttpStatus.OK, car);
  }
}
