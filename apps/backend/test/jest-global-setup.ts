import { startPostgres } from './helpers/postgres-container';
import { execSync } from 'child_process';

export default async function globalSetup() {
  // Start Postgres container
  const connectionUri = await startPostgres();

  // Run Prisma DB migrations
  console.log('Running migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Load SQL functions from file
  console.log('Loading SQL functions...');
  execSync(
    `psql -d "${connectionUri}" -f src/database/dbStatisticFunctions.sql`,
    { stdio: 'inherit' },
  );

  console.log('Global setup finished, Postgres ready.');
}
