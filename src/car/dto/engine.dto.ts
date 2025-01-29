import { IsInt, IsNumber, Max, Min } from 'class-validator';
import {
  MAX_POWER,
  MAX_VOLUME,
  MIN_POWER,
  MIN_VOLUME,
} from 'src/helpers/validation-rules';

export class EngineDto {
  @IsNumber()
  @Min(MIN_VOLUME, { message: `Engine volume must be at least ${MIN_VOLUME}L` })
  @Max(MAX_VOLUME, { message: `Engine volume cannot exceed ${MAX_VOLUME}L` })
  volume: number;

  @IsInt()
  @Min(MIN_POWER, { message: `Engine power must be at least ${MIN_POWER} HP` })
  @Max(MAX_POWER, { message: `Engine power cannot exceed ${MAX_POWER} HP` })
  power: number;
}
