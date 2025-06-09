import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ResponseModule } from 'src/response/response.module';
import { CarQueryController } from './car-query.controller';
import { CarQueryHelper } from './car-query.helpers';
import { CarQueryService } from './car-query.service';

@Module({
  imports: [
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    ResponseModule,
  ],
  controllers: [CarQueryController],
  providers: [CarQueryService, CarQueryHelper],
})
export class CarQueryModule {}
