# G0 du lot COINBASE-LOOPBACK-FLAKE-1 : un port de serveur fermé n'est plus jamais tiré à nouveau dans le même processus

- **Demande** : item COINBASE-LOOPBACK-FLAKE-1 (message de MONARK `2026-10-06-MONARK-vers-RECHERCHES-t0-fini-suite.md`, relève du
  2026-10-06) : nommer la cause du rouge de `coinbase_candles_stops_pass_2_on_a_witness_past_its_last_core_or_on_a_last_core_not_yet_past`
  dans `g3-verification` de #199 (« flake » n'est pas une cause), et rendre le test déterministe.
- **Base** : `lot/etude-suite` après la fusion de #201, #202 et #203 (`6c6c0957`), branche `monark/coinbase-loopback-flake-1`. Auteur :
  MONARK.
- **Zone** : `test/helpers/loopback.ts`, sa copie à l'octet `apps/harness/test/helpers/loopback.ts` (le harnais, exporté seul, porte la
  copie ; `test/loopback-guard.test.ts` exige l'égalité) et `test/loopback.test.ts`. Aucun code de production n'est touché.

red-proof: test-only

## Constat

- Le journal du job `g3-verification` de #199 (premier passage, run `37422720508`, job `112135442700`) donne la ligne exacte :
  `actual: [ 'end_in_future', '2023-01-09T19:15:00Z', 0, false, 'ok', 'network_error' ]` ; le sixième terme est `closed.code`, le quatrième
  appel `record` du test (passe 2), juste après `first` (passe 1), le tout en 24 ms.
- Chaque `record` démarre un serveur de boucle locale par `listen` de l'assistant commun, qui tire un port au hasard dans [10081, 65080],
  puis le ferme (`closeAllConnections`, `close`). Le `fetch` du runtime garde une socket keep-alive inactive par origine
  (`127.0.0.1:<port>`).
- Mécanisme : quand un serveur neuf tire le port d'un serveur qui vient de fermer, la requête suivante part sur la socket morte gardée
  dans le pool : `ECONNRESET`, que l'enregistreur rend `network_error` (`scripts/record-coinbase-candles.mjs:194`, aucune relance par
  conception).
- Mesuré sur cet hôte (sonde `F:/tmp/dojo/coinbase-flake/probe.mjs`, hors dépôt) : port revenu, 200 réinitialisations sur 200 ; serveur
  qui répond `Connection: close`, 0 sur 200. Sur le runner Linux, le tirage aléatoire rend la collision rare (de l'ordre de k²/110 000
  pour k serveurs dans la fenêtre keep-alive du client) : d'où un rouge isolé, effacé par une relance.

## Construction

