import { describe, it, expect } from 'vitest';
import { CeoCannotExecuteError, InvalidStateTransitionError, type TaskCreateInput } from '@agency-os/shared';
import { TaskService } from '../src/task-service.js';
import { InMemoryTaskRepository } from '../src/adapters/in-memory-task-repository.js';
import { fixedClock } from '../src/clock.js';

function makeService() {
  const repo = new InMemoryTaskRepository();
  const svc = new TaskService(repo, fixedClock('2026-07-24T10:00:00Z'));
  return { repo, svc };
}

const baseInput: TaskCreateInput = {
  title: 'Audit technique SEO',
  description: 'Corriger les données structurées.',
  priority: 'P1',
  site_id: 'site_acme-shop',
  client_id: 'cli_acme',
  agent: 'technical-seo',
  created_by: 'ceo',
  permission_level_required: 'L2',
  workflow_run_id: null,
  depends_on: [],
  deadline: null,
};

describe('TaskService.create', () => {
  it('crée une tâche à l\'état draft avec une entrée d\'historique', async () => {
    const { svc } = makeService();
    const t = await svc.create(baseInput);
    expect(t.status).toBe('draft');
    expect(t.id).toMatch(/^TSK-\d{8}-[a-z0-9]{6}$/);
    expect(t.history).toHaveLength(1);
    expect(t.history[0]).toMatchObject({ from: null, to: 'draft', by: 'ceo' });
  });

  it('refuse une tâche assignée au CEO (P1)', async () => {
    const { svc } = makeService();
    await expect(svc.create({ ...baseInput, agent: 'ceo' })).rejects.toBeInstanceOf(
      CeoCannotExecuteError,
    );
  });

  it('crée le bloc validation pour une action L3', async () => {
    const { svc } = makeService();
    const t = await svc.create({ ...baseInput, permission_level_required: 'L3' });
    expect(t.validation).toEqual({
      required: true,
      requested_at: null,
      decided_by: null,
      decision_id: null,
    });
  });
});

describe('TaskService.transition', () => {
  it('déroule le cycle de vie complet draft → done avec history append-only', async () => {
    const { svc } = makeService();
    const t = await svc.create(baseInput);

    await svc.assign(t.id, 'ceo');
    await svc.start(t.id, 'worker:w-01');
    await svc.requestValidation(t.id, 'worker:w-01');
    const approved = await svc.transition(t.id, 'in_progress', 'ceo', 'approuvé');
    const done = await svc.complete(approved.id, 'worker:w-01');

    expect(done.status).toBe('done');
    const path = done.history.map((h) => h.to);
    expect(path).toEqual(['draft', 'assigned', 'in_progress', 'awaiting_validation', 'in_progress', 'done']);
    // history strictement croissant, jamais réécrit
    expect(done.history).toHaveLength(6);
  });

  it('rejette une transition illégale', async () => {
    const { svc } = makeService();
    const t = await svc.create(baseInput);
    await expect(svc.complete(t.id, 'worker:w-01')).rejects.toBeInstanceOf(
      InvalidStateTransitionError,
    );
  });
});

describe('TaskService.attachResult', () => {
  it('attache un résultat sans altérer l\'historique', async () => {
    const { svc } = makeService();
    const t = await svc.create(baseInput);
    const withResult = await svc.attachResult(t.id, {
      summary: 'Terminé',
      report_id: 'RPT-20260724-b2c9d1',
      artifacts: [],
      memory_candidates: [],
    });
    expect(withResult.result?.report_id).toBe('RPT-20260724-b2c9d1');
    expect(withResult.history).toHaveLength(1);
  });
});
