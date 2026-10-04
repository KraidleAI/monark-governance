# G7 du lot MUTANTS-WAITER-ZOMBIE-1 : un zombie ne tient plus le verrou, et le test G28 ne bloque plus sa boucle

- **Plan** : `docs/G0-lot-mutants-waiter-zombie-1.md` (commit `f1bec142`).
- **Base** : `dbdc8433` (`origin/lot/etude-suite`). **Gel** : branche `recherches/mutants-waiter-zombie-1` ; tests `7545a315`, correctif `c2b167e3`.
- **Node** : 24.21.0 (version de la CI), installé hors dépôt ; Linux, 4 coeurs, hôte partagé et chargé (charge 5 à 13).

## Reproduction (base)

`node --test --test-name-pattern=a_live_waiter test/mutants-run.test.ts` : toujours en cours à 90 s (tué par `timeout 90`). `ps -o pid,ppid,stat` à 74 s : l attendant `10480` en état `Z`, enfant du processus de test `10318` bloqué dans `spawnSync` ; l outil `10483` sonde toujours la file. Fichier entier à la base : G28 échoue à **600 122 ms** (borne de `spawnSync`), 42/43 verts, **662 s**.

## Correctif

1. **Production** (`scripts/oracle/lock.mjs`) : `alive(pid)` vaut `process.kill(pid, 0) && !zombie(pid)`. `zombie` lit `/proc/<pid>/stat` et regarde le caractère qui suit la dernière `)` + espace ; `Z` : mort. Sans `/proc` ou sur erreur de lecture : `false`, donc `kill(pid, 0)` seul décide comme avant. Seule la ligne 13 change parmi les lignes existantes (fonction ajoutée en fin de fichier) : les lignes `killer:` de `lock.mjs:15` et `:33` restent justes.
2. **Test G28** (`test/mutants-run.test.ts`) : `run()` est scindé en `cmd()` (argv, env, out) et `done()` (lecture de `RESULTS.json`) ; `runAsync()` lance l outil par `spawn` et attend `close`. G28 devient asynchrone (`timeout: 90_000`) et passe `--wait-ms 60000` à l outil. Intention G28 inchangée : attendant vivant 6 s en tête de file, l outil passe après lui, `lock_wait_ms >= 1000`, exit 0.
3. **Régression** (`test/oracle-run.test.ts`) : `oracle_lock_alive_reads_a_zombie_as_dead`. `sh -c "sleep 0.3 & echo $!; exec sleep 25"` : le `sleep` qui remplace `sh` ne récolte jamais son enfant, vrai zombie. Le test attend l état `Z`, puis une sonde Node importe `lock.mjs` : `[alive(zombie), alive(process.pid)]` doit valoir `[false,true]`. Borne 30 s, sauté sans `/proc`. Tueur : `lock.mjs:13 CONST "process.kill(pid, 0) && !zombie(pid)" -> "process.kill(pid, 0)"`.

Chacun des deux côtés suffit seul : le G28 de la base passe en 6,8 s avec le seul correctif de production ; le nouveau G28 passe en 7,5 s sur le `lock.mjs` de la base.

## Windows (sans /proc)

Simulé sous Linux : `readFileSync` de `node:fs` remplacé pour lever `ENOENT` sur `/proc/*` (`syncBuiltinESMExports`). Base et gel donnent le même résultat : `{aliveZombie: true, aliveSelf: true, aliveDead: false, alivePid1: true}`. Le chemin sans `/proc` garde le comportement d aujourd hui.

## Durée de `test/mutants-run.test.ts` (Linux, Node 24, drapeaux de `npm test`)

| | Base `dbdc8433` | Gel |
|---|---|---|
| fichier entier | 662 s, 42/43 (G28 rouge à 600 s) | **72 s**, 43/43 |
| G28 seul | plus de 90 s (sans fin jusqu à 600 s) | 6,5 s |

## Red-proof

`node scripts/red-proof.mjs --base dbdc8433 --gel <worktree> --draw 2 --seed 37` : **REFUSED** (exit 1), 2 tests jugés, 55 inchangés, 1 tueur tiré ; `RED-PROOF.json` sha256 `a4a6534cc1b60c89…`. `oracle_lock_alive_reads_a_zombie_as_dead` : **F2P**, tueur `lock.mjs:13` **tué**. G28 : refusé, « green at base: a self-confirming test » : attendu, son changement est une robustesse du test (la boucle libre récolte l attendant), verte sur le `lock.mjs` de la base. Son tueur (`run.mjs:232`) n est donc pas tirable. Pas de troncature TAP ; aucun refus de tueur.

## Portes

- `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` 0.
- `test/oracle-run.test.ts` : 14/14, 30 s.
- `npm test` (Node 24) : 2 076 tests, 2 063 verts, 12 sautés, 1 échec toléré (`bell_served_collector_revision_is_a_collector_commit`, objet absent du clone ; la CI prend `fetch-depth: 0`). 461 s sur un hôte chargé.

## R-25

`r25()` sur `dbdc8433...HEAD` : STAT 40 insertions, 9 suppressions, **49** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0. Documents `docs/**/*.md` hors du compte.

## Écarts

- Node 24 installé hors dépôt : l hôte n a que Node 22.
- Mesure « avant » dans un clone local de la base (`node_modules` lié, exclu par `.git/info/exclude` : sinon l outil refuse `tool_tree`, lecture d un lien de dossier).
- Changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans l arbre, jamais commité.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
