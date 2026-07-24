/**
 * @agency-os/shared — contrats partagés du système.
 * Point d'entrée unique : schémas Zod (valeurs + types inférés), utilitaires, erreurs.
 *
 * Les types métier sont ré-exportés par les schémas (via `z.infer`). Le module
 * `types/` fournit une surface type-only curatée mais n'est pas ré-exporté ici
 * pour éviter les doublons de noms.
 */
export * from './schemas/index.js';
export * from './utils/index.js';
export * from './errors/index.js';
