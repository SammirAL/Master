import type { AgentMessage } from '@agency-os/shared';

/** Persistance (append-only) des messages inter-agents. */
export interface MessageStore {
  append(message: AgentMessage): Promise<void>;
  list(filter?: { to?: string; from?: string; taskId?: string | null }): Promise<AgentMessage[]>;
}

/** Consommateur d'un message livré à un destinataire. */
export type MessageHandler = (message: AgentMessage) => Promise<void>;

/** Journal d'audit (append-only) — implémenté par la couche infrastructure. */
export interface AuditSink {
  record(entry: {
    at: string;
    kind: string;
    actor: string;
    taskId?: string | null;
    detail?: Record<string, unknown>;
  }): Promise<void>;
}

/**
 * Bus de messages : SEUL canal de communication entre agents (jamais d'appel
 * direct agent→agent, cf. docs/04-interactions.md §1). Tout message est
 * persisté et journalisé.
 */
export interface MessageBus {
  publish(input: PublishInput): Promise<AgentMessage>;
  subscribe(recipient: string, handler: MessageHandler): Unsubscribe;
}

export type Unsubscribe = () => void;

/** Entrée de publication : le bus complète `id` et `at`. */
export interface PublishInput {
  from: AgentMessage['from'];
  to: AgentMessage['to'];
  type: AgentMessage['type'];
  task_id?: AgentMessage['task_id'];
  payload?: AgentMessage['payload'];
  refs?: AgentMessage['refs'];
}
