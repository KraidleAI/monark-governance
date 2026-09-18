# Fiche — Vovk (2012), « Conditional validity of inductive conformal predictors »

## Identité [lu]
- **Auteur** : Vladimir Vovk, Computer Learning Research Centre, Department of Computer Science, Royal
  Holloway, University of London, Egham, Surrey, UK.
- **Titre exact** : « Conditional validity of inductive conformal predictors ».
- **Venue** : JMLR: Workshop and Conference Proceedings (**PMLR**) 25:475–490, 2012 — Actes de la
  **Asian Conference on Machine Learning (ACML) 2012**, 4ᵉ édition, éditeurs Steven C. H. Hoi et
  Wray Buntine. Date de publication : 2012-11-17 (métadonnée `citation_publication_date`).
- **Pages** : 475–490 (16 pages), confirmées par métadonnées (`citation_firstpage`/`citation_lastpage`)
  ET par le nombre de pages du PDF (`pdfinfo` : 16 pages — 490−475+1=16, cohérent).
- **Source** : `https://proceedings.mlr.press/v25/vovk12/vovk12.pdf` (page abstract :
  `https://proceedings.mlr.press/v25/vovk12.html`).
- **Fichier local** : `pdf/vovk-2012.pdf` — 419 379 octets — sha256
  `7687a3be5702c52074e1b48e7317f1e068e9581ff832c65f7efca659c665ed3a` (voir README).
- **Classe** : **P1** (actes officiels PMLR, libre accès, version de référence).
- **Identité vérifiée AVANT extraction** : titre, auteur, venue et pagination en page 1 du PDF tous
  conformes à l'attendu — pas de collision de nom détectée.

## Méthode d'extraction [lu]
`pdftotext -layout` réussit pleinement (59 781 caractères, 16 pages, prose lisible sans le défaut de
perte de symboles grecs observé sur le papier arXiv). Quelques zones (diagramme en Figure 1, formules
matricielles denses) se rendent en « art ASCII » illisible dans la couche texte (glyphes de dessin) —
traitées comme un diagramme (voir census), pas comme du texte à interpréter littéralement.

## Census figures/tableaux [lu]
- **Figure 1 (p. 476)**, « Eight notions of conditional validity » : cube dont les sommets visibles sont
  nommés explicitement en légende (prose de l'auteur, lue intégralement) : U (unconditional), T (training
  conditional), O (object conditional), L (label conditional), OL (example conditional), TL, TO ; sommet
  invisible TOL (conditionnement sur tout). Rendu graphique du cube lui-même illisible en texte brut (art
  ASCII), mais **la légende énumère exhaustivement les 8 notions** — aucune perte d'information pour les
  besoins de cette fiche.
- **Tableau 1 (p. ~483, « errors overall » et par catégorie email/spam)** : capturé intégralement en texte
  (8 colonnes « RNG seed » 0–7 + moyenne, taux d'erreur globaux et par catégorie, ex. ligne « errors
  overall » : 4,1 % à 7,7 % selon la graine, moyenne 5,75 %) — donnée numérique lue, pas seulement
  légendée.
- **Figures 2–7 (p. 480–489)** : nuages de points et diagrammes de calibration empiriques sur le jeu de
  données Spambase — illustratifs de la partie expérimentale (Section 6), légendes lues en clair, non
  re-rendues en image (pas de contenu théorique supplémentaire par rapport au texte).

## Ce que le papier établit

### Objet étudié : prédicteurs conformes inductifs (ICP) (Section 2, p. 477) [lu, formule reconstruite]
```
Γ^ε(z₁,...,z_l,x) = { y : p_y > ε } ,   p_y = ( |{i=m+1,...,l : σ_i ≥ σ_y}| + 1 ) / (l − m + 1)
```
où σ_i = A((z₁,...,z_m), z_i) sont les scores de conformité (ensemble d'apprentissage propre de taille m,
ensemble de calibration de taille l−m).

