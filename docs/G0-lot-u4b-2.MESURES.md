MODELE RESOLU: claude-opus-4-8[1m]

# MESURES — G0 U-4b-2 (reproductibles, lecture seule `F:\Monark`)

> Worker `claude-opus-4-8[1m]`, effort max, 2026-09-21. Base : `lot/etude-suite` HEAD `b38a3993bef8e30e4371c6c5ebd6e57cda36ef6a` (`git status` clean, `git log -1` ce tour). Aucun réseau, aucun commit, aucune écriture hors `F:\tmp\u4b-2\`. Chaque mesure est rejouable par la commande citée depuis `F:\Monark`.

## M-0. Base
```
git -C F:/Monark rev-parse HEAD        # b38a3993bef8e30e4371c6c5ebd6e57cda36ef6a
git -C F:/Monark rev-parse --abbrev-ref HEAD   # lot/etude-suite
git -C F:/Monark status --porcelain    # (vide)
```

## M-1. Chemin servi RÉEL (deux surfaces, un registre) — `runGate`
- Consommateurs de `runGate`/`GATE_TOOL_NAME`/`honestyText`/`gateVerdictSummary` hors `*.test.ts` (grep) : le seul consommateur **de code non-test** est `apps/harness/src/tools/registry.ts` (les autres hits sont `docs/**`). 
- `apps/harness/src/tools/registry.ts:26` importe `runGate` ; `:58-75` descripteur `gate`, `run:(args)=>runGate(env.prediction,env.params,env.attested)` `:66-74`.
- `apps/harness/src/server.ts:30` importe `registerTools` ; `:88-98` `createHarnessHandler` (MCP stateless) ; `:9-15` deux surfaces sur `127.0.0.1:3001` routées par Host : `mcp.monarkgate.tech` → MCP ; `api.monarkgate.tech` → miroir HTTP.
- `apps/harness/src/http.ts:21` importe `HARNESS_TOOLS` ; `:32-33` `MIRROR_OPERATIONS = REGISTERED_TOOL_NAMES` ; `:97` `tool.run(validated.value)` (POST /{tool}).
- ⇒ **MCP `gate` et `POST /gate` consomment le MÊME `HARNESS_TOOLS`**, qui appelle `runGate`. Le dispatch est `runGate` `gate.ts:584-604`.
- `skills/monark/SKILL.md:75` : endpoint `https://mcp.monarkgate.tech/mcp` (+ miroir `POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate}`).

## M-2. Motif à réutiliser : `stableRunVerdict` (gate.ts:446-489)
`lookupCommittedCalibration(TASK_STABLE_RUN, prediction.predictor_id)` `:448` → si committé : `splitQuantile(scores, params.alpha, params.nMin)` `:466` → `buildIntervalRegion(yhat−split.qhat, yhat+split.qhat)` `:475` → `buildVerdict(... region interval ...)` `:484-488` ; si absent : `conformInterval({calib:[]…})` → `under_calib` `:452-461`. **α/nMin viennent de `params` (appelant)** `:466` — d'où [C-10] / D-6 (imposer serveur pour la classe committée).

## M-3. Registre `calibration.ts`
- `COMMITTED_CALIBRATIONS` `:195-203` (aujourd'hui : BTC synthétique + USDe stable-run). `interface CommittedCalibration {taskClass,predictorId,scores,digestPinned,provenance}` `:185-191` — **pas de champ `scale`** (D-8).
- `lookupCommittedCalibration(taskClass,predictorId)` `:207-209` exact-match ; non-match ⇒ `undefined` ⇒ appelant `under_calib`.
- Garde de digest fail-closed à l'import : BTC `:35-40`, USDe `:165-170` (`if(computed!==pinned) throw`).
- USDe : tableau de 613 scores `:77-155` (~79 lignes de données, ~8/ligne) — **précédent pour le volume R-25 des tableaux** ; regénéré par `scripts/record-usde-calib.mjs` `:168`, l'orchestrateur épingle (R-20) `record-usde-calib.mjs:186`.

## M-4. Générateur GELÉ `scripts/record-u4b-calib.mjs`
- `export function buildRegistryEntries(rowsA,opts)` `:27-60` : `scale` défaut 1 `:28` ; `predictorBase` REQUIS `:30` ; bornes : `s%scale!==0n ⇒ throw` `:38`, `v>2^53 ⇒ throw` `:40` ; q̂ via `splitQuantile(scores,ALPHA,NMIN)` L1 `:45` ; anti-circularité (p-ième à la main == L1) `:49-50` ; entrée `{task_class:"liquidation-eligible-coverage", predictor_id:`${predictorBase}/s${k}`, …, calib_digest:calibDigest(scores)}` `:53-57`. `NMIN=100, ALPHA=0.01` `:16`. **Classe A UNIQUEMENT** (décision 108) `:6-8,:81`.
- `main()` `:71-84` imprime un rapport SANS `scores` `:80` et écrit « The orchestrator pins these in calibration.ts in -2 from the FRESH episode (R-20) » `:83`. **N'écrit PAS `calibration.ts`.**

## M-5. `strateOf` / coupes (scorer GELÉ `u4b-scores.mjs`)
- `STRATA_CUTS = [2n*10n**11n, 1n*10n**13n, 1n*10n**14n]` `:53` = `[2e11, 1e13, 1e14]` = {$2000, $100k, $1M} base 8-déc.
- `export function strateOf(yhat)` `:54-59` : k=0 si <2e11 ; 1 si [2e11,1e13) ; 2 si [1e13,1e14) ; 3 si ≥1e14.
- Commentaire `:50-52` : « SERVER-SIDE in -2 … EXPORTED, imported by gate.ts strateOf(yhat) (C-10) ». **MAIS** `u4b-scores.mjs:31` `import {readFileSync} from "node:fs"` ; `:35-36` importe `apps/sentinel/src/ukemi/{wadray,abi}.ts` ⇒ importer dans `gate.ts` casse K-8 + frontière apps (D-4).
- Cas frontières pinnés `ukemi-u4b-scores.test.ts:203-213` (`u4b_strate_boundaries`). Le test importe le scorer gelé `:14` (cross-import prouvé dans `apps/sentinel/test/`).

## M-6. Test de recompute (existe déjà) `u4b_registry_recomputes_from_scores_jsonl`
`ukemi-u4b-scores.test.ts:215-242` : lit `U4b-scores-e2.jsonl`, `predictorBase` = meta `cell_a.predictor_id` `:220`, `buildRegistryEntries(rowsA,{scale:1n,predictorBase})` `:222`. Valeurs e2 (DESIGN, jamais servi) `:224-233` :
```
strate 0 : n=363 p=361 q̂=199069846640      under_calib=false  digest 8fa7f0f5…
strate 1 : n=148 p=148 q̂=9315546795545     under_calib=false  digest ffdcb597…
strate 2 : n=46  p=47  q̂=null               under_calib=true   digest 0eca5077…
strate 3 : n=8   p=9   q̂=null               under_calib=true   digest 0b58be96…
```
`predictor_id[0]` = `ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/e2-2025-10-10-weth/A/s0` `:223`. Gardes 2^53 / scale inexact / predictorBase requis `:235-241`. ⇒ Sur e2, **2 strates committables** (0,1) ; 2,3 abstiennent. Le n par strate de l'épisode FRAIS est **inconnu** (U-4b-1b non couru) ⇒ R-25 de -2a conditionnel (§7 du G0).

## M-7. `task_class` = string LIBRE (contrats gelés) — ajouter/retirer une classe ne touche AUCUN enum
- `schemas/prediction.schema.json:11` : `"task_class":{"type":"string","pattern":"^[ -~]+$","minLength":1}` (pas d'enum).
- `schemas/coverage-verdict.schema.json:24` : idem ; `:25` `"method":{"enum":["split","hac-cp"]}` ; `:5` « cascade » n'apparaît que dans la **description**.
- `packages/contracts/src/types.ts:182` `task_class: string;` (Prediction), `:212` (CoverageVerdict) ; `:202` « cascade-VaR UKEMI » = commentaire.
- ⇒ **-2a ajoute `liquidation-eligible-coverage` avec 0 changement de schéma gelé** ; **-2b retire `cascade-liquidable-24h` sans toucher d'enum gelé** (les 5 contrats gelés intacts).

## M-8. Honnêteté / clés interdites
- `packages/contracts/src/forbidden-keys.ts:11-31` `FORBIDDEN_KEYS` : `p_correct, confidence, hallucination, …, peg_score, p_depeg, nav` ; `assertNoForbiddenKey` `:56-63` (récursif). Re-asserté à la sortie `gate.ts:634-635`.
- « never a probability of being right » : `skills/monark/SKILL.md:3,11,27,31` ; `gate.ts:520` `gateVerdictSummary … asserts NO probability of being right`.
- Motif honnêteté servie committée : `STABLE_RUN_COMMITTED_CORE` `gate.ts:90-97` (Barber–Candès–Ramdas–Tibshirani 2023 Thm 2, poids unitaires, « no coverage is measured ») ; note diacritique ASCII `:86-88` (lang:gate/export:check). `honestyText` keyé présence-calib `:500-510`.

## M-9. `attestation-binding.ts`
- Table TOTALE sur 3 classes `:30-34` : `btc-dir-15m → [URL]`, `stable-run-velocity-24h → []`, `cascade-liquidable-24h → []`. `checkAttestedConsistency` `:46-55` (classe absente ⇒ « not accepted for BYO » ; présente sans sujet ⇒ « not consistent »). ⇒ ajouter `["liquidation-eligible-coverage", []]` (D-5) ; retirer la ligne cascade en -2b.

## M-10. Adaptateur A-6 `packages/monark/src/adapter-book.ts`
- Existant : `fromAttestedBook` `:88-189` (décodeur pur fail-closed `BookError`/`binding_broken`), `toAttestedBook` `:232-264`. **Aucun objet forecast** (note `:5-6` : « that mapping is U-4 »). ⇒ U-4b-2 AJOUTE `fromRealizedBook` (le mapping ŷ, A-6) ; l'existant reste intact. `assertNoForbiddenKey` déjà utilisé `:100`.

## M-11. A-7 `packages/hikae/src/liquidable-24h.ts`
- Aujourd'hui SYNTHÉTIQUE : docstring « NO source of realized 24h … exists » `:9-13` ; `LIQUIDABLE_24H_NMIN=99` `:32` ; `harness_version="fixtures-synth"` `:25`. ⇒ A-7 = classe réelle (retirer la docstring, `NMIN 99→100`) — ou item séparé si R-25 serre (Q-8).

## M-12. K-8 (zone pure des tools) — scan mesuré
- `grep node:fs|node:net|node:child_process|scripts/census|apps/sentinel|process.env|fetch\( apps/harness/src` : les hits `node:fs` sont `shogen-fixture.ts:17`, `schema-projection.ts:29` (hors `src/tools/`) ; sous `src/tools/**` : uniquement des **commentaires** déclarant l'absence (`gate.ts:7`, `cascade.ts:13`, `calibrate.ts:12`, `registry.ts:16-17`). **Aucun import `node:fs`/`apps/sentinel`/`scripts/census` réel sous `src/tools/`** ⇒ importer le scorer gelé (qui importe node:fs + apps/sentinel) dans `gate.ts` **casserait** cette propriété (base de D-4).

## M-13. Footprint `cascade` (retrait, §7 R-25)
`grep -c cascade|CASCADE F:/Monark (hors docs/)` : **379 occurrences / 54 fichiers**. Principaux (non-fixtures, comptés R-25) :
```
apps/harness/src/tools/cascade.ts        29   (suppr.)
apps/harness/src/tools/gate.ts           21   (dispatch + constantes + honnêteté)
apps/harness/src/schema-projection.ts    20
apps/harness/src/tools/registry.ts        (ALLOWED_TOOL_NAMES 4→3, descripteur)
apps/harness/src/{http.ts(2),openapi.ts(1),attestation-binding.ts(2),calibration.ts(1)}
apps/harness/test/{cascade.test.ts(53),gate.test.ts(32),http.test.ts(15),server.test.ts(11),registry.test.ts(7),openapi.test.ts(5),calibrate.test.ts(1)}
packages/ukemi/{src/index.ts(1),src/lattice.ts(3),test/lattice.test.ts(2),…}   (Q-5)
scripts/verify-harness.mjs(6), skills/{SKILL.md(5),INTEGRATION.md(2),DEMO.md(1)}, README.md(6), apps/harness/README.md(8)
fixtures/h5-e2e-trace.json(28)+PROVENANCE(7)   (EXCLUS R-25 mais re-pin)
apps/site/{lib/fleet.ts(9),lib/fleet-presentation.ts(3),components/ukemi-panel.tsx(5),components/gate-sim/board.tsx(3),…}
```
`apps/harness/src/tools/cascade.ts:53` : « Removed with the cascade tool at U-4 (ADR-M020 D4 amended by decision 51) » ⇒ retrait ENTIER du tool intentionnel. `ALLOWED_TOOL_NAMES=["attest","gate","cascade","calibrate"]` `registry.ts:32` → 3.

## M-14. `fleet.ts` (registre public) + son test racine
- `apps/site/lib/fleet.ts:152-168` : Ukemi `status:"built"`, `wiring.served_by="MCP cascade → gate (cascade-liquidable-24h; abstains under_calib by construction, ADR-M019 D2/D4)"`, `integration_test:["probe_harness_records_real_decision"]`. ⇒ **le `built` d'Ukemi repose AUJOURD'HUI entièrement sur la couture cascade** (vacue).
- `test/ci-gates.test.ts:800` `fleet_register_built_set_is_frozen` : built == {Shōgen,Hikae,Ukemi,Narabi} ; `:896-914` chaque built exige `served_by` non vide + `integration_test` ≥1 id existant `test("<id>"` sous `WIRING_TEST_ROOTS` (`:773-779` = `test/`, `apps/harness/test/`, `apps/sentinel/test/`) ; `:919-933` tripwire numéro : aucune surface `apps/site` (≠ fleet.ts) ne référence `served_by`/`integration_test`.
- ⇒ retirer cascade sans re-câbler `fleet.ts` : `probe_harness_records_real_decision` survivrait (étapes btc-dir/attest) ⇒ le test racine **resterait vert** avec un `served_by` PÉRIMÉ ⇒ seul le **branchement** (règle CLAUDE.md, « un G7 ne clôt pas un lot dont un tuyau annoncé manque ») l'attrape ⇒ le re-câblage est une **condition de clôture de -2b**, pas garantie par l'oracle (Q-6).

## M-15. ADR-M019 / ADR-M020 (continuité Ukemi)
- ADR-M019 D2 `:55-69` : tuyau `cascade → gate` réel mais **effet servi = abstention constante** (vacuité byte-identique ŷ∈{100,999999,−5}). D4 `:83-92` : investisseur « on le build … paroxysme, littérature et rigueur académique » ⇒ Ukemi `built` maintenu + programme obligatoire « mode L » (classe servie dont la sortie **influence** la décision).
- ADR-M020 D1(b) `:22` classe `liquidation-realized-given-oracle-path-24h` ; D3 `:32` tuyau « Prediction → gate | `fromRealizedBook` (remplace `cascade.ts`) | gate classe (b) committée | anti-vacuité : ŷ varié ⇒ décision varie ; nouvel événement ⇒ under_calib ; h5 re-pin » ; D4 U-5 (résiduel), U-6 (sentinel-2 servi, live), U-7 (papier). **Nommage** : ADR-U4b + générateur gelé emploient `liquidation-eligible-coverage` (Q-2).
- Dashboard `docs/TABLEAU-DE-BORD.md:5` décision 117 (release 2 temps) ; `:48-50` U-5 « branchement outil servi », U-6 « book complet + course live », U-7 « biblio ». `:73` « Ukemi classe A seule (108) … TRANCHÉE ».

## M-16. Décisions CHANTIERS
- `CHANTIERS.md:468` **108** verbatim « Classe A seule au release » : U-4b sert la seule classe A ; classe B calculée hors ligne -1a (digest/cellule) → item formé, servie au 3ᵉ épisode ; amende 91 ; E-I-3 close ; prereg -1b committable.
- `:5` **117** release deux temps (temps 1 Narabi+Ukemi). `:82`/`:225-231` (PLAN -1b) **119** HORS portée : course Bell+C-F-4, U-6, site, DNS, achats ; plafonds fail-closed non levés par un GO durable.

## M-18. R-25 — pathspec EXACTE mesurée (`.github/workflows/ci.yml`)
- `:43` `VIBEGATES_PR_LIMIT: "1205"`. `:65` `STAT=$(git diff --shortstat "origin/${base_ref}...HEAD" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}')`.
- ⇒ base = **`.` (tout)** MOINS ces excludes. **`apps/site/lib/fleet.ts` COMPTE** (pas de règle `src`-only ; le seul filtre sur apps/site est absent). `scripts/**` COMPTE. Tous `*.test.ts` COMPTENT. Les tableaux de scores de `calibration.ts` (apps/harness/src) COMPTENT. **EXCLUS** : `fixtures/h5-e2e-trace.json` (`fixtures/**/*.json`), `U4b-*.jsonl` (`apps/sentinel/test/fixtures/**`), `docs/**/*.md`. ⇒ corrige §7 du G0 et cadre Q-6 (fleet.ts gaté ET compté).

## M-17. Conventions gelées reprises (ADR-U4b D4, non ré-ouvertes ici)
sha gelés : `u4b-scores.mjs 9ad20666…`, `u4b-reduce.mjs a5e66cd3…`, `record-u4b-calib.mjs 5733daeb…`, `wadray.ts 7bee76fc…`, `abi.ts 3376eb08…`, `l1-split.ts 9206df91…`, `rpc.ts 0e232519…` (`ADR-U4b:18`, `:74`). `book_digest 034fbff9…` (`ukemi-u4b-scores` via `ukemi.test.ts:29`). Cellules e2 A `dc9ab572…` / B `89897a61…` (`ukemi-u4b-scores.test.ts:26-27`). `u4/` `743e9499…/97035715…/8b84e095…` (`:245-247`).
