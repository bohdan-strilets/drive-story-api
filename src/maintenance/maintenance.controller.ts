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

  @Post('add/:carId')
  async add(
    @Body() dto: MaintenanceDto,
    @User('_id') userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.add(userId, carId, dto);
  }

  @Patch('update/:carId/:maintenanceId')
  async update(
    @Body() dto: MaintenanceDto,
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.update(maintenanceId, carId, userId, dto);
  }

  @Delete('delete/:carId/:maintenanceId')
  async delete(
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.delete(maintenanceId, carId, userId);
  }

  @Get('by-id/:carId/:maintenanceId')
  async byId(
    @Param('maintenanceId', ParseObjectIdPipe) maintenanceId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.byId(maintenanceId, carId, userId);
  }
}
