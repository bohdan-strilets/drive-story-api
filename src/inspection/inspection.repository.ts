import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarSupportRepository } from 'src/car/car-support.repository';
import { ImageRepository } from 'src/image/image.repository';
import { Inspection, InspectionDocument } from './schemas/inspection.schema';

export class InspectionRepository extends CarSupportRepository<InspectionDocument> {
  constructor(
    @InjectModel(Inspection.name)
    private inspectionModel: Model<InspectionDocument>,
    @Inject(forwardRef(() => ImageRepository))
    readonly imageRepository: ImageRepository,
  ) {
    super(inspectionModel, imageRepository);
  }
}
