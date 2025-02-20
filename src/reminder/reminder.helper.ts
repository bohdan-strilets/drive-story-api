import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { PushHelper } from 'src/push/push.helper';
import { PushRepository } from 'src/push/push.repository';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { ReminderRepository } from './reminder.repository';
import { ReminderDocument } from './schemas/reminder.schema';

@Injectable()
export class ReminderHelper {
  private readonly logger = new Logger(ReminderHelper.name);

  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly pushRepository: PushRepository,
    private readonly sendgridService: SendgridService,
    private readonly pushHelper: PushHelper,
  ) {}

  isValidReminder(reminder: ReminderDocument) {
    if (!reminder) {
      this.logger.error(errorMessages.REMINDER_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.REMINDER_NOT_FOUND,
      );
    }
  }

  async findDueReminders(): Promise<ReminderDocument[]> {
    const now = new Date();

    const offsetInMs = 24 * 60 * 60 * 1000;
    const marginInMs = 60 * 1000;

    const startWindow = new Date(now.getTime() + offsetInMs - marginInMs);
    const endWindow = new Date(now.getTime() + offsetInMs + marginInMs);

    return await this.reminderRepository.findReminderByWindow(
      startWindow,
      endWindow,
    );
  }

  async sendNotification(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
    userEmail: string,
  ): Promise<void> {
    const reminder = await this.reminderRepository.findReminderById(reminderId);
    this.isValidReminder(reminder);

    try {
      const pushPayload = this.pushHelper.createPayload(reminder);
      const subscriptionByBd =
        await this.pushRepository.findSubscriptionByOwner(userId);
      this.pushHelper.isValidSubscription(subscriptionByBd);

      const pushSubscription =
        this.pushHelper.getSubscription(subscriptionByBd);
      await this.pushHelper.sendNotification(pushSubscription, pushPayload);
      this.logger.log(`Push notification sent for reminder ${reminder._id}`);
    } catch (error) {
      this.logger.error('Error while sending push notification', error.stack);
    }

    try {
      await this.sendgridService.sendReminderEmail(
        userEmail,
        reminder.title,
        reminder.reminderDate,
        reminder.message,
        reminder.eventUrl,
      );
      this.logger.log(
        `Email notification sent to ${userEmail} for reminder ${reminder._id}`,
      );
    } catch (error) {
      this.logger.error('Error while sending email notification', error.stack);
    }

    await this.reminderRepository.markReminderAsSent(reminder._id);
    this.logger.debug('Email notification was sent successfully.');
  }
}
