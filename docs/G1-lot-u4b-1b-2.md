# G1 U-4b-1b-2 (worker Opus 4.8)

All advisor points addressed in the rendu and ADR amendment (documentation only; no worktree code changed since the green full-suite + mutant runs). The deliverables are durable. Here is the integral rendu.

---

Modèle résolu : claude-opus-4-8[1m]

# G1 — lot U-4b-1b-2 (préconditions de COURSE : réducteur de SÉLECTION d'épisode + prober D_e paramétré + discover schéma v2)

Worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Worktree `F:\Monark-wt-u4b1b2` (`lot/u4b-1b-2`, base `lot/etude-suite` @ `e60ea07`). Aucun commit, aucun workflow (R-20). node_modules reconstruit par `mk-nm.ps1` ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-u4b1b2\packages\rpc-guard\src\index.ts` (A-2).

## Livrables (3, tous HORS gel D4)

- **A — réducteur de SÉLECTION** : `F:\Monark-wt-u4b1b2\scripts\census\u4b\u4b-select-episode.mjs` (+ `.d.mts`). HORS LIGNE (0 réseau) : §DISC:31 (exclusion e2), :34-40 (clustering via la fonction PURE `clusterWethLiquidations`), :42-46 (éligibilité), :49-50 (argmin + tie-break). Écrit `episode-selection.json` + `A-rawlogs-<episode_id>.jsonl`. Sous-commande gardée `--check-version` (H-1 : 1 `eth_getStorageAt` slot EIP-1967 quorum-2 keyless ; impl == v3.5.0 `0x97287a4f35e583d924f78ad88db8afce1379189a` [lu in-repo ADR-U4:203] ⇒ `version_ok:true` ; sinon STOP H-1 PR-U4-3-bis, ou `--version-neutral-ref`). `selection_sha256` calculé HORS `version_check`/`selection_sha256` (C-5).
- **B — prober D_e paramétré** : `F:\Monark-wt-u4b1b2\scripts\census\u4-oracle-path.mjs` (+ `.d.mts`). `--episode-file` obligatoire (lit `episode.B0`/`episode.B_last`, vérifie `selection_sha256`) ; défauts e2 (`B0`/`BLAST`/`USDT_BLOCKS`/`EMODE_CATEGORIES`) **SUPPRIMÉS** ; `--feed-proxy` garde son défaut §DISC:28 (documenté `feed_proxy_source`) ; `--usdt-blocks` optionnel (absent ⇒ `usdt_prices {}` + `usdt_blocks_status "omitted"`, C-7) ; `--emode-categories` OU `--book` (fail-closed si les deux absents) ; `run(argv, deps)` exporté, `deps.env` seule source d'env (0 `process.env` dans le corps, C-8).
- **C — discover schéma v2** : `F:\Monark-wt-u4b1b2\scripts\census\u4b\u4b-discover.mjs`. Brut écrit AVANT le témoin ; porte `block_ts:{<bloc>:<ts>}` (chaque `eth_getBlockByNumber`, couvert par `brut_sha256`) ; `blockAt` via `--block-operators` (pool sans pocket, qui élague les en-têtes anciens) ; échec du témoin ⇒ `clusters:null` + `cluster_error` (URL-scrubbé) + exit 0 (le brut est la pièce — la course FATAL du 22/09 a perdu ~650 getLogs).
- **Partagé** : `F:\Monark-wt-u4b1b2\scripts\census\u4-guard.mjs` (+ `.d.mts` créé) gagne `canon`/`sha256Hex` (copie **byte-identique** de `liquidation-logs.mjs`, parité épinglée par test) pour que le prober (imports allowlist-fermés) vérifie `selection_sha256`.

## Oracle complet (env -u, codes capturés directement A-3) — TOUT VERT

`gate:vocab` 0, `typecheck` 0, `test` 0 (**887 tests / 886 pass / 0 fail / 1 skip**), `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0.

