import { z } from 'zod';

/** Paramètres de pagination communs aux listes (API, requêtes DB). */
export const paginationParams = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});
export type PaginationParams = z.infer<typeof paginationParams>;

/** Enveloppe paginée générique. */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
  });
}
