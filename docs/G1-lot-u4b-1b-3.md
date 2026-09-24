# G1 U-4b-1b-3 — fill-ts borné + sidecar reprenable

All verified and consistent: on-disk .mjs = golden = DELIVERED (`896858e6…`), all stale values corrected, all deliverables present. The mission requires the integral rendu as my response with the model line first.

---

Modèle résolu : claude-opus-4-8[1m]

# G1 — Lot U-4b-1b-3 : `--fill-ts`/sélecteur — fenêtre au-delà de `to_block` SANS réseau + sidecar `block-ts-extra.json` INCRÉMENTAL reprenable (worker Opus 4.8, effort max)

R-1 : modèle résolu tel quel `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme ; Opus 5 banni). R-20 : aucun commit, aucun workflow déclenché. Worktree `F:\Monark-wt-u4b1b3` (`-b lot/u4b-1b-3 lot/etude-suite`, HEAD `c631eb0`). `node_modules` reconstruit par `mk-nm.ps1` : `entries: 220 monark: 10 fail: 0` ; **A-2** `require.resolve('@monark/rpc-guard')` → `F:\Monark-wt-u4b1b3\packages\rpc-guard\src\index.ts` (le worktree).

## 1. Code livré — `scripts/census/u4b/u4b-select-episode.mjs` SEUL (+ `.d.mts` + test) ; `windows.ts`, `liquidation-logs.mjs`, 9 sha gelés INTOUCHÉS
Le clamp vit **entièrement** dans les fermetures `tsOf` injectées dans le `clusterWethLiquidations` gelé — `windows.ts`/`liquidation-logs.mjs` restent byte-identiques.
- **(1a) `reduceSelection` (offline)** : `const toBlock = Number(brut.to_block)` (validé) ; `tsOf` : `if (block > toBlock) return Infinity;` AVANT le `block_ts` lookup ; troncature `if (!(c.b_last <= bHi) || c.b_last >= toBlock) reasons.push("window_truncated")` — §DISC:44 + D-n fail-closed (le clamp plafonne `b_last` à `to_block`).
- **(1b) `runFillTs`** : même clamp (0 `blockAt` au-delà de `to_block` ⇒ le STOP `malformed block` disparaît) + sidecar **INCRÉMENTAL/REPRENABLE** : RESUME depuis un sidecar de même `discover_sha` (self-sha valide) amorce `extra` ; `flush("partial")` tous les **N=50** ts + sur STOP gracieux ; `flush("complete")` à la fin ; retour `phase = sidecar.phase`.
- **(1c) `runSelect --block-ts-extra`** : refus nommé d'un sidecar `phase:"partial"` (calque `assertBrutComplete`).
- **(1d)** docstrings + en-tête module (l.9/12) documentent la borne `to_block`. `.d.mts` : type `BlockTsExtraSidecar` + `phase` au retour.

## 2. Tests — `apps/sentinel/test/u4b-select-episode.test.ts` (intégration non-LLM, SEUL `globalThis.fetch` bouchonné, D-3 ; tous sous `env -u` des 8 clés, A-7)
`u4b_select_marks_a_to_block_minus_1000_cluster_window_truncated_offline_0_fetch` · `u4b_fill_ts_resolves_a_to_block_minus_1000_cluster_with_0_fetch_past_to_block` · `u4b_fill_ts_is_incremental_and_resumable_after_a_quorum_kill` (kill au 61ᵉ bloc ⇒ `partial` durable `n_extra==60` ; reprise ⇒ re-fetch == `nExtra−60`) · `u4b_fill_ts_writes_complete_which_select_accepts_and_select_refuses_a_partial` · `u4b_fill_ts_quorum2_tolerates_a_transient_429_via_the_bounded_pool_retry`. Fixture `makeDiscover` : builder `block_ts` clampé (D-4, annoté ; B4 reste `window_truncated`, aucune assertion affaiblie).

## 3. Mutants — `F:\tmp\u4b1b3\mutants.mjs`, 8, TOUS ROUGES sur leur test nommé, TOUS RESTAURÉS byte-exact
Golden `u4b-select-episode.mjs` sha256 `896858e6f02d7503c7e52c6b4a7b74f847cb8ac4bac643e2ad3fa9d9d7835c9e`. Chaque mutant = 1 substitution (M8 = 2ᵉ occurrence, assert 2), baseline VERTE prouvée d'abord, VRAI transport sous `env -u`, restauration byte-exacte (sha). `BASELINE_OK=true ALL_RED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true`, exit 0. M1 clamp reduceSelection · M2 clamp runFillTs · M3 `||b_last>=toBlock` retiré · M4 flush saute partial · M5 amorçage reprise retiré · M6 garde phase select · M7 flush final `partial` · M8 retry 2→0 (runFillTs).

## 4. Oracle complet (A-3, exits DIRECTS, `env -u` des 8 clés)
`gate:vocab` 0 · `typecheck` 0 · `test` 0 (**922 / pass 921 / fail 0 / skip 1**) · `lint` 0 · `lint:ratchet` 0 · `lang:gate` 0 · `export:check` 0. **1 skip NOMMÉ pré-existant** : `u4b_labels_replay_via_main_real_artifact` # `real e2 artifacts absent (A-rawlogs.jsonl gitignored / u3-raws-clean out of repo)` (indépendant de ce lot). Logs : `F:\tmp\u4b1b3\oracle-*.log`.

## 5. R-25 (pathspec `ci.yml:65` VERBATIM, `docs/**/*.md` exclus, working-tree vs HEAD)
**221 lignes** (`204 insertions(+), 17 deletions(-)`) — < 600 (mission) et < 1150 (A-5). `numstat` : `.mjs` 50/15, `.d.mts` 12/1, test 142/1.

## 6. Gel U-4b (A-6)
BEFORE = blobs HEAD (`git show HEAD:… | tr -d '\r' | sha256sum`, régime B) ; AFTER = working tree ; identité prouvée par `diff BEFORE==AFTER` ⇒ **A6_IDENTICAL (11/11)** : 9 sha §2 + `liquidation-logs bf4eb293…` + `windows.ts b84827ae…` byte-identiques. PAS de STOP.

## 7. Amendement ADR-U4b proposé — `F:\tmp\u4b1b3\ADR-amendement.md`
Décision « borne `to_block` » (clamp +Infinity, troncature fail-closed, sidecar partial/complete reprenable, tolérance 429), ligne Tuyaux, gel D4 intact, résidu R-BORNE-1. **Numéro de décision laissé à l'orchestrateur au fold** (« D6 »/« D-6 » déjà pris : « indice fermé D6 » l.106, delta l.293 — à désambiguïser). R-20 : à folder par l'orchestrateur.

## 8. Déviations / résidus (zéro dette nue)
- **D-1 (borne to_block, §DISC:44)** : `B_last <= B_hi` supposait `B_last` réel ; le clamp le plafonne à `to_block` ; complétude ⟺ frontière observée dans `[.., to_block]` (`b_last < to_block`). Seul bascule `complete→truncated` : frontière EXACTE `== to_block+1` (fail-closed). `argmin B_first` ⇒ épisode servi inchangé sauf cluster de fin unique éligible.
- **D-2 (fixture clampée)** : alignement du builder `block_ts` sur le clamp (D-4). Aucune assertion existante affaiblie (28/28 verts, dont 23 pré-existants).
- **Confirmés** : (a) `--b-hi < to_block` réduit la règle à `b_last <= bHi` exactement ; (b) re-lancer `--fill-ts` sur un `complete` est idempotent (0 fetch) ; (c) aucun `selection_sha256` pinné n'existe pour le brut réel (fill-ts jamais complété) ⇒ le clamp ne change aucune valeur pinnée.
- **R-BORNE-1** (item formé à déclencheur) : `phase` hors du `block_ts_extra_sha256` (chaîne C-2 byte-stable + compat) ; flip manuel `partial→complete` attrapé par le refus nommé `runSelect` + `discover_sha`, non par ce sha. Déclencheur : un consommateur du sidecar hors `runSelect`.

## 9. Fichiers (chemins absolus)
Dépôt (worktree, `F:\tmp\u4b1b3\DELIVERED.sha256`) : `F:\Monark-wt-u4b1b3\scripts\census\u4b\u4b-select-episode.mjs` (`896858e6…`), `…\u4b-select-episode.d.mts` (`4c7de9f2…`), `F:\Monark-wt-u4b1b3\apps\sentinel\test\u4b-select-episode.test.ts` (`fce78c16…`).
Rendu : `F:\tmp\u4b1b3\G1.md`, `F:\tmp\u4b1b3\ADR-amendement.md`, `F:\tmp\u4b1b3\DELIVERED.sha256`, `F:\tmp\u4b1b3\mutants.mjs`, `F:\tmp\u4b1b3\A6-shas-{before,after}.txt`, `F:\tmp\u4b1b3\oracle-*.log`.

DELIVERED. Aucun commit ni workflow (R-20) ; sortie écrite pour vérification adversariale (R-21) — chiffres reproductibles, golden/DELIVERED/on-disk concordants (`896858e6…`).
