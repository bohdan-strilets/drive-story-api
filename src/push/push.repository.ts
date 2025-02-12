import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ReminderDocument } from 'src/reminder/schemas/reminder.schema';
import * as webPush from 'web-push';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';
import { SubscriptionType } from './types/subscription.type';

export class PushRepository {
  private readonly logger = new Logger(PushRepository.name);

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get('VAPID_PRIVATE_KEY');
    const contactEmail = this.configService.get('SENDGRID_OWNER');

    webPush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
  }

  async findSubscription(
    userId: Types.ObjectId,
  ): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel.findOne({
      owner: userId,
    });

    if (!subscription) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.NOTIFICATIONS_NOT_ACCESS_RIGHTS,
      );
    }

    return subscription;
  }

  getSubscription(subscription: SubscriptionDocument): SubscriptionType {
    return {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };
  }

  createPayload(reminder: ReminderDocument): string {
    const payload = {
      title: reminder.title,
      reminderDate: reminder.reminderDate,
      message: reminder.message || '',
    };

    return JSON.stringify(payload);
  }

  async sendNotification(
    subscription: SubscriptionType,
    payload: string,
  ): Promise<webPush.SendResult> {
    try {
      const response = await webPush.sendNotification(subscription, payload);
      this.logger.log(`Notification sent: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending notification', error.stack);
      throw error;
    }
  }
}
