import { QuotaExceededError } from '@agency-os/shared';
import type { QuotaGuard } from './ports.js';

export interface QuotaConfig {
  /** Nombre maximal d'appels MCP par tâche. */
  maxCallsPerTask: number;
  /** Débit maximal d'appels par (agent × site) sur une fenêtre glissante. */
  ratePerWindow: number;
  windowMs: number;
}

const DEFAULT_CONFIG: QuotaConfig = {
  maxCallsPerTask: 200,
  ratePerWindow: 120,
  windowMs: 60_000,
};

/**
 * Quotas en mémoire (phase 2 ; adossés à Redis aux phases d'échelle).
 * Dépassement → `QuotaExceededError` ; la passerelle audite la violation et le
 * runtime bascule la tâche en `blocked`. cf. docs/06 Phase 2 (critères).
 */
export class InMemoryQuotaGuard implements QuotaGuard {
  private readonly config: QuotaConfig;
  private readonly perTask = new Map<string, number>();
  private readonly windows = new Map<string, number[]>();

  constructor(config: Partial<QuotaConfig> = {}, private readonly now: () => number = Date.now) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  check(agent: string, siteId: string | null, taskId: string | null): void {
    // Budget par tâche.
    if (taskId) {
      const count = (this.perTask.get(taskId) ?? 0) + 1;
      if (count > this.config.maxCallsPerTask) {
        throw new QuotaExceededError('Budget d\'appels MCP par tâche dépassé.', {
          taskId,
          max: this.config.maxCallsPerTask,
        });
      }
      this.perTask.set(taskId, count);
    }

    // Débit par (agent × site) sur fenêtre glissante.
    const key = `${agent}:${siteId ?? 'global'}`;
    const t = this.now();
    const cutoff = t - this.config.windowMs;
    const hits = (this.windows.get(key) ?? []).filter((ts) => ts > cutoff);
    if (hits.length + 1 > this.config.ratePerWindow) {
      throw new QuotaExceededError('Débit d\'appels MCP dépassé pour cet agent/site.', {
        agent,
        siteId,
        ratePerWindow: this.config.ratePerWindow,
      });
    }
    hits.push(t);
    this.windows.set(key, hits);
  }
}
