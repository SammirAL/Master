# 06 — Plan de développement

> Règle du jeu : le code est généré **module par module**. **Chaque phase se
> termine par une validation explicite de l'utilisateur** avant d'entamer la
> suivante — aucune phase ne commence tant que la précédente n'est pas approuvée.
> Chaque phase livre un **incrément fonctionnel démontrable et testé** : à la fin
> d'une phase, quelque chose tourne, se voit et se vérifie.

Références : [01-architecture.md](01-architecture.md) · [02-arborescence.md](02-arborescence.md) · [03-agents/README.md](03-agents/README.md) · [07-schemas.md](07-schemas.md).

---

## Phase 0 — Fondations

**Objectif.** Poser le socle du monorepo : contrats partagés, base de données,
infrastructure de dev et CI — tout ce dont chaque phase suivante dépend.

**Livrables.**
- Racine : `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.env.example`, `README.md`.
- `shared/` : tous les schémas Zod de [07-schemas.md](07-schemas.md) — `shared/src/schemas/task.ts`, `report.ts`, `agent-response.ts`, `agent-message.ts`, `agent-definition.ts`, `decision.ts`, `site.ts`, `client.ts`, `memory-record.ts`, `workflow.ts`, `index.ts` ; `shared/src/types/`, `shared/src/errors/`, `shared/src/utils/` (générateurs d'ids `TSK-`/`RPT-`/`DEC-`/`MSG-`/`WFR-`/`MEM-`) ; `shared/test/`.
- `database/` : schéma Drizzle complet (`database/schema/clients.ts`, `sites.ts`, `tasks.ts`, `reports.ts`, `decisions.ts`, `agents-state.ts`, `audit-log.ts`, `kpis.ts`, `competitors.ts`, `keywords.ts`, `memory-index.ts`), `database/migrations/`, `database/seeds/` (site pilote, client fixture).
- `infra/docker-compose.yml` : PostgreSQL, Redis, Qdrant, n8n.
- `infra/ci/` : lint, typecheck, tests, validation YAML, détection de dépendances circulaires.

**Dépendances.** Aucune.

**Critères de sortie.**
- [ ] `pnpm install && pnpm build && pnpm test` verts sur tout le monorepo.
- [ ] `shared/test/` : chaque schéma accepte les exemples de 07-schemas.md et rejette des cas invalides (statut inconnu, id mal formé, rapport sans `resume_executif`).
- [ ] Migrations appliquées sur le PostgreSQL du compose ; seeds chargées ; contrat Zod ↔ colonnes Drizzle vérifié par test.
- [ ] `docker compose up` démarre les 4 services (healthchecks OK) ; la CI échoue volontairement sur un YAML invalide et sur une dépendance circulaire introduite en test.

**Démonstration.** `docker compose up`, migration + seed, puis un script qui crée
une `Task` validée par Zod, la persiste et la relit — types stricts de bout en bout.

**Risques & parades.**
- Dérive schémas Zod ↔ Drizzle → test de contrat automatique dans `database/test/`, exécuté en CI.
- Sur-ingénierie du socle → périmètre gelé sur les fichiers listés ci-dessus, rien de plus.

**Estimation de taille.** M.

---

## Phase 1 — Noyau d'orchestration

**Objectif.** Faire circuler une tâche de bout en bout : création, assignation par
un CEO minimal, exécution par un runtime générique avec agent factice, rapport, validation.

**Livrables.**
- `tasks/` : `tasks/src/task-service.ts` (transitions d'état + `history` immuable), `queue-manager.ts` (BullMQ, files `queue:{agent}:{site}`), `scheduler.ts` (SLA, vieillissement des priorités), `dependency-resolver.ts` (`depends_on`), `ports.ts`.
- Bus de messages `AgentMessage` (persistance + dispatch ; jamais d'appel direct agent→agent).
- `agents/runtime/` : `agent-runner.ts`, `context-loader.ts`, `plan-executor.ts`, `report-builder.ts`, `memory-emitter.ts` (stub en phase 1), `guardrails.ts`, `ports.ts` ; `agents/registry.ts`.
- `ceo/` minimal : `ceo/src/task-dispatcher.ts`, `validation-service.ts`, `decision-engine.ts` (politique simple), `ports.ts` ; refus codé de `assignee = ceo`.
- `api/` minimale : `api/src/main.ts`, `modules/tasks/`, `modules/governance/` (approve/reject) ; `backend/` : `backend/src/main.ts`, `worker.ts`, `container.ts` (câblage DI), `config.ts`.
- Agent factice + réponses LLM enregistrées dans `tests/fixtures/`.

**Dépendances.** Phase 0.

**Critères de sortie.**
- [ ] Cycle de vie complet observé : `draft → assigned → in_progress → awaiting_validation → done`, `history` append-only conforme au diagramme d'états de 01-architecture.md §7.
- [ ] `dependency-resolver` : une tâche avec `depends_on` ne démarre qu'après `done` de ses dépendances (intégration Testcontainers).
- [ ] `report-builder` rejette un rapport hors format unique et renvoie la tâche en révision (P4) ; le runtime refuse une tâche assignée au CEO.
- [ ] `tests/e2e/validation-gate.e2e.ts` vert : aucune action L3 sans `Decision` d'approbation.

**Démonstration.** Lancement de `backend` (orchestrateur + 1 worker), création d'une
tâche via l'API, exécution par l'agent factice, rapport validé, approbation via
l'endpoint governance — le tout visible dans les logs corrélés par `task_id`.

**Risques & parades.**
- Machine à états incohérente sous concurrence → transitions transactionnelles en base + tests de course sur BullMQ.
- Couplage runtime ↔ LLM réel trop tôt → port `llm` mocké par fixtures ; l'API Claude n'est branchée qu'en phase 3.

**Estimation de taille.** L.

---

## Phase 2 — Passerelle MCP

**Objectif.** Construire l'unique chemin entre agents et monde extérieur :
permissions par le code (P3), audit de chaque appel (P5), secrets jamais exposés.

**Livrables.**
- `mcp/src/` : `gateway.ts`, `permission-matrix.ts` (matrice de 03-agents/README.md encodée), `scopes.ts` (`draft-only`, `branch-only`, `read-only`…), `quotas.ts`, `audit-log.ts`, `credentials-broker.ts` ; `mcp/registry/servers.yaml` + son schéma.
- Premiers connecteurs dans `mcp/src/servers/` : `filesystem.ts`, `github.ts`, `firecrawl.ts`, `playwright.ts`, `gsc.ts`, `ga4.ts`, `qdrant.ts`, `wordpress.ts`, `shopify.ts`, `brave-search.ts`, `exa.ts`, `postgresql.ts`, `mysql.ts`, `docker.ts`, `terminal.ts` — de quoi couvrir les allowlists des agents livrés en Phase 3 — plus le Dockerfile de sandbox `infra/docker/sandbox/Dockerfile` ; tests de violation d'allowlist dans `mcp/test/`.

**Dépendances.** Phases 0, 1 (le runtime appelle la passerelle via son port `mcp-gateway`).

**Critères de sortie.**
- [ ] `tests/e2e/mcp-permissions.e2e.ts` vert : appel hors allowlist rejeté **et** journalisé comme violation dans `audit-log`.
- [ ] Portées fines vérifiées : Developer ne pousse jamais sur `main` (branch+PR only) ; Technical SEO en RO strict ; Filesystem Developer borné à `data/sites/<site_id>/`.
- [ ] Quotas : dépassement de rate-limit par agent/site → appel refusé, tâche `blocked`, événement d'audit ; chaque appel MCP produit une entrée d'audit (agent, tâche, serveur, méthode, durée).
- [ ] `credentials-broker` : secrets injectés à l'exécution, absents des prompts, logs et rapports (test d'assertion sur les sorties).

**Démonstration.** Un agent factice crawle une page via Firecrawl et lit GSC ;
puis tente un appel WordPress hors allowlist : rejet visible + entrée d'audit
consultable en base.

**Risques & parades.**
- Hétérogénéité des serveurs MCP tiers → interface connecteur unique dans `servers/`, tests contractuels par connecteur, fixtures réseau.
- Matrice qui dérive de la doc → la matrice encodée est générée/testée contre le tableau de 03-agents/README.md (test qui échoue si divergence).

**Estimation de taille.** L.

---

## Phase 3 — Vague SEO (agents 1 à 5)

**Objectif.** Premiers agents réels et premier moteur métier : un cycle SEO complet
tourne sur un site pilote, supervisé depuis un dashboard v0.

**Livrables.**
- Définitions : `agents/definitions/project-manager/agent.yaml`, `seo-strategist/agent.yaml`, `technical-seo/agent.yaml`, `content-writer/agent.yaml`, `developer/agent.yaml` — conformes aux fiches 01→05 de `docs/03-agents/`.
- Prompts : `prompts/ceo/system.md`, `prompts/agents/<slug>/system.md` pour les 5 agents, `prompts/CHANGELOG.md` ; branchement du LLM réel (paliers `reasoning`/`standard` via config globale).
- `workflows/src/` : `workflow-engine.ts`, `step-mapper.ts`, `validation-gates.ts`, `triggers.ts` (manuel d'abord) ; `workflows/definitions/seo/seo-audit.yaml` puis `workflows/definitions/seo/full-seo-cycle.yaml`.
- Domaines support : `sites/src/site-registry.ts`, `site-service.ts`, `credentials.ts` ; `clients/src/client-service.ts`.
- `frontend/` v0 : `frontend/src/app/validation/` (file de validation) et `frontend/src/app/tasks/` (kanban temps réel via `api/src/modules/realtime/`).

**Dépendances.** Phases 0, 1, 2.

**Critères de sortie.**
- [ ] `tests/e2e/seo-cycle.e2e.ts` vert : `seo-audit.yaml` puis le chemin audit → technique → propositions → validation CEO → développement → publication (agents Project Manager, SEO Strategist, Technical SEO, Content Writer, Developer), LLM mocké, site fixture — gates `ceo_gate` et `publish_gate` respectés, `permission_level` L2 puis L3 appliqués. Le workflow full-seo-cycle complet (avec les étapes concurrents et mesure analytics) est assemblé et testé en Phase 5, une fois competitor-analyst et data-analyst livrés.
- [ ] `tests/e2e/validation-gate.e2e.ts` toujours vert avec les vrais agents (non-régression) ; les 5 `agent.yaml` valident contre `shared/src/schemas/agent-definition.ts` en CI.
- [ ] `seo-audit.yaml` exécuté avec LLM réel sur le site pilote : rapport `Report` conforme, annexes dans `data/artifacts/`.
- [ ] Frontend v0 : approbation d'une validation depuis la file → la tâche repart, le kanban se met à jour en temps réel.

**Démonstration.** Déclenchement manuel de `seo-audit.yaml` sur le site pilote, puis
du chemin audit → technique → propositions → validation CEO → développement → publication :
l'utilisateur suit le kanban, approuve les deux gates dans la file de validation,
et lit le rapport final du Project Manager.

**Risques & parades.**
- Coût/latence LLM en dev → E2E toujours sur fixtures ; runs réels limités au site pilote avec budget par tâche (`guardrails.ts`).
- Rapports d'agents non conformes → boucle de reprise du `report-builder` (rejet Zod → révision), plafonnée à N tentatives puis escalade.
- Prompt-injection via contenu crawlé → garde-fous de `guardrails.ts` testés sur fixtures piégées.

**Estimation de taille.** XL.

---

## Phase 4 — Mémoire & rapports

**Objectif.** Donner au système sa mémoire institutionnelle et son moteur de
rapports agrégés — le rappel sémantique alimente désormais chaque contexte d'agent.

**Livrables.**
- `memory/src/pipeline/` : `distiller.ts` (palier `fast`), `deduplicator.ts`, `embedder.ts`, `writer.ts` ; `memory/src/recall/` : `retriever.ts`, `context-packer.ts` ; `memory/src/collections.ts` (8 collections : `mem_sites`, `mem_clients`, `mem_agents`, `mem_decisions`, `mem_seo_campaigns`, `mem_articles`, `mem_competitors`, `mem_keywords`).
- `agents/definitions/memory-manager/agent.yaml` + `prompts/agents/memory-manager/system.md` ; `prompts/pipeline/` (distillation, synthèse).
- `reports/src/` : `report-service.ts`, `validator.ts`, `aggregator.ts` (hebdo par site, mensuel par client), `exporters/` (Markdown, PDF, e-mail via n8n) ; `workflows/definitions/ops/weekly-report.yaml`.
- `frontend/` v1 : `frontend/src/app/reports/` (consultation, avant/après, export) et `frontend/src/app/memory/` (explorateur mémoire + décisions).

**Dépendances.** Phases 0–3 (les agents SEO produisent les `memory_candidates` à distiller).

**Critères de sortie.**
- [ ] Pipeline complet testé : candidats émis par `memory-emitter` → distillation → déduplication → écriture Qdrant avec payload `{site_id, client_id, agent, type, date, source_ref}`.
- [ ] Rappel scopé : un agent du site A ne récupère jamais un souvenir du site B ; Memory Manager = seul agent autorisé à écrire DIRECTEMENT dans Qdrant ; toute écriture Qdrant directe d'un autre agent est rejetée par la passerelle (test). À partir de la Phase 6, le Knowledge Manager alimente Qdrant via le pipeline mémoire, sans appel MCP direct.
- [ ] `reports/src/validator.ts` rejette tout écart au format unique ; `aggregator` produit un hebdo correct sur fixtures ; `weekly-report.yaml` tourne sur le site pilote et exporte en Markdown et PDF.

**Démonstration.** Après deux cycles SEO, l'utilisateur interroge l'explorateur
mémoire (« qu'a-t-on appris sur le maillage interne ? »), voit les faits sourcés
(`source_refs`), puis exporte le rapport hebdo consolidé du site pilote.

**Risques & parades.**
- Mémoire polluée (faits faux ou périmés) → seuil de `confidence`, `valid_until`, déduplication agressive, revue périodique par le pipeline.
- Coût d'embeddings → distillation en palier `fast`, batch, `embedding_model` versionné pour ré-indexation ciblée.

**Estimation de taille.** L.

---

## Phase 5 — Vague Croissance (agents 6 à 11)

**Objectif.** Étendre l'agence à la conversion, au marketing et à l'analyse :
le moteur conversion complet devient opérationnel.

**Livrables.**
- Définitions + prompts : `agents/definitions/ux-expert/agent.yaml`, `cro-expert/agent.yaml`, `marketing-expert/agent.yaml`, `sales-expert/agent.yaml`, `data-analyst/agent.yaml`, `competitor-analyst/agent.yaml` et `prompts/agents/<slug>/system.md` associés (fiches 06→11).
- Connecteurs MCP : `mcp/src/servers/google-ads.ts`, `wordpress.ts`, `shopify.ts`, `stripe.ts`, `brave-search.ts`, `exa.ts`, `postgresql.ts`, `supabase.ts` — portées de la matrice (Google Ads RO+P, Shopify Sales RO+P) appliquées.
- `workflows/definitions/cro/conversion-audit.yaml`, `cro/ab-test-cycle.yaml`, `marketing/campaign-cycle.yaml` ; `sites/src/platforms/wordpress.ts`, `shopify.ts`, `laravel.ts`, `nextjs.ts` ; `clients/src/goals.ts`, `preferences.ts`.

**Dépendances.** Phases 0–4 (les workflows CRO consomment mémoire et rapports).

**Critères de sortie.**
- [ ] Les 6 `agent.yaml` valident en CI ; matrice MCP étendue couverte par `tests/e2e/mcp-permissions.e2e.ts` (ex. Marketing Expert : lecture Ads libre, création de campagne = L3 escaladée à l'humain).
- [ ] `conversion-audit.yaml` E2E sur fixtures : hypothèses priorisées impact × effort × risque dans `recommandations`.
- [ ] `ab-test-cycle.yaml` : hypothèse → implémentation L2 → mesure avant/après par Data Analyst → décision CEO tracée ; toute dépense (Ads, Stripe, prix Shopify) déclenche l'escalade humaine (test dédié).
- [ ] `full-seo-cycle.yaml` complet assemblé et testé en E2E (`tests/e2e/seo-cycle.e2e.ts` étendu) : les étapes concurrents (competitor-analyst) et mesure analytics (data-analyst), désormais livrés, complètent le chemin audit → technique → propositions → validation CEO → développement → publication.

**Démonstration.** `conversion-audit` sur le site pilote : tunnel analysé,
hypothèses priorisées soumises au CEO, une hypothèse implémentée en staging,
mesure avant/après visible dans les rapports.

**Risques & parades.**
- Actions à dépense réelle → double gate CEO **et** humain codé dans `validation-gates.ts` ; comptes sandbox (Stripe test, Ads sans budget) en dev.
- Qualité inégale des 6 nouveaux prompts → calibration sur fixtures + revue des rapports produits avant validation de phase.

**Estimation de taille.** XL.

---

## Phase 6 — Vague Gouvernance (agents 12 à 17)

**Objectif.** Boucler le roster et installer les contre-pouvoirs : revues
obligatoires, conseils multi-agents, workflows dev et ops.

**Livrables.**
- Définitions + prompts : `agents/definitions/security-expert/agent.yaml`, `automation-engineer/agent.yaml`, `quality-reviewer/agent.yaml`, `brand-guardian/agent.yaml`, `knowledge-manager/agent.yaml` (fiches 12→17 ; memory-manager livré en phase 4).
- Connecteurs restants : `mcp/src/servers/mysql.ts`, `docker.ts`, `terminal.ts`, `n8n.ts` (sandbox Security/Developer via `infra/docker/sandbox/Dockerfile`).
- `councils/src/council-runner.ts`, `protocols.ts` et les 4 définitions : `councils/definitions/quality-council.yaml`, `seo-council.yaml`, `release-council.yaml`, `crisis-council.yaml` ; `prompts/councils/<slug>.md`.
- Revues obligatoires branchées dans les workflows existants (Quality Reviewer + Brand Guardian avant toute validation CEO de livrable) ; `workflows/definitions/dev/bugfix.yaml`, `dev/dependency-update.yaml`, `ops/incident-response.yaml`.

**Dépendances.** Phases 0–5.

**Critères de sortie.**
- [ ] Roster complet : 17 définitions + CEO valident en CI ; matrice MCP intégralement encodée et testée.
- [ ] Un livrable non conforme est bloqué par Quality Reviewer ; le déblocage exige une décision CEO tracée (`Decision`).
- [ ] `bugfix.yaml` E2E : repro → branche → fix → PR → CI verte → validation → merge ; jamais de commit direct sur `main`.
- [ ] `incident-response.yaml` : une alerte P0 convoque `crisis-council.yaml`, court-circuite la file mais pas la validation ; post-mortem produit. Security Expert : scans en sandbox uniquement, aucun droit de modification (test de portée Docker/Terminal).

**Démonstration.** Bug injecté dans le site fixture → `bugfix.yaml` complet avec
release council ; puis un contenu hors charte est bloqué par Brand Guardian et
l'utilisateur arbitre depuis la file de validation.

**Risques & parades.**
- Councils qui n'aboutissent pas (avis contradictoires) → `protocols.ts` : quorum, temps borné, synthèse imposée, sinon escalade à l'humain.
- Revues obligatoires = goulot d'étranglement → revues en parallèle des gates quand c'est sûr, files dédiées prioritaires pour les reviewers.

**Estimation de taille.** L.

---

## Phase 7 — Multi-sites & échelle

**Objectif.** Passer d'un site pilote à un portefeuille : onboarding industrialisé,
équité d'ordonnancement, coûts par site, montée 10 → 100 sites.

**Livrables.**
- `workflows/definitions/ops/site-onboarding.yaml` industrialisé (credentials via coffre, baseline KPI, mémoire initiale).
- `tasks/src/scheduler.ts` et `queue-manager.ts` : round-robin pondéré par priorité entre sites, quotas de tokens/appels MCP par site (`mcp/src/quotas.ts` étendu).
- Partitionnement vérifié partout : tables, files `queue:{agent}:{site}`, collections Qdrant filtrées, `data/sites/<site_id>/` ; suivi des coûts par site/client (`cost` agrégé, budgets de `Client.budget`).
- `infra/docker-compose.prod.yml` (prod mono-machine ~100 sites), `infra/docker/Dockerfile.api`, `Dockerfile.worker`, `Dockerfile.frontend` ; workers scalables en réplicas ; tests de charge multi-sites sur Testcontainers.

**Dépendances.** Phases 0–6.

**Critères de sortie.**
- [ ] `tests/e2e/multi-site-fairness.e2e.ts` vert : un site saturé n'affame pas les autres.
- [ ] Onboarding d'un nouveau site en une exécution de `site-onboarding.yaml`, sans intervention manuelle hors validation.
- [ ] 10 sites actifs simultanés en compose dev ; 100 sites simulés en test de charge sans modification d'architecture (P7) ; `docker-compose.prod.yml` déployé sur une machine cible, workers en réplicas.
- [ ] Budget LLM par site : alerte à 80 %, gel à 100 % avec escalade humaine (test).

**Démonstration.** Onboarding en direct de 3 nouveaux sites, cockpit
(`frontend/src/app/(cockpit)/page.tsx`) affichant le portefeuille, puis test de
charge dont le rapport montre l'équité et les coûts par site.

**Risques & parades.**
- Contention PostgreSQL/Redis sous charge → index revus au profil réel, pooling, lots BullMQ ; mesurer avant d'optimiser.
- Fuite de scope inter-sites → tests d'isolation systématiques (mémoire, filesystem, credentials) rejoués sur chaque connecteur.

**Estimation de taille.** L.

---

## Phase 8 — Durcissement & 1000 sites

**Objectif.** Rendre le système opérable en production à grande échelle :
observabilité, résilience, politiques HITL par client, sécurité éprouvée.

**Livrables.**
- `infra/observability/` : OpenTelemetry (traces par tâche, logs corrélés `task_id`, coût LLM par agent/site), dashboards Grafana, alerting.
- Politiques HITL affinées : `validation_policy` par client (`standard`/`strict`) appliquée par `ceo/src/escalation-policy.ts` et l'API governance.
- Kill switch éprouvé (par agent, par site, global) : `api/src/modules/governance/` + gel des files — testé sous charge ; tests chaos (pannes Redis/Qdrant/LLM, workers tués en plein vol).
- Sharding Qdrant + partitions PostgreSQL (par `site_id`) ; runbooks de migration.
- Revue de sécurité globale (scopes MCP, coffre, sandbox) + documentation opérateur dans `docs/` (runbooks, ADR dans `docs/adr/`).

**Dépendances.** Phases 0–7.

**Critères de sortie.**
- [ ] Toute tâche est traçable de bout en bout dans Grafana (trace, logs, coût) ; alertes SLA et budget opérationnelles.
- [ ] Tests chaos verts : aucune tâche perdue ni exécutée deux fois après panne d'un composant ; `history` cohérent. Kill switch : coupure d'un agent en < 5 s pendant un run, files gelées, reprise propre.
- [ ] Client en `validation_policy: strict` : 100 % des L3 escaladés à l'humain (test E2E dédié).
- [ ] Suite E2E complète verte (`tests/e2e/seo-cycle.e2e.ts`, `validation-gate.e2e.ts`, `mcp-permissions.e2e.ts`, `multi-site-fairness.e2e.ts`) sur l'infrastructure partitionnée/shardée ; charge 1000 sites simulés.
- [ ] Revue de sécurité sans finding bloquant ; documentation opérateur validée par un run « à froid ».

**Démonstration.** Scénario de crise joué devant l'utilisateur : panne injectée,
alerte, kill switch, reprise, post-mortem — dashboards et journal d'audit à l'appui.

**Risques & parades.**
- Migration partitions/sharding sur données vivantes → migrations répétées sur copie de production, plan de rollback par runbook.
- Chaos non représentatif → scénarios dérivés des incidents réels des phases 3–7, rejoués en régression.

**Estimation de taille.** L.

---

## Récapitulatif

| Phase | Nom | Incrément démontrable | Dépend de | Taille |
|-------|-----|----------------------|-----------|--------|
| 0 | Fondations | Monorepo + schémas + DB + compose + CI verts | — | M |
| 1 | Noyau d'orchestration | Cycle de vie complet d'une tâche, agent factice | 0 | L |
| 2 | Passerelle MCP | Permissions appliquées par le code, audit, 15 connecteurs + sandbox | 0–1 | L |
| 3 | Vague SEO | Cycle SEO complet sur site pilote + frontend v0 | 0–2 | XL |
| 4 | Mémoire & rapports | Mémoire vectorielle + rapports agrégés + frontend v1 | 0–3 | L |
| 5 | Vague Croissance | Moteur conversion + marketing (agents 6–11) | 0–4 | XL |
| 6 | Vague Gouvernance | Roster complet, councils, revues obligatoires | 0–5 | L |
| 7 | Multi-sites & échelle | Onboarding industrialisé, équité, 10 → 100 sites | 0–6 | L |
| 8 | Durcissement & 1000 sites | Observabilité, chaos, HITL par client, sécurité | 0–7 | L |

## Ordre de génération des modules (à l'intérieur d'une phase)

1. **Contrats** — schémas Zod dans `shared/`, interfaces `ports.ts` du package.
2. **Domaine** — logique métier pure du package, sans I/O, testée sur les ports.
3. **Adaptateurs** — implémentations concrètes (Drizzle, BullMQ, LLM, connecteurs MCP).
4. **Intégration** — câblage dans `backend/src/container.ts`, exposition `api/`, frontend.
5. **Tests** — unitaires écrits avec le domaine, intégration Testcontainers, E2E `tests/e2e/` en clôture de phase.

## Définition de fini (DoD) commune à toutes les phases

- [ ] Tests verts à tous les niveaux : unitaires du package, intégration, E2E concernés — en local **et** en CI.
- [ ] `README.md` du package à jour : rôle, API publique, invariants.
- [ ] Tous les YAML introduits (agents, workflows, councils, registre MCP) valident contre leurs schémas en CI.
- [ ] Aucune dépendance circulaire ni non déclarée (règles de 02-arborescence.md, vérifiées en CI).
- [ ] Revue du code de la phase, puis **validation explicite de l'utilisateur** sur la démonstration — condition d'entrée de la phase suivante.
