import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  async add(
    @Body() dto: CarDto,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.add(userId, dto);
  }

  @Patch('update/:carId')
  async update(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.update(carId, userId, dto);
  }

  @Delete('delete/:carId')
  async delete(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.delete(carId, userId);
  }

  @Get('by-id/:carId')
  async byId(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.byId(carId, userId);
  }

  @Get('all')
  async all(
    @User('_id') userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<CarDocument[]>> {
    return this.carService.all(userId, page, limit);
  }
}
