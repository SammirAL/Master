# @agency-os/mcp

Passerelle MCP : **point de passage unique et obligatoire** entre un agent et le
monde extérieur. cf. [docs/01 §9](../docs/01-architecture.md).

## Enforcement (dans l'ordre, à chaque appel)

1. **Matrice de permissions** (P3) — `permission-matrix.ts` encode le tableau de
   [docs/03-agents/README.md](../docs/03-agents/README.md) ; un test échoue si l'encodage dérive de la doc.
2. **Gate L3** — une action `produce` exige `ctx.validated` (Decision d'approbation CEO).
3. **Portées fines** — `scopes.ts` : filesystem borné à `data/sites/<site_id>/`, GitHub `branch+PR only` (jamais `main`).
4. **Quotas** — `quotas.ts` : budget d'appels/tâche + débit/agent×site.
5. **Secrets** — `credentials-broker.ts` injecte les clés à l'exécution ; jamais exposées ni auditées (rédaction en défense de profondeur).
6. **Audit** — `audit-log.ts` : chaque appel et chaque violation → `audit_log` (append-only, P5).

Toute violation est **journalisée puis levée** (`McpAllowlistViolationError`, `PermissionDeniedError`, `QuotaExceededError`).

## Connecteurs (`src/connectors/`)

- **Firecrawl** — RÉEL : relaie vers le serveur MCP officiel
  [`firecrawl-mcp`](https://github.com/firecrawl/firecrawl-mcp-server) via le SDK MCP (stdio).
- **Filesystem** — RÉEL : borné au workspace du site.
- **GitHub** + 12 autres — stubs typés (specs de méthode correctes → enforcement complet),
  remplacés par leur implémentation réelle au fil des phases.

Registre des serveurs : [`registry/servers.yaml`](registry/servers.yaml).

## Vérifier / démontrer

```bash
# Handshake avec le vrai serveur Firecrawl + liste des outils
FIRECRAWL_API_KEY=fc-… pnpm --filter @agency-os/mcp verify:firecrawl

# Démo d'enforcement : Firecrawl autorisé, GSC autorisé, WordPress refusé + audit
FIRECRAWL_API_KEY=fc-… pnpm --filter @agency-os/mcp exec tsx scripts/demo-gateway.ts

pnpm --filter @agency-os/mcp test    # matrice≡doc + permissions + portées + quotas + secrets
```

> Note : un appel réseau réel vers `api.firecrawl.dev` peut être bloqué par la
> politique d'egress de l'environnement (403). La passerelle, elle, autorise,
> exécute et audite correctement — seul le fetch distant dépend du réseau.
