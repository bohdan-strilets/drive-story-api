import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiResponse } from 'src/response/types/api-response.type';
import { User } from 'src/user/decorators/user.decorator';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { CarDocument } from './schemas/car.schema';

@Controller('v1/car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Auth()
  @Post('added')
  async addedCar(
    @Body() dto: CreateCarDto,
    @Res({ passthrough: true }) res: Response,
    @User('_id') userId: string,
  ): Promise<ApiResponse<CarDocument>> {
    const data = await this.carService.addedCar(userId, dto);
    if (!data.success) res.status(data.statusCode);
    return data;
  }
}
