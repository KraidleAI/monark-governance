# G0 du lot P1-B1-BIS du chantier L2 : pair TLS de REST attribué à sa seule connexion (B-2 de la G2 de la partie P1)

- **Rattachement** : G2 neuve de la partie P1 (RECHERCHES, 2026-10-04, `G2-L2-P1-partie.md`, APPROUVE-AVEC-CORRECTIONS), bloquant
  **B-2**, item L2-TLS-PEER-ATTRIB-1 ; mineurs dont b1 est porteur : **m-1** (journal de l'écart d'horloge) et **m-3** (listes fermées
  de `rest.mjs` gelées). Plan `docs/G0-partie-l2-p1.md` §8.2 (ligne P1-b1), §9 (SERIES-TLS-PEER-LOG-1, prouvé en M-1 seulement) ; plan
  de lot `docs/G0-lot-l2-p1-b1.md` point 8 et bloc J1 ; G7 de b1, item ouvert « Attribution TLS (J1) ». ADR-L2-CAPTURE-1 D-27 (547).
- **Base** : le tronc `origin/lot/etude-suite` à `c68451fc` (récupéré par la référence explicite). Branche `recherches/l2-p1-b1-bis`,
  worktree `monark-governance-b1bis`. Auteur : RECHERCHES (porteur de P1-B1-BIS, bloc daté du plan « Décision de l orchestrateur sur
  P1-b1 plié »). Aucun réseau : deux serveurs TLS de boucle locale, ports tirés par `test/helpers/loopback.ts`.
- **Hors de ce lot** : B-1 (dossiers temporaires de `test/l2-rest.test.ts`) est le lot L2-REST-TEST-TMP-1, à part ; les autres
  points de l'item P1-B1-BIS du plan (C-3, C-4, C-5, survivants de C-6 et C-7, m-2, m-3, m-4, H11 de la G2 de #112) restent à l'item ;
  m-2 de la G2 de partie (PLAIN partagé) et la phrase de `links.mjs:28` (m-3) sont à a4, qui rouvre `links.mjs`.

## Le défaut (B-2), relu sur la base

`rest.mjs:87-93` prend pour pair de la requête le dernier socket TLS publié sur `undici:client:connected` pendant sa fenêtre
(`:107` à `:113`). La poignée de main WebSocket de `links.mjs` publie sur le même canal. Une requête qui réutilise un socket du pool
ne publie rien : si une liaison se connecte pendant sa fenêtre, `requests.jsonl` attribue à la place REST le certificat du serveur
WebSocket, sans note. Une session TLS reprise donne un certificat vide : `null` sans note, comme « pas de TLS ».

## Contenu

`scripts/l2/rest.mjs`, `scripts/l2/rest.d.mts`, `test/l2-rest.test.ts`, et un fichier de test neuf `test/l2-rest-tls.test.ts` (les
deux serveurs TLS ; à part pour ne pas toucher les lignes du lot L2-REST-TEST-TMP-1 dans `test/l2-rest.test.ts`).

