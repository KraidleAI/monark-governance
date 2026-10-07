# G0 du lot E-2a a1-i : le module d'épingles des tables engagées et le lecteur fermé, règles de structure

RECHERCHES, 2026-10-07. Base `1cddd2e5` (`lot/etude-suite`, `1cddd2e5a4cb54791db16e704beae8e7af41152a`, lue par `git fetch
+refs/heads/lot/etude-suite:refs/remotes/origin/lot/etude-suite`). Plan : G0 court d'E-2a v6.1
(`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), accepté par MONARK (`recherches` `51fe3ee`).

- **Demande** : lot a1 du plan (§5, ligne a1 : ~460 attendues, 598 à +30 % > 547), donc **le repli a1-i / a1-ii du §5.1 joue**. Ce
  lot est **a1-i** : « `policy-committed-pins.ts` (~25) ; lecteur avec ses règles de structure (classe épinglée ⇔ fichier, sha256
  épinglé, octets canoniques, `row_format`, `table.class`, `assertPolicyTableFile`, dossier absent ⇔ épingles vides) (~50) ; leurs
  cas de T-1 (~70) » (§5.1). a1-ii (règles d'ensemble, ligne réservée, `registry.ts` l.15-16) suit, empilé sur ce lot.
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:33 UTC au début, 09:40 pour ce G0. Worktree détaché neuf
  du scratchpad, branche `recherches/e2a-a1-i-committed-pins` ; `node_modules` lié en dur depuis un autre worktree du scratchpad,
  retiré à la fin. Node 24.21.0, Linux.
- **Zone** : `apps/harness/src/policy-committed-pins.ts` (neuf), `apps/harness/src/policy-committed.ts` (neuf),
  `apps/harness/test/policy-committed.test.ts` (neuf). Aucun fichier existant n'est touché.
- **Ordre de fusion** (plan §4, §5) : a1 fusionne après 1f et 2a, dans l'ordre de la chaîne ; d'où une demande en brouillon. Le lot
  ne dépend d'aucun des deux (il ne lit ni la liste ni un rapport) : il se construit et se prouve sur le tronc.

## 1. Construction

- **`policy-committed-pins.ts`** (24 lignes, aucun import) : au-dessus du bloc marqué, écrites par un lot et sa ligne datée, jamais
  par l'écrivain (plan §3.1) : `FLOOR_HELD_CLASSES` = les quatre `*-dir-4h` (l.9) ; `ORDER_HELD_CLASSES` = les quatre `*-dir-1h`
  (l.11) ; `COMMITTED_RETIRE_LISTS: readonly { file, sha256 }[]`, vide (l.13) ; `COMMITTED_REPORTS: readonly { release, file,
  report_sha256, scope }[]`, vide (l.19), la table d'épingles par release `{report_sha256 → scope}` du G0 de la partie 3 (§3.3,
  §5.2, P-5 ; REPORT-HELD-SET-PER-RELEASE-1), à quatre champs (plan §3.1, pli m-9 de la v5) ; `release` est une chaîne : l'écrivain
  b1-a la ferme (`report_release_unknown`, `report_release_duplicate`, `report_scope_not_release`). Bloc marqué (l.21-24), réécrit
  par l'écrivain : `COMMITTED_TABLES = {}` et `COMMITTED_REGISTRY = null`, vides.
- **`policy-committed.ts`** (64 lignes ; imports `node:crypto`, `node:fs`, `node:url`, `@monark/contracts`,
  `./policy-table-file.ts`) :
  - `TABLES_DIR` (l.25) : `apps/harness/data/kata/tables/`, par `import.meta.url` (précédent `schema-projection.ts` l.48) ;
  - `readTablesDir(dir)` (l.28-37) : les octets de chaque fichier, clé = nom sans `.json` ; carte vide si le dossier est absent ; un
    nom qui ne finit pas par `.json` lève ;
  - `COMMITTED_FILES` (l.40) : la seule lecture de disque, au chargement du module ; **le dossier est absent, la carte est vide** ;
  - `readCommittedTables(files, entries, pins)` (l.47-64), pure : `pins = { tables, held }` (`held` est lu par a1-ii). Refus nommés,
    dans cet ordre : dossier absent ou vide et classes épinglées (l.49) ; fichier sans épingle (l.50) ; classe épinglée sans fichier
    (l.53) ; octets d'un autre sha256 que l'épingle (l.54) ; octets qui ne sont pas l'écriture canonique de leur valeur (l.56 :
    comparaison des octets, si bien qu'un octet UTF-8 invalide est refusé aussi) ; `row_format` autre que `class-policy-v2` (l.57) ;
    classe épinglée sans entrée kata (l.58) ; `table.class` différente de l'entrée attendue (l.59) ; `assertPolicyTableFile` (l.60).
    Il rend la table de chaque classe épinglée, triée par classe. Il ne rejoue pas la garde (E2A-SERVED-GUARD-PROOF-1).
- **Aucun octet servi ne bouge** : ni `gate.ts` ni `kata-path.ts` n'importent ces modules (couture au lot a2) ; le dossier `tables/`
  n'existe pas et les épingles sont vides.

## 2. Tests rouges et tueurs

Tous dans `apps/harness/test/policy-committed.test.ts`, rouges à la base parce que les modules sont absents (`new-module`). Fichiers
de table de synthèse : entrées de `kataClassEntries`, lignes projetées du registre de synthèse (`helpers/synthetic-registry.ts`).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `committed_tables_reader_refuses_each_departure` (T-1, structure) | deux tables admises, rendues triées même si les épingles ne le sont pas ; refus nommés : sha256 d'une autre table, LF final, JSON espacé, octet UTF-8 invalide, `row_format` autre, valeur `null`, texte de classe autre, table d'une autre classe, lignes non triées, classe hors des entrées | `apps/harness/src/policy-committed.ts:54 CONST "sha(bytes) !== pins.tables[cls]" -> "false"` |
| `committed_tables_reader_pairs_each_pin_with_its_file` (T-1) | fichier sans épingle ; épingle sans fichier ; dossier absent avec épingles ; dossier absent sans épingle : carte vide | `apps/harness/src/policy-committed.ts:50 SDL "for (const cls of files.keys())" -> ""` |
| `committed_tables_folder_is_absent_and_read_once` (T-1, dossier absent ⇔ épingles vides) | `TABLES_DIR` est `apps/harness/data/kata/tables/` et n'existe pas ; `COMMITTED_FILES` vide ; le lecteur rend une carte vide sur les épingles réelles ; `readTablesDir` sur un dossier jetable (absent, deux fichiers, un `.txt` refusé) ; les imports du module sont dans la liste fermée du plan §3.1 | `apps/harness/src/policy-committed.ts:36 CONST "n.endsWith(\".json\")" -> "true"` |
| `committed_pins_start_empty_with_two_closed_held_lists` | les deux listes retenues exactes, `COMMITTED_RETIRE_LISTS`, `COMMITTED_REPORTS`, `COMMITTED_TABLES` vides, `COMMITTED_REGISTRY` nul ; les quatre constantes hors bloc sont au-dessus du bloc marqué, qui ne porte que les deux autres ; aucun import | `apps/harness/src/policy-committed-pins.ts:11 CONST "\"bnb-dir-1h\"" -> "\"bnb-range-1h\""` |

- **Mutants équivalents** (balayage à la main, chaque ligne de contrôle des deux modules mutée seule, le fichier de test rejoué) :
  douze mutants du lecteur et six des épingles, **tous tués sauf un** : `names.sort()` → `names` dans `readTablesDir` (l.36) survit.
  Il est équivalent pour le lecteur, qui parcourt les classes épinglées triées ; il ne change que le premier « fichier sans épingle »
  nommé quand il y en a plusieurs, et l'ordre de `readdirSync` dépend du système de fichiers. Le tri reste, pour que ce message soit
  le même sous Linux et sous Windows.

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 1cddd2e5a4cb54791db16e704beae8e7af41152a --gel <tête du code> --repo <worktree>
  --out <dossier> --draw 4 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 4 judged, 0 unchanged, 4 killer(s) drawn », quatre
  `new-module`, quatre tueurs tués (sha256 du `RED-PROOF.json` dans le message qui ouvre la demande de G2).
- **Octets servis inchangés** : suite du harnais (`apps/harness/test/*.test.ts`) et `test/harness-served.test.ts`,
  `test/spec-1-1-0-release.test.ts` (dont `published_tables_are_the_served_tables_byte_for_byte`), `test/surfaces-1-1-0.test.ts`,
  `test/export-public.test.ts` (hors test 42), `test/public-surfaces-honesty.test.ts`, `test/cra-b.test.ts` : 352 tests, 352 verts.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de
  RECHERCHES) `--base 1cddd2e5` : 3 fichiers, aucun risque Windows.

## 4. Taille

- R-25, forme de la CI (`docs/**/*.md` exclus) : 3 fichiers, **187** insertions (borne de lot 547 ; plan : ~290 attendues).

## 5. Ce qui n'est pas fait

- **a1-ii** (lot suivant, empilé) : classe épinglée et retenue refusée, union des classes, ligne réservée refusée par
  `kataKeyReserved`, et `registry.ts` l.15-16 réécrit sur place.
- La couture (`servedPolicyTables(texts, committed)`, `gate.ts` l.1042) et la clause d'état engagé : lots a2 et a3.
- L'écrivain (b1-a, b1-b) et les données (`tables/`, bloc marqué rempli) : plus tard, au lot c.
