import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'node:http';
import type { Wiring } from '@agency-os/backend';
import { toHttpError } from './error-mapping.js';

/**
 * API HTTP minimale (phase 1) : distribution de tâches et gouvernance
 * (validation humaine/CEO). Volontairement sans framework à ce stade ; elle
 * migrera vers NestJS quand la surface s'élargira (dashboard, phase 3).
 *
 * Routes :
 *  - GET  /health
 *  - POST /tasks                              (dispatch)
 *  - GET  /tasks/:id
 *  - POST /governance/tasks/:id/approve       { rationale, conditions?, decidedBy? }
 *  - POST /governance/tasks/:id/reject        { rationale }
 */
export function createApiServer(wiring: Wiring): Server {
  return createServer((req, res) => {
    void handle(req, res, wiring).catch((err: unknown) => {
      const { status, body } = toHttpError(err);
      sendJson(res, status, body);
    });
  });
}

async function handle(req: IncomingMessage, res: ServerResponse, wiring: Wiring): Promise<void> {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname;

  if (method === 'GET' && path === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (method === 'POST' && path === '/tasks') {
    const input = await readJson(req);
    const result = await wiring.dispatcher.dispatch(input as never);
    return sendJson(res, 201, result);
  }

  const taskGet = matchPath(path, '/tasks/:id');
  if (method === 'GET' && taskGet) {
    const task = await wiring.tasks.getById(taskGet['id']!);
    return task ? sendJson(res, 200, { task }) : sendJson(res, 404, { error: 'Tâche introuvable' });
  }

  const approve = matchPath(path, '/governance/tasks/:id/approve');
  if (method === 'POST' && approve) {
    const body = (await readJson(req)) as { rationale: string; conditions?: string[]; decidedBy?: string };
    const result = await wiring.validation.approve(approve['id']!, {
      rationale: body.rationale,
      ...(body.conditions ? { conditions: body.conditions } : {}),
      ...(body.decidedBy ? { decidedBy: body.decidedBy as never } : {}),
    });
    return sendJson(res, 200, result);
  }

  const reject = matchPath(path, '/governance/tasks/:id/reject');
  if (method === 'POST' && reject) {
    const body = (await readJson(req)) as { rationale: string };
    const result = await wiring.validation.reject(reject['id']!, { rationale: body.rationale });
    return sendJson(res, 200, result);
  }

  sendJson(res, 404, { error: `Route inconnue : ${method} ${path}` });
}

/** Route paramétrée minimale : `/tasks/:id` → { id } ou null. */
function matchPath(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const p = patternParts[i]!;
    const v = pathParts[i]!;
    if (p.startsWith(':')) params[p.slice(1)] = v;
    else if (p !== v) return null;
  }
  return params;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(payload);
}
