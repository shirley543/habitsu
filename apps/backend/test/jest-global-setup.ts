import { startPostgres } from './helpers/postgres-container';
import { execSync } from 'child_process';

export default async function globalSetup() {
  await startPostgres();

  console.log('Running migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('Global setup finished, Postgres ready.');
}
