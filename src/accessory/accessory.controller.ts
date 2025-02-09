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

  @Delete('delete/:carId/:accessoryId')
  async delete(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.delete(accessoryId, carId, userId);
  }

  @Get('by-id/:carId/:accessoryId')
  async byId(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.byId(accessoryId, carId, userId);
  }

  @Get('all/:carId')
  async all(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<AccessoryDocument[]>> {
    return this.accessoryService.all(carId, userId, page, limit);
  }

  @Get('bind-contact/:carId/:accessoryId')
  async bindContact(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.bindContact(
      accessoryId,
      carId,
      contactId,
      userId,
    );
  }
}
