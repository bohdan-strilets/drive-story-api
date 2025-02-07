import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxDate,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { getBirthDateLimits } from '../helpers/get-birth-date-Limits.helpers';
import { LocationDto } from './location.dto';

const { minDate, maxDate } = getBirthDateLimits();

export class ProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters long',
  })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters long',
  })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Nickname must be a string' })
  @Length(2, 50, {
    message: 'Nickname must be between 2 and 50 characters long',
  })
  nickname?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Birth date must be a valid date' })
  @MinDate(minDate, { message: 'Age must not exceed 120 years' })
  @MaxDate(maxDate, { message: 'You must be at least 16 years old' })
  birthDate?: Date;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @IsPhoneNumber('PL', {
    message: 'Phone number must be a valid phone number in Poland',
  })
  @Length(9, 9, { message: 'Phone number must be exactly 9 characters long' })
  @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  @IsIn(Object.values(Gender), {
    message: `Gender must be one of: ${Object.values(Gender).join(', ')}`,
  })
  gender?: Gender;

  @IsOptional()
  @ValidateNested({ message: 'Location must be a valid location object' })
  @Type(() => LocationDto)
  location?: LocationDto;
}
