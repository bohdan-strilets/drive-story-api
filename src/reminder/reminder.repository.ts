import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

export class ReminderRepository {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
  ) {}

  async findReminderById(
    reminderId: Types.ObjectId,
  ): Promise<ReminderDocument> {
    return this.reminderModel.findById(reminderId);
  }

  async findReminderByWindow(
    startWindow: Date,
    endWindow: Date,
  ): Promise<ReminderDocument[]> {
    return this.reminderModel.find({
      reminderDate: { $gte: startWindow, $lt: endWindow },
      isSent: false,
    });
  }

  async createReminder(dto: any): Promise<ReminderDocument> {
    return this.reminderModel.create(dto);
  }

  async deleteReminder(reminderId: Types.ObjectId) {
    return this.reminderModel.findByIdAndDelete(reminderId);
  }

  async markReminderAsSent(
    reminderId: Types.ObjectId,
  ): Promise<ReminderDocument> {
    return this.reminderModel.findByIdAndUpdate(
      reminderId,
      { isSent: true },
      { new: true },
    );
  }
}
