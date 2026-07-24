import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { sites } from './sites.js';

/**
 * Table `competitors` — concurrents suivis par site. Alimente la veille
 * (Competitor Analyst) et la collection mémoire `mem_competitors`.
 */
export const competitors = pgTable(
  'competitors',
  {
    id: text('id').primaryKey(), // comp_<slug>
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id),
    name: text('name').notNull(),
    url: text('url'),
    notes: jsonb('notes').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [index('competitors_site_id_idx').on(t.siteId)],
);
