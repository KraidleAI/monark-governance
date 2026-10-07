# G0 du lot RH-2 : les tests qui rougiraient au premier dossier daté, et le --check du dépôt (SPEC-TABLES-TEST-PER-DIR-1, T0-ORDER-TEST-RELEASE-NAME-1, SPEC-CHECK-ROOT-1)

RECHERCHES, 2026-10-07. Base `b9d327a4` (lot/etude-suite). Plan : `docs/G0-lot-retire-latency-rehearsal-1.md` §5 et annexe A (M-1, M-3).

- **Provenance** : worker `claude-opus-5-5` (effort max). Premier jet `f7cdc8f6`, `8edc5e73` ; pli de la G2 (MONARK,
  `pieces/2026-10-07-g2-218-219-format-w2`, `reviews[0]`), horloge lue (`date -u`) à 05:16 UTC au début, 05:27 pour ce G0.
  - Worktree neuf du scratchpad, branche locale `rh2-fold` ; `git add` par chemins explicites, un commit neuf, poussé sans amend ni
    force. Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, aucun réseau hors `git fetch` et `git push`.
  - `--write --date` n'a tourné que dans des copies jetables `git archive 8edc5e73 | tar -x` sous le scratchpad, jamais dans le
    worktree ni dans un dépôt git.

red-proof: test-only

## Constat (mesuré dans des copies jetables)

- **M-1** : une release `contract-1.1.0-tables-<date>` ajoutée en dernier à `scripts/spec-publish-inputs.json` rougit
  `srf_runbook_vitrine_t0_order` (`test/surfaces-1-1-0.test.ts` l.231 lit `.at(-1)`), par `ERR_ASSERTION`.
- **M-3** : un premier dossier daté écrit par `node scripts/spec-policy-tables.mjs --write --date 2026-11-02` (`--check` sort 0) rougit
  `published_tables_are_the_served_tables_byte_for_byte` (`test/spec-1-1-0-release.test.ts`), qui ne lisait que `contract-1.1.0/`.
- **Recensement complété (G2, constat M)** : le même dossier daté rougit aussi 2 à 5 des 8 tests de `test/spec-retire-path.test.ts` à
  `8edc5e73`. Leur `copy()` copiait tout `spec/` (un dossier daté du dépôt passait dans chaque copie : « already exists », « later
  than », ENOENT, sortie de `--check` autre que celle de la base) et l.97 épinglait `contract-1.1.0` pour les 35 classes du dépôt.
  Mesuré : eth-dir-1h au 2026-10-20, 2 rouges ; btc-dir-1h au 2026-10-20, 4 ; btc-dir-1h au 2026-11-02 et au 2026-12-01, 5 ;
  eth-dir-1h au 2026-10-20 puis au 2026-11-02, 5 ; M-1 et M-3 ensemble (btc au 2026-11-02, release datée en dernier), 5.
  Les autres lecteurs de `spec/` (`spec-publish`, `short-digest-floor`, `runbook-retire`, `surfaces-1-1-0`) restent verts dans ces états.
- **Le --check de l'écrivain ne tournait jamais sur le dépôt** (G2, m) : seulement sur des copies `--root` des tests.

## Changement (tests seuls)

1. `published_tables_are_the_served_tables_byte_for_byte` lit `spec/contract-1.1.0/` et chaque `spec/contract-1.1.0-tables-<date>/`
   dont la date est un jour réel (`validDate`, comme `versionDirs` de l'écrivain ; G2, m : un dossier `2026-13-01` masquait un fichier
   daté périmé). Chaque table servie est, à l'octet, le fichier du dernier dossier qui tient sa classe ; `contract-1.1.0/policy/` tient
   exactement les classes servies ; un dossier daté ne tient que des classes servies, et au moins une. Le test vérifie aussi, sur une
   arborescence jetable, que lui et l'écrivain (`servedTableDirs`) écartent les mêmes dossiers à date impossible.
