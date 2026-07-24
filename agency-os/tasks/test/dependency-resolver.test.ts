import { describe, it, expect } from 'vitest';
import type { TaskCreateInput } from '@agency-os/shared';
import { TaskService } from '../src/task-service.js';
import { InMemoryTaskRepository } from '../src/adapters/in-memory-task-repository.js';
import { dependenciesSatisfied, unmetDependencies } from '../src/dependency-resolver.js';
import { fixedClock } from '../src/clock.js';

const input: TaskCreateInput = {
  title: 'Tâche',
  description: '…',
  priority: 'P2',
  site_id: 'site_acme-shop',
  client_id: 'cli_acme',
  agent: 'developer',
  created_by: 'ceo',
  permission_level_required: 'L2',
  workflow_run_id: null,
  depends_on: [],
  deadline: null,
};

async function driveToDone(svc: TaskService, id: string) {
  await svc.assign(id, 'ceo');
  await svc.start(id, 'worker:w');
  await svc.complete(id, 'worker:w');
}

describe('résolution des dépendances', () => {
  it('une tâche sans dépendance est prête', async () => {
    const repo = new InMemoryTaskRepository();
    const svc = new TaskService(repo, fixedClock('2026-07-24T10:00:00Z'));
    const t = await svc.create(input);
    expect(await dependenciesSatisfied(t, repo)).toBe(true);
  });

  it('une dépendance non terminée bloque le démarrage', async () => {
    const repo = new InMemoryTaskRepository();
    const svc = new TaskService(repo, fixedClock('2026-07-24T10:00:00Z'));
    const dep = await svc.create(input);
    const t = await svc.create({ ...input, depends_on: [dep.id] });

    expect(await dependenciesSatisfied(t, repo)).toBe(false);
    expect(await unmetDependencies(t, repo)).toEqual([dep.id]);

    await driveToDone(svc, dep.id);
    expect(await dependenciesSatisfied(t, repo)).toBe(true);
  });

  it('une dépendance inexistante est considérée non satisfaite', async () => {
    const repo = new InMemoryTaskRepository();
    const svc = new TaskService(repo, fixedClock('2026-07-24T10:00:00Z'));
    const t = await svc.create({ ...input, depends_on: ['TSK-20260101-zzzzzz'] });
    expect(await dependenciesSatisfied(t, repo)).toBe(false);
  });
});
