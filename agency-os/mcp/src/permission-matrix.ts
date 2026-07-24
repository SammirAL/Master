import type { McpServer } from '@agency-os/shared';
import { parseCell, type Capability } from './capabilities.js';

/**
 * Matrice de permissions agent × serveur MCP, encodée depuis
 * docs/03-agents/README.md (§ Matrice MCP). Les codes reprennent EXACTEMENT
 * les cellules du tableau (exposants d'annotation retirés). Le test
 * `permission-matrix.test.ts` échoue si l'encodage dérive de la documentation.
 */
export const PERMISSION_MATRIX: Readonly<Record<string, Partial<Record<McpServer, string>>>> = {
  ceo: { postgresql: 'RO', qdrant: 'RO' },
  'project-manager': { postgresql: 'RO', qdrant: 'RO', n8n: 'RO' },
  'seo-strategist': { firecrawl: 'RO', gsc: 'RO', ga4: 'RO', qdrant: 'RO', 'brave-search': 'RO', exa: 'RO' },
  'technical-seo': { github: 'RO', filesystem: 'RO', playwright: 'RO', firecrawl: 'RO', gsc: 'RO' },
  'content-writer': { wordpress: 'S+P', shopify: 'S+P', qdrant: 'RO', 'brave-search': 'RO', exa: 'RO' },
  developer: { github: 'S+P', filesystem: 'RW', playwright: 'RO', postgresql: 'S', mysql: 'S', docker: 'S', terminal: 'S' },
  'ux-expert': { playwright: 'RO', firecrawl: 'RO', ga4: 'RO' },
  'cro-expert': { playwright: 'RO', ga4: 'RO', postgresql: 'RO', stripe: 'RO' },
  'marketing-expert': { ga4: 'RO', 'google-ads': 'RO+P', 'brave-search': 'RO', exa: 'RO' },
  'sales-expert': { ga4: 'RO', shopify: 'RO+P', postgresql: 'RO', stripe: 'RO' },
  'data-analyst': { gsc: 'RO', ga4: 'RO', 'google-ads': 'RO', postgresql: 'RO', supabase: 'RO', stripe: 'RO' },
  'competitor-analyst': { playwright: 'RO', firecrawl: 'RO', qdrant: 'RO', 'brave-search': 'RO', exa: 'RO' },
  'security-expert': { github: 'RO', filesystem: 'RO', playwright: 'RO', 'brave-search': 'RO', docker: 'S', terminal: 'S' },
  'automation-engineer': { github: 'S+P', docker: 'S', terminal: 'S', n8n: 'S+P' },
  'memory-manager': { filesystem: 'RO', postgresql: 'RW', supabase: 'RW', qdrant: 'RW' },
  'quality-reviewer': { github: 'RO', filesystem: 'RO', playwright: 'RO', firecrawl: 'RO', wordpress: 'RO', shopify: 'RO', qdrant: 'RO' },
  'brand-guardian': { filesystem: 'RO', firecrawl: 'RO', wordpress: 'RO', shopify: 'RO', qdrant: 'RO' },
  'knowledge-manager': { filesystem: 'RW', postgresql: 'RO', qdrant: 'PIPE', 'brave-search': 'RO', exa: 'RO' },
};

/**
 * Ensemble des capacités accordées à un agent sur un serveur, ou `null` si
 * l'accès est interdit (cellule vide de la matrice).
 */
export function grantedCapabilities(agent: string, server: McpServer): Set<Capability> | null {
  const code = PERMISSION_MATRIX[agent]?.[server];
  if (!code) return null;
  return parseCell(code);
}

/** Code brut de la cellule (ex. `"S+P"`) ou `null` si interdit. */
export function cellCode(agent: string, server: McpServer): string | null {
  return PERMISSION_MATRIX[agent]?.[server] ?? null;
}
