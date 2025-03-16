import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { ResponseService } from './response/response.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const responseService = app.get(ResponseService);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new HttpExceptionFilter(responseService));
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('CLIENT_URL'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  await app.listen(configService.get('PORT') || 4040);
}

bootstrap();
