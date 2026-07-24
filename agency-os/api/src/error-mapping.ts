import { DomainError, type DomainErrorCode } from '@agency-os/shared';

/** Correspondance code d'erreur du domaine → statut HTTP. */
const STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  MCP_ALLOWLIST_VIOLATION: 403,
  INVALID_STATE_TRANSITION: 409,
  REPORT_FORMAT_REJECTED: 422,
  CEO_CANNOT_EXECUTE: 400,
  QUOTA_EXCEEDED: 429,
  NOT_FOUND: 404,
  DEPENDENCY_NOT_SATISFIED: 409,
};

export interface HttpError {
  status: number;
  body: { error: string; code?: string; details?: unknown };
}

/** Traduit une erreur quelconque en réponse HTTP structurée. */
export function toHttpError(err: unknown): HttpError {
  if (err instanceof DomainError) {
    return {
      status: STATUS_BY_CODE[err.code],
      body: { error: err.message, code: err.code, details: err.details },
    };
  }
  // Erreurs de validation Zod (forme { issues: [...] }).
  if (typeof err === 'object' && err !== null && 'issues' in err) {
    return { status: 400, body: { error: 'Validation échouée', code: 'VALIDATION_FAILED', details: (err as { issues: unknown }).issues } };
  }
  const message = err instanceof Error ? err.message : 'Erreur interne';
  return { status: 500, body: { error: message, code: 'INTERNAL' } };
}
