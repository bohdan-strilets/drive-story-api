import { Controller } from '@nestjs/common';
import { CarInsuranceService } from './car-insurance.service';

@Controller('car-insurance')
export class CarInsuranceController {
  constructor(private readonly carInsuranceService: CarInsuranceService) {}
}
