# Checkpoint-1 (PLAN) — ADR-M008 F1 (Narabi) — avis validateur + disposition

> Persistance de l'avis du **validateur-humain** (`claude-fable-5-1`) rendu le 2026-09-12 au checkpoint-1
> AgileGates (approbation du PLAN avant code) : **ACCEPTE-AVEC-CORRECTIONS**, liste fermée de 12 corrections.
> Consigné (C-6 du checkpoint-2) pour la traçabilité — les 12 étaient sinon irretraçables. Chaque correction
> ci-dessous porte sa disposition dans le livrable F1.

| # | Correction (checkpoint-1) | Disposition dans F1 |
|---|---------------------------|---------------------|
| 1 | Siège de D4bis (règle « borne basse > q99 ») compatible avec les contrats gelés, sinon ESCALADE | **Résolu sans amendement** : règle de décision **côté appelant**, q99 caller-carried ; MONARK émet commit/defer/abstain sur la couverture, jamais `swap_out`/`alerte` ; aucun nouveau `GateAction`/`CoverageReason` (D4bis). Pas d'escalade. |
| 2 | `honestyText` : phrase dédiée à la classe vélocité + description + test négatif | `STABLE_RUN_UNCALIBRATED_SENTENCE` (gate.ts) + branche `honestyText` + `GATE_TOOL_DESCRIPTION` + test `gate_stable_run_honesty_text_is_distinct_from_cascade`. |
| 3 | Garde anti-override inclut la nouvelle classe + test | `gate.ts` garde `TASK_STABLE_RUN` + test `gate_stable_run_anti_override_guard`. |
| 4 | Les 3 porteurs K-1 (description + content + label d'enveloppe adaptateur) | `NARABI_LABEL` (enveloppe adaptateur) + `STABLE_RUN_UNCALIBRATED_SENTENCE` (description + content gate). |
| 5 | Zone gelée : `contracts-frozen` 5→6 + `ALLOWED_KEYS.attestedFlow` + `assertClosedAttestedFlow` + sync `contracts.test` | Fait (F1a) + re-baseline manifest. |
| 6 | Liste des champs = D2 verbatim (`schema_version`,`subject`,`source{chain,issuer}`,`window`, + `transport` ajouté par l'advisor) | `attested-flow.schema.json` + `types.ts` + `ALLOWED_KEYS`. |
| 7 | Chemin de l'adaptateur nommé + oracle no-I/O | `packages/monark/src/adapter-narabi.ts` + test `narabi_adapter_is_pure_no_io_no_clock`. |
| 8 | Falsifiabilité du prédicteur : `predictor_id` + formule + unité de Δ + `instant`→`produced_at` + `features_digest` | `NARABI_PREDICTOR_ID="narabi:persistence-v1"` ; Δ = heures par `window` ; `isoFromInstant` ; `features_digest=utterance.hash`. |
| 9 | Set de raisons de refus de l'adaptateur (sous-ensemble `COVERAGE_REASONS`) | `NarabiAdapterErrorReason = "non_evaluable" | "binding_broken"`. |
| 10 | Zéro dette : demande de procurement P-F-5 formée | `MONARK SUITE/biblio-F-narabi/PROCUREMENT-P-F-5-msusd-data.md` (hors repo). |
| 11 | Provenance : journal G1 + `error_origin` | `JOURNAL-PROVENANCE.md` (entrée M008 F1) + `G2-lot-m008-f1.md`. |
| 12 | Topologie (une ligne) + corriger le renvoi §7 de l'ADR | ADR §7 (topologie + checkpoints + statut). |

**Checkpoint-2 (LIVRABLE)** : ACCEPTE-AVEC-CORRECTIONS ; C-1 (garde `burns>supply` erronée — supply=clôture) et C-2 (`instant` non borné → `RangeError`) bloquantes F1b, levées ; C-3 (G2-delta) ; C-4/C-5/C-6 (ce doc + journal + comptes R-25). Détail : `G2-lot-m008-f1.md` + `JOURNAL-PROVENANCE.md`.
