import type {
  AgentDefinition,
  MemoryRecord,
  Report,
  ReportSections,
  StatusGlobal,
  Task,
} from '@agency-os/shared';

/**
 * Contexte assemblé pour une exécution d'agent : la tâche, la définition de
 * l'agent, et les souvenirs pertinents (rappel mémoire — stub en phase 1).
 */
export interface AgentContext {
  task: Task;
  definition: AgentDefinition;
  memories: MemoryRecord[];
}

/** Candidat de mémoire émis par un agent (le pipeline le distille plus tard). */
export interface MemoryCandidate {
  collection: MemoryRecord['collection'];
  type: MemoryRecord['type'];
  content: string;
  scope: MemoryRecord['scope'];
  confidence: number;
}

/**
 * Sortie d'une exécution d'agent : les 9 sections du rapport (format unique),
 * un statut global, un résumé, la confiance, et d'éventuels candidats mémoire.
 */
export interface AgentExecutionOutput {
  status_global: StatusGlobal;
  sections: ReportSections;
  summary: string;
  confidence: number;
  memory_candidates?: MemoryCandidate[];
  tokens_used?: number;
  mcp_calls_used?: number;
}

/**
 * Le « cerveau » d'un agent (abstraction du LLM). Branché sur l'API Claude en
 * phase 3 ; mocké par fixtures en phase 1. Le runtime ne dépend que de ce port.
 */
export interface AgentBrain {
  execute(context: AgentContext): Promise<AgentExecutionOutput>;
}

/** Persistance des rapports (format unique). */
export interface ReportRepository {
  create(report: Report): Promise<Report>;
  getById(id: string): Promise<Report | null>;
}

/** Récepteur des candidats mémoire (Memory Manager en phase 4 ; stub avant). */
export interface MemorySink {
  emit(candidate: MemoryCandidate & { source_refs: string[]; created_by: string }): Promise<void>;
}

/** Rappel mémoire (recherche vectorielle scopée) — stub en phase 1. */
export interface MemoryRecall {
  recall(context: { task: Task; limit: number }): Promise<MemoryRecord[]>;
}
