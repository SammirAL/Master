# @agency-os/api

API HTTP : distribution de tâches et gouvernance (validation humaine/CEO).

> **Note d'architecture.** En phase 1, l'API est volontairement **sans framework**
> (`node:http` + routeur minimal) pour rester légère et compiler sous la config
> TypeScript stricte. Elle migrera vers **NestJS** quand la surface s'élargira
> (authentification RBAC, WebSocket temps réel, webhooks) avec le dashboard en phase 3,
> conformément à [docs/02](../docs/02-arborescence.md).

## Routes

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | Sonde de vie |
| POST | `/tasks` | Distribue une tâche (`dispatch`) |
| GET | `/tasks/:id` | Lit une tâche |
| POST | `/governance/tasks/:id/approve` | Approuve une action L3 (`{ rationale, conditions?, decidedBy? }`) |
| POST | `/governance/tasks/:id/reject` | Rejette (`{ rationale }`) |

Les erreurs du domaine (`DomainError`) sont traduites en statuts HTTP par `error-mapping.ts`
(ex. `CEO_CANNOT_EXECUTE` → 400, `INVALID_STATE_TRANSITION` → 409, `NOT_FOUND` → 404).

## Démarrage

```bash
pnpm --filter @agency-os/api start   # écoute sur PORT (défaut 3001)
```
