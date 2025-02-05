import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseObjectIdPipe } from 'src/car/pipes/parse-objectid.pipe';
import { DEFAULT_FOLDER_FOR_FILES } from 'src/cloudinary/helpers/default-file-folder';
import { imageValidator } from 'src/cloudinary/pipes/image-validator.pipe';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { EntityType } from './enums/entity-type.enum';
import { ImageService } from './image.service';
import { ImageDocument } from './schemas/image.schema';

@Auth()
@Controller('v1/image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @HttpCode(HttpStatus.OK)
  @Post('upload/:entityId')
  @UseInterceptors(FileInterceptor('image', { dest: DEFAULT_FOLDER_FOR_FILES }))
  async upload(
    @User('_id') userId: Types.ObjectId,
    @Param('entityId', ParseObjectIdPipe) entityId: Types.ObjectId,
    @Query('entityType') entityType: EntityType,
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
  ): Promise<ApiResponse<ImageDocument>> {
    return this.imageService.upload(userId, entityId, entityType, file);
  }
}
