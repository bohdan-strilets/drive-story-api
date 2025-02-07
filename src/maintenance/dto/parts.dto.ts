import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class PartsDto {
  @IsString({ message: 'Name must be a string.' })
  @Length(5, 200, {
    message: 'Name must be between 5 and 200 characters long.',
  })
  name: string;

  @IsArray({ message: 'Part numbers must be an array.' })
  @IsString({ each: true, message: 'Each part number must be a string.' })
  partNumbers: string[];

  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price cannot be less than 0.' })
  price: number;

  @IsOptional()
  @IsString({ message: 'URL must be a string.' })
  @IsUrl({}, { message: 'URL must be a valid URL.' })
  url?: string | null;
}
