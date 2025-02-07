import { Controller } from '@nestjs/common';
import { AccessoryService } from './accessory.service';

@Controller('accessory')
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}
}
