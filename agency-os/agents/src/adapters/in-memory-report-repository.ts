import type { Report } from '@agency-os/shared';
import type { ReportRepository } from '../runtime/ports.js';

/** Dépôt de rapports en mémoire (tests, développement local). */
export class InMemoryReportRepository implements ReportRepository {
  private readonly store = new Map<string, Report>();

  async create(report: Report): Promise<Report> {
    this.store.set(report.id, structuredClone(report));
    return structuredClone(report);
  }

  async getById(id: string): Promise<Report | null> {
    const r = this.store.get(id);
    return r ? structuredClone(r) : null;
  }
}
