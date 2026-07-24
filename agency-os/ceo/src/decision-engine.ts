import {
  decision as decisionSchema,
  makeId,
  nowIso,
  type Decision,
  type DecisionKind,
  type DecisionOutcome,
} from '@agency-os/shared';
import type { DecisionRepository } from './ports.js';

export interface RecordDecisionInput {
  kind: DecisionKind;
  subject: Decision['subject'];
  outcome: DecisionOutcome;
  rationale: string;
  context_refs?: string[];
  options_considered?: Decision['options_considered'];
  conditions?: string[];
  decided_by?: Decision['decided_by'];
}

/**
 * Moteur de décision du CEO. En phase 1, il matérialise et persiste des
 * décisions immuables (traçabilité + mémoire décisionnelle, docs/07-schemas.md §5).
 * La délibération LLM riche est branchée en phase 3.
 */
export class DecisionEngine {
  constructor(private readonly repo: DecisionRepository) {}

  async record(input: RecordDecisionInput): Promise<Decision> {
    const decision = decisionSchema.parse({
      id: makeId('decision'),
      kind: input.kind,
      subject: input.subject,
      context_refs: input.context_refs ?? [],
      options_considered: input.options_considered ?? [],
      decision: input.outcome,
      rationale: input.rationale,
      conditions: input.conditions ?? [],
      decided_by: input.decided_by ?? 'ceo',
      at: nowIso(),
    } satisfies Decision);

    return this.repo.create(decision);
  }
}
