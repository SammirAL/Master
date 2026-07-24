# 07 — Schémas canoniques

> Formats uniques du système. Implémentés en Zod dans `shared/src/schemas/`,
> reflétés dans le schéma PostgreSQL, imposés par validation à chaque frontière
> (API, runtime agent, moteur de rapports). **Aucune variante par agent n'est admise.**

Conventions générales :

- Identifiants : `TSK-` (tâche), `RPT-` (rapport), `DEC-` (décision), `MSG-` (message),
  `WFR-` (exécution de workflow), `MEM-` (souvenir), suivis de `YYYYMMDD-` et d'un suffixe aléatoire court.
  Exemple : `TSK-20260724-a8f3k2`.
- Dates : ISO 8601 UTC.
- Références croisées : toujours par identifiant, jamais par copie de contenu.

---

## 1. Task — la tâche

```jsonc
{
  "id": "TSK-20260724-a8f3k2",
  "title": "Audit technique SEO — corriger les données structurées",
  "description": "…",                       // objectif, contexte, critères d'acceptation
  "priority": "P1",                          // P0 incident | P1 haute | P2 normale | P3 fond
  "site_id": "site_acme-shop",               // partitionnement multi-sites (obligatoire si applicable)
  "client_id": "cli_acme",
  "agent": "technical-seo",                  // slug de l'agent assigné
  "created_by": "ceo",                       // ceo | workflow:<wfr_id> | human:<user_id>
  "workflow_run_id": "WFR-20260724-x1…",     // null si tâche isolée
  "depends_on": ["TSK-20260723-…"],          // démarrage bloqué tant que non `done`
  "deadline": "2026-07-28T18:00:00Z",        // SLA ; dépassement ⇒ escalade + vieillissement priorité
  "status": "in_progress",                   // draft | assigned | in_progress | blocked |
                                             // awaiting_validation | rejected | done | failed | cancelled
  "permission_level_required": "L2",         // L0 read | L1 propose | L2 staged | L3 production
  "validation": {                            // présent si une action L3 est en jeu
    "required": true,
    "requested_at": "…",
    "decided_by": null,                      // "ceo" | "human:<user_id>"
    "decision_id": null                      // référence DEC-…
  },
  "logs": [                                  // append-only, horodaté
    { "at": "…", "level": "info", "event": "mcp_call", "detail": "firecrawl.scrape /produits" }
  ],
  "result": {                                // rempli à la fin
    "summary": "…",                          // 3 lignes max
    "report_id": "RPT-20260724-…",           // le rapport complet (format unique)
    "artifacts": ["data/artifacts/…"],       // fichiers produits
    "memory_candidates": ["MEM-…"]           // faits proposés à la mémoire
  },
  "history": [                               // transitions immuables
    { "at": "…", "from": "assigned", "to": "in_progress", "by": "worker:w-04", "reason": "…" }
  ],
  "cost": { "llm_tokens": 0, "mcp_calls": 0, "usd_estimate": 0 },
  "created_at": "…", "updated_at": "…"
}
```

---

## 2. Report — le rapport (format unique)

Tout agent, sans exception, rend ses rapports dans ce format. Le moteur de
rapports **rejette** tout écart de structure ; la tâche repart alors en révision.

```jsonc
{
  "id": "RPT-20260724-b2c9d1",
  "task_id": "TSK-20260724-a8f3k2",
  "agent": "technical-seo",
  "site_id": "site_acme-shop",
  "client_id": "cli_acme",
  "period": { "from": "…", "to": "…" },      // période analysée (null si instantané)
  "status_global": "yellow",                 // green | yellow | red — lecture en 1 seconde
  "sections": {
    "resume_executif": "…",                  // ≤ 10 lignes, lisible par un non-technicien
    "constats": [                            // faits observés, sourcés
      { "fact": "…", "evidence": "artefact ou donnée source", "severity": "high|medium|low" }
    ],
    "analyse": "…",                          // interprétation, causes, corrélations
    "actions_realisees": [                   // ce qui a été fait pendant la tâche
      { "action": "…", "scope": "L0|L1|L2|L3", "proof": "lien artefact / PR / diff" }
    ],
    "recommandations": [                     // priorisées, décidables par le CEO
      { "titre": "…", "impact": 1-5, "effort": 1-5, "risque": 1-5, "detail": "…" }
    ],
    "kpis": [                                // toujours avant/après/objectif
      { "name": "lcp_ms", "before": 4200, "after": 2900, "target": 2500, "trend": "improving" }
    ],
    "risques_limites": "…",                  // incertitudes, hypothèses, angles morts
    "prochaines_etapes": ["…"],
    "annexes": ["data/artifacts/…"]          // preuves : exports, captures, crawls
  },
  "created_at": "…"
}
```

