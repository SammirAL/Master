import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './client.js';

/**
 * Applique les migrations SQL de `migrations/` sur la base pointée par
 * `DATABASE_URL`. Nécessite le PostgreSQL du docker-compose (infra/).
 * Lancer : `pnpm --filter @agency-os/database migrate`.
 */
async function main(): Promise<void> {
  const { db, close } = createDb();
  try {
    await migrate(db, { migrationsFolder: new URL('../migrations', import.meta.url).pathname });
    console.log('✓ Migrations appliquées.');
  } finally {
    await close();
  }
}

main().catch((err: unknown) => {
  console.error('✗ Échec des migrations :', err);
  process.exitCode = 1;
});
