import type { Clock } from './ports.js';

/** Horloge système par défaut (UTC). */
export const systemClock: Clock = {
  nowIso: () => new Date().toISOString(),
  now: () => new Date(),
};

/** Horloge figée pour les tests. */
export function fixedClock(iso: string): Clock {
  const d = new Date(iso);
  return { nowIso: () => d.toISOString(), now: () => new Date(d) };
}
