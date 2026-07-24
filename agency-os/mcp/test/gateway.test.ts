import { describe, it, expect } from 'vitest';
import {
  McpAllowlistViolationError,
  PermissionDeniedError,
  QuotaExceededError,
} from '@agency-os/shared';
import { McpGateway } from '../src/gateway.js';
import { InMemoryAuditSink } from '../src/audit-log.js';
import { StaticCredentialsBroker } from '../src/credentials-broker.js';
import { InMemoryQuotaGuard, type QuotaConfig } from '../src/quotas.js';
import { FilesystemConnector } from '../src/connectors/filesystem.js';
import { defineStubConnector } from '../src/connectors/stub-connector.js';

function gw(quota: Partial<QuotaConfig> = {}) {
  const audit = new InMemoryAuditSink();
  const g = new McpGateway({
    audit,
    credentials: new StaticCredentialsBroker({ firecrawl: { apiKey: 'fc-supersecret' } }),
    quota: new InMemoryQuotaGuard(quota),
  });
  g.register(new FilesystemConnector('/tmp/agency-mcp-test'));
  g.register(defineStubConnector('firecrawl', { scrape: { capability: 'read' } }));
  g.register(defineStubConnector('gsc', { query: { capability: 'read' } }));
  g.register(defineStubConnector('postgresql', { query: { capability: 'read' }, migrate: { capability: 'stage' } }));
  g.register(defineStubConnector('wordpress', { getPost: { capability: 'read' }, publish: { capability: 'produce' } }));
  g.register(defineStubConnector('github', { push: { capability: 'stage', scopeGuards: ['github-branch'] } }));
  return { g, audit };
}

const ctx = { taskId: 'TSK-20260724-a8f3k2', siteId: 'site_acme-shop', clientId: 'cli_acme' };

describe('passerelle MCP — matrice de permissions (P3)', () => {
  it('autorise un appel conforme (seo-strategist → firecrawl.scrape)', async () => {
    const { g, audit } = gw();
    const res = await g.call('seo-strategist', 'firecrawl', 'scrape', { url: 'https://x.example' }, ctx);
    expect(res).toMatchObject({ stub: true, server: 'firecrawl' });
    expect(audit.entries.at(-1)).toMatchObject({ kind: 'mcp_call', actor: 'seo-strategist', server: 'firecrawl' });
  });

  it('rejette un appel hors allowlist ET le journalise comme violation', async () => {
    const { g, audit } = gw();
    await expect(
      g.call('technical-seo', 'wordpress', 'getPost', {}, ctx),
    ).rejects.toBeInstanceOf(McpAllowlistViolationError);
    expect(audit.violations().at(-1)).toMatchObject({
      kind: 'violation', actor: 'technical-seo', server: 'wordpress',
    });
  });

  it('respecte la capacité fine (cro-expert peut query mais pas migrate sur postgresql)', async () => {
    const { g } = gw();
    await expect(g.call('cro-expert', 'postgresql', 'query', {}, ctx)).resolves.toBeDefined();
    await expect(g.call('cro-expert', 'postgresql', 'migrate', {}, ctx)).rejects.toBeInstanceOf(
      McpAllowlistViolationError,
    );
  });
});

describe('passerelle MCP — gate L3 (produce)', () => {
  it('refuse une action produce sans validation', async () => {
    const { g } = gw();
    await expect(
      g.call('content-writer', 'wordpress', 'publish', {}, ctx),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it('autorise une action produce si le contexte est validé', async () => {
    const { g } = gw();
    await expect(
      g.call('content-writer', 'wordpress', 'publish', {}, { ...ctx, validated: true }),
    ).resolves.toBeDefined();
  });
});

describe('passerelle MCP — portées fines', () => {
  it('filesystem : accès hors du workspace du site est refusé', async () => {
    const { g } = gw();
    await expect(
      g.call('developer', 'filesystem', 'readFile', { path: '../../etc/passwd' }, ctx),
    ).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it('github : push sur main est refusé (branch+PR only)', async () => {
    const { g } = gw();
    await expect(
      g.call('developer', 'github', 'push', { branch: 'main' }, ctx),
    ).rejects.toBeInstanceOf(McpAllowlistViolationError);
    await expect(
      g.call('developer', 'github', 'push', { branch: 'feature/x' }, ctx),
    ).resolves.toBeDefined();
  });
});

describe('passerelle MCP — quotas', () => {
  it('bloque au-delà du budget d\'appels par tâche et journalise la violation', async () => {
    const { g, audit } = gw({ maxCallsPerTask: 1 });
    await g.call('seo-strategist', 'firecrawl', 'scrape', {}, ctx);
    await expect(g.call('seo-strategist', 'firecrawl', 'scrape', {}, ctx)).rejects.toBeInstanceOf(
      QuotaExceededError,
    );
    expect(audit.violations().some((v) => v.detail?.['reason'] === 'quota')).toBe(true);
  });
});

describe('passerelle MCP — secrets', () => {
  it('un argument ressemblant à un secret est rédigé dans l\'audit', async () => {
    const { g, audit } = gw();
    await g.call('seo-strategist', 'firecrawl', 'scrape', { apiKey: 'fc-should-be-hidden' }, ctx);
    const last = audit.entries.at(-1);
    expect(last?.argsSummary).not.toContain('fc-should-be-hidden');
    expect(last?.argsSummary).toContain('redacted');
  });
});
