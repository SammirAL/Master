import pg from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index.js';

/**
 * Fabrique une connexion Drizzle vers PostgreSQL. L'URL provient de
 * `DATABASE_URL` (cf. .env.example). Le pool est fermé par `close()`.
 */
export function createDb(databaseUrl = process.env['DATABASE_URL']): {
  db: NodePgDatabase<typeof schema>;
  pool: pg.Pool;
  close: () => Promise<void>;
} {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL est requis pour se connecter à PostgreSQL.');
  }
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  return { db, pool, close: () => pool.end() };
}

export { schema };
