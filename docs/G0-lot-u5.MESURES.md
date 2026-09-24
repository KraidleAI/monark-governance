MODELE RESOLU: claude-opus-4-8[1m]

# MESURES — G0 lot U-5 (Ukemi : PRODUCTEUR de ŷ, décision 123) — reproductibles

> Worker `claude-opus-4-8[1m]`, effort max (Opus 5 banni), 2026-09-22. Mission DOCS SEULEMENT.
> `F:\Monark` en LECTURE SEULE ; écriture confinée à `F:\tmp\u5\` ; rien sur `C:` ; aucun réseau ; aucun commit (R-20). Règle A-7 : aucune variable d'environnement affichée ; aucun test payant lancé.
> Base : branche `lot/etude-suite`, HEAD `cabd3d583d11b50a8d259b80275ffbeffc18d1a6` (`git rev-parse HEAD`, `git status` = clean).
> Chaque ligne ci-dessous est une preuve reproductible (R-21). Toute affirmation d'ingénierie du G0 pointe ici.

---

## M-0. Provenance de la base

```
git rev-parse HEAD           -> cabd3d583d11b50a8d259b80275ffbeffc18d1a6
git rev-parse --abbrev-ref HEAD -> lot/etude-suite
git log --oneline -1         -> cabd3d5 Decision 125 (...) Bell course ceiling ...
git status --porcelain       -> (vide)
```
Décisions lues [lu] : `docs/CHANTIERS.md` 47/49/50/51/52/59 (l.113-124), 108-111 (l.467), 119 (l.559-562), 122 (l.607-613), **123 (l.622-627)**, 124 (l.629-636), 125 (l.638-644). Avis [lu] : `F:\PRODUITS\etude-2026-09-21\consultation-3-questions\AVIS-advisor-{architecte,defi,marche}-*.md`.

---

## M-1. Le PRODUCTEUR n'existe pas ; le siège à remplacer = `cascade`

- `packages/monark/src/adapter-book.ts` exporte `fromAttestedBook` (`:88`) et `toAttestedBook` (`:232`) — **`fromRealizedBook` ABSENT** (grep `fromRealizedBook packages/monark` = 0). Confirme architecte (`AVIS-architecte:21`) et DeFi (`AVIS-defi:47`).
- `apps/harness/src/tools/cascade.ts` : `runCascade(input: CascadeInput): Prediction` (`:197`), entrée `FinancialSystem {L,e,shock,producedAt}` (`:98-107`), sortie **`Prediction`** (`:44,:200`) consommée par `gate` en aval (`:8-10`). Le siège tenu par `cascade` = **producteur de `Prediction`**, pas une `GateDecision`.
- `cascade.ts:53` : commentaire « Removed with the cascade tool at U-4 (ADR-M020 D4 amended by decision 51) » — l'intention de retrait ENTIER de l'outil est déjà écrite.

## M-2. La règle ŷ GELÉE et ses dépendances (faisabilité K-8)

`scripts/census/u4b/u4b-scores.mjs` (sha D4 `9ad20666…`, gelé par le prereg -1b) :
- **Imports à effet de bord** : `readFileSync` de `node:fs` (`:31`), `createHash` de `node:crypto` (`:32`), `fileURLToPath` `node:url` (`:33`), `resolve` `node:path` (`:34`).
- **Imports apps/sentinel** : `percentMul` de `apps/sentinel/src/ukemi/wadray.ts` (`:35`), `decodeEModeCategoryData` de `apps/sentinel/src/ukemi/abi.ts` (`:36`).
- **Fonctions PURES exportées** : `STRATA_CUTS = [2e11,1e13,1e14]` bigint (`:53`), `strateOf(yhat)` (`:54-59`), `computeScoresU4b(book, oracle, u3lines)` (`:76-273`), `resolveRunnerInputs(argv)` (`:277-281`).
- **Cœur ŷ par compte** (`computeScoresU4b`, à ré-implémenter SANS I/O) : résolution réserve WETH `p0/aWeth/vWeth/wethBaseLT/wethBaseBonus/wethEmCat` (`:88-94`), map `resByV` (`:96`), chemin de prix `path = [anchor, ...updates triés (block,logIndex)]` (`:98-100`), `hfAt(p)` (`:163-170`), premier franchissement `HF < 1e18` (`:172-177`), `C_weth`, `CA = C_weth·1e4/bonus` (`:179-180`), `D_tot`, `halfDtot = percentMul(D_tot,5000)` (`:181-183`), boucle ŷ = **max** sur réserves de dette (`gate = C_weth≥2000e8 && D_r≥2000e8 && hfStar>0,95e18` ; `CF = gate ? min(D_r,halfDtot) : D_r` ; `yb = min(CF,CA)`) (`:186-211`), mono-collatéral-WETH X=0 EXACT (`residual = totalColl0 − wethColl0 ≠ 0 ⇒ non_evaluable`) (`:145-149`), e-mode fail-closed à {0, WETH-cat} (`:152-160`), dust `dust_bounded` compté (`:217-221`).
- **Constantes v3.5.0** : `T=2000e8` (`:44`), `LEFT=1000e8` (`:45`), `HF95=0,95e18` (`:46`), `CF_BPS=5000` (`:47`) — « CLOSE FACTOR v3.5.0 » (`:5`), source `PR-U4-3` (LiquidationLogic.sol Aave v3.5.0, `ADR-U4b:10`).
- **`percentMul`** (`apps/sentinel/src/ukemi/wadray.ts:21-23`) : `(value·bps + 5000) / 1e4`, bigint pur, **le fichier n'importe RIEN** (0 import). Ré-déclaration triviale (3 lignes).
- **`decodeEModeCategoryData`** (`apps/sentinel/src/ukemi/abi.ts:173-184`) : décode des octets ABI ; **`abi.ts` importe `TRANSFER_TOPIC` de `../rpc.ts`** (`:7`) ⇒ importer `abi.ts` dans un outil tirerait `rpc.ts` (couche RPC, non-K-8). **Contournement mesuré** : la règle gelée prend déjà `oracle.emode_params` **DÉCODÉ** (`{ "1": {lt,bonus} }`, `u4b-scores.mjs:84,:158-159`) — le décodage se fait HORS outil (census). ⇒ le producteur prend `emode_params` décodé, **AUCUN décodeur ABI requis**, K-8 tenu.
- **`node:crypto` inutile** : `createHash` ne sert qu'aux `calib_digest` par cellule/strate (`:61,:260,:265`) — le producteur émet **un** ŷ, pas de digest de calibration ; `book_digest` est **porté** par le book (`M-4`), jamais recalculé.

## M-3. Frontière K-8 (scan des outils) — ce qui est interdit

`apps/harness/test/registry.test.ts` — `mcp_tools_have_no_side_effects` :
- **FORBIDDEN** (`:31-37`), scan TEXTE de `src/tools/**` (non transitif) : `"node:fs"`, `"node:net"`, `"node:child_process"`, `fetch(`, `process.env.X =` (écriture). **`node:crypto` non listé** (mais inutile, M-2).
- Set EXACT (`:57`) : `assert.deepEqual([...REGISTERED_TOOL_NAMES].sort(), ["attest","calibrate","cascade","gate"])` + `includes("cascade")` (`:50`) ⇒ **remplacer cascade** = éditer `:50` et `:57` (+ commentaires) — le tueur de « registre exact ».
- En-têtes K-8 déjà tenus : `gate.ts:5-8`, `cascade.ts:12-15`, `registry.ts:15-17` (« imports no node:fs/net/child_process, calls no fetch, writes no process.env, reads no clock »).

## M-4. Book réduit — STRUCTURE et TAILLE vs cap 256 KB (mesuré)

`node -e` sur `apps/sentinel/test/fixtures/ukemi/u4b/U4b-book-23545087.json` :
- **Taille totale = 7 501 755 octets ≈ 7,5 Mo** (`find … -printf "%s"`). **≈ 29× le cap 256 KB.**
- `schema="ukemi-book/1"`, `chain_id=1`, `cluster="weth"`, `block="23545087"`, `book_digest="695d862fd1560d5a0ae1349f358accd36ecf394437bd2f497fa1a0fae7d7ab09"`.
- **39 réserves** ; `reserves[]` JSON = **12 401 octets** ; clés réserve : `asset, atoken, variable_debt_token, decimals, liquidation_threshold_bps, liquidation_bonus_bps, reserve_emode_category, price_base_8dec`.
- **16 096 comptes** ; entrée compte : **moyenne 464 o, max 1 893 o** (23 soldes) ; clés compte : `address, user_config, emode, balances, total_collateral_base, total_debt_base, current_liquidation_threshold_bps, hf_onchain, eligible_static`.
- **CONSÉQUENCE (mesurée)** : book ENTIER **inservable** (7,5 Mo ≫ 256 KB). **Tranche mono-compte** = `reserves[]` (12,4 KB) + 1 compte (≤ 1,9 KB) + `D_e` (17,7 KB, M-5) + `emode_params` (petit) ≈ **~32 KB** ⇒ **tient largement sous 256 KB**. Cap réseau : Caddy `request_body max_size 256KB` (`deploy/Caddyfile.monark-harness:10,17`) ; garde INTERNE harness `MAX_REQUEST_BODY_BYTES = 512*1024` ⇒ 413 (`apps/harness/src/server.ts:40-46`).

## M-5. D_e (chemin d'oracle) et prédicteur — format

`U4b-oracle-path-e2.jsonl` = **17 674 octets**, 142 lignes, `schema="ukemi-u4b-oracle/1"` :
- `anchor` ×1 : `{block, price:"434687000000", source, note}` ; `meta` ×1 : `{event_id:"e2-2025-10-10-weth", aggregator_at_b0/b_last, phase_change, p_min, p_max, n_updates, ...emode_params/usdt_prices}` ; `update` ×140 : `{block, log_index, price, round_id, updated_at}`.
- Le producteur a besoin de `anchor_price` + `updates` (chemin) + `emode_params` (LT/bonus e-mode). **`usdt_prices` NON requis** : ne sert qu'au Y/déficit (scoring), pas au ŷ (`u4b-scores.mjs:113-116`).
- Base `predictor_id` (`U4b-scores-e2.jsonl` meta.cell_a) : `ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/e2-2025-10-10-weth/A` ; suffixe strate `/s<k>` (= `UKEMI_LIQ_PREDICTOR_BASE`+`/s`+k, U-4b-2 2a-1). **`event_id` est un PARAMÈTRE** (`u4b-scores.mjs:77-78`, « never hard-coded ») ⇒ l'épisode FRAIS aura un autre `event_id`.

## M-6. L'oracle d'égalité — cible mesurée

`U4b-scores-e2.jsonl` = **128 205 octets**, 665 lignes : `meta`×1, **`score_a`×565**, `score_b`×99.
- Ligne `score_a` : `{kind:"score_a", address, y, yhat, score, liquidated, strate, m_bps, pstar}`. Ex. : `{"address":"0x00234…","y":"0","yhat":"464042425771","score":"464042425771","liquidated":false,"strate":1,"m_bps":"10500","pstar":"345670460000"}`.
- **Oracle** : pour chacune des 565 lignes `score_a`, `producteur(book[address], D_e, emode).{yhat,strate,m_bps,pstar}` **===** la ligne. Le book porte les 16 096 comptes ⇒ on peut AUSSI rejouer `computeScoresU4b` gelé LIVE (test export-exclu, motif `ukemi-u4b-scores.test.ts`) et comparer sur TOUS les comptes évaluables (dont ŷ=0 no-crossing, non_evaluable). Idem sur le JSONL FRAIS après la course -1b.

## M-7. Contrat `Prediction` GELÉ — ce qui rentre / ne rentre PAS

`schemas/prediction.schema.json` (`additionalProperties:false`) :
- `required` : `schema_version` (`^\d+\.\d+\.\d+$`), `task_class` (`^[ -~]+$`, minLength 1 — **string LIBRE**), `yhat` (`string|number`), `predictor_id` (`^[ -~]+$`), `produced_at` (date-time).
- Optionnel : **`features_digest` (`^[0-9a-f]{64}$`)** ⇒ le `book_digest` (64-hex) peut rider DANS la `Prediction` via `features_digest` (liaison au book, contrat gelé intact).
- **strate, m_bps, pstar, block, clause C-6 NE RENTRENT PAS** dans la `Prediction` (`additionalProperties:false`) ⇒ **enveloppe K-1** `{prediction, provenance, label}` (motif `attest` `schema-projection.ts:234-252` : `{price, provenance, label}`).
- `task_class="liquidation-eligible-coverage"` conforme au pattern ; « cascade » n'apparaît dans `schemas/` que dans 2 DESCRIPTIONS (`coverage-verdict.schema.json:5`, `packages/contracts/src/types.ts:202`, GELÉS) ⇒ **aucun enum gelé touché** (confirme checkpoint U-4b-2 §3(2)).

## M-8. Surface publique « 4 outils » (retrait cascade = publication externe, C-10)

- `apps/harness/src/tools/registry.ts:32` : `ALLOWED_TOOL_NAMES = ["attest","gate","cascade","calibrate"]`. `version.ts:22` : `HARNESS_VERSION="0.4.0"` (tag `v0.4.0`, registre MCP `tech.monarkgate/monark`@0.4.0 ; « bump = même commit que le tag »).
- `http.ts` : routes = `REGISTERED_TOOL_NAMES` ; `TOOL_ERROR_NAMES = {HarnessToolError, CascadeToolError, AttestToolError, CalibrateToolError}` (`:36`) ; **404 `unknown_operation`** (`:78`) — **aucune pierre tombale 410** aujourd'hui.
- `openapi.ts:99` : info.description « attest, gate, cascade, calibrate ».
- **Surfaces publiques nommant les 4 outils / cascade** (grep) : `README.md:42,144,145,195,202` ; `skills/monark/SKILL.md:3,9,75`, `INTEGRATION.md:3,5`, `DEMO.md:9` (ClawHub — EXTERNE) ; `apps/harness/README.md:4,101,104` ; `apps/site/app/integrators/page.tsx:8,89` ; `deploy/monark-harness.service:15` ; `scripts/verify-harness.mjs:13,32,212-215` (asserte `task_class==="cascade-liquidable-24h"`, appelle le VPS LIVE).

## M-9. Footprint cascade (retrait dans la fusion U-5)

- Grep `-Iil cascade` (`*.ts,*.tsx,*.mjs,*.json,*.md`, hors `node_modules`) sur `apps packages scripts skills README.md deploy` = **43 fichiers** ; + `test/` racine (`cra-b.test.ts, h5-e2e-probe.test.ts, h5-trace-builder.ts, harness-export.test.ts, skills.test.ts`) = **48**. Checkpoint U-4b-2 §3(3) mesure **55 fichiers / 428 lignes / 558 occurrences** (grep insensible casse, inclut fixtures) — même ordre de grandeur, à re-mesurer au G1 U-5 (le footprint a bougé après U-4b-2).
- Pièces h5 : `fixtures/h5-e2e-trace.json` (21 859 o, cascade ×28 — EXCLU R-25), `test/h5-trace-builder.ts` (19 358 o, ×26 — COMPTE), `test/h5-e2e-probe.test.ts` (COMPTE).
- `packages/ukemi/**` (treillis U-2a) : à CONSERVER (décision 123 / U-4b-2 Q-5 : « on ne retire QUE l'outil ») ⇒ `@monark/ukemi` sans consommateur servi = item formé (ADR-M019 D5, D-9 U-4b-2).

## M-10. Garde R-25 (plafond de PR)

`.github/workflows/ci.yml` plafond **1205** (U-4b-2 §7) ; pathspec = `.` MOINS `{docs/**/*.md, package-lock.json, fixtures/**/*.{json,jsonl,csv}, apps/sentinel/test/fixtures/**, apps/bell/test/fixtures/series/**, ...}`. ⇒ COMPTENT : `apps/site/**` (dont `fleet.ts`), `scripts/**`, tous les `*.test.ts`, `test/h5-*.ts`. EXCLUS utiles : `fixtures/h5-e2e-trace.json`, les `U4b-*.jsonl/json` sous `apps/sentinel/test/fixtures/**`. (Estimation R-25 U-5 : §7 du G0.)

## M-12. FAISABILITÉ MESURÉE — ré-impl du bloc ŷ vs module gelé, 565/565 égal

Instrument `F:\tmp\u5\scratch\measure-producer.mjs` (mesure, PAS un livrable ; fixtures lues en LECTURE SEULE pour nourrir le calcul ; **le chemin de calcul n'a AUCUN I/O ni import sentinel** — `percentMul`, `strateOf`, bloc ŷ ré-déclarés). Il rejoue le producteur (tranche mono-compte) sur CHAQUE ligne `score_a` de `U4b-scores-e2.jsonl` :

```
score_a rows: 565
EQUAL on {yhat,strate,m_bps,pstar}: 565/565
mismatch: 0   address-not-in-book: 0
ONE-account served slice (all 39 reserves + 1 account + full D_e): 30244 bytes  (cap 256KB = 262144)
```

- **565/565 égal** sur `{yhat, strate, m_bps, pstar}` (bigint exact), 0 écart, 0 adresse manquante ⇒ le producteur PUR (K-8) reproduit le module gelé sur TOUT l'ensemble `score_a` (item 123(ii)). **Faisabilité MESURÉE, pas argumentée.**
- **Tranche mono-compte servie = 30 244 octets** (39 réserves + 1 compte + `D_e` complet) vs cap **262 144** (256 KB) ⇒ **marge ×8,67**. Confirme M-4 (élaguer les réserves descendrait plus bas encore).
- Bloc ŷ porté fidèlement de `u4b-scores.mjs:132-224` (moitié ŷ seule ; Y/déficit/`usdt_prices` non portés — non requis, M-2). Constantes v3.5.0 `T/LEFT/HF95/CF_BPS`, `percentMul`, `strateOf`, `STRATA_CUTS` ré-déclarés.
- **Portée de la preuve** : `score_a` = cellule A (comptes évaluables, ŷ>0 ∪ liquidés). Les branches fail-closed (non_evaluable, no_aweth) ne sont PAS dans `score_a` ⇒ l'Oracle B (rejeu du module gelé LIVE sur les 16 096 comptes, §2.2) reste dû pour les couvrir. Le no-crossing (ŷ=0, m_bps/pstar null) et le crossed-yhat-zero (m_bps/pstar non-null) sont couverts (présents dans les 565).

## M-13. Frontière -2a/-5a de `fromRealizedBook` (A-6) — NON tranchée à HEAD

- `packages/monark/src/adapter-book.ts` en-tête (`:12-13`) : « K-8 : this module … reads NO network / fs / env / clock : both functions are pure » ; importe `node:crypto` (`:14`, hors liste FORBIDDEN du scan d'outils M-3, et hors `src/tools/`). `@monark/monark` est **déjà une dépendance du harness** (`apps/harness/package.json:15`). ⇒ `fromRealizedBook` a sa place NATURELLE dans `packages/monark` (pur, importable par l'outil + les deux oracles + les tests), PAS dans `src/tools/`.
- **G0 U-4b-2 2a-5** (`:59`) planifiait `fromRealizedBook` dans `adapter-book.ts` en **-2a** (« book réalisé (+D_e, emode_raw) → Prediction, yhat = ENTIER base 8-déc »). **Checkpoint-1 U-4b-2 §10** (`:97`) le met dans « -2a re-périmétré … invariant à la réponse de l'investisseur ». **DeFi advisor** : « le DRAFT ne dit pas si A-6 calcule ou reçoit ŷ : à lever au checkpoint-1 delta » (`AVIS-defi:70`) — **non résolu à HEAD**.
- **Décision 123** déplace le PRODUCTEUR (et son adaptateur) à U-5 (« le remplaçant réel est le producteur … le retrait se déplace à U-5, avec le producteur ») ⇒ tension avec le -2a re-périmétré. ⇒ **Q-U5-0** (§11) : où atterrit le calcul pur de ŷ (-2a ou -5a) et A-6 calcule-t-il ŷ ? Home proposé dans les deux cas : `packages/monark`.

## M-14. Export public — Oracle A ne survit PAS tel quel à la copie publique

- `scripts/export-exclude-tests.json` exclut `apps/sentinel/test/ukemi-u4b-scores.test.ts` (il importe `scripts/census`).
- `scripts/export-exclude-data.json` : « U-4b -1a fixtures (u4b/, same e2 episode, **décision 111**, checkpoint-2 U-4b-1a C-V…) » ⇒ le book/scores u4b sont EXCLUS du miroir public. **Décision 111** (`CHANTIERS.md:471`, verbatim « Oui, retirer les 4 ») : les fichiers u4 hors miroir, « retour au miroir quand U-4b servira ».
- ⇒ un Oracle A dans `apps/harness/test/` lisant `U4b-book-23545087.json` (7,5 Mo) **échouerait dans la copie publique** (fixtures absentes). **Scinder** (motif U-4b-2 C-5) : (a) un test PUBLIC-survivant à **fixture littérale committée réduite** (une poignée de comptes couvrant les branches) dans `apps/harness/test/` ; (b) l'oracle COMPLET 565 lignes dans `apps/sentinel/test/` AJOUTÉ à `export-exclude-tests.json`.

## M-11. État d'ENTRÉE de U-5 (après U-4b-2 -2b, décision 123)

Ce que U-4b-2 aura livré AVANT U-5 (à confirmer par l'orchestrateur, prérequis) : classe servie `liquidation-eligible-coverage` dans `gate.ts` (dispatch, `strateOf` serveur, α/nMin serveur, class-lock, 400) ; registre FRAIS épinglé dans `calibration.ts` ; `fleet.ts` `Ukemi.wiring.served_by` re-câblé sur la jambe **gate** ; `cascade` TOUJOURS servi (v0, texte « v0, replaced at U-5 ») ; **4 outils inchangés** ; `HARNESS_VERSION` toujours `0.4.0`. `fleet.ts:161` actuel : `served_by = "MCP cascade → gate (cascade-liquidable-24h; abstains under_calib by construction…)"`.
