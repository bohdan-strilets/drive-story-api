import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import {
  MAX_REG_NUMBER,
  MIN_REG_NUMBER,
  VIN_LENGTH,
} from 'src/helpers/validation-rules';

export class RegistrationDto {
  @IsOptional()
  @IsString()
  @Length(VIN_LENGTH, VIN_LENGTH, {
    message: 'VIN must be exactly 17 characters long',
  })
  vin?: string | null;

  @IsOptional()
  @IsString()
  @Length(MIN_REG_NUMBER, MAX_REG_NUMBER, {
    message: `Registration number must be between ${MIN_REG_NUMBER} and ${MAX_REG_NUMBER} characters long`,
  })
  regNumber?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'First registration date must be a valid date' })
  firstRegDate?: Date | null;
}
