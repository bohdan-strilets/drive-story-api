import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { BasicInfoDto } from './basic-info.dto';
import { OwnerShipDto } from './ownership.dto';
import { RegistrationDto } from './registration.dto';
import { SpecificationsDto } from './specifications.dto';

export class CreateCarDto {
  @ValidateNested()
  @Type(() => BasicInfoDto)
  basicInfo: BasicInfoDto;

  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications: SpecificationsDto;

  @ValidateNested()
  @Type(() => RegistrationDto)
  registration: RegistrationDto;

  @ValidateNested()
  @Type(() => OwnerShipDto)
  ownership: OwnerShipDto;

  @IsOptional()
  @IsString()
  description: string | null;
}
