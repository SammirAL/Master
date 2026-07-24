import { eq } from 'drizzle-orm';
import { schema } from '@agency-os/database';
import { report as reportSchema, type Report } from '@agency-os/shared';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ReportRepository } from '../runtime/ports.js';

type Db = NodePgDatabase<typeof schema>;
type Row = typeof schema.reports.$inferSelect;

function rowToReport(row: Row): Report {
  return reportSchema.parse({
    id: row.id,
    task_id: row.taskId,
    agent: row.agent,
    site_id: row.siteId,
    client_id: row.clientId,
    period: row.period,
    status_global: row.statusGlobal,
    sections: row.sections,
    created_at: row.createdAt.toISOString(),
  });
}

/** Dépôt de rapports adossé à PostgreSQL via Drizzle. */
export class DrizzleReportRepository implements ReportRepository {
  constructor(private readonly db: Db) {}

  async create(report: Report): Promise<Report> {
    await this.db.insert(schema.reports).values({
      id: report.id,
      taskId: report.task_id,
      agent: report.agent,
      siteId: report.site_id,
      clientId: report.client_id,
      period: report.period,
      statusGlobal: report.status_global,
      sections: report.sections,
      createdAt: new Date(report.created_at),
    });
    return report;
  }

  async getById(id: string): Promise<Report | null> {
    const rows = await this.db.select().from(schema.reports).where(eq(schema.reports.id, id));
    const row = rows[0];
    return row ? rowToReport(row) : null;
  }
}
