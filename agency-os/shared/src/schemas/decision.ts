import { z } from 'zod';
import { decisionId, taskId, siteId, clientId, decidedBy } from './refs.js';
import { isoDateTime } from '../utils/dates.js';
import { decisionKind, decisionOutcome } from './enums.js';

/**
 * Decision — décision du CEO. cf. docs/07-schemas.md §5.
 * Enregistrement immuable de chaque décision (auditabilité + mémoire décisionnelle).
 */

const decisionSubject = z.object({
  task_id: taskId.nullable(),
  site_id: siteId.nullable(),
  client_id: clientId.nullable(),
});

const optionConsidered = z.object({
  option: z.string(),
  pros: z.string(),
  cons: z.string(),
});

export const decision = z.object({
  id: decisionId,
  kind: decisionKind,
  subject: decisionSubject,
  context_refs: z.array(z.string()).default([]),
  options_considered: z.array(optionConsidered).default([]),
  decision: decisionOutcome,
  rationale: z.string().min(1, 'la justification (rationale) est toujours obligatoire'),
  conditions: z.array(z.string()).default([]),
  decided_by: decidedBy,
  at: isoDateTime,
});

export type Decision = z.infer<typeof decision>;
