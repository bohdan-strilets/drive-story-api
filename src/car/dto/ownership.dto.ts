import { Type } from 'class-transformer';
import { IsDate, IsOptional, ValidateIf } from 'class-validator';

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
}
