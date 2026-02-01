import { stopPostgres } from './helpers/postgres-container';

export default async function globalTeardown() {
  console.log('Stopping Postgres container...');
  await stopPostgres();
}
