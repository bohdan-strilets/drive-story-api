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

  @Post('create/:carId')
  async create(
    @Body() dto: AccessoryDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.create(userId, carId, dto);
  }

  @Patch('update/:accessoryId')
  async update(
    @Body() dto: AccessoryDto,
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.update(accessoryId, userId, dto);
  }

  @Delete('delete/:accessoryId')
  async delete(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.delete(accessoryId, userId);
  }

  @Get('get-by-id/:accessoryId')
  async getById(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.getById(accessoryId, userId);
  }

  @Get('get-all/:carId')
  async getAll(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<AccessoryDocument[]>> {
    return this.accessoryService.getAll(carId, userId, page, limit);
  }

  @Get('bind-contact/:accessoryId')
  async bindContact(
    @Param('accessoryId', ParseObjectIdPipe) accessoryId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<AccessoryDocument>> {
    return this.accessoryService.bindContact(accessoryId, contactId, userId);
  }
}
