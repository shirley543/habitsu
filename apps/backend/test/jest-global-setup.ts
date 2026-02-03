import * as path from 'path';
import * as fs from 'fs';
import { startPostgres } from './helpers/postgres-container';
import { prisma } from './helpers/prisma';
import { execSync } from 'child_process';

export default async function globalSetup() {
  // Start Postgres container
  await startPostgres();

  // Run Prisma DB migrations
  console.log('Running migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Load SQL functions from file
  console.log('Loading SQL functions...');
  const sqlFile = path.resolve(process.cwd(), 'src/database/dbStatisticFunctions.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');
  await prisma.$executeRawUnsafe(sql);
  
  console.log('Global setup finished, Postgres ready.');
}
