import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class BasicInfoDto {
  @IsString({ message: 'Make must be a string' })
  @Length(2, 50, { message: 'Make must be between 2 and 50 characters long' })
  make: string;

  @IsString({ message: 'Model must be a string' })
  @Length(2, 50, { message: 'Model must be between 2 and 50 characters long' })
  model: string;

  @IsInt({ message: 'Year must be an integer' })
  @Min(1886, { message: 'Year cannot be before 1886' })
  @Max(new Date().getFullYear() + 1, {
    message: `Year cannot be later than ${new Date().getFullYear() + 1}`,
  })
  year: number;

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
}
