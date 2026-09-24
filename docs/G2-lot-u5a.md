# G2 U-5a (relecteur Opus 4.8, contexte frais) — PASS-AVEC-CORRECTIONS

Vérification finale confirmée : HEAD `fc2e732` ; arbre tracké propre (seul `G2.md` untracked) ; les 3 sha sources identiques à avant les campagnes de mutants (restauration byte-exact) ; G2.md durable (16 Ko). Rendu intégral ci-dessous (aussi écrit dans `F:\tmp\g2-u5a\G2.md`).

---

Modèle résolu : claude-opus-4-8[1m]

# G2 — lot U-5a (`fromRealizedBook` pur + module outil `ukemi-predict` NON enregistré, Option B)

> Relecteur G2, contexte frais, worker `claude-opus-4-8[1m]` effort max, 2026-09-22. R-20 : aucun commit, aucun workflow. R-21 : chaque affirmation porte sa preuve reproductible. Clone `git clone --no-hardlinks --branch lot/u5a F:\Monark F:\tmp\g2-u5a` (HEAD `fc2e732`, parent/merge-base `1f4b746`), node_modules isolé par `mk-nm.ps1` (220 entrées, monark 10, fail 0 ; `@monark/rpc-guard` résout vers le clone). A-7 : toute exécution (test, oracle, mutant, R-25) sous `env -u` des 8 clés (`HELIUS_API_KEY`, `CHAINSTACK_{ETH,SOLANA,BASE,BSC,ROBINHOOD}_URL`, `POLYGON_API_KEY`, `DATABENTO_API_KEY`) ; aucune variable affichée. Oracles A/B rejoués par instrument G2 indépendant.

## VERDICT : **PASS-AVEC-CORRECTIONS**
**Code conforme** — env -u : 881/880/0/1 (0 fail, 1 skip environnemental préexistant), typecheck 0, lint 0, ratchet 69/69, gate:vocab 0, lang:gate 0, export:check 0 ; **Oracle A 565/565 bigint-exact + Oracle B two-sided 16 096 comptes 0 faux-positif (rejoués par moi)** ; **mutants 15+5 (15 worker TUÉS + restaurés byte-exact ; 2 miens TUÉS ; 3 miens équivalents sur e2, grounded)** ; R-25 **1099 < 1150** (pathspec ci.yml:65 verbatim) ; fusion à blanc `lot/etude-suite` **0 conflit** (tsc merged 0) ; **CA-11 : 0 hit `ukemi-predict` en surface publique** ; DELIVERED.sha256 12/12 OK ; aucun fichier gelé touché. Corrections = **documentaires/hardening** (liste fermée §C), aucune n'est un défaut de code ni ne bloque la fusion.

État final : G2.md untracked dans le clone (attendu) ; arbre tracké propre, HEAD `fc2e732` ; sha des 3 sources identiques avant/après les DEUX campagnes de mutants.

---

## 1. Diff exact — aucun fichier gelé (mission pt 1) — CONFORME
`git diff --name-status 1f4b746 fc2e732` = **12 fichiers** : M `apps/harness/src/http.ts`, M `apps/harness/src/schema-projection.ts`, A `apps/harness/src/tools/ukemi-predict.ts`, A `apps/harness/test/ukemi-predict.test.ts`, A `.../u5a/PROVENANCE-u5a.md`, A `.../u5a/U5a-book-slice.json`, A `apps/sentinel/test/ukemi-producer-oracle.test.ts`, M `packages/monark/src/adapter-book.ts`, M `packages/monark/src/index.ts`, M `packages/monark/test/adapter-book.test.ts`, M `scripts/export-exclude-tests.json`, M `test/harness-export.test.ts`.
- **Aucun fichier gelé par l'escalade dans le diff** (grep sur le diff = « no frozen file ») : `registry.ts`, `registry.test.ts`, `http.test.ts`, `openapi.test.ts`, `test/h5-e2e-*`/`h5-e2e-trace.json`, `scripts/verify-harness.mjs` — tous absents.
- **9 gelés + gel U-4b intacts** : `scripts/census/u4b/u4b-scores.mjs` sha = `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` (= G1) ; `schemas/*` et `packages/contracts/src/types.ts` **hors diff** ; fixtures u4b intactes.
- **4 outils servis inchangés** : `registry.ts:32` `ALLOWED_TOOL_NAMES = ["attest","gate","cascade","calibrate"]` ; `ukemi-predict` **absent** de registry.ts ; le test gelé `mcp_tools_have_no_side_effects` (1b) `deepEqual([...REGISTERED].sort(), ["attest","calibrate","cascade","gate"])` **vert** ⇒ set exact 4, Option B tenue. `http.ts` (hors liste gelée) : **une** ligne, ajout `"UkemiPredictToolError"` à `TOOL_ERROR_NAMES` (inerte tant que non routé ; ceinture pour -5b).

