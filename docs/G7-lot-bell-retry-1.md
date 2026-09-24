# G7 — BELL-RETRY-1 (NonJsonBody transitoire côté Bell) — ACCEPTED, fusion `4db059e` (D-n : à une frontière de tirage)

Orchestrateur Fable 5.1, 2026-09-22 16:51 UTC (`date -u`). Branche `lot/bell-retry-1` @ `67180af` (G1 `d0584fa` + plis `2234808`/`3854174`/`67180af`), fourche `1f4b746`, fusionnée `--no-ff` sans conflit. Déclencheur de fusion : 3ᵉ arrêt `NonJsonBody` du mint TSLAx (4 571 pages, 16:42:58 UTC) — règle de la décision 131 ; D-n consignée (ruling 15:42 UTC, 4 points).

## 1. Oracle sur l'arbre FUSIONNÉ `fc8514b` (clés retirées du process)
`npm run ci` → 0 : **901 / 901 / 0 fail / 0 skip** ; lint 0 ; ratchet 69/69 ; lang:gate 0 ; export:check 0. `quorum.ts` sha LF `5871b4b6…` (= DELIVERED). Incident indépendant du lot, corrigé au passage (`fc8514b`) : le golden du prober (1b-2) embarquait le sha vivant du prereg — rougi par l'édition docs-only `a75dbf1` ; golden désormais haché avec le sha masqué, re-baseliné une fois, indépendance prouvée par mutation à blanc du prereg. `error_origin` : plan (golden couplé à un document vivant) ; relecture du correctif jointe à celle d'UKEMI-RETRY-1.

## 2. Lignée
G1 `docs/G1-lot-bell-retry-1.md` (9 mutants, 872/871/0/1, R-25 143) → G2 `docs/G2-lot-bell-retry-1.md` PASS-AVEC-CORRECTIONS (C1 frères non nommés → R-BR3/R-BR4 ; C2 borne 500 ; C3 résolu au pli ; C4 ADR :502/:728) → checkpoint-2 `docs/CHECKPOINT2-lot-bell-retry-1.md` ACCEPTE-AVEC-CORRECTIONS (C-1 ADR foldé ; C-2 201/204 ; C-3 R-BR2 → UKEMI-RETRY-1 ; C-4 D-n ; C-5 MAST) → plis (10 mutants, 500 épinglé, ADR révisé :320/:502/:728 + amendement + items).

## 3. Livré / branchement
`isTransient` : NonJsonBody transitoire ssi code ∈ {200,429} ∪ [500,∞) ; `statusOf` → `non-json <code>` ; consommé par `withRetry` → `scanFullMint`/`collect` → artefacts servis ; test d'intégration via le vrai client gardé avec corps HTML de passerelle à 200 (le STOP TSLAx reproduit puis résolu).

## 4. Items
R-BR3 (`universe.ts:113`, avant la phase B univers), R-BR4 (`ethereum.ts:77`, 1ʳᵉ course `--eth`), R-BR1 (2xx≠200 fatal, épinglé), UKEMI-RETRY-1 (en G2 ‖ cp-2), `retries_by_method` change de sémantique à la frontière (ligne ANCHORS `mint_resume-3` porte l'époque).

## 5. `error_origin`
Classe d'erreur non qualifiée à la conception du retry : plan ; frères non nommés au G1 : worker ; borne 500 non testée : worker.
