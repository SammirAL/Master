import type { Decision } from '@agency-os/shared';

/** Persistance (append-only) des décisions du CEO. */
export interface DecisionRepository {
  create(decision: Decision): Promise<Decision>;
  getById(id: string): Promise<Decision | null>;
  list(filter?: { taskId?: string }): Promise<Decision[]>;
}
