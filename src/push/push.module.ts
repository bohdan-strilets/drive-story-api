import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseModule } from 'src/response/response.module';
import { PushController } from './push.controller';
import { PushHelper } from './push.helper';
import { PushRepository } from './push.repository';
import { PushService } from './push.service';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    ResponseModule,
  ],
  controllers: [PushController],
  providers: [PushService, PushRepository, PushHelper],
  exports: [PushRepository, PushHelper],
})
export class PushModule {}
