import { z } from 'zod';
import { taskId, reportId, agentSlug } from './refs.js';
import { isoDateTime } from '../utils/dates.js';

/**
 * AgentResponse — la réponse standard d'un agent. cf. docs/07-schemas.md §3.
 * Ce qu'un agent renvoie au moteur de tâches en cours ou en fin d'exécution.
 */

export const agentResponseType = z.enum([
  'ack',
  'progress',
  'completion',
  'blocked',
  'validation_request',
  'error',
]);
export type AgentResponseType = z.infer<typeof agentResponseType>;

const need = z.object({
  kind: z.enum(['validation', 'info', 'dependency', 'budget']),
  detail: z.string(),
  from: z.string(),
});

export const agentResponse = z
  .object({
    task_id: taskId,
    agent: agentSlug,
    type: agentResponseType,
    summary: z.string(),
    report_id: reportId.nullable().default(null),
    needs: z.array(need).default([]),
    confidence: z.number().min(0).max(1),
    at: isoDateTime,
  })
  .superRefine((val, ctx) => {
    // Un `completion` doit référencer un rapport (P4 : tout résultat produit un rapport).
    if (val.type === 'completion' && !val.report_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['report_id'],
        message: 'report_id est obligatoire pour une réponse de type "completion"',
      });
    }
    // Un `blocked` / `validation_request` doit expliciter ses besoins.
    if ((val.type === 'blocked' || val.type === 'validation_request') && val.needs.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['needs'],
        message: 'needs ne peut pas être vide pour une réponse "blocked" ou "validation_request"',
      });
    }
  });

export type AgentResponse = z.infer<typeof agentResponse>;
