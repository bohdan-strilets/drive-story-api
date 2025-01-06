import { UserDocument } from 'src/user/schemes/user.schema';
import { UserInfo } from 'src/user/types/user-info';

export const sanitizeUserData = (user: UserDocument): UserInfo => {
  return {
    _id: user._id,
    email: user.email,
    gender: user.gender,
    avatars: user.avatars,
    posters: user.posters,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname,
    birthDate: user.birthDate,
    phoneNumber: user.phoneNumber,
    isActivated: user.isActivated,
    location: user.location,
  };
};
