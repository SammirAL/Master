import { pgTable, bigserial, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { sites } from './sites.js';

/**
 * Table `keywords` — suivi des mots-clés par site (intentions, positions).
 * Alimente la stratégie SEO et la collection mémoire `mem_keywords`.
 * Les positions sont historisées (une ligne par capture) pour l'avant/après.
 */
export const keywords = pgTable(
  'keywords',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id),
    keyword: text('keyword').notNull(),
    intent: text('intent'), // informational | commercial | transactional | navigational
    position: integer('position'),
    capturedAt: timestamp('captured_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [index('keywords_site_keyword_idx').on(t.siteId, t.keyword)],
);
