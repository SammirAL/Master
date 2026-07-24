import {
  task as taskSchema,
  taskCreateInput as taskCreateInputSchema,
  makeId,
  CeoCannotExecuteError,
  NotFoundError,
  type Task,
  type TaskCreateInput,
  type TaskStatus,
} from '@agency-os/shared';
import type { Clock, TaskRepository } from './ports.js';
import { systemClock } from './clock.js';
import { assertTransition } from './state-machine.js';

/** Auteur d'une transition d'état (traçabilité). */
export type TransitionActor = string; // "ceo" | "worker:w-04" | "human:<id>" | "system"

/**
 * Service applicatif des tâches : création et transitions d'état, avec un
 * `history` strictement append-only (P5). Toute mutation passe par ici.
 */
export class TaskService {
  constructor(
    private readonly repo: TaskRepository,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Crée une tâche à l'état `draft`. Refuse une tâche assignée au CEO (P1). */
  async create(input: TaskCreateInput): Promise<Task> {
    const parsed = taskCreateInputSchema.parse(input);

    if (parsed.agent === 'ceo') {
      throw new CeoCannotExecuteError(
        'Le CEO ne peut pas se voir assigner une tâche d\'exécution.',
        { agent: parsed.agent },
      );
    }

    const now = this.clock.nowIso();
    const requiresValidation = parsed.permission_level_required === 'L3';

    const candidate: Task = {
      id: makeId('task', this.clock.now()),
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority,
      site_id: parsed.site_id,
      client_id: parsed.client_id,
      agent: parsed.agent,
      created_by: parsed.created_by,
      workflow_run_id: parsed.workflow_run_id,
      depends_on: parsed.depends_on,
      deadline: parsed.deadline,
      status: 'draft',
      permission_level_required: parsed.permission_level_required,
      validation: requiresValidation
        ? { required: true, requested_at: null, decided_by: null, decision_id: null }
        : null,
      logs: [],
      result: null,
      history: [{ at: now, from: null, to: 'draft', by: parsed.created_by, reason: 'création' }],
      cost: { llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 },
      created_at: now,
      updated_at: now,
    };

    const valid = taskSchema.parse(candidate);
    return this.repo.create(valid);
  }

  /**
   * Applique une transition d'état validée par la machine à états, en
   * ajoutant une entrée immuable à `history`. Ne réécrit jamais l'historique.
   */
  async transition(
    id: string,
    to: TaskStatus,
    by: TransitionActor,
    reason: string,
  ): Promise<Task> {
    const current = await this.getOrThrow(id);
    assertTransition(current.status, to);

    const now = this.clock.nowIso();
    const next: Task = {
      ...current,
      status: to,
      history: [...current.history, { at: now, from: current.status, to, by, reason }],
      updated_at: now,
    };
    return this.repo.update(taskSchema.parse(next));
  }

  async getById(id: string): Promise<Task | null> {
    return this.repo.getById(id);
  }

  private async getOrThrow(id: string): Promise<Task> {
    const t = await this.repo.getById(id);
    if (!t) throw new NotFoundError(`Tâche introuvable : ${id}`, { id });
    return t;
  }

  // ── Raccourcis nommés (chaque transition reste validée par la machine à états) ──
  assign(id: string, by: TransitionActor, reason = 'assignation'): Promise<Task> {
    return this.transition(id, 'assigned', by, reason);
  }
  start(id: string, by: TransitionActor, reason = 'démarrage'): Promise<Task> {
    return this.transition(id, 'in_progress', by, reason);
  }
  block(id: string, by: TransitionActor, reason: string): Promise<Task> {
    return this.transition(id, 'blocked', by, reason);
  }
  requestValidation(id: string, by: TransitionActor, reason = 'validation requise'): Promise<Task> {
    return this.transition(id, 'awaiting_validation', by, reason);
  }
  complete(id: string, by: TransitionActor, reason = 'terminée'): Promise<Task> {
    return this.transition(id, 'done', by, reason);
  }
  reject(id: string, by: TransitionActor, reason: string): Promise<Task> {
    return this.transition(id, 'rejected', by, reason);
  }
  fail(id: string, by: TransitionActor, reason: string): Promise<Task> {
    return this.transition(id, 'failed', by, reason);
  }
  cancel(id: string, by: TransitionActor, reason: string): Promise<Task> {
    return this.transition(id, 'cancelled', by, reason);
  }

  /** Attache le résultat final d'une tâche (rapport, artefacts, mémoire). */
  async attachResult(id: string, result: NonNullable<Task['result']>): Promise<Task> {
    const current = await this.getOrThrow(id);
    const next: Task = { ...current, result, updated_at: this.clock.nowIso() };
    return this.repo.update(taskSchema.parse(next));
  }

  /**
   * Enregistre sur la tâche la décision de validation qui la concerne (qui a
   * décidé, référence `DEC-…`). N'effectue aucune transition d'état : c'est la
   * traçabilité du lien tâche ↔ décision (auditabilité, P5).
   */
  async recordValidation(
    id: string,
    decidedBy: NonNullable<NonNullable<Task['validation']>['decided_by']>,
    decisionId: string,
  ): Promise<Task> {
    const current = await this.getOrThrow(id);
    const now = this.clock.nowIso();
    const next: Task = {
      ...current,
      validation: {
        required: current.validation?.required ?? true,
        requested_at: current.validation?.requested_at ?? now,
        decided_by: decidedBy,
        decision_id: decisionId,
      },
      updated_at: now,
    };
    return this.repo.update(taskSchema.parse(next));
  }
}
