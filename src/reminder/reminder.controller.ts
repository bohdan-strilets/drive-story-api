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
import { ReminderDto } from './dto/reminder.dto';
import { ReminderService } from './reminder.service';
import { ReminderDocument } from './schemas/reminder.schema';

@Auth()
@Controller('v1/reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post('add/:entityId')
  async add(
    @Body() dto: ReminderDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Param('entityId', ParseObjectIdPipe) entityId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.add(userId, entityId, dto);
  }

  @Patch('update/:reminderId')
  async update(
    @Body() dto: ReminderDto,
    @Param('reminderId', ParseObjectIdPipe) reminderId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.update(reminderId, userId, dto);
  }

  @Delete('delete/:reminderId')
  async delete(
    @Param('reminderId', ParseObjectIdPipe) reminderId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.delete(reminderId, userId);
  }

  @Get('by-id/:reminderId')
  async byId(
    @Param('reminderId', ParseObjectIdPipe) reminderId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.byId(reminderId, userId);
  }

  @Get('all/:entityId')
  async all(
    @Param('entityId', ParseObjectIdPipe) entityId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument[]>> {
    return this.reminderService.all(entityId, userId);
  }
}
