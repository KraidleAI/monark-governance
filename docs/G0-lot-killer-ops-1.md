# G0 du lot KILLER-OPS-1 : vingt tueurs que `parseKiller` ne lit pas ou dont l'opérateur sort de la liste fermée (MISSION-LINT-KILLER-OPS-1)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat du vérificateur de MONARK sur le transfert de `wave1.json`.

Auteur : RECHERCHES ; rédaction initiale et pli de la G2 (MONARK, `2026-10-07-MONARK-vers-RECHERCHES-g2-221-222.md`, pièce
`g2-221-222.json` clé `1`, voie (a)) par un worker `claude-opus-5-5`, à l'effort de la session, sans réglage explicite (RECHERCHES,
`2026-10-07-RECHERCHES-vers-MONARK-pr226-close-erratum-21.md`), horloge du pli lue à 09:15 UTC. Le pli est construit après la fusion de
la PR 2 du registre (#228) : le tronc `1cddd2e5` est fusionné dans la branche, et ses 8 tueurs de `ci.yml` réancrés y sont verts sans
que ce lot les touche. Pli du delta G2 (MONARK `e7234bd`, `2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, pièce
`g2-221-222-delta.json` clé `1`) par un worker `claude-opus-5-5`, effort `max` passé par l'orchestrateur de RECHERCHES, horloge lue à
10:48 UTC ; le tronc `591b3a30` est fusionné dans la branche. Pli de la G2 ciblée (MONARK `3b91f1d`,
`2026-10-07-MONARK-vers-RECHERCHES-g2f-221-222.md`, pièces `g2f-221-222.json` et `g2f-222-probes.test.ts`) par un worker
`claude-opus-5-5`, effort `max` passé par l'orchestrateur de RECHERCHES, horloge lue à 12:28 UTC. Le tronc a avancé à `dd9ef99d` (#232
et un commit de docs) ; il n'est pas fusionné : il ne touche aucun fichier de la PR, et la garde reste verte sur le tronc plus la PR.

Preuve rouge-vert : F2P, le mode par défaut de `scripts/red-proof.mjs`. Depuis le pli du delta, la PR touche une ligne de production,
l'export de `killerProblem` (`scripts/red-proof.mjs:54`) : la porte `--test-only` la refuserait, et la garde rougit au tronc par
assertion.

## Constat (mesuré à la base, `parseKiller` de `scripts/red-proof.mjs` l.49 sur chaque ligne `// killer:` du code, docs/ hors)

- 1 516 lignes `// killer:` en tête de ligne ; le prédicat complet des outils (`killerProblem`, `red-proof.mjs` l.54-62) en refuse
  **35** : les 20 de ce lot, 8 de `ci.yml` (`<before>` absent de la ligne, réancrés par la PR 2 du registre, #228), 2 SDL à `<after>`
  non vide et 5 dont la cible est un `*.test.ts`. Les 20 de ce lot :
  - 15 illisibles dans `test/mission-lint.test.ts` (l.63, 66, 69, 73, 84, 98, 99, 114, 125, 128, 147, 162, 166, 178, 184) :
    opérateurs à trait d'union (`remove-anchor`, `drop-chain`, `drop-tail`, `revert-class`, `revert-covers`, `disable-alt`,
    `invert-precedence`, `disable-braces`, `drop-reversed-order`, `drop-haiku`, `revert-tied`, `drop-dirs-check`, `remove-rev-guard`,
    `keep-md-suffix`, `blank-head`) que `(\w+)` refuse ; de plus, numéros de ligne périmés (lot M-2a) et `<before>` paraphrasés
    (`execFileSync(...)`, `(paren|l.N-chain)`) ;
  - 5 lues mais refusées par `killerProblem` et `lostOf` : opérateur `LVR` dans `test/oracle-run.test.ts` (l.218, 219, 283, 347, 348).
- Les 2 SDL à `<after>` non vide (`test/oracle-run.test.ts` l.252 et l.297) : `red-proof` les refuse, `mutants` ignore `<after>` et vide
  toute la ligne (l.69 de `scripts/oracle/run.mjs` : le `try` perd son `catch`, le module ne charge plus) ; aucun outil ne tire la
  mutation déclarée.
- Les 5 tueurs sur du code de test (`test/dojo-render.test.ts` l.84, 88, 389 ; `test/public-surfaces-honesty.test.ts` l.174 ;
  `test/red-proof.test.ts` l.548) visent des aides définies dans le fichier de test lui-même (`textOf`, `jsLiteral`, `bellRowOf`,
  `section`) : refusés par les deux outils (« test code »).
- Les 20 lignes sont dans le corps des tests : après le lot, elles sont tirables par `mutants --killers` ; `red-proof` ne lit que le
  tueur placé juste au-dessus d'une déclaration de premier niveau (`declarations()`, l.64-67).

## Choix par opérateur

- `LVR` (remplacement d'une valeur littérale) : même mutation que `CONST` (remplacer `<before>` par `<after>` sur la ligne). Étendre la
  liste fermée d'ADR-METHODE-2 D2 pour un synonyme n'ajoute aucune mutation : réécrit en `CONST`, même fichier, ligne, avant et après.
- Les 15 noms libres de M-2a ne sont pas des opérateurs : chaque ligne est réécrite en place (même ligne du test) en `CONST`, `COR` ou
  `SDL`, ancrée sur la ligne actuelle de `scripts/mission/lint.mjs` ou `launch.mjs`, `<before>` exact et unique sur cette ligne, même
  intention de mutation. Aucune autre ligne ne bouge.
- Les 2 SDL à `<after>` non vide : réécrits en `CONST`, même fichier, ligne, avant et après (la mutation déclarée est un remplacement).
  Tirés à la main : chacun rougit son test porteur par `ERR_ASSERTION` (l.251 et l.296).
- Les 5 tueurs sur du code de test : retirés en place, avec leur raison sur la ligne, la mutation gardée en texte ; aucune ligne ne
  bouge. La raison écrite : « Not a killer, test code (a *.test.ts is never mutated) ». La construction qui les rend tirables existe :
  un module d'appui sous `test/`, importé par le test, que les deux outils admettent. Elle est confiée à KILLER-TEST-HELPERS-SUPPORT-1
  (ci-dessous).

## Garde (neuve)

`test/killer-lines.test.ts`, `every_killer_line_is_readable` : toute ligne `// killer:` du code est lue par `parseKiller`, puis jugée
par `killerProblem` de `scripts/red-proof.mjs` elle-même, exportée pour la garde et appelée telle quelle (pli du delta : la copie
`problem()` du test est ôtée, une dérive de la fonction ne peut plus laisser la garde verte ; `main` reste derrière `import.meta.main`,
l'import ne lance rien). Contrôles : opérateur de `OPS` (lu dans `red-proof.mjs`, identique dans `mutants/run.mjs`), fichier dans
l'arbre sans segment `..`, code de production ou module d'appui importé par le test (`supportOf`), jamais un `*.test.ts`, ligne
existante, SDL ⇒ `<after>` vide et tout autre opérateur change le texte, `<before>` exactement une fois sur la ligne. Une ancre
périmée rougit la garde. Des lignes synthétiques épinglent chaque issue, pas chaque clause (« pin each outcome ») : neuf issues
(valide, opérateur à trait d'union, `LVR`, ligne périmée, `<before>` ambigu, hors de la fin, SDL avec `<after>`, fichier absent, code de
test), plus six clauses qu'une sonde seule distingue, chacune avec son tueur dans le corps du test : CONST sans changement, chemin avec
`..`, aide de `test/helpers/` que le test n'importe pas, sur l'arbre du dépôt ; chemin hors forme (un `/` de tête, que `join` résout
pourtant dans l'arbre) ; puis, sur un arbre `mkdtemp`, un module d'appui importé par `import type` seul puis par valeur, et un
`<before>` vide sur une ligne de deux caractères (pli de la G2 ciblée : la sonde ne dépend plus de l'en-tête de `red-proof.mjs`).
`git grep` passe par `gitOut` de `test/helpers/git-tracked.ts` (sans les `GIT_*` de l'appelant). Rouge au tronc `591b3a30` par
assertion (`killerProblem` n'y est pas exportée), vert au gel.

`lostOf` de `scripts/mutants/run.mjs` n'applique qu'une partie de ces contrôles : ni « SDL ⇒ `<after>` vide » ni « sans changement »,
ni le confinement realpath (« no realpath confinement (inTree, scripts/mutants/run.mjs:60) » : un fichier atteint par une jonction ou
un lien qui sort de l'arbre y passe) ; et pour lui un module d'appui est un fichier qu'un test des globs importe directement
(`targetsOf`), pas forcément le test porteur.

## Items formés

- KILLER-SDL-AFTER-PARITY-1, étendu au pli du delta puis au pli de la G2 ciblée : `lostOf` de `scripts/mutants/run.mjs` n'exige ni
  « SDL ⇒ `<after>` vide » ni `before !== after` (un CONST sans changement), et `inTree` (`scripts/mutants/run.mjs:60`) n'a pas le
  confinement realpath de `killerProblem` (`scripts/red-proof.mjs:56`) ; `killerProblem` exige les trois. Prix : une condition dans
  `lostOf` et deux cas dans `test/mutants-run.test.ts` ; une condition realpath dans `inTree` et un cas de jonction hors de l'arbre dans
  `test/mutants-run.test.ts`. Déclencheur : le prochain lot outil sur `scripts/mutants/run.mjs`, hors de cette PR (formé, non fait). La
  garde ferme déjà la porte côté tueurs (aucune ligne SDL à `<after>` non vide, ni sans changement, ni hors de l'arbre, au gel) ; les
  lignes `--table` n'y passent pas.
- KILLER-TEST-HELPERS-SUPPORT-1 (décision de MONARK `e7234bd`, voie (a)) : `textOf`, `jsLiteral`, `bellRowOf` et `section` vont sous
  `test/helpers/`, importés par leur fichier de test, et les cinq tueurs retirés y sont réancrés ; les cinq mutations tuent déjà
  (mesuré par MONARK). Lot test seul, porteur RECHERCHES, juste après la fusion de cette PR ; rien n'en est fait ici.

## Fusion du tronc `591b3a30` : cinq ancres périmées

La garde nomme, au tronc fusionné, cinq lignes de `test/verify-harness-liq.test.ts` (l.123, 254, 357, 419, 455) dont le `<before>`
n'est plus sur la ligne visée : `0f5f3f86` (#227) ajoute `CHECK_NAMES` et `failedOf` en l.149-159 de `scripts/verify-harness.mjs`, et
les lignes visées descendent de 11. Chaque ligne est réancrée en place : 319→330, 410→421, 153→164, 172→183, 157→168. Pour la
dernière, le `<before>` figure aussi l.174, le catch du rename ; l.168 est celui de l'écriture du temporaire, que vise le test
`verify_harness_atomic_write_leaves_no_temp`. Tiré seul sur le test déclaré sous lui, chacun le rougit par `ERR_ASSERTION`.

## Erratum (titres)

Les titres de `98062148` (« Merge lot/etude-suite into killer-ops-1 ») et de `aeab2604` (« Killer guard: … ») échouent à `prbody`
(« lot », « killer ») ; `434b3cf3` est antérieur à la règle. Comme pour `464add3e` et `9b7bdc62` (#221, décision de MONARK
`e7234bd`) : erratum, sans réécriture d'historique. Les titres de ce pli sont en anglais simple (la fusion : « Merge the trunk »).

## Pli de la G2 ciblée (MONARK `3b91f1d` : quatre m, tous dans la PR)

1. La sonde du `<before>` vide, voie (b) : elle passe sur un arbre `mkdtemp` (`src/two.mjs`, « ab »), plus sur la l.3 de
   `red-proof.mjs`. Une retouche de cette ligne d'en-tête (« // » → « //  ») laisse la sonde entière ; son tueur `:61` est déplacé
   au-dessus d'elle.
2. Le confinement realpath manque à `lostOf` : dit dans l'en-tête du test (l.7-8), au Summary et ci-dessus ; KILLER-SDL-AFTER-PARITY-1
   l'inclut, avec son prix (formé, non fait).
3. Les deux clauses de `killerProblem` sans sonde (la regex de chemin, l.56 ; l'exclusion `import type` de `supportOf`, l.324) : le corps
   de la pièce `g2f-222-probes.test.ts` (l.18-30) est posé dans la garde après l'ancienne l.47, avec ses deux lignes de tueur ; `problem`
   prend un troisième paramètre `tree = ROOT`.
4. Le tueur `:183` sous Windows : `test/verify-harness-liq.test.ts:422` pose un écouteur `error` sur chaque socket retenue
   (`createTcpServer((socket) => { socket.on("error", () => {}); held.push(socket); })`). Sous win32, la fin de l'enfant remet la
   connexion à zéro ; sans écouteur, le test mourait d'une `ECONNRESET` non interceptée au délai de 60 s de `runCa`. Avec lui, « chacun
   le rougit par `ERR_ASSERTION` » (section « Fusion du tronc ») et « 5 tués par `ERR_ASSERTION` » (preuves), l.85 et l.124 à
   `d7015204`, valent sous les deux plateformes. Mesuré ici sous Linux seulement ; le rejeu Windows est laissé à MONARK (pas d'hôte
   Windows chez RECHERCHES). Conséquence pour la preuve rouge-vert : la l.422 est dans le corps de `verify_harness_bounds_every_request`,
   que red-proof juge donc ; l'écouteur n'ajoute aucune assertion, le test est vert à la base, et red-proof le refuse « green at base ».
   C'est une épingle déclarée, prouvée selon la règle de MONARK (`docs/G0-lot-conformal-oracle-tests.md`, Q-1) : red-proof refuse
   exactement ce test-là comme « green at base » et rien d'autre ; son tueur `:183` est tué par assertion sous
   `scripts/mutants/run.mjs --killers` (voir les preuves).

## Tueurs

- scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"
- dans le corps du test, au-dessus des trois sondes de clause sur l'arbre du dépôt :
  - scripts/red-proof.mjs:60 CONST "k.before === k.after" -> "false"
  - scripts/red-proof.mjs:56 CONST "k.file.split(\"/\").includes(\"..\")" -> "false"
  - scripts/red-proof.mjs:57 CONST "!supportOf(tree, from).includes(k.file)" -> "false"
- dans le corps du test, au-dessus des sondes du chemin hors forme et de l'arbre `mkdtemp` (pli de la G2 ciblée) :
  - scripts/red-proof.mjs:56 CONST "!/^[\\w.@-]+(\\/[\\w.@-]+)*$/.test(k.file) || " -> ""
  - scripts/red-proof.mjs:324 CONST "(?!type\\s)" -> ""
  - scripts/red-proof.mjs:61 CONST "k.before !== \"\" && " -> "" (au-dessus de la sonde du `<before>` vide)

## Preuves

- `node --test` sur les trois fichiers ; garde rouge à la base (`ERR_ASSERTION`, 20 lignes) ; `red-proof --test-only` ; `mutants --killers`
  sur les 20 tueurs réécrits (avant le pli).
- Après le pli : la garde, avant les 7 réécritures, nomme exactement 7 lignes (5 code de test, 2 SDL) ; après, verte. Mutations du
  prédicat : `OPS.includes(k.op)` neutralisé → rouge (la ligne `LVR`) ; une ligne insérée en tête de `scripts/mission/lint.mjs` → rouge.
- Après le pli du delta. Le tronc `591b3a30` est fusionné par `b09bf789` (« Merge the trunk ») ; la fusion est pure : même patch-id
  (`e80c9418…`) pour `1cddd2e5`→`aeab2604` et pour `591b3a30`→`b09bf789`.
  - Garde : au tronc fusionné, avant les réancrages, rouge par `ERR_ASSERTION`, les cinq lignes de `test/verify-harness-liq.test.ts`
    nommées ; après, verte sur 1 567 lignes `// killer:`. Export retiré (l.54) : rouge par `ERR_ASSERTION`. Sur les fichiers de test
    du tronc `591b3a30`, la garde de la tête nomme 32 lignes : 15 illisibles, 5 `LVR`, 2 SDL, 5 code de test, 5 ancres périmées. Avec
    #221 appliquée en plus (tête `76f053eb`, diff de cette PR posé sans commit) : verte sur 1 577 lignes.
  - Mutations de `killerProblem`, tirées seules sur la garde (fichier de test entier, restauration vérifiée par sha256 `adb6a6e6…`) :
    - le tueur `:33` et les quatre du corps : tués par `ERR_ASSERTION` ;
    - des neuf clauses qui survivaient à la copie (G2) : `..`, sans changement, `<before>` vide et aide non importée sont tués par leur
      sonde ; la branche `.test.ts$` rougit la garde par l'ancre de `test/red-proof-support.test.ts:56`, qui la vise, et ce test la
      tue par assertion ; le confinement realpath survit à la garde, `test/red-proof.test.ts` le tue (2 tests) ;
    - la regex de chemin et l'exclusion `import type` de `supportOf` survivent à la garde, à `red-proof.test.ts` et à
      `red-proof-support.test.ts` : hors des quatre sondes décidées, notées ici. `--untracked` est du code de test, jamais muté ;
    - la dérive de la G2 (`|| k.op === "COR"` en l.55) rougit désormais la garde ; OPS neutralisé, `supportOf` qui refuse tout,
      « SDL ⇒ `<after>` vide » retiré, `=== 2` → `>= 2` ou `<= 2`, ligne décalée d'un : tués par assertion ; `existsSync` retiré et le
      contrôle hors bornes retiré la rougissent sans assertion (ENOENT, TypeError).
  - Les cinq tueurs réancrés, tirés seuls sur le test déclaré sous eux : 5 tués par `ERR_ASSERTION`.
  - red-proof `--base 591b3a30 --draw 1 --seed 1` : OK, mode F2P. 1 test jugé, la garde (base `assert-fail`, gel `pass`), 125
    inchangés, aucun refus ; le tueur `:33` tiré est tué par assertion. `RED-PROOF.json` : sha256 `93a2d796…`.
  - Tests touchés et voisins (10 fichiers : killer-lines, mission-lint, oracle-run, dojo-render, public-surfaces-honesty, red-proof,
    red-proof-support, mutants-run, ci-gates, verify-harness-liq) : 226 tests, 223 verts, 3 sautés (corpus hôte absent), 0 rouge.
  - `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres.
  - Taille, forme de la CI (`591b3a30...HEAD`) : 8 fichiers, +87 −33, soit 120 lignes, sous 547.
- Après le pli de la G2 ciblée, mesuré à `a171a0a3` (le tronc `dd9ef99d` n'est pas fusionné ; base de fusion `591b3a30`).
  - Garde verte sur 1 569 lignes `// killer:`. Sur le tronc `dd9ef99d` avec le diff de cette PR posé sans commit : verte sur 1 570, et
    `test/sentinel-no-kata-key.test.ts` (#232) vert. Sur la tête de #221 (`76f053eb`) avec le même diff : 9/9 verts, 1 579 lignes.
    `verifie-ancres` (`coordination/pieces/2026-10-04-fusion-sequence-CM-2/verifie-ancres.mjs`) sur l'arbre : 1 569 tueurs, 1 569
    ANCRE, 0 DERIVE, 0 PERDU.
  - Mutations tirées seules sur la garde (`fire2.mjs`, restauration vérifiée par sha256 `adb6a6e6…`), avec la ligne où tombe l'échec :
    `:33` en l.33 ; `:60`, `:56` (`..`) et `:57` en l.43 ; `:56` (regex de chemin) et `:324` (`import type`) en l.57 ; `:61` en l.63 ;
    l'export retiré en l.30 ; la dérive COR en l.71, le balayage. La retouche de l'en-tête (l.3, « // » → « //  ») laisse la garde
    verte ; avec `:61` en plus, l'échec tombe en l.63, sur la sonde et non sur le balayage.
  - `test/verify-harness-liq.test.ts`, l'écouteur posé : les cinq tueurs réancrés, tirés seuls sur leur test, sont tués par
    `ERR_ASSERTION` sous Linux (`:183` en l.427 : `r.code` vaut `null` au lieu de 1) ; sans mutation, 10/10 verts.
  - `scripts/mutants/run.mjs --repo <arbre> --base 591b3a30 --killers --only K23,K24,K25,K26,K27,K28,K29,K144,K145,K146,K148,K150` (les
    sept tueurs de la garde et les cinq réancrés) : 12 tués sur 12 par assertion, témoin vert (219 tests), restaurations OK ; `:183`
    (K148) en 60,8 s. `RESULTS.json` : sha256 `9f30f85c…`, gel `a171a0a3`, propre.
  - red-proof `--base 591b3a30 --draw 1 --seed 1` : 2 jugés. La garde est F2P (base `assert-fail`, gel `pass`), son tueur `:33` tiré est
    tué par assertion ; `verify_harness_bounds_every_request` est refusé « green at base », l'épingle déclarée ci-dessus, et rien
    d'autre ; 124 inchangés. Sortie 1 pour ce seul refus attendu. `RED-PROOF.json` : sha256 `0a9500ae…`.
  - Tests touchés et voisins (les 10 fichiers ci-dessus) : 226 tests, 223 verts, 3 sautés (corpus hôte absent), 0 rouge.
  - `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres.
  - Taille, forme de la CI (`dd9ef99d...HEAD`, soit depuis la base de fusion `591b3a30`) : 8 fichiers, +106 −34, soit 140 lignes, sous 547.
