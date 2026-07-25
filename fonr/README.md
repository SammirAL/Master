# fonr

Espace de travail du projet **fonr** — plateforme de facturation électronique (France).

## Bibliothèque de mouvement — Kinetics

`fonr/vendor/kinetics/` est une **copie vendorée** de
[github.com/ckissi/kinetics](https://github.com/ckissi/kinetics) : une galerie de
**117 micro‑interactions en spring‑physics**, chacune fournie avec démo, lecture de
paramètres physiques, et code **CSS + React** prêt à copier.

C'est la **référence de mouvement** du projet : quand une animation / un toggle /
une micro‑interaction de qualité est demandé, on s'en inspire au lieu de réinventer.

Les fichiers sont **présents directement dans le repo** (pas de sous‑module) — donc
toujours disponibles, y compris dans un environnement cloud éphémère, sans étape
d'initialisation.

### Mettre à jour depuis l'upstream (optionnel)
```bash
git clone --depth 1 https://github.com/ckissi/kinetics.git /tmp/kinetics
rsync -a --delete --exclude=.git --exclude=.claude --exclude=.openai \
  /tmp/kinetics/ fonr/vendor/kinetics/
```

### Où trouver quoi
```
fonr/vendor/kinetics/
  public/css/   base · hero · gallery · effects-a/b/c · closing   ← styles des effets
  public/js/    main.js (interactions), physics-demo.js, search-index.js
  src/content/body.html                                            ← catalogue des 117 cartes
                                                                     (chaque effet + son CSS/React)
```
Pour lever un effet : ouvrir `src/content/body.html`, repérer la `.card` voulue,
copier le CSS (`public/css/effects-*.css` correspondant) et l'extrait React du
`.code-panel`. Adapter les couleurs à la charte fonr.

## ⚠️ Licence — à lire avant toute réutilisation en production
Le dépôt **kinetics n'a aucun fichier LICENSE** : par défaut, le code est « tous
droits réservés » de son auteur (ckissi). Le README amont présente les effets comme
« copier‑coller », mais **cela ne vaut pas licence de redistribution du dépôt entier**.

Conséquences pour fonr (produit potentiellement commercial) :
- Les fichiers sont ici **vendorés** à des fins de **référence de travail** dans ce
  repo privé, avec attribution explicite à l'auteur (voir `vendor/NOTICE.md`).
- ⚠️ **Ne pas embarquer un effet tel quel dans le produit livré / public** sans avoir
  demandé une clarification de licence à l'auteur, **ou** l'avoir ré‑implémenté à
  partir du principe physique (les ressorts/amortissements ne sont pas protégeables,
  seule l'écriture du code l'est). Je peux faire cette ré‑implémentation « propre »
  sur demande.

Attribution : *Kinetics © ckissi — https://github.com/ckissi/kinetics*.
