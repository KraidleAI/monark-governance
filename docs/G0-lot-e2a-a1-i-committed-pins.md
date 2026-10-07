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
  `apps/harness/test/policy-committed.test.ts` (neuf). Aucun fichier existant n'est touché, sauf depuis le §7
  `apps/harness/test/kata-path.test.ts` (deux lignes) ; le §7 ajoute aussi `apps/harness/test/helpers/import-specifiers.ts` (neuf).
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
- **`policy-committed.ts`** (69 lignes depuis le pli du §6 ; imports `node:crypto`, `node:fs`, `node:url`, `@monark/contracts`,
  `./policy-table-file.ts`) :
  - `TABLES_DIR` (l.25) : `apps/harness/data/kata/tables/`, par `import.meta.url` (précédent `schema-projection.ts` l.48) ;
  - `readTablesDir(dir)` (l.28-37) : les octets de chaque fichier, clé = nom sans `.json` ; carte vide si le dossier est absent ; un
    nom qui ne finit pas par `.json` lève ;
  - `COMMITTED_FILES` (l.40) : la seule lecture de disque, au chargement du module ; **le dossier est absent, la carte est vide** ;
  - `readCommittedTables(files, entries, pins)` (l.47-69), pure : `pins = { tables, held }` (`held` est lu par a1-ii). Refus nommés,
    dans cet ordre : dossier absent ou vide et classes épinglées (l.49) ; fichier sans épingle (l.50, `Object.hasOwn`) ; classe
    épinglée sans fichier (l.53) ; octets d'un autre sha256 que l'épingle (l.54) ; octets qui ne sont pas du JSON (l.55-60, pli du
    §6) ; octets qui ne sont pas l'écriture canonique de leur valeur (l.61 : comparaison des octets, si bien qu'un octet UTF-8
    invalide est refusé aussi) ; `row_format` autre que `class-policy-v2` (l.62) ; classe épinglée sans entrée kata (l.63) ;
    `table.class` différente de l'entrée attendue (l.64) ; `assertPolicyTableFile` (l.65).
    Il rend la table de chaque classe épinglée, triée par classe. Il ne rejoue pas la garde (E2A-SERVED-GUARD-PROOF-1).
- **Aucun octet servi ne bouge** : ni `gate.ts` ni `kata-path.ts` n'importent ces modules (couture au lot a2) ; le dossier `tables/`
  n'existe pas et les épingles sont vides.

## 2. Tests rouges et tueurs

