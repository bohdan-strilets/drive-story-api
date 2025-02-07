import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 } from 'cloudinary';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { FileType } from './enums/file-type.enum';

@Injectable()
export class CloudinaryService {
  private readonly cloudinary = v2;

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

      return response.secure_url;
    } catch (error) {
      const code = (error.httpStatus as number) || HttpStatus.BAD_REQUEST;
      const message = error.message || errorMessages.FILE_UPLOAD_ERROR;
      throw new AppError(code, message);
    }
  }

  getFolderPath(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.INVALID_URL);
    }

    try {
      const parsedUrl = new URL(url);
      const segments = parsedUrl.pathname.split('/').filter(Boolean);

      if (segments.length < 2) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          errorMessages.INSUFFICIENT_URL_SEGMENTS,
        );
      }

      segments.pop();
      return segments.slice(4, segments.length).join('/');
    } catch (error) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        error.message || errorMessages.INVALID_URL,
      );
    }
  }

  async deleteFile(publicId: string, fileType: FileType): Promise<void> {
    try {
      const options = { resource_type: fileType, invalidate: true };
      await this.cloudinary.uploader.destroy(publicId, options);
    } catch (error) {
      const code = (error.httpStatus as number) || HttpStatus.NOT_FOUND;
      const message = error.message || errorMessages.FILE_DELETE_ERROR;
      throw new AppError(code, message);
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      await this.cloudinary.api.delete_folder(folderPath);
    } catch (error) {
      const code = (error.httpStatus as number) || HttpStatus.NOT_FOUND;
      const message = error.message || errorMessages.FOLDER_DELETE_ERROR;
      throw new AppError(code, message);
    }
  }

  async deleteAllFiles(files: string[]): Promise<void> {
    await Promise.all(
      files.map(async (publicId: string) => {
        try {
          await this.deleteFile(publicId, FileType.IMAGE);
        } catch (error) {
          const code =
            (error.httpStatus as number) || HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.message || errorMessages.FILE_DELETE_ERROR;
          throw new AppError(code, message);
        }
      }),
    );
  }

  async deleteFilesAndFolder(folderPath: string): Promise<void> {
    if (!folderPath) {
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
    } catch (error) {
      const code = (error.httpStatus as number) || HttpStatus.BAD_REQUEST;
      const message = error.message || errorMessages.FILE_FOLDER_DELETE_ERROR;
      throw new AppError(code, message);
    }
  }
}
