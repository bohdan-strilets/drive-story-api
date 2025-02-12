import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from 'src/user/user.repository';
import { ReminderRepository } from './reminder.repository';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const reminders = await this.reminderRepository.findDueReminders();

    for (const reminder of reminders) {
      const user = await this.userRepository.findById(reminder.owner);
      const email = user.email;

      await this.reminderRepository.sendNotification(
        reminder._id,
        reminder.owner,
        email,
      );
    }
  }
}
