# G7 du lot DOJO-E2E-DISK-1 : le test de bout en bout du dojo, indépendant du disque de l'hôte

- **Branche** : `recherches/dojo-e2e-disk-1` sur `origin/lot/etude-suite` `82cf6980`, worktree `mg-dojo-disk`. Commits locaux, sans push.
- **Lot de tests seuls** (G0 : `docs/G0-lot-dojo-e2e-disk-1.md`, ligne `red-proof: test-only`). Aucun code de production n'est touché.

## 1. Ce que le lot ferme

- **G2 delta de T0-FOLLOWUP-1 et d'ANCHORS-DRIFT-1, §3** : `dojo_history_collect_to_verify_end_to_end` rougissait sur un hôte dont le tmpdir avait moins d'environ 1,27 Go libres. Le collecteur refuse `disk_space` sous le plancher D-10 lu par `statfs` ; il a raison, mais le test de bout en bout n'était pas hermétique.
- **Correction** : le test remplace `fs.statfsSync` sur le modèle de `dojo-history-collect.test.ts:345`, et le rétablit par `t.after`. Le plancher est recodé d'après D-10.
  - D'abord, un octet de moins : `runHistoryCollect` refuse `disk_space` par son nom, et `ledger/` et `evidence/` restent vides.
  - Ensuite, le plancher exact : les trois courses tournent comme avant.
- **Le refus du produit n'est pas affaibli** : le code ne change pas. Le refus reste épinglé seul par `dojo_history_disk_rpc_error_and_faulted_body_paths`, et le test de bout en bout l'épingle aussi.

## 2. Preuve rouge

- Un préchargement de test ramène la place libre du tmpdir à 946 Mo, celle de l'hôte de la G2 ; rien d'autre ne change.
  - À la base (`82cf6980`, test d'origine), le test est rouge : trois `disk_space` sur stderr, échec par assertion (`ERR_ASSERTION`).
  - Après le lot, il est vert, avec le même préchargement.
  - Sans le préchargement, l'hôte a aujourd'hui environ 6 Go libres, et le test d'origine passe.
- **red-proof `--test-only`** (base `82cf6980`) : OK, 1 jugé, épinglé (tueur `:456`, tiré à la gel, tué).
  - Le mode F2P ne peut pas servir ici. red-proof copie le test neuf sur le code de la base, et ce code est inchangé, si bien que le test est vert à la base par construction (« self-confirming »).
  - La preuve avant et après est donc celle du préchargement, ci-dessus.

## 3. Vérifications

- **Tueurs tirés à la main**, fichier restauré (sha256 contrôlé) :
  - `history-collect.ts:456 CONST` : tué par assertion.
  - `:185 ROR "<" -> "<="` (neuf ; au plancher exact, la course doit tourner) : tué par assertion.
  - Hors liste, `:185 SDL` (le contrôle de disque ôté) : tué par l'assertion `disk_space` du test.
  - Le même `:185 ROR`, tiré contre le test unitaire : tué.
- **Ancres** : 2 sur 2 sur le fichier touché. Sur tout le dépôt, 8 PERDU antérieurs (6 hikae, 2 oracle-run), hors du lot ; ANCHORS-DRIFT-1 les ferme.
- **R-25** contre `82cf6980` : STAT 16+/3- = 19 (≤ 547), GREEN.
- **Portes** : `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK.
- **Tests ciblés** (`test/dojo-history-e2e.test.ts`, `apps/dojo/test/dojo-history-collect.test.ts`) : 16 sur 16.
- **ETAT** : une ligne datée clôt DOJO-E2E-DISK-1 dans « Points connus ».

## 4. Reste ouvert

Rien dans le lot.
