import { IsOptional, IsPostalCode, IsString, Length } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString({ message: 'Street must be a string.' })
  @Length(2, 100, {
    message: 'Street must be between 2 and 100 characters long.',
  })
  street?: string;

  @IsOptional()
  @IsString({ message: 'House number must be a string.' })
  @Length(1, 20, {
    message: 'House number must be between 1 and 20 characters long.',
  })
  houseNumber?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string.' })
  @Length(2, 100, {
    message: 'City must be between 2 and 100 characters long.',
  })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string.' })
  @Length(2, 100, {
    message: 'Country must be between 2 and 100 characters long.',
  })
  country?: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @IsPostalCode('PL', {
    message: 'Postal code must be a valid postal code for Poland (PL)',
  })
  postalCode?: string | null;
}
