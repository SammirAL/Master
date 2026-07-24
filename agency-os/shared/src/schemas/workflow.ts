import { z } from 'zod';
import { agentSlug } from './refs.js';
import { permissionLevel } from './enums.js';

/**
 * WorkflowDefinition — définition de workflow (YAML). cf. docs/07-schemas.md §9.
 * Un moteur instancie une définition en un graphe de tâches ; les `gate`
 * matérialisent les points de validation CEO.
 */

const workflowTrigger = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('manual') }),
  z.object({ kind: z.literal('cron'), cron: z.string() }),
  z.object({ kind: z.literal('event'), event: z.string() }),
  z.object({
    kind: z.literal('kpi_threshold'),
    kpi: z.string(),
    operator: z.enum(['lt', 'lte', 'gt', 'gte']),
    value: z.number(),
  }),
]);

/** Un pas d'agent : exécute une tâche. */
const agentStep = z.object({
  id: z.string(),
  agent: agentSlug,
  task: z.string(),
  after: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  permission_level: permissionLevel.optional(),
  delay: z.string().optional(), // ex. "7d"
});

/** Un pas de validation : point de passage obligatoire (gate). */
const gateStep = z.object({
  id: z.string(),
  gate: z.enum(['ceo_validation', 'human_validation']),
  after: z.array(z.string()).default([]),
});

const workflowStep = z.union([agentStep, gateStep]);

export const workflowDefinition = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'id de workflow invalide'),
  name: z.string().min(1),
  version: z.number().int().min(1),
  trigger: workflowTrigger,
  inputs: z.array(z.string()).default([]),
  steps: z.array(workflowStep).min(1),
  on_failure: z.enum(['escalate_to_ceo', 'abort', 'retry']).default('escalate_to_ceo'),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinition>;
export type WorkflowStep = z.infer<typeof workflowStep>;