Tous dans `apps/harness/test/policy-committed.test.ts`, rouges à la base parce que les modules sont absents (`new-module`). Fichiers
de table de synthèse : entrées de `kataClassEntries`, lignes projetées du registre de synthèse (`helpers/synthetic-registry.ts`).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| `committed_tables_reader_refuses_each_departure` (T-1, structure) | deux tables admises, rendues triées même si les épingles ne le sont pas ; refus nommés : sha256 d'une autre table, octets épinglés qui ne sont pas du JSON (§6), LF final, JSON espacé, octet UTF-8 invalide, `row_format` autre, valeur `null`, texte de classe autre, table d'une autre classe, lignes non triées, classe hors des entrées | `apps/harness/src/policy-committed.ts:54 CONST "sha(bytes) !== pins.tables[cls]" -> "false"` |
| `committed_tables_reader_pairs_each_pin_with_its_file` (T-1) | fichier sans épingle ; fichier `constructor` sans épingle (§6) ; épingle sans fichier ; dossier absent avec épingles ; dossier absent sans épingle : carte vide | `apps/harness/src/policy-committed.ts:50 CONST "!Object.hasOwn(pins.tables, cls)" -> "!(cls in pins.tables)"` |
| `committed_tables_folder_is_absent_and_read_once` (T-1, dossier absent ⇔ épingles vides) | `TABLES_DIR` est `apps/harness/data/kata/tables/` et n'existe pas ; `COMMITTED_FILES` vide ; le lecteur rend une carte vide sur les épingles réelles ; `readTablesDir` sur un dossier jetable (absent, deux fichiers, un `.txt` refusé) ; les spécificateurs du module, lus comme `servedModules` les lit (§6), sont dans la liste fermée du plan §3.1 | `apps/harness/src/policy-committed.ts:11 CONST "import { assertPolicyTableFile" -> "import \"./tools/gate.ts\"; import { assertPolicyTableFile"` |
| `committed_pins_start_empty_with_two_closed_held_lists` | les deux listes retenues exactes, `COMMITTED_RETIRE_LISTS`, `COMMITTED_REPORTS`, `COMMITTED_TABLES` vides, `COMMITTED_REGISTRY` nul ; les quatre constantes hors bloc sont au-dessus du bloc marqué, qui ne porte que les deux autres ; le même extracteur rend `[]` (§6) | `apps/harness/src/policy-committed-pins.ts:11 CONST "\"bnb-dir-1h\"" -> "\"bnb-range-1h\""` |
| `import_specifiers_are_read_in_both_quotes` (§7) | l'extracteur partagé lit un texte en guillemets simples et doubles : import à effet de bord, ré-export, `import()`, spécificateur non relatif, import sur trois lignes ; ni `import.meta.url` ni « from » dans un commentaire ne comptent | `apps/harness/test/helpers/import-specifiers.ts:6 CONST "[\"']([^\"']+)[\"']" -> "\"([^\"]+)\""` |

- **Mutants équivalents** (balayage à la main, chaque ligne de contrôle des deux modules mutée seule, le fichier de test rejoué) :
  douze mutants du lecteur et six des épingles, **tous tués sauf un** : `names.sort()` → `names` dans `readTablesDir` (l.36) survit.
  Il est équivalent pour le lecteur, qui parcourt les classes épinglées triées ; il ne change que le premier « fichier sans épingle »
  nommé quand il y en a plusieurs, et l'ordre de `readdirSync` dépend du système de fichiers. Le tri reste, pour que ce message soit
  le même sous Linux et sous Windows.

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 1cddd2e5a4cb54791db16e704beae8e7af41152a --gel <tête du code> --repo <worktree>
  --out <dossier> --draw 4 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 4 judged, 0 unchanged, 4 killer(s) drawn », quatre
  `new-module`, quatre tueurs tués. sha256 des `RED-PROOF.json` (pli du §6 : le message qui ouvrait la demande de G2 n'en portait
  aucun) :
  - a1-i, première tête du code `2ac15118` : `1a4bb21db5bebc472b1d8d16b45109e31e8df0a3958cf75bc406b84b65de6072` ;
  - a1-ii (#236), `--base 15fafa20 --draw 2`, tête du code `3c6ce86f` :
    `92d2afdc4521efabdfd6743c4793e3f5b16e7ce0b71af18e3e8507c0c53f5333` (G0 d'a1-ii, §3) ;
  - a1-i après le pli, tête du code `eb42ae4d` : `f2d52698152e11d92d91eee5afcdab54c7a1e10f2d9d627321fb2f026128d180` (§6) ;
  - a1-i après la fermeture du §7, tête du code `7631cf81`, `--draw 5` :
    `b6cf8ac72d1b4f21a51c74ee5abda0b98da08d8614873f05e2ef769f40584200`.
- **Octets servis inchangés** : suite du harnais (`apps/harness/test/*.test.ts`) et `test/harness-served.test.ts`,
  `test/spec-1-1-0-release.test.ts` (dont `published_tables_are_the_served_tables_byte_for_byte`), `test/surfaces-1-1-0.test.ts`,
  `test/export-public.test.ts` (hors test 42), `test/public-surfaces-honesty.test.ts`, `test/cra-b.test.ts` : 352 tests, 352 verts
  (353 sur 353 depuis le §7).
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de
  RECHERCHES) `--base 1cddd2e5` : 3 fichiers, aucun risque Windows (4 après le pli, ce G0 compris : aucun risque).

## 4. Taille

- R-25, forme de la CI (`docs/**/*.md` exclus) : 3 fichiers, **187** insertions (borne de lot 547 ; plan : ~290 attendues) ; **198**
  après le pli du §6 ; **215** après le §7 (5 fichiers, 213 insertions, 2 suppressions).

## 5. Ce qui n'est pas fait

- **a1-ii** (lot suivant, empilé) : classe épinglée et retenue refusée, union des classes, ligne réservée refusée par
  `kataKeyReserved`, et `registry.ts` l.15-16 réécrit sur place.
- La couture (`servedPolicyTables(texts, committed)`, `gate.ts` l.1042) et la clause d'état engagé : lots a2 et a3.
- L'écrivain (b1-a, b1-b) et les données (`tables/`, bloc marqué rempli) : plus tard, au lot c.

## 6. Pli de la G2 de #233 et #236 (MONARK `6fb4653`, pièce `g2-233-236.json`), 2026-10-07

- **Provenance** : worker `claude-opus-5-5`, effort: max ; horloge lue (`date -u`) à 12:10 UTC au début. Worktree détaché neuf du
  scratchpad à `15fafa20` (`git fetch` à refspecs explicites dans `/home/user/monark-governance`, dont aucun fichier n'est touché) ;
  `node_modules` lié en dur (`cp -al`), retiré à la fin. Node 24.21.0, Linux. Pli au commit `eb42ae4d` (code et tests) ; les ancres
  des §1 à §6 sont à cette tête. Le m de #236 (`.match` sans `g`) est plié au G0 d'a1-ii.

| Constat | Pli | Où |
|---|---|---|
| M : T-1 lit les imports par une regex d'une ligne ; l'import à effet de bord, le ré-export, l'import sur plusieurs lignes et `import()` passent | `importsOf` lit les spécificateurs avec `/(?:\bfrom\|\bimport)\s*\(?\s*"([^"]+)"/g`, de la même famille que `servedModules` (`kata-path.test.ts`), avec `\b` et sans le filtre des chemins relatifs ; T-1 garde `every(allowed.includes)`. Sur le module réel, elle rend les cinq spécificateurs (`node:crypto`, `node:fs`, `node:url`, `@monark/contracts`, `./policy-table-file.ts`), sans faux positif sur `import.meta.url` (l.25) ni sur l'en-tête. Le test des épingles affirme que le même extracteur rend `[]` sur `policy-committed-pins.ts` (il remplace `!/^import /m`). Le tueur de T-1 devient l'import à effet de bord de `gate.ts` | `test/policy-committed.test.ts:21-23`, `:89-91`, `:103` ; tueur `:74` |
| m : `Object.hasOwn` n'est tenu par aucun test | le cas `constructor` de la pièce, à l'identique ; le tueur du test devient `!(cls in pins.tables)` (O2) | `test/policy-committed.test.ts:68` ; tueur `:64` |
| m : du JSON invalide à l'épingle juste lève une `SyntaxError` nue | `try { JSON.parse } catch { fail(…) }` : « `<classe>`: the file is not JSON » ; cas : l'écriture canonique privée de son dernier octet | `src/policy-committed.ts:55-60` ; `test/policy-committed.test.ts:48` |
| m : le pointeur vers le `RED-PROOF.json` pend | les sha256 des deux `RED-PROOF.json` (a1-i et a1-ii), et celui d'après le pli, au §3 | §3 |
| m : le corps public parle au présent d'une règle tenue seulement au lot b2 | phrase au futur, celle de la pièce : « Rows will have to cite a report of this table, with their class in its scope; a later change checks it in the import guard. », suivie de « Nothing reads this table yet. » ; corps relu en ligne, `prbody.mjs` propre | corps de #233 |

- **Rouge d'abord** : le fichier de test neuf contre le code de `15fafa20` : `committed_tables_reader_refuses_each_departure` est rouge
  par assertion (« The input did not match the regular expression /btc-dir-1h: the file is not JSON/. Input: "SyntaxError: Expected
  ',' or '}' after property value in JSON at position 11444 …" »), les trois autres sont verts ; après le `try`, 4 sur 4.
- **Mutants** (un à la fois dans le worktree, le fichier de test rejoué, octets restaurés et vérifiés par sha256 ; noms de la pièce
  quand elle les définit) :
  - avant le pli (tests de `15fafa20`), 16 des 17 mutants d'import et d'`Object.hasOwn` survivent : O2 ; dans le lecteur, O20
    (`import "./policy-guard.ts";`), O20b (`import "../../../scripts/registry-root.mjs";`), O21 (ré-export de `guardKataTable`),
    O22 (import sur trois lignes), O23 (`void import("./policy-guard.ts");`), O31 (`import "./tools/gate.ts";`), O31d
    (`void import("./tools/gate.ts");`), O32 (`import "./policy-wave2.ts";`), O34 (`export * from "./policy-guard.ts";`), K-T1 (le
    nouveau tueur de T-1) ; dans les épingles, O25 (`export { kataClassEntries } from "./policy-classes.ts";`, le nom d'a1-i), un
    import indenté, `import()`, un ré-export sur trois lignes, `export *` dans le bloc. Seul l'import en colonne 0 dans les
    épingles était tué ;
  - après le pli : 17 sur 17 tués, tous par assertion : O2 par le test des paires, les dix formes du lecteur par T-1, les six des
    épingles par le test des épingles ;
  - le balayage à la main du §2 (12 + 6, réancré) et trois mutants neufs du `try` (retour au `JSON.parse` nu ; `catch` qui avale
    l'erreur ; `catch` qui lève une `SyntaxError`) : tous tués, sauf l'équivalent déjà déclaré (`names.sort()` → `names`). Deux
    rougissent par une erreur levée et non par assertion : `code === "ENOENT"` → `"EACCES"` (le chargement du module lève) et
    `COMMITTED_TABLES` non vide (le lecteur lève dans T-1, le test des épingles rougit par assertion).
- **Guillemets simples** : fermé au §7 ; l'extracteur lit les deux guillemets, et `servedModules` aussi.
- **Mesures à `eb42ae4d`** : red-proof `--base 1cddd2e5 --draw 4 --seed 1007` : sortie 0, quatre `new-module`, quatre tueurs tués,
  dont les deux neufs (`:11` et `:50`) ; `RED-PROOF.json` au §3. Suite du harnais et tests des surfaces servies : 352 tests, 352
  verts. `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 (350 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ;
  `export:check` 0 ; winlint `--base 1cddd2e5` : 4 fichiers, aucun risque Windows. R-25 (forme de la CI) : 3 fichiers, 198
  insertions.

## 7. Fermeture de la limite des guillemets simples (MONARK `fbadb0d`), 2026-10-07

- **Provenance** : worker `claude-opus-5-5`, effort: max ; horloge lue (`date -u`) à 12:51 UTC au début. Même worktree détaché du
  scratchpad (`wt-a1i-g2`, à `ea4a2679`) ; `node_modules` lié en dur (`cp -al`), retiré à la fin. Node 24.21.0, Linux. Commit
  `7631cf81`, ancres à cette tête.
- **Décision suivie** : MONARK ferme la limite que le §6 nommait (« elle coûte un caractère de classe »), pour l'extracteur de ce lot
  et pour `servedModules` ; RECHERCHES met les deux dans a1, qui a la place (246 sur 547 avant ce §).
- **Ce qui change** :
  - extracteur partagé, neuf : `apps/harness/test/helpers/import-specifiers.ts:6`, `/(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g`,
    la regex de la décision. `importsOf` le lit (`test/policy-committed.test.ts:22-23`) : T-1, le test des épingles et, à #236, le
    compte du spécificateur de `policy-classes.ts` lisent donc les deux guillemets ;
  - `servedModules` (`apps/harness/test/kata-path.test.ts:325`, import l.23) suit les spécificateurs relatifs (`/^\.{1,2}\//`) de ce
    même extracteur, au lieu de sa regex à guillemets doubles. **`kata-path.test.ts` n'a aucun lien avec les fichiers de ce lot** : il
    est changé ici sur la décision, et ses tests ne bougent pas ;
  - le cas : test neuf `import_specifiers_are_read_in_both_quotes` (`test/policy-committed.test.ts:107-111`), avec son tueur, le
    retour aux guillemets doubles dans l'extracteur (module d'appui sous `test/`, importé statiquement : MUTANTS-TEST-SUPPORT-1).
- **Pourquoi le cas n'est pas dans `kata-path.test.ts`** : un cas ajouté au corps d'un de ses tests y est vert à la base, et red-proof
  le refuse. Mesuré, sonde non commitée avec le cas dans `kata_path_is_served` : « refused … kata_path_is_served -- green at base: a
  self-confirming test », sortie 1 (`RED-PROOF.json` sha256 `b3e95d8cb09aa916…`). Le cas va dans le fichier neuf, `new-module` à la
  base ; les deux lecteurs partagent l'extracteur qu'il tient.
- **Rouge d'abord et mutants** (règles du §6) :
  - avant (extracteurs à guillemets doubles, arbre de #236 à `15642c0a`), tous survivent : dans le lecteur, `import './tools/gate.ts';`,
    `import { guardKataTable } from './policy-guard.ts';`, son ré-export, `void import('./policy-guard.ts');`, un import sur trois
    lignes, `import '../../../scripts/registry-root.mjs';` ; dans les épingles, `import`, ré-export et `import()` de
    `./policy-classes.ts` ; dans `kata-path.ts`, servi, `import './policy-guard.ts';`, `import { guardKataRow } from
    './policy-guard.ts';`, son ré-export, `void import('./policy-guard.ts');`, un import sur trois lignes. Les témoins à guillemets
    doubles sont tués ;
  - après (`7631cf81`) : les 14 tués, tous par assertion (T-1, le test des épingles, `kata_path_is_served`), et les deux témoins
    aussi ; le tueur du cas rend le cas seul rouge ;
  - pas de faux positif : sur les 28 fichiers de `apps/harness/src`, l'ancien et le nouvel extracteur rendent les mêmes
    spécificateurs, et le graphe servi est le même (22 modules, les mêmes 5 `policy-*`), à `7631cf81` comme à `15642c0a`.
- **Observation, hors de la demande** : quatre autres marches du graphe servi gardent la regex à guillemets doubles, dans le corps de
  leur test : `apps/harness/test/gate-kata-served.test.ts:216`, `policy-guard.test.ts:175`, `policy-table-file.test.ts:115`,
  `policy-wave2.test.ts:187`. Les changer ici les ferait juger, vertes à la base : red-proof les refuserait, comme la sonde. #237 touche
  aussi `gate-kata-served.test.ts` et `policy-table-file.test.ts`. À la décision de MONARK.
- **Mesures à `7631cf81`** : red-proof `--base 1cddd2e5 --draw 5 --seed 1007` : sortie 0, cinq `new-module`, 18 inchangés (ceux de
  `kata-path.test.ts`), cinq tueurs tués, dont celui de l'extracteur ; `RED-PROOF.json` au §3. Suite du harnais et tests des surfaces
  servies : 353 sur 353. `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ;
  `export:check` 0 ; winlint `--base 1cddd2e5` : 6 fichiers, aucun risque Windows. `verifie-ancres` (`--ref ea4a2679`) : 1 524
  ancrés, 0 perdu. R-25 (forme de la CI) : 215.
