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
  @IsString({ message: 'name must be a string' })
  @Length(5, 200, { message: 'name must be between 5 and 200 characters' })
  name: string;

  @IsArray({ message: 'partNumbers must be an array of strings' })
  @IsString({ each: true, message: 'Each partNumber must be a string' })
  partNumbers: string[];

  @IsNumber({}, { message: 'price must be a number' })
  @Min(0, { message: 'price cannot be less than 0' })
  price: number;

  @IsOptional()
  @IsString({ message: 'url must be a string' })
  @IsUrl({}, { message: 'url must be a valid URL' })
  url?: string | null;
}
