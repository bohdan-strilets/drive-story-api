import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/user/user.repository';
import { ReminderHelper } from './reminder.helper';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly reminderHelper: ReminderHelper,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const reminders = await this.reminderHelper.findDueReminders();

    await Promise.all(
      reminders.map(async (reminder) => {
        const user = await this.userRepository.findById(reminder.owner);
        const email = user.email;

        await this.reminderHelper.sendNotification(
          reminder._id,
          reminder.owner,
          email,
        );
      }),
    );
  }
}
