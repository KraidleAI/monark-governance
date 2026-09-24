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

---

# APPEND — Pli du checkpoint-1 + décision 123 (2026-09-22, worker `claude-opus-4-8[1m]`)

Base : `lot/etude-suite` HEAD `cabd3d5` (`git merge-base --is-ancestor cabd3d5 HEAD` = **YES**). Aucune écriture hors `F:\tmp\u4b-2\`, aucun réseau, aucun commit, aucune variable d'environnement affichée (règle A-7).

## M-19. Décision investisseur 123 (`CHANTIERS.md:622-627`, verbatim « D », 2026-09-21 22:36 UTC)
- `:623` **décision 51 MAINTENUE À LA LETTRE** : Ukemi jamais `upcoming` ; endpoint 4 outils ; `cascade` retiré **seulement dans la même fusion que son remplaçant réel**.
- `:624` **remplaçant réel de `cascade` = le PRODUCTEUR de ŷ** (livre attesté → `Prediction` par la règle close-factor gelée ; nom `fromRealizedBook`, déjà nommé par 51), **pas la classe du `gate`** ; « sans producteur servi, aucun tiers ne peut produire un ŷ valide (la règle vit dans `scripts/census/u4b/u4b-scores.mjs`, hors copie publique) » ⇒ retrait `cascade` **déplacé à U-5**.
- `:625` **Conséquences U-4b-2** : -2a = classe servie sur **registre vide** (avant la course, sous C-1..C-6 + checkpoint-1 delta) ; **-2b (après la course) = registre frais + `fleet.ts` re-câblé ; NE RETIRE PAS `cascade`** (lot maigrit ~450-600 lignes) ; `cascade` **reste servi, étiqueté « v0, replaced at U-5 » dans son texte SERVI** (écart ouvert depuis 51 ; aujourd'hui seulement `cascade.ts:53`), **à fermer dans -2a** ; **aucun amendement D14, aucun bump de version, aucune publication externe**.
- `:626` **repli B** si le G0 de U-5 ne prévoit aucun producteur servi (infaisable K-8 : la règle ŷ importe `node:fs` + sentinel) : 3 outils + amendement D14/M007/ADR-M020:41 + bump `HARNESS_VERSION` (commit du tag) + MCP Registry/skill (publication externe) + pierre tombale 410 `replaced_by`.
- `:627` items formés (orchestrateur) : (i) G0 U-5 tranche son périmètre (3 docs divergent) ; (ii) faisabilité producteur PUR K-8 + oracle d'égalité sur TOUTES les lignes `score_a` du JSONL frais ; (iii) relevé des appels externes `cascade` (logs servis) ; (iv) pivot D5 ADR-M020 NON TIRÉ.
- `:644` « les trois questions du soir closes : 123 (cascade = D), 124, 125 ».

## M-20. Checkpoint-1 (`CHECKPOINT1-lot-u4b-2.md`, validateur `claude-fable-5-1`) — ESCALADE + C-1..C-12
- `:8` **ESCALADE-INVESTISSEUR** : le ruling « -2a retire `cascade`, Ukemi `upcoming`, 4→3 » contredit **décision 51 sur ses trois points** (`:30` = `CHANTIERS.md:116` Q1/Q2/Q3). Fond technique sain ; corrections C-1..C-12 `:69-86`.
- BLOQUANTES : **C-1** `:71` (ordre de fusion, retirer « upcoming »), **C-2** `:72` (renumérotation), **C-3** `:73` (test nomme `apps/sentinel/test/fixtures/ukemi/u4b/U4b-book-<bloc>.json` + oracle-path ; `run` du descripteur `gate` + `handleJsonMirror` ; e2 `under_calib` avant / frais après ; book frais in-repo sinon item), **C-4** `:74` (`u4b_committed_registry_equals_generator_output`), **C-5** `:75` (deux tests `strateOf` : 9 frontières SERVIES + chaque `score_a` ; jumeau sentinel + `export-exclude-tests.json`), **C-6** `:76` (amendement daté ADR-U4b, clé re-dérivée serveur, déviation ADR-M020 D1(b)).
- NON BLOQUANTES : **C-7** `:79` (400 nommés ∈ `TOOL_ERROR_NAMES` ; borne basse `max(0,ŷ−q̂)` ; ŷ<0 ⇒ 400 ; description exige `alpha=0.01,nMin=100`), **C-8** `:80` (remplacer « K=2 » par le libellé H-3 ; texte par strate en NON ; mutant (h) « no other event »), **C-9** `:81` (périmètre `no_cascade…` ; **écartés gelés** `coverage-verdict.schema.json:5`, `types.ts:202`, `packages/ukemi/**`, `vocab-banned.json` ; surfaces additionnelles), **C-10** `:82` (bump version + tag + publication externe ⇒ go investisseur), **C-11** `:83` (section MAST), **C-12** `:84` (ré-estimer R-25 avec `h5-trace-builder.ts`+`h5-e2e-probe.test.ts` ; chemin fixture ; provenance sans `anchor_price`/`pstar`/`m_bps` ; A-7 séparé).
- `:86` rulings **Q-4 (400), Q-5 (garder `packages/ukemi`), Q-9 (STOP)** conformes ; **Q-6 première moitié** (`fleet.ts` gaté) conforme.
- `:99` (§10 complément) : garde anti-override `gate.ts:558-559` interroge le registre avec le `predictor_id` DU CLIENT ⇒ clé re-dérivée serveur ⇒ `predictor_id` nu contournerait sans class-lock ⇒ **test 5 est un tueur réel**.
- `:34` `alpha`/`nMin` **`required`** dans `params` (`schema-projection.ts:114`) ⇒ le refus 400 bien défini. `:35` `@monark/monark` déjà dépendance harness ⇒ test dans `apps/harness/test/` (Q-7). `:36` `ukemi-u4b-scores.test.ts` EXCLU export ⇒ double test (C-5). `:37` chemin réel `apps/sentinel/test/fixtures/ukemi/u4b/`, `U4b-book-23545087.json` committé.

## M-21. H-3 bêta-binomial (`PLAN-u4b-prereg.CANDIDAT.md:92,98`) — remplace « K=2 » (C-8)
- `:92` **H-3 = test exact BÊTA-BINOMIAL unilatéral 5 %** (ruling Q6), par strate SERVIE + cellule A poolée ; couverture `s ≤ q̂` ; **`k=2` REJETÉ** (pas un niveau : faux-NON 3,6 %→10,4 % selon n). Strate e2 de comparaison < 50 (strates 2:46, 3:8) ⇒ H-3 **non testable, rapporté**. Texte servi : « un OUI de H-3 ne licencie rien de plus » ; mutant sur-revendication ⇒ ROUGE.
- `:98` **H-3/H-4/H-5 = seuils de RAPPORT, PAS de validité** ; « rien de servi ne dépend de ces trois constantes ». Établis (validité) : `α=0,01`, `nMin=100`, coupes `{2000e8,100k$,1M$}`, `X=0`, `N_min=50`, tie-break (i).

## M-22. Fixtures committées + version.ts
- `git ls-files apps/sentinel/test/fixtures/ukemi/u4b/*` : `PROVENANCE-u4b.md`, `U4b-book-23545087.json`, `U4b-oracle-path-e2.jsonl`, `U4b-scores-e2.jsonl` (e2 ; les FRAIS suivront en -1b, mêmes noms avec bloc/épisode frais).
- `apps/harness/src/version.ts` : `HARNESS_VERSION` = source unique de la version annoncée (MCP `initialize`, OpenAPI) ; « Bumping this constant belongs to the SAME commit as the tag it names » ⇒ **aucun bump en U-4b-2** (aucun tag/publication ; décision 123). Tag public courant `v0.4.0` / registre `tech.monarkgate/monark @0.4.0`.

## M-23. Restructure sous 123 — conséquence R-25 (C-12)
- Le retrait `cascade` (~450-600 lignes, `CHANTIERS.md:625`) **sort** de -2b vers U-5 ⇒ -2a ≈ 400, -2b ≈ 300-380, **les deux ≪ 1205**. La scission n'est plus contrainte R-25 mais **dépendance** (registre frais ⇒ après la course). `no_cascade_class_in_harness` + périmètre C-9 ⇒ **U-5** (adapté à 123 : `cascade` non retiré ici).
- `fromRealizedBook` (producteur servi) : **déplacé à U-5** (remplaçant réel, 123 `:624`) ; le test servi de -2 source un ŷ committé des lignes `score_a` (aucun objet à la main, C-3) ⇒ pas d'adaptateur A-6 en U-4b-2 (écart au checkpoint-1 §10 pré-123, signalé Q-NEW-1).

---

# APPEND — Pli du checkpoint-1 **DELTA** (D-1..D-11, décisions 126/127) — 2026-09-22, worker `claude-opus-4-8[1m]`

Base : `lot/etude-suite` HEAD **`4e63f7b`** (avancé depuis `cabd3d5` par les seuls commits `docs/` de l'orchestrateur). Aucune écriture hors `F:\tmp\u4b-2\`, aucun réseau, aucun commit, aucune variable d'environnement affichée (A-7). Chaque mesure est rejouable depuis `F:\Monark`. **Une mesure par correction** (M-25..M-34) + base (M-24). Les D-n ci-dessous sont les **corrections du delta** (§15 du PLIE2), à ne pas confondre avec les D-n de conception (§3).

## M-24. Base drift (delta « base stale ») — HEAD a avancé
```
git -C F:/Monark rev-parse HEAD               # 4e63f7b82a4b69e384fa35f832fc8636af820096
git -C F:/Monark rev-parse --abbrev-ref HEAD  # lot/etude-suite
git -C F:/Monark status --porcelain           # (vide)
git -C F:/Monark merge-base --is-ancestor cabd3d5 HEAD ; echo $?   # 0 (cabd3d5 EST ancêtre)
```
`4e63f7b` = commit « CHECKPOINT-1 DELTA U-4b-2 (validateur-humain) » (gitStatus de session). Le PLIE.md portait `cabd3d5` ⇒ **en-tête PLIE2 « Base mesurée » re-pinné `4e63f7b`** ; sans cela, base stale = même classe de défaut que delta D-6.

## M-25. delta D-1 / D-11 — 126 FORME borne haute ; `region.kind` gelé `interval` ; « interval » scopé
- `packages/contracts/src/types.ts:205-207` : `PredictionRegion = {kind:"set"; labels; label_schema} | {kind:"interval"; lo:number; hi:number}` — **seules 2 formes ; aucun `kind` « upper_bound »**. `coverage-verdict.schema.json:45` (delta §3) `"kind":{"const":"interval"}`. ⇒ la borne haute 126 s'implémente `kind:"interval"`, `lo=0`, `hi=ŷ+q̂` — **contrat gelé intact**.
- `packages/hikae/src/region.ts:62-77` : `buildIntervalRegion(lo,hi)` — non-fini ⇒ `under_calib` (`:63-65`), `lo>hi` ⇒ throw (`:66-69`), `lo===hi` ⇒ `under_calib` NDG-1 (`:71-76`), sinon `{kind:"interval",lo,hi}` (`:77`). ⇒ `liqUpperBoundRegion(ŷ,q̂)=buildIntervalRegion(0,ŷ+q̂)` réutilise ces gardes.
- `apps/harness/src/tools/gate.ts:522-527` `gateVerdictSummary` imprime `region=[lo, hi]` (crochets, **pas le mot** « interval ») ; le mot « interval » n'est servi que dans le texte BYO `gate.ts:130` (delta) et les contrats gelés ⇒ **mutant (o) « interval » scopé au texte de la CLASSE** (ni `vocab-banned.json`, ni `gate.ts:130`).
- `l3-gate.ts:119-138` `decideInterval` : NDG-1 `lo>=hi` FIRST (`:123`) ⇒ la borne haute `[0,ŷ+q̂]` transite le chemin `interval` L3 déjà en place. **Aucune garde de largeur** sur le motif `stableRunVerdict` (grep `interval_too_wide` : seul `l3-gate.ts:131` sous `clockOpen`) ⇒ la strate 0 large sort `covered`, pas `too_wide` (rien à pré-déclarer).

## M-26. delta D-2 — règle q̂=0 : le générateur GELÉ committe q̂=0 ⇒ règle SERVEUR (objection écrite, non moot)
- `packages/hikae/src/l1-split.ts:34-42` `splitQuantile` : `n<nMin ⇒ under_calib` (`:36`) ; `p=ceil((n+1)(1-alpha))` (`:37`) ; `p>n ⇒ under_calib` (`:38`) ; `q=sorted[p-1]` ; `q===undefined ⇒ under_calib` (`:41`, garde noUncheckedIndexedAccess) ; sinon `{qhat:q}` (`:42`). ⇒ **all-scores-0, n≥nMin, p≤n : `sorted[p-1]=0`, `q=0`, retourne `{qhat:0}` — JAMAIS `under_calib`**.
- `scripts/record-u4b-calib.mjs:44-56` : `sq=splitQuantile(...)` (`:45`) ; `underCalib="reason" in sq` (`:46`) ; l'entrée est poussée avec `under_calib: underCalib` (`:56`). ⇒ une strate q̂=0 (n≥nMin) est poussée `under_calib=false` ⇒ **COMMITTÉE**. Le générateur est **gelé** (ADR-U4b D4, sha `5733daeb…`) ⇒ la règle q̂=0 **ne peut pas** y vivre ; l'émetteur non plus (casserait 2b-3 registre==générateur). ⇒ **serveur** (`liqUpperBoundRegion`).
- `packages/hikae/src/l3-gate.ts:85-90` : `if (input.nCalib < input.nMin || input.verdict.reason === "under_calib") return ABSTAIN under_calib`. ⇒ un `underCalibVerdict` à **`n_calib ≥ nMin`** (cas q̂=0) est **cohérent** au L3 (D6(b)/ADR-M011 ferme le trou `p>n`/NDG-1 à n≥nMin). Verdict émis : `underCalibVerdict` sur les scores committés (n_calib=n, qhat=null, digest sur l'array committé, reason=under_calib). **`[0,ŷ]` est valide sous échangeabilité** ; l'abstention est un choix d'HONNÊTETÉ (précision fabriquée, esprit NDG-1 `region.ts:71-74`), pas un échec de garantie.
- **PRÉCÉDENT MESURÉ `gate.ts:475-482` (pourquoi la borne haute PERD la protection NDG-1, et la forme du verdict à réutiliser)** : `stableRunVerdict` fait `buildIntervalRegion(yhat − split.qhat, yhat + split.qhat)` (**symétrique**, `:475`) ; quand q̂=0, `buildIntervalRegion(ŷ, ŷ)` ⇒ `lo===hi` ⇒ NDG-1 ⇒ `under_calib` **automatiquement** (`:476-482`). La forme **borne haute** `buildIntervalRegion(0, ŷ+0)=buildIntervalRegion(0, ŷ)` a `lo=0 ≠ hi=ŷ` (pour ŷ>0) ⇒ **NDG-1 ne se déclenche plus** ⇒ `[0,ŷ]` `covered`. C'est **exactement** le trou que la règle q̂=0 doit combler explicitement (spécifique à la forme borne haute). Et la **forme du verdict à émettre** (`underCalibVerdict` sur `scores` committés, n_calib≥nMin) **existe déjà** en `:478-482` (branche NDG-1 de `stableRunVerdict`) ⇒ le verdict prescrit en §3 D-12 est le motif **déjà présent**, pas une invention.

## M-27. delta D-3 — sur registre vide, la strate serveur n'est PAS observable (2a-7 corrigé, option b)
- `packages/hikae/src/verdict.ts:40-56` `buildVerdict` : `CoverageVerdict` = {schema_version, task_class, method, alpha, n_calib, region, qhat, abstain, reason, residual, calib_digest, produced_at, [scores]} — **AUCUN champ `predictor_id`**.
- `apps/harness/src/tools/registry.ts:72` : `honestyText(env.prediction.task_class, env.prediction.predictor_id, env.params.calibration!==undefined)` — reçoit le **`predictor_id` CLIENT**, jamais la clé serveur `.../s<k>`. `gate.ts:500` `honestyText(taskClass, predictorId, isByo)` — **pas de paramètre `yhat`**.
- ⇒ deux ŷ de strates ≠, registre vide : verdict `under_calib` **identique** (n_calib=0, region set vide, qhat=null) ET texte d'honnêteté **identique** (branche `CASCADE_UNCALIBRATED`/liq empty-registry, indépendante de ŷ) ⇒ **assertion « deux ŷ ⇒ deux strates serveur » NON falsifiable** en -2a (CA-1). **Option (b)** : 2a-7 n'asserte que `under_calib`+400 (observable) ; strate∼ŷ prouvée par 2a-6a/2a-6b (fonction `strateOf`) et 2b-4 (artefact réel). **Option (a) rejetée** : porter `…/s<k>` dans `honestyText` exige un **changement de signature** (`gate.ts:500` + `registry.ts:72`) + une chaîne servie ŷ-dépendante sans calib derrière (contre [C-1]).

## M-28. delta D-4 — classe inconnue ⇒ `HarnessToolError`/400, PAS `under_calib`
- `apps/harness/src/tools/gate.ts:602-603` : le `else` du dispatch ⇒ `throw new HarnessToolError(\`unknown task_class '${taskClass}' (known: ${TASK_BTC_DIR}, ${TASK_CASCADE}, ${TASK_STABLE_RUN}; or supply params.calibration for BYO)\`)`. ⇒ classe B (`liquidation-realized-given-liquidated`) **lève** (400 miroir via `http.ts:36` `TOOL_ERROR_NAMES`), **jamais `under_calib`**. Le message liste les classes **`known`** (aucune classe B) ⇒ l'ancien D-2(b) « ⇒ `under_calib` (classe inconnue) » était FAUX **et** aurait exigé le nom de B dans `gate.ts` (contredit D-2(a) grep=0). Après -2a : `known:` gagne `TASK_LIQ_ELIGIBLE`, classe B reste dans le `else` ⇒ throw.

## M-29. delta D-5 — tuyaux `ADR-U4b:26-27` périmés sous 123/126
- `docs/adr/ADR-U4b-calibration-episode-frais.md:26` : `| région servie | calibration.ts K entrées classe A + strateOf serveur | outil MCP gate → GateDecision | built ssi test servi vert (**-2**) | u4b_gate_serves_region_from_real_artifact |`.
- `:27` : `| cascade retrait | 8 fichiers gatés + fleet.ts (site, décision 101) | classe synthétique disparue | **-2** | no_cascade_class_in_harness |`. ⇒ **périmé** : sous 123 le retrait cascade est **U-5** (pas -2) ; la région servie est **-2b** (registre frais). L'amendement 2a-8 réécrit `:27` (cascade→U-5/-5b) et `:26` (`-2`→`-2b`), cite 123 (producteur=U-5) et 126 (borne haute) ; **8 sha D3/D4 portés par U-4b-SCORE-1** (`CHANTIERS.md:651`), 2a-8 y renvoie.

## M-30. delta D-6 — ordre avec U-4b-SCORE-1 : -2a robuste au re-gel du score
- `CHANTIERS.md:651` (décision 126, lot SCORE-1) : fixture `U4b-scores-e2.jsonl` régénérée, « census attendu identique, **seuls digests/q̂ de cellule changent** » ; `u4b-scores.mjs` **octets changent** (`:244`+`:29`) ⇒ **sha D4 `9ad20666…` DEVIENDRA FAUX** après SCORE-1.
- Ligne `score_a` (delta §3, `U4b-scores-e2.jsonl`) = `{address, y, yhat, score, liquidated, strate, m_bps, pstar}`. 2a-6b/2a-7 ne lisent que `yhat`, `strate`, `meta.cell_a.predictor_id` — **le score unilatéral ne touche que `score` et les q̂/digests de cellule**, pas `yhat`/`strate`/`predictor_id` ⇒ **-2a invariant sous SCORE-1 par construction**. Règle écrite : sha D4 cité en G1 = valeur **post-SCORE-1 courante** ; re-pin déclaré au pli G2 si le JSONL change entre G1 et fusion (§11 item 10).

## M-31. delta D-7 — 127 : -2b sert une classe calibrée ⇒ surfaces publiques dans -2b
- `skills/monark/SKILL.md:56-62` : « The **two built-in** `task_class` values (`btc-dir-15m`, `cascade-liquidable-24h`) are internal plumbing fixtures … » ; `:64-71` : « A **third** `task_class`, `stable-run-velocity-24h` … is **served by this endpoint** with a **committed calibration for one population** ». ⇒ quand -2b committe la classe liq (servie), SKILL.md doit l'ajouter (4ᵉ classe servie/committée : borne haute, aucune couverture autre événement, un OUI H-3 ne licencie rien).
- `CHANTIERS.md:654-657` (127) : toute MAJ majeure (« changement de classe servie ») porte skill/MCP/README/site/openapi/h5 **dans le même lot** ; l'acte de push = **go release**. ⇒ §8 du PLIE.md (« `SKILL.md` non modifié ») est vrai **pour -2a seulement** ; **-2b** ajoute SKILL/README/openapi/h5 à son périmètre et R-25.
- **Bump vs surfaces (regression corrigée, Q-NEW-5)** : `CHANTIERS.md:625` (123) « aucun bump de version … à ce stade » scope **tout U-4b-2** (lot entier, -2a ET -2b) ; 127 liste un bump comme **déclencheur** d'une MAJ majeure, **pas** comme conséquence d'un changement de classe. ⇒ -2b **édite** les surfaces publiques **SANS bumper** `HARNESS_VERSION` ; le bump = **U-5** (retrait cascade) OU commit du tag au **G0 -2b** si la fiche MCP Registry exige un numéro (`version.ts` : « Bumping this constant belongs to the SAME commit as the tag it names », M-22). **Aucun bump implicite** dans ce pli. (Le PLIE2 §5/§9(5) initial narrait « bump en -2b » — corrigé.)

## M-32. delta D-8 — mapping `Prediction` déterministe ; `fleet.ts` = moitié consommatrice
- Fixture committée (M-22, `git ls-files apps/sentinel/test/fixtures/ukemi/u4b/*`) : `U4b-scores-e2.jsonl` (565 lignes ; meta `cell_a.predictor_id`). 2a-7/2b-4 : ŷ = `Number(row.yhat)` sur **TOUTES** les lignes `score_a` (ou règle de sélection pré-déclarée), `predictor_id = meta.cell_a.predictor_id` committé — **jamais deux valeurs choisies à la main** (CA-11 durci). `fleet.ts` `served_by`/`note` : **moitié consommatrice** ; producteur `fromRealizedBook` = **U-5** (jamais sous-entendu servi ici). Q-U5-0 = « A-6 non livré par -2a » figée dans l'état d'entrée U-5 (`G0-lot-u5.DRAFT.md:44`).

## M-33. delta D-9 — clauses 126 (1)/(2) dans le texte par strate (-2b)
- `CHANTIERS.md:646-650` (126) : clause (1) H-3 « test bêta-binomial unilatéral, **CONSERVATEUR sous ex æquo (atomes en 0 comptés couverts)** » ; clause (2) « condition d'épisode **n ≥ 199** par strate servie pour un q̂ intérieur, distincte de nMin=100, sinon **q̂ = max rapporté tel quel** ». `PLAN-u4b-prereg.CANDIDAT.md:92` (M-21) : H-3 exact bêta-binomial 5 %, `k=2` rejeté. ⇒ note H-3 par strate (-2b) : conservateur sous ex æquo ; q̂=max si 100≤n<199. Déclencheur G1 -2b.

## M-34. delta D-10 — R-25 -2a RECOMPTÉ (≈ 480-500 ≪ 1205)
Pathspec exacte M-18 (`ci.yml:65`) ; **`fixtures/PROVENANCE-h5-e2e-trace.md` COMPTE** (`.md` hors `docs/` ; l'exclude `fixtures/**/*.{json,jsonl,csv}` ne matche pas `.md`), la trace `.json` non. Recompte (pli PLIE.md : 430 ; delta §4(6)) :
```
-2a : ukemi-strata.ts strateOf ~25 + helper liqUpperBoundRegion ~10
      gate.ts branche ~50 + 400 nommés ~15 + textes ~20 + message known: ~1        ≈ 96
      attestation-binding.ts ~4 ; cascade.ts étiquette v0 ~6
      re-pins : h5-e2e-probe.test.ts ~2 + PROVENANCE-h5.md ~3 + openapi/cascade ~10  ≈ 15-30
      tests : 2a-6a ~40, 2a-7 ~90, dispatch/400/class-lock/attested/no-prob/
              texte-vide/v0/upper-bound ~120, 2a-6b ~50,
              helper région + q̂=0 ~25-35, classe-B exécutée ~10, export-exclude ~2   ≈ 340-350
      TOTAL ≈ 480-500   (écart vs 430 = 126 borne-haute/helper + delta D-2 q̂=0 +
                          delta D-4 classe-B exécutée + PROVENANCE-h5.md)
