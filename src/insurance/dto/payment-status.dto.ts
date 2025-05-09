import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class PaymentStatusDto {
  @IsBoolean({ message: 'isPaid must be a boolean value.' })
  isPaid: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'installationsCount must be between 1 and 12' })
  installmentsCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'installmentCost must be a number.' })
  installmentCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'totalInstallmentsSum must be a number.' })
  totalInstallmentsSum?: number;

  @IsOptional()
  @IsArray({ message: 'paymentDates must be an array of dates.' })
  @Type(() => Date)
  @IsDate({ each: true, message: 'Each payment date must be a valid date.' })
  paymentDates?: Date[];
}
