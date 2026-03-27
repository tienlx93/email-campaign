import type { Knex } from 'knex';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://campaign:campaign@localhost:5432/campaign';

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || DATABASE_URL;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: DATABASE_URL,
    migrations: {
      directory: 'src/db/migrations',
    },
    seeds: {
      directory: 'src/db/seeds',
    },
  },

  test: {
    client: 'pg',
    connection: TEST_DATABASE_URL,
    migrations: {
      directory: 'src/db/migrations',
    },
    seeds: {
      directory: 'src/db/seeds',
    },
  },
};

export default config;
