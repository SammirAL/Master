import { pgTable, bigserial, text, jsonb, integer, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * Table `audit_log` — journal append-only de toute action traçable :
 * appels MCP, décisions, validations, messages, violations (P5).
 * cf. docs/01-architecture.md §9.5 et docs/05-flux-de-donnees.md (Flux 6).
 */
export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    at: timestamp('at', { withTimezone: true, mode: 'date' }).notNull(),
    kind: text('kind').notNull(), // mcp_call | decision | validation | message | violation
    actor: text('actor').notNull(), // slug agent | ceo | human:<id> | system
    taskId: text('task_id'),
    server: text('server'), // serveur MCP (si kind = mcp_call/violation)
    method: text('method'),
    argsSummary: text('args_summary'),
    result: text('result'),
    durationMs: integer('duration_ms'),
    detail: jsonb('detail').$type<Record<string, unknown>>(),
  },
  (t) => [
    index('audit_log_actor_idx').on(t.actor),
    index('audit_log_task_id_idx').on(t.taskId),
    index('audit_log_kind_idx').on(t.kind),
  ],
);
