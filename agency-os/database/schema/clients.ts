import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { Client } from '@agency-os/shared';
import { validationPolicyEnum, clientStatusEnum } from './enums.js';

/** Table `clients`. cf. docs/07-schemas.md §7. */
export const clients = pgTable('clients', {
  id: text('id').primaryKey(), // cli_<slug>
  name: text('name').notNull(),
  contacts: jsonb('contacts').$type<Client['contacts']>().notNull().default([]),
  sites: jsonb('sites').$type<Client['sites']>().notNull().default([]),
  businessGoals: jsonb('business_goals').$type<Client['business_goals']>().notNull().default([]),
  editorialPreferences: jsonb('editorial_preferences')
    .$type<Client['editorial_preferences']>()
    .notNull(),
  validationPolicy: validationPolicyEnum('validation_policy').notNull().default('standard'),
  budget: jsonb('budget').$type<Client['budget']>().notNull(),
  status: clientStatusEnum('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
});
