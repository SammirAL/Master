import { describe, it, expect } from 'vitest';
import type { Task, TaskCreateInput } from '@agency-os/shared';
import {
  TaskService,
  InMemoryTaskRepository,
  InMemoryQueue,
  fixedClock,
} from '@agency-os/tasks';
import { InProcessMessageBus, InMemoryMessageStore } from '@agency-os/messaging';
import { DecisionEngine } from '../src/decision-engine.js';
import { ValidationService } from '../src/validation-service.js';
import { TaskDispatcher } from '../src/task-dispatcher.js';
import { InMemoryDecisionRepository } from '../src/adapters/in-memory-decision-repository.js';

function world() {
  const repo = new InMemoryTaskRepository();
  const tasks = new TaskService(repo, fixedClock('2026-07-24T10:00:00Z'));
  const bus = new InProcessMessageBus(new InMemoryMessageStore());
  const decisionsRepo = new InMemoryDecisionRepository();
  const decisions = new DecisionEngine(decisionsRepo);
  const validation = new ValidationService(tasks, decisions, bus);
  const queue = new InMemoryQueue();
  const dispatcher = new TaskDispatcher({ tasks, repo, queue, bus });
  return { repo, tasks, bus, decisions, decisionsRepo, validation, queue, dispatcher };
}

const input = (over: Partial<TaskCreateInput> = {}): TaskCreateInput => ({
  title: 'Tâche', description: '…', priority: 'P1',
  site_id: 'site_acme-shop', client_id: 'cli_acme', agent: 'technical-seo',
  created_by: 'ceo', permission_level_required: 'L1',
  workflow_run_id: null, depends_on: [], deadline: null, ...over,
});

/** Amène une tâche jusqu'à `awaiting_validation` sans passer par le runtime agent. */
async function toAwaitingValidation(tasks: TaskService, task: Task): Promise<void> {
  await tasks.assign(task.id, 'ceo');
  await tasks.start(task.id, 'worker:w');
  await tasks.attachResult(task.id, {
    summary: 'prêt', report_id: 'RPT-20260724-b2c9d1', artifacts: [], memory_candidates: [],
  });
  await tasks.requestValidation(task.id, 'worker:w');
}

describe('TaskDispatcher', () => {
  it('crée, assigne et enfile une tâche prête', async () => {
    const w = world();
    const { task, enqueued } = await w.dispatcher.dispatch(input());
    expect(task.status).toBe('assigned');
    expect(enqueued).toBe(true);
  });

  it('n\'enfile pas une tâche dont une dépendance n\'est pas done', async () => {
    const w = world();
    const dep = await w.tasks.create(input());
    const { enqueued } = await w.dispatcher.dispatch(input({ depends_on: [dep.id] }));
    expect(enqueued).toBe(false);
  });

  it('releaseReady enfile les tâches devenues prêtes', async () => {
    const w = world();
    const dep = await w.tasks.create(input());
    await w.dispatcher.dispatch(input({ depends_on: [dep.id] }));
    // La dépendance passe done.
    await w.tasks.assign(dep.id, 'ceo');
    await w.tasks.start(dep.id, 'worker:w');
    await w.tasks.complete(dep.id, 'worker:w');
    const released = await w.dispatcher.releaseReady();
    expect(released).toHaveLength(1);
  });
});

describe('ValidationService — gate L3', () => {
  it('approuve : Decision créée, tâche menée à done, lien tracé', async () => {
    const w = world();
    const task = await w.tasks.create(input({ permission_level_required: 'L3' }));
    await toAwaitingValidation(w.tasks, task);

    const { decision, task: done } = await w.validation.approve(task.id, {
      rationale: 'Impact fort, risque faible.',
      conditions: ['déployer hors heures de pointe'],
    });

    expect(decision.decision).toBe('approve');
    expect(done.status).toBe('done');
    expect(done.validation?.decision_id).toBe(decision.id);
    expect(done.validation?.decided_by).toBe('ceo');
    // La Decision est persistée et rattachée à la tâche.
    expect(await w.decisionsRepo.getById(decision.id)).not.toBeNull();
  });

  it('rejette : Decision créée, tâche en rejected', async () => {
    const w = world();
    const task = await w.tasks.create(input({ permission_level_required: 'L3' }));
    await toAwaitingValidation(w.tasks, task);

    const { decision, task: rejected } = await w.validation.reject(task.id, {
      rationale: 'Trop risqué en période de soldes.',
    });
    expect(decision.decision).toBe('reject');
    expect(rejected.status).toBe('rejected');
  });

  it('approbation possible par un humain (escalade)', async () => {
    const w = world();
    const task = await w.tasks.create(input({ permission_level_required: 'L3' }));
    await toAwaitingValidation(w.tasks, task);
    const { decision } = await w.validation.approve(task.id, {
      rationale: 'Validé par l\'opérateur.',
      decidedBy: 'human:u-42',
    });
    expect(decision.decided_by).toBe('human:u-42');
  });
});
