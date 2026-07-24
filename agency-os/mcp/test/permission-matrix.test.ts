import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { McpServer } from '@agency-os/shared';
import { cellCode } from '../src/permission-matrix.js';
import { normalizeCellCode, parseCell } from '../src/capabilities.js';

/** Ordre des colonnes du tableau de docs/03-agents/README.md. */
const SERVER_COLUMNS: McpServer[] = [
  'github', 'filesystem', 'playwright', 'firecrawl', 'gsc', 'ga4', 'google-ads',
  'wordpress', 'shopify', 'postgresql', 'mysql', 'supabase', 'qdrant',
  'brave-search', 'exa', 'stripe', 'docker', 'terminal', 'n8n',
];

const NAME_TO_SLUG: Record<string, string> = {
  'CEO': 'ceo',
  'Project Manager': 'project-manager',
  'SEO Strategist': 'seo-strategist',
  'Technical SEO': 'technical-seo',
  'Content Writer': 'content-writer',
  'Developer': 'developer',
  'UX Expert': 'ux-expert',
  'CRO Expert': 'cro-expert',
  'Marketing Expert': 'marketing-expert',
  'Sales Expert': 'sales-expert',
  'Data Analyst': 'data-analyst',
  'Competitor Analyst': 'competitor-analyst',
  'Security Expert': 'security-expert',
  'Automation Engineer': 'automation-engineer',
  'Memory Manager': 'memory-manager',
  'Quality Reviewer': 'quality-reviewer',
  'Brand Guardian': 'brand-guardian',
  'Knowledge Manager': 'knowledge-manager',
};

function readDocMatrix(): { agent: string; cells: (string | null)[] }[] {
  const doc = readFileSync(new URL('../../docs/03-agents/README.md', import.meta.url), 'utf8');
  const lines = doc.split('\n');
  const rows: { agent: string; cells: (string | null)[] }[] = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const name = cells[0];
    if (!name || !(name in NAME_TO_SLUG)) continue; // ignore en-tête, séparateur, autres tables
    if (cells.length < SERVER_COLUMNS.length + 1) continue;
    rows.push({
      agent: NAME_TO_SLUG[name]!,
      cells: cells.slice(1, SERVER_COLUMNS.length + 1).map((c) => (c === '' ? null : normalizeCellCode(c))),
    });
  }
  return rows;
}

describe('matrice de permissions ≡ documentation', () => {
  const docRows = readDocMatrix();

  it('les 18 agents du tableau sont présents', () => {
    expect(docRows).toHaveLength(18);
  });

  it('chaque cellule encodée correspond EXACTEMENT au tableau de la doc', () => {
    const mismatches: string[] = [];
    for (const { agent, cells } of docRows) {
      SERVER_COLUMNS.forEach((server, i) => {
        const doc = cells[i] ?? null;
        const encoded = cellCode(agent, server);
        const encodedNorm = encoded ? normalizeCellCode(encoded) : null;
        if (doc !== encodedNorm) {
          mismatches.push(`${agent} × ${server} : doc="${doc}" vs code="${encodedNorm}"`);
        }
      });
    }
    expect(mismatches).toEqual([]);
  });
});

describe('capacités dérivées des codes', () => {
  it('S+P donne read+stage+produce ; RW donne read+stage+writeDirect ; PIPE donne pipe', () => {
    expect([...parseCell('S+P')].sort()).toEqual(['produce', 'read', 'stage']);
    expect([...parseCell('RW')].sort()).toEqual(['read', 'stage', 'writeDirect']);
    expect([...parseCell('PIPE')]).toEqual(['pipe']);
    expect([...parseCell('RO')]).toEqual(['read']);
  });
});
