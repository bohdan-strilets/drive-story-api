import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

export class ReminderRepository {
  private readonly logger = new Logger(ReminderRepository.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
    private readonly carRepository: CarRepository,
    private readonly sendgridService: SendgridService,
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

  async findDueReminders(): Promise<ReminderDocument[]> {
    return this.reminderModel.find({
      reminderDate: { $lte: new Date() },
      isSent: false,
    });
  }

  async markAsSent(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.findReminderAndCheckAccessRights(reminderId, userId);
    await this.reminderModel.findByIdAndUpdate(
      reminderId,
      { isSent: true },
      { new: true },
    );
  }

  async sendNotification(
    remindId: Types.ObjectId,
    userId: Types.ObjectId,
    userEmail: string,
  ): Promise<void> {
    const reminder = await this.findReminder(remindId);

    await this.sendgridService.sendReminderEmail(
      userEmail,
      reminder.title,
      reminder.reminderDate,
      reminder.message,
      reminder.eventUrl,
    );

    await this.markAsSent(reminder._id, userId);
    this.logger.debug('Email notification was sent successfully.');
  }
}
