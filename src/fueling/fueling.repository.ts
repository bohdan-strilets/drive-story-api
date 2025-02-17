import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarSupportRepository } from 'src/car/car-support.repository';
import { ImageRepository } from 'src/image/image.repository';
import { Fueling, FuelingDocument } from './schemas/fueling.schema';

export class FuelingRepository extends CarSupportRepository<FuelingDocument> {
  constructor(
    @InjectModel(Fueling.name)
    private fuelingModel: Model<FuelingDocument>,
    @Inject(forwardRef(() => ImageRepository))
    readonly imageRepository: ImageRepository,
  ) {
    super(fuelingModel, imageRepository);
  }
}
