# G7 du lot ORACLE-RUNNER-GATE-1 : l'oracle refuse une gate qui nomme l'environnement du runner, une expression du workflow ou une URL

- **Base** : `55fb2409`. **PR** : #342, branche `lot/oracle-runner-gate-1`, tête `94cf3b18`, un commit. **Fusion au tronc** : `d985f85b`,
  tronc avant fusion `55fb2409`.
- **Plan** : l'item ORACLE-RUNNER-GATE-1 de `docs/ETAT.md`, ouvert au G7 de #340 (déclencheur : avant le lot 1b de Genkan), sous l'accord
  du fondateur pour la partie 1 de Genkan (2026-10-28 16:38 UTC). La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que le lot livre

- `scripts/oracle/run.mjs` l.33 : `RUNNER_ONLY`, quatre formes et ce que chacune nomme : `$RUNNER_` ou `${RUNNER_`, `$GITHUB_` ou
  `${GITHUB_`, `${{`, `http://` ou `https://`. L.130 et l.133 : une gate ordinaire (sans entrée `CI_ONLY`, hors du compte r25) qui en nomme
  une arrête la dérivation ; l'oracle sort en 2, sans enregistrement, et nomme la gate, ce qu'elle nomme et le remède (une entrée
  `CI_ONLY` avec sa raison). Le bloc r25, qui nomme le runner et la branche de base, garde sa branche, lue avant. Aucune ligne citée ne
  bouge : la constante est sur la l.33, la règle sur les l.130 et 133.
- `test/oracle-run.test.ts` : `oracle_refuses_a_gate_that_names_the_runner_or_a_url`, six pas refusés (dont un entre accolades, sous la
  première ligne d'un bloc), des quasi-cas qui restent des gates (`$MY_RUNNER_TEMP`, `$TMPDIR`, `$RUNNERS`, `$GITHUB`, `http-only`,
  `https:/x`), et le `ci.yml` réel, qui se dérive, ses pas du runner retirés ; 12 lignes tueuses.
- `test/test-counts.json` et `test/test-names.json`, écrits par `node scripts/test-count-floor.mjs write`.

## Vérification

- Sur le `ci.yml` réel, la dérivation trouve 14 pas retirés, le compte r25 et 12 gates ordinaires, dont aucune ne nomme le runner ni une
  URL.
- `test:main` vert (3354 tests : 3307 réussis, 0 échec, 47 sautés) ; contrôle du nombre de tests vert contre `55fb2409` (334 fichiers,
  3354 tests, 0 retrait) ; red-proof : le test neuf F2P, le tueur tiré (l.33) tué (`RED-PROOF.json` `52b32b10…`) ; mutants : 67, un par
  ligne de tueur de `test/oracle-run.test.ts`, 66 tués, 0 survivant, 1 non conclu (le tueur de `oracle_lock_alive_reads_a_zombie_as_dead`,
  qui lit `/proc` et saute sous Windows), sur l'arbre exact du commit (empreinte des changements `0ef5c66d…`, `RESULTS.json`
  `fe578e8c…`) ; eslint et tsc propres ; lot-check : aucun changement hors de la zone déclarée (48 insertions, 4 suppressions).
- CI de #342 : 15 vérifications vertes sur 15, sur la tête `94cf3b18`.
- Rejeu Windows à la fusion : `test/oracle-run.test.ts`, 22 tests : 21 réussis, 0 échec, 1 sauté (le test qui lit `/proc`).
- Oracle G7 sur `d985f85b`, base `55fb2409` : vert, 13 gates en sortie 0, enregistrement `09f431af…`.

## Ce qui reste

- Le lot 1b de la partie 1 de Genkan, né du tronc après cette fusion, puis la G2 de la partie.
