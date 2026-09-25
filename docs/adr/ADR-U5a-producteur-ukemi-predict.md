# ADR-U5a — the pure yhat producer `fromRealizedBook` + the (unregistered) `ukemi-predict` tool module

> STATUS: ACCEPTED (amends ADR-M020 / the U-5 programme). Worker `claude-opus-4-8[1m]` (effort max), 2026-09-22 ; reviewer orchestrator `claude-fable-5-1` (R-21) ; validateur-humain checkpoint-2 ACCEPTE-AVEC-CORRECTIONS. Cites decisions 51/123/132, checkpoint-1 U-5a and checkpoint-2 U-5a.

## Context and provenance of Option (B)
Decision 123 re-perimetered U-5 as the served PRODUCER of yhat (the piece a third party cannot reproduce: the frozen close-factor rule lives out of the public copy). Decision 132 split it: U-5a = the pure producer + the complete tool MODULE + schemas + equality oracles, WITHOUT registration; U-5b = registration + route + the 4->4 replacement of `cascade` + skill/MCP/README + h5 re-pin, after the -2b fresh registry.

The G0 draft's "5 tools transitorily" reading was escalated at checkpoint-1. It was resolved NOT by a new value decision but by the **orchestrator ruling of 2026-09-22 14:48 UTC (`docs/CHANTIERS.md`), applying investor decisions 51/123 to the letter** — "the endpoint keeps 4 tools, ADR-M005 D14 maintained" — with `error_origin` = orchestrator recorded (the mis-reading was in decision 132's wording, not in an investor decision). **Option (B) is literally decision 51**: ship the producer/module/schemas/oracles now, register in U-5b (same fusion as the removal). No new value decision was taken by the worker or the validateur.

