import { z } from 'zod';
import { clientId, siteId } from './refs.js';
import { isoDateTime } from '../utils/dates.js';

/**
 * Client — un client de l'agence. cf. docs/07-schemas.md §7.
 */

const contact = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

const editorialPreferences = z.object({
  tone: z.string(),
  forbidden_topics: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

const budget = z.object({
  llm_monthly_usd: z.number().min(0).default(0),
  ads_monthly_usd: z.number().min(0).default(0),
});

/** Politique de validation : `standard` = CEO suffit ; `strict` = humain requis pour tout L3. */
export const validationPolicy = z.enum(['standard', 'strict']);
export type ValidationPolicy = z.infer<typeof validationPolicy>;

export const clientStatus = z.enum(['active', 'paused', 'archived']);
export type ClientStatus = z.infer<typeof clientStatus>;

export const client = z.object({
  id: clientId,
  name: z.string().min(1),
  contacts: z.array(contact).default([]),
  sites: z.array(siteId).default([]),
  business_goals: z.array(z.string()).default([]),
  editorial_preferences: editorialPreferences,
  validation_policy: validationPolicy.default('standard'),
  budget,
  status: clientStatus,
  created_at: isoDateTime,
});

export type Client = z.infer<typeof client>;
