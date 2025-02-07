import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailDto {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
