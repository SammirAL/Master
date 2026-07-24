import type { AgentMessage } from '@agency-os/shared';
import type { MessageStore } from './ports.js';

/** Stockage des messages en mémoire (tests, développement local). */
export class InMemoryMessageStore implements MessageStore {
  private readonly messages: AgentMessage[] = [];

  async append(message: AgentMessage): Promise<void> {
    this.messages.push(structuredClone(message));
  }

  async list(
    filter: { to?: string; from?: string; taskId?: string | null } = {},
  ): Promise<AgentMessage[]> {
    return this.messages
      .filter((m) => (filter.to ? m.to === filter.to : true))
      .filter((m) => (filter.from ? m.from === filter.from : true))
      .filter((m) => (filter.taskId !== undefined ? m.task_id === filter.taskId : true))
      .map((m) => structuredClone(m));
  }
}
