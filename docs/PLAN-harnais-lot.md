# PLAN — Campagne « harnais » : exposer les primitives RÉELLES attest·gate·cascade (MCP + HTTP)

> **Rattachement G0** : ADR-M005 ; `attest` dépend en plus de **ADR-M003 D10 « Lot I »**. Corrections C-1..C-10
> et K-1..K-9 **intégrées** ; décisions investisseur Q1/Q2/Q-A/Q-B **intégrées**. **Checkpoint-1 final avant tout code.**
> **Boucle par lot** : G0 → implémentation (worker Opus 4.8) → **G2** (relecteur fraîche ≠ générateur, ≥ 1 mutant/test)
> → **R-21** (orchestrateur re-joue l'oracle) → **G7** + `error_origin` → **checkpoint-2** (validateur, PAR LOT) → PR +
> CI verte → merge. Zéro dette nue. Siège committeur `claude-opus-4-8` (Opus-seat).

## 1. Objectif
Exposer les **primitives réelles** — `attest`(Shōgen), `gate`(HIKAE), `cascade`(UKEMI) — en **MCP 2026-07-28 sans état**
(`mcp.monarkgate.tech`) + **HTTP/JSON** (`api.monarkgate.tech`), **harnais déployé par l'investisseur** (Q2),
**exporté open-source** (Q-A). Aucun stand-in (Q1). Gratuit. Aucun acheteur revendiqué.

## 2. PR de gouvernance préalable (C-4) — **docs seulement**
ADR-M005 + ce PLAN + **Addendum D16 (M004)** + **entrée `JOURNAL-PROVENANCE.md`** (déploiement vitrine ratifié, Q-B)
partent en **PR de gouvernance** (précédent PR #2), **avant** tout code. Mesure R-25 ≈ 300 l. &lt; 1205. **Aucun fichier
de code n'y entre** : l'**exemption de chemin `lang-exempt.json`** (fixtures Shōgen, K-2) atterrit en **Lot I-a** (avec
les fixtures qu'elle exempte) ; les **entrées liste blanche export** (`apps/harness`, `fixtures/s3-binance.*`, Q-A)
atterrissent en **H4/Lot I-a** (quand les chemins existent) — sinon elles référenceraient des chemins absents et
rougiraient le test 42. La checklist de tests nommés est enregistrée ici pour que chaque lot la cite.

## 3. Backlog (lots, chacun sous R-25 ; ordre = dé-risquer ce qui est prêt)

### H1 — `apps/harness` : serveur MCP sans état + `gate`(HIKAE) + Origin + localhost + portes + CI
**Dépend de** : — (HIKAE prêt).
- Package `apps/harness` (`package.json`, `tsconfig`, `src/server.ts`, `src/tools/registry.ts`, `src/tools/gate.ts`,
  `src/http.ts` en H4). Deps : `@monark/contracts`, `@monark/hikae`, **`@modelcontextprotocol/server@2.0.0`**. `contracts` intact.
- **`gate`** : entrée `Prediction` (projetée) + params non gelés **validés serveur (K-4a)** ; **dispatch `task_class`**
  (`btc-dir-15m`→`conformalSet`/calibration **synthétique** ; `cascade-liquidable-24h`→`conformInterval`). `schema_version`
  **fixé serveur** (K-4c) ; `clockOpen` porté-appelant, `timedOut/evaluable/nCalib` dérivés-serveur (K-4d). Sortie `assertClosedGateDecision`.
- **Origin (K-9/C-1)** : allowlist `monarkgate.tech`+sous-domaines, **403** si présent-invalide, **absent = accepté**.
  Serveur **lié `127.0.0.1:3001` (K-8/C-10)**.
- **Portes (K-3)** : `lang-gate.mjs` `SCOPES += "harness"` + branche `apps/harness` dans `classifyScope` ; bloc
  `apps/harness` dans `grep-forbidden.mjs` ; `scan.harness` dans `vocab-banned.json` ; nouveau workspace dans `npm run ci` **et** `npm run lint` ; `lint:ratchet` 92/92.
- **C-3** : README documente `GateInput` **champ par champ** (porté-appelant vs dérivé-serveur, K-4d).
- **Tests** (chacun tué par ≥ 1 mutant) : `gate_tool_emits_frozen_gate_decision` ; `tool_schema_equals_frozen_schema` ;
  `gate_tool_never_calls_tool` ; `gate_dispatches_on_task_class` (asserte `abstain`+`verdict.reason==="under_calib"`+`reason==="under_calib"`, K-4b) ;
  `gate_description_declares_cascade_uncalibrated` (K-4e) ; `gate_rejects_invalid_params` (K-4a) ;
  `mcp_tools_have_no_side_effects` (**oracle K-8** : registre `==={attest,gate,cascade}` + scan statique sans
  `node:fs`/`node:net`/`node:child_process`/`fetch`/écriture `process.env`) ; `origin_invalid_returns_403` ;
  `origin_absent_is_accepted` ; `harness_binds_localhost_only` ; `harness_tool_descriptions_pass_vocab` ; `calibration_declared_synthetic` (C-8).
- **G1/G2 matérialisés au merge** (`docs/G1-lot-H1.md`, `docs/G2-lot-H1.md`) dès ce lot (K-1 patron).

### H2 — `cascade`(UKEMI réel) → `Prediction`
**Dépend de** : H1. **Isolé (C-5)** : `src/tools/cascade.ts` + 1 ligne `registry.ts` + `@monark/ukemi`. Parallélisable avec Lot I-a.
- `FinancialSystem` (non gelée, **déclarée champ par champ**) → `clearing` → `liquidableAmount` → `yhat` →
  `emitPrediction` → **`Prediction`** (`cascade-liquidable-24h`). Retourne une `Prediction`, pas une `GateDecision` (D4).
  **K-1** : honnêteté dans la **description**, jamais dans `Prediction`.
- Tests : `cascade_returns_frozen_prediction` (mutant `p_correct` ⇒ throw) ; `cascade_wires_clearing_to_yhat` (mutant : `yhat` déconnecté ⇒ rouge).

### Lot I — adaptateur Shōgen→`AttestedPrice` + `crossAgentGate` réel (ADR-M003 D10 ; prérequis de H3), **scindé I-a/I-b (K-5)**
**Dépend de** : — (G0 par M003 D10).
- **I-a** — import fixtures + **rejeu Shōgen (PF-5, owner = agent, K-6)** + `cbor-canonique.ts` :
  - Importer `s3-binance.{lot.cbor,constat.json,registre.txt}` (F:\Shogen) → `F:\Monark/fixtures/` (sha256, PROVENANCE) ;
    **exemption de chemin `lang-exempt.json` (K-2)** ; test `lang-gate --scope root` vert (mutant : exemption retirée ⇒ rouge).
  - **Rejeu** `shogen-verifier` sur `s3-binance.lot.cbor` (`cargo`, HEAD `5b6469ae`, arbre propre, versions, commande,
    **stdout+stderr+exit séparés**, sha256) — **sans modifier/committer F:\Shogen (R-20)** ; fixture de sortie commise.
  - `packages/monark/src/cbor-canonique.ts` (décodeur CBOR déterministe, **zéro-dep**) + son test contre `s3-binance.lot.cbor`.
- **I-b** — adaptateur + `crossAgentGate` réel :
  - `adapter-shogen.ts` : `fromShogen(lot, verdictText, constat): AdapterOutput | AdapterError` (mappage figé D3) ;
    **enveloppe `AdapterOutput` (K-1)** `{ price, provenance:{source_lot_sha256,source_verdict_sha256,shogen_head_sha}, label }` ;
    seul `price` passe `assertClosedAttestedPrice` ; **test 29** (couple réel ⊨ schéma) ; `adapter_output_carries_demonstrative_label` (mutant : label absent/« probative » ⇒ rouge) ; `adapter_maps_shogen_triple` (mutant : champ mal mappé ⇒ rouge).
  - **`crossAgentGate` réel** `(price, prediction, ctx)` remplace le stub ; **test 30** `cross_agent_gate_end_to_end` (mutant nommé).
- **Pendant M003 CA-I (K-5)** : tests 31/41, `utterance-prix.ts`, panneau atelier UKEMI **non réduits silencieusement** — owner = lot post-H5 (ou M003 Lot I-c), consigné §4/PF.

### H3 — `attest` : expose Lot I (`fromShogen`) en MCP, enveloppe + label démonstratif
**Dépend de** : H1 **et Lot I-b**. **Isolé (C-5)** : `src/tools/attest.ts` + 1 ligne registre.
- Sur la fixture Shōgen commise, retourne `AdapterOutput` (K-1) ; `price` ⊨ `assertClosedAttestedPrice` ; **label** « real,
  notary Shōgen, demonstrative, not probative ». **Description (N-4/K-9)** : « projection of a committed Shōgen-verified witness
  (Binance BTCUSDT, self-notarized); the verifier is not executed at call time. »
- Tests : `attest_output_is_frozen_attested_price` (clé hors contrat ⇒ throw) ; `attest_makes_no_probative_claim` (mutant : « live »/« verified »/« probative » ⇒ rouge).

### H4 — miroir HTTP/JSON + déploiement **investisseur** (Q2) + export (Q-A)
**Dépend de** : H1 (H2/Lot I/H3 pour la surface complète). **Prérequis** : PF-2 DNS (repli déclaré).
- `src/http.ts` : 3 opérations JSON ; **OpenAPI dérivé** (test 43 `openapi_generated_matches_frozen_schemas`).
- `docs/RUNBOOK-harness.md` (anglais) + `scripts/verify-harness.mjs` **commis** ; systemd `monark-harness` (port 3001,
  **lié 127.0.0.1**) ; Caddy `mcp./api. → 127.0.0.1:3001` **après DNS**. **L'agent ne SSH pas** ; investisseur exécute ; CA enregistrée par l'investisseur.
- **Export (Q-A)** : `apps/harness` + `fixtures/s3-binance.*` entrent en liste blanche `export-public.mjs` ; **test 42** couvre le harnais.
- Tests : `openapi_generated_matches_frozen_schemas` ; `no_secret_in_repo` ; `harness_export_whitelisted` (Q-A).

### H5 — démonstration bout-en-bout enregistrée
**Dépend de** : H2, H3, H4.
- **C-6** : `probe_harness_records_real_decision` vise un serveur **in-process** en CI (endpoint déployé = CA manuelle
  investisseur, URL/date/sha256). Trace = `fixtures/` (+ manifest).
- Sonde : `cascade`(UKEMI)→`Prediction`, puis `gate`→`GateDecision`. **Résultat honnête attendu** : chemin cascade
  **`abstain`/`under_calib`** (pas de calibration cascade, D5) ; sur `btc-dir-15m`, décision synthétique commise. Trace **déclare** : `synthetic`, B_t caller-carried, `attest` démonstratif.
- Test : mutant « trace figée/mock » ⇒ rouge.

## 4. Ordre & parallélisme
PR gouvernance → **H1** → (**H2** ∥ **Lot I-a** → **Lot I-b**) → **H3** (après I-b) → **H4** → **H5**. Fan-out H2 ∥ Lot I
**justifié par l'isolation** (`apps/harness` vs `packages/monark`), jamais par le débit. Reste séquentiel.

## 5. Oracle par lot (R-21) & MAST
Oracle : `npm run ci` + `npm run lint` + `lint:ratchet` 92/92 + `lang-gate --scope harness` + `grep-forbidden` verts ;
`git diff main -- schemas/ packages/contracts/` **0 octet** ; R-25 < 1205 ; sha des non-commités restaurés byte-exact après mutant (oracle = sha256).

| MAST | Contre-mesure |
|---|---|
| Maquette présentée comme réel | primitives réelles (Q1) ; H5 traverse la chaîne ; anti-mock ; `synthetic`/`démonstratif` ; cascade `under_calib` déclaré (test K-4e) |
| Générateur = vérificateur | G2 fraîche ; R-21 ; checkpoint-2 |
| Revendication non fondée | `attest_makes_no_probative_claim` ; honnêteté hors contrat gelé (enveloppe, K-1) |
| Fuite de secret | `no_secret_in_repo` ; harnais déployé par l'investisseur ; vitrine ratifiée (Q-B), clé inchangée |
| Dérive périmètre (trading) | `gate_tool_never_calls_tool` ; `mcp_tools_have_no_side_effects` (oracle K-8) |
| Artefact tiers dans zone scannée/exportée (N-1) | exemption chemin `lang-exempt.json` (K-2) ; export whitelisté (Q-A) ; sha256 épinglé |
| Décrochage dépendance | PF-1 (SDK) ; PF-2 DNS (repli) ; PF-5 rejeu (owner = agent) |

## 6. Hors périmètre
Agent Hermes **appelant** (phase ultérieure séquencée) ; paiement/x402/clés acheteurs (post-pivot) ; calibration cascade
réelle (jusque-là abstention honnête) ; session TLSN Coinbase par Shōgen (F:\Shogen, hors M005) ; pendant M003 CA-I (K-5, owner post-H5).

## 7. Demande d'approbation (checkpoint-1 final)
Décision : **approuver ADR-M005 + ce PLAN + Addendum D16 (M004) + entrée journal avant tout code**. Intégrés :
C-1..C-10 (checkpoint-1 #1) ; K-1..K-9 (checkpoint-1 #2 : K-1 enveloppe, K-2 fixtures lang-exempt, K-3 scope réel, K-4
gate précisé, K-5 Lot I scindé + M003 CA-I, K-6 PF-5 owner agent, K-7 D16+journal, K-8 ancrages tests, K-9 Origin+description) ;
décisions Q1/Q2/Q-A/Q-B.
