import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { EntityType } from './enums/entity-type.enum';
import { ImageRepository } from './image.repository';
import { ImageDocument } from './schemas/image.schema';

@Injectable()
export class ImageService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly responseService: ResponseService,
    private readonly imageRepository: ImageRepository,
  ) {}

  async upload(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<ApiResponse<ImageDocument>> {
    const uploadedImageUrl = await this.imageRepository.uploadFile(
      entityId,
      entityType,
      file,
    );

    const defaultImage = this.imageRepository.getDefaultImage(entityType);
    const imageRecord = await this.imageRepository.findImage(
      userId,
      entityId,
      entityType,
    );

    const imageUrls = imageRecord
      ? [...imageRecord.resources, uploadedImageUrl]
      : [uploadedImageUrl];

    const updateData = {
      owner: userId,
      entityId,
      entityType,
      default: defaultImage,
      resources: imageUrls,
      selected: uploadedImageUrl,
    };

    const updatedRecord = await this.imageRepository.updateModel(
      imageRecord,
      updateData,
    );

    await this.imageRepository.bindImage(
      entityType,
      entityId,
      updatedRecord._id,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedRecord,
    );
  }

  async delete(
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
    const selectedUrl = imageRecord.selected;

    if (selectedUrl.includes(publicId)) {
      const defaultImage = this.imageRepository.getDefaultImage(entityType);
      await this.imageRepository.selectFile(imageRecord, defaultImage);
    }

    await this.cloudinaryService.deleteFile(publicId, FileType.IMAGE);

    const filteredImageUrls = this.imageRepository.removeByPublicId(
      imageUrls,
      publicId,
    );

    const updatedImage = await this.imageRepository.deleteFile(
      imageRecord,
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
    const selectedImage = this.imageRepository.findFileByResources(
      imageUrls,
      publicId,
    );

    const updatedImage = await this.imageRepository.selectFile(
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
    const deletedImage = await this.imageRepository.removedAllFiles(
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
