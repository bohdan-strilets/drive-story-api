import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { checkAccessRights } from 'src/common/functions/check-access-rights.function';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { CarDto } from './dto/car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarRepository {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async createCar(userId: Types.ObjectId, dto: CarDto) {
    const payload = { owner: userId, ...dto };
    return await this.carModel.create(payload);
  }

  async updateCar<D>(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: D,
  ): Promise<CarDocument> {
    const car = await this.findCar(carId);
    checkAccessRights(car.owner, userId);

    return await this.carModel
      .findByIdAndUpdate(carId, dto, { new: true })
      .populate('images');
  }

  async deleteCar(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<CarDocument> {
    const car = await this.findCar(carId);
    checkAccessRights(car.owner, userId);

    return await this.carModel.findByIdAndDelete(carId).populate('images');
  }

  async findCar(carId: Types.ObjectId): Promise<CarDocument> {
    const car = await this.carModel.findById(carId).populate('images');

    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return car;
  }

  async getAllCars(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ): Promise<CarDocument[]> {
    const skip = (page - 1) * limit;

    return await this.carModel
      .find({ owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('images');
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
