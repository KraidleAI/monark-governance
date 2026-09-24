# ADR-U4b-2b : classe calibrée SERVIE sur registre frais (strate s0 committée, q̂ égal au maximum de strate, borne haute servie, bascule du harness et de sa CA, liaison au registre public)

- **Statut** : PROPOSÉ (G0 du sous-lot -2b ; décision investisseur 185, `docs/CHANTIERS.md:1405` ; rectification « -2b et non -2a », `docs/CHANTIERS.md:1407`). Texte de worker, à relire, amender et committer par l'orchestrateur (R-20, R-21) ; checkpoint-1 du validateur-humain ensuite ; aucun code avant le checkpoint-1 (décision 185).
- **Rattachement** : ADR-U4b (`docs/adr/ADR-U4b-calibration-episode-frais.md`, tuyau « région servie » `:26`, amendements décision 126 `:156-266`, U-4b-2a `:268-294`, HARNESS-DESC-1 `:1056-1297`, U-4b-STATS-1 `:1496-1827`) ; G0 plié du lot U-4b-2 (`docs/G0-lot-u4b-2.md`, lignes 2b-1..2b-7 `:63-73`) et son checkpoint-1 (`docs/CHECKPOINT1-lot-u4b-2.md:74`, C-4) ; G7 -2a (`docs/G7-lot-u4b-2a.md:23-25`) ; ADR-M020 D1 (b), D3, D5 ; ADR-M018 D1-D5 ; prereg `docs/PLAN-u4b-prereg.md` (sha256 LF `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49`) H-2 `:97`, H-2bis `:98`, H-3 `:100`, cadre `:106`, classe servie `:355`, go U-6 `:359` ; décisions 51, 108, 110, 111, 123, 126, 127, 129, 137, 163, 170, 182, 183, 185.
- **Numérotation** : D1..D8 sont propres à cet ADR. « ADR-U4b D1..D5 » désigne l'ADR mère ; « G0 D-n » les décisions de conception du G0 plié (`docs/G0-lot-u4b-2.md` §3) ; « delta D-n » les corrections du checkpoint-1 delta.
- **Provenance** : worker `claude-opus-5-5[1m]` (R-1 : préfixe `claude-opus-5-5` déclaré en tête de session), effort max, 2026-09-24 (UTC), sur mission de l'orchestrateur `claude-fable-5-1`. Dépôt lu en lecture seule ; seule écriture dans le dépôt : ce fichier. Aucun appel réseau sortant, aucun commit, aucun workflow. Scripts, sorties et sha256 sous `F:\tmp\ukemi-2b\` (§11). Advisor intégré (R-26) : première consultation avant rédaction, réponse « timed out » (indisponibilité consignée, aucun avis consommé) ; seconde consultation avant clôture, avis reçu et replié : (1) piège d'export CI sur la jambe `fleet.ts` examiné et écarté sur pièces (D3) ; (2) D2 déclarée comme déviation du G0 (D-n) ; (3) provenance et empreinte finales ; (4) livrable RUNBOOK-harness §6, épingles openapi et cascade vérifiées, vocabulaire du site vérifié, périmètre d'octets du déploiement déclaré (D8). Avis, jamais verdict.
- **Base mesurée** : `lot/etude-suite` @ `26353e798d40fda7528296377bf278f028fef059` pour le code et le site ; tête à la clôture de ce texte `3248546f5712333973c548ceab15e746b7087a40`, qui n'ajoute que `docs/CHANTIERS.md` (`git diff --name-only 26353e7 3248546`), lignes citées re-vérifiées. La mission a été formée à `e1258839f9521584a27b663b0a86ff60ba5a027c` ; de `e1258839` à `6ce34d5` seul `docs/CHANTIERS.md` change ; de `6ce34d5` à `26353e7` arrive la fusion G7 de SITE-5J-INT (`26353e7`, lot `a4d3f44`) qui touche `apps/site/**`, `scripts/sync-*.mjs`, `test/site-*.test.ts`, `test/harness-served.test.ts`, `test/bell-*.test.ts`, `test/probe-narabi*.test.ts`, `test/narabi-live.test.ts` et `vocab-banned.json`, mais **aucun** fichier de `apps/harness`, `packages`, ni `scripts/assert-fleet-html.mjs`, `scripts/verify-harness.mjs`, `test/ci-gates.test.ts`, `test/h5-e2e-probe.test.ts` (`git diff --stat 6ce34d5 26353e7` sur ces chemins : vide). Les références de code du harness valent donc à toutes ces têtes ; les références du site ont été re-mesurées à `26353e7`.

## 0. Points à trancher par l'orchestrateur (« Needs from you »)

| # | Question | Options | Recommandation du rédacteur | Où |
|---|---|---|---|---|
| N-1 | Lecture de H-2bis (`PLAN-u4b-prereg.md:98`) pour s0 (n 170 < 199) | A : committer s0, q̂ = maximum de strate, « rapporté tel quel » ; B : ne rien committer tant qu'aucune strate n'a n ≥ 199 | **A** (lecture littérale + chaîne de plans + validité, §D1) | D1 |
| N-2 | Texte servi de la classe à l'état committé | a : clause committée octet pour octet (`describeGate(true)`, sha256 `5574450432…`), divulgation H-2bis par le fil, le rapport 6d et `/ukemi/course`, ce qui est une **déviation déclarée** du G0 §2 note (`G0-lot-u4b-2.md:75`) et du delta D-9 (texte par strate) au profit du delta D-3 ; b : ajouter une phrase « maximum de strate » | **a** (D-2b-1) | D2 |
| N-3 | Ordre de la bascule servie (fenêtre W) | W1 : déploiement depuis le commit de fusion préparé en staging, oracle avant et après, avance rapide du tronc ensuite ; W2 : fusion au tronc d'abord, déploiement plus tard | **W1** | D8 |
| N-4 | Préconditions de W | fusion CodeQL (elle réécrit `scripts/assert-fleet-html.mjs`) ; item UKEMI-SITE-SWITCH-1 prêt (SITE-5J-INT est fusionné depuis `26353e7`) | **confirmer les deux** ; sinon `/ukemi` devient faux au redéploiement (§1.6) | D5, D8 |
| N-14 | Oracles du lot (G1, G2, checkpoint-2) avant W : deux fils-pièges du site rougissent par construction au commit du registre (§1.6) | liste FERMÉE de rouges par construction, chacun devant échouer sur son message conçu, oracle probant = celui de W étape 6, tout vert (précédent : `ADR-U4b…md:2169-2170`, D-1 du pli UKEMI-CONC-1) ; ou autre mécanisme à définir | **liste fermée** (§4) | D8, §4 |
| N-5 | Décision 127 (surfaces dans le même lot) contre décision 163 (MCP et SKILL plus tard) | a : `skills/monark/SKILL.md`, fiche MCP Registry et version au lot MCP (163), `README.md` et `apps/harness/README.md` dans -2b ; b : 127 à la lettre | **a** | D4 |
| N-6 | Fixtures fraîches : 3 fichiers (RUNBOOK étape 8) ou 4 (avec les étiquettes U-3 fraîches) | 3 ; 4 | **4** : sans les étiquettes, le scoreur gelé ne peut pas rejouer la composition en dépôt | D7 |
| N-7 | Écriture de `calibration.ts` | émetteur `scripts/emit-u4b-calibration.mjs` (G0 Q-3) ; épinglage à la main | **émetteur** (checkpoint-1 : recopie à la main = risque de transcription) | D1 |
| N-8 | IF-1 (4ᵉ exemption `verified`) au re-pin h5 de -2b | inclure ; reporter à U-5b avec motif | **inclure** (déclencheur « prochain re-pin h5 » atteint) | D4 |
| N-9 | O-1b-G2-1 (`process.exitCode`) et R-1b-2 (clause UPPER exigée) dans la CA basculée | inclure ; reporter | **inclure** (déclencheur « au plus tard la bascule -2b ») | D4 |
| N-10 | Test liant le registre public à la CA committée (FLEET-UKEMI-CA-BIND-1) | ajouter ; s'en remettre à l'ordre de W | **ajouter** (précédent `test/bell-served.test.ts:49`) | D3 |
| N-11 | Décision 111 « retour au miroir quand U-4b servira » | appliquer à W avec une liste fermée ; item à la release suivante | **item** avec liste fermée tranchée par l'orchestrateur | D7 |
| N-12 | Étape 7 (rapprochement Chainstack) | dans -2b ; item | **item** (décision 129) | D6 |
| N-13 | Prémisse de mission périmée (« harness servi antérieur à -2a ») | acter la correction et assigner l'`error_origin` | **acter** ; proposition d'`error_origin` : orchestrateur (mission) | §1.5 |

## 0 bis. Arbitrages de l'orchestrateur (2026-09-24 07:13 UTC, `claude-fable-5-1`, avant checkpoint-1)

| # | Arbitrage | Motif court |
|---|---|---|
| N-1 | **A** : s0 committée, q̂ = maximum de strate, rapporté tel quel | lettre de H-2bis, chaîne de plans, validité p = n ; l'option B durcirait le prereg après la donnée |
| N-2 | **a** : `describeGate(true)` octet pour octet ; déviation D-2b-1 déclarée, à adjuger au checkpoint-1 | divulgation par le fil (q̂, `n_calib`), le rapport 6d et `/ukemi/course` ; garde l'identité d'octets D-HD-1 et la clause attendue par le fil-piège du site |
| N-3 | **W1** | oracle avant et après le déploiement, retour arrière `bb41b6d` |
| N-4 | **confirmé** : fusion CodeQL et UKEMI-SITE-SWITCH-1 gelé sont des préconditions de W | sinon `/ukemi` devient faux au redéploiement |
| N-14 | **liste fermée** de deux noms, valable pour les oracles du lot et l'étape 2 de W seulement ; chacun doit rougir sur son message conçu ; l'oracle probant (W étape 6) n'admet aucune exception | précédent `ADR-U4b:2169-2170` ; tout rouge hors liste est un défaut |
| N-5 | **a** : SKILL, fiche MCP Registry, version au lot MCP (163) ; `README.md` et `apps/harness/README.md` dans -2b | décision 163 explicite |
| N-6 | **4 fichiers** (étiquettes U-3 fraîches incluses) | sans elles le scoreur gelé ne rejoue pas la composition en dépôt |
| N-7 | **émetteur** `scripts/emit-u4b-calibration.mjs` | recopie à la main = risque de transcription |
| N-8 | **inclure IF-1** | déclencheur atteint |
| N-9 | **inclure** O-1b-G2-1 et R-1b-2 | déclencheur « au plus tard la bascule -2b » |
| N-10 | **ajouter** `fleet_ukemi_liq_leg_matches_deploy_ca` | CA-11 par test, précédent Bell |
| N-11 | **item** EXPORT-U4B-111-1, liste fermée tranchée par l'orchestrateur à W | |
| N-12 | **item** RECONCILE-UKEMI-T1-1 (décision 129) | |
| N-13 | **acté** : prémisse de mission périmée (harness déjà redéployé à `bb41b6d`), `error_origin` = orchestrateur (mission rédigée sur une mesure antérieure au redéploiement journalisé) | |

