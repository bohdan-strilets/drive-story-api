import {
  IsOptional,
  IsPostalCode,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MAX_LOCATION_LENGTH,
  MIN_LOCATION_LENGTH,
} from 'src/helpers/validation-rules';

export class LocationDto {
  @IsString()
  @IsOptional()
  @MaxLength(MAX_LOCATION_LENGTH)
  @MinLength(MIN_LOCATION_LENGTH)
  country: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_LOCATION_LENGTH)
  @MinLength(MIN_LOCATION_LENGTH)
  city: string;

  @IsString()
  @IsOptional()
  @IsPostalCode('PL')
  postalCode: string;
}
