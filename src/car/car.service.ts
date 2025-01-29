import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { defaultImages } from 'src/helpers/default-images';
import { errorMessages } from 'src/helpers/error-messages';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CreateCarDto } from './dto/create-car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private readonly responseService: ResponseService,
  ) {}

  private isValidDto(dto: any): ApiResponse | void {
    if (!dto) {
      return this.responseService.createErrorResponse(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_DATA_FORMAT,
      );
    }
  }

  async addedCar(
    userId: string,
    dto: CreateCarDto,
  ): Promise<ApiResponse<CarDocument>> {
    try {
      this.isValidDto(dto);

      const data = {
        owner: userId,
        images: {
          default: defaultImages.CAR_POSTER,
          selected: defaultImages.CAR_POSTER,
        },
        ...dto,
      };

      const newCar = await this.carModel.create(data);
      return this.responseService.createSuccessResponse(
        HttpStatus.CREATED,
        newCar,
      );
    } catch (error) {
      console.error('Error creating new car:', error);
      return this.responseService.createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ERROR_OCCURRED,
      );
    }
  }
}
