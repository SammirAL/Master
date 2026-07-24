# 02 — Arborescence du projet

> Liste complète des dossiers et des fichiers prévus, avec le rôle de chacun.
> Le monorepo est géré par pnpm workspaces + Turborepo. Les dossiers de premier
> niveau reprennent le découpage du cahier des charges.

## Vue d'ensemble des dossiers

```
agency-os/
├── ceo/           # Agent CEO : moteur de décision, arbitrage, validation
├── agents/        # Runtime commun + définition de chaque agent spécialisé
├── councils/      # Conseils multi-agents (revue qualité, arbitrage, crise)
├── memory/        # Moteur de mémoire (distillation, vectorisation, rappel)
├── clients/       # Domaine client (profils, objectifs, contrats, préférences)
├── sites/         # Domaine site (registre, connecteurs plateformes, KPI)
├── reports/       # Moteur de rapports (format unique, génération, agrégation)
├── tasks/         # Moteur de tâches (files, états, SLA, historique)
├── workflows/     # Moteur de workflows + bibliothèque de définitions YAML
├── prompts/       # Prompts système versionnés (source de vérité)
├── mcp/           # Passerelle MCP (registre, permissions, quotas, audit)
├── database/      # Schéma SQL, migrations, seeds
├── api/           # API REST + WebSocket (NestJS)
├── backend/       # Composition root : démarrage orchestrateur + workers
├── frontend/      # Dashboard Next.js
├── shared/        # Contrats partagés : schémas Zod, types, utilitaires
├── data/          # Données d'exécution par site/client (espace de travail)
├── docs/          # Documentation d'architecture (ce dossier) + ADR
├── infra/         # Docker, compose, CI, observabilité
└── tests/         # Tests E2E inter-packages et fixtures
```

---

## Arborescence détaillée

Chaque fichier listé fait partie du plan de développement ; les fichiers seront
créés au fil des phases (cf. [06-plan-de-developpement.md](06-plan-de-developpement.md)).

