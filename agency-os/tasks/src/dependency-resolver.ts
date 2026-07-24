import type { Task } from '@agency-os/shared';
import type { TaskRepository } from './ports.js';

/**
 * Résolution des dépendances (`depends_on`). Une tâche ne peut démarrer que
 * lorsque TOUTES ses dépendances sont à l'état `done` (c'est le mécanisme qui
 * ordonne les étapes d'un workflow). cf. docs/01-architecture.md §7.
 */

/** Retourne la liste des dépendances non satisfaites (absentes ou non `done`). */
export async function unmetDependencies(task: Task, repo: TaskRepository): Promise<string[]> {
  const unmet: string[] = [];
  for (const depId of task.depends_on) {
    const dep = await repo.getById(depId);
    if (!dep || dep.status !== 'done') {
      unmet.push(depId);
    }
  }
  return unmet;
}

/** Vrai si toutes les dépendances de la tâche sont satisfaites. */
export async function dependenciesSatisfied(task: Task, repo: TaskRepository): Promise<boolean> {
  return (await unmetDependencies(task, repo)).length === 0;
}
