# G0 du lot KILLER-OPS-1 : vingt tueurs que `parseKiller` ne lit pas ou dont l'opérateur sort de la liste fermée (MISSION-LINT-KILLER-OPS-1)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat du vérificateur de MONARK sur le transfert de `wave1.json`.

red-proof: test-only

## Constat (mesuré à la base, `parseKiller` de `scripts/red-proof.mjs` l.49 sur chaque ligne `// killer:` du code, docs/ hors)

- 1 516 lignes `// killer:` en tête de ligne ; 20 hors convention, que ni `red-proof --draw` ni `mutants --killers` ne tirent :
  - 15 illisibles dans `test/mission-lint.test.ts` (l.63, 66, 69, 73, 84, 98, 99, 114, 125, 128, 147, 162, 166, 178, 184) :
    opérateurs à trait d'union (`remove-anchor`, `drop-chain`, `drop-tail`, `revert-class`, `revert-covers`, `disable-alt`,
    `invert-precedence`, `disable-braces`, `drop-reversed-order`, `drop-haiku`, `revert-tied`, `drop-dirs-check`, `remove-rev-guard`,
    `keep-md-suffix`, `blank-head`) que `(\w+)` refuse ; de plus, numéros de ligne périmés (lot M-2a) et `<before>` paraphrasés
    (`execFileSync(...)`, `(paren|l.N-chain)`) ;
  - 5 lues mais refusées par `killerProblem` et `lostOf` : opérateur `LVR` dans `test/oracle-run.test.ts` (l.218, 219, 283, 347, 348).

## Choix par opérateur

- `LVR` (remplacement d'une valeur littérale) : même mutation que `CONST` (remplacer `<before>` par `<after>` sur la ligne). Étendre la
  liste fermée d'ADR-METHODE-2 D2 pour un synonyme n'ajoute aucune mutation : réécrit en `CONST`, même fichier, ligne, avant et après.
- Les 15 noms libres de M-2a ne sont pas des opérateurs : chaque ligne est réécrite en place (même ligne du test) en `CONST`, `COR` ou
  `SDL`, ancrée sur la ligne actuelle de `scripts/mission/lint.mjs` ou `launch.mjs`, `<before>` exact et unique sur cette ligne, même
  intention de mutation. Aucune autre ligne ne bouge.

## Garde (neuve)

`test/killer-lines.test.ts`, `every_killer_line_is_readable` : toute ligne `// killer:` du code est lue par `parseKiller` avec un
opérateur de `OPS` (lu dans `red-proof.mjs`, identique dans `mutants/run.mjs`). Rouge à la base par assertion (les 20 lignes nommées),
vert au gel.

## Tueurs

- scripts/red-proof.mjs:33 CONST "(\\w+)" -> "(\\w)"

## Preuves

- `node --test` sur les trois fichiers ; garde rouge à la base (`ERR_ASSERTION`, 20 lignes) ; `red-proof --test-only` ; `mutants --killers`
  sur les 20 tueurs réécrits.
