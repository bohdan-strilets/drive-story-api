import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SubscriptionDto } from './dto/subscription.dto';
import { PushRepository } from './push.repository';
import { SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class PushService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly pushRepository: PushRepository,
  ) {}

  async createOrUpdateSubscription(
    userId: Types.ObjectId,
    dto: SubscriptionDto,
  ): Promise<ApiResponse<SubscriptionDocument>> {
    const payload = { owner: userId, ...dto };

    const updatedSubscription = await this.pushRepository.updateSubscription(
      userId,
      payload,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedSubscription,
    );
  }
}
