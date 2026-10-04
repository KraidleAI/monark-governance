# G7 du lot MUTANTS-LIVE-WAITER-AHEAD-1 : les lancements en avance de `test/mutants-run.test.ts` ne dépendent plus d un délai fixe trop court

- **Plan** : `docs/G0-lot-mutants-live-waiter-ahead-1.md` (et son amendement). **Base** : `050da36d` (`origin/lot/etude-suite`). Branche `recherches/mutants-live-waiter-ahead-1`.
- **Commits** : `da6b8814` (G0), `97c02337` (G28, G27), `44310020` (G24, D-5 ; **gel**), `944154dc` (amendement du G0), puis ce G7. Hôte de mesure : Linux, Node 24.21.0, 4 cœurs, partagé avec d autres sessions (charge moyenne de 3 à 66 pendant les mesures).
- **Demande** : MONARK, item MUTANTS-LIVE-WAITER-AHEAD-1 (#130 attend).

## Reproduction à la base `050da36d`

- **Délai injecté** : une copie de travail du fichier (non suivie, supprimée ensuite) ajoute au seul lancement de G28 un `--import` qui bloque le démarrage de l outil (`Atomics.wait`). `node --test --test-name-pattern=mutants_a_live_waiter_ahead` :
  - délai 0 : vert ;
  - délai 7 000 ms : **rouge**, `actual: [ 0, false ]`, `expected: [ 0, true ]`, le relevé de MONARK.
- **Charge seule** : 16 boucles de calcul sur 4 cœurs (charge moyenne 53, 680 s pour le fichier) : base verte sur Linux. La charge seule ne rend pas l aléa certain ici ; le délai injecté, si.
- **Rouge trouvé en route** : sous 8 boucles de calcul, avec le seul correctif de G28 et G27, `mutants_a_time_overrun_is_non_conclu_and_never_replayed` a rougi (ligne de base `'non conclu'` contre `'vert'`, chaque ligne `'non conclu (base)'`) : la ligne de base de `overrun` dépassait sa borne de 5 s. D où l amendement du G0 (règle 4) et le commit `44310020`.

## Changement (tests seuls)

| Lancement | Avant | Après |
|---|---|---|
| G28 `liveWaiter` | attendant `setTimeout(…, 6000)`, 6 s depuis son lancement | l attendant lit la file toutes les 20 ms jusqu à l entrée de l outil, puis vit `HOLD` = 1 500 ms ; tué par le test (`finally`) après l outil ; assertion `lock_wait_ms >= HOLD` |
| G27 `lockBound` | `run` synchrone, `WAIT` 2 000, borne `WAIT + POLL + MARGIN` = 3 600 | lancé en avance (`runAsync`), `WAIT` 3 000, borne `KILL = 2 * WAIT` = 6 000 : marge aux minuteries en retard 3 000 ms (1 600 avant) |
| G24 `deadTsc` | `--timeout-ms 300`, borne de 3 s | `--timeout-ms` `OVER` = 1 500, borne 15 s |
| D-5 `overrun` | `--timeout-ms 500`, borne de 5 s, module de G1 endormi 9 s | `--timeout-ms` `OVER`, borne 15 s, module de G1 endormi `10 * OVER + 5000` = 20 s |

`heldOwners`, `hostLock` et `lockStop` : aucun délai fixe (G0, règle 3), inchangés.

## Même délai injecté au gel

G28 : délai 0 vert (2,97 s) ; 7 000 ms **vert** (9,7 s) ; 15 000 ms **vert** (17,5 s). Aucun processus attendant restant après le fichier.

## Tueurs, vérifiés à la main au gel (mutant appliqué, test lancé seul, fichier rendu)

| Test | Mutant | Résultat |
|---|---|---|
| G28 | `run.mjs:232 "lock_wait_ms: lk.waitedMs" -> "lock_wait_ms: 0"` | **tué**, `[0, false]` |
| G27 | `run.mjs:231 "maxMs: o.wait }" -> "maxMs: 2 * o.wait }"` | **tué**, `[4, 'verrou', true, false]` |
| G27 | `run.mjs:231 "maxMs: o.wait }" -> "maxMs: 3 * o.wait }"` | **tué**, `[4, 'verrou', true, false]` |
| G24 | `run.mjs:224 "r.error !== undefined \|\| … ? \"non conclu\"" -> "false ? \"non conclu\""` | **tué** |
| D-5 | `run.mjs:267 "!first.timed_out" -> "true"` | **tué** |

## Oracle

- `node scripts/red-proof.mjs --base 050da36d --gel <worktree> --repo <worktree> --test-only` : **OK**, exit 0 ; 2 tests jugés (G28, G27, `pinned`), 43 inchangés, `files.production` vide ; tueurs `run.mjs:232` et `run.mjs:231` tirés au gel : **tués** ; `RED-PROOF.json` sha256 `d37d1dfb1ec2…`. Les tests de G24 et D-5 ne sont pas jugés : leur corps est inchangé, seuls leurs lancements en avance changent ; leurs tueurs sont vérifiés à la main ci-dessus.
- `verifie-ancres.mjs . --files test/mutants-run.test.ts --ref 050da36d` : **45 tueurs, 45 ANCRE, 0 DERIVE, 0 PERDU**.
- `node --test test/mutants-run.test.ts` **5 fois sous 8 boucles de calcul** : 45/45 chaque fois, **0 échec** (470, 287, 252, 108, 139 s).
- Durée du fichier sans boucle, base puis gel, en alternance : 31,2 / 29,3 / 31,9 / 27,4 s. Aucune hausse : G27 part en avance, les 15 s de `OVER` se recouvrent.
- `npm test` complet au gel : 2196 tests, 2176 verts, 19 sautés, **1 échec, le seul test 42** (« exported CI ran an implausibly small suite », aléa connu) ; relancé seul : **vert**.
- `tsc --noEmit` vert ; `lint` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 sur `050da36d...44310020` hors `docs/**/*.md` : un fichier, +31/−17, **48 lignes** (sous 547) ; même chiffre contre `318a3238`, base de la PR après la fusion du tronc.

## Écarts au plan

- Règle 4 ajoutée par amendement (`944154dc`) : `deadTsc` et `overrun` n étaient pas dans la demande ; la mesure sous charge les a montrés dépendants d un délai fixe, au même titre que G27.
- G32 (`mutants_a_memory_stop_at_the_baseline_is_not_waited_again_by_the_typecheck_baseline`) garde sa borne `waited_ms < 600` (attente 300 ms) : elle n est pas un lancement en avance, ne tue aucun mutant à elle seule (le mutant `run.mjs:243 " || stop !== null ?" -> " ?"`, appliqué à la main, est tué par `at` : `'BASELINE-TYPECHECK'` contre `'BASELINE'`), et a tenu sur les 6 exécutions chargées. Signalée, hors lot.

## G2

G2 neuve : APPROUVE, aucun bloquant (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-mutants-live-waiter-ahead-1.md`). Mineures pliées sans déplacer de ligne :
- m-1 : l attendant a son propre plafond de 120 s (`setTimeout(() => process.exit(0), 120000).unref()`), pour le cas où le processus de test meurt avant l outil ; la règle 1 du G0 tient aussi dans ce cas.
- m-2 : l écriture de l entrée de file passe dans le `try`, l attendant est tué même si elle lève.
- m-3 : le commentaire ne nomme plus une constante `LATE` inexistante ; R-25 précisé contre `318a3238`.
