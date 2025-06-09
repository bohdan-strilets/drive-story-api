// car-query.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { CarQueryHelper } from './car-query.helpers';
import { CarTrim } from './types/car-trim.type';
import { MakeResponse } from './types/make-response.type';
import { Make } from './types/make.type';
import { ModelResponse } from './types/model-response.type';

@Injectable()
export class CarQueryService {
  constructor(
    private readonly carQueryHelper: CarQueryHelper,
    private readonly responseService: ResponseService,
  ) {}

  async getAllMakes(year?: string): Promise<ApiResponse<MakeResponse>> {
    const params: { year?: string } = {};
    if (year) params.year = year;

    const result = await this.carQueryHelper.requestCarQuery(
      'getMakes',
      params,
    );

    const commonMakes = result.Makes.filter(
      (make: Make) => make.make_is_common === '1',
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      commonMakes,
    );
  }

  async getModelsForMake(
    makeId: string,
    year?: string,
  ): Promise<ApiResponse<ModelResponse>> {
    this.carQueryHelper.isValidMakeId(makeId);

    const params: { make: string; year?: string } = { make: makeId };
    if (year) params.year = year;

    const result = await this.carQueryHelper.requestCarQuery(
      'getModels',
      params,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      result.Models,
    );
  }

  async getTrims(
    makeId: string,
    modelName: string,
    year: string,
  ): Promise<ApiResponse<CarTrim[]>> {
    this.carQueryHelper.isValidMakeId(makeId);
    this.carQueryHelper.isValidModelName(modelName);
    this.carQueryHelper.isValidYear(year);

    const params: { make: string; model: string; year: string } = {
      make: makeId,
      model: modelName,
      year: year,
    };

    const result = await this.carQueryHelper.requestCarQuery(
      'getTrims',
      params,
    );

    return this.responseService.createSuccessResponse(
      HttpStatus.OK,
      result.Trims,
    );
  }
}
