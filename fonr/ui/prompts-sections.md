# FONR — Bibliothèque de prompts d'animation

Prompts prêts à coller pour faire produire chaque section animée de la landing page.

**Cadrage commun à tous les prompts** — Astro / HTML+CSS natif (aucune dépendance) ·
registre sobre et précis façon Stripe · thème clair dominant · cible : dirigeants
de TPE/PME non techniques.

## Comment s'en servir

1. Collez **une fois** le bloc `SOCLE` ci-dessous en tête de conversation.
2. Collez ensuite le prompt de la section voulue.
3. Si vous utilisez un prompt seul, dans une nouvelle conversation : **collez le SOCLE avant**, sinon le résultat partira en générique.

Chaque prompt suit le même gabarit en 6 blocs — le dernier (**critères d'acceptation**) est
celui qui fait la différence entre un rendu correct et un rendu livrable.

---

## SOCLE (à coller une fois, avant tout prompt de section)

```
SOCLE TECHNIQUE ET VISUEL — SITE FONR

Projet : FONR, plateforme française de facturation électronique (conformité à la
réforme : e-invoicing, e-reporting, PDP, PPF, Factur-X).

Stack : Astro. HTML + CSS natif + JavaScript vanilla. AUCUNE bibliothèque
d'animation (pas de Framer Motion, pas de GSAP, pas de jQuery). Les animations
utilisent : transitions et keyframes CSS, IntersectionObserver, et si nécessaire
la Web Animations API.

Registre visuel : sobre et précis, façon Stripe. Les animations servent la
démonstration et la lisibilité, jamais la décoration. INTERDITS explicites :
particules d'arrière-plan, cartes inclinées en 3D au survol, glassmorphism,
halos lumineux appuyés, dégradés animés plein écran, effets de parallaxe lourds.
Raison : FONR vend de la conformité fiscale à des dirigeants de PME ; un rendu
« démo technologique » nuit à la confiance.

Thème : clair dominant. Prévoir malgré tout les variantes sombres via variables
CSS (prefers-color-scheme + :root[data-theme="dark"]).

Cible : dirigeant de TPE/PME, non technique, pressé, inquiet de l'échéance
réglementaire. Il doit comprendre sans jargon et être rassuré. Vocabulaire
réglementaire correct mais toujours explicité à la première occurrence.

Jetons de conception (à déclarer sur :root, jamais de couleur en dur) :
  --accent:#2f55e8     /* bleu administratif : actions, liens, repères */
  --green:#12a150      /* conformité, validé, encaissé */
  --amber:#cf7a00      /* attention, e-reporting */
  --ink:#0c1a2e        /* texte principal */
  --muted:#566178      /* texte secondaire */
  --paper:#f5f7fc      /* fond de page */
  --surface:#ffffff    /* fond de carte */
  --line:#d9e0ee       /* filets, bordures */
  --spring-firm:cubic-bezier(.22,1,.36,1)    /* net, sans rebond — par défaut */
  --spring-soft:cubic-bezier(.34,1.42,.64,1) /* léger dépassement — apparitions ponctuelles */
Typographie : sans-serif système pour le texte, police monospace pour tout ce qui
est technique (références de facture, montants, codes, formats).

Règles d'animation non négociables :
- Déclenchement au scroll par IntersectionObserver (seuil 0,2 à 0,3), UNE SEULE
  fois par section (pas de rejeu à chaque passage).
- Durées entre 300 et 600 ms. Écarts de cascade entre 80 et 130 ms.
- N'animer que transform et opacity. Jamais top/left/width/height (sauf
  grid-template-rows pour les dépliages).
- prefers-reduced-motion: reduce => aucun mouvement, tout est affiché à l'état
  final, aucun contenu masqué.
- Sans JavaScript, la section doit rester complète et lisible : le contenu n'est
  jamais masqué par défaut en CSS, c'est le JS qui ajoute la classe d'animation.
- Aucune information portée uniquement par l'animation.
- Zéro décalage de mise en page au déclenchement (CLS = 0) : la section réserve
  sa hauteur finale.
- Focus clavier visible sur tout élément interactif. Contraste texte >= 4,5:1.
- Mobile (< 720 px) : les dispositions horizontales passent en vertical.

Livrable attendu pour chaque section : un fichier autonome (HTML + CSS + JS
inline) que je peux déposer dans un composant Astro, avec le CSS scopé à la
section pour éviter toute collision.
```

---

## 1 · HERO

```
SECTION : Hero (première section de la page d'accueil).

CONTENU EXACT (mot pour mot)
Sur-titre : « Réforme de la facturation électronique »
Titre : « Vos factures deviennent électroniques. Vous, vous ne changez rien. »
Chapô : « FONR émet, reçoit et archive vos factures au format légal, depuis le
logiciel que vous utilisez déjà. Conformité assurée, sans nouveau logiciel à
apprendre. »
Bouton principal : « Vérifier ma conformité »
Bouton secondaire : « Parler à un expert »
Réassurance sous les boutons : « Sans engagement · Mise en route en 48 h ·
Hébergement en France »
Visuel produit à droite (ou dessous sur mobile) : une carte « facture » stylisée
portant la référence monospace « FA-2026-0148 », le montant « 1 248,00 € », et un
badge d'état qui passe de « Préparée » à « Transmise ».

INTENTION
En trois secondes, le visiteur doit retenir une seule chose : « je serai conforme
sans changer mes habitudes ». L'animation doit donc montrer une facture ordinaire
qui devient une facture légale — pas une prouesse graphique.

CHORÉGRAPHIE
Séquence au chargement (pas au scroll : c'est la première section) :
1. Sur-titre, titre, chapô, boutons, réassurance : opacité 0 -> 1 et
   translateY 14px -> 0, 500 ms, --spring-firm, 90 ms d'écart entre chaque.
2. La carte facture entre 200 ms après le titre : opacité 0 -> 1,
   translateY 24px -> 0 et scale .97 -> 1, 600 ms, --spring-firm.
3. Puis, en boucle lente (cycle de 6 s avec 2 s de pause) : à l'intérieur de la
   carte, une pastille « PDF » et une pastille « XML » convergent vers le centre
   et fusionnent en une pastille « Factur-X » (600 ms, --spring-soft) ; un badge
   coche verte (--green) apparaît en scale .6 -> 1 (320 ms) ; l'état passe de
   « Préparée » à « Transmise » par un croisement vertical des deux libellés
   (420 ms).
4. Survol du bouton principal : élévation translateY -2px + ombre plus marquée,
   200 ms. Aucun halo, aucun dégradé animé.

CONTRAINTES SPÉCIFIQUES
- Le titre porte text-wrap: balance et ne doit jamais casser en orphelin.
- La carte facture est en HTML/CSS (pas une image) pour rester nette et légère.
- La boucle de fusion PDF+XML s'arrête si prefers-reduced-motion : la carte
  affiche directement l'état final « Factur-X » + badge vert + « Transmise ».
- Aucune animation ne retarde la lisibilité du titre : il est lisible dès 500 ms.

CRITÈRES D'ACCEPTATION
- Le titre est lisible en moins de 600 ms après l'affichage.
- Sans JavaScript : titre, chapô, boutons et carte sont tous visibles.
- Avec reduced-motion : zéro mouvement, la carte est à l'état final.
- Aucun décalage de mise en page pendant la séquence.
- La carte reste lisible à 360 px de large (les pastilles se réorganisent).
- Contraste du texte blanc sur le bouton --accent >= 4,5:1.
```

---

## 2 · BARRE DE CONFIANCE (preuves de conformité)

```
SECTION : Bandeau de preuves, immédiatement sous le hero.

CONTENU EXACT
Ligne d'introduction : « Une plateforme conforme aux exigences de la réforme »
Badges (5, dans cet ordre) :
  « Format Factur-X » / « Norme EN 16931 » / « Archivage 10 ans »
  « Hébergement en France » / « Conforme RGPD »
Sous les badges, une bande de logos clients (à remplacer par les vrais logos ;
prévoir 8 emplacements de 120 x 40 px).

INTENTION
Lever le doute avant même que le visiteur ne se pose la question. Les badges
doivent avoir l'air de sceaux vérifiés, pas de décorations.

CHORÉGRAPHIE
1. Au scroll (seuil 0,3) : les 5 badges apparaissent en cascade, opacité 0 -> 1
   et scale .92 -> 1, 380 ms chacun, --spring-soft, 110 ms d'écart.
2. Dans chaque badge, une petite coche (--green) se trace après l'apparition du
   badge : animation de stroke-dashoffset sur un SVG, 260 ms, --spring-firm.
3. La bande de logos défile horizontalement en continu, très lentement
   (40 s pour un cycle complet), en boucle sans couture (duplication de la
   liste), en niveaux de gris à 60 % d'opacité. Au survol de la bande, le
   défilement s'arrête et les logos repassent en couleur (300 ms).
4. Aucun autre effet.

CONTRAINTES SPÉCIFIQUES
- Le défilement des logos utilise transform: translateX sur un conteneur
  dupliqué, jamais une animation de position.
- Le défilement se met en pause avec prefers-reduced-motion ET au survol
  (accessibilité : le visiteur doit pouvoir lire un logo).
- Les logos ont un attribut alt renseigné (nom de l'entreprise).
- Les badges sont des éléments de texte, pas des images : ils doivent être
  indexables par les moteurs de recherche.

CRITÈRES D'ACCEPTATION
- Le défilement ne provoque aucune barre de défilement horizontale sur la page.
- Avec reduced-motion : logos immobiles, badges à l'état final coche affichée.
- La bande de logos reste lisible sur mobile (afficher 3 logos à la fois).
- Aucun scintillement à la jointure de la boucle de défilement.
```

---

## 3 · PROBLÈME → SOLUTION

```
SECTION : Le changement qu'impose la réforme, en avant / après.

CONTENU EXACT
Sur-titre : « Ce qui change »
Titre : « Bientôt, un PDF envoyé par e-mail ne sera plus une facture »
Chapô : « La loi impose des factures structurées, transmises par une plateforme
agréée. Voici concrètement ce que cela remplace. »
Colonne gauche, titre : « Aujourd'hui »
  « PDF joint à un e-mail »
  « Ressaisie manuelle chez votre client »
  « Aucun suivi : vous rappelez pour savoir »
  « Risque de rejet et de retard de paiement »
Colonne droite, titre : « Avec FONR »
  « Facture structurée au format légal »
  « Intégration automatique chez votre client »
  « Statut suivi à chaque étape »
  « Paiement plus rapide, litiges évités »
Phrase de clôture : « Le passage se fait une fois. Ensuite, c'est automatique. »

INTENTION
Créer une prise de conscience sans faire peur. La colonne « Aujourd'hui » doit
sembler périmée, pas honteuse. La colonne « Avec FONR » doit sembler évidente.

CHORÉGRAPHIE
1. Au scroll : le titre et le chapô apparaissent (opacité + translateY 12px,
   480 ms, --spring-firm, 80 ms d'écart).
2. La colonne « Aujourd'hui » apparaît d'abord (400 ms), suivie 200 ms plus tard
   de la colonne « Avec FONR ». Les items de chaque colonne montent en cascade
   de 90 ms.
3. Effet de dévaluation sur la colonne gauche, joué une fois, après sa dernière
   ligne : passage en saturation 0 et opacité .6 en 500 ms, et une fine barre
   diagonale (--muted, 1,5 px) se trace sur l'icône PDF (stroke-dashoffset,
   400 ms). La colonne reste parfaitement lisible.
4. Simultanément, la colonne droite gagne une bordure --accent de 1,5 px qui se
   trace du haut vers le bas (600 ms) et chaque item reçoit sa coche --green en
   cascade (240 ms chacune, 80 ms d'écart).
5. Phrase de clôture en dernier, fondu 400 ms.

CONTRAINTES SPÉCIFIQUES
- Ne jamais réduire le contraste de la colonne gauche sous 4,5:1, même
  « dévaluée ».
- Sur mobile, les deux colonnes s'empilent : « Aujourd'hui » puis « Avec FONR »,
  avec un séparateur portant une flèche vers le bas.
- La barre diagonale et les coches sont décoratives : aria-hidden="true".

CRITÈRES D'ACCEPTATION
- Les deux colonnes sont intégralement lisibles sans JavaScript.
- Avec reduced-motion : colonne gauche à saturation réduite mais sans animation,
  coches déjà affichées.
- La séquence complète tient sous 2,5 s.
- Aucune perte d'information dans la colonne dévaluée (pas de texte masqué).
```

---

## 4 · CALENDRIER DE LA RÉFORME

```
SECTION : La frise des échéances, avec compte à rebours.

CONTENU EXACT
Sur-titre : « Le calendrier »
Titre : « Ce que la réforme impose, et à quelle date »
Chapô : « Toutes les entreprises devront d'abord pouvoir recevoir des factures
électroniques. L'obligation d'en émettre arrive ensuite, par vagues. »
Jalon 1 — Titre « Recevoir des factures électroniques » /
  Détail « Obligatoire pour toutes les entreprises » / Repère « 2026 »
Jalon 2 — Titre « Émettre des factures électroniques » /
  Détail « Grandes entreprises et ETI » / Repère « 2026 »
Jalon 3 — Titre « Émettre des factures électroniques » /
  Détail « PME et TPE » / Repère « 2027 »
Bloc compte à rebours : « Il vous reste » + nombre de jours + « pour être prêt »
Mention obligatoire sous la frise, en petit : « Dates indicatives. Le calendrier
officiel a déjà été modifié : vérifiez les échéances en vigueur sur
impots.gouv.fr. »
Bouton : « Vérifier ma situation »

INTENTION
Créer une urgence honnête. Le visiteur doit repérer SA vague (« PME et TPE ») et
comprendre qu'il a une date. Le compte à rebours matérialise le temps qui reste.

CHORÉGRAPHIE
1. Au scroll : titre et chapô (opacité + translateY, 480 ms, 80 ms d'écart).
2. La ligne de temps se trace de gauche à droite en 900 ms
   (stroke-dashoffset sur un SVG ou scaleX sur un filet de 2 px). Portion
   parcourue en --accent, reste en --line.
3. Chaque jalon apparaît quand le tracé atteint sa position : le point du jalon
   passe de scale .2 à 1,15 puis 1 (380 ms, --spring-soft), la carte du jalon
   monte (opacité 0 -> 1, translateY 14px -> 0, 420 ms). Le troisième point est
   en --green (c'est la vague du visiteur cible).
4. Le compte à rebours démarre après le dernier jalon : le nombre de jours
   s'anime de 0 à sa valeur en 1 200 ms avec décélération cubique
   (1 - (1-t)^3), chiffres en monospace et font-variant-numeric: tabular-nums.
5. Le jalon « PME et TPE » reste discrètement mis en avant : bordure --green de
   1,5 px, sans clignotement ni pulsation continue.

CONTRAINTES SPÉCIFIQUES
- Le nombre de jours est calculé en JS depuis une date cible en constante en
  haut du script, commentée et facile à modifier.
- La mention « dates indicatives » n'est jamais animée ni masquée : elle est
  visible immédiatement.
- Sur mobile, la frise devient verticale et se trace de haut en bas.
- Le compte à rebours a aria-live="off" (il ne doit pas être annoncé en boucle).

CRITÈRES D'ACCEPTATION
- Sans JavaScript : les trois jalons et la mention légale sont visibles ; le
  compte à rebours affiche un texte de repli sans nombre.
- Avec reduced-motion : frise tracée, jalons visibles, nombre affiché
  directement à sa valeur finale.
- Les chiffres du compte à rebours ne provoquent aucun décalage de largeur
  pendant le décompte (tabular-nums obligatoire).
- La vague « PME et TPE » est identifiable en moins de 2 secondes.
```

---

## 5 · LE TRAJET DE LA FACTURE

```
SECTION : Schéma pédagogique du flux, de l'émetteur au client.

CONTENU EXACT
Sur-titre : « Comment circule une facture »
Titre : « De votre logiciel à votre client, en quelques secondes »
Chapô : « La loi impose de passer par une plateforme agréée, appelée PDP. FONR
est cette plateforme : elle transmet votre facture, la route vers le bon
destinataire, et vous rend compte de chaque étape. »
Nœuds du flux (5, de gauche à droite) :
  « Votre logiciel » / sous-titre « votre facture, comme d'habitude »
  « FONR » / sous-titre « plateforme agréée (PDP) »
  « Annuaire officiel » / sous-titre « identification du destinataire »
  « Plateforme du client » / sous-titre « réception »
  « Votre client » / sous-titre « facture intégrée »
Bande de statuts sous le flux (4, en monospace) :
  « Déposée » / « Reçue » / « Approuvée » / « Encaissée »
Phrase de clôture : « Vous suivez chaque étape depuis votre tableau de bord. Si
une facture est rejetée, vous le savez immédiatement. »

INTENTION
Démystifier le circuit réglementaire. Le visiteur doit voir que sa facture part
de son outil habituel et arrive chez son client, et que FONR gère le passage
obligé. Le mouvement raconte le trajet — c'est le seul endroit de la page où
l'animation est vraiment porteuse d'information.

CHORÉGRAPHIE
1. Au scroll : titre et chapô en cascade (480 ms, 80 ms d'écart).
2. Le trait reliant les 5 nœuds se trace de gauche à droite, 1 000 ms.
3. Chaque nœud apparaît à l'arrivée du trait : opacité 0 -> 1, translateY 12px
   -> 0, scale .96 -> 1, 400 ms, --spring-firm.
4. Puis, en boucle (cycle 5,5 s dont 1,5 s de pause) : un jeton « facture »
   (rectangle 22 x 28 px, bordure --accent, trois filets internes évoquant du
   texte) parcourt le trait du nœud 1 au nœud 5 en 3,2 s, en mouvement linéaire
   régulier. Utiliser offset-path sur le tracé, avec repli en translateX si
   offset-path n'est pas supporté.
5. Au passage du jeton sur chaque nœud, un anneau fin apparaît autour du nœud
   (scale 1 -> 1,25, opacité 1 -> 0, 600 ms) : une impulsion discrète, pas un
   halo permanent.
6. La bande de statuts s'allume en cascade, synchronisée avec la position du
   jeton : chaque pastille passe d'opacité .3 à 1 avec sa coche --green
   (300 ms). Le dernier statut « Encaissée » est en --green plein.
7. Phrase de clôture en fondu à la fin du premier cycle.

CONTRAINTES SPÉCIFIQUES
- Le jeton doit suivre exactement le trait après un redimensionnement de la
  fenêtre : recalculer le tracé sur resize (avec debounce de 150 ms).
- Le schéma est en SVG inline (pas d'image) pour rester net et accessible :
  role="img" et aria-label décrivant le flux en une phrase.
- Sur mobile, le flux passe en vertical et le jeton descend.
- Le mot « PDP » est expliqué à sa première occurrence dans le chapô — ne jamais
  l'utiliser seul sans glose.

CRITÈRES D'ACCEPTATION
- Sans JavaScript : les 5 nœuds, le trait et les 4 statuts sont visibles et
  ordonnés.
- Avec reduced-motion : le jeton est immobile au niveau du nœud FONR, tous les
  statuts sont allumés.
- Le cycle du jeton ne consomme pas plus de 2 % de CPU au repos (animation
  composée uniquement de transform).
- L'aria-label décrit le trajet complet pour un lecteur d'écran.
- Aucun anneau ne reste affiché en permanence.
```

---

## 6 · FONCTIONNALITÉS

```
SECTION : Grille de ce que fait FONR.

CONTENU EXACT
Sur-titre : « Ce que FONR fait pour vous »
Titre : « Tout ce que la réforme exige, en une seule plateforme »
Six cartes, titre puis description :
1. « Émettre » — « Vos factures partent au format légal, vers la plateforme de
   votre client, sans que vous changiez d'outil. »
2. « Recevoir » — « Les factures de vos fournisseurs arrivent structurées et
   prêtes à être intégrées à votre comptabilité. »
3. « Déclarer » — « Vos ventes aux particuliers et à l'international sont
   transmises à l'administration automatiquement (e-reporting). »
4. « Archiver » — « Dix ans de conservation à valeur probante, sans que vous
   ayez à y penser. »
5. « Contrôler » — « Les mentions obligatoires sont vérifiées avant l'envoi :
   plus de facture rejetée pour un champ manquant. »
6. « Suivre » — « Chaque facture a un statut, de l'envoi à l'encaissement. »

INTENTION
Couvrir l'exhaustivité réglementaire sans assommer. Chaque carte doit se lire en
cinq secondes. La carte « Déclarer » est un différenciateur : beaucoup de
concurrents oublient l'e-reporting, elle mérite un traitement légèrement
distinct (bordure --amber).

CHORÉGRAPHIE
1. Au scroll : titre et sur-titre en cascade (440 ms).
2. Les six cartes apparaissent en cascade selon leur ordre de lecture (gauche à
   droite, ligne par ligne) : opacité 0 -> 1, translateY 16px -> 0, 420 ms,
   --spring-firm, 100 ms d'écart. La cascade suit l'ordre du DOM, pas un ordre
   aléatoire.
3. Chaque carte porte une icône linéaire (stroke 2 px, currentColor). Au survol
   de la carte : élévation translateY -3px, ombre plus marquée, bordure qui
   passe à --accent, 220 ms ; et l'icône seule joue une micro-animation propre à
   son sens, sur 320 ms, une seule fois par survol :
     Émettre  -> la flèche glisse de 3 px vers la droite
     Recevoir -> la flèche glisse de 3 px vers le bas
     Déclarer -> les deux traits divergent légèrement
     Archiver -> le couvercle du coffre s'abaisse de 2 px
     Contrôler-> la coche se trace
     Suivre   -> le point progresse le long de sa ligne
4. Aucun effet de survol sur mobile (pointer: coarse) : les micro-animations
   d'icônes sont jouées une fois à l'apparition de la carte à la place.

CONTRAINTES SPÉCIFIQUES
- Grille en CSS Grid auto-fit, minimum 280 px par carte, gap 20 px.
- La carte « Déclarer » a une bordure gauche --amber de 3 px et un petit
  libellé « souvent oublié » en monospace 10,5 px.
- Les icônes sont du SVG inline, aria-hidden="true".
- Hauteur des cartes égalisée par la grille, pas par une hauteur fixe.

CRITÈRES D'ACCEPTATION
- Les six cartes sont lisibles sans JavaScript et sans survol.
- Avec reduced-motion : cartes affichées, aucune micro-animation d'icône.
- Aucun décalage de grille pendant la cascade.
- Le survol ne modifie jamais la taille de la carte (uniquement translateY et
  l'ombre), pour éviter les sauts de mise en page.
```

---

## 7 · SÉCURITÉ ET ARCHIVAGE

```
SECTION : Rassurer sur la conservation et la sécurité des données.

CONTENU EXACT
Sur-titre : « Sécurité et conservation »
Titre : « Vos factures sont protégées, et le resteront dix ans »
Chapô : « L'archivage à valeur probante est une obligation légale. FONR s'en
charge, sur des serveurs situés en France. »
Quatre garanties, titre puis détail :
  « Hébergement en France » — « Vos données ne quittent pas le territoire. »
  « Chiffrement de bout en bout » — « En transit et au repos. »
  « Valeur probante » — « Archivage conforme au règlement eIDAS, opposable en
  cas de contrôle. »
  « Journal d'audit » — « Chaque action est horodatée et traçable. »
Bloc de droite : une frise « 10 ans » représentant la durée de conservation,
graduée par années (année 1 à année 10).
Phrase de clôture : « En cas de contrôle fiscal, vos factures sont retrouvables
en quelques secondes. »

INTENTION
C'est la section qui lève la dernière objection avant l'achat. Ton factuel,
aucun superlatif. Le visuel doit évoquer la durée et le scellement, pas la
« cybersécurité » spectaculaire.

CHORÉGRAPHIE
1. Au scroll : titre et chapô (480 ms, 80 ms d'écart).
2. Les quatre garanties apparaissent en cascade verticale (400 ms, 100 ms
   d'écart), chacune avec sa coche --green tracée après son texte (240 ms).
3. La frise « 10 ans » se remplit de gauche à droite en 1 400 ms
   (--spring-firm), avec les graduations d'années qui s'allument une par une
   (10 graduations, 120 ms d'écart). Le remplissage va de --accent à --green.
4. À la fin du remplissage, un petit sceau apparaît en bout de frise :
   scale .5 -> 1 avec léger dépassement (--spring-soft, 360 ms), puis reste
   fixe. Aucune pulsation.
5. Phrase de clôture en fondu.

CONTRAINTES SPÉCIFIQUES
- Aucun visuel de cadenas générique ni d'imagerie « hacker ».
- La frise est en HTML/CSS (barre + graduations), pas une image.
- Les termes « valeur probante » et « eIDAS » sont expliqués en une demi-phrase
  dans leur détail : ne jamais les laisser nus.

CRITÈRES D'ACCEPTATION
- Les quatre garanties sont lisibles sans JavaScript.
- Avec reduced-motion : frise pleine, sceau affiché, coches affichées.
- La frise reste lisible à 360 px (les graduations se réduisent sans se
  chevaucher).
- Aucun élément ne clignote ni ne pulse en continu.
```

---

## 8 · TARIFS

```
SECTION : Tarification et estimation du coût.

CONTENU EXACT
Sur-titre : « Tarifs »
Titre : « Aucun frais d'activation. Vous payez ce que vous envoyez. »
Chapô : « Pas d'abonnement imposé, pas d'engagement de durée. Estimez votre coût
en déplaçant le curseur. »
Sélecteur (3 onglets) : « À l'usage » / « Forfait » / « Sur mesure »
Estimateur : libellé « Nombre de factures par mois », curseur de 0 à 2 000,
valeur par défaut 150. Résultat affiché : un montant mensuel estimé en euros, en
monospace.
Sous le montant : « Estimation indicative, hors options. »
Trois arguments sous l'estimateur :
  « Réception incluse, sans supplément »
  « Archivage 10 ans inclus »
  « Assistance à la mise en route incluse »
Bouton : « Créer mon compte »
Mention finale : « Tarifs indicatifs à confirmer selon votre volume réel. »

INTENTION
Lever l'angoisse du prix chez un dirigeant de TPE. L'estimateur transforme une
question anxieuse (« combien ça va me coûter ? ») en manipulation rassurante.

CHORÉGRAPHIE
1. Au scroll : titre, chapô, sélecteur (460 ms, 90 ms d'écart).
2. Le sélecteur d'onglets fonctionne par un repère (pastille pleine --accent) qui
   glisse sous l'onglet actif : transition de transform et width sur 480 ms,
   --spring-soft. La couleur du libellé actif passe au blanc en 300 ms.
3. L'estimateur apparaît ensuite (420 ms). À chaque déplacement du curseur, le
   montant se met à jour avec une interpolation courte de 280 ms (décélération
   cubique), en tabular-nums, sans jamais changer de largeur.
4. Les trois arguments montent en cascade (380 ms, 100 ms d'écart) avec leur
   coche --green.
5. Survol du bouton : élévation -2px + ombre, 200 ms.

CONTRAINTES SPÉCIFIQUES
- Le curseur est un <input type="range"> natif, restylé, avec aria-label et
  affichage textuel de la valeur (accessibilité clavier obligatoire).
- La formule de calcul est isolée dans une fonction commentée en haut du script,
  avec les paliers de prix en constantes faciles à modifier.
- Le montant est arrondi à l'euro et formaté en français
  (Intl.NumberFormat('fr-FR')).
- Les mentions « indicatives » sont toujours visibles, jamais animées.
- Le changement d'onglet ne provoque aucun saut de hauteur de la section
  (réserver la hauteur du contenu le plus grand).

CRITÈRES D'ACCEPTATION
- Le curseur est utilisable au clavier (flèches) et annonce sa valeur.
- Sans JavaScript : les trois onglets et les arguments sont visibles,
  l'estimateur affiche un texte de repli invitant à nous contacter.
- Avec reduced-motion : le repère du sélecteur se déplace sans transition, le
  montant change instantanément.
- Aucun décalage de largeur du montant pendant l'interpolation.
```

---

## 9 · FAQ ET APPEL À L'ACTION FINAL

```
SECTION : Questions fréquentes, puis dernière incitation.

CONTENU EXACT — FAQ
Sur-titre : « Questions fréquentes »
Titre : « Ce que les dirigeants nous demandent le plus »
Question 1 : « Dois-je changer de logiciel de facturation ? »
Réponse 1 : « Non. FONR se connecte à votre outil actuel. Vous continuez à créer
vos factures comme aujourd'hui ; nous nous occupons du format légal et de la
transmission. »
Question 2 : « Qu'est-ce qu'une PDP, et pourquoi en ai-je besoin ? »
Réponse 2 : « Une PDP est une plateforme agréée par l'administration pour
transmettre les factures électroniques. Le portail public ne permet plus de le
faire directement : passer par une PDP est donc obligatoire. FONR en est une. »
Question 3 : « Et mes ventes aux particuliers ? »
Réponse 3 : « Elles ne sont pas concernées par la facture électronique, mais par
l'e-reporting : les données de la transaction doivent être transmises à
l'administration. FONR le fait automatiquement. »
Question 4 : « Que se passe-t-il si je ne fais rien ? »
Réponse 4 : « À l'échéance, vous ne pourrez plus recevoir les factures de vos
fournisseurs ni facturer vos clients professionnels en conformité, avec un
risque de sanction. Se préparer prend quelques jours ; attendre coûte plus cher. »
Question 5 : « Combien de temps prend la mise en route ? »
Réponse 5 : « 48 heures dans la majorité des cas. Nous nous occupons du
raccordement, vous validez. »

CONTENU EXACT — CTA FINAL
Titre : « Vérifiez votre conformité en deux minutes »
Chapô : « Cinq questions sur votre activité, et vous saurez exactement ce qu'il
vous reste à faire. »
Bouton principal : « Lancer le diagnostic »
Bouton secondaire : « Être rappelé »
Réassurance : « Gratuit · Sans engagement · Résultat immédiat »

INTENTION
La FAQ traite les objections restantes, en particulier la peur du changement
d'outil (objection numéro un chez les TPE). Le CTA final propose une action à
coût nul plutôt qu'un achat.

CHORÉGRAPHIE
1. FAQ : les cinq lignes apparaissent en cascade au scroll (380 ms, 90 ms
   d'écart). Toutes fermées au départ, sauf la première qui est ouverte.
2. Ouverture d'une ligne : la réponse se déplie par transition de
   grid-template-rows de 0fr à 1fr sur 460 ms, --spring-firm ; le chevron
   pivote de 180 degrés sur 420 ms, --spring-soft. Une seule ligne ouverte à la
   fois (comportement accordéon) : la précédente se referme en parallèle.
3. CTA final : la carte entière apparaît (opacité + translateY 20px, 520 ms).
   Le bouton principal reçoit un survol en élévation -2px + ombre (200 ms).
   Pas de halo, pas de dégradé animé, pas de pulsation d'appel.

CONTRAINTES SPÉCIFIQUES
- L'accordéon est construit avec des <button aria-expanded> pilotant des régions,
  navigable au clavier (Entrée et Espace), et non avec <details> restylé si la
  transition de hauteur doit être fluide.
- La hauteur des réponses n'est jamais fixée en dur : uniquement
  grid-template-rows.
- Les réponses sont dans le DOM au chargement (indexables par les moteurs de
  recherche), simplement masquées par la grille.
- Le CTA final ne comporte aucun compte à rebours artificiel ni mention de
  rareté fabriquée.

CRITÈRES D'ACCEPTATION
- Sans JavaScript : les cinq questions ET leurs réponses sont toutes visibles.
- Avec reduced-motion : ouverture et fermeture instantanées, chevron sans
  rotation animée.
- Navigation clavier complète : Tab entre les questions, Entrée/Espace pour
  ouvrir, focus visible.
- Aucune réponse tronquée ni coupée à l'ouverture, quelle que sa longueur.
- Le texte des réponses est sélectionnable et copiable.
```

---

## Rappels de contenu (à vérifier avant publication)

- **Les dates du calendrier** (2026 / 2027) ont déjà été décalées plusieurs fois par
  l'administration. Vérifiez les échéances en vigueur sur **impots.gouv.fr / DGFiP**
  avant toute mise en ligne, et gardez la mention « dates indicatives ».
- **Le statut PDP de FONR** doit être annoncé exactement pour ce qu'il est
  (immatriculée / en cours d'immatriculation / partenaire d'une PDP). C'est la
  première question que se posera un acheteur informé, et une approximation ici
  est un risque commercial et juridique.
- **Les tarifs** de la section 8 sont des exemples de structure : remplacez les
  paliers par les vôtres avant publication.
- **Les logos clients** de la section 2 ne doivent être affichés qu'avec l'accord
  des clients concernés.

## Section déjà cadrée

Le **Parcours en 3 étapes** a son prompt complet dans l'historique de conversation
(version recalibrée : le trait qui se dessine pilote l'apparition des cartes, et un
jeton « facture » remplace les particules abstraites).
