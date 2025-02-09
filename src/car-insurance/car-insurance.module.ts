import { Module } from '@nestjs/common';
import { CarInsuranceService } from './car-insurance.service';
import { CarInsuranceController } from './car-insurance.controller';

@Module({
  controllers: [CarInsuranceController],
  providers: [CarInsuranceService],
})
export class CarInsuranceModule {}
