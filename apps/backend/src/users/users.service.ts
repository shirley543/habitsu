import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas';
import { EnvService } from '../env/env.service';

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
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'user';
          throw new ConflictException(`A user with this ${field} already exists`);
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

  update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const prismaInput: Prisma.UserUpdateInput = {
      username: updateUserDto.username,
      email: updateUserDto.email,
    };
    try {
      return this.prisma.user.update({
        where: { id },
        data: prismaInput,
        select: userResponseSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'user';
          throw new ConflictException(`A user with this ${field} already exists`);
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

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOneByEmailFull(
      (await this.prisma.user.findUnique({ where: { id } }))?.email || '',
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      this.envService.get('SALT_ROUNDS'),
    );

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }
}
