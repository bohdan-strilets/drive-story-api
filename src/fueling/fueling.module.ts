import { Module } from '@nestjs/common';
import { FuelingService } from './fueling.service';
import { FuelingController } from './fueling.controller';

@Module({
  controllers: [FuelingController],
  providers: [FuelingService],
})
export class FuelingModule {}
