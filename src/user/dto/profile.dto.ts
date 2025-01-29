import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from 'src/helpers/validation-rules';
import { Gender } from '../enums/gender.enum';
import { LocationDto } from './location.dto';

export class ProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  nickname?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('PL')
  phoneNumber?: string;

  @IsString()
  @IsIn(Object.values(Gender))
  @IsOptional()
  gender?: Gender;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;
}
