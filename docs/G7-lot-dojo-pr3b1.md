# G7 — lot Dōjō PR-3b-1 (unité de collecte systemd sur l'hôte : service + timer, `dojo-deploy`, `dojo-eve`, `dojo-seed`, RUNBOOK) — 2026-09-27

- **Orchestrateur** : `claude-fable-5-1`. Branche `lot/dojo-editeur-hote`, gel 1 `82b62df` (après corrections G2), fusion du tronc `d8399ff` (cp-2 C-V-3 : FAITS-SYSTEMD-TIMEOUT-1 `1e179d2`), **gel 2 `c9a15f9`** (plis documentaires après cp-2 : C-V-1, C-V-2, C-V-4, C-V-5, C-V-6, `error_origin`, pli A-2, TU-C clos, DOJO-UNLOCK-CHAIN-TEST-1). Base `7d8a7f2`.
- **Chaîne** : G0 ADR-DOJO-PR-3 (cp-1 approuvé) → G1 (journal `docs/G1-lot-dojo-pr3b1.md`) → G2 (`F:\tmp\dojo\g2-pr3b1\G2-report.md`, sha `b2223895…`) → corrections (passage 2 : 7/7 gates, R-25 537, mutants 57/59) → gel 1 → **cp-2 `F:\tmp\cp2-pr3b1\CP2-report.md` (sha `b6dea232…`, Fable 5.1, 19:27:59Z) : ACCEPTE-AVEC-CORRECTIONS**, 7/7 + test 42 rejoués, R-25 537, mutants 45/47 propres, P-11/P-12 rejouées, conformité ligne à ligne à la ligne datée 15:00Z.

## Verdict : **G7 PRONONCÉ — fusion `--no-ff` dans `lot/etude-suite`**, sous les conditions suivantes, toutes tenues ou formées
1. C-V-1 (tuyaux A-11-rep et `unlock` déclarés au §3/§4 de l'ADR ; TU-C composé sans skip, servi à A-7 ; 8 tests) : **fait** (gel 2).
2. C-V-2 (ratification des items §14.5/§14.6 + trois items du G2 ; Q-C4 compléments FAITS **faits** sur le tronc) : **fait**.
3. C-V-3 (branche au niveau du tronc pour FAITS-SYSTEMD-TIMEOUT-1) : **fait** (`d8399ff`).
4. C-V-4 (P-5b : « survivante du test boîte noire, tuée par une trace fs » ; item **DOJO-SEED-FS-TRACE-1**, ≈ 18 lignes, déclencheur avant A-4, porté par DRAND-1b — Q-V2) : **formé**.
5. C-V-5 (V16, chemin sondé à la racine) : ligne datée, **au prochain lot touchant le test** (Q-V1 : gel non rouvert pour 0 ligne nette).
6. C-V-6 (1 205 → 1 210 s) : **fait**.
7. Q-V3 : « 9 tests » de la mission cp-2 = coquille (8 tests) ; `error_origin` orchestrateur, sans effet.
8. Fusion rejouée : sept portes + test 42 sur le tronc fusionné, sous verrou d'hôte (résultat consigné dans CHANTIERS à la ligne de fusion ; toute porte rouge = fusion annulée avant push).

## `error_origin` assignés (proposés par le cp-2 §4.3, confirmés)
- C-G2-1..4 : planificateur (ADR PR-2 D-1 / ADR PR-3 D-1, D-3, TB-7) ; C-G2-3/4/5/6/7/8/11 : générateur G1 en second.
- 1 205 → 1 210 s : orchestrateur (ligne 15:00Z) et relecteur G2 (arithmétique), sans effet. « 9 tests » : orchestrateur.
- Échec non reproduit du passage 1 du correcteur (test 42 intérieur sans nom) : environnement d'oracle (cause non établie) ; nom absent : générateur de test 42 → item EXPORT-TEST42-INNER-NAMES-1.
- P-5b « équivalent déclaré » : correcteur (libellé) ; trou du test : G1 (limite déclarée dès le G2). V16 : G1 ; découvert par un mutant du cp-2.
- Lacune CA-9 consignée a posteriori (AM-1) : deux « équivalences » déclarées sans oracle dynamique dans la même journée (P-5b ici ; « équivalent sur cet hôte » à PR-2b-3) — règle pour les prochains cp-2 : toute équivalence déclarée est rejouée par un oracle dynamique (trace fs, injection) avant acceptation.

## Registre public et actes
- Le lot reste **`upcoming`** (ADR D-2) : l'unité n'est pas déployée ; les actes d'hôte A-2..A-7 restent sous **go groupé** de l'investisseur (cp-1 C-V-4), aucun exécuté. Le go de redéploiement de la décision 260 ne les couvre pas (il vise harnais S1, sentinelle PX-14, clé K-1).
- Registre PAROXYSME de la pièce (à porter au fichier de la pièce Dōjō quand il sera créé) : RPC-GUARD-BODY-TIMEOUT-1 (avant A-7), DOJO-COLLECT-STEP-COURSES-1 (G1 DRAND-1b), DOJO-SEED-FS-TRACE-1 (avant A-4), DOJO-UNIT-OFFLINE-ORACLE-1, DOJO-UNLOCK-CHAIN-TEST-1, EXPORT-TEST42-INNER-NAMES-1, DOJO-ANCHOR-CRED-PATH-1 (G1 DRAND-1b).
- Zéro dette : chaque reste est un item formé avec déclencheur et porteur (ADR §7 après pli).
