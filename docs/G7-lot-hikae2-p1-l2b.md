# G7 du lot 2b de Hikae, partie 1 : le détecteur qui ferme, le moniteur M1 et la garde du pas du suiveur

- **Base** : `296d3dbe`. **PR** : #349, branche `lot/hikae2-p1-l2b`, tête `ca8dda26` : deux commits (`9b7102a1`, les modules et
  leurs tests ; `ca8dda26`, les enregistrements de tests) et une fusion du tronc (`3d735568`, de `296d3dbe`), qui ne change ni les
  modules ni leurs tests. **Fusion au tronc** : `8e21cd26`, tronc avant fusion `296d3dbe`.
- **Plan** : partie 1 d'ADR-HIKAE-2, lot 2b (`suivi/` : détecteurs, M1 ; `tracker.ts` l.77-84), né du lot 2a, sous l'accord du
  fondateur pour la partie (2026-10-29, vers 00:0x UTC) et sa directive du 2026-10-29 03:40 UTC. La session HIKAE a construit le
  lot ; MONARK le fusionne et rend ce G7. La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

Deux modules purs sous `packages/hikae/src/suivi/`, une garde dans le suiveur, et les cinq modules du suivi composés dans un test :
ni horloge, ni réseau, ni fichier, et aucun chemin servi. Ils restent « upcoming » au registre public jusqu'à leur branchement.

- `detector.ts` : à partir des seules étiquettes, le détecteur qui ferme, à redémarrages pondérés, S <- (S + w_t) g avec
  w_t = 1/(t (t + 1)), et la lecture de changement publiée, R <- (1 + R) g. Les deux courent sur les paris de `bets_sr` en m, en
  virgule fixe à 2^-64 arrondie vers le bas par la bibliothèque de paris, et gardent leurs composantes en textes décimaux canoniques.
  L'alarme est collante : levée au premier rang où le détecteur atteint 1/alpha_arl, jamais effacée. `srReading` compare la lecture à
  son seuil à chaque appel, sans mémoire ; elle est publiée et n'agit jamais sur l'alarme.
- `m1.ts` : un pas de M1, le moniteur du taux de ratés. `m1Step` tire E = 1{s01 > r} lui-même, avec l'inégalité stricte du suiveur,
  et rend r' = imocpStep(r, alpha, E, eta), sans projection de r ; il refuse un r hors de la bande
  [imocpStep(0, alpha, 0, eta), imocpStep(1, alpha, 1, eta)], qu'un pas parti de la bande ne quitte jamais. `m1Bound(T, eta)` vaut
  (1 + eta)/(eta T), exact.
- Tout refus des deux modules lève une `RangeError` ; toute décision se prend en rationnels exacts.
- `tracker.ts` : `trackerStepSize` refuse aussi un pas qui n'est pas positif (une ligne, l.83).
- Deux fichiers de test neufs, 17 tests, et un fichier changé ; leurs attendus ne viennent jamais des modules :
  - `packages/hikae/test/suivi-detector.test.ts` (8 tests) : des Monte-Carlo du détecteur et de la lecture à graines fixes, deux
    implémentations de référence séparées en flottants figés, des comptes et des instants écrits en littéraux par un script séparé ;
  - `packages/hikae/test/suivi-library.test.ts` (9 tests) : M1, et les cinq modules composés sur 613 scores de calibration d'une
    cellule, l'alarme qui ferme un segment ouvert après le pas d'O4 ;
  - `packages/hikae/test/suivi-o4.test.ts` : le balayage de pureté couvre les cinq fichiers, et n'admet l'import du moniteur
    existant (`../l2-monitor.ts`) que dans `m1.ts`.
- Hors du paquet, seuls les deux enregistrements de tests changent.

## Écarts au plan

- Aucun sur les fichiers : `ci.yml`, déclaré à la ligne de zone seulement si les Monte-Carlo passaient 300 s, ne change pas.
- La taille : le plan estimait le lot 2 entier à environ 1 150 lignes ; le compte de R-25 en retient 1 158 pour L2a et 853 pour L2b,
  chacun sous sa borne de 1 205.

