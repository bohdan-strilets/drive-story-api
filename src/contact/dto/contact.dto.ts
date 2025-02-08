import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';

export class ContactDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @Length(2, 100, {
    message: 'Name must be between 2 and 100 characters long.',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @IsPhoneNumber('PL', {
    message: 'Phone number must be a valid phone number in Poland',
  })
  @Length(9, 9, { message: 'Phone number must be exactly 9 characters long' })
  @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string | null;

  @IsOptional()
  @ValidateNested({ message: 'Address must be a valid address object' })
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsString({ message: 'Map link must be a string.' })
  @IsUrl({}, { message: 'Map link must be a valid URL.' })
  mapLink?: string | null;

  @IsOptional()
  @IsString({ message: 'Website must be a string.' })
  @IsUrl({}, { message: 'Website must be a valid URL.' })
  website?: string | null;

  @IsOptional()
  @IsArray({ message: 'Working hours must be an array.' })
  @ArrayMinSize(2, { message: 'Working hours must have exactly two elements.' })
  @ArrayMaxSize(2, { message: 'Working hours must have exactly two elements.' })
  @IsString({ each: true, message: 'Each working hour must be a string.' })
  workingHours?: [string, string];

  @IsOptional()
  @IsArray({ message: 'Specializations must be an array.' })
  @IsString({ each: true, message: 'Each specialization must be a string.' })
  specializations?: string[];
}
