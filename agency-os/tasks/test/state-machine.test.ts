import { describe, it, expect } from 'vitest';
import { InvalidStateTransitionError } from '@agency-os/shared';
import { canTransition, assertTransition, TERMINAL_STATES } from '../src/state-machine.js';

describe('machine à états des tâches', () => {
  it('autorise le chemin nominal draft → done', () => {
    expect(canTransition('draft', 'assigned')).toBe(true);
    expect(canTransition('assigned', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'awaiting_validation')).toBe(true);
    expect(canTransition('awaiting_validation', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'done')).toBe(true);
  });

  it('autorise l\'annulation depuis draft/assigned/blocked/rejected', () => {
    for (const from of ['draft', 'assigned', 'blocked', 'rejected'] as const) {
      expect(canTransition(from, 'cancelled')).toBe(true);
    }
  });

  it('interdit les transitions illégales', () => {
    expect(canTransition('draft', 'done')).toBe(false);
    expect(canTransition('done', 'in_progress')).toBe(false);
    expect(canTransition('assigned', 'done')).toBe(false);
  });

  it('les états terminaux n\'ont aucune sortie', () => {
    for (const s of TERMINAL_STATES) {
      expect(canTransition(s, 'in_progress')).toBe(false);
    }
  });

  it('assertTransition lève une erreur typée sur transition interdite', () => {
    expect(() => assertTransition('done', 'assigned')).toThrow(InvalidStateTransitionError);
  });
});
