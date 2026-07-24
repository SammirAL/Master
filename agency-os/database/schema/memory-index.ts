import { pgTable, text, doublePrecision, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import type { MemoryRecord } from '@agency-os/shared';
import { memoryCollectionEnum, memoryTypeEnum } from './enums.js';

/**
 * Table `memory_index` — index relationnel de la mémoire longue durée.
 * Miroir interrogeable des points vectoriels Qdrant (payload site/client/agent).
 * Le contenu vectorisé vit dans Qdrant ; `qdrant_point_id` fait le lien.
 * cf. docs/07-schemas.md §8 et docs/05-flux-de-donnees.md (Flux 2).
 */
export const memoryIndex = pgTable(
  'memory_index',
  {
    id: text('id').primaryKey(), // MEM-YYYYMMDD-xxxxxx
    collection: memoryCollectionEnum('collection').notNull(),
    siteId: text('site_id'),
    clientId: text('client_id'),
    agent: text('agent'),
    type: memoryTypeEnum('type').notNull(),
    content: text('content').notNull(),
    sourceRefs: jsonb('source_refs').$type<MemoryRecord['source_refs']>().notNull().default([]),
    confidence: doublePrecision('confidence').notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true, mode: 'date' }),
    embeddingModel: text('embedding_model'),
    qdrantPointId: text('qdrant_point_id'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (t) => [
    index('memory_index_collection_idx').on(t.collection),
    index('memory_index_site_id_idx').on(t.siteId),
    index('memory_index_client_id_idx').on(t.clientId),
  ],
);
