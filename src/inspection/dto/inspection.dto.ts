import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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

  @IsBoolean()
  isInspectionPassed: boolean;

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
