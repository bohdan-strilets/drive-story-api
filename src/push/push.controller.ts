import { Body, Controller, Post } from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { SubscriptionDto } from './dto/subscription.dto';
import { PushService } from './push.service';
import { SubscriptionDocument } from './schemas/subscription.schema';

@Auth()
@Controller('v1/push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async createOrUpdateSubscription(
    @Body() dto: SubscriptionDto,
    @User('_id', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<ApiResponse<SubscriptionDocument>> {
    return this.pushService.createOrUpdateSubscription(userId, dto);
  }
}
