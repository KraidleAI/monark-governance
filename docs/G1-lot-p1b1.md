# G1 — journal de provenance, lot P1-b1 (ADR-M017 : `AttestedPrice` optionnelle dans `GateEnvelope`)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
- **Date** : 2026-09-18/19. **Worktree** : `F:\Monark-wt-p1b1`, branche `lot/p1-b1`, base `a814973`.
- **Rattachement** : ADR-M017 D1, D2(i)(ii)(iv), D4 tests (1)(2)(4)(6), D5 lot b1. Checkpoint-1 accepté sur `fe83ea2`,
  alignements `a814973`. **Aucun commit** (R-20) : l'orchestrateur committe. Aucune action sortante.
- **Portée b1 (et rien d'autre)** : enveloppe + projection `attested` ; `attestation-binding.ts` + garde de
  cohérence ; phrase (iv) + « no temporal binding in P1 » dans la description ; re-pin de la trace h5 ; tests
  (1)(2)(4)(6). **Non filé en b1** : `residual` (b2), dédoublonnage M012 (i) (b2), retrait `crossAgentGate` (b3).

## 1. Fichiers livrés + sha256

| Fichier | État | sha256 |
|---|---|---|
| `apps/harness/src/attestation-binding.ts` | **nouveau** | `82c9aebb374f3f339735379a64615c526d709f30ced9a6a28424ceb4522175c1` |
| `apps/harness/src/schema-projection.ts` | modifié | `c4782ed36b676a396b81331570da478adad2e2b600b3fcc39a907ced7ff87b71` |
| `apps/harness/src/tools/registry.ts` | modifié | `03dfe77afafad26fe8ab26d33cc9ad13919f207b2bdf5819c0b286f4e675ea4b` |
| `apps/harness/src/tools/gate.ts` | modifié | `b7ed29eb8ec1f9a653d0adcd1eb441a7a3fdcb7cf5d1711b451a6b2997f9f9b0` |
| `apps/harness/test/schema.test.ts` | modifié (test (1)) | `576b76cbe6749484277897d6d6539b3b6f508f732c866cb85acb5b8357742fcb` |
| `apps/harness/test/gate.test.ts` | modifié (tests (2)(4)) | `0044b18208123b55cb3314e2d3848c448a584a4ebd7a0f59cf835bace10b1335` |
| `apps/harness/test/openapi.test.ts` | modifié (test (6)) | `36815dd6f5d8b471be27ab0c9f28a525e79a41aa313f2b7f4a59106a599bd441` |
| `test/h5-e2e-probe.test.ts` | modifié (re-pin) | `1fd52b8ecc65a90e284485b5d5602e77e9c2538684db4c81f45edeb65bd93406` |
| `fixtures/h5-e2e-trace.json` | régénéré | `f4014c1603015ec88457c82f6ced331d129eb22c9cd9cb809088b84b2e1f3490` |
| `fixtures/PROVENANCE-h5-e2e-trace.md` | modifié | `f03e4a4fce133e529f597a9bbe2e1465bb505ccccf2d1e85ef8f8a3d5713cd30` |

`git status --short` : les 9 fichiers `M` ci-dessus + `?? apps/harness/src/attestation-binding.ts`. Rien d'autre
(la trace n'est PAS committée par le worker — R-20). Taille du lot (R-25, **mesurée**) : `git diff --numstat
a814973` = **204 ajoutées / 35 supprimées** (9 fichiers suivis) ; `attestation-binding.ts` (non suivi) = **55
lignes** (`wc -l`) ⇒ **259 lignes ajoutées, 35 supprimées** (churn 294), < 1205 (R-25 OK ; sous l'estimation 350–450).

### Correspondance décision → artefact

- **D1** (enveloppe) : `GateEnvelope.attested?: AttestedPrice` optionnel (`registry.ts`), `required` inchangé
  `["prediction","params"]` ; projection `attested = stripMeta(ATTESTED_PRICE_SCHEMA)` (`schema-projection.ts`,
  même mécanisme que `prediction`). `ATTESTED_PRICE_SCHEMA` remonté dans le groupe des schémas gelés (TDZ : il
  précède `TOOL_INPUT_SCHEMA`), une seule déclaration (dédoublonnée de la section attest).
- **D2(i)(ii)** : `attestation-binding.ts` — table **totale** sur les 3 classes servies (Map, pas d'objet nu :
  `task_class` est une chaîne libre contrôlée par l'appelant ⇒ `"__proto__"`/`"constructor"` ne résolvent jamais
  vers un membre du prototype), `checkAttestedConsistency` pure. Garde dans `runGate` **après l'anti-override BYO
  (hoisté) et avant le dispatch** (ordre D2(ii) : validateHarnessParams → anti-override BYO → cohérence sujet↔classe
  → dispatch). Deux textes distincts fail-closed 400 (`HarnessToolError` ∈ `http.ts` `TOOL_ERROR_NAMES`, l.101-102),
  chacun nommant le sujet ET la classe.
- **D2(iv)** : `GATE_NON_REVERIFICATION_SENTENCE` (phrase (iv) verbatim) + « no temporal binding in P1 » dans
  `GATE_TOOL_DESCRIPTION`. Zéro octet dans `packages/hikae`, `schemas/`, `packages/contracts` (voir §5).
- **D4** : tests (1)(2)(4)(6). **`attested` absent ⇒ byte-identique** (voir §3).

## 2. Mutants (sha256 avant → mutation → test ciblé ROUGE → restauration byte-exacte)

Protocole (précédent repo : `gate.test.ts:3-4`, `ci-gates.test.ts:850`) : `sha256sum` avant, mutation par `sed`,
`node --test --test-name-pattern=<test>` sur le seul fichier concerné ⇒ **rouge**, restauration par copie de
sauvegarde, `sha256sum` après = avant.

| # | Mutant | Fichier | Test ciblé | Assertion qui rougit | sha256 avant = après |
|---|---|---|---|---|---|
| 1 | table renvoie `[]` par défaut (`.get(taskClass) ?? []`) | `attestation-binding.ts` | `gate_attested_discordant_is_tool_error` (2) | `a free/BYO class with attested is a 400 naming 'not accepted for BYO classes' + the class` | `82c9aebb…75c1` (identique) |
| 2 | `required` gagne `attested` | `schema-projection.ts` | `gate_attested_is_frozen_attested_price` (1) | `required stays [prediction, params] (attested is OPTIONAL)` | `c4782ed3…7b71` (identique) |
| 3 | projection **non** strippée (`attested: ATTESTED_PRICE_SCHEMA`) | `schema-projection.ts` | `gate_attested_is_frozen_attested_price` (1) | `attested projection == frozen AttestedPrice (stripped)` | `c4782ed3…7b71` (identique) |
| 4 | phrase de non-vérification retirée de la description (`"" +`) | `gate.ts` | `gate_description_declares_non_reverification` (4) | `the description carries phrase (iv) verbatim` | `b7ed29eb…f9b0` (identique) |

Chacun : `pass 0 / fail 1` sous le pattern, restauration confirmée `RESTORE_BYTE_EXACT: YES` (sha256 après ==
avant, == le sha256 §1). Le mutant (1) est **discriminé par le TEXTE** (D2(ii) : sinon un 400 nu ne distingue pas
« not accepted for BYO classes » de « not consistent ») — c'est la raison pour laquelle le test (2) asserte le
message, pas seulement le statut. Non-vacuité du test (4) : le test asserte AUSSI le contenu propre du constant
(`not re-verified at call time`, `the verifier is not executed here`), donc blanchir le constant (au lieu de
l'interpolation) rougit également (motif `gate.test.ts:113-117`). Les sha256 « avant = après » == les sha256 §1
**par construction** : le protocole mutant a tourné AVANT l'écriture de ce G1, sur l'état restauré ; c'est une
restauration byte-exacte vérifiée (`RESTORE_BYTE_EXACT: YES`), pas une re-mesure.

## 3. Preuve « `attested` absent ⇒ byte-identique » (D4(5), diff ciblé de la trace)

`fixtures/h5-e2e-trace.json` régénérée par `node scripts/record-h5-e2e-trace.mjs` (reproductible : les outils ne
lisent aucune horloge, le port éphémère n'est pas enregistré). `git diff a814973 -- fixtures/h5-e2e-trace.json` :

```
@@ -67,7 +67,7 @@
           "cascade",
           "gate"
         ],
-        "response_sha256": "118b92bd70b71583f6d7c9b2cd101a61bae59ce41d1247807e66de6ca1d06fb5"
+        "response_sha256": "ef1dc72338de932e304db014ca41910038c076e467e0f34803f80cc651f005cb"
       }
     },
