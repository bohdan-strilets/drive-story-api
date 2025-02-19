import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ImageModule } from 'src/image/image.module';
import { ResponseModule } from 'src/response/response.module';
import { InspectionController } from './inspection.controller';
import { InspectionHelper } from './inspection.helper';
import { InspectionRepository } from './inspection.repository';
import { InspectionService } from './inspection.service';
import { Inspection, InspectionSchema } from './schemas/inspection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inspection.name, schema: InspectionSchema },
    ]),
    ResponseModule,
    CarModule,
    forwardRef(() => ImageModule),
  ],
  controllers: [InspectionController],
  providers: [InspectionService, InspectionRepository, InspectionHelper],
  exports: [InspectionRepository],
})
export class InspectionModule {}
