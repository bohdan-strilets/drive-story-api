import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolders } from 'src/cloudinary/helpers/cloudinary-folders';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarRepository } from './car.repository';
import { CarDto } from './dto/car.dto';
import { Car, CarDocument } from './schemas/car.schema';

@Injectable()
export class CarService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    private readonly responseService: ResponseService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly carRepository: CarRepository,
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

  async updateCar(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CarDto,
  ): Promise<ApiResponse<CarDocument>> {
    const updatedCar = await this.carRepository.updateCarModel(
      carId,
      userId,
      dto,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedCar,
    );
  }

  async deleteCar(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCarById(carId);
    this.carRepository.checkCarByOwner(car.owner, userId);

    const deletedCar = await this.carModel.findByIdAndDelete(carId);
    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedCar,
    );
  }

  async getById(
    carId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    const car = await this.carRepository.findCarById(carId);
    this.carRepository.checkCarByOwner(car.owner, userId);
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
