import { describe, it, expect, afterEach } from 'vitest';
import type { AgentMessage } from '@agency-os/shared';
import { createMemoryWiring, type Wiring } from '@agency-os/backend';
import { taskInput } from '../fixtures/task-inputs.js';

/**
 * Critère de sortie Phase 1 : une tâche avec `depends_on` ne démarre qu'après
 * que ses dépendances sont `done`. On observe l'ordre d'achèvement via les
 * messages `report_submission` remontés au CEO.
 */
let current: Wiring | null = null;
afterEach(async () => {
  await current?.close();
  current = null;
});

describe('E2E — ordre des dépendances', () => {
  it('la tâche dépendante ne s\'exécute qu\'après la fin de sa dépendance', async () => {
    const w = createMemoryWiring();
    w.startWorker();
    current = w;

    const completion: string[] = [];
    w.bus.subscribe('ceo', async (m: AgentMessage) => {
      if (m.type === 'report_submission' && m.task_id) completion.push(m.task_id);
    });

    // dep et dependent existent AVANT que dep ne soit exécutée.
    const dep = await w.tasks.create(taskInput({ title: 'Dépendance' }));
    await w.tasks.assign(dep.id, 'ceo');
    const dependent = await w.tasks.create(taskInput({ title: 'Dépendante', depends_on: [dep.id] }));
    await w.tasks.assign(dependent.id, 'ceo');

    // Libère ce qui est prêt : seule `dep` l'est ; son achèvement libère `dependent`.
    await w.dispatcher.releaseReady();

    const depFinal = await w.tasks.getById(dep.id);
    const dependentFinal = await w.tasks.getById(dependent.id);
    expect(depFinal?.status).toBe('done');
    expect(dependentFinal?.status).toBe('done');

    // La dépendance s'achève STRICTEMENT avant la dépendante.
    expect(completion).toEqual([dep.id, dependent.id]);
  });

  it('une tâche dont la dépendance n\'est pas done n\'est pas mise en file', async () => {
    const w = createMemoryWiring();
    w.startWorker();
    current = w;

    const dep = await w.tasks.create(taskInput());
    const { enqueued } = await w.dispatcher.dispatch(taskInput({ depends_on: [dep.id] }));
    expect(enqueued).toBe(false);
  });
});
