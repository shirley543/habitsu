import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas';
import { EnvService } from '../env/env.service';
import {
  isPrismaClientError,
  PrismaClientError,
} from '../common/prisma/prismaError';
import { UserNotFoundError } from './errors/userNotFound.error';
import { UserPasswordInputInvalidError } from './errors/userPasswordInputInvalid.error';
import { UserAlreadyExistsError } from './errors/userAlreadyExists.error';
import {
  mapUserPrismaModelOrNullToDto,
  mapUserPrismaModelToDto,
  PROFILE_PUBLICITY_TYPE_TO_ENUM,
} from './users.mapping';

export const userResponseSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  email: true,
  profilePublicity: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private envService: EnvService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.envService.get('SALT_ROUNDS'),
    );
    const prismaInput: Prisma.UserCreateInput = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
    };
    try {
      const userModel = await this.prisma.user.create({
        data: prismaInput,
        select: userResponseSelect,
      });
      return mapUserPrismaModelToDto(userModel);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          isPrismaClientError(error.code) &&
          error.code === PrismaClientError.UniqueConstraintFailed
        ) {
          const field = (error.meta?.target as string[])?.[0] || 'user';
          throw new UserAlreadyExistsError(
            `A user with this ${field} already exists`,
          );
        }
      }
      throw error;
    }
  }

  findOne(id: number): Promise<UserResponseDto | null> {
    return this.prisma.user
      .findUnique({
        where: { id },
        select: userResponseSelect,
      })
      .then(mapUserPrismaModelOrNullToDto);
  }

  findOneByUsername(username: string): Promise<UserResponseDto | null> {
    return this.prisma.user
      .findUnique({
        where: { username },
        select: userResponseSelect,
      })
      .then(mapUserPrismaModelOrNullToDto);
  }

  findOneByEmail(email: string): Promise<UserResponseDto | null> {
    return this.prisma.user
      .findUnique({
        where: { email },
        select: userResponseSelect,
      })
      .then(mapUserPrismaModelOrNullToDto);
  }

  findOneByEmailFull(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user === null) {
      throw new UserNotFoundError(id);
    }

    // Require current password for sensitive updates (username, email, password)
    const requiresPassword =
      updateUserDto.username !== undefined ||
      updateUserDto.email !== undefined ||
      updateUserDto.password !== undefined;

    let passwordValid = true;
    if (requiresPassword) {
      if (!updateUserDto.currentPassword) {
        throw new UserPasswordInputInvalidError(
          'Current password is required for this update',
        );
      }
      passwordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );
    }
    if (!passwordValid) {
      throw new UserPasswordInputInvalidError('Invalid current password');
    }

    const hashedPassword =
      updateUserDto.password &&
      (await bcrypt.hash(
        updateUserDto.password,
        this.envService.get('SALT_ROUNDS'),
      ));

    const prismaInput: Prisma.UserUpdateInput = {};
    if (updateUserDto.username !== undefined) {
      prismaInput.username = updateUserDto.username;
    }
    if (updateUserDto.email !== undefined) {
      prismaInput.email = updateUserDto.email;
    }
    if (hashedPassword !== undefined) {
      prismaInput.password = hashedPassword;
    }
    if (updateUserDto.profilePublicity !== undefined) {
      prismaInput.profilePublicity =
        PROFILE_PUBLICITY_TYPE_TO_ENUM[updateUserDto.profilePublicity];
    }
    try {
      const userModel = await this.prisma.user.update({
        where: { id },
        data: prismaInput,
        select: userResponseSelect,
      });
      return mapUserPrismaModelToDto(userModel);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          isPrismaClientError(error.code) &&
          error.code === PrismaClientError.UniqueConstraintFailed
        ) {
          const field = (error.meta?.target as string[])?.[0] || 'user';
          throw new UserAlreadyExistsError(
            `A user with this ${field} already exists`,
          );
        }
      }
      throw error;
    }
  }

  remove(id: number): Promise<UserResponseDto> {
    return this.prisma.user
      .delete({
        where: { id },
        select: userResponseSelect,
      })
      .then(mapUserPrismaModelToDto);
  }
}
