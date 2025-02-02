import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Post('add')
  async addCar(
    @Body() dto: CarDto,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.addCar(userId, dto);
  }

  @Patch('update/:carId')
  async updateCar(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.updateCar(carId, dto);
  }

  @Delete('delete/:carId')
  async deleteCar(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.deleteCar(carId);
  }

  @Get('get/:carId')
  async getById(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.getById(carId);
  }

  @Get('get-all')
  async getAll(
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument[]>> {
    return this.carService.getAll(userId);
  }
}
