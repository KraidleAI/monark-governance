# G0 du lot BINANCE-PRE35-1 : l'enregistreur Binance avant la course des 35 (reprise TLS coupée, valeurs de l'environnement, émetteur)

- **Rattachement** : message `2026-10-04-MONARK-vers-RECHERCHES-deux-lots-series-et-P1-b1.md` §1 (tableau, colonne RECHERCHES, tâche 1) ;
  limites du lot BINANCE-PRE153-1 au déclencheur « avant la course des 35 » : L-1 (SERIES-TLS-RESUME-1, journal G1 §10, Q-BNPRE-5), L-2
  (SERIES-ENV-VALUES-1, même lieu), O-1 (SERIES-TLS-ISSUER-BY-NAME-1, CORR §11) ; BINANCE-BIND-SUBSCRIBER-TRY-1 ; m-1 et m-2 de la relecture
  `2026-10-04-RECHERCHES-vers-MONARK-enregistreurs-relus.md`.
- **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche `recherches/binance-pre35-1`, worktree `/home/user/monark-governance-bn`.
  Auteur : RECHERCHES ; contrôle par diff et fusion : MONARK.
- **Zone ouverte** : `scripts/record-binance-klines.mjs`, `scripts/record-binance-klines.d.mts`, `test/record-binance-klines.test.ts` ;
  plus ce G0 et le G7 du lot. Rien d'autre (ni `package.json`, ni le verrou).
- **Aucun réseau** : aucune requête vers Binance ni Coinbase, aucune série enregistrée lue ; les tests ne parlent qu'à des serveurs de
  boucle locale, `fetch` global piégé comme avant.

## Choix pour L-1 (SERIES-TLS-RESUME-1) : `https.request` de node, agent propre `maxCachedSessions: 0`

- **Mesuré** : `undici` n'est pas une dépendance (`package.json` ; le verrou ne porte que `undici-types`, types de `@types/node`). Node
  n'expose pas la classe `Agent` de son undici interne ; l'atteindre par le symbole du répartiteur global serait lire un détail interne.
- **Écarté : le paquet `undici`** (R-8) : une dépendance neuve, et `package.json` et `package-lock.json` sont hors de la zone ouverte.
  L'enregistreur est « zéro dépendance » (en-tête l.3). Aucun registre consulté, rien installé.
- **Retenu : `https.request`** avec un `https.Agent` propre au module : `maxCachedSessions: 0` (aucune session gardée, donc aucune offerte),
  `keepAlive` laissé à `false` (une connexion par page, poignée de main complète à chaque page). Discipline réseau inchangée : un hôte
  contrôlé avant chaque requête, aucun en-tête posé, aucune redirection suivie (`https.request` n'en suit aucune ; tout 3xx reste
  `redirect_refused`), aucun nouvel essai, délai de 30 s (`signal`), corps lu en flux sous la borne.
- **Attestation** : le certificat se lit sur le socket de la réponse elle-même (`res.socket.getPeerCertificate(true)`), à l'arrivée de
  la réponse, avant toute lecture du corps. Plus aucun canal de diagnostic : l'abonné `undici:client:connected`, la table des tickets,
  la lignée `resumed: true` et l'abonné `bind` de `undici:client:sendHeaders` disparaissent. Une session reprise (impossible ici, mais
  mesurée par `isSessionReused()`) n'atteste rien : `tls: null`, donc `tls_unattested` sur un 200, fermé par défaut. Le champ
  `resumed` reste dans la ligne (schéma de `requests.jsonl` inchangé) et vaut toujours `false` quand `tls` n'est pas `null`.
- **Effets** : m-2 fermé par construction (aucun ticket offert, en TLS 1.2 comme en 1.3) ; L-3 (liaison par chemin de deux requêtes
  concurrentes de même chemin) fermé par construction (plus de liaison : la réponse porte son socket) ; BINANCE-BIND-SUBSCRIBER-TRY-1
  fermé par retrait (l'abonné `bind` n'existe plus : aucune ligne `try` à écrire, aucun cas ; écart déclaré).
- **Couture de test** : `io.fetch` garde son nom (les dizaines d'appels `{ fetch: offline(calls) }` des tests restent intacts, donc non
  jugés par la preuve rouge) mais prend la forme de `https.request` : `(url, options) => ClientRequest`. Le `fetch` par défaut est
  `https.request`, lu à chaque requête. Renommer la couture (`io.request`) est une question pour MONARK (Q-PRE35-1).

## L-2 (SERIES-ENV-VALUES-1) : forme fermée des valeurs des douze noms admis

Après le contrôle des noms (inchangé), les valeurs : `SYSTEMROOT` égale `WINDIR` (casse des noms ignorée, valeurs comparées telles
quelles ; les deux absents passent) ; `HOMEPATH`, `SYSTEMROOT`, `TEMP`, `USERPROFILE`, `WINDIR` sont des chemins absolus (`isAbsolute`
de la plate-forme) ; `PATH` est fait de chemins absolus seulement (séparateur de la plate-forme ; une entrée vide, qui vaut le dossier
courant, est refusée). Sinon arrêt `env_refused` dont le détail nomme les variables, jamais une valeur. Environ 6 lignes, 2 cas.

