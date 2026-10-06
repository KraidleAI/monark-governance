# G0 du lot COINBASE-LOOPBACK-FLAKE-1 : un port de serveur fermé n'est plus jamais tiré à nouveau dans le même processus

- **Demande** : item COINBASE-LOOPBACK-FLAKE-1 (message de MONARK `2026-10-06-MONARK-vers-RECHERCHES-t0-fini-suite.md`, relève du
  2026-10-06) : nommer la cause du rouge de `coinbase_candles_stops_pass_2_on_a_witness_past_its_last_core_or_on_a_last_core_not_yet_past`
  dans `g3-verification` de #199 (« flake » n'est pas une cause), et rendre le test déterministe.
- **Base** : `lot/etude-suite` après la fusion de #201, #202 et #203 (`6c6c0957`), branche `monark/coinbase-loopback-flake-1`. Auteur :
  MONARK.
- **Zone** : `test/helpers/loopback.ts` et `test/loopback.test.ts`. Aucun code de production n'est touché.

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

- L'assistant garde l'ensemble des ports de ses serveurs FERMÉS (événement `close` du serveur rendu) et ne les tire plus : un tirage d'un
  port retiré compte pour un essai et ne démarre rien. Un port encore occupé n'est pas retiré : son erreur d'écoute fait tirer à
  nouveau, comme avant (`loopback_start_takes_a_fresh_server_per_try` le garde : un port retiré dès l'écoute le rougirait).
- Le comportement keep-alive des serveurs de test ne change pas (des tests en dépendent, par exemple
  `dojo_verify_url_replays_a_get_once_on_a_closed_socket`) : choix écarté, `Connection: close` sur tous les serveurs de test.
- Choix écarté : un répartiteur `fetch` par serveur, fermé avec lui (il faudrait un `Agent` d'undici, une dépendance nouvelle).
- Les 20 fichiers qui utilisent l'assistant en profitent ; le test Coinbase lui-même ne change pas.

## Preuve rouge

- Test neuf `loopback_listen_never_draws_the_port_of_a_closed_server_again` (`test/loopback.test.ts`) : un serveur répond à un `fetch`
  (socket keep-alive dans le pool), ferme ; le tirage suivant offre d'abord son port.
- À la base (assistant de `6c6c0957`), le test est rouge par assertion (`ERR_ASSERTION`, `notStrictEqual` : « the port of the closed
  server is not drawn again ») ; 8 tests verts sur 9.
- Après le lot : 9 sur 9 ; les fichiers Coinbase, Binance, `dojo-verify-url` et `probe-narabi-state` : 87 sur 87.

## Tueurs

- L'assistant est du code de test : `scripts/red-proof.mjs` ne peut pas le viser (en-tête de `test/loopback.test.ts`). La ligne
  « reddened by » du test nomme les changements qui le rougissent : l'ensemble retiré supprimé, ou aucun port retiré à la fermeture ;
  un port retiré dès l'écoute rougit `loopback_start_takes_a_fresh_server_per_try`.

## Questions

- Aucune.
