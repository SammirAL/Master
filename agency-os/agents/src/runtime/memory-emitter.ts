import type { AgentContext, AgentExecutionOutput, MemorySink } from './ports.js';

/**
 * Émet les candidats mémoire produits par un agent vers le `MemorySink`.
 * En phase 1, le sink est optionnel (stub) ; le pipeline de distillation et de
 * vectorisation arrive en phase 4. Retourne les identifiants de référence émis.
 */
export async function emitMemories(
  context: AgentContext,
  output: AgentExecutionOutput,
  sink?: MemorySink,
): Promise<number> {
  const candidates = output.memory_candidates ?? [];
  if (!sink || candidates.length === 0) return 0;

  for (const candidate of candidates) {
    await sink.emit({
      ...candidate,
      source_refs: [context.task.id],
      created_by: context.task.agent,
    });
  }
  return candidates.length;
}
