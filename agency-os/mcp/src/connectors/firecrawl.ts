import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { ConnectorCallContext, McpConnector, McpMethodSpec } from '../ports.js';

/**
 * Connecteur Firecrawl RÉEL : relaie vers le serveur MCP officiel
 * `firecrawl-mcp` (https://github.com/firecrawl/firecrawl-mcp-server) via le
 * SDK MCP (transport stdio). La clé provient du broker (`ctx.secrets.apiKey`),
 * injectée dans l'environnement du sous-processus — jamais exposée à l'agent.
 *
 * Toutes les opérations Firecrawl sont en lecture (`read` / L0).
 */
const TOOL_BY_METHOD: Record<string, string> = {
  scrape: 'firecrawl_scrape',
  search: 'firecrawl_search',
  map: 'firecrawl_map',
  crawl: 'firecrawl_crawl',
  check_crawl_status: 'firecrawl_check_crawl_status',
  extract: 'firecrawl_extract',
};

export class FirecrawlConnector implements McpConnector {
  readonly server = 'firecrawl' as const;
  readonly methods: Record<string, McpMethodSpec> = {
    scrape: { capability: 'read', description: 'Extrait le contenu d\'une URL' },
    search: { capability: 'read', description: 'Recherche web' },
    map: { capability: 'read', description: 'Cartographie des URLs d\'un site' },
    crawl: { capability: 'read', description: 'Crawl d\'un site' },
    check_crawl_status: { capability: 'read' },
    extract: { capability: 'read', description: 'Extraction structurée' },
  };

  private client: Client | null = null;
  private connecting: Promise<Client> | null = null;

  async call(method: string, args: Record<string, unknown>, ctx: ConnectorCallContext): Promise<unknown> {
    const tool = TOOL_BY_METHOD[method];
    if (!tool) throw new Error(`Méthode Firecrawl inconnue : ${method}`);
    const client = await this.ensureClient(ctx.secrets['apiKey']);
    return client.callTool({ name: tool, arguments: args });
  }

  private async ensureClient(apiKey?: string): Promise<Client> {
    if (this.client) return this.client;
    this.connecting ??= this.connect(apiKey);
    this.client = await this.connecting;
    return this.client;
  }

  private async connect(apiKey?: string): Promise<Client> {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve('firecrawl-mcp/package.json');
    const binPath = join(dirname(pkgPath), 'dist', 'index.js');

    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) if (v !== undefined) env[k] = v;
    if (apiKey) env['FIRECRAWL_API_KEY'] = apiKey;

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [binPath],
      env,
      stderr: 'pipe',
    });
    const client = new Client({ name: 'agency-os-firecrawl', version: '0.0.0' });
    await client.connect(transport);
    return client;
  }

  async close(): Promise<void> {
    await this.client?.close();
    this.client = null;
    this.connecting = null;
  }
}
