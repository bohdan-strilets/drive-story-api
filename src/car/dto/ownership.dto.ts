import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateIf,
} from 'class-validator';

export class OwnerShipDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Purchase date must be a valid date' })
  purchaseDate?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Sale date must be a valid date' })
  @ValidateIf((o) => o.purchaseDate !== null, {
    message: 'Sale date cannot be before purchase date',
  })
  saleDate?: Date | null;

  @IsOptional()
  @IsInt({ message: 'Purchase price must be an integer' })
  @IsPositive({ message: 'Purchase price must be a positive number' })
  purchasePrice?: number;

  @IsOptional()
  @IsInt({ message: 'Sale price must be an integer' })
  @IsPositive({ message: 'Sale price must be a positive number' })
  salePrice?: number;
}
