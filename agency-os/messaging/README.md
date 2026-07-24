# @agency-os/messaging

Bus de messages inter-agents — **seul canal** de communication (jamais d'appel
direct agent→agent, cf. [docs/04 §1](../docs/04-interactions.md)).

## Contenu

- `message-bus.ts` — `InProcessMessageBus` : construit un `AgentMessage` (id + horodatage),
  le **persiste**, le **journalise** (AuditSink), puis le **dispatche** aux abonnés du
  destinataire. Garde anti-boucle : au-delà de `maxHops` rebonds, la chaîne est coupée et auditée.
- `in-memory-message-store.ts` — stockage append-only (tests, dev).

## Ports

`MessageBus`, `MessageStore`, `MessageHandler`, `AuditSink`.

## Tests

`pnpm --filter @agency-os/messaging test` — persistance + dispatch, émetteur `council:<slug>`,
absence d'abonné, coupure de boucle.
