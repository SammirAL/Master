import {
  McpGateway,
  InMemoryAuditSink,
  EnvCredentialsBroker,
  InMemoryQuotaGuard,
  createDefaultConnectors,
} from '../src/index.js';

/**
 * Démonstration Phase 2 : la passerelle applique la matrice de permissions.
 *  1. seo-strategist → firecrawl.scrape : AUTORISÉ (RO) — appel réel via firecrawl-mcp ;
 *  2. data-analyst → gsc.query : AUTORISÉ (RO) ;
 *  3. technical-seo → wordpress.getPost : REFUSÉ (hors allowlist) + violation auditée.
 * Lancer : FIRECRAWL_API_KEY=... pnpm --filter @agency-os/mcp exec tsx scripts/demo-gateway.ts
 */
async function main(): Promise<void> {
  const audit = new InMemoryAuditSink();
  const gateway = new McpGateway({
    audit,
    credentials: new EnvCredentialsBroker(),
    quota: new InMemoryQuotaGuard(),
  });
  for (const c of createDefaultConnectors()) gateway.register(c);

  const ctx = { taskId: 'TSK-20260724-demo01', siteId: 'site_acme-shop', clientId: 'cli_acme' };

  console.log('=== 1. seo-strategist → firecrawl.scrape (AUTORISÉ) ===');
  try {
    const res = await gateway.call('seo-strategist', 'firecrawl', 'scrape', { url: 'https://example.com', formats: ['markdown'] }, ctx);
    const s = JSON.stringify(res).slice(0, 140).replace(/fc-[a-z0-9]+/gi, 'fc-REDACTED');
    console.log(`   ✓ Autorisé et exécuté. Réponse : ${s}…`);
  } catch (err) {
    console.log(`   (exécution : ${err instanceof Error ? err.message.slice(0, 100) : String(err)})`);
  }

  console.log('\n=== 2. data-analyst → gsc.query (AUTORISÉ) ===');
  const gsc = await gateway.call('data-analyst', 'gsc', 'query', { siteUrl: 'https://acme-shop.example' }, ctx);
  console.log(`   ✓ Autorisé. Réponse : ${JSON.stringify(gsc)}`);

  console.log('\n=== 3. technical-seo → wordpress.getPost (REFUSÉ, hors allowlist) ===');
  try {
    await gateway.call('technical-seo', 'wordpress', 'getPost', { id: 1 }, ctx);
    console.log('   ✗ (aurait dû être refusé)');
  } catch (err) {
    console.log(`   ✓ Refusé : ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('\n=== Journal d\'audit ===');
  for (const e of audit.entries) {
    console.log(`   [${e.kind}] ${e.actor} → ${e.server}.${e.method}` + (e.kind === 'violation' ? ` (reason=${e.detail?.['reason']})` : ` (${e.durationMs}ms)`));
  }

  await gateway.close();
}

main().catch((err: unknown) => {
  console.error('Démo échouée :', err);
  process.exitCode = 1;
});
