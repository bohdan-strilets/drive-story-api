import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { AccessoryRepository } from 'src/accessory/accessory.repository';
import { CarRepository } from 'src/car/car.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileType } from 'src/cloudinary/enums/file-type.enum';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { ContactRepository } from 'src/contact/contact.repository';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { FuelingRepository } from 'src/fueling/fueling.repository';
import { InspectionRepository } from 'src/inspection/inspection.repository';
import { InsuranceRepository } from 'src/insurance/insurance.repository';
import { MaintenanceRepository } from 'src/maintenance/maintenance.repository';
import { UserRepository } from 'src/user/user.repository';
import { EntityType } from './enums/entity-type.enum';
import { ImageRepository } from './image.repository';
import { ImageDocument } from './schemas/image.schema';
import { Payload } from './types/payload.type';

@Injectable()
export class ImageHelper {
  private readonly logger = new Logger(ImageHelper.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly carRepository: CarRepository,
    private readonly userRepository: UserRepository,
    private readonly fuelingRepository: FuelingRepository,
    private readonly accessoryRepository: AccessoryRepository,
    private readonly contactRepository: ContactRepository,
    private readonly insuranceRepository: InsuranceRepository,
    private readonly inspectionRepository: InspectionRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  async uploadImage(
    entityId: Types.ObjectId,
    entityType: EntityType,
    file: Express.Multer.File,
  ): Promise<string> {
    const filePath = `drive-story/${entityType}/${entityId}`;
    const url = await this.cloudinaryService.uploadFile(
      file,
      FileType.IMAGE,
      filePath,
    );

    this.logger.log(`Image uploaded successfully: ${url}`);
    return url;
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

    this.logger.log(`Default image for ${entityType}: ${defaultImage}`);
    return defaultImage;
  }

  async setImage(
    entityType: EntityType,
    entityId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<void> {
    this.logger.log(
      `Setting image for ${entityType} with id ${entityId} to ${data}`,
    );
    switch (entityType) {
      case EntityType.AVATARS:
        await this.userRepository.setImage(entityId, data, 'avatars');
        break;

      case EntityType.POSTERS:
        await this.userRepository.setImage(entityId, data, 'posters');
        break;

      case EntityType.CARS:
        await this.carRepository.setImage(entityId, data);
        break;

      case EntityType.MAINTENANCE:
        await this.maintenanceRepository.setImage(entityId, data);
        break;

      case EntityType.FUELING:
        await this.fuelingRepository.setImage(entityId, data);
        break;

      case EntityType.ACCESSORY:
        await this.accessoryRepository.setImage(entityId, data);
        break;

      case EntityType.CONTACTS:
        await this.contactRepository.setImage(entityId, data);
        break;

      case EntityType.INSURANCE:
        await this.insuranceRepository.setImage(entityId, data);
        break;

      case EntityType.INSPECTION:
        await this.inspectionRepository.setImage(entityId, data);
        break;

      default:
        throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.NOT_FOUND);
    }
    this.logger.log(
      `Image set successfully for ${entityType} with id ${entityId}`,
    );
  }

  removeImageByPublicId(imageUrls: string[] = [], publicId: string): string[] {
    this.logger.log(`Removing image with publicId ${publicId} from URLs`);
    const result = imageUrls.filter((item: string) => !item.includes(publicId));
    return [...result];
  }

  findImageByResources(imageUrls: string[] = [], publicId: string): string {
    const imageUrl = imageUrls.find((item) => item.includes(publicId));

    if (!imageUrl) {
      this.logger.error(errorMessages.FILE_NOT_EXIST);
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.FILE_NOT_EXIST);
    }

    this.logger.log(`Found image: ${imageUrl}`);
    return imageUrl;
  }

  async removeImagesAndFolder(imageUrls: string[]) {
    if (imageUrls.length > 0) {
      const folderPath = this.cloudinaryService.getFolderPath(imageUrls[0]);
      await this.cloudinaryService.deleteFilesAndFolder(folderPath);
      this.logger.log(
        `Images and folder at path ${folderPath} removed successfully`,
      );
    } else {
      this.logger.error(errorMessages.NO_FILES_TO_DELETE);
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.NO_FILES_TO_DELETE,
      );
    }
  }

  async updateModel(
    imageRecord: ImageDocument,
    payload: Payload,
  ): Promise<ImageDocument> {
    let image: ImageDocument;

    if (imageRecord) {
      image = await this.imageRepository.updateImage(imageRecord._id, payload);
      this.logger.log(`Image record ${imageRecord._id} updated successfully`);
    } else {
      image = await this.imageRepository.createImage(payload);
      this.logger.log(`New image record created with id ${image._id}`);
    }

    return image;
  }

  async deleteImage(
    imageRecord: ImageDocument,
    updateData: string[],
    entityId: Types.ObjectId,
    entityType: EntityType,
  ) {
    const payload = { $set: { resources: updateData } };
    const updatedImage = await this.imageRepository.updateImage(
      imageRecord._id,
      payload,
    );

    if (updateData.length === 0) {
      await this.imageRepository.deleteImage(imageRecord._id);
      await this.setImage(entityType, entityId, null);
      this.logger.log(
        `Entity ${entityType} with id ${entityId} image reset to null`,
      );
    }

    return updatedImage;
  }

  async selectImage(imageRecord: ImageDocument, updateData: string) {
    const payload = { $set: { selected: updateData } };
    const updatedImage = await this.imageRepository.updateImage(
      imageRecord._id,
      payload,
    );

    this.logger.log(
      `Image record ${imageRecord._id} updated with selected image ${updateData}`,
    );

    return updatedImage;
  }

  async removeAllImages(
    imageId: Types.ObjectId,
    entityType: EntityType,
    entityId: Types.ObjectId,
  ) {
    const image = await this.imageRepository.findImageById(imageId);

    if (!imageId) {
      this.logger.error(errorMessages.NO_IMAGES_TO_DELETE);
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.NO_IMAGES_TO_DELETE,
      );
    }

    await this.removeImagesAndFolder(image.resources);
    await this.setImage(entityType, entityId, null);

    const deletedImage = await this.imageRepository.deleteImage(imageId);

    this.logger.log(`Image record ${imageId} deleted successfully`);

    return deletedImage;
  }
}
