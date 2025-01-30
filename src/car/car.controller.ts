import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { CarService } from './car.service';
import { CarDto } from './dto/car.dto';
import { ParseObjectIdPipe } from './pipes/parse-objectid.pipe';
import { CarDocument } from './schemas/car.schema';

@Auth()
@Controller('v1/car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post('added')
  async addedCar(
    @Body() dto: CarDto,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.addedCar(userId, dto);
  }

  @Patch('update/:carId')
  async updateCar(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.updateCar(carId, dto);
  }
}
