import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ApiResponse } from 'src/helpers/api-response.type';
import { UserService } from './user.service';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('activation-email/:activationToken')
  async activationEmail(
    @Param('activationToken') activationToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const clientUrl = this.configService.get('CLIENT_URL');
    res.redirect(`${clientUrl}activation-success`);

    const data = await this.userService.activationEmail(activationToken);
    if (!data.success) res.status(data.statusCode);
    return data;
  }
}
