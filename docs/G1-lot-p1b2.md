# G1 — journal de provenance, lot P1-b2 (ADR-M017 : filage `residual` + M012 (i) sur le chemin servi)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour : préfixe `claude-opus-4-8` conforme.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-p1b1`, branche `lot/p1-b2`, base `44a121c`.
- **Rattachement** : ADR-M017 D2(iii), D4 tests (3)(5), D5 lot b2 ; ADR-M012 item (i) ; ADR-M018 D1/D3 (Tuyaux) ;
  checkpoint-2 b1 K2-1..K2-4 (`docs/CHECKPOINT2-M017-b1.md`). **Aucun commit** (R-20), aucune action `git` en
  écriture, aucune action sortante : l'orchestrateur committe.
- **Portée b2 (et rien d'autre)** : (1) couture `attested.residual → verdict.residual` sur le chemin servi ;
  (2) dédoublonnage M012 (i) de `GATE_TOOL_DESCRIPTION` ; (3) tests (3) `gate_attested_concordant_files_residual`
  + F1 `gate_guard_order_byo_override_before_attested_F1` ; K2-1 (`gate_description_makes_no_probative_claim` +
  réécriture D6) ; K2-2 (commentaire openapi (6)) ; K2-3 (statut ADR + D4(5) → `a814973`) ; K2-4 (section Tuyaux) ;
  re-pin h5 ; (5) = oracle diff de trace (§3). **Non touché** (0 octet) : `schemas/`, `packages/contracts`,
  `packages/hikae`, `packages/monark`, `apps/site`, `apps/sentinel` (item 9, vérifié §4).

## 1. Fichiers livrés + sha256

| Fichier | État | sha256 |
|---|---|---|
| `apps/harness/src/tools/gate.ts` | modifié (couture `residual` + M012 (i)) | `9b2ad3ca951fcc56cecd514db9766a77d5d3da2238ce6ec12ce3bb642c678625` |
| `apps/harness/test/gate.test.ts` | modifié (tests (3), F1, K2-1, garde M012 (i)) | `cfea2eed3fc8624689688221f897a43588e321d5a1eace02ea545aeafdf55fa1` |
| `apps/harness/test/openapi.test.ts` | modifié (K2-2 commentaire (6)) | `1c4bca86080fc496056303d5a0e0ce8b9412946ed64380b547fc23227300070f` |
| `test/h5-e2e-probe.test.ts` | modifié (re-pin `TRACE_SHA256_PINNED`) | `f8d28c52bb8150d2720e6b666d048a25a7ca4d4d64c515c503fa77e690e07da2` |
| `fixtures/h5-e2e-trace.json` | régénéré (tools/list) | `9cf2f8b23b2c17a7358ca3be27b08fd54378978ec74ae1fd1147573f9179e5dd` |
| `fixtures/PROVENANCE-h5-e2e-trace.md` | modifié (re-pin b2) | `a0ecb69d00cd67eedf5c5163297ffe236d98950bf82ac2dda4480d3c16eff796` |
| `docs/adr/ADR-M017-attested-price-dans-gate.md` | modifié (K2-1/K2-3/K2-4 ; + fold G2 K-b2-1 en `0527419`) | `95c125754fe4179ba617ab144d34770d222a8b3d856159f1799a42d0f46996af` (au gel G2 `f25eb6d` : `7277beb4…`) |

`git status --short` : les 7 fichiers `M` ci-dessus + `?? docs/G1-lot-p1b2.md` (ce journal). `registry.ts` **inchangé**
(sha `03dfe77a…` == b1) : le tuyau `env.attested` a été câblé en b1 (`run()` → `runGate(prediction, params, attested)`).
Taille (R-25, **mesurée** `git diff --numstat 44a121c`) : code+test = **137 ajoutées / 16 supprimées** (churn 153) ;
+ ADR 29/5, PROVENANCE 15/8, trace 1/1 (échange de 64-hex). Total < ~400 (R-25 OK).

### Correspondance décision → artefact

- **(1) Couture `residual` (D2(iii)/D4(3))** — `runGate` (`gate.ts`), APRÈS le dispatch, AVANT `gateInput` :
  `if (attested !== undefined) { verdict = { ...verdict, residual: [...attested.residual] }; }`. Sémantique retenue,
  **non ambiguë** dans l'ADR : `verdict.residual` est le champ que le contrat hérite d'`AttestedPrice.residual`
  (`packages/contracts/src/types.ts:154-155`). Fil **inconditionnel sur la raison** (covered / under_calib /
  set_too_large) : `decide()` (`l3-gate.ts`) ne lit JAMAIS `verdict.residual` (seulement `region`/`reason`), et
  `gate()` fait `verdict: input.verdict` tel quel ⇒ **action/reason/allow inchangés** — seul `residual` change (M-2).
  `params` ne file rien. En pratique la garde de cohérence (D2(i)(ii)) ne laisse `attested` concordant que sur
  `btc-dir-15m` (les 2 autres classes servies lient `[]` ⇒ 400) : `residual` n'est donc filé que sur `btc-dir-15m`.
- **(2) M012 (i)** — split de `STABLE_RUN_COMMITTED_SENTENCE` en `STABLE_RUN_COMMITTED_CORE` (sans la queue) et
  `STABLE_RUN_COMMITTED_SENTENCE = CORE + "; every other (task_class, predictor_id) abstains (under_calib)"`
  (**valeur octet-identique** ⇒ `honestyText()` USDe / tools/call INCHANGÉ, porteur K-1 préservé). `GATE_TOOL_DESCRIPTION`
  interpole `CORE` seul. Mesuré : « every other » rendu **0×** dans la description (était 1× via la queue), « abstains
  (under_calib) » **2×** (cascade + clause « for any other population ») au lieu de 3×. **Décision de conception
  (advisor)** : ne PAS supprimer la queue du constant partagé (ce serait modifier un porteur d'honnêteté tools/call
  hors périmètre du dédoublonnage de la description) ; split, pas suppression.
- **(3) Tests** : (3) via le REGISTRE (`HARNESS_TOOLS…run({prediction, params, attested})`, pas `runGate` direct) —
  prix réel `runAttest().price`, assertion `verdict.residual == attested.residual` + no-op absent + couture chirurgicale.
  F1 : ordre des gardes (anti-override BYO AVANT cohérence attestée), asserté sur le TEXTE du message.
- **K2-1** : test `gate_description_makes_no_probative_claim` (scrub PROBATIVE d'`attest.test.ts:109`, octet pour octet,
  sur `GATE_TOOL_DESCRIPTION`, masquant les 2 négations licites) + réécriture D6. **K2-2** : commentaire openapi (6)
  corrigé (schéma non strippé tué par (1), pas (6)). **K2-3** : statut ADR « accepté » + D4(5) cite `a814973`.
  **K2-4** : section « Tuyaux » (ADR-M018 D3).

## 2. Mutants (sha256 avant → mutation → test ciblé ROUGE → restauration byte-exacte)

Protocole (précédent repo) : sha256 avant, mutation byte-exacte, test ciblé ⇒ **pass=0 / fail=1**, restauration depuis
backup, sha256 après == avant. Les 7 mutants de code : `scratchpad/mutants.py` (`node --test --test-name-pattern="^<test>$"`
sur `gate.test.ts`) ; le 8ᵉ (`m_trace_stale`, porteur du test (5) au niveau FIL) mute la trace committée et cible le probe
(`test/h5-e2e-probe.test.ts`). **8/8 RED + RESTORE_BYTE_EXACT: YES**.

| # | Mutant | Fichier | Test ciblé | pass/fail | sha avant==après |
|---|---|---|---|---|---|
| m_res_drop | couture retirée (`residual: []` réintroduit) | `gate.ts` | `gate_attested_concordant_files_residual` | 0/1 | ✔ `9b2ad3ca…` |
| m_seam_leak | couture fuit `["__leak__"]` sur le chemin ABSENT (garde hoistée) | `gate.ts` | `gate_attested_concordant_files_residual` | 0/1 | ✔ `9b2ad3ca…` |
| m_seam_clobber | la couture écrase AUSSI `reason: "under_calib"` (non chirurgicale) | `gate.ts` | `gate_attested_concordant_files_residual` | 0/1 | ✔ `9b2ad3ca…` |
| m_registry_drop | `registry.ts` appelle `runGate(prediction, params)` SANS `env.attested` (tuyau débranché) | `registry.ts` | `gate_attested_concordant_files_residual` | 0/1 | ✔ `03dfe77a…` |
| m5_swap_guard_order | cohérence sujet↔classe évaluée AVANT anti-override BYO (blocs échangés) | `gate.ts` | `gate_guard_order_byo_override_before_attested_F1` | 0/1 | ✔ `9b2ad3ca…` |
| m_k21_bare_probative | « The attestation is verified live at call time. » ajouté à la description | `gate.ts` | `gate_description_makes_no_probative_claim` | 0/1 | ✔ `9b2ad3ca…` |
| m_dedup_requeue | la description ré-interpole la SENTENCE complète (queue ré-ajoutée) | `gate.ts` | `gate_stable_run_honesty_text_is_keyed_A2_A7f` | 0/1 | ✔ `9b2ad3ca…` |
| m_trace_stale **(5)** | trace committée PÉRIMÉE (b1 `44a121c` réinjectée : re-pin/régén oubliée) | `fixtures/h5-e2e-trace.json` | `probe_harness_records_real_decision` | 0/1 | ✔ `9cf2f8b2…` |

Discriminations vérifiées : **F1** (m5) asserte que le message contient « must not override the committed » ET
**PAS** « not consistent » — sous m5 l'ordre inversé émet « not consistent » ⇒ rouge (un 400 nu ne discriminerait pas
l'ordre). **m_registry_drop** prouve le tuyau M018 D1(b) (test (3) pilote le registre, pas `runGate` direct).
**m_res_drop** / **m_seam_leak** / **m_seam_clobber** discriminent respectivement les facettes (a) filage, (b) no-op
absent (D4(5) au niveau fonction), (c) chirurgie de la couture du test (3). **m_dedup_requeue** garde la dédup M012 (i)
(comptage « every other »). **m_trace_stale** porte le **test (5)** (« absent ⇒ byte-identique ») au niveau du FIL MCP :
une trace committée périmée (re-pin/régénération oubliée) fait rougir `probe_harness_records_real_decision` sur
`deepEqual(live, committed)` ET sur le pin sha256 — (5) est donc *gardé*, pas seulement documenté (§3). Les sha
« avant == après » == les sha §1 : restauration byte-exacte vérifiée, pas re-mesure.

## 3. Preuve (5) « `attested` absent ⇒ byte-identique » (diff ciblé de la trace h5)

`fixtures/h5-e2e-trace.json` régénérée par `node scripts/record-h5-e2e-trace.mjs` (reproductible : aucune horloge lue,
port éphémère non enregistré). `git diff 44a121c -- fixtures/h5-e2e-trace.json` :

```
@@ -67,7 +67,7 @@
           "cascade",
           "gate"
         ],
-        "response_sha256": "ef1dc72338de932e304db014ca41910038c076e467e0f34803f80cc651f005cb"
+        "response_sha256": "ffa194ffc55c715a2b6657ae024575e926356403d961926e6f23f53597e44a54"
       }
     },
```

**Seule** ligne modifiée : `steps[1].result.response_sha256` (l'étape `tools/list`, qui digère le schéma + les
descriptions — la description a rétréci via la dédup M012 (i)). `git diff --numstat` = **1 / 1**. La liste `names`
(`["attest","calibrate","cascade","gate"]`) inchangée ; les étapes `cascade-gate` / `btc-dir-gate` / `attest` sont
**byte-identiques** (absentes du diff) — elles ne portent aucun `attested`, donc la couture `residual` de b2 y est un
**no-op** (D4(5)). Longueur du fichier **inchangée : 15731 octets** (le corps de `tools/list` n'est stocké que par son
digest 64-hex). Re-pin : `TRACE_SHA256_PINNED` `f4014c16…3490` (b1) → `9cf2f8b2…9e5dd` (b2) ; `PROVENANCE-h5-e2e-trace.md`
mis à jour (motif re-pin). `probe_harness_records_real_decision` : **vert** (live == committed + sha256 pin).

## 4. Oracle brut (arbre final restauré, sha §1 confirmés)

| Commande | Résultat | Exit |
|---|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | `tests 292 / pass 292 / fail 0` (289 b1 + 3 nouveaux) | `0` |
| `npm run lint` (eslint .) | (aucun message) | `0` |
| `npm run lint:ratchet` | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` — non croissant | `0` |
| `node scripts/lang-gate.mjs --scope root` | `lang-gate OK — 0 non-exempt French hit … {root}` | `0` |
| `npm run export:check` | `check OK — 0 forbidden path, 0 non-exempt French hit …` | `0` |
| `git diff --stat 44a121c -- schemas packages/contracts packages/hikae packages/monark apps/site apps/sentinel` | **vide** (0 octet dans les dossiers gelés/hors-portée) | `0` |

Tests verts pertinents (inchangés) : `tool_schema_equals_frozen_schema`, `gate_attested_is_frozen_attested_price`
(test (1)), `openapi_generated_matches_frozen_schemas` (test 43/(6)), `harness_tool_descriptions_pass_vocab`,
`gate_stable_run_honesty_text_is_keyed_A2_A7f` (+ garde comptage M012 (i)), `gate_sentence_barber`,
`mcp_tools_have_no_side_effects` (K-8), `attest_makes_no_probative_claim`. Nouveaux : `gate_attested_concordant_files_residual`,
`gate_guard_order_byo_override_before_attested_F1`, `gate_description_makes_no_probative_claim`.

Interdits de texte (mission) : les trois termes bannis (association / agir-seul / promesse-forte nue) sont absents de tous mes ajouts — vérifié par grep sur les lignes ajoutées ; vocab gate + export:check verts.

## 5. Invariants et dettes (clôture zéro dette)

- **Contrats gelés / dossiers hors-portée intacts** : `git diff --stat 44a121c` sur `schemas packages/contracts
  packages/hikae packages/monark apps/site apps/sentinel` = **vide** (item 9). Aucun réseau, aucun état persistant
  (la liaison est une table statique, `attestation-binding.ts`).
- **Byte-identité du porteur K-1 tools/call** : `STABLE_RUN_COMMITTED_SENTENCE` a la MÊME valeur qu'en b1
  (`CORE + queue`, vérifié : `SENTENCE === CORE + "; every other (task_class, predictor_id) abstains (under_calib)"`),
  donc `honestyText()` USDe est inchangé ; seule la description (tools/list) change (dédup).
- **Provenance du prix du test (3)** : `runAttest().price` est le témoin Binance BTCUSDT committé. Transitivité prouvée :
  le probe `probe_harness_records_real_decision` asserte `deepEqual(live, committed)` ⇒ le prix de l'étape `attest`
  de `fixtures/h5-e2e-trace.json` == `runAttest().price` ; le test (3) épingle en plus les 3 résidus littéraux
  (`A(notary-neutrality)`, `A(self-attestation)`, `A(transport-check-delegated)`) ⇒ une dérive du témoin rougit.
- **Décision de conception documentée (non une dette)** : le masque `does not see, store, or verify` du test K2-1 est
  **défensif** (aucun jeton PROBATIVE retiré aujourd'hui : le verbe `verify` et le nom `verifier` ne matchent PAS
  `\bverified\b`) ; conservé pour honorer la négation licite nommée par la mission et durcir contre un futur
  resserrement de la regex — auditable, déclaré dans le commentaire du test ET dans D6.
- **Aucune dette nue** : les items formés (BYO + `attested` ; liaison temporelle `observed_at` ; skill/DEMO ; témoin
  vivant) sont ceux de l'ADR-M017 (Conséquences), **hors P1**, aucun ajouté. **Reste dû par b3** (ordonné dans l'ADR,
  pas une dette de b2) : retrait de `crossAgentGate`, des types associés et de `@monark/ukemi` ; correction
  `README.md:188` ; requalification du statut d'Ukemi (`built`/`upcoming`, ADR-M018 D2) ; réexamen `README.md:102`.
  b3 n'atterrit jamais avant b2 (contrainte respectée : b2 clos avant b3).
- **Forme du test (5)** : (5) « absent ⇒ byte-identique » est portée par l'oracle **diff de trace** (§3) + le probe
  `probe_harness_records_real_decision` (re-pin `TRACE_SHA256_PINNED`), pas par un test unitaire distinct — lecture de
  D4(5) (« oracle diff de trace »). Gardée au niveau FIL par le mutant **m_trace_stale** (§2) ; le no-op absent est aussi
  couvert au niveau fonction par le test (3)(b). Choix validé advisor.
- **Points à trancher** : **aucun** — l'ADR n'était ambigu sur aucun point du périmètre b2 (couture, dédup, ordre des
  gardes, forme de (5) tous résolus ci-dessus). **Deux consultations advisor** (plan avant écriture ; clôture) ; leurs
  points sont pliés : (3) via le registre (mutant m_registry_drop), split CORE pour M012 (i), regex PROBATIVE non étendue
  au verbe `verify`, (5) = diff de trace + mutant m_trace_stale au fil, F1 `!includes("not consistent")`, byo-demo-probe
  sans dépendance tools/list (vérifié), diff zéro-octet, section Tuyaux sans surclaim de la trace. Aucune demande de
  consultation formée en suspens.
- **Provenance** : artefacts générés par worker `claude-opus-4-8[1m]` épinglé, effort `max` ; sortie vérifiable (sha256,
  mutants rejouables `scratchpad/mutants.py`, diff ciblé) ; vérification adversariale + G7 + acceptation validateur-humain
  chez l'orchestrateur (R-21). **Aucun commit** effectué (R-20).

## 6. Post-G2 (rattrapage K-C2-2, orchestrateur)
- **Incident K-b2-1** (G2 fraîche sur `f25eb6d`) : la clause D4(5) « `gate.test.ts` verte sans modification » était fausse (fichier modifié en b1 et b2) ;
  reformulée en « aucune assertion préexistante altérée » au commit `0527419`. `error_origin` : **planificateur** (clause présente depuis `a814973`,
  manquée aux checkpoints de b1 ; le worker b2 a corrigé la référence de commit K2-3 sans relire la clause).
- Ce journal avait été gelé avant le fold (sha ADR périmé) — corrigé ici (checkpoint-2 K-C2-2, `error_origin` orchestrateur).
