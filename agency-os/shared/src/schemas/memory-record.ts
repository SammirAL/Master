import { z } from 'zod';
import { memoryId, siteId, clientId, agentSlug } from './refs.js';
import { isoDateTime } from '../utils/dates.js';
import { memoryType, memoryCollection } from './enums.js';

/**
 * MemoryRecord — unité de mémoire longue durée. cf. docs/07-schemas.md §8.
 * Les agents émettent des candidats ; le pipeline mémoire les distille et les
 * range dans Qdrant. Seul le Memory Manager écrit directement dans Qdrant ; le
 * Knowledge Manager écrit exclusivement via le pipeline mémoire.
 */

const memoryScope = z.object({
  site_id: siteId.nullable(),
  client_id: clientId.nullable(),
  agent: agentSlug.nullable(),
});

export const memoryRecord = z.object({
  id: memoryId,
  collection: memoryCollection,
  scope: memoryScope,
  type: memoryType,
  content: z.string().min(1),
  source_refs: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  valid_until: isoDateTime.nullable(),
  embedding_model: z.string().nullable(),
  created_by: agentSlug,
  created_at: isoDateTime,
});

export type MemoryRecord = z.infer<typeof memoryRecord>;
export type MemoryScope = z.infer<typeof memoryScope>;
