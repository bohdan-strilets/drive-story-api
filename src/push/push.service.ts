import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SubscriptionDto } from './dto/subscription.dto';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';

@Injectable()
export class PushService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async createOrUpdateSubscription(
    userId: Types.ObjectId,
    dto: SubscriptionDto,
  ): Promise<ApiResponse<SubscriptionDocument>> {
    const data = { owner: userId, ...dto };

    const updatedSubscription = await this.subscriptionModel.findOneAndUpdate(
      { owner: userId },
      data,
      { new: true, upsert: true },
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedSubscription,
    );
  }
}
