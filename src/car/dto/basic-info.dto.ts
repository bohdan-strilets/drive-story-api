import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import {
  MAX_CAR_LENGTH,
  MAX_YEAR_PRODUCTION,
  MIN_CAR_LENGTH,
  MIN_YEAR_PRODUCTION,
} from 'src/helpers/validation-rules';

export class BasicInfoDto {
  @IsString()
  @Length(MIN_CAR_LENGTH, MAX_CAR_LENGTH)
  make: string;

  @IsString()
  @Length(MIN_CAR_LENGTH, MAX_CAR_LENGTH)
  model: string;

  @IsInt()
  @Min(MIN_YEAR_PRODUCTION, {
    message: `The year must not be earlier than ${MIN_YEAR_PRODUCTION}`,
  })
  @Max(MAX_YEAR_PRODUCTION, {
    message: `The year cannot be greater than the ${MAX_YEAR_PRODUCTION}`,
  })
  year: number;

  @IsOptional()
  @IsString()
  @Length(MIN_CAR_LENGTH, MAX_CAR_LENGTH)
  shortName?: string | null;

  @IsOptional()
  @IsString()
  @Length(MIN_CAR_LENGTH, MAX_CAR_LENGTH)
  generation?: string | null;
}