## Decisions
- **D1 — `fromRealizedBook` (packages/monark/src/adapter-book.ts).** A PURE (K-8) re-implementation of the per-account close-factor yhat rule frozen in `scripts/census/u4b/u4b-scores.mjs` (sha `2f9a31f6...`, one of the 9 untouchable; re-declared by value, NEVER imported). Emits `{ yhat: bigint, m_bps, pstar }` ONLY (checkpoint-1 C-1): the stratum is derived DOWNSTREAM by the harness `ukemi-strata.strateOf` (NO third copy; the package boundary forbids importing apps/*). No `node:crypto`: book_digest is an ECHO. `yhat` is an EXACT bigint for the oracle; the tool converts it to a safe JSON number fail-closed.
- **D2 — `ukemi-predict` tool MODULE (apps/harness/src/tools/ukemi-predict.ts), UNREGISTERED.** validate (named fail-closed) -> `fromRealizedBook` -> `strateOf(yhat)` -> K-1 envelope `{ prediction, provenance, label }`. `UkemiPredictToolError` is added to `TOOL_ERROR_NAMES` (http.ts) so a refusal is a 400 WHEN the tool is routed (U-5b). It is NOT in `ALLOWED_TOOL_NAMES`/`HARNESS_TOOLS`: the served set stays `{attest,gate,cascade,calibrate}` (decisions 51/123). NOT a served endpoint in U-5a.
- **D3 — schemas (schema-projection.ts).** `UKEMI_PREDICT_INPUT_SCHEMA` (A-8: ACCEPTS the real byte form — `user_config`/`eligible_static`, `block`/`chain_id` as decimal strings, `round_id`/`updated_at`, `usdt_prices`, all declared OPTIONAL under `additionalProperties:false`) + `UKEMI_PREDICT_OUTPUT_SCHEMA` (K-1 envelope; `prediction` = the projected frozen `prediction.schema.json`). Declared for the -5b SDK boundary; the module validates manually while unregistered.
- **D4 — Q-U5-6 guard (`unknown_balance_token`).** The fail-closed guard the frozen scorer lacks: a non-zero balance token that is neither aWETH nor a CARRIED variable-debt token means `reserves[]` was pruned => refuse. Measured: NEVER fires on the full 16 096-account book (Oracle A/B unchanged); reds a pruned slice.
- **D5 — rulings applied.** yhat:0 SERVED (Q-U5-7). `close_factor_version` fail-closed `"3.5.0"` (Q-U5-4). `book_digest` in `features_digest` AND `provenance` (Q-U5-3), 64-hex format-validated BEFORE the echo. `emode_params` DECODED. mono-account. `produced_at` caller-carried. `predictor_id = ${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` is BOUND to the derived stratum and asserted (checkpoint-2 C-6); provenance-only — the gate re-derives server-side and ignores the client key (C-10). yhat > 2^53 fails closed (checkpoint-2 C-4).

## Tuyaux (ADR-M018 D3: entree -> sortie -> etat -> test NON-LLM)
| Tuyau | Entree (produit par) | Sortie (consommee par) | Etat | Test d'integration non-LLM |
|---|---|---|---|---|
| book slice -> yhat | mono-account slice `ukemi-book/1` (caller-carried) + `D_e` + `emode_params` | `fromRealizedBook` -> `{yhat,m_bps,pstar}` | pure K-8; named refusals | `u5_producer_yhat_equals_frozen_on_all_score_a` (565, bigint exact) ; `u5_producer_equals_frozen_module_all_accounts` (frozen LIVE, 16 096, two-sided + per-branch counts == frozen census) ; `u5_producer_refuses_named` |
| yhat -> K-1 envelope | `fromRealizedBook` result | `runUkemiPredict` -> `{prediction, provenance, label}` | tool MODULE, UNREGISTERED in -5a (registered in -5b) | `u5_tool_predicts_each_branch_from_real_slice` ; `u5_tool_output_equals_fromRealizedBook_same_bytes` (A-10) ; `u5_tool_output_is_closed_and_block_and_digest_echoed` (+ predictor_id binding, C-6) ; `u5_served_phrases_have_no_surclaim` (A-9, C-1) ; `u5_tool_refuses_yhat_over_safe_integer` (C-4) ; `u5_input_schema_accepts_the_real_form` (A-8) |
| Prediction -> gate -> region | `Prediction(yhat)` | `gate` `liquidation-eligible-coverage` -> under_calib at HEAD (liq registry empty) | direct `runGate` composition (HTTP route in -5b) | `u5_producer_predicts_then_gate_abstains_under_calib` |

The tool is NOT a served endpoint in U-5a (4 tools kept). The branchement `producer -> gate` is proven by direct composition; the SERVED endpoint, the h5 re-pin, and the non-vacuity assertion are U-5b, triggered by the -2b fresh registry merge.

## MAST (checkpoint-1 C-7)
- **FM-3.3 (verification incorrecte — tool set):** U-5a does NOT edit the tool set / registry tests / h5 pin (Option B), so the "two set-edits / two h5 re-pins" hazard does NOT arise here. The set-exact re-test and the single h5 re-pin move ENTIRELY to U-5b (one commit).
- **FM-1.5 (condition de fin ignoree — verify-harness LIVE):** decision 130 auto-deploys; `scripts/verify-harness.mjs:32` asserts the LIVE set. U-5b MUST land the registration AND `verify-harness.mjs` in the SAME commit as the tag, or the redeploy reds.

## Items formes (a declencheur — zero dette)
1. **Item 123(ii) — fresh-episode replay.** Re-run Oracle A against the FRESH `-1b` `score_a` JSONL. Trigger: course -1b close / -2b fresh registry pin. Owner: orchestrator.
2. **Item U-5b — registration + replacement.** Register `ukemi-predict`, route it (`handleJsonMirror`), REPLACE `cascade` 4->4 (410 tombstone), bump `HARNESS_VERSION`, re-pin h5, update `verify-harness.mjs:32` (LIVE set) IN THE SAME COMMIT, and the non-vacuity test "yhat varied => decision varies" (needs the -2b committed liq registry). Named served test: **`refusal UkemiPredictToolError => 400 via handleJsonMirror`** (checkpoint-2 C-5: the `TOOL_ERROR_NAMES` wire is declared in -5a but only a routed test kills its removal). Public surfaces (skill/MCP Registry/README/site) = publication EXTERNE => go investisseur (C-10). Trigger: -2b merge.
3. **DECLARED residuals — equivalent mutants on the e2 / reduced data (checkpoint-2 G2 C-G2-1), NOT defects.** Two source edits are behaviourally EQUIVALENT on the committed data, so no test reddens them — measured, not overlooked: (a) the first-crossing boundary `hf < WAD` vs `hf <= WAD` — no e2 account has `hf(p) == 1e18` EXACTLY at a path price (H-7: `HF(anchor) == hf0`, and no crossing `hf0` equals 1e18), so the two forms agree on all 16 096 accounts; (b) `strateOf(yhat)` vs a cut shifted by +/-1 — no reduced-fixture yhat lies within +/-1 of a Mondrian cut {2000e8, 100k$, 1M$}. The boundary SEMANTICS are correct and pinned elsewhere (the frozen module's own bytes for (a); `apps/sentinel/test/ukemi-served-strateof.test.ts` boundary vectors for (b)). No trigger needed: an equivalent mutant on a fixed data set is not a coverage hole, it is declared here so a re-player does not read it as an escaped mutant.

- Item 3 (complement G2-delta D-2, orchestrateur) : troisieme mutant equivalent declare — `sort-no-tiebreak` (chemin oracle pre-trie par (block, log_index), tri V8 stable ; le tiebreak du producteur est correct/defensif).

## Amendment 2026-09-22 — A-9-OUTILLE: the harness served-vocabulary gate (static half + served half)

> Proposed for insertion in `docs/adr/ADR-U5a-producteur-ukemi-predict.md` (the lot whose checkpoint-2 raised the
> observation), with a one-line cross-reference in the MAST table of `docs/adr/ADR-M020-programme-ukemi.md`
> (row "Dérive de spécification": "`gate:vocab` étendu ... (mutant : insertion ⇒ rouge)" — now tooled for the
> harness served surface, see ADR-U5a amendment A-9-OUTILLE). Placement is the orchestrator's call.
>
> Provenance: worker `claude-opus-5-5[1m]` (effort max), 2026-09-22, base `b130852` (branch `lot/a9-outille`);
> reviewer orchestrator `claude-fable-5-1` (R-21); checkpoint-1 `docs/CHECKPOINT1-lot-a9-outille.md`
> APPROUVE-AVEC-CORRECTIONS C-1..C-8 (all folded here). Origin: formed item A-9-OUTILLE (`docs/CHANTIERS.md`,
> checkpoint-2 U-5a observation: the V5 injection "verified 95% probability of liquidation within the interval."
> into `UKEMI_PREDICT_LABEL` survived the suite AND `gate:vocab`, `docs/CHECKPOINT2-lot-u5a.md` l.24/52/71).
> Investor decisions naming the piece (G-1): the SITE-RELEASE-1 ruling Q-1 (b) "no GLOBAL hardening of
> `vocab-banned.json` now" is respected — every rule below is SCOPE-local (`scan.harness`), GLOBAL is untouched,
> and `cascade` is not banned here (its removal stays U-5b).

### Decisions
- **D-A9-1 — four served-vocabulary rules on `scan.harness`** (`vocab-banned.json`), each carrying an
  `exemptions` array (the marker of an A-9 rule): (1) naked `verified`; (2) `probability` outside a named
  negation; (3) a numeric percentage `\d+(?:[.,]\d+)?\s*(?:%|per\s?cent\b)` — measured 0 hit in
  `apps/harness/src` at `b130852`, so NO exemption; (4) `accuracy` (aligned on the `scan.site` ban). The rules
  apply to every `apps/harness/src/**/*.ts` line, comments included (same walk as before: 220 files scanned
  before and after). Known limit: a literal modulo `<digit> % <digit>` in harness source would redden the
  percentage rule; none exists in scope (0 hit); a future one = an identifier/comment rewrite or an ADR line.
  Every alternative written in rules (2) and (3) is carried by its own probe in `test/vocab-harness-a9.test.ts`
  (`ALTERNATIVES`, test `a9_harness_exemptions_are_named_closed_and_load_bearing`: the probe is reddened by exactly
  the owning rule, which names the whole word): the spelled percentage `per\s?cent` ("covers 99 percent of cases",
  "90 per cent") and the plural suffix of `probabilit\w*` ("the calibrated probabilities"); mutants
  `percent-spelled-dropped` and `probability-suffix-narrowed` are red by that test (G2 C-G2-1/C-G2-2, closed by the
  test-only micro-pli). Adding an alternative to a rule = a row in `ALTERNATIVES`.
- **D-A9-2 — exemption mechanism = (i), named lookbehinds** (the scope's existing negation-aware convention,
  like `guarantee`/`probative`); **no `exemptPhrases` on the harness scope** (so `test/ci-gates.test.ts`
  `vocab_adaptive_coverage_reddens` keeps asserting the ADR-M012 D8 sentence green with NO exemption, unchanged).
  Each exemption is data next to its rule: the exact committed prefix `after` (case-insensitive, like every
  rule), the `lookbehind` group exactly as written in `re`, the committed `carrier` file, an exact committed
  `sample`, and its `why`. CLOSED list (8), pinned by `test/vocab-harness-a9.test.ts`:

  | Rule | `after` (exact prefix) | Carrier (committed) | Why |
  |---|---|---|---|
  | verified | `not re-` | `apps/harness/src/tools/gate.ts` (`GATE_NON_REVERIFICATION_SENTENCE`, served in the gate tools/list description) | negation: the caller-carried attestation is NOT re-verified at call time (K-8, ADR-M017 D2(iv)) |
  | verified | `committed Shōgen-` | `apps/harness/src/tools/attest.ts` (`ATTEST_TOOL_DESCRIPTION`) | past-tense descriptor of the ONE committed witness, checked once at capture; same sentence says the verifier is NOT executed at call time |
  | verified | `committed, previously Shōgen-` | `apps/harness/src/tools/attest.ts` (`attestHonestyText`) | the same descriptor in the served MCP content |
  | verified | `committed, previously ` | `fixtures/h5-e2e-trace.json` (step-6 note, recorded from `test/h5-trace-builder.ts`) | the same descriptor in the PINNED h5 trace; rewording it would re-pin `4ad9b340…` (forbidden, checkpoint-1 C-2) |
  | probability | `never a ` | `apps/harness/src/tools/calibrate.ts` (`CALIBRATE_LABEL`, also in the gate BYO clause and `UKEMI_PREDICT_LABEL`) | the K-1 negation "never a probability of being right" (ADR-M007 D5) |
  | probability | `not a ` | `fixtures/byo-demo-trace.json` (pinned BYO demo note; also the ADR-M012 D8 public sentence) | negation |
  | probability | `no ` | `apps/harness/src/tools/gate.ts` (source comments) | negation; never a served phrase today |
  | accuracy | `seed, n, ` | `apps/harness/src/calibration.ts` (`{ seed, n, accuracy, nCalib }`) | code identifier of the HIKAE S2a synthetic generator; never rendered |

  The `Shōgen` lookbehinds tolerate a precomposed or decomposed macron (`Sh[oō̄]{1,2}gen`, written as JSON
  `\u` escapes so `vocab-banned.json` gains no raw non-ASCII byte). Adding a rule or an exemption = an ADR line
  AND the pinned table in the test.
- **D-A9-3 — `interval` is NOT banned on the file scope** (checkpoint-1 C-1: it is the wire vocabulary of the
  frozen contract — BYO `mode: "interval"`, `region.kind`, the schema descriptions; ADR-U4b delta D-1 scoped the
  "never interval" rule to the liq class text). It is asserted ABSENT from every SERVED honesty carrier (MCP
  content text + output `label`) by `harness_served_honesty_carriers_pass_vocab` (precedent
  `u4b_liq_class_text_says_upper_bound_never_interval`). No contextual `interval` pattern is added (the founding V5
  phrase is already caught by the verified/percent/probability rules, measured). `confidence` is NOT re-added
  (already banned, C-5). The MCP `instructions` surface does not exist (`server.ts:92` builds
  `new McpServer({ name, version })`) and is not claimed (C-5).
- **D-A9-4 — CLI** (`scripts/grep-forbidden.mjs`): each hit is printed `FORBIDDEN VOCAB: <file>:<line>:<word>  <why>`
  (`scanText` hits gain the matched `word`; `re.lastIndex` reset, stateless for a caller `/g` pattern); exit 1 on
  any hit (fail-closed, unchanged); `scripts/grep-forbidden.d.mts` `VocabHit.word` added.
- **D-A9-5 — zero served byte** (checkpoint-1 C-2): the nine hits the new rules raised on committed source were all
  in COMMENTS (schema-projection.ts, attest.ts ×2, gate.ts ×2, ukemi-predict.ts ×3, calibrate.ts ×1) and were
  reworded; the comment-stripped TypeScript emit of each touched file is byte-identical HEAD vs lot. The h5 pin
  `4ad9b340…` (`test/h5-e2e-probe.test.ts:67`) is unchanged and `probe_harness_records_real_decision` is green
  (the live tools/list and tools/call bytes equal the committed trace). No served sentence was rewritten; no real
  surclaim was found (no escalation needed).

### Tuyaux (ADR-M018 D3 / checkpoint-1 CA-11)
| Tuyau | Entrée (produit par) | Sortie (consommée par) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| static served-vocabulary gate | every `apps/harness/src/**/*.ts` line (the constants as written: descriptions, schema descriptions, honesty sentences, refusal messages) | `npm run gate:vocab` (CI job g3, first command of `npm run ci`), exit 1 naming file:line:word | `vocab-banned.json` `scan.harness` (4 A-9 rules + 8 named exemptions) | `a9_harness_static_scope_wired_and_clean` (collectTargets wiring + steady state + scope-removal load-bearing), `a9_gate_vocab_cli_names_file_line_word` (the real CLI), `a9_harness_exemptions_are_named_closed_and_load_bearing` |
| served tools/list gate | `HARNESS_TOOLS` rendered by the SDK through `createHarnessHandler()` (in-process, no socket) | `npm test` (CI g3): every string leaf of the real `tools/list` scanned; injection into each served tool description caught, naming the tool | same `scan.harness` rules | `harness_tool_descriptions_pass_vocab` (extended) |
| served honesty carriers gate | `honestyText` / `cascadeHonestyText` / `attestHonestyText` / `calibrateHonestyText` as composed by the registry and served by a real `tools/call` (11 branch calls, delivered state) | `npm test`: served text === carrier (+ verdict summary), vocab-clean, never "interval" | same rules + the C-1 absence assertion | `harness_served_honesty_carriers_pass_vocab`; calibrate carriers extension in `calibrate_honesty_carriers_pass_the_negation_aware_vocab_gate` |

### MAST (checkpoint-1 C-7)
- **Vérification incorrecte** (the per-constant tests asserted PRESENCE only — U-5a C-1, U-4b-2a C-2): counter =
  absence assertions on the served surface + attributed injection mutants (13, each killed by its intended test in
  a TAP run, A-11), incl. the founding V5 replay and injections born OUTSIDE `apps/harness/src`
  (`DEMONSTRATIVE_LABEL`) and into the COMPOSED `honestyText` output.
- **Dérive de périmètre** (a worker "fixing" served phrases ⇒ `tools/list` bytes change ⇒ an h5 re-pin coupled to
  U-5b): counter = served-bytes invariance, proven (comment-only edits, emitted JS identical, h5 pin green).

### Items formés (déclencheur — zéro dette)
1. **U-5b replay on `ukemi-predict`.** When `ukemi-predict` enters `HARNESS_TOOLS` (U-5b), the served tools/list
   scan covers `UKEMI_PREDICT_TOOL_DESCRIPTION` automatically (the test iterates the real list; its first assertion
   pins the served names to `REGISTERED_TOOL_NAMES`), and the in-test injection loop replays V5 into it. The U-5b
   G1 must (a) show those rounds name `ukemi-predict`, and (b) add one `ukemi-predict` row to the CALLS table of
   `harness_served_honesty_carriers_pass_vocab` (carrier = `ukemiPredictHonestyText()`). Owner: orchestrator (U-5b
   G0/mission). Trigger: U-5b registration.
2. **Refusal messages composed from `packages/monark` text.** `AttestToolError` (`attest.ts:53`) and
   `UkemiPredictToolError` (`ukemi-predict.ts:180/183`) interpolate adapter messages written in
   `packages/monark/src/adapter-{shogen,book}.ts`, which the harness A-9 rules do not scan (monark scope = GLOBAL +
   its own bans). Measured today: 0 A-9 hit in those adapter messages; the attest refusal is unreachable in service
   (no input, committed fixture) and ukemi-predict is not routed. Trigger: U-5b (ukemi-predict routed ⇒ its
   refusals become served). Form: at U-5b, either add the A-9 rules to the monark scope for those two adapter files
   or add the ukemi-predict refusal paths (MCP `isError` content) to the served carriers test. Owner: orchestrator.
3. **`initialize` / `instructions`.** Not scanned because the surface does not exist (C-5). Trigger: the first
   `instructions` field passed to `McpServer` (`server.ts:92`). Form: add the `initialize` result's string leaves
   to the served scan in the same commit. Owner: the lot that adds it.
- Declared boundaries (not debts): the HTTP/JSON mirror (`/openapi.json`, `/health`, the 405 hint) renders the
  SAME registry descriptors/schemas plus literals written in `apps/harness/src/{http,openapi}.ts`, which the static
  half scans; SDK-generated validation messages are not MONARK text. A standalone `node scripts/grep-forbidden.mjs`
  stays exit 0 if `scan.harness` is deleted (measured under mutant `scope-harness-removed-config`); the pipeline is
  fail-closed because `npm run ci` runs `npm test`, where `a9_harness_static_scope_wired_and_clean` reddens
  (precedent: `vocab_sentinel_scope_scans_src_test_deploy`).

### Fusion
Admissible BEFORE U-5b under the checkpoint-1 conditions, all measured: no file under `apps/bell/**`, zero served
byte (D-A9-5), `ukemi-predict` registration untouched (three COMMENT lines of `ukemi-predict.ts` only), item 1
formed. Expected textual overlap with U-5b: comment lines of `ukemi-predict.ts` (20, 55-56, 205) and `gate.ts`
(161-162, 174) — trivial. Decision: orchestrator.

### Addendum d'insertion (orchestrateur `claude-fable-5-1`, G7 A-9-OUTILLE, 2026-09-22)
- Chaîne de revue : checkpoint-1 APPROUVE-AVEC-CORRECTIONS C-1..C-8 (`docs/CHECKPOINT1-lot-a9-outille.md`) ; G1 `649db8b` (`docs/G1-lot-a9-outille.md`) ; G2 PASS-AVEC-CORRECTIONS (`docs/G2-lot-a9-outille.md`, relecteur `claude-opus-5-5[1m]`) ; checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-a9-outille.md`) ; micro-pli test-only C-G2-1/C-G2-2 (pointe `4ff171e`) : sondes `"covers 99 percent of cases"`, `"90 per cent"`, `"the calibrated probabilities"` ROUGES + mutants `percent-spelled-dropped`, `probability-suffix-narrowed` tués par leur test nommé (15 mutants au total).
- **Précision D-A9-1** : le walk du scope harness = **15** fichiers `.ts` (`apps/harness/src/**`), base = lot ; « 220 » est le total CLI tous scopes.
- **Limite déclarée D-A9-1 (checkpoint-2 C-V-2)** : `probabilistic` échappe au motif `probabilit\w*` (pas un trou V5 : « probabilistic guarantee » tombe sur `guarantee`) ; frontière écrite, pas une règle nouvelle.
- **Frontière déclarée (G2 C-G2-3, forme (b))** : le scan servi de `tools/call` couvre `content[0].text` et `structuredContent.label` ; les autres feuilles de `structuredContent` (échos de l'appelant `tool`/`verdict.task_class`/`verdict.produced_at`, énumérations du contrat gelé `action`/`reason`/`verdict.method`/`verdict.region.kind`, identifiants/empreintes/jetons fermés nés de fixtures, ex. `attest` `price.residual[]`) ne sont PAS scannées A-9 (100 feuilles mesurées, 0 hit ; compensation = épingle h5 sur le chemin de démo). Déclencheur : premier champ de prose rédigé par MONARK hors `label` ⇒ liste FERMÉE de feuilles scannées + mutant d'injection (jamais un scan de toutes les feuilles : il mêlerait les échos de l'appelant).
- **Item formé IF-1 (G2)** : la 4ᵉ exemption `verified` (`committed, previously `) n'a pour porteur qu'une note écrite par un test (`test/h5-trace-builder.ts:253`, trace h5 épinglée), mais s'applique à toute constante servie. Au prochain re-pin h5 (HARNESS-DESC-1, sinon U-5b) : reformuler la note en « previously Shōgen-verified » (3ᵉ exemption) et retirer la 4ᵉ (ligne ADR + table `CLOSED` du test ⇒ 7 exemptions). Propriétaire : orchestrateur.
- **Items formés reportés** : 1 (rejeu `ukemi-predict`, U-5b), 2 (refus composés `packages/monark`, U-5b), 3 (`initialize`/`instructions`) — inchangés ; l'item CHANTIERS « A-9-OUTILLE » d'origine est remplacé par l'item 1.
- **Ordre de fusion** : A-9 AVANT HARNESS-DESC-1 (le gate précède ce qu'il gate ; chevauchement de commentaires `gate.ts` trivial pour le second fusionné) ; U-4b-STATS-1 consomme `scanText` (champ `word` additif).

## Amendement daté 2026-09-24 (U-4b-2b) : tuyau « Prediction -> gate -> region » re-cadré sur le registre committé ; IF-1 clos

> **Provenance.** Worker `claude-opus-5-5[1m]` (R-1 déclaré ; effort max), 2026-09-24, arbre du lot `lot/u4b-2b` (base `7957908`), sur la mission G1 de l'orchestrateur `claude-fable-5-1` (ADR-U4b-2b §4 et checkpoint-1 C-2 ; IF-1 = N-8). Aucun commit (R-20) ; relu par l'orchestrateur (R-21), le G2 et le checkpoint-2.

1. **Renommage tracé (checkpoint-1 C-2 de l'ADR-U4b-2b).** Au commit du registre liq (strate s0 de l'épisode frais), le test du tuyau « Prediction -> gate -> region » rougissait par construction (première assertion `apps/harness/test/ukemi-predict.test.ts:121` : `interval_too_wide` au lieu de `under_calib`). Il devient `u5_producer_predicts_then_gate_follows_the_committed_registry` : pour les `evalCases` de strate 0, `verdict.reason === "covered"`, borne haute `lo === 0`, `hi === yhat + verdict.qhat` (q̂ égal au quantile du registre, jamais tapé) et décision `defer` / `interval_too_wide` (`tauInterval 0`, horloge ouverte) ; pour le cas de strate 3, `under_calib` et `n_calib 0`. L'assertion de non-vacuité réservée à « the -2b registry merge » est tenue : une borne haute distincte par cas de s0, une abstention en s3. Le test reste EXPORTÉ : il ne lit que la tranche publique U-5a et le registre exporté. La cellule « Test » de la ligne `:22` se lit désormais avec ce nom ; la colonne « Sortie » devient « borne haute `[0, yhat + q̂]` sur la strate committée, `under_calib` ailleurs ». Les cartographies datées gardent l'ancien nom (instantanés).
2. **IF-1 clos (re-pin h5 de -2b, N-8).** La note de l'étape 6 de la trace h5 (`test/h5-trace-builder.ts:253`) se lit « one committed, previously Shōgen-verified witness » : elle relève de la 3ᵉ exemption (`committed, previously Shōgen-`, porteur `apps/harness/src/tools/attest.ts`). La 4ᵉ exemption `verified` (`committed, previously `) est RETIRÉE de `vocab-banned.json` (règle et entrée) et de la table `CLOSED` de `test/vocab-harness-a9.test.ts` : la liste fermée de D-A9-2 passe de 8 à **7** exemptions (la ligne « verified | `committed, previously ` | `fixtures/h5-e2e-trace.json` » du tableau ci-dessus est supersédée). Trace h5 re-épinglée `0b32b33071b15c6e40ea529d87221fdade7bf4fb5f2171773802a85083569932` (21 951 octets) ; mesurée sans IF-1, elle revenait exactement à `4ad9b340…` (prédiction D4 de l'ADR-U4b-2b tenue).
