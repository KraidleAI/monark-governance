# G0 du lot MUTANTS-RUN-TEST-DURATION-1 (avec MUTANTS-LOCK-WAIT-BOUND-LOAD-1) : `test/mutants-run.test.ts` sous 60 s dans la suite, et la borne haute de G27 nommée

- **Demande** : MONARK, `2026-10-04-MONARK-vers-RECHERCHES-colonne-0807.md` (lot 1) et `…-tronc-94974ddf.md` (item MUTANTS-LOCK-WAIT-BOUND-LOAD-1). Déclencheur atteint : #121 au tronc.
- **Base** : `ad2354df` (`origin/lot/etude-suite`, tout vert), branche `recherches/mutants-run-duration-1`. Auteur : RECHERCHES.
- **Zone** : `test/mutants-run.test.ts` seul ; ce G0 et le G7. `scripts/mutants/run.mjs` n est pas touché : aucune couture n est nécessaire.

red-proof: test-only

## Constat (Linux, 4 coeurs, Node 24.21.0, sans proxy)

- Le fichier seul, à la base : **57,2 s** (45/45). Chez MONARK : environ 72 s seul.
- Dans `npm test` complet, à la base : somme des durées des 45 tests **61,0 s** puis **60,4 s** (deux passages). Les tests d un fichier s exécutent l un après l autre : cette somme est la durée du fichier, chargement exclu.
- G27 (`mutants_the_lock_wait_stops_at_its_named_bound`) a rendu `[4, "verrou", true, false]` au premier oracle de #121 : `waited_ms >= 2000` pour `--wait-ms 1000`.

## Mesure de la cause : le clone n est pas le coût

J ai instrumenté chaque lancement de l outil dans le fichier (62 lancements, 55,9 s au total) :

- 23 lancements sont refusés avant tout clone (2,2 s au total) ;
- un clone `--no-local` suivi d un `checkout` coûte environ **32 ms** (mesuré sur 10 clones d un dépôt de la taille de la fixture). Les 39 clones font donc environ 1,3 s sur 57 s. Partager un clone par fichier ne gagnerait pas plus de 2 à 3 % ; l outil refuse d ailleurs un second lancement sur un même clone (`run.mjs:143`, test `mutants_second_launch_on_one_out_is_refused`) ;
- les fixtures sont déjà partagées par fichier : `fixture()`, `lk()`, `tyr()`, `fk()`, `campaign()` et `sp()` sont mémorisées.

Le temps est ailleurs. Une part est du calcul (`node --test` et `tsc` des enfants), et une grosse part est de l **attente pure**, que les tests font l un après l autre :

| Test | Durée seul | Ce qu il attend |
|---|---|---|
| `mutants_wait_for_a_held_oracle_lock_in_its_queue_never_take_a_live_one_and_stop_by_name` | 6,7 s | 5 verrous tenus, 1 s chacun, en série |
| `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` (G28) | 6,4 s | un attendant vivant 6 s |
| `mutants_a_time_overrun_is_non_conclu_and_never_replayed` | 6,3 s | G1 tué à sa borne de 5 s |
| `mutants_a_dead_or_silent_tsc_is_non_conclu_never_survit` | 3,3 s | Z1 tué à sa borne de 3 s |
| `mutants_take_the_host_lock_for_each_run_alone_and_never_pass_a_queued_waiter` | 2,5 s | un verrou tenu, 1,5 s |
| `mutants_a_lock_stop_between_two_mutants_names_the_mutant_and_keeps_the_rows_run` | 1,6 s | un verrou tenu, 1 s |

Soit environ 27 s d attente en série.

## Construction (écart déclaré à « un clone partagé par fichier »)

