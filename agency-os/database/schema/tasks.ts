import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import type { Task } from '@agency-os/shared';
import { taskStatusEnum, priorityEnum, permissionLevelEnum } from './enums.js';
import { sites } from './sites.js';
import { clients } from './clients.js';

/** Table `tasks`. cf. docs/07-schemas.md §1. `history` et `logs` sont append-only côté service. */
export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(), // TSK-YYYYMMDD-xxxxxx
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: priorityEnum('priority').notNull(),
    siteId: text('site_id').references(() => sites.id),
    clientId: text('client_id').references(() => clients.id),
    agent: text('agent').notNull(),
    createdBy: text('created_by').notNull(),
    workflowRunId: text('workflow_run_id'),
    dependsOn: jsonb('depends_on').$type<Task['depends_on']>().notNull().default([]),
    deadline: timestamp('deadline', { withTimezone: true, mode: 'date' }),
    status: taskStatusEnum('status').notNull(),
    permissionLevelRequired: permissionLevelEnum('permission_level_required').notNull(),
    validation: jsonb('validation').$type<Task['validation']>(),
    logs: jsonb('logs').$type<Task['logs']>().notNull().default([]),
    result: jsonb('result').$type<Task['result']>(),
    history: jsonb('history').$type<Task['history']>().notNull().default([]),
    cost: jsonb('cost').$type<Task['cost']>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [
    index('tasks_site_id_idx').on(t.siteId),
    index('tasks_status_idx').on(t.status),
    index('tasks_agent_idx').on(t.agent),
  ],
);
