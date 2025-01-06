import { Tokens } from 'src/token/types/tokens.type';
import { UserInfo } from 'src/user/types/user-info';

export type AuthResponse = {
  user: UserInfo;
  tokens: Tokens;
};
