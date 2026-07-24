import { z } from 'zod';
import { siteId, clientId, competitorId } from './refs.js';
import { isoDateTime } from '../utils/dates.js';
import { platform } from './enums.js';

/**
 * Site — un site géré. cf. docs/07-schemas.md §6.
 * Tout est partitionné par `site_id` (P6 : multi-sites natif).
 */

const environment = z.object({ url: z.string().url() });

const siteRepo = z.object({
  provider: z.literal('github'),
  owner: z.string(),
  name: z.string(),
  default_branch: z.string().default('main'),
});

const objective = z.object({
  goal: z.string(),
  horizon: z.string(),
  kpi: z.string(),
});

const siteKpi = z.object({
  name: z.string(),
  current: z.number(),
  target: z.number(),
  unit: z.string(),
});

export const siteStatus = z.enum(['onboarding', 'active', 'paused', 'archived']);
export type SiteStatus = z.infer<typeof siteStatus>;

export const site = z.object({
  id: siteId,
  client_id: clientId,
  name: z.string().min(1),
  url: z.string().url(),
  platform,
  environments: z.object({
    production: environment,
    staging: environment.optional(),
  }),
  repo: siteRepo.nullable(),
  credentials_ref: z.string(), // vault://sites/<site_id> — jamais de secret en clair
  objectives: z.array(objective).default([]),
  kpis: z.array(siteKpi).default([]),
  competitors: z.array(competitorId).default([]),
  constraints: z.array(z.string()).default([]),
  status: siteStatus,
  created_at: isoDateTime,
});

export type Site = z.infer<typeof site>;
export type SiteObjective = z.infer<typeof objective>;
export type SiteKpi = z.infer<typeof siteKpi>;