1. **Attribution par la connexion propre** : un socket publié dans la fenêtre n'est celui de la requête que si c'est un socket TLS
   dont `servername` et `remotePort` sont ceux de la place (`PEER`, gelé : `api.binance.com`, 443, l'origine `ORIGIN`). Tout autre
   socket TLS est étranger ; un socket sans TLS est compté à part. Les deux champs sont comparés, jamais écrits ; ni adresse, ni
   `connectParams`. Le plan du lot (point 8) disait « aucune adresse du socket n'est lue » : amendement daté dans l'en-tête de
   `rest.mjs` (le port distant est lu pour être comparé ; le nom d'hôte est un nom de la liste fermée).
2. **Notes en liste fermée** (`TLS_NOTES`, gelée) ; une empreinte n'est écrite que pour exactement une connexion propre portant un
   certificat (échec fermé : jamais d'empreinte dans le doute) :
   - `several_connections` : plus d'une connexion propre ;
   - `session_resumed` : une connexion propre, session TLS reprise, certificat vide ;
   - `no_certificate` : une connexion propre sans certificat, session non reprise ;
   - `foreign_connection` : aucune connexion propre, au moins une connexion TLS étrangère (le cas de B-2) ;
   - `no_tls` : aucune connexion propre, aucune étrangère, au moins un socket sans TLS (la place factice) ;
   - `reused_socket` : aucune connexion publiée dans la fenêtre (socket du pool).
3. **Couture de test** : `io.peer` (nom TLS et port de la connexion propre), `PEER` par défaut ; la production (c5) ne la passe pas.
   Le test TLS la règle sur `localhost` et le port tiré du serveur REST ; le test du canal épingle le défaut.
4. **Attestation** : le plan ne fait d'aucune empreinte une condition d'une requête (SERIES-TLS-PEER-LOG-1 est prouvé en M-1). Le
   lot ferme donc l'attestation, pas la requête : une ligne sans empreinte nomme pourquoi. Arrêter une requête faute d'attestation
   serait une politique neuve : question Q-1.
5. **m-1** : `logTimeOffset(out, body, sentUs, receivedUs, clock)` écrit la tête de a3 (`host_us`, `mono_ns` en chaîne, `symbol`
   et `cid` nuls : l'heure de la place n'a ni symbole ni connexion, `event`), puis ses champs ; ses chaînes sont des noms de liste
   fermée (le filtre PLAIN tient par construction ; PLAIN partagé : m-2, a4). Un corps qui n'est pas du JSON écrit sa ligne (raison
   `body_not_json`) avant l'arrêt nommé : « une ligne dans tous les cas » devient vrai.
6. **m-3** : `HOSTS`, `SYMBOLS` et `STOPS` gelés (`Object.freeze`), comme dans `links.mjs`.

## Tests (rouges à la base par assertion, verts au gel), tueurs

- `l2_tls_peer_only_from_own_connection` (neuf, `test/l2-rest-tls.test.ts`) : deux serveurs TLS de boucle locale, chacun son
  certificat auto-signé bâti au test (clé engendrée à la volée, aucune clé commise ; CA du processus par `setDefaultCACertificates`).
  Requête 1, connexion neuve : empreinte du serveur REST. Requête 2 sur le socket du pool (contrôlé côté serveur), tenue jusqu'à ce
  qu'une poignée de main WebSocket vers l'autre serveur arrive : `null`, `foreign_connection` (base : l'empreinte du serveur
  WebSocket). Requête 3 sur une connexion neuve après fermeture, session reprise (contrôlée) : `null`, `session_resumed` (base :
  `null`, `null`). Tueur : comparaison du port retirée.
- `l2_tls_peer_logged_without_address` (repris) : sockets de test publiés sur le canal pendant une requête servie par un `fetch`
  injecté sans réseau : un cas par note et l'empreinte propre, l'étranger même port mais autre nom, l'étranger même nom autre port ;
  aucune adresse dans `requests.jsonl`. Tueur : comparaison du nom retirée.
- `l2_rest_closed_lists_frozen` (neuf) : `HOSTS`, `SYMBOLS`, `STOPS`, `TLS_NOTES`, `PEER` gelés ; `PEER` est l'hôte et le port de
  `ORIGIN`. Tueur : gel de `HOSTS` retiré.
- `l2_time_offset_logged` (repris) : tête de a3, ligne `body_not_json` écrite avant l'arrêt. Tueur existant ré-ancré.
- Les tueurs existants de `test/l2-rest.test.ts` sont ré-ancrés sur les lignes déplacées ; chaque texte « avant » reste unique.

## Taille

Prévision : c ≈ 30, d ≈ 15, t ≈ 130, soit ≈ 175 lignes comptées, sous 547.

## Questions pour MONARK

- **Q-1** : faut-il qu'une requête s'arrête (arrêt nommé) quand elle ne peut pas attester son pair, par exemple en M-1 ? Ce lot
  ne le fait pas (aucune règle du plan ne l'exige) ; il nomme chaque cas. Recommandation : décision en c5 (un compte par note au
  manifeste du jour, et un seuil si M-1 le justifie).
- **Q-2** : la couture `io.peer` est-elle admise ? Sans elle, une connexion de boucle locale ne peut pas être propre (le nom TLS de
  `api.binance.com` ne se sert pas en local) et le test réel ne prouverait que le refus.
