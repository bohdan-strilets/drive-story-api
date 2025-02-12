import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
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

  @Post('add')
  async add(
    @Body() dto: ReminderDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.add(userId, dto);
  }

  @Delete('delete/:reminderId')
  async delete(
    @Param('reminderId', ParseObjectIdPipe) reminderId: Types.ObjectId,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    return this.reminderService.delete(reminderId, userId);
  }
}
