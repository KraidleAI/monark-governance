# G0 de la partie P1 du chantier L2 : capture spot et liquidations brutes (plan de P1 d'ADR-L2-CAPTURE-1, sans code)

- **Pli du cp-1 bref, 2026-10-03, à partir de 21:57 UTC** (`date -u`) : checkpoint-1 bref du validateur-humain `claude-fable-5-1` sur ce
  plan au HEAD `abc26a87` (sha256 `3681476b4ab5280d52d9b5e60631d2bb0d063c95424e61a504fae433029c1344`), ACCEPTE-AVEC-CORRECTIONS, C-1
  à C-6 ; rapport `F:/tmp/cp1-l2-p1/RAPPORT-cp1-bref-L2-P1-2026-10-03.md`, sha256
  `68a95082ab40bfbfad06bc38bc21dd87eb74931b52d04d78a4f6d81e8b0d2a6f`. Plié par un worker `claude-opus-5-5` (effort max, instance
  fraîche) : C-1 et C-2 dans [A] (35 lignes insérées après sa l.33) ; ici, C-2 au bloc de décisions datées (fin), C-3 en §12.2, C-4 en
  §4.1 et §8.2 (b2), C-5 en §8.2 (a2, c1), C-6 en §9 ; deux questions relevées au pli, hors de sa liste : Q-P1-12 et Q-P1-13 (§11 ;
  prérequis en §8.3) ; correction par correction : `F:/tmp/rech/l2/p1plan/PLI-CP1.md`. Le corps, écrit avant la coupe de Q-P1-11,
  nomme « P1 » les douze lots ; ce qui revient à P1 (a1 à b2) et à P1-bis (c1 à c6), chacune avec sa G2 et son G7, est dit par la
  carte du bloc de décisions.
- **Provenance** : planificateur `claude-opus-5-5` (modèle déclaré à l'ouverture, R-1), effort max, instance fraîche ; mission
  `F:/tmp/rech/l2/p1plan/mission.md`, sha256 `b757d03e713dd7d1dda0b885de9c128a94dd7f076dd9b00fdbfa64ca6c0d13a0` (porte de lancement
  verte, `mission.recu.json`, 2026-10-03T20:41:59Z) ; ouverture le 2026-10-03 à 20:42:12 UTC, mesures entre 20:42 et 21:15 UTC, texte
  écrit à partir de 21:18:59 UTC (`date -u`) ; worktree `F:/Monark-wt-l2adr`, branche `lot/l2-adr`, HEAD `622a8ccc` et arbre propre à
  l'ouverture ; HEAD `19552acf` depuis 20:53:14 UTC (commit de l'orchestrateur, lu à 21:24:48 UTC : Q-5 close, six lignes insérées
  dans [A] après sa l.25) ; les renvois à [A] suivent cette version (§12.2). Aucun réseau hors la boucle locale du poste (§1.2), aucun
  appel à la place, aucun git écrivant. Réviseurs : cp-1 bref du validateur-humain (D-24), puis G2 de la partie par une instance neuve.
- **Rattachement** : [A] ADR-L2-CAPTURE-1, acceptée le 2026-10-03 : D-24 renvoie ici les paramètres chiffrés ([A] l.101-102,
  l.294-300) ; D-27 borne chaque lot à 547 lignes au gel ([A] l.107-108) ; §3 nomme les tests de composition TL-1 à TL-7a
  ([A] l.310-334) ; §4 propose P1-a, P1-b, P1-c ([A] l.358-369) ; §6.1 tient la liste MAST ([A] l.465-540) ; Q-5 close, quatre
  conditions de RECHERCHES à reprendre par ce plan ([A] l.26-31 ; reprises en §3, points 3, 13, 18 et 19, et en §9). Réponses du
  fondateur et investisseur : [Q]. Faits de place : [F1], [F2].
- **Statut** : proposé. Cp-1 bref du validateur-humain avant le G1 de P1-a1 ([A] D-24 ; [R] l.11) : ligne datée, items cités,
  chiffres sourcés ; aucun gate neuf. Aucun code avant ce cp-1.
- **Garde-fous** : aucune valeur de marché, aucune adresse d'hôte, aucun nom de domaine : les points d'accès sont cités par leurs lignes
  de FAITS ; les valeurs des fixtures sont synthétiques et aucune trame réelle n'entre au dépôt (D-25).
- **Lecture** : `[X] l.N` = ligne N de la source X (§12) ; « Q-P1-n » = question de ce plan, aucune tranchée ici (§11) ; « c, d, t » =
  lignes de code, de déclarations `.d.mts` et de tests (§8.1) ; « L-n » = mesure locale de ce plan (§1.2).

## 0. Décisions du plan, une ligne chacune

- **P-1** : douze lots, fusionnés l'un après l'autre dans l'ordre a1, a2, a3, a4, b1, b2, c1, c2, c3, c4, c5, c6 (§8).
- **P-2** : P1 estimée entre 3 271 et 4 047 lignes au compte R-25 ; chaque lot sous 470 lignes à l'estimation haute (§8.1, §8.2).
- **P-3** : les dix paramètres de D-24 fixés avec leur source (§2) ; 23 constantes hors de cette liste recensées (§3).
- **P-4** : (h) transcrite en dix étapes ; chaque étape et chaque borne a son cas de test contre la place factice (§4).
- **P-5** : place factice mesurée par un prototype exécuté : 194 lignes, prise de contact par l'événement `upgrade` de `node:http` (§5).
- **P-6** : trois limites neuves de [F2] avec leur contre-mesure et leur lot (§9) ; deux items neufs (§10) ; onze questions, dont
  Q-P1-4 close pendant la rédaction par [A] l.26-31 (§11) ; deux de plus au pli du cp-1 bref, Q-P1-12 et Q-P1-13 (§11).

## 1. Sources et mesures locales (provenance des paramètres)

### 1.1 Sources
Lues en entier : [A], [F1], [F2], [Q], [P2], [R], [K], [r25]. Lues par lignes : [T], [MT], [CI], [U1], [U2], [FK], aux lignes
données en §12. Empreintes et niveaux en §12.

### 1.2 Mesures locales, sur le poste de ce worker, sans réseau (heures `date -u`)
- **L-1, client WebSocket embarqué** (entre 20:42 et 21:00 UTC) : Node v24.15.0, undici 7.24.4, source
  `internal/deps/undici/undici` de 17 435 lignes, sha256 `d6332aa1…`, égale à [N] de l'ADR ([A] l.798-800). Lignes relues : canaux
  l.2617-2621 ; `undici:client:connected` l.9331-9344 (publie `connectParams`, dont `localAddress`, et le socket) ; GUID l.14069 ; clé
  et offre de `permessage-deflate` l.14457-14464 ; contrôles de la réponse l.14470-14510 ; décompression bornée à 4 Mio l.14593,
  l.14639 ; message non compressé refusé au-delà de 2^31 octets seulement, l.14823 ; PONG écrit par le client l.14979-14984 ; canal
  `ping` qui publie la charge et l'objet WebSocket l.15154-15161 ; décodage UTF-8 fatal l.14280-14291 et l.15406-15416.
- **L-2, `node:http` embarqué** (entre 21:02 et 21:14 UTC) : module `_http_server`, 1 291 lignes, sha256 `12022534…` : l'événement
  `upgrade` est émis quand un écouteur existe (l.549, l.980).
- **L-3, prototype de la place factice** (écrit avant 21:00:59, exécuté à 21:01:12 puis 21:02:00 UTC), hors dépôt :
  `F:/tmp/rech/l2/p1plan/tmp/proto/l2-fake-place.ts` (106 lignes, sha256 `33573be37738c6f6…`) et `l2-fake-place.test.ts` (88 lignes,
  sha256 `aa4a10deed9c8d9c…`), boucle locale, port tiré au-dessus de 10080 comme [T] l.65-79. Contre le client embarqué et `fetch` :
  7 cas sur 7 verts à 21:02:00 UTC (`tmp/proto-run-2.out`, sha256 `89ecc1ac…`) ; `tsc` du tronc aux options du `tsconfig.json` du
  dépôt : 0 erreur (`tmp/proto-tsc-2.out`, vide) ; deux mutants tués entre 21:02 et 21:06 UTC, seuil des formes de longueur et
  démasquage (`tmp/mut1/run.out` `f09e60fb…`, `tmp/mut2/run.out` `b984237e…`).
- **L-4, environnement minimal** (21:06:35 UTC) : avec `TEMP` et `TMP` seuls, les sept cas restent verts (`tmp/proto-run-env-min.out`) ;
  sans eux, `os.tmpdir()` désigne un dossier de C: (chemin lu, rien écrit).
- **L-5, analogues mesurés** (git en lecture) : premier lot des bougies Binance `f46c454f` : code 249, `.d.mts` 78, tests 357, 12 tests
  portant chacun sa ligne de tueur ; lot des bougies Coinbase `703f75ae` : 320, 87, 727, 30 tests et 30 tueurs ; aujourd'hui, les
  bougies Binance font 317 + 99 + 825 = 1 241 lignes.
- **L-6, charge du poste avant les courses** (21:00:59 UTC) : 28 `node.exe` ; 16 279 Mo physiques et 22 937 Mo virtuels libres
  (`Get-CimInstance`) : sous les bornes de C-V-4 et de METHODE-VMEM-PRECHECK-1 ([R] l.3, l.13).

## 2. Paramètres de D-24 : valeur, source, mesure qui la fixe

Liste de [A] l.294-300. « Provisoire » : valeur fixée ici, revue sur la mesure nommée.

- **D24-1, k du chien de garde = 3**, soit 60 s en spot et 540 s sur `/market`. Source : ping toutes les 20 s, déconnexion sans pong en
  une minute ([F1] l.17) ; toutes les 3 min et 10 min en futures ([F1] l.47). Motif : un ping retardé d'un intervalle laisse un écart de
  deux intervalles, sous k ; en spot, trois intervalles égalent la patience de la place elle-même ; en futures, 9 min restent sous 10.
  Toute trame et tout ping remettent le délai à zéro ; le ping se lit sur le canal `undici:websocket:ping`, qui publie l'objet WebSocket
  (L-1, l.15156-15159) : attribution par connexion. Mesure : écart maximal entre deux pings par type de connexion, journalisé (M-1, M-7).
