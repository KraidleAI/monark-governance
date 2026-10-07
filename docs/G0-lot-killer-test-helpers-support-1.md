# G0 du lot KILLER-TEST-HELPERS-SUPPORT-1 : quatre aides de test en modules d'appui, les cinq tueurs retirés réancrés

RECHERCHES, 2026-10-07. Base `595d2e4b` (lot/etude-suite, fusion de #222). Définition : `docs/G0-lot-killer-ops-1.md` l.85-87 (« Items
formés ») ; décision de MONARK `e7234bd` (`2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, #222 point 1, voie (a)) ; correctif
(a) de la G2 delta (pièce `g2-221-222-delta.json`, premier constat).

- **Provenance** : worker `claude-opus-5-5`, effort max passé par l'orchestrateur de RECHERCHES, horloge lue (`date -u`) à 13:42 UTC
  pour ce G0. Worktree neuf détaché du scratchpad, branche `recherches/killer-test-helpers-support` ; `git add` par chemins
  explicites ; poussé sans force. Node v24.21.0, Linux.

red-proof: test-only

## Constat, à `595d2e4b`

- Cinq lignes retirées par #222 gardent leur mutation en texte, avec leur raison (« Not a killer, test code (a *.test.ts is never
  mutated) ») : `test/dojo-render.test.ts` l.84, 88 et 389, `test/public-surfaces-honesty.test.ts` l.174, `test/red-proof.test.ts`
  l.548. Elles visent des aides définies dans le fichier de test même : `textOf` (l.74-77 de `dojo-render`), `jsLiteral` (l.388),
  `bellRowOf` (l.165-173 de `public-surfaces-honesty`), `section` (l.545 de `red-proof`). Aucun outil ne les tire.
- La construction qui les rend tirables : un module d'appui sous `test/`, importé par le test porteur. `killerProblem` l'admet
  (`scripts/red-proof.mjs` l.57, par `supportOf` l.322-325 : import statique relatif, par valeur) ; `lostOf` aussi
  (`scripts/mutants/run.mjs` l.123, par `targetsOf` l.84-95 : un test des globs qui l'importe directement).

## Changement (tests seuls)

- Quatre modules neufs sous `test/helpers/`, un par aide, le code déplacé tel quel (mêmes octets, `export` en plus) :
  `markup-text.ts` (`textOf` et sa table `ENTITIES`), `js-literal.ts` (`jsLiteral`), `bell-row.ts` (`bellRowOf` et `BELL_HOST`),
  `tap-section.ts` (`section`).
- Chaque fichier de test importe son aide par un import statique relatif, par valeur, et perd sa définition locale. Aucun corps de test
  ne change.
- Les cinq lignes redeviennent des tueurs, en place : même opérateur, même `<before>`, même `<after>` ; seul `<file>:<line>` change.

## Tueurs

- test/helpers/markup-text.ts:9 SDL ": /^[<>]$/.test(t) ? assert.fail(" -> ""
- test/helpers/markup-text.ts:7 CONST "\"&amp;\": \"&\"" -> "\"&amp;\": \"&amp;\""
- test/helpers/js-literal.ts:6 CONST "c.charCodeAt(0).toString(16).padStart(4, \"0\")" -> "c.charCodeAt(0).toString(16)"
- test/helpers/bell-row.ts:11 CONST "first.startsWith(`https://${BELL_HOST}/`) && u.protocol === \"https:\" && u.host === BELL_HOST" -> "l.includes(BELL_HOST)"
- test/helpers/tap-section.ts:6 CONST "/[\\\\^$.*+?()[\\]{}|]/g, \"\\\\$&\"" -> "/\\./g, \"\\\\.\""

## Preuves

- Rouge d'abord, la garde `every_killer_line_is_readable` (`test/killer-lines.test.ts`), seule :
  - les cinq lignes réécrites, les modules absents : rouge par `ERR_ASSERTION`, qui nomme exactement les cinq lignes (« is out of
    scope: not a file inside the gel clone ») ;
  - les modules écrits, pas encore importés : rouge par `ERR_ASSERTION`, les cinq mêmes lignes (« is test code ») ;
  - imports posés, définitions locales ôtées : verte.
- Les quatre fichiers (`killer-lines`, `dojo-render`, `public-surfaces-honesty`, `red-proof`) : 66 tests, 66 verts, comme à la base.
