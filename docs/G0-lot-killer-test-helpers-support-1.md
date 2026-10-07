# G0 du lot KILLER-TEST-HELPERS-SUPPORT-1 : quatre aides de test en modules d'appui, les cinq tueurs retirés réancrés

RECHERCHES, 2026-10-07. Base `595d2e4b` (lot/etude-suite, fusion de #222). Définition : `docs/G0-lot-killer-ops-1.md` l.85-87 (« Items
formés ») ; décision de MONARK `e7234bd` (`2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, #222 point 1, voie (a)) ; correctif
(a) de la G2 delta (pièce `g2-221-222-delta.json`, premier constat).

- **Provenance** : worker `claude-opus-5-5`, effort max passé par l'orchestrateur de RECHERCHES, horloge lue (`date -u`) à 13:42 UTC
  pour ce G0, puis à 15:03 UTC pour l'`assert.match` de `jsLiteral` (`690f97b6`, autre worktree neuf détaché). Worktree neuf détaché
  du scratchpad, branche `recherches/killer-test-helpers-support` ; `git add` par chemins explicites ; poussé sans force. Node v24.21.0,
  Linux.

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
- Chaque fichier de test importe son aide par un import statique relatif, par valeur, et perd sa définition locale.
- Les cinq lignes redeviennent des tueurs, en place : même opérateur, même `<before>`, même `<after>` ; seul `<file>:<line>` change.
- Un seul corps de test change (`690f97b6`, décision de MONARK `0517303`, `2026-10-07-MONARK-vers-RECHERCHES-239.md`, point 1) : dans
  `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal`, le contrôle de forme du littéral sort du tableau du `deepEqual`
  et devient `assert.match(lit, /^"(?:\\u[0-9a-f]{4})*"$/, JSON.stringify(s))`, posé avant l'écriture du module et avant `JSON.parse`.

## Tueurs

- test/helpers/markup-text.ts:9 SDL ": /^[<>]$/.test(t) ? assert.fail(" -> ""
- test/helpers/markup-text.ts:7 CONST "\"&amp;\": \"&\"" -> "\"&amp;\": \"&amp;\""
- test/helpers/js-literal.ts:6 CONST "c.charCodeAt(0).toString(16).padStart(4, \"0\")" -> "c.charCodeAt(0).toString(16)"
- test/helpers/bell-row.ts:11 CONST "first.startsWith(`https://${BELL_HOST}/`) && u.protocol === \"https:\" && u.host === BELL_HOST" -> "l.includes(BELL_HOST)"
- test/helpers/tap-section.ts:6 CONST "/[\\\\^$.*+?()[\\]{}|]/g, \"\\\\$&\"" -> "/\\./g, \"\\\\.\""

## Preuves

Mesurées à `bf9db0a8` (premier commit de la branche), sauf celles datées de `690f97b6` (l'`assert.match`), Node v24.21.0, Linux.

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
    comme MONARK l'a mesuré avant le déplacement (`:389` → `:388`, `ERR_TEST_FAILURE`). À `690f97b6`, rouge par `ERR_ASSERTION`
    (opérateur `match`, dès la première entrée `"/dojo"`, littéral muté `"\u2f\u64\u6f\u6a\u6f"`) ; vert sans mutation.
- `scripts/mutants/run.mjs --repo <arbre> --base 595d2e4b --killers --only K1,K2,K23,K26,K73` (les cinq tueurs) : témoin vert, 4 tués
  sur 5 par assertion ; K23 (`js-literal.ts:6`) non conclu, et de même au rejeu du fichier entier (2 rouges par `SyntaxError` : son
  test et `dojo_render_header_links_the_snapshot_right_after_docs`, dont le module de stub ne se charge plus). Restaurations OK.
  `RESULTS.json` : sha256 `446e6f1a…`. À `690f97b6`, même commande : témoin vert, 5 tués sur 5 par assertion, K23 compris, sortie 0 ;
  restaurations OK ; `RESULTS.json` : sha256 `18198a12…`.
- `node scripts/red-proof.mjs --base 595d2e4b --gel 690f97b6 --test-only` : sortie 0, « red-proof OK: 1 judged, 64 unchanged,
  0 killer(s) drawn ». La porte `--test-only` passe (aucun fichier de production, aucun test retiré, ce G0 déclaré) ; `base.tap` et
  `gel.tap` : 65 verts chacun. Le test jugé, par la ligne de l'`assert.match` dans son corps, est
  `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal` : « pinned », le substitut F2P de `--test-only` (vert à la base et
  au gel, son tueur listé ici), et son tueur `js-literal.ts:6`, tiré au gel, le rougit par assertion (« killer killed »,
  `assert-fail`). `RED-PROOF.json` : sha256 `81ef6a72…` (dépend des chemins). À `bf9db0a8`, la même commande sortait 1 (« 0 judged,
  65 unchanged ») : une ligne changée ne juge un test que dans son corps, et une ligne de tueur jamais (`judgedOf`, l.134-139), or n'y
  changeaient que des définitions d'aides, des imports et des lignes de tueur ; les quatre autres tueurs restent prouvés par les tirs
  à la main ci-dessus et par `mutants`.
- `verifie-ancres` (`coordination/pieces/2026-10-04-fusion-sequence-CM-2/verifie-ancres.mjs` de recherches) sur l'arbre : 1 600
  tueurs, 1 600 ANCRE, 0 DERIVE, 0 PERDU ; sur les trois fichiers touchés (`--touched 595d2e4b HEAD --ref 595d2e4b`) : 75, 75 ANCRE.
  Mêmes comptes à `690f97b6`, où la garde `every_killer_line_is_readable` reste verte.
- Tests touchés et voisins (`killer-lines`, `dojo-render`, `public-surfaces-honesty`, `red-proof`, `red-proof-support`,
  `mutants-run`) : 119 tests, 119 verts, à `bf9db0a8` comme à `690f97b6`.
- `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres, à `bf9db0a8` comme
  à `690f97b6`.
- Taille, forme de la CI (`origin/lot/etude-suite...HEAD`, sous la lecture épinglée de `lot-size-integration.mjs pin`) : à `690f97b6`,
  7 fichiers, +48 −28, soit 76 lignes, sous 547 (à `bf9db0a8` : +46 −27).

## Point clos

- KILLER-ASSERT-KILL-1, pour `jsLiteral` : clos dans cette PR sur décision de MONARK (`0517303`, point 1), le test contrôlant la forme
  du littéral par `assert.match` avant `JSON.parse` (`690f97b6`), si bien que le tueur `js-literal.ts:6` le rougit par assertion, que
  `mutants` le compte tué et que red-proof `--test-only` l'épingle, sortie 0.
