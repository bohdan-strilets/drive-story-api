import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { passwordRegex } from 'src/password/regex/password.regex';

export class RegistrationDto {
  @IsNotEmpty({ message: 'First name must not be empty' })
  @IsString({ message: 'First name must be a string' })
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters long',
  })
  firstName: string;

  @IsNotEmpty({ message: 'Last name must not be empty' })
  @IsString({ message: 'Last name must be a string' })
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters long',
  })
  lastName: string;

  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

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
