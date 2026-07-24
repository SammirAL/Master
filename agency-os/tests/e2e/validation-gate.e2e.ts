import { describe, it, expect, afterEach } from 'vitest';
import { createMemoryWiring, type Wiring } from '@agency-os/backend';
import { taskInput } from '../fixtures/task-inputs.js';

/**
 * Critère de sortie Phase 1 : aucune action L3 n'aboutit sans une `Decision`
 * d'approbation du CEO. cf. docs/06-plan-de-developpement.md (Phase 1).
 */
let current: Wiring | null = null;
afterEach(async () => {
  await current?.close();
  current = null;
});

function bootWithWorker(): Wiring {
  const w = createMemoryWiring();
  w.startWorker();
  current = w;
  return w;
}

describe('E2E — gate de validation', () => {
  it('une tâche standard circule draft → done via le worker', async () => {
    const w = bootWithWorker();
    const { task } = await w.dispatcher.dispatch(taskInput());
    const done = await w.tasks.getById(task.id);
    expect(done?.status).toBe('done');
    expect(done?.history.map((h) => h.to)).toEqual(['draft', 'assigned', 'in_progress', 'done']);
  });

  it('une action L3 s\'arrête en awaiting_validation et n\'atteint JAMAIS done sans Decision', async () => {
    const w = bootWithWorker();
    const { task } = await w.dispatcher.dispatch(taskInput({ permission_level_required: 'L3' }));

    const awaiting = await w.tasks.getById(task.id);
    expect(awaiting?.status).toBe('awaiting_validation');
    expect(awaiting?.status).not.toBe('done');
    // Aucune décision n'a encore été prise : la tâche ne porte pas de decision_id.
    expect(awaiting?.validation?.decision_id).toBeNull();
  });

  it('après approbation CEO, la tâche atteint done et trace la Decision', async () => {
    const w = bootWithWorker();
    const { task } = await w.dispatcher.dispatch(taskInput({ permission_level_required: 'L3' }));

    const { decision, task: done } = await w.validation.approve(task.id, {
      rationale: 'Impact fort, risque faible.',
    });

    expect(decision.decision).toBe('approve');
    expect(done.status).toBe('done');
    expect(done.validation?.decision_id).toBe(decision.id);
    expect(done.history.map((h) => h.to)).toEqual([
      'draft', 'assigned', 'in_progress', 'awaiting_validation', 'in_progress', 'done',
    ]);
  });
});
