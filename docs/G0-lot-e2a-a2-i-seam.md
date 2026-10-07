# G0 du lot E-2a a2-i : la couture des tables engagées dans la porte, derrière un fil-piège sur les épingles

RECHERCHES, 2026-10-07. Base : la tête de a1-ii, `375783289735e7d110c882a06c7d1eb701dc048b` (branche
`recherches/e2a-a1-ii-set-checks`, PR #236, elle-même sur #233). Plan : G0 court d'E-2a v6.1
(`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), accepté par MONARK (`recherches` `51fe3ee`).

- **Demande** : premier morceau du repli de a2 (plan §5.1), « a2-i (la couture) : `servedPolicyTables(texts, committed)` (~20), les
  8 appels (~14), l.1042 et imports (~8), T-3 (~40), `withRow` (~15), T-4 (~60) » ; rouge à la base du morceau :
  « `kataTablesHoldNoRow` lève sur toute ligne ».
- **Décision de MONARK suivie** (`recherches` `c6dbf78`, message `…-partie-3-v4-controle.md` l.64-65, « Deux alignements ») :
  « P3-R-3 (2) nomme l invariant (« aucune ligne kata servie avant c »), non `kataTablesHoldNoRow` seul. a2 le remplace par
  `kataTablesMatchPins` avec `COMMITTED_TABLES` vide. » Repris par la partie 3 v5 (`recherches` `55447de`, P3-R-3 (2)). Ce lot
  le fait : `COMMITTED_TABLES` reste `{}`, et l'invariant a son propre test et son propre tueur (§2).
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 10:19 UTC pour ce G0. Worktree détaché neuf du scratchpad,
  branche `recherches/e2a-a2-i-seam` ; `node_modules` lié en dur, retiré à la fin. Node 24.21.0, Linux.
- **Pli de la G2 de MONARK** (`recherches` `6fb4653`, message `2026-10-07-MONARK-vers-RECHERCHES-g2-chaine.md` l.49-63, section
  « #237 (a2-i) » ; pièce `pieces/2026-10-07-g2-chaine/g2-237.json`, verdict CORRECTIONS, 1 M et 1 m) : worker `claude-opus-5-5`,
  effort: max, horloge lue (`date -u`) à 12:19 UTC ; worktree détaché neuf du scratchpad à `d2285ee2`, `node_modules` lié en dur,
  retiré à la fin ; Node 24.21.0, Linux. Le pli touche T-3 et ce G0 (§1 à §5) ; aucune ligne de production ne change.
- **Zone** : `apps/harness/src/kata-path.ts` (l.115-129, sur place), `apps/harness/src/tools/gate.ts` (l.62, l.221, l.1041-1042
  sur place ; deux imports en fin de fichier), `apps/harness/test/gate-kata-served.test.ts`, et les appels de
  `apps/harness/test/gate-cell.test.ts`, `kata-path.test.ts`, `policy-row-schema-corpus.test.ts`, plus la liste du graphe servi de
  `policy-table-file.test.ts`.
- **Ordre de fusion** : après a1-ii. Demande en brouillon, base `recherches/e2a-a1-ii-set-checks`.

## 1. Construction

- **`servedPolicyTables(texts, committed)`** (`kata-path.ts` l.117-118) : `committed: ReadonlyMap<string, PolicyTable>`, obligatoire,
  sans défaut ; chaque classe kata est servie par sa table engagée si elle est lue, sinon sans ligne. l.118 garde le texte
  `kataClassEntries(texts.classText)` (ancre du tueur de `kata_path_and_server_load_cold`).
- **`kataTablesMatchPins(tables, committed, held)`** (`kata-path.ts` l.122-129, à la place de `kataTablesHoldNoRow`, même plage de
  lignes) : une classe retenue qui porte une ligne lève (l.125) ; puis l'ensemble des tables kata à lignes doit être exactement
  celui des classes épinglées, chacune à son sha256 épinglé (l.126-127 : une ligne hors des épingles, une classe épinglée sans ligne
  ou à un autre sha256, une épingle qui n'est pas une classe kata servie, lèvent). Il ne lit que ses paramètres (aucun `const` de
  premier niveau de `kata-path.ts`, l.5-6).
- **`gate.ts` l.1042**, une ligne : `kataTablesMatchPins(servedPolicyTables(SERVED_TABLE_TEXTS, readCommittedTables(COMMITTED_FILES,
  kataClassEntries(kataClassText), { tables: COMMITTED_TABLES, held: [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES] })),
  COMMITTED_TABLES, [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES])` (plan §3.1). l.62 importe `kataTablesMatchPins` sur place
  (l'ancre `"../kata-path.ts";` reste) ; le commentaire l.221 suit le nom. Les deux imports neufs sont **en fin de fichier**
  (commentaire l.1072-1073, imports l.1074-1075, épinglés à l'octet par T-3 avec la l.1042 : pli de la G2), seuls ajouts : ESM les
  évalue avant le corps de `gate.ts` quelle que soit leur place, et ni
  `policy-committed.ts` ni `policy-committed-pins.ts` n'importent `gate.ts` ou `kata-path.ts` (aucun cycle neuf ; plan §3.3).
  `kata_path_and_server_load_cold` reste vert dans les deux ordres de chargement.
- **Graphe servi** : `policy-committed.ts` et `policy-committed-pins.ts` y entrent (voulu, plan §3.1) ;
  `served_policy_modules_are_the_four_marginal_ones` les liste. La lecture de disque reste hors de `src/tools/`
  (`mcp_tools_have_no_side_effects` vert).
- **Ancres** : aucune ligne de `gate.ts` ne bouge avant l.1070 ; dans `kata-path.ts`, les 15 ancres hors du fil-piège restent ; celle
  de l.126 (`kata_tables_hold_no_row_tripwire`) part avec son test, remplacé par T-3.
- **La clause n'est pas touchée** (`kataClause`, l.222-240) : elle est le morceau a2-ii, qui attend la ligne Z-3 de MONARK sur le
  texte de l'état engagé (§5).

## 2. Tests rouges et tueurs

| Test | Ce qu'il tient | Rouge à la base (a1-ii) | Tueur |
|---|---|---|---|
| T-3 `kata_tables_match_the_pins` (l.273) | les tables kata à lignes sont exactement les clés de `COMMITTED_TABLES` (l.279, pli) ; les tables servies passent avec les épingles servies ; une table marginale à lignes passe ; une table épinglée à son sha256 passe et sa ligne est servie (`policy_table_sha256`, `policy_row_sha256`) ; une ligne hors épingles, un autre sha256, une classe épinglée sans ligne, une épingle qui n'est pas une classe servie, une classe retenue à ligne même épinglée : refus nommés ; les cas de couture lisent les épingles servies, et la classe sans ligne est `eth-dir-4h`, retenue par le plancher (l.283-288, pli) : T-3 tient aux épingles vides, à celles de c et à celles de c′ (simulées, §3) ; la l.1042 entière (l.295), et les l.1074-1075 qui importent les noms qu'elle lit (l.296, pli), à l'octet | assertion : la fonction est absente | `apps/harness/src/kata-path.ts:125 CONST "held.some((c) => rows(c) > 0)" -> "false"` |
| `no_kata_row_is_served_while_no_table_is_pinned` (l.303) | l'invariant « aucune ligne kata servie avant c » : `COMMITTED_TABLES` est `{}`, les 32 tables kata servies sont vides, et une ligne de bande (`btc-range-1h`, `btc-mae-down-1h`) ou de direction non retenue (`btc-dir-1h`) est refusée sans épingle ; ses l.307 et l.310 rougissent au lot c par construction (§5) | assertion : la fonction est absente | `apps/harness/src/kata-path.ts:127 CONST "off.length > 0" -> "false"` |
| T-4 `committed_tables_reach_the_gate_through_the_seam` (l.325) | deux tables de synthèse (`btc-range-1h`, `btc-mae-down-1h`), projetées, admises par `guardKataTable`, écrites canoniquement et épinglées avec les deux listes retenues réelles, lues par `readCommittedTables` puis servies : `silence` ⇒ `abstain calib_silence` sans région, `region` ⇒ `commit covered` avec sa bande, chaque verdict porte sa ligne et le sha256 de son fichier, `honestyText` rend le texte de ligne et le suffixe | assertion : la fonction est absente | `apps/harness/src/kata-path.ts:118 CONST "committed.get(c.task_class) ?? buildPolicyTable(c, [])" -> "buildPolicyTable(c, [])"` |
| `served_policy_modules_are_the_four_marginal_ones` (`policy-table-file.test.ts`) | le graphe servi compte les deux modules engagés | assertion : la liste diffère | inchangé : `apps/harness/src/policy-served.ts:12` |

- **`withRow`** (l.238) bâtit une ligne fermée (une ligne de synthèse projetée, recléfée sur `DIR_KEY/up-b1`), sa table par
  `buildPolicyTable`, et lit `policy_table_sha256` sur cette table : la table de couture peut ainsi être épinglée (T-3).
  `served_calib_row_abstains_never_defers`, qui l'utilise, reste vert.
- **Les appels** : sept appels de test passent `new Map()` (`gate-cell.test.ts:80`, `kata-path.test.ts:159, 222, 283, 292, 302`,
  `policy-row-schema-corpus.test.ts:35`), le huitième est la l.1042. Ces cinq tests ne changent pas de comportement.

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 375783289735e7d110c882a06c7d1eb701dc048b --gel HEAD --repo <worktree> --out
  <dossier> --draw 4 --seed 1007`, Node 24.21.0, Linux : « 9 judged, 40 unchanged, 4 killer(s) drawn ». Quatre F2P (les trois
  tests neufs et la liste du graphe servi), rouges à la base par assertion ; quatre tueurs tirés, quatre tués. **Sortie 1, attendue et
  déclarée** : les cinq tests dont seul l'appel change sont refusés, « green at base: a self-confirming test »
  (`served_tables_texts_and_sources`, `kata_imposed_params_without_row`, `kata_no_row_verdict_fields`, `kata_served_tables_digests`,
  `policy_row_schema_admits_the_synthetic_kata_tables_and_the_served_tables`). Le paramètre est obligatoire (plan §3.1), donc ces
  appels changent ; leur comportement non. Leurs tueurs déclarés, rejoués à la main au gel (`gate.ts:1038`, `kata-path.ts:60`,
  `kata-path.ts:78`, `policy-served.ts:23`, `schemas/policy-row.schema.json:12`) : cinq tués par assertion. **Rejoué au pli** à
  `41ba62fd` (le commit de test du pli ; celui du G0 ne touche que ce fichier), même commande : même sortie, « 9 judged, 40 unchanged,
  4 killer(s) drawn », les quatre F2P rouges à la base par `assert-fail`, les quatre tueurs tirés tués (`policy-served.ts:12`,
  `kata-path.ts:127`, `kata-path.ts:118`, `kata-path.ts:125`), `RED-PROOF.json` sha256 `210eab7408225ac9…` ; les cinq tueurs déclarés
  rejoués à la main : cinq tués par assertion.
- **Mutants** : balayage des lignes neuves, chacun rejoué sur `gate-kata-served`, `policy-committed` et `kata-path` (38 tests) ; les
  noms M7, M8, M9 et X1 sont ceux de la G2 de MONARK. Mesuré au pli :
  - l.124 (`cell_key_rule` → `true`) : tué, par échec de chargement des deux fichiers qui chargent `gate.ts` (le fil-piège voit les
    tables marginales à lignes) ; il ne sert pas de tueur déclaré.
  - l.126 (quatre mutants : `rows(c) > 0 &&` retiré, égalité de sha256 → `!== undefined`, épingles retirées de l'union, tables à
    lignes retirées de l'union) et l.127 (`off.length > 0` → `false`) : tués par assertion (T-3 ; aussi le test de l'invariant pour
    trois d'entre eux). Le tueur déclaré de T-3 (l.125) le tue toujours, à sa l.290.
  - **M7**, l.1042 (`readCommittedTables(` → carte vide) : avec des épingles vides, aucun octet servi ne change ; tué aujourd'hui par
    l'épingle à l'octet de la l.1042 (T-3 l.295, seul échec). **Tué par T-4b au lot a3** : sur des épingles de bandes de synthèse, la
    table épinglée n'est pas lue et le fil-piège refuse (`not the pinned tables`) ; c'est le tueur déclaré de T-2b et T-4b (plan §6).
  - **M8**, l.1042 (`held` vidé à la lecture) : tué aujourd'hui par la même épingle (T-3 l.295, seul échec). **Tué par T-4b au lot
    a3**, par son cas enfant « classe retenue épinglée » (`btc-dir-1h`, avec fichier et épingle de synthèse ; G2 de MONARK,
    constat M) : la tête refuse au lecteur, « a class both pinned and held back », et M8 au fil-piège, « a held class holds rows ».
  - **M9**, l.1042 (`held` vidé au fil-piège) : **équivalent par construction**, tant que le lecteur et le fil-piège reçoivent la même
    liste retenue : le lecteur refuse une classe épinglée et retenue avant que la l.125 puisse jouer, et une classe non épinglée n'a
    aucune ligne. Aucun test de comportement ne peut le tuer, ni ici ni au lot a3. **Limite nommée, avec sa garde** : l'épingle à
    l'octet de la l.1042 (T-3 l.295), qui tient cette identité (la même expression retenue passée au lecteur et au fil-piège), et le
    tue aujourd'hui (seul échec).
  - **X1**, l.1075 (`ORDER_HELD_CLASSES }` → `FLOOR_HELD_CLASSES as ORDER_HELD_CLASSES }`), et son miroir
    (`ORDER_HELD_CLASSES as FLOOR_HELD_CLASSES`) : un alias de même type change la liste retenue lue par la l.1042 sans toucher un
    octet de celle-ci ; tsc et eslint passent. Ils survivaient à `d2285ee2` (38 tests sur 38 verts sur les trois fichiers ; la G2
    mesure X1 sur 382). Tués au pli par l'épingle à l'octet des l.1074-1075 (T-3 l.296), seul échec, `ERR_ASSERTION`. Sous tsc,
    seules les deux listes retenues sont interchangeables (G2). X1 est aussi tué par le cas « classe retenue épinglée » de T-4b au
    lot a3 : il charge au lieu du refus.
- **Épingles de c et de c′, simulées** (pli, m de la G2) : dans un arbre d'archive de la tête, 24 tables de bande de synthèse (graine
  41, autre que celle des tests, pour que les tables épinglées diffèrent de leurs tables de synthèse), écrites canoniquement dans
  `apps/harness/data/kata/tables/` et épinglées, les 8 classes dir retenues ; puis 28 (les 4 dir-1h en plus), `ORDER_HELD_CLASSES`
  vidée. Le chargement passe aux deux états. Chaque instruction rouge de T-3 et du test de l'invariant est neutralisée à son tour,
  jusqu'au vert. À `d2285ee2`, aux épingles de c : T-3 rougit aux l.279, 280, 285, 286, 287, 289, 290 et 292 (la l.294 en suite),
  l'invariant aux l.307 et 310. Au pli : T-3 est vert aux deux états ; seules les l.307 et 310 de l'invariant rougissent (§5). Avant
  le choix de `eth-dir-4h`, T-3 rougissait aux épingles de c′, ses l.284 et 288, où `eth-dir-1h` porte des lignes.
- **Octets servis inchangés** (épingles vides) : suite du harnais et tests des surfaces servies (`harness-served`,
  `spec-1-1-0-release`, `surfaces-1-1-0`, `export-public` dont l'export public et sa CI (test 42), `public-surfaces-honesty`,
  `spec-retire-path`, `harness-export`, `cra-b`, `runbook-retire`, `short-digest-floor`) : 387 tests, 387 verts. `published_tables_are_the_served_tables_byte_for_byte`
  et `kata_served_tables_digests` (épingle `8da5dd42…` des 35 paires servies) restent verts sans retouche.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  37578328` : 8 fichiers, aucun risque Windows.
- **Rejoué au pli** (arbre du pli, ce G0 compris) : la même suite, 387 tests, 387 verts (121 s) ; `tsc --noEmit` 0 ; `eslint .` 0 ;
  `gate:vocab` 0 (350 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base 37578328` : 8 fichiers,
  aucun risque Windows ; `verifie-ancres` (`--ref d2285ee2 --ref 37578328`) : 1 527 tueurs, 1 527 ancrés, 0 dérivé, 0 perdu.

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a1-ii) : 7 fichiers, 131 insertions, 37 suppressions, **168** (plan : ~314 à
  ×2, 408 à +30 %).
- Au pli, même mesure à `41ba62fd` : **168** inchangé (7 fichiers, 131 insertions, 37 suppressions) ; les lignes que le pli change
  dans T-3 sont déjà neuves face à la base, et ce G0 est hors du compte. `git diff --shortstat d2285ee2 41ba62fd` : 1 fichier, 10
  insertions, 10 suppressions.

## 5. Ce qui n'est pas fait

- **a2-ii (la clause)** : `kataClause` à deux états, T-2 en processus, T-12 à deux états, `kata_clause_reads_its_names_and_tau_cap`
  avec `committed` vide explicite, le cinquième élément de `spec-1-1-0-release.test.ts` l.130. Les octets de l'état engagé sont fixés
  par une ligne Z-3 de MONARK sur le texte de RECHERCHES (plan §3.3) ; cette ligne n'est pas posée à 10:19 UTC (aucune occurrence
  dans les messages de MONARK). a2 entier tiendrait sous 547 (168 mesurées, ~146 estimées pour a2-ii) ; la coupe est gardée pour ne
  pas lier la couture à Z-3.