```

**Seule** ligne modifiée : `steps[1].result.response_sha256` (l'étape `tools/list`, qui digère le schéma d'entrée
et les descriptions). La liste `names` (`["attest","calibrate","cascade","gate"]`) est inchangée ; les étapes
`cascade-gate` / `btc-dir-gate` / `attest` sont **byte-identiques** (absentes du diff). Longueur du fichier
**inchangée : 15731 octets** (le corps de `tools/list` n'est stocké que par son digest 64-hex — un échange de 64
caractères). Re-pin : `TRACE_SHA256_PINNED` `b429a241…3654` → `f4014c16…3490` (probe l.56) ; `PROVENANCE` mis à
jour (motif re-pin M012-f). `probe_harness_records_real_decision` : **vert** (live == committed + sha256 pin).

Le chemin servi sans `attested` (`{prediction, params}`) traverse `runGate(prediction, params, undefined)` ⇒ la
garde attested est un no-op ⇒ décisions inchangées (les 289 tests, dont `gate_dispatches_on_task_class`, verts).

### Provenance de l'URL de la fixture (item advisor)

L'URL committée dans la table = l'URL attestée de la fixture h5 (`fixtures/h5-e2e-trace.json:292`). Vérification :

```
$ grep -c 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' \
      fixtures/h5-e2e-trace.json apps/harness/src/attestation-binding.ts
