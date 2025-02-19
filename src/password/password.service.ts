import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { passwordRegex } from './regex/password.regex';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(private configService: ConfigService) {
    this.saltRounds = Number(this.configService.get('SALT'));
  }

  async createPassword(password: string): Promise<string> {
    if (password.length < 6 || password.length > 12) {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.PASSWORD_LENGTH);
    }

    if (!passwordRegex.test(password)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.PASSWORD_RULES_ERROR,
      );
    }

    return await hash(password, this.saltRounds);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const validPassword = await compare(plainPassword, hashedPassword);

    if (!validPassword) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_PASSWORD,
      );
    }

    return validPassword;
  }
}
