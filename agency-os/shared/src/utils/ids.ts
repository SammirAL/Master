import { randomBytes } from 'node:crypto';
import { z } from 'zod';

/**
 * Générateurs et validateurs des identifiants horodatés du système.
 *
 * Format : `<PREFIX>-YYYYMMDD-<suffixe>` où :
 *  - `YYYYMMDD` est la date UTC de création,
 *  - `<suffixe>` est une chaîne aléatoire de 6 caractères `[a-z0-9]`.
 *
 * Exemple : `TSK-20260724-a8f3k2`. (cf. docs/07-schemas.md — Conventions générales)
 */

export const ID_PREFIXES = {
  task: 'TSK',
  report: 'RPT',
  decision: 'DEC',
  message: 'MSG',
  workflowRun: 'WFR',
  memory: 'MEM',
} as const;

export type IdKind = keyof typeof ID_PREFIXES;

const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SUFFIX_LENGTH = 6;

function randomSuffix(): string {
  const bytes = randomBytes(SUFFIX_LENGTH);
  let out = '';
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    // bytes[i] est défini : la boucle est bornée par la longueur du buffer.
    out += SUFFIX_ALPHABET[bytes[i]! % SUFFIX_ALPHABET.length];
  }
  return out;
}

function utcDatePart(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}${m}${d}`;
}

/** Construit un identifiant du type demandé, horodaté à `at` (par défaut : maintenant). */
export function makeId(kind: IdKind, at: Date = new Date()): string {
  return `${ID_PREFIXES[kind]}-${utcDatePart(at)}-${randomSuffix()}`;
}

/** Expression régulière stricte d'un identifiant horodaté pour un préfixe donné. */
export function idRegex(prefix: string): RegExp {
  return new RegExp(`^${prefix}-\\d{8}-[a-z0-9]{${SUFFIX_LENGTH}}$`);
}

/** Schéma Zod validant un identifiant horodaté du type demandé. */
export function idSchema(kind: IdKind) {
  const re = idRegex(ID_PREFIXES[kind]);
  return z
    .string()
    .regex(re, `Identifiant ${kind} invalide (attendu ${ID_PREFIXES[kind]}-YYYYMMDD-xxxxxx)`);
}

export const taskId = idSchema('task');
export const reportId = idSchema('report');
export const decisionId = idSchema('decision');
export const messageId = idSchema('message');
export const workflowRunId = idSchema('workflowRun');
export const memoryId = idSchema('memory');

// Identifiants « slug » (non horodatés) pour les entités durables.
// Exemples : site_acme-shop, cli_acme, comp_rival-shop.
export const siteId = z
  .string()
  .regex(/^site_[a-z0-9][a-z0-9-]*$/, 'site_id invalide (attendu site_<slug>)');
export const clientId = z
  .string()
  .regex(/^cli_[a-z0-9][a-z0-9-]*$/, 'client_id invalide (attendu cli_<slug>)');
export const competitorId = z
  .string()
  .regex(/^comp_[a-z0-9][a-z0-9-]*$/, 'competitor_id invalide (attendu comp_<slug>)');

/** Slug d'agent : minuscules, chiffres et tirets (ex. `seo-strategist`). */
export const agentSlug = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, 'slug d\'agent invalide (attendu [a-z][a-z0-9-]*)');
