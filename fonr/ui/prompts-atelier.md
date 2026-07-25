# FONR — Prompts d'animation : sections métier atelier / SAV

Complément à `prompts-sections.md`. Ces sections couvrent le **cœur de l'application** :
prise en charge, notifications automatiques, suivi client, gestion d'atelier.

> ⚠️ **Hypothèses à corriger avant usage.** Je n'ai pas pu accéder à fonr.pro (bloqué
> par le réseau). Le vocabulaire ci-dessous (« appareil », « panne constatée »,
> « Prêt à récupérer »…) est celui d'un atelier de réparation générique. Remplacez-le
> par vos intitulés réels — surtout si votre métier est l'automobile (« véhicule »),
> l'électroménager (« machine ») ou l'informatique (« matériel »).

Utilisez le bloc **SOCLE** de `prompts-sections.md` avant chaque prompt, en y ajoutant
cette précision :

```
CORRECTIF DE PRODUIT : FONR n'est pas une plateforme de facturation, c'est une
application de gestion d'atelier / SAV. Le cœur métier est : prise en charge d'un
appareil, diagnostic, suivi de réparation, notifications automatiques au client
(SMS et e-mail), restitution, puis facturation. La facturation électronique est
un module, pas le produit.

CORRECTIF D'ÉCHELLE : interface dense, pas de vitrine. Corps de texte à 14 px,
titres de section à 28 px maximum, libellés de carte à 12,5 px, légendes à 11 px.
Cartes à 236 px minimum en grille auto-fill. Hauteur de scène de démonstration
124 px. Ne jamais dépasser ces tailles : le rendu doit paraître professionnel et
compact, jamais agrandi.
```

---

## A · LA PRISE EN CHARGE

```
SECTION : Comment se fait une prise en charge (le geste fondateur du métier).

CONTENU EXACT
Sur-titre : « La prise en charge »
Titre : « Un appareil déposé, une fiche complète en moins d'une minute »
Chapô : « Vous saisissez le client, l'appareil et la panne constatée. FONR
attribue un numéro de suivi, envoie l'accusé au client, et la réparation commence. »
Étape 1 — « Le client » / « Nouveau ou déjà connu : la fiche se remplit
automatiquement à partir du numéro de téléphone. »
Étape 2 — « L'appareil » / « Marque, modèle, numéro de série, accessoires
laissés, état constaté à l'arrivée. »
Étape 3 — « La panne » / « Ce que dit le client, ce que vous constatez, et un
devis estimatif si vous en donnez un. »
Encadré de sortie, titre « Ce que FONR fait aussitôt » avec trois lignes :
  « Attribue un numéro de suivi unique »
  « Envoie l'accusé de dépôt au client par SMS et e-mail »
  « Crée la fiche dans le tableau de bord de l'atelier »
Phrase de clôture : « Aucune double saisie : la fiche suit l'appareil jusqu'à la
facture. »

INTENTION
Montrer que le moment le plus pénible du métier (la paperasse au comptoir) devient
rapide et sans oubli. Le visiteur doit voir une fiche se remplir, pas lire une
liste de champs.

CHORÉGRAPHIE
1. Au scroll : sur-titre, titre, chapô (460 ms, 80 ms d'écart).
2. À droite (ou dessous sur mobile), une maquette de fiche compacte
   (largeur maximale 320 px) apparaît (420 ms).
3. Puis une séquence en boucle de 3 étapes, cycle total 4,5 s avec 1,5 s de pause :
   - Un indicateur d'étape en trois pastilles numérotées reliées par un filet de
     1,5 px. La pastille active passe en --accent (scale 1 -> 1,1, 380 ms) ;
     les pastilles franchies passent en --green avec une coche.
   - Le segment de filet entre deux pastilles se remplit par scaleX 0 -> 1
     (500 ms, --spring-firm) au passage à l'étape suivante.
   - À chaque étape, deux à trois lignes de champ apparaissent dans la fiche
     (barres grises de 9 px de haut, largeurs variées) : opacité 0 -> 1 et
     translateY 5px -> 0, 340 ms, 90 ms d'écart. Les champs des étapes
     précédentes restent visibles : la fiche se remplit, elle ne se réinitialise pas.
   - Le libellé de l'étape en cours s'affiche en monospace 9,5 px au-dessus des champs.
4. À la fin de l'étape 3, l'encadré « Ce que FONR fait aussitôt » apparaît et ses
   trois lignes montent en cascade (320 ms, 90 ms d'écart), chacune avec sa coche
   --green tracée.
5. Le numéro de suivi (format monospace, exemple « A7K2-9X ») apparaît en dernier :
   scale .8 -> 1, 320 ms, --spring-soft.

CONTRAINTES SPÉCIFIQUES
- Les champs de la fiche sont des barres grises, PAS de faux texte illisible :
  on suggère le remplissage, on ne simule pas un formulaire réel.
- La maquette de fiche ne dépasse jamais 320 px de large : c'est un aperçu, pas
  une capture d'écran pleine taille.
- Le mot « appareil » doit être remplaçable en une variable : le métier peut être
  téléphonie, informatique, électroménager ou automobile.
- Sur mobile, l'indicateur d'étapes reste horizontal (il est compact) mais la
  maquette passe sous le texte.

CRITÈRES D'ACCEPTATION
- Les trois étapes et l'encadré de sortie sont lisibles sans JavaScript.
- Avec reduced-motion : fiche affichée remplie, étape 3 active, encadré visible,
  numéro de suivi affiché.
- Le cycle ne dépasse pas 4,5 s : le visiteur voit une boucle complète sans attendre.
- Aucune hauteur de la section ne change entre les étapes (réserver la hauteur
  de la fiche pleine).
- La grille et la typographie respectent le correctif d'échelle du SOCLE.
```

