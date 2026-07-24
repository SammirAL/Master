import type { McpServer } from '@agency-os/shared';
import type { Capability } from './capabilities.js';

/**
 * Contexte public d'un appel MCP (fourni par l'appelant : runtime agent).
 * `validated` atteste qu'une action L3 possède une `Decision` d'approbation.
 */
export interface McpCallContext {
  taskId?: string | null;
  siteId?: string | null;
  clientId?: string | null;
  validated?: boolean;
}

/** Spécification d'une méthode d'un connecteur : capacité requise + portées à vérifier. */
export interface McpMethodSpec {
  capability: Capability;
  description?: string;
  /** Noms des gardes de portée fine à appliquer (ex. 'filesystem-path', 'github-branch'). */
  scopeGuards?: string[];
}

/** Contexte transmis au connecteur à l'exécution (inclut les secrets injectés). */
export interface ConnectorCallContext extends McpCallContext {
  /** Secrets injectés par le broker — NE DOIVENT JAMAIS être audités ni exposés. */
  secrets: Record<string, string>;
}

/**
 * Connecteur vers un serveur MCP. Déclare ses méthodes (pour l'enforcement) et
 * exécute les appels. La passerelle est le SEUL appelant légitime.
 */
export interface McpConnector {
  readonly server: McpServer;
  readonly methods: Record<string, McpMethodSpec>;
  call(method: string, args: Record<string, unknown>, ctx: ConnectorCallContext): Promise<unknown>;
  /** Libération des ressources (processus MCP, connexions). */
  close?(): Promise<void>;
}

/** Fournisseur de secrets par serveur et par site/client (jamais exposé au LLM). */
export interface CredentialsBroker {
  get(server: McpServer, ctx: McpCallContext): Promise<Record<string, string>>;
}

/** Entrée du journal d'audit des appels MCP (append-only, P5). */
export interface McpAuditEntry {
  at: string;
  kind: 'mcp_call' | 'violation';
  actor: string; // slug de l'agent
  taskId: string | null;
  server: string | null;
  method: string | null;
  argsSummary: string | null; // rédigé (secrets retirés)
  result: string | null; // court, rédigé
  durationMs: number | null;
  detail?: Record<string, unknown>;
}

export interface McpAuditSink {
  record(entry: McpAuditEntry): Promise<void>;
}

/** Entrée d'une garde de portée fine. */
export interface ScopeGuardInput {
  agent: string;
  server: McpServer;
  method: string;
  args: Record<string, unknown>;
  ctx: McpCallContext;
}

/** Garde de portée : lève une erreur du domaine si la portée est violée. */
export type ScopeGuard = (input: ScopeGuardInput) => void;

/** Contrôle des quotas (débit + budget d'appels par tâche). */
export interface QuotaGuard {
  check(agent: string, siteId: string | null, taskId: string | null): void;
}
