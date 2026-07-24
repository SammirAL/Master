/**
 * Hiérarchie d'erreurs typées du domaine Agency AI OS.
 *
 * Toute erreur métier hérite de `DomainError` et porte un `code` stable
 * (exploitable par l'API pour le mapping HTTP et par les tests). cf. le mapping
 * `common/` de l'API (docs/02-arborescence.md).
 */

export type DomainErrorCode =
  | 'VALIDATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'MCP_ALLOWLIST_VIOLATION'
  | 'INVALID_STATE_TRANSITION'
  | 'REPORT_FORMAT_REJECTED'
  | 'CEO_CANNOT_EXECUTE'
  | 'QUOTA_EXCEEDED'
  | 'NOT_FOUND'
  | 'DEPENDENCY_NOT_SATISFIED';

export abstract class DomainError extends Error {
  abstract readonly code: DomainErrorCode;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = new.target.name;
    this.details = Object.freeze({ ...details });
    // Restaure la chaîne de prototype (héritage d'Error transpilé).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Un schéma Zod a rejeté une entrée. */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_FAILED';
}

/** Un agent a tenté une action interdite par ses permissions (niveau L0–L3). */
export class PermissionDeniedError extends DomainError {
  readonly code = 'PERMISSION_DENIED';
}

/** Un agent a appelé un serveur MCP hors de son allowlist. */
export class McpAllowlistViolationError extends DomainError {
  readonly code = 'MCP_ALLOWLIST_VIOLATION';
}

/** Transition d'état de tâche non autorisée par la machine à états. */
export class InvalidStateTransitionError extends DomainError {
  readonly code = 'INVALID_STATE_TRANSITION';
}

/** Un rapport ne respecte pas le format unique (P4). */
export class ReportFormatRejectedError extends DomainError {
  readonly code = 'REPORT_FORMAT_REJECTED';
}

/** Le CEO ne peut pas se voir assigner une tâche d'exécution (P1). */
export class CeoCannotExecuteError extends DomainError {
  readonly code = 'CEO_CANNOT_EXECUTE';
}

/** Dépassement d'un quota (tokens, appels MCP, budget). */
export class QuotaExceededError extends DomainError {
  readonly code = 'QUOTA_EXCEEDED';
}

/** Ressource introuvable. */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

/** Une dépendance (`depends_on`) n'est pas encore satisfaite. */
export class DependencyNotSatisfiedError extends DomainError {
  readonly code = 'DEPENDENCY_NOT_SATISFIED';
}