---

## B · NOTIFICATIONS AUTOMATIQUES (SMS + E-MAIL)

```
SECTION : Les messages envoyés au client, sans intervention.

CONTENU EXACT
Sur-titre : « Notifications automatiques »
Titre : « Vos clients sont prévenus, vous n'appelez plus personne »
Chapô : « À chaque changement de statut, FONR envoie le message au client par SMS
et par e-mail. Vous choisissez les moments et le texte ; le reste est automatique. »
Liste des déclencheurs (4, avec le message associé entre guillemets) :
  « À la prise en charge » — « Votre appareil est bien arrivé. Suivi : fonr.pro/suivi/A7K2-9X »
  « Devis à valider » — « Un devis de 89 € attend votre accord. Répondez OUI pour lancer la réparation. »
  « Réparation terminée » — « Votre appareil est prêt. Vous pouvez venir le récupérer. »
  « Rappel de retrait » — « Votre appareil vous attend depuis 7 jours. »
Bloc de droite : deux notifications empilées, l'une avec une icône de bulle
(« SMS envoyé » + « 06 12 34 56 78 »), l'autre avec une icône d'enveloppe
(« E-mail envoyé » + « client@exemple.fr »).
Trois arguments sous la liste :
  « Modèles de message personnalisables, avec votre nom d'atelier »
  « Réponse du client par SMS pour valider un devis »
  « Historique complet des envois, conservé sur la fiche »
Phrase de clôture : « Moins d'appels entrants, moins d'appareils oubliés en
atelier. »

INTENTION
C'est un argument de gain de temps mesurable : le patron d'atelier passe ses
journées au téléphone. L'animation doit faire ressentir « ça part tout seul ».

CHORÉGRAPHIE
1. Au scroll : titre et chapô (460 ms, 80 ms d'écart).
2. Les quatre déclencheurs apparaissent en cascade verticale (360 ms, 100 ms
   d'écart), chacun avec sa puce en --accent.
3. Séquence en boucle, cycle 5 s avec 1,5 s de pause :
   - Le déclencheur actif de la liste reçoit une bordure gauche --accent de
     2,5 px (transition 280 ms) ; les autres restent neutres.
   - La notification SMS glisse depuis le bas : opacité 0 -> 1,
     translateY 14px -> 0 et scale .97 -> 1, 460 ms, --spring-soft.
   - 520 ms plus tard, la notification e-mail apparaît de la même façon, décalée
     de 46 px vers le bas.
   - Les deux notifications restent 1,8 s puis disparaissent par fondu (280 ms)
     avant que le déclencheur suivant ne devienne actif.
   - Cycler sur les quatre déclencheurs.
4. Les trois arguments montent en cascade une seule fois, avec coche --green.

CONTRAINTES SPÉCIFIQUES
- Les notifications sont des éléments en position absolue dans un conteneur de
  hauteur fixe (88 px) : elles ne doivent JAMAIS pousser le contenu voisin.
- Le numéro de téléphone et l'e-mail sont des exemples manifestement fictifs.
- La bordure gauche des notifications : --green pour le SMS, --accent pour
  l'e-mail (deux canaux distincts au premier regard).
- Aucun son, aucune vibration, aucun badge clignotant.

CRITÈRES D'ACCEPTATION
- Les quatre déclencheurs et leurs messages sont lisibles sans JavaScript.
- Avec reduced-motion : les deux notifications sont affichées, premier
  déclencheur actif, aucune boucle.
- Aucun décalage de mise en page pendant l'apparition des notifications.
- La liste reste lisible à 360 px (les messages passent sous leur intitulé).
```

