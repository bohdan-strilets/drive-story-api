import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { InsuranceDto } from './dto/insurance.dto';
import { PaidStatusDto } from './dto/paid-status.dto';
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

  @Patch('update/:insuranceId')
  async update(
    @Body() dto: InsuranceDto,
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.update(insuranceId, userId, dto);
  }

  @Patch('update-paid-status/:insuranceId')
  async updatePaidStatus(
    @Body() dto: PaidStatusDto,
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.updatePaidStatus(insuranceId, userId, dto);
  }

  @Delete('delete/:insuranceId')
  async delete(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.delete(insuranceId, userId);
  }

  @Get('get-by-id/:insuranceId')
  async getById(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.getById(insuranceId, userId);
  }

  @Put('bind-contact/:insuranceId')
  async bindContact(
    @Param('insuranceId', ParseObjectIdPipe) insuranceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId?: Types.ObjectId,
  ): Promise<ApiResponse<InsuranceDocument>> {
    return this.insuranceService.bindContact(insuranceId, userId, contactId);
  }
}
