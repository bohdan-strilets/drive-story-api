import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

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
}
