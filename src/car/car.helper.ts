import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { CarDocument } from './schemas/car.schema';

@Injectable()
export class CarHelper {
  isValidCar(car: CarDocument): void {
    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }
  }
}
