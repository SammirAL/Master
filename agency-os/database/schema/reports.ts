import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import type { Report } from '@agency-os/shared';
import { statusGlobalEnum } from './enums.js';
import { tasks } from './tasks.js';

/** Table `reports`. cf. docs/07-schemas.md §2 (format unique, P4). */
export const reports = pgTable(
  'reports',
  {
    id: text('id').primaryKey(), // RPT-YYYYMMDD-xxxxxx
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id),
    agent: text('agent').notNull(),
    siteId: text('site_id'),
    clientId: text('client_id'),
    period: jsonb('period').$type<Report['period']>(),
    statusGlobal: statusGlobalEnum('status_global').notNull(),
    sections: jsonb('sections').$type<Report['sections']>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [index('reports_task_id_idx').on(t.taskId), index('reports_site_id_idx').on(t.siteId)],
);
