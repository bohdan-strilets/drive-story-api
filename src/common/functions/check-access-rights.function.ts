import { HttpStatus, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';

const logger = new Logger('AccessRights');

export const checkAccessRights = (
  expectedId: Types.ObjectId,
  providedId: Types.ObjectId,
): void => {
  if (!expectedId.equals(providedId)) {
    logger.error(errorMessages.NO_ACCESS);
    throw new AppError(HttpStatus.FORBIDDEN, errorMessages.NO_ACCESS);
  }
};
