# G7 du second lot de pli de Hikae, partie 1 : la durée moyenne avant fausse alarme de la lecture, testée

- **Base** : `3a9e81fe`. **PR** : #353, branche `lot/hikae2-p1-arl`, tête `1953750d` : deux commits partis du tronc `8824d25d`
  (`c9117885`, le test ; `3f78fb04`, sa déclaration d'épingle) et une fusion du tronc (`1953750d`, de `3a9e81fe`), qui ne change ni le
  fichier de test ni `packages/hikae/src/`. **Fusion au tronc** : `a82393a1`, tronc avant fusion `3a9e81fe`.
- **Plan** : la G2 de la partie 1 d'ADR-HIKAE-2, sa remarque mineure sur la durée moyenne avant fausse alarme, sous l'accord du
  fondateur pour la partie (2026-10-29, vers 00:0x UTC) et sa directive du 2026-10-29 03:40 UTC. La session HIKAE a construit le lot ;
  MONARK le fusionne et rend ce G7.

## Ce que le lot livre

Un seul fichier de test change, `packages/hikae/test/suivi-detector.test.ts` (32 lignes ajoutées, 4 ôtées), et les deux
enregistrements de tests, qui gagnent un test et un nom : aucun module.

- La lecture de Shiryaev-Roberts du suivi est construite pour que, sous l'hypothèse nulle, sa durée moyenne avant fausse alarme soit au
  moins son seuil, 10 000 évaluations. Aucun test ne l'exerçait : aux horizons des passes de fausse alarme déjà là, 500 à 5 000, la
  moyenne de min(N*, H) est au plus H.
- Le test neuf, `detector_sr_reading_arl_lower_bound` (l.270), la vérifie sur le membre frontière de l'hypothèse nulle, p = a = 1/5, à
  un niveau de confiance : 2 000 trajectoires sur le flux des passes de fausse alarme, juste après leurs trois sections (position
  816 000 000), la lecture courue jusqu'à H = 30 000, trois fois le seuil ; la boucle de la bibliothèque, avec le seuil entier du côté
  du test, et la boucle flottante de l'étude, sur les mêmes étiquettes.
- Il épingle le même premier franchissement sur chaque trajectoire et leur compte, 1 814 sur 2 000, tiré de son premier passage, pour
  la bibliothèque et pour l'étude. min(N~*, H) est au plus N~* : une borne inférieure de confiance de sa moyenne au-dessus du seuil borne
  par en dessous la durée moyenne elle-même ; le test affirme moyenne − 3,09 écarts-types / √N ≥ 10 000.
- L'en-tête du fichier dit d'où viennent les comptes (ceux des deux passes déjà là, d'un script à part ; celui-ci, du premier passage du
  test) et déclare le test épingle : vert à la base, la bibliothèque qu'il fait tourner étant au tronc, inchangée par le lot ; son tueur
  nommé (`packages/hikae/src/pari/sr.ts` l.50 : l'unité doublée dans le pas de la lecture) le rougit.

## Écarts au plan

Aucun.

## Vérification

- L'outil de preuve F2P sort 1 sur cette épingle : vert à la base en mode F2P ; en mode `--test-only`, refusé à sa porte, qui compte
  les deux enregistrements de tests changés comme du code de production (item RED-PROOF-TEST-ONLY-REGISTRIES-1 de `docs/ETAT.md`). Le
  checkpoint-2 de la partie a rejoué l'épingle à ses trois conditions (son tueur la rougit, le texte que le tueur change est à la base,
  elle est comptée à part) ; entre `3f78fb04` et `1953750d`, ni le fichier ni la bibliothèque ne changent.

- Sur la branche, par la session HIKAE (corps de #353), à `1953750d` :
  - le tueur nommé, sur l'arbre du premier commit : l'assertion de parité échoue, la bibliothèque franchit sur 1 982 trajectoires et la
    borne tombe à 6 290,5 ;
  - le test seul : vert en 63 s (moyenne 11 730,6, écart-type 9 382,2, borne 11 082,3) ; eslint sur le fichier et typecheck, sortie 0 ;
  - l'oracle local G1 : vert, 14 gates sur 14 ; `test:main` : 3418 tests, 3371 réussis, 0 échec, 47 sautés, le test neuf en 73 s, sous
    le délai de 300 s par test ; 36 lignes changées au compte de R-25 (borne 1205) ;
  - les enregistrements de tests, réécrits d'un passage complet de `test:main`, restent tels que fusionnés, et le contrôle du compte de
    tests passe contre `3a9e81fe` ; le diff reste dans la zone déclarée (lot-check, sortie 0) : trois fichiers.
- Relu par MONARK avant la fusion : le diff contre `3a9e81fe` est celui que le corps décrit (le fichier de test, +32 −4 ; un test et un
  nom de plus aux enregistrements) ; le tueur est nommé au-dessus du test (l.269) ; le test lit le seuil, 10 000, et a = 1/5 dans la
  politique de son fichier ; entre `3f78fb04` et `1953750d`, ni le fichier ni `packages/hikae/src/` ne changent.
- CI de #353 : 15 contrôles sur 15 verts à `1953750d` (run 41025268484, et l'analyse CodeQL, run 41025263952), lue après la fin de
  la passe.
- Rejeu Windows à la fusion : le fichier de test que le lot touche (`packages/hikae/test/suivi-detector.test.ts`),
  `test/test-count-check.test.ts` et `test/ci-gates.test.ts` : 57 tests, 57 réussis, 0 échec, 0 sauté ; le test neuf en 62 s,
  avec les chiffres du corps de #353 (moyenne 11 730,6, écart-type 9 382,2, borne 11 082,3 ; 1 814 trajectoires sur 2 000
  franchissent avant 30 000, pour la bibliothèque et pour l'étude).
- Oracle G7 sur `a82393a1`, base `3a9e81fe` : vert, 14 gates sur 14 (enregistrement
  `a82393a1858e9b5c87cad7eb62d9028043c672f0-G7-20261030T083319Z-42304.json`, sha256 `38bba876…`) ; 3418 tests, 3371 réussis, 0 échec,
  47 sautés, le test neuf en 72 s ; 36 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les
  tests du noyau de Genkan sous la chaîne épinglée (`ELAN_HOME`) : 31 tests, 31 réussis, 0 sauté.

## Ce qui reste

- Le G7 de la partie, qui plie le registre `docs/PAROXYSME-Hikae.md` et les corrections du checkpoint-2
  (`docs/G7-partie-hikae2-p1.md`).
- Le lot LS (#345), dont la fusion attend le choix du fondateur.
- RED-PROOF-TEST-ONLY-REGISTRIES-1, avec RED-PROOF-PIN-1 et RED-PROOF-BLOCK-ALIGN-1, dans la partie de règlement des items en
  retard, avant le lot 2b-ii de Genkan.
- L'item HARNESS-VERIFY-TLS-FLAKE-1 reste ouvert à son déclencheur : ce lot ne touche ni `scripts/verify-harness.mjs` ni son test, et
  aucun passage complet n'a d'échec (le `test:main` de l'oracle G1 de HIKAE sur `1953750d` et celui de l'oracle G7 de la fusion) :
  pas de second échec.
