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
import { PaginatedResponse } from 'src/pagination/types/paginated-response';
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

  @Post('create')
  async create(
    @Body() dto: CarDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.create(userId, dto);
  }

  @Patch('update/:carId')
  async update(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.update(carId, userId, dto);
  }

  @Delete('delete/:carId')
  async delete(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.delete(carId, userId);
  }

  @Get('get-by-id/:carId')
  async getById(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.getById(carId, userId);
  }

  @Get('get-all')
  async getAll(
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<PaginatedResponse<CarDocument>>> {
    return this.carService.getAll(userId, page, limit);
  }
}