```
agency-os/
├── package.json                      # Racine du monorepo (workspaces, scripts globaux)
├── pnpm-workspace.yaml               # Déclaration des packages
├── turbo.json                        # Pipelines de build/test incrémentaux
├── tsconfig.base.json                # Config TypeScript partagée (strict)
├── .env.example                      # Variables d'environnement documentées
├── README.md                         # Présentation, démarrage rapide
│
├── shared/                           # ── CONTRATS PARTAGÉS (aucune dépendance interne)
│   ├── package.json
│   ├── src/
│   │   ├── schemas/
│   │   │   ├── task.ts               # Schéma Zod Task + états + priorités
│   │   │   ├── report.ts             # Schéma Zod Report (format unique)
│   │   │   ├── agent-response.ts     # Schéma Zod de la réponse standard d'un agent
│   │   │   ├── agent-message.ts      # Schéma Zod des messages inter-agents
│   │   │   ├── agent-definition.ts   # Schéma Zod du YAML de définition d'agent
│   │   │   ├── decision.ts           # Schéma Zod Decision (CEO)
│   │   │   ├── site.ts               # Schéma Zod Site + KPI + objectifs
│   │   │   ├── client.ts             # Schéma Zod Client
│   │   │   ├── memory-record.ts      # Schéma Zod MemoryRecord
│   │   │   ├── workflow.ts           # Schéma Zod WorkflowDefinition (YAML)
│   │   │   └── index.ts
│   │   ├── types/                    # Types dérivés des schémas (z.infer), enums
│   │   ├── errors/                   # Hiérarchie d'erreurs typées du domaine
│   │   └── utils/                    # ids (TSK-…, RPT-…), dates, pagination
│   └── test/                         # Tests des schémas (cas valides/invalides)
│
├── ceo/                              # ── AGENT CEO
│   ├── package.json
│   ├── README.md                     # Invariants : jamais d'exécution, jamais d'écriture site
│   ├── src/
│   │   ├── decision-engine.ts        # Boucle : événement → contexte → délibération → Decision
│   │   ├── context-builder.ts        # Assemble KPI, objectifs, mémoire décisionnelle
│   │   ├── task-dispatcher.ts        # Crée/assigne les tâches suite aux décisions
│   │   ├── validation-service.ts     # Traite les demandes de validation (approve/reject/revise)
│   │   ├── arbitration.ts            # Conflits entre agents → council ou décision directe
│   │   ├── escalation-policy.ts      # Règles d'escalade vers l'humain (HITL)
│   │   ├── reporting-requests.ts     # Demandes de rapports périodiques ou ad hoc
│   │   └── ports.ts                  # Interfaces requises (tasks, memory, llm) — DI
│   └── test/
│
├── agents/                           # ── AGENTS SPÉCIALISÉS
│   ├── package.json
│   ├── runtime/                      # Boucle d'exécution générique (un seul code pour tous)
│   │   ├── agent-runner.ts           # Réception → contexte → plan → exécution → rapport
│   │   ├── context-loader.ts         # Charge définition, tâche, mémoire scopée, KPI site
│   │   ├── plan-executor.ts          # Exécute le plan étape par étape via la passerelle MCP
│   │   ├── report-builder.ts         # Impose le format unique (validation Zod)
│   │   ├── memory-emitter.ts         # Émet les MemoryRecord candidats
│   │   ├── guardrails.ts             # Limites : tokens, appels MCP, temps, contenu externe
│   │   └── ports.ts                  # Interfaces (llm, mcp-gateway, memory, tasks)
│   ├── registry.ts                   # Charge et valide toutes les définitions d'agents
│   └── definitions/                  # Une définition par agent (config, pas de code)
│       ├── project-manager/agent.yaml
│       ├── seo-strategist/agent.yaml
│       ├── technical-seo/agent.yaml
│       ├── content-writer/agent.yaml
│       ├── developer/agent.yaml
│       ├── ux-expert/agent.yaml
│       ├── cro-expert/agent.yaml
│       ├── marketing-expert/agent.yaml
│       ├── sales-expert/agent.yaml
│       ├── data-analyst/agent.yaml
│       ├── competitor-analyst/agent.yaml
│       ├── security-expert/agent.yaml
│       ├── automation-engineer/agent.yaml
│       ├── memory-manager/agent.yaml
│       ├── quality-reviewer/agent.yaml
│       ├── brand-guardian/agent.yaml
│       └── knowledge-manager/agent.yaml
│
├── councils/                         # ── CONSEILS MULTI-AGENTS
│   ├── package.json
│   ├── src/
│   │   ├── council-runner.ts         # Convoque N agents, collecte les avis, synthétise
│   │   ├── protocols.ts              # Règles de délibération (quorum, vote, synthèse)
│   │   └── definitions/
│   │       ├── quality-council.yaml  # Quality Reviewer + Brand Guardian + agent concerné
│   │       ├── seo-council.yaml      # SEO Strategist + Technical SEO + Competitor Analyst
│   │       ├── release-council.yaml  # Developer + Security Expert + Quality Reviewer
│   │       └── crisis-council.yaml   # Comité d'incident (P0) : PM + Security + Developer
│   └── test/
│
├── memory/                           # ── MOTEUR DE MÉMOIRE
│   ├── package.json
│   ├── src/
│   │   ├── pipeline/
│   │   │   ├── distiller.ts          # MemoryRecord candidats → faits durables (LLM léger)
│   │   │   ├── deduplicator.ts       # Fusion des faits redondants (similarité vectorielle)
│   │   │   ├── embedder.ts           # Vectorisation (modèle d'embeddings configurable)
│   │   │   └── writer.ts             # Écriture Qdrant (payload site/client/agent/type)
│   │   ├── recall/
│   │   │   ├── retriever.ts          # Recherche sémantique scopée + re-ranking fraîcheur
│   │   │   └── context-packer.ts     # Compacte les souvenirs dans le budget de contexte
│   │   ├── collections.ts            # Déclaration des 8 collections (sites, clients, agents,
│   │   │                             #   decisions, seo_campaigns, articles, competitors, keywords)
│   │   └── ports.ts
│   └── test/
│
├── clients/                          # ── DOMAINE CLIENT
│   ├── package.json
│   ├── src/
│   │   ├── client-service.ts         # CRUD profils clients, objectifs business, contraintes
│   │   ├── goals.ts                  # Objectifs → KPI cibles par site
│   │   └── preferences.ts            # Ton, interdits éditoriaux, validations spécifiques
│   └── test/
│
├── sites/                            # ── DOMAINE SITE
│   ├── package.json
│   ├── src/
│   │   ├── site-registry.ts          # Registre des sites (plateforme, environnements, statut)
│   │   ├── site-service.ts           # KPI, objectifs, concurrents suivis par site
│   │   ├── credentials.ts            # Liaison au coffre à secrets (jamais en clair)
│   │   └── platforms/                # Spécificités par plateforme (détection, conventions)
│   │       ├── wordpress.ts
│   │       ├── shopify.ts
│   │       ├── laravel.ts
│   │       └── nextjs.ts
│   └── test/
│
├── reports/                          # ── MOTEUR DE RAPPORTS
│   ├── package.json
│   ├── src/
│   │   ├── report-service.ts         # Enregistrement, versionnage, liaison tâche/site/client
│   │   ├── validator.ts              # Rejet de tout rapport hors format unique
│   │   ├── aggregator.ts             # Agrégats : hebdo par site, mensuel par client
│   │   └── exporters/                # Markdown, PDF, e-mail (via n8n)
│   └── test/
│
├── tasks/                            # ── MOTEUR DE TÂCHES
│   ├── package.json
│   ├── src/
│   │   ├── task-service.ts           # Création, transitions d'état, historique immuable
│   │   ├── queue-manager.ts          # Files BullMQ par agent×site, priorités, retries
│   │   ├── scheduler.ts              # Tâches récurrentes, vieillissement des priorités, SLA
│   │   ├── dependency-resolver.ts    # depends_on : démarrage quand dépendances done
│   │   └── ports.ts
│   └── test/
│
├── workflows/                        # ── MOTEUR DE WORKFLOWS
│   ├── package.json
│   ├── src/
│   │   ├── workflow-engine.ts        # Instancie une définition → graphe de tâches
│   │   ├── step-mapper.ts            # Étape YAML → tâche typée assignée à un agent
│   │   ├── validation-gates.ts       # Points de passage « validation CEO » du graphe
│   │   └── triggers.ts               # Déclencheurs : cron, événement, seuil KPI, manuel
│   ├── definitions/
│   │   ├── seo/
│   │   │   ├── full-seo-cycle.yaml   # Audit → concurrents → technique → propositions →
│   │   │   │                         #   validation CEO → dev → publication → analytics → rapport
│   │   │   ├── seo-audit.yaml        # Audit SEO seul
│   │   │   ├── content-cluster.yaml  # Cocon sémantique + production d'articles
│   │   │   ├── internal-linking.yaml # Détection pages faibles + maillage interne
│   │   │   └── cwv-fix.yaml          # Core Web Vitals : mesure → correctifs → re-mesure
│   │   ├── cro/
│   │   │   ├── conversion-audit.yaml # Analytics + tunnel + panier + Stripe → hypothèses
│   │   │   └── ab-test-cycle.yaml    # Hypothèse → implémentation → mesure → décision
│   │   ├── dev/
│   │   │   ├── bugfix.yaml           # Repro → branche → fix → PR → CI → validation → merge
│   │   │   └── dependency-update.yaml# Mises à jour Laravel/Next.js/WordPress sécurisées
│   │   ├── ops/
│   │   │   ├── site-onboarding.yaml  # Nouveau site : credentials, baseline KPI, mémoire initiale
│   │   │   ├── incident-response.yaml# P0 : crisis council → correctif → post-mortem
│   │   │   └── weekly-report.yaml    # Rapport hebdomadaire consolidé par site
│   │   └── marketing/
│   │       └── campaign-cycle.yaml   # Brief → création → validation → lancement → mesure
│   └── test/
│
├── prompts/                          # ── PROMPTS SYSTÈME VERSIONNÉS
│   ├── ceo/system.md                 # Prompt système du CEO
│   ├── agents/<slug>/system.md       # Un prompt système par agent (17 fichiers)
│   ├── councils/<slug>.md            # Prompts de délibération des conseils
│   ├── pipeline/                     # Prompts techniques (distillation mémoire, synthèse)
│   └── CHANGELOG.md                  # Toute modification de prompt est datée et justifiée
│
├── mcp/                              # ── PASSERELLE MCP
│   ├── package.json
│   ├── src/
│   │   ├── gateway.ts                # Point d'entrée unique des appels outils des agents
│   │   ├── permission-matrix.ts      # Application de la matrice agent × MCP × portée
│   │   ├── scopes.ts                 # Portées fines (draft-only, branch-only, read-only…)
│   │   ├── quotas.ts                 # Rate-limits et budgets par agent/site
│   │   ├── audit-log.ts              # Journal append-only de chaque appel
│   │   ├── credentials-broker.ts     # Injection des secrets par site à l'exécution
│   │   └── servers/                  # Connecteurs (config + client) par serveur MCP
│   │       ├── github.ts • filesystem.ts • playwright.ts • firecrawl.ts
│   │       ├── gsc.ts • ga4.ts • google-ads.ts • wordpress.ts • shopify.ts
│   │       ├── postgresql.ts • mysql.ts • supabase.ts • qdrant.ts
│   │       └── brave-search.ts • exa.ts • stripe.ts • docker.ts • terminal.ts • n8n.ts
│   ├── registry/
│   │   └── servers.yaml              # Registre : serveurs disponibles, endpoints, portées possibles
│   └── test/
│
├── database/                         # ── BASE DE DONNÉES
│   ├── package.json
│   ├── schema/                       # Schéma Drizzle (source de vérité SQL)
│   │   ├── clients.ts • sites.ts • tasks.ts • reports.ts
│   │   ├── decisions.ts • agents-state.ts • audit-log.ts
│   │   ├── kpis.ts • competitors.ts • keywords.ts • memory-index.ts
│   ├── migrations/                   # Migrations SQL générées et versionnées
│   ├── seeds/                        # Données de démarrage (agents, workflows, site pilote)
│   └── test/
│
├── api/                              # ── API (NestJS)
│   ├── package.json
│   ├── src/
│   │   ├── main.ts                   # Bootstrap
│   │   ├── modules/
│   │   │   ├── auth/                 # AuthN/AuthZ humains (RBAC)
│   │   │   ├── sites/ • clients/ • tasks/ • reports/ • agents/
│   │   │   ├── governance/           # Validations humaines, kill switch, quotas
│   │   │   ├── webhooks/             # GitHub, n8n, Stripe, uptime
│   │   │   └── realtime/             # Gateway WebSocket (événements tâches/messages)
│   │   └── common/                   # Guards, interceptors, mapping erreurs domaine → HTTP
│   └── test/
│
├── backend/                          # ── COMPOSITION ROOT
│   ├── package.json
│   ├── src/
│   │   ├── main.ts                   # Démarre orchestrateur (CEO, scheduler) selon le rôle du process
│   │   ├── worker.ts                 # Démarre un pool de workers d'agents (scalable en réplicas)
│   │   ├── container.ts              # Câblage DI : ports ← adaptateurs concrets
│   │   └── config.ts                 # Chargement/validation de la configuration (env)
│   └── test/
│
├── frontend/                         # ── DASHBOARD (Next.js)
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── (cockpit)/page.tsx    # Vue portefeuille : sites, santé, alertes
│   │   │   ├── validation/           # File de validation (approve/reject/revise)
│   │   │   ├── tasks/                # Kanban temps réel par site/agent
│   │   │   ├── reports/              # Consultation et comparaison des rapports
│   │   │   ├── agents/               # État, KPI, coûts, kill switch par agent
│   │   │   ├── sites/ • clients/     # Fiches sites et clients
│   │   │   └── memory/               # Explorateur de mémoire et décisions
│   │   ├── components/               # UI (shadcn/ui)
│   │   └── lib/                      # Client API typé (généré depuis les schémas partagés)
│   └── test/
│
├── data/                             # ── ESPACE DE TRAVAIL D'EXÉCUTION (gitignoré, sauf structure)
│   ├── sites/<site_id>/              # Workspaces par site : clones Git, exports, captures
│   ├── clients/<client_id>/          # Documents client, briefs
│   └── artifacts/                    # Artefacts de tâches (audits Lighthouse, crawls…)
│
├── docs/                             # ── DOCUMENTATION (ce dossier)
│   ├── 01-architecture.md • 02-arborescence.md
│   ├── 03-agents/ (README + 18 fiches) • 04-interactions.md
│   ├── 05-flux-de-donnees.md • 06-plan-de-developpement.md • 07-schemas.md
│   └── adr/                          # Architecture Decision Records
│
├── infra/                            # ── INFRASTRUCTURE
│   ├── docker/
│   │   ├── Dockerfile.api • Dockerfile.worker • Dockerfile.frontend
│   │   └── sandbox/Dockerfile        # Conteneur sandbox (Developer/Security)
│   ├── docker-compose.yml            # Dev : PostgreSQL, Redis, Qdrant, n8n, services
│   ├── docker-compose.prod.yml      # Prod mono-machine (jusqu'à ~100 sites)
│   ├── ci/                           # Pipelines : lint, typecheck, tests, validation YAML
│   └── observability/                # OpenTelemetry, dashboards Grafana, alerting
│
└── tests/                            # ── TESTS E2E INTER-PACKAGES
    ├── e2e/
    │   ├── seo-cycle.e2e.ts          # Workflow SEO complet, LLM mocké, site fixture
    │   ├── validation-gate.e2e.ts    # Aucune action L3 sans validation CEO
    │   ├── mcp-permissions.e2e.ts    # Violation d'allowlist rejetée et auditée
    │   └── multi-site-fairness.e2e.ts# Équité d'ordonnancement entre sites
    └── fixtures/                     # Sites factices, réponses LLM enregistrées
```

---

## Règles de dépendance entre packages

```
shared ← (tout le monde)
tasks, memory, reports, clients, sites, mcp ← ceo, agents, workflows, councils
ceo, agents, workflows, councils ← backend (composition root), api
api ← frontend (via client HTTP typé uniquement)
```

- `shared/` ne dépend de rien : c'est le socle des contrats.
- Aucun package métier ne dépend de `api/`, `backend/` ou `frontend/`.
- Les adaptateurs concrets (DB, LLM, MCP) sont injectés par `backend/container.ts` —
  les packages métier ne connaissent que leurs `ports.ts` (interfaces).
- La CI échoue sur toute dépendance circulaire ou non déclarée.
