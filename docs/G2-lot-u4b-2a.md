Modèle résolu : claude-opus-4-8[1m]

# G2 — lot U-4b-2a : classe servie `liquidation-eligible-coverage` sur registre VIDE (relecteur, contexte frais)

> Relecteur G2 `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22.
> Instance NEUVE, contexte frais. Clone à historique complet `git clone --no-hardlinks --branch lot/u4b-2a
> F:\Monark F:\tmp\g2-u4b2a\tree` @ **`1892144`** (fourche `f0720ae`, ancêtre vérifié). node_modules isolés par
> `mk-nm.ps1` (220 entrées, 10 @monark, 0 fail ; `require.resolve('@monark/rpc-guard')` résout DANS le clone).
> Vérifications 1-10 **REFAITES** — jamais lues dans le rendu G1. Aucun commit dans un dépôt de travail (R-20) ;
> aucune écriture hors `F:\tmp\g2-u4b2a\` ; aucune variable d'environnement affichée (A-7) ; tout oracle + mutants
> + recorder h5 sous `env -u` des 8 clés payantes. R-21 : chaque affirmation porte sa preuve (fichier:ligne,
> oracle, sha, code de sortie ; journaux durables sous `F:\tmp\g2-u4b2a\logs\`).

## VERDICT G2 : **PASS-AVEC-CORRECTIONS**

Toutes les pièces de CODE sont correctes, complètes, branchées et prouvées (oracle vert sur le clone ET sur la
fusion à blanc ; 17 mutants tués — 12 de G1 rejoués + 5 miens ; branchement non-LLM sur deux surfaces). **Une
seule correction, docs-seulement, propriétaire = orchestrateur (R-20)** : le livrable 2a-8 (amendement daté
ADR-U4b, G0 §2 + critère d'acceptation §9-8 « amendement ADR-U4b présent ») est **ABSENT à `1892144`**. Il est
RÉDIGÉ dans le rendu G1 §H mais non inséré (R-20 : le worker n'insère pas). L'orchestrateur doit l'insérer au pli
documentaire avant le G7 (précédent SCORE-1 `6652ed0`). N'affecte ni le code ni l'oracle ni R-25 (docs exclus).

---

## Vérification 1 — Périmètre (diff three-dot `f0720ae...1892144`) — REFAIT

`f0720ae` est ANCÊTRE de `1892144` (`git merge-base f0720ae lot/u4b-2a` = `f0720ae`) ⇒ three-dot == two-dot
(vérifié : listes name-only identiques). **14 fichiers, exactement les attendus** :

| état | fichier |
|---|---|
| M | apps/harness/src/attestation-binding.ts |
| M | apps/harness/src/calibration.ts |
| M | apps/harness/src/tools/cascade.ts |
| M | apps/harness/src/tools/gate.ts |
| A | apps/harness/src/ukemi-strata.ts |
| M | apps/harness/test/cascade.test.ts |
| A | apps/harness/test/gate-liq-artifact.test.ts |
| A | apps/harness/test/gate-liq.test.ts |
| A | apps/harness/test/ukemi-strata.test.ts |
| A | apps/sentinel/test/ukemi-served-strateof.test.ts |
| M | fixtures/PROVENANCE-h5-e2e-trace.md |
| M | fixtures/h5-e2e-trace.json |
| M | scripts/export-exclude-tests.json |
| M | test/h5-e2e-probe.test.ts |

- **Aucun contrat gelé touché** : `git diff f0720ae...1892144 -- packages/contracts schemas/ packages/hikae/src/region.ts **/verdict.ts` = **VIDE**.
- **`apps/site`, `skills/`, README** : `git diff ... -- apps/site skills/ **/README.md README.md` = **VIDE**.
- **`HARNESS_VERSION` inchangé (Q-NEW-5)** : `version.ts:22` = `"0.4.0"` ; `apps/harness/src/version.ts` et `registry.ts` NE SONT PAS dans les 14 fichiers.
- **4 outils inchangés** : `registry.ts:32 ALLOWED_TOOL_NAMES = ["attest","gate","cascade","calibrate"]` ; `registry.ts` hors diff.

**PASS.**

## Vérification 2 — Oracle complet sous `env -u`, clone PUIS fusion à blanc — REFAIT

Enveloppe : `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY npm run <x>`.

**(a) Sur le clone `lot/u4b-2a` @ `1892144`** (journaux `logs/c-*.log`) :

| oracle | exit | compteurs |
|---|---|---|
| gate:vocab | 0 | 0 hit (208 fichiers scannés) |
| typecheck (`tsc --noEmit`) | 0 | 0 erreur |
| test (`node --test`) | 0 | **tests 794 / pass 793 / fail 0 / skipped 1 / todo 0** |
| lint (`eslint .`) | 0 | 0 |
| lint:ratchet | 0 | **69/69** |
| lang:gate | 0 | 0 |
| export:check | 0 | 0 chemin interdit |

Conforme à l'attendu mission (794/793/0/1, lint 0, ratchet 69/69, lang:gate 0, export:check 0). Le SKIP unique
= `fetch_only_inside_client` (DUR, pré-existant, sans lien -2a).

**(b) Sur une FUSION À BLANC `d4d15a0` dans le clone** (l'arbre que le G7 mesurera ; journaux `logs/m-*.log`) :
- Préalable : `git diff --name-only f0720ae d4d15a0` ∩ 14 fichiers -2a = **VIDE** ⇒ fusion propre attendue.
- `git checkout -b g2-merge-blanc && git merge --no-edit d4d15a0` = **PROPRE** (aucun conflit ; commit de fusion `34e4eb8` ; `--diff-filter=U` vide). Jamais de résolution à la main. Aucun `git push`.
- Oracle : gate:vocab 0, typecheck 0, lint 0, ratchet **69/69**, lang:gate 0, export:check 0 ; **test : tests 796 / pass 795 / fail 0 / skipped 1** — **0 fail, skipped == 1** (attendu mission). Le compte 794→796 vient des 2 tests ajoutés par SCORE-1 (`ukemi-u4b-scores.test.ts`), pas de -2a.
- Le test sentinel -2a (`ukemi-served-strateof.test.ts`) passe sur la fixture **POST-SCORE-1** ⇒ preuve empirique de l'invariance delta D-6.
- Retour propre : `git checkout lot/u4b-2a` ; `git status --porcelain` VIDE.

**PASS.**

## Vérification 3 — Registre VIDE, texte servi, classe B — REFAIT

- **Registre VIDE de liq** : `git diff f0720ae...1892144 -- calibration.ts` n'AJOUTE (après `:207`) que `UKEMI_LIQ_PREDICTOR_BASE` + `hasCommittedCalibrationForClass` ; `COMMITTED_CALIBRATIONS` INCHANGÉ (aucune entrée `liquidation-eligible-coverage`). ⇒ tout ŷ ⇒ `under_calib` (`gate.ts:587-593` `committed === undefined ⇒ underCalibVerdict`, scores `[]`, n_calib 0). Prouvé par `u4b_gate_liq_class_abstains_on_empty_registry` (5 ŷ des 4 strates ⇒ abstain/under_calib/n_calib 0/qhat null/region.kind "set").
- **AUCUNE revendication servie nouvelle** : registre vide ⇒ `under_calib` partout ; `fleet.ts` non touché (Ukemi reste `built`).
- **Texte servi de la classe = « upper bound », « interval » ABSENT** (grep scopé) : `LIQ_UPPER_BOUND_SENTENCE` (`gate.ts:140-142`) = « a conformal **upper bound** on the liquidable amount... abstains (under_calib) outside it » ; `LIQ_COMMITTED_SENTENCE` (`:163`) ne contient PAS « interval ». Test `u4b_liq_class_text_says_upper_bound_never_interval` (`gate-liq.test.ts:178-182`) scanne `LIQ_COMMITTED_SENTENCE` (concat upper-bound+H3+conditionnel). Les hits « interval » de `gate.ts` sont en commentaires (`:136-137`), clause **BYO** (`:192-193`) et contrat de fil (`:666 v.region.kind === "interval"`) — jamais dans le texte de la CLASSE.
- **`region.kind` reste `"interval"` sur le fil** (contrat gelé) : `ukemi-strata.ts:58 buildIntervalRegion(0, yhat+qhat)` ⇒ kind "interval" inchangé ; prouvé `ukemi-strata.test.ts:33`.
- **Ukemi reste `built`** : `fleet.ts` hors diff.
- **4 outils** : `ALLOWED_TOOL_NAMES` inchangé.
- **Nom de la classe B absent de gate.ts (et de tout `apps/harness/src`)** : `grep -rE "liquidation-realized-given-liquidated|realized-given" apps/harness/src` = **0**. `known:` du message classe-inconnue (`gate.ts:756`) = `TASK_BTC_DIR, TASK_CASCADE, TASK_STABLE_RUN, TASK_LIQ_ELIGIBLE` — pas de classe B. Prouvé `u4b_class_b_is_unknown_task_class_400` + `u4b_no_class_b_symbol_in_harness_src`.

**PASS.** *Observation mineure (couverture de mutation, non bloquante)* : `LIQ_EMPTY_REGISTRY_SENTENCE` (`:167`, texte servi per-call en -2a) n'est scanné pour « interval » par aucun test ; une injection « interval » y survivrait. Sans portée réelle (c'est un avis d'abstention, il ne décrit aucune région ; l'exigence mission porte sur le texte de la classe, qui EST scanné). Renforcement possible en -2b.

## Vérification 4 — `ukemi-strata.ts` miroir du `strateOf` gelé + helper + refus — REFAIT

- **Miroir exact** : `STRATA_CUTS_SERVED = [200000000000, 10000000000000, 100000000000000]` (`ukemi-strata.ts:25`) == `STRATA_CUTS` GELÉ `[2n*10n**11n, 1n*10n**13n, 1n*10n**14n]` (`u4b-scores.mjs`, **invariant** entre `f0720ae` et `d4d15a0` — vérifié bit-à-bit ; SCORE-1 ne change que `score` `|Y−ŷ|→max(Y−ŷ,0)`, PAS yhat/strate). `strateOf` servi (`:31-38`, demi-ouvert `[cut,next)`) == logique gelée `for (const c of STRATA_CUTS) { if (y < c) return k; k++; }`.
- **Frontières servies + chaque `score_a`** : `ukemi-served-strateof.test.ts` (sentinel, exclu export) — coupes par index, 9 frontières sur les DEUX fonctions, et **chaque ligne `score_a`** (`rows.length >= 500`, mesuré 565) `strateOfServed(Number(yhat)) == row.strate` ET `strateOfFrozen(yhat) == row.strate`. Lit SEULEMENT yhat/strate (**aucun sha en dur** — vérifié). Passe sur la fixture POST-SCORE-1 de `d4d15a0` (fusion à blanc, 795 pass).
- **`liqUpperBoundRegion(yhat, qhat)`** (`:54-59`) = `qhat===0 ⇒ {abstain, under_calib}` sinon `buildIntervalRegion(0, yhat+qhat)`. Prouvé `u4b_liq_upper_bound_region_helper` (lo 0, hi 1200 pour (1000,200) ; q̂=0 ⇒ abstain under_calib ; (0,0) ⇒ abstain ; (0,5) ⇒ [0,5]).
- **q̂ = 0 ⇒ `under_calib`** au serveur : `gate.ts:606-614` (`region.abstain ⇒ underCalibVerdict` sur les scores committés, n_calib=n) — délégué au helper ; règle D-12. `l3-gate.ts` abstient de façon cohérente.
- **Classe inconnue ⇒ `HarnessToolError` puis 400** : `gate.ts:752-756` (branche liq `:746` AVANT le `else`) ; `HarnessToolError ∈ TOOL_ERROR_NAMES` (`http.ts:36 {HarnessToolError,CascadeToolError,AttestToolError,CalibrateToolError}`) ⇒ 400 via `handleJsonMirror`. Prouvé `u4b_class_b_is_unknown_task_class_400` (status 400, body.error "tool_error").
- **400 nommés** : les 3 refus de `liqEligibleVerdict` (ŷ non-entier/<0 `:568`, alpha `:574`, nMin `:579`) + le class-lock BYO (`:696-708`, `taskClass === TASK_LIQ_ELIGIBLE ||` explicite `:700` ⇒ bloqué même sur registre vide) lèvent tous `HarnessToolError`. ŷ vient du champ Prediction **gelé existant** `prediction.yhat` (`:565,748`), pas d'un nouveau champ.

**PASS.**

## Vérification 5 — Mutants : 12 de G1 REJOUÉS + 5 miens — REFAIT

Harnais G1 copié (`logs/g1-replay.mjs`, `WT` re-pointé sur le clone), exécuté sous `env -u`. Protocole par mutant :
baseline VERTE, ancre UNIQUE (les 12 ancres = [1] sur le clone), mutation transitoire ⇒ test nommé ROUGE
(fail≥1, exit≠0), **restauration byte-exacte** (sha256 == original).

- **G1 12/12 tués** (`logs/g1-replay.log`, exit 0) : (a) alpha/nMin 400 · (c) class-lock BYO · (d) coupe off-by-one · (g) classe B ⇒ 400 · (h) sur-revendication proba · (i) garde ŷ · (j) ligne attestation · (k) unité de strate · (m) étiquette v0 · (n) forme symétrique · (o) « interval » dans texte classe · (p) garde q̂=0.
- **Mes 5/5 tués** (`g2-mine.mjs`, `logs/g2-mine.log`, exit 0 ; ancres/réplacements DISTINCTS de G1) :
  - **(o')** « interval » injecté dans `LIQ_H3_SENTENCE` (constante ≠ `LIQ_UPPER_BOUND_SENTENCE` de G1) ⇒ ROUGE ⇒ le test scanne toute `LIQ_COMMITTED_SENTENCE`, pas une seule constante.
  - **(h')** clause « no coverage is claimed on any other event » retirée (G1 ajoutait un mot de proba) ⇒ ROUGE.
  - **(n')** hi=ŷ (q̂ retiré de la borne haute) au lieu de ŷ+q̂ ⇒ ROUGE (sonde l'assertion `hi===ŷ+q̂` ; G1 sondait `lo===0`).
  - **(p')** q̂=0 renvoie `[0,ŷ]` covered via le CORPS du return (G1 mutait la CONDITION) ⇒ ROUGE.
  - **(s')** frontière `cut[0]` décalée d'**1 unité** (`200000000000→200000000001`) ⇒ ROUGE (`deepEqual` + frontière à 2000e8).
- **Clone propre après** : `git status --porcelain` VIDE (restauration byte-exacte, aucun résidu).

**PASS.**

## Vérification 6 — Re-pins h5/openapi/cascade mesurés hors réseau — REFAIT

- **Trace h5 REPRODUCTIBLE hors réseau** : `env -u ... node scripts/record-h5-e2e-trace.mjs` (recorder in-process `127.0.0.1`, aucun `fetch`) ⇒ fichier **byte-identique** au committé (`diff -q` IDENTICAL) ; sha256(raw==LF) = `4ad9b340caa72463d3ff1e96880fa0b49e29e841c8e31e183f26b0fc85aa79e1`, 21943 octets. Fichier committé restauré (`git checkout --`), clone propre.
- **Three-way pin cohérent** : trace committé sha256 == `TRACE_SHA256_PINNED` (`h5-e2e-probe.test.ts:67`) == pin `PROVENANCE-h5-e2e-trace.md:69` (21943 octets, « re-pinned 2026-09-22 for U-4b-2a ») == `DELIVERED.sha256`. Test `probe_harness_records_real_decision` vert (dans l'oracle).
- **PROVENANCE cohérent** : note 2026-09-22 (clause liq + label v0 ⇒ seuls les octets de l'étape `tools/list` changent ; registre liq reste vide).
- **Étiquette « v0, replaced at U-5 » SEULEMENT dans `tools/list`** : présente dans `cascade.ts:92` (`CASCADE_TOOL_DESCRIPTION`) + `:214` (`cascadeHonestyText`) + `h5-e2e-trace.json:110,471` (étape tools/list capturée) + `cascade.test.ts` + `PROVENANCE`. **Aucune fuite** sur `apps/site`, `skills/`, `**/README.md`, openapi (`grep -rn "replaced at U-5"` sur ces surfaces = VIDE).
- **Absence de re-pin openapi EXPLIQUÉE** (attendu G0 §2 2a-5, absent du diff, oracle vert) : `openapi.ts:73 description: tool.description` (dynamique) ; `openapi.test.ts` n'asserte que `paths`/`required`/schémas, JAMAIS le texte de description verbatim ⇒ le changement de `CASCADE_TOOL_DESCRIPTION` ne casse aucun pin openapi. Correct, pas un défaut.

**PASS.**

## Vérification 7 — CA-11 branchement (chemin servi + test non-LLM) — REFAIT

- **Chemin servi = deux surfaces, un registre** : `HARNESS_TOOLS` (`registry.ts`) exposé par MCP `gate` ET miroir `POST /gate` (`http.ts handleJsonMirror`) ; les deux passent par `runGate`.
- **Test d'intégration NON-LLM `gate-liq-artifact.test.ts`** (`u4b_gate_serves_region_from_real_artifact`) : source = fixture COMMITTÉE nommée `apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl` (`:26`) ; **mapping DÉTERMINISTE sur TOUTES les lignes `score_a`** (ŷ = `Number(row.yhat)` `:59` ; `predictor_id` = `meta.cell_a.predictor_id` `:48` ; jamais deux valeurs à la main) ; **non-vacuité** (`rows.length >= 500` `:53`, `Set(yhat).size >= 50` `:54`) ; pilote `GATE_TOOL.run` du descripteur `gate` de `HARNESS_TOOLS` (`:62`) **ET** `handleJsonMirror` POST /gate (`:72`, status 200). **N'asserte QUE `under_calib`** (option b, delta D-3 : la strate serveur n'est pas observable sur registre vide) `:64-65,81-82`. Aucun sha en dur.
- Ce test importe la fixture exclue de l'export ⇒ ajouté à `export-exclude-tests.json` (avec `ukemi-served-strateof.test.ts`).
- Le maillon est COMPOSÉ (registry.run + miroir), pas des littéraux de test ; Ukemi `built` inchangé (le seul consommateur n'est PAS qu'un test unitaire — c'est le chemin servi réel via HARNESS_TOOLS).

**PASS** (CA-11 satisfait pour -2a ; faits consignés ci-dessous pour le checkpoint-2).

## Vérification 8 — R-25 (pathspec VERBATIM `ci.yml:65`) — RECOMPTE

- Recompte avec le pathspec EXACT de `ci.yml:65` (14 `:(exclude)` verbatim), `f0720ae...1892144` substitué à `origin/base...HEAD` : **`13 files changed, 705 insertions(+), 15 deletions(-)` = 720** (== rapport G1). Sous la borne. **Borne réelle configurée = `1205`** (`ci.yml:43 VIBEGATES_PR_LIMIT`) ; la mission cite « 1150 » (figure plus stricte) — 720 est très en-dessous des DEUX ⇒ aucun STOP, aucune re-scission.
- **Jugement de l'écart vs estimation G0 (480-500)** : l'excès (~220 l.) est concentré dans les TESTS — gate-liq.test.ts 241, gate-liq-artifact.test.ts 87, ukemi-strata.test.ts 50, ukemi-served-strateof.test.ts 47 (= 425 l. de test), chacun portant ses assertions anti-vacuité ET son (ses) tueur(s) de mutant nommé (vérifié par lecture + 17 mutants tués). Source : gate.ts 157, ukemi-strata.ts 59, calibration.ts 21, attestation-binding.ts 13, cascade.ts 7. Le G0 §7 avait NOMMÉ les moteurs de l'écart (borne haute/helper 126 + q̂=0 D-2 + classe-B exécutée D-4 + PROVENANCE-h5). **Pas de gras** : chaque bloc de test est justifié par un mutant ; le total reste à 60 % de la borne.

**PASS.**

## Vérification 9 — Demande R-26 du worker (placeholder `UKEMI_LIQ_PREDICTOR_BASE`) — AVIS

Question G1 (item I-1) : conserver le placeholder `"ukemi:liquidation-eligible-coverage-uncommitted-until-u4b-2b"` jusqu'au littéral FRAIS -2b, ou l'épingler dès maintenant au littéral e2 DESIGN.

**Avis motivé (conseil, jamais verdict — l'orchestrateur tranche)** : **conserver le placeholder (option a).**
- Fait décisif de robustesse : le placeholder est **behaviorally inerte** en -2a — `calibration.ts:220` n'est utilisé qu'à `gate.ts:585` pour bâtir la clé de lookup ; registre vide ⇒ `lookupCommittedCalibration` renvoie `undefined` quelle que soit sa valeur ⇒ `under_calib`. Il **n'atteint jamais** le texte servi (`honestyText` keyé sur `hasCommittedCalibrationForClass`, classe seule) ni un champ du verdict (`CoverageVerdict` n'a pas de `predictor_id`). Vérifié par grep : aucune autre occurrence servie.
- (a) **échoue bruyamment** si oublié en -2b : `2b-4` asserte `hi === ŷ + q̂_k` sur artefact réel ⇒ un placeholder non re-épinglé donne `under_calib` universel ⇒ ROUGE. (b) épinglerait un littéral **« jamais servi » (DESIGN e2)** dans du code servi, contre ADR-U4b D1.
- Le nom du placeholder est auto-documenté (`...-uncommitted-until-u4b-2b`).
- **Déclencheur** : G0/G1 -2b re-épingle au `meta.cell_a.predictor_id` FRAIS. Propriétaire : orchestrateur. (Item formé, non dette.)

## Vérification 10 — A-7 sur le code neuf — REFAIT

`grep -nE "process\.env|child_process|fetch\(|node:http|node:net|undici|API_KEY|SECRET|Bearer|\.connect\("` sur les 5 fichiers source (ukemi-strata.ts, gate.ts, calibration.ts, attestation-binding.ts, cascade.ts) : les SEULS hits sont des **commentaires affirmant l'absence** (`gate.ts:7`, `cascade.ts:13` : « calls no fetch, writes no process.env »). Aucune sonde d'env réelle, aucune clé, aucun réseau. `ukemi-strata.ts` importe SEULEMENT `@monark/hikae` (pur K-8). Recorder h5 : serveur in-process `127.0.0.1`, aucun `fetch`. **PASS.**

---

## Item de re-pin delta D-6 (déclaré au pli G2, G0 §5/§11 item 10)

La fixture `U4b-scores-e2.jsonl` **A divergé** sous SCORE-1 : sha256 `84f8aa13…ec79971e` (à `1892144`, base
`f0720ae`) → `301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad` (à `d4d15a0`, post-SCORE-1).
**Aucun re-pin de CODE requis** : les tests -2a (`ukemi-served-strateof.test.ts`, `gate-liq-artifact.test.ts`)
ne lisent que yhat/strate/meta.cell_a.predictor_id (invariants — SCORE-1 ne change que `score`) et **n'épinglent
aucun sha de fixture**. Prouvé empiriquement : ces tests passent sur la fixture POST-SCORE-1 (fusion à blanc,
795 pass). L'item I-4 de G1 (précautionnel) est donc **clos** (sha post-fusion consigné ici, non-dette).

## Corrections (PASS-AVEC-CORRECTIONS)

- **C-1 (BLOQUANTE avant G7, docs-seulement, propriétaire = orchestrateur, R-20)** : insérer l'amendement daté
  ADR-U4b 2a-8 (RÉDIGÉ dans G1 §H : clé re-dérivée serveur / `predictor_id` client ignoré / déviation ADR-M020
  D1(b) ; réécriture des tuyaux `ADR-U4b:26-27` sous 123/126 ; renvoi à SCORE-1 pour D3/D4) au pli documentaire
  avant le G7. **Absent à `1892144`** (`grep "2026-09-22" ADR-U4b` = 0 ; ADR hors diff -2a) ; **aucun commit de
  pli depuis `1892144`** (`git log 1892144..lot/u4b-2a` VIDE ⇒ C-1 = « insérer », pas « vérifier ») ; `1892144`
  pas encore dans `lot/etude-suite` (G7 en attente). **Risque de pli à nommer** : le texte G1 §H a été rédigé
  contre l'ADR **à `f0720ae`** ; après la fusion à blanc l'ADR porte +112 l. de l'amendement SCORE-1 (`d4d15a0`).
  L'orchestrateur doit donc (a) insérer §H **APRÈS** l'amendement SCORE-1 (jamais avant) ; (b) **AVANT** de
  réécrire les tuyaux, RE-LOCALISER les lignes 26-27 (les numéros peuvent avoir bougé sous SCORE-1) et vérifier
  qu'elles portent encore le libellé cité par G1 — mesuré à `1892144` : `:26` « région servie … built ssi test
  servi vert (-2) » et `:27` « cascade retrait … `-2` … `no_cascade_class_in_harness` » portent BIEN le libellé
  périmé (cible de réécriture valide), mais le pli s'exécute sur l'arbre FUSIONNÉ, pas à `f0720ae`. Critère
  d'acceptation G0 §9-8 non satisfait tant que non inséré. N'affecte ni oracle ni R-25 (docs exclus).

## Non-corrections consignées (observations, non bloquantes)

- Borne R-25 : la valeur configurée `ci.yml:43` est **1205**, la mission cite « 1150 ». Sans effet (720 ≪ les deux). À aligner dans un futur libellé de mission si voulu.
- `LIQ_EMPTY_REGISTRY_SENTENCE` non scanné pour « interval » (couverture de mutation) — voir vérif 3 ; renforcement possible en -2b.

## Faits CA-11 pour le checkpoint-2 (entrée du validateur-humain — G2 ne rend PAS d'ACCEPTE/REFUSE)

**CA-1..CA-10 ne sont pas dans le périmètre du siège G2** (checkpoint-2 = validateur-humain Fable 5.1, instance
séparée) ; les faits G2 pertinents pour leur instruction (oracle vert clone + fusion, 17 mutants, R-25 720,
périmètre 14 fichiers, gel des contrats intact, provenance) sont dans les vérifications 1-10 ci-dessus, à
consommer par le validateur — ce silence sur CA-1..CA-10 est un choix de périmètre, pas une omission.

- **Registre « built » ⇔ chemin servi + test d'intégration non-LLM** : Ukemi reste `built` (fleet.ts inchangé) ; le chemin servi de la classe liq = MCP `gate` + `POST /gate` via `HARNESS_TOOLS` ; test `u4b_gate_serves_region_from_real_artifact` (`gate-liq-artifact.test.ts`) rejoue la composition bout-en-bout sur les DEUX surfaces depuis la fixture committée. En -2a la classe ne revendique AUCUNE couverture (registre vide ⇒ `under_calib`) — pas de nouvelle pièce « built » à brancher ; le branchement de la BORNE HAUTE servie est un livrable **-2b** (2b-4/2b-5, `fleet.ts` re-câblé), correctement HORS de ce lot.
- Provenance : modèle G2 résolu `claude-opus-4-8[1m]` (préfixe conforme), générateur (G1) ≠ relecteur (G2), contexte frais, clone jetable, aucun commit.

---

### Provenance de branchement (ce rapport)
Entrée : mission `F:\tmp\u4b2a-rev\MISSION-G2-CP2-u4b-2a.md`, rendu G1 (`F:\tmp\u4b2a\{G1-lot-u4b-2a.md,mutants.mjs,DELIVERED.sha256}`), G0 `docs/G0-lot-u4b-2.md`, clone `F:\tmp\g2-u4b2a\tree` @ `1892144`. Sortie : ce fichier + `logs/` (oracles clone + fusion, replay G1, mutants G2, régénération h5) + `g2-mine.mjs` + `g1-replay.mjs`, consommés par l'orchestrateur (R-21) qui rend le G7 et committe SEUL (R-20). État : clone + branche jetable `g2-merge-blanc`, aucun commit dans un dépôt de travail, `env -u` partout, aucune variable d'environnement affichée. Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-22.