- **D24-2, reprises : n = 3 instantanés par reprise, puis suspension de 60 s**, nommée, avant une reprise neuve ; pause de 1 s entre
  deux essais d'une même reprise (provisoire, M-3). Source : poids 250 par instantané ([F1] l.37) ; plafond `REQUEST_WEIGHT` de 6 000 par
  minute lu le 2026-10-03 ([F2] l.25-27), relu chaque jour par l'enregistreur. Motif chiffré : pire minute = quatre symboles en reprise
  vaine, 4 × 3 × 250 = 3 000, pendant la minute des ancres, 4 × 250 = 1 000 : 4 000, les deux tiers du plafond lu ; 60 s égalent la
  fenêtre du plafond, deux salves d'un même symbole ne partagent jamais une minute. 429 et 418 suspendent en plus jusqu'à `Retry-After`
  ([F1] l.38-39), le trou restant ouvert et nommé. Mesure : M-3 (essais par reprise, poids lu dans les en-têtes contre le plafond du
  jour). Plafond du jour sous 4 000 : Q-P1-6.
- **D24-3, période de coupe des segments = 3 600 s**, aux heures pleines UTC de l'horloge de l'hôte. Motif : un jour se scelle quand
  chaque segment qu'il référence est clos ([A] l.279-281), donc au plus une heure après minuit, plus la grâce ; cinq connexions, 24
  segments, deux fichiers par segment : 240 fichiers par jour hors reconnexions ; alignée sur la lecture horaire de l'heure de la place
  ([A] l.228). Écartée : 900 s, quatre fois plus de fichiers pour un scellé 45 min plus tôt que rien n'attend (copie à chaque scellé,
  [Q] l.15). Mesure : nombre et taille des segments au rapport de M-1.
- **D24-4, borne de la file d'écriture = 8 Mio (8 388 608 octets) par connexion**. Motif : budget de référence `MemoryMax=512M` des deux
  unités du dépôt ([U1] l.55, [U2] l.59) ; au pire dix connexions pendant les chevauchements, 80 Mio, 15,6 % de ce budget ; le double de
  la borne de décompression du client (4 Mio, L-1), pour qu'un message qu'il délivre tienne toujours dans la file. Sans compression, le
  client ne borne un message qu'à 2^31 octets (L-1, l.14823) : la file est donc la borne de trame côté WebSocket (SERIES-BODY-BOUND-1) ;
  au-delà, fermeture et trou nommés. Mesure : longueur maximale par connexion au rapport de M-1 ; borne atteinte ⇒ construction chiffrée
  avant le plan de P3 ([A] l.588-590) ; le `MemoryMax` de l'unité de P3 se fixe sur M-1, avec au moins 80 Mio de marge.
- **D24-5, grâce provisoire (Q-10) = 120 s**. Motif : une trame suit les pings dans l'ordre du flux ; la place coupe sans pong dans la
  minute et pingue toutes les 20 s ([F1] l.17) : sur une liaison qu'elle ne coupe pas, une trame spot arrive moins de 80 s après son
  envoi ; 40 s de plus couvrent l'écart d'horloge de l'hôte, non mesuré (L2-HOST-CLOCK-1). Sur `/market`, la même règle donne 13 min
  ([F1] l.47) : des liquidations tardives restent possibles, marquées et comptées ([A] l.279-280). Mesure : M-6 fixe la valeur.
- **D24-6, prix de la place factice = 194 lignes mesurées** (106 + 88, L-3) ; 230 lignes planifiées dans P1-a1 (§5).
- **D24-7, étapes de (h)** : dix étapes, bornes et cas en §4 ; source [F2] l.42-49.
- **D24-8, disposition des segments** : §7.
- **D24-9, prise de contact Upgrade** : supportée par `node:http` (L-2) et acceptée par le client embarqué (L-3) : réponse 101 avec
  `Upgrade`, `Connection` et `Sec-WebSocket-Accept`, SHA-1 en base 64 de la clé suivie du GUID (L-1, l.14069, l.14496-14501) ; aucune
  extension répondue, alors que le client propose `permessage-deflate` (L-1, l.14463-14464 ; relevé par le prototype).
- **D24-10, taille de chaque lot** : §8.1 (méthode) et §8.2 (lot par lot).

## 3. Constantes hors de la liste de D-24 (recensement contre FM-1.1)

La G2 de P1 confronte chaque constante du code à sa ligne ici ou en §2 ([A] l.479-483). Lot entre crochets.

1. Symboles : BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT, liste fermée ([A] l.194 ; [K] l.38) ; différences gardées pour les quatre en P1 et en
   M-1 (Q-7, « M-1 mesure les 4 », [Q] l.13) ; le repli de Q-8 attend M-1 (L2-DIFFS-BNBSOL-1). [a3]
2. Flux spot d'une connexion : `@depth@100ms`, `@bookTicker`, `@trade`, en forme combinée, symboles en minuscules ([F2] l.28-29 ;
   [A] D-19). [a3]
3. Unité d'heure (Q-5 close : microsecondes, choix du fondateur et accord de RECHERCHES, [A] l.26-31 ; [Q] l.34-38) :
   `timeUnit=MICROSECOND` sur les flux spot, paramètre d'URL ([F2] l.28-30) ; rien sur `/market` tant que FAITS-L2-ACCESS-3 (e) ne le
   documente pas. Conditions de RECHERCHES ([A] l.28-31) : (1) unité écrite au manifeste de chaque jour, par source (`time_unit: "us"`
   pour le spot ; pour `@forceOrder`, celle que FAITS-L2-ACCESS-3 (e) établit), jamais déduite d'une grandeur ; (2) heures de la place
   gardées en entiers tels que reçus (`Number.isSafeInteger`, sinon arrêt nommé du dérivé), jamais en flottant ; (3) heure de réception
   locale dans la même unité, nommée à part (point 18) ; (4) aucun fichier public n'entre en P1 : la condition suit l'outil d'import de
   L2-TRADES-BACKFILL-1 (§9). [a2, a3, a4, c1, c2]
4. Hôtes admis : liste fermée, une entrée par ligne de FAITS ([F1] l.16-18 pour le spot, base choisie par Q-P1-3 ; [F2] l.18 pour le
   REST spot ; [F1] l.46 et [F2] l.62 pour `/market`) ; toute autre URL refusée avant la fabrique, comme [K] l.159. [a3, a4, b1]
5. Intervalles de ping documentés : 20 s en spot, 180 s en futures ([F1] l.17, l.47). [a3, a4]
6. Reconnexion planifiée : à 23 h d'âge plus 5 min × rang (0 à 3 pour les symboles dans l'ordre de la liste, 4 pour `/market`), soit au
   plus 23 h 20 min, 40 min avant la borne de 24 h ([F1] l.16, l.47) ; sur `serverShutdown`, aussitôt. [a4]
7. Chevauchement : 60 s au moins (trois pings spot) avant de fermer l'ancienne connexion, qui attend aussi la bascule du carnet (§4.3) ;
   sans bascule, elle reste ouverte jusqu'à la coupure de la place, puis rupture nommée. [a4, b2]
8. Reprises de connexion non planifiées : délais de 1, 2, 4… s, plafonnés à 60 s ; au plus 30 ouvertures par 5 min glissantes pour le
   processus, un dixième de la limite lue ([F1] l.19-20), soit six redémarrages de ses cinq connexions. [a3]
9. Chemins et poids REST : `depth` avec `limit=5000`, 250 ([F1] l.23, l.37) ; `exchangeInfo` par symbole, 20 ([F2] l.7, l.18 ;
   [F1] l.39) ; heure de la place, 1 ([F2] l.24). [b1]
10. En-têtes journalisés : `x-mbx-used-weight-1m` (forme lue en [FK] l.23-24), `retry-after`, `date`, comme [K] l.170-171. [b1]
11. Délai d'une requête REST : 30 s (analogue [K] l.44). [b1]
12. Borne d'un corps REST : 8 Mio, lu par morceaux, arrêt nommé au-delà (SERIES-BODY-BOUND-1) ; un instantané porte au plus 5 000
    niveaux par côté ([F1] l.24-25, l.37) ; la plus grande taille vue va au rapport de M-1. [b1]
13. Heure de la place : lue à la minute 30 de chaque heure de l'hôte, hors des coupes et de la minute des ancres ; écart = `serverTime`
    (en ms, [F2] l.24, multiplié par 1 000) moins le milieu des heures locales de demande et de réponse, en µs (condition 3 du point 3),
    journalisé. [b1, c5]
14. `exchangeInfo` : par symbole, au départ puis chaque jour à 23:58:00 + 10 s × rang (horloge de l'hôte corrigée du dernier écart) ;
    échelle (`tickSize` de `PRICE_FILTER`, [F2] l.56-58) et tableau `rateLimits` ([F2] l.25-27) figés au manifeste du jour suivant ;
    échelle s = rang de la dernière décimale non nulle de `tickSize`. [b1, c5]
15. Ancres : une par symbole à 23:59:10 + 10 s × rang, même horloge ([A] D-9). [c5]
16. Quota (Q-11) : `--quota-bytes`, posé à chaque lancement par l'orchestrateur ; alarme journalisée à 70 %, arrêt nommé à 85 % des
    octets de `--out` ([Q] l.24) ; au départ, espace libre du système de fichiers au moins égal au quota restant, sinon arrêt nommé. [c4]
17. Liste admise d'environnement (SERIES-ENV-ALLOWLIST-1) : noms seuls, valeurs jamais lues ; contenu par Q-P1-10 ; `execArgv` non vide
    refusé comme [K] l.110-114. [c4]
18. Ligne d'index de réception : `rank`, `offset`, `length`, `recv_us` (heure murale de l'hôte en µs, entière, nommée à part des heures
    de la place : condition 3 du point 3), `mono_ns` (chaîne décimale), écrite après sa trame ([A] l.263-266). [a2]
19. Schéma du manifeste : `monark.l2.binance.v1` (analogue `monark.series.binance.v2`, [K] l.259) ; `script_sha256`, configuration, Node
    et undici ([A] l.241), `redistributable: false`, `time_unit` par source (condition 1 du point 3), échantillonnage de `@forceOrder`
    ([F1] l.49-51), clés de dédoublonnage (§9). [c1]
20. Fenêtre de ±100 pb : 100·|2p − b − a| ≤ b + a, borne large, en entiers à l'échelle s ([A] l.237-240) ; distance arrondie vers le
    bas. [c2]
21. Minute t : carnet après les événements d'heure de place strictement antérieurs à t ([A] l.230-231). [c2]
22. Couture de test : `run(argv, io)` reçoit du seul appelant l'horloge murale, l'horloge monotone, les minuteries, `fetch`, la fabrique
    WebSocket, l'environnement, `execArgv`, la lecture d'espace libre et la sortie ; ni la ligne de commande ni l'environnement ne les
    posent ([K] l.29-30). [a2 à c6]
23. Drapeaux fermés de la commande : `--out` et `--quota-bytes` pour l'enregistrement ; `--from-raw`, `--symbol`, `--day` et `--out`
    pour le rejeu. [c4, c6]

## 4. Procédure (h) : étapes, bornes, cas de test

