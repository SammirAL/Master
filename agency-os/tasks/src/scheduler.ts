import type { Task, Priority } from '@agency-os/shared';
import { TERMINAL_STATES } from './state-machine.js';

/**
 * Ordonnancement : détection des SLA dépassés et vieillissement des priorités.
 * Fonctions pures (testables sans infrastructure). cf. docs/01-architecture.md §7
 * (« une P2 qui dépasse son SLA remonte en P1 »).
 */

const ORDER: readonly Priority[] = ['P3', 'P2', 'P1', 'P0'];

/** Vrai si la tâche a dépassé sa deadline et n'est pas dans un état terminal. */
export function isOverdue(task: Task, now: Date): boolean {
  if (!task.deadline) return false;
  if (TERMINAL_STATES.has(task.status)) return false;
  return new Date(task.deadline).getTime() < now.getTime();
}

/** Monte la priorité d'un cran (P3→P2→P1→P0, plafonnée à P0). */
export function bumpPriority(p: Priority): Priority {
  const i = ORDER.indexOf(p);
  return ORDER[Math.min(i + 1, ORDER.length - 1)]!;
}

/**
 * Priorité effective après vieillissement : si la tâche est en retard, sa
 * priorité est remontée d'un cran. Ne modifie pas la tâche (fonction pure).
 */
export function agedPriority(task: Task, now: Date): Priority {
  return isOverdue(task, now) ? bumpPriority(task.priority) : task.priority;
}
