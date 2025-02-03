import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { DEFAULT_FOLDER_FOR_FILES } from 'src/cloudinary/helpers/default-file-folder';
import { imageValidator } from 'src/cloudinary/pipes/image-validator.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { CarService } from './car.service';
import { CarDto } from './dto/car.dto';
import { ParseObjectIdPipe } from './pipes/parse-objectid.pipe';
import { CarDocument } from './schemas/car.schema';

@Auth()
@Controller('v1/car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post('add')
  async addCar(
    @Body() dto: CarDto,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.addCar(userId, dto);
  }

  @Patch('update/:carId')
  async updateCar(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.updateCar(carId, dto);
  }

  @Delete('delete/:carId')
  async deleteCar(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.deleteCar(carId);
  }

  @Get('get/:carId')
  async getById(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.getById(carId);
  }

  @Get('get-all')
  async getAll(
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument[]>> {
    return this.carService.getAll(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('upload-photo/:carId')
  @UseInterceptors(FileInterceptor('photo', { dest: DEFAULT_FOLDER_FOR_FILES }))
  async uploadAvatar(
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.uploadPhoto(file, carId);
  }

  @Delete('delete-photo/:carId')
  async deletePhoto(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('photoPublicId') photoPublicId: string,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.deletePhoto(photoPublicId, carId);
  }
}
