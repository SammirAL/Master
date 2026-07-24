import { describe, it, expect } from 'vitest';
import { makeId, idRegex, ID_PREFIXES, taskId, siteId, clientId } from '../src/utils/ids.js';

describe('générateurs d\'identifiants', () => {
  it('produit des ids au bon format pour chaque type', () => {
    for (const kind of Object.keys(ID_PREFIXES) as (keyof typeof ID_PREFIXES)[]) {
      const id = makeId(kind);
      expect(id).toMatch(idRegex(ID_PREFIXES[kind]));
    }
  });

  it('horodate en UTC selon la date fournie', () => {
    const id = makeId('task', new Date('2026-07-24T23:30:00Z'));
    expect(id.startsWith('TSK-20260724-')).toBe(true);
  });

  it('génère des suffixes différents (quasi-unicité)', () => {
    const ids = new Set(Array.from({ length: 200 }, () => makeId('report')));
    expect(ids.size).toBeGreaterThan(190);
  });

  it('valide et rejette via les schémas Zod d\'id', () => {
    expect(taskId.safeParse('TSK-20260724-a8f3k2').success).toBe(true);
    expect(taskId.safeParse('TSK-2026-07-24-a8f3k2').success).toBe(false);
    expect(siteId.safeParse('site_acme-shop').success).toBe(true);
    expect(siteId.safeParse('acme-shop').success).toBe(false);
    expect(clientId.safeParse('cli_acme').success).toBe(true);
    expect(clientId.safeParse('client_acme').success).toBe(false);
  });
});
