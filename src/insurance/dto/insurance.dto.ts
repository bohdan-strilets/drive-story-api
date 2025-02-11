import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { InsuranceType } from '../enums/insurance-type.enum';
import { PaymentStatusDto } from './payment-status.dto';

export class InsuranceDto {
  @IsNotEmpty({ message: 'Insurer name is required.' })
  @IsString({ message: 'Insurer name must be a string.' })
  @Length(2, 100, {
    message: 'Insurer name must be between 2 and 100 characters long.',
  })
  insurerName: string;

  @IsNotEmpty({ message: 'Policy number is required.' })
  @IsString({ message: 'Policy number must be a string.' })
  @Length(5, 50, {
    message: 'Policy number must be between 5 and 50 characters long.',
  })
  policyNumber: string;

  @IsNotEmpty({ message: 'Start date is required.' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date.' })
  startDate: Date;

  @IsNotEmpty({ message: 'End date is required.' })
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date.' })
  endDate: Date;

  @IsOptional()
  @IsEnum(InsuranceType, { message: 'Invalid insurance type.' })
  insuranceType?: InsuranceType;

  @IsNotEmpty({ message: 'Coverage amount is required.' })
  @IsNumber({}, { message: 'Coverage amount must be a number.' })
  @Min(0, { message: 'Coverage amount must be at least 0.' })
  coverageAmount: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentStatusDto)
  paymentStatus?: PaymentStatusDto;
}
