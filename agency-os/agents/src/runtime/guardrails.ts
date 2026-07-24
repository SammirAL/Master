import { QuotaExceededError, type AgentDefinition } from '@agency-os/shared';
import type { AgentExecutionOutput } from './ports.js';

/**
 * Garde-fous d'exécution : vérifie que la sortie d'un agent respecte ses
 * limites (tokens, appels MCP). cf. docs/01-architecture.md §6.1 (`limits`).
 * Les limites de temps et le contenu externe non fiable seront renforcés en
 * phases ultérieures (passerelle MCP).
 */
export function enforceGuardrails(definition: AgentDefinition, output: AgentExecutionOutput): void {
  const tokens = output.tokens_used ?? 0;
  const mcpCalls = output.mcp_calls_used ?? 0;

  if (tokens > definition.limits.max_tokens_per_task) {
    throw new QuotaExceededError('Budget de tokens dépassé pour la tâche.', {
      agent: definition.slug,
      tokens,
      max: definition.limits.max_tokens_per_task,
    });
  }
  if (mcpCalls > definition.limits.max_mcp_calls_per_task) {
    throw new QuotaExceededError('Budget d\'appels MCP dépassé pour la tâche.', {
      agent: definition.slug,
      mcpCalls,
      max: definition.limits.max_mcp_calls_per_task,
    });
  }
}
