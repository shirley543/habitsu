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

export const userResponseSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  email: true,
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
      return await this.prisma.user.create({
        data: prismaInput,
        select: userResponseSelect,
      });
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
    return this.prisma.user.findUnique({
      where: { id },
      select: userResponseSelect,
    });
  }

  findOneByUsername(username: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: userResponseSelect,
    });
  }

  findOneByEmail(email: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userResponseSelect,
    });
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

    const passwordValid = user
      ? await bcrypt.compare(updateUserDto.currentPassword, user.password)
      : false;
    if (!passwordValid) {
      throw new UserPasswordInputInvalidError('Invalid current password');
    }

    const hashedPassword =
      updateUserDto.password &&
      (await bcrypt.hash(
        updateUserDto.password,
        this.envService.get('SALT_ROUNDS'),
      ));

    const prismaInput: Prisma.UserUpdateInput = {
      username: updateUserDto.username,
      email: updateUserDto.email,
      password: hashedPassword,
    };
    try {
      return await this.prisma.user.update({
        where: { id },
        data: prismaInput,
        select: userResponseSelect,
      });
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

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: userResponseSelect,
    });
  }
}
