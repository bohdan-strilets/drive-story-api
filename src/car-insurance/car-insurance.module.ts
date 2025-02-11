import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { CarInsuranceController } from './car-insurance.controller';
import { CarInsuranceRepository } from './car-insurance.repository';
import { CarInsuranceService } from './car-insurance.service';
import {
  CarInsurance,
  CarInsuranceSchema,
} from './schemas/car-insurance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CarInsurance.name, schema: CarInsuranceSchema },
    ]),
    ResponseModule,
    CarModule,
  ],
  controllers: [CarInsuranceController],
  providers: [CarInsuranceService, CarInsuranceRepository],
  exports: [CarInsuranceRepository],
})
export class CarInsuranceModule {}
