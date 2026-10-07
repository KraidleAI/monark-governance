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
  (l.1072-1075), seuls ajouts : ESM les évalue avant le corps de `gate.ts` quelle que soit leur place, et ni
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
| T-3 `kata_tables_match_the_pins` (l.273) | les tables servies passent avec les épingles servies ; une table marginale à lignes passe ; une table épinglée à son sha256 passe et sa ligne est servie (`policy_table_sha256`, `policy_row_sha256`) ; une ligne hors épingles, un autre sha256, une classe épinglée sans ligne, une épingle qui n'est pas une classe servie, une classe retenue à ligne même épinglée : refus nommés ; la l.1042 entière, à l'octet | assertion : la fonction est absente | `apps/harness/src/kata-path.ts:125 CONST "held.some((c) => rows(c) > 0)" -> "false"` |
| `no_kata_row_is_served_while_no_table_is_pinned` (l.303) | l'invariant « aucune ligne kata servie avant c » : `COMMITTED_TABLES` est `{}`, les 32 tables kata servies sont vides, et une ligne de bande (`btc-range-1h`, `btc-mae-down-1h`) ou de direction non retenue (`btc-dir-1h`) est refusée sans épingle | assertion : la fonction est absente | `apps/harness/src/kata-path.ts:127 CONST "off.length > 0" -> "false"` |
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
  `kata-path.ts:78`, `policy-served.ts:23`, `schemas/policy-row.schema.json:12`) : cinq tués par assertion.
- **Mutants équivalents** : balayage des lignes neuves, chacun rejoué sur les tests du harnais touchés : l.124 (`cell_key_rule`
  → `true`), l.126 (quatre mutants : `rows(c) > 0 &&` retiré, égalité de sha256 → `!== undefined`, épingles retirées de l'union,
  tables à lignes retirées de l'union), l.127 (`off.length > 0` → `false`), l.1042 (`readCommittedTables(` → carte vide, `held` vidé
  à la lecture, `held` vidé au fil-piège) : tous tués. Les trois mutants de la l.1042 ne sont tués ici que par l'épingle du texte de la
  ligne dans T-3 : avec des épingles vides, ils ne changent aucun octet servi. Leur preuve de comportement est au lot a3 (T-4b, processus
  fils sur des épingles de synthèse non vides).
- **Octets servis inchangés** (épingles vides) : suite du harnais et tests des surfaces servies (`harness-served`,
  `spec-1-1-0-release`, `surfaces-1-1-0`, `export-public` dont l'export public et sa CI (test 42), `public-surfaces-honesty`,
  `spec-retire-path`, `harness-export`, `cra-b`, `runbook-retire`, `short-digest-floor`) : 387 tests, 387 verts. `published_tables_are_the_served_tables_byte_for_byte`
  et `kata_served_tables_digests` (épingle `8da5dd42…` des 35 paires servies) restent verts sans retouche.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  37578328` : 8 fichiers, aucun risque Windows.

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a1-ii) : 7 fichiers, 131 insertions, 37 suppressions, **168** (plan : ~314 à
  ×2, 408 à +30 %).

## 5. Ce qui n'est pas fait

- **a2-ii (la clause)** : `kataClause` à deux états, T-2 en processus, T-12 à deux états, `kata_clause_reads_its_names_and_tau_cap`
  avec `committed` vide explicite, le cinquième élément de `spec-1-1-0-release.test.ts` l.130. Les octets de l'état engagé sont fixés
  par une ligne Z-3 de MONARK sur le texte de RECHERCHES (plan §3.3) ; cette ligne n'est pas posée à 10:19 UTC (aucune occurrence
  dans les messages de MONARK). a2 entier tiendrait sous 547 (168 mesurées, ~146 estimées pour a2-ii) ; la coupe est gardée pour ne
  pas lier la couture à Z-3.
- Le lanceur et le processus fils (T-2b, T-4b) : lot a3. Les épingles restent vides jusqu'au lot c.
