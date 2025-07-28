import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
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
