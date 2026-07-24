# @agency-os/tasks

Moteur de tâches : machine à états, service applicatif, dépendances, ordonnancement, files.

## Contenu

- `state-machine.ts` — transitions autorisées (conforme au diagramme de [docs/01 §7](../docs/01-architecture.md)) ; `assertTransition` lève `InvalidStateTransitionError`.
- `task-service.ts` — création (`draft`) et transitions avec `history` **append-only** ; refuse une tâche assignée au CEO (P1) ; `recordValidation` trace le lien tâche ↔ `Decision`.
- `dependency-resolver.ts` — une tâche ne démarre qu'après `done` de toutes ses `depends_on`.
- `scheduler.ts` — SLA (`isOverdue`) et vieillissement des priorités (`agedPriority`).
- `adapters/` — dépôts `InMemory`/`Drizzle` et files `InMemoryQueue`/`BullMqQueue` (`queue:{agent}:{site}`).

## Ports (injection de dépendances)

`TaskRepository`, `QueuePort`, `Clock`, `AuditSink` — le domaine ne dépend que de ces interfaces.

## Tests

`pnpm --filter @agency-os/tasks test` — machine à états, service (cycle complet, refus CEO, L3), dépendances, ordonnancement.
