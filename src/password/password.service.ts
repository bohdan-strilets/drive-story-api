import { HttpStatus, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages';

@Injectable()
export class PasswordService {
  private SALT = 10;

  async checkPassword(
    newPassword: string,
    oldPassword: string,
  ): Promise<boolean> {
    return await compare(newPassword, oldPassword);
  }

  async createPassword(password: string): Promise<string> {
    return await hash(password, this.SALT);
  }

  async isValidPassword(
    newPassword: string,
    oldPassword: string,
  ): Promise<void> {
    const isValidPassword = await this.checkPassword(newPassword, oldPassword);

    if (!isValidPassword) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        errorMessages.USER_NOT_AUTHORIZED,
      );
    }
  }
}
