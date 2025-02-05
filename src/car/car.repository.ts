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
    this.checkAccessRights(car.owner, userId);
    const params = { new: true };

    return await this.carModel.findByIdAndUpdate(carId, dto, params);
  }

  checkAccessRights(firstId: Types.ObjectId, secondId: Types.ObjectId): void {
    if (!firstId.equals(secondId)) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        errorMessages.DO_NOT_HAVE_ACCESS_RIGHT,
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
