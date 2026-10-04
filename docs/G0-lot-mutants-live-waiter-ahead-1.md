# G0 du lot MUTANTS-LIVE-WAITER-AHEAD-1 : l attendant de G28 vit jusqu à l entrée de l outil dans l attente, et G27 prend sa borne au seuil de ses mutants

- **Demande** : MONARK, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-130-attend-G28.md` (priorité haute, avant #130).
- **Base** : `050da36d` (`origin/lot/etude-suite`), branche `recherches/mutants-live-waiter-ahead-1`. Auteur : RECHERCHES.
- **Zone** : `test/mutants-run.test.ts` seul (G28, G27, G24, D-5) ; ce G0 et le G7. Aucun code de production : `scripts/mutants/` et `scripts/oracle/` sont inchangés.

red-proof: test-only

## Constat

- La relance de l oracle G7 de #130 (relevé `5406e9d1…`) rougit `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` (G28) : `[0, false]` au lieu de `[0, true]`, donc `lock_wait_ms` < 1000.
- Depuis #125 (MUTANTS-RUN-TEST-DURATION-1), `liveWaiter` part dès le chargement du fichier. L attendant est un `node -e "setTimeout(() => {}, 6000)"` : il vit 6 s comptées depuis son lancement, et non depuis l entrée de l outil dans l attente. Sous la charge de la suite, le clone et le lancement de l outil dépassent 6 s : l attendant est mort quand `acquire()` lit la file, et l attente ne dure presque rien.
- G27 (`mutants_the_lock_wait_stops_at_its_named_bound`) borne `stop.waited_ms` par `WAIT + POLL + MARGIN` = 3 600 ms. MONARK mesure 3 197 ms sous charge (Windows) : 1 197 ms de retard des minuteries, contre 1 600 de marge.

## Reproduction (à la base, avant tout correctif)

Un délai injecté avant le démarrage de l outil (un `--import` qui bloque 7 s, sur le seul lancement de G28, dans une copie de travail du fichier) : G28 rouge, `[0, false]` contre `[0, true]`, comme dans le relevé de MONARK. Sans délai, la même copie est verte. Sous 16 boucles de calcul sur 4 cœurs (charge moyenne 53, 680 s pour le fichier), la base est restée verte sur Linux : la charge seule ne suffit pas toujours, le délai injecté rend l aléa certain. Le G7 donne la mesure.

## Règle

1. **G28** : l attendant ne vit plus une durée fixe depuis son lancement. Il lit la file de son verrou (toutes les 20 ms) jusqu à y voir une entrée autre que la sienne, celle de l outil, que `acquire()` écrit au début de son attente (`scripts/oracle/lock.mjs`, `mine` à `t0`). Il vit alors encore `HOLD` = 1 500 ms, puis sort. `lock_wait_ms` vaut donc au moins `HOLD`, quelle que soit la charge : un retard des minuteries ne fait que l allonger. Le test tue l attendant dès que l outil a fini, quelle que soit son issue (`finally`) : un outil qui n entre jamais dans l attente ne laisse aucun processus. L assertion devient `lock_wait_ms >= HOLD`.
2. **G27** : la borne haute devient `KILL = 2 * WAIT`, le moindre `waited_ms` qu un mutant `2 * o.wait` ou `3 * o.wait` de `run.mjs:231` peut enregistrer (`acquire()` ne rend `null` qu une fois sa propre horloge, partie après celle de `gate()`, à `maxMs`). Ces mutants restent tués quelle que soit la charge. `WAIT` passe de 2 000 à 3 000 ms : la marge laissée aux minuteries en retard est `KILL - WAIT` = 3 000 ms, contre 1 600. Le lancement de G27 part en avance (`ahead`, `runAsync`), comme les autres lancements qui attendent surtout : la seconde de plus ne s ajoute pas à la durée du fichier.
3. **Examen des autres lancements en avance** : `heldOwners`, `hostLock` et `lockStop` attendent derrière un pid vivant tout le fichier (ce processus, ou l outil lui même) ou un propriétaire jamais repris : leur arrêt ne dépend d aucun délai.
4. **`deadTsc` (G24) et `overrun` (D-5)** (amendement après la première mesure sous charge) : leurs lignes dépassent leur borne exprès, mais leur ligne de base doit tenir dans la même borne, 3 s (`--timeout-ms 300`) et 5 s (`--timeout-ms 500`). Sous 8 boucles de calcul, la ligne de base de `overrun` a dépassé ses 5 s : `non conclu`, aucune ligne lancée, test rouge (`'non conclu'` contre `'vert'`). Les deux prennent `--timeout-ms` = `OVER` = 1 500 ms, nommé : chaque enfant de l outil a 10 * `OVER` = 15 s, la place de la ligne de base sous charge. Z1 (un `tsc` qui pend) court toujours jusqu à la borne ; le module de G1 dort `10 * OVER + 5000` ms, 5 s au delà de la borne (9 s contre 5 avant), et H1 dort 60 s contre la borne de test de 1,5 s. La charge ne peut que ralentir ces enfants, jamais les faire finir avant leur borne. Les deux lancements partent en avance : leurs 15 s se recouvrent avec le reste du fichier.
5. Aucun tueur ne change. Les lignes `// killer:` restent au dessus de leur test ; leurs cibles dans `scripts/mutants/run.mjs` sont inchangées.

## Tueurs (listés pour `--test-only`)

- G28 : `scripts/mutants/run.mjs:232 CONST "lock_wait_ms: lk.waitedMs" -> "lock_wait_ms: 0"`.
- G27 : `scripts/mutants/run.mjs:231 CONST "maxMs: o.wait }" -> "maxMs: 3 * o.wait }"` ; vérifié à la main aussi pour `"maxMs: 2 * o.wait }"`.
- G24 : `scripts/mutants/run.mjs:224 CONST "r.error !== undefined || r.signal !== null || r.status === 134 ? \"non conclu\"" -> "false ? \"non conclu\""`.
- D-5 : `scripts/mutants/run.mjs:267 CONST "!first.timed_out" -> "true"`.

## Vérification du lot

- Reproduction ci-dessus à la base ; même délai injecté au gel : G28 vert.
- Tueurs vérifiés à la main au gel : `run.mjs:232` (G28), `run.mjs:231` en `2 *` et `3 *` (G27), `run.mjs:224` (G24), `run.mjs:267` (D-5).
- `node scripts/red-proof.mjs --base 050da36d --gel <gel> --repo <worktree> --test-only`.
- `node --test test/mutants-run.test.ts` 5 fois sous 8 boucles de calcul : 0 échec.
- `npm test` complet, `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Taille

Un fichier de test, environ 45 lignes. Borne R-25 : 547.
