import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from '@habit-tracker/shared';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private envService: EnvService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.envService.get('SALT_ROUNDS'));
    const prismaInput: Prisma.UserCreateInput = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
    }
    return this.prisma.user.create({ data: prismaInput });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findOneByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } })
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }})
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const prismaInput: Prisma.UserUpdateInput = {
      username: updateUserDto.username,
      email: updateUserDto.email
    }
    return this.prisma.user.update({
      where: { id },
      data: prismaInput,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
