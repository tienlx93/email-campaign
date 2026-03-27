import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import knex from 'knex';

let container: StartedPostgreSqlContainer;

export async function setup(): Promise<void> {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();

  const connectionString = container.getConnectionUri();
  process.env.DATABASE_URL = connectionString;
  process.env.TEST_DATABASE_URL = connectionString;
  process.env.NODE_ENV = 'test';

  const db = knex({
    client: 'pg',
    connection: connectionString,
    migrations: {
      directory: 'src/db/migrations',
    },
  });

  try {
    await db.migrate.latest();
  } finally {
    await db.destroy();
  }
}

export async function teardown(): Promise<void> {
  await container?.stop();
}
