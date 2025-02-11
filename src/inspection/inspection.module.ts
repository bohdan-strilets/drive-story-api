import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { InspectionController } from './inspection.controller';
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
  ],
  controllers: [InspectionController],
  providers: [InspectionService, InspectionRepository],
  exports: [InspectionRepository],
})
export class InspectionModule {}
