# G7 du lot P1-B1-BIS du chantier L2 : pair TLS de REST attribué à sa seule connexion (B-2 de la G2 de la partie P1)

- **Plan** : `docs/G0-lot-l2-p1-b1-bis.md`. **Base** : le tronc `origin/lot/etude-suite` à `c68451fc`. Branche
  `recherches/l2-p1-b1-bis`. Commits : `08fd59b6` (G0), `4ffb005a` (tests rouges), `5b20c14e` (code, **gel**), puis ce G7. Non poussé.
- **Porte** : B-2 (bloquant, item L2-TLS-PEER-ATTRIB-1), m-1 et m-3 (mineurs dont b1 est porteur) de la G2 neuve de la partie P1
  (`G2-L2-P1-partie.md`, RECHERCHES, 2026-10-04).

## Ce qui change

| Point | Avant (tronc `c68451fc`) | Au gel `5b20c14e` |
|---|---|---|
| Socket attribué | tout socket TLS publié sur `undici:client:connected` pendant la fenêtre | seul un socket TLS dont `servername` et `remotePort` sont ceux de la place (`PEER` : `api.binance.com`, 443 ; `io.peer` en test) |
| Connexion WebSocket pendant une requête sur socket du pool | empreinte du serveur WebSocket, sans note | `null`, `foreign_connection` |
| Session TLS reprise | `null`, sans note | `null`, `session_resumed` |
| Aucune connexion dans la fenêtre | `null`, sans note | `null`, `reused_socket` |
| Socket sans TLS (place factice) | ignoré : `null`, sans note | `null`, `no_tls` |
| Connexion propre sans certificat, non reprise | `null`, sans note | `null`, `no_certificate` |
| Plus d'une connexion propre | `several_connections` (toute connexion comptée) | `several_connections` (connexions propres seules) |
| Notes | `"several_connections" \| null` | liste fermée gelée `TLS_NOTES` (six noms) |
| `logTimeOffset` (m-1) | ligne sans tête ; corps non JSON : arrêt sans ligne | tête de a3 (`host_us`, `mono_ns`, `symbol` et `cid` nuls, `event`) ; corps non JSON : ligne `body_not_json`, puis l'arrêt |
| `HOSTS`, `SYMBOLS`, `STOPS` (m-3) | tableaux modifiables | gelés |

Lecture du socket : `servername` et `remotePort`, comparés, jamais écrits ; `connectParams` et toute adresse restent non lus.
L'amendement daté (2026-10-04) est dans l'en-tête de `rest.mjs` : il remplace « neither connectParams nor any address of the socket
is read » du plan de b1 (point 8). L'empreinte n'est écrite que pour exactement une connexion propre qui montre un certificat ; tout
autre cas écrit `null` et le nom de la cause (échec fermé de l'attestation). Aucune requête n'est arrêtée faute d'attestation (Q-1).

## Tests et tueurs

| Test | Fichier | Rouge à la base (assertion) | Tueur (tué au gel, par assertion) |
|---|---|---|---|
| `l2_tls_peer_only_from_own_connection` (neuf) | `test/l2-rest-tls.test.ts` | ligne 2 : empreinte du serveur WebSocket ; ligne 3 : `null`, `null` | `:102` comparaison du port retirée |
| `l2_rest_closed_lists_frozen` (neuf) | `test/l2-rest-tls.test.ts` | listes non gelées | `:27` gel de `HOSTS` retiré |
| `l2_tls_peer_logged_without_address` (repris) | `test/l2-rest.test.ts` | `[null, null]` au lieu de `reused_socket` | `:102` comparaison du nom retirée |
| `l2_time_offset_logged` (repris) | `test/l2-rest.test.ts` | ligne sans tête | `:186` milieu arrondi (tueur existant, ré-ancré) |

- **Le test réel** (`l2-rest-tls`) : deux serveurs HTTPS de boucle locale, ports tirés par `test/helpers/loopback.ts`, chacun son
  certificat auto-signé P-256 bâti au test (clé engendrée à la volée : aucune clé ni bloc de clé dans le dépôt). La CA du processus de
  test est posée par `setDefaultCACertificates`. `fetch` et `WebSocket` globaux restent des pièges ; le `fetch` injecté ne sert que
  l'URL de la place, réécrite vers le serveur « rest ».
  - Requête 1, connexion neuve : empreinte du serveur « rest ».
  - Requête 2, sur le socket du pool (identité contrôlée côté serveur), tenue jusqu'à l'arrivée de la poignée de main d'un `WebSocket`
    ouvert dans sa fenêtre vers le serveur « ws » : `null`, `foreign_connection`. C'est la reproduction de B-2.
  - Requête 3, sur le socket du pool : une connexion `node:tls` vers « rest », reprise par la session d'une première (reprise et
    certificat vide contrôlés), est publiée sur le canal comme undici publie les siennes : `null`, `session_resumed`.
  - Pourquoi la reprise n'est pas celle d'undici : son cache tient les sessions par `WeakRef` (`WeakSessionCache` de la source
    embarquée de Node v24.21.0) ; mesuré ici, une connexion neuve 50 ms après ne reprend pas, une connexion ouverte aussitôt reprend.
    La reprise d'undici dépend donc du ramasse-miettes : un test qui l'attendrait serait instable.
- **Le test du canal** (`l2-rest`) : sockets de test publiés par un `fetch` injecté sans réseau, un cas par note, plus deux cas
  étrangers (même port mais autre nom ; même nom mais autre port) et un cas propre avec un étranger. Aucune adresse dans `requests.jsonl`.
