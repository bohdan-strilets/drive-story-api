import { Controller } from '@nestjs/common';
import { FuelingService } from './fueling.service';

@Controller('fueling')
export class FuelingController {
  constructor(private readonly fuelingService: FuelingService) {}
}
