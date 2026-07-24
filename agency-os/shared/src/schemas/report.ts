import { z } from 'zod';
import { reportId, taskId, siteId, clientId, agentSlug } from './refs.js';
import { isoDateTime } from '../utils/dates.js';
import { statusGlobal, permissionLevel } from './enums.js';

/**
 * Report — le rapport (format unique). cf. docs/07-schemas.md §2.
 * Tout agent, sans exception, rend ses rapports dans ce format. Le moteur de
 * rapports rejette tout écart de structure (P4).
 */

const severity = z.enum(['high', 'medium', 'low']);

const constat = z.object({
  fact: z.string(),
  evidence: z.string(),
  severity,
});

const actionRealisee = z.object({
  action: z.string(),
  scope: permissionLevel,
  proof: z.string(),
});

const recommandation = z.object({
  titre: z.string(),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  risque: z.number().int().min(1).max(5),
  detail: z.string(),
});

const kpiEntry = z.object({
  name: z.string(),
  before: z.number().nullable(),
  after: z.number().nullable(),
  target: z.number().nullable(),
  trend: z.enum(['improving', 'stable', 'declining', 'unknown']),
});

/** Les 9 sections obligatoires du rapport. Aucune ne peut manquer. */
const reportSections = z.object({
  resume_executif: z.string(),
  constats: z.array(constat),
  analyse: z.string(),
  actions_realisees: z.array(actionRealisee),
  recommandations: z.array(recommandation),
  kpis: z.array(kpiEntry),
  risques_limites: z.string(),
  prochaines_etapes: z.array(z.string()),
  annexes: z.array(z.string()),
});

const reportPeriod = z
  .object({
    from: isoDateTime,
    to: isoDateTime,
  })
  .nullable();

export const report = z.object({
  id: reportId,
  task_id: taskId,
  agent: agentSlug,
  site_id: siteId.nullable(),
  client_id: clientId.nullable(),
  period: reportPeriod,
  status_global: statusGlobal,
  sections: reportSections,
  created_at: isoDateTime,
});

export type Report = z.infer<typeof report>;
export type ReportSections = z.infer<typeof reportSections>;
export type ReportKpiEntry = z.infer<typeof kpiEntry>;
