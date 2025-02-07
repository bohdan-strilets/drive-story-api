import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../schemes/user.schema';

type TypeData = keyof UserDocument;

export const User = createParamDecorator(
  (property: TypeData, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return property ? user?.[property] : user;
  },
);