-2b : calibration.ts K tableaux+gardes (e2 : 2 strates 363+148 ≈ 64 l.+~40 ≈ 110 ; frais inconnu)
      + émetteur ~60 + registry==generator ~40 + re-pin test servi ~40 + fleet.ts ~15
      + export ~5 + surfaces 127 (SKILL/README/openapi/h5) ~20-30                    ≈ 300-410
```
Les DEUX ≪ 1205. Re-scission -2b (« registre » / « fleet+test+surfaces ») pré-déclarée si n/strate FRAIS gonfle `calibration.ts` (Q-10).

## M-35. delta D-11 — MAST « dérive de forme » : le motif `stableRunVerdict` est SYMÉTRIQUE (source du mutant (n))
- `apps/harness/src/tools/gate.ts:475` (VÉRIFIÉ ce tour) : `const ir = buildIntervalRegion(yhat - split.qhat, yhat + split.qhat)` — **région symétrique** `[ŷ−q̂, ŷ+q̂]`. C'est le motif que 2a-2 réutilise (`stableRunVerdict:446-489`, M-2) : **copier `:475` tel quel ré-introduirait la forme symétrique** au lieu de la borne haute `buildIntervalRegion(0, ŷ+q̂)` (délégué au helper `liqUpperBoundRegion`, 2a-1). ⇒ **ligne MAST « dérive de forme »** (FM-2.6 raisonnement/action) + **mutant (n)** : forme symétrique servie ⇒ ÉCHEC du test `u4b_liq_upper_bound_region_helper` (littéral `hi===ŷ+q̂`, `lo===0`) ⇒ ROUGE. Contre-mesure : helper isolé testé par littéraux (la composition sur artefact réel reste 2b-4), jamais un `buildIntervalRegion` symétrique inline dans `liqEligibleVerdict`.
