import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { UserModule } from 'src/user/user.module';
import { ReminderController } from './reminder.controller';
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
    CarModule,
    SendgridModule,
    UserModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository, SchedulerService],
})
export class ReminderModule {}
