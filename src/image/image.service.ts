import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages';
import { MaintenanceRepository } from 'src/maintenance/maintenance.repository';
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
    private readonly maintenanceRepository: MaintenanceRepository,
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
    imageRecord: ImageDocument,
    updateData: any,
  ): Promise<ImageDocument> {
    let updatedRecord: ImageDocument;

    if (imageRecord) {
      updatedRecord = await this.imageModel.findByIdAndUpdate(
        imageRecord._id,
        updateData,
        {
          new: true,
        },
      );
    } else {
      updatedRecord = await this.imageModel.create(updateData);
    }

    return updatedRecord;
  }

  private async updateImage(
    entityType: EntityType,
    entityId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<void> {
    switch (entityType) {
      case EntityType.AVATARS:
        console.log('Bind image for user avatar');
        break;

      case EntityType.POSTERS:
        console.log('Bind image for user poster');
        break;

      case EntityType.CARS:
        console.log('Bind image for car');
        break;

      case EntityType.MAINTENANCE:
        await this.maintenanceRepository.updateImage(entityId, data);
        break;

      default:
        console.log('No such entity was found.');
        break;
    }
  }

  async upload(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<ApiResponse<ImageDocument>> {
    const uploadedImageUrl = await this.uploadFile(entityId, entityType, file);
    const defaultImage = this.getDefaultImage(entityType);

    const imageRecord = await this.findImage(userId, entityId, entityType);

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

    const updatedRecord = await this.updateModel(imageRecord, updateData);
    await this.updateImage(entityType, entityId, updatedRecord._id);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedRecord,
    );
  }

  private removeByPublicId(
    imageUrls: string[] = [],
    publicId: string,
  ): string[] {
    return imageUrls.filter((item: string) => !item.includes(publicId));
  }

  private async deleteFile(
    imageRecord: ImageDocument,
    updateData: string[],
    entityId: Types.ObjectId,
    entityType: EntityType,
  ) {
    const updatedImage = await this.imageModel.findByIdAndUpdate(
      imageRecord._id,
      { $set: { resources: updateData } },
      { new: true },
    );

    if (updateData.length === 0) {
      await this.imageModel.findByIdAndDelete(imageRecord._id);
      await this.updateImage(entityType, entityId, null);
    }

    return updatedImage;
  }

  async delete(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    publicId: string,
  ): Promise<ApiResponse<ImageDocument>> {
    const imageRecord = await this.findImage(userId, entityId, entityType);
    const imageUrls = imageRecord.resources;
    const selectedUrl = imageRecord.selected;

    if (selectedUrl.includes(publicId)) {
      const defaultImage = this.getDefaultImage(entityType);
      await this.selectFile(imageRecord, defaultImage);
    }

    await this.cloudinaryService.deleteFile(publicId, FileType.IMAGE);

    const filteredImageUrls = this.removeByPublicId(imageUrls, publicId);
    const updatedImage = await this.deleteFile(
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

  private findFileByResources(
    imageUrls: string[] = [],
    publicId: string,
  ): string {
    const imageUrl = imageUrls.find((item) => item.includes(publicId));

    if (!imageUrl) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.FILE_NON_EXISTENT,
      );
    }

    return imageUrl;
  }

  private async selectFile(imageRecord: ImageDocument, updateData: string) {
    return await this.imageModel.findByIdAndUpdate(
      imageRecord._id,
      { $set: { selected: updateData } },
      { new: true },
    );
  }

  async select(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
    publicId: string,
  ): Promise<ApiResponse<ImageDocument>> {
    const imageRecord = await this.findImage(userId, entityId, entityType);
    const imageUrls = imageRecord.resources;

    const selectedImage = this.findFileByResources(imageUrls, publicId);
    const updatedImage = await this.selectFile(imageRecord, selectedImage);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedImage,
    );
  }

  private async removedFilesAndFolder(imageUrls: string[]) {
    if (imageUrls.length > 0) {
      const folderPath = this.cloudinaryService.getFolderPath(imageUrls[0]);
      await this.cloudinaryService.deleteFilesAndFolder(folderPath);
    } else {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.NOT_FILES_TO_DELETE,
      );
    }
  }

  async deleteAll(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entityType: EntityType,
  ): Promise<ApiResponse<ImageDocument>> {
    const imageRecord = await this.findImage(userId, entityId, entityType);
    await this.removedFilesAndFolder(imageRecord.resources);
    await this.updateImage(entityType, entityId, null);
    const deletedImage = await this.imageModel.findByIdAndDelete(
      imageRecord._id,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      deletedImage,
    );
  }
}