## Vérification

- Sur la branche, par la session HIKAE (corps de #349) :
  - `test:main` vert sur la branche fusionnée : 3409 tests, 3362 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce
    passage (341 fichiers), et le contrôle du compte de tests passe contre le tronc ;
  - red-proof contre `b6c51818`, le commit d'où part la branche : 18 tests jugés, les 17 neufs échouent au chargement des modules neufs
    et le balayage de pureté par une assertion ; tous passent ici, et les 8 autres tests du fichier changé sont inchangés ; les 6
    tueurs tirés sont tués par une assertion ;
  - mutants : chacune des 26 lignes `// killer:` des trois fichiers de test, dont 18 écrites par ce lot (25 éditions distinctes), fait
    échouer son test par une assertion ; la table tient 125 autres mutants, tous tués par une assertion ;
  - l'oracle local G1, base `296d3dbe` : vert, 14 gates sur 14 ; 853 lignes changées au compte de R-25 (borne 1205) ;
  - le diff reste dans la zone déclarée (lot-check, sortie 0).
- Relu par MONARK avant la fusion :
  - red-proof rejoué contre le tronc `296d3dbe` : 18 tests jugés, les 17 neufs qui échouent à la base au chargement des modules neufs
    et le balayage de pureté par une assertion, tous verts ici ; 8 inchangés ; 6 tueurs tirés (graine 3076503297), tous tués
    (`RED-PROOF.json` `1d784f46…`) ;
  - lot-check sur l'arbre propre de la tête, contre `296d3dbe` : 8 fichiers changés, tous dans la ligne de zone du lot 2,
    `tracker.ts` dans ses lignes déclarées, sortie 0 ;
  - à la tête, les trois fichiers de code sont ceux des campagnes de mutants, octet pour octet (sha256 recalculés : `detector.ts`
    `98040ac0…`, `m1.ts` `d76fe5b0…`, `tracker.ts` `7e886c2f…`) ; les deux résultats relus : les 26 lignes `// killer:` tuées
    (`RESULTS.json` `e4f39813…`), les 125 mutants de la table tués (`RESULTS.json` `ced7dee2…`, table `ce51c8d2…`), aucun survivant.
- CI de #349 : 15 contrôles sur 15 verts à `ca8dda26` (run 40930935405, et l'analyse CodeQL, run 40930928350), lue une fois.
- Rejeu Windows à la fusion : les fichiers de test que le lot touche (`packages/hikae/test/suivi-detector.test.ts`,
  `packages/hikae/test/suivi-library.test.ts`, `packages/hikae/test/suivi-o4.test.ts`), ceux du suiveur
  (`packages/hikae/test/tracker.test.ts`, `test/narabi-live.test.ts`), `test/test-count-check.test.ts` et `test/ci-gates.test.ts` :
  119 tests, 119 réussis, 0 échec, 0 sauté.
- Oracle G7 sur `8e21cd26`, base `296d3dbe` : vert, 14 gates sur 14 (enregistrement
  `8e21cd264174f263bb232b470dc6b60b5904eb11-G7-20261029T192552Z-38600.json`, sha256 `63433447…`) ; 3409 tests, 3362 réussis, 0 échec,
  47 sautés ; 853 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau de Genkan
  sous la chaîne épinglée (`ELAN_HOME`) : 17 tests, 17 réussis, 0 sauté. Le test du harnais de HARNESS-VERIFY-TLS-FLAKE-1 y passe.

## Ce qui reste

- La G2 de la partie, le checkpoint-2 et le G7 de la partie, qui plie le registre `docs/PAROXYSME-Hikae.md`.
- L'item HARNESS-VERIFY-TLS-FLAKE-1 reste ouvert à son déclencheur : aucun passage complet de ce lot n'a d'échec (le `test:main` et
  l'oracle G1 de la session HIKAE, l'oracle G7), donc pas de second échec.
- Le lot LS (#345), dont la fusion attend le choix du fondateur.
