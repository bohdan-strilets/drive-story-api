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
import {
  MAX_COLOR_LENGTH,
  MAX_DOORS,
  MAX_SEATS,
  MIN_COLOR_LENGTH,
  MIN_DOORS,
  MIN_SEATS,
} from 'src/helpers/validation-rules';
import { BodyType } from '../enums/body-type.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel.type.enum';
import { Transmission } from '../enums/transmission.enum';
import { EngineDto } from './engine.dto';

export class SpecificationsDto {
  @IsInt()
  @IsPositive()
  mileage: number;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsEnum(Transmission)
  transmission: Transmission;

  @IsEnum(Drivetrain)
  drivetrain: Drivetrain;

  @IsEnum(BodyType)
  bodyType: BodyType;

  @ValidateNested()
  @Type(() => EngineDto)
  engine: EngineDto;

  @IsOptional()
  @IsString()
  @Length(MIN_COLOR_LENGTH, MAX_COLOR_LENGTH)
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(MIN_DOORS)
  @Max(MAX_DOORS)
  doors?: number;

  @IsOptional()
  @IsInt()
  @Min(MIN_SEATS)
  @Max(MAX_SEATS)
  seats?: number;
}
