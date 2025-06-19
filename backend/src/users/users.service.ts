import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dtos';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const prismaInput: Prisma.UserCreateInput = {
      name: createUserDto.name,
      email: createUserDto.email,
    }
    return this.prisma.user.create({ data: prismaInput });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const prismaInput: Prisma.UserUpdateInput = {
      name: updateUserDto.name,
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
