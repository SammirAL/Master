import { z } from 'zod';
import { taskId, reportId, memoryId, workflowRunId, siteId, clientId, agentSlug } from '../utils/ids.js';
import { isoDateTime } from '../utils/dates.js';
import { taskStatus, priority, permissionLevel } from './enums.js';
import { createdBy, decidedBy, decisionId } from './refs.js';

/**
 * Task — la tâche. cf. docs/07-schemas.md §1.
 * Unité de travail distribuée par le CEO et exécutée par un agent.
 */

const taskLogEntry = z.object({
  at: isoDateTime,
  level: z.enum(['debug', 'info', 'warn', 'error']),
  event: z.string(),
  detail: z.string(),
});

const taskValidation = z.object({
  required: z.boolean(),
  requested_at: isoDateTime.nullable(),
  decided_by: decidedBy.nullable(),
  decision_id: decisionId.nullable(),
});

const taskResult = z.object({
  summary: z.string(),
  report_id: reportId.nullable(),
  artifacts: z.array(z.string()).default([]),
  memory_candidates: z.array(memoryId).default([]),
});

const taskHistoryEntry = z.object({
  at: isoDateTime,
  from: taskStatus.nullable(),
  to: taskStatus,
  by: z.string(), // "worker:w-04", "ceo", "human:<id>", "system"
  reason: z.string(),
});

const taskCost = z.object({
  llm_tokens: z.number().int().min(0).default(0),
  mcp_calls: z.number().int().min(0).default(0),
  usd_estimate: z.number().min(0).default(0),
});

export const task = z.object({
  id: taskId,
  title: z.string().min(1),
  description: z.string(),
  priority,
  site_id: siteId.nullable(),
  client_id: clientId.nullable(),
  agent: agentSlug,
  created_by: createdBy,
  workflow_run_id: workflowRunId.nullable(),
  depends_on: z.array(taskId).default([]),
  deadline: isoDateTime.nullable(),
  status: taskStatus,
  permission_level_required: permissionLevel,
  validation: taskValidation.nullable(),
  logs: z.array(taskLogEntry).default([]),
  result: taskResult.nullable(),
  history: z.array(taskHistoryEntry).default([]),
  cost: taskCost.default({ llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 }),
  created_at: isoDateTime,
  updated_at: isoDateTime,
});

export type Task = z.infer<typeof task>;
export type TaskLogEntry = z.infer<typeof taskLogEntry>;
export type TaskHistoryEntry = z.infer<typeof taskHistoryEntry>;

/** Entrée pour créer une tâche (les champs dérivés sont ajoutés par le service). */
export const taskCreateInput = task.pick({
  title: true,
  description: true,
  priority: true,
  site_id: true,
  client_id: true,
  agent: true,
  created_by: true,
  permission_level_required: true,
}).extend({
  workflow_run_id: workflowRunId.nullable().default(null),
  depends_on: z.array(taskId).default([]),
  deadline: isoDateTime.nullable().default(null),
});
export type TaskCreateInput = z.infer<typeof taskCreateInput>;