Règle de conduite du lot (article Osmani 2026-09-22, `docs/roster/FAITS-opus-5-5-usage-2026-09-24.md`) : mission entière avec ligne d'arrivée, rendu ouvert par « Needs from you », aucun acte réseau ni écriture hors périmètre sans l'orchestrateur.

## 1. Contexte mesuré

### 1.1 Ce que l'ADR mère, le G0 plié et les revues ont déjà fixé pour -2b
1. Tuyau « région servie » : `built` **ssi** test servi vert sur registre FRAIS ; test `u4b_gate_serves_region_from_real_artifact` en phase -2b, ligne 2b-4 (`ADR-U4b…md:26` ; `G0-lot-u4b-2.md:70`).
2. Forme servie : borne haute `[0, ŷ + q̂_k]` (décision 126, `ADR-U4b…md:186-192`) ; le champ de fil `region.kind` reste `"interval"` (`ADR-U4b…md:188` ; union gelée `packages/contracts/src/types.ts:205`, champ `:216`) ; implémentation `buildIntervalRegion(0, ŷ + q̂)` (`packages/hikae/src/region.ts:62-78`, NDG-1 `:71-76`).
3. Clé re-dérivée côté serveur `UKEMI_LIQ_PREDICTOR_BASE + "/s" + strateOf(ŷ)` ; le placeholder est re-épinglé au littéral `meta.cell_a.predictor_id` de l'épisode frais (`ADR-U4b…md:275-282` ; `apps/harness/src/calibration.ts:220`).
4. Lignes 2b-1..2b-7 (`G0-lot-u4b-2.md:67-73`) ; règle q̂ = 0 ⇒ `under_calib` côté serveur (G0 D-12, `:92`) ; aucun bump de version sur tout U-4b-2 (`:112`, décision 123) ; précondition dure : fixture fraîche, book et oracle-path frais committés en dépôt avec provenance (`:15`, item 4 `:192`).
5. Checkpoint-1 C-4 : « une strate sous nMin reste JAMAIS committée », les clés committées sont exactement les strates committables, mutant « strate sous nMin committée » exigé rouge (`CHECKPOINT1-lot-u4b-2.md:74`).
6. HARNESS-DESC-1, item -2b (a)-(d) : re-cadrer le test du chemin réel sur l'état committé, re-pin h5, bascule des deux contrôles de la CA, survivant R-HD-1 rendu tuable (`ADR-U4b…md:1112-1121`) ; extension §4 (c) : re-dériver les quatre vecteurs du contrôle négatif et rejouer les six mutants de prédicats (`:1266-1275`) ; R-1b-2, clause UPPER non exigée par la CA (`:1256-1264`) ; O-1b-G2-1, code de sortie de la CA (`:1151`) ; ligne connexe : rien ne fait rougir le site quand le registre se remplit (`:1120-1121`), désormais couverte par le fil-piège que SITE-5J-INT a mis au tronc (`test/site-ukemi.test.ts:608-636`, §1.6).
7. G7 -2a, items formés pour -2b : re-pin du placeholder ; mutants (n') et (h') migrés vers 2b-4 ; texte par strate H-3 et q̂ = max si 100 ≤ n < 199 (`G7-lot-u4b-2a.md:24`).

