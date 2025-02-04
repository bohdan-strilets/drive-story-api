import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolders } from 'src/cloudinary/helpers/cloudinary-folders';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarDto } from './dto/car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private readonly responseService: ResponseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async addCar(
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
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
  }

  private async updateCarModel(
    carId: Types.ObjectId,
    dto: any,
  ): Promise<CarDocument> {
    const updatedCar = await this.carModel.findByIdAndUpdate(carId, dto, {
      new: true,
    });

    if (!updatedCar) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }

    return updatedCar;
  }

  async updateCar(
    carId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar = await this.updateCarModel(carId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  private isValidCar(car: CarDocument): void {
    if (!car) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.CAR_NOT_FOUND);
    }
  }

  async deleteCar(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    const deletedCar = await this.carModel.findByIdAndDelete(carId);
    this.isValidCar(deletedCar);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async getById(carId: Types.ObjectId): Promise<ApiResponse<CarDocument>> {
    const car = await this.carModel.findById(carId);
    this.isValidCar(car);
    return this.responseService.createSuccessResponse(HttpStatus.OK, car);
  }

  async getAll(userId: Types.ObjectId): Promise<ApiResponse<CarDocument[]>> {
    const cars = await this.carModel.find({ owner: userId });
    return this.responseService.createSuccessResponse(HttpStatus.OK, cars);
  }

  async uploadPhoto(
    file: Express.Multer.File,
    carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar =
      await this.cloudinaryService.uploadFileAndUpdateModel<CarDocument>(file, {
        model: this.carModel,
        modelId: carId,
        folderPath: CloudinaryFolders.CAR_PHOTO,
        fieldToUpdate: 'images.resources',
      });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async deletePhoto(
    photoPublicId: string,
    carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar =
      await this.cloudinaryService.deleteFileAndUpdateModel<CarDocument>({
        model: this.carModel,
        publicId: photoPublicId,
        modelId: carId,
        fieldToUpdate: 'images.resources',
      });

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async selectMainPhoto(
    photoPublicId: string,
    carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar =
      await this.cloudinaryService.changeSelectedFileAndUpdateModel<CarDocument>(
        {
          model: this.carModel,
          publicId: photoPublicId,
          modelId: carId,
          fieldToUpdate: 'images.selected',
          resourcesPath: 'images.resources',
        },
      );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }
}
