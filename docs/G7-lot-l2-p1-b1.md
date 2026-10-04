# G7 du lot P1-b1 du chantier L2 : client REST de l'enregistreur

- **Plan** : `docs/G0-lot-l2-p1-b1.md` ; ligne P1-b1 de `docs/G0-partie-l2-p1.md` §8.2. **Base** : `f5596bf3` (`origin/lot/l2-p1-a1`).
  Branche `recherches/l2-p1-b1`. Commits : `a629f2a` (G0), `6d8da91` (tests rouges), `fe70787` (code, premier gel), `b65276e` (G7) ; pli de la G2 :
  `4f525a6` (tests), `dc45453` (code) ; pli du contrôle par diff de MONARK (2026-10-04) : `ebbaf565` (tests), `915b5cfd` (code, **gel**).

## Pli du contrôle par diff de MONARK (APPROUVE-AVEC-CORRECTIONS, `l2-b1-RAPPORT.md`), 2026-10-04

| Correction | Test | Rouge au gel `dc45453` / tête `37128b0` (Linux) | Tueur vérifié tué |
|---|---|---|---|
| C-1 (bloquant) : `kept` bâti par `path.join` (`rest\BTCUSDT/…` sous Windows) ; désormais chemin posix `rest/<S\|ALL>/…`, `rest/errors/…`, l'écriture garde le chemin de la plateforme | `l2_rest_logged_and_kept_before_read` : copie de `rest.mjs` dont `join` suit les règles de `path.win32` (racine temporaire gardée), `kept` d'un 200 et d'un 404 égal au chemin posix exact | oui, par assertion (`rest\BTCUSDT/…` lu) | retour au `join` de la tête |
| C-2 (bloquant, FM-1.2) : arrêt sur 451 et suspension 429/418 posés dès le statut et `Retry-After`, avant qu'une lecture de corps en échec, un corps trop long ou une erreur de disque ne lève ; le code levé reste celui de l'échec (`network_error`, `body_too_large`, `disk_error`), puis l'arrêt ou la suspension au statut | `l2_rest_451_stops_all` : 451 × lecture en échec, corps de 8 Mio + 1, disque ; 429 × disque ; ensuite `stopped` (ou `suspended`), 1 seul appel de `fetch` | oui, par assertion (`[false, "network_error", 2]`) | K3 neuf : `:120` `state.stopped = true` → `state.stopped = false` ; K2 ré-ancré `:116` |
| C-7 : K4 rougissait par un `RestStop` | `l2_rest_body_bound_named` affirme `"answered"` pour un corps égal à la borne | — | K4 (`:74` `>` → `>=`) rouge par `ERR_ASSERTION` |
| C-6 (partiel, 0 ligne) : M12, M15, M42, M43 ; C-5 (partiel, 0 ligne) : M45, M46 | test 1 : noms gardés exacts (`…-depth-20251009T085320000000Z.json`, `rest/ALL/ALL-time-…012Z.json`), `SYMBOLS` épinglée, `sent_us` et `received_us` du journal | — | liste élargie ; `slice`, `padStart` de l'heure ; `ALL` de `:122` et `:123` ; `sent_us` ↔ `received_us` : chacun rouge par assertion |

Les neuf tueurs déclarés, appliqués un à un à la main au gel `915b5cfd`, rougissent leur test par `ERR_ASSERTION` (K4 compris).

- **Laissé à l'item de C-6** (déclencheur du rapport : premier lot qui rouvre `scripts/l2/rest.mjs`, au plus tard avant le G1 de c5) :
  M08, M14, M26, M27, M36, M39, M63 (leurs tueurs P4 à P6, P9, P10, P16 sont dans les pièces de MONARK, hors dépôt), M13, M19, M62,
  M34 (équivalent) ; C-5 (classes 300, 399, 400, 500, 204 : M56 à M59) ; M32, M64, M66, M71 de C-7 (table de MONARK non reprise ici).
  Raison : solde de lignes (ci-dessous).