fixtures/h5-e2e-trace.json:1
apps/harness/src/attestation-binding.ts:1
```

(Le cas concordant `btc-dir-15m` + URL exacte ⇒ pas d'erreur, filage du `residual` = test (3), **b2** ; il prouvera
l'égalité octet à octet. En b1, une coquille dans l'URL passerait les 3 cas discordants du test (2) — d'où cette
preuve grep jointe.)

## 4. Oracle brut

| Commande | Résultat | Exit |
|---|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | `tests 289 / pass 289 / fail 0` | `0` |
| `npm run lint` (eslint .) | (aucun message) | `0` |
| `npm run lint:ratchet` | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` — non croissant (mes tests n'ajoutent aucune violation `no-unsafe-*`/`no-explicit-any` : prédicats d'erreur narrowés `e instanceof HarnessToolError`, fixtures typées) | `0` |
| `node scripts/lang-gate.mjs --scope root` | `lang-gate OK — 0 non-exempt French hit … {root}` | `0` |
| `git diff --check` | (aucune erreur d'espaces) | `0` |
| `git diff --stat a814973 -- schemas packages/contracts packages/hikae` | **vide** (0 octet dans les dossiers gelés) | `0` |
| `npm run export:check` | `check OK — 0 forbidden path, 0 non-exempt French hit …` | `0` |

Tests verts pertinents (inchangés) : `tool_schema_equals_frozen_schema`, `harness_tool_descriptions_pass_vocab`,
`gate_stable_run_honesty_text_is_keyed_A2_A7f` (jamais « guarantee » nu ni « verified » nu introduit),
`openapi_generated_matches_frozen_schemas` (test 43 étendu), `mcp_tools_have_no_side_effects` (K-8 :
`attestation-binding.ts` est à `src/`, hors `src/tools/`, sans I/O ⇒ scan K-8 intact).

## 5. Invariants et dettes (clôture zéro dette)

- **Contrats gelés intacts** : `git diff --stat a814973 -- schemas packages/contracts packages/hikae` = vide (D5).
- **Aucune dette nue** : les items formés sont ceux de l'ADR (BYO + `attested` ; liaison temporelle `observed_at` ;
  témoin vivant ; skill/DEMO), tous **hors P1** et déclarés dans l'ADR-M017 (Conséquences) — aucun « dû » ajouté.
- **Reste dû par lot suivant (ordonné dans l'ADR, pas une dette de b1)** : b2 (filage `residual`, M012 (i), tests
  (3)(5)) ; b3 (retrait `crossAgentGate`, `@monark/ukemi`, `README.md:188`). b3 n'atterrit jamais avant b2.
- **Provenance** : artefacts générés par worker Opus 4.8 épinglé ; sortie vérifiable (sha256, mutants rejouables,
  diff ciblé) ; vérification adversariale + G7 chez l'orchestrateur (R-21).
