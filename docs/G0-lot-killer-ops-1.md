# G0 du lot KILLER-OPS-1 : vingt tueurs que `parseKiller` ne lit pas ou dont l'opérateur sort de la liste fermée (MISSION-LINT-KILLER-OPS-1)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat du vérificateur de MONARK sur le transfert de `wave1.json`.

Auteur : RECHERCHES ; rédaction initiale et pli de la G2 (MONARK, `2026-10-07-MONARK-vers-RECHERCHES-g2-221-222.md`, pièce
`g2-221-222.json` clé `1`, voie (a)) par un worker `claude-opus-5-5`, à l'effort de la session, sans réglage explicite (RECHERCHES,
`2026-10-07-RECHERCHES-vers-MONARK-pr226-close-erratum-21.md`), horloge du pli lue à 09:15 UTC. Le pli est construit après la fusion de
la PR 2 du registre (#228) : le tronc `1cddd2e5` est fusionné dans la branche, et ses 8 tueurs de `ci.yml` réancrés y sont verts sans
que ce lot les touche. Pli du delta G2 (MONARK `e7234bd`, `2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, pièce
`g2-221-222-delta.json` clé `1`) par un worker `claude-opus-5-5`, effort `max` passé par l'orchestrateur de RECHERCHES, horloge lue à
10:48 UTC ; le tronc `591b3a30` est fusionné dans la branche.

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
périmée rougit la garde. Treize lignes synthétiques épinglent chaque issue, pas chaque clause (« pin each outcome ») : neuf issues
(valide, opérateur à trait d'union, `LVR`, ligne périmée, `<before>` ambigu, hors de la fin, SDL avec `<after>`, fichier absent, code de
test), plus quatre clauses qu'une sonde seule distingue, chacune avec son tueur dans le corps du test (CONST sans changement ;
`<before>` vide sur la l.3 de `red-proof.mjs`, « // », deux caractères ; chemin avec `..` ; aide de `test/helpers/` que le test
n'importe pas). `git grep` passe par `gitOut` de `test/helpers/git-tracked.ts` (sans les `GIT_*` de l'appelant). Rouge au tronc
`591b3a30` par assertion (`killerProblem` n'y est pas exportée), vert au gel.

`lostOf` de `scripts/mutants/run.mjs` n'applique qu'une partie de ces contrôles : ni « SDL ⇒ `<after>` vide » ni « sans changement »,
et pour lui un module d'appui est un fichier qu'un test des globs importe directement (`targetsOf`), pas forcément le test porteur.

## Items formés

- KILLER-SDL-AFTER-PARITY-1, étendu au pli du delta : `lostOf` de `scripts/mutants/run.mjs` n'exige ni « SDL ⇒ `<after>` vide » ni
  `before !== after` (un CONST sans changement) ; `killerProblem` exige les deux. Prix : une condition dans `lostOf` et deux cas dans
  `test/mutants-run.test.ts`. Déclencheur : le prochain lot outil sur `scripts/mutants/run.mjs`, hors de cette PR. La garde ferme déjà la
  porte côté tueurs (aucune ligne SDL à `<after>` non vide, ni sans changement, au gel) ; les lignes `--table` n'y passent pas.
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

## Tueurs

- scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"
- dans le corps du test, au-dessus des quatre sondes de clause :
  - scripts/red-proof.mjs:60 CONST "k.before === k.after" -> "false"
  - scripts/red-proof.mjs:61 CONST "k.before !== \"\" && " -> ""
  - scripts/red-proof.mjs:56 CONST "k.file.split(\"/\").includes(\"..\")" -> "false"
  - scripts/red-proof.mjs:57 CONST "!supportOf(tree, from).includes(k.file)" -> "false"

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
