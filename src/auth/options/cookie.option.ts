import { CookieOptions } from 'express';

export const cookieKeys = {
  REFRESH_TOKEN: 'refresh-token',
};

export const cookieOptions: CookieOptions = {
  sameSite: 'none',
  secure: true,
  httpOnly: true,
};
