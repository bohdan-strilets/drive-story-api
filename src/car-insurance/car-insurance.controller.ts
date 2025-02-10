import { Body, Controller, Param, Post } from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { CarInsuranceService } from './car-insurance.service';
import { CarInsuranceDto } from './dto/car-insurance.dto';
import { CarInsuranceDocument } from './schemas/car-insurance.schema';

@Auth()
@Controller('v1/car-insurance')
export class CarInsuranceController {
  constructor(private readonly carInsuranceService: CarInsuranceService) {}

  @Post('add/:carId')
  async add(
    @Body() dto: CarInsuranceDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    return this.carInsuranceService.add(userId, carId, dto);
  }
}
