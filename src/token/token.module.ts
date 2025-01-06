import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './schemas/token.schema';
import { TokenService } from './token.service';

const jwtConfig = {
  secret: process.env.ACCESS_TOKEN_KEY,
  signOptions: { expiresIn: process.env.ACCESS_TOKEN_TIME },
};

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    JwtModule.register(jwtConfig),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
