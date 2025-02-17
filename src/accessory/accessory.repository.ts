import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarSupportRepository } from 'src/car/car-support.repository';
import { ImageRepository } from 'src/image/image.repository';
import { Accessory, AccessoryDocument } from './schemas/accessory.schema';

export class AccessoryRepository extends CarSupportRepository<AccessoryDocument> {
  constructor(
    @InjectModel(Accessory.name)
    private accessoryModel: Model<AccessoryDocument>,
    @Inject(forwardRef(() => ImageRepository))
    readonly imageRepository: ImageRepository,
  ) {
    super(accessoryModel, imageRepository);
  }
}
