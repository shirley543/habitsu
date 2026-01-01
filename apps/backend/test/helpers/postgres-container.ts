/**
 * Starts a real Postgres container for integration tests.
 * Provides a fresh, isolated database for each test run.
 */
import { PostgreSqlContainer } from 'testcontainers';

let container: PostgreSqlContainer;

export async function startPostgres() {
  container = await new PostgreSqlContainer('postgres:15')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
}

export async function stopPostgres() {
  if (container) {
    await container.stop();
  }
}