- Le lanceur et le processus fils (T-2b, T-4b) : lot a3. Les épingles restent vides jusqu'au lot c. T-4b y reçoit le cas enfant
  « classe retenue épinglée » (`btc-dir-1h`, avec fichier et épingle de synthèse), qui attend le refus du lecteur, « a class both
  pinned and held back » (G2 de MONARK, constat M ; plan E-2a §6, ligne T-4b) : il tue M8 et X1 par comportement (§3).
- **Ligne datée 2026-10-07 (pli de la G2 de MONARK, `recherches` `6fb4653`, constat m) : quatre assertions tenaient aux épingles
  vides et rougiraient au lot c**, qui écrit les épingles. À `d2285ee2` : dans T-3, `PINS.COMMITTED_TABLES` deepEqual `{}` (l.279) et
  « every served kata table is empty » (l.280) ; dans `no_kata_row_is_served_while_no_table_is_pinned`, `PINS.COMMITTED_TABLES`
  deepEqual `{}` (l.307) et `[32, 0]` (l.310). Ce que c en fait :
  - les l.279-280 de T-3 deviennent, **dès ce pli**, une seule assertion, « the kata tables with rows are exactly the keys of
    COMMITTED_TABLES » (l.279) ; ses cas de couture lisent les épingles servies, et sa classe sans ligne est `eth-dir-4h` (l.283-288).
    La simulation du §3 trouvait, à `d2285ee2`, six instructions de plus de T-3 qui rougissaient à c, hors des quatre de la G2. T-3
    reste vert à c et à c′ (simulé, §3) : c ne le touche pas ;
  - les l.307 et l.310 du test de l'invariant rougissent à c par construction : ce rouge est voulu, c'est le signal que P3-R-3 (2)
    est levé. **Le lot c réécrit ce test (ou le retire), avec la ligne datée qui lève P3-R-3 (2).** Même ligne au plan E-2a §6
    (`recherches`, ligne de T-3, qui porte désormais le lot c).
