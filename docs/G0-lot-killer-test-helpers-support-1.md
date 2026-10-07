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

Mesurées à `bf9db0a8` (premier commit de la branche), Node v24.21.0, Linux.

- Rouge d'abord, la garde `every_killer_line_is_readable` (`test/killer-lines.test.ts`), seule :
  - les cinq lignes réécrites, les modules absents : rouge par `ERR_ASSERTION`, qui nomme exactement les cinq lignes (« is out of
    scope: not a file inside the gel clone ») ;
  - les modules écrits, pas encore importés : rouge par `ERR_ASSERTION`, les cinq mêmes lignes (« is test code ») ;
  - imports posés, définitions locales ôtées : verte, sur 1 600 lignes `// killer:` (1 595 à la base, plus ces cinq).
- Le code déplacé est celui de la base, octet pour octet, `export` ôté (`diff` des l.72-77 et 386-388 de `dojo-render`, 163-173 de
  `public-surfaces-honesty` et 545 de `red-proof` contre les quatre modules).
- Chaque tueur tiré seul sur le test déclaré sous lui (script du scratchpad : mutation appliquée comme `fire()` de
  `scripts/red-proof.mjs`, test seul en TAP, `classify` de l'outil, restauration vérifiée par sha256) ; sans mutation, chacun est vert :
  - `markup-text.ts:9` SDL, `markup-text.ts:7`, `bell-row.ts:11` et `tap-section.ts:6` : rouges par `ERR_ASSERTION` ;
  - `js-literal.ts:6` : rouge sans assertion, par la `SyntaxError` de `JSON.parse` (« Bad Unicode escape », TAP `ERR_TEST_FAILURE`),
    comme MONARK l'a mesuré avant le déplacement (`:389` → `:388`, `ERR_TEST_FAILURE`). Voir la question ouverte.
- `scripts/mutants/run.mjs --repo <arbre> --base 595d2e4b --killers --only K1,K2,K23,K26,K73` (les cinq tueurs) : témoin vert, 4 tués
  sur 5 par assertion ; K23 (`js-literal.ts:6`) non conclu, et de même au rejeu du fichier entier (2 rouges par `SyntaxError` : son
  test et `dojo_render_header_links_the_snapshot_right_after_docs`, dont le module de stub ne se charge plus). Restaurations OK.
  `RESULTS.json` : sha256 `446e6f1a…`.
- `node scripts/red-proof.mjs --base 595d2e4b --gel bf9db0a8 --test-only` : sortie 1, « red-proof REFUSED: 0 judged, 65 unchanged,
  0 killer(s) drawn ». La porte `--test-only` passe (aucun fichier de production, aucun test retiré, ce G0 déclaré) ; `base.tap` et
  `gel.tap` : 65 verts chacun. Refus par construction : une ligne changée ne juge un test que dans son corps, et une ligne de tueur
  jamais (`judgedOf`, l.134-139) ; ici ne changent que des définitions d'aides, des imports et des lignes de tueur. Le substitut est la
  forme « pinned », rejouée à la main ci-dessus. `RED-PROOF.json` : sha256 `582335c9…` (dépend des chemins).
- `verifie-ancres` (`coordination/pieces/2026-10-04-fusion-sequence-CM-2/verifie-ancres.mjs` de recherches) sur l'arbre : 1 600
  tueurs, 1 600 ANCRE, 0 DERIVE, 0 PERDU ; sur les trois fichiers touchés (`--touched 595d2e4b HEAD --ref 595d2e4b`) : 75, 75 ANCRE.
- Tests touchés et voisins (`killer-lines`, `dojo-render`, `public-surfaces-honesty`, `red-proof`, `red-proof-support`,
  `mutants-run`) : 119 tests, 119 verts.
- `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres.
- Taille, forme de la CI (`origin/lot/etude-suite...HEAD`, sous la lecture épinglée de `lot-size-integration.mjs pin`) : 7 fichiers,
  +46 −27, soit 73 lignes, sous 547.

## Question ouverte

- Le tueur de `jsLiteral` (`js-literal.ts:6`) rougit son test sans assertion : sous `--test-only`, red-proof le refuserait comme
  épingle (« reddens it without an assertion failure », l.278) et `mutants` le compte non conclu. C'était déjà vrai à `:388` ; le
  déplacement ne le change pas. Le faire tuer par assertion demande une ligne dans le corps du test (contrôler la forme du littéral,
  par `assert.match`, avant `JSON.parse`) : hors de la voie (a), non fait ici. Même classe que KILLER-ASSERT-KILL-1 (`docs/ETAT.md`,
  porteur MONARK) ; à MONARK de dire s'il s'y range.
