# @agency-os/ceo

Agent CEO : **décision, distribution, validation**. Le CEO décide et valide, il
n'exécute jamais (P1). cf. [docs/01 §5](../docs/01-architecture.md).

## Contenu

- `task-dispatcher.ts` — crée, assigne, notifie l'agent et met en file les tâches
  **prêtes** (dépendances satisfaites) ; `releaseReady` libère les dépendants quand
  une dépendance passe `done`.
- `validation-service.ts` — `approve` / `reject` / `revise` : enregistre une `Decision`
  immuable puis fait avancer la tâche. Garantit l'invariant : **aucune action L3 sans
  Decision d'approbation** (P2).
- `decision-engine.ts` — matérialise et persiste les décisions (traçabilité, mémoire décisionnelle).
- `adapters/` — dépôts de décisions `InMemory`/`Drizzle`.

## Tests

`pnpm --filter @agency-os/ceo test` — dispatch + dépendances + gate L3 (approbation/rejet, escalade humaine).
