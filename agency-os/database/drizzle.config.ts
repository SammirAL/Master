import { defineConfig } from 'drizzle-kit';

/**
 * Configuration Drizzle Kit — génération des migrations SQL à partir du schéma.
 * `pnpm --filter @agency-os/database generate` produit les fichiers de
 * `migrations/` sans connexion à la base (diff de schéma).
 */
export default defineConfig({
  // Schéma compilé : `generate` dépend donc de `build` (voir README).
  // drizzle-kit ne résout pas les imports `.js`→`.ts` (NodeNext) sur les sources.
  schema: './dist/schema/index.js',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://agency:agency@localhost:5432/agency_os',
  },
  strict: true,
  verbose: true,
});
