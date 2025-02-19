import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageRepository } from 'src/image/image.repository';
import { InspectionDocument } from './schemas/inspection.schema';

@Injectable()
export class InspectionHelper {
  private readonly logger = new Logger(InspectionHelper.name);

  constructor(private readonly imageRepository: ImageRepository) {}

  isValidInspection(inspection: InspectionDocument): void {
    if (!inspection) {
      this.logger.error(errorMessages.INSPECTION_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSPECTION_NOT_FOUND,
      );
    }
  }

  checkInspectionAccess(
    inspection: InspectionDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(inspection.owner, userId);
    checkAccess(inspection.carId, carId);
  }

  async deletePhotos(
    inspection: InspectionDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = inspection.photos;

    if (photos) {
      await this.imageRepository.removedAllFiles(
        photos._id,
        entityType,
        inspection._id,
      );
    }
  }
}
