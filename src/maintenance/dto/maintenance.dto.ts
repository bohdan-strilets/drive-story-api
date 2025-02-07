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
    message: 'Service type must be one of the allowed maintenance types.',
  })
  serviceType: MaintenanceType;

  @IsOptional()
  @IsEnum(ProcessStatus, {
    message: 'Process status must be one of the allowed process statuses.',
  })
  processStatus?: ProcessStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Cost estimate must be a number.' })
  @Min(0, { message: 'Cost estimate must be at least 0.' })
  costEstimate?: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @Length(10, 1500, {
    message: 'Description must be between 10 and 1500 characters long.',
  })
  description?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Completion date must be a valid date.' })
  @MinDate(new Date(), { message: 'Completion date cannot be in the past.' })
  completionDate?: Date | null;

  @IsOptional()
  @IsArray({ message: 'Parts used must be an array.' })
  @ValidateNested({
    each: true,
    message: 'Each part must be a valid parts object.',
  })
  @Type(() => PartsDto)
  partsUsed?: PartsDto[];

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date.' })
  @MinDate(new Date(), { message: 'Start date cannot be in the past.' })
  startDate?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date.' })
  @MinDate(new Date(), { message: 'End date cannot be in the past.' })
  endDate?: Date | null;
}
