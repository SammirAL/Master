import { pgTable, text, integer, bigint, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * Table `agents_state` — état et historique agrégé par agent.
 * Matérialise l'exigence « chaque agent a son historique » : combinée au
 * journal d'audit filtré par agent et aux `task.history`, elle constitue
 * l'historique complet. cf. docs/03-agents/README.md (Historique par agent).
 */
export const agentsState = pgTable('agents_state', {
  agent: text('agent').primaryKey(), // slug
  runs: integer('runs').notNull().default(0),
  successRate: numeric('success_rate', { precision: 5, scale: 4 }).notNull().default('0'),
  tokensCumulative: bigint('tokens_cumulative', { mode: 'number' }).notNull().default(0),
  mcpCallsCumulative: bigint('mcp_calls_cumulative', { mode: 'number' }).notNull().default(0),
  costUsdCumulative: numeric('cost_usd_cumulative', { precision: 12, scale: 4 })
    .notNull()
    .default('0'),
  lastHeartbeat: timestamp('last_heartbeat', { withTimezone: true, mode: 'date' }),
  killSwitch: boolean('kill_switch').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});
