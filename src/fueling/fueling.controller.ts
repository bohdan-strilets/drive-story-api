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
import { FuelingDto } from './dto/fueling.dto';
import { FuelingService } from './fueling.service';
import { FuelingDocument } from './schemas/fueling.schema';

@Auth()
@Controller('v1/fueling')
export class FuelingController {
  constructor(private readonly fuelingService: FuelingService) {}

  @Post('add/:carId')
  async add(
    @Body() dto: FuelingDto,
    @User('_id') userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.add(userId, carId, dto);
  }

  @Patch('update/:carId/:fuelingId')
  async update(
    @Body() dto: FuelingDto,
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.update(fuelingId, carId, userId, dto);
  }

  @Delete('delete/:carId/:fuelingId')
  async delete(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.delete(fuelingId, carId, userId);
  }

  @Get('by-id/:carId/:fuelingId')
  async byId(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.byId(fuelingId, carId, userId);
  }

  @Get('all/:carId')
  async all(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<FuelingDocument[]>> {
    return this.fuelingService.all(carId, userId, page, limit);
  }

  @Get('bind-contact/:carId/:fuelingId')
  async bindContact(
    @Param('fuelingId', ParseObjectIdPipe) fuelingId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<FuelingDocument>> {
    return this.fuelingService.bindContact(fuelingId, carId, contactId, userId);
  }
}
