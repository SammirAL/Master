import { describe, it, expect, afterEach } from 'vitest';
import { McpAllowlistViolationError } from '@agency-os/shared';
import {
  McpGateway,
  InMemoryAuditSink,
  EnvCredentialsBroker,
  InMemoryQuotaGuard,
  createDefaultConnectors,
} from '@agency-os/mcp';

/**
 * Critère de sortie Phase 2 : un appel hors allowlist est rejeté ET journalisé
 * comme violation dans l'audit. cf. docs/06-plan-de-developpement.md (Phase 2).
 */
let gateway: McpGateway | null = null;
afterEach(async () => {
  await gateway?.close();
  gateway = null;
});

function boot() {
  const audit = new InMemoryAuditSink();
  const g = new McpGateway({
    audit,
    credentials: new EnvCredentialsBroker(),
    quota: new InMemoryQuotaGuard(),
  });
  for (const c of createDefaultConnectors()) g.register(c);
  gateway = g;
  return { g, audit };
}

const ctx = { taskId: 'TSK-20260724-a8f3k2', siteId: 'site_acme-shop', clientId: 'cli_acme' };

describe('E2E — permissions de la passerelle MCP', () => {
  it('autorise un appel conforme et le journalise comme mcp_call', async () => {
    const { g, audit } = boot();
    const res = await g.call('data-analyst', 'gsc', 'query', { siteUrl: 'https://acme' }, ctx);
    expect(res).toBeDefined();
    const last = audit.entries.at(-1);
    expect(last).toMatchObject({ kind: 'mcp_call', actor: 'data-analyst', server: 'gsc', method: 'query' });
    expect(last?.durationMs).toBeTypeOf('number');
  });

  it('rejette un appel hors allowlist ET consigne une violation dans l\'audit', async () => {
    const { g, audit } = boot();
    await expect(
      g.call('technical-seo', 'wordpress', 'getPost', { id: 1 }, ctx),
    ).rejects.toBeInstanceOf(McpAllowlistViolationError);

    const violation = audit.violations().at(-1);
    expect(violation).toMatchObject({
      kind: 'violation',
      actor: 'technical-seo',
      server: 'wordpress',
      method: 'getPost',
    });
    // La tentative refusée n'a produit AUCUN appel réussi.
    expect(audit.entries.filter((e) => e.kind === 'mcp_call')).toHaveLength(0);
  });
});
