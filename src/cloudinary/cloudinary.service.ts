import { HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as fs from 'fs';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { ApiResponse } from 'src/response/types/api-response.type';
import { UserDocument } from 'src/user/schemes/user.schema';
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
      throw new Error('Invalid URL provided');
    }

    const segments = url.split('/');

    if (segments.length < 8) {
      throw new Error(
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
      throw new Error(
        `Failed to delete file. PublicId: "${publicId}". Error: ${error.message || error}`,
      );
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      await this.cloudinary.api.delete_folder(folderPath);
      console.log(`Folder "${folderPath}" has been successfully deleted.`);
    } catch (error) {
      throw new Error(
        `Failed to delete folder. Folder path: "${folderPath}". Error: ${error.message || error}`,
      );
    }
  }

  async deleteFilesAndFolder(folderPath: string): Promise<void> {
    if (!folderPath) {
      throw new Error('Folder path is required.');
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
      throw new Error(
        `Error deleting files and folder at path "${folderPath}". Error: ${error.message || error}`,
      );
    }
  }

  getNestedAccess(obj: any, path: string[]): string[] {
    return path.reduce((acc, key) => acc[key], obj);
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
    let uploadedImage: string | null = null;

    try {
      uploadedImage = await this.uploadFile(file, FileType.IMAGE, filePath);
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessages.FILE_UPLOAD_FAILED,
      };
    }

    const images: string[] = this.getNestedAccess(entity, fieldToUpdate);

    try {
      fs.unlinkSync(file.path);
    } catch (unlinkError) {
      console.error('Error removing file:', unlinkError);
    }

    if (uploadedImage) {
      images.push(uploadedImage);
    }

    let updatedEntity: UserDocument | null = null;

    try {
      updatedEntity = await model.findByIdAndUpdate(
        modelId,
        { [fieldToUpdate.join('.')]: images },
        { new: true },
      );
    } catch (updateError) {
      console.error('Error updating entity:', updateError);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessages.ENTITY_UPDATE_FAILED,
      };
    }

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
    const { model, userId, publicId, fieldToUpdate } = options;
    const entity = await model.findById(userId);

    if (!entity) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessages.ENTITY_NOT_FOUND,
      };
    }

    try {
      await this.deleteFile(publicId, FileType.IMAGE);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessages.FILE_DELETE_FAILED,
      };
    }

    const images: string[] = this.getNestedAccess(entity, fieldToUpdate);

    const filteredImages = images.filter(
      (item: string) => !item.includes(publicId),
    );

    let updatedEntity: UserDocument | null = null;
    try {
      updatedEntity = await model.findByIdAndUpdate(
        userId,
        { [fieldToUpdate.join('.')]: filteredImages },
        { new: true },
      );
    } catch (error) {
      console.error('Error updating the entity in the database:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessages.ENTITY_UPDATE_FAILED,
      };
    }

    const correctedEntity = sanitizeUserData(updatedEntity);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: correctedEntity,
    };
  }
}
