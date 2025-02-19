import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { FuelingDocument } from './schemas/fueling.schema';

@Injectable()
export class FuelingHelper {
  private readonly logger = new Logger(FuelingHelper.name);

  constructor(private readonly imageRepository: ImageRepository) {}

  isValidFueling(fueling: FuelingDocument): void {
    if (!fueling) {
      this.logger.error(errorMessages.FUELING_NOT_FOUND);
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.FUELING_NOT_FOUND);
    }
  }

  checkFuelingAccess(
    fueling: FuelingDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(fueling.owner, userId);
    checkAccess(fueling.carId, carId);
  }

  async deletePhotos(
    fueling: FuelingDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = fueling.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        fueling._id,
      );
    }
  }
}
