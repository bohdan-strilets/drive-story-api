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

  @Patch('update/:carId/:insuranceId')
  async update(
    @Body() dto: CarInsuranceDto,
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    return this.carInsuranceService.update(insuranceId, carId, userId, dto);
  }

  @Delete('delete/:carId/:insuranceId')
  async delete(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    return this.carInsuranceService.delete(insuranceId, carId, userId);
  }

  @Get('by-id/:carId/:insuranceId')
  async byId(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    return this.carInsuranceService.byId(insuranceId, carId, userId);
  }

  @Get('all/:carId')
  async all(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<CarInsuranceDocument[]>> {
    return this.carInsuranceService.all(carId, userId, page, limit);
  }

  @Get('bind-contact/:carId/:insuranceId')
  async bindContact(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<CarInsuranceDocument>> {
    return this.carInsuranceService.bindContact(
      insuranceId,
      carId,
      contactId,
      userId,
    );
  }
}
