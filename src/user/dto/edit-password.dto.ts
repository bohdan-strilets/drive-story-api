import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { passwordRegex } from 'src/password/regex/password.regex';

export class EditPasswordDto {
  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 12, {
    message: 'Password must be between 6 and 12 characters long',
  })
  @Matches(passwordRegex, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsNotEmpty({ message: 'New password must not be empty' })
  @IsString({ message: 'New password must be a string' })
  @Length(6, 12, {
    message: 'New password must be between 6 and 12 characters long',
  })
  @Matches(passwordRegex, {
    message: 'New password must contain at least one letter and one number',
  })
  newPassword: string;
}
