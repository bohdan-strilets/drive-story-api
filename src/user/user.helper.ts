import { HttpStatus } from '@nestjs/common';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { UserDocument } from './schemes/user.schema';
import { UserInfo } from './types/user-info';
import { UserRepository } from './user.repository';

export class UserHelper {
  constructor(private readonly userRepository: UserRepository) {}

  isValidUser(user: UserDocument): void {
    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
    }
  }

  getSafeUserData = (user: UserDocument): UserInfo => {
    return {
      _id: user._id,
      email: user.email,
      gender: user.gender,
      avatars: user.avatars,
      posters: user.posters,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      isActivated: user.isActivated,
      location: user.location,
    };
  };

  async validateUniqueEmail(email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);

    if (user) {
      throw new AppError(HttpStatus.CONFLICT, errorMessages.EMAIL_EXISTS);
    }
  }

  validateUserActivation(isActivated: boolean): void {
    if (!isActivated) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.EMAIL_NOT_ACTIVATED,
      );
    }
  }
}
