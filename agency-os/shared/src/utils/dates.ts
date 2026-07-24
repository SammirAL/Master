import { z } from 'zod';

/**
 * Horodatage ISO 8601. Le système raisonne en UTC (suffixe `Z`), mais on
 * accepte un décalage explicite en entrée pour la robustesse.
 * cf. docs/07-schemas.md — Conventions générales (« Dates : ISO 8601 UTC »).
 */
export const isoDateTime = z.string().datetime({ offset: true });

/** Retourne l'instant courant au format ISO 8601 UTC. */
export function nowIso(): string {
  return new Date().toISOString();
}
