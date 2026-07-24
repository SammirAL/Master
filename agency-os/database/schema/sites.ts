import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import type { Site } from '@agency-os/shared';
import { platformEnum, siteStatusEnum } from './enums.js';
import { clients } from './clients.js';

/** Table `sites`. cf. docs/07-schemas.md §6. Partitionnement multi-sites (P6). */
export const sites = pgTable(
  'sites',
  {
    id: text('id').primaryKey(), // site_<slug>
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    name: text('name').notNull(),
    url: text('url').notNull(),
    platform: platformEnum('platform').notNull(),
    environments: jsonb('environments').$type<Site['environments']>().notNull(),
    repo: jsonb('repo').$type<Site['repo']>(),
    credentialsRef: text('credentials_ref').notNull(),
    objectives: jsonb('objectives').$type<Site['objectives']>().notNull().default([]),
    kpis: jsonb('kpis').$type<Site['kpis']>().notNull().default([]),
    competitors: jsonb('competitors').$type<Site['competitors']>().notNull().default([]),
    constraints: jsonb('constraints').$type<Site['constraints']>().notNull().default([]),
    status: siteStatusEnum('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [index('sites_client_id_idx').on(t.clientId)],
);
