import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
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
    private readonly carRepository: CarRepository,
  ) {}

  async add(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    dto: ReminderDto,
  ): Promise<ApiResponse<ReminderDocument>> {
    const data = { owner: userId, entityId, ...dto };
    const reminder = await this.reminderModel.create(data);

    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      reminder,
    );
  }

  async update(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: ReminderDto,
  ): Promise<ApiResponse<ReminderDocument>> {
    const reminder = await this.reminderRepository.updateReminder(
      reminderId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK, reminder);
  }

  async delete(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    await this.reminderRepository.findReminderAndCheckAccessRights(
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

  async byId(
    reminderId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument>> {
    const reminder =
      await this.reminderRepository.findReminderAndCheckAccessRights(
        reminderId,
        userId,
      );

    return this.responseService.createSuccessResponse(HttpStatus.OK, reminder);
  }

  async all(
    entityId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<ReminderDocument[]>> {
    const insurances = await this.reminderModel.find({
      entityId,
      owner: userId,
    });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      insurances,
    );
  }
}
