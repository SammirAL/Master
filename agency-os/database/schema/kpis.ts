import { pgTable, bigserial, text, doublePrecision, timestamp, index } from 'drizzle-orm/pg-core';
import { sites } from './sites.js';

/**
 * Table `kpis` — snapshots historisés des indicateurs par site.
 * Alimentée périodiquement par l'ingestion analytics (GSC/GA4/Ads/Stripe).
 * cf. docs/05-flux-de-donnees.md (Flux 3). L'historisation permet l'avant/après.
 */
export const kpis = pgTable(
  'kpis',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id),
    clientId: text('client_id'),
    name: text('name').notNull(), // ex. organic_sessions, lcp_ms
    value: doublePrecision('value').notNull(),
    unit: text('unit'),
    source: text('source').notNull(), // ga4 | gsc | google-ads | stripe | manual
    capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [
    index('kpis_site_name_idx').on(t.siteId, t.name),
    index('kpis_captured_at_idx').on(t.capturedAt),
  ],
);
