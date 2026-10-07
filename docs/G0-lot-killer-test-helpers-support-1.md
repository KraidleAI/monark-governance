# G0 du lot KILLER-TEST-HELPERS-SUPPORT-1 : quatre aides de test en modules d'appui, les cinq tueurs retirés réancrés

RECHERCHES, 2026-10-07. Base `595d2e4b` (lot/etude-suite, fusion de #222). Définition : `docs/G0-lot-killer-ops-1.md` l.85-87 (« Items
formés ») ; décision de MONARK `e7234bd` (`2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, #222 point 1, voie (a)) ; correctif
(a) de la G2 delta (pièce `g2-221-222-delta.json`, premier constat).

- **Provenance** : worker `claude-opus-5-5`, effort max passé par l'orchestrateur de RECHERCHES, horloge lue (`date -u`) à 13:42 UTC
  pour ce G0, puis à 15:03 UTC pour son pli (`220d77d0`) ; l'`assert.match` de `jsLiteral` est `690f97b6` (commit de 14:56 UTC, autre
  worktree neuf détaché). Plis de la G2 de MONARK : instance neuve `claude-opus-5-5`, effort max, horloge lue à 16:30 UTC, autre
  worktree neuf détaché. Worktree neuf détaché du scratchpad, branche `recherches/killer-test-helpers-support` ; `git add` par chemins
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

- Quatre modules neufs sous `test/helpers/`, un par aide : `markup-text.ts` (`textOf` et sa table `ENTITIES`), `js-literal.ts`
  (`jsLiteral`), `bell-row.ts` (`bellRowOf` et `BELL_HOST`), `tap-section.ts` (`section`). Code déplacé à l'octet, `export` en plus ;
  en-tête, import d'`assert` et commentaire de section ajoutés : l'en-tête de deux lignes de chaque module (l.1-2), l'import d'`assert`
  de `markup-text.ts` et de `bell-row.ts` (l.3), le commentaire de doc de `section` (`tap-section.ts` l.4-5, absent de la base).
- Chaque fichier de test importe son aide par un import statique relatif, par valeur, et perd sa définition locale.
- Les cinq lignes redeviennent des tueurs, en place : même opérateur, même `<before>`, même `<after>` ; seul `<file>:<line>` change.
- Un seul corps de test change (`690f97b6`, décision de MONARK `0517303`, `2026-10-07-MONARK-vers-RECHERCHES-239.md`, point 1) : dans
  `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal`, le contrôle de forme du littéral sort du tableau du `deepEqual`
  et devient `assert.match(lit, /^"(?:\\u[0-9a-f]{4})*"$/, JSON.stringify(s))`, posé avant l'écriture du module et avant `JSON.parse`.
- Un commentaire hors corps change (`eb7279a9`, m-5 de la G2 de MONARK) : `test/bell-legal.test.ts` l.33 donnait la source de sa
  constante `PROBATIVE` par une ligne périmée, `test/public-surfaces-honesty.test.ts:41` (vide dès la base, où la constante était en
  l.45 ; en l.46 depuis l'import de `bellRowOf`). Il la nomme désormais par son nom ; elle est identique à l'octet dans les deux
  fichiers. Ligne réécrite en place : aucune ligne ne bouge, et aucun tueur ne vise ce fichier.

## Tueurs

- test/helpers/markup-text.ts:9 SDL ": /^[<>]$/.test(t) ? assert.fail(" -> ""
- test/helpers/markup-text.ts:7 CONST "\"&amp;\": \"&\"" -> "\"&amp;\": \"&amp;\""
- test/helpers/js-literal.ts:6 CONST "c.charCodeAt(0).toString(16).padStart(4, \"0\")" -> "c.charCodeAt(0).toString(16)"
- test/helpers/bell-row.ts:11 CONST "first.startsWith(`https://${BELL_HOST}/`) && u.protocol === \"https:\" && u.host === BELL_HOST" -> "l.includes(BELL_HOST)"
- test/helpers/tap-section.ts:6 CONST "/[\\\\^$.*+?()[\\]{}|]/g, \"\\\\$&\"" -> "/\\./g, \"\\\\.\""

## Preuves

Mesurées à `bf9db0a8` (premier commit de la branche), sauf celles datées de `690f97b6` (l'`assert.match`) ou de `eb7279a9` (le
commentaire de `bell-legal`), Node v24.21.0, Linux.

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
  restaurations OK ; `RESULTS.json` : sha256 `18198a12…`. Ces deux sha256 sont des traces du run, non rejouables : l'heure du run
  (`start`, `end`) et ses chemins y entrent.
- `node scripts/red-proof.mjs --base 595d2e4b --gel 690f97b6 --test-only` : sortie 0, « red-proof OK: 1 judged, 64 unchanged,
  0 killer(s) drawn ». La porte `--test-only` passe (aucun fichier de production, aucun test retiré, ce G0 déclaré) ; `base.tap` et
  `gel.tap` : 65 verts chacun. Le test jugé, par la ligne de l'`assert.match` dans son corps, est
  `dojo_render_header_stub_writes_any_pathname_as_a_closed_literal` : « pinned », le substitut F2P de `--test-only` (vert à la base et
  au gel, son tueur listé ici), et son tueur `js-literal.ts:6`, tiré au gel, le rougit par assertion (« killer killed »,
  `assert-fail`). Empreinte rejouable, `gel.digest` (statut, chemin et sha256 de chaque fichier changé hors docs, `scripts/red-proof.mjs`
  l.260) : `c8faeafe028b589d…`, la même à `690f97b6` et à `220d77d0`. Le sha256 de `RED-PROOF.json`, `81ef6a72…`, n'est qu'une trace
  du run, non rejouable : l'heure du run, les chemins et les sha256 des TAP, qui suivent les durées, y entrent. À `bf9db0a8`, la même
  commande sortait 1 (« 0 judged, 65 unchanged ») : une ligne changée ne juge un test que dans son corps, et une ligne de tueur jamais
  (`judgedOf`, l.134-139), or n'y changeaient que des définitions d'aides, des imports et des lignes de tueur ; les quatre autres
  tueurs restent prouvés par les tirs à la main ci-dessus et par `mutants`.
- À `eb7279a9`, même commande : sortie 0, « red-proof OK: 1 judged, 67 unchanged, 0 killer(s) drawn ». `bell-legal.test.ts` entre au
  run sans qu'aucun de ses trois tests soit jugé (sa ligne changée est hors de tout corps) ; `base.tap` et `gel.tap` : 68 verts
  chacun ; même test épinglé, même tueur tué par assertion. `gel.digest` : `2ed50dd9b31e55ce…`, qui couvre aussi ce fichier.
- `verifie-ancres` (`coordination/pieces/2026-10-04-fusion-sequence-CM-2/verifie-ancres.mjs` de recherches) sur l'arbre : 1 600
  tueurs, 1 600 ANCRE, 0 DERIVE, 0 PERDU ; sur les trois fichiers touchés (`--touched 595d2e4b HEAD --ref 595d2e4b`) : 75, 75 ANCRE.
  Mêmes comptes à `690f97b6` et à `eb7279a9` (le quatrième fichier de test touché, `bell-legal`, ne porte aucun tueur), où la garde
  `every_killer_line_is_readable` reste verte.
- Tests touchés et voisins (`killer-lines`, `dojo-render`, `public-surfaces-honesty`, `red-proof`, `red-proof-support`,
  `mutants-run`) : 119 tests, 119 verts, à `bf9db0a8` comme à `690f97b6` ; à `eb7279a9`, avec `bell-legal` : 122, 122 verts.
- `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres, à `bf9db0a8`, à
  `690f97b6` et à `eb7279a9`.
- Taille, forme de la CI (`origin/lot/etude-suite...HEAD`, sous la lecture épinglée de `lot-size-integration.mjs pin`) : à `eb7279a9`,
  8 fichiers, +49 −29, soit 78 lignes, sous 547 (à `690f97b6` : 7 fichiers, +48 −28 ; à `bf9db0a8` : +46 −27).

## Point clos

- KILLER-ASSERT-KILL-1, pour `jsLiteral` : clos dans cette PR sur décision de MONARK (`0517303`, point 1), le test contrôlant la forme
  du littéral par `assert.match` avant `JSON.parse` (`690f97b6`), si bien que le tueur `js-literal.ts:6` le rougit par assertion, que
  `mutants` le compte tué et que red-proof `--test-only` l'épingle, sortie 0. L'item reste ouvert pour ses deux tueurs d'origine
  (`guard_adr_cause_under_decisions_only` et `w2_guard_tail_m_and_support`, `docs/ETAT.md` l.989-991 au tronc `102b44d3`, porteur
  MONARK) : seul le cas de `jsLiteral` est clos ici.

## Pli de la G2 de MONARK (CORRECTIONS, 2026-10-07)

Pièce `coordination/pieces/2026-10-07-passation-g2/G2-239.json` de recherches, lue à `220d77d0`. Commits ajoutés, aucune réécriture.
- **M-1** : la tête `220d77d0` n'était pas verte (« Analyze (javascript-typescript) » en échec à l'envoi de ses résultats,
  « CodeQL » neutre). Tout push relance l'analyse, celui de ce pli compris ; le commentaire public de la PR le dit désormais.
- **m-1** : la provenance rend 15:03 UTC au pli du G0 (`220d77d0`) et date l'`assert.match` (`690f97b6`) de 14:56 UTC.
- **m-2** : « Preuves » cite l'empreinte `gel.digest` ; les sha256 de `RESULTS.json` et de `RED-PROOF.json` y restent comme traces non
  rejouables.
- **m-3** : « Point clos » dit que KILLER-ASSERT-KILL-1 reste ouvert pour ses deux tueurs d'origine.
- **m-4** : « Changement » dit ce qui s'ajoute au code déplacé : en-têtes, imports d'`assert`, commentaire de doc de `section`.
- **m-5** : plié par `eb7279a9` (« Changement ») ; ancres, garde, tests, portes et red-proof rejoués à ce commit (« Preuves »).
