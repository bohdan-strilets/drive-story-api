import { HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as fs from 'fs';
import { Document, Types } from 'mongoose';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { UserDocument } from 'src/user/schemes/user.schema';
import { UserInfo } from 'src/user/types/user-info';
import { FileType } from './enums/file-type.enum';
import { DeleteOptions } from './types/delete-options.type';
import { UploadOptions } from './types/upload-options.type';

@Injectable()
export class CloudinaryService {
  private cloudinary = v2;

  constructor(private readonly responseService: ResponseService) {
    this.cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    fileType: FileType,
    folderPath: string,
  ): Promise<string | null> {
    const uploadOptions = { folder: folderPath, resource_type: fileType };

    try {
      const uploadResult = await this.cloudinary.uploader.upload(
        file.path,
        uploadOptions,
      );

      return uploadResult.secure_url;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      return null;
    }
  }

  getFolderPath(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Invalid URL provided');
    }

    const segments = url.split('/');

    if (segments.length < 8) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'URL does not contain enough segments to extract folder path',
      );
    }

    const folderSegments = segments.slice(7, segments.length - 1);
    return folderSegments.join('/');
  }

  async deleteFile(publicId: string, fileType: FileType): Promise<void> {
    const deleteOptions = { resource_type: fileType, invalidate: true };

    try {
      await this.cloudinary.uploader.destroy(publicId, deleteOptions);
      console.log(
        `File with publicId "${publicId}" has been successfully deleted.`,
      );
    } catch (error) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        `Failed to delete file. PublicId: "${publicId}". Error: ${error}`,
      );
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      await this.cloudinary.api.delete_folder(folderPath);
      console.log(`Folder "${folderPath}" has been successfully deleted.`);
    } catch (error) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        `Failed to delete folder. Folder path: "${folderPath}". Error: ${error}`,
      );
    }
  }

  async deleteFilesAndFolder(folderPath: string): Promise<void> {
    if (!folderPath) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Folder path is required.');
    }

    try {
      const folderResult = await this.cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
      });

      const publicIds = folderResult.resources.map(
        (file: UploadApiResponse) => file.public_id,
      );

      if (publicIds.length === 0) {
        console.log(`No files found in folder "${folderPath}".`);
      } else {
        await Promise.all(
          publicIds.map(async (publicId: string) => {
            try {
              await this.deleteFile(publicId, FileType.IMAGE);
              console.log(
                `File with publicId "${publicId}" has been successfully deleted.`,
              );
            } catch (error) {
              console.error(
                `Failed to delete file with publicId "${publicId}":`,
                error,
              );
            }
          }),
        );
      }

      await this.deleteFolder(folderPath);
      console.log(`Folder "${folderPath}" has been successfully deleted.`);
    } catch (error) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `Error deleting files and folder at path "${folderPath}". Error: ${error}`,
      );
    }
  }

  getNestedProperty(obj: any, path: string): string[] {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private isValidEntity(entity: any): void {
    if (!entity) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.ENTITY_NOT_FOUND);
    }
  }

  private cleanupFile(filePath: string) {
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error removing file:', unlinkError);
    }
  }

  private async updateEntity(
    model: any,
    modelId: Types.ObjectId,
    fieldToUpdate: string,
    dto: string[],
  ) {
    try {
      return await model.findByIdAndUpdate(
        modelId,
        { $set: { [fieldToUpdate]: dto } },
        { new: true },
      );
    } catch (updateError) {
      console.error('Error updating entity:', updateError);
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.ENTITY_UPDATE_FAILED,
      );
    }
  }

  private removeByPublicId(arr: string[], publicId: string): string[] {
    return arr.filter((item: string) => !item.includes(publicId));
  }

  async uploadFileAndUpdateModel<T extends Document>(
    file: Express.Multer.File,
    options: UploadOptions<T>,
  ): Promise<T> {
    const { model, modelId, folderPath, fieldToUpdate } = options;
    const entity = await model.findById(modelId);
    this.isValidEntity(entity);

    const filePath = `${folderPath}${modelId}`;
    let uploadedImage: string | null = null;

    try {
      uploadedImage = await this.uploadFile(file, FileType.IMAGE, filePath);
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.FILE_UPLOAD_FAILED,
      );
    }

    const images: string[] = this.getNestedProperty(entity, fieldToUpdate);

    this.cleanupFile(file.path);
    if (uploadedImage) images.push(uploadedImage);

    return await this.updateEntity(model, modelId, fieldToUpdate, images);
  }

  async deleteFileAndUpdateModel<T extends Document>(
    options: DeleteOptions<T>,
  ): Promise<ApiResponse<UserInfo>> {
    const { model, userId, publicId, fieldToUpdate } = options;
    const entity = await model.findById(userId);
    this.isValidEntity(entity);

    try {
      await this.deleteFile(publicId, FileType.IMAGE);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessages.FILE_DELETE_FAILED,
      );
    }

    const images: string[] = this.getNestedProperty(entity, fieldToUpdate);
    const filteredImages = this.removeByPublicId(images, publicId);

    const updatedEntity: UserDocument = await this.updateEntity(
      model,
      userId,
      fieldToUpdate,
      filteredImages,
    );

    const correctedEntity = sanitizeUserData(updatedEntity);
    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      correctedEntity,
    );
  }
}