### Proposition 1 (Vovk, Gammerman & Shafer 2005, Prop. 4.1), p. 477 [lu]
Citation resserrée (≤ 25 mots) : « their distribution is invariant under permutations » — c'est la
**définition explicite de l'échangeabilité** donnée par l'auteur : Z_{m+1},…,Z_l,Z_{l+1} sont échangeables
si et seulement si leur loi jointe est invariante par permutation. Sous cette hypothèse, la probabilité
d'erreur d'un ICP (l'étiquette vraie n'appartient pas à l'ensemble prédit) n'excède pas ε, pour tout ε et
tout ICP.

### Huit notions de validité conditionnelle (Figure 1 + Section 1, p. 476) [lu]
U (inconditionnelle, automatique pour tout ICP par la Prop. 1), T (conditionnelle à l'ensemble
d'entraînement), O (conditionnelle à l'objet testé), L (conditionnelle à l'étiquette testée), et les
combinaisons OL/TL/TO/TOL. Les flèches vont des notions fortes vers les notions faibles ; U est le puits,
TOL (non montré) la source.

### Validité conditionnelle à l'entraînement (Section 3, Prop. 2a/2b) [lu]
Résultat de type PAC à deux paramètres : probabilité cible de couverture conditionnelle à l'entraînement
1−δ, atteinte avec probabilité 1−ε. Obtenue « automatiquement » par les ICP (contrairement aux autres
notions, qui exigent de modifier la méthode).

### Validité conditionnelle à l'objet — résultat négatif (Section 5, p. 480) [lu]
Citation resserrée (≤ 25 mots) : « precise object conditional validity cannot be achieved in a useful way
unless the test object has a positive probability » — résultat négatif général (apparenté à un lemme de
Lei & Wasserman 2012) : la validité conditionnelle précise à l'objet testé est **inatteignable** en général
par un ICP ; seule une version approchée/asymptotique est visée.

### Étude empirique — nuance échangeabilité ≠ caractère aléatoire i.i.d. (Section 6, p. ~484) [lu]
Citation resserrée (≤ 25 mots) : « permuting the data set ensures exchangeability but not necessarily
randomness » — l'auteur **distingue explicitement** l'échangeabilité obtenue par permutation du jeu de
données (utilisée pour construire 8 répliques expérimentales par graines RNG différentes) de l'hypothèse
plus forte de « randomness » (i.i.d.), en notant que les 8 ensembles d'entraînement ne sont pas complètement
indépendants.

### Conclusion (Section 8, p. 489) [lu]
Citation resserrée (≤ 25 mots) : « With a small training set, we have to content ourselves with
unconditional validity ». Les ICP sont reformulés dans le vocabulaire classique des « tolerance regions »
de Fraser (1957) : régions de tolérance en espérance (Prop. 1) **et** de type PAC pour une proportion
(Prop. 2a) — les ICP satisfont les deux notions.

## Ce que le papier NE dit PAS [absence vérifiée par lecture intégrale des 16 pages]
- **Aucune occurrence de « Theorem »** dans tout le document — uniquement des « Proposition » ; aucune
  occurrence de « CUSUM », « change detection », ni de « sequential » au sens de surveillance en ligne
  (vérifié par grep ciblé sur l'ensemble du texte).
- **Rien sur la détection de rupture, l'ARL, le délai de détection, ou une statistique de type Page/CUSUM.**
  Le cadre est exclusivement celui de la prédiction ensembliste **statique** (classification batch), pas
  d'un flux temporel surveillé.
- L'unique usage de « permutation » dans le corps du texte est **définitionnel** (échangeabilité =
  invariance par permutation, Prop. 1) et **expérimental** (permuter un jeu de données statique pour
  produire des répliques) — **jamais** un test de permutation au sens d'un test statistique produisant une
  p-value par ré-échantillonnage d'une statistique observée, comme le fait le contrôle de `instrument.ts`.
- Aucune mention de séries de Bernoulli, de moyennes variables dans le temps, ni de non-stationnarité.

## En quoi ce papier fonde ou contredit notre instrument
**Fonde, au niveau conceptuel/lexical seulement** : la Proposition 1 fournit la définition précise et
citable de l'échangeabilité comme invariance par permutation de la loi jointe — c'est exactement l'objet
que le contrôle par permutation de `instrument.ts` interroge en pratique (le mélange Fisher-Yates sous
`mulberry32(20260917)` est un tirage dans le groupe des permutations de la séquence observée ; la p-value
`(1+exceed)/(perms+1)` mesure si la statistique observée est extrême sous l'hypothèse que la séquence est
échangeable). Vovk (2012) est donc une source légitime pour **définir** ce que « échangeable » veut dire —
et, via la nuance p. 484, pour rappeler que « permutation-échangeable » n'implique pas « i.i.d. » (une
distinction que l'ADR-M012 D7 respecte déjà en ne réclamant jamais l'i.i.d. pour la population calme).
**Ne fonde RIEN de la théorie CUSUM/ARL de l'instrument** : ce papier ne traite ni de série temporelle
surveillée, ni de statistique cumulative, ni de délai de détection, ni d'ARL — il ne peut donc **en aucun
cas** être cité à l'appui d'une propriété de détection de `instrument.ts`. Son usage légitime et unique
serait une note de bas de page définissant l'échangeabilité au sens où le contrôle par permutation la
présuppose sous l'hypothèse nulle — rien de plus.

## Niveau de lecture global
**[lu] intégral** — 16/16 pages lues via texte extrait complet (Sections 1 à 8, Propositions 1–3,
conclusion), grep exhaustif effectué pour confirmer l'absence de vocabulaire CUSUM/ARL/séquentiel.
