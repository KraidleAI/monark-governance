# G0 du lot MUTANTS-WAITER-ZOMBIE-1 : un zombie ne tient pas le verrou, et le test G28 ne bloque plus sa boucle

- **Demande** : MONARK, outil urgent (décision de report de charge : `scripts/mutants/`, `scripts/oracle/` et leurs tests ouverts à RECHERCHES).
- **Base** : `dbdc8433` (`origin/lot/etude-suite`), branche `recherches/mutants-waiter-zombie-1`. Auteur : RECHERCHES.
- **Zone** : `scripts/oracle/lock.mjs`, `test/mutants-run.test.ts`, `test/oracle-run.test.ts` ; ce G0 et le G7.

## Constat

Depuis la fusion de MUTANTS-TOOL-2 (`13fa5cb2`, fusion `b47de143`), le job Linux `g3-verification` (`timeout-minutes: 10`) est annulé à 10 min sur toute PR basée sur le tronc (#118, run 37178450474 ; #119, run 37179264560). Vert sous Windows (hôte de MONARK).

## Cause racine (à confirmer par reproduction)

Le test `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` (G28, `test/mutants-run.test.ts:420`) lance par `spawn` un attendant qui vit 6 s, puis bloque dans `spawnSync` (borne 600 s). La boucle d événements du test étant bloquée, l attendant fini n est jamais récolté : il reste zombie (état Z). `alive()` (`scripts/oracle/lock.mjs:13`) lit `process.kill(pid, 0)`, qui réussit sur un zombie : l outil attend donc sans fin la tête de file, jusqu à la borne de 600 s, au delà des 10 min du job.

## Règle

1. **Production** : sous Linux, `alive(pid)` lit `/proc/<pid>/stat` ; l état est le champ qui suit la dernière `)`. État `Z` : mort (un zombie ne tient aucun verrou). Sans `/proc` (Windows, macOS) ou fichier illisible : comportement actuel inchangé (`process.kill(pid, 0)` seul).
2. **Test G28** : intention gardée (un attendant vivant en tête de file passe d abord, puis la campagne continue, `lock_wait_ms >= 1000`). L outil est lancé par un `spawn` asynchrone : la boucle du test reste libre et récolte l attendant. L outil reçoit `--wait-ms 60000` : un blocage devient un échec nommé, jamais une annulation du job.
3. **Régression** : un test de `alive()` sur un vrai zombie (enfant d un `sleep` lancé par `sh`, qui ne récolte jamais), borné à 30 s, sauté sans `/proc`. Rouge à la base par assertion, vert après le correctif. Ligne `killer:` sur `lock.mjs`.

## Preuve

Reproduction (Node 24, Linux, `ps -o stat`), tests d abord puis correctif, red-proof contre le tronc (`--draw <n> --seed 37`), durée du fichier `test/mutants-run.test.ts` avant et après, `tsc`, eslint, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Taille

Trois fichiers de code, environ 40 lignes. Borne R-25 : 547.
