import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { NumberRates } from '../enums/number-rates.enum';

export class PaymentStatusDto {
  @IsBoolean({ message: 'isPaid must be a boolean value.' })
  isPaid: boolean;

  @IsOptional()
  @IsEnum(NumberRates, { message: 'Invalid number rates.' })
  installmentsCount?: NumberRates;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'totalInstallmentsSum must be a number.' })
  totalInstallmentsSum?: number;
}