1. **Les lancements qui attendent partent ensemble au chargement du fichier.** Une aide `ahead(start)` lance `start` dans une microtâche, après l évaluation du module, donc avant le premier test. Le test correspondant attend la promesse là où il lançait l outil. L outil passe par `runAsync` (`spawn`), ce qui laisse la boucle libre. Les six propriétaires du premier test ci-dessus partent côte à côte (`Promise.all`).
2. **Assertions inchangées.** Chaque test garde ses arguments, ses valeurs attendues et sa ligne `killer:`. Seul le lancement remonte au-dessus de la ligne `killer:`, dans un bloc `ahead` nommé. Deux ajustements sont nécessaires :
   - les lancements anticipés qui prenaient la racine de verrou commune `no-lock` (la borne de temps, le `tsc` mort) prennent une racine propre, `ownLock()`. Sinon un verrou tenu par eux ferait attendre, ou arrêter (`--wait-ms 0`), un test synchrone ;
   - le premier test lit la table `held.json`, de contenu identique à `one.json`, que d autres tests réécrivent pendant ce temps.
3. **Sous `--test-name-pattern`** (`red-proof`, une campagne de mutants, un test lancé seul), rien ne part d avance. Chaque bloc démarre dans son propre test, comme avant : un test choisi seul ne paie pas les attentes des autres.
4. **`after`** attend toutes les promesses lancées avant de supprimer la racine de la fixture. Aucun enfant n écrit dans une racine supprimée, et `--test-force-exit` ne laisse pas d orphelin.

## G27 (MUTANTS-LOCK-WAIT-BOUND-LOAD-1)

- **Lecture du code.** `stop.waited_ms` part déjà de l entrée dans l attente : `t0` de `gate()` (`run.mjs:228`) est pris après le clone et le lancement, et `waited_ms: Date.now() - t0` (`run.mjs:232`). Le temps de lancement n y est donc pas. Le dépassement observé vient de la boucle d attente elle-même sous charge : des minuteries `setTimeout(pollMs)` en retard dans `acquire()` (`lock.mjs:42`). Une couture dans `run.mjs` ne mesurerait rien de plus juste.
- **Construction.** La borne haute est nommée : `WAIT + POLL + MARGIN`, avec `WAIT = 1000`, `POLL = 100` et `MARGIN = 1500`, soit 2 600 ms au lieu de 2 000. La borne basse reste `>= WAIT`.
- **Le tueur `run.mjs:231` (`maxMs: 3 * o.wait`) reste tué, quelle que soit la charge.** `acquire()` ne rend `null` qu une fois sa propre horloge à `maxMs`, et cette horloge part après celle de `gate()`. Le mutant enregistre donc toujours `waited_ms >= 3 * WAIT = 3000`, au-dessus de 2 600.
- **Limite déclarée.** Un mutant `2 * o.wait` (2 000 à 2 100 ms) n est plus tué par la borne haute. Il n est pas le tueur déclaré.

## Tueurs des tests jugés (corps modifiés)

Aucune ligne de `run.mjs` ne change : toutes les adresses `killer:` du fichier restent valides. Je vérifie les 45, chacune avec son texte avant présent une seule fois sur sa ligne. Tueurs déclarés des sept tests dont le corps change :

- `scripts/mutants/run.mjs:232 CONST "{ stop: \"verrou\", waited_ms" -> "{ stop: \"memoire\", waited_ms"`
- `scripts/mutants/run.mjs:231 CONST "mutant: id" -> "mutant: \"campaign\""`
- `scripts/mutants/run.mjs:270 CONST "at: m.id" -> "at: \"BASELINE\""`
- `scripts/mutants/run.mjs:232 CONST "lock_wait_ms: lk.waitedMs" -> "lock_wait_ms: 0"`
- `scripts/mutants/run.mjs:231 CONST "maxMs: o.wait }" -> "maxMs: 3 * o.wait }"`
- `scripts/mutants/run.mjs:224 CONST "r.error !== undefined || r.signal !== null || r.status === 134 ? \"non conclu\"" -> "false ? \"non conclu\""`
- `scripts/mutants/run.mjs:267 CONST "!first.timed_out" -> "true"`

## Preuve

- `node scripts/red-proof.mjs --base ad2354df --gel <worktree> --repo <worktree> --test-only` : chaque test jugé doit être `pinned`. `--draw` ne s applique pas en `--test-only`.
- Durée du fichier seul, et dans `npm test` complet, deux passages avant et deux après.
- `tsc --noEmit`, `npm run lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, et la suite entière à 0 échec.

## Taille

Un fichier de test, environ 90 lignes de diff. Borne R-25 : 547.
