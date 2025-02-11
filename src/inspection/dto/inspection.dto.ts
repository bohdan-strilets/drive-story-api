import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { InspectionStatus } from '../enums/inspection-status.enum';

export class InspectionDto {
  @Type(() => Date)
  @IsDate({ message: 'inspectionDate must be a valid date' })
  inspectionDate: Date;

  @IsNotEmpty({ message: 'organization should not be empty' })
  @IsString({ message: 'organization must be a string' })
  @Length(1, 255, {
    message: 'organization must be between 1 and 255 characters long',
  })
  organization: string;

  @IsEnum(InspectionStatus, {
    message:
      'inspectionStatus must be one of the allowed values from the InspectionStatus enum',
  })
  inspectionStatus: InspectionStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'nextInspectionDate must be a valid date' })
  nextInspectionDate?: Date | null;

  @IsOptional()
  @IsArray({ message: 'comments must be an array of strings' })
  @IsString({
    each: true,
    message: 'each element in comments must be a string',
  })
  comments?: string[];
}