---

## C · SUIVI DE RÉPARATION (côté client)

```
SECTION : La page de suivi que le client consulte lui-même.

CONTENU EXACT
Sur-titre : « Suivi de réparation »
Titre : « Votre client suit sa réparation, sans vous appeler »
Chapô : « Chaque prise en charge génère un lien de suivi. Le client l'ouvre depuis
son SMS, voit où en est son appareil, et retrouve son devis. Sans compte à créer,
sans application à installer. »
Statuts affichés (4, avec horodatage) :
  « Reçu à l'atelier » — 09:12
  « Diagnostic établi » — 10:40
  « En réparation » — 11:05
  « Prêt à récupérer » — 15:28
Bloc lien de suivi : champ monospace « fonr.pro/suivi/A7K2-9X » + bouton
« Copier ».
Trois arguments :
  « Lien unique par réparation, valable jusqu'au retrait »
  « Devis consultable et validable en ligne »
  « Horaires et adresse de l'atelier rappelés sur la page »
Phrase de clôture : « Un client informé rappelle moins et récupère plus vite. »

INTENTION
Montrer que le suivi client est un service, pas un gadget : il réduit les appels
et accélère les retraits. La démonstration doit ressembler à ce que le client
voit sur son téléphone.

CHORÉGRAPHIE
1. Au scroll : titre et chapô (460 ms).
2. La maquette de suivi apparaît (420 ms) — largeur maximale 300 px, cadre
   évoquant un écran de téléphone SANS dessiner un téléphone entier (juste un
   cadre arrondi et une barre de titre discrète).
3. Les quatre statuts s'allument en cascade : chacun passe d'opacité .32 à 1 et
   translateX -4px -> 0 (360 ms, --spring-firm), son rond passe en --green-soft
   (scale 1 -> 1,06) et sa coche se trace (260 ms). Écart de 300 ms entre les statuts.
4. Le dernier statut « Prêt à récupérer » reste mis en avant discrètement :
   texte en --ink, rond en --green. Aucune pulsation continue.
5. Le bloc lien de suivi apparaît ensuite (380 ms). Au clic sur « Copier », les
   libellés « Copier » et « Copié » se croisent verticalement (400 ms,
   --spring-soft) et le bouton passe en --green-soft pendant 1,6 s.
6. Les trois arguments en cascade (320 ms, 90 ms d'écart), avec coche.
7. Bouton « Rejouer » discret pour relancer la cascade des statuts.

CONTRAINTES SPÉCIFIQUES
- Les horodatages sont en monospace avec tabular-nums (alignement en colonne).
- Le cadre de la maquette ne doit pas devenir une illustration de téléphone
  réaliste (pas d'encoche, pas de boutons latéraux) : cela vieillit mal et alourdit.
- Le bouton « Copier » utilise navigator.clipboard avec repli silencieux, et
  possède un aria-label explicite.
- Le lien de suivi est un exemple : la structure d'URL doit être facile à
  remplacer dans le code.

CRITÈRES D'ACCEPTATION
- Les quatre statuts sont visibles et ordonnés sans JavaScript.
- Avec reduced-motion : tous les statuts allumés, aucune cascade.
- Le bouton « Copier » est utilisable au clavier et annonce son état.
- Les horodatages ne provoquent aucun décalage de largeur.
- La maquette reste lisible à 320 px de large.
```

