import { z } from 'zod';

/**
 * Énumérations de référence. Source unique — reflétées dans le schéma DB et
 * l'API. cf. docs/07-schemas.md §10 (« Enums de référence »).
 */

export const taskStatus = z.enum([
  'draft',
  'assigned',
  'in_progress',
  'blocked',
  'awaiting_validation',
  'rejected',
  'done',
  'failed',
  'cancelled',
]);
export type TaskStatus = z.infer<typeof taskStatus>;

export const priority = z.enum(['P0', 'P1', 'P2', 'P3']);
export type Priority = z.infer<typeof priority>;

export const permissionLevel = z.enum(['L0', 'L1', 'L2', 'L3']);
export type PermissionLevel = z.infer<typeof permissionLevel>;

export const messageType = z.enum([
  'task_assignment',
  'status_update',
  'report_submission',
  'validation_request',
  'validation_response',
  'info_request',
  'info_response',
  'escalation',
  'alert',
  'council_summon',
]);
export type MessageType = z.infer<typeof messageType>;

export const decisionKind = z.enum([
  'validation',
  'prioritization',
  'arbitration',
  'escalation',
  'planning',
]);
export type DecisionKind = z.infer<typeof decisionKind>;

export const statusGlobal = z.enum(['green', 'yellow', 'red']);
export type StatusGlobal = z.infer<typeof statusGlobal>;

export const memoryType = z.enum(['fact', 'lesson', 'preference', 'outcome', 'profile']);
export type MemoryType = z.infer<typeof memoryType>;

export const platform = z.enum(['wordpress', 'shopify', 'laravel', 'nextjs', 'other']);
export type Platform = z.infer<typeof platform>;

/** Décision rendue par le CEO (ou l'humain) sur une validation. */
export const decisionOutcome = z.enum([
  'approve',
  'reject',
  'revise',
  'defer',
  'escalate_to_human',
]);
export type DecisionOutcome = z.infer<typeof decisionOutcome>;

/** Collections de la mémoire vectorielle. cf. docs/01-architecture.md §8. */
export const memoryCollection = z.enum([
  'mem_sites',
  'mem_clients',
  'mem_agents',
  'mem_decisions',
  'mem_seo_campaigns',
  'mem_articles',
  'mem_competitors',
  'mem_keywords',
]);
export type MemoryCollection = z.infer<typeof memoryCollection>;
