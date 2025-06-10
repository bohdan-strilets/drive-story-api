import { IsOptional, IsString, Length } from 'class-validator';

export class BasicInfoDto {
  @IsString({ message: 'Make must be a string' })
  @Length(2, 50, { message: 'Make must be between 2 and 50 characters long' })
  make: string;

  @IsString({ message: 'Model must be a string' })
  @Length(2, 50, { message: 'Model must be between 2 and 50 characters long' })
  model: string;

  @IsString({ message: 'Year must be a string' })
  year: string;

  @IsOptional()
  @IsString({ message: 'Short name must be a string' })
  @Length(2, 50, {
    message: 'Short name must be between 2 and 50 characters long',
  })
  shortName?: string | null;

  @IsOptional()
  @IsString({ message: 'Generation must be a string' })
  @Length(1, 50, {
    message: 'Generation must be between 1 and 50 characters long',
  })
  generation?: string | null;

  @IsOptional()
  @IsString({ message: 'TrimsId must be a string' })
  trimsId?: string | null;
}