---

## D · TABLEAU DE BORD DE L'ATELIER

```
SECTION : La vue d'ensemble quotidienne du chef d'atelier.

CONTENU EXACT
Sur-titre : « Votre atelier en un écran »
Titre : « Ce qui entre, ce qui sort, ce qui traîne »
Chapô : « Toutes les réparations en cours, classées par état. Les appareils qui
attendent depuis trop longtemps remontent d'eux-mêmes. »
Quatre indicateurs (valeur puis libellé) :
  « 12 » — « en cours »
  « 5 » — « prêtes ce jour »
  « 3 » — « en attente de pièce »
  « 2 » — « à relancer »
Quatre colonnes de suivi, avec le nombre de fiches :
  « Reçu » (4) / « Diagnostic » (3) / « En réparation » (5) / « Prêt » (5)
Ligne d'alerte : « 2 appareils prêts depuis plus de 7 jours — relance
recommandée »
Phrase de clôture : « Aucun appareil ne dort dans un tiroir sans que vous le
sachiez. »

INTENTION
Rassurer sur le contrôle. L'argument fort est le dernier : les appareils oubliés
coûtent de la place et de l'argent. L'indicateur « à relancer » est le
différenciateur — mettez-le en évidence en --amber.

CHORÉGRAPHIE
1. Au scroll : titre et chapô (440 ms).
2. Les quatre indicateurs apparaissent en cascade (340 ms, 90 ms d'écart), et
   leur valeur s'anime de 0 à la cible en 1 100 ms avec décélération cubique
   (1 - (1-t)^3), en monospace tabular-nums. Couleurs : --accent pour « en cours »,
   --green pour « prêtes ce jour », --muted pour « en attente de pièce »,
   --amber pour « à relancer ».
3. Les quatre colonnes de suivi apparaissent ensuite (380 ms, 100 ms d'écart) ;
   dans chacune, deux ou trois cartes de fiche miniatures (hauteur 26 px, barre
   grise + une pastille de statut) montent en cascade de 70 ms.
4. La ligne d'alerte apparaît en dernier, avec un fond --amber-soft et une icône
   d'avertissement : opacité 0 -> 1 et translateY 8px -> 0, 400 ms. Aucun
   clignotement.
5. Survol d'une carte de fiche miniature : élévation -2px + ombre, 200 ms.

CONTRAINTES SPÉCIFIQUES
- Les indicateurs sont côte à côte sur une seule ligne au-dessus de 720 px, en
  grille 2x2 en dessous.
- Les cartes de fiche miniatures sont des blocs suggérés (barre + pastille), pas
  du faux texte.
- L'alerte n'utilise JAMAIS le rouge : c'est une recommandation, pas une erreur.
- Densité obligatoire : hauteur totale de la maquette de tableau de bord
  inférieure à 320 px.

CRITÈRES D'ACCEPTATION
- Les quatre indicateurs et les quatre colonnes sont lisibles sans JavaScript.
- Avec reduced-motion : valeurs affichées directement, colonnes visibles.
- Les valeurs animées ne changent jamais de largeur pendant le décompte.
- L'alerte est compréhensible sans la couleur seule (icône + texte explicite).
- Contraste de --amber sur --amber-soft >= 4,5:1.
```

