import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarSupportRepository } from 'src/car/car-support.repository';
import { ImageRepository } from 'src/image/image.repository';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

export class MaintenanceRepository extends CarSupportRepository<MaintenanceDocument> {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    @Inject(forwardRef(() => ImageRepository))
    readonly imageRepository: ImageRepository,
  ) {
    super(maintenanceModel, imageRepository);
  }
}
