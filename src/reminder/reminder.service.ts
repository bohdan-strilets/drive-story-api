import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { ReminderDto } from './dto/reminder.dto';
import { ReminderRepository } from './reminder.repository';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

@Injectable()
export class ReminderService {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
    private readonly responseService: ResponseService,
    private readonly reminderRepository: ReminderRepository,
  ) {}

  async add(
    userId: Types.ObjectId,

    dto: ReminderDto,
  ): Promise<ApiResponse<ReminderDocument>> {
    const data = { owner: userId, ...dto };
    const reminder = await this.reminderModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      reminder,
    );
  }

  async delete(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    await this.reminderRepository.findReminderAndCheckAccess(
      reminderId,
      userId,
    );

    const deletedReminder =
      await this.reminderModel.findByIdAndDelete(reminderId);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedReminder,
    );
  }
}
