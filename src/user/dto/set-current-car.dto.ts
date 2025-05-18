import { IsNotEmpty, IsString } from 'class-validator';

export class CurrentCarDto {
  @IsNotEmpty({ message: 'Car id must not be empty' })
  @IsString({ message: 'Car id must be a string' })
  carId: string;
}
