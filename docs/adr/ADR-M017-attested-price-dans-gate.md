# ADR-M017 — P1 : prise `AttestedPrice` optionnelle dans `GateEnvelope` ; `crossAgentGate` devient le chemin servi

- **Statut** : proposé (G0 du tuyau P1, ADR-M015 D2) 2026-09-18 · checkpoint-1 validateur dû avant tout code (gel par identité d'artefact, K-C)
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

**D2 — Sémantique servie.** Quand `attested` est présent : (i) **liaison obligatoire** : `attested.subject` (paire, venue, horodatage) doit lier la
`prediction` — règle : `prediction.task_class` doit appartenir à l'ensemble des classes déclarées pour ce `subject` dans une table statique
committée (`attestation-binding.ts`, une entrée par classe servie ; pour `btc-dir-15m` : subject BTCUSDT) ; liaison absente ou fausse ⇒ raison gelée
`binding_broken`, verdict `abstain`, jamais un succès inventé ; (ii) **traçabilité** : `attested.residual` est filé dans `CoverageVerdict.residual`
(comme `crossAgentGate` l.87), et l'attestation est portée par un champ de provenance non gelé (`params`), jamais par `residual` (M-2,
`gate.ts:316` « residual is NOT an honesty carrier ») ; (iii) **non-vérification à l'appel, déclarée** : le harnais ne recalcule pas les octets
attestés (K-8 interdit le vérifieur Shōgen dans `gate`) — la description de l'outil et la doc portent la phrase « the attestation is carried by
the caller and is not re-verified at call time; recompute it with `attest` or offline » ; (iv) **composition servie** : la région reste celle du
dispatch par `task_class` sur les scores committés (`gate.ts`), **pas** les paires de `crossAgentGate` — `crossAgentGate` est refactoré pour
partager le même noyau de conformalisation que le chemin servi (un seul lieu), ou retiré si redondant (décision au G2 sur le diff ; pas de
code réel appelé seulement par un test après ce lot). Quand `attested` est absent : comportement byte-identique à aujourd'hui (trace h5, fixtures).

**D3 — Honnêteté.** `attest` reste une fixture (label K-1) tant qu'aucun témoin vivant n'existe ; aucune revendication statistique nouvelle ; la
prise ne sert que la fixture Binance et les appelants qui apportent leur propre `AttestedPrice`. Aucun texte public (README, site, skill) ne change
dans ce lot ; la description de l'outil `gate` change (phrase (iii)) ⇒ item M012 (i) traité en même temps (dédoublonnage de
`GATE_TOOL_DESCRIPTION`, re-pin de la trace h5).

**D4 — Oracle nommé.** Nouveau test de dérive `gate_attested_is_frozen_attested_price` (motif `attest_output_is_frozen_attested_price`) : la
projection de `attested` == fichier gelé strippé, byte à byte ; assertion `required === ["prediction","params"]` et clés d'enveloppe =
`{prediction, params, attested}` ; test de liaison (`binding_broken` sur subject/classe discordants, mutant « table vidée » ⇒ rouge) ; test de
traçabilité (`residual` filé, mutant « `residual: []` réintroduit » ⇒ rouge) ; test « absent ⇒ byte-identique » (trace h5 inchangée) ;
`tool_schema_equals_frozen_schema` conservé ; K-8 (`registry.test.ts`) conservé ; OpenAPI regénéré et épinglé.

**D5 — Invariants.** Set d'outils inchangé ; diff `schemas/` `packages/contracts/` = 0 octet ; aucun réseau, aucun état ; phrase D8 Narabi intacte ;
`lint-ratchet` non croissant ; R-25 : **P1-a** (cet ADR + amendements M005 D5/D8, M003 D4) et **P1-b** code 500–700 l. (analogie F1b 550) ;
scission formée à l'avance si dépassement : P1-b1 enveloppe + projection + tests de dérive, P1-b2 liaison + traçabilité + description + re-pin h5.

## Alternatives rejetées
- **5ᵉ outil `compose`** (attest + gate en un appel) : casse l'oracle K-8 du set exact ; refusé.
- **Vérifier les octets attestés dans `gate`** : exige `child_process` (vérifieur Shōgen) ⇒ K-8 ; refusé ; la vérification reste offline / `attest`.
- **Porter l'attestation dans `residual`** : `residual` n'est pas un porteur d'honnêteté (M-2) ; refusé.
- **Laisser `crossAgentGate` test-only** : code réel appelé seulement par un test ; refusé par ADR-M015 D8.

## Conséquences
- Le triangle attest → gate → act devient servi et testé ; `attest` cesse d'être terminal.
- Items formés : (a) témoin vivant (Shōgen live / Mokugeki) — hors P1, gaté par la règle « gap + calibrable » ; (b) table de liaison à étendre
  à chaque nouvelle classe servie (une ligne par ADR de classe) ; (c) `crossAgentGate` : sort du paquet ou partage le noyau (G2).
- Procurement : aucun (tout est interne).

## Sources
`apps/harness/src/tools/registry.ts:30-38` ; `apps/harness/src/schema-projection.ts:209-214` ; `apps/harness/src/tools/gate.ts` (11 × `residual: []`,
`:316`) ; `apps/harness/test/schema.test.ts:53-56, 74` ; `apps/harness/test/registry.test.ts:34` ; `packages/monark/src/index.ts:69-114` ;
`schemas/attested-price.schema.json` ; ADR-M005 D1/D5/D8, ADR-M003 D4, ADR-M015 D2 et checkpoint-1 C-4 (`docs/CHECKPOINT1-M015.md`).
