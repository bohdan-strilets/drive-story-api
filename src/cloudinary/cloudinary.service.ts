import { HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as fs from 'fs';
import { ApiResponse } from 'src/helpers/api-response.type';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { UserInfo } from 'src/user/types/user-info';
import { FileType } from './enums/file-type.enum';
import { DeleteOptions } from './types/delete-options.type';
import { UploadOptions } from './types/upload-options.type';

@Injectable()
export class CloudinaryService {
  private cloudinary = v2;

  constructor() {
    this.cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    type: FileType,
    path: string,
  ): Promise<string | null> {
    const uploadOptions = { folder: path, resource_type: type };
    const result = await this.cloudinary.uploader.upload(
      file.path,
      uploadOptions,
    );

    if (result) return result.secure_url;
    return null;
  }

  getFolderPath(url: string): string {
    const path = url.split('/');
    const folders = path.slice(7, path.length - 1).join('/');
    return [folders].join('/');
  }

  async deleteFile(publicId: string, fileType: FileType): Promise<void> {
    const deleteOptions = { resource_type: fileType, invalidate: true };

    try {
      await this.cloudinary.uploader.destroy(publicId, deleteOptions);
    } catch (error) {
      throw new Error(`Deleting file error: ${error}`);
    }
  }

  async deleteFolder(folderPath: string) {
    try {
      await this.cloudinary.api.delete_folder(folderPath);
    } catch (error) {
      throw new Error(`Deleting folder error: ${error}`);
    }
  }

  async deleteFilesAndFolder(folderPath: string): Promise<void> {
    try {
      const folderResult = await this.cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
      });

      const publicIds = folderResult.resources.map(
        (file: UploadApiResponse) => file.public_id,
      );

      await Promise.all(
        publicIds.map((publicId: string) =>
          this.deleteFile(publicId, FileType.IMAGE),
        ),
      );

      await this.deleteFolder(folderPath);
    } catch (error) {
      throw new Error(`Error deleting files and folder: ${error}`);
    }
  }

  isDefaultImage(urls: string[]): boolean {
    return urls.length === 1 && urls[0].includes('default');
  }

  async uploadFileAndUpdateModel(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<ApiResponse<UserInfo>> {
    const { model, modelId, folderPath, fieldToUpdate } = options;
    const entity = await model.findById(modelId);

    if (!entity) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.ENTITY_NOT_FOUND,
      };
    }

    const filePath = `${folderPath}${modelId}`;
    const resultPath = await this.uploadFile(file, FileType.IMAGE, filePath);

    fs.unlinkSync(file.path);

    const updatedField = this.isDefaultImage(entity[fieldToUpdate])
      ? [resultPath]
      : [...entity[fieldToUpdate], resultPath];

    const updatedEntity = await model.findByIdAndUpdate(
      modelId,
      { [fieldToUpdate]: updatedField },
      { new: true },
    );

    const correctedEntity = sanitizeUserData(updatedEntity);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: correctedEntity,
    };
  }

  async deleteFileAndUpdateModel(
    options: DeleteOptions,
  ): Promise<ApiResponse<UserInfo>> {
    const { model, userId, folderPath, fieldToUpdate } = options;
    const entity = await model.findById(userId);

    if (!entity) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.ENTITY_NOT_FOUND,
      };
    }

    await this.deleteFilesAndFolder(folderPath);

    const updatedAvatarArr = entity.avatars.filter(
      (item: string) => !item.includes(folderPath),
    );

    const updatedEntity = await model.findByIdAndUpdate(
      userId,
      { [fieldToUpdate]: updatedAvatarArr },
      { new: true },
    );

    const correctedEntity = sanitizeUserData(updatedEntity);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: correctedEntity,
    };
  }
}
