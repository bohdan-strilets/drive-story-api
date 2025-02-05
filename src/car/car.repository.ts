import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarRepository {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async updateCarModel(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<CarDocument> {
    const car = await this.findCarById(carId);
    this.checkCarByOwner(car.owner, userId);
    const params = { new: true };

    const updatedCar = await this.carModel.findByIdAndUpdate(
      carId,
      dto,
      params,
    );

    if (!updatedCar) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return updatedCar;
  }

  checkCarByOwner(carOwnerId: Types.ObjectId, ownerId: Types.ObjectId): void {
    if (!carOwnerId.equals(ownerId)) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        errorMessages.YOU_DO_NOT_OWN_CAR,
      );
    }
  }

  async findCarById(carId: Types.ObjectId): Promise<CarDocument> {
    const car = await this.carModel.findById(carId);

    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return car;
  }
}