Le **seul skip** = `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent, out-of-repo »), **pré-existant** (lot -1b-1, `test/u3-realized-param.test.ts`, tracké, hors de mon changeset ; SKIP NOMMÉ prévu prereg §Y). Aucun de mes tests ne skip. `n` = +18 tests nets.

## Tests + mutants (D-1 ; harnais `F:\tmp\u4b1b2\mutants.mjs` : **19/19 KILLED + restaurés byte-exact, 0 stray**)

- **A (14 tests)** : déterminisme (2 runs octets identiques + A-rawlogs) ; e2 exclu prouvé (tx e2 absent d'A-rawlogs) ; N_min fail (49<50) ; window_truncated ; argmin + tie-break (comparateur testé directement) ; `--out` sous fixtures refusé ; `brut_sha256` altéré refusé ; `--prereg-sha` faux refusé ; **ts manquant ⇒ refus NOMMÉ, 0 réseau** ; **C-2** composition `u3-realized.parseArgs(--events)` réel + prédicat `:548` (cluster non vide, `length === n_members`) ; **C-3** `rawlogs_sha256` = sha RAW des octets d'A-rawlogs + forme record = `decodeLiquidationCall` ; **C-4** `B_last` réducteur == recalcul labeler `firstBlockAtOrAfter(ts+86400)-1` ; **C-5** check-version true/false-STOP/neutral-ref + `selection_sha256` inchangé + tampered ⇒ 0 fetch ; parité `canon` u4-guard⇔liquidation-logs. Mutants A-M1..A-M11.
- **B (5 tests)** : **A-8** corps réels hex (aggregator/getLogs/getAssetPrice/getEModeCategoryData) ⇒ raws décodés + bornes lues de l'épisode (pas e2) ; usdt omis ⇒ `{}` + `omitted` ; tampered `selection_sha256` ⇒ 0 fetch ; emode fail-closed ; helpers purs (`emodeCategoriesFromBook`, `usdtBlocksFromLabelerDeficit`). + `test/guard-scripts-u4.test.ts` re-baseliné (D-4, voir ci-dessous). Mutants B-M1..B-M6.
- **C (3 tests)** : déterministe (v2 + block_ts recomputé indépendamment) ; keyless-only refus payant ; **échec témoin ⇒ brut écrit + `cluster_error` + exit 0** (mutant « brut après clustering » ROUGE). Mutants C-M1, C-M2.

**Invariant (PAS un compteur mesuré, honnêteté D-2)** : `residual_outside_window` est **structurellement 0** (clustering glouton assigne chaque record WETH) ; l'assertion `=== 0` est un garde-fou de régression contre une ré-implémentation non-gloutonne, comme le tie-break §DISC:50 inatteignable par construction. Compteurs réellement mesurés : `n_excluded_e2`, `window_truncated`, `n_eligible`, `candidates`.

## Gel D4 (A-6) — 9 sha byte-identiques AVANT/APRÈS (HEAD + working tree), concordent prereg §2

`2f9a31f6…` `a5e66cd3…` `5733daeb…` `7bee76fc…` `3376eb08…` `9206df91…` `0e232519…` `3603265d…` `cb020425…`. **AUCUN ÉCART**. Les 3 fichiers touchés (discover, oracle-path, u4-guard) sont HORS gel. Le test importe `parseArgs` du labeler gelé sans changer son blob (import ≠ édition).

## R-25 (verbatim pathspec `.github/workflows/ci.yml:65`, base `lot/etude-suite`)

**Total lot = 1322 lignes** (> 1 150). Le snapshot `git add -A` a mesuré 1326 dont **4 lignes ÉTRANGÈRES** (`docs/course-bell/mint_resume-TSLAx-*`, course Bell LIVE, apparues puis disparues au `git reset` — PAS ce lot). **Par fichier : max 335 (<< 1 150)**. Total > 1 150 ⇒ **COUTURE NOMMÉE (jamais appliquée seul, ruling orchestrateur)**, alignée sur les 3 livrables :
- **PR-C (discover)** ~125 ; **PR-A (sélecteur)** ~684 (dépend de `u4-guard.canon` — ordonner après PR-B ou micro-PR `u4-guard` en base) ; **PR-B (prober)** ~517.

## Décision d'advisor tracée (R-26 : avis, jamais verdict)

Advisor Q1 (« ne PAS patcher discover ») **superseded par le ruling orchestrateur C-1 (option a : patcher discover, `block_ts` v2)** — j'ai suivi l'orchestrateur. Le caveat de l'advisor (re-clustering e2-exclu pouvant sonder un bloc hors `block_ts`) est conservé comme le fail-closed « refus NOMMÉ ».

## Consigne standard G1 — point par point

A-1..A-8 **fait** ; A-9 **n-a** (aucune constante servie de vocabulaire gaté dans ce lot) ; A-10 **fait** (liage `brut_sha256`/`selection_sha256`/`rawlogs_sha256` asserté sur l'artefact réel ; mutants qui préservent la lecture et altèrent la sortie — B-M1/B-M3/B-M6, C-M2 — ROUGES). B-1..B-6 **fait/n-a** (keyless-only ; `cluster_error` vocabulaire fermé scrubbé, 0 URL). C-1..C-4 **fait** (classes du paquet réexportées ; budget hérité du guard). D-1..D-4 **fait** (mutants ; vecteurs recomputés non vides ; A-8 e2e ; diff de tests annoté D-4). E-1..E-3 **fait** (verrous/ledger hérités de `openU4GuardedClient`/`unlockAll`). F-1..F-3 **fait** (ADR joint ; ASCII gate-clean ; D-n déclarées).

## Zéro dette nue (P5) — items formés à déclencheur (propriétaire orchestrateur)

1. prereg §5b-bis / §5a `--block` / §5e `<tag>` alimentés par `episode-selection.json` (le worker ne modifie pas le prereg, R-20) ;
2. **prereg §5b `--block-operators` MANQUANT** : la ligne figée committée est stale pour discover v2 (blockAt sans pocket) — à réécrire ;
3. ordre de course **labeler → prober** pour dériver `--usdt-blocks` (helper pur `usdtBlocksFromLabelerDeficit`) ;
4. relance réelle du discover après fusion (la course FATAL du 22/09 n'a écrit aucun brut ; v2 la rejoue).

## Artefacts (F:\tmp\u4b1b2\)

- `F:\tmp\u4b1b2\G1-lot-u4b-1b-2.md` (ce rendu, durable)
- `F:\tmp\u4b1b2\ADR-amendement-1b-2.md` (à insérer dans `docs/adr/ADR-U4b-calibration-episode-frais.md` par l'orchestrateur, R-20 ; tuyaux, schéma v2, lignes de commande figées, D-n, MAST C-9, recompute des 9 sha)
- `F:\tmp\u4b1b2\DELIVERED.sha256` (13 fichiers touchés, chemins relatifs au worktree)
- `F:\tmp\u4b1b2\mutants.mjs` (harnais rejouable : `node F:\tmp\u4b1b2\mutants.mjs F:\Monark-wt-u4b1b2`)

Fichiers touchés (worktree, absolus) : `F:\Monark-wt-u4b1b2\scripts\census\u4b\u4b-select-episode.mjs` (+`.d.mts`), `…\scripts\census\u4b\u4b-discover.mjs` (+`.d.mts`), `…\scripts\census\u4-oracle-path.mjs` (+`.d.mts`), `…\scripts\census\u4-guard.mjs` (+`.d.mts`), `…\scripts\export-exclude-tests.json`, `…\apps\sentinel\test\u4b-select-episode.test.ts`, `…\apps\sentinel\test\u4b-oracle-path.test.ts`, `…\apps\sentinel\test\u4b-discover.test.ts`, `…\test\guard-scripts-u4.test.ts`.
