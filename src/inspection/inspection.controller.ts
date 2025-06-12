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
import { InspectionDto } from './dto/inspection.dto';
import { InspectionService } from './inspection.service';
import { InspectionDocument } from './schemas/inspection.schema';

@Auth()
@Controller('v1/inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post('create/:carId')
  async create(
    @Body() dto: InspectionDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.create(userId, carId, dto);
  }

  @Patch('update/:inspectionId')
  async update(
    @Body() dto: InspectionDto,
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.update(inspectionId, userId, dto);
  }

  @Delete('delete/:inspectionId')
  async delete(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.delete(inspectionId, userId);
  }

  @Get('get-by-id/:inspectionId')
  async getById(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.getById(inspectionId, userId);
  }

  @Get('get-all/:carId')
  async getAll(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<InspectionDocument[]>> {
    return this.inspectionService.getAll(carId, userId, page, limit);
  }

  @Put('bind-contact/:inspectionId')
  async bindContact(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId?: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.bindContact(inspectionId, userId, contactId);
  }

  @Put('clear-contact/:inspectionId')
  async clearContact(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.clearContact(inspectionId, userId);
  }
}
