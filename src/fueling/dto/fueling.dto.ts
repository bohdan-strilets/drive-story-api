import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { FuelType } from '../enums/fuel-type.enum';

export class FuelingDto {
  @IsEnum(FuelType, { message: 'Fuel type must be one of the allowed values' })
  fuelType: FuelType;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be a positive number' })
  quantity: number;

  @IsNumber({}, { message: 'Price per unit must be a number' })
  @Min(0.01, { message: 'Price per unit must be a positive number' })
  pricePerUnit: number;

  @IsNumber({}, { message: 'Total cost must be a number' })
  @Min(0.01, { message: 'Total cost must be a positive number' })
  totalCost: number;

  @IsOptional()
  @IsDate({ message: 'Fueling date must be a valid date' })
  @Type(() => Date)
  fuelingDate?: Date;
}
