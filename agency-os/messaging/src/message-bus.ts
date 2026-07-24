import { agentMessage, makeId, nowIso, type AgentMessage } from '@agency-os/shared';
import type {
  AuditSink,
  MessageBus,
  MessageHandler,
  MessageStore,
  PublishInput,
  Unsubscribe,
} from './ports.js';

export interface MessageBusOptions {
  audit?: AuditSink;
  /** Nombre maximal de rebonds dans une chaîne causale (garde anti-boucle). */
  maxHops?: number;
  now?: () => string;
}

/**
 * Bus de messages en processus. Persiste chaque message, le journalise, puis le
 * dispatche vers les abonnés du destinataire. Un compteur de rebonds coupe les
 * boucles infinies de messages (règle anti-dérive, docs/04-interactions.md §9).
 */
export class InProcessMessageBus implements MessageBus {
  private readonly subscribers = new Map<string, Set<MessageHandler>>();
  private readonly maxHops: number;
  private readonly now: () => string;
  private dispatchDepth = 0;

  constructor(
    private readonly store: MessageStore,
    private readonly options: MessageBusOptions = {},
  ) {
    this.maxHops = options.maxHops ?? 25;
    this.now = options.now ?? nowIso;
  }

  async publish(input: PublishInput): Promise<AgentMessage> {
    const message = agentMessage.parse({
      id: makeId('message'),
      from: input.from,
      to: input.to,
      type: input.type,
      task_id: input.task_id ?? null,
      payload: input.payload ?? {},
      refs: input.refs ?? [],
      at: this.now(),
    } satisfies AgentMessage);

    await this.store.append(message);
    await this.options.audit?.record({
      at: message.at,
      kind: 'message',
      actor: message.from,
      taskId: message.task_id,
      detail: { to: message.to, type: message.type, id: message.id },
    });

    await this.dispatch(message);
    return message;
  }

  subscribe(recipient: string, handler: MessageHandler): Unsubscribe {
    const set = this.subscribers.get(recipient) ?? new Set<MessageHandler>();
    set.add(handler);
    this.subscribers.set(recipient, set);
    return () => {
      set.delete(handler);
    };
  }

  private async dispatch(message: AgentMessage): Promise<void> {
    if (this.dispatchDepth >= this.maxHops) {
      await this.options.audit?.record({
        at: this.now(),
        kind: 'violation',
        actor: 'system',
        taskId: message.task_id,
        detail: { reason: 'max_message_hops_exceeded', maxHops: this.maxHops, id: message.id },
      });
      throw new Error(
        `Boucle de messages détectée : profondeur ${this.dispatchDepth} ≥ maxHops ${this.maxHops}`,
      );
    }
    const handlers = this.subscribers.get(message.to);
    if (!handlers || handlers.size === 0) return;

    this.dispatchDepth += 1;
    try {
      for (const handler of handlers) {
        await handler(message);
      }
    } finally {
      this.dispatchDepth -= 1;
    }
  }
}
