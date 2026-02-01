/**
 * Starts a real Postgres container for integration tests.
 * Provides a fresh, isolated database for each test run.
 */
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

export async function startPostgres() {
  console.log('Start postgres');

  container = await new PostgreSqlContainer('postgres:15')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .start();

  // Override database URL to point to PostgreSQL test container
  process.env.DATABASE_URL = container.getConnectionUri();

  // Override other environment variables for test
  process.env.JWT_SECRET = 'jwtsecret';
  process.env.JWT_EXPIRY = '3600s';
  process.env.PORT = '3000';
  process.env.SALT_ROUNDS = '1';
}

export async function stopPostgres() {
  if (container) {
    await container.stop();
  }
}
