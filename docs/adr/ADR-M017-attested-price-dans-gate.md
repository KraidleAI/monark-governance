# ADR-M017 — P1 : prise `AttestedPrice` optionnelle dans `GateEnvelope` ; `crossAgentGate` devient le chemin servi

- **Statut** : proposé (G0 du tuyau P1, ADR-M015 D2) 2026-09-18 · checkpoint-1 rendu sur `a40c169` : ACCEPTE-AVEC-CORRECTIONS C-1..C-11, toutes
  pliées ci-dessous (voir `docs/CHECKPOINT1-M017.md`) · re-checkpoint K-C dû sur le commit amendé avant tout code
- **Rattachement** : ADR-M015 D2 (P1), ADR-M005 D1 (4 outils, K-8), D5/D8 (enveloppe hors contrat gelé, `params` non gelé), ADR-M003 D4
  (`crossAgentGate` « réel » → « servi »), ADR-M001 D8 ; amende ADR-M005 D5/D8 et ADR-M003 D4. Décision investisseur 2026-09-18 : « ce qui prime
  c'est de corriger ce qui existe ; le moteur au complet, un moteur d'inférence conforme avec des outils internes faits par nos soins ».
- **Fait de carte** : le `gate` servi n'accepte que `GateEnvelope = { prediction: Prediction, params: HarnessParams }` (`registry.ts:35-38`) ;
  `attest` est **terminal** (aucun outil ne consomme son `AttestedPrice`) ; 11 sites `residual: []` dans `gate.ts` ; le seul chemin qui file
  `price.residual → CoverageVerdict.residual` est `crossAgentGate` (`packages/monark/src/index.ts:69-114`, l.87), appelé uniquement par son test.

