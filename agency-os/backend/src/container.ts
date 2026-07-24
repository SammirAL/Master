import {
  TaskService,
  InMemoryTaskRepository,
  InMemoryQueue,
  BullMqQueue,
  DrizzleTaskRepository,
  systemClock,
  type QueuePort,
  type TaskRepository,
  type AuditSink,
} from '@agency-os/tasks';
import {
  InProcessMessageBus,
  InMemoryMessageStore,
  type MessageBus,
} from '@agency-os/messaging';
import {
  AgentRunner,
  AgentRegistry,
  InMemoryReportRepository,
  DrizzleReportRepository,
  createFakeDefinition,
  createFakeBrain,
  type ReportRepository,
} from '@agency-os/agents';
import {
  DecisionEngine,
  ValidationService,
  TaskDispatcher,
  InMemoryDecisionRepository,
  DrizzleDecisionRepository,
} from '@agency-os/ceo';
import { createDb } from '@agency-os/database';
import type { BackendConfig } from './config.js';

/** Agents connus en phase 1 (tous servis par l'agent factice). */
const KNOWN_AGENTS = [
  'project-manager',
  'seo-strategist',
  'technical-seo',
  'content-writer',
  'developer',
];

/** Journal d'audit minimal vers la console (phase 1, mode mémoire). */
const consoleAudit: AuditSink = {
  record: async (e) => {
    console.log(`[audit] ${e.at} ${e.kind} by=${e.actor} task=${e.taskId ?? '-'}`);
  },
};

export interface Wiring {
  tasks: TaskService;
  repo: TaskRepository;
  reports: ReportRepository;
  bus: MessageBus;
  decisions: DecisionEngine;
  validation: ValidationService;
  dispatcher: TaskDispatcher;
  runner: AgentRunner;
  queue: QueuePort;
  registry: AgentRegistry;
  /** Démarre le worker : chaque tâche enfilée est exécutée, puis les dépendants prêts sont libérés. */
  startWorker: () => void;
  close: () => Promise<void>;
}

function buildRegistry(): AgentRegistry {
  return AgentRegistry.fromDefinitions(KNOWN_AGENTS.map((slug) => createFakeDefinition(slug)));
}

function assemble(
  repo: TaskRepository,
  reports: ReportRepository,
  queue: QueuePort,
  decisionEngine: DecisionEngine,
  bus: MessageBus,
  closeExtra: () => Promise<void>,
): Wiring {
  const tasks = new TaskService(repo, systemClock);
  const registry = buildRegistry();
  const validation = new ValidationService(tasks, decisionEngine, bus);
  const dispatcher = new TaskDispatcher({ tasks, repo, queue, bus });
  const runner = new AgentRunner({
    tasks,
    reports,
    bus,
    registry,
    brainFor: () => createFakeBrain(),
  });

  const startWorker = (): void => {
    queue.process(async (job) => {
      await runner.runTask(job.taskId);
      await dispatcher.releaseReady();
    });
  };

  return {
    tasks,
    repo,
    reports,
    bus,
    decisions: decisionEngine,
    validation,
    dispatcher,
    runner,
    queue,
    registry,
    startWorker,
    close: async () => {
      await queue.close();
      await closeExtra();
    },
  };
}

/** Câblage en mémoire (défaut phase 1 : sans base ni Redis). */
export function createMemoryWiring(): Wiring {
  const repo = new InMemoryTaskRepository();
  const reports = new InMemoryReportRepository();
  const queue = new InMemoryQueue();
  const bus = new InProcessMessageBus(new InMemoryMessageStore(), { audit: consoleAudit });
  const decisions = new DecisionEngine(new InMemoryDecisionRepository());
  return assemble(repo, reports, queue, decisions, bus, async () => {});
}

/** Câblage PostgreSQL + Redis (BullMQ). Nécessite DATABASE_URL et REDIS_URL. */
export function createPostgresWiring(config: BackendConfig): Wiring {
  if (!config.databaseUrl) throw new Error('DATABASE_URL requis en mode postgres.');
  if (!config.redisUrl) throw new Error('REDIS_URL requis en mode postgres.');

  const { db, close: closeDb } = createDb(config.databaseUrl);
  const repo = new DrizzleTaskRepository(db);
  const reports = new DrizzleReportRepository(db);
  const decisions = new DecisionEngine(new DrizzleDecisionRepository(db));

  const url = new URL(config.redisUrl);
  const queue = new BullMqQueue({
    host: url.hostname,
    port: Number(url.port || 6379),
  });

  const bus = new InProcessMessageBus(new InMemoryMessageStore(), { audit: consoleAudit });
  return assemble(repo, reports, queue, decisions, bus, closeDb);
}

/** Sélectionne le câblage selon la configuration. */
export function createWiring(config: BackendConfig): Wiring {
  return config.mode === 'postgres' ? createPostgresWiring(config) : createMemoryWiring();
}
