# G1 U-5a (worker Opus 4.8)

Modèle résolu : claude-opus-4-8[1m]

# G1 — lot U-5a : producteur pur `fromRealizedBook` + module outil `ukemi-predict` (Option B, 4 outils conservés)

Mission exécutée intégralement. Périmètre = **décision 132 + checkpoint-1 U-5a Option (B)** (investisseur, décisions 51/123 : l'endpoint garde 4 outils ; `ukemi-predict` livré comme module complet + schémas + oracles MAIS **non enregistré** ; enregistrement/route/retrait cascade/re-pin h5/skill/MCP/README = U-5b). Worktree `F:\Monark-wt-u5a` (branche `lot/u5a`, base/merge-base `1f4b746`). R-20 respecté : aucun commit, aucun workflow.

## Oracle complet (`env -u` des 8 clés payantes, A-7 ; codes capturés directement, A-3)
`typecheck=0` · `test=0` (**881 tests, 880 pass, 0 fail, 1 skip nommé**) · `lint=0` · `lint:ratchet=0` (**69/69**, zéro nouvelle dette) · `gate:vocab=0` · `lang:gate=0` · `export:check=0`. Le skip est **nommé** : `u4b_labels_replay_via_main_real_artifact` (`test/u3-realized-param.test.ts:238`), env-gated sur des raws e2 HORS DÉPÔT (gitignorés), préexistant à `1f4b746`, non levable par le worker — `deploy/` est présent donc `sentinel_budget_below_unit_timeout` tourne (ce n'est pas lui).

## Cœur dé-risqué (mesuré)
- **Oracle A** (`u5_producer_yhat_equals_frozen_on_all_score_a`, export-exclu) : `fromRealizedBook.{yhat,m_bps,pstar}` == les **565** lignes `score_a` committées, **bigint exact** ; `strateOf(yhat)` (servi, `ukemi-strata.ts` — pas de 3e copie, C-1) == `strate` de la ligne.
- **Oracle B** (`u5_producer_equals_frozen_module_all_accounts`) : `computeScoresU4b` GELÉ rejoué LIVE sur **16 096** comptes (~2 s) ; deux-côtés — chaque ligne cell-A == producteur, chaque autre compte ⇒ jamais un yhat positif (aucun faux positif). `cellA.size === 565` (lien module-gelé-LIVE ↔ fixture committée). Classification : 9 452 évaluables / 6 611 `non_mono_weth` / 33 `emode_out_of_range`. Garde `unknown_balance_token` (Q-U5-6) : **0 déclenchement** sur le book complet, rouge sur tranche élaguée.

## Invariants gelés (A-6, avant/après, aucun touché)
`scripts/census/u4b/u4b-scores.mjs` = `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` (inchangé, y compris après les runs de mutants restaurés byte-exact). Fixtures `baf717b7…` / `5e6448dc…` / `301d39fa…` intactes. Le diff ne contient AUCUN fichier gelé (u4b-scores.mjs, fixtures u4b, ADR-U4b, wadray.ts, abi.ts, schemas/*.json, contracts/types.ts) ni aucun fichier GELÉ par l'escalade (registry.ts, registry.test.ts, http.test.ts, openapi.test.ts, h5-e2e-trace/TRACE_SHA256_PINNED, verify-harness.mjs).

## R-25 (A-5) — pathspec VERBATIM `ci.yml:65`, `git add -A` puis `--cached` contre la merge-base
**CHANGED = 1099** (`11 files changed, 1096 insertions(+), 3 deletions(-)`), plafond **1150** ⇒ sous la garde, pas de couture §7. `U5a-book-slice.json` exclu (pathspec fixtures) ; `PROVENANCE-u5a.md` compte.

## Mutants (D-1) — **15/15 TUÉS**, restauration byte-exacte par sha
Chaque test imposé a son mutant nommé rouge (rejeu `--test-name-pattern`, `env -u`, assertion nTests≥1 & nFail≥1) : `a-cf_bps`/`a-hf95`/`a-thresh`/`d-nonweth-at-pstar`/`emode-forced-base` (Oracle A), `nonmono-not-refused` (Oracle B), `q-u5-6-guard-removed` (refus), `a10-yhat-altered` (« ŷ altéré après calcul », liage A-10), `strate-forced-0`, `close-factor-version-unchecked`/`accounts-length-unbounded` (400 nommés), `c6-clause-removed` (label), `features-digest-not-echoed`, `k8-node-fs-import` (K-8), `a8-optional-key-dropped` (A-8). Chaque commentaire « Mutant: » de test a son entrée réelle dans le harnais.

## Décisions de conception (contrôlables par l'orchestrateur)
- `fromRealizedBook(book, params)` dans `packages/monark/src/adapter-book.ts` émet **`{ok, yhat:bigint, m_bps, pstar}` | refus nommé** (K-8 pur, aucun `node:crypto` — digest ÉCHO). La strate est dérivée côté harness (C-1). Refus : `weth_reserve_absent`, `anchor_not_positive`, `no_collateral`, `non_mono_weth`, `emode_out_of_range`, `emode_params_missing`, `unknown_balance_token`.
- `runUkemiPredict` (harness, **non enregistré**) → enveloppe K-1 `{prediction, provenance, label}`. `prediction` = contrat gelé fermé (yhat number safe-integer, `features_digest`=book_digest écho 64-hex format-validé avant écho, `predictor_id=${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` provenance-only). `close_factor_version` fail-closed `"3.5.0"`. yhat:0 servie (Q-U5-7). `UkemiPredictToolError` ajouté à `TOOL_ERROR_NAMES`.
- Schémas `schema-projection.ts` : **A-8** — le schéma d'entrée accepte la forme RÉELLE (`user_config`/`eligible_static`, `block`/`chain_id` en string, `round_id`/`updated_at`, `usdt_prices` en optionnel sous `additionalProperties:false`), asserté par `u5_input_schema_accepts_the_real_form` sur la fixture réelle.
- Branchement à HEAD (C-3) : `runUkemiPredict → runGate` (`liquidation-eligible-coverage`) ⇒ `under_calib`, `n_calib:0` (registre liq vide) ; liage A-10 « sortie servie == `fromRealizedBook` sur les mêmes octets ». Le test « ŷ varié ⇒ décision varie » (non-vacuité) est un item à déclencheur (fusion -2b).

## Items formés (déclencheur — zéro dette) — détail dans `F:\tmp\u5a\ADR-U5a.md`
1. **123(ii)** — rejeu Oracle A sur le JSONL FRAIS ; déclencheur : clôture -1b / registre frais -2b ; propriétaire orchestrateur.
2. **U-5b** — enregistrement + route + retrait cascade 4→4 (410) + bump + re-pin h5 + `verify-harness.mjs:32` (SET EQUALITY LIVE, MÊME commit — MAST FM-1.5) + non-vacuité + skill/MCP/README (publication externe ⇒ go investisseur C-10) ; déclencheur : fusion -2b.
3. Résidu `isSafeInteger` (C-9) : garde présente, sans mutant tueur sur e2 (tout yhat < 2^53) — résidu déclaré, pas une dette.

## Fichiers (chemins absolus)
Livrables dépôt (worktree, stagés ; 12) :
- `F:\Monark-wt-u5a\packages\monark\src\adapter-book.ts` (+`fromRealizedBook`, types, garde Q-U5-6)
- `F:\Monark-wt-u5a\packages\monark\src\index.ts`
- `F:\Monark-wt-u5a\apps\harness\src\tools\ukemi-predict.ts` (NEUF)
- `F:\Monark-wt-u5a\apps\harness\src\schema-projection.ts`
- `F:\Monark-wt-u5a\apps\harness\src\http.ts`
- `F:\Monark-wt-u5a\packages\monark\test\adapter-book.test.ts`
- `F:\Monark-wt-u5a\apps\harness\test\ukemi-predict.test.ts` (NEUF)
- `F:\Monark-wt-u5a\apps\sentinel\test\ukemi-producer-oracle.test.ts` (NEUF, export-exclu)
- `F:\Monark-wt-u5a\apps\sentinel\test\fixtures\ukemi\u5a\U5a-book-slice.json` (fixture réduite publique)
- `F:\Monark-wt-u5a\apps\sentinel\test\fixtures\ukemi\u5a\PROVENANCE-u5a.md`
- `F:\Monark-wt-u5a\scripts\export-exclude-tests.json`
- `F:\Monark-wt-u5a\test\harness-export.test.ts`

Rendu (à consommer/insérer par l'orchestrateur) :
- `F:\tmp\u5a\G1-lot-u5a.md` (rendu intégral, consigne A-1..A-10 point par point)
- `F:\tmp\u5a\DELIVERED.sha256` (12 fichiers ; vérifié byte-exact vs le worktree)
- `F:\tmp\u5a\mutants.mjs` (15 mutants, 15/15 tués)
- `F:\tmp\u5a\ADR-U5a.md` (amendement proposé : tuyaux §5, MAST, items formés — l'orchestrateur insère ; aucun renvoi F:\tmp dans les sources dépôt)

A-2 : `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-u5a\packages\rpc-guard\src\index.ts` (node_modules reconstruit par `mk-nm.ps1` : 220 entrées, monark 10, fail 0). Toutes les corrections advisor (PROVENANCE consommateur unique, +2 mutants A-8/K-8, skip nommé, Oracle B `===565`) sont appliquées et re-vérifiées.
