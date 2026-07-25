# fonr

Espace de travail du projet **fonr** — plateforme de facturation électronique (France).

## Bibliothèque de mouvement — Kinetics

`fonr/vendor/kinetics/` est un **sous‑module git** pointant vers
[github.com/ckissi/kinetics](https://github.com/ckissi/kinetics) : une galerie de
**117 micro‑interactions en spring‑physics**, chacune fournie avec démo, lecture de
paramètres physiques, et code **CSS + React** prêt à copier.

C'est la **référence de mouvement** du projet : quand une animation / un toggle /
une micro‑interaction de qualité est demandé, on s'en inspire au lieu de réinventer.

### Récupérer / mettre à jour le sous‑module
```bash
git submodule update --init --recursive        # après un clone
git -C fonr/vendor/kinetics pull origin main    # mise à jour vers l'upstream
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
- On l'utilise ici en **sous‑module (référence)** — on ne recopie pas son code dans
  notre historique sous notre propre licence.
- Avant d'**embarquer un effet dans le produit livré**, demander une clarification de
  licence à l'auteur, ou ré‑implémenter l'effet à partir du principe physique (les
  ressorts/amortissements ne sont pas protégeables, seule l'écriture l'est).

Attribution : *Kinetics © ckissi — https://github.com/ckissi/kinetics*.
