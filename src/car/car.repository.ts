import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car, CarDocument } from './schemas/car.schema';

export class CarRepository {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async findCarById(carId: Types.ObjectId): Promise<CarDocument> {
    return this.carModel.findById(carId).populate('photos');
  }

  async findAndCountCars(
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<{ items: CarDocument[]; totalItems: number }> {
    const filter = { owner: userId };

    const [items, totalItems] = await Promise.all([
      this.carModel.find(filter).skip(skip).limit(limit).populate('photos'),
      this.carModel.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async createCar(dto: any): Promise<CarDocument> {
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

  async setInsurance(
    carId: Types.ObjectId,
    insuranceId: Types.ObjectId | null,
  ) {
    return this.updateCar(carId, { insuranceId });
  }

  async setInspection(
    carId: Types.ObjectId,
    inspectionId: Types.ObjectId | null,
  ) {
    return this.updateCar(carId, { inspectionId });
  }
}
