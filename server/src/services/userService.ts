import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient();

export async function fetchAllUsers(): Promise<User[]> {
  return prisma.user.findMany()
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