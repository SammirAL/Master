# Agency AI OS

> **Un système d'exploitation d'entreprise IA** — pas un chatbot.
> Une agence digitale virtuelle composée d'agents IA spécialisés qui gèrent,
> optimisent et font croître un portefeuille de sites web de manière autonome,
> sous la supervision d'un agent CEO.

---

## Qu'est-ce que c'est ?

Agency AI OS est une plateforme multi-agents qui reproduit le fonctionnement
d'une agence digitale complète :

- **1 CEO** qui décide, priorise, arbitre et valide — mais ne touche jamais aux sites.
- **17 agents spécialisés** (SEO, développement, contenu, CRO, marketing, ventes,
  data, sécurité, qualité…) avec chacun : rôle, prompt système, mémoire, outils MCP,
  objectifs, KPI, limites, permissions et historique propres.
- **Un moteur de tâches** : le CEO distribue, les agents exécutent, les résultats remontent.
- **Une mémoire longue durée vectorisée** par site, client, agent, décision, campagne,
  article, concurrent et mot-clé.
- **Des workflows automatiques** (audit SEO → analyse → validation CEO → développement
  → publication → mesure → rapport).
- **Une architecture multi-sites** conçue pour passer de 1 à 100 à 1000 sites
  sans changement structurel.

## État du projet

**Phase actuelle : conception (architecture validée avant tout code).**

Ce dépôt contient pour l'instant la documentation d'architecture complète.
Le code sera généré module par module, après validation, en suivant le
[plan de développement](docs/06-plan-de-developpement.md).

## Documentation

| # | Document | Contenu |
|---|----------|---------|
| 1 | [Architecture complète](docs/01-architecture.md) | Vision, couches, stack technique, moteurs (tâches, mémoire, SEO, dev, CRO), scalabilité, gouvernance |
| 2 | [Arborescence du projet](docs/02-arborescence.md) | Liste complète des dossiers et des fichiers avec le rôle de chacun |
| 3 | [Les agents](docs/03-agents/README.md) | Roster des 18 agents, matrice des permissions MCP, autonomies déléguées, et une fiche complète par agent |
| 4 | [Interactions entre agents](docs/04-interactions.md) | Protocole de communication, chaînes de commandement, conseils (councils), escalades |
| 5 | [Flux de données](docs/05-flux-de-donnees.md) | Cycle de vie d'une tâche, pipeline mémoire, ingestion analytics, publication, reporting |
| 6 | [Plan de développement](docs/06-plan-de-developpement.md) | Découpage en phases, livrables, critères de sortie |
| 7 | [Schémas canoniques](docs/07-schemas.md) | Formats uniques : tâche, rapport, réponse d'agent, message inter-agents, site, client, mémoire, décision |

## Principes non négociables

1. **Le CEO ne modifie jamais directement les sites.** Il décide, délègue, valide.
2. **Aucun agent n'agit en production sans validation du CEO**, sauf pour les
   autonomies explicitement déléguées (listées par agent).
3. **Chaque agent n'accède qu'aux MCP qui lui sont attribués** — appliqué
   techniquement par la passerelle MCP, pas seulement par le prompt.
4. **Un seul format de rapport** pour tous les agents, sans exception.
5. **Tout est tracé** : tâches, décisions, actions MCP, validations — historique complet.
6. **Le code est modulaire, SOLID, testable, documenté, maintenable, évolutif.**
