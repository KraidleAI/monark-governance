# CHECKPOINT-2 bis (borné) — lot U-1a-hard-2, pli U-1a-hard-3, gel candidat `bac4a15` (`lot/u-1a-hard-2`, base `e8bcfe4`)
Validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2bis-u1ahard3\` (`tree/` = `git archive`, `mut/` scripts + TAP bruts, `clone/` sans hardlinks, `merged/` = arbre `merge-tree`) ; persisté par l'orchestrateur. **Décision : ACCEPTE.**

## Périmètre borné, rejoué
1. **Delta `1d286f0→bac4a15`** : 3 tests (+69/−8) + PLI ; `apps/sentinel/src` identique ; `record.ts 71c542e7…`, `rpc2.ts 720d399e…`, `book.ts a539eabb…` recomputés = PIN ; sha des 3 fichiers livrés = PLI = commit = worktree ; PIN `034fbff9` intact.
2. **Re-mesure R2** (paire, flags de `package.json`) : vert 34/34 en 1,76 s ; **R2 exit 1, mur 10 319 ms puis 10 318 ms**, 3 rouges = `retry_is_bounded` 30 ms, `backoff_cap_is_wired_at_call_site` **6,3 ms** (120,4 s au gel précédent), `classifies_rpc_errors` annulé à son cap 10 s ; `network_fault_call_site` reste vert (R2 = chemin HTTP seul). Critère < 15 s tenu, reproduit 2×, concordant avec le worker.
3. **Mutant V-E** (cap ignoré `record.ts:67` seul) : exit 1, seul le test réseau rouge, le 5xx vert ⇒ spécificité prouvée.
4. **Mutants V-3** (`test/ci-gates.test.ts`, 24/24 base) : suppression `timeout-minutes` g3, g6 → 30, retrait `--test-force-exit`, **démotion de `timeout-minutes` au niveau step (8 espaces)**, retrait `--test-timeout=` ⇒ 5 rouges, seul le test V-3 rougit ; restaurations = PIN. Driver 19 mutants du checkpoint-2 rejoué : 17/19 rouges, **V-E basculé survivant → rouge**, V-C/V-D survivants déclarés.
5. **Oracle `git archive bac4a15`** : **345/345**, lint 0, ratchet 69/69, lang-gate 0, export:check 0.
6. **Fusion (clone)** contre `lot/etude-suite` `beb0adc` : `merge-tree` **exit 0, aucun conflit** (merge-base `a3f85f4`) ; l'auto-fusion est l'UNION vérifiée sur pièces (`ci.yml` : 5 `timeout-minutes` niveau job + ligne `STAT=` avec D9 septies + sexies + séries Bell ; `package.json` deux flags ; `ci-gates` 25 tests). Oracle sur l'arbre fusionné : **365/365** (= 346 + 19 : le lot U-1a-hard `e8bcfe4` n'a jamais été fusionné, O-2 — l'attente « 348 » du brief était fausse), lint 0, ratchet 69/69. **R-25 sous la STAT fusionnée : 648 ≤ 1 205** ⇒ fusion unique licite (le 587 du checkpoint-2 était sous la pathspec pré-Bell).
7. **CA-11** : aucun import de `ukemi/record` hors `apps/sentinel/{src/ukemi,test}` ; `fleet.ts` sans entrée recorder ; ADR-EC l.45 « recorder `upcoming` ». Conforme.
8. **Arbitrage §F** : observation du worker → **item formé §F-1**, non bloquant — la sortie sous R2 est à 100 % le cap de `classifies_rpc_errors` (marge ≈ 4,7 s sous 15 s ; un second test à cap seul la consommerait). Déclencheur : tout nouveau test de la paire exerçant `makeDefaultCall` sur un stub transitoire persistant avec cap seul, ou le prochain pli touchant `ukemi.test.ts` ; action : cas (c) en stub-succès à `retries+1`, cap conservé, mesure R2 rejouée ; `error_origin` aucun ; propriétaire orchestrateur.

## Checklist
CA-6 conforme (345/345, 365/365, R2/V-E/V-3/19 mutants rejoués) · CA-7 conforme (« aucune dette » vérifié ; §F-1 formé) · CA-8 conforme (V-2 confirmée pliée sur etude-suite ; V-4 dû au G7) · CA-9 conforme · CA-10 conforme (delta 77 lignes) · CA-11 conforme.

## Items pour le G7 (liste fermée)
1. V-4 `error_origin` du CLI no-op. 2. V-C survivant déclaré (snippet `record.ts:86`), non bloquant. 3. V-D survivant déclaré (txHash non minusculé `rpc2.ts:84`), non bloquant. 4. §F-1 à inscrire dans CHANTIERS. 5. Attente 348 → **365** ; R-25 de la PR **648**.

## AM-1 / preuve
Attrapé : attente arithmétique du brief (O-2 ignoré) ; ancre dégénérée de mon propre mutant M4, remplacée par un mutant vérifié ; marge < 15 s portée par un seul cap (→ §F-1). Sha avant = après sur les deux arbres ; `git status` vide ; aucune écriture hors `F:\tmp\cp2bis-u1ahard3\` ; oracles séquentiels.
