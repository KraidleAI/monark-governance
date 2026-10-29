# G7 du lot 1 de Hikae, partie 1 : la bibliothèque de paris, ses rationnels exacts, ses facteurs de pari, ses mélanges, la lecture du changement et le détecteur à redémarrages pondérés

- **Base** : `9f8563af`. **PR** : #344, branche `lot/hikae2-p1-l1`, tête `aaf47079` : deux commits (`bb4e01a6`, la bibliothèque et son
  test ; `b0a7dd76`, les enregistrements de tests) et deux fusions du tronc (`ed8f85ee`, de `b116393f` ; `aaf47079`, de `57f03e43`),
  qui ne changent ni la bibliothèque ni son test. **Fusion au tronc** : `9cdfba24`, tronc avant fusion `81e03af9`.
- **Plan** : partie 1 d'ADR-HIKAE-2, lot 1 (`pari/`), sous l'accord du fondateur pour la partie (2026-10-29, vers 00:0x UTC) et sa
  directive du 2026-10-29 03:40 UTC. La session HIKAE a construit le lot (les tests d'une instance, le code d'une autre) ; MONARK le
  fusionne et rend ce G7. La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

Une bibliothèque pure sous `packages/hikae/src/pari/` : ni horloge, ni réseau, ni fichier, et aucun chemin servi. Elle reste
« upcoming » au registre public jusqu'à son branchement.

- `rational.ts` : des rationnels exacts sur `bigint`, toujours réduits, le signe au numérateur. `qString` les écrit ; `qParse` ne
  relit que les textes que `qString` écrit. Aussi `add`, `sub`, `mul`, `pow`, `cmp`, et `floorScaled`, qui arrondit vers moins l'infini.
- `bet.ts` : le facteur de pari sur une variable dans {0, 1}. Le côté `"below"` donne 1 + lambda(a - x), lambda dans (0, 1/(1 - a)) ;
  le côté `"above"` donne 1 + lambda(x - a), lambda dans (0, 1/a). Les bornes sont ouvertes, et a est dans (0, 1).
- `mixture.ts` : le capital d'un mélange fixe de paris, depuis les seuls comptes, et la table de franchissement d'un test : pour
  chaque t, le compte frontière où le capital fois delta atteint 1. La table est calculée en rationnels, jamais en flottant.
- `sr.ts` et `weighted.ts` : en virgule fixe à 2^-64, arrondie vers le bas, une lecture de Shiryaev-Roberts et un détecteur à
  redémarrages pondérés. Le poids floor(2^64/(t(t+1))) est arrondi d'abord, puis le pas.
- `threshold.ts` : `crosses(value, delta)`, value fois delta >= 1, comparé en entiers.
- `index.ts` réexporte les trois types et les dix-huit fonctions, et rien d'autre. Tout refus lève une `RangeError`.
- `packages/hikae/test/pari.test.ts` (neuf, 8 tests, les noms du plan). Ses attendus ne viennent jamais de la bibliothèque : ce sont
  des littéraux écrits à la main, ou des formes closes que le test calcule en BigInt :
  - le produit le long de chaque chemin, pour t jusqu'à 10 ;
  - la frontière à chaque t, jusqu'à 2 000 du côté below et 1 000 du côté above, celles des t <= 12 épinglées à la main ;
  - les récurrences en virgule fixe et leurs bornes d'erreur, sur 300 pas.

  Le balayage de pureté lit les sept fichiers, leurs imports et les identifiants interdits, et refuse trois textes plantés.
- Hors du paquet, seuls les deux enregistrements de tests changent.

## Écarts au plan

- Aucun sur les fichiers, les noms des tests et l'absence de chemin servi (ligne de L1 du plan de la partie).
- La taille : le plan estimait le lot à environ 520 lignes. La PR ajoute 415 lignes de code et 506 de test, et le compte de R-25 en
  retient 921, sous sa borne de 1 205.

## Vérification

- Sur la branche, par la session HIKAE (corps de #344) :
  - `test:main` vert sur la branche fusionnée : 3371 tests, 3324 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce
    passage (337 fichiers) ;
  - red-proof contre `9f8563af`, la base de la branche : les 8 tests y échouent au chargement du module neuf et passent ici ; les
    8 tueurs tirés sont tués par une assertion ;
  - mutants : 117 (rational 32, bet 12, mixture 40, sr 16, weighted 6, threshold 6, index 5), tous tués par une assertion ;
  - le diff reste dans la zone déclarée (lot-check, sortie 0).
- Red-proof rejoué par MONARK avant la fusion, contre la même base : 8 tests jugés, rouges à la base et verts ici ; 4 tueurs tirés,
  tous tués (`RED-PROOF.json` `08bfd0ce…`).
- Oracle G1 de la tête `aaf47079`, base `57f03e43` : vert, 14 gates sur 14 (enregistrement
  `aaf470791cfc1171812b89338901234d1db9d7c9-G1-20261029T135118Z-37960.json`, sha256 `3d09a4ba…`).
- CI de #344 : 15 contrôles sur 15 verts à `aaf47079` (run 40887941585).
- Rejeu Windows à la fusion : les fichiers de test que le lot touche (`packages/hikae/test/pari.test.ts`,
  `test/test-count-check.test.ts`), 12 tests, 12 réussis, 0 échec, 0 sauté.
- Oracle G7 sur `9cdfba24`, base `81e03af9` : vert, 14 gates sur 14 (enregistrement
  `9cdfba24cf200e10e82b872def1a5a8686d1afed-G7-20261029T150905Z-38552.json`, sha256 `c70af1dd…`) ; 3371 tests, 3324 réussis, 0 échec,
  47 sautés ; 921 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les deux tests du noyau sous la
  chaîne épinglée (`ELAN_HOME`) : 13 tests, 13 réussis, 0 sauté.

## Ce qui reste

- Le lot LS (#345), dont la fusion attend le choix du fondateur, puis le lot 2 (`suivi/`).
- La G2 de la partie, le checkpoint-2 et le G7 de la partie, qui plie le registre `docs/PAROXYSME-Hikae.md` avec l'item
  HIKAE2-CABLAGE-USDE-1.
