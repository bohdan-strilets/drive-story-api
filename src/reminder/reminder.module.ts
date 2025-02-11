import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarModule } from 'src/car/car.module';
import { ResponseModule } from 'src/response/response.module';
import { ReminderController } from './reminder.controller';
import { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
    ResponseModule,
    CarModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository],
})
export class ReminderModule {}
