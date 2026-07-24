import { pgEnum } from 'drizzle-orm/pg-core';
import {
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

/**
 * Enums PostgreSQL dérivés DIRECTEMENT des enums Zod de `@agency-os/shared`.
 * Un seul jeu de valeurs pour la base et les contrats — le test de contrat
 * (database/test) échoue si l'un dérive de l'autre.
 */

// `.options` de Zod est un tuple readonly ; drizzle attend un tuple mutable non vide.
const tuple = <T extends readonly [string, ...string[]]>(t: T): [string, ...string[]] =>
  [...t] as [string, ...string[]];

export const taskStatusEnum = pgEnum('task_status', tuple(taskStatus.options));
export const priorityEnum = pgEnum('priority', tuple(priority.options));
export const permissionLevelEnum = pgEnum('permission_level', tuple(permissionLevel.options));
export const decisionKindEnum = pgEnum('decision_kind', tuple(decisionKind.options));
export const decisionOutcomeEnum = pgEnum('decision_outcome', tuple(decisionOutcome.options));
export const statusGlobalEnum = pgEnum('status_global', tuple(statusGlobal.options));
export const platformEnum = pgEnum('platform', tuple(platform.options));
export const memoryTypeEnum = pgEnum('memory_type', tuple(memoryType.options));
export const memoryCollectionEnum = pgEnum('memory_collection', tuple(memoryCollection.options));
export const validationPolicyEnum = pgEnum('validation_policy', tuple(validationPolicy.options));
export const siteStatusEnum = pgEnum('site_status', tuple(siteStatus.options));
export const clientStatusEnum = pgEnum('client_status', tuple(clientStatus.options));
