/**
 * Types dérivés des schémas Zod (source unique). Aucun type n'est défini à la
 * main ici : tout provient de `z.infer<...>` pour garantir schéma ≡ type.
 */
export type {
  TaskStatus,
  Priority,
  PermissionLevel,
  MessageType,
  DecisionKind,
  StatusGlobal,
  MemoryType,
  Platform,
  DecisionOutcome,
  MemoryCollection,
} from '../schemas/enums.js';

export type { Task, TaskCreateInput, TaskLogEntry, TaskHistoryEntry } from '../schemas/task.js';
export type { Report, ReportSections, ReportKpiEntry } from '../schemas/report.js';
export type { AgentResponse, AgentResponseType } from '../schemas/agent-response.js';
export type { AgentMessage } from '../schemas/agent-message.js';
export type { Decision } from '../schemas/decision.js';
export type { Site, SiteStatus, SiteObjective, SiteKpi } from '../schemas/site.js';
export type { Client, ClientStatus, ValidationPolicy } from '../schemas/client.js';
export type { MemoryRecord, MemoryScope } from '../schemas/memory-record.js';
export type { WorkflowDefinition, WorkflowStep } from '../schemas/workflow.js';
export type { AgentDefinition, ModelTier, McpServer } from '../schemas/agent-definition.js';