## 2. Oracle A + Oracle B — REJOUÉS PAR MOI (mission pt 2) — CONFORME
Instrument G2 indépendant (`_g2_replay.mjs`, importe `@monark/monark` + `computeScoresU4b` gelé + `strateOf` harness), env -u :
- **Oracle A** : `fromRealizedBook` == 565 lignes `score_a` committées, **bigint exact** sur {yhat, m_bps, pstar}, et `strateOf(Number(yhat)) == row.strate` — **matched 565/565, mismatch 0**. `strateOf` = la fonction servie `apps/harness/src/ukemi-strata.ts` (importée ; **aucune 3ᵉ copie** : `grep strateOf|STRATA_CUTS packages/monark/src/` = 1 hit, le commentaire « no third copy », 0 définition/import).
- **Oracle B** : `computeScoresU4b` GELÉ LIVE sur **16 096** comptes ; `cellA.rows === 565 === score_a` ; two-sided : **565/565 cellules-A appariées par le producteur, 0 mismatch, 0 refus manquant, 0 faux positif** (aucun yhat>0 hors cellA).
- **Classification reproduite exactement (= G1)** : 9 452 évaluables (562 yhat>0 + 8 890 yhat=0) + 6 611 `non_mono_weth` + 33 `emode_out_of_range` = 16 096. Cross-check refus-producteur vs census gelé : `no_aweth` 0==0, `non_evaluable_x` 6 611==6 611, `non_evaluable_emode` 33==33. Garde `unknown_balance_token` : **0 déclenchement** sur le book complet.
- **LEFT / USDT (contrôle décisif de complétude)** : le producteur ne re-déclare PAS `LEFT` (MIN_LEFTOVER_BASE) ni `USDT`/`usdt_prices` du module gelé. Vérifié sur `u4b-scores.mjs:88-225` : `LEFT` n'intervient QU'au census `dust_bounded` (l.220) — **hors yhat** ; `USDT`/`usdt_prices` QU'au calcul `Yby` (Y_i réalisés, l.103-121) = le LABEL `liquidated`, **pas yhat** ; le bloc LST (l.203-211) est contrefactuel (`yhatLst`), **ne touche pas `yhat`**. Le producteur re-déclare exactement le chemin yhat (max sur dettes de min(CF, CA)) ; `hfAt` identique au gelé. **Omission correcte, aucune divergence latente.**

## 3. K-8 (mission pt 3) — CONFORME
- Producteur `fromRealizedBook` (adapter-book.ts:396-513) : `grep createHash|sha256HexUtf8|node:crypto|node:fs|fetch(|process.env` = **0** dans la région. (L'import `node:crypto` l.14 sert seulement `fromAttestedBook` pré-existant ; digest = ÉCHO, jamais recalculé.)
- `ukemi-predict.ts` sous `src/tools/` : le scan FROZEN `mcp_tools_have_no_side_effects` (registry.test.ts:32-36, `collectTs(TOOLS_DIR)` récursif) l'inclut (listé sous TOOLS_DIR) et **passe** (suite complète verte) ; l'auto-test `u5_tool_is_k8_pure` réassère les mêmes regex (les mentions en commentaires sont en backticks, pas de faux positif). Mutant `k8-node-fs-import` (import node:fs) → rouge.

## 4. A-10 — sortie == fromRealizedBook sur les mêmes octets (mission pt 4) — CONFORME
`u5_tool_output_equals_fromRealizedBook_same_bytes` : la sortie SERVIE (`runUkemiPredict`) égale `fromRealizedBook` sur les mêmes octets ({yhat, m_bps, pstar}). Mutant `a10-yhat-altered` (`Number(result.yhat) + 1`) → rouge sur le chemin du tool. TUÉ.

## 5. A-8 — le schéma accepte la forme RÉELLE (mission pt 5) — CONFORME
`u5_input_schema_accepts_the_real_form` : la forme byte-réelle valide contre `UKEMI_PREDICT_INPUT_SCHEMA` (`additionalProperties:false` + clés optionnelles `user_config`/`eligible_static`/`chain_id`/`cluster`/`kind`/`round_id`/`updated_at`/`usdt_prices`). Mutant `a8-optional-key-dropped` (retrait de `user_config`) → rouge. **Non-vacuité mesurée dans la fixture** : 6/6 comptes portent `user_config`+`eligible_static`, 140/140 updates portent `round_id`+`updated_at`, l'oracle porte `usdt_prices` (2 entrées) — les 3 formes réelles présentes. (Voir H-G2-1 : le test n'ASSÈRE la présence que de user_config/eligible_static.)

