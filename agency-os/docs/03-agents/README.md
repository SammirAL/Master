# 03 — Les agents

> Roster complet, matrice des permissions MCP, autonomies déléguées, et gabarit
> de fiche. Chaque agent a sa fiche détaillée dans ce dossier (mission, prompt
> système, permissions, interdictions, MCP, formats, KPI, mémoire).

## Roster

| # | Agent | Slug | Mission en une ligne | Fiche |
|---|-------|------|----------------------|-------|
| 0 | CEO | `ceo` | Décider, prioriser, arbitrer, valider — sans jamais exécuter | [00-ceo.md](00-ceo.md) |
| 1 | Project Manager | `project-manager` | Piloter l'exécution : planning, suivi, coordination, SLA | [01-project-manager.md](01-project-manager.md) |
| 2 | SEO Strategist | `seo-strategist` | Stratégie SEO : audits, cocons sémantiques, priorisation | [02-seo-strategist.md](02-seo-strategist.md) |
| 3 | Technical SEO | `technical-seo` | SEO technique : crawl, balises, données structurées, CWV | [03-technical-seo.md](03-technical-seo.md) |
| 4 | Content Writer | `content-writer` | Production de contenus optimisés, briefs → brouillons | [04-content-writer.md](04-content-writer.md) |
| 5 | Developer | `developer` | Code : branches, PR, bugfix, mises à jour, Lighthouse | [05-developer.md](05-developer.md) |
| 6 | UX Expert | `ux-expert` | Expérience utilisateur : parcours, accessibilité, ergonomie | [06-ux-expert.md](06-ux-expert.md) |
| 7 | CRO Expert | `cro-expert` | Conversion : tunnel, panier, hypothèses, A/B tests | [07-cro-expert.md](07-cro-expert.md) |
| 8 | Marketing Expert | `marketing-expert` | Acquisition : campagnes, canaux, messages | [08-marketing-expert.md](08-marketing-expert.md) |
| 9 | Sales Expert | `sales-expert` | Ventes : offres, prix, panier moyen, réachat | [09-sales-expert.md](09-sales-expert.md) |
| 10 | Data Analyst | `data-analyst` | Mesure : KPI, tableaux de bord, avant/après, attribution | [10-data-analyst.md](10-data-analyst.md) |
| 11 | Competitor Analyst | `competitor-analyst` | Veille concurrentielle : positions, contenus, mouvements | [11-competitor-analyst.md](11-competitor-analyst.md) |
| 12 | Security Expert | `security-expert` | Sécurité : audits, dépendances, durcissement (propose, ne corrige pas) | [12-security-expert.md](12-security-expert.md) |
| 13 | Automation Engineer | `automation-engineer` | Automatisations n8n, intégrations, tâches récurrentes | [13-automation-engineer.md](13-automation-engineer.md) |
| 14 | Memory Manager | `memory-manager` | Mémoire : distillation, vectorisation, hygiène, rappel | [14-memory-manager.md](14-memory-manager.md) |
| 15 | Quality Reviewer | `quality-reviewer` | Contrôle qualité : revue de tout livrable avant validation CEO | [15-quality-reviewer.md](15-quality-reviewer.md) |
| 16 | Brand Guardian | `brand-guardian` | Cohérence de marque : ton, style, promesses, interdits | [16-brand-guardian.md](16-brand-guardian.md) |
| 17 | Knowledge Manager | `knowledge-manager` | Savoir transverse : procédures, guides, référentiels | [17-knowledge-manager.md](17-knowledge-manager.md) |

---

## Gabarit de fiche (obligatoire)

Chaque fiche suit exactement ce plan :

1. **Identité** — nom, slug, palier de modèle (`reasoning` / `standard` / `fast`)
2. **Mission**
3. **Responsabilités**
4. **Objectifs & KPI** — mesurables, avec cibles
5. **Prompt système** — texte complet versionné (source : `prompts/agents/<slug>/system.md`)
6. **Permissions** — niveau L0–L3 et portées fines
7. **Interdictions** — appliquées par le code (passerelle MCP), pas seulement par le prompt
8. **MCP autorisés** — avec portée par serveur
9. **Autonomies déléguées** — actions autorisées **sans** validation CEO
10. **Format de rapport** — format unique (`Report`, cf. [07-schemas.md](../07-schemas.md)) + contenu attendu des sections pour ce métier
11. **Format des tâches acceptées** — types de tâches et entrées requises
12. **Format des réponses** — `AgentResponse` (cf. [07-schemas.md](../07-schemas.md))
13. **Interactions** — collaborations types, conseils auxquels il siège
14. **Escalades** — quand et vers qui
15. **Limites** — budgets, quotas, garde-fous
16. **Mémoire** — collections lues / alimentées

---

## Matrice MCP (agent × serveur × portée)

Légende : `RO` lecture seule · `S` staged (brouillon / branche / sandbox — L2) ·
`P` production derrière validation (L3) · `RW` lecture-écriture directe · vide = interdit.
La matrice est **appliquée par la passerelle MCP** (`mcp/permission-matrix.ts`) ;
toute tentative hors matrice est rejetée et auditée.

