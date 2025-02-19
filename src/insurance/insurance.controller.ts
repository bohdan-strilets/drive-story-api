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
import { InsuranceDto } from './dto/insurance.dto';
import { InsuranceService } from './insurance.service';
import { InsuranceDocument } from './schemas/insurance.schema';

@Auth()
@Controller('v1/insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('create/:carId')
  async create(
    @Body() dto: InsuranceDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.create(userId, carId, dto);
  }

  @Patch('update/:carId/:insuranceId')
  async update(
    @Body() dto: InsuranceDto,
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.update(insuranceId, carId, userId, dto);
  }

  @Delete('delete/:carId/:insuranceId')
  async delete(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.delete(insuranceId, carId, userId);
  }

  @Get('get-by-id/:carId/:insuranceId')
  async getById(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.getById(insuranceId, carId, userId);
  }

  @Get('get-all/:carId')
  async getAll(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<InsuranceDocument[]>> {
    return this.insuranceService.getAll(carId, userId, page, limit);
  }

  @Get('bind-contact/:carId/:insuranceId')
  async bindContact(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.bindContact(
      insuranceId,
      carId,
      contactId,
      userId,
    );
  }
}
