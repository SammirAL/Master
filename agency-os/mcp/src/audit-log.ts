import { eq, desc } from 'drizzle-orm';
import { schema } from '@agency-os/database';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { McpAuditEntry, McpAuditSink } from './ports.js';

/**
 * Redige un résumé d'arguments pour l'audit : masque les valeurs sensibles
 * (clés d'API, tokens, secrets). Les secrets injectés par le broker ne
 * transitent JAMAIS par ici (ils sont dans `ctx.secrets`, hors `args`), mais
 * cette rédaction est une défense en profondeur.
 */
const SECRET_KEY_RE = /(key|token|secret|password|authorization|apikey|api_key)/i;
const SECRET_VALUE_RE = /^(fc-|sk-|pk_|ghp_|gho_|xox[baprs]-|Bearer\s)/i;

export function redactArgs(args: Record<string, unknown>): string {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    if (SECRET_KEY_RE.test(k)) {
      safe[k] = '«redacted»';
    } else if (typeof v === 'string' && (SECRET_VALUE_RE.test(v) || v.length > 256)) {
      safe[k] = typeof v === 'string' && SECRET_VALUE_RE.test(v) ? '«redacted»' : `${v.slice(0, 253)}…`;
    } else {
      safe[k] = v;
    }
  }
  try {
    return JSON.stringify(safe).slice(0, 1000);
  } catch {
    return '«unserializable»';
  }
}

/** Journal d'audit en mémoire (tests, développement local). */
export class InMemoryAuditSink implements McpAuditSink {
  readonly entries: McpAuditEntry[] = [];
  async record(entry: McpAuditEntry): Promise<void> {
    this.entries.push({ ...entry });
  }
  violations(): McpAuditEntry[] {
    return this.entries.filter((e) => e.kind === 'violation');
  }
}

/** Journal d'audit adossé à PostgreSQL (`audit_log`, append-only). */
export class DrizzleAuditSink implements McpAuditSink {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async record(entry: McpAuditEntry): Promise<void> {
    await this.db.insert(schema.auditLog).values({
      at: new Date(entry.at),
      kind: entry.kind,
      actor: entry.actor,
      taskId: entry.taskId,
      server: entry.server,
      method: entry.method,
      argsSummary: entry.argsSummary,
      result: entry.result,
      durationMs: entry.durationMs,
      detail: entry.detail ?? null,
    });
  }

  async recent(actor: string, limit = 20): Promise<McpAuditEntry[]> {
    const rows = await this.db
      .select()
      .from(schema.auditLog)
      .where(eq(schema.auditLog.actor, actor))
      .orderBy(desc(schema.auditLog.id))
      .limit(limit);
    return rows.map((r): McpAuditEntry => {
      const base: McpAuditEntry = {
        at: r.at.toISOString(),
        kind: r.kind === 'violation' ? 'violation' : 'mcp_call',
        actor: r.actor,
        taskId: r.taskId,
        server: r.server,
        method: r.method,
        argsSummary: r.argsSummary,
        result: r.result,
        durationMs: r.durationMs,
      };
      return r.detail ? { ...base, detail: r.detail } : base;
    });
  }
}
