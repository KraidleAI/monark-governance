# G0 du lot KILLER-OPS-1 : vingt tueurs que `parseKiller` ne lit pas ou dont l'opérateur sort de la liste fermée (MISSION-LINT-KILLER-OPS-1)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat du vérificateur de MONARK sur le transfert de `wave1.json`.

Auteur : RECHERCHES ; rédaction initiale et pli de la G2 (MONARK, `2026-10-07-MONARK-vers-RECHERCHES-g2-221-222.md`, pièce
`g2-221-222.json` clé `1`, voie (a)) par un worker `claude-opus-5-5` (effort non exposé au worker), horloge du pli lue à 09:15 UTC. Le
pli est construit après la fusion de la PR 2 du registre (#228) : le tronc `1cddd2e5` est fusionné dans la branche, et ses 8 tueurs de
`ci.yml` réancrés y sont verts sans que ce lot les touche.

red-proof: test-only

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
- Les 5 tueurs sur du code de test : retirés en place, avec leur raison sur la ligne (« Not a killer, test code (red-proof and mutants
  mutate production code only) »), la mutation gardée en texte ; aucune ligne ne bouge. Il n'y a pas de code de production à leur place :
  ils éprouvent les décodeurs du test lui-même.

## Garde (neuve)

`test/killer-lines.test.ts`, `every_killer_line_is_readable` : toute ligne `// killer:` du code passe le prédicat complet de
`killerProblem`, recopié dans le test (la fonction n'est pas exportée, et le lot ne touche aucun fichier hors `test/`) : lue par
`parseKiller`, opérateur de `OPS` (lu dans `red-proof.mjs`, identique dans `mutants/run.mjs`), fichier dans l'arbre, code de production
ou module d'appui importé par le test (`supportOf`), ligne existante, SDL ⇒ `<after>` vide, `<before>` exactement une fois sur la ligne.
Une ancre périmée (une ligne insérée en tête de `scripts/mission/lint.mjs`) rougit la garde. Le prédicat est épinglé dans le même test
par neuf lignes synthétiques (valide, opérateur à trait d'union, `LVR`, ligne périmée, `<before>` ambigu, hors de la fin, SDL avec
`<after>`, fichier absent, code de test), chacune nommée par son contrôle. `git grep` passe par `gitOut` de
`test/helpers/git-tracked.ts` (sans les `GIT_*` de l'appelant). Rouge au tronc `1cddd2e5` par assertion, vert au gel.

## Item formé

- KILLER-SDL-AFTER-PARITY-1 : `lostOf` de `scripts/mutants/run.mjs` n'exige pas « SDL ⇒ `<after>` vide », `killerProblem` l'exige.
  Déclencheur : le prochain lot outil sur `scripts/mutants/run.mjs` ; hors de ce lot test seul. La garde ferme déjà la porte côté
  tueurs (aucune ligne SDL à `<after>` non vide au gel).

## Tueurs

- scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"

## Preuves

- `node --test` sur les trois fichiers ; garde rouge à la base (`ERR_ASSERTION`, 20 lignes) ; `red-proof --test-only` ; `mutants --killers`
  sur les 20 tueurs réécrits (avant le pli).
- Après le pli : la garde, avant les 7 réécritures, nomme exactement 7 lignes (5 code de test, 2 SDL) ; après, verte. Mutations du
  prédicat : `OPS.includes(k.op)` neutralisé → rouge (la ligne `LVR`) ; une ligne insérée en tête de `scripts/mission/lint.mjs` → rouge.
