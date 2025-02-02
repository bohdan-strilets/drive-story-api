import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AppError } from 'src/error/app-error';
import { CloudinaryFolders } from 'src/helpers/cloudinary-folders';
import { defaultImages } from 'src/helpers/default-images';
import { errorMessages } from 'src/helpers/error-messages';
import { sanitizeUserData } from 'src/helpers/sanitize-user-data';
import { PasswordService } from 'src/password/password.service';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokenService } from 'src/token/token.service';
import { v4 } from 'uuid';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EmailDto } from './dto/email.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sendgridService: SendgridService,
    private readonly passwordService: PasswordService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly responseService: ResponseService,
    private readonly tokenService: TokenService,
  ) {}

  private async updateActivationStatus(
    userId: Types.ObjectId,
    activationToken: string | null = null,
    isActivated: boolean = true,
  ): Promise<UserDocument> {
    const options = { activationToken, isActivated };
    return await this.userModel.findByIdAndUpdate(userId, options, {
      new: true,
    });
  }

  async activationEmail(activationToken: string): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ activationToken });

    if (!user) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        errorMessages.ACTIVATION_TOKEN_ERROR,
      );
    }

    await this.updateActivationStatus(user._id);
    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async requestActivationEmailResend(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    const activationToken = v4();

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }

    const updatedUser = await this.updateActivationStatus(
      user._id,
      activationToken,
      false,
    );

    await this.sendgridService.sendConfirmEmailLetter(
      updatedUser.email,
      updatedUser.activationToken,
    );

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  private async updateUserById(
    userId: Types.ObjectId,
    dto: any,
  ): Promise<UserInfo> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, dto, {
      new: true,
    });
    return sanitizeUserData(updatedUser);
  }

  async editProfile(
    userId: Types.ObjectId,
    dto: ProfileDto,
  ): Promise<ApiResponse<UserInfo>> {
    const updatedUser = await this.updateUserById(userId, dto);
    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async editEmail(
    userId: Types.ObjectId,
    dto: EmailDto,
  ): Promise<ApiResponse<UserInfo>> {
    const { email } = dto;

    const activationToken = v4();
    await this.sendgridService.sendConfirmEmailLetter(email, activationToken);

    const emailDto = { email, activationToken, isActivated: false };
    const updatedUser = await this.updateUserById(userId, emailDto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  private isValidUser(user: UserDocument): void {
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }
  }

  async requestResetPassword(dto: EmailDto): Promise<ApiResponse> {
    const { email } = dto;
    const user = await this.userModel.findOne({ email });
    this.isValidUser(user);

    const resetToken = v4();
    await this.updateUserById(user._id, { resetToken });
    await this.sendgridService.sendPasswordResetEmail(user.email, resetToken);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async verifyResetToken(resetToken: string): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ resetToken });
    this.isValidUser(user);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse> {
    const user = await this.userModel.findOne({ resetToken });
    this.isValidUser(user);

    const { password } = dto;
    const hashPassword = await this.passwordService.createPassword(password);

    const passwordDto = { password: hashPassword, resetToken: null };
    await this.updateUserById(user._id, passwordDto);

    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async editPassword(
    dto: EditPasswordDto,
    userId: Types.ObjectId,
  ): Promise<ApiResponse> {
    const user = await this.userModel.findById(userId);
    const isValidPassword = await this.passwordService.checkPassword(
      dto.password,
      user.password,
    );

    if (!user || !isValidPassword) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }

    const hashPassword = await this.passwordService.createPassword(
      dto.newPassword,
    );

    const passwordDto = { password: hashPassword };
    await this.updateUserById(userId, passwordDto);
    await this.sendgridService.sendPasswordChangedSuccess(user.email);

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.uploadFileAndUpdateModel<UserDocument>(
      file,
      {
        model: this.userModel,
        modelId: userId,
        folderPath: CloudinaryFolders.USER_AVATAR,
        fieldToUpdate: 'avatars.resources',
      },
    );
  }

  async deleteAvatar(
    avatarPublicId: string,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.deleteFileAndUpdateModel<UserDocument>({
      model: this.userModel,
      publicId: avatarPublicId,
      userId,
      fieldToUpdate: 'avatars.resources',
    });
  }

  private findFileByResources(arr: string[], publicId: string): string {
    return arr.find((item) => item.includes(publicId));
  }

  private isValidSelectedFile(selectedAvatar: string) {
    if (!!selectedAvatar) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.FILE_NON_EXISTENT,
      );
    }
  }

  async selectAvatar(
    avatarPublicId: string,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);

    const avatars = user.avatars.resources;
    const selectedAvatar = this.findFileByResources(avatars, avatarPublicId);
    this.isValidSelectedFile(selectedAvatar);

    const dto = { $set: { 'avatars.selected': selectedAvatar } };
    const updatedUser = await this.updateUserById(userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  private async removedFilesAndFolder(filesArr: string[]) {
    if (filesArr.length > 0) {
      const folderPath = this.cloudinaryService.getFolderPath(filesArr[0]);
      await this.cloudinaryService.deleteFilesAndFolder(folderPath);
    } else {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.NOT_FILES_TO_DELETE,
      );
    }
  }

  async deleteAllAvatars(
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);

    const allAvatars = user.avatars.resources;
    await this.removedFilesAndFolder(allAvatars);

    const dto = {
      $set: {
        'avatars.resources': [],
        'avatars.selected': defaultImages.USER_AVATAR,
      },
    };

    const updatedUser = await this.updateUserById(userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async uploadPoster(
    file: Express.Multer.File,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.uploadFileAndUpdateModel<UserDocument>(
      file,
      {
        model: this.userModel,
        modelId: userId,
        folderPath: CloudinaryFolders.USER_POSTER,
        fieldToUpdate: 'posters.resources',
      },
    );
  }

  async deletePoster(
    posterPublicId: string,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    return await this.cloudinaryService.deleteFileAndUpdateModel<UserDocument>({
      model: this.userModel,
      publicId: posterPublicId,
      userId,
      fieldToUpdate: 'posters.resources',
    });
  }

  async selectPoster(
    posterPublicId: string,
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);

    const posters = user.posters.resources;
    const selectedPoster = this.findFileByResources(posters, posterPublicId);
    this.isValidSelectedFile(selectedPoster);

    const dto = { $set: { 'posters.selected': selectedPoster } };
    const updatedUser = await this.updateUserById(userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async deleteAllPosters(
    userId: Types.ObjectId,
  ): Promise<ApiResponse<UserInfo>> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);

    const allPosters = user.posters.resources;
    await this.removedFilesAndFolder(allPosters);

    const dto = {
      $set: {
        'posters.resources': [],
        'posters.selected': defaultImages.USER_POSTER,
      },
    };

    const updatedUser = await this.updateUserById(userId, dto);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      updatedUser,
    );
  }

  async getCurrentUser(userId: Types.ObjectId): Promise<ApiResponse<UserInfo>> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);
    const sanitizedUser = sanitizeUserData(user);

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      sanitizedUser,
    );
  }

  async deleteProfile(userId: Types.ObjectId): Promise<ApiResponse> {
    const user = await this.userModel.findById(userId);
    this.isValidUser(user);

    await this.removedFilesAndFolder(user.avatars.resources);
    await this.removedFilesAndFolder(user.posters.resources);

    await this.userModel.findByIdAndDelete(userId);
    await this.tokenService.deleteTokensByDb(new Types.ObjectId(userId));

    return this.responseService.createSuccessResponse(HttpStatus.OK);
  }
}
