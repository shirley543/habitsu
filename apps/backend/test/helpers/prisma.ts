/**
 * Test-only Prisma client.
 * Used by tests for DB setup, cleanup, seeding
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
