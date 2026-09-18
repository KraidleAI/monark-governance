# G1 — Génération tracée, Lot M012-b (sentinelle Narabi — ADR-M012 D1-D6, D9)

- **Rattachement** : `docs/adr/ADR-M012-narabi-live-sentinel.md` + `docs/PLAN-m012-narabi-live.md` §1/§3/§8 (M012-a committé `ed3d36d`).
- **Générateur** : worker **`claude-opus-4-8[1m]`** (R-1), dispatché par l'orchestrateur `claude-fable-5-1`, 2026-09-17/18. Aucun commit,
  aucune action sortante (R-20). Réseau utilisé **une fois**, pour la fixture de timestamps (§ Fixture), plafond bloc 23586523.
- **Rulings orchestrateur (questions ouvertes du worker)** : Q1 J0 = première fenêtre publiée, premier pas tracker = J0+1 ; Q2 `--day`
  plafonne le rattrapage, non-dry = jour suivant naturel ; Q3 pas de `run_label` (régime mécanique) — portés ADR-M012 D5.

## Livrables (12 nouveaux, 6 modifiés)
- `apps/sentinel/src/windows.ts` `b84827ae…` (découpage UTC ancré bloc, oracle de timestamps injectable — C-5) ; `rpc.ts` `24274a11…`
  (pool public, cooldown, **quorum 2**, `finalized()` = min sur 2 endpoints) ; `flow.ts` `976bcb69…` (AttestedFlow comme le recorder,
  hash A3, C1 fail-closed) ; `timeline.ts` `4f55efe5…` (JSONL D4, chaîne de hash fait+score+état+prev, `state.json`, régime
  métadonnée, `E_static` direct, `B_t` labelDelay 1, `rolling90_calm_miss`, `drift_flag`) ; `run.ts` **`7cd17440…`** (post-C1 ; initial `d3f70432…`) (job idempotent,
  gap = lag, `--dry-run` sans écriture, garde `--day`) ; `package.json` `00d76e00…` (0 dépendance).
- Tests `apps/sentinel/test/sentinel.test.ts` **`de67f125…`** (post-C1 ; initial `1d39ed1a…`) — **17 tests** : les 16 nommés PLAN §3 +
  `sentinel_fails_closed_without_J0` (offline, stubs RPC/timestamps).
- Fixture `apps/sentinel/test/fixtures/usde-boundary-blocks.json` `f4e50948…` — 701 fenêtres × (bloc, ts(bloc), ts(bloc−1)), JSON
  mono-ligne (R-25) ; **1402 blocs ≤ 23586523**, assertion `block > CEILING` avant chaque envoi ; invariant
  `ts(from−1) < minuit ≤ ts(from)` : 0 violation.
- `deploy/monark-sentinel.service` **`ec168bb0…`** (post-C1 ; initial `cbf93f07…`), `.timer` `4080e790…`, `Caddyfile.monark-narabi.snippet` `30c29db4…` (`handle_path`
  à insérer dans le bloc vitrine), `docs/RUNBOOK-sentinel.md` `e05b3b37…`.
- Modifiés : `packages/hikae/src/tracker.ts` `1d3677ad…` (en-tête l.4-8 seul, vecteurs épinglés inchangés) ; `tsconfig.json` ;
  `package.json` (glob de test) ; `scripts/usde-full-pull.mjs` (importe `windows.ts`) ; `scripts/export-public.mjs`
  (+`apps/sentinel`) ; `package-lock.json` (+13, exclu R-25).
- **Scission formée M012-c** (item (j) ADR) : `instrument.ts` (rejeux `c = q̂` / `ε = 0,01` / CUSUM + permutation, digest séparé) +
  test + ligne RUNBOOK — le lot était à 1197/1205 sans lui.

## Faits mesurés (worker ; à rejouer G2/checkpoint-2/G7)
`committedQ1() = 0.00013119228083333334` (= `splitQuantile(USDE_STABLE_RUN_CALIB, 0.10, 50).qhat`, jamais collé) ; `max
rolling90_calm_miss = 27/90 = 0.30` à 2025-04-30, **0 déclenchement à 0.40** sur 616 paires calmes mécaniques (613 + les 3 clôtures
10-13/14/15 étiquetées `run` par le pull mais mécaniquement calmes) ; `boundThm1(1) = 2`, `boundThm1(1788) = 0.10002 >
0.10 ≥ boundThm1(1789)` ⇒ `T(≤ 0,10) = 1789`. `observed_at.instant` = clôture ⇒ `attested_flow_sha256` ≠ recorder (item (k)).

## Mutants M1..M5 (un à la fois, revertés, sha post-revert = baseline)
M1 tracker filtré régime ⇒ ✖ `sentinel_regime_is_metadata` (+ gap, clip) ; M2 `E_static := stepped.E` ⇒ ✖ `two_timelines_never_merged`
(+ drift) ; M3 gap sauté ⇒ ✖ `gap_is_lag_not_skip` ; M4 `latest` ⇒ ✖ `waits_for_finality` ; M5 hash sans le fait ⇒ ✖ `hash_chain`.

## Oracle (worker) : `npm test` **250/250** ; `ci` OK ; `lint` 0 ; `lint:ratchet` 69/69 ; `lang:gate` 0 ; `export:check` 0 ; `gate:vocab` OK.
**R-25 worker = 1197 / 1205** (35 suivis + 1162 non suivis). **Orchestrateur (G7)** : après ses ajouts ADR-M012 (rulings Q1-Q3, items (j)(k)) le lot
mesurait **1207 > 1205** ⇒ **découpage** : `docs/RUNBOOK-sentinel.md` (95 l.) sorti du lot vers M012-c (conservé au scratchpad, réintégré tel
quel) ⇒ **R-25 = 1114** (48 suivis + 1066 non suivis, G1 exclu). Oracle rejoué par l'orchestrateur : ci 250/250, lang 0, ratchet 69/69, lint 0,
export 0, `diff --check` propre.

## Correctif G2 C1 (worker, 2026-09-18)
`run.ts` `7cd17440…` : `resolveStartDay(j0, day, prevDay, today)` exportée, calculée après `loadState` ; `(J0 absent ∧ état vide ∧ pas de --day)` ⇒
`throw "MONARK_SENTINEL_J0 must be set before the first run (ADR-M012 D5)."` — jamais un `[]` silencieux. Test `sentinel_fails_closed_without_J0`
(`de67f125…`) : throw + J0 passé finalisé ⇒ due non vide (**17/17**). `monark-sentinel.service` `ec168bb0…` : commentaires vrais (J0 posé en
drop-in AVANT `enable`, sinon premier run fail-closed). Oracle post-C1 : ci **251/251**, lint 0, ratchet 69/69, lang 0, export 0, `diff --check`
propre ; **R-25 = 1138** (48 + 1090). Mutants M1..M5 restent valides (`timeline.ts`, `rpc.ts` inchangés).
