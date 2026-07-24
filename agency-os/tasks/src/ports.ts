import type { Task, TaskStatus } from '@agency-os/shared';

/**
 * Ports (interfaces) du moteur de tâches. Les adaptateurs concrets (Drizzle,
 * BullMQ, in-memory) sont injectés par la composition root. Principe SOLID :
 * le domaine ne dépend que de ces interfaces.
 */

export interface TaskFilter {
  status?: TaskStatus;
  agent?: string;
  siteId?: string | null;
  workflowRunId?: string | null;
}

/** Persistance des tâches. */
export interface TaskRepository {
  create(task: Task): Promise<Task>;
  getById(id: string): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  list(filter?: TaskFilter): Promise<Task[]>;
}

/** Horloge injectable (testabilité). */
export interface Clock {
  nowIso(): string;
  now(): Date;
}

/** Un travail placé dans une file d'exécution d'agent. */
export interface QueueJob {
  taskId: string;
  agent: string;
  siteId: string | null;
}

/** File d'exécution (BullMQ en prod, in-memory en test). */
export interface QueuePort {
  /** Nom de la file pour un agent et un site : `queue:{agent}:{site}`. */
  enqueue(job: QueueJob): Promise<void>;
  /** Enregistre le consommateur des travaux. */
  process(handler: (job: QueueJob) => Promise<void>): void;
  close(): Promise<void>;
}

/** Émetteur d'événements d'audit (implémenté par la passerelle/le journal). */
export interface AuditSink {
  record(entry: {
    at: string;
    kind: string;
    actor: string;
    taskId?: string | null;
    detail?: Record<string, unknown>;
  }): Promise<void>;
}
