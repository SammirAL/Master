import { describe, it, expect } from 'vitest';
import type { Task } from '@agency-os/shared';
import { isOverdue, bumpPriority, agedPriority } from '../src/scheduler.js';

function taskWith(partial: Partial<Task>): Task {
  return {
    id: 'TSK-20260724-a8f3k2',
    title: 't',
    description: 'd',
    priority: 'P2',
    site_id: 'site_acme-shop',
    client_id: 'cli_acme',
    agent: 'developer',
    created_by: 'ceo',
    workflow_run_id: null,
    depends_on: [],
    deadline: null,
    status: 'in_progress',
    permission_level_required: 'L2',
    validation: null,
    logs: [],
    result: null,
    history: [],
    cost: { llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 },
    created_at: '2026-07-24T00:00:00Z',
    updated_at: '2026-07-24T00:00:00Z',
    ...partial,
  };
}

describe('ordonnancement / vieillissement des priorités', () => {
  it('bumpPriority monte d\'un cran et plafonne à P0', () => {
    expect(bumpPriority('P3')).toBe('P2');
    expect(bumpPriority('P2')).toBe('P1');
    expect(bumpPriority('P1')).toBe('P0');
    expect(bumpPriority('P0')).toBe('P0');
  });

  it('isOverdue vrai après la deadline, faux si terminal ou sans deadline', () => {
    const now = new Date('2026-07-25T00:00:00Z');
    expect(isOverdue(taskWith({ deadline: '2026-07-24T00:00:00Z' }), now)).toBe(true);
    expect(isOverdue(taskWith({ deadline: '2026-07-26T00:00:00Z' }), now)).toBe(false);
    expect(isOverdue(taskWith({ deadline: null }), now)).toBe(false);
    expect(isOverdue(taskWith({ deadline: '2026-07-24T00:00:00Z', status: 'done' }), now)).toBe(false);
  });

  it('agedPriority remonte une P2 en retard vers P1', () => {
    const now = new Date('2026-07-25T00:00:00Z');
    expect(agedPriority(taskWith({ priority: 'P2', deadline: '2026-07-24T00:00:00Z' }), now)).toBe('P1');
    expect(agedPriority(taskWith({ priority: 'P2', deadline: null }), now)).toBe('P2');
  });
});
