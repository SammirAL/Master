import { describe, it, expect } from 'vitest';
import { getTableColumns } from 'drizzle-orm';
import {
  task,
  report,
  client,
  site,
  decision,
  taskStatus,
  priority,
  permissionLevel,
  decisionKind,
  decisionOutcome,
  statusGlobal,
  platform,
  memoryType,
  memoryCollection,
  validationPolicy,
  siteStatus,
  clientStatus,
} from '@agency-os/shared';
import * as schema from '../schema/index.js';

/** Noms de colonnes (DB, snake_case) d'une table Drizzle. */
function dbColumns(table: Parameters<typeof getTableColumns>[0]): Set<string> {
  return new Set(Object.values(getTableColumns(table)).map((c) => c.name));
}

describe('contrat — parité des enums Zod ↔ PostgreSQL', () => {
  const cases: [string, readonly string[], readonly string[]][] = [
    ['task_status', taskStatus.options, schema.taskStatusEnum.enumValues],
    ['priority', priority.options, schema.priorityEnum.enumValues],
    ['permission_level', permissionLevel.options, schema.permissionLevelEnum.enumValues],
    ['decision_kind', decisionKind.options, schema.decisionKindEnum.enumValues],
    ['decision_outcome', decisionOutcome.options, schema.decisionOutcomeEnum.enumValues],
    ['status_global', statusGlobal.options, schema.statusGlobalEnum.enumValues],
    ['platform', platform.options, schema.platformEnum.enumValues],
    ['memory_type', memoryType.options, schema.memoryTypeEnum.enumValues],
    ['memory_collection', memoryCollection.options, schema.memoryCollectionEnum.enumValues],
    ['validation_policy', validationPolicy.options, schema.validationPolicyEnum.enumValues],
    ['site_status', siteStatus.options, schema.siteStatusEnum.enumValues],
    ['client_status', clientStatus.options, schema.clientStatusEnum.enumValues],
  ];

  it.each(cases)('%s : valeurs identiques', (_name, zodOptions, pgValues) => {
    expect([...pgValues]).toEqual([...zodOptions]);
  });
});

describe('contrat — colonnes DB ↔ clés des schémas Zod (tables miroir)', () => {
  const cases: [string, Set<string>, string[]][] = [
    ['tasks', dbColumns(schema.tasks), Object.keys(task.shape)],
    ['reports', dbColumns(schema.reports), Object.keys(report.shape)],
    ['clients', dbColumns(schema.clients), Object.keys(client.shape)],
    ['sites', dbColumns(schema.sites), Object.keys(site.shape)],
    ['decisions', dbColumns(schema.decisions), Object.keys(decision.shape)],
  ];

  it.each(cases)('%s : chaque clé Zod a sa colonne, et réciproquement', (_name, cols, zodKeys) => {
    // Toute clé du schéma Zod doit exister comme colonne (snake_case).
    for (const key of zodKeys) {
      expect(cols.has(key)).toBe(true);
    }
    // Aucune colonne orpheline (les tables miroir n'ajoutent pas de champ).
    expect(cols.size).toBe(zodKeys.length);
  });
});

describe('contrat — présence des 11 tables du schéma', () => {
  it('les 11 tables sont exportées', () => {
    const expected = [
      'clients',
      'sites',
      'tasks',
      'reports',
      'decisions',
      'agentsState',
      'auditLog',
      'kpis',
      'competitors',
      'keywords',
      'memoryIndex',
    ];
    for (const name of expected) {
      expect(schema).toHaveProperty(name);
    }
  });
});
