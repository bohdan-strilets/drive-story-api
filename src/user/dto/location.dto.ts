import { IsOptional, IsPostalCode, IsString, Length } from 'class-validator';

export class LocationDto {
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @Length(2, 100, {
    message: 'Country must be between 2 and 100 characters long',
  })
  country: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @Length(2, 100, {
    message: 'City must be between 2 and 100 characters long',
  })
  city: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @IsPostalCode('PL', {
    message: 'Postal code must be a valid postal code for Poland (PL)',
  })
  postalCode: string;
}
