import type { TaskStatus } from '@agency-os/shared';
import { InvalidStateTransitionError } from '@agency-os/shared';

/**
 * Machine à états du cycle de vie d'une tâche.
 * Conforme au diagramme de docs/01-architecture.md §7.
 */
export const TASK_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  draft: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['blocked', 'awaiting_validation', 'done', 'failed'],
  blocked: ['in_progress', 'cancelled'],
  awaiting_validation: ['in_progress', 'rejected'],
  rejected: ['in_progress', 'cancelled'],
  done: [],
  failed: [],
  cancelled: [],
};

/** États terminaux : aucune transition sortante. */
export const TERMINAL_STATES: ReadonlySet<TaskStatus> = new Set<TaskStatus>([
  'done',
  'failed',
  'cancelled',
]);

/** Vrai si la transition `from → to` est autorisée. */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TASK_TRANSITIONS[from].includes(to);
}

/** Lève `InvalidStateTransitionError` si la transition n'est pas autorisée. */
export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidStateTransitionError(
      `Transition interdite : ${from} → ${to}`,
      { from, to, allowed: TASK_TRANSITIONS[from] },
    );
  }
}
