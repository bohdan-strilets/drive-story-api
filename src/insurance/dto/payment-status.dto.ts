import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { InstallmentsCount } from '../enums/installments-count.enum';

export class PaymentStatusDto {
  @IsBoolean({ message: 'isPaid must be a boolean value.' })
  isPaid: boolean;

  @IsOptional()
  @IsEnum(InstallmentsCount, {
    message: 'installmentsCount must be a valid InstallmentsCount value.',
  })
  installmentsCount?: InstallmentsCount;

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
