# @agency-os/agents

Runtime **générique** des agents (un seul code pour tous ; seule la définition
change) + registre des définitions. cf. [docs/01 §6](../docs/01-architecture.md).

## Boucle d'exécution (`runtime/agent-runner.ts`)

réception → contexte → exécution (cerveau/LLM) → **rapport au format unique** →
mémoire → remontée au CEO. Invariants appliqués :

- le CEO ne peut jamais être exécutant (P1) ;
- un rapport hors format est rejeté et la tâche repart en révision (P4) ;
- une action L3 déclenche une demande de validation au CEO ;
- exécution **idempotente** (livraison at-least-once : un doublon de file est ignoré).

## Contenu

- `runtime/` — `agent-runner`, `context-loader`, `report-builder` (valide le schéma `Report`),
  `guardrails` (limites tokens/MCP), `memory-emitter` (stub phase 1), `ports`.
- `registry.ts` — enregistre/valide les `AgentDefinition` (YAML → config).
- `fake-agent.ts` — cerveau déterministe (phase 1), remplacé par l'API Claude en phase 3.
- `adapters/` — dépôts de rapports `InMemory`/`Drizzle`.

## Tests

`pnpm --filter @agency-os/agents test` — done via rapport valide, gate L3, refus CEO, rejet P4.
