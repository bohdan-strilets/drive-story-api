import { Body, Controller, Param, Post } from '@nestjs/common';
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
  async addMaintenance(
    @Body() dto: MaintenanceDto,
    @User('_id') userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    return this.maintenanceService.addMaintenance(userId, carId, dto);
  }
}