| Agent \ MCP | GitHub | Filesystem | Playwright | Firecrawl | GSC | GA4 | Google Ads | WordPress | Shopify | PostgreSQL | MySQL | Supabase | Qdrant | Brave | Exa | Stripe | Docker | Terminal | n8n |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CEO | | | | | | | | | | RO | | | RO | | | | | | |
| Project Manager | | | | | | | | | | RO | | | RO | | | | | | RO |
| SEO Strategist | | | | RO | RO | RO | | | | | | | RO | RO | RO | | | | |
| Technical SEO | RO | RO | RO | RO | RO | | | | | | | | | | | | | | |
| Content Writer | | | | | | | | S | S | | | | RO | RO | RO | | | | |
| Developer | S+P | RW¹ | RO² | | | | | | | S³ | S³ | | | | | | S | S | |
| UX Expert | | | RO | RO | | RO | | | | | | | | | | | | | |
| CRO Expert | | | RO | | | RO | | | | RO | | | | | | RO | | | |
| Marketing Expert | | | | | | RO | RO+P⁴ | | | | | | | RO | RO | | | | |
| Sales Expert | | | | | | RO | | | RO+P⁵ | RO | | | | | | RO | | | |
| Data Analyst | | | | | RO | RO | RO | | | RO | | RO | | | | RO | | | |
| Competitor Analyst | | | RO | RO | | | | | | | | | RO | RO | RO | | | | |
| Security Expert | RO | RO | RO | | | | | | | | | | | RO | | | S⁶ | S⁶ | |
| Automation Engineer | S+P | | | | | | | | | | | | | | | | S | S | S+P |
| Memory Manager | | RO | | | | | | | | RW⁷ | | RW⁷ | RW | | | | | | |
| Quality Reviewer | RO | RO | RO | RO | | | | RO | RO | | | | RO | | | | | | |
| Brand Guardian | | RO | | RO | | | | RO | RO | | | | RO | | | | | | |
| Knowledge Manager | | RW⁸ | | | | | | | | RO | | | RW⁸ | RO | RO | | | | |

Notes de portée :
1. `Filesystem` Developer : limité au workspace du site (`data/sites/<site_id>/`), jamais hors périmètre.
2. `Playwright` Developer : exécution de tests uniquement.
3. Bases de données des sites : lecture staging + migrations livrées **via PR** — jamais d'écriture directe en production.
4. `Google Ads` : lecture libre ; toute création/modification de campagne = L3 (validation CEO **et** humaine, car dépense).
5. `Shopify` Sales Expert : lecture libre ; changements de prix/offres = L3.
6. `Docker`/`Terminal` Security Expert : sandbox d'analyse uniquement (scans, SCA), aucun accès aux environnements des sites.
7. `PostgreSQL`/`Supabase` Memory Manager : uniquement les tables de mémoire/index — pas les tables métier.
8. Knowledge Manager : écrit dans l'espace documentaire (`data/`) et les collections de connaissance, via le pipeline mémoire.

---

## Autonomies déléguées (actions sans validation CEO)

Principe P2 : tout le reste requiert validation. Liste exhaustive par agent :

| Agent | Autonomies déléguées |
|-------|---------------------|
| Project Manager | Relances d'agents, replanification interne d'une tâche non commencée, demandes de statut |
| SEO Strategist | Lancement d'analyses en lecture seule ; veille mots-clés |
| Technical SEO | Crawls et mesures (CWV, Lighthouse) en lecture seule |
| Content Writer | Création/édition de **brouillons** CMS (jamais de publication) |
| Developer | Création de branches, commits sur branches de travail, ouverture de PR, exécution de tests en sandbox |
| UX Expert | Parcours de test en lecture seule, captures |
| CRO Expert | Analyses en lecture seule, calculs d'hypothèses |
| Marketing Expert | Lecture des campagnes et métriques ; brouillons de briefs |
| Sales Expert | Analyses en lecture seule |
| Data Analyst | Toute lecture analytique ; production de tableaux de bord |
| Competitor Analyst | Toute veille en lecture seule |
| Security Expert | Scans en sandbox ; alerte P0 immédiate (court-circuite la file, pas la validation) |
| Automation Engineer | Création de workflows n8n **désactivés** ; l'activation est L3 |
| Memory Manager | Tout le pipeline mémoire (distiller, vectoriser, ranger, nettoyer les doublons) |
| Quality Reviewer | Toute revue ; blocage d'un livrable non conforme (le déblocage se joue au niveau CEO) |
| Brand Guardian | Toute revue de conformité de marque ; blocage comme ci-dessus |
| Knowledge Manager | Rédaction et rangement de la documentation interne |

---

## Paliers de modèle

| Palier | Usage | Agents |
|--------|-------|--------|
| `reasoning` | Décision, arbitrage, stratégie, code | CEO, SEO Strategist, Developer, CRO Expert, Security Expert |
| `standard` | Analyse et production courantes | Project Manager, Technical SEO, Content Writer, UX Expert, Marketing Expert, Sales Expert, Data Analyst, Competitor Analyst, Automation Engineer, Quality Reviewer, Brand Guardian, Knowledge Manager |
| `fast` | Tâches mécaniques à fort volume | Memory Manager (distillation), sous-tâches de classification |

Le mapping palier → modèle concret est une configuration globale (un seul endroit à changer).