## O-1 (SERIES-TLS-ISSUER-BY-NAME-1) : sonde mesurée avant le G0

Sonde hors dépôt (bac à sable de session, `o1.mjs` et `o1seq.mjs`), Node 22.22.2 et 24.21.0, `https.request` et agent
`maxCachedSessions: 0`, deux AC de même nom, avec et sans identifiants de clé :
- confiées tour à tour (une seule à la fois), une feuille de chacune : l'émetteur journalisé est la bonne AC à chaque connexion, agent
  partagé ou neuf ;
- confiées ensemble, sans identifiants de clé : la vérification échoue (`CERT_SIGNATURE_FAILURE`), donc aucune réponse : fermé par
  défaut, jamais un émetteur faux ; avec identifiants de clé : la bonne AC, dans les deux ordres.

La mesure est propre : aucune ligne de production. La sonde devient un test du lot (deux AC de même nom confiées tour à tour, puis
ensemble). Lecture : l'émetteur faux de CORR O-1 venait de la lignée d'une session reprise (le ticket d'une autre connexion), que ce lot
retire.

## m-1

Le test de jonction compare tout stderr ; sous Node 22 l'enfant écrit l'avertissement `UNDICI-EHPA` (`NODE_USE_ENV_PROXY=1`).
Correction : `process.env.NODE_NO_WARNINGS = "1"` au niveau du fichier de test, hors de tout corps de test, que les enfants héritent
(ils partent de `process.env`). Motif : un changement dans le corps rendrait le test jugé par la preuve rouge, et il est vert à la base
sous Node 24 (refusé comme auto-confirmant). Écart déclaré.

## Tests (jugés par la preuve rouge), tueurs

Rouges à la base par assertion : la couture de la base attend une `Response` de `fetch` et reçoit une `ClientRequest`.
- neuf `binance_klines_never_resumes_a_tls_session` (TLS 1.2 et 1.3, quatre pages chacun, le serveur offre la reprise) : aucune reprise
  vue du serveur, chaque ligne porte la feuille et l'AC ; tueur `maxCachedSessions: 0` → `100` ;
- neuf `binance_klines_logs_the_true_issuer_of_two_cas_of_one_name` (O-1) ; tueur : l'émetteur lu sur la feuille ;
- neuf `binance_klines_refuses_an_admitted_name_with_an_unformed_value` (L-2, deux cas et le cas propre) ; tueur : contrôle des valeurs retiré ;
- modifiés : `binance_klines_pages_a_full_page_then_a_partial_one` (options de la requête au lieu de `redirect`),
  `binance_klines_refuses_a_proxy_or_an_unverified_tls` (le cas des douze noms prend des valeurs de forme fermée),
  `binance_klines_stops_on_a_200_whose_connection_showed_no_certificate` (le cas du `fetch` injecté devient un corps HTTP en clair qui ne
  finit pas : la connexion est fermée sans le lire) ;
- retirés : `binance_klines_logs_the_certificates_of_the_connection_that_served_each_page` (lignée de reprise, remplacé par le premier
  neuf), `binance_klines_binds_its_own_request_under_a_concurrent_one` (liaison retirée), `binance_klines_ignores_a_publication_without_a_socket`
  (abonné retiré).
- Les lignes `// killer:` des tests non jugés sont recalées sur les numéros de ligne du gel.

## Taille

R-25 au plus 547 (insertions plus suppressions, `scripts/oracle/r25.mjs`). Prévision : code environ 60, types environ 10, tests environ 250.

## Questions pour MONARK

- **Q-PRE35-1** : la couture `io.fetch` a désormais la forme de `https.request` ; la renommer `io.request` coûterait une trentaine de
  lignes de tests (chaque test touché devient jugé). À garder pour un lot d'outil ?
- **Q-PRE35-2** : une entrée vide de `PATH` (fréquente en fin de `Path` sous Windows) arrête la course (`env_refused`, `PATH` nommé).
  Choix fermé par défaut ; à confirmer avant la course des 35.

## Pli de la G2 (APPROUVE-AVEC-CORRECTIONS, 2026-10-04)

Corrections de test seulement, plus une ligne d'en-tête ; aucune ligne de production. Commits ajoutés, aucune réécriture.
- **C-1** : un test du transport par défaut, sans `fetch` injecté : `https.request` remplacé par un espion qui lève, synchronisé dans les
  liaisons ESM (`syncBuiltinESMExports`, refusé si la liaison ne le montre pas), restauré après. Il affirme que l'espion reçoit l'URL,
  l'agent propre (`maxCachedSessions: 0`, `keepAlive: false`) et le signal. Tueur : `request(url, options)` → `request(url)` (l.370).
- **n-3** : le même test espionne `AbortSignal.timeout` : 30 000 ms, et ce signal-là est celui que reçoit la requête.
- **C-2** : deux cas de L-2, un `USERPROFILE` relatif, et `SystemRoot` et `windir` égaux mais relatifs.
- **n-5** : l'en-tête du `.d.mts` nomme la couture de forme `https.request`.
- n-1, n-2, n-4 et les réponses aux questions : au G7.
