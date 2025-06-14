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
import { MaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceDocument } from './schemas/maintenance.schema';

@Auth()
@Controller('v1/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('create/:carId')
  async create(
    @Body() dto: MaintenanceDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.create(userId, carId, dto);
  }

  @Patch('update/:maintenanceId')
  async update(
    @Body() dto: MaintenanceDto,
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.update(maintenanceId, userId, dto);
  }

  @Delete('delete/:maintenanceId')
  async delete(
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.delete(maintenanceId, userId);
  }

  @Get('get-by-id/:maintenanceId')
  async getById(
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.getById(maintenanceId, userId);
  }

  @Get('get-all/:carId')
  async getAll(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<MaintenanceDocument[]>> {
    return this.maintenanceService.getAll(carId, userId, page, limit);
  }

  @Get('bind-contact/:maintenanceId')
  async bindContact(
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.bindContact(
      maintenanceId,
      contactId,
      userId,
    );
  }
}
