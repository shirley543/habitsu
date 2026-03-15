/**
 * User object mapping helpers
 */

import { ProfilePublicityType, UserResponseDto } from "@habit-tracker/validation-schemas";
import { $Enums, User } from "@prisma/client";

export const PROFILE_PUBLICITY_ENUM_TO_TYPE: Record<$Enums.ProfilePublicity, ProfilePublicityType> = {
  [$Enums.ProfilePublicity.PRIVATE]: ProfilePublicityType.Private,
  [$Enums.ProfilePublicity.PUBLIC]: ProfilePublicityType.Public,
};

export const PROFILE_PUBLICITY_TYPE_TO_ENUM: Record<ProfilePublicityType, $Enums.ProfilePublicity> = {
  [ProfilePublicityType.Private]: $Enums.ProfilePublicity.PRIVATE,
  [ProfilePublicityType.Public]: $Enums.ProfilePublicity.PUBLIC,
};

export function mapUserPrismaModelToDto(userPrisma: User): UserResponseDto {
  const userResponse: UserResponseDto = {
    id: userPrisma.id,
    username: userPrisma.username,
    email: userPrisma.email,
    profilePublicity: PROFILE_PUBLICITY_ENUM_TO_TYPE[userPrisma.profilePublicity]
  };
  return userResponse;
}

export function mapUserPrismaModelOrNullToDto(userPrisma: User | null): UserResponseDto | null {
  if (userPrisma === null) {
    return null;
  }

  return mapUserPrismaModelToDto(userPrisma);
}
