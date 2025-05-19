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

  @Patch('update/:carId/:inspectionId')
  async update(
    @Body() dto: InspectionDto,
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.update(inspectionId, carId, userId, dto);
  }

  @Delete('delete/:carId/:inspectionId')
  async delete(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.delete(inspectionId, carId, userId);
  }

  @Get('get-by-id/:carId/:inspectionId')
  async getById(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.getById(inspectionId, carId, userId);
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

  @Get('bind-contact/:carId/:inspectionId')
  async bindContact(
    @Param('inspectionId', ParseObjectIdPipe) inspectionId: Types.ObjectId,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('contactId', ParseObjectIdPipe) contactId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<InspectionDocument>> {
    return this.inspectionService.bindContact(
      inspectionId,
      carId,
      contactId,
      userId,
    );
  }
}