### 1.2 Code servi à la tête (lu ligne à ligne)
- `apps/harness/src/calibration.ts` : interface `CommittedCalibration` `:185-191` ; registre `COMMITTED_CALIBRATIONS` `:195-203` (USDe seul) ; `lookupCommittedCalibration` `:207-209` ; placeholder `UKEMI_LIQ_PREDICTOR_BASE = "ukemi:liquidation-eligible-coverage-uncommitted-until-u4b-2b"` `:220` ; `hasCommittedCalibrationForClass` (niveau registre) `:228-230` ; motif de garde de digest à l'import `:157-170`.
- `apps/harness/src/ukemi-strata.ts` : coupes servies `:25` ; `strateOf` `:31-38` ; `liqUpperBoundRegion` `:54-59` (q̂ = 0 ⇒ `under_calib`).
- `apps/harness/src/tools/gate.ts` : classe `:77` ; α et nMin imposés `:82-83` ; `liqEligibleVerdict` `:585-642` (refus 400 nommés `:589-604`, strate et clé serveur `:605-607`, strate non committée ⇒ `underCalibVerdict` sur scores vides donc `n_calib = 0` `:608-615`, `splitQuantile` `:618-626`, borne haute `:627`, verdict `covered` `:637-641`) ; phrases `:140-168` ; `describeGate` `:194-215` ; description servie évaluée au chargement `:220` ; `honestyText`, branche liq keyée au niveau registre `:662-670` ; résumé factuel du verdict dans `content` (q̂, `n_calib`, digest tronqué) `:684-693` ; class-lock BYO `:721-724`.
- Chemin servi : descripteur `apps/harness/src/tools/registry.ts:61` (description) et `:66-74` (texte `content` = `honestyText` + résumé, `:72`) ; `apps/harness/src/openapi.ts:73` ; miroir `apps/harness/src/http.ts:50`.
- L3 : un verdict `covered` dont la largeur dépasse `tauInterval` rend `defer` / `interval_too_wide` si l'horloge est ouverte (`packages/hikae/src/l3-gate.ts:129-132`) ; la raison de décision de haut niveau n'est donc PAS `verdict.reason` (conséquence pour la CA, D4).
- Mesuré à la tête en important les modules réels (script `desc_sha.mjs`, §11) : registre vide pour la classe (`false`) ; `GATE_TOOL_DESCRIPTION === describeGate(false)` ; sha256 de `describeGate(true)` = `5574450432b7252bb82a31e51eb01b707d286fc9bf4af425a2bf5bce787aed77` (3 193 caractères), égal à la valeur de `ADR-U4b…md:1088-1089` ; `describeGate(false)` = `037c9610751e5a07f7b590aad0e14f44fa01f60be9114d17db1408464f0f64fc` (2 962 unités UTF-16, 2 983 octets UTF-8 ; le « 2 983 car. » lu en ligne par l'orchestrateur, `docs/CHANTIERS.md:946`, est ce décompte en octets : cohérent).
- Depuis le G1 HARNESS-DESC-1 (`906064b`), `git diff 906064b 6ce34d5 -- apps/harness/src/tools/gate.ts` ne change que trois lignes de commentaire, et A-9-OUTILLE (`649db8b`) déclare « 0 served bytes changed » : aucun octet servi n'a bougé depuis le dernier re-pin h5.

### 1.3 Faits de la course, recalculés indépendamment
Sources : ligne « Sidecar 6 » (`docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:40`) ; `docs/CHANTIERS.md:1263-1266` ; artefacts hors dépôt `F:/course-ukemi/reduce/U4b-scores-weth-2025-09-22.jsonl` (sha256 `fd6fab7ebf5d2779b904494accab8916fac8293587ed24d21fb052cb024074a4`, 253 lignes, 0 CR : 1 meta, 205 `score_a`, 47 `score_b`), `F:/course-ukemi/offline/registry-A-weth-2025-09-22.log` (`1e31351c…fbbf`), `scores-summary-weth-2025-09-22.json` (`ad4b1579…9aef`), `hyp-report-weth-2025-09-22.json` (`555b77df…0be5`, `body_digest` `8ad53d1a…d44f`).

| Strate (coupes `strateOf`) | n | p = ⌈(n+1)·0,99⌉ | q̂ (base 8 déc.) | scores nuls | C5 (`calib-digest.ts:14-29`) | état |
|---|---|---|---|---|---|---|
| s0 (ŷ < 2000e8) | 170 | 170 | 126184298996 (= maximum de strate) | 147 | `e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334` | committable |
| s1 | 21 | 22 | null | 9 | `e3cd7a6151d3982f4ca5aef10540bed7caa22e168ed054d35b3b537bc7d533fc` | `under_calib` (n < 100) |
| s2 | 10 | 11 | null | 9 | `6626856f4a10844c280cb0dc458a96ae2de54d9e6ecbd28e2aff6b9af8a2247d` | `under_calib` |
| s3 | 4 | 5 | null | 4 | `66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925` | `under_calib` |

- Recalcul **indépendant** (Python, aucun code du dépôt importé, coupes et C5 ré-écrits d'après la spécification `calib-digest.ts:3-13`) : n, p, q̂, C5 ci-dessus identiques ; 0 écart entre le score recalculé `max(Y − ŷ, 0)` et le champ `score`, 0 écart entre la strate recalculée et le champ `strate` ; toutes les valeurs ≤ 2^53 (échelle 1 exacte ; l'item 5 du G0, `:193`, est sans objet pour cet épisode).
- **Rejeu du générateur gelé** `scripts/record-u4b-calib.mjs` (sha256 LF `5733daeb…fbc31a3` à la tête, = gel D4) sur la fixture fraîche : sortie identique au journal `registry-A` à l'exception de la ligne `exit=0 …` ajoutée par le lanceur (sha256 LF `742418fe…d2b0` des deux côtés).
- **Rejeu du scoreur gelé** `computeScoresU4b` (`scripts/census/u4b/u4b-scores.mjs:77`) sur le book réduit (`4b601785…8341`), l'oracle-path réduit (`cc7f5cd9…0971`) et les étiquettes fraîches `F:/course-ukemi/label/out/U3-realized.jsonl` (`e2d6c0e4…1837`, 73 lignes), sérialisé comme `scripts/census/u4b/u4b-reduce.mjs:77-85` : **octet pour octet égal** à la fixture de scores (`fd6fab7e…74a4`).
- Deux digests à ne pas confondre : le meta du scoreur porte un digest de LIGNES (sha256 d'un JSON, `u4b-scores.mjs:62` ; s0 `eee9b437…`, cellule A poolée `43c38591…`) ; le registre servi porte le C5 (`e7e67366…` pour s0).
- Cellule A poolée : n 205, p 204, q̂ 126184298996. L'égalité de valeur avec q̂₀ est une coïncidence d'ordre (le maximum de s0 est la 204ᵉ plus petite valeur du pool ; le maximum du pool, 4692820490749, est en s1). Le q̂ poolé n'est servi nulle part (G0-lot-u4b C-10, rappelé à `ADR-U4b…md:1633-1634`).
- Rapport 6d : bloc `h2bis` = s0 {n 170, p 170, `interior: false`, `n_ge_199: false`, `qhat_is_stratum_max: true}` ; H-3 s0 OUI (k 361 sur 363, p-value ≈ 0,463) ; poolé OUI hors condition ; `clause_359.condition_satisfied = true` (SIDECAR `:40` ; `docs/CHANTIERS.md:1266`).
- Non-vacuité disponible pour les tests : 205 lignes `score_a`, 201 valeurs distinctes de ŷ ; s0 : 170 lignes, 166 valeurs distinctes, 1 ligne à ŷ = 0, 27 comptes liquidés.

### 1.4 Clauses pré-enregistrées applicables
- H-2 (`PLAN-u4b-prereg.md:97`) : n(strate) ≥ nMin, sinon `under_calib` ; q̂ null, « jamais un max silencieusement clipé ».
- H-2bis (`:98`) : « Condition SERVIE pré-enregistrée : n ≥ 199 par strate servie pour un q̂ intérieur […] ; sinon q̂ = max, rapporté tel quel ».
- Cadre (`:106`) : les paramètres de validité établis sont α = 0,01, nMin = 100, coupes, X = 0, N_min = 50, tie-break ; 199 n'y figure pas ; H-3, H-4, H-5 sont des seuils de rapport.
- Classe servie en -2 : A seule (`:355`, décision 108).
- Go U-6 conditionnel (`:359`) : GO sans nouveau tour ssi aucune strate servie en NON à H-3 et 0 étiquette sans quorum non résolue ; satisfait (§1.3).

### 1.5 État servi en ligne et prémisse de mission périmée
- La mission affirme que le harness servi est antérieur à -2a (classe absente de l'openapi en ligne). C'était vrai à la capture `docs/carto/openapi-live-2026-09-22.json` (sha256 `e22f3012…162b`, lue le 2026-09-22 à 20:1x UTC, `docs/CHANTIERS.md:851` : classe absente, mesuré ici par lecture du fichier).
- C'est **périmé** depuis le redéploiement au SHA `bb41b6d` (2026-09-23 vers 00:5x UTC, `docs/CHANTIERS.md:946`) : la CA committée `docs/deploy-CA-harness.json` (commit `fb6720b`, sha256 `0a3e9a7270604fad8047661cd4a1f7e75e126539932e2b6e3d44a4e9069a53e9`, `checked_at` 2026-09-23T00:54:20.288Z) porte 12/12 contrôles verts dont `gate_liq_call` (`reason=under_calib empty_registry_text=true`) et `mcp_gate_description_liq` (`empty_registry_sentence=true h3_sentence=false`) ; CARTO-T1C-1 est CLOS au même journal.
- Corroboration de second rang pour le rédacteur (synchronisations faites par un autre agent, committées au tronc par SITE-5J-INT, non relues en ligne par le rédacteur) : `apps/site/data/ukemi-served.json` (`read_at` 2026-09-24T01:48:50.603Z, `registry_state: "empty"`, clause liq = clause registre vide) ; `apps/site/data/harness-served.json` (`read_at` 2026-09-24T03:39:46.604Z, `version` `0.4.0`).
- Conséquence : le redéploiement de -2b ne rattrape pas un processus en retard ; il sert un **nouvel état** du registre (D4). `error_origin` proposé pour la prémisse : orchestrateur (mission rédigée sur une mesure antérieure au redéploiement journalisé), à assigner au G7.
- Le dossier de passation nomme « U-4b-2a » l'engagement de s0 (`docs/PASSATION-2026-09-24.md:28,50`) ; le sous-lot réel est -2b (`docs/CHANTIERS.md:1407`) : erratum déjà porté au journal, sans autre action.

### 1.6 Couplage avec la vitrine `/ukemi` et lots voisins (mesuré à `26353e7`)
- `/ukemi` rend l'état servi « registre vide » : `apps/site/components/ukemi/ukemi-page.tsx:108-109` rend `SERVED_STATE_LEAD` puis `LIQ_EMPTY_REGISTRY_SENTENCE` (`apps/site/lib/ukemi-copy.ts:52-53,108-110`). Le contrôle de build `assertUkemiBody` **exige** cette phrase (`scripts/assert-fleet-html.mjs:207-208`) et zéro jeton numérique dans le `<main>` (`:202-204`) ; `main()` importe la phrase depuis `ukemi-copy.ts` (`:259-271`). La copie annonce déjà que UPPER et H-3 « ride live at U-4b-2b » (`ukemi-copy.ts:23`).
- Dès que le harness sert s0, la phrase « no liquidation-eligible-coverage calibration is committed yet » devient **fausse en ligne**, et -2b ne peut pas la corriger sans toucher `scripts/assert-fleet-html.mjs`, ce que la mission interdit dans ce lot.
- Lot CODEQL-ALERTS-1 : gel 1 `8229745`, G2 delta renvoyé au worker (`docs/CHANTIERS.md:1399` ; commit `51dfe55`), **non fusionné** (`git merge-base --is-ancestor lot/codeql-alerts-1 HEAD` : non) ; il réécrit `scripts/assert-fleet-html.mjs` (`git diff --stat HEAD...lot/codeql-alerts-1 -- scripts/assert-fleet-html.mjs` : 108 insertions, 18 suppressions) ; décision 170 : CodeQL devient un contrôle requis.
- Lot SITE-5J-INT : **fusionné** pendant la rédaction (G7 `26353e7`, régime vitrine, décision 183). Il met au tronc quatre couplages avec l'état du registre liq :
  1. fil-piège `site_ukemi_served_state_bound_to_harness_registry` (`test/site-ukemi.test.ts:608-636`) : l'état synchronisé doit égaler l'état du registre du dépôt, et `assert.equal(committed, false, …)` (`:614`) rougit dès qu'une calibration liq est committée, message « switch the /ukemi served sentence and re-sync » ; la clause attendue à l'état committé est exactement « the served region is » + UPPER, REQ, H-3, COND (`:615-617`), c'est-à-dire la tranche liq de `describeGate(true)` ;
  2. `scripts/sync-ukemi-served.mjs` compose les deux clauses depuis les constantes de `gate.ts` et exige qu'exactement une corresponde à la description servie ;
  3. `scripts/sync-harness-served.mjs` fige la classe liq à l'état `none` avec les clauses EMPTY et REQ (`:72`) et exige que l'appel liq en ligne soit l'abstention registre vide (`:151`) : il échouera, fail-closed, contre le harness redéployé ;
  4. `test/harness-served.test.ts` : `harness_served_data_matches_in_process_harness` (`:76-123`) exige que le corps openapi synchronisé égale le document en processus (`:79`) et que chaque clause de classe synchronisée figure dans `GATE_TOOL_DESCRIPTION` en processus (`:119`) : rougit au commit du registre ; `harness_served_data_matches_deploy_ca` (`:125-138`) lie les corps synchronisés aux sha256 de la CA committée, dont le contrôle `gate_liq_call` (`:134`).
- L'entrée Ukemi de `apps/site/lib/fleet.ts` est désormais `:169-190` (ligne publique « Liquidation coverage, gated. » `:173`, décision 182 ; note `:188` « … replayed by an integration test ») ; les notes du registre sont liées aux descriptions servies par `registry_notes_track_served_descriptions` (`test/site-build-fleet.test.ts:644`).
- Ordre de fusion proposé par le critique site : CodeQL, puis SITE-5J-INT, puis BELL-CASH-LEG-1 (LANDING-ORDER-1, `docs/CHANTIERS.md:1397`) ; dans les faits BELL-CASH-LEG-1 (`77153d5`) puis SITE-5J-INT (`26353e7`) ont fusionné, CodeQL reste en vol.

### 1.7 Fixtures fraîches hors dépôt
- `apps/sentinel/test/fixtures/ukemi/u4b/` ne contient que l'épisode de conception e2 (4 fichiers) ; les réduits frais sont sous `F:/course-ukemi/reduce/` (book 7 199 778 octets, oracle-path 5 868, scores 47 826) et les étiquettes sous `F:/course-ukemi/label/out/U3-realized.jsonl` (50 254 octets).
- Le RUNBOOK de course confie à -2b la copie des 3 réduits avec provenance et l'épinglage du registre (`docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:565`) ; le scoreur a besoin des étiquettes (`u4b-scores.mjs:77` ; RUNBOOK 6b `:478-486`) ; le rejeu du §1.3 prouve que les 4 fichiers suffisent à recomposer la fixture de scores.
- Précédent e2 : étiquettes e2 committées et exportées (`apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl`) ; réduits e2 committés et exclus de l'export (`scripts/export-exclude-data.json:2,8-11`, décision 111).

### 1.8 Consommateurs de `calibration.ts`
- Harness : `gate.ts:42-44`.
- Job quotidien Narabi : `apps/sentinel/src/timeline.ts:16` importe `@monark/harness/calibration` (export `apps/harness/package.json:7-10`) ; `committedQ1` refuse un état `under_calib` (`timeline.ts:28-32`). Toute garde d'import ajoutée par -2b s'exécutera aussi dans ce processus à son prochain redéploiement ; `sentinelSha` ne couvre que `apps/sentinel/src/*.ts` (`apps/sentinel/src/run.ts:156-161`), il est inchangé.

### 1.9 Version et surfaces publiques
- `HARNESS_VERSION = "0.4.0"` (`apps/harness/src/version.ts:22`) ; « Bumping this constant belongs to the SAME commit as the tag it names » (`:7`).
- Décision 123 : aucun bump sur tout U-4b-2 (`G0-lot-u4b-2.md:112`) ; question Q-NEW-5 (`:230`) ; décision 127 : surfaces publiques dans le même lot (`:10`) ; décision 163 : MCP et SKILL mis à jour plus tard (`docs/PASSATION-2026-09-24.md:77-81`).
- `skills/monark/SKILL.md:56-68` nomme deux classes intégrées et la classe stable-run, pas la classe liq : incomplet, pas faux. `apps/harness/README.md:24-28` omet stable-run, la classe liq et la clé `attested` (CARTO-T1C-3, `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md:248`, déclencheur « U-4b-2b »). `README.md:35,104-106` décrit Ukemi par `cascade` seul.

### 1.10 Rapprochement Chainstack (étape 7)
- Étape 7 = porte de comptabilité séparée qui ne retient ni la clôture ni -2b (`RUNBOOK-course-ukemi-2026-09-22.md:527-561`, décision 129) ; déclencheur « colonne du jour visible au dashboard (≥ 24 h) » (`:529`).
- Mesuré en lecture seule : le ledger `F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19/chainstack.jsonl` existe (118 347 lignes, dernière ligne `unlocked`, raison « u4-oracle-path course end ») ; le dossier `F:/course-ukemi/reconcile/` n'existe pas encore.
- Le plafond est par compte (décision 121) ; les courses Bell seq 2 du 2026-09-24 consomment le même compte (`docs/CHANTIERS.md:1405-1409`).

## 2. Décisions

### D1 : registre servi, strate s0 seule, q̂ égal au maximum de strate (option A)
**Décision proposée.** -2b committe dans `COMMITTED_CALIBRATIONS` UNE entrée de classe A :
- `taskClass = "liquidation-eligible-coverage"` ; `predictorId = "ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/weth-2025-09-22/A/s0"` ;
- `scores` = les 170 scores de s0 à l'échelle 1 (sortie de `buildRegistryEntries`, `record-u4b-calib.mjs:27-60`) ; `digestPinned = e7e67366…d4eff334` ; garde de digest fail-closed à l'import (motif `calibration.ts:157-170`) ;
- `provenance` : mesurée, sans `anchor_price`, `pstar` ni `m_bps` (G0 2b-1, C-12) ; elle nomme l'épisode, n = 170, p = 170, « q̂ is the stratum maximum (n < 199, pre-registered H-2bis) », les sha des fixtures (D7) et du rapport 6d ;
- `UKEMI_LIQ_PREDICTOR_BASE` re-épinglé à `"ukemi:realized-v2@eip155:1/aave-v3-core/weth-mono/weth-2025-09-22/A"` (`meta.cell_a.predictor_id` frais) ;
- s1, s2, s3 ne sont PAS committées (checkpoint-1 C-4) : le serveur y rend `under_calib` avec `n_calib = 0` (`gate.ts:608-615`) ;
- écriture par l'émetteur `scripts/emit-u4b-calibration.mjs` qui lit la sortie du générateur gelé et n'en filtre rien (G0 2b-2, delta D-2) ; le générateur gelé n'est pas modifié (sha `5733daeb…`, A-6).

**Pourquoi la clause H-2bis n'interdit pas le commit (lecture A).**
1. Lettre (`PLAN-u4b-prereg.md:98`) : la condition porte sur « un q̂ intérieur » et s'applique « par strate servie » ; sa branche « sinon » fixe la valeur servie (« q̂ = max, rapporté tel quel »). Elle prescrit la valeur, pas un refus.
2. Condition de service écrite : H-2 (`:97`, n ≥ nMin) ; le cadre (`:106`) liste les paramètres de validité et 199 n'y figure pas.
3. Chaîne de plans cohérente avec A : l'ADR mère range e2 strate 1 (n 148 < 199) parmi les « strates SERVIES » avec q̂ = max (`ADR-U4b…md:223-224`) ; le G0 plié prévoit ce cas dans le texte servi (note H-3 `G0-lot-u4b-2.md:75` ; D-12 `:92`) ; l'outil 6d définit les strates servies par n ≥ 100 (`ADR-U4b…md:1629-1631`) et la ligne Sidecar 6 inscrit « H-2 : s0 n 170 servie » (`SIDECAR…md:40`).
4. Validité : le quantile conforme est `q̂ = s₍ₚ₎`, p = ⌈(n+1)(1−α)⌉, défini dès que α ≥ 1/(n+1) (Angelopoulos et Bates, arXiv:2107.07511v6, p.51, et théorème D.1 p.50, [lu] par la fiche committée `docs/biblio/ukemi-modeL/L-lecture-angelopoulos-bates-2021-gentle-intro.md:161,163-164`, commit `1bb9f6e` ; le rédacteur n'a pas relu le PDF, niveau pour lui : fiche de première main en dépôt). Ici 0,01 ≥ 1/171 et p = n = 170 ; sous échangeabilité dans la strate, P(s_test ≤ s₍₁₇₀₎) ≥ 170/171 ≈ 0,99415 ≥ 0,99 (identité de la p.51, fiche `:163` ; les ex æquo ne font qu'élargir l'inégalité). nMin = 100 est tenu (Dunn 2022 Thm 11, `ADR-U4b…md:17`). La borne haute `≤ 1 − α + 1/(n+1)` n'est pas revendiquée (scores à atomes, fiche `:165-166` ; déjà écrit `ADR-U4b…md:182`).

**Option B (non recommandée).** Lire H-2bis comme une condition de service : aucune strate committée, registre vide maintenu, aucune région calibrée servie ; -2b se réduit à l'atterrissage des fixtures et le tuyau « région servie » reste `upcoming` jusqu'à un épisode à n ≥ 199 par strate. Défauts : contredit la chaîne de plans (point 3) et l'application déjà faite de la clause `:359` (strates servies à n ≥ 100) ; durcit le prereg après la donnée, ce que le ruling Q-1 (a) a refusé pour un cas voisin (`ADR-U4b…md:1632-1637`).

**Ce que D1 ne fait pas.** Aucun q̂ poolé servi ; aucune strate sous nMin committée ; aucune modification des 9 fichiers gelés ni du prereg (A-6, régime B, blobs de tête).

### D2 : texte servi de la classe et de la région (option a)
**Décision proposée.** À l'état committé, la description servie est `describeGate(true)`, **octet pour octet** le texte fixé par HARNESS-DESC-1 D-HD-1 (sha256 `5574450432…aed77`, 3 193 caractères, remesuré §1.2) ; `honestyText` rend `LIQ_COMMITTED_SENTENCE` pour tout appel de la classe (`gate.ts:667-668`, clé de niveau registre, delta D-3). La région reste nommée « upper bound », jamais « interval » (`gate.ts:140-142`).

**Divulgation de H-2bis (« rapporté tel quel »).** Elle passe :
1. par le fil, à chaque appel d'une strate committée : `verdict.qhat` = le maximum de s0 et `verdict.n_calib = 170`, aussi restitués dans `content` par la ligne factuelle `gateVerdictSummary` (`gate.ts:684-693`) ; p = n se déduit de n et α affichés ;
2. par le rapport pré-enregistré 6d (bloc `h2bis`, §1.3) ;
3. par `/ukemi/course` (copie hachée du rapport, `apps/site/data/ukemi-course.json`, qui contient déjà le bloc `h2bis`) : son rendu relève de l'item COURSE-SERVED-FACTS-1 (D5).
L'item 11 du G0 (`G0-lot-u4b-2.md:199`) est ainsi clos pour s0 : le texte de la classe est sans strate par conception (delta D-3 : `honestyText` n'a pas ŷ) ; H-3 s0 vaut OUI, aucune mesure chiffrée n'est due sur le texte.

**Déviation déclarée D-2b-1 (à adjuger au checkpoint-1).** Le G0 plié prévoyait un texte servi PAR STRATE portant « q̂ = max rapporté tel quel » pour 100 ≤ n < 199, « pinné après la course, par strate, en -2b » (note `G0-lot-u4b-2.md:75` ; delta D-9 ; item 11 `:199`). Ce G0 retient à la place un texte de classe sans strate et une divulgation par le fil, le rapport 6d et `/ukemi/course`. Motif : deux corrections acceptées du checkpoint-1 delta se contredisent sur ce point, D-9 (texte par strate) et D-3 (texte keyé au niveau registre, `honestyText(taskClass, predictorId, isByo)` sans ŷ, `gate.ts:653`) ; les réconcilier exigerait de changer la signature de `honestyText` (option (a) de Q-NEW-3 déjà rejetée, `G0-lot-u4b-2.md:228`) ou d'ajouter à la description une phrase sans strate (option D2-b). La tranche liq attendue par le fil-piège du site (`test/site-ukemi.test.ts:615-617`) et composée par `sync-ukemi-served.mjs` est exactement la clause committée actuelle, ce qui renforce l'option a. `error_origin` proposé : plan (G0 plié ×2, deux corrections delta non réconciliées).

**Strates 1 à 3.** `under_calib` conservé : aucune entrée committée, `lookupCommittedCalibration` rend `undefined`, verdict `under_calib`, `n_calib = 0`, région `set` vide (`gate.ts:608-615`). Les comptes mesurés (21, 10, 4) sont publiés par le rapport et `/ukemi/course`, pas par le fil. Le libellé vitrine « the count is published » (`ukemi-copy.ts:150-151`) doit dire où (item UKEMI-SITE-SWITCH-1).

**Option b (non recommandée).** Ajouter une phrase « maximum de strate » aux deux porteurs committés. Coût : supersède l'identité d'octets de D-HD-1, casse la correspondance « exactement une clause » de `scripts/sync-ukemi-served.mjs` et la clause attendue par le fil-piège du site (`test/site-ukemi.test.ts:615-617`) tant qu'ils ne sont pas co-édités, impose de re-pinner les littéraux de la CA et la parité `ukemi-copy.ts`. Gain : une phrase qui répète ce que le fil porte déjà.

### D3 : `fleet.ts`, statut et câblage ; ce qui reste à U-6
**Ce que -2b autorise, et seulement à W (D8).**
- Ukemi reste `built` (décisions 51 et 123 : jamais `upcoming`) ; ensemble gelé du registre inchangé (`test/ci-gates.test.ts:804`).
- `wiring` gagne une seconde jambe servie, une ligne de test par jambe (ADR-M018 D2) :
  - `served_by` (métadonnée non rendue) : « MCP cascade → gate (cascade-liquidable-24h; abstains under_calib by construction) + MCP gate / POST /gate (liquidation-eligible-coverage: upper bound [0, yhat + qhat_k] on the committed stratum; the other strata under_calib) » ;
  - `integration_test` : `["probe_harness_records_real_decision", "u4b_gate_serves_region_from_real_artifact"]` ;
  - `note` (rendue, sans chiffre), proposition écrite sur l'entrée actuelle (`fleet.ts:169-190`, note `:188`) : « feeds the served gate through the cascade tool, a transitional tool, to be replaced, which abstains by construction, and serves an upper bound on the liquidable amount for the committed stratum of its liquidation class, calibrated on one recorded episode, while the other strata abstain; both legs replayed by integration tests ». Texte final au régime vitrine (décisions 146, 159, 180, 182) ; s'il reprend une clause servie, il est lié à la description servie par `registry_notes_track_served_descriptions` (`test/site-build-fleet.test.ts:644`), comme la clause « a transitional tool, to be replaced ». Vocabulaire vérifié : aucune règle de la portée `site` de `vocab-banned.json` ne vise « calibrated » (seuls des commentaires de la portée `harness` le mentionnent).
- La note ne sous-entend aucun producteur servi de ŷ : `fromRealizedBook` reste U-5 (moitié consommatrice, delta D-8).
- Les identifiants de test nommés vivent dans le dépôt de gouvernance : le miroir public n'exporte aucun test racine (`F:/monark-public-mirror/test/` absent, lecture seule ; « lives at the repo ROOT (not whitelisted, so never exported) », `scripts/export-public.mjs:134-136`) et `gate-liq-artifact.test.ts` est exclu (`scripts/export-exclude-tests.json:9`) ; la vérification d'existence des identifiants (`test/ci-gates.test.ts:925-935`, racines `:783`) ne tourne donc que là où les fichiers existent. Précédent : `probe_harness_records_real_decision`, déjà nommé, est un test racine (`test/h5-e2e-probe.test.ts:102`). Pas de piège pour la CI publique.

**Ce qui reste à U-6 (non autorisé par -2b).** Le témoin attesté du book servi sous `/ukemi/` (ADR-M020 D1 (c)), son test réservé `sentinel2_windows_identical_to_pull` (ADR-M020 `:31`), la mise à jour finale de `wiring` qui « rend (c) réellement built » (`:45`, `:49`, `:59`), l'affirmation « Ukemi réellement built » de la feuille de route (`docs/CHANTIERS.md:159`), CARTO-T1C-4.

**CA-11 (built ⇔ chemin servi + test d'intégration non-LLM).** La seconde jambe n'est déclarée qu'avec (i) le chemin servi prouvé en ligne par la CA basculée verte et committée (D4) et (ii) `u4b_gate_serves_region_from_real_artifact` vert sur la fixture fraîche (D7). Garde par test (N-10, item FLEET-UKEMI-CA-BIND-1, ajouté dans -2b) : `fleet_ukemi_liq_leg_matches_deploy_ca` lit `docs/deploy-CA-harness.json` ; si l'entrée Ukemi déclare le test de la jambe liq, la CA committée doit porter `gate_liq_call` vert avec un détail `verdict_reason=covered` ; mutant « jambe déclarée alors que la CA dit `under_calib` » rouge. Précédent : `test/bell-served.test.ts:49`.

### D4 : redéploiement du harness, CA basculée, version
**Redéploiement.** À W (D8), depuis le SHA de fusion préparé en staging, par la procédure `docs/RUNBOOK-harness.md` (§1 `git archive` des chemins de service ; mise à jour par `/opt/monark-harness-redeploy.sh`, section « Operations » ; §6 CA) ; décision 137 couvre l'acte, investisseur informé avant (pratique `docs/CHANTIERS.md:851`).

**CA basculée (`scripts/verify-harness.mjs`, dans -2b).** Treize contrôles au lieu de douze :
- `gate_liq_call` (strate committée) : corps actuel (`:56-59`, ŷ = 5000, donc s0) ; exige HTTP 200, `structuredContent.verdict.reason === "covered"`, `verdict.region.kind === "interval"`, `lo === 0`, `hi === ŷ + verdict.qhat`, `verdict.qhat > 0`, `verdict.n_calib === 170`, `verdict.calib_digest ===` C5 de s0, `content` portant `LIQ_COMMITTED_SENTENCE` et non `LIQ_EMPTY_REGISTRY_SENTENCE`. La raison de haut niveau n'est PAS contrôlée comme `covered` : sous les paramètres de la CA (`tauInterval 1`, horloge ouverte) L3 rend `defer` / `interval_too_wide` (§1.2) ; elle est consignée dans le détail. Le prédicat actuel lit `structuredContent.reason` (`verify-harness.mjs:237`) : il doit lire `verdict.reason`.
- `gate_liq_uncommitted_call` (nouveau) : ŷ = 200000000000 (première coupe servie, `ukemi-strata.ts:25`, donc s1) ; exige 200, `verdict.reason === "under_calib"`, `verdict.n_calib === 0`, action `abstain`.
- `mcp_gate_description_liq` : exige la clause committée entière (« the served region is » suivi de UPPER, REQ, H-3, COND) et l'absence de EMPTY ; ferme R-1b-2 (UPPER exigé) et suit l'observation « étendre la CA à COND » (`ADR-U4b…md:1294`).
- Littéraux fixés par valeur dans le script sans dépendance : les phrases, le C5 de s0 (hexadécimal), n = 170, la coupe s1 ; aucun montant (q̂ est lu dans le verdict) ; égalité avec `gate.ts`, `calibration.ts` et `ukemi-strata.ts` assertée par `verify_harness_liq_literals_equal_served_constants` étendu (`test/verify-harness-liq.test.ts:28`).
- Code de sortie : `process.exitCode = 1` puis retour aux deux sites (`verify-harness.mjs:313,322`) (O-1b-G2-1) ; le test (3) passe à `r.code === 1` ; R-HD-2 est retiré.
- Contrôle négatif re-dérivé (extension §4 (c)), quatre vecteurs à listes rouges FERMÉES : (α-2b) surface d'avant bascule, description `describeGate(false)` et réponse `under_calib` avec EMPTY, ce que le serveur en ligne rend avant W, rouges attendus {`gate_liq_call`, `mcp_gate_description_liq`} ; (β-2b) description committée privée de UPPER, rouge {`mcp_gate_description_liq`} ; (γ-2b) réponse `covered` à région symétrique (`lo = ŷ − q̂`) ou à digest étranger, rouge {`gate_liq_call`} ; (δ-2b) réponse de strate non committée ré-étiquetée `covered`, rouge {`gate_liq_uncommitted_call`}. Les six mutants de prédicats (G2-5a/b/c et trois auto-déclarés, `ADR-U4b…md:1231-1238`) sont rejoués contre les prédicats basculés, plus un mutant par prédicat du nouveau contrôle.
- Consommateurs de la CA dans le dépôt : la table corps → contrôle de `test/harness-served.test.ts:132-135` garde le nom `gate_liq_call` (conservé pour la strate committée) ; le nouveau contrôle n'y entre pas (aucun corps synchronisé) ; `deploy_check.count` passe de 12 à 13 à la re-synchronisation (D8 étape 5).
- Documentation (hors R-25) : `docs/RUNBOOK-harness.md` §6 (`:157-175`, qui décrit aujourd'hui les deux contrôles liq à l'état vide) réécrit pour les treize contrôles à l'état committé, dans le même lot.

**Version et surfaces (N-5).** Aucun bump de `HARNESS_VERSION` dans -2b (décision 123 ; G0 `:112`). `skills/monark/SKILL.md`, fiche MCP Registry et bump éventuel : lot MCP (décision 163), item MCP-2B-SURFACES-1 ; `SKILL.md` reste vrai après -2b (§1.9). Dans -2b : `README.md` (Ukemi, deux jambes, `:35,104-106`) et `apps/harness/README.md` (CARTO-T1C-3 : entrée `attested`, lignes stable-run et liq). L'openapi suit la description sans édition manuelle (`openapi.ts:73`).

**Trace h5 (re-pin).** Seul le `response_sha256` de l'étape `tools/list` devrait changer. Prédiction falsifiable pour le G1 : puisque `describeGate(true)` égale octet pour octet la description d'avant HARNESS-DESC-1 et qu'aucun autre octet servi n'a bougé (§1.2), ce champ doit revenir à sa valeur d'avant HARNESS-DESC-1 (préfixe `b88cd066`, `test/h5-e2e-probe.test.ts:70-71`) et, sans IF-1, la trace entière à l'épingle antérieure `4ad9b340caa72463d3ff1e96880fa0b49e29e841c8e31e183f26b0fc85aa79e1` (`:72`) ; avec IF-1 (N-8 : note de `test/h5-trace-builder.ts:253` reformulée « previously Shōgen-verified », 4ᵉ exemption retirée de `vocab-banned.json` et de la table `CLOSED`, `docs/adr/ADR-U5a-producteur-ukemi-predict.md:156`), la trace diffère des deux et la valeur se mesure. Tout autre écart est mesuré et expliqué au G1.

### D5 : vitrine `/ukemi` : ce qui devient affichable ; amendement du contrôle « sans chiffre » en item
- **Dans -2b** : aucune modification de `scripts/assert-fleet-html.mjs` (le lot CodeQL le réécrit) ni de `apps/site` hors `fleet.ts` à W (D3).
- **Item UKEMI-SITE-SWITCH-1** (régime vitrine, décisions 146, 159, 183 ; déclencheur : fusion CodeQL, SITE-5J-INT étant fusionné ; **précondition de W**, préparé et gelé avant W, appliqué à W étape 5) :
  1. le porteur de l'état servi de `/ukemi` suit l'état synchronisé (`ukemi-served.json`) : vide, phrase EMPTY ; committé, reformulation sans chiffre de l'état committé, ou clause committée si UKEMI-DIGIT-GATE-1 l'autorise (`ukemi-page.tsx:108-109`, `ukemi-copy.ts:52-53,108-110`) ;
  2. la règle de présence de `assertUkemiBody` (`assert-fleet-html.mjs:207-208`) devient liée à cet état, sur la version réécrite par CodeQL ;
  3. `scripts/sync-harness-served.mjs` devient dépendant de l'état (classe liq `none` ou `committed` avec les clauses servies correspondantes, `:72` ; contrôle de l'appel liq, `:151`) ;
  4. les fils-pièges du tronc sont re-cadrés, jamais supprimés : `test/site-ukemi.test.ts:614` (assertion `committed === false`) et, par la re-synchronisation, `test/harness-served.test.ts:79,119` ;
  5. libellés : « the count is published » (`ukemi-copy.ts:150-151`) et « with the count » (`:124`, `:181`) disent que le fil sert `n_calib = 0` sur une strate non committée et que les comptes mesurés sont sur `/ukemi/course` (D2).
- **Item UKEMI-DIGIT-GATE-1** (déclencheur : fusion CodeQL ; acte investisseur car texte public, décisions 101 et 166) : décider quels nombres `/ukemi` peut rendre (n par strate, q̂₀, digest C5) et amender la règle de jetons numériques (`assert-fleet-html.mjs:202-204`) ; la copie l'anticipe déjà (`ukemi-copy.ts:23` : UPPER et H-3 « ride live at U-4b-2b »). N'est pas une précondition de W si UKEMI-SITE-SWITCH-1 retient une reformulation sans chiffre.
- **Affichable après W** : sur `/ukemi/course` (page à chiffres, hors `assertUkemiBody`) : n par strate (déjà rendu), q̂₀ avec son statut « maximum de strate » (bloc `h2bis` déjà présent dans la copie hachée), C5 de s0 lu d'une synchronisation datée du verdict servi (item COURSE-SERVED-FACTS-1, jamais un littéral tapé) ; sur `/ukemi` : l'état servi sans chiffre jusqu'à UKEMI-DIGIT-GATE-1.
- Recommandation adressée à UKEMI-SITE-SWITCH-1 (non contraignante ici) : lier l'état rendu à l'état servi DATÉ (`ukemi-served.json`, `harness-served.json`) et comparer le registre du dépôt à l'état servi dans une vérification distincte, bornée à la fenêtre W, pour qu'une future fusion de code du harness ne rende pas le tronc rouge avant son déploiement (motif de la liste fermée N-14, D8).

### D6 : étape 7 (rapprochement Chainstack) : item hors lot
Hors -2b (décision 129 ; RUNBOOK `:527`) ; -2b ne dépense aucune unité RU (hors ligne, puis redéploiement du harness). Item RECONCILE-UKEMI-T1-1, propriétaire orchestrateur, déclencheur : colonne `ethereum-mainnet` des jours des dépenses Ukemi (temps 2 et prober du 2026-09-23) visible et stable au tableau de bord au moins 24 h après la dernière dépense (fin du prober, passe 4) ; lectures hors des créneaux interdits, double lecture de stabilité, minorant Narabi soustrait ; ruling R-O préalable (RUNBOOK `:531`) ; attention à la contamination du total du compte par Bell seq 2 (décision 121), la ligne `ethereum-mainnet` fait foi. Effet : statut interne de `@monark/rpc-guard` et toute NOUVELLE dépense Chainstack seulement.

### D7 : atterrissage des fixtures fraîches et test de recomposition
- Committés sous `apps/sentinel/test/fixtures/ukemi/u4b/` : `U4b-book-23414968.json` (`4b601785…8341`), `U4b-oracle-path-weth-2025-09-22.jsonl` (`cc7f5cd9…0971`), `U4b-scores-weth-2025-09-22.jsonl` (`fd6fab7e…74a4`), `U3-realized-weth-2025-09-22.jsonl` (`e2d6c0e4…1837`, copie des étiquettes fraîches, N-6), et `PROVENANCE-u4b-weth-2025-09-22.md` (sha256 de chaque fichier, renvois SIDECAR `:40`, commandes 6a-6c, arbres d'exécution ; aucun prix ni ancre recopiés).
- Les quatre fichiers de données et la provenance vont dans `scripts/export-exclude-data.json` (mêmes motifs que e2, décision 111) ; les tests qui les lisent vont dans `scripts/export-exclude-tests.json`.
- Effet de bord déclaré : `git archive` expédie `apps/` entier au serveur du harness (RUNBOOK-harness §1) ; l'arbre déployé grandit d'environ 7,3 Mo (book frais), comme pour le book e2 déjà expédié ; aucun effet d'exécution.
- Test `u4b_fresh_scores_recompute_from_committed_inputs` (sentinelle, exclu de l'export) : `computeScoresU4b` sur les trois entrées committées, sérialisé comme `u4b-reduce.mjs:77-85`, égale la fixture de scores octet pour octet. Il clôt la précondition [C-3] du G0 (`:15`, item 4 `:192`) et compose, en dépôt, la chaîne course → scores → registre → verdict servi (CA-11 durci).
- Décision 111 (« retour au miroir quand U-4b servira », `docs/CHANTIERS.md:471`) : déclenchée à W ; item EXPORT-U4B-111-1, liste fermée des fichiers et des tests qui reviennent au miroir, contrôle anti-close, tranchée par l'orchestrateur. Fait déclaré : `calibration.ts` est exporté (`scripts/export-public.mjs:45` ; présent dans le miroir local `F:/monark-public-mirror/apps/harness/src/calibration.ts`, lecture seule), donc les 170 scores de s0 deviennent publics à la prochaine release, ce qui est conforme à l'intention de 111.

### D8 : fenêtre de bascule W (ordre, retour arrière)
**Préconditions** : gel de -2b après G1, G2 et checkpoint-2 ; CodeQL fusionné ; UKEMI-SITE-SWITCH-1 gelé ; investisseur informé du redéploiement (SITE-5J-INT est déjà fusionné, `26353e7`).
**Liste fermée des rouges par construction (N-14)**, valable pour les oracles du lot (G1, G2, checkpoint-2) et pour l'étape 2 ci-dessous, et pour eux seuls : `site_ukemi_served_state_bound_to_harness_registry` (`test/site-ukemi.test.ts:608`, échec attendu sur son message conçu `:614`) et `harness_served_data_matches_in_process_harness` (`test/harness-served.test.ts:76`, échecs attendus `:79` et `:119`). Ils rougissent parce que le registre du dépôt devance l'état servi synchronisé, ce qui est leur rôle ; la liste est re-mesurée au G1 et tout rouge hors liste est un défaut. Précédent de forme : oracle d'arbre « rouge par construction », oracle probant sur le produit de fusion (`ADR-U4b…md:2169-2170`).
**Séquence (orchestrateur seul, R-20)** :
1. Staging (`F:/Monark-wt-g7`, branche `lot/g7-staging`) posé sur la pointe de `lot/etude-suite` ; fusion `--no-ff` du gel -2b.
2. Oracle 7 portes sur le commit de fusion : tout vert hors la liste fermée ci-dessus ; tout autre rouge : STOP.
3. Redéploiement du harness depuis ce SHA nommé (RUNBOOK-harness §1 : `git archive` des chemins de service).
4. CA basculée : verte exigée (13/13, `tls.authorized`, sortie 0) ; `docs/deploy-CA-harness.json` régénéré. Rouge : retour arrière (re-déployer l'arbre `bb41b6d`, rejouer l'ancienne CA verte), STOP.
5. Re-synchronisation des deux fichiers d'état servi (`scripts/sync-ukemi-served.mjs`, `scripts/sync-harness-served.mjs` dans sa version dépendante de l'état) ; commit sur staging : CA, fichiers synchronisés et manifeste, UKEMI-SITE-SWITCH-1, câblage `fleet.ts` (D3), ligne JOURNAL.
6. Oracle 7 portes sur la tête de staging : TOUT vert, sans exception ni liste ; sinon retour arrière du harness et abandon du staging.
7. Avance rapide de `lot/etude-suite` sur la tête de staging ; build du site, 11 contrôles, téléversement ; validation visuelle investisseur ensuite (décision 183).
8. Amendement daté de l'ADR-U4b (tuyau `:26` passé `built` avec les preuves), CHANTIERS, memstack.
**Périmètre d'octets déclaré.** Le SHA déployé (étape 3) n'est pas le SHA final du G7 (étape 7, après la CA, les synchronisations et `fleet.ts`). `git archive` expédie `apps/` entier : `apps/site/**` diffère donc entre l'arbre déployé et le G7, sans effet d'exécution (le harness ne lit pas `apps/site`). L'invariant exigé est l'identité d'octets de la fermeture d'exécution du harness entre les deux SHA : `git diff --quiet <déployé> <G7> -- apps/harness packages schemas fixtures deploy scripts/verify-harness.mjs package.json package-lock.json`. Précédent : déploiement à `bb41b6d` puis CA committée à `fb6720b` (`docs/CHANTIERS.md:946`).
**Option W2 (rejetée)** : fusionner d'abord au tronc et déployer plus tard laisse soit le tronc rouge (fils-pièges), soit `/ukemi` faux entre les deux.

## 3. Tuyaux (ADR-M018 D3 ; règle de Branchement)

| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test non-LLM qui rejoue la composition | À la tête / après G1 / après W |
|---|---|---|---|---|---|
| course → scores | réduits frais + étiquettes fraîches committés (D7) | `computeScoresU4b` gelé → fixture de scores | `apps/sentinel/test/fixtures/ukemi/u4b/*weth-2025-09-22*` | `u4b_fresh_scores_recompute_from_committed_inputs` (nouveau) | absent / câblé (test) / câblé (test) |
| scores frais → registre | fixture de scores → `buildRegistryEntries` gelé → émetteur | entrée s0 de `COMMITTED_CALIBRATIONS` | constante de module, garde de digest à l'import | `u4b_committed_registry_equals_generator_output`, `u4b_registry_recomputes_from_fresh_scores_jsonl`, `u4b_calib_registry_digest_guard_per_stratum` | absent / câblé / câblé |
| borne haute servie | registre + `strateOf` serveur + `liqUpperBoundRegion` + α, nMin imposés | MCP `gate` et `POST /gate` → `[0, ŷ + q̂₀]` en s0, `under_calib` ailleurs | processus harness (un état par processus) | `u4b_gate_serves_region_from_real_artifact` (phase -2b, fixture fraîche, `run` et `handleJsonMirror`) | fixture (`under_calib` partout, e2) / câblé en processus / **servi** (CA 13/13) |
| description servie | registre → `describeGate(true)` | `tools/list`, `/openapi.json`, CA | constante de module | `hdesc_served_gate_description_is_the_committed_clause` (re-cadrage) | clause vide servie / clause committée en processus / servie |
| CA de déploiement | `scripts/verify-harness.mjs` contre le serveur en ligne | `docs/deploy-CA-harness.json`, `fleet_ukemi_liq_leg_matches_deploy_ca` | fichier committé daté | `verify_harness_ca_passes_on_the_in_process_harness`, `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (vecteurs re-dérivés) | état vide vert / basculée en processus / basculée verte en ligne |
| trace h5 | sonde du chemin MCP réel | `fixtures/h5-e2e-trace.json` | fichier épinglé | `probe_harness_records_real_decision` (re-pin) | `90a21adf…` / re-épinglée / idem |
| registre public | `fleet.ts`, entrée Ukemi, seconde jambe | `/fleet`, `/roadmap`, `assert-fleet-html` | module de données du site | `fleet_register_built_set_is_frozen`, `fleet_ukemi_liq_leg_matches_deploy_ca` (nouveau) | une jambe / inchangé / deux jambes |
| état servi → site (classe liq) | `/openapi.json` en ligne → `scripts/sync-ukemi-served.mjs` | `apps/site/data/ukemi-served.json` → `/ukemi/course` ; porteur `/ukemi` (UKEMI-SITE-SWITCH-1) | fichier haché du site (manifeste) | `site_ukemi_served_state_bound_to_harness_registry` (`test/site-ukemi.test.ts:608`) | câblé, état vide / rouge par construction (N-14) / câblé, état committé |
| état servi → site (harness) | corps servis en ligne liés à la CA → `scripts/sync-harness-served.mjs` | `apps/site/data/harness-served.json` → `/integrators`, `/console` | fichier haché du site | `harness_served_data_matches_in_process_harness`, `harness_served_data_matches_deploy_ca` (`test/harness-served.test.ts:76,125`) | câblé, état vide / rouge par construction (N-14) / câblé après re-synchronisation (outil rendu dépendant de l'état) |
| producteur réel de ŷ | `fromRealizedBook` (U-5a) | classe liq servie | U-5b | oracle d'égalité 565/565 (G0 U-5) | absent (hors lot) |
| témoin du book servi | `sentinel-2` | `/ukemi/` + `attest` | U-6 | `sentinel2_windows_identical_to_pull` (réservé) | absent (hors lot) |

## 4. Oracle
**Tests existants rejoués inchangés** : dans `apps/harness/test/gate-liq.test.ts`, `:116` (α et nMin 400), `:134` (class-lock BYO), `:144` (ŷ invalide 400), `:159` (aucune probabilité), `:184` (upper bound, jamais interval), `:201` et `:224` (classe B), `:244` (`attested` refusé), `:347`, `:367`, `:378` (deux états de la description) ; `apps/harness/test/gate.test.ts:833-834` (vocabulaire des deux états) ; `u4b_served_strata_cuts_and_boundaries` ; `u4b_served_strateof_matches_frozen_on_jsonl` (étendu aux lignes fraîches) ; `u4b_liq_upper_bound_region_helper` ; les tests e2 de `apps/sentinel/test/ukemi-u4b-scores.test.ts` et `u4b-hyp.test.ts` ; les autres tests de `test/site-ukemi.test.ts` et `test/harness-served.test.ts` (les deux fils-pièges de la liste N-14 mis à part) ; les balayages A-9 des surfaces servies (la clause committée est déjà balayée via `describeGate(true)`).
**Fils-pièges rouges par construction au commit du registre, re-cadrés, jamais supprimés** :
- `u4b_gate_liq_class_abstains_on_empty_registry` (`gate-liq.test.ts:101`) devient `u4b_gate_liq_serves_committed_stratum_and_abstains_elsewhere` (ŷ ∈ {0, 5000} : verdict `covered`, `lo 0`, `hi = ŷ + q̂₀` avec q̂₀ lu du registre ; ŷ ∈ s1..s3 : `under_calib`, `n_calib 0`) ;
- `u4b_liq_empty_registry_text_is_honest` (`:173`) devient `u4b_liq_committed_text_is_honest` (texte committé pour une clé client nue et pour `…/s1` : tue (h')) ;
- `hdesc_served_gate_description_is_the_empty_registry_clause` (`:313`) devient `hdesc_served_gate_description_is_the_committed_clause` (descripteur = `tools/list` = openapi = `describeGate(true)` ; EMPTY absent de toutes les feuilles : tue la classe R-HD-1) ;
- `u4b_gate_serves_region_from_real_artifact` (`gate-liq-artifact.test.ts:44`) passe en phase -2b : fixture fraîche (la fixture e2 lue à `:26` donnerait `covered` sur ses lignes s0), 205 lignes, non-vacuité ≥ 200 lignes et ≥ 150 valeurs distinctes de ŷ en s0, `run` et `handleJsonMirror`, et la clé serveur rendue observable (ŷ ∈ s0 avec clé client `…/s1` : `hi = ŷ + q̂₀` ; ŷ ∈ s1 avec clé client `…/s0` : `under_calib`) ;
- `verify_harness_ca_passes_on_the_in_process_harness` (`test/verify-harness-liq.test.ts:52`) et `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (`:132`) basculés ;
- `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:102`) re-épinglé.
**Tests nouveaux nommés** : `u4b_committed_registry_equals_generator_output` (2b-3) ; `u4b_calib_registry_digest_guard_per_stratum` (2b-1) ; `u4b_registry_recomputes_from_fresh_scores_jsonl` (test 11 du G0 sur le frais : n, p, `under_calib`, C5 par strate, `meta.cell_a.predictor_id === UKEMI_LIQ_PREDICTOR_BASE`, q̂₀ égal au maximum de strate lu, sans littéral de montant) ; `u4b_fresh_scores_recompute_from_committed_inputs` (D7) ; `fleet_ukemi_liq_leg_matches_deploy_ca` (D3).
**Mutants attendus (chacun rouge par son test nommé, restauration octet pour octet)** : (b) clé prise côté appelant, tué par 2b-4 ; (e) garde de digest retirée, par le test de garde ; (f1) score altéré et digest recollé, par 2b-3 ; (f2) strate sous nMin committée, par 2b-3 ; (l) base différente du littéral frais, par le test 11 frais et 2b-4 ; (n') région symétrique dans `liqEligibleVerdict` en contournant le helper, par 2b-4 (`lo === 0`) ; (h') honnêteté keyée sur la clé client, par `u4b_liq_committed_text_is_honest` ; (R-HD-1) description codée `describeGate(false)` en dur, par le test hdesc re-cadré ; (pool) scores de la cellule poolée servis à la place de s0, par 2b-3 et par le digest de 2b-4 ; (émetteur) zéros filtrés, par 2b-3 ; (fixture) une ligne de la fixture fraîche altérée, par le test de recomposition ; (fleet) jambe déclarée contre une CA `under_calib`, par le test de liaison ; (CA) les six mutants de prédicats re-ciblés et un par prédicat de `gate_liq_uncommitted_call` ; (p) garde q̂ = 0 retirée, toujours tué par le helper.
**Rouges par construction (N-14)** : pendant les oracles du lot et l'étape 2 de W seulement, exactement `site_ukemi_served_state_bound_to_harness_registry` et `harness_served_data_matches_in_process_harness`, chacun sur son message conçu (D8) ; le G1 re-mesure cette liste, tout autre rouge est un défaut ; l'oracle probant (W étape 6) n'en admet aucun.
**Compte attendu** : N + 5 sur l'arbre fusionné (cinq tests nouveaux ; les re-cadrages renomment sans ajouter) ; N remesuré juste avant la fusion (le lot CodeQL reste en amont ; SITE-5J-INT a déjà changé N).
**Contrôle indépendant** : le checkpoint-2 rejoue le recalcul C5 (script Python du §11 ou équivalent propre), le rejeu du scoreur et la CA en processus ; après W, la CA en ligne est la preuve datée.

## 5. Anti-close (aucun chiffre de marché dans les tests)
- Les tests ne tapent aucun montant ni prix : q̂, scores et ŷ sont lus de la fixture committée ou du registre par import ; les épingles sont des sha256 (C5, fichiers), des comptes (n, p), des indices de strate, des identifiants de prédicteur et des constantes de code (coupes). Le précédent e2 qui tape des q̂ (`apps/sentinel/test/ukemi-u4b-scores.test.ts:252-256`) n'est pas étendu à l'épisode frais.
- La CA fixe par valeur le C5 (hexadécimal) et n, lit q̂ dans le verdict ; ses détails ne portent aucun montant.
- Les fixtures sont des données d'état on-chain public (exemption de la décision 110) ; l'oracle-path et l'ancre sont des prix : fixtures exclues du miroir (décision 111) et jamais recopiées dans un test, un document ou la provenance (seuls les sha256 y figurent).
- Le verdict servi porte q̂ par contrat gelé (`packages/contracts/src/types.ts:218`) : c'est une marge de calibration, pas un prix.

## 6. MAST (risque résiduel)

| Mode | Où il menace | Contre-mesure |
|---|---|---|
| Spécification ambiguë (FM-1.1) | lecture de H-2bis ; « -2a » contre « -2b » (passation) | D1 tranché avec les deux options (N-1) ; erratum §1.5 |
| Condition de fin ignorée (FM-1.5) | déclarer la jambe liq avant la preuve en ligne | D3 (déclaration à W seulement) + `fleet_ukemi_liq_leg_matches_deploy_ca` |
| Terminaison prématurée | fusion au tronc sans bascule, `/ukemi` faux | D8 (W1), UKEMI-SITE-SWITCH-1 précondition |
| Désalignement inter-lots | SITE-5J-INT (fusionné pendant la rédaction) et -2b sur `fleet.ts`, `ukemi-copy.ts`, outils de synchronisation, fils-pièges ; CodeQL sur `assert-fleet-html.mjs` | références site re-mesurées à `26353e7` ; préconditions de W ; liste fermée N-14 |
| Vérification incorrecte par tolérance | une liste de rouges « attendus » qui masquerait un vrai défaut | liste FERMÉE de deux noms, message conçu exigé, re-mesure au G1, oracle probant sans exception (D8 étape 6) |
| Vérification incorrecte (FM-3.3) | CA qui lit la raison de haut niveau (`defer`) au lieu de `verdict.reason` | D4, prédicats sur `verdict.*`, vecteurs re-dérivés |
| Vérification incomplète (FM-3.2) | registre recopié à la main ; fixture non composée | émetteur + 2b-3 ; test de recomposition D7 |
| Dérive de forme | région symétrique réintroduite | (n') tué par 2b-4, (n) par le helper |
| Dérive de vocabulaire | « interval », probabilité, noms de fournisseurs, « guarantee » sur les textes servis nouveaux (note `fleet.ts`, README) | `gate:vocab`, `lang:gate`, A-9 sur les surfaces servies |
| Rayon d'impact | garde d'import de `calibration.ts` exécutée par le job Narabi | observation CALIB-IMPORT-BLAST-1 ; tests sentinelle rouges avant tout redéploiement |
| Perte d'état au déploiement | CA rouge après bascule | retour arrière `bb41b6d` (D8 étape 4) |

## 7. Items formés (propriétaire : orchestrateur sauf mention ; zéro « dû » nu)

| Item | Contenu | Déclencheur |
|---|---|---|
| UKEMI-SITE-SWITCH-1 | état servi de `/ukemi` lié à l'état synchronisé ; règle de présence de `assertUkemiBody` rendue dépendante de l'état ; `sync-harness-served.mjs` rendu dépendant de l'état ; fils-pièges re-cadrés ; libellés des comptes (D5) | fusion CodeQL (SITE-5J-INT fusionné à `26353e7`) ; précondition de W |
| UKEMI-DIGIT-GATE-1 | nombres rendus sur `/ukemi` (n, q̂₀, C5) et amendement de la règle de jetons numériques | fusion CodeQL ; acte investisseur (texte public) |
| COURSE-SERVED-FACTS-1 | `/ukemi/course` rend n, q̂₀ et son statut `h2bis`, le C5 servi lu d'une synchronisation datée | W |
| MCP-2B-SURFACES-1 | `SKILL.md` (classe liq), fiche MCP Registry, bump éventuel au commit du tag, extension de HARNESS-DESC-KITCHEN-1 (`docs/G1-lot-site-5j-int.md:223`) au libellé « H-3 » désormais servi dans la description | G0 du lot MCP (décision 163) |
| RECONCILE-UKEMI-T1-1 | étape 7 (D6) | colonne `ethereum-mainnet` stable ≥ 24 h après la dernière dépense Ukemi ; ruling R-O |
| EXPORT-U4B-111-1 | retour au miroir (décision 111) : liste fermée des fichiers et des tests, contrôle anti-close | W |
| FLEET-UKEMI-CA-BIND-1 | test de liaison registre public ↔ CA (D3) | réalisé dans -2b (N-10) ; sinon, prochain lot qui touche `fleet.ts` |
| CALIB-IMPORT-BLAST-1 | observation : le job Narabi exécute les gardes d'import de `calibration.ts` | prochain redéploiement de la sentinelle (pli NARABI-OPS-1d §11-1) : vérifier l'import avant bascule |
| U-5b (existant) | producteur `ukemi-predict`, retrait de `cascade` | « -2b fusionné » (RUNBOOK `:566`) |
| U-6 (existant) | témoin du book servi | go conditionnel satisfait (`:359`, décision 137) ; hors -2b |
| Clôtures par -2b | G0 items 4 (fixtures, D7), 5 (échelle, §1.3), 11 (texte par strate, D2), 12 (surfaces, scindé D4) ; G7 -2a §5 (placeholder, (n'), (h')) ; HARNESS-DESC-1 §4 (a)-(d), extension (c), R-1b-2, O-1b-G2-1 ; IF-1 ; CARTO-T1C-3 | au G7 de -2b |

## 8. R-25 estimé (pathspec de `.github/workflows/ci.yml:65` ; fixtures `json`/`jsonl` exclues, `.md` hors `docs/` compté)

| Poste | Lignes (ajouts et suppressions) |
|---|---|
| `calibration.ts` (170 scores à 8 par ligne, garde, provenance, re-pin) | ≈ 55 |
| émetteur `scripts/emit-u4b-calibration.mjs` | ≈ 60 |
| tests nouveaux (5) | ≈ 180 |
| tests re-cadrés (gate-liq, artefact, CA, h5) | ≈ 310 |
| `scripts/verify-harness.mjs` (CA basculée, code de sortie) | ≈ 45 |
| `fleet.ts`, `README.md`, `apps/harness/README.md` | ≈ 40 |
| `PROVENANCE-u4b-weth-2025-09-22.md` | ≈ 70 |
| exclusions d'export, IF-1 (`vocab-banned.json`, note h5) | ≈ 15 |
| **Total** | **≈ 700 à 850** |

Sous la règle STOP A-5 (1 150) et `VIBEGATES_PR_LIMIT` (1 205). L'écart avec l'estimation du G0 (300-410, `G0-lot-u4b-2.md:150`) vient des items arrivés à déclencheur depuis (HARNESS-DESC-1, CA, IF-1, CARTO-T1C-3), du test de recomposition et de la provenance. Couture pré-déclarée si le G1 dépasse 1 150 : -2b-i (fixtures, émetteur, registre, tests du registre) puis -2b-ii (CA, `fleet.ts`, README, h5, IF-1), fusionnés first-parent dans la même fenêtre W. UKEMI-SITE-SWITCH-1 est un commit de régime vitrine distinct.

## 9. Rejets
- Garder `assertUkemiBody` vert en rendant la phrase EMPTY comme état passé sur `/ukemi` : contournement de l'intention du contrôle (P5).
- Committer s1-s3 pour servir leurs comptes : contredit le checkpoint-1 C-4.
- Servir le q̂ poolé : G0-lot-u4b C-10.
- Re-pinner 2b-4 sur e2 : jeu de conception, jamais servi (ADR-U4b D1, `:9`).
- Bump de `HARNESS_VERSION` dans -2b : décision 123.
- Ajouter une phrase à la clause committée sans co-éditer l'outil de synchronisation : rompt « exactement une clause » (option D2-b).
- Lecture B de H-2bis : durcissement postérieur à la donnée.
- Déployer avant l'oracle : W1 place l'oracle avant et après le déploiement.

## 10. Ce que le rédacteur n'a pas pu confirmer (et où il a cherché)
- État servi en ligne à l'instant : non lu (aucun appel réseau autorisé). Dernière preuve committée : CA du 2026-09-23T00:54:20Z ; corroboration de second rang : fichiers d'état servi synchronisés par un autre agent et committés au tronc (§1.5).
- Contenu de la fiche MCP Registry (nomme-t-elle des classes ?) : non lu, même motif ; renvoyé à MCP-2B-SURFACES-1.
- Forme finale de `scripts/assert-fleet-html.mjs` après CodeQL : seul le diffstat de `lot/codeql-alerts-1` a été lu ; UKEMI-SITE-SWITCH-1 s'écrira sur la version fusionnée.
- SITE-5J-INT a fusionné pendant la rédaction (`26353e7`) : ses couplages ont été relus au tronc et les références du site re-mesurées ; si la tête avance encore avant le checkpoint-1, l'orchestrateur re-mesure les lignes `apps/site/**`, `test/site-*.test.ts` et `test/harness-served.test.ts` citées ici.
- Liste exacte des rouges par construction (N-14) : établie par lecture des tests, pas par exécution (aucun oracle lancé par le rédacteur) ; le G1 la mesure.
- Épingles de `apps/harness/test/openapi.test.ts` et `cascade.test.ts` : aucune empreinte hexadécimale de 64 caractères n'y figure (`grep -n '[0-9a-f]\{64\}'` : 0) ; leur dépendance à la description servie (égalité à la description en processus plutôt qu'épingle) n'a pas été relue ligne à ligne : à mesurer au G1.
- Valeurs exactes du re-pin h5 : prédiction seulement (D4).
- PDF d'Angelopoulos et Bates : non relu par le rédacteur ; fiche en dépôt (`1bb9f6e`) de première main.
- Sémantique exacte de « colonne ≥ 24 h » du tableau de bord : texte du RUNBOOK `:529` seul.
- Advisor : première consultation indisponible (timeout) ; seconde consultation reçue et repliée (provenance, en tête) ; ses points sont des avis, chaque décision repose sur les pièces citées.

## 11. Mesures reproductibles (sous `F:\tmp\ukemi-2b\`, clés payantes retirées par `env -u`, TEMP sur `F:`)

| Artefact | sha256 | Commande |
|---|---|---|
| `recompute_c5.py` | `ea0a456b7c6ea65df7275587c35ade5570ffa18c8a2486a477e45f426044d386` | `python recompute_c5.py F:/course-ukemi/reduce/U4b-scores-weth-2025-09-22.jsonl` |
| `recompute_c5.out` | `a2657681666654644e28d5e9a3bea08d691b2c835e20dbd646b306c358e64896` | sortie de la ligne précédente |
| `generator-replay.out` | LF `742418fea2c08dce327ad75162aeeecd6bbf67def469988111d79728fae9d2b0` | `node scripts/record-u4b-calib.mjs --scores F:/course-ukemi/reduce/U4b-scores-weth-2025-09-22.jsonl` (depuis `F:/Monark`) ; comparé au journal `registry-A` privé de sa dernière ligne |
| `replay_scores.mjs` | `84cde2e2379a51b28f8277f8b6d3dba718056d3bff67f2766a0f7778d04bc7c8` | `node replay_scores.mjs F:/course-ukemi/reduce F:/course-ukemi/label/out/U3-realized.jsonl weth-2025-09-22` |
| `replay_scores.out` | `c1f98ba3d1118bf8fc960fed5b836f91aca425be5b68d6609ab77bb54d8cf1cc` | sortie de la ligne précédente (`byte_identical: true`) |
| `desc_sha.mjs` | `bfa381200dff01b6e82fb287399b1f9f75d254e02908d7752c6f77fe80059d55` | `node F:/tmp/ukemi-2b/desc_sha.mjs` (depuis `F:/Monark`, import des modules réels, lecture seule) |
| `desc_sha.out` | `62e4d152e942f7cfdf37052841455e1ab6f10da967c7818beec404ac96ac76e0` | sortie de la ligne précédente |
| `SHA256SUMS` | liste des empreintes ci-dessus | `sha256sum -c SHA256SUMS` dans `F:\tmp\ukemi-2b\` |

Autres commandes : `git -C F:/Monark diff --name-only e1258839 6ce34d5` ; `git -C F:/Monark diff --stat 6ce34d5 26353e7 -- apps/harness packages scripts/assert-fleet-html.mjs scripts/verify-harness.mjs test/ci-gates.test.ts test/h5-e2e-probe.test.ts` (vide) ; `ls F:/monark-public-mirror` (aucun dossier `test/`) ; `git -C F:/Monark diff 906064b 6ce34d5 -- apps/harness/src/tools/gate.ts` ; `git -C F:/Monark diff --stat HEAD...lot/codeql-alerts-1 -- scripts/assert-fleet-html.mjs` ; `wc -l` du ledger Chainstack ; `sha256sum` des artefacts de course.

## 12. Clôture zéro dette
Chaque point ouvert de ce G0 est soit tranché ici (D1-D8), soit un point à trancher nommé (§0), soit un item formé avec déclencheur (§7). Aucun procurement documentaire n'est requis : les sources citées sont en dépôt ([lu] par fiche) ou sont des mesures reproductibles du §11.
