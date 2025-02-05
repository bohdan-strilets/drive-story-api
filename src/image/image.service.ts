import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { EntityType } from './enums/entity-type.enum';
import { Image, ImageDocument } from './schemas/image.schema';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly responseService: ResponseService,
  ) {}

  private async uploadFile(
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<string> {
    const filePath = `drive-story/${entityType}/${entityId}`;
    return await this.cloudinaryService.uploadFile(
      file,
      FileType.IMAGE,
      filePath,
    );
  }

  private getDefaultImage(entityType: EntityType): string {
    let defaultImage: string = '';

    switch (entityType) {
      case EntityType.AVATARS:
        defaultImage = defaultImages.USER_AVATAR;
        break;

      case EntityType.POSTERS:
        defaultImage = defaultImages.USER_POSTER;
        break;

      case EntityType.CARS:
        defaultImage = defaultImages.CAR_POSTER;
        break;

      default:
        defaultImage = defaultImages.NOT_IMAGE;
        break;
    }

    return defaultImage;
  }

  private async findImage(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
  ): Promise<ImageDocument> {
    return await this.imageModel.findOne({
      owner: userId,
      entityId,
      entityType,
    });
  }

  private async updateModel(
    image: ImageDocument,
    dto: any,
  ): Promise<ImageDocument> {
    let result: ImageDocument;
    if (image) {
      const params = { new: true };
      result = await this.imageModel.findByIdAndUpdate(image._id, dto, params);
    } else {
      result = await this.imageModel.create(dto);
    }
    return result;
  }

  async upload(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<ApiResponse<ImageDocument>> {
    const uploadedImageUrl = await this.uploadFile(entityId, entityType, file);
    const defaultImage = this.getDefaultImage(entityType);

    const image = await this.findImage(userId, entityId, entityType);

    const resources = image
      ? [...image.resources, uploadedImageUrl]
      : [uploadedImageUrl];

    const dto = {
      owner: userId,
      entityId,
      entityType,
      default: defaultImage,
      resources,
      selected: defaultImage,
    };

    const result = await this.updateModel(image, dto);
    return this.responseService.createSuccessResponse(HttpStatus.OK, result);
  }
}
