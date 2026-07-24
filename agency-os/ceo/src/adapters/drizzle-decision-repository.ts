import { eq } from 'drizzle-orm';
import { schema } from '@agency-os/database';
import { decision as decisionSchema, type Decision } from '@agency-os/shared';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { DecisionRepository } from '../ports.js';

type Db = NodePgDatabase<typeof schema>;
type Row = typeof schema.decisions.$inferSelect;

function rowToDecision(row: Row): Decision {
  return decisionSchema.parse({
    id: row.id,
    kind: row.kind,
    subject: row.subject,
    context_refs: row.contextRefs,
    options_considered: row.optionsConsidered,
    decision: row.decision,
    rationale: row.rationale,
    conditions: row.conditions,
    decided_by: row.decidedBy,
    at: row.at.toISOString(),
  });
}

/** Dépôt de décisions adossé à PostgreSQL via Drizzle (append-only). */
export class DrizzleDecisionRepository implements DecisionRepository {
  constructor(private readonly db: Db) {}

  async create(decision: Decision): Promise<Decision> {
    await this.db.insert(schema.decisions).values({
      id: decision.id,
      kind: decision.kind,
      subject: decision.subject,
      contextRefs: decision.context_refs,
      optionsConsidered: decision.options_considered,
      decision: decision.decision,
      rationale: decision.rationale,
      conditions: decision.conditions,
      decidedBy: decision.decided_by,
      at: new Date(decision.at),
    });
    return decision;
  }

  async getById(id: string): Promise<Decision | null> {
    const rows = await this.db.select().from(schema.decisions).where(eq(schema.decisions.id, id));
    const row = rows[0];
    return row ? rowToDecision(row) : null;
  }

  async list(filter: { taskId?: string } = {}): Promise<Decision[]> {
    const rows = await this.db.select().from(schema.decisions);
    const all = rows.map(rowToDecision);
    return filter.taskId ? all.filter((d) => d.subject.task_id === filter.taskId) : all;
  }
}
