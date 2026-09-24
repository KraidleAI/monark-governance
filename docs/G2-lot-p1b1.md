# Revue G2 — lot P1-b1 (ADR-M017), gel `149b535` sur `lot/p1-b1`

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 ~00:20 UTC. Persisté a posteriori
(checkpoint-2 b2 K-C2-1, `error_origin` orchestrateur : verdict connu par message seulement).

**Verdict : APPROUVÉ, 0 correction.** Oracle re-exécuté (289/289, lint 0, ratchet 69/69, export:check OK, zéro octet hors portée), mutants du G1
rejoués rouges, projection `attested` == frozen strippé, trace h5 `f4014c16…` = pin (diff 1 ligne).

Observations (non bloquantes) : F1 aucun oracle ne fixe l'ordre des gardes (mutant m5) → test ordonné à b2 ; F2 D6 revendique un contrôle de vocabulaire
plus large que l'oracle existant (nit, repris par le checkpoint-2 K2-1) ; F3 D4(5) cite la base `a40c169` au lieu de `a814973` ; F4 date du builder h5
pré-existante.
