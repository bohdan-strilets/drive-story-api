import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class EngineDto {
  @IsNumber()
  @Min(500, { message: 'Engine volume must be at least 0.5L' })
  @Max(10000, { message: 'Engine volume cannot exceed 10L' })
  volume: number;

  @IsInt()
  @Min(20, { message: 'Engine power must be at least 20 HP' })
  @Max(2000, { message: 'Engine power cannot exceed 2000 HP' })
  power: number;
}
