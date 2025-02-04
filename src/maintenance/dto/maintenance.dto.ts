import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { MaintenanceType } from '../enums/maintenance-type.enum';
import { ProcessStatus } from '../enums/process-status.enum';
import { PartsDto } from './parts.dto';

export class MaintenanceDto {
  @IsEnum(MaintenanceType, {
    message: 'serviceType must be a valid MaintenanceType enum value',
  })
  serviceType: MaintenanceType;

  @IsOptional()
  @IsEnum(ProcessStatus, {
    message: 'processStatus must be a valid Status enum value',
  })
  processStatus?: ProcessStatus;

  @IsOptional()
  @IsNumber({}, { message: 'costEstimate must be a number' })
  @Min(0, { message: 'costEstimate cannot be less than 0' })
  costEstimate?: number;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @Length(10, 1500, {
    message: 'description must be between 10 and 1500 characters',
  })
  description?: string | null;

  @IsOptional()
  @IsDate({ message: 'completionDate must be a valid date' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'completionDate cannot be in the past' })
  completionDate?: Date | null;

  @IsOptional()
  @IsArray({ message: 'partsUsed must be an array' })
  @ValidateNested({ each: true })
  @Type(() => PartsDto)
  partsUsed: PartsDto[];

  @IsOptional()
  @IsDate({ message: 'startDate must be a valid date' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'startDate cannot be in the past' })
  startDate?: Date | null;

  @IsOptional()
  @IsDate({ message: 'endDate must be a valid date' })
  @Type(() => Date)
  @MinDate(new Date(), { message: 'endDate cannot be in the past' })
  endDate?: Date | null;
}
