import type { Decision } from '@agency-os/shared';
import type { DecisionRepository } from '../ports.js';

/** Dépôt de décisions en mémoire (tests, développement local). */
export class InMemoryDecisionRepository implements DecisionRepository {
  private readonly store = new Map<string, Decision>();

  async create(decision: Decision): Promise<Decision> {
    this.store.set(decision.id, structuredClone(decision));
    return structuredClone(decision);
  }

  async getById(id: string): Promise<Decision | null> {
    const d = this.store.get(id);
    return d ? structuredClone(d) : null;
  }

  async list(filter: { taskId?: string } = {}): Promise<Decision[]> {
    return [...this.store.values()]
      .filter((d) => (filter.taskId ? d.subject.task_id === filter.taskId : true))
      .map((d) => structuredClone(d));
  }
}
