import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarRepository {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async findCarById(carId: Types.ObjectId): Promise<CarDocument> {
    return this.carModel.findById(carId).populate('photos');
  }

  async findAllCars(
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<CarDocument[]> {
    return this.carModel
      .find({ owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos');
  }

  async createCar(dto: any) {
    return this.carModel.create(dto);
  }

  async updateCar(carId: Types.ObjectId, dto: any): Promise<CarDocument> {
    return this.carModel
      .findByIdAndUpdate(carId, dto, { new: true })
      .populate('photos');
  }

  async deleteCar(carId: Types.ObjectId): Promise<CarDocument> {
    return this.carModel.findByIdAndDelete(carId).populate('photos');
  }

  async setImage(
    carId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<CarDocument> {
    return this.updateCar(carId, { photos: data });
  }
}