---

## E · DEVIS ET VALIDATION CLIENT

```
SECTION : Le devis envoyé, validé, et transformé en réparation.

CONTENU EXACT
Sur-titre : « Devis »
Titre : « Le client valide son devis depuis son téléphone »
Chapô : « Vous établissez le devis pendant le diagnostic. FONR l'envoie par SMS
et e-mail. Le client accepte ou refuse en un geste, et vous êtes prévenu
immédiatement. »
Étapes du parcours (4) :
  « Devis établi » / « pendant le diagnostic, depuis la fiche »
  « Devis envoyé » / « SMS + e-mail, avec le détail des pièces et de la main d'oeuvre »
  « Réponse du client » / « accepté ou refusé, horodaté »
  « Réparation lancée » / « ou appareil rendu en l'état, sans malentendu »
Encadré latéral : un devis miniature avec trois lignes
  « Écran — 65,00 € » / « Main d'oeuvre — 24,00 € » / « Total — 89,00 € »
puis deux boutons « Accepter » et « Refuser ».
Trois arguments :
  « Trace écrite de l'accord, horodatée et conservée »
  « Plus de litige sur le prix à la restitution »
  « Relance automatique si le devis reste sans réponse »
Phrase de clôture : « Un devis accepté par écrit, c'est un litige évité. »

INTENTION
Le devis est le point de friction commercial du métier : le client conteste le
prix à la restitution. L'animation doit montrer l'accord tracé.

CHORÉGRAPHIE
1. Au scroll : titre et chapô (460 ms).
2. Les quatre étapes apparaissent en cascade (340 ms, 100 ms d'écart), reliées
   par un filet vertical de 1,5 px qui se trace de haut en bas (700 ms).
3. Le devis miniature apparaît (420 ms) ; ses trois lignes montent en cascade
   (280 ms, 80 ms d'écart) et la ligne « Total » se détache par un filet
   supérieur et un poids de police plus fort.
4. Puis, une fois : le bouton « Accepter » reçoit un anneau --green fin
   (scale 1 -> 1,2, opacité 1 -> 0, 600 ms) comme une impulsion de clic ; il
   passe en --green plein avec une coche (320 ms, --spring-soft) ; et l'étape
   « Réponse du client » de la liste s'allume avec un horodatage en monospace.
5. L'étape « Réparation lancée » s'allume 400 ms plus tard.
6. Les trois arguments en cascade avec coche --green.

CONTRAINTES SPÉCIFIQUES
- Les montants sont en monospace tabular-nums, alignés à droite.
- Le bouton « Refuser » reste visible et neutre : ne pas suggérer que le refus
  est impossible ou honteux.
- L'impulsion d'anneau ne se répète pas en boucle (une seule fois à l'entrée
  dans le viewport).
- Le devis miniature ne dépasse pas 260 px de large.

CRITÈRES D'ACCEPTATION
- Les quatre étapes et le devis complet sont lisibles sans JavaScript.
- Avec reduced-motion : devis affiché, bouton « Accepter » à l'état validé,
  étapes toutes allumées.
- Les trois montants sont alignés en colonne (tabular-nums vérifié).
- L'anneau d'impulsion n'apparaît qu'une fois et ne reste pas affiché.
```

---

## F · DE LA RÉPARATION À LA FACTURE

