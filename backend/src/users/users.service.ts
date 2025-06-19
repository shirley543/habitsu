import { User } from '@prisma/client'
import prisma from '../prisma/prisma';

export async function fetchAllUsers(orderBy?: string, order?: string, search?: string): Promise<User[]> {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { email: { contains: String(search), mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { goals: true },
    orderBy: { [orderBy as string]: order },
  })
}

export async function fetchUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function registerNewUser(data: {
  name: string,
  email: string,
  // TODOs: Add password (hashed before storing in DB. argon2? scrypt? bcrypt? Follow OWASP recommendations) + avatar
  // TODOs: Setup SSL cert (Let's Encrypt? Cloudflare? ZeroSSL? Free vs. Paid, Duration) for encrypted data transmission
}): Promise<User> {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
    }
  })
}

// TODOs: updateUser, deleteUser


import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  findDrafts() {
    return this.prisma.user.findMany({ where: { published: false } });
  }

  findAll() {
    return this.prisma.user.findMany({ where: { published: true } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
