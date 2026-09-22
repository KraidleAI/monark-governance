# Checkpoint-1 U-5a (validateur-humain) — ESCALADE (fenêtre 5 outils) + APPROUVE-AVEC-CORRECTIONS

Modèle résolu : claude-fable-5-1

# Checkpoint-1 — PLAN lot U-5a (producteur pur `fromRealizedBook` + outil servi `ukemi-predict`)

## 1. Artefacts lus (contexte frais ; jamais le fil du planificateur)
- `F:\Monark\docs\G0-lot-u5.DRAFT.md` §1-§11 + §Provenance + §MAST ; `F:\Monark\docs\G0-lot-u5.MESURES.md` M-12/M-13/M-14
- `F:\Monark\docs\CHANTIERS.md` : décisions 50/51 (:115-116), 123 (:622-627), 130 (:731), rulings décision 132 (:750-756)
- `F:\tmp\u5a\MISSION-G1-u5a.md` ; `F:\Monark\docs\CONSIGNE-STANDARD-G1.md` A-6/A-8/A-10
- Code HEAD `d1e3547` (clean) : `apps/harness/src/tools/{registry.ts,gate.ts:554-621,690-709}`, `apps/harness/src/{http.ts,openapi.ts,ukemi-strata.ts}`, `apps/harness/test/{registry,http,openapi}.test.ts`, `test/{h5-e2e-probe.test.ts,h5-trace-builder.ts,harness-export.test.ts}`, `scripts/verify-harness.mjs:30-32`, `scripts/export-exclude-{tests,data}.json`, `.github/workflows/ci.yml:65`, `docs/adr/ADR-M005-harnais-mcp-appelable.md` D14 (:191-197), `packages/monark/src/adapter-book.ts:1-40`
- Rejeu (AM-2, Bash vérification seule) : instrument M-12 `F:\tmp\u5\scratch\measure-producer.mjs` ré-exécuté par moi → `565/565 EQUAL {yhat,strate,m_bps,pstar}`, 0 écart, tranche mono-compte 30 244 o. Fixture : 565 `score_a` / 99 `score_b` / 1 `meta` comptés. Sha gelé `scripts/census/u4b/u4b-scores.mjs` = `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` avant et après ; `git status` = 0 ligne. (Précision CA-9 : l'instrument est celui du worker ; l'indépendance est dans la ré-exécution et le décompte, pas dans un code tiers.)

## 2. Checklist

