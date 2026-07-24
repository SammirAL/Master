import { z } from 'zod';
import { agentSlug } from './refs.js';
import { permissionLevel } from './enums.js';

/**
 * AgentDefinition — le YAML de définition d'un agent. cf. docs/01-architecture.md
 * §6.1 et docs/03-agents/. Ajouter un agent = ajouter une définition, sans code.
 */

/** Palier de modèle ; le mapping vers un modèle concret est une config globale. */
export const modelTier = z.enum(['reasoning', 'standard', 'fast']);
export type ModelTier = z.infer<typeof modelTier>;

/** Serveurs MCP référençables dans une allowlist. cf. docs/03-agents/README.md. */
export const mcpServer = z.enum([
  'github',
  'filesystem',
  'playwright',
  'firecrawl',
  'gsc',
  'ga4',
  'google-ads',
  'wordpress',
  'shopify',
  'postgresql',
  'mysql',
  'supabase',
  'qdrant',
  'brave-search',
  'exa',
  'stripe',
  'docker',
  'terminal',
  'n8n',
]);
export type McpServer = z.infer<typeof mcpServer>;

const agentLimits = z.object({
  max_tokens_per_task: z.number().int().min(1),
  max_mcp_calls_per_task: z.number().int().min(1),
  budget_month_usd: z.number().min(0),
});

export const agentDefinition = z.object({
  slug: agentSlug,
  name: z.string().min(1),
  model: z.object({ tier: modelTier }),
  prompt: z.string(), // chemin vers prompts/agents/<slug>/system.md
  mcp_allowlist: z.array(mcpServer).default([]),
  permissions: z.object({ level: permissionLevel }),
  autonomies: z.array(z.string()).default([]),
  kpis: z.array(z.string()).default([]),
  limits: agentLimits,
  report_format: z.literal('standard'), // format unique et obligatoire (P4)
});

export type AgentDefinition = z.infer<typeof agentDefinition>;
