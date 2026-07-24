import { z } from 'zod';
import { agentSlug } from '../utils/ids.js';
import { isoDateTime } from '../utils/dates.js';

/**
 * Sous-schémas transverses réutilisés par plusieurs contrats.
 */

/** Référence d'un humain : `human:<user_id>`. */
export const humanRef = z.string().regex(/^human:.+/, 'attendu human:<user_id>');

/** Référence d'un council : `council:<slug>`. */
export const councilRef = z.string().regex(/^council:[a-z][a-z0-9-]*$/, 'attendu council:<slug>');

/** Référence d'un workflow : `workflow:WFR-YYYYMMDD-xxxxxx`. */
export const workflowRef = z
  .string()
  .regex(/^workflow:WFR-\d{8}-[a-z0-9]{6}$/, 'attendu workflow:WFR-YYYYMMDD-xxxxxx');

/**
 * Créateur d'une tâche. cf. docs/07-schemas.md §1 (`created_by`) et
 * docs/04-interactions.md §9.3 : seuls le CEO (task-dispatcher), le
 * workflow-engine et l'humain créent directement des Task.
 */
export const createdBy = z.union([z.literal('ceo'), workflowRef, humanRef]);

/** Décideur d'une validation : le CEO ou un humain (si escaladé). */
export const decidedBy = z.union([z.literal('ceo'), humanRef]);

/** Émetteur d'un message inter-agents. cf. docs/07-schemas.md §4 (`from`). */
export const messageSender = z.union([
  z.literal('ceo'),
  z.literal('system'),
  humanRef,
  councilRef,
  agentSlug,
]);

/** Destinataire d'un message : un agent, le CEO, ou un council. */
export const messageRecipient = z.union([z.literal('ceo'), councilRef, agentSlug]);

/** Note horodatée générique (journaux). */
export const timestamp = isoDateTime;
