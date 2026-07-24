import { report as reportSchema, makeId, nowIso, ReportFormatRejectedError, type Report } from '@agency-os/shared';
import type { AgentContext, AgentExecutionOutput } from './ports.js';

/** Forme minimale d'une erreur de validation Zod (évite une dépendance directe à zod). */
interface ZodLikeError {
  issues: Array<{ path: Array<string | number>; message: string }>;
}

function isZodLikeError(err: unknown): err is ZodLikeError {
  return typeof err === 'object' && err !== null && Array.isArray((err as ZodLikeError).issues);
}

/**
 * Construit et VALIDE un rapport au format unique (P4). Si la sortie de l'agent
 * ne respecte pas la structure du schéma `Report`, lève
 * `ReportFormatRejectedError` — la tâche repartira en révision.
 * cf. docs/07-schemas.md §2.
 */
export function buildReport(context: AgentContext, output: AgentExecutionOutput): Report {
  const candidate = {
    id: makeId('report'),
    task_id: context.task.id,
    agent: context.task.agent,
    site_id: context.task.site_id,
    client_id: context.task.client_id,
    period: null,
    status_global: output.status_global,
    sections: output.sections,
    created_at: nowIso(),
  };

  try {
    return reportSchema.parse(candidate);
  } catch (err) {
    if (isZodLikeError(err)) {
      throw new ReportFormatRejectedError(
        'Rapport non conforme au format unique : la tâche repart en révision.',
        { issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      );
    }
    throw err;
  }
}
