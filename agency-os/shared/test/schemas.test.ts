import { describe, it, expect } from 'vitest';
import {
  task,
  report,
  agentResponse,
  agentMessage,
  decision,
  site,
  client,
  memoryRecord,
  workflowDefinition,
  agentDefinition,
} from '../src/schemas/index.js';
import {
  validTask,
  validReport,
  validAgentResponse,
  validCouncilMessage,
  validDecision,
  validSite,
  validClient,
  validMemoryRecord,
  validWorkflow,
  validAgentDefinition,
} from './fixtures.js';

describe('schémas — acceptation des exemples canoniques', () => {
  it('accepte une Task valide', () => {
    expect(task.safeParse(validTask).success).toBe(true);
  });
  it('accepte un Report valide (9 sections)', () => {
    expect(report.safeParse(validReport).success).toBe(true);
  });
  it('accepte une AgentResponse valide', () => {
    expect(agentResponse.safeParse(validAgentResponse).success).toBe(true);
  });
  it('accepte un AgentMessage émis par un council', () => {
    expect(agentMessage.safeParse(validCouncilMessage).success).toBe(true);
  });
  it('accepte une Decision valide', () => {
    expect(decision.safeParse(validDecision).success).toBe(true);
  });
  it('accepte un Site valide', () => {
    expect(site.safeParse(validSite).success).toBe(true);
  });
  it('accepte un Client valide', () => {
    expect(client.safeParse(validClient).success).toBe(true);
  });
  it('accepte un MemoryRecord valide', () => {
    expect(memoryRecord.safeParse(validMemoryRecord).success).toBe(true);
  });
  it('accepte un WorkflowDefinition valide', () => {
    expect(workflowDefinition.safeParse(validWorkflow).success).toBe(true);
  });
  it('accepte un AgentDefinition valide', () => {
    expect(agentDefinition.safeParse(validAgentDefinition).success).toBe(true);
  });
});

describe('schémas — rejet des cas invalides', () => {
  it('rejette une Task au statut inconnu', () => {
    const bad = { ...validTask, status: 'wip' };
    expect(task.safeParse(bad).success).toBe(false);
  });

  it('rejette une Task à l\'id mal formé', () => {
    const bad = { ...validTask, id: 'TASK-1' };
    expect(task.safeParse(bad).success).toBe(false);
  });

  it('rejette une Task dont created_by est un slug d\'agent quelconque', () => {
    const bad = { ...validTask, created_by: 'project-manager' };
    expect(task.safeParse(bad).success).toBe(false);
  });

  it('rejette un Report sans resume_executif', () => {
    const bad = structuredClone(validReport) as Record<string, unknown>;
    delete (bad['sections'] as Record<string, unknown>)['resume_executif'];
    expect(report.safeParse(bad).success).toBe(false);
  });

  it('rejette un Report auquel il manque une section (prochaines_etapes)', () => {
    const bad = structuredClone(validReport) as Record<string, unknown>;
    delete (bad['sections'] as Record<string, unknown>)['prochaines_etapes'];
    expect(report.safeParse(bad).success).toBe(false);
  });

  it('rejette une AgentResponse "completion" sans report_id', () => {
    const bad = { ...validAgentResponse, report_id: null };
    expect(agentResponse.safeParse(bad).success).toBe(false);
  });

  it('rejette une AgentResponse "blocked" sans needs', () => {
    const bad = { ...validAgentResponse, type: 'blocked', report_id: null, needs: [] };
    expect(agentResponse.safeParse(bad).success).toBe(false);
  });

  it('rejette une Decision sans justification (rationale vide)', () => {
    const bad = { ...validDecision, rationale: '' };
    expect(decision.safeParse(bad).success).toBe(false);
  });

  it('rejette un Site à la plateforme inconnue', () => {
    const bad = { ...validSite, platform: 'drupal' };
    expect(site.safeParse(bad).success).toBe(false);
  });

  it('rejette un AgentDefinition dont report_format n\'est pas "standard"', () => {
    const bad = { ...validAgentDefinition, report_format: 'custom' };
    expect(agentDefinition.safeParse(bad).success).toBe(false);
  });

  it('rejette un AgentDefinition référençant un serveur MCP inconnu', () => {
    const bad = { ...validAgentDefinition, mcp_allowlist: ['slack'] };
    expect(agentDefinition.safeParse(bad).success).toBe(false);
  });
});
