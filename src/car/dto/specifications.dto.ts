import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BodyType } from '../enums/body-type.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel.type.enum';
import { Transmission } from '../enums/transmission.enum';
import { EngineDto } from './engine.dto';

export class SpecificationsDto {
  @IsInt({ message: 'Mileage must be an integer' })
  @IsPositive({ message: 'Mileage must be a positive number' })
  mileage: number;

  @IsEnum(FuelType, {
    message: `Fuel type must be one of the following: ${Object.values(FuelType).join(', ')}`,
  })
  fuelType: FuelType;

  @IsEnum(Transmission, {
    message: `Transmission must be one of the following: ${Object.values(Transmission).join(', ')}`,
  })
  transmission: Transmission;

  @IsEnum(Drivetrain, {
    message: `Drivetrain must be one of the following: ${Object.values(Drivetrain).join(', ')}`,
  })
  drivetrain: Drivetrain;

  @IsEnum(BodyType, {
    message: `Body type must be one of the following: ${Object.values(BodyType).join(', ')}`,
  })
  bodyType: BodyType;

  @ValidateNested({ message: 'Engine must be a valid engine object' })
  @Type(() => EngineDto)
  engine: EngineDto;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Length(1, 30, { message: 'Color must be between 1 and 30 characters long' })
  color?: string;

  @IsOptional()
  @IsInt({ message: 'Doors must be an integer' })
  @Min(2, { message: 'Doors must be at least 2' })
  @Max(6, { message: 'Doors cannot exceed 6' })
  doors?: number;

  @IsOptional()
  @IsInt({ message: 'Seats must be an integer' })
  @Min(1, { message: 'Seats must be at least 1' })
  @Max(9, { message: 'Seats cannot exceed 9' })
  seats?: number;
}