| Règle | Verdict | Preuve |
|---|---|---|
| CA-1 falsifiabilité | **correction** (C-1, C-2, C-3) | Reformulable en une phrase : « ré-implémenter ŷ pur dans `packages/monark`, prouver l'égalité au module gelé sur 565 lignes, servir `ukemi-predict`, composer vers `gate` ». Trois points non exécutables tels qu'écrits : (i) G0 §2.1(a) « `strateOf` déjà dans le harness — RÉUTILISER » alors que `strateOf` vit dans `apps/harness/src/ukemi-strata.ts:31` et que `packages/monark` n'importe jamais `apps/*` (ADR-U1b C-1, `adapter-book.ts:8-10`) ; (ii) §5/§6 test 1 asserte une région `[ŷ−q̂, ŷ+q̂]` alors que la classe sert une BORNE HAUTE `[0, ŷ+q̂]` (`gate.ts:560,606`) ; (iii) à HEAD le registre de la classe liq est VIDE (`gate.ts:587-593`) et le BYO est class-locké (`gate.ts:700`) ⇒ toute ŷ → `under_calib` : le mutant (f) anti-vacuité est intuable en -5a. |
| CA-2 décision de valeur | **ESCALADE** | Décision 51 (investisseur, verbatim) : « l'endpoint garde 4 outils … ADR-M005 D14 maintenue ». Décision 123 (investisseur) : « MAINTENUE À LA LETTRE : l'endpoint garde 4 outils … Aucun amendement d'ADR-M005 D14 ». Décision 132 (orchestrateur) + mission : « ajoute-le au set servi (`ALLOWED_TOOL_NAMES` +1) … 5 outils transitoirement ». Précédent mesuré : décision 50 (orchestrateur) avait amendé D14 → renversée par 51 avec `error_origin` orchestrateur. |
| CA-3 ADR / gates | **correction** (lié à l'escalade) | ADR-M008:25 et ADR-M005 amendement M017 : « aucun 5ᵉ outil … sinon amendement de set requis ». ADR-M005 D14:193 : tout changement de set embarque **dans le même commit** `ALLOWED_TOOL_NAMES`, test set-exact, `schema-projection`, OpenAPI, miroir, `verify-harness.mjs`, RUNBOOK/README, re-pin h5. La mission dit « README/site/skill NE bouge PAS (U-5b) » ⇒ incompatible avec l'ADR qu'elle devrait amender. Tuyaux dans un ADR-U5a proposé : conforme. |
| CA-4 fan-out | conforme | Un worker G1, relecteur G2 séparé, validateur séparé ; aucun fan-out de débit. |
| CA-5 MAST | **correction** (C-8) | §MAST du G0 antérieur à la découpe 132 ; FM-3.3 pour la découpe elle-même (deux éditions du set exact + deux re-pins h5 si fenêtre à 5) absent. |
| CA-6 oracle ≠ tests verts | **correction** (C-4) | Mission : « score_a == module gelé » conflate Oracle A (lignes committées) et Oracle B (module gelé LIVE, 16 096 comptes, branches fail-closed hors `score_a` — M-12 le dit lui-même). Les deux sont dans le G0 §6 (tests 2 et 3) ; la mission doit les nommer tous deux. |
| CA-7 zéro dette | **correction** (C-5) | Item 123(ii) « rejeu sur le JSONL FRAIS » hors -5a : à former avec déclencheur nommé. |
| CA-8 provenance | conforme | Première ligne modèle résolu, `DELIVERED.sha256`, G0 worker `claude-opus-4-8[1m]`, A-6 sha avant/après des 9 gelés. |
| CA-9 vérification imposée | conforme | Oracle non-LLM, export-exclu, mutants ≥ 10, G2 en contexte frais ; rejeu M-12 exécuté ici. |
| CA-10 anti-vitesse | conforme, déviation consignée | Checkpoint-1 ‖ G1 = décision 130 (consignée). Coût borné : les fichiers gelés par l'escalade (§4) représentent ~6 lignes de code + 3 pins de test. |
| CA-11 branchement | **correction** (C-3) | Composition depuis l'artefact réel exigée par la mission (A-8/A-10) — conforme dans l'intention ; mais à HEAD la sortie consommée est `under_calib` quelle que soit ŷ ⇒ le plan doit dire ce que test 1 prouve maintenant et déférer la non-vacuité. |
| Découpe -5a/-5b (question posée) | voir escalade | Enums/contrats gelés : **aucun touché** (vérifié : `task_class` libre, `features_digest` 64-hex optionnel, `schemas/*.json` et `types.ts` non édités). Tests de registre gelés à 4 touchés par « +1 » : `registry.test.ts:50,57`, `http.test.ts:46,86`, `openapi.test.ts:48`, `test/h5-e2e-probe.test.ts:67` (`TRACE_SHA256_PINNED`) + `fixtures/h5-e2e-trace.json` (`tools/list` names + sha, exclu R-25 mais le test compte), `scripts/verify-harness.mjs:32` (SET EQUALITY LIVE — décision 130 rend le déploiement automatique ⇒ rougit au redéploiement à 5 outils sauf mise à jour dans le même commit), `RUNBOOK-harness.md:166`, README/skill « four tools » (`INTEGRATION.md:3`, `README.md:195`, `apps/harness/README.md:101`). |
| K-8 (aucun I/O) | conforme, une précision | `fromRealizedBook` dans `packages/monark` (hors scan `src/tools/**`) ; `adapter-book.ts:14` importe déjà `node:crypto` pour le digest — le producteur ne doit PAS l'utiliser (digest ÉCHO, jamais recalculé, G0 §2.5). `ukemi-predict.ts` sous `src/tools/` passe le scan FORBIDDEN (`registry.test.ts:31-37`). |
| R-25 | **correction** (C-6) | G0 §7 estime -5a à 600-700 en supposant registry/http/openapi/h5 en -5b ; la découpe 132 les ramène en -5a. Re-mesure due avant G2 ; garde `ci.yml:65` < 1 150 (mission) / plafond 1205. |

## 3. Décision : **ESCALADE-INVESTISSEUR** sur UN point ; **APPROUVE-AVEC-CORRECTIONS** sur le reste (liste fermée)

### Question à poser à l'investisseur (une ligne suffit)
> Décisions 51 et 123 : « l'endpoint garde 4 outils, D14 maintenue ». La découpe U-5a/U-5b (décision 132) ferait servir **5 outils** entre la fusion de -5a et celle de -5b. **(A)** Ratifier une fenêtre à 5 par amendement daté d'ADR-M005 D14 — coût : D14:193 impose dans -5a `verify-harness.mjs:32`, RUNBOOK:166, README « four tools », re-pin h5, puis un second re-pin en -5b ; R-25 -5a à re-mesurer. **(B)** Maintenir 4 : -5a livre `fromRealizedBook` + module `ukemi-predict.ts` + schémas + oracles A/B + mutants **sans enregistrement** ; enregistrement, route HTTP, re-pin h5 et liage A-10 sur chemin servi passent en -5b (même fusion que le retrait — littéralement la décision 51). Variante (B') : -5b empilée sur -5a, deux PR/G2/cp2, une seule fusion vers `lot/etude-suite`.

### Périmètre NON touché par l'escalade (le G1 en vol continue)
`packages/monark/src/adapter-book.ts` (`fromRealizedBook`), `apps/harness/src/tools/ukemi-predict.ts`, `schema-projection.ts` (schémas entrée/sortie), `UkemiPredictToolError` + `TOOL_ERROR_NAMES`, Oracle A + Oracle B, fixture réduite, mutants, ADR-U5a proposé.

### GELÉ jusqu'à la réponse
`registry.ts:32` / `HARNESS_TOOLS`, `registry.test.ts:50,57`, `http.test.ts:46,86`, `openapi.test.ts:48`, `TRACE_SHA256_PINNED` + `fixtures/h5-e2e-trace.json`, `scripts/verify-harness.mjs:32`.

### Corrections (liste fermée, au pli)
- **C-1 (bloquante, CA-1)** : trancher la frontière `strateOf`. Soit `fromRealizedBook` émet `{yhat, m_bps, pstar}` et la strate est dérivée côté outil harness via `ukemi-strata.ts` (l'Oracle A asserte alors `strate` au niveau outil), soit `strateOf`/`STRATA_CUTS_SERVED` migrent dans `packages/monark` (touche `ukemi-strata.ts`, `ukemi-strata.test.ts`, `apps/sentinel/test/ukemi-served-strateof.test.ts`). Une 3ᵉ copie dans `packages/monark` viole le « une seule implémentation » du G0 §2.1.
- **C-2 (bloquante, CA-1)** : test 1 asserte la forme réelle de la région : borne haute `[0, ŷ+q̂]` (`liqUpperBoundRegion`), jamais `[ŷ−q̂, ŷ+q̂]`.
- **C-3 (bloquante, CA-11 durci)** : le plan dit ce que test 1 prouve à HEAD — atteinte de la branche liq (`reason:"under_calib"`, `n_calib:0`, alpha/nMin imposés) + liage A-10 : sortie servie (`registry.run`, et `handleJsonMirror` si (A)) **ÉGALE** `fromRealizedBook` sur les mêmes octets, mutant « ŷ altéré après calcul » rouge. Le mutant (f) « ŷ varié ⇒ décision varie » devient un **item à déclencheur = fusion -2b**, rejoué en -5b.
- **C-4 (bloquante, CA-6)** : la mission nomme les DEUX oracles : A (565 lignes `score_a` e2, bigint exact) et B (`computeScoresU4b` gelé LIVE sur les 16 096 comptes, ŷ ou refus nommé) ; entrée `scripts/export-exclude-tests.json` pour l'Oracle B dans le **même sous-lot** ; la fixture réduite publique porte une ligne de provenance (dérivée de `U4b-book-23545087.json`, bloc, sha — décision 111 : motif orphelinage, pas confidentialité ; anti-close = Bell seul, hors champ).
- **C-5 (CA-7)** : item 123(ii) « rejeu Oracle A sur le JSONL FRAIS » formé avec déclencheur (course -1b close / -2b), propriétaire nommé.
- **C-6 (R-25)** : re-mesure de -5a avec la réponse (A)/(B) avant G2 ; si > garde, appliquer la couture pré-déclarée §7 (« ré-impl+strateOf » / « enveloppe+schema+intégration »), jamais seul.
- **C-7 (CA-5)** : compléter §MAST : FM-3.3 pour la découpe (deux éditions du set exact, deux re-pins h5 si (A)) ; FM-1.5 pour la fenêtre `verify-harness` LIVE au redéploiement (décision 130).
- **C-8 (mineure)** : le `label` servi est en anglais ASCII (`lang:gate` 0) — la clause C-6 du G0 §2.5 (avec « ŷ », guillemets français) ne peut être servie « VERBATIM » ; test 6 asserte la phrase anglaise portant les mêmes 5 éléments (règle gelée v3.5.0 / premier franchissement / non-WETH à p0 / « no other event » / « caller-carried, not re-verified »). Ajouter `apps/harness/src/tools/ukemi-predict.ts` à `test/harness-export.test.ts:25-37` (symétrie des sources exportées).

## 4. Consigne AM-1 (apprentissage)
Attrapé : ruling 132 (5 outils transitoires) contre décisions investisseur 51/123 verbatim et ADR-M005 D14:193 ; frontière `strateOf` packages/apps rendant §2.1(a) inexécutable ; forme de région fausse au §5/§6 ; mutant (f) intuable à HEAD (registre vide + class-lock BYO) ; `verify-harness.mjs:32` SET EQUALITY live oublié par la découpe. Rejeu M-12 : 565/565 confirmé, dépôt inchangé, sha gelé intact. Manqué : à signaler par l'orchestrateur a posteriori.

Modèle résolu : claude-fable-5-1 (validateur-humain, siège d'acceptation, contexte frais, Bash vérification seule — aucune écriture, aucun `git` d'état).
