import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ItemsDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @Length(2, 100, {
    message: 'Name must be between 2 and 100 characters long.',
  })
  name: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number.' })
  @IsInt({ message: 'Price cost must be an integer.' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @IsInt({ message: 'Quantity must be an integer.' })
  quantity?: number;
}