Source : [F2] l.42-49 (paraphrase de l'orchestrateur, lue sur place ; l'étape S4 y est citée). Les cas tournent dans le test
`l2_h_steps_table` de P1-b2, contre la place factice : différences servies par sa connexion, instantanés par son REST, horloge
injectée ; chaque cas fixe ses `(U, u)`, son `lastUpdateId`, ses niveaux et l'état attendu, petits et écrits à la main. S1 à S7 et A1 à
A3 reprennent les numéros (1) à (7) et (1) à (3) de [F2] (h).

### 4.1 Synchronisation, sept étapes ([F2] l.42-47)
- **S1** : ouvrir le flux de différences. Cas `S1` : le chemin relevé par la place factice nomme `<symbole>@depth@100ms` en forme
  combinée, avec `timeUnit` ; le client n'envoie que des PONG.
- **S2** : tamponner les événements, noter le `U` du premier. Cas `S2` : trois événements servis avant la réponse REST ; l'instantané
  est demandé après le premier événement ; aucun n'est appliqué avant S6.
- **S3** : lire un instantané `limit=5000`. Cas `S3` : appel relevé avec `limit=5000` et le symbole ; sa ligne dans `requests.jsonl`.
- **S4** : si `lastUpdateId` est strictement inférieur au `U` de S2, retour à S3. Borne STRICTE. Cas `S4-sous` (`lastUpdateId` = U − 1 :
  second instantané, essai nommé) ; `S4-egal` (`lastUpdateId` = U : aucun second instantané). Pli du cp-1 (C-4) : `S4-egal` et
  `S5-U-egal` tamponnent au moins deux événements avant la réponse de l'instantané, de `U` strictement croissants, le `U` du dernier
  strictement supérieur à `lastUpdateId`, et vérifient qu'un seul instantané est demandé : le mutant « `U` du dernier tamponné au lieu
  du premier » (S2) y demande un second instantané et rougit.
- **S5** : écarter les événements tamponnés dont `u` ≤ `lastUpdateId` ; le premier restant contient `lastUpdateId` dans [U;u]. Bornes :
  écart LARGE, intervalle FERMÉ. Cas `S5-u-egal` (u = lastUpdateId : écarté) ; `S5-u-plus-1` (u = lastUpdateId + 1 : gardé) ;
  `S5-U-egal` (U = lastUpdateId : accepté) ; `S5-U-dedans` (U < lastUpdateId < u : accepté) ; `S5-U-plus-1` (U = lastUpdateId + 1 :
  Q-P1-7) ; `S5-U-plus-2` (essai vain, synchronisation neuve, nommé) ; `S5-vide` (tout écarté : le prochain événement reçu est le
  premier restant, contrôlé de même).
- **S6** : poser le carnet à l'instantané, identifiant = `lastUpdateId`. Cas `S6` : après S7, carnet égal niveau à niveau à l'état
  attendu du cas.
- **S7** : appliquer la procédure d'application aux événements tamponnés, puis aux suivants. Cas `S7` : le tampon d'abord, dans l'ordre
  de réception, puis le flux ; état final égal à l'état attendu.

### 4.2 Application, trois étapes ([F2] l.47-49)
- **A1** : ignorer l'événement si `u` < identifiant local (STRICTE) ; si `U` > identifiant local + 1 (STRICTE), des événements manquent :
  carnet jeté, tout reprendre ; normalement `U` = `u` précédent + 1. Cas `A1-u-sous` (u = id − 1 : ignoré, ni changement ni rupture) ;
  `A1-u-egal` (u = id : appliqué sans effet, quantités absolues, [F2] l.34-35) ; `A1-U-plus-1` (U = id + 1 : appliqué) ; `A1-U-plus-2`
  (U = id + 2 : rupture nommée au `missing.json`, carnet jeté, synchronisation neuve).
- **A2** : poser chaque quantité, retirer le niveau dont la quantité vaut zéro ([F2] l.34-35). Cas `A2-pose` (quantité remplacée, jamais
  ajoutée) ; `A2-zero` (zéro écrit avec des décimales : niveau retiré) ; `A2-neuf` (prix absent : niveau inséré).
- **A3** : identifiant local = `u`. Cas `A3` : après [U;u], `U` = u + 1 passe ; `U` = u + 2 rompt (A1).

### 4.3 Reprises bornées et bascule (TL-2, TL-6)
- `l2_chain_gap_named_then_resync` (TL-2, [A] l.316-319) : trou injecté ⇒ rupture nommée ⇒ instantané neuf ⇒ reprise ; instantané
  antérieur au tampon ⇒ instantané neuf, essai nommé ; trois essais vains ⇒ suspension de 60 s nommée, aucun instantané avant son terme
  (horloge injectée), puis reprise réussie ; 429 avec `Retry-After` ⇒ aucun instantané avant ; 451 ⇒ arrêt de tout ([K] l.174).
- Bascule (D-8) : le carnet suit une seule connexion ; pendant le chevauchement, les différences de la neuve sont tamponnées ; à la
  bascule, celles de `u` ≤ id sont écartées et la première restante doit continuer la chaîne (même question que S5 pour `U` = id + 1 :
  Q-P1-7) ; l'ancienne reste au brut. Test `l2_overlap_switch_no_gap` (TL-6, [A] l.330-332) : borne de 24 h et `serverShutdown`
  simulés ; une seule suite au carnet, aucune rupture ; les deux suites au brut.

## 5. Place factice (D-5 ; [A] D-22, Q-23)

- **Forme** : un serveur `node:http` sur la boucle locale, port tiré au-dessus de 10080 (contrôle de port de `fetch`, [T] l.65-79) ;
  prise de contact sur l'événement `upgrade` (D24-9) ; trames du serveur non masquées, trois formes de longueur ; trames du client
  masquées, démasquées et relevées dans l'ordre avec leur bit de masque ; PING, PONG, CLOSE avec code, fragmentation ; `mute` (silence
  sans fermeture : liaison morte) et `cut` (coupure sans CLOSE) ; REST scripté par chemin (statut, en-têtes, corps).
- **Fabriques et pièges** : `fetch` et fabrique WebSocket injectés, qui ne réécrivent vers la boucle locale que les origines de la liste
  admise et refusent tout le reste ; `fetch` et `WebSocket` globaux remplacés par des pièges dans chaque fichier de test ([T] l.2-7,
  l.36) : aucun test n'atteint le réseau, même sous mutant.
- **Neutre en formes** : la place factice sert les trames que chaque test construit depuis §6 ; elle ne connaît ni l'enregistreur ni la
  règle de chaîne (FM-3.3).
- **Prix** : 194 lignes mesurées (L-3) ; 230 planifiées dans P1-a1, dont 36 estimées pour les deux fabriques et les pièges.
- **Faits mesurés que P1-a1 garde en assertions** (L-3) : octets identiques pour 0, 125, 126, 65 535, 65 536 et 200 000 octets et pour
  un texte UTF-8 multi-octets ; fragments reçus en un seul message ; un PING suivi d'un PONG masqué de même charge, et de rien d'autre
  avant la fermeture ; CLOSE 1001 du serveur répondu, code vu ; place muette : le CLOSE du client reste sans réponse, la coupure donne
  1006 ; un BOM de tête n'atteint pas le client (décodage UTF-8, L-1) ; REST servi à `fetch` avec ses en-têtes.
- **Hors de sa portée** : TLS (SERIES-TLS-PEER-LOG-1 se prouve en M-1, §9) ; compression `permessage-deflate` (extensions négociées
  journalisées, lues en M-1) ; trames réelles (D-25).
- **Reprise du prototype par le G1** : Q-P1-1.

## 6. Formes des trames synthétiques (FM-3.2) et lectures manquantes

Chaque forme cite sa ligne ; un champ sans ligne n'est pas inventé.
- Enveloppe combinée `{"stream":…,"data":…}`, noms de flux en minuscules : [F2] l.28-29.
- Différences : `U`, `u` ([F1] l.21), `E` ([F2] l.31) ; noms des tableaux de niveaux non transcrits : FAITS-L2-ACCESS-3 (d).
- Meilleur prix : `u`, `s`, `b`, `B`, `a`, `A` seulement, chaînes décimales ([F2] l.31-33 ; [F1] l.29-30).
- Transaction : `t`, `T`, `m` ([F1] l.30), `E` ([F2] l.31) ; l'enregistreur ne lit aucun autre champ.
- Liquidation : `E`, `o.T`, aucun identifiant d'ordre ([F2] l.62-65).
- Instantané REST : `lastUpdateId` ([F1] l.23, l.26) ; tableaux de niveaux : FAITS-L2-ACCESS-3 (d).
- `exchangeInfo` : `REQUEST_WEIGHT` par minute dans `rateLimits` ([F2] l.25-27) ; `tickSize` de `PRICE_FILTER` ([F2] l.56-58) ; noms
  des clés : FAITS-L2-ACCESS-3 (f).
- Heure de la place : `serverTime`, en ms ([F2] l.24).
- `serverShutdown` : nommé ([F1] l.17) ; forme JSON et livraison en connexion combinée : FAITS-L2-ACCESS-3 (c).
- Charge d'un PING : quelconque, le client la recopie (L-1, l.14979-14984).
- Valeurs : entiers et décimaux synthétiques, sans lien avec un marché ; aucune trame réelle au dépôt (D-25).

