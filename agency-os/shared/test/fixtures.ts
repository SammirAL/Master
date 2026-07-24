/**
 * Exemples valides alignés sur docs/07-schemas.md. Servent de base aux tests
 * « accepte l'exemple canonique » et, après mutation, aux tests de rejet.
 */

export const validTask = {
  id: 'TSK-20260724-a8f3k2',
  title: 'Audit technique SEO — corriger les données structurées',
  description: 'Corriger les erreurs Schema.org sur les pages produit.',
  priority: 'P1',
  site_id: 'site_acme-shop',
  client_id: 'cli_acme',
  agent: 'technical-seo',
  created_by: 'ceo',
  workflow_run_id: null,
  depends_on: [],
  deadline: '2026-07-28T18:00:00Z',
  status: 'in_progress',
  permission_level_required: 'L2',
  validation: {
    required: true,
    requested_at: null,
    decided_by: null,
    decision_id: null,
  },
  logs: [{ at: '2026-07-24T10:00:00Z', level: 'info', event: 'mcp_call', detail: 'firecrawl.scrape /produits' }],
  result: null,
  history: [
    { at: '2026-07-24T09:00:00Z', from: 'assigned', to: 'in_progress', by: 'worker:w-04', reason: 'démarrage' },
  ],
  cost: { llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 },
  created_at: '2026-07-24T08:00:00Z',
  updated_at: '2026-07-24T10:00:00Z',
};

export const validReport = {
  id: 'RPT-20260724-b2c9d1',
  task_id: 'TSK-20260724-a8f3k2',
  agent: 'technical-seo',
  site_id: 'site_acme-shop',
  client_id: 'cli_acme',
  period: null,
  status_global: 'yellow',
  sections: {
    resume_executif: '12 pages produit sans données structurées valides.',
    constats: [{ fact: 'Schema.org Product absent', evidence: 'crawl.json', severity: 'high' }],
    analyse: 'Le thème ne génère pas le balisage sur les variantes.',
    actions_realisees: [{ action: 'Cartographie des pages', scope: 'L0', proof: 'data/artifacts/crawl.json' }],
    recommandations: [{ titre: 'Ajouter le balisage Product', impact: 4, effort: 2, risque: 1, detail: '…' }],
    kpis: [{ name: 'lcp_ms', before: 4200, after: 2900, target: 2500, trend: 'improving' }],
    risques_limites: 'Mesures sur un échantillon de 12 pages.',
    prochaines_etapes: ['Revue Quality Reviewer', 'Validation CEO'],
    annexes: ['data/artifacts/crawl.json'],
  },
  created_at: '2026-07-24T10:30:00Z',
};

export const validAgentResponse = {
  task_id: 'TSK-20260724-a8f3k2',
  agent: 'technical-seo',
  type: 'completion',
  summary: 'Audit terminé, 5 recommandations priorisées.',
  report_id: 'RPT-20260724-b2c9d1',
  needs: [],
  confidence: 0.85,
  at: '2026-07-24T10:30:00Z',
};

export const validCouncilMessage = {
  id: 'MSG-20260724-c3d4e5',
  from: 'council:quality-council',
  to: 'ceo',
  type: 'report_submission',
  task_id: 'TSK-20260724-a8f3k2',
  payload: { verdict: 'reserves' },
  refs: ['RPT-20260724-b2c9d1'],
  at: '2026-07-24T11:00:00Z',
};

export const validDecision = {
  id: 'DEC-20260724-d4e5f6',
  kind: 'validation',
  subject: { task_id: 'TSK-20260724-a8f3k2', site_id: 'site_acme-shop', client_id: 'cli_acme' },
  context_refs: ['RPT-20260724-b2c9d1'],
  options_considered: [{ option: 'Déployer maintenant', pros: 'Gain rapide', cons: 'Heure de pointe' }],
  decision: 'approve',
  rationale: 'Impact fort, risque faible, hors heures de pointe.',
  conditions: ['déployer hors heures de pointe'],
  decided_by: 'ceo',
  at: '2026-07-24T11:15:00Z',
};

export const validSite = {
  id: 'site_acme-shop',
  client_id: 'cli_acme',
  name: 'Acme Shop',
  url: 'https://acme-shop.example',
  platform: 'shopify',
  environments: { production: { url: 'https://acme-shop.example' } },
  repo: { provider: 'github', owner: 'acme', name: 'shop', default_branch: 'main' },
  credentials_ref: 'vault://sites/site_acme-shop',
  objectives: [{ goal: '+30 % trafic organique', horizon: '2026-Q4', kpi: 'organic_sessions' }],
  kpis: [{ name: 'organic_sessions', current: 12000, target: 15600, unit: 'sessions/mois' }],
  competitors: ['comp_rival-shop'],
  constraints: ['pas de déploiement le vendredi'],
  status: 'active',
  created_at: '2026-07-01T00:00:00Z',
};

export const validClient = {
  id: 'cli_acme',
  name: 'Acme SARL',
  contacts: [{ name: 'Jean Dupont', email: 'jean@acme.example', role: 'CMO' }],
  sites: ['site_acme-shop'],
  business_goals: ['développer la vente en ligne en France'],
  editorial_preferences: { tone: 'sobre', forbidden_topics: [], languages: ['fr'] },
  validation_policy: 'standard',
  budget: { llm_monthly_usd: 300, ads_monthly_usd: 0 },
  status: 'active',
  created_at: '2026-07-01T00:00:00Z',
};

export const validMemoryRecord = {
  id: 'MEM-20260724-e5f6a7',
  collection: 'mem_seo_campaigns',
  scope: { site_id: 'site_acme-shop', client_id: 'cli_acme', agent: 'seo-strategist' },
  type: 'lesson',
  content: 'Le maillage vers /guides a fait gagner 8 places au cocon jardinage.',
  source_refs: ['RPT-20260724-b2c9d1'],
  confidence: 0.9,
  valid_until: null,
  embedding_model: 'text-embedding-v3',
  created_by: 'memory-manager',
  created_at: '2026-07-24T12:00:00Z',
};

export const validWorkflow = {
  id: 'full-seo-cycle',
  name: 'Cycle SEO complet',
  version: 1,
  trigger: { kind: 'manual' },
  inputs: ['site_id'],
  steps: [
    { id: 'audit', agent: 'seo-strategist', task: 'Audit SEO complet de {{site_id}}', after: [], outputs: ['audit_report'] },
    { id: 'ceo_gate', gate: 'ceo_validation', after: ['audit'] },
  ],
  on_failure: 'escalate_to_ceo',
};

export const validAgentDefinition = {
  slug: 'seo-strategist',
  name: 'SEO Strategist',
  model: { tier: 'reasoning' },
  prompt: 'prompts/agents/seo-strategist/system.md',
  mcp_allowlist: ['gsc', 'ga4', 'firecrawl', 'brave-search', 'exa', 'qdrant'],
  permissions: { level: 'L1' },
  autonomies: ['read_analytics', 'keyword_watch'],
  kpis: ['organic_traffic_delta', 'keyword_positions', 'audit_coverage'],
  limits: { max_tokens_per_task: 200000, max_mcp_calls_per_task: 50, budget_month_usd: 100 },
  report_format: 'standard',
};
