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
import { FuelingDto } from './dto/fueling.dto';
import { FuelingService } from './fueling.service';
import { FuelingDocument } from './schemas/fueling.schema';

@Auth()
@Controller('v1/fueling')
export class FuelingController {
  constructor(private readonly fuelingService: FuelingService) {}

  @Post('create/:carId')
  async create(
    @Body() dto: FuelingDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.create(userId, carId, dto);
  }

  @Patch('update/:fuelingId')
  async update(
    @Body() dto: FuelingDto,
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.update(fuelingId, userId, dto);
  }

  @Delete('delete/:fuelingId')
  async delete(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe, ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.delete(fuelingId, userId);
  }

  @Get('get-by-id/:fuelingId')
  async getById(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.getById(fuelingId, userId);
  }

  @Get('get-all/:carId')
  async getAll(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<FuelingDocument[]>> {
    return this.fuelingService.getAll(carId, userId, page, limit);
  }

  @Get('bind-contact/:fuelingId')
  async bindContact(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.bindContact(fuelingId, contactId, userId);
  }

  @Put('clear-contact/:fuelingId')
  async clearContact(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.clearContact(fuelingId, userId);
  }
}
