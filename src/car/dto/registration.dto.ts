import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, MaxDate } from 'class-validator';

export class RegistrationDto {
  @IsOptional()
  @IsString({ message: 'VIN must be a string' })
  @Length(17, 17, { message: 'VIN must be exactly 17 characters long' })
  vin?: string | null;

  @IsOptional()
  @IsString({ message: 'Registration number must be a string' })
  @Length(1, 15, {
    message: 'Registration number must be between 1 and 15 characters long',
  })
  regNumber?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'First registration date must be a valid date' })
  @MaxDate(new Date(), {
    message: 'First registration date cannot be in the future',
  })
  firstRegDate?: Date | null;
}
