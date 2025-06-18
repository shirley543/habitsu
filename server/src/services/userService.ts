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