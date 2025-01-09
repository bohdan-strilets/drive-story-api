import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { FileType } from './enums/file-type.enum';

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

  isGoogleAvatarUrl(url: string): boolean {
    const googleAvatarPathRegex = /\/a\/[A-Za-z0-9_-]+=s\d{2,}-c/;
    return googleAvatarPathRegex.test(url);
  }
}