## 6. Contrat gelé `Prediction` (mission pt 6) — CONFORME
- `features_digest` = ÉCHO du `book_digest` validé (HEX64 avant l'écho) : `u5_tool_output_is_closed_and_block_and_digest_echoed` (features_digest === book_digest === provenance.book_digest) ; mutant `features-digest-not-echoed` → rouge.
- `predictor_id` = `${UKEMI_LIQ_PREDICTOR_BASE}/s${strate}` (provenance seule ; le gate re-dérive côté serveur, C-10).
- `close_factor_version` fail-closed `"3.5.0"` : mutant `close-factor-version-unchecked` → rouge (`u5_tool_refuses_named_400`). Servie dans provenance ("3.5.0").
- `yhat:0` SERVIE (Q-U5-7) : `u5_producer_yhat0_no_crossing_is_a_prediction` + les évaluables yhat=0 du book.
- `Prediction` fermé aux 6 clés gelées exactes ([features_digest, predictor_id, produced_at, schema_version, task_class, yhat]) via `assertClosedPrediction` ; `task_class = TASK_LIQ_ELIGIBLE` importé de `gate.ts` (pré-existant, **aucun enum neuf**) ; `schemas/*` et `contracts/types.ts` non touchés.

## 7. Mutants 15 worker + ≥4 miens (mission pt 7) — CONFORME
Harnais worker `mutants.mjs` re-ciblé sur le clone (copié dans mon scratchpad, jamais édité la copie worker) : il ASSÈRE la présence de la chaîne `find` (NO-MATCH flaggé, non compté tué), tué ssi (nTests≥1 ET nFail≥1), env -u, restauration par bytes originaux + check sha. **15/15 TUÉS, tous restaurés byte-exact.**
Mes 5 mutants (points hors des 15) :
- `g2-rpm-no-halfup` (retrait du half-up `+5000n` de percentMul) → **TUÉ** (Oracle A).
- `g2-weth-not-repriced` (`isWeth ? pStar : r.price` → `r.price` ; direction OPPOSÉE au worker `d-nonweth-at-pstar`) → **TUÉ** (Oracle A) — le conditionnel de repricing est ainsi épinglé des deux côtés.
- `g2-crossing-le` (`hf < R_WAD` → `hf <= R_WAD`) → **SURVIT = mutant équivalent** : `<` et `<=` ne diffèrent qu'à `hf === 1e18` EXACT ; un tel point changerait `pstar` et rougirait Oracle A ⇒ preuve qu'aucun compte e2 n'atteint exactement 1e18 sur le chemin.
- `g2-sort-no-tiebreak` (retrait du tiebreak `log_index`) → **SURVIT = mutant équivalent, GROUNDED** : le chemin oracle est DÉJÀ trié par (block, log_index) (vérifié : presorted=true) et le tri V8 est stable, donc un comparateur block-seul préserve l'ordre correct MALGRÉ 3 blocs en collision (23549856×2, 23549957×2, 23549988×3, log_index/prix distincts). Le tiebreak du producteur reste correct/défensif.
- `g2-tool-strate-off1` (`strateOf(yhat)` → `strateOf(yhat + 1)`) → **SURVIT = équivalent** : aucun yhat de cas évaluable de la fixture réduite n'est à ±1 (base 8-déc) d'une coupe de strate ; les erreurs grossières de strate outil sont tuées par `strate-forced-0`. (Voir C-G2-1.)
Sha AVANT == APRÈS pour les 3 sources ; `git status` propre après les 2 campagnes.

## 8. Oracle env -u, fusion à blanc, R-25 (mission pt 8) — CONFORME
- **env -u 881/880/0/1** : `npm test` exit 0, 881 tests, 880 pass, 0 fail, 1 skip. Le skip est EXACTEMENT `u4b_labels_replay_via_main_real_artifact` (`﹣ … # real e2 artifacts absent (A-rawlogs.jsonl gitignored / u3-raws-clean out of repo)`) — environnemental, préexistant à `1f4b746`, non levable. `sentinel_budget_below_unit_timeout` TOURNE (vert ; deploy/ présent). **Aucun test u5_ skippé** (14 u5_ verts, dont Oracle A 83ms, Oracle B 2588ms). typecheck 0, lint 0, ratchet 69/69, gate:vocab 0, lang:gate 0, export:check 0.
- **Fusion à blanc** `git merge --no-commit --no-ff origin/lot/etude-suite` : « Automatic merge went well », **0 conflit** (la cible n'a ajouté que des `docs/` depuis le point de branche ; 0 chevauchement avec les 12 fichiers) ; `tsc --noEmit` sur l'arbre fusionné = **0** ; `git merge --abort` ; HEAD `fc2e732` ; propre.
- **R-25** : merge-base(origin/lot/etude-suite, HEAD) = `1f4b746` ; pathspec **verbatim ci.yml:65** (trois-points), la fixture `apps/sentinel/test/fixtures/**/*.json` EXCLUE ⇒ **CHANGED = 1099** (11 fichiers, 1096 ins + 3 del) **< 1150** (< 1205 plafond ADR). Identique mesuré vs `1f4b746`.

## 9. ADR-U5a (mission pt 9) — CONFORME (avec corrections documentaires, §C)
- **Tuyaux** (ADR-M018 D3, table entrée→sortie→état→test non-LLM) : 3 tuyaux (book→yhat ; yhat→enveloppe K-1 ; Prediction→gate→région). Branchement producteur→gate prouvé par composition DIRECTE `u5_producer_predicts_then_gate_abstains_under_calib` (registre liq vide à HEAD ⇒ under_calib, n_calib 0) ; endpoint servi + re-pin h5 + non-vacuité déférés à U-5b (item formé, déclencheur -2b).
- **MAST** FM-3.3 (set d'outils : U-5a n'édite pas ALLOWED_TOOL_NAMES → le hazard fenêtre-5-outils ne survient pas, Option B) et FM-1.5 (verify-harness LIVE au redéploiement → item -5b) présents.
- **Items formés à déclencheur (P5, zéro dette)** : 123(ii) rejeu Oracle A sur JSONL frais (décl. -2b) ; U-5b enregistrement+route+retrait cascade 4→4+re-pin h5+verify-harness+surfaces publiques (décl. -2b) ; résidu isSafeInteger (garde présente, pas de mutant tueur sur e2 : max yhat 140 751 764 283 444 < 2^53 ; DÉCLARÉ).
- **CA-11 (module non enregistré = upcoming partout)** : `ukemi-predict` (nom d'outil) = **0 hit** dans README.md, apps/harness/README.md, openapi.ts, version.ts, apps/site/lib/fleet.ts, skills/. Les surfaces publiques disent toujours « four tools … cascade ». Les seules mentions hors des 12 fichiers sont des DOCS de planification (G0 DRAFT / CHANTIERS / checkpoints / ADR, décrivant U-5b) et le faux positif `UKEMI_PREDICTOR_ID` (constante sans rapport). Aucun registre public ne dit « built » pour le tool.

## Vérifications transverses
- **DELIVERED.sha256** : `sha256sum -c` = **12/12 OK** contre l'arbre du clone. Fixture LF-sha (blob git) `975df201…` = PROVENANCE + DELIVERED ; PROVENANCE LF-sha `4d375848…` = DELIVERED.
- **PROVENANCE-u5a** : la fixture est DATA R-25-exclue, déclarée+hashée same-dir ; consumer public survivant (ukemi-predict.test.ts) ⇒ non orpheline (décision 111). Claim `book_digest 695d862f…` FONDÉ : porté par le book u4b (`U4b-book-23545087.json:1` book_digest `695d862f…`) et PROVENANCE-u4b:29 ; l'écho est prouvé par test.
- **Corrections checkpoint-1 côté code** : C-1 (frontière strateOf : {yhat,m_bps,pstar} + strate tool-side, 1 seule impl) ✓ ; C-2/C-3 (gate borne haute, atteinte branche liq under_calib + A-10) ✓ ; C-4 (2 oracles nommés, export-exclus, provenance fixture) ✓ ; C-6 (R-25 re-mesuré 1099) ✓ ; C-8 (label anglais ASCII 5 éléments — mutant `c6-clause-removed` rouge ; ukemi-predict.ts ajouté à harness-export.test.ts:36) ✓. C-5/C-7 (items ADR + MAST) présents dans l'ADR proposé — pli documentaire à confirmer par checkpoint-2.

## §C. Corrections (liste fermée) — documentaires/hardening, aucune ne bloque la fusion
**Corrections (avant/au pli — zéro coût : ADR-U5a encore PROPOSÉ, non inséré) :**
- **C-G2-1 (ADR item résidus)** : étendre l'item 3 (« pas de mutant tueur sur e2 ») aux DEUX résidus mesurés par G2, même discipline P5 qu'isSafeInteger : (i) frontière de franchissement `<`/`<=` (aucun hf e2 == 1e18 exact) ; (ii) frontière de strate outil `strateOf(ŷ±1)` (aucun cas évaluable de la fixture réduite à ±1 d'une coupe). Non des défauts (mutants équivalents ; strateOf prouvé sur 565 lignes par Oracle A + ses tests dédiés) — à DÉCLARER pour zéro-dette.
- **C-G2-2 (mineure, rendu worker)** : le rendu scratch `F:\tmp\u5a\G1-lot-u5a.md` (A-5) porte « 1098 < 1150 » alors que sa propre section R-25 et le doc PERSISTÉ `docs/G1-lot-u5a.md` (@ c72180e) portent « 1099 » (valeur mesurée). Le dépôt est COHÉRENT (1099) ; corriger le rendu scratch pour l'auditabilité (aucun chiffre de seconde main).

**Hardening (item -5b formé, déclencheur = enregistrement/route -5b) :**
- **H-G2-1 (A-8 non-vacuité)** : `u5_input_schema_accepts_the_real_form` n'ASSÈRE la présence que de `user_config`/`eligible_static` ; `round_id`/`updated_at`/`usdt_prices` sont présents dans la fixture (140/140, 2 entrées) mais NON gardés — une fixture régénérée qui les retirerait rendrait ces clés de schéma silencieusement non testées. Ajouter les assertions de présence en -5b (avec la route servie).

## Provenance
Entrées (lecture seule) : clone `F:\tmp\g2-u5a` @ `fc2e732` ; `docs/{G0-lot-u5.DRAFT,G0-lot-u5.MESURES,CHECKPOINT1-lot-u5a,CHANTIERS,CONSIGNE-STANDARD-G1}.md` ; `F:\tmp\u5a\{MISSION-G1-u5a,G1-lot-u5a,ADR-U5a,DELIVERED.sha256,mutants.mjs}` ; sources/tests des 12 livrables + `scripts/census/u4b/u4b-scores.mjs` (gelé) + `apps/harness/src/tools/{registry,gate}.ts`, `ukemi-strata.ts`, `.github/workflows/ci.yml`. Instruments G2 (scratchpad) : `_g2_replay.mjs` (oracles), `mutants-g2.mjs` (15 re-ciblés), `mutants-g2-own.mjs` (5 miens). Réviseur amont : orchestrateur `claude-fable-5-1` (R-21). Modèle épinglé `claude-opus-4-8[1m]`, effort max. Aucun commit, aucun workflow (R-20).

---

**Fichiers pertinents (chemins absolus)** :
- Rendu G2 durable : `F:\tmp\g2-u5a\G2.md`
- Clone vérifié : `F:\tmp\g2-u5a\` (HEAD `fc2e732`, branche `lot/u5a`)
- Instruments G2 (scratchpad, reproductibles) : `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\{mutants-g2.mjs, mutants-g2-own.mjs, test-full.log, sha-before.txt}` (l'instrument d'oracle `_g2_replay.mjs` a été exécuté depuis la racine du clone puis supprimé pour garder l'arbre propre ; réplicable via le bloc de la mission)
