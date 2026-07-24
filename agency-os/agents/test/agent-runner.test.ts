import { describe, it, expect } from 'vitest';
import { CeoCannotExecuteError, type TaskCreateInput } from '@agency-os/shared';
import { TaskService, InMemoryTaskRepository, fixedClock } from '@agency-os/tasks';
import { InProcessMessageBus, InMemoryMessageStore, type MessageBus } from '@agency-os/messaging';
import { AgentRunner } from '../src/runtime/agent-runner.js';
import { AgentRegistry } from '../src/registry.js';
import { InMemoryReportRepository } from '../src/adapters/in-memory-report-repository.js';
import { createFakeDefinition, createFakeBrain, createMalformedBrain } from '../src/fake-agent.js';

function harness(agentSlug = 'technical-seo') {
  const tasks = new TaskService(new InMemoryTaskRepository(), fixedClock('2026-07-24T10:00:00Z'));
  const reports = new InMemoryReportRepository();
  const bus: MessageBus = new InProcessMessageBus(new InMemoryMessageStore());
  const registry = AgentRegistry.fromDefinitions([createFakeDefinition(agentSlug)]);
  return { tasks, reports, bus, registry };
}

const input = (over: Partial<TaskCreateInput> = {}): TaskCreateInput => ({
  title: 'Tâche factice',
  description: '…',
  priority: 'P2',
  site_id: 'site_acme-shop',
  client_id: 'cli_acme',
  agent: 'technical-seo',
  created_by: 'ceo',
  permission_level_required: 'L1',
  workflow_run_id: null,
  depends_on: [],
  deadline: null,
  ...over,
});

describe('AgentRunner', () => {
  it('exécute une tâche non-L3 jusqu\'à done avec un rapport valide', async () => {
    const h = harness();
    const runner = new AgentRunner({
      tasks: h.tasks,
      reports: h.reports,
      bus: h.bus,
      registry: h.registry,
      brainFor: () => createFakeBrain(),
    });

    const task = await h.tasks.create(input());
    await h.tasks.assign(task.id, 'ceo');

    const response = await runner.runTask(task.id);

    expect(response.type).toBe('completion');
    expect(response.report_id).toMatch(/^RPT-/);
    const done = await h.tasks.getById(task.id);
    expect(done?.status).toBe('done');
    expect(done?.result?.report_id).toBe(response.report_id);
    // rapport persisté
    expect(await h.reports.getById(response.report_id!)).not.toBeNull();
  });

  it('demande une validation pour une action L3 (n\'atteint pas done)', async () => {
    const h = harness();
    const runner = new AgentRunner({
      tasks: h.tasks,
      reports: h.reports,
      bus: h.bus,
      registry: h.registry,
      brainFor: () => createFakeBrain(),
    });

    const task = await h.tasks.create(input({ permission_level_required: 'L3' }));
    await h.tasks.assign(task.id, 'ceo');

    const response = await runner.runTask(task.id);

    expect(response.type).toBe('validation_request');
    const t = await h.tasks.getById(task.id);
    expect(t?.status).toBe('awaiting_validation');
    expect(t?.status).not.toBe('done');
  });

  it('refuse d\'exécuter une tâche assignée au CEO (P1)', async () => {
    const h = harness('ceo');
    // On force une tâche dont l'agent est ceo en contournant TaskService.create.
    const repo = new InMemoryTaskRepository();
    const now = '2026-07-24T10:00:00Z';
    await repo.create({
      id: 'TSK-20260724-ceoceo',
      title: 't', description: 'd', priority: 'P2',
      site_id: null, client_id: null, agent: 'ceo', created_by: 'ceo',
      workflow_run_id: null, depends_on: [], deadline: null, status: 'assigned',
      permission_level_required: 'L1', validation: null, logs: [], result: null,
      history: [{ at: now, from: null, to: 'assigned', by: 'ceo', reason: 't' }],
      cost: { llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 },
      created_at: now, updated_at: now,
    });
    const tasks = new TaskService(repo, fixedClock(now));
    const runner = new AgentRunner({
      tasks, reports: h.reports, bus: h.bus, registry: h.registry,
      brainFor: () => createFakeBrain(),
    });
    await expect(runner.runTask('TSK-20260724-ceoceo')).rejects.toBeInstanceOf(CeoCannotExecuteError);
  });

  it('bloque la tâche si le rapport est hors format (P4)', async () => {
    const h = harness();
    const runner = new AgentRunner({
      tasks: h.tasks,
      reports: h.reports,
      bus: h.bus,
      registry: h.registry,
      brainFor: () => createMalformedBrain(),
    });

    const task = await h.tasks.create(input());
    await h.tasks.assign(task.id, 'ceo');

    const response = await runner.runTask(task.id);
    expect(response.type).toBe('error');
    const t = await h.tasks.getById(task.id);
    expect(t?.status).toBe('blocked');
  });
});
