# @agency-os/shared

Contrats partagés d'Agency AI OS : **source unique de vérité** pour les schémas,
types, erreurs et utilitaires. Aucune dépendance interne — tout le reste du
monorepo dépend de ce package.

## Contenu

- `src/schemas/` — schémas **Zod** de [docs/07-schemas.md](../docs/07-schemas.md) :
  `task`, `report`, `agentResponse`, `agentMessage`, `decision`, `site`, `client`,
  `memoryRecord`, `workflowDefinition`, `agentDefinition`, plus les `enums` de référence.
- `src/utils/` — générateurs et validateurs d'identifiants (`makeId`, `taskId`…),
  dates ISO 8601 UTC, pagination.
- `src/errors/` — hiérarchie d'erreurs typées du domaine (`DomainError` et dérivées).
- `src/types/` — surface type-only curatée (types inférés `z.infer`).

## Invariants

- Un type n'est jamais écrit à la main : il découle d'un schéma via `z.infer`.
- Le format de rapport est **unique** (`report`) — aucune variante par agent (P4).
- `created_by` d'une tâche ∈ `{ceo, workflow:<id>, human:<id>}` (le PM ne crée pas
  de tâche directement, cf. [docs/04-interactions.md](../docs/04-interactions.md) §9.3).

## Scripts

```bash
pnpm --filter @agency-os/shared build      # compile en dist/
pnpm --filter @agency-os/shared test       # tests des schémas (Vitest)
pnpm --filter @agency-os/shared typecheck  # vérification de types
```
