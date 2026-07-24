# Contrôles CI — Agency AI OS

Ce dossier regroupe les contrôles d'intégration continue de la Phase 0. Trois
familles de vérifications garantissent la santé du monorepo à chaque `push` /
`pull request`.

## Les trois contrôles

### 1. Lint / Typecheck / Test (via Turborepo)

Turbo orchestre les tâches de chaque package du workspace.

- `pnpm build` — compilation TypeScript de tous les packages.
- `pnpm typecheck` — vérification de types stricte (ESM, NodeNext).
- `pnpm test` — exécution des tests (Vitest).
- `pnpm lint` — analyse statique.

### 2. Validation YAML — `validate-yaml.mjs`

Vérifie que tous les fichiers YAML de définitions (`agents/definitions`,
`workflows/definitions`, `councils/definitions`, `mcp/registry`) ainsi que
`infra/docker-compose.yml` sont syntaxiquement valides.

En Phase 0, seul le `docker-compose.yml` existe ; le script ne s'exécute pas en
erreur s'il ne trouve aucun fichier de définition.

```bash
pnpm ci:yaml
```

### 3. Dépendances circulaires — `check-circular-deps.mjs`

Construit le graphe des dépendances internes (`@agency-os/*`) à partir de
`pnpm-workspace.yaml` et échoue si un cycle est détecté.

En Phase 0, `@agency-os/database` dépend de `@agency-os/shared` (sans cycle).

```bash
pnpm ci:deps
```

## Lancer tous les contrôles localement

```bash
pnpm typecheck
pnpm test
pnpm ci:yaml
pnpm ci:deps
```

## Reproduire les deux échecs volontaires (critère de sortie Phase 0)

Le critère de sortie exige de prouver que la CI **échoue bien** sur une erreur.
Voici comment reproduire les deux échecs attendus, sans polluer le repo.

### a) YAML invalide

Créer un fixture invalide dans un dossier temporaire, puis pointer le validateur
dessus avec `--path` :

```bash
mkdir -p /tmp/yaml-fixture
printf 'clef: valeur\n  mauvaise: indentation\n\t- tab illegal\n' > /tmp/yaml-fixture/broken.yaml
node infra/ci/validate-yaml.mjs --path /tmp/yaml-fixture
echo "Code de sortie : $?"   # attendu : ≠ 0
```

Le script affiche le fichier fautif, le message d'erreur du parseur et sort avec
un code ≠ 0.

### b) Cycle de dépendances

Introduire temporairement un cycle entre deux packages, par exemple en ajoutant
`@agency-os/database` aux dépendances de `shared/package.json` (alors que
`database` dépend déjà de `shared`) :

```bash
pnpm ci:deps
echo "Code de sortie : $?"   # attendu : ≠ 0 une fois le cycle introduit
```

Le script affiche la chaîne du cycle (ex. `@agency-os/shared -> @agency-os/database -> @agency-os/shared`)
et sort avec un code ≠ 0. **Ne pas committer** cette modification : la retirer
une fois la démonstration faite.
