import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

export class ReminderRepository {
  private readonly logger = new Logger(ReminderRepository.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
    private readonly carRepository: CarRepository,
  ) {}

  async findReminder(reminderId: Types.ObjectId): Promise<ReminderDocument> {
    const reminder = await this.reminderModel.findById(reminderId);

    if (!reminder) {
      this.logger.error(errorMessages.REMINDER_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.REMINDER_NOT_FOUND,
      );
    }

    return reminder;
  }

  async findReminderAndCheckAccessRights(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ReminderDocument> {
    const reminder = await this.findReminder(reminderId);
    this.carRepository.checkAccessRights(reminder.owner, userId);
    return reminder;
  }

  async updateReminder(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: any,
  ): Promise<ReminderDocument> {
    await this.findReminderAndCheckAccessRights(reminderId, userId);
    return await this.reminderModel.findByIdAndUpdate(reminderId, dto, {
      new: true,
    });
  }

  async markAsSent(
    remindId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.findReminderAndCheckAccessRights(remindId, userId);

    const data = { isSent: true };
    await this.updateReminder(remindId, userId, data);
  }
}
