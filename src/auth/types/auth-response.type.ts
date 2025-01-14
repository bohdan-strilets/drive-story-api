import { TokenPair } from 'src/token/types/token-pair.type';
import { UserInfo } from 'src/user/types/user-info';

export type AuthResponse = {
  user: UserInfo;
  tokens: TokenPair;
};
