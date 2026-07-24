# @agency-os/database

Schéma **Drizzle** (PostgreSQL), migrations et seeds. Source de vérité
transactionnelle du système. Chaque table reflète un schéma Zod de
[`@agency-os/shared`](../shared/README.md).

## Tables (11)

`clients`, `sites`, `tasks`, `reports`, `decisions`, `agents_state`,
`audit_log`, `kpis`, `competitors`, `keywords`, `memory_index`.

Les enums PostgreSQL sont **dérivés directement** des enums Zod (`schema/enums.ts`) :
une seule liste de valeurs pour la base et les contrats.

## Contrat Zod ↔ colonnes

`test/contract.test.ts` vérifie **sans base de données** :
- la parité des 12 enums (valeurs Zod ≡ valeurs PostgreSQL) ;
- que chaque clé des schémas miroir (`task`, `report`, `client`, `site`,
  `decision`) possède sa colonne, et réciproquement (pas de dérive) ;
- la présence des 11 tables.

## Scripts

```bash
pnpm --filter @agency-os/database build      # compile
pnpm --filter @agency-os/database test       # test de contrat (sans DB)
pnpm --filter @agency-os/database generate    # génère les migrations SQL (drizzle-kit)
pnpm --filter @agency-os/database migrate      # applique les migrations (nécessite la DB)
pnpm --filter @agency-os/database seed         # charge cli_acme + site_acme-shop (nécessite la DB)
pnpm demo:task                                 # démo Phase 0 : crée/persiste/relit une Task (nécessite la DB)
```

## Démo Phase 0

```bash
docker compose -f infra/docker-compose.yml up -d      # PostgreSQL, Redis, Qdrant, n8n
pnpm --filter @agency-os/database generate            # migrations SQL
pnpm --filter @agency-os/database migrate             # application
pnpm --filter @agency-os/database seed                # données de départ
pnpm demo:task                                        # types stricts de bout en bout
```