```
SECTION : Le lien entre l'atelier et la facturation (dont la conformité légale).

CONTENU EXACT
Sur-titre : « Facturation »
Titre : « La facture se génère depuis la fiche, sans ressaisie »
Chapô : « À la restitution, FONR reprend le devis accepté, les pièces posées et
le temps passé pour produire la facture. Elle part au format légal, conforme à la
réforme de la facturation électronique. »
Trois blocs :
  « Reprise automatique » / « Devis accepté, pièces, main d'oeuvre : tout est
  déjà sur la fiche. »
  « Format légal » / « Facture structurée au format Factur-X, transmise par une
  plateforme agréée (PDP). »
  « Archivage 10 ans » / « Conservation à valeur probante, sans démarche de votre
  part. »
Bandeau de conformité, en petit : « Conforme à la réforme de la facturation
électronique · Format Factur-X · Norme EN 16931 »
Phrase de clôture : « Vous encaissez ; la conformité suit toute seule. »
Mention obligatoire : « Le calendrier officiel de la réforme a déjà été modifié :
vérifiez les échéances en vigueur sur impots.gouv.fr. »

INTENTION
Faire le pont entre le métier (réparer) et l'obligation légale (facturer
électroniquement) — sans transformer la section en cours de droit fiscal. Pour un
artisan, l'argument est « je n'ai rien à faire de plus ».

CHORÉGRAPHIE
1. Au scroll : titre et chapô (460 ms).
2. Une petite chaîne animée relie trois pastilles horizontales : « Fiche » ->
   « Facture » -> « Archivage ». Le filet se trace de gauche à droite (800 ms) et
   chaque pastille apparaît à son passage (340 ms, scale .9 -> 1).
3. Les trois blocs de texte montent en cascade (360 ms, 100 ms d'écart).
4. Sur la pastille « Facture », une fois : une pastille « PDF » et une pastille
   « XML » convergent et fusionnent en « Factur-X » (560 ms, --spring-soft),
   puis un badge coche --green apparaît (300 ms). Ne joue qu'une seule fois.
5. Le bandeau de conformité apparaît en dernier, en fondu (360 ms), suivi de la
   mention légale (qui reste toujours visible, non animée).

CONTRAINTES SPÉCIFIQUES
- Ne pas reprendre les grands schémas de facturation de prompts-sections.md :
  ici, c'est une section courte de liaison, hauteur totale sous 420 px.
- Le vocabulaire réglementaire (PDP, Factur-X, EN 16931) est mentionné mais
  toujours accompagné d'une glose de quelques mots.
- La mention sur le calendrier n'est jamais masquée ni animée.
- Ne rien affirmer sur le statut PDP de FONR dans cette section : le texte dit
  « transmise par une plateforme agréée », sans prétendre que FONR en est une.
  À ajuster uniquement quand le statut réel est confirmé.

CRITÈRES D'ACCEPTATION
- Les trois blocs et le bandeau sont lisibles sans JavaScript.
- Avec reduced-motion : chaîne tracée, pastille « Factur-X » à l'état final,
  badge affiché.
- La fusion PDF+XML ne se rejoue pas en boucle.
- La mention sur le calendrier est visible dès l'affichage de la section.
- Hauteur totale de la section inférieure à 420 px sur écran de bureau.
```

---

## Ce qu'il me manque pour affiner

Répondez à ces points et je réécris les prompts au vocabulaire exact de FONR :

1. **Quel métier exactement ?** Téléphonie / informatique / électroménager /
   automobile / cycles / autre — cela change « appareil », « panne », « pièce ».
2. **Vos statuts réels de réparation**, dans l'ordre, avec leurs intitulés
   exacts tels qu'ils apparaissent dans l'app.
3. **Les champs de votre prise en charge** : que saisit-on vraiment, et dans
   quel ordre ? Y a-t-il une signature client, des photos de l'état à l'arrivée ?
4. **Les déclencheurs de notification** que vous avez réellement implémentés
   (et le texte de vos modèles de SMS).
5. **Les autres modules** que j'ignore encore : stock et pièces ? caisse et
   encaissement ? planning et rendez-vous ? garanties ? multi-boutiques ?
   statistiques ? achats fournisseurs ?
6. **Le module facturation** : est-il déjà en place, et FONR passe-t-il par une
   PDP tierce ou prétend-il en être une ?
