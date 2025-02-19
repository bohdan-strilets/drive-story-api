import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushModule } from 'src/push/push.module';
import { ResponseModule } from 'src/response/response.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { UserModule } from 'src/user/user.module';
import { ReminderController } from './reminder.controller';
import { ReminderHelper } from './reminder.helper';
import { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';
import { SchedulerService } from './scheduler.service';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
    ResponseModule,
    SendgridModule,
    UserModule,
    PushModule,
  ],
  controllers: [ReminderController],
  providers: [
    ReminderService,
    ReminderRepository,
    SchedulerService,
    ReminderHelper,
  ],
})
export class ReminderModule {}
