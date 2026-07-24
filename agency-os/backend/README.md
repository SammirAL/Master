# @agency-os/backend

Composition root : câblage par **injection de dépendances**, orchestrateur, workers.
C'est le seul endroit où les adaptateurs concrets (DB, files, mémoire) sont branchés
sur les ports du domaine.

## Contenu

- `container.ts` — `createWiring(config)` : câblage `memory` (par défaut, sans infra)
  ou `postgres` (Drizzle + BullMQ/Redis). Enregistre les agents (factices en phase 1).
- `worker.ts` — worker stateless : consomme les files et lance le runtime.
- `main.ts` — orchestrateur (`bootstrap`) : worker intégré en phase 1.
- `config.ts` — chargement/validation de la configuration (env).

## Démonstration Phase 1

```bash
pnpm --filter @agency-os/backend demo
```

Montre : (1) une tâche standard `draft → assigned → in_progress → done` ; (2) une action
L3 `… → awaiting_validation → (approbation CEO) → done` avec traçabilité de la `Decision`.
Le tout en mémoire, sans infrastructure.

## Modes

`WIRING_MODE=memory` (défaut) ou `WIRING_MODE=postgres` (requiert `DATABASE_URL` + `REDIS_URL`).
