import { IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from 'src/helpers/validation-rules';

export class PasswordDto {
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;
}
