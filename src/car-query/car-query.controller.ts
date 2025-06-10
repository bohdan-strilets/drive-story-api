import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarQueryService } from './car-query.service';
import { CarTrim } from './types/car-trim.type';
import { Make } from './types/make.type';
import { Model } from './types/model.type';

@Auth()
@Controller('v1/car-query')
export class CarQueryController {
  constructor(private readonly carQueryService: CarQueryService) {}

  @Get('makes')
  async getAllMakes(
    @Query('year') year?: string,
  ): Promise<ApiResponse<Make[]>> {
    return this.carQueryService.getAllMakes(year);
  }

  @Get('models')
  async getModelsForMake(
    @Query('make') make: string,
    @Query('year') year?: string,
  ): Promise<ApiResponse<Model[]>> {
    return this.carQueryService.getModelsForMake(make, year);
  }

  @Get('trims')
  async getTrims(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year') year: string,
  ): Promise<ApiResponse<CarTrim[]>> {
    return this.carQueryService.getTrims(make, model, year);
  }

  @Get('trims-by-id')
  async getTrimById(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year') year: string,
    @Query('trimsId') trimsId: string,
  ): Promise<ApiResponse<CarTrim>> {
    return this.carQueryService.getTrimById(make, model, year, trimsId);
  }
}
