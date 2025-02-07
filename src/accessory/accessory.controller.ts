import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { AccessoryService } from './accessory.service';
import { AccessoryDto } from './dto/accessory.dto';
import { AccessoryDocument } from './schemas/accessory.schema';

@Auth()
@Controller('v1/accessory')
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  @Post('add/:carId')
  async add(
    @Body() dto: AccessoryDto,
    @User('_id') userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.add(userId, carId, dto);
  }

  @Patch('update/:carId/:accessoryId')
  async update(
    @Body() dto: AccessoryDto,
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.update(accessoryId, carId, userId, dto);
  }
}
