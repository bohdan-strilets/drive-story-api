import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { passwordRegex } from 'src/password/regex/password.regex';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 12, {
    message: 'Password must be between 6 and 12 characters long',
  })
  @Matches(passwordRegex, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
