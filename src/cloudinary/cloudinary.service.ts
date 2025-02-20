import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 } from 'cloudinary';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { FileType } from './enums/file-type.enum';

@Injectable()
export class CloudinaryService {
  private readonly cloudinary = v2;
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    this.cloudinary.config({
      cloud_name: this.configService.get('CLOUD_NAME'),
      api_key: this.configService.get('CLOUD_API_KEY'),
      api_secret: this.configService.get('CLOUD_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    fileType: FileType,
    folderPath: string,
  ): Promise<string> {
    try {
      const options = { folder: folderPath, resource_type: fileType };
      const response = await this.cloudinary.uploader.upload(
        file.path,
        options,
      );

      this.logger.log(`File uploaded successfully: ${response.secure_url}`);
      return response.secure_url;
    } catch (error) {
      this.logger.error('Error uploading file', error.stack);
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  getFolderPath(url: string): string {
    if (!url || typeof url !== 'string') {
      this.logger.error(errorMessages.INVALID_URL);
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.INVALID_URL);
    }

    try {
      const parsedUrl = new URL(url);
      const segments = parsedUrl.pathname.split('/').filter(Boolean);

      if (segments.length < 2) {
        this.logger.error(errorMessages.INSUFFICIENT_URL_SEGMENTS);
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          errorMessages.INSUFFICIENT_URL_SEGMENTS,
        );
      }

      segments.pop();
      return segments.slice(4, segments.length).join('/');
    } catch (error) {
      this.logger.error('Error extracting folder path', error.stack);
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteFile(publicId: string, fileType: FileType): Promise<void> {
    try {
      const options = { resource_type: fileType, invalidate: true };
      await this.cloudinary.uploader.destroy(publicId, options);
      this.logger.log(`File ${publicId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting file ${publicId}`, error.stack);
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      await this.cloudinary.api.delete_folder(folderPath);
      this.logger.log(`Folder ${folderPath} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting folder ${folderPath}`, error.stack);
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteAllFiles(files: string[]): Promise<void> {
    await Promise.all(
      files.map(async (publicId: string) => {
        try {
          await this.deleteFile(publicId, FileType.IMAGE);
        } catch (error) {
          this.logger.error(`Error deleting file ${publicId}`, error.stack);
          throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
        }
      }),
    );
    this.logger.log('All files deleted successfully');
  }

  async deleteFilesAndFolder(folderPath: string): Promise<void> {
    if (!folderPath) {
      this.logger.error(errorMessages.FOLDER_PATH_REQUIRED);
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.FOLDER_PATH_REQUIRED,
      );
    }

    try {
      const folderByCloudinary = await this.cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
      });

      const publicIds: string[] = folderByCloudinary.resources.map(
        (file: UploadApiResponse) => file.public_id,
      );

      if (publicIds.length === 0) {
        throw new AppError(
          HttpStatus.NOT_FOUND,
          errorMessages.NO_FILES_IN_FOLDER,
        );
      }

      await this.deleteAllFiles(publicIds);
      await this.deleteFolder(folderPath);
      this.logger.log(
        `Files and folder at path ${folderPath} deleted successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting files and folder at ${folderPath}`,
        error.stack,
      );
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }
}
