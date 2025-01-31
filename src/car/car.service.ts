import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  private isValidDto(dto: any): ApiResponse | void {
    if (!dto) {
      return this.responseService.createErrorResponse(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_DATA_FORMAT,
      );
    }
  }

  async addCar(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    try {
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
    } catch (error) {
      console.error('Error creating new car:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  private async updateCarModel(
    carId: Types.ObjectId,
    dto: any,
  ): Promise<CarDocument> {
    const updatedCar = await this.carModel.findByIdAndUpdate(carId, dto, {
      new: true,
    });

    if (!updatedCar) {
      throw new Error(`Car with ID ${carId} was not updated`);
    }

    return updatedCar;
  }

  async updateCar(
    carId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    try {
      this.isValidDto(dto);

      const updatedCar = await this.updateCarModel(carId, dto);
      return this.responseService.createSuccessResponse(
        HttpStatus.OK,
        updatedCar,
      );
    } catch (error) {
      console.error('Error updating the car by id:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  private isValidCar(car: CarDocument): void {
    if (!car) {
      throw new Error('Car with the current ID was not found.');
    }
  }

  async deleteCar(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    try {
      const deletedCar = await this.carModel.findByIdAndDelete(carId);
      this.isValidCar(deletedCar);

      return this.responseService.createSuccessResponse(HttpStatus.OK);
    } catch (error) {
      console.error('Error deleting the car by id:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }

  async getById(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    try {
      const car = await this.carModel.findById(carId);
      this.isValidCar(car);

      return this.responseService.createSuccessResponse(HttpStatus.OK, car);
    } catch (error) {
      console.error('Error while finding a car by id:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }
}
