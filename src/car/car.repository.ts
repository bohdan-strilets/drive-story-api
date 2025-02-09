import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarRepository {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async updateCar(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<CarDocument> {
    const car = await this.findCar(carId);
    this.checkAccessRights(car.owner, userId);
    const params = { new: true };

    return await this.carModel
      .findByIdAndUpdate(carId, dto, params)
      .populate('images');
  }

  checkAccessRights(firstId: Types.ObjectId, secondId: Types.ObjectId): void {
    if (!firstId.equals(secondId)) {
      throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
    }
  }

  async findCar(carId: Types.ObjectId): Promise<CarDocument> {
    const car = await this.carModel.findById(carId).populate('images');

    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return car;
  }

  async bindImage(
    carId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<CarDocument> {
    await this.findCar(carId);
    return await this.carModel.findByIdAndUpdate(
      carId,
      { images: data },
      { new: true },
    );
  }
}