## Contexte
Le triangle attest → gate → act n'existe que dans un test. P1 est le tuyau le moins cher qui le rend servi : K8 = 0 (pas de 5ᵉ outil), GEL = 0
(l'enveloppe vit hors `schemas/`, ADR-M005 D8 ; `AttestedPrice` entre tel quel), D6 = 0 (pur). Contraintes mesurées au checkpoint-1 de M015 :
(a) `tool_schema_equals_frozen_schema` (`apps/harness/test/schema.test.ts:53-56, 74`) n'asserte que `properties.prediction` et la sortie — ajouter
`attested` ne le rougit pas ; (b) le scan K-8 (`registry.test.ts:34`) interdit `child_process` ⇒ le vérifieur Shōgen ne peut pas tourner dans
`gate` ; (c) `crossAgentGate` ne vérifie aucune liaison `price.subject` ↔ `prediction` (la trace h5 compose Binance BTCUSDT avec une prédiction
sans lien) ; (d) `crossAgentGate` conformalise sur des paires (`ctx.calib.pairs`) alors que le gate servi dispatche par `task_class` sur des
scores committés.

## Décision
**D1 — Enveloppe.** `GateEnvelope` gagne une clé **optionnelle** `attested?: AttestedPrice` (le contrat gelé `AttestedPrice`, `additionalProperties:
false`). `required` reste `["prediction", "params"]`. Le schéma d'outil publié (`schema-projection.ts`) projette `attested` comme référence au
schéma gelé `attested-price.schema.json`, à l'octet (même mécanisme que `prediction`). Aucun octet de `schemas/` ni `packages/contracts/` ne change.

**D2 — Sémantique servie (réécrite au checkpoint-1, C-1..C-5).** Quand `attested` est présent :
(i) **Cohérence déclarée sujet ↔ classe** (jamais « vérification ») : `attested.subject` est la chaîne de l'URL attestée (`^[ -~]+$`, ex.
`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`, `fixtures/h5-e2e-trace.json:292`) ; règle = **égalité exacte** `attested.subject ∈
URLS(prediction.task_class)` dans une table statique committée `apps/harness/src/attestation-binding.ts`, **totale sur les trois classes
servies** (C'-2) : `btc-dir-15m` → `[<URL Binance de la fixture h5>]` ; `stable-run-velocity-24h` → `[]` (Narabi atteste des flux, pas des prix ;
toute `attested` ⇒ 400, déclaré) ; `cascade-liquidable-24h` → `[]` (classe fixture, toute `attested` ⇒ 400, déclaré). **Aucune liaison temporelle en P1** (« no temporal binding in P1 », déclaré dans la description ;
`observed_at` n'est pas comparé). Vocabulaire : « declared consistency between the attestation subject and the task class », jamais « verified ».
**Périmètre P1 = classes committées seules** (`btc-dir-15m`, `stable-run-velocity-24h` ; `cascade-liquidable-24h` est une classe fixture sans
URL de sujet ⇒ toute `attested` sur elle est incohérente par construction, déclaré) ; **BYO + `attested` = item formé** (hors P1 ; un appel BYO
avec `attested` est refusé au même titre, jamais accepté en silence).
(ii) **Émission de l'incohérence — voie (b), erreur d'outil fail-closed** : sujet absent de la table ou discordant ⇒ **erreur d'outil 400**
(précédent K-4a et garde anti-override `gate.ts:526`), message nommant le sujet et la classe ; **zéro octet dans `packages/hikae`** ; le prédicat
fermé L3 (`l3-gate.ts:80-109`) est inchangé, et le littéral gelé `binding_broken` reste **inutilisé sur ce chemin** (déclaré : il est émis par les
adaptateurs Shōgen (`adapter-shogen.ts:147-255`) et Narabi, jamais par le gate servi). Ordre des gardes : `validateHarnessParams` → anti-override BYO → cohérence sujet ↔ classe → dispatch. **Cas BYO + `attested`** (C'-8) : une classe
libre n'a pas d'entrée dans la table ⇒ tombe dans « sujet absent de la table » ⇒ 400 nommé « attested is not accepted for BYO classes in P1 » ;
cas explicite du test (2) avec mutant nommé (« table renvoie `[]` par défaut au lieu de refuser » ⇒ rouge).
(iii) **Traçabilité** : `attested` est une clé d'enveloppe (D1) ; **seul `attested.residual` est filé** dans `CoverageVerdict.residual` ; `params`
n'y est pour rien ; `residual` n'est pas un porteur d'honnêteté (M-2, `gate.ts:316`).
(iv) **Non-vérification à l'appel, déclarée** dans la description de l'outil (phrase C-8) : « the attestation is carried by the caller and is not
re-verified at call time (the verifier is not executed here); `attest` only projects the committed witness — verify a caller-carried attestation
offline with the Shōgen verifier ». `attest` n'a aucun input et ne peut ni recalculer ni vérifier une attestation apportée.
(v) **Composition servie et retrait de `crossAgentGate` (C-5)** : la région est celle du dispatch par `task_class` sur les scores committés
(`gate.ts:284-329, 433-453`) ; `crossAgentGate` (`packages/monark/src/index.ts:69-114`) COMMIT sur `cascade-liquidable-24h` avec des paires
seedées là où le chemin servi abstient `under_calib` et où la garde A6 interdit une calibration apportée sur une classe committée — deux vérités
pour une classe, contraire à M002 D3 et M008 D7/A6 ⇒ **retrait** : amendement ADR-M003 D4 (« réel » → « servi par l'enveloppe `gate` ») ;
**le remplacement du test 30 est le test (3) de D4** (`btc-dir-15m` + URL Binance, chemin servi, couture `attested.residual → verdict.residual`)
— C'-1 : aucun test ne compose « `attested` + calibration BYO sur `cascade-liquidable-24h` », ce montage est refusé trois fois par cet ADR
(BYO + `attested`, garde A6 `gate.ts:526`, classe sans URL) ; P1-b3 = suppression pure (test 29 de l'adaptateur conservé), retrait des types
`GateContext`/`CalibrationState`/`BudgetState`/`GateRequest` et de la dépendance `@monark/ukemi` de `packages/monark/package.json`. **Après P1,
aucun chemin ne compose Shōgen + Ukemi + Hikae en un appel** : la jambe Ukemi avec attestation = item formé (BYO + `attested`, ou calibration
cascade servie). Ordre imposé : **b3 n'atterrit jamais avant b2**.
Quand `attested` est absent : comportement byte-identique (oracle de diff ciblé, D4).

**D3 — Honnêteté.** `attest` reste une fixture (label K-1) tant qu'aucun témoin vivant n'existe ; aucune revendication statistique nouvelle ; la
prise ne sert que la fixture Binance et les appelants qui apportent leur propre `AttestedPrice`. Aucun texte public (README, site, skill) ne change
dans ce lot ; la description de l'outil `gate` change (phrase (iv)) ⇒ item M012 (i) traité en même temps (dédoublonnage de
`GATE_TOOL_DESCRIPTION` sous la contrainte `gate_stable_run_honesty_text_is_keyed_A2_A7f`, re-pin de la trace h5). Le triangle servi en P1 est
attest(fixture Binance) → gate(`btc-dir-15m`, calibration synthétique) : on l'écrit tel quel. `absent` ≠ `attestation_absent` : l'attestation est
optionnelle par assomption A(shogen-optional) (M002 D8) ; `attestation_absent` reste réservé aux classes qui l'exigent. Mise à jour différée du
skill/DEMO (`{prediction, params}` reste valide) = item formé.

**D4 — Oracle nommé (C-6, C-7).** (1) `gate_attested_is_frozen_attested_price` : projection de `attested` == fichier gelé strippé, byte à byte ;
`required === ["prediction","params"]` ; clés d'enveloppe = `{prediction, params, attested}`. (2) `gate_attested_discordant_is_tool_error` : sujet
discordant ⇒ erreur 400 nommée, aucun verdict. (3) **`gate_attested_concordant_files_residual`** : `btc-dir-15m` + URL Binance ⇒ pas d'erreur,
`verdict.residual` deep-equal aux résidus attestés — tue « table vidée » et « `residual: []` réintroduit ». (4) Mutant « phrase de non-vérification
retirée de la description » ⇒ rouge (motif `gate.test.ts:112`). (5) **Oracle « absent ⇒ byte-identique »** : `git diff a40c169 -- fixtures/h5-e2e-trace.json`
ne touche que `steps[1].result.response_sha256` (tools/list : schéma + description) ; étapes `cascade-gate`/`btc-dir-gate` byte-identiques ; suite
`gate.test.ts` verte sans modification ; `TRACE_SHA256_PINNED` re-pinné avec `PROVENANCE-h5-e2e-trace.md` mis à jour. (6) **Test 43 étendu**
(OpenAPI calculé à l'exécution, aucun fichier épinglé n'existe) : `attested` présent dans `properties`, absent de `required`.
`tool_schema_equals_frozen_schema` et K-8 (`registry.test.ts`) conservés.

**D5 — Invariants.** Set d'outils inchangé ; diff `schemas/` `packages/contracts/` = 0 octet ; aucun réseau, aucun état ; phrase D8 Narabi intacte ;
`lint-ratchet` non croissant. **R-25 par package (C-11)** : **P1-a** = cet ADR + amendements ADR-M005 D5/D8 et ADR-M003 D4 (posés dans le même
commit, C-9) ; **P1-b1** (`apps/harness`) enveloppe + projection + `attestation-binding.ts` + **phrase (iv) dans la description** + **re-pin h5 +
`PROVENANCE-h5-e2e-trace.md`** + tests (1)(2)(4)(6), ≈ 350–450 l. (analogie F1b) — C'-3 : tout lot qui change les octets de `tools/list` porte son
propre re-pin, sinon `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:85`) rougit par construction ; l'état intermédiaire
« schéma acceptant `attested` sans le déclarer » n'existe donc jamais (M005 D12 déploie entre lots) ;
**P1-b2** (`apps/harness`) filage `residual` + M012 (i) + re-pin h5 + tests (3)(5), ≈ 200–300 l. ; **P1-b3** (`packages/monark`) retrait
de `crossAgentGate`, des types associés, de `@monark/ukemi`, test de remplacement, ≈ 150–250 l. en suppression ; chacun < 1205, revoyable séparément.

**D6 — Topologie et modes MAST (C-10).** Un worker `claude-opus-4-8` par lot + G2 instance fraîche + validateur (checkpoints par SHA, K-C) ; fan-out
justifié par l'indépendance de vérification, jamais par le débit. Modes : dérive contrat ↔ enveloppe (le motif que `tool_schema_equals_frozen_schema`
ne couvre pas pour `attested` — contré par le test (1)) ; surclaim de liaison (« verified » à la place de « declared » — contré par le mutant (4) et
`gate:vocab`) ; artefact mouvant (deux ruptures mesurées en M015 — contré par K-C) ; raison fausse sur le fil (contré par la voie (b) : aucun verdict
n'est émis sur une incohérence).

## Alternatives rejetées
- **5ᵉ outil `compose`** (attest + gate en un appel) : casse l'oracle K-8 du set exact ; refusé.
- **Vérifier les octets attestés dans `gate`** : exige `child_process` (vérifieur Shōgen) ⇒ K-8 ; refusé ; la vérification reste offline / `attest`.
- **Porter l'attestation dans `residual`** : `residual` n'est pas un porteur d'honnêteté (M-2) ; refusé.
- **Laisser `crossAgentGate` test-only** ou **le refactorer pour « partager le noyau »** : le noyau (`conformInterval` → L3) est déjà partagé ; ce qui
  diverge est la source de calibration (paires seedées vs scores committés) et `packages/monark` ne peut pas importer `apps/harness` ; refusé, retrait.
- **Émettre `binding_broken` par court-circuit pré-L3 dans `runGate`** : contredit « never re-implemented » et K-4(b) `decision.reason === verdict.reason` ;
  refusé. **Amender le prédicat fermé L3** (voie a) : possible mais touche `packages/hikae` et M002 D5 pour un cas d'entrée invalide ; non retenu en P1.

## Conséquences
- Le triangle attest → gate → act devient servi et testé ; `attest` cesse d'être terminal.
- Items formés : (a) témoin vivant (Shōgen live / Mokugeki) — hors P1, gaté par la règle « gap + calibrable » ; (b) table de liaison à étendre
  à chaque nouvelle classe servie (une ligne par ADR de classe) ; (c) jambe Ukemi avec attestation (BYO + `attested`, ou calibration cascade servie).
- **Texte public (C'-7)** : `README.md:188` décrit `packages/monark` comme « cross-agent gate — freezes the wiring signature » : **faux après P1-b3**
  ⇒ P1-b3 corrige cette ligne dans le même lot (export public) ; `README.md:102` « The first vertical, built end to end: Shōgen → Hikae → Ukemi »
  (porté par le test 30) est réexaminé au G2 de b3 et reformulé si nécessaire (« built and served piece by piece; composed on the gate path »).
  Aucun autre texte public ne change en P1.
- Procurement : aucun (tout est interne). Items formés : BYO + `attested` ; liaison temporelle (`observed_at`) ; skill/DEMO ; témoin vivant.

## Sources
`apps/harness/src/tools/registry.ts:30-38` ; `apps/harness/src/schema-projection.ts:209-214` ; `apps/harness/src/tools/gate.ts` (11 × `residual: []`,
`:316`) ; `apps/harness/test/schema.test.ts:53-56, 74` ; `apps/harness/test/registry.test.ts:34` ; `packages/monark/src/index.ts:69-114` ;
`schemas/attested-price.schema.json` ; ADR-M005 D1/D5/D8, ADR-M003 D4, ADR-M015 D2 et checkpoint-1 C-4 (`docs/CHECKPOINT1-M015.md`).
