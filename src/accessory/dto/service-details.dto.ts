import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class ServiceDetailsDto {
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer.' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Services list must be an array.' })
  @IsString({
    each: true,
    message: 'Each service in the list must be a string.',
  })
  servicesList?: string[];
}
