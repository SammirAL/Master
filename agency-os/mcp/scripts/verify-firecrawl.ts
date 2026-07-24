import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Vérifie l'intégration du serveur MCP officiel Firecrawl :
 *  1. lance `firecrawl-mcp` en sous-processus (transport stdio) ;
 *  2. réalise le handshake MCP et liste les outils exposés ;
 *  3. tente un `firecrawl_scrape` (échouera si l'egress bloque api.firecrawl.dev).
 *
 * La clé est lue depuis FIRECRAWL_API_KEY (jamais codée en dur). Pour la simple
 * découverte d'outils, une valeur placeholder suffit (aucun appel réseau).
 *
 * Lancer : FIRECRAWL_API_KEY=... pnpm --filter @agency-os/mcp verify:firecrawl
 */
async function main(): Promise<void> {
  const require = createRequire(import.meta.url);
  const pkgPath = require.resolve('firecrawl-mcp/package.json');
  const binPath = join(dirname(pkgPath), 'dist', 'index.js');

  const key = process.env['FIRECRAWL_API_KEY'] ?? 'fc-PLACEHOLDER-for-tool-discovery';
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined) env[k] = v;
  env['FIRECRAWL_API_KEY'] = key;

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [binPath],
    env,
    stderr: 'pipe',
  });

  const client = new Client({ name: 'agency-os-verify', version: '0.0.0' });

  console.log('→ Démarrage du serveur firecrawl-mcp et handshake MCP…');
  await client.connect(transport);
  const serverInfo = client.getServerVersion();
  console.log(`✓ Connecté au serveur MCP : ${serverInfo?.name} v${serverInfo?.version}`);

  const { tools } = await client.listTools();
  console.log(`✓ ${tools.length} outil(s) exposé(s) par firecrawl-mcp :`);
  for (const t of tools) {
    console.log(`   • ${t.name}${t.description ? ` — ${t.description.split('\n')[0]!.slice(0, 80)}` : ''}`);
  }

  // Tentative d'appel réel (peut être bloquée par la politique d'egress).
  console.log('\n→ Test d\'un appel réel firecrawl_scrape(example.com)…');
  try {
    const res = await client.callTool({
      name: 'firecrawl_scrape',
      arguments: { url: 'https://example.com', formats: ['markdown'] },
    });
    const text = JSON.stringify(res).slice(0, 200).replace(/fc-[a-z0-9]+/gi, 'fc-REDACTED');
    console.log(`✓ Appel réussi. Extrait : ${text}…`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`✗ Appel réseau bloqué/échoué (attendu dans cet environnement) : ${msg.slice(0, 160)}`);
  }

  await client.close();
}

main().catch((err: unknown) => {
  console.error('Échec de la vérification :', err);
  process.exitCode = 1;
});
