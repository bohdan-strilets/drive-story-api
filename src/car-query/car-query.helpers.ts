import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppError } from 'src/error/app-error';
import { errorMessages } from 'src/error/helpers/error-messages.helper';

@Injectable()
export class CarQueryHelper {
  private readonly logger = new Logger(CarQueryHelper.name);
  private readonly carQueryBaseUrl = 'https://www.carqueryapi.com/api/0.3/';

  constructor(private readonly httpService: HttpService) {}

  private createQueryString(allParams: Record<string, string>): string {
    const queryString = Object.entries(allParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    return queryString;
  }

  async requestCarQuery(
    cmd: string,
    params: Record<string, string> = {},
  ): Promise<any> {
    const timestamp = Date.now();
    const callbackName = `carquery_cb_${timestamp}`;

    const allParams: Record<string, string> = {
      cmd,
      callback: callbackName,
      ...params,
    };

    const queryString = this.createQueryString(allParams);
    const url = `${this.carQueryBaseUrl}?${queryString}`;

    this.logger.debug(`Request to CarQuery: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(url, { responseType: 'text' }),
      );

      const bodyText = response.data;
      const jsonMatch = bodyText.match(/^[^(]+\(([\s\S]*)\);?$/);

      if (!jsonMatch || jsonMatch.length < 2) {
        this.logger.error(`Invalid JSONP: ${bodyText}`);
        throw new Error('Invalid JSONP response from CarQuery');
      }

      const jsonString = jsonMatch[1];
      const data = JSON.parse(jsonString);

      return data;
    } catch (error) {
      this.logger.error(`CarQuery request failed: ${error.message}`);
      throw new Error(`CarQuery request failed: ${error.message}`);
    }
  }

  isValidMakeId(makeId: string) {
    if (!makeId) {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.MARK_REQUIRED);
    }
  }

  isValidModelName(modelName: string) {
    if (!modelName) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        errorMessages.MODEL_NAME_REQUIRED,
      );
    }
  }

  isValidYear(year: string) {
    if (!year) {
      throw new AppError(HttpStatus.BAD_REQUEST, errorMessages.YEAR_REQUIRED);
    }
  }
}
