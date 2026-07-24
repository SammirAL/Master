import type { QueueJob, QueuePort } from '../ports.js';

/**
 * File en mémoire — pour les tests et le développement local (sans Redis).
 * Les travaux sont traités séquentiellement dès qu'un consommateur est enregistré.
 */
export class InMemoryQueue implements QueuePort {
  private handler: ((job: QueueJob) => Promise<void>) | null = null;
  private readonly pending: QueueJob[] = [];
  private draining = false;

  async enqueue(job: QueueJob): Promise<void> {
    this.pending.push(job);
    void this.drain();
  }

  process(handler: (job: QueueJob) => Promise<void>): void {
    this.handler = handler;
    void this.drain();
  }

  async close(): Promise<void> {
    this.handler = null;
    this.pending.length = 0;
  }

  private async drain(): Promise<void> {
    if (this.draining || !this.handler) return;
    this.draining = true;
    try {
      while (this.handler !== null && this.pending.length > 0) {
        const job = this.pending.shift()!;
        await this.handler(job);
      }
    } finally {
      this.draining = false;
    }
  }
}
