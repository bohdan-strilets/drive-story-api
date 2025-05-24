import { IsInt, IsPositive } from 'class-validator';

export class MileageDto {
  @IsInt({ message: 'Mileage must be an integer' })
  @IsPositive({ message: 'Mileage must be a positive number' })
  mileage: number;
}
