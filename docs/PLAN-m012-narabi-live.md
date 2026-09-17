# PLAN-m012-narabi-live — Lot M012 : sentinelle Narabi (ADR-M012, D8 (i)+(ii))

> **G0 AgileGates (plan AVANT code).** Rattachement : **ADR-M012** (proposé 2026-09-17). Statut : **checkpoint-1 validateur
> 2026-09-17 : ACCEPTE-AVEC-CORRECTIONS C-1..C-14, foldées ; escalade investisseur tranchée : ε = 0,1 ; option B plus tard ; AM-2 bis entériné.**
> Tout seuil/critère ci-dessous est **PRÉ-ENREGISTRÉ** ; les 11 mois d'outcomes 2025-10-16 → J0 ne sont **pas** regardés
> avant l'approbation (ADR D6). Aucune action sortante.

## 1. Périmètre (fermé)
- **Nouveau** `apps/sentinel/` (workspace `apps/*`) : `src/windows.ts` (découpage fenêtres UTC ancrées bloc, extrait de
  `usde-full-pull.mjs` — le pull importe le module, résultat **identique** : test de non-régression sur 3 fenêtres C-6),
  `src/rpc.ts` (pool public, quorum 2, cooldown, tag `finalized`), `src/flow.ts` (AttestedFlow + hash A3 + C1),
  `src/timeline.ts` (JSONL append-only, chaîne de hash, `state.json`, régime, `E_static`, `B_t`, `rolling90_calm_miss`),
  `src/run.ts` (job quotidien idempotent : fenêtre manquée = retard, jamais un pas sauté ; `lag` publié ; `--dry-run` n'écrit rien),
  **0 dépendance nouvelle** (built-ins Node, R-8 — C-2) ; `windows.ts` reçoit un **oracle de timestamps injectable** (C-5),
  `src/instrument.ts` (rejeux `c = q̂` / `ε = 0,01` / CUSUM + permutation — section `instrument`, jamais portée).
- `apps/harness/src/tools/gate.ts` : `STABLE_RUN_COMMITTED_SENTENCE` (ADR D7) + re-pin trace h5 ; `packages/hikae/src/tracker.ts:4`
  en-tête (D9) ; `vocab-banned.json` (D8) + test mutant ; `deploy/monark-sentinel.{service,timer}` (`User=sentinel`, `ReadWritePaths=/var/lib/monark-sentinel`, `ProtectSystem=strict`,
  `WorkingDirectory=/opt/monark-harness`), `deploy/Caddyfile.monark-narabi.snippet` (**`handle_path /narabi/*` à insérer DANS
  le bloc vitrine existant** avant `reverse_proxy localhost:3000` — jamais un bloc séparé, C-1) ; `docs/RUNBOOK-sentinel.md`
  (étape nommée « première édition du bloc vitrine » : `caddy validate`, `reload`, `curl` vitrine, rollback).
- **0 modification** de : contrats/schemas, `tracker.ts` (logique), `l1/l2/l3`, `region.ts`, `calibration.ts`, `adapter-narabi.ts`.
- Gouvernance : ADR-M012, ce PLAN, amendements M008 D7/D8, M009 §10, M005 addendum, JOURNAL, G1/G2.
- Commentaires **anglais** ; jamais « live » dans `skills/` ; « bound » jamais « guarantee » nu.

## 2. Paramètres pré-enregistrés (ADR D6)
`c = 1/24`, **`ε = 0,1` (décision investisseur 2026-09-17 ; T(≤0,10) = 1789 j ; alternatives 0,05 → 779 j, 0,01 → 453 j
écartées ; aucun pull > 2025-10-15 avant le commit M012-a** — C-14), `t₀ = 0`,
`q₁ = 1.3119e-4` (= `USDE_STABLE_RUN_CALIB` q̂, recalculé, jamais collé), `α = 0,10`, `B = 1/24`, `δ_target = 0,10`, `labelDelay = 1`,
régime calme = `S_open ≥ 1e25 ∧ burns/S_open < 0,01` sur les 2 fenêtres, critère (iii) : `rolling90_calm_miss ≥ 0,40`
(référence in-sample max **0,30**, à **rejouer** au checkpoint-1 sur la fixture) ⇒ ouverture d'ADR, jamais bascule.

## 3. Oracle déterministe (tests nommés ; fixtures = série sha-pinnée, aucun réseau en CI)
1. `sentinel_windows_identical_to_pull` — avec un **oracle de timestamps injecté** depuis une fixture `(jour, bloc frontière,
   ts(bloc), ts(bloc−1))` (pull unique de blocs ≤ 2025-10-15, aucun regard sur les 11 mois — C-5), `windows.ts` reproduit
   blocs/bornes des 701 fenêtres (0 gap, 0 overlap) ; aucun réseau en CI.
2. `sentinel_c1_fail_closed` — identité `S_open = S_close + burns − mints` violée ⇒ fenêtre `non_evaluable`, hors timeline, motif.
3. `sentinel_no_peek_labelDelay1` — l'état qui décide t+1 n'a consommé que `s_1..s_{t−1}` ; changer `v_{t+1}` ne change ni `q` ni `E_{<t}`.
4. `sentinel_two_timelines_never_merged` — `E_tracker` ≠ `E_static` sur un cas construit ; aucun des deux ne lit un `reason`.
5. `sentinel_regime_is_metadata` — filtrer le régime ne change pas `q_t` ; `rolling90_calm_miss` n'utilise que les paires calmes.
6. `sentinel_replay_equals_state` — de la timeline publiée (`q₁`, params, `s`) `trackerReplay` reproduit `state.json.q` octet-à-octet.
7. `sentinel_hash_chain` — modifier un fait d'une ligne sans changer `s` casse `prev_line_hash` de la suivante.
8. `sentinel_gap_is_lag_not_skip` — jour manquant ⇒ `T` inchangé, `lag = 1`, reprise dans l'ordre.
9. `sentinel_clip_flag` — `s_raw > B` ⇒ `s = B`, `pair_status = clipped`, `E` calculé sur `s`.
10. `sentinel_drift_criterion_in_sample_zero` — sur la fixture, `max rolling90_calm_miss = 0,30` (±1/90) et **0** déclenchement à 0,40.
11. `sentinel_bound_thm1_daily` — `bound = (B + η₁)/(T·η_T)` via **`trackerStepSize` importé, jamais réimplémenté** (C-6) ;
    à T = 1789 (ε = 0,1) ≤ 0,10 ; à T = 1 > 1.
12. `sentinel_imports_bidirectional` (C-7) — `apps/harness/**` n'importe **rien** de `apps/sentinel/**` (sens K-8) ET la
    sentinelle n'importe rien de `apps/harness/src/tools/**` ; scan `registry.test.ts` inchangé.
12b. `sentinel_waits_for_finality` (C-6, tueur nommé de M4) — `to_block > finalized` injecté ⇒ fenêtre non traitée, `lag`.
12c. `sentinel_quorum_disagreement_fails_closed` — deux endpoints en désaccord sur burns/supply ⇒ fenêtre non écrite, motif.
12d. `sentinel_q1_equals_splitQuantile_of_committed_calib` — `q₁` = `splitQuantile(USDE_STABLE_RUN_CALIB, 0,10, 50).qhat`
    (recalculé, jamais collé).
12e. `sentinel_state_T_zero_before_J0` (AC-6) — un état initialisé porte `T = 0`, aucune ligne de timeline.
13. `vocab_adaptive_coverage_reddens` — mutant : « adaptive coverage » ⇒ gate:vocab ROUGE ; la phrase D8 exacte ⇒ vert.
14. `gate_sentence_barber` — `STABLE_RUN_COMMITTED_SENTENCE` porte « Barber » et ne porte plus « exchangeability is declared » ;
    trace h5 re-pinnée (sha déclaré).
- **Mutants fermés** : M1 tracker filtré sur régime (test 5) ; M2 `E_tracker := (reason !== "covered")` (test 4) ; M3 pas sauté
  sur gap (test 8) ; M4 `latest` au lieu de `finalized` (test 12b) ; M5 hash-chain sans le fait (test 7). Chacun ⇒ ROUGE, sortie en G1.
- **Vocab (C-3/C-4)** : motifs `adaptive(ly)?\s+(cover|guarantee|region|gate)` et `(coverage|region|gate)\s+adapt` ; mutants
  « the gate adapts », « adaptively covers », « adaptive coverage » ⇒ ROUGE ; phrase D8 exacte ⇒ vert ; `README.md` dans
  `scan.narabi_docs.files`.

## 4. Oracle de release
`npm run ci` ; `gate:vocab` ; `typecheck` ; `lang:gate` ; `lint:ratchet` 69 (non relevé) ; `npm run lint` ; `export:check`
(`apps/sentinel` entre dans l'export public par construction — attendu vert, en-tête anglais) ; `scripts/verify-harness.mjs`
après redéploiement (CA re-pinné) ; `node apps/sentinel/src/run.ts --dry-run --day <J0−1>` sur le VPS avant activation du timer.

## 5. R-25 (plafond 1205 ; exclusions S2, G1/G2, lockfile)
ADR ~120 + PLAN ~80 + sentinel src ~450 + tests ~350 + deploy/runbook ~120 + amendements/vocab/JOURNAL ~60 ≈ **1180**.
**Trop près du plafond** ⇒ **découpage en deux PR** : **M012-a** (ADR, PLAN, D7 phrase + h5, D8 vocab, amendements (D9 en-têtes `tracker.ts` → M012-b, ruling n° 3),
JOURNAL ≈ 300) puis **M012-b** (sentinelle + tests + deploy + runbook ≈ 900). Jamais une exception.

## 6. Modes MAST nommés
- **Fuite de futur** : la sentinelle lit `latest` ou score la fenêtre courante ⇒ tests 3 + M4.
- **Fabrication de régime** : filtrer le tracker ⇒ test 5 + M1.
- **Reason qui fuit** : `E` depuis le gate ⇒ test 4 + M2.
- **Perte silencieuse** : gap sauté ⇒ test 8 + M3.
- **Overclaim** : « adaptive coverage » ⇒ test 13 ; « live » dans skills ⇒ gate:vocab.
- **Regard sur les 11 mois avant pré-enregistrement** ⇒ checkpoint-1 AVANT tout recompute ; instrument replay à digest séparé.
- **Vérification incorrecte** ⇒ checkpoint-2 et G7 rejouent tests + permutation §0 + max glissant 0,30.

## 7. Séquence
checkpoint-1 ✅ → **décision investisseur ε** (0,1 par défaut, committée en M012-a ; aucun pull > 2025-10-15 avant) → M012-a (worker →
G2 → checkpoint-2 → G7 → commit) → M012-b (idem) → **go 1** push → **go 2** redéploiement harnais + verify → **go 3** sentinelle
+ Caddy `/narabi/` + premier pas = **J0** → page site `/narabi/live` (lot designer) → **go 4** textes publics → **go 5** annonce (T, J0).

## 8. Critères d'acceptation
AC-1 tests 1-14 verts, 5 mutants rouges ; AC-2 `git diff --stat` dans le périmètre §1 ; AC-3 oracle §4 vert ; AC-4 aucun octet
de contrat gelé ; AC-5 phrase D8 verbatim sur chaque surface touchée, 0 « adaptive coverage/guarantee/region » ; AC-6 `T = 0`
tant que J0 n'est pas passé (aucun état pré-rempli) ; AC-7 JOURNAL avec `error_origin` ; AC-8 items (g)(h) formés ;
AC-9 R-25 par PR < 1205 sans exception.
