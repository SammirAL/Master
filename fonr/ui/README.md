# fonr / ui — bibliothèque visuelle

Deux livrables autonomes (HTML + CSS + SVG/JS inline, aucune dépendance externe),
partageant la même palette « govtech de précision » et les mêmes courbes de ressort.

| Fichier | Contenu | Usage |
|---|---|---|
| `schemas-animes.html` | 5 schémas animés : trajet d'une facture (PDP/PPF), e‑invoicing vs e‑reporting, Factur‑X, calendrier de la réforme, parcours en 3 étapes | Sections pédagogiques de la landing page, support de présentation |
| `interactions.html` | 6 micro‑interactions : sélecteur de formule, compteur de conformité, clé d'API, confirmation maintenue, ligne de facture dépliante, cycle de vie du statut | Composants d'interface du produit et de la page tarifs |

## Recoloration
Tout passe par les variables CSS de `:root` :
```css
--accent   /* bleu administratif — actions, liens, repères        */
--green    /* conformité, validé, encaissé                        */
--amber    /* e-reporting, attention                              */
--spring-soft / --spring-firm / --spring-snap   /* courbes de ressort */
```
Change ces valeurs → l'ensemble suit la charte. Thème clair/sombre géré
automatiquement (`prefers-color-scheme` + `data-theme`), focus clavier visible,
`prefers-reduced-motion` respecté.

## Origine & licence
Les interactions ont été **choisies d'après le catalogue** [`kinetics`](../vendor/kinetics)
(ckissi) puis **ré‑implémentées** à partir du principe physique (dépassement amorti
par courbes de Bézier). **Aucun code tiers n'est copié** dans ces deux fichiers :
ils sont donc librement utilisables dans fonr, y compris en production.

⚠️ Les dates du calendrier de la réforme dans `schemas-animes.html` sont
**indicatives** — à confirmer sur impots.gouv.fr avant publication.
