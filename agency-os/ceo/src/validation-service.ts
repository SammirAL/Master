import { NotFoundError, type Decision, type Task } from '@agency-os/shared';
import type { TaskService } from '@agency-os/tasks';
import type { MessageBus } from '@agency-os/messaging';
import type { DecisionEngine } from './decision-engine.js';

export interface ValidationInput {
  /** Décideur : le CEO par défaut, ou un humain si escaladé (`human:<id>`). */
  decidedBy?: Decision['decided_by'];
  rationale: string;
  conditions?: string[];
}

export interface ValidationResult {
  decision: Decision;
  task: Task;
}

/**
 * Traite les demandes de validation sur les tâches en `awaiting_validation`.
 * Garantit l'invariant P2 : aucune action L3 n'aboutit sans une `Decision`
 * d'approbation du CEO. cf. docs/01-architecture.md §5.
 */
export class ValidationService {
  constructor(
    private readonly tasks: TaskService,
    private readonly decisions: DecisionEngine,
    private readonly bus: MessageBus,
  ) {}

  /** Approuve : enregistre la Decision, reprend la tâche et l'achève. */
  async approve(taskId: string, input: ValidationInput): Promise<ValidationResult> {
    const task = await this.load(taskId);
    const decision = await this.decisions.record({
      kind: 'validation',
      subject: { task_id: task.id, site_id: task.site_id, client_id: task.client_id },
      outcome: 'approve',
      rationale: input.rationale,
      conditions: input.conditions ?? [],
      context_refs: task.result?.report_id ? [task.result.report_id] : [],
      decided_by: input.decidedBy ?? 'ceo',
    });

    await this.tasks.recordValidation(taskId, decision.decided_by, decision.id);
    // Reprise puis achèvement : l'action L3 est désormais autorisée.
    await this.tasks.transition(taskId, 'in_progress', decision.decided_by, 'validation approuvée');
    const done = await this.tasks.complete(taskId, decision.decided_by, 'action L3 appliquée après validation');

    await this.bus.publish({
      from: 'ceo',
      to: task.agent,
      type: 'validation_response',
      task_id: taskId,
      payload: { decision: 'approve', decision_id: decision.id },
      refs: [decision.id],
    });

    return { decision, task: done };
  }

  /** Rejette : enregistre la Decision et bascule la tâche en `rejected`. */
  async reject(taskId: string, input: ValidationInput): Promise<ValidationResult> {
    return this.decline(taskId, input, 'reject', 'validation rejetée');
  }

  /** Demande une révision : Decision `revise`, tâche en `rejected` (rework). */
  async revise(taskId: string, input: ValidationInput): Promise<ValidationResult> {
    return this.decline(taskId, input, 'revise', 'révision demandée');
  }

  private async decline(
    taskId: string,
    input: ValidationInput,
    outcome: 'reject' | 'revise',
    reason: string,
  ): Promise<ValidationResult> {
    const task = await this.load(taskId);
    const decision = await this.decisions.record({
      kind: 'validation',
      subject: { task_id: task.id, site_id: task.site_id, client_id: task.client_id },
      outcome,
      rationale: input.rationale,
      context_refs: task.result?.report_id ? [task.result.report_id] : [],
      decided_by: input.decidedBy ?? 'ceo',
    });

    await this.tasks.recordValidation(taskId, decision.decided_by, decision.id);
    const rejected = await this.tasks.reject(taskId, decision.decided_by, reason);

    await this.bus.publish({
      from: 'ceo',
      to: task.agent,
      type: 'validation_response',
      task_id: taskId,
      payload: { decision: outcome, decision_id: decision.id },
      refs: [decision.id],
    });

    return { decision, task: rejected };
  }

  private async load(taskId: string): Promise<Task> {
    const task = await this.tasks.getById(taskId);
    if (!task) throw new NotFoundError(`Tâche introuvable : ${taskId}`, { taskId });
    return task;
  }
}
