import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { QueueJob, QueuePort } from '../ports.js';

/** Nom de file par agent et par site : `queue:{agent}:{site}` (équité multi-sites, P6/P7). */
export function queueName(job: QueueJob): string {
  return `queue:${job.agent}:${job.siteId ?? 'global'}`;
}

/**
 * File d'exécution BullMQ (Redis). Une file et un worker par couple agent×site,
 * créés à la demande. cf. docs/01-architecture.md §7 (« files par agent et par site »).
 */
export class BullMqQueue implements QueuePort {
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private handler: ((job: QueueJob) => Promise<void>) | null = null;

  constructor(private readonly connection: ConnectionOptions) {}

  async enqueue(job: QueueJob): Promise<void> {
    const name = queueName(job);
    this.ensureQueue(name);
    this.ensureWorker(name);
    await this.queues.get(name)!.add('run', job, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  process(handler: (job: QueueJob) => Promise<void>): void {
    this.handler = handler;
    // Active les workers des files déjà déclarées.
    for (const name of this.queues.keys()) this.ensureWorker(name);
  }

  async close(): Promise<void> {
    await Promise.all([...this.workers.values()].map((w) => w.close()));
    await Promise.all([...this.queues.values()].map((q) => q.close()));
    this.workers.clear();
    this.queues.clear();
    this.handler = null;
  }

  private ensureQueue(name: string): void {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.connection }));
    }
  }

  private ensureWorker(name: string): void {
    if (this.handler && !this.workers.has(name)) {
      const worker = new Worker(
        name,
        async (job) => {
          if (this.handler) await this.handler(job.data as QueueJob);
        },
        { connection: this.connection },
      );
      this.workers.set(name, worker);
    }
  }
}