- **C-8** : je garde les noms du code (`rest/<S>/<S>-<genre>-<AAAAMMJJTHHMMSSmmmuuuZ>.json`, `rest/ALL/ALL-time-…`,
  `rest/errors/<S|ALL>-<genre>-<heure>-<statut>.json`) ; à acter par MONARK d'une ligne datée de §7 du plan.
- **C-10** (outil, MONARK) : noté ; code de sortie des courses Windows qui impriment l'assertion libuv `async.c` à relever par
  `red-proof`. Rien dans ce lot.
- **C-3, C-4** : non demandés dans ce pli ; restent ouverts comme au rapport (avant déploiement).
- **Plan** : ordre de fusion topologique (`4d5b70df`, 2026-10-04) : b1 peut fusionner dès a1 et a2 au tronc ; lu, rien à changer ici.

### Oracle (après le pli de MONARK, Linux, Node v22.22.2)

- `node scripts/red-proof.mjs --base f5596bf3 --gel 915b5cfd --repo /home/user/monark-governance-l2 --draw 9 --seed 37` : **OK**,
  9 tests jugés F2P, 9 tueurs tirés, 9 tués (`RED-PROOF.json` `6f3a672a…`) ; même commande avec `--draw 8` : OK, 8 tirés, 8 tués
  (`eed29591…`). Une tentative chacune, aucune troncature du TAP.
- `tsc --noEmit`, eslint (test), `gate:vocab`, `lint:ratchet` 69/69 verts ; tests L2 17/17. Le rejeu sous Windows (oracle (a) du
  rapport) reste à MONARK : la course Linux couvre C-1 par l'émulation de `path.win32`.
- R-25 : 3 fichiers, +540/−0, soit **540 lignes comptées** (c 173, d 84, t 283), sous 547. Solde 7 : sous les 10 lignes de §8.1 ;
  aucune compaction faite. Si MONARK applique la règle, scission proposée : b1 tel quel au gel `dc45453` plus C-1 et C-2 (le présent
  gel), et un lot b1-bis portant l'item de C-6 (survivants, C-5, C-3, C-4) ; sinon l'item reste au premier lot qui rouvre `rest.mjs`.

## Pli de la G2 (APPROUVE-AVEC-CORRECTIONS), correction par correction, avec son tueur

| Correction | Test | Tueur vérifié tué |
|---|---|---|
| B1 : arrêt sans message ni adresse | `l2_rest_failures_named_without_address_and_symbols_closed` | `rest.mjs:80` `e?.cause?.code ??` → `e?.cause?.message ??` (tueur du test) |
| B2 : symbole en liste fermée, `bad_symbol`, 0 requête | même test | `!SYMBOLS.includes(symbol)` → `symbol === null` |
| B3 : signal de 30 s ; aucun en-tête | `l2_rest_logged_and_kept_before_read` (espion de `init`) | signal retiré ; en-tête ajouté |
| B3 : suspension depuis la réception | `l2_rest_429_418_suspend_until_retry_after` | `receivedUs + s` → `sentUs + s` |
| B3 : milieu arrondi de l'écart | `l2_time_offset_logged` (envoi T0, réception T0 + 3) | milieu → `sentUs` |
| B3 : intervalle `MINUTE` | `l2_exchangeinfo_scale_and_limits` (cas `SECOND`) | contrôle de l'intervalle retiré |
| B3 : `date` et `retry-after` journalisés | test 429/418 | chacun mis à `null` |
| Q-B1-2 : 418 sans `Retry-After`, plus de 3 jours | test 429/418 (trois cas, et 3 jours pile admis) | chaque condition mise à `false` |
| J1 : requêtes chaînées | test des échecs (fetch retenu) | chaînage retiré |
| J1 : plusieurs connexions dans une fenêtre | `l2_tls_peer_logged_without_address` | `events > 1` → `events > 9` |
| m1, m2, m3 : corps en échec journalisé ; `wx` ; `disk_error` | test des échecs | `{ flag: "wx" }` retiré |
| m5 : `Location` en boucle locale, absente du détail | `l2_rest_host_and_redirect_refused` | — |

Rouges au premier gel `fe70787` : tests 1, 2, 5, 8 et 9 ; les ajouts aux tests 6 et 7 tuent des mutants survivants (M3, M4) et sont
verts au premier gel par nature.

