import type { Task, TaskCreateInput } from '@agency-os/shared';
import {
  dependenciesSatisfied,
  type QueuePort,
  type TaskRepository,
  type TaskService,
} from '@agency-os/tasks';
import type { MessageBus } from '@agency-os/messaging';

export interface TaskDispatcherDeps {
  tasks: TaskService;
  repo: TaskRepository;
  queue: QueuePort;
  bus: MessageBus;
}

/**
 * Distribue les tâches suite aux décisions du CEO : crée, assigne, notifie
 * l'agent, et met en file d'exécution SI les dépendances sont satisfaites.
 * Le CEO distribue ; il n'exécute jamais (P1 — `TaskService.create` refuse un
 * agent = ceo). cf. docs/01-architecture.md §5, §7.
 */
export class TaskDispatcher {
  constructor(private readonly deps: TaskDispatcherDeps) {}

  /** Crée, assigne et (si prête) met en file une tâche. Retourne la tâche assignée. */
  async dispatch(input: TaskCreateInput): Promise<{ task: Task; enqueued: boolean }> {
    const created = await this.deps.tasks.create(input);
    const assigned = await this.deps.tasks.assign(created.id, 'ceo');

    await this.deps.bus.publish({
      from: 'ceo',
      to: assigned.agent,
      type: 'task_assignment',
      task_id: assigned.id,
    });

    const ready = await dependenciesSatisfied(assigned, this.deps.repo);
    if (ready) {
      await this.deps.queue.enqueue({
        taskId: assigned.id,
        agent: assigned.agent,
        siteId: assigned.site_id,
      });
    }
    return { task: assigned, enqueued: ready };
  }

  /**
   * Met en file les tâches assignées dont les dépendances sont désormais
   * satisfaites (appelé quand une tâche passe `done`). Retourne les ids enfilés.
   */
  async releaseReady(): Promise<string[]> {
    const assigned = await this.deps.repo.list({ status: 'assigned' });
    const released: string[] = [];
    for (const snapshot of assigned) {
      // Re-lecture de l'état frais : l'instantané peut être périmé si un
      // traitement en cours a déjà fait avancer cette tâche (évite un double
      // enfilement et donc une double exécution).
      const task = await this.deps.repo.getById(snapshot.id);
      if (!task || task.status !== 'assigned') continue;
      if (await dependenciesSatisfied(task, this.deps.repo)) {
        await this.deps.queue.enqueue({
          taskId: task.id,
          agent: task.agent,
          siteId: task.site_id,
        });
        released.push(task.id);
      }
    }
    return released;
  }
}
