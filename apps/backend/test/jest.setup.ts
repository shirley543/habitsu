import { startPostgres, stopPostgres } from './helpers/postgres-container';
import { execSync } from 'child_process';

beforeAll(async () => {
  await startPostgres();

  // Apply migrations to the fresh DB
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
  });
});

afterAll(async () => {
  await stopPostgres();
});
