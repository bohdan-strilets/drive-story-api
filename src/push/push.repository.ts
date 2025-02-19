import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';

export class PushRepository {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async findSubscriptionByOwner(
    userId: Types.ObjectId,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findOne({ owner: userId });
  }

  async updateSubscription(
    userId: Types.ObjectId,
    dto: any,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findOneAndUpdate({ owner: userId }, dto, {
      new: true,
      upsert: true,
    });
  }
}
