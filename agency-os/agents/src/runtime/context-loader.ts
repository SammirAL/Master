import type { AgentDefinition, Task } from '@agency-os/shared';
import type { AgentContext, MemoryRecall } from './ports.js';

/**
 * Assemble le contexte d'exécution d'un agent : tâche + définition + souvenirs
 * pertinents (rappel mémoire scopé au site/client). En phase 1, le rappel est
 * un stub qui renvoie une liste vide si aucun `MemoryRecall` n'est fourni.
 */
export async function loadContext(
  task: Task,
  definition: AgentDefinition,
  recall?: MemoryRecall,
): Promise<AgentContext> {
  const memories = recall ? await recall.recall({ task, limit: 10 }) : [];
  return { task, definition, memories };
}
