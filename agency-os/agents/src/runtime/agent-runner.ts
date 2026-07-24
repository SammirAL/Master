import {
  agentResponse as agentResponseSchema,
  nowIso,
  CeoCannotExecuteError,
  NotFoundError,
  ReportFormatRejectedError,
  type AgentResponse,
  type Task,
} from '@agency-os/shared';
import type { TaskService } from '@agency-os/tasks';
import type { MessageBus } from '@agency-os/messaging';
import type { AgentBrain, McpGatewayPort, MemoryRecall, MemorySink, ReportRepository } from './ports.js';
import { loadContext } from './context-loader.js';
import { buildReport } from './report-builder.js';
import { enforceGuardrails } from './guardrails.js';
import { emitMemories } from './memory-emitter.js';
import type { AgentRegistry } from '../registry.js';

export interface AgentRunnerDeps {
  tasks: TaskService;
  reports: ReportRepository;
  bus: MessageBus;
  registry: AgentRegistry;
  /** Résout le cerveau (LLM) d'un agent par son slug. */
  brainFor: (agent: string) => AgentBrain | undefined;
  recall?: MemoryRecall;
  memory?: MemorySink;
  /** Passerelle MCP : si fournie, le cerveau reçoit un accès outils borné. */
  mcp?: McpGatewayPort;
  workerId?: string;
}

/**
 * Runtime générique : exécute une tâche assignée à un agent. Un seul code pour
 * tous les agents (seule la définition change). cf. docs/01-architecture.md §6.2.
 *
 * Séquence : réception → contexte → exécution (cerveau) → rapport (format
 * unique) → mémoire → remontée au CEO. Le CEO ne peut jamais être exécutant (P1).
 */
export class AgentRunner {
  private readonly worker: string;

  constructor(private readonly deps: AgentRunnerDeps) {
    this.worker = deps.workerId ?? 'worker:runtime';
  }

  async runTask(taskId: string): Promise<AgentResponse> {
    const task = await this.deps.tasks.getById(taskId);
    if (!task) throw new NotFoundError(`Tâche introuvable : ${taskId}`, { taskId });

    // Invariant P1 : le CEO ne s'exécute jamais.
    if (task.agent === 'ceo') {
      throw new CeoCannotExecuteError('Le runtime refuse une tâche assignée au CEO.', {
        taskId,
      });
    }

    // Idempotence (livraison at-least-once) : on n'exécute qu'une tâche `assigned`.
    // Un doublon de file sur une tâche déjà prise en charge est ignoré sans effet.
    if (task.status !== 'assigned') {
      return this.respond(task, 'ack', `Tâche ignorée (statut ${task.status}, déjà traitée).`, null, 1);
    }

    // Démarrage : assigned → in_progress.
    const started = await this.deps.tasks.start(taskId, this.worker);

    const definition = this.deps.registry.get(task.agent);
    const brain = this.deps.brainFor(task.agent);
    if (!brain) {
      throw new NotFoundError(`Aucun cerveau enregistré pour l'agent ${task.agent}`, {
        agent: task.agent,
      });
    }

    const context = await loadContext(started, definition, this.deps.recall);
    // Accès outils MCP borné à cet agent et à cette tâche (permissions appliquées
    // par la passerelle). `validated: false` : les actions L3 restent gated tant
    // qu'une Decision d'approbation n'a pas rejoué la tâche.
    if (this.deps.mcp) {
      const mcp = this.deps.mcp;
      context.tools = (server, method, args = {}) =>
        mcp.call(started.agent, server, method, args, {
          taskId: started.id,
          siteId: started.site_id,
          clientId: started.client_id,
          validated: false,
        });
    }
    const output = await brain.execute(context);
    enforceGuardrails(definition, output);

    // Construction + validation du rapport (format unique, P4).
    let report;
    try {
      report = buildReport(context, output);
    } catch (err) {
      if (err instanceof ReportFormatRejectedError) {
        await this.deps.tasks.block(taskId, this.worker, 'rapport non conforme — révision requise (P4)');
        await this.deps.bus.publish({
          from: task.agent,
          to: 'ceo',
          type: 'status_update',
          task_id: taskId,
          payload: { status: 'blocked', reason: 'report_format_rejected' },
        });
        return this.respond(task, 'error', 'Rapport rejeté : format non conforme.', null, output.confidence);
      }
      throw err;
    }

    await this.deps.reports.create(report);
    await emitMemories(context, output, this.deps.memory);
    await this.deps.tasks.attachResult(taskId, {
      summary: output.summary,
      report_id: report.id,
      artifacts: [],
      memory_candidates: [],
    });

    // Action de production (L3) → demande de validation ; sinon, achèvement.
    if (task.permission_level_required === 'L3') {
      await this.deps.tasks.requestValidation(taskId, this.worker);
      await this.deps.bus.publish({
        from: task.agent,
        to: 'ceo',
        type: 'validation_request',
        task_id: taskId,
        refs: [report.id],
      });
      return this.respond(task, 'validation_request', output.summary, report.id, output.confidence, [
        { kind: 'validation', detail: 'Action L3 en attente de validation CEO', from: 'ceo' },
      ]);
    }

    await this.deps.tasks.complete(taskId, this.worker);
    await this.deps.bus.publish({
      from: task.agent,
      to: 'ceo',
      type: 'report_submission',
      task_id: taskId,
      refs: [report.id],
    });
    return this.respond(task, 'completion', output.summary, report.id, output.confidence);
  }

  private respond(
    task: Task,
    type: AgentResponse['type'],
    summary: string,
    reportId: string | null,
    confidence: number,
    needs: AgentResponse['needs'] = [],
  ): AgentResponse {
    return agentResponseSchema.parse({
      task_id: task.id,
      agent: task.agent,
      type,
      summary,
      report_id: reportId,
      needs,
      confidence,
      at: nowIso(),
    });
  }
}
