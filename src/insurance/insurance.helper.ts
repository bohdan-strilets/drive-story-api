import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { checkAccess } from 'src/common/helpers/check-access.helper';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { EntityType } from 'src/image/enums/entity-type.enum';
import { ImageHelper } from 'src/image/image.helper';
import { InsuranceDocument } from './schemas/insurance.schema';

@Injectable()
export class InsuranceHelper {
  private readonly logger = new Logger(InsuranceHelper.name);

  constructor(private readonly imageHelper: ImageHelper) {}

  isValidInsurance(insurance: InsuranceDocument): void {
    if (!insurance) {
      this.logger.error(errorMessages.INSURANCE_NOT_FOUND);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.INSURANCE_NOT_FOUND,
      );
    }
  }

  checkInsuranceAccess(
    insurance: InsuranceDocument,
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): void {
    checkAccess(insurance.owner, userId);
    checkAccess(insurance.carId, carId);
  }

  async deletePhotos(
    insurance: InsuranceDocument,
    entityType: EntityType,
  ): Promise<void> {
    const photos = insurance.photos;

    if (photos) {
      await this.imageHelper.removeAllImages(
        photos._id,
        entityType,
        insurance._id,
      );
    }
  }
}
