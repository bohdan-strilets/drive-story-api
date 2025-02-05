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
  async add(
    @Body() dto: CarDto,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.add(userId, dto);
  }

  @Patch('update/:carId')
  async update(
    @Body() dto: CarDto,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.update(carId, userId, dto);
  }

  @Delete('delete/:carId')
  async delete(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.delete(carId, userId);
  }

  @Get('by-id/:carId')
  async byId(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.byId(carId, userId);
  }

  @Get('all')
  async all(
    @User('_id') userId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument[]>> {
    return this.carService.all(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('upload-image/:carId')
  @UseInterceptors(FileInterceptor('photo', { dest: DEFAULT_FOLDER_FOR_FILES }))
  async uploadImage(
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.uploadImage(file, carId);
  }

  @Delete('delete-image/:carId')
  async deleteImage(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('photoPublicId') photoPublicId: string,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.deleteImage(photoPublicId, carId);
  }

  @Patch('select-image/:carId')
  async selectImage(
    @Param('carId', ParseObjectIdPipe) carId: Types.ObjectId,
    @Query('photoPublicId') photoPublicId: string,
  ): Promise<ApiResponse<CarDocument>> {
    return this.carService.selectImage(photoPublicId, carId);
  }
}
