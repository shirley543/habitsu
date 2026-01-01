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
    return this.prisma.user.create({
      data: prismaInput,
      select: userResponseSelect,
    });
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
    return this.prisma.user.update({
      where: { id },
      data: prismaInput,
      select: userResponseSelect,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: userResponseSelect,
    });
  }
}