- **Tueurs existants** : les neuf de `test/l2-rest.test.ts` sont ré-ancrés sur les lignes déplacées. Celui du test du canal change
  (`cert.fingerprint256` → la comparaison du nom), parce que ce test est réécrit. Appliqués un à un à la main au gel : 11 sur 11
  rouges par `ERR_ASSERTION`. `verifie-ancres` sur les six fichiers `l2-*` : 43 tueurs, 43 ANCRE, 0 DERIVE, 0 PERDU.

## Oracle (Linux, Node v24.21.0, variables de mandataire retirées)

- `node scripts/red-proof.mjs --base c68451fc --gel 5b20c14e --repo /home/user/monark-governance-b1bis --draw 4 --seed 37` : **OK**.
  4 tests jugés, tous F2P (rouges par assertion à la base, verts au gel) ; 7 inchangés ; 4 tueurs tirés, 4 tués.
  `RED-PROOF.json` `7d95660a…`. Une tentative.
- Stabilité : `test/l2-rest-tls.test.ts` et `test/l2-rest.test.ts` passés 6 fois sous charge (8 boucles actives), 11 sur 11 à chaque
  fois. Chaque fichier sort seul. `l2-rest-tls` ne laisse aucun dossier ; le test du canal retire le sien.
- `tsc --noEmit` et `npm run lint` verts ; `lint:ratchet` 69/69, `gate:vocab` et `lang:gate` verts.
- `npm test` au gel, `TMPDIR` privé : **2 198 tests, 2 176 réussis, 0 échec**, en 408 s. Deux passages précédents avaient échoué pour
  des causes d'environnement, pas à cause du lot :
  - Premier passage : `node_modules` était un lien unique vers le dépôt principal. Les liens `@monark/*` menaient donc aux paquets de
    l'autre branche, et l'outil de mutants lisait le lien non ignoré (`EISDIR`). Les trois fichiers en cause échouaient pareil sur un
    worktree de la base. Correction : un dossier `node_modules` réel, avec `@monark/*` pointé sur le worktree.
  - Deuxième passage : seul le test 42 (`export-public`) échouait, avec un `ENOENT` dans `/tmp/monark-export-*`, pendant que d'autres
    suites tournaient en même temps sur l'hôte. Le test passe seul, au gel comme à la base.
- Dossiers laissés dans le `TMPDIR` privé : aucun `l2-rest-tls-*` ; 16 `l2-rest-*`, qui relèvent de B-1.
- R-25 (code et tests, `docs/**/*.md` exclus) : `rest.mjs` +42/−24, `rest.d.mts` +18/−3, `l2-rest.test.ts` +43/−33,
  `l2-rest-tls.test.ts` +117/−0, soit **280**, sous 547.

## Écarts au plan

- Fichier de test neuf `test/l2-rest-tls.test.ts`, hors de la liste de §8.2. Raison : ne pas toucher les lignes du lot
  L2-REST-TEST-TMP-1 (B-1) dans `test/l2-rest.test.ts`. Les deux lots ne changent en commun que la ligne d'import de `node:fs`, où
  ils ajoutent tous deux `rmSync` : même changement des deux côtés.
- Couture `io.peer` (Q-2).
- Signature de `logTimeOffset` : un cinquième argument, `clock = { wallUs, monoNs }`, les deux horloges de `LinkIo` de a3. Aucun
  appelant au tronc ; c5 l'appellera.
- Taille : c 42/24, d 18/3 et t 160/33, contre ≈ 175 prévues ; le test réel coûte plus que prévu (serveurs, certificat bâti).

## Laissé hors de ce lot

- **B-1** (L2-REST-TEST-TMP-1) : les dossiers `l2-rest-*` des autres tests de `test/l2-rest.test.ts` restent jusqu'à sa fusion
  (16 par passage au lieu de 17).
- **m-2** et la phrase de `links.mjs:28` (m-3) : à a4, qui rouvre `links.mjs`. PLAIN n'est pas importé dans `rest.mjs` : les chaînes
  de la ligne de l'écart sont des noms de liste fermée.
- **m-5** (écritures du journal en arrêts nommés) : c4 et c5. `logTimeOffset` écrit toujours par `appendFileSync` nu.
- Le reste de l'item P1-B1-BIS du plan : C-3, C-4, C-5, les survivants de C-6 et C-7, m-2, m-3, m-4 et H11 de la G2 de #112.
- SERIES-TLS-PEER-LOG-1 reste « prouvé en M-1 seulement » : la preuve sur la place, avec `api.binance.com` et son vrai port.

## Questions pour MONARK

- **Q-1** : une requête doit-elle s'arrêter (arrêt nommé) quand son pair n'est pas attesté ? Ce lot ne le fait pas : aucune règle
  du plan ne l'exige, et une connexion du pool n'a rien à attester. Recommandation : en c5, compter les notes au manifeste du jour ;
  fixer un seuil après M-1.
- **Q-2** : la couture `io.peer` est-elle admise (sans elle, une connexion de boucle locale n'est jamais propre et le test réel ne
  prouverait que le refus) ? c5 ne doit pas la passer ; un test de composition de c5 peut l'épingler.
- **Q-3** : la ligne du plan de partie (§8.2, P1-b1 : « sans `localAddress` ni aucune adresse ») tient ; le point 8 du plan de b1 est
  amendé dans l'en-tête de `rest.mjs`. Une ligne datée au plan de partie est-elle voulue en plus ?

## Autocontrôle

- Aucun réseau : deux serveurs de boucle locale ; aucune place réelle jointe.
- Aucune adresse journalisée : `servername` et `remotePort` sont comparés, jamais écrits ; le test du canal le vérifie.
- Aucune clé dans le dépôt : `no_secret_in_repo` passe ; la clé de test naît et meurt dans le processus du test.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas dans ce worktree et n'est pas commis.

## Sortie

Prêt pour le contrôle par diff de MONARK et une G2 neuve du lot.
