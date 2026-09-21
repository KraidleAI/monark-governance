# CHECKPOINT-2 — NARABI-OPS-1b-ii-b (validateur-humain `claude-fable-5-1`, 2026-09-21, HEAD `7b0459b`)

**Décision : ACCEPTE-AVEC-CORRECTIONS pour -b en isolation (G7 de -b rendable) + ESCALADE-INVESTISSEUR sur l'exécution d'E-5.**

## Re-exécuté par le validateur (AM-2)
Suite complète 514/514 (41,4 s) ; `npm run ci` exit 0 (gate:vocab 181, typecheck 0) ; flakiness 5/5 × 10/10 ; mutants N-G2-3, R, T, N-G2-1 rejoués : chacun rougit SEUL son test nommé, restauration sha `1001c1cd…` 4/4 ; R-25 `57e9cbc...HEAD` = 535 ins + 13 del = 548 ≤ 1205 ; sha des 8 fichiers avant == après, `git status` vide ; aucun code mail dans le worktree, tous les serveurs loopback, env SMTP/ALERT/PROBE vide.

## Checklist
CA-1 n-a ; **CA-2 → ESCALADE** (la décision 92 a été rendue sur le seul Mode B « kill en plein append » ; le Mode A « livelock de rattrapage ≥ ~12 j », plus probable et introduit par la borne `TimeoutStartSec=300` du livrable, est apparu après) ; CA-3 conforme (amendement ADR-NARABI-OPS-1 :86-108, tuyaux :83-84) ; CA-4/5/6/8/9/10 conformes ; CA-7 conforme (item `run.ts` FORMÉ, pas une dette : esquisses A/B, motif load-bearing `run.ts:170-175`, déclencheur avant E-5) ; CA-11 + durci conformes (registre `upcoming`, sonde réelle lancée en sous-processus depuis les octets committés `NARABI_SNAPSHOT`).

## Corrections (liste fermée)
1. **[Bloquant pour le G7 COMBINÉ, pas pour -b]** la fusion -a + -b (6 blocs de conflit résolus à la main) doit recevoir : G2 par relecteur séparé + suite complète + checkpoint-2 SUR L'ÉTAT FUSIONNÉ avant tout déploiement ; sous-liste : (a) tueur N4 vert (`test/probe-narabi.test.ts:337`) ; (b) `--state-file` accepté avant le `else { throw }` de -a (`probe-narabi.mjs:459`) ; (c) `schema:2`, `state_checked` posé une seule fois (`:331`) ; (d) C-G2-3 assertion `TimeoutStartSec > MAX_TIMEOUT_MS·(MAX_RETRIES+1) + STATE_TIMEOUT_MS·(STATE_RETRIES+1) + MAX_SMTP_DEADLINE_MS + START_MARGIN_MS` (120 > 100) ; (e) C-G2-4 `test/probe-narabi-state.test.ts` dans `vocab-banned.json:111` + preuve par phrase interdite injectée ; (f) en-tête `probe-narabi.mjs:6,10-11` corrigé. La décision 72 se lit sur le commit fusionné.
2. **[ESCALADE-INVESTISSEUR — E-5 ne s'exécute pas avant réponse]** maintenir le redéploiement avec la borne 300 s et le résiduel documenté (RUNBOOK §6 Mode A, réparation A.1), ou exiger d'abord l'atténuation `run.ts` (G0/ADR). Reco du validateur : maintenir avec le résiduel.
3. **[Non bloquant]** RUNBOOK §6 A.2 (`:245-248`) : `node` nu sous `systemd-run` vs `/usr/bin/env node` de l'unité (`:28`) — aligner ou vérifier le PATH au déploiement.

AM-1 : attrapé — décision 92 rendue sur risque incomplet ; déviation parallèle -a/-b vs plan séquentiel ⇒ fusion sans revue. Preuve de non-écriture : `F:\tmp\cp2-narabi1b2b\`.
