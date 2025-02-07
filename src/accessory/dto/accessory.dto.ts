import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { AccessoryType } from '../enums/accessory.type';
import { ItemsDto } from './items.dto';
import { ServiceDetailsDto } from './service-details.dto';

export class AccessoryDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @Length(2, 100, {
    message: 'Name must be between 2 and 100 characters long.',
  })
  name: string;

  @IsNotEmpty({ message: 'Accessory type is required.' })
  @IsEnum(AccessoryType, { message: 'Invalid accessory type.' })
  type: AccessoryType;

  @IsNotEmpty({ message: 'Price is required.' })
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0.1, { message: 'Price must be at least 0.1.' })
  @IsInt({ message: 'Price must be an integer.' })
  price: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @Length(30, 300, {
    message: 'Description must be between 30 and 300 characters long.',
  })
  description?: string | null;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @IsInt({ message: 'Quantity must be an integer.' })
  quantity?: number;

  @IsOptional()
  @IsArray({ message: 'Service details must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ServiceDetailsDto)
  serviceDetails?: ServiceDetailsDto[];

  @IsOptional()
  @IsArray({ message: 'Items used must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ItemsDto)
  itemsUsed?: ItemsDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total cost must be a number.' })
  @IsInt({ message: 'Total cost must be an integer.' })
  totalCost?: number;
}
