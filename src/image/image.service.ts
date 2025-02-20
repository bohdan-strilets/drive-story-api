import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { EntityType } from './enums/entity-type.enum';
import { ImageHelper } from './image.helper';
import { ImageRepository } from './image.repository';
import { ImageDocument } from './schemas/image.schema';

@Injectable()
export class ImageService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly responseService: ResponseService,
    private readonly imageRepository: ImageRepository,
    private readonly imageHelper: ImageHelper,
  ) {}

  async upload(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<ApiResponse<ImageDocument>> {
    const uploadedImageUrl = await this.imageHelper.uploadImage(
      entityId,
      entityType,
      file,
    );

    const defaultImage = this.imageHelper.getDefaultImage(entityType);
    const image = await this.imageRepository.findImage(
      userId,
      entityId,
      entityType,
    );

    const imageUrls = image
      ? [...image.resources, uploadedImageUrl]
      : [uploadedImageUrl];

    const payload = {
      owner: userId,
      entityId,
      entityType,
      default: defaultImage,
      resources: imageUrls,
      selected: uploadedImageUrl,
    };

    const updatedImage = await this.imageHelper.updateModel(image, payload);
    await this.imageHelper.setImage(entityType, entityId, updatedImage._id);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedImage,
    );
  }

  async delete(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    publicId: string,
  ): Promise<ApiResponse<ImageDocument>> {
    const image = await this.imageRepository.findImage(
      userId,
      entityId,
      entityType,
    );

    const imageUrls = image.resources;
    const selectedUrl = image.selected;

    if (selectedUrl.includes(publicId)) {
      const defaultImage = this.imageHelper.getDefaultImage(entityType);
      await this.imageHelper.selectImage(image, defaultImage);
    }

    await this.cloudinaryService.deleteFile(publicId, FileType.IMAGE);

    const filteredImageUrls = this.imageHelper.removeImageByPublicId(
      imageUrls,
      publicId,
    );

    const updatedImage = await this.imageHelper.deleteImage(
      image,
      filteredImageUrls,
      entityId,
      entityType,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedImage,
    );
  }

  async select(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    publicId: string,
  ): Promise<ApiResponse<ImageDocument>> {
    const imageRecord = await this.imageRepository.findImage(
      userId,
      entityId,
      entityType,
    );

    const imageUrls = imageRecord.resources;
    const selectedImage = this.imageHelper.findImageByResources(
      imageUrls,
      publicId,
    );

    const updatedImage = await this.imageHelper.selectImage(
      imageRecord,
      selectedImage,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedImage,
    );
  }

  async deleteAll(
    entityId: Types.ObjectId,
    entityType: EntityType,
    imageId: Types.ObjectId,
  ): Promise<ApiResponse<ImageDocument>> {
    const deletedImage = await this.imageHelper.removeAllImages(
      imageId,
      entityType,
      entityId,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedImage,
    );
  }
}