2. `srf_runbook_vitrine_t0_order` lit la release `contract-1.1.0` par son nom.
3. `test/spec-retire-path.test.ts` : `copy()` construit une racine de la forme de T0, quel que soit le dossier daté du dépôt :
   `schemas/` et `spec/contract-1.1.0/`, chaque table servie écrite là, canonique. L.97 tire la carte attendue des dossiers présents
   (le dernier dossier à jour réel qui tient la classe) au lieu d'épingler `contract-1.1.0` ×35.
4. Test neuf `the_repository_passes_the_writer_check` (SPEC-CHECK-ROOT-1) : `differences(ROOT, await expectedFiles(ROOT))` est vide,
   c'est le `--check` de l'écrivain sur le dépôt (fichier manquant, différent, en trop, ou doublon daté : rouge).

## Tueurs

- apps/harness/src/tools/gate.ts:217 CONST "for this cell_key; the gate" -> "for this cell_key, the gate"
- docs/RUNBOOK-vitrine.md:47 CONST " docs/JOURNAL-PROVENANCE.md apps/site/data/harness-served.json" -> " apps/site/data/harness-served.json"
- scripts/spec-policy-tables.mjs:60 CONST "dirs[t.task_class]" -> "VERSION_DIR"
- spec/contract-1.1.0/schemas/prediction.schema.json:4 CONST "\"title\": \"Prediction\"" -> "\"title\": \"Prediction \""

Le tueur précédent de `published_tables…` (`spec/contract-1.1.0/policy/btc-dir-1h.json:1`) était mort-né dès qu'un dossier daté tient
btc-dir-1h : remplacé par celui de `gate.ts:217`, tué à la base propre, avec btc-dir-1h daté au 2026-11-02, et avec eth-dir-1h daté au
2026-10-20 puis au 2026-11-02. Le tueur de `schemas/…:4` vise un fichier qui n'est jamais daté.

## Preuves

- Matrice des premiers dossiers datés (copies `git archive 8edc5e73`, `kataClassText` changé pour une classe, `--write --date` sort 0,
  `--check` sort 0) : avec les tests de `8edc5e73`, les rouges du constat ; avec ceux de ce pli, `spec-retire-path` 8/8,
  `spec-1-1-0-release` 25/25, `surfaces-1-1-0` 15/15 dans chaque état, et dans la copie propre.
- Mutations, tests de ce pli : dossier `2026-13-01` aux octets servis et fichier du 2026-10-20 altéré, rouge (vert avant) ; fichier en
  trop à la racine d'un dossier daté, rouge (`--check` 1) ; dossier daté sans table (`retire/` seul), rouge (`--check` 0) ; doublon daté
  identique, rouge ; dernier fichier daté altéré, rouge.
- Limite, déclarée : un fichier daté **supplanté** et altéré reste vert, et `--check` aussi (`published()` le garde sans le re-dériver).
  « Un fichier daté altéré rougit » ne vaut que pour le dernier fichier daté d'une classe. L'épingler au sha256 de son entrée de
  release datée relève de SPEC-DATED-RELEASE-ENTRY-1, comme le doublon de nom de release dans `scripts/spec-publish-inputs.json`
  (`JSON.parse` garde le dernier bloc ; préexistant, `scripts/spec-publish.mjs` l.53-76) : à lire par clé textuelle à ce lot.
- `node scripts/red-proof.mjs --base b9d327a4 --gel <worktree> --repo <worktree> --test-only` (Node 22.22.2, Linux) : sortie 0,
  « 4 judged, 44 unchanged » ; les quatre tests `pinned`, leurs quatre tueurs tués.
- tsc, eslint des deux fichiers, lang-gate, grep-forbidden, lint-ratchet (69/69), export-public `--check`, winlint `--base b9d327a4` : 0.
- R-25 : 3 fichiers, +26 −14 hors `docs/**/*.md`.
