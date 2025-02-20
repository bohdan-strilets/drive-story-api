import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';
import { passwordRegex } from './regex/password.regex';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;
  private readonly logger = new Logger(PasswordService.name);

  constructor(private configService: ConfigService) {
    this.saltRounds = Number(this.configService.get('SALT'));
  }

  async createPassword(password: string): Promise<string> {
    if (password.length < 6 || password.length > 12) {
      this.logger.warn(errorMessages.PASSWORD_LENGTH);
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.PASSWORD_LENGTH);
    }

    if (!passwordRegex.test(password)) {
      this.logger.warn(errorMessages.PASSWORD_RULES_ERROR);
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.PASSWORD_RULES_ERROR,
      );
    }

    const hashed = await hash(password, this.saltRounds);
    this.logger.log('Password hashed successfully');
    return hashed;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const validPassword = await compare(plainPassword, hashedPassword);

    if (!validPassword) {
      this.logger.warn(errorMessages.INVALID_PASSWORD);
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.INVALID_PASSWORD,
      );
    }

    this.logger.log('Password validated successfully');
    return validPassword;
  }
}
