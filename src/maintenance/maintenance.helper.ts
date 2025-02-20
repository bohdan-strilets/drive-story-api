import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageHelper } from 'src/image/image.helper';
import { MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceHelper {
  private readonly logger = new Logger(MaintenanceHelper.name);

  constructor(private readonly imageHelper: ImageHelper) {}

  isValidMaintenance(maintenance: MaintenanceDocument): void {
    if (!maintenance) {
      this.logger.error(errorMessages.MAINTENANCE_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.MAINTENANCE_NOT_FOUND,
      );
    }
  }

  checkMaintenanceAccess(
    maintenance: MaintenanceDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(maintenance.owner, userId);
    checkAccess(maintenance.carId, carId);
  }

  async deletePhotos(
    maintenance: MaintenanceDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = maintenance.photos;

    if (photos) {
      await this.imageHelper.removeAllImages(
        photos._id,
        entityType,
        maintenance._id,
      );
    }
  }
}