**FAITS-L2-ACCESS-3** (item neuf, §10) : lecture sur place par l'orchestrateur, datée, épinglée par empreinte, commise ; liste fermée :
(a) base complète (schéma, hôte, port) des flux spot en forme combinée, pour chacune des deux bases de [F1] l.16 et l.18, et validité
pour la base réservée aux données de marché des règles de [F1] l.16-19 (24 h, ping, 5 messages) ; (b) forme combinée complète sur
`/market` ([F2] l.62 s'arrête sur une ellipse) ; (c) forme JSON de `serverShutdown` et sa livraison en connexion combinée ; (d) noms
des tableaux de niveaux de `depthUpdate` et de la réponse `depth` ; (e) `timeUnit` sur les routes futures ; (f) noms des clés des
entrées de `rateLimits` et du filtre `PRICE_FILTER`. Déclencheurs : (a) avant le G1 de P1-a3 ; (b), (c) et (e) avant celui de P1-a4 ;
(d) et (f) avant celui de P1-b1.

## 7. Disposition des segments et du jour (D24-8)

```
<out>/                                hors de tout arbre git (garde de [K] l.116-127)
  conn/<cid>/<seg>.frames             trames telles que délivrées, une LF après chacune
  conn/<cid>/<seg>.index.jsonl        une ligne par trame, écrite après elle (§3, point 18)
  journal.jsonl                       journal de connexion, sans adresse ([A] l.225-227)
  requests.jsonl                      toute réponse REST ([K] l.170-172)
  rest/<SYMBOLE>/<genre>-<heure>.json corps 200 tels que reçus ; rest/errors/ pour les autres (SERIES-ERROR-BODY-1)
  days/<SYMBOLE>/<AAAA-MM-JJ>/         jour UTC de la place : index.jsonl, anchor-open.json, anchor-close.json,
                                      missing.json, manifest.json, minutes.jsonl, SHA256SUMS
```
- `<cid>` = `<spot|market>-<SYMBOLE|ALL>-<heure d'ouverture de l'hôte, AAAAMMJJTHHMMSSmmmZ>` ; `<seg>` = `AAAAMMJJTHH`, l'heure de coupe.
- Un segment ne contient que des trames reçues pendant son heure ; la coupe ne lit jamais une trame ([A] D-7).
- `index.jsonl` d'un jour : par flux, les `(cid, seg, rank)` de ses trames ; l'amorce, différences de la veille postérieures au
  `lastUpdateId` de l'ancre d'ouverture ; les trames tardives, marquées de leur jour ([A] l.274-281).
- L'ancre prise dans la dernière minute du jour D-1 est écrite en `anchor-close.json` de D-1 et en `anchor-open.json` de D, mêmes octets
  ([A] D-9).
- `SHA256SUMS` du jour, au format de `sha256sum -c` vérifié depuis le dossier du jour, liste ses fichiers et chaque segment et index
  référencé par chemin relatif (`../../../conn/<cid>/<seg>.frames`) ; un segment de borne est listé par deux jours, un segment de
  `/market` par les quatre symboles.
- Scellé : grâce passée et chaque segment référencé clos ; un index scellé n'est jamais réécrit ; le rejeu ne lit que les segments
  référencés et refuse, arrêt nommé, rien d'écrit, un segment dont l'empreinte diffère de `SHA256SUMS`.

## 8. Lots (D-1)

### 8.1 Méthode d'estimation (D-27)
- Compte : `r25` local, insertions plus suppressions, hors `docs/**/*.md` ([CI] l.82 ; [r25] l.1-7) : code, `.d.mts` et tests comptent,
  la place factice sous `test/` comprise.
- Ratios mesurés (L-5) : `.d.mts` sur code = 0,31 et 0,27, d'où d = 0,31 c ; tests sur code = 1,43 (premier lot des bougies Binance) et
  2,27 (lot des bougies Coinbase), tueurs compris dans les deux : estimation basse t = 1,43 c, haute t = 2,27 c. Pour c5 et c6, où les
  tests de composition dominent, t est compté test par test (30 et 24 lignes par test aux analogues, 357/12 et 727/30 ; 60 lignes pour
  un test de composition, le double de cette moyenne : jugement écrit).
- c, lignes de code : par composant, par analogie avec une fonction mesurée de [K] (requête journalisée, l.156-180 : 25 lignes ;
  gardes, l.110-127 : 16 ; manifeste et `SHA256SUMS`, l.254-275 : 22 ; attestation du rejeu, l.134-193 : 60) ; jugement écrit par lot.
- Cible : 470 lignes à l'estimation haute, 77 de marge sous 547 ; un lot qui dépasse 547 au gel est scindé au point pré-déclaré, jamais
  compacté ([A] D-27 ; [R] l.9) ; un lot dont le solde passe sous 10 lignes est scindé avant toute compaction.

### 8.2 Les douze lots (tests de composition de l'ADR en gras ; « tueurs » = mutations que les tests doivent tuer, convention [T] l.136)

- **P1-a1, place factice** : `test/l2-fake-place.ts`, `test/l2-fake-place.test.ts`. Contenu : §5. Tests : les sept cas de L-3
  (`fake_place_handshake_and_three_length_forms_byte_identical`, `fake_place_fragments_reach_the_client_as_one_message`,
  `fake_place_ping_gets_a_masked_pong_with_the_same_payload_and_nothing_else`, `fake_place_server_close_is_answered_and_seen_with_its_code`,
  `fake_place_mute_answers_nothing_and_a_cut_ends_the_client`, `fake_place_a_leading_bom_does_not_reach_the_client`,
  `fake_place_rest_answers_its_script_through_fetch`) et `fake_place_factories_refuse_other_origins`. Tueurs : seuil des formes de
  longueur et démasquage (tués au prototype, L-3), réécriture d'origine. Taille : 194 mesurées, 230 planifiées. MAST : FM-3.3 ;
  preuve : auto-test contre le client embarqué, jamais contre l'enregistreur ; mutants de la place tués.
- **P1-a2, segments** : `scripts/l2/segments.mjs`, `scripts/l2/segments.d.mts`, `test/l2-segments.test.ts`. Contenu : trame puis LF,
  ligne d'index écrite après la trame, coupe à l'heure (D24-3), file bornée par connexion (D24-4) avec signal de débordement, contrôle de
  queue à la reprise dans les deux sens et marquage, lecteur de segment partagé avec le rejeu. Tests : `l2_segment_index_after_frame`,
  `l2_segment_cut_on_clock`, `l2_segment_queue_bound`, **`l2_write_tail_marked`** (TL-1, au lecteur partagé ; repris en c6),
  `l2_index_recv_us_integer_named_apart` (condition (3) de RECHERCHES, §3 points 3 et 18 ; pli du cp-1, C-5 : horloge murale
  injectée ; `recv_us` entier sûr, égal à sa valeur en µs ; clés de la ligne exactement `rank`, `offset`, `length`, `recv_us`,
  `mono_ns`, aucune au nom d'une heure de la place). Tueurs : ordre trame puis index, borne de coupe (< ou ≤), test de la file
  (> ou ≥), période, `recv_us` en ms ou en flottant. Taille : c 130, d 40, t 186 à 295, soit 356 à 465.
  Scission pré-déclarée : écrivain, coupe et file | queue et lecteur. MAST : FM-2.6 ; preuve : `l2_write_tail_marked`,
  `l2_segment_index_after_frame`.
- **P1-a3, liaisons spot** : `scripts/l2/links.mjs`, `scripts/l2/links.d.mts`, `test/l2-links.test.ts`. Contenu : URL combinée et
  `timeUnit`, liste admise d'hôtes, connexion par la fabrique injectée, octets délivrés vers les segments sans lecture préalable, journal
  (ouverture, fermeture, cause, flux, extensions, pings par le canal ; jamais une adresse), chien de garde (D24-1), reprises non
  planifiées bornées (§3, point 8), fermeture nommée sur débordement. Tests : `l2_capture_raw_as_served` (les trois assertions FM-2.6
  de TL-1 : brut égal aux octets servis ; trames du client relevées, PONG et fermeture seuls ; journal sans adresse),
  **`l2_half_open_watchdog_named`** (TL-6 ; rien à k × 20 s − 1 ms, fermeture nommée à k × 20 s), **`l2_backpressure_named_stop`**
  (TL-1), `l2_reconnect_attempts_bounded`, `l2_host_refused`. Tueurs : k, borne du délai, filtre d'adresse du journal, `timeUnit`,
  plafond des ouvertures. Taille : c 125, d 39, t 179 à 284, soit 343 à 448. Scission pré-déclarée : capture, journal et pings | chien
  de garde, reprises et débordement. MAST : FM-2.6 ; preuve : `l2_capture_raw_as_served`.
- **P1-a4, continuité et `/market`** : `scripts/l2/links.mjs`, `scripts/l2/links.d.mts`, `test/l2-continuity.test.ts`. Contenu :
  reconnexion planifiée en chevauchement (§3, points 6 et 7), `serverShutdown` lu après écriture, connexion `/market` des quatre
  `@forceOrder`, chien de garde à l'intervalle des futures. Tests : `l2_overlap_planned_raw` (les deux suites au brut, aucun instant
  sans connexion ouverte, causes au journal), `l2_market_link_futures_watchdog`. Tueurs : âge de reconnexion, décalage, durée du
  chevauchement, intervalle des futures. Taille : c 55, d 17, t 79 à 125, soit 151 à 197. MAST : FM-2.4 (trou tu à une bascule) ;
  preuve : `l2_overlap_planned_raw`.
- **P1-b1, REST** : `scripts/l2/rest.mjs`, `scripts/l2/rest.d.mts`, `test/l2-rest.test.ts`. Contenu : `depth`, `exchangeInfo` et heure ;
  hôte contrôlé, redirections refusées, délai, corps borné et gardé avant lecture (200 sous `rest/`, les autres sous `rest/errors/`),
  `requests.jsonl` ; 429 et 418 suspendent jusqu'à `Retry-After` ; 451 arrête tout ; échelle et `rateLimits` ; écart d'horloge ;
  empreinte du certificat de la place par le canal `undici:client:connected` (L-1), sans `localAddress` ni aucune adresse
  (SERIES-TLS-PEER-LOG-1). Tests : `l2_rest_logged_and_kept_before_read`, `l2_rest_429_418_suspend_until_retry_after`,
  `l2_rest_451_stops_all`, `l2_rest_body_bound_named`, `l2_rest_host_and_redirect_refused`, `l2_exchangeinfo_scale_and_limits`,
  `l2_time_offset_logged`, `l2_tls_peer_logged_without_address` (boucle locale sans TLS : champ nul ; socket de test portant un
  certificat : empreinte ; aucune adresse). Tueurs : classes de statut, chemins et poids, arrêt sur 451, borne du corps. Taille : c 100,
  d 31, t 143 à 227, soit 274 à 358. MAST : FM-1.2 (appel hors liste, refus de région sans arrêt) ; preuve : `l2_rest_451_stops_all`,
  `l2_rest_host_and_redirect_refused`.
- **P1-b2, chaîne (h)** : `scripts/l2/book.mjs`, `scripts/l2/book.d.mts`, `test/l2-book.test.ts`. Contenu : §4 (S1 à S7, A1 à A3),
  reprises bornées (D24-2), ruptures et essais nommés, bascule entre connexions. Tests : `l2_h_steps_table` (§4, un cas par étape et
  par borne), **`l2_chain_gap_named_then_resync`** (TL-2), **`l2_overlap_switch_no_gap`** (TL-6). Tueurs : S4 (< ou ≤), S5 (≤ ou <),
  A1 (< ou ≤ ; > ou ≥), n, délai, pause, retrait à zéro, `U` noté à S2 (le dernier tamponné au lieu du premier : `S4-egal` et
  `S5-U-egal` rougissent, §4.1 ; pli du cp-1, C-4). Taille : c 105, d 33, t 150 à 238, soit 288 à 376. MAST : FM-2.2 ; preuve : un
  cas par borne, Q-P1-7 répondue avant le G1, campagne de mutants de la règle de chaîne, `RESULTS.json` cité ([A] l.539-540 ; [R] l.13).
- **P1-c1, jour et scellé** : `scripts/l2/day.mjs`, `scripts/l2/day.d.mts`, `test/l2-day.test.ts`. Contenu : jour d'une trame par son
  heure de place ; règle de `@bookTicker` (Q-9) ; trames tardives (D24-5) ; index du jour ; trous du journal et ruptures de la chaîne au
  `missing.json` ; scellé et `SHA256SUMS` (§7) ; manifeste (§3, point 19). Tests : `l2_day_index_by_event_time`,
  **`l2_bookticker_day_rule`** (TL-4), `l2_day_late_frame_marked` (reçue à la fin du jour plus la grâce : dans son jour ; une
  milliseconde après : tardive), `l2_day_seal_waits_grace_and_segments`, `l2_day_missing_from_journal_and_chain` ; pli du cp-1, C-5 :
  `l2_manifest_time_unit_per_source` (condition (1) de RECHERCHES : `time_unit` écrit par source au manifeste du jour, `"us"` pour
  les flux spot, pour `@forceOrder` celle de FAITS-L2-ACCESS-3 (e) ; des heures de fixture d'une grandeur de millisecondes n'y
  changent rien : jamais déduite d'une grandeur), `l2_place_time_unsafe_integer_named_stop` (condition (2) : une heure de la place
  qui n'est pas un entier sûr, `Number.isSafeInteger` faux, arrête le dérivé de son symbole, arrêt nommé, le brut continue ; aucune
  heure gardée en flottant ; ici, car c1 est le premier lot qui dérive un fichier d'une heure de la place, le jour d'une trame,
  [A] D-17). Tueurs : borne de la grâce, segment clos, règle de `@bookTicker`, unité tirée d'une grandeur, garde
  `Number.isSafeInteger` retirée. Taille : c 105, d 33, t 150 à 238, soit 288 à 376. MAST : FM-1.5 (jour scellé trop tôt) ;
  preuve : `l2_day_seal_waits_grace_and_segments`.
- **P1-c2, rejeu du carnet, minutes et parité** : `scripts/l2/derive.mjs`, `scripts/l2/derive.d.mts`, `test/l2-derive.test.ts`.
  Contenu : carnet d'un jour rejoué depuis son ancre d'ouverture et son amorce, avec le code de chaîne de b2 ; instantané de chaque
  minute (§3, points 20 et 21), distance atteinte, nombre de niveaux ; arrêt nommé du dérivé sur une chaîne hors de l'échelle ; parité à
  l'ancre de fermeture, écarts comptés par côté dans la plage de l'ancre. Tests : **`l2_minute_window_exact`** (TL-3),
  **`l2_daily_parity_counts`** (TL-5), `l2_day_replay_from_anchor_and_amorce`. Tueurs : ±100 pb (≤ ou <), minute (< ou ≤), arrondi,
  comparaison de parité. Taille : c 105, d 33, t 150 à 238, soit 288 à 376. MAST : FM-3.2 ; preuve : bornes de TL-3 et TL-5 ici, oracle
  réel M-4 en M-1 (parité contre l'ancre de la place).
- **P1-c3, empreintes et recoupements** : `scripts/l2/canon.mjs`, `scripts/l2/canon.d.mts`, `test/l2-canon.test.ts`. Contenu : deux
  empreintes par flux et par jour ([A] D-20) ; clés de dédoublonnage (§9 ; Q-P1-9) ; sauts de `t` comptés ; recoupements de
  `@bookTicker` avec les différences (L2-BOOKTICKER-GAP-1). Tests : `l2_canonical_digests_two_per_stream`, `l2_canonical_same_key_named`,
  `l2_forceorder_dedup_full_payload`, `l2_trade_id_jump_counted_not_a_hole`, `l2_bookticker_crosscheck_counts`. Tueurs : clé, ordre,
  nommage, recoupements (i) et (ii). Taille : c 90, d 28, t 129 à 204, soit 247 à 322. MAST : FM-2.4 (deux trames de même clé fondues
  sans nom) ; preuve : `l2_canonical_same_key_named`.
- **P1-c4, commande et gardes** : `scripts/record-binance-l2.mjs`, `scripts/record-binance-l2.d.mts`, `test/l2-record.test.ts`.
  Contenu : en-tête de discipline (modèle [K] l.1-30), arrêts nommés en liste fermée, drapeaux fermés (§3, point 23), liste admise
  d'environnement, `execArgv`, sortie hors de tout arbre git (reprise admise dans une sortie L2 existante), quota (§3, point 16),
  `main` et départ par chemins réels ([K] l.313-317 ; MAIN-GUARD-REALPATH-1). Tests : `l2_guard_env_allowlist`,
  `l2_guard_out_outside_git`, `l2_quota_alarm_and_stop`, `l2_main_runs_by_real_path`. Tueurs : test de la liste admise, seuils 70 et
  85 %, garde d'arbre git. Taille : c 110, d 34, t 157 à 250, soit 301 à 394. MAST : FM-1.2 (environnement, sortie dans un dépôt,
  disque plein) ; preuve : ces quatre tests.
- **P1-c5, boucle d'enregistrement** : `scripts/record-binance-l2.mjs`, `scripts/record-binance-l2.d.mts`, `test/l2-loop.test.ts`.
  Contenu : composition des liaisons, du REST, de la chaîne et du jour ; horaires (§3, points 6, 13, 14, 15 ; coupes ; scellés) ; arrêt
  propre sur signal (liaisons fermées, files vidées, segments clos). Tests : `l2_record_loop_schedules` (horloge injectée sur une borne
  de jour : chaque horaire de §3 vérifié), `l2_record_loop_clean_stop`. Tueurs : horaires, ordre d'arrêt. Taille : c 50, d 16, t 120
  (deux tests de composition à 60), soit 186. MAST : FM-1.1 ; preuve : `l2_record_loop_schedules`, qui confronte chaque horaire du code
  à §3.
- **P1-c6, rejeu `--from-raw` et composition** : `scripts/record-binance-l2.mjs`, `scripts/record-binance-l2.d.mts`,
  `test/l2-compose.test.ts`. Contenu : rejeu d'un jour scellé dans une sortie neuve, empreintes des segments référencés contrôlées avant
  toute écriture, sortie comparée à l'octet. Tests : **`l2_replay_byte_identical`** (TL-4 ; amorce comprise ; segment altéré ⇒ arrêt
  nommé, rien d'écrit ; queue marquée exclue), **`l2_capture_record_seal_replay`** (TL-1 complet : place factice ⇒ écrivain ⇒ scellé ⇒
  rejeu égal à l'octet, avec les trois assertions FM-2.6), **`l2_forceorder_record_replay`** (TL-7a : échantillonnage écrit au
  manifeste, chien de garde à l'intervalle des futures, rejeu égal). Tueurs : contrôle d'empreinte, sortie neuve. Taille : c 45, d 14,
  t 260 (trois tests de composition à 60, plus 80 pour les cas d'altération et les aides partagées), soit 319. MAST : FM-3.1 (G7 de
  P1 pris pour une preuve contre la place) ; preuve : ces tests ne lisent que la place factice, le branchement vers la place reste
  « non exécuté » jusqu'au jour réel de M-1 (D-25, L2-REAL-REPLAY-1).

Totaux : c 1 020, d 318 ; 3 271 lignes à l'estimation basse, 4 047 à la haute, contre 1 241 pour l'analogue mesuré (L-5).
Pli du cp-1 (C-4, C-5) : trois tests et un tueur ajoutés sans réestimer (§8.1 : t suit c, et le code visé est déjà au contenu de a2
et de c1, §3 points 18 et 19) ; au jugement de 30 lignes par test (le plus grand des deux analogues, §8.1), a2 irait à 495 et c1 à
436 à l'estimation haute, sous 547 ; le gel par `r25` tranche (D-27), la scission pré-déclarée de a2 restant disponible.

### 8.3 Ordre de fusion, dépendances, prérequis
- Ordre : a1, a2, a3, a4, b1, b2, c1, c2, c3, c4, c5, c6 ; chaque lot part du tronc après la fusion du précédent ; une pièce n'a jamais
  deux lots ouverts ([MT] l.62, l.68).
- Dépendances : a3 sur a1 et a2 ; a4 sur a3 ; b1 sur a1 ; b2 sur a3 et b1 ; c1 sur a2 et b2 ; c2 sur b2 et c1 ; c3 sur c1 et c2 ; c4 sur
  a2 ; c5 sur a4, b1, c1, c2, c3 et c4 ; c6 sur c5.
- Prérequis du G1 : a1 : cp-1 bref de ce plan, FAITS-L2-NEWDOCS-1 ([A] l.600-601), Q-P1-1, Q-P1-2 ; a3 : FAITS-L2-ACCESS-3 (a), Q-P1-3,
  Q-P1-5 ; a4 : FAITS-L2-ACCESS-3 (b), (c), (e) ; b1 : FAITS-L2-ACCESS-3 (d), (f), Q-P1-6, Q-P1-13 ; b2 : Q-P1-7 ; c1 : Q-P1-8 ;
  c3 : Q-P1-9 ; c4 : Q-P1-10. Avant la G2 de P1 : Q-P1-11 ; avant le G7 de P1 : Q-P1-12 (pli du cp-1). Q-P1-4 est close ([A] l.26-31).
- À chaque fusion : tests, tueurs et mutations ([R] l.20) ; campagne de mutants par l'outil du tronc, `RESULTS.json` cité ([R] l.13) ;
  oracle par l'outil du tronc ([R] l.3).
- Sortie de P1 : G2 de la partie (instance neuve), revue ou checkpoint, G7, §6.1 de l'ADR relue aux deux ([A] l.728-729) ; puis
  relecture de RECHERCHES (D-6) et M-1 (D-23, D-25).

## 9. Trois limites neuves (D-4) et items dont le déclencheur est ce plan

- **L2-TRADE-ID-CONSEC-1** ([F2] l.36-37, l.72) : ni l'unicité ni la consécutivité de `t` ne sont documentées. Contre-mesure en P1-c3 :
  un saut de `t` n'est jamais un trou (aucune entrée de `missing.json` par `t`), les trous du flux de transactions viennent du journal ;
  sauts et plus grand saut comptés par jour au manifeste, comme observation ; deux trames de même `t` aux octets différents nommées
  ([A] D-20) ; test `l2_trade_id_jump_counted_not_a_hole`. Item : sauts mesurés en M-1 par connexion et sur l'union ; source qui
  documente `t` cherchée ; L2-TRADES-BACKFILL-1 inchangé ([A] l.571-572), sauf qu'il porte désormais la condition (4) de RECHERCHES
  pour tout import de fichier public : frontière d'unité écrite fichier par fichier au manifeste d'import, contrôle croisé de grandeur
  qui arrête l'import en cas de contradiction ([A] l.30-31). Déclencheur : rapport de M-1.
- **L2-BOOKTICKER-U-1** ([F2] l.53-55, l.72-73) : l'unicité du `u` d'une trame `@bookTicker` n'est pas documentée, alors que D-20 en
  fait la clé de ce flux. Contre-mesure en P1-c3 : deux trames de même `u` aux octets différents gardées toutes deux et nommées au
  manifeste, jamais fondues ; le contrôle de trous de ce flux repose sur l'intervalle des différences, pas sur `u` ([F2] l.55) ; test
  `l2_canonical_same_key_named`. Clé de remplacement : Q-P1-9 (elle change une décision de l'ADR). Item : `u` répétés comptés en M-1 et
  en M-5. Déclencheur : rapport de M-1.
- **L2-LIQ-DEDUP-1** ([F2] l.63-65) : aucune clé de dédoublonnage documentée pour `@forceOrder`. Contre-mesure en P1-c3, réécrite au
  pli du cp-1 (C-6) sur Q-P1-9 décidée (octets exacts, ordre (clé, octets) ; amendement daté de D-20 en tête de [A]) : clé = les
  octets exacts de la charge, déclarée au manifeste ; la suite canonique de ce flux s'ordonne par ces octets.
  `l2_forceorder_dedup_full_payload` vérifie cette clé, et non la charge re-sérialisée : deux connexions qui livrent les mêmes octets
  donnent une entrée ; deux liquidations distinctes en donnent deux ; deux charges de même sens (égales une fois re-sérialisées,
  champs triés, chaînes décimales intactes) mais d'octets différents (ordre des champs, espaces : ce que M-5 mesure) donnent deux
  entrées, nommées au manifeste, jamais fondues. La re-sérialisation sert à nommer ce cas, jamais à fondre. Item : identifiant
  documenté cherché par FAITS-L2-NEWDOCS-1 ; identité des charges entre connexions mesurée en M-1 (M-5). Déclencheurs :
  FAITS-L2-NEWDOCS-1, puis rapport de M-1.
- **Items de [A] §7 à déclencheur « plan de P1 »** : L2-BOOKTICKER-GAP-1 (P1-c3 : recoupements (i) et (ii) comptés par jour ; la
  sémantique lue, toute variation du prix ou de la quantité du meilleur niveau ([F2] l.53-54), fonde (ii) ; les quatre symboles gardent
  leurs différences en P1 et en M-1, aucun ne reste sans recoupement ; clôture : test au G7 de P1, [A] l.579-583) ; L2-HALF-OPEN-1
  (P1-a3, k = 3, [A] l.584-585) ; L2-WRITE-TAIL-1 (P1-a2, [A] l.586-587) ; L2-BACKPRESSURE-1 (P1-a3, 8 Mio, longueur mesurée en M-1,
  [A] l.588-590).
- **Items que P1 construit pour le seul enregistreur L2** ([A] l.607-609) : SERIES-ENV-ALLOWLIST-1 et SERIES-PROXY-GUARD-1 (P1-c4 : la
  liste admise refuse par construction tout nom de mandataire) ; SERIES-BODY-BOUND-1 (P1-b1 pour les corps, P1-a3 par la file) ;
  SERIES-ERROR-BODY-1 (P1-b1) ; SERIES-ABSENT-ROOT-TEST-1 (P1-c4, `l2_guard_out_outside_git` sur une racine absente) ;
  MAIN-GUARD-REALPATH-1 (P1-c4) ; SERIES-TLS-PEER-LOG-1 (P1-b1 ; prouvé en M-1 seulement : la place factice n'a pas de TLS).

## 10. Items formés ou mis à jour par ce plan (propriétaire : orchestrateur ; état : ouvert)

- **FAITS-L2-ACCESS-3** (neuf) : §6, liste fermée (a) à (f), déclencheurs par lot.
- **L2-OWN-WS-CLIENT-1** (neuf, PAROXYSME) : limites mesurées du client embarqué (L-1, L-3) : le brut est le message tel que le client
  le délivre, pas les octets du fil (décompressé si `permessage-deflate` est négocié ; BOM de tête retiré ; UTF-8 invalide ⇒ liaison
  coupée en 1007) ; un message non compressé est tenu en mémoire jusqu'à 2^31 octets avant toute borne de l'enregistreur. Construction
  visée : un client WebSocket propre sur `node:tls`, qui garde les octets du fil, borne un message avant de le tenir et lit le certificat
  de la place (repli de SERIES-TLS-PEER-LOG-1, [A] l.458-459) ; prix : son encodeur et son lecteur de trames font 28 lignes dans le
  prototype (L-3, `frame` et `parse`, l.19-47), la prise de contact cliente et TLS restent à mesurer. Déclencheur : rapport de M-1
  (extensions négociées, plus grand message, toute fermeture 1007 ou 1009) ; clôture : décision sur chiffres.
- **Mis à jour** : L2-TRADE-ID-CONSEC-1, L2-BOOKTICKER-U-1, L2-LIQ-DEDUP-1, L2-BOOKTICKER-GAP-1, L2-HALF-OPEN-1, L2-WRITE-TAIL-1,
  L2-BACKPRESSURE-1 (§9) ; FAITS-L2-NEWDOCS-1 : avant le G1 de P1-a1, lecture littérale de [A] l.600-601.

## 11. Questions (aucune tranchée ici ; recommandation du planificateur entre parenthèses)

- **Q-P1-1** (orchestrateur, avant le G1 de P1-a1) : le G1 de P1-a1 part-il du prototype (L-3 : chemin, sha256, modèle et date déclarés
  au journal de provenance) ou écrit-il la place factice à neuf depuis §5 ? (partir du prototype : il est écrit depuis ce plan et [N],
  jamais depuis l'enregistreur, qui n'existe pas ; la G2 le relit comme tout code)
- **Q-P1-2** (orchestrateur, avant le G1 de P1-a1) : lecture de [A] §3 et §4 : chaque test TL est écrit dans le lot où sa composition est
  complète (TL-1 complet en c6, ses trois assertions FM-2.6 dès a3 sous `l2_capture_raw_as_served` ; TL-6 `l2_overlap_switch_no_gap` en
  b2, sa part brute en a4 ; TL-7a en c6), alors que [A] l.362-364 range TL-1, TL-6 et TL-7a dans P1-a ; `l2_write_tail_marked` se prouve
  en a2 au lecteur partagé avec le rejeu. (oui : un test de composition ne se lit qu'une fois la composition construite)
- **Q-P1-3** (orchestrateur, avant le G1 de P1-a3, après FAITS-L2-ACCESS-3 (a)) : base spot réservée aux données de marché ([F1] l.18)
  ou base générale ([F1] l.16) ? (la base réservée, moindre privilège, si (a) y confirme les règles de [F1] l.16-19)
- **Q-P1-4** (RECHERCHES, avant le G1 de P1-a3) : Q-5 répondue par le fondateur, microsecondes ([Q] l.37), RECHERCHES consulté.
  **Close pendant la rédaction** : accord de RECHERCHES à quatre conditions, inscrit dans [A] l.26-31 par le commit `19552acf` de
  l'orchestrateur (20:53:14 UTC, lu à 21:24:48 UTC) ; conditions reprises en §3, points 3, 13, 18 et 19, et en §9.
- **Q-P1-5** (orchestrateur, avant le G1 de P1-a3) : D-7 dit « trames texte telles que reçues » ; le brut sera le message tel que le
  client embarqué le délivre (§10, L2-OWN-WS-CLIENT-1). Cette lecture est-elle admise pour P1 ? (oui, avec l'item et les extensions
  négociées journalisées)
- **Q-P1-6** (orchestrateur, avant le G1 de P1-b1) : si le plafond `REQUEST_WEIGHT` lu un jour passe sous 4 000 par minute, la pire
  minute de D24-2, l'enregistreur suspend-il toute reprise en nommant l'arrêt, ou abaisse-t-il n ? (suspension nommée ; n reste une
  constante du plan)
- **Q-P1-7** (orchestrateur, avant le G1 de P1-b2) : S5 veut que le premier événement restant contienne `lastUpdateId` dans [U;u] ; A1
  accepte `U` = identifiant + 1. Pour `U` = `lastUpdateId` + 1 : lecture littérale (essai vain, nouvel instantané de poids 250) ou
  lecture de chaîne (accepté, comme A1) ? Même question pour la bascule (§4.3). Cas qui tranche : `S5-U-plus-1`. (lecture de chaîne :
  quantités absolues, [F2] l.34-35, aucun événement possible entre `lastUpdateId` et `U`)
- **Q-P1-8** (orchestrateur, avant le G1 de P1-c1) : index, dérivés et parité d'un jour sont-ils calculés au scellé par le code même du
  rejeu, depuis le brut seul, la chaîne en ligne ne servant qu'à détecter les ruptures et à décider des reprises ? (oui : un seul chemin,
  l'égalité à l'octet de `--from-raw` tient par construction, [A] D-11)
- **Q-P1-9** (orchestrateur, avant le G1 de P1-c3) : clé canonique de [A] D-20 face à L2-BOOKTICKER-U-1 et L2-TRADE-ID-CONSEC-1 : garder
  `u` et `t` en nommant les doublons aux octets différents, ou dédoublonner sur les octets exacts de la charge, ordonnés par (clé,
  octets) ? (octets exacts ordonnés par (clé, octets) : ne dépend d'aucune unicité non documentée ; amendement daté de D-20)
- **Q-P1-10** (orchestrateur, avant le G1 de P1-c4) : contenu de la liste admise : win32 `TEMP` et `TMP` (L-4) et `SYSTEMROOT`
  (provisoire : résolution de noms et TLS non mesurées sans réseau), revu au lancement de M-1 ; linux vide jusqu'à la mesure sous
  l'unité en P3, l'enregistreur refusant d'ici là tout lancement sous l'unité. (oui)
- **Q-P1-11** (fondateur et investisseur, avant la G2 de P1) : P1 compte douze lots et 3 271 à 4 047 lignes, qu'une seule G2 relirait
  ([R] l.20), soit 2,7 à 3,4 fois la borne d'une PR (1 205). Garder quatre parties, ou couper P1 en deux après b2 (capture et chaîne ;
  jour, dérivés et rejeu), cinq parties au total, le maximum admis pour un gros chantier ? (couper : chaque G2 relit alors moins de la
  moitié ; les quatre parties ont été choisies sur une taille non mesurée, [A] l.366-367)
- **Q-P1-12** (orchestrateur, avant le G7 de P1 ; relevée au pli du cp-1 bref, hors de sa liste) : la commande (c4) et la boucle (c5)
  n'existent qu'en P1-bis ; la sortie de P1 de [A] §4 (relecture de RECHERCHES, D-6, puis M-1 : [A] l.368-369) et les prérequis
  « après le G7 de P1 » de M-1 ([A] l.205, l.389, l.671 ; D-23, D-25, Q-22) et de P3 ([A] l.376) se lisent-ils « de P1-bis », et
  « la partie 1 » que P3 déploie ([A] l.380), « P1 et P1-bis » ? (oui : M-1 doit sceller un jour réel rejoué à l'octet, D-25, ce que
  seul P1-bis construit, et rien ne s'enregistre avant la commande ; le G7 de P1 le déclare par « scellé et rejeu non exécutés » ;
  lecture écrite au pli dans la carte, FM-2.2)
- **Q-P1-13** (orchestrateur, avant le G1 de P1-b1 ; relevée au pli du cp-1 bref, hors de sa liste) : b1 lit `serverTime`, heure de la
  place en ms ([F2] l.24), pour l'écart d'horloge (§3, point 13) ; or §3, point 3, ne range pas b1 parmi ses lots, et le point 13 n'y
  applique que la condition (3). `l2_time_offset_logged` vérifie-t-il aussi la condition (2) : `serverTime` entier sûr, sinon écart non
  calculé, nommé au journal ; écart entier, alors que le milieu de deux heures entières peut tomber sur une demi-microseconde ? (oui :
  la condition vaut pour toute heure de la place gardée, l'écart est gardé au journal ; milieu arrondi vers le bas, au µs, sans perte
  utile, `serverTime` n'ayant que la milliseconde)

## 12. Contrôles et sources

### 12.1 Contrôles de ce texte
Commandes, heures et empreinte finale : `F:/tmp/rech/l2/p1plan/REPONSE.md` ; au pli du cp-1 bref, mêmes contrôles rejoués sur ce
texte et sur [A] : `F:/tmp/rech/l2/p1plan/PLI-CP1.md`. Vérificateur du pli relu avant usage
(`F:/tmp/rech/l2/adr/tmp/check.mjs`, sha256 `03e5ee95…`) : lignes de 160 points de code au plus, aucun TAB ni octet de contrôle, aucune
adresse, aucun schéma d'URL, aucun domaine ni nom d'hôte, aucun montant. Porte de langue `node scripts/lang-gate.mjs` : sans portée sur
`docs/` (PLI-2 l.133-135), elle ne valide pas ce texte.

### 12.2 Sources (empreintes relevées le 2026-10-03 entre 20:42 et 21:26 UTC ; [lu] sauf mention)
- [A] `docs/adr/ADR-L2-CAPTURE-1.md` au HEAD `19552acf`, 802 lignes, sha256
  `26941c016992babf26fb14a140164c579255bdf1aae34834e424bfa972b69998` ; lue en entier à l'ouverture dans sa version de `622a8ccc` (796
  lignes, sha256 `ec766b09d83095af52419e3ac9b6a2f1dbe244005a987800c15f7156dca6e512`) ; la version neuve n'en diffère que par six lignes
  insérées après la l.25 (`git diff 622a8ccc 19552acf` : un fichier, six insertions), lues ; l'égalité des l.26-796 anciennes aux
  l.32-802 neuves est vérifiée ligne à ligne (772 comparaisons égales sur 772, fin de fichier comprise, `tmp/shift-refs.mjs`), et
  chaque renvoi de ce plan a été décalé de six. Les quatre conditions de RECHERCHES sont lues dans [A] l.26-31 ; le message de
  RECHERCHES qu'elles résument n'est pas lu ici (hors des entrées de la mission) : [2nd] via [A].
- **Ligne datée (2026-10-03, à partir de 21:57 UTC ; pli du cp-1 bref, C-3)** : les renvois `[A] l.N` de ce plan, et « l ADR
  l.362-364 » du bloc de décisions datées, suivent la version `19552acf` ci-dessus. À `abc26a87` (deux lignes insérées après la l.31 :
  « Cinq parties »), tout renvoi N > 31 vaut N + 2. Au pli de ce cp-1 ([A] de 839 lignes, sha256
  `d74671c24e50190fccf12e5dfe4539b791f2b2ba4433176073bef199a7c6a80f` : 35 lignes de plus insérées après la l.33, carte de la coupe et
  lignes datées de C-1), tout renvoi N > 31 vaut N + 37 ; les l.1-31 sont inchangées. Contrôle : insertion pure, l.32-802 de
  `19552acf` égales aux l.69-839 pliées (771 sur 771) comme les l.34-804 d'`abc26a87` (771 sur 771), outil
  `F:/tmp/rech/l2/p1plan/tmp/cp1pli/shift-check.mjs`.
- [F1] `docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md`, 136 lignes, sha256 `4f0cbb34000cea12e70a31af27333b355206bf714d8e96bf19ab47bb3e132791`.
- [F2] `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md`, 74 lignes, sha256 `89ea61be941afcfd5ea8f7ec7c861b784bfe096cb9d5a623c4ba2495015c4db1`.
- [Q] `F:/tmp/rech/l2/adr/REPONSES-INVESTISSEUR.md`, 38 lignes, sha256 `8f20bf35a8b08af7897cb93d2ee9903d6dfc3456f6f3df40e3aa99a647bf2be6`.
- [P2] `F:/tmp/rech/l2/adr/PLI-2.md`, 164 lignes, sha256 `666ffab8c02b7c867cb2c7faf5693fbbd2bfd6014da9491bb2c9d49e378e1159`.
- [R] `docs/methode/REGLES-MISSION.md`, 20 lignes, sha256 `d86bb19d1a384890cff2cd5d478b90eaa5fc11fe32a632eaf09bfde07001a5d6` (l.1-20
  identiques à l'octet aux l.15-34 de la mission, `diff` vide).
- [K] `scripts/record-binance-klines.mjs`, 317 lignes, sha256 `6fcee7c07234dee0a75ce98e54bf0f6b98d11b98963419e4fb40fa332f7e8ea5`.
- [T] `test/record-binance-klines.test.ts`, 825 lignes, sha256 `0f51e47acfaa87a965ab58a003e502e9f86c5fe78dcaf9bdc0906be6dfeea626`,
  [lu] l.1-40 et l.60-100 ; lignes de tueurs par recherche (l.136 et suivantes).
- [FK] `docs/marche/FAITS-binance-klines-2026-10-01.md`, sha256 `4f6f445354a6f8b1657a327d97ddae2b8432e46b774ab2348483f8953c32abfa`,
  [lu] l.23-24.
- [MT] `docs/adr/ADR-METHODE-2.md`, sha256 `b7e1e30f6abc8d6ef96674b061b2e91d70283eec113fe0302429ff3d53394c2b`, [lu] l.38 et l.68 en
  entier, l.62 par extrait.
- [CI] `.github/workflows/ci.yml`, sha256 `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a`, [lu] l.40-103 (lignes
  coupées à 260 caractères), l.82 en entier.
- [r25] `F:/Monark/scripts/oracle/r25.mjs`, 28 lignes, sha256 `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0`.
- [U1] `deploy/monark-dojo-collect.service`, sha256 `e084f0f99c5cd1a0c96a03d76118fb69da68e1c622d67a614c3a6e6b609bb661`, [lu] par
  recherche : l.40, l.46, l.48, l.54, l.55.
- [U2] `deploy/monark-sentinel.service`, sha256 `d526f9c061c44814e0ca73cfeb996259d715c072319fd453caad3f39d4976e46`, [lu] par
  recherche : l.52, l.54, l.57-60.
- [N] source undici embarquée de Node v24.15.0, sha256 `d6332aa1ca04f71ffdba505a7e2cb61d15d3e0799bdcc06352a89d6a58ebe475`, [lu] aux
  lignes de L-1 ; module `_http_server`, sha256 `12022534d66f88058ec8592c71e41ac27af84ca25adeb1ab7f5b40d2fff1f777`, [lu] l.549, l.980.
- Options de types du dépôt, reprises pour L-3 : `tsconfig.json`, sha256 `e9f78b864977f387e67fde8810211c6a84e8e589abc4fec53d8c554882d3f72f`.
- Prototype (L-3) : `l2-fake-place.ts` sha256 `33573be37738c6f64f544cc6bf6e12bc94026ca48f1c775777ff961338b64eaa` ;
  `l2-fake-place.test.ts` sha256 `aa4a10deed9c8d9c14399e61f4a466248c07cd8b7bf17fd27d902af13ab63775`.
- Forme : gabarits du corpus de conformité (ADR, rapport de passe), comme [A] l.801-802.

## Décisions datées du 2026-10-03, 21:33 UTC (orchestrateur ; Q-P1-11 par le fondateur et investisseur)

- **Q-P1-11 (fondateur et investisseur)** : choix verbatim « Couper après b2 (Recommandé) ». P1 est coupée en deux parties : P1 =
  capture brute et chaîne du carnet (lots a1, a2, a3, a4, b1, b2) ; P1-bis = scellé, rejeu, instantanés, commande (lots c1 à c6). Le
  chantier compte cinq parties (P1, P1-bis, P2, P3, P4), le maximum admis par la décision 300 ; chaque partie a sa G2 et son G7.
- **Orchestrateur** : Q-P1-1, partir du prototype mesuré de la place factice ; Q-P1-2, chaque test TL dans le lot où sa composition
  est complète (lecture déclarée de l ADR l.362-364) ; Q-P1-3, base réservée aux données de marché, après FAITS-L2-ACCESS-3 (a) ;
  Q-P1-5, le brut est le message tel que le client embarqué le livre, item L2-OWN-WS-CLIENT-1 ; Q-P1-6, suspension nommée si le
  plafond de poids du jour passe sous 4 000 par minute ; Q-P1-7, lecture de chaîne (U = lastUpdateId + 1 accepté, comme A1) ;
  Q-P1-8, index, dérivés et parité calculés au scellé par le code du rejeu, depuis le brut seul ; Q-P1-9, dédoublonnage sur les
  octets exacts de la charge, ordonné par (clé, octets), par amendement daté de D-20 ; Q-P1-10, liste admise telle que proposée.
- **Carte des tuyaux et des items après la coupe** (pli du cp-1 bref, C-2, inscrite le 2026-10-03 à partir de 21:57 UTC ; conséquence
  de Q-P1-11, aucune décision neuve ; même carte, abrégée, dans [A], ligne datée « Cinq parties ») : trois puces qui suivent.
- **P1 (a1 à b2), 1 642 à 2 074 lignes** (sommes de §8.2 : 230 + 356 + 343 + 151 + 274 + 288 et 230 + 465 + 448 + 197 + 358 + 376) :
  TL-2 complet (`l2_chain_gap_named_then_resync`, b2) ; TL-6 complet (`l2_half_open_watchdog_named`, a3 ; `l2_overlap_switch_no_gap`,
  b2 ; part brute `l2_overlap_planned_raw`, a4) ; de TL-1, les trois assertions FM-2.6 (`l2_capture_raw_as_served`, a3),
  `l2_write_tail_marked` (a2) et `l2_backpressure_named_stop` (a3) ; capture brute de `/market` (`l2_market_link_futures_watchdog`,
  a4) ; condition (3) de RECHERCHES (`l2_index_recv_us_integer_named_apart`, a2). Items dont le test est en P1 : L2-HALF-OPEN-1 et
  L2-WRITE-TAIL-1 (clôture au G7 de P1, [A] l.584-587), L2-BACKPRESSURE-1 (longueur mesurée en M-1, [A] l.588-590) ; construits en
  P1 : SERIES-BODY-BOUND-1 (b1, a3), SERIES-ERROR-BODY-1 (b1), SERIES-TLS-PEER-LOG-1 (b1, prouvé en M-1 seulement, §9).
- **P1-bis (c1 à c6), 1 629 à 1 973 lignes** (288 + 288 + 247 + 301 + 186 + 319 et 376 + 376 + 322 + 394 + 186 + 319) : TL-1 complet
  (`l2_capture_record_seal_replay`, c6) ; TL-3 (`l2_minute_window_exact`, c2) ; TL-4 (`l2_bookticker_day_rule`, c1 ;
  `l2_replay_byte_identical`, c6) ; TL-5 (`l2_daily_parity_counts`, c2) ; TL-7a (`l2_forceorder_record_replay`, c6) ; tests des
  trois limites de [F2] (c3 : `l2_trade_id_jump_counted_not_a_hole`, `l2_canonical_same_key_named`,
  `l2_forceorder_dedup_full_payload`) et de la grâce D24-5 (c1 : `l2_day_late_frame_marked`, `l2_day_seal_waits_grace_and_segments`) ;
  conditions (1) et (2) de RECHERCHES (c1 : `l2_manifest_time_unit_per_source`, `l2_place_time_unsafe_integer_named_stop`). Re-datés
  « G7 de P1-bis » : le test de L2-BOOKTICKER-GAP-1 (`l2_bookticker_crosscheck_counts`, c3 ; [A] l.579-583), le « au plus tard » de
  L2-TRADES-BACKFILL-1 ([A] l.571-572) et la grâce (D24-5). Construits en P1-bis : SERIES-ENV-ALLOWLIST-1, SERIES-PROXY-GUARD-1,
  SERIES-ABSENT-ROOT-TEST-1, MAIN-GUARD-REALPATH-1 (c4).
- **G7 de P1** : il déclare « scellé et rejeu non exécutés, pièce upcoming » (D-14, D-25) : le scellé (c1) et le rejeu (c6) sont en
  P1-bis. Se lit au pli, posé en Q-P1-12 : la relecture de RECHERCHES (D-6) et M-1 (D-23, D-25) suivent le G7 de P1-bis.

## Checkpoint-1 bref et décisions de l orchestrateur sur le pli (2026-10-03, 22:13 UTC)

- **Checkpoint-1 bref** du validateur-humain (`claude-fable-5-1`), 2026-10-03 de 21:33 à 21:43 UTC : ACCEPTE-AVEC-CORRECTIONS, liste
  fermée C-1 à C-6, rapport `F:/tmp/cp1-l2-p1/RAPPORT-cp1-bref-L2-P1-2026-10-03.md` (sha256 `68a95082…`) ; corrections pliées par un
  worker `claude-opus-5-5` (relevé `F:/tmp/rech/l2/p1plan/PLI-CP1.md`, sha256 `66aa7920…`). Cette ligne est commise avant le premier
  commit de P1-a1 (consigne CA-8 du checkpoint, preuve FM-1.1 de l ADR §6.1).
- **Q-P1-12** : oui, les prérequis « après le G7 de P1 » de M-1 et de P3 se lisent « après le G7 de P1-bis », et « la partie 1 » que
  P3 déploie se lit « P1 et P1-bis ».
- **Q-P1-13** : oui, `l2_time_offset_logged` vérifie aussi la condition (2) de RECHERCHES (`serverTime` entier sûr, sinon écart non
  calculé et nommé) ; milieu arrondi vers le bas au microseconde.
- **O-1** : retenue ; le cas tardif de `l2_day_late_frame_marked` est « une microseconde après » la borne.

## Décisions de l orchestrateur sur les questions du G1 de P1-a1 (2026-10-03, 23:19 UTC)

- **G1 de P1-a1** (`claude-opus-5-5`, journal `F:/tmp/rech/l2/a1/G1.md`, sha256 `9bdb6ba0…`) : LIVRE-AVEC-RESERVES ; oracle G1 vert
  (2 042 tests, 0 échec, enregistrement `550d9e1f…`) ; R-25 275 ; commis sur `lot/l2-p1-a1` (`f5596bf3`), pas au tronc.
- **Q-1** (les tueurs d un fichier sous `test/`) : option (A). L outil du tronc refuse par construction un tueur sous `test/`
  (`scripts/mutants/run.mjs` l.37 et l.106-110 ; `scripts/red-proof.mjs` l.51-54) : campagne 0 tué sur 8, vérification du G1 hors
  preuve 8 sur 8. Lot d outil MUTANTS-TEST-SUPPORT-1 (un module d appui déclaré sous `test/`, jamais un `*.test.ts`, admis comme code
  mutable ; amendement daté de la convention ; cas neufs aux tests de l outil), après la fusion de MUTANTS-TOOL-2 (même fichier) ;
  puis campagne de P1-a1 rejouée par l outil. P1-a1 n est pas fusionné avant ; (B) écarté (contraire à D-22 et Q-23) ; (C) non
  retenu comme preuve. Les lots suivants avancent en parallèle sur le tronc et fusionnent dans l ordre de P-1.
- **Q-2** : oui, sous un Cadre sans PowerShell, le pré-contrôle C-V-4 se fait par `systeminfo` (mémoires physique et virtuelle
  disponibles), `tasklist` (compte de `node.exe`) et `os.freemem()` ; ligne datée de `docs/methode/REGLES-MISSION.md`.
- **Q-3** : oui, lecture confirmée : les fabriques prennent la liste des origines admises en paramètre ; la liste fermée des hôtes
  est fixée par a3, a4 et b1 depuis leurs lignes de FAITS ; l auto-test de P1-a1 emploie des origines synthétiques en `.example`.

## Décisions de l orchestrateur sur le G1 de P1-a2 et sur P1-b1 (2026-10-04, 01:1x UTC)

- **G1 de P1-a2** (`claude-opus-5-5`, `F:/tmp/rech/l2/a2/G1.md`, sha256 `f5d7e362…`) : LIVRE-AVEC-RESERVES ; mutants de l outil du tronc
  6 sur 6 tués (`b555d7dd…`) ; R-25 488 ; commis sur `lot/l2-p1-a2` (`39ac2fdb`). Q-8 : les deux rouges de son oracle viennent de la
  base (`c033b227`, corrigé en `0c8f8177`) ; l oracle de fusion au tronc tranche (forme (a)). Q-1 : six tests, un tueur chacun
  (`l2_segment_period_one_hour` porte la période). Q-2 : la marque d une reprise est écrite par le journal de la reprise et lue par c1.
  Q-3 : horloge qui recule : trame dans le segment ouvert, ou dans le suivant après une coupe, `recv_us` tel que lu, aucun segment
  rouvert. Q-4 : défaut de production `Date.now()*1000` (résolution ms) ; ordre fin par `mono_ns` ; limite formée : item
  L2-RECV-US-RESOLUTION-1 (ETAT). Q-5 : le lecteur partagé tourne dans un fil de travail dans le processus vivant, mesuré en c5.
  Q-6 : `rank` depuis 0 ; `offset` et `length` en octets du fichier de trames ; LF exclue de `length`. Q-7 : 488 lignes acceptées
  (borne 547) ; écart au plan déclaré.
- **P1-b1** écrit par RECHERCHES (PR #112, partage de charge) : son prérequis FAITS-L2-ACCESS-3 (d) et (f) manquait au G1 (faute de
  l orchestrateur, qui a passé le lot sans lui) ; la lecture sur place (a) à (f) est faite avant la fusion de b1. Q-B1-2 : confirmé
  (429 sans `Retry-After` lisible : 60 s ; 418 sans `Retry-After` lisible : arrêt `ip_banned_no_retry_after` ; au-delà de 3 jours,
  borne de FAITS-L2-ACCESS-1 l.38-39 : arrêt `retry_after_too_long`). Q-B1-3 et Q-P1-6 : le plafond du jour sous 4 000 par minute est
  une suspension nommée ; code et test en c5.

## Décision de l orchestrateur sur Q-P1-7 (2026-10-04, 02:2x UTC)

- **Q-P1-7** : lecture de chaîne. Après S5, un premier événement restant dont `U` = `lastUpdateId` + 1 est accepté, comme A1 accepte
  `U` = identifiant précédent + 1 : les quantités sont absolues ([F2] l.34-35) et aucun événement n existe entre `lastUpdateId` et `U`.
  Même règle à la bascule (§4.3). Le cas `S5-U-plus-1` est accepté, sans nouvel instantané ; `S5-U-plus-2` reste un essai vain nommé.
  P1-b2 est confié à RECHERCHES (partage de charge, tableau commun), empilé sur P1-b1 (#112).

## Décisions de l orchestrateur avant le G1 de P1-a3 (2026-10-04, 02:3x UTC)

- **Q-P1-3** : base générale `wss://stream.binance.com:9443`. FAITS-L2-ACCESS-3 (a) n écrit, pour `wss://data-stream.binance.vision`, ni
  le port ni la règle des 24 h ; la condition de la recommandation (les règles de [F1] l.16-19 confirmées pour la base réservée) n est
  donc pas remplie. La base réservée est mesurée à M-1 (item L2-DATA-STREAM-BASE-1, ETAT).
- **Q-P1-5** : oui, le brut est le message tel que le client embarqué le délivre ; item L2-OWN-WS-CLIENT-1 et extensions négociées
  journalisées.
- **Ordre de fusion (§8.3, P-1)** : il suit l ordre topologique des dépendances de §8.3, et non plus une file stricte ; deux lots
  indépendants fusionnent dans l ordre où ils sont prêts (le plan supposait un seul implémenteur ; deux équipes écrivent désormais).
  Chaque fusion garde tests, tueurs, mutations et oracle du tronc. Exemple : b1 (dépend de a1) peut fusionner avant a3 et a4.
- **P1-b2** dépend de a3 et de b1 : il attend le G1 de a3 (confié par erreur à RECHERCHES à 02:2x UTC sans cette dépendance ; corrigé
  dans la messagerie). P1-a3 part sur `lot/l2-p1-a3`, qui porte a1 et a2.
