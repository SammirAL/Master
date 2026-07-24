import type { AgentDefinition, ReportSections } from '@agency-os/shared';
import type { AgentBrain, AgentExecutionOutput } from './runtime/ports.js';

/**
 * Agent factice pour la phase 1 : cerveau déterministe qui produit un rapport
 * valide au format unique, sans appeler de LLM. Remplacé par l'API Claude en
 * phase 3. Sert aussi de fixture aux tests E2E.
 */

export function createFakeDefinition(
  slug = 'technical-seo',
  overrides: Partial<AgentDefinition> = {},
): AgentDefinition {
  return {
    slug,
    name: 'Agent factice',
    model: { tier: 'standard' },
    prompt: `prompts/agents/${slug}/system.md`,
    mcp_allowlist: [],
    permissions: { level: 'L1' },
    autonomies: [],
    kpis: ['tasks_done'],
    limits: { max_tokens_per_task: 200000, max_mcp_calls_per_task: 50, budget_month_usd: 100 },
    report_format: 'standard',
    ...overrides,
  };
}

const validSections: ReportSections = {
  resume_executif: 'Exécution factice réussie : rapport de démonstration.',
  constats: [{ fact: 'Tout est nominal', evidence: 'fixture', severity: 'low' }],
  analyse: 'Aucune anomalie détectée dans ce scénario de démonstration.',
  actions_realisees: [{ action: 'Analyse simulée', scope: 'L0', proof: 'fixture' }],
  recommandations: [{ titre: 'Poursuivre', impact: 2, effort: 1, risque: 1, detail: '…' }],
  kpis: [{ name: 'tasks_done', before: null, after: 1, target: null, trend: 'improving' }],
  risques_limites: 'Scénario de démonstration, sans donnée réelle.',
  prochaines_etapes: ['Validation CEO'],
  annexes: [],
};

/** Cerveau factice produisant un rapport valide. */
export function createFakeBrain(output: Partial<AgentExecutionOutput> = {}): AgentBrain {
  return {
    execute: async () => ({
      status_global: 'green',
      sections: validSections,
      summary: 'Tâche traitée par l\'agent factice.',
      confidence: 0.9,
      tokens_used: 1000,
      mcp_calls_used: 0,
      ...output,
    }),
  };
}

/** Cerveau factice produisant un rapport MAL FORMÉ (pour tester le rejet P4). */
export function createMalformedBrain(): AgentBrain {
  const broken = { ...validSections } as Record<string, unknown>;
  delete broken['analyse'];
  return {
    execute: async () => ({
      status_global: 'yellow',
      sections: broken as unknown as ReportSections,
      summary: 'Rapport volontairement incomplet.',
      confidence: 0.5,
    }),
  };
}
