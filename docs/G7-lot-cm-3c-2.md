# G7 du lot CM-3c-2 (contrat 1.1.0, bloc C, PR C1) : deux schémas gelés, outil de provenance, générateur des 9 décisions, constante de version

- **Plan** : `docs/G0-lot-cm-3c-2.md` (commit `d29e71d9`), sous le G0 du bloc `docs/G0-bloc-c-cm-3c-2.md` (section 3.1, section 9 coupe nommée, section 14) ; décision déléguée Q-C4 et Q-C5 ; réponses de MONARK Q-M1, Q-M3, Q-M14 et hors délégation.
- **Base** : `7af2ad63` (`origin/base/chantier-moteur-2026-10-03`, fusion de #145, amendement 9 de l'ADR-CM, tête `43c49885`), refetchée avant ce G7 : inchangée. Fusionnée dans la branche par `fa3ebe27` avant tout commit de code (`git merge-base --is-ancestor 43c49885 …` vrai au premier fetch).
- **Commits** : `d29e71d9` (G0 du lot), `f1c705ef` (tests rouges), **`4be07bd1` (gel)**, ce commit (G7). Branche `recherches/cm-3c-2` ; rien n'est poussé, aucune PR ouverte. `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé ; aucun `git add -A`.
- **Coupe nommée appliquée** : le rejeu par projection passe en 3c-3b (C2).

## Ce que le lot change

- **`schemas/policy-row.schema.json`** (neuf, 103 lignes ; Q-C4) : racine `{row_format, class, rows}` fermée ; `$defs` `ClassEntry` (16 clés), `PolicyRow` (60), `VetoBlock`, et trois types de valeur (`Hex64`, `Dec`, `UTest`). Toutes les clés `required`, `additionalProperties: false` ; nullabilité par `type: [X, "null"]`, `enum: [..., null]` ou `oneOf` null / objet ; entiers bornés à 9007199254740991 (`calib_attempt` 1 à 4, `tau_cap` 1 ou null) ; motifs du contrôle à l'octet ; `Dec` déclaré sur-ensemble. Les couplages, l'écriture décimale la plus courte, l'ordre de `strata_cuts`, `scale_table.sha256`, les règles de fichier et l'écriture canonique sont nommés en description et restent au serveur. En-tête 2020-12, `$id` `https://monark.local/schemas/policy-row.schema.json`, `title` `PolicyTable` ; aucun `examples` ni `default`.
- **`schemas/tool-error.schema.json`** (neuf, 35 lignes ; Q-C5) : `oneOf` de trois corps fermés par `error` (`tool_error` et ses 29 codes dans l'ordre de `TOOL_ERROR_CODES` ; `invalid_input` avec `input_invalid` et `issues` requis, éléments sans forme ; `invalid_json` avec `json_invalid`) ; `$defs/InternalError` (`{error: "internal_error", operation, code?: "output_invalid"}`) ; `$defs/Operation` (chaîne non vide). Le fichier porte exactement les 32 codes. Description : MCP, 404 et 405 exclus ; un code inconnu reste un refus. Depuis le pli de la G2 (m-2), elle nomme aussi hors schéma le 403 `invalid_origin`, le 413 `payload_too_large` et le 500 de transport sans `operation` (`server.ts:174`).
- **`test/contracts-frozen.manifest.json`** : deux entrées neuves (D9-ter, ré-épinglage 2, lot CM-3c-2), dans le commit des schémas ; **`test/contracts-frozen.test.ts`** : compte 7 → 9 et titre qui nomme D9-ter (seules ces lignes).
- **`scripts/lib/calib-digest-provenance.mjs`** et `.d.mts` (neufs) : les instructions de `calibDigest`, hors contrat ; **`scripts/emit-u4b-calibration.mjs`** l'importe (une ligne). Sortie de l'émetteur inchangée (`u4b_committed_registry_equals_generator_output` vert).
- **`scripts/gen-gate-decision-fixtures.mjs`** et `.d.mts` (neufs, FIXTURES-GATE-DECISION-GEN-1) : `gate()` de `@monark/hikae` sur des verdicts déclarés (q̂ par `splitQuantile`, empreinte par l'outil de provenance), `--write` ou contrôle (sortie 1 si un fichier diffère). **Il reproduit à l'octet les 9 `fixtures/*.gate-decision.json` et `fixtures/manifest.json`** ; aucun fichier de `fixtures/` ne change.
- **Constante de version** : 29 littéraux `"1.0.0"` de 15 fichiers de `apps/harness/test/` lisent `SCHEMA_VERSION` (`src/tools/gate.ts`), import sur une ligne à part. Les 14 lignes restantes, une par une : G0 du lot, écart 3.
- Tests neufs : `packages/contracts/test/policy-row-schema.test.ts` (2 tests), `packages/contracts/test/tool-error-schema.test.ts` (2), `apps/harness/test/policy-row-schema-corpus.test.ts` (1), `test/calib-digest-provenance.test.ts` (1), `test/gate-decision-fixtures-gen.test.ts` (1). Un schéma absent fait échouer chaque test de schéma par assertion (pas au chargement), pour le classement F2P.

**Écarts au G0 du lot** : un seul, de forme. Les deux tests « clés » et « documents admis » de `policy-row` sont fusionnés en un test (une ligne R-25 de marge par test) ; le tueur du motif `u_test` (`{7}` → `{6}`) est porté par le test du corpus.

### Liste fermée des écarts du schéma de table (Q-C4, condition 3), mesurée

Sondes : 4 lignes admises (marginale, direction, bande, retirée) et 2 entrées de classe (kata, liq) ; sur chacune des 76 clés et un niveau plus bas : chaque valeur d'énumération du contrôle, bords de type, de null, d'entier et de motif, clé absente, clé en trop. **Aucune valeur admise par le contrôle n'est refusée par le schéma.** Les écarts (valide pour le schéma, refusé par le contrôle), épinglés par refus du contrôle :

| Refus du contrôle | Clés |
|---|---|
| écriture décimale la plus courte (`-0`, `0.10000000000000001`) | `class.alpha`, `class.test_delta`, `row.test_delta`, `row.thresholds.t1`, `row.thresholds.t2` |
| `strata_cuts` strictement croissantes | `class.strata_cuts` |
| `scale_table.sha256` = empreinte des valeurs | `row.scale_table.sha256`, `row.scale_table.values` |
| vetos ↔ blocs `test`, `bridge`, `fwd` | `row.bridge`, `row.fwd`, `row.test`, `row.vetoes`, `row.vetoes.bridge`, `row.vetoes.fwd` |
| `retire` ⇔ `retired` | `row.retire`, `row.status` |
| numérateur de queue sans dénominateur | `row.miss_adj_tail_*`, `row.tail_tail_*` |
| `side` mène `bucket` | `row.bucket`, `row.side` |
| `miss_bound` et `bound_on` sur `region` | `row.bound_on`, `row.miss_bound`, `row.status` |
| colonnes `sign-set` | `row.region_rule`, `row.tau_cap` |
| colonne posée sur une ligne `marginal` | 25 clés (liste au test) |
| ligne `marginal` sans `p_served`, `qhat`, `marginal_alpha` | `row.marginal_alpha`, `row.p_served`, `row.qhat` |

Plus, hors contrôle : surrogate isolée (valide, refusée par `canonicalJson`) ; règles de fichier (deux lignes courantes d'une même case : valide, refusée par `assertPolicyTableFile`). Corpus admis valide : 32 tables kata du registre synthétique de graine 37 (admises par `guardKataTable`) et 35 tables de `servedPolicyTables` sur textes synthétiques ; statuts `region`, `silence`, `vetoed`, `under_calib` (`retired` au test du paquet) et les quatre `region_rule` atteints. Aucun texte réel, aucune empreinte de table écrite.

## Aucun octet servi ne change (preuve)

- **Diff** : `git diff 7af2ad63 4be07bd1` ne touche ni `apps/harness/src/`, ni `apps/site/`, ni `packages/*/src/`, ni `fixtures/` (vide sur ces chemins).
- **Octets, base contre gel** : harnais en processus, horloge fixe, script hors dépôt (`/tmp`, effacé), lancé dans un arbre de la base (`git archive 7af2ad63`, `npm ci`) et dans le gel. **28 surfaces, 28 identiques** :

  | Surface | statut, octets, sha256 (base = gel) |
  |---|---|
  | `GET /openapi.json` | 200, 19 920, `d605b912916cc679d4347299bf7d22bb77bf8e1af4c502dd18e2213e6d2a38d7` |
  | MCP `tools/list` | 200, 16 488, `7dfcbd9eed4640b86a9b9b362ba4ec8393b18007d1c9516b96158c0500a29eac` |
  | MCP `initialize` / `tools/call gate` | `1fdcc6ec…99e3` / `2c04c967…ca7b` |
  | `POST /gate` corps de la CA (`GATE_BODY`, liq s0, liq s1, retirée, future, BYO) | `9cd5a918…0416`, `79229566…3243`, `68151bfb…a50d`, `676f7674…8442`, `05c2ad36…62a6`, `4641213a…cb1e` |
  | `POST /gate` refus et cas limites (version 1.1.0, classe inconnue, surrogate dans `intent`, cascade, `alpha` imposé, BYO ensemble, JSON invalide, entrée invalide) | 8 empreintes identiques |
  | `POST /calibrate`, `/attest`, `/cascade` (CA), `GET /health`, `GET /nope` | 5 empreintes identiques |
  | `apps/site/data/harness-served.json` | `77d7b9143e8b6c03bb9f5670941f2550499fbc7cf687fb8bf76ff5542cf61fb1` |
  | `apps/site/data/manifest.sha256.json`, `ukemi-served.json` | `ad884102…6b3b`, `50114a6d…e143` |
  | corps de la CA : `scripts/verify-harness.mjs`, `docs/deploy-CA-harness.json` | `8f540258…af8d`, `edbe345d…a4d` |

  `/openapi.json` et `tools/list` égalent les empreintes du G7 de CM-4b et de `harness-served.json`.
- **Corps 400 d'aujourd'hui face au schéma gelé** : les corps `invalid_input` (`{error, operation, issues}`, `http.ts:97`) et `invalid_json` (`{error, operation}`, `http.ts:90`) servis aujourd'hui **ne valident pas** la racine de `tool-error.schema.json` : il leur manque `message` et `code`. C'est attendu jusqu'à C2, qui les ajoute (Q-C5 condition 2, B-11 amendée) ; si la coupe de C2 s'applique, en C' (Q-C5 condition 6). Les 11 corps 400 `tool_error` valident déjà (mesure de la G2).
- **Site** : `frozen-contracts.ts` lit le compte au disque (9 fichiers sous `schemas/`, 8 `*.schema.json`) ; `frozen_contracts_count_is_derived` est vert. Une construction du site rendrait « eight » au lieu de « six » ; rien n'est déployé avant T0 (ADR-PUBLIC-CADENCE-1 §17) et l'affichage des deux schémas est à MONARK à T0 (hors délégation, point 3). Aucun fichier du site ne change.

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR propre, effacé à la fin)

- **red-proof** : `node scripts/red-proof.mjs --base 7af2ad63 --gel 4be07bd1 --repo /home/user/monark-governance-blc --draw 20 --seed 37` : sortie 1 (REFUSED, attendu), 13 jugés, 86 inchangés ; `RED-PROOF.json` sha256 `ade68e5c7323368b55cf1604d2661d6c5d263e6f4053f7c5205b9e679c8c543d` (dépend des chemins).
  - **F2P, 5** : les trois tests de `policy-row` et les deux de `tool-error` ; **new-module, 2** : outil de provenance, générateur. **7 tueurs tirés, 7 tués** :
    - `schemas/policy-row.schema.json:45 CONST "\"kata_id\": {" -> "\"kata_ix\": {"` (CONST d'une clé) ;
    - `schemas/policy-row.schema.json:49 CONST "\"4h\", " -> "\"4x\", "` (CONST d'une énumération) ;
    - `schemas/policy-row.schema.json:12 CONST "{7}" -> "{6}"` (motif `u_test` à 6 décimales) ;
    - `schemas/tool-error.schema.json:11 CONST "\"attest_refused\", " -> ""` (un code retiré) ;
    - `schemas/tool-error.schema.json:15 CONST "\"code\", \"issues\"]" -> "\"code\"]"` ;
    - `scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"` ;
    - `scripts/gen-gate-decision-fixtures.mjs:35 CONST "\"down\", 0.06" -> "\"down\", 0.07"`.
  - **Refusés, 6, attendus** (refactor et compte, verts à la base par construction ou sans tueur de production) : `gate_tool_emits_frozen_gate_decision`, `oracle_usde_fixture_zero_atom_ties`, `harness_served_honesty_carriers_pass_vocab` (verts à la base) ; `cascade_returns_frozen_prediction`, `u4b_class_b_is_unknown_task_class_400` (refactor, sans tueur déclaré) ; le compte de `contracts_frozen` (le manifeste est sous `test/`). Tueurs appliqués à la main, ci-dessous.
- **Tueurs à la main, au gel** :
  - **constante de version** : `apps/harness/src/tools/gate.ts:62 CONST "\"1.0.0\"" -> "\"1.1.0\""`, tests de `apps/harness` : **59 rouges à la base** (égal à la simulation du G0 du bloc), **8 au gel**. Les 8 restants ne lisent plus un littéral de test : deux épingles de format (`usde_band_edges_within_half_ulp_stated_and_band_unchanged`, `served_replay_identical_and_nan_never_commits_in_the_served_gate`, régénérée ou remplacée en C2) ; `cascade_returns_frozen_prediction` et `u5_producer_predicts_then_gate_follows_the_committed_registry` (version de `packages/ukemi/src/prediction.ts:13`, nommée en 3c-3c) ; **quatre tests `gate_stable_run_*` de `gate.test.ts`** (la prédiction vient de `fromAttestedFlow`, dont la version est `packages/monark/src/adapter-narabi.ts:26`, voir Q-3) ;
  - **mutant D9-ter** : changer `title` de `tool-error.schema.json`, ou le motif `u_test` de `policy-row.schema.json`, sans ré-épingler ⇒ `contracts_frozen` rouge ; ajouter `schemas/x.schema.json` non épinglé ⇒ rouge (« file added or removed in the frozen zone ») ;
  - **compte 7 → 9** : retirer l'entrée `policy-row` du manifeste ⇒ le test du compte rougit ;
  - `schemas/policy-row.schema.json:53 CONST "\"hour-of-week\"" -> "\"hour-of-weak\""` ⇒ les trois tests de `policy-row` rouges.
  Chaque fichier restauré, sha256 vérifié.
- **Ancres** : `verifie-ancres.mjs . --touched 7af2ad63 HEAD` : 46 tueurs, 46 ancrés, 0 dérivé, 0 perdu.
- `tsc --noEmit` vert ; `eslint .` sortie 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK (portée `schemas` comprise : `aux_seq`, `runs_aux`, `aux_sha256` couverts par D7 decies) ; `export:check` OK.
- **`npm test` complet au gel** : **2 310 tests, 2 288 verts, 22 sautés, 0 rouge**, test 42 (`export_public_no_governance_no_french`) compris et vert ; `contracts_frozen`, `fixtures_root_valid`, `frozen_contracts_count_is_derived`, `harness_served_data_matches_in_process_harness` verts.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, contre `7af2ad63`) : STAT **541** (+508/−33) ≤ 547 ; PR C1 = ce seul lot, ≤ 1 205 ; CONTENT_STAT 0.

## Liste fermée de `frozen_contract_fields_stay_dynamic` (Q-M14) : mesure et proposition

Mesure à `4be07bd1` : aucun des sept champs neufs de 1.1.0 (`qhat_unit`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`, `request_sha256`) n'apparaît entre guillemets dans les `.ts` et `.tsx` de `apps/site` (portée de `siteSurfaces`). C1 ne touche pas ce test (il lit les quatre schémas servis, pas les deux neufs). **Proposition : aucune entrée** ; en C2, seulement les comptes de `test/ci-gates.test.ts:853-855` (12 → 17, 8 → 9, 5 inchangé). Si un chargeur de C2 (`harness-served-load.ts`, égalité sur `scores_sha256`) écrit le nom en littéral, l'entrée serait `apps/site/lib/harness-served-load.ts :: scores_sha256` ; défaut préféré : lecture par propriété, sans entrée. MONARK écrit.

## Questions (pour MONARK ; aucune n'est un choix de contrat)

- **Q-1. `scripts/record-usde-calib.mjs`, exporté au miroir public** (`export-public.mjs:79`). Défaut : ligne d'ADR-M004 D7 de MONARK qui nomme `scripts/lib/calib-digest-provenance.mjs` dans `WHITELIST_FILES` ; repointage (une ligne) en C2, au plus tard dans le commit qui retire `calib-digest.ts`.
- **Q-2. `scripts/record-u4b-calib.mjs`, générateur gelé d'ADR-U4b D4** (`5733daeb…`, `calibration-liq.test.ts:56`). Défaut : en C2, dans le commit qui retire `calib-digest.ts`, ligne datée d'ADR-U4b qui re-gèle son sha256 LF (import seul changé, sortie identique prouvée par le test et le rejeu du journal `registry-A`), `GENERATOR_SHA256_LF` ré-épinglé dans le même commit.
- **Q-3 (neuve, mesurée ici). Version de la prédiction de Narabi.** `packages/monark/src/adapter-narabi.ts:26` (`SCHEMA_VERSION = "1.0.0"`) n'écrit que la `Prediction` de `fromAttestedFlow` (l.211, seul usage de la constante) ; il lit l'`AttestedFlow` sans l'écrire ; le G0 du bloc range `packages/monark/src/adapter-*.ts` dans « Ne change pas ». Sous la bascule seule, quatre tests `gate_stable_run_*` rougissent (400 `schema_version_unsupported`), et le chemin servi d'un appelant qui passe par l'adaptateur aussi. Défaut : ouverture de zone nommée pour C2 (3c-3c) sur `packages/monark/src/adapter-narabi.ts:26` (et son test), la prédiction en 1.1.0 avec `gate.ts:62` ; `AttestedFlow` reste en 1.0.0. `adapter-shogen.ts` et `adapter-book.ts` n'écrivent que des attestations (inchangés).

## G2

- **Pièce** : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-3c-2-C1.md`, verdict **APPROUVE SOUS RÉSERVE** (réserve m-1), aucun bloquant.
- **Pli** : commit `39e4273f` (code, schémas, manifeste), puis ce texte. Base `7af2ad63` refetchée avant le pli : inchangée, aucune fusion. Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé.

### Plié

- **m-1 (réserve)** : la description de `schemas/policy-row.schema.json` nomme la règle de la ligne `marginal` (« the closed column list of a marginal row, which sets p_served, qhat and marginal_alpha », `policy-table.ts:125`). Le manifeste gelé est ré-épinglé **dans le même commit** (D9-ter, ré-épinglage 2) : `b828d858…20de`.
- **m-2** : la description de `schemas/tool-error.schema.json` nomme hors schéma le 403 (`invalid_origin`), le 413 (`payload_too_large`) et le 500 de transport sans `operation` (`{"error":"internal_error"}`, `server.ts:174`). Choix : documenter, pas inclure (le 500 de transport n'a pas d'`operation`, l'inclure ouvrirait `InternalError`). Ré-épinglé dans le même commit : `ce9c5ca1…0010`.
- **m-3** : `tool_error_schema_branches_by_error` refuse en plus `message` absent (`tool_error`, `invalid_json`), `message` non chaîne (les trois branches), `issues` non tableau, et `InternalError` sans `operation` ou avec une clé en trop (une ligne R-25, la dernière assertion réécrite sur place).
- **m-4** : `policy_row_schema_parity_key_by_key_with_a_closed_list_of_gaps` épingle les refus du motif `Dec` par valeur : `0.10`, `+1`, `1E+5`, `01`, `1.`, `1e5`, `1e+05`, `.5` (une ligne R-25).
- **m-5** : phrase ajoutée à « Aucun octet servi » (corps `invalid_input` et `invalid_json` d'aujourd'hui non valides jusqu'à C2).
- **m-7** : texte de Q-3 corrigé (l'adaptateur n'écrit que la `Prediction`, l.211).

### Déclaré (pour MONARK)

- **m-6 (T0)** : après la fusion de C1, une construction du site depuis la base rendrait « Eight frozen contracts » (`apps/site/app/page.tsx:181`, `apps/site/app/docs/page.tsx:61`) sans marquer `PolicyTable` ni `ToolError` « upcoming » (`UNSERVED_CONTRACT_FILES` ne les liste pas). Rien n'est déployé depuis la base : ce n'est pas un octet servi. Demande : que la liste de T0 (BLOC-C-ACTES-MONARK-1) porte nommément le sort des deux titres, servis ou à venir (`policy-row` ne décrit qu'un fichier servi en empreinte).
- **Facultatif de la G2, point 6** (commentaire du générateur sur la table de `packages/hikae/src/s2/instrument.ts:399-425`) : non plié, pas de ligne R-25 dépensée.

### Position de la cellule sur Q-1 à Q-3 (troisième avis à MONARK)

La G2 est d'accord avec les trois défauts ; la cellule aussi. MONARK tranche.
- **Q-1** : `scripts/lib/calib-digest-provenance.mjs` entre dans `WHITELIST_FILES` par une ligne d'ADR-M004 D7 de MONARK ; `scripts/record-usde-calib.mjs` est repointé vers l'outil **au plus tard dans le commit de C2 qui retire `calib-digest.ts`** (sinon la commande « Reproduce » de `PROVENANCE-usde.md` §6 casse à l'export de T0). Pas de `.d.mts` exporté tant qu'aucun `.ts` exporté ne l'importe.
- **Q-2** : re-gel du générateur d'U-4b (`scripts/record-u4b-calib.mjs`) par une ligne datée d'ADR-U4b, `GENERATOR_SHA256_LF` ré-épinglé dans le même commit, sortie identique prouvée par `u4b_committed_registry_equals_generator_output` et le rejeu du journal `registry-A`. **Pas de module de réexport** dans `@monark/contracts` (contraire à D9-ter : `calibDigest` sort du paquet).
- **Q-3** : ouverture de zone nommée pour C2 (3c-3c) sur `packages/monark/src/adapter-narabi.ts` et `packages/monark/test/adapter-narabi.test.ts` ; la version de la `Prediction` lue depuis **une seule constante exportée** (par exemple du paquet de contrats, en C2), pas un second littéral, pour que gate, ukemi (`packages/ukemi/src/prediction.ts:13`) et narabi ne divergent plus. `AttestedFlow` reste en 1.0.0 ; `adapter-shogen.ts` et `adapter-book.ts` inchangés.

### Contrôles du pli (Node 24.21.0, variables de proxy retirées, TMPDIR propre, effacé à la fin)

- **Aucun octet servi ne change** : `git diff 7af2ad63 HEAD` vide sous `apps/harness/src/`, `apps/site/`, `packages/*/src/`, `fixtures/`. Harnais en processus, horloge fixe (2026-10-05T00:00:00Z), script hors dépôt, lancé dans une copie de la base (`git archive 7af2ad63`, liens `@monark` vers ses propres paquets) et dans la tête : **38 surfaces, 38 identiques** (19 corps `/gate`, dont CA `9cd5a918…0416`, liq s0 `79229566…3243`, liq s1 `68151bfb…a50d` ; `GET /openapi.json` `d605b912…a38d7` ; `/health`, 404, trois 405, opération inconnue ; `/calibrate`, `/cascade`, `/attest` refusé ; MCP `initialize`, `tools/list`, `tools/call gate` succès et refus, réponses complètes) ; fichiers `harness-served.json` `77d7b914…1fb1`, `manifest.sha256.json`, `ukemi-served.json`, `verify-harness.mjs`, `deploy-CA-harness.json` identiques.
- **red-proof du pli** : `--base 74cf5947 --gel 39e4273f --draw 20 --seed 37` : REFUSED, attendu : 2 jugés (les deux tests resserrés), verts à la base, 0 tueur déclaré. **Tueurs à la main** : 11 mutants des schémas, chacun **vivant** sous les tests de `74cf5947` et **tué** sous ceux du pli : `message` facultatif (`tool_error`, `invalid_json`), `message` sans type (×3), `issues` sans type, `InternalError` ouvert, `InternalError` sans `operation` requis, `Dec` avec zéros finaux, signe `+`, `E` majuscule. Chaque fichier restauré par `git checkout`.
- **red-proof du lot** : `--base 7af2ad63 --gel HEAD --draw 20 --seed 37` : sortie REFUSED, identique au G7 : 13 jugés, 86 inchangés ; F2P 5, new-module 2 ; 6 refusés attendus (les mêmes) ; **7 tueurs tirés, 7 tués**.
- **Mutant D9-ter** : changer la description de l'un ou l'autre schéma sans ré-épingler ⇒ `contracts_frozen` rouge ; les schémas du pli contre le manifeste de `74cf5947` ⇒ rouge ; avec le ré-épinglage ⇒ vert.
- **Ancres** : `verifie-ancres.mjs . --touched 7af2ad63 HEAD` : 46 tueurs, 46 ancrés, 0 dérivé, 0 perdu.
- `tsc --noEmit` vert ; `eslint .` sortie 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK.
- **`npm test` complet** (à `39e4273f`, machine partagée avec une autre session lourde) : 2 274 tests, 2 252 verts, 21 sautés, 1 rouge : le test 42 (`export_public_no_governance_no_french`), dont la CI exportée a rendu une sortie sans résumé sous la charge ; relancé seul, **vert** (2/2). `contracts_frozen`, `fixtures_root_valid`, `frozen_contracts_count_is_derived`, `harness_served_data_matches_in_process_harness` verts.
- **R-25** (contre `7af2ad63`) : STAT **543** (+510/−33) ≤ 547 ; CONTENT_STAT 0.