## Oracle (après le pli de la G2)

- `red-proof --base f5596bf3 --gel dc45453 --repo /home/user/monark-governance-l2 --draw 8 --seed 37` : **OK**, 9 tests jugés F2P, 8 tueurs
  tirés, 8 tués ; avec `--draw 9`, les 9 tirés et tués. `tsc`, eslint (test), `gate:vocab`, `lint:ratchet` 69/69 verts ; tests L2 17/17.
- R-25 : 3 fichiers, +520/−0, soit **520 lignes comptées**, sous 547.

## Items ouverts

- **Attribution TLS (J1)** : sans lire `connectParams` (interdit par le G0), une connexion WebSocket ouverte pendant une requête
  REST (a3, a4) donne `several_connections` ou, si la connexion REST est réutilisée, l'empreinte de la connexion WebSocket. Item pour un
  amendement daté du plan avant c5 : lire le seul nom d'hôte de `connectParams`, ou comparer le `subjectaltname` du certificat à la
  liste d'hôtes (faible sur un certificat générique ; à mesurer en M-1).
- **Q-B1-1** (MONARK) : FAITS-L2-ACCESS-3 (d) et (f) doivent être commis avant la fusion ; ils épinglent `filterType`,
  `symbols[].filters`, `rateLimitType`, `interval`, `intervalNum`, `limit` (le code s'arrête en `exchange_info_shape` sur un autre nom).
- **Q-B1-3 / Q-P1-6** (MONARK) : un plafond du jour sous 4 000 par minute est une suspension nommée, à écrire au plan ; code et test en c5.
- Le nom des fichiers 200 (`rest/<S>/<S>-<genre>-<heure>.json`) diffère de §7 du plan (`<genre>-<heure>.json`) : note datée au plan, ou
  alignement en c5.

## Oracle (premier gel)

- `node scripts/red-proof.mjs --base f5596bf3 --gel fe70787 --repo /home/user/monark-governance-l2 --draw 8 --seed 37` : **OK**, 8 tests
  jugés F2P (rouges par assertion à la base : import dynamique affirmé), 8 tueurs tirés, 8 tués. Chaque tueur vérifié tué aussi à la main.
- `npx tsc --noEmit` vert ; eslint vert sur `test/l2-rest.test.ts` (la configuration ignore `scripts/**/*.mjs`, comme pour les
  enregistreurs existants) ; `gate:vocab`, `lint:ratchet` 69/69 verts. Tests L2 : 16/16 (8 de la place factice, 8 neufs).
- R-25 : 3 fichiers, +413/−0, soit **413 lignes comptées**, sous 547 (plan : 274 à 358).

## Autocontrôle

- Aucun réseau : la place factice de boucle locale et un message publié à la main sur le canal ; `fetch` et `WebSocket` globaux pris
  au piège dans le fichier de test.
- Aucune adresse journalisée : le test publie un socket portant deux adresses et vérifie leur absence de `requests.jsonl` ; le code ne
  lit ni `connectParams` ni le socket au-delà de `getPeerCertificate()`.
- Corps gardé avant lecture : `exchangeInfoFacts` et `logTimeOffset` lisent le corps rendu après son écriture ; un corps illisible
  reste gardé (test 1).
- Aucune valeur de marché ni trame réelle : valeurs synthétiques.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans le worktree n'est pas commis.

## Écarts au plan

- Taille : c 174 (en-tête de discipline compris), d 84, t 262 après le pli (153, 81, 179 au premier gel) contre c 100, d 31, t 143 à 227 ; total 520, sous 547.
- `Retry-After` : décidé à la G2 (ci-dessus).
- SERIES-TLS-PEER-LOG-1 prouvé ici sur un message de test du canal seulement ; la preuve sur la place reste à M-1 (§9 du plan).
- FAITS-L2-ACCESS-3 (d) et (f), prérequis du G1, absents : les noms de clés lus d'`exchangeInfo` sont à confirmer (Q-B1-1).

## Sortie

Prêt pour le contrôle par diff de MONARK et la G2 de la partie P1.