---

## 3. AgentResponse — la réponse standard d'un agent

Ce qu'un agent renvoie au moteur de tâches à la fin (ou en cours) d'exécution.

```jsonc
{
  "task_id": "TSK-…",
  "agent": "content-writer",
  "type": "completion",            // ack | progress | completion | blocked | validation_request | error
  "summary": "…",                  // 3 lignes max
  "report_id": "RPT-…",            // obligatoire pour `completion`
  "needs": [                       // pour `blocked` / `validation_request`
    { "kind": "validation|info|dependency|budget", "detail": "…", "from": "ceo" }
  ],
  "confidence": 0.85,              // auto-évaluation calibrée
  "at": "…"
}
```

---

## 4. AgentMessage — message inter-agents

Toute communication passe par le bus de messages (jamais d'appel direct agent→agent).

```jsonc
{
  "id": "MSG-20260724-…",
  "from": "ceo",                   // slug émetteur ("ceo", "system", "human:<id>", "<agent-slug>", "council:<slug>")
  "to": "seo-strategist",          // slug destinataire ou "council:<slug>"
  "type": "task_assignment",       // task_assignment | status_update | report_submission |
                                   // validation_request | validation_response | info_request |
                                   // info_response | escalation | alert | council_summon
  "task_id": "TSK-…",              // contexte (null pour les alertes système)
  "payload": { },                  // contenu typé selon `type` (schémas dédiés)
  "refs": ["RPT-…", "DEC-…"],      // références croisées
  "at": "…"
}
```

---

## 5. Decision — décision du CEO

Enregistrement immuable de chaque décision (auditabilité + mémoire décisionnelle).

```jsonc
{
  "id": "DEC-20260724-…",
  "kind": "validation",            // validation | prioritization | arbitration | escalation | planning
  "subject": { "task_id": "TSK-…", "site_id": "…", "client_id": "…" },
  "context_refs": ["RPT-…", "MSG-…", "MEM-…"],   // ce qui a été lu pour décider
  "options_considered": [ { "option": "…", "pros": "…", "cons": "…" } ],
  "decision": "approve",           // approve | reject | revise | defer | escalate_to_human
  "rationale": "…",                // justification explicite, toujours remplie
  "conditions": ["déployer hors heures de pointe"],   // conditions attachées à l'approbation
  "decided_by": "ceo",             // "ceo" | "human:<user_id>" (si escaladé)
  "at": "…"
}
```

---

## 6. Site

```jsonc
{
  "id": "site_acme-shop",
  "client_id": "cli_acme",
  "name": "Acme Shop",
  "url": "https://acme-shop.example",
  "platform": "shopify",           // wordpress | shopify | laravel | nextjs | other
  "environments": {                // cibles de déploiement
    "production": { "url": "…" },
    "staging": { "url": "…" }
  },
  "repo": { "provider": "github", "owner": "…", "name": "…", "default_branch": "main" },
  "credentials_ref": "vault://sites/site_acme-shop",  // jamais de secrets en clair
  "objectives": [ { "goal": "+30 % trafic organique", "horizon": "2026-Q4", "kpi": "organic_sessions" } ],
  "kpis": [ { "name": "organic_sessions", "current": 12000, "target": 15600, "unit": "sessions/mois" } ],
  "competitors": ["comp_rival-shop", "comp_bigstore"],
  "constraints": ["pas de déploiement le vendredi", "ton éditorial : sobre"],
  "status": "active",              // onboarding | active | paused | archived
  "created_at": "…"
}
```

## 7. Client

```jsonc
{
  "id": "cli_acme",
  "name": "Acme SARL",
  "contacts": [ { "name": "…", "email": "…", "role": "…" } ],
  "sites": ["site_acme-shop", "site_acme-blog"],
  "business_goals": ["développer la vente en ligne en France"],
  "editorial_preferences": { "tone": "…", "forbidden_topics": ["…"], "languages": ["fr"] },
  "validation_policy": "standard", // standard (CEO suffit) | strict (humain requis pour tout L3)
  "budget": { "llm_monthly_usd": 300, "ads_monthly_usd": 0 },
  "status": "active",
  "created_at": "…"
}
```

---

## 8. MemoryRecord — unité de mémoire longue durée

```jsonc
{
  "id": "MEM-20260724-…",
  "collection": "mem_seo_campaigns",   // mem_sites | mem_clients | mem_agents | mem_decisions |
                                       // mem_seo_campaigns | mem_articles | mem_competitors | mem_keywords
  "scope": { "site_id": "…", "client_id": "…", "agent": "…" },   // payload de filtrage Qdrant
  "type": "lesson",                    // fact | lesson | preference | outcome | profile
  "content": "Le maillage interne vers /guides a augmenté les positions du cocon 'jardinage' de 8 places en moyenne.",
  "source_refs": ["RPT-…", "TSK-…"],   // traçabilité du fait
  "confidence": 0.9,
  "valid_until": null,                 // null = durable ; sinon date de péremption
  "embedding_model": "…",              // versionné pour permettre les ré-indexations
  "created_by": "memory-manager",
  "created_at": "…"
}
```

---

## 9. WorkflowDefinition — définition de workflow (YAML)

```yaml
id: full-seo-cycle
name: Cycle SEO complet
version: 1
trigger:                      # cron | event | kpi_threshold | manual
  kind: manual
inputs: [site_id]
steps:
  - id: audit
    agent: seo-strategist
    task: "Audit SEO complet du site {{site_id}}"
    outputs: [audit_report]
  - id: competitors
    agent: competitor-analyst
    task: "Analyse concurrentielle sur la base de {{steps.audit.report}}"
    after: [audit]
  - id: technical
    agent: technical-seo
    task: "Analyse technique approfondie"
    after: [audit]
  - id: proposals
    agent: seo-strategist
    task: "Synthèse et propositions priorisées"
    after: [competitors, technical]
  - id: ceo_gate
    gate: ceo_validation          # point de validation obligatoire
    after: [proposals]
  - id: development
    agent: developer
    task: "Implémenter les correctifs approuvés"
    after: [ceo_gate]
    permission_level: L2          # branche + PR ; le merge est un nouveau gate
  - id: publish_gate
    gate: ceo_validation
    after: [development]
  - id: publication
    agent: developer
    task: "Merge + déploiement"
    after: [publish_gate]
    permission_level: L3
  - id: measure
    agent: data-analyst
    task: "Analyse Analytics post-publication (J+7)"
    after: [publication]
    delay: 7d
  - id: final_report
    agent: project-manager
    task: "Rapport final consolidé du cycle"
    after: [measure]
on_failure: escalate_to_ceo
```

---

## 10. Enums de référence

| Enum | Valeurs |
|------|---------|
| `TaskStatus` | `draft`, `assigned`, `in_progress`, `blocked`, `awaiting_validation`, `rejected`, `done`, `failed`, `cancelled` |
| `Priority` | `P0`, `P1`, `P2`, `P3` |
| `PermissionLevel` | `L0` (read), `L1` (propose), `L2` (staged), `L3` (production) |
| `MessageType` | `task_assignment`, `status_update`, `report_submission`, `validation_request`, `validation_response`, `info_request`, `info_response`, `escalation`, `alert`, `council_summon` |
| `DecisionKind` | `validation`, `prioritization`, `arbitration`, `escalation`, `planning` |
| `StatusGlobal` | `green`, `yellow`, `red` |
| `MemoryType` | `fact`, `lesson`, `preference`, `outcome`, `profile` |
| `Platform` | `wordpress`, `shopify`, `laravel`, `nextjs`, `other` |
