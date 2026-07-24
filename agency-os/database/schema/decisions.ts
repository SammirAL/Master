import { pgTable, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import type { Decision } from '@agency-os/shared';
import { decisionKindEnum, decisionOutcomeEnum } from './enums.js';

/** Table `decisions`. cf. docs/07-schemas.md §5. Enregistrements immuables (append-only). */
export const decisions = pgTable(
  'decisions',
  {
    id: text('id').primaryKey(), // DEC-YYYYMMDD-xxxxxx
    kind: decisionKindEnum('kind').notNull(),
    subject: jsonb('subject').$type<Decision['subject']>().notNull(),
    contextRefs: jsonb('context_refs').$type<Decision['context_refs']>().notNull().default([]),
    optionsConsidered: jsonb('options_considered')
      .$type<Decision['options_considered']>()
      .notNull()
      .default([]),
    decision: decisionOutcomeEnum('decision').notNull(),
    rationale: text('rationale').notNull(),
    conditions: jsonb('conditions').$type<Decision['conditions']>().notNull().default([]),
    decidedBy: text('decided_by').notNull(),
    at: timestamp('at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [index('decisions_kind_idx').on(t.kind)],
);
