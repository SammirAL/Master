import type { Task } from '@agency-os/shared';
import type { TaskFilter, TaskRepository } from '../ports.js';

/**
 * Dépôt de tâches en mémoire — pour les tests et le développement local.
 * Clone les objets en entrée/sortie pour éviter toute mutation partagée.
 */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, Task>();

  async create(task: Task): Promise<Task> {
    if (this.store.has(task.id)) {
      throw new Error(`Tâche déjà existante : ${task.id}`);
    }
    this.store.set(task.id, structuredClone(task));
    return structuredClone(task);
  }

  async getById(id: string): Promise<Task | null> {
    const t = this.store.get(id);
    return t ? structuredClone(t) : null;
  }

  async update(task: Task): Promise<Task> {
    if (!this.store.has(task.id)) {
      throw new Error(`Tâche introuvable : ${task.id}`);
    }
    this.store.set(task.id, structuredClone(task));
    return structuredClone(task);
  }

  async list(filter: TaskFilter = {}): Promise<Task[]> {
    return [...this.store.values()]
      .filter((t) => (filter.status ? t.status === filter.status : true))
      .filter((t) => (filter.agent ? t.agent === filter.agent : true))
      .filter((t) => (filter.siteId !== undefined ? t.site_id === filter.siteId : true))
      .filter((t) =>
        filter.workflowRunId !== undefined ? t.workflow_run_id === filter.workflowRunId : true,
      )
      .map((t) => structuredClone(t));
  }
}
