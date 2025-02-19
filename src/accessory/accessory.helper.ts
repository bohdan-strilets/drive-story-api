import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { AccessoryDocument } from './schemas/accessory.schema';

@Injectable()
export class AccessoryHelper {
  private readonly logger = new Logger(AccessoryHelper.name);

  constructor(private readonly imageRepository: ImageRepository) {}

  isValidAccessory(accessory: AccessoryDocument): void {
    if (!accessory) {
      this.logger.error(errorMessages.SERVICE_OR_ACCESSORY_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.SERVICE_OR_ACCESSORY_NOT_FOUND,
      );
    }
  }

  checkAccessoryAccess(
    accessory: AccessoryDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(accessory.owner, userId);
    checkAccess(accessory.carId, carId);
  }

  async deletePhotos(
    accessory: AccessoryDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = accessory.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        accessory._id,
      );
    }
  }
}