- L'assistant garde les serveurs qu'il a rendus, par port, et ne tire plus le port d'un serveur qui n'écoute plus : un tel tirage compte
  pour un essai et ne démarre rien. Un port encore occupé n'est pas retiré : son erreur d'écoute fait tirer à nouveau, comme avant
  (`loopback_start_takes_a_fresh_server_per_try` le garde : un port retiré dès l'écoute le rougirait).
- Le port est retiré dès l'appel à `close()`, qui le libère aussitôt (`server.listening` faux), et non à l'événement `close`, qui attend la
  fin des connexions ouvertes (B-1 de la relecture de RECHERCHES sur `7336d0f7` ; le premier envoi retirait à l'événement). L'objet
  serveur n'est pas modifié : RECHERCHES proposait d'envelopper `close`, la lecture de `listening` couvre aussi toute autre fin d'écoute.
- La copie du harnais suit à l'octet (`loopback_guard_every_bind_of_a_test_file_goes_through_the_helper`).
- Le comportement keep-alive des serveurs de test ne change pas (des tests en dépendent, par exemple
  `dojo_verify_url_replays_a_get_once_on_a_closed_socket`) : choix écarté, `Connection: close` sur tous les serveurs de test.
- Choix écarté : un répartiteur `fetch` par serveur, fermé avec lui (il faudrait un `Agent` d'undici, une dépendance nouvelle).
- Le test neuf n'appelle pas `fetch`. Sous win32, `--test-force-exit` (scripts `test:main` et `test:export`) termine le processus pendant que
  V8 compile encore en arrière-plan le parseur WebAssembly de `fetch` ; libuv s'arrête alors sur `!(handle->flags & UV_HANDLE_CLOSING)`
  (`src\win\async.c`, ligne 76) et le fichier rougit sans aucun test rouge. Mesures (sonde `F:/tmp/dojo/coinbase-flake/exitprobe/probe.mjs`,
  hors dépôt) :
  - trois serveurs servis chacun par un `fetch` puis fermés, puis `process.exit` : 8 arrêts sur 8 ; deux serveurs : 0 sur 8 ;
  - sortie naturelle : 0 sur 6 (trois et six serveurs) ; sortie différée de 300 ms : 0 sur 6 ;
  - sous `--no-wasm-dynamic-tiering`, `--liftoff-only`, `--no-liftoff` ou `--single-threaded` : 0 sur 6 chacun.

  Une première version du test (deux `fetch`, plus celui de `loopback_listen_binds_127_0_0_1_above_10080_and_fetch_reaches_it`) arrêtait
  `test/loopback.test.ts` 20 fois sur 20 ; la base, 0 sur 20. Ce lot ne garde donc que la propriété de l'assistant, sans requête.
  Item FORCE-EXIT-WASM-TIERUP-1 (formé au G7) : la cause vaut pour tout fichier qui finit sur une rafale de `fetch` ; lien avec
  TEST-FORCE-EXIT-NEED-1 et avec l'aléa `UV_HANDLE_CLOSING` relevé aux G2 de U4b et de T1a-iii-a1.
- Les 20 fichiers qui utilisent l'assistant en profitent ; le test Coinbase lui-même ne change pas.

## Preuve rouge

- Deux tests neufs (`test/loopback.test.ts`) ; dans chacun, le tirage suivant offre d'abord l'ancien port :
  - `loopback_listen_never_draws_the_port_of_a_closed_server_again` : un serveur écoute, puis ferme ;
  - `loopback_listen_never_draws_the_port_of_a_server_that_stopped_listening` : un serveur écoute, une connexion TCP reste ouverte,
    `close()` est appelé ; le tirage a lieu avant l'événement `close`.
- À la base (assistant de `6c6c0957`), les deux sont rouges par assertion (`ERR_ASSERTION`, `notStrictEqual`) ; avec l'assistant du
  premier envoi corrigé (`dcb28610`, retrait à l'événement), le second est rouge 5 fois sur 5.
- Après le lot : 10 tests sur 10, et 20 passages du fichier sous `--test-force-exit` sans aucun arrêt du processus.

## Tueurs

- L'assistant est du code de test : `scripts/red-proof.mjs` ne peut pas le viser (en-tête de `test/loopback.test.ts`). La ligne
  « reddened by » de chaque test nomme les changements qui le rougissent ; quatre mutants à la main, mesurés :
  - la lecture de `listening` retirée : les deux tests neufs rougissent ;
  - aucun serveur gardé par port : les deux tests neufs rougissent ;
  - un port retiré dès l'écoute : `loopback_start_takes_a_fresh_server_per_try` rougit ;
  - un port retiré à l'événement `close` seulement : `loopback_listen_never_draws_the_port_of_a_server_that_stopped_listening` rougit.

## Écart du premier envoi (`7336d0f7`)

- La copie du harnais n'avait pas suivi et l'oracle complet n'avait pas été lancé avant la PR : `g3-verification` rouge sur la garde. Le
  test à `fetch` arrêtait son fichier sous Windows. Les deux sont corrigés ici ; l'oracle complet précède tout nouvel envoi.
- `g6-compliance` est rouge sur toute PR depuis l'avis GHSA-wq5f-xc86-pv6w (`sharp` < 0.35.5) : lot à part DEP-SHARP-1, fusionné avant
  celui-ci.

## Questions

- Aucune.
