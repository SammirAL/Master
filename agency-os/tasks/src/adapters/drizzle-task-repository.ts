import { eq, and, type SQL } from 'drizzle-orm';
import { schema } from '@agency-os/database';
import { task as taskSchema, type Task } from '@agency-os/shared';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { TaskFilter, TaskRepository } from '../ports.js';

type Db = NodePgDatabase<typeof schema>;
type Row = typeof schema.tasks.$inferSelect;
type Insert = typeof schema.tasks.$inferInsert;

/** Convertit une ligne DB en `Task` (ISO 8601) puis la revalide par Zod. */
function rowToTask(row: Row): Task {
  return taskSchema.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    site_id: row.siteId,
    client_id: row.clientId,
    agent: row.agent,
    created_by: row.createdBy,
    workflow_run_id: row.workflowRunId,
    depends_on: row.dependsOn,
    deadline: row.deadline ? row.deadline.toISOString() : null,
    status: row.status,
    permission_level_required: row.permissionLevelRequired,
    validation: row.validation,
    logs: row.logs,
    result: row.result,
    history: row.history,
    cost: row.cost,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  });
}

/** Convertit un `Task` en valeurs d'insertion/mise à jour (Date pour timestamptz). */
function taskToRow(task: Task): Insert {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    siteId: task.site_id,
    clientId: task.client_id,
    agent: task.agent,
    createdBy: task.created_by,
    workflowRunId: task.workflow_run_id,
    dependsOn: task.depends_on,
    deadline: task.deadline ? new Date(task.deadline) : null,
    status: task.status,
    permissionLevelRequired: task.permission_level_required,
    validation: task.validation,
    logs: task.logs,
    result: task.result,
    history: task.history,
    cost: task.cost,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
  };
}

/** Dépôt de tâches adossé à PostgreSQL via Drizzle. */
export class DrizzleTaskRepository implements TaskRepository {
  constructor(private readonly db: Db) {}

  async create(task: Task): Promise<Task> {
    await this.db.insert(schema.tasks).values(taskToRow(task));
    return task;
  }

  async getById(id: string): Promise<Task | null> {
    const rows = await this.db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    const row = rows[0];
    return row ? rowToTask(row) : null;
  }

  async update(task: Task): Promise<Task> {
    await this.db.update(schema.tasks).set(taskToRow(task)).where(eq(schema.tasks.id, task.id));
    return task;
  }

  async list(filter: TaskFilter = {}): Promise<Task[]> {
    const conditions: SQL[] = [];
    if (filter.status) conditions.push(eq(schema.tasks.status, filter.status));
    if (filter.agent) conditions.push(eq(schema.tasks.agent, filter.agent));
    if (filter.siteId !== undefined && filter.siteId !== null) {
      conditions.push(eq(schema.tasks.siteId, filter.siteId));
    }
    if (filter.workflowRunId !== undefined && filter.workflowRunId !== null) {
      conditions.push(eq(schema.tasks.workflowRunId, filter.workflowRunId));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const rows = await this.db.select().from(schema.tasks).where(where);
    return rows.map(rowToTask);
  }
}
