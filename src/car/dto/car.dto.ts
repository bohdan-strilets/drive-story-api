import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { BasicInfoDto } from './basic-info.dto';
import { OwnerShipDto } from './ownership.dto';
import { RegistrationDto } from './registration.dto';
import { SpecificationsDto } from './specifications.dto';

export class CarDto {
  @ValidateNested({ message: 'Basic information must be valid' })
  @Type(() => BasicInfoDto)
  basicInfo: BasicInfoDto;

  @ValidateNested({ message: 'Specifications must be valid' })
  @Type(() => SpecificationsDto)
  specifications: SpecificationsDto;

  @ValidateNested({ message: 'Registration details must be valid' })
  @Type(() => RegistrationDto)
  registration: RegistrationDto;

  @ValidateNested({ message: 'Ownership details must be valid' })
  @Type(() => OwnerShipDto)
  ownership: OwnerShipDto;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string | null;
}
