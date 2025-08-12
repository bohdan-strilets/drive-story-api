import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { ReminderDocument } from 'src/reminder/schemas/reminder.schema';
import * as webPush from 'web-push';
import { SubscriptionDocument } from './schemas/subscription.schema';
import { SubscriptionType } from './types/subscription.type';

@Injectable()
export class PushHelper {
  private readonly logger = new Logger(PushHelper.name);

  constructor(private readonly configService: ConfigService) {
    const publicKey = this.configService.get('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get('VAPID_PRIVATE_KEY');
    const contactEmail = this.configService.get('RESEND_OWNER');
    webPush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
  }

  isValidSubscription(subscription: SubscriptionDocument) {
    if (!subscription) {
      this.logger.warn(errorMessages.NOTIFICATIONS_NOT_ACCESS_RIGHTS);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.NOTIFICATIONS_NOT_ACCESS_RIGHTS,
      );
    }
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
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}
