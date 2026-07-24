import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createMemoryWiring, type Wiring } from '@agency-os/backend';
import { createApiServer } from '@agency-os/api';
import { taskInput } from '../fixtures/task-inputs.js';

/**
 * E2E de l'API HTTP : distribution d'une tâche et gouvernance (approbation).
 */
let wiring: Wiring;
let server: Server;
let base: string;

beforeAll(async () => {
  wiring = createMemoryWiring();
  wiring.startWorker();
  server = createApiServer(wiring);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await wiring.close();
});

describe('E2E — API HTTP', () => {
  it('GET /health répond ok', async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('POST /tasks distribue une tâche, GET /tasks/:id la relit (done)', async () => {
    const res = await fetch(`${base}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(taskInput()),
    });
    expect(res.status).toBe(201);
    const { task } = (await res.json()) as { task: { id: string } };

    const got = await fetch(`${base}/tasks/${task.id}`);
    expect(got.status).toBe(200);
    const body = (await got.json()) as { task: { status: string } };
    expect(body.task.status).toBe('done');
  });

  it('POST /tasks avec agent=ceo est refusé (400, CEO_CANNOT_EXECUTE)', async () => {
    const res = await fetch(`${base}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(taskInput({ agent: 'ceo' })),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('CEO_CANNOT_EXECUTE');
  });

  it('POST /governance/tasks/:id/approve mène une action L3 à done', async () => {
    const created = await fetch(`${base}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(taskInput({ permission_level_required: 'L3' })),
    });
    const { task } = (await created.json()) as { task: { id: string } };

    const approved = await fetch(`${base}/governance/tasks/${task.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rationale: 'Validé pour le test.' }),
    });
    expect(approved.status).toBe(200);
    const body = (await approved.json()) as { task: { status: string }; decision: { decision: string } };
    expect(body.task.status).toBe('done');
    expect(body.decision.decision).toBe('approve');
  });
});
