import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ReminderDto } from './dto/reminder.dto';
import { ReminderHelper } from './reminder.helper';
import { ReminderRepository } from './reminder.repository';
import { ReminderDocument } from './schemas/reminder.schema';

@Injectable()
export class ReminderService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly reminderRepository: ReminderRepository,
    private readonly reminderHelper: ReminderHelper,
  ) {}

  async create(
    userId: Types.ObjectId,
    dto: ReminderDto,
  ): Promise<ApiResponse<ReminderDocument>> {
    const payload = { owner: userId, ...dto };
    const reminder = await this.reminderRepository.createReminder(payload);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      reminder,
    );
  }

  async delete(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    const reminder = await this.reminderRepository.findReminderById(reminderId);

    this.reminderHelper.isValidReminder(reminder);
    checkAccess(reminder.owner, userId);

    const deletedReminder =
      await this.reminderRepository.deleteReminder(reminderId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedReminder,
    );
  }
}
