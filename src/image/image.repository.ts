import { HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CarRepository } from 'src/car/car.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { FuelingRepository } from 'src/fueling/fueling.repository';
import { MaintenanceRepository } from 'src/maintenance/maintenance.repository';
import { UserRepository } from 'src/user/user.repository';
import { EntityType } from './enums/entity-type.enum';
import { Image, ImageDocument } from './schemas/image.schema';
import { UpdateType } from './types/update-data.type';

export class ImageRepository {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly carRepository: CarRepository,
    private readonly userRepository: UserRepository,
    private readonly fuelingRepository: FuelingRepository,
  ) {}

  async uploadFile(
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

  getDefaultImage(entityType: EntityType): string {
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

  async findImage(
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

  async updateModel(
    imageRecord: ImageDocument,
    updateData: UpdateType,
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

  async bindImage(
    entityType: EntityType,
    entityId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<void> {
    switch (entityType) {
      case EntityType.AVATARS:
        await this.userRepository.bindImage(entityId, data, 'avatars');
        break;

      case EntityType.POSTERS:
        await this.userRepository.bindImage(entityId, data, 'posters');
        break;

      case EntityType.CARS:
        await this.carRepository.bindImage(entityId, data);
        break;

      case EntityType.MAINTENANCE:
        await this.maintenanceRepository.bindImage(entityId, data);
        break;

      case EntityType.FUELING:
        await this.fuelingRepository.bindImage(entityId, data);
        break;

      default:
        throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.NOT_FOUND);
    }
  }

  removeByPublicId(imageUrls: string[] = [], publicId: string): string[] {
    const result = imageUrls.filter((item: string) => !item.includes(publicId));
    return [...result];
  }

  async deleteFile(
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
      await this.bindImage(entityType, entityId, null);
    }

    return updatedImage;
  }

  findFileByResources(imageUrls: string[] = [], publicId: string): string {
    const imageUrl = imageUrls.find((item) => item.includes(publicId));

    if (!imageUrl) {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.FILE_NOT_EXIST);
    }

    return imageUrl;
  }

  async selectFile(imageRecord: ImageDocument, updateData: string) {
    return await this.imageModel.findByIdAndUpdate(
      imageRecord._id,
      { $set: { selected: updateData } },
      { new: true },
    );
  }

  async removedFilesAndFolder(imageUrls: string[]) {
    if (imageUrls.length > 0) {
      const folderPath = this.cloudinaryService.getFolderPath(imageUrls[0]);
      await this.cloudinaryService.deleteFilesAndFolder(folderPath);
    } else {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.NO_FILES_TO_DELETE,
      );
    }
  }
}
