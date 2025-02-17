import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarSupportRepository } from 'src/car/car-support.repository';
import { ImageRepository } from 'src/image/image.repository';
import { Insurance, InsuranceDocument } from './schemas/insurance.schema';

export class InsuranceRepository extends CarSupportRepository<InsuranceDocument> {
  constructor(
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    @Inject(forwardRef(() => ImageRepository))
    readonly imageRepository: ImageRepository,
  ) {
    super(insuranceModel, imageRepository);
  }
}
