claude-opus-5-5
# PAROXYSME-Dojo : registre des limites déclarées du Dōjō (pièce `hold-snapshot`)

- **Objet** : item PAROXYSME-DOJO-FILE-1 (`docs/ETAT.md` l.297) ; fichier prêt à verser en `docs/PAROXYSME-Dojo.md` avant la première synchro.
- **Règle** (décision 251, rappelée par la mission) : une limite déclarée n'est jamais une fin ; elle mène à un item (recherche, code, test,
  procurement), à une campagne, puis à une décision ; une limite sans item est une dette.
- **Provenance** : rédigé par `claude-opus-5-5` (effort max, contexte frais) le 2026-10-02 ; mission `F:/tmp/dojo/mission-paroxysme-dojo.md`
  (sha256 `839e6c291e6cf57f342cccf6991393dd0c59a5e58451e76f54d85084bd14c5a8`) ; réviseur : l'orchestrateur (R-21), puis le validateur.
- **Bases** : entrées au tronc `lot/etude-suite`, tête `eb3ee3ec` (empreintes au §6) ; textes publics de la page au commit `d1120612`.
- **Préséance** : `docs/ETAT.md` l.7-11 retire la force des lignes datées des ADR ; ce registre lit les ADR comme documentation du code
  et prend l'état le plus récent écrit dans ETAT quand ETAT en parle ; chaque écart entre ETAT et un ADR est rapporté au rapport (doutes).
- **Après la base** : le tronc a bougé après `eb3ee3ec` (rapport, doute 1) ; entrées à relire au versement : DJ-L67, DJ-L76, DJ-L81,
  DJ-L109, DJ-L114.
- **Commits de `lot/page-v1`** : `1b57566c` (partie 1 réunie, ETAT l.45) et `e6b52de6` sont ancêtres de `d1120612`, non de `eb3ee3ec`.

## 0. Comment lire ce registre

- Mise à jour 2026-10-02 02:49 UTC (orchestrateur) : DJ-L01 à L06 pourvus d'un item et déplacés au §2 ; DJ-L187 à L191 ajoutés au §3.8
  (items du HANDOFF §9). Les 20 déclencheurs passés ont une clôture écrite le 2026-10-02 03:32 UTC (vérification sur pièce, quatre lecteurs `wf_25285f45-110`).
- Mise à jour 2026-10-02 03:06 UTC (orchestrateur) : DJ-L07 à L34 pourvus d'un item (§3.9) ; plus aucune dette sans item au §1.
- Mise à jour 2026-10-02 08:54 UTC (orchestrateur ; correction 4 du checkpoint de la partie 3, rapport `aca2af79…`) : DJ-L81, DJ-L106,
  DJ-L121 clos sur pièce ; DJ-L103 (IDLE-1 fait, MEASURE-1 reste) et DJ-L118 (constaté, ouvert) mis à jour. Items neufs de la partie 3 : ETAT.

- **Une entrée par limite** : la mission demande une ligne par limite et borne toute ligne à 160 caractères ; chaque entrée tient donc
  sur quatre lignes au plus, ouvertes par le préfixe `- **DJ-L`, que l'on compte par `grep`.
- **Étiquettes** : `DJ-Lnn` numérote les lignes de ce registre, comme `N-L4` et `U-L7` des registres Narabi et Ukemi (DOCTRINE l.21) ;
  ce ne sont pas des identifiants d'item, et aucune n'apparaît dans un champ « item ».
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne) ; « touche » nomme la clé d'un texte public que la limite qualifie ;
  nature ; item ; déclencheur ; état ; suite.
- **Natures** (liste fermée de la mission ; « Tiers » vient de DOCTRINE l.28) : code, test, recherche, procurement, Tiers.
- **États** (liste fermée) : `ouvert` ; `clos (preuve : …)` quand un commit, un rapport ou un oracle est cité ; `clos, preuve à citer` ;
  `décision (…)`. « Déclencheur passé » signale un acte qu'ETAT dit fait sans que la clôture de l'item soit écrite dans les entrées.
- **Dette** : item `aucun`, déclencheur `aucun`, suite `item à former` ; rien de plus, pour ne rien inventer.
- **Abréviations des sources** (numéros de ligne du fichier à `eb3ee3ec`, ou à `d1120612` pour COPY, PAGE et le code) :
  MÈRE = `docs/adr/ADR-DOJO-SNAPSHOT-1.md` ; PR1B4, PR1B5, PR2, PR2B, PR3, PR4 = `docs/adr/ADR-DOJO-PR-1B-4.md` … `ADR-DOJO-PR-4.md` ;
  ETAT = `docs/ETAT.md` ; DOCTRINE = `docs/DOCTRINE.md` ; COPY = `apps/site/lib/dojo-copy.ts` ; PAGE = `apps/site/app/dojo/page.tsx`.
- **Textes publics** : la page rend les seules phrases de COPY (`DOJO_TEXT`, `DOJO_TABLE`), assemblées par PAGE l.17-44 ; une limite est
  « dite publiquement » si une phrase de COPY dit que la page ou la vérification ne fait, ne montre, ne vérifie ou ne suit pas quelque chose,
  ou la conditionne à une capacité du lecteur.

## 1. Dettes à former : limites sans item

### 1.1 Dites dans les textes publics de la page (en tête des dettes)

- Aucune depuis le 2026-10-02 02:49 UTC : DJ-L01 à DJ-L06 portent un item (§2).


### 1.2 Des seuls documents internes

- Aucune depuis le 2026-10-02 03:06 UTC : DJ-L07 à DJ-L34 portent un item (§3.9).

## 2. Limites dites dans les textes publics de la page, avec item

- **DJ-L01** · « La page ne montre pas qu'une adresse appartient à une seule personne. »
  source : COPY l.50-53 (`bounds`) ; MÈRE l.157 (D-1 : identité hors frontière), l.567 (P-3)
  nature : recherche · item : DOJO-IDENTITY-CLUSTER-1 (preuve de personne ou regroupement d'adresses : état de l'art, coût, ce qui reste indécidable) ·
    déclencheur : G0 de la pièce 2 (MÈRE l.677) ; procurements formés au mainteneur avant
  état : ouvert · suite : recherche de solutions académiques, sources à l'appui ; la page garde la phrase tant qu'aucune construction n'est servie
- **DJ-L02** · « La page ne montre rien de ce qui viendra. »
  source : COPY l.50-53 (`bounds`) ; MÈRE l.30 (D-12 : aucune promesse), l.532 (lexique : soon, coming)
  nature : Tiers · item : DOJO-NO-PROMISE-LEGAL-1 (lecture juridique de D-12 et des Tiers : ce qu'une page « sans promesse » doit dire et taire) · déclencheur :
    acte du juriste (JURISTE-ACTE-NOV-1) ; avant tout texte qui annoncerait la pièce 2
  état : ouvert · suite : avis écrit versé au dossier, phrase de COPY relue mot pour mot ensuite
- **DJ-L03** · « La vérification ne lit pas la chaîne : les soldes restent ce que deux opérateurs ont rapporté. »
  source : COPY l.50-58 (`bounds`, `check`) ; MÈRE l.261 (D-10), l.337 (T-8), l.338 (T-9) ; PR1B4 l.171 (TY-7) ; PR2 l.389
  nature : recherche · item : DOJO-STATE-PROOF-1 (preuve d'état par compte : solutions académiques et clients légers, ce qui est servi par la chaîne, coût) ·
    déclencheur : après la première publication, avant le G0 de toute lecture à plus de deux opérateurs (DOJO-OPERATOR-INDEPENDENCE-1)
  état : ouvert · suite : d'ici là, deux opérateurs distincts et le texte de COPY inchangé ; procurement formé si un papier manque
- **DJ-L04** · « Sans script ou sans Ed25519 dans le navigateur, aucune relecture : les chiffres montrés sont ceux committés avec la page. »
  source : COPY l.65-67 (`rereadFirst`), l.71-73 (`rereadNoCheck`) ; PR4 l.303 (Q-P1 (a)), l.343 (TY-3), l.318
  nature : code · item : DOJO-VERIFY-PURE-JS-1 (relecture sans WebCrypto : Ed25519 en JavaScript pur, vendu avec la page, sans CDN) · déclencheur : premier lot
    du site après la première synchro (C-V-5)
  état : ouvert · suite : G0 du lot : taille du paquet mesurée contre le budget des FAITS ; `rereadNoCheck` retiré quand c'est servi
- **DJ-L05** · « Une rotation de clé n'est pas suivie par la page : retour aux chiffres committés jusqu'à la synchro suivante. »
  source : COPY l.77-79 (`rereadKeyChange`) ; PR4 l.73 (point 4), l.266
  nature : code · item : DOJO-REREAD-KEY-ROTATION-1 (la relecture suit les lignes `key_rotation` de la chronologie servie, jamais le trousseau committé seul) ·
    déclencheur : avant la première rotation de clé (RUNBOOK-dojo §20) ou le lot de DOJO-VERIFY-PURE-JS-1, le premier des deux
  état : ouvert · suite : phrase `rereadKeyChange` retirée quand c'est servi ; test non-LLM qui rejoue une rotation
- **DJ-L06** · « Sans script, aucune ligne n'est listée ni recherchée sur la page. »
  source : COPY l.82-84 (`table`), l.98-100 (`lookup`) ; ETAT l.49 ; MÈRE l.678 (lignes réelles non committées)
  nature : code · item : DOJO-TABLE-SSR-1 (lignes committées rendues par le serveur : liste et recherche lisibles sans script) · déclencheur : lot du site après
    la première synchro, avec DOJO-VERIFY-PURE-JS-1
  état : ouvert · suite : phrases `table` et `lookup` relues ; la table servie reste celle des lignes committées (MÈRE l.678)
- **DJ-L40** · « La page ne montre pas le solde entre deux lectures. »
  source : COPY l.50-53 (`bounds`) ; MÈRE l.331 (T-2 : réduit et chiffré), l.203
  nature : recherche · item : DOJO-CONTINUOUS-1 (score continu par blocs) · déclencheur : G0 d'une pièce ultérieure (MÈRE l.677)
  état : ouvert · suite : complétude et coût de la lecture continue (MÈRE l.677)
- **DJ-L41** · « La page ne vérifie pas la signature de la balise ; le vérificateur non plus : assertion déclarée. »
  source : COPY l.60-62 (`beacon`) ; MÈRE l.202, l.713 ; PR2 l.160, l.318, l.375 ; ETAT l.94, l.179
  nature : code · item : DOJO-BLS-VERIFY-1 (procurement dormant P-1, PR2 l.317) · déclencheur : après la première publication (ETAT l.179)
  état : ouvert · suite : d'ici là, deux relais doivent rendre le même tirage (ETAT l.179-180)
- **DJ-L42** · « Les chiffres montrés peuvent être ceux committés avec la page, plus anciens que la tête servie. »
  source : COPY l.74-76 (`rereadFallback`) ; PR4 l.179 (TY-1), l.347 (TY-12)
  nature : test · item : DOJO-LIVE-HEALTH-1, DOJO-EDGE-CACHE-1 · déclencheur : jour de l'annonce ou sous 7 jours ; à l'acte (ETAT l.294-300)
  état : ouvert · suite : d'ici là, `dojo-verify-cli --url` rejoué sur l'hôte servi après chaque publication (ETAT l.299)
- **DJ-L43** · « Le fichier de lignes peut ne pas être lu dans le navigateur (taille, réseau) : aucune ligne n'est listée. »
  source : COPY l.95-97 (`tableRefused`) ; PR4 l.325, l.346 (TY-11), l.378 ; ETAT l.106, l.263, l.293
  nature : test · item : DOJO-LOOKUP-PAYLOAD-1 · déclencheur : jambe 2 avant l'envoi du site (ETAT l.293)
  état : ouvert · suite : mesure sur mobile contre le budget des FAITS (ETAT l.293)

## 3. Limites des seuls documents internes, avec item

### 3.1 Ancre, hasard et clés

- **DJ-L50** · « Antériorité de l'ancre non vérifiable par un tiers tant que l'horodatage Bitcoin est différé : une ancre antidatée reste possible. »
  source : PR2 l.165, l.302 (TY-8) ; PR3 l.99, l.176 (TB-6) ; ETAT l.164-167, l.178 · touche : `method` (« committed in advance »)
  nature : Tiers · item : DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1 (avec FAITS-BTC-BLOCKTIME-1, DOJO-ANCHOR-SERVE-1, PR3 l.190, PR4 l.324)
  déclencheur : après la première publication (ETAT l.167) · état : ouvert · suite : écart avec PR3 l.98 (« résolu ») au rapport
- **DJ-L51** · « Fourche possible au numéro d'une rotation de clé, sous le trousseau légitime. »
  source : PR3 l.290, l.435
  nature : recherche · item : DOJO-ROTATION-FORK-WINDOW-1 (PAROXYSME) · déclencheur : avant la première rotation de clé (PR3 l.435)
  état : ouvert · suite : recherche formée (PR3 l.290)
- **DJ-L52** · « `--rotate` et `--revoke` rejoués après un arrêt ne sont pas idempotents. »
  source : PR3 l.290, l.435
  nature : code · item : DOJO-KEYMODE-RETRY-1 (PAROXYSME) · déclencheur : avant la première rotation de clé (PR3 l.435)
  état : ouvert · suite : code et test
- **DJ-L53** · « Les lignes d'ancre et de clé ne passent pas la vérification avant engagement, limitée au `snapshot` et à sa version. »
  source : PR3 l.301 (D-C1), l.361, l.385, l.415
  nature : code · item : DOJO-PUBLISH-VERIFY-ALL-LINES-1 (PAROXYSME) · déclencheur : avant la première ligne de clé sur l'hôte (PR3 l.385)
  état : ouvert · suite : refus attribué à la candidate ou à un seq antérieur (PR3 l.361)
- **DJ-L54** · « La clé Helius est lue dans l'environnement du processus de collecte. »
  source : PR3 l.107, l.174 (TB-4), l.198
  nature : code · item : DOJO-HELIUS-KEY-CRED-1 · déclencheur : prochain lot rpc-guard (PR3 l.198)
  état : ouvert · suite : lecture par `$CREDENTIALS_DIRECTORY`
- **DJ-L55** · « La garde de libellés de la synchro peut refuser à tort une signature ou une clé (environ 9e-6), refus définitif pour une ancre. »
  source : PR4 l.252-253
  nature : code · item : DOJO-SYNC-LABEL-FALSE-REFUSAL-1, DOJO-SYNC-LABEL-SUBSTRING-1 · déclencheur : avant DOJO-KEY-1
  état : clos pour les octets signés (orchestrateur, 2026-10-02 03:32 UTC : `operatorLabelsIn` de `scripts/sync-dojo-served.mjs` `d7dbe6e0…`, 47 motifs, 0
    trouvé sur le trousseau `8cc6c3dd…` et les lignes 1 et 2 de la chronologie servie `b77f0131…`) · suite : DOJO-SYNC-LABEL-SUBSTRING-1 ouvert ; toute
    signature neuve (snapshot, rotation) repasse la garde à chaque synchro, refus = option (a)

### 3.2 Collecte et opérateurs

- **DJ-L60** · « L'indépendance d'amont des deux opérateurs n'est pas mesurée. »
  source : PR2 l.173, l.334, l.391 (§9 point 17) ; MÈRE l.715 ; ETAT l.189, l.192 · touche : `lead` (« two distinct operators »)
  nature : Tiers · item : DOJO-OPERATOR-INDEPENDENCE-1 · déclencheur : après la première publication (ETAT l.189)
  état : ouvert · suite : un amont commun découvert ouvre PR-2-3 (PR2 l.334)
- **DJ-L61** · « Un opérateur menteur tait une lecture (absence masquée) ; deux opérateurs ne départagent pas un désaccord. »
  source : PR2 l.172, l.296 (TY-2), l.306 ; MÈRE l.710
  nature : code · item : DOJO-TIEBREAK-1, PR-2-3 (témoin) · déclencheur : chiffré (PR2 l.271)
  état : ouvert · suite : procurement DOJO-BQS-READ-1 avant le G0 de PR-2-3 (PR2 l.335 ; MÈRE l.716)
- **DJ-L62** · « L'hôte public sans clé peut être retiré sans préavis : jours manquants. »
  source : PR2 l.41, l.170, l.295 (TY-1), l.378 (§9 point 4)
  nature : code · item : CHAINSTACK-GPA-TARIFF-1 · déclencheur : deux jours UTC consécutifs d'échec (PR2 l.171)
  état : ouvert · suite : barème lu sur place, ligne d'ADR (PR2 l.171)
- **DJ-L63** · « Comptes concordants et sans quorum des lectures : assertion de l'opérateur, non recalculable depuis l'arbre servi. »
  source : PR2 l.195, l.503 (C-V-3)
  nature : Tiers · item : DOJO-READS-COUNTS-ASSERTED-1 · déclencheur : G1 de PR-2-2
  état : ouvert (déclencheur passé : G1 de PR-2-2, b2b0c32e ; `scope` de dojo-verify.mjs l.350 inchangé depuis 75d2c981, antérieur à l'item) [vérifié
    2026-10-02 03:32 UTC, NON-FAIT] · suite : phrase « comptes concordants et sans quorum : assertion de l'opérateur » dans `scope`, au premier redéploiement de
    l'éditeur (ETAT l.66-70)
- **DJ-L64** · « L'évidence garde le résultat analysé de chaque appel, pas les octets bruts de la réponse. »
  source : PR2 l.189 (d), l.339, l.515 ; PR2B l.969 ; code : `apps/dojo/src/collect.ts` l.123 à `d1120612`
  nature : code · item : DOJO-EVIDENCE-RAW-BYTES-1 · déclencheur : G1 de DRAND-RELAY-GET-1b (PR2 l.515)
  état : ouvert (déclencheur passé ; routé « après mise en ligne » par le seul G0 DRAND-1b l.101 ; ligne datée [P2] jamais écrite ; collect.ts l.148 inchangé)
    [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : transport du garde exposant les octets bruts, écrits sous evidence/raw/ à côté de evidence/parsed/
    (collect.ts l.148) ; après la mise en ligne
- **DJ-L65** · « Attente `Retry-After` sans plafond, verrous d'opérateur tenus pendant l'attente. »
  source : PR2 l.340, l.382 (§9 point 8), l.515
  nature : code · item : DOJO-RETRY-AFTER-CAP-1 · déclencheur : G1 de DRAND-RELAY-GET-1b (PR2 l.515)
  état : ouvert (déclencheur passé ; routé « après mise en ligne » par le seul G0 DRAND-1b l.100 ; ligne [P2] jamais écrite ; collect.ts l.156 inchangé)
    [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : limite à corriger : 60 s par attente (transport.ts l.108), pas le reste de la fenêtre ; plafond au reste
    à collect.ts l.156, +1 assertion, 1 mutant
- **DJ-L66** · « Deux instants lus par un même pas font deux courses ; au pire, dépassement de `TimeoutStartSec`. »
  source : PR3 l.221 (2,09 % des jours, calculé, non mesuré) ; code : `deploy/monark-dojo-collect.service` l.35 à `d1120612`
  nature : code · item : DOJO-COLLECT-STEP-COURSES-1 (PAROXYSME) · déclencheur : G1 de DRAND-1b (PR3 l.221)
  état : ouvert (déclencheur passé ; routé « après mise en ligne » par le seul G0 DRAND-1b l.98 ; ligne [P3] jamais écrite ; en service depuis A-9 (7))
    [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : une course par pas, ou borne par pas, dans tick (collect.ts l.272-276) ; filet en attendant : verrous
    rendus sur SIGTERM, prouvé sur l'hôte
- **DJ-L67** · « `TasksMax=64` reste provisoire, à mesurer sur l'hôte. »
  source : PR3 l.228, l.276, l.278 ; ETAT l.284
  nature : test · item : DOJO-COLLECT-TIMEOUT-1 (PAROXYSME), DOJO-TASKSMAX-SAMPLE-D-1 · déclencheur : une lecture du 2 octobre (ETAT l.284)
  état : ouvert · suite : `TimeoutStartSec` sourcé par FAITS-SYSTEMD-TIMEOUT-1 (PR3 l.278) : clos, preuve à citer
- **DJ-L68** · « Les unités systemd ne sont jamais exécutées hors de l'hôte : aucun oracle de leur syntaxe ni de leurs calendriers. »
  source : PR3 l.219, l.278 ; ETAT l.180
  nature : test · item : DOJO-UNIT-OFFLINE-ORACLE-1 (PAROXYSME) · déclencheur : après la première publication (ETAT l.180)
  état : ouvert · suite : `systemd-analyze` sur un exécuteur Linux de la CI, portée à sourcer (PR3 l.219)
- **DJ-L69** · « L'arrêt par un vrai SIGTERM n'est pas prouvé sous Linux ; la variante est sautée sous Windows. »
  source : ETAT l.54, l.98, l.121 ; code : `apps/dojo/test/dojo-collect-sigterm.test.ts` l.6 à `d1120612`
  nature : test · item : DOJO-SIGTERM-LINUX-PROOF-1 · déclencheur : avant A-9 (7) (ETAT l.98)
  état : clos, preuve à citer (journal privé l.46-48 : vrai SIGTERM vert sur l'hôte Linux, test à `e6b52de6`, 01/10 13:4x UTC ; sortie non gardée) [vérifié
    2026-10-02 03:32 UTC, FAIT-PROUVE] · suite : garder une sortie durable ou rejouer en CI Linux (DE-03, avec DJ-L68) ; ETAT l.106 et l.129 (`1b0ebf9e`) disent
    encore « à prouver »
- **DJ-L70** · « Collecte : `release` s'arrête au premier `unlock` en échec ; erreur anonyme au journal ; flux rompu en cours de corps. »
  source : ETAT l.94-96, l.180
  nature : code · item : collecte N-2 à N-5 (inspection de la partie 1) · déclencheur : après la première publication (ETAT l.180)
  état : ouvert · suite : cas à ajouter à `body-bound` (ETAT l.96)
- **DJ-L71** · « La branche de minuit n'est couverte qu'une course sur 72. »
  source : ETAT l.109
  nature : test · item : DOJO-MIDNIGHT-ALLFOUR-SEED-1, collecte N-8 · déclencheur : hôte au repos, non bloquant (ETAT l.109)
  état : ouvert · suite : graine qui couvre la branche
- **DJ-L72** · « La liaison entre l'ancre et son credential n'est tenue que par l'argv épinglée. »
  source : PR3 l.222
  nature : code · item : DOJO-ANCHOR-CRED-PATH-1 · déclencheur : G1 de DRAND-1b
  état : décision (298 : routée au G0 de DRAND-1b l.99, mission du G1 l.39 ; code non fait, liaison tenue par l'argv, test l.158) [vérifié 2026-10-02 03:32
    UTC, NON-FAIT] · suite : écrire la ligne datée promise (G0 §10 l.253) dans ADR-DOJO-PR-3 ; reprise à la discussion d'après mise en ligne (298)
- **DJ-L73** · « `outside()` prend `<racine>/..x` pour l'extérieur, et ne compare que la racine de ce dépôt. »
  source : PR2B l.739
  nature : code · item : OUTSIDE-REPO-SEGMENT-1 · déclencheur : DRAND-1b, au plus tard avant le prochain acte réseau
  état : décision (298, Q-3 (a) : partie Dōjō routée malgré sa borne, G0 l.103, G1 l.80 ; `outside()` inchangé, collect.ts l.81) [vérifié 2026-10-02 03:32
    UTC, NON-FAIT] · suite : écrire la ligne datée promise (G0 l.257) dans ADR-DOJO-PR-2B ; partie Bell (`apps/bell/src/collect.ts` l.538) : déclencheur Bell à
    relire
- **DJ-L74** · « Conditions d'usage des relais drand non publiées ; les lettres de demande ne sont pas envoyées. »
  source : PR2 l.76, l.162, l.315-316, l.344, l.376 ; PR3 l.442 ; ETAT l.185
  nature : procurement · item : P-3, P-4, P-5 (rapport DOJO-RANDOMNESS-1) · déclencheur : avant le premier jour lu (PR2 l.316)
  état : décision (300 : lettres non envoyées, non bloquantes, PR3 l.442) · suite : procurement à envoyer sur go
- **DJ-L75** · « Tueur K131 non conclu : il ne se mesure qu'une fois la clé née. »
  source : ETAT l.76, l.99
  nature : test · item : DOJO-KEYRING-KILLER-REMEASURE-1 · déclencheur : A-4p (ETAT l.99)
  état : ouvert (déclencheur passé : A-4p à 12:52 UTC, trousseau `764f2302` ; le tueur n'a jamais tourné sur un arbre qui porte le trousseau) [vérifié
    2026-10-02 03:32 UTC, NON-FAIT] · suite : relancer le tueur de `dojo_keyring_shares_no_key_with_bell` (`dojo-deploy.mjs:57`) sur un clone de `lot/page-v1`,
    RESULTS cité
- **DJ-L76** · « Retrait du paquet sans garde sur `publish.lock` ; aucune phrase n'interdit un acte sur l'éditeur avant le premier `snapshot`. »
  source : ETAT l.66
  nature : code · item : Q-14, Q-13 (inspection de la partie 2) · déclencheur : avant 18 (iv) (ETAT l.66)
  état : ouvert · suite : garde et phrase au mode d'emploi

### 3.3 Historique

- **DJ-L80** · « Le collecteur d'historique lit encore les réponses sans borne de taille. »
  source : ETAT l.116-120 (`history-collect.ts` l.408-409)
  nature : code · item : RPC-GUARD-BODY-BOUNDS-ALL-1 · déclencheur : après la première publication (ETAT l.117)
  état : ouvert · suite : borne après mesure de la plus grosse page (ETAT l.120)
- **DJ-L81** · « Un `batch` analysé n'est pas jugé par la liste fermée des instructions. »
  source : ETAT l.275-276, l.283
  nature : code · item : DOJO-HISTORY-BATCH-NEAR-1 · déclencheur : avant la course finale du 3 octobre (ETAT l.283)
  état : clos (preuve : fusion `6c464bbc` dans `lot/page-v1`, oracle G7 `02104bde…` sortie 0) · suite : constaté 2026-10-02 08:54 UTC
- **DJ-L82** · « L'instruction `reallocate` du parseur Token-2022 n'est pas lue. »
  source : ETAT l.273, l.276-277
  nature : recherche · item : FAITS-TOKEN2022-PARSER-REALLOCATE-1 · déclencheur : premier arrêt qui la nomme (ETAT l.277)
  état : ouvert · suite : lecture sur place
- **DJ-L83** · « Deux désaccords d'index restent silencieux : signature omise des index de ses comptes, ou listée par un compte non touché. »
  source : PR2B l.995
  nature : code · item : DOJO-HISTORY-CROSS-INDEX-1 · déclencheur : bloquant avant le go de l'acte 2 (PR2B l.995)
  état : ouvert (actes d'historique faits, ETAT l.265-283 ; clôture non écrite) · suite : environ trois lignes et un test
- **DJ-L84** · « Une queue déchirée du journal d'historique arrête chaque reprise, sans réparation servie. »
  source : PR2B l.742, l.1000 ; mention dans `apps/dojo/test/dojo-history-collect.test.ts` l.378 à `d1120612`
  nature : code · item : DOJO-HISTORY-JOURNAL-TAIL-1 · déclencheur : avant le go de l'acte 1 (PR2B l.1000)
  état : décision (orchestrateur, 2026-10-02 03:32 UTC) : aucune réparation servie ; une queue déchirée arrête la course, qui repart sur un état neuf (lanceur
    `F:/tmp/dojo/run-final.sh` sha256 `f28dce4e…`) [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : code JOURNAL-TAIL-1 (Q-G1-4 (a)) au prochain lot du
    collecteur d'historique, jamais pendant une course
- **DJ-L85** · « Trou dans un groupe ordonné, circuit dans un emplacement non ordonné, `NoQuorum` sans `blockTime` : arrêts fail-closed. »
  source : PR2B l.735-737, l.955, l.959
  nature : code · item : DOJO-HISTORY-ORDERED-HOLE-1, DOJO-HISTORY-UNORDERED-CIRCUIT-1, DOJO-HISTORY-NOQUORUM-BLOCKTIME-1, DOJO-HISTORY-INDEX-DAY-1
  déclencheur : toute ligne datée qui relève une borne au-dessus de 0 · état : ouvert · suite : inatteignables sous les bornes à 0
- **DJ-L86** · « Le verrou canonique chainstack n'est pas contrôlé avant un acte : seul l'ordonnancement protège. »
  source : PR2B l.741
  nature : code · item : DOJO-HISTORY-CANON-LOCK-1 · déclencheur : avant tout acte réseau de ce collecteur
  état : décision (orchestrateur, 2026-10-02 03:32 UTC) : précondition écrite de l'acte : aucun `<cycle>/<op>.lock` canonique au départ, aucune autre course
    gardée sur ces cycles jusqu'à la fin (lanceur `F:/tmp/dojo/run-final.sh` sha256 `f28dce4e…`) [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : refus
    `lock_held` codé au prochain lot du collecteur d'historique
- **DJ-L87** · « Premier jour lu à contrôle du mint non `ok` non refusé ; le vérificateur n'a aucune vue du mint. »
  source : PR2B l.998, l.1001
  nature : code · item : B1R-MINT-CHECK-1, DOJO-HISTORY-FIRSTREAD-TWO-SLOTS-1 · déclencheur : avant le go de l'acte 1 (PR2B l.1001)
  état : décision (orchestrateur, 2026-10-02 03:32 UTC) : forme (b) de Q-G1-7 : `mint_check` de d lu dans `publish/day.json`, autre que `ok` = arrêt avant
    tout appel (lanceur `F:/tmp/dojo/run-final.sh` sha256 `f28dce4e…`) [vérifié 2026-10-02 03:32 UTC, NON-FAIT] · suite : forme (a), refus structurel, au
    prochain lot du collecteur ; TWO-SLOTS-1 à son propre déclencheur
- **DJ-L88** · « La borne `--cut` n'est pas vérifiée contre la première énumération dans le journal de la course. »
  source : PR2B l.970, l.975 (Q-4)
  nature : code · item : DOJO-HISTORY-CUT-CHECK-1 · déclencheur : G1 de PR-2b-4
  état : clos (preuve : 30ef4ac4, fusion 59adcfb5, G7 944ecda6 oracle 0829a44e ; history-collect.ts l.165-167, l.212-214 à 224a6bd1) [vérifié 2026-10-02 03:32
    UTC, FAIT-PROUVE] · suite : aucune ; examiner si --cut non vérifié en mode --provisional-day (l.161, l.167) mérite une entrée
- **DJ-L89** · « La reprise est égale à l'octet, sauf le lien d'évidence de l'exécution finale. »
  source : PR2B l.997
  nature : code · item : EVIDENCE-LINK-1 · déclencheur : acte 0 ou reformulation (PR2B l.997)
  état : ouvert · suite : liste triée des clés de lecture, ou stabilité brute mesurée
- **DJ-L90** · « Phase C : coût non chiffré ; les transferts qui ne nomment pas le mint ne se voient que par les pages par compte. »
  source : PR2B l.677, l.686 (TY-2), l.750-751, l.766 ; MÈRE l.750 (§12 point 14)
  nature : recherche · item : DOJO-CONTINUOUS-1, DOJO-GTFA-TOKENACCOUNTS-1 · déclencheur : G0 de PR-2b-4 ; pièce ultérieure
  état : ouvert · suite : compte des signatures vues par compte (PR2B l.766)

### 3.4 Éditeur et vérificateur

- **DJ-L95** · « Un défaut commun à l'éditeur et au vérificateur passe les deux : aucune seconde mise en œuvre indépendante. »
  source : PR1B5 l.163 (TY-1) ; PR3 l.350 (TB-14), l.364, l.417 ; MÈRE l.557 (FM-3.3)
  nature : recherche · item : DOJO-VERIFY-INDEPENDENT-1 (PAROXYSME) · déclencheur : cartographie de clôture de phase (PR3 l.364)
  état : ouvert · suite : sources à chercher, procurements formés s'il le faut (PR3 l.364)
- **DJ-L96** · « Une version de prix due reste en attente à la tête sans que le rapport `ok` le dise. »
  source : PR1B5 l.166 (TY-4), l.187, l.243 ; code : `apps/dojo/scripts/dojo-verify.mjs` l.250 à `d1120612`
  nature : code · item : DOJO-VERIFY-PV-PENDING-REPORT-1 (PAROXYSME) · déclencheur : premier de G1 de PR-3b-2, G0 de PR-4c-2
  état : ouvert (non fait : dojo-verify.mjs l.250, 18 clés l.37-38 à 224a6bd1 ; G0 PR-4c-2 fait le 30/09 22:46Z ; Q-B1 (a) → PR-3b-2b) [vérifié 2026-10-02
    03:32 UTC, NON-FAIT] · suite : 19e clé price_version_pending au G1 de PR-3b-2b ; déclencheur à réécrire : avant la 1re price_version due
- **DJ-L97** · « `--day` refuse les jours d'historique : aucune preuve d'un jour d'historique contre sa racine. »
  source : PR1B4 l.91, l.190, l.235
  nature : code · item : DOJO-VERIFY-HISTORY-DAY-1 (PAROXYSME) · déclencheur : première ligne `history` servie, ou G0 de PR-4c-2
  état : ouvert · suite : tout l'intervalle de l'historique admis (PR1B4 l.235)
- **DJ-L98** · « La clause défensive V-4 (`opaqueredirect`) est inatteignable sous le runtime mesuré. »
  source : PR1B4 l.241 ; PR1B5 l.252
  nature : test · item : PAROXYSME-DOJO-V4-1 · déclencheur : ce registre (PAROXYSME-DOJO-FILE-1)
  état : ouvert · suite : construction qui la rend atteignable, ou retrait avec preuve (PR1B5 l.252)
- **DJ-L99** · « Un nom calculé échappe au balayage de texte qui garde le cœur sans réseau. »
  source : PR1B5 l.266 (Q-G2R-2)
  nature : test · item : DOJO-VERIFY-CORE-NO-NET-RUNTIME-1 (PAROXYSME) · déclencheur : ce registre (PAROXYSME-DOJO-FILE-1)
  état : ouvert · suite : test à piège d'exécution (PR1B5 l.266)
- **DJ-L100** · « Limite renvoyée à ce registre sans objet décrit dans les entrées (Q-C-3 du correcteur de PR-1b-5b). »
  source : PR1B5 l.265
  nature : code · item : DOJO-CLI-FATAL-SERVED-1 · déclencheur : ce registre (PAROXYSME-DOJO-FILE-1)
  état : ouvert · suite : objet à citer depuis le rapport du correcteur (doute au rapport)
- **DJ-L101** · « Le vérificateur n'exige pas `slot_min` au plus égal à `slot_max` ; seul le chargeur du site le refuse. »
  source : PR4 l.384, l.396
  nature : code · item : DOJO-VERIFY-SLOT-ORDER-1 (PAROXYSME) · déclencheur : avant le premier `snapshot` réel servi (PR4 l.384)
  état : ouvert · suite : environ cinq lignes, un test, un mutant (PR4 l.384)
- **DJ-L102** · « La voie Linux du test du lien de commande n'est pas mesurée. »
  source : PR1B5 l.266 (Q-G2R-4)
  nature : test · item : DOJO-VERIFY-LINK-LINUX-1 · déclencheur : prochain passage de la CI Linux, avant la page en ligne
  état : ouvert · suite : lecture du job de CI
- **DJ-L103** · « La CLI en `--url` rend `unreachable` si le serveur ferme une connexion inactive pendant un long calcul. »
  source : ETAT l.59, l.106, l.262, l.300
  nature : code · item : DOJO-VERIFY-URL-IDLE-1, DOJO-VERIFY-URL-IDLE-MEASURE-1 · déclencheur : avant l'envoi du site ; avant CA-1
  état : ouvert · suite : IDLE-1 fait par SITE-PREP (un second essai, un seul, `G1-lot-site-prep.md` point 3) ; MEASURE-1 reste, avant CA-1
- **DJ-L104** · « Le coût de la vérification complète croît ; au-delà d'environ 10 000 adresses sur un an, il faudra la revoir. »
  source : ETAT l.58, l.66, l.100 ; PR3 l.351 (TB-15) ; PR1B4 l.82, l.173 (TY-9 : bornes provisoires)
  nature : test · item : DOJO-PUBLISH-SCALE-1 (PAROXYSME), DOJO-VERIFY-SCALE-1 · déclencheur : avant 18 (iv) (ETAT l.100)
  état : ouvert · suite : fichier candidat de plus de 64 Mio pendant la vérification (ETAT l.100)
- **DJ-L105** · « La requête d'ancre de l'éditeur est lue sans borne de profondeur. »
  source : ETAT l.101-103, l.180
  nature : code · item : PUBLISH-REQUEST-DEPTH-1 · déclencheur : après la première publication (ETAT l.101)
  état : ouvert · suite : lecture par `readJson`, `null` refusé (ETAT l.103)
- **DJ-L106** · « La synchro lit chaque ligne servie par `JSON.parse` sans mesure de profondeur. »
  source : ETAT l.104-105
  nature : code · item : SYNC-SERVED-DEPTH-SCAN-1 · déclencheur : avant la première synchro (ETAT l.104)
  état : clos (preuve : SITE-PREP point 2, test `dojo_sync_measures_a_line_before_parsing_it`) · suite : constaté 2026-10-02 08:54 UTC
- **DJ-L107** · « Le contrôle de déploiement à douze points n'est pas écrit ; chaque acte d'hôte est contrôlé par empreintes. »
  source : ETAT l.212-213 ; PR3 l.442 ; MÈRE l.513 (condition de G7 : CA verte) ; PR1B4 l.229
  nature : code · item : DOJO-CA0-SCRIPT-1, DOJO-CA-TIMELINE-SHA-1 · déclencheur : après la première publication (ETAT l.212)
  état : ouvert · suite : écart avec la condition de G7 de la mère au rapport (doutes)
- **DJ-L108** · « Une ligne en excès (pile vide, points nuls) est acceptée par le vérificateur. »
  source : MÈRE l.708, l.1055, l.1067
  nature : code · item : PLI-PR2B-NEXT-1 (F-2, Q-6, Q-8) · déclencheur : avant le G1 de PR-2b-3 (MÈRE l.708)
  état : ouvert (non fait : aucun code de ligne en excès, dojo-verify.mjs l.19-28 et l.282-306 à 224a6bd1 ; G1 de PR-2b-3 passé) [vérifié 2026-10-02 03:32
    UTC, NON-FAIT] · suite : nommer le code d'existence (F-2), l'ajouter à D-10, vérificateur et tests ; trancher Q-6 et Q-8 côté vérificateur
- **DJ-L109** · « `--unlock` ne retire pas les `publish.lock.<pid>` de processus morts ; l'échec du seul retrait du nom temporaire arrête. »
  source : ETAT l.65
  nature : code · item : Q-10, D3-1 (inspection de la partie 2) · déclencheur : avant A-10 (ETAT l.65)
  état : ouvert · suite : déclencheur déplacé après la base (rapport, doutes)

### 3.5 Site, relecture et hôte

- **DJ-L110** · « Le navigateur ne recalcule ni lots, ni points, ni unités, ni versions de la tête relue. »
  source : PR4 l.302, l.344 (TY-9), l.378
  nature : Tiers · item : DOJO-LIVE-HEALTH-1 (construction : PR4 l.302) · déclencheur : jour de l'annonce ou sous 7 jours (ETAT l.299)
  état : ouvert (sonde reportée, ETAT l.298) · suite : la vérification avant engagement de l'éditeur est close (DJ-L161)
- **DJ-L111** · « La sonde et les fichiers servis vivent sur le même hôte : une panne de Bell tait les deux. »
  source : PR4 l.310, l.328, l.348 (TY-13), l.378
  nature : recherche · item : DOJO-PROBE-VANTAGE-1 · déclencheur : G1 de PR-4c-1c (PR4 l.328)
  état : ouvert · suite : second point de vue hors de Bell, avec son prix
- **DJ-L112** · « Les règles de tête du chargeur et de la vue ont deux sources ; leur extraction lit un littéral. »
  source : PR4 l.396, l.398 ; ETAT l.300
  nature : test · item : DOJO-HEAD-RULES-ONE-SOURCE-1, DOJO-LOADER-RULES-AST-1 (PAROXYSME) · déclencheur : après la première publication
  état : ouvert · suite : source unique ; lecture par l'analyseur TypeScript (PR4 l.396)
- **DJ-L113** · « Le rendu vivant n'a pas d'oracle de navigateur. »
  source : PR4 l.397-398 ; ETAT l.107, l.263, l.292
  nature : test · item : DOJO-LIVE-RENDER-ORACLE-1 (PAROXYSME) · déclencheur : volet navigateur avant l'envoi du site (ETAT l.292)
  état : ouvert · suite : lot SITE-BROWSER (ETAT l.292)
- **DJ-L114** · « Le mandataire pourrait transmettre un en-tête d'adresse cliente à l'hôte qui tient la clé. »
  source : PR4 l.396, l.398 ; ETAT l.291-292
  nature : code · item : DOJO-SITE-PROXY-XFF-1 (PAROXYSME) · déclencheur : avant l'acte DOJO-SITE-PROXY-1 (ETAT l.291)
  état : ouvert · suite : lot SITE-SEND-PREP, trois traversées attendues 404 (ETAT l.292)
- **DJ-L115** · « Une tête comptée à K lectures toutes manquées est acceptée par le vérificateur et refusée par le site. »
  source : PR4 l.214 ; code : `test/dojo-served.test.ts` l.168 à `d1120612`
  nature : code · item : DOJO-SERVED-ALL-MISSED-1 · déclencheur : G0 de PR-3a (PR4 l.214)
  état : ouvert ((a) tenue par construction : jour sans lecture faite `abstained`, bundle.ts l.95-99 ; décision non écrite, non testée) [vérifié 2026-10-02
    03:32 UTC, PARTIEL] · suite : écrire la décision (a) ; test non-LLM : K lectures manquées ⇒ ligne `abstained` publiée ; option (b) : dojo-verify refuse ce
    `counted`
- **DJ-L116** · « Une tête abstenue qui porte des lectures est refusée par le site : indisponibilité, jamais un chiffre faux. »
  source : PR4 l.323, l.349 (TY-14), l.358, l.364, l.370
  nature : code · item : DOJO-PAGE-ABSTAINED-1 · déclencheur : avant le premier `snapshot` abstenu servi (PR4 l.323)
  état : ouvert (Q-P2 (a) décidée, PR4 l.370 ; clôture non écrite) · suite : test d'É-P5 (PR4 l.370)
- **DJ-L117** · « Le comportement de `next build` pour `notFound()` n'est pas établi. »
  source : PR4 l.118, l.204, l.231 ; PAGE l.24
  nature : test · item : DOJO-NEXT-NOTFOUND-1 · déclencheur : G1 de PR-4b (PR4 l.204)
  état : clos (preuve : G1 PR-4b `docs/G1-lot-dojo-pr4b.md` l.137, l.193, `0a23979a` ; branché : assert-fleet-html.mjs l.645-656) [vérifié 2026-10-02 03:32
    UTC, FAIT-PROUVE] · suite : aucune ; rejouer build et assert-fleet-html en E0 à toute montée de Next (mesuré en 16.3.4, tête en 16.3.8) ; PR4 l.231 à dater
- **DJ-L118** · « Synchro : corps ni lu ni annulé sur refus ; fenêtre entre fichier et manifeste ; champs de la CA sans tests négatifs. »
  source : PR4 l.254, l.258, l.259 ; PR1B4 l.234
  nature : code · item : DOJO-SYNC-FETCH-CONVERGE-1, DOJO-SYNC-WRITE-WINDOW-1, DOJO-SYNC-CA-FIELD-NEGATIVES-1
  déclencheur : avant l'acte TU-7, première synchro (PR4 l.254, l.258) · état : ouvert · suite : convergence sur `urlSource`
  constaté sur pièce à `58450ac3` (2026-10-02 08:54 UTC) : FETCH-CONVERGE ouvert, `httpsGet` refuse un statut ou une longueur annoncée
  sans lire ni annuler le corps (`sync-dojo-served.mjs` l.157-158) ; WRITE-WINDOW ouvert, fichier puis manifeste (l.148-149) ;
  CA-FIELD-NEGATIVES : quinze cas négatifs à un refus chacun (`test/dojo-served.test.ts` l.292-312), couverture champ par champ non mesurée
- **DJ-L119** · « Chaque synchro relit tous les fichiers de lignes servis. »
  source : PR4 l.255
  nature : code · item : DOJO-SYNC-COST-1 · déclencheur : 30e `snapshot` servi (PR4 l.255)
  état : ouvert · suite : mesure, puis lecture incrémentale
- **DJ-L120** · « L'annonce des régions `role="status"` de la table n'est pas éprouvée. »
  source : ETAT l.107-108, l.261
  nature : recherche · item : DOJO-TABLE-STATUS-ANNOUNCE-1 (page N-8) · déclencheur : volet navigateur (ETAT l.261)
  état : ouvert · suite : recherche d'accessibilité
- **DJ-L121** · « Page : texte TXT-17c, tests vides si la fixture change, état transitoire, fichier de lignes vide. »
  source : ETAT l.106-108
  nature : test · item : page N-1 à N-4 (inspection) · déclencheur : avant l'envoi du site (ETAT l.106)
  état : clos (preuve : SITE-PREP, `G1-lot-site-prep.md` points 4 à 8, N-8 compris) · suite : constaté 2026-10-02 08:54 UTC
- **DJ-L122** · « Le balayage des attributs visibles ne lit que les guillemets doubles. »
  source : PR4 l.217
  nature : test · item : DOJO-ATTR-QUOTES-1 · déclencheur : tout rendu hors React sous `/dojo` (PR4 l.217)
  état : ouvert · suite : balayage des deux formes
- **DJ-L123** · « La porte des noms d'opérateur et du partenaire ne s'applique pas au rendu d'un texte libre des données. »
  source : PR4 l.217
  nature : test · item : DOJO-NAME-GATE-RENDER-1 · déclencheur : G0 de PR-4c-2 (PR4 l.217)
  état : ouvert · suite : porte au rendu si un texte libre est rendu
- **DJ-L124** · « Le nom du partenaire d'inférence figure dans quatre fichiers exportés de `packages/**`. »
  source : PR4 l.217 ; MÈRE l.176-177
  nature : code · item : NAME-EXPORT-PACKAGES-1 · déclencheur : prochain lot qui touche l'export (PR4 l.217)
  état : ouvert · suite : retrait ou exclusion de l'export
- **DJ-L125** · « La page n'a pas de modèle formel ; seul un différentiel généré borné est prévu. »
  source : PR4 l.217, l.220 ; DOCTRINE l.9 (C1)
  nature : recherche · item : DOJO-PAGE-MODEL-1 · déclencheur : page en ligne, puis lots Narabi et KAIZEN (PR4 l.220)
  état : ouvert · suite : test non-LLM du différentiel

### 3.6 Pièce 2 (consignée, non servie, non affichée)

- **DJ-L130** · « Le contrôle d'une adresse qualifiée peut se louer ou se vendre hors chaîne : aucune parade dans la pièce 1. »
  source : MÈRE l.335 (T-6)
  nature : recherche · item : DOJO-P2-RIGHT-BINDING-1 · déclencheur : G0 de la pièce 2
  état : ouvert · suite : droit lié à une signature de l'adresse
- **DJ-L131** · « Le nombre d'agents, un par adresse au palier Egg, croît par fractionnement. »
  source : MÈRE l.182, l.666
  nature : recherche · item : DOJO-P2-AGENT-CAP-1, DOJO-P2-EDITIONS-1 · déclencheur : G0 de la pièce 2
  état : décision (225 (2), MÈRE l.182) · suite : plafond global
- **DJ-L132** · « Le risque de sorties groupées au jour de validation est atténué, non supprimé. »
  source : MÈRE l.636 (conséquence (i)), l.698
  nature : test · item : DOJO-COHORT-WATCH-1 · déclencheur : première `price_version` (MÈRE l.698)
  état : ouvert · suite : surveillance interne recalculable depuis les lignes (MÈRE l.943 (2))
- **DJ-L133** · « Agents cessibles contre droit non transférable : contradiction à réconcilier. »
  source : MÈRE l.702, l.1075 (question 3)
  nature : recherche · item : DOJO-P2-TRANSFER-1, DOJO-P2-RIGHT-BINDING-1 · déclencheur : G0 de la pièce 2
  état : ouvert · suite : deux objets distincts possibles (MÈRE l.1075)
- **DJ-L134** · « Le sens de l'excédent converti en inférence n'est pas tranché. »
  source : MÈRE l.632, l.943 (3)
  nature : recherche · item : P-39 (question ouverte) · déclencheur : avant la ligne `anchor` (MÈRE l.943)
  état : ouvert (déclencheur « avant l'ancre » passé le 01/10, seq 1 et 2, sans décision écrite ; l'ancre ne porte aucun champ d'excédent) [vérifié 2026-10-02
    03:32 UTC, NON-FAIT] · suite : question fermée à l'investisseur : (a), (b) ou 3e lecture (MÈRE l.632) ; déclencheur ramené au G0 de la pièce 2 par décision
    datée
- **DJ-L135** · « L'inférence est servie selon les quotas, sans droit acquis ; son unité de mesure n'est pas fixée. »
  source : MÈRE l.176, l.694-695, l.697
  nature : recherche · item : DOJO-INFERENCE-UNIT-1, DOJO-INFERENCE-QUOTA-1, DOJO-P2-ALLOCATION-1 · déclencheur : G0 de la pièce 2
  état : ouvert · suite : décision de l'investisseur

### 3.7 Droit et licence

- **DJ-L140** · « Aucune qualification juridique de la pièce : la consultation du juriste est levée. »
  source : MÈRE l.577, l.637, l.682
  nature : procurement · item : DOJO-LEGAL-1 · déclencheur : aucun (levé)
  état : décision (244, MÈRE l.637) · suite : texte applicable lu sur place si la pièce 2 approche un mandat (DOCTRINE l.24)
- **DJ-L141** · « Les valeurs SOL/USD sont republiées sans attribution ni texte de licence lu ; le risque est assumé par l'investisseur. »
  source : MÈRE l.637-638 ; PR2 l.46, l.141
  nature : procurement · item : PYTH-DATA-LICENSE-1 · déclencheur : aucun (clos par décision)
  état : décision (242, MÈRE l.638) · suite : réserve de l'orchestrateur consignée (MÈRE l.637)

### 3.8 Valeurs de l'ancre, textes et tests à venir

- **DJ-L145** · « Fixtures et exemple chiffré gardent une fenêtre Migration de 180 jours, alors que l'ancre en vigueur porte 90. »
  source : MÈRE l.586 (décision 276) ; ETAT l.169-176
  nature : test · item : DOJO-TIER-WINDOWS-90-1 · déclencheur : prochain lot touchant ces tests, avant toute ligne portant `tier_windows`
  état : ouvert (déclencheur passé : 3 lots ont touché ces tests, ancre signée ; 180 à dojo-fixture.ts l.89, dojo-core-hold.test.ts l.280) [vérifié 2026-10-02
    03:32 UTC, NON-FAIT] · suite : au prochain lot Dōjō : 180 → 90 dans dojo-fixture.ts l.89 et dojo-core-hold.test.ts l.279-283 ; exemple (F) de MÈRE l.139
    recalculé
- **DJ-L146** · « L'historique servi n'est pas rendu sur la page tant que son texte de méthode n'est pas approuvé. »
  source : PR4 l.70, l.95 ; MÈRE l.322, l.662 ; PR4 l.5
  nature : code · item : DOJO-RETRO-TEXT-1, PR4B-CP1-POST-ANNOUNCE-1 · déclencheur : annonce du « jour 1 » (MÈRE l.733)
  état : ouvert · suite : texte à approuver au second checkpoint-1 bref
- **DJ-L147** · « Aucun test ne compare la liste des refus de l'éditeur aux codes qu'il lève. »
  source : PR3 l.419 (Q-G2-5)
  nature : test · item : DOJO-PUBLISH-REFUSALS-LIST-1 · déclencheur : G1 de PR-3a-2 (PR3 l.419)
  état : clos (preuve : test `dojo_publish_refusals_list_is_every_code_raised`, dojo-publish.test.ts l.698, `39aa3dba` ; oracle G7 `02104bde…`) [vérifié
    2026-10-02 03:32 UTC, FAIT-PROUVE] · suite : aucune

- **DJ-L187** · « La liste fermée du proxy du site ne porte pas d'allowlist d'en-têtes vers l'hôte de la clé (I-2 de SITE-SEND-PREP). »
  source : HANDOFF-2026-10-02 §8 ; JOURNAL privé 02/10 01:57Z (I-2 au registre) ; `docs/dojo/FAITS-caddy-header-up-delete-2026-10-02.md`
  nature : code · item : DOJO-SITE-PROXY-HEADERS-ALLOWLIST-1 · déclencheur : lot du site après DOJO-SITE-PROXY-1 (acte), avant l'annonce
  état : ouvert · suite : `caddy adapt` de la configuration installée relu à l'acte ; trois traversées 404 attendues (preuves), deux variantes observées (non
  probantes)
- **DJ-L188** · « La faute d'imbrication profonde d'un `batch` vient de `canonical` ou de la proximité selon le moteur : non borné. »
  source : PR2B l.1060-1063 (ligne datée BATCH-NEAR, C-1) ; `docs/G1-lot-batch-near.md` l.300 (branche `lot/batch-near`)
  nature : test · item : DOJO-HISTORY-INFO-DEPTH-1 · déclencheur : prochain lot d'outillage de l'historique après la première publication
  état : ouvert · suite : construction qui couvre l.255, l.112 et `readBody` sur le chemin servi (PR2B l.1060)
- **DJ-L189** · « La forme interne d'un `batch` Token-2022 (clé `type` des éléments) n'a pas été lue sur place. »
  source : `docs/G1-lot-batch-near.md` l.276 (Q-4, demande de lecture formée), l.300
  nature : procurement · item : FAITS-TOKEN2022-PARSER-BATCH-SHAPE-1 · déclencheur : premier arrêt nommant un `batch`, ou le lot de DJ-L188
  état : ouvert · suite : lecture sur place de l'analyseur (règle 2026-09-20), FAITS daté avant tout code
- **DJ-L190** · « `--unlock` et les `publish.lock.<pid>` d'un lancement mort : reportés après A-10 (Q-10). »
  source : HANDOFF-2026-10-02 §8, §12 ; JOURNAL privé 02/10 01:44Z (décision de l'orchestrateur, avis advisor)
  nature : code · item : DOJO-PUBLISH-UNLOCK-DEAD-PID-1 (Q-10) · déclencheur : premier redéploiement de l'éditeur, première rotation, ou 2026-10-09
  état : décision (orchestrateur, 02/10 01:44Z) · suite : parade quotidienne : chaque lecture du §17 liste `publish.lock*`
- **DJ-L191** · « Échec du retrait du nom temporaire après un lien réussi : laissé tel quel (D3-1). »
  source : HANDOFF-2026-10-02 §8, §12 ; JOURNAL privé 02/10 01:44Z ; code lu à `d1120612`
  nature : code · item : DOJO-PUBLISH-TMP-UNLINK-1 (D3-1) · déclencheur : le même que DJ-L190
  état : décision (orchestrateur, 02/10 01:44Z) · suite : un résidu `.<pid>` va au journal, rien n'est retiré à la main

### 3.9 Formées le 2026-10-02 03:06 UTC (anciennes dettes du §1.2)

- **DJ-L07** · « Un portefeuille de plateforme d'échange ou de garde est sur la courbe et compte pour un détenteur. »
  source : MÈRE l.222, l.333 (T-4), l.569 (P-5 : résiduel accepté) · touche : `exclusion`, `holders`
  nature : recherche · item : DOJO-CUSTODY-WALLET-LABEL-1 (reconnaître un portefeuille de garde ou de plateforme : étiquettes publiques, heuristiques de
    regroupement, taux d'erreur) · déclencheur : G0 de la pièce 2 (MÈRE l.677)
  état : décision (P-5, MÈRE l.569) · suite : littérature d'analyse de chaîne et sources des étiquettes, coût d'une liste signée ; P-5 reste la règle d'ici là
- **DJ-L08** · « Lien entre emplacement et heure non vérifiable hors ligne : l'heure d'une lecture est celle de la machine qui lit. »
  source : MÈRE l.199, l.751 (§12 point 15) · touche : `counted`
  nature : recherche · item : DOJO-SLOT-TIME-ATTEST-1 (lier un emplacement à une heure vérifiable hors ligne : `blockTime` de consensus, tour drand, preuve
    horodatée) · déclencheur : G0 de DOJO-CA0-SCRIPT-1 (après la première publication)
  état : ouvert · suite : état de l'art des horodatages vérifiables, prix par lecture ; procurement formé si un papier manque
- **DJ-L09** · « Deux absences concordantes truquées exigent la connivence des deux opérateurs : hors modèle, aucune preuve d'état servie établie. »
  source : MÈRE l.1111 ; PR2 l.173, l.265, l.389 (§9 point 15) · touche : `bounds`
  nature : recherche · item : DOJO-STATE-PROOF-1 (même construction que DJ-L03 : preuve d'état par compte, la connivence des deux opérateurs ne suffit plus) ·
    déclencheur : celui de DJ-L03
  état : ouvert · suite : un seul item pour DJ-L03 et DJ-L09
- **DJ-L10** · « Vue scindée : l'hôte peut servir des vues différentes à des lecteurs différents, chacune vérifiable. »
  source : PR1B4 l.172 (TY-8 : résiduel) ; DOJO-CA-TIMELINE-SHA-1 (PR1B4 l.229) ne couvre que le contrôle c11
  nature : recherche · item : DOJO-SPLIT-VIEW-WITNESS-1 (témoins qui cosignent la tête servie, transparence par commérage : coût et protocole) · déclencheur :
    avant l'annonce (QI-4 (c))
  état : ouvert · suite : état de l'art des témoins de journaux transparents, prix d'un témoin tiers ; d'ici là c11 seul
- **DJ-L11** · « Décodage de `Content-Encoding` par `fetch` non établi : la borne compte les octets rendus par le flux. »
  source : PR1B4 l.207 (§9 point 3), l.236 (F-7 ; FAITS-NODE-FETCH-TLS-1 clos pour le lot, voir DJ-L175)
  nature : procurement · item : FAITS-NODE-FETCH-CONTENT-ENCODING-1 (lecture sur place : `fetch` de Node décode-t-il `Content-Encoding`, et ce que compte la
    borne) · déclencheur : G0 de DOJO-CA0-SCRIPT-1
  état : ouvert · suite : FAITS daté avant tout code du vérificateur réseau
- **DJ-L12** · « Prix d'une lecture pris à plusieurs emplacements voisins ; la lecture à un seul emplacement n'est pas mesurée. »
  source : PR2 l.303 (TY-9 : résiduel déclaré), l.384 (§9 point 10)
  nature : test · item : DOJO-PRICE-SINGLE-SLOT-MEASURE-1 (mesurer l'écart entre le prix à un emplacement et le prix sur emplacements voisins) · déclencheur :
    première version de prix (septième jour compté valide, TU-11)
  état : ouvert · suite : mesure sur les lectures réelles de d à d + 6, avant la première `price_version`
- **DJ-L13** · « Borne des écarts d'index, 3 sur 2 000, fondée sur un seuil de 5 % déclaré convention, non source. »
  source : PR2B l.371, l.921, l.953 ; MÈRE l.316, l.931
  nature : recherche · item : DOJO-INDEX-GAP-THRESHOLD-1 (fonder le seuil de 5 % : loi des écarts d'index entre opérateurs, borne de détection) · déclencheur
    : prochaine course d'historique, ou 2026-10-31 au plus tard
  état : ouvert · suite : mesure des écarts sur les courses r2, r3 et finale, puis seuil sourcé ou recherche formée
- **DJ-L14** · « Emplacement sans rang concordant : la borne basse retire jusqu'à la somme des baisses ; escalade écrite, borne d'arrêt à 0. »
  source : PR2B l.359, l.816, l.910, l.921
  nature : recherche · item : DOJO-RANK-FALLBACK-BOUND-1 (emplacement sans rang concordant : borne plus fine que la somme des baisses) · déclencheur : le lot
    de DOJO-HISTORY-INFO-DEPTH-1
  état : ouvert · suite : compter les emplacements sans rang des courses réelles ; si zéro, l'item se clôt par la mesure
- **DJ-L15** · « La recherche du tableau contrôle l'alphabet base58, pas le décodage en 32 octets ; accepté à l'inspection. »
  source : ETAT l.68 ; PR4 l.71 · touche : `lookup`
  nature : code · item : DOJO-LOOKUP-BASE58-DECODE-1 (la recherche décode l'adresse en 32 octets avant de chercher) · déclencheur : lot du site après la
    première synchro (avec DOJO-TABLE-SSR-1)
  état : décision (inspection, ETAT l.68) · suite : deux lignes et un test ; la décision d'inspection (ETAT l.68) tient jusque-là
- **DJ-L16** · « Une adresse qui acquiert puis ferme son compte avant le premier instant lu de d fait sauter d : un jour perdu. »
  source : ETAT l.83-86, l.161-162
  nature : recherche · item : DOJO-FIRST-DAY-CLOSED-ACCOUNT-1 (lire d sans perdre un jour quand une adresse ferme son compte avant le premier instant lu) ·
    déclencheur : premier refus `eve_mismatch` à 18 (iv) ; clos sans objet à la publication du premier snapshot s'il n'y en a pas
  état : décision (accord de l'investisseur, ETAT l.83-86) · suite : le résiduel de B-1 ne vaut qu'au premier jour ; mesure à 18 (iv)
- **DJ-L17** · « Aucune constante tirée des lectures : seuil, nombre de lectures et durée minimale sont des choix, pas des chiffres sourcés. »
  source : MÈRE l.119 ; valeurs de l'ancre en vigueur : ETAT l.169-178
  nature : recherche · item : DOJO-CONSTANTS-CALIBRATION-1 (seuil, nombre de lectures, durée minimale : calibrer sur les lectures servies, littérature du vote
    pondéré par le temps) · déclencheur : 30 jours comptés (2026-11-01), puis G0 de la pièce 2 (MÈRE l.677)
  état : décision (valeurs de l'ancre, ETAT l.169-178) · suite : chaque constante sourcée ou mesurée, changement seulement par ancre signée
- **DJ-L18** · « Jours manquants propres à une adresse (désaccord d'opérateurs) : hors de la preuve d'invariance au fractionnement. »
  source : MÈRE l.294, l.650 (P-21)
  nature : recherche · item : DOJO-SPLIT-INVARIANCE-MISSING-DAYS-1 (étendre la preuve d'invariance au fractionnement aux jours manquants d'une adresse) ·
    déclencheur : G0 de la pièce 2 (MÈRE l.677)
  état : ouvert · suite : preuve écrite ou contre-exemple mesuré sur les lectures servies
- **DJ-L19** · « Sécurité formelle du mélange de la graine et de la balise : analyse en oracle aléatoire, sans preuve. »
  source : PR2 l.386 (§9 point 12) ; MÈRE l.749 (§12 point 13)
  nature : recherche · item : DOJO-SEED-BEACON-PROOF-1 (sécurité du mélange graine et balise dans le modèle standard : VRF, engagement et révélation) ·
    déclencheur : G0 de la prochaine ancre (rotation de graine ou de clé)
  état : ouvert · suite : état de l'art, procurements formés, construction choisie et son prix
- **DJ-L20** · « Résiduel initié : l'opérateur connaît les instants dès le début du jour et garde l'abstention ; connivence avec t nœuds drand. »
  source : MÈRE l.202, l.339 (T-10) ; PR2 l.161, l.301 (TY-7), l.304 (TY-10) · touche : `method`
  nature : recherche · item : DOJO-INSIDER-INSTANTS-1 (instants tirés d'un tour drand futur pour que l'opérateur ne les connaisse pas d'avance) · déclencheur
    : G0 de la prochaine ancre (rotation de graine ou de clé)
  état : ouvert · suite : construction à délai et son coût ; connivence avec t nœuds drand chiffrée
- **DJ-L21** · « Une poussée du prix tenue une semaine déplace le seuil d'une unité pour une version : coût chiffré, pas d'interdiction. »
  source : MÈRE l.346 (T-17 : résiduel) · touche : `tiers`
  nature : recherche · item : DOJO-PRICE-MANIPULATION-COST-1 (prix robuste à une poussée d'une semaine : médiane, TWAP, coût d'attaque chiffré) · déclencheur
    : première version de prix (septième jour compté valide, TU-11)
  état : ouvert · suite : coût chiffré sur les réserves réelles du pool ; changement de règle par ancre signée
- **DJ-L22** · « Migration ou retrait de la liquidité du pool : prix indéfini ; changement de pool seulement par décision signée. »
  source : MÈRE l.347 (T-18 : résiduel)
  nature : code · item : DOJO-POOL-MIGRATION-1 (détecter le retrait de la liquidité du pool et s'abstenir de prix, règle signée de changement de pool) ·
    déclencheur : première version de prix (septième jour compté valide, TU-11)
  état : ouvert · suite : lecture des réserves à chaque version ; abstention nommée si elles tombent
- **DJ-L23** · « Un déplacement légitime entre ses propres portefeuilles remet aussi la part déplacée à zéro (coût déclaré). »
  source : MÈRE l.334 (T-5) · touche : `method`
  nature : recherche · item : DOJO-SELF-TRANSFER-LINK-1 (lier deux adresses par une preuve de contrôle commun pour qu'un déplacement ne remette pas à zéro) ·
    déclencheur : G0 de la pièce 2 (MÈRE l.677)
  état : décision (règle du G0, MÈRE l.334) · suite : état de l'art des preuves de contrôle commun, coût, effet sur la règle du G0
- **DJ-L24** · « Toutes les lignes sont publiques : la fuite des soldes par adresse est acceptée par conception. »
  source : MÈRE l.232, l.336 (T-7)
  nature : recherche · item : DOJO-PRIVACY-THRESHOLD-PROOF-1 (prouver qu'une adresse passe un seuil sans publier son solde : preuves à divulgation nulle) ·
    déclencheur : G0 de la pièce 2 (MÈRE l.677)
  état : décision (MÈRE l.232) · suite : construction et prix ; la publication des lignes reste la règle d'ici là
- **DJ-L25** · « Aucune décroissance du stock ancien dans la pièce 1 : l'enracinement est renvoyé au G0 de la pièce 2. »
  source : MÈRE l.343 (T-14), l.565 (P-1)
  nature : recherche · item : DOJO-STOCK-DECAY-1 (décroissance du stock ancien et enracinement) · déclencheur : G0 de la pièce 2 (MÈRE l.677)
  état : ouvert · suite : renvoi daté au G0 de la pièce 2, littérature du vote pondéré par le temps
- **DJ-L26** · « Coût d'une attaque par comptes-poussière non chiffré : le loyer d'un compte de jetons n'est pas lu. »
  source : MÈRE l.345 (T-16), l.755 (§12 point 19)
  nature : test · item : DOJO-DUST-RENT-COST-1 (lire le loyer d'un compte de jetons et chiffrer l'attaque par comptes-poussière) · déclencheur : lot
    d'outillage après la première publication
  état : ouvert · suite : une lecture sous le garde et un calcul ; coût publié en interne
- **DJ-L27** · « Jour d'une transaction historique = jour de `blockTime`, estimé et pondéré par le stake ; précision aux bornes non levée. »
  source : MÈRE l.916 ; PR2B l.93 (H-7), l.694 (TY-10)
  nature : recherche · item : DOJO-BLOCKTIME-PRECISION-1 (précision de `blockTime` aux bornes de jour : mesure et littérature du consensus) · déclencheur :
    prochaine course d'historique
  état : ouvert · suite : mesure des transactions à moins de 60 s d'une borne, effet sur les jours
- **DJ-L28** · « La profondeur d'historique servie demain n'est pas prouvée ; la sonde 3 ne la mesure qu'au jour de la mesure. »
  source : MÈRE l.916
  nature : test · item : DOJO-HISTORY-DEPTH-WATCH-1 (sonde de la profondeur servie par les deux opérateurs, rejouée chaque mois) · déclencheur : 2026-11-01,
    puis chaque mois
  état : ouvert · suite : une sonde sous le garde ; écart = arrêt de toute nouvelle course d'historique
- **DJ-L29** · « Battement du flux SOL/USD observé sur un seul échantillon ; la marge de fraîcheur de 165 s en dépend. »
  source : PR2 l.138, l.387 (§9 point 13)
  nature : test · item : DOJO-SOLUSD-HEARTBEAT-SAMPLE-1 (battement du flux SOL/USD sur un échantillon d'au moins sept jours) · déclencheur : première version
    de prix (septième jour compté valide, TU-11)
  état : ouvert · suite : la marge de 165 s revue sur l'échantillon mesuré
- **DJ-L30** · « Collecte compromise : graine connue, donc instants connus ; paquets faux publiés, la signature n'atteste que l'origine. »
  source : PR3 l.171 (TB-1 : résiduel déclaré) ; MÈRE l.261
  nature : recherche · item : DOJO-COLLECT-ATTESTATION-1 (collecte attestée : seconde collecte indépendante ou exécution attestée, coût) · déclencheur : G0 de
    la pièce 2 (MÈRE l.677)
  état : ouvert · suite : état de l'art, prix d'une seconde collecte ; résiduel TB-1 tenu jusque-là
- **DJ-L31** · « Une compromission root de l'hôte expose les deux clés de signature, Bell et Dōjō. »
  source : PR3 l.172 (TB-2 : résiduel root déclaré) ; MÈRE l.249
  nature : recherche · item : DOJO-KEY-SEPARATION-1 (séparer les clés Bell et Dōjō : hôtes distincts ou clé matérielle, coût) · déclencheur : première
    rotation de l'une des deux clés (celle de Bell avant le 2026-12-22)
  état : ouvert · suite : prix chiffré des deux voies, décision de l'investisseur
- **DJ-L32** · « Quatre secrets dans les mêmes sauvegardes du fournisseur : toute restauration vaut exposition. »
  source : PR3 l.89, l.173 (TB-3 : accepté et borné)
  nature : procurement · item : DOJO-BACKUP-SECRET-EXCLUSION-1 (lecture sur place des options de sauvegarde du fournisseur : exclusion ou chiffrement des
    secrets) · déclencheur : 2026-10-31, ou avant la première rotation de clé
  état : décision (TB-3, PR3 l.173) · suite : FAITS daté ; l'acte sur le compte reste celui de l'investisseur
- **DJ-L33** · « Pas de minuterie manqué : jour abstenu ou lecture `missed`, résiduel rendu public. »
  source : PR3 l.177 (TB-7)
  nature : code · item : DOJO-MISSED-READ-RECOVERY-1 (rattraper une lecture manquée dans le jour, sans révéler les instants) · déclencheur : premier `missed`
    dans un jour publié
  état : ouvert · suite : mesure du taux de `missed` sur les jours servis, puis lot
- **DJ-L34** · « Une ancre ajoutée hors de `--anchor` sur une version due arrête durablement l'éditeur ; seul remède, une chronologie neuve. »
  source : PR3 l.413 (C-G2-1, TB-16)
  nature : code · item : DOJO-ANCHOR-OUT-OF-BAND-GUARD-1 (le signataire refuse une ligne d'ancre hors de `--anchor`, avant l'écriture) · déclencheur :
    prochain lot de l'éditeur (avec Q-10 et D3-1, au plus tard 2026-10-09)
  état : ouvert · suite : garde et test rouge à la base ; d'ici là, aucune signature à la main (RUNBOOK §19)

## 4. Limites déclarées puis closes, ou tranchées par décision

- **DJ-L150** · « Forme de `getProgramAccounts`, nombre de comptes, propriétaires du pool et du verrou : NON CONFIRMÉS. »
  source : MÈRE l.19, l.72, l.207, l.218, l.229, l.737-742
  nature : test · item : SNAPSHOT-PROBE-1 · déclencheur : avant le G1 de PR-2
  état : clos (preuve : FAITS `docs/dojo/FAITS-probe-12-2026-09-27.md`, MÈRE l.657 ; N = 1 144) · suite : aucune
- **DJ-L151** · « Extensions Token-2022 du mint non vérifiées. »
  source : MÈRE l.61-62, l.739, l.913 ; PR2B l.493
  nature : test · item : DOJO-MINT-EXTENSIONS-1 · déclencheur : celui de SNAPSHOT-PROBE-1 (a)
  état : clos (preuve : FAITS probe-12, PR2 l.54, l.326 ; contrôle exact `checkMint`, MÈRE l.1205) · suite : aucune
- **DJ-L152** · « Faits de l'historique (jour 1, profondeur servie, méta des soldes, tables d'adresses, version, volume) NON CONFIRMÉS. »
  source : MÈRE l.32, l.63, l.315-317, l.763-770
  nature : test · item : SNAPSHOT-PROBE-3, FAITS-SOLANA-HISTORY-1, FAITS-TOKEN-CREATION-1 · déclencheur : avant le G1 de PR-2b
  état : clos (preuve : FAITS-probe-3 sha256 `de96f092…`, commit `0bd74f4`, MÈRE l.902, l.919) · suite : voir DJ-L27, DJ-L28
- **DJ-L153** · « Formule du prix du pool et source SOL/USD non établies. »
  source : MÈRE l.299-303, l.752-753
  nature : procurement · item : FAITS-SOL-USD-SOURCE-1, SNAPSHOT-PROBE-2 · déclencheur : avant le G1 de PR-2
  état : clos (preuve : FAITS `docs/dojo/FAITS-pr2-lectures-2026-09-27.md`, sha256 `3b86f76b…`, MÈRE l.658, l.663) · suite : aucune
- **DJ-L154** · « Définition de l'arbre de RFC 6962 non relue. »
  source : MÈRE l.21, l.230, l.744
  nature : procurement · item : FAITS-RFC6962-1 · déclencheur : avant le G1 de PR-1a
  état : clos, preuve à citer (« déjà lu pour PR-1a », PR4 l.219, sans chemin ni sha256) · suite : citer le FAITS
- **DJ-L155** · « Adresses de programme hors courbe et verdict de référence `is_on_curve` non lus. »
  source : MÈRE l.219-220, l.743, l.754
  nature : procurement · item : FAITS-SOLANA-PDA-TOKEN2022-1 · déclencheur : avant les G1 de PR-1a et de PR-2
  état : clos, preuve à citer (critère : « FAITS PR-1a §2 », MÈRE l.687 ; requête : FAITS PR-2 §2, MÈRE l.672) · suite : citer
- **DJ-L156** · « Des points d'ordre faible de la courbe seraient classés `holder`. »
  source : MÈRE l.687
  nature : test · item : DOJO-LOW-ORDER-POINTS-1 · déclencheur : avant le G1 de PR-2
  état : clos (preuve : mesure sur les réponses de la sonde, 0 sur 1 110, PR2 l.66, l.325) · suite : aucune
- **DJ-L157** · « L'opérateur peut choisir les instants par essais de graine à l'ancrage. »
  source : MÈRE l.201, l.339 (T-10), l.819 (C-2)
  nature : recherche · item : DOJO-RANDOMNESS-1 · déclencheur : avant le G1 de PR-2
  état : clos (preuve : rapport `a8686e58…`, forme (ii), décision 248, MÈRE l.676) · suite : résiduel restant en DJ-L20
- **DJ-L158** · « Aucune forme mesurée de rétention ou de récupération des points vendus ne garde l'invariance ; M6 n'est pas une preuve d'impossibilité. »
  source : MÈRE l.140, l.759, l.762, l.667
  nature : recherche · item : DOJO-EXIT-RETENTION-1 · déclencheur : aucun (clos)
  état : décision (228 : aucune récupération, MÈRE l.667) · suite : réouverture sur décision nouvelle et M6 bis rejouée
- **DJ-L159** · « La valeur d'un jour rétroactif dépend de l'ordre d'un bloc pour une adresse à plusieurs comptes. »
  source : PR2B l.163-167, l.726
  nature : code · item : ADR-SNAPSHOT-D18-ORDER-1 · déclencheur : pli de la mère
  état : clos (preuve : rapport CP1D `4fa57831…`, sixième pli, MÈRE l.925, l.930) · suite : règle en DJ-L14
- **DJ-L160** · « Une transaction en échec pourrait changer un solde de jeton. »
  source : PR2B l.756-758 (Q-6)
  nature : procurement · item : FAITS-SOLANA-ATOMICITY-1 · déclencheur : aucun (clos)
  état : clos (preuve : lecture L-3, `docs/dojo/FAITS-cp1d-lectures-2026-09-26.md`, blob `598a43e5…`, PR2B l.733, l.896) · suite : aucune
- **DJ-L161** · « Un `snapshot` engagé que le vérificateur refuse est irréversible ; une ancre neuve ne le répare pas. »
  source : PR3 l.359, l.396
  nature : code · item : DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1 (PAROXYSME) · déclencheur : avant A-8
  état : clos (preuve : fusion `bd4ed3aa`, oracle G7 `34a33138…`, PR3 l.423-424) · suite : aucune
- **DJ-L162** · « Un arrêt entre un `snapshot` et sa `price_version` laisse une version due. »
  source : PR3 l.360 ; PR1B5 l.170 (TY-8)
  nature : code · item : DOJO-PUBLISH-PV-ATOMIC-1 (PAROXYSME) · déclencheur : avant A-10
  état : clos (preuve : fusion `bd4ed3aa`, oracle G7 `34a33138…`, PR3 l.423-424) · suite : aucune
- **DJ-L163** · « Une version de prix retardée, décalée ou sautée est admise par le marcheur. »
  source : PR3 l.354 (TB-18), l.363, l.369
  nature : code · item : DOJO-VERIFY-PV-SCHEDULE-1 (PAROXYSME) · déclencheur : avant A-10
  état : clos (preuve : fusion `251b8802`, oracle G7 `633df3dc…`, PR1B5 l.246-247) · suite : aucune
- **DJ-L164** · « Le processus qui tient la clé chargerait du code réseau par le cœur du vérificateur. »
  source : PR3 l.362, l.374 ; PR1B5 l.167 (TY-5)
  nature : code · item : DOJO-VERIFY-CORE-NO-NET-1 · déclencheur : avant le G1 de PR-3a-1c
  état : clos (preuve : fusion `b5286fbc`, oracle G7 `cd60126b…`, PR1B5 l.260-262, l.267) · suite : voir DJ-L99
- **DJ-L165** · « Un second écrivain sous `--state` remplace une ligne servie. »
  source : PR3 l.290, l.349 (TB-13), l.366 ; code : `apps/dojo/scripts/dojo-publish.mjs` l.390-392 à `d1120612`
  nature : code · item : DOJO-PUBLISH-SINGLE-WRITER-1 (PAROXYSME) · déclencheur : avant A-10
  état : clos (preuve : partie 1 réunie à `1b57566c`, ETAT l.45, l.50 ; checkpoint-2 `3bc97433…`, ETAT l.89) · suite : aucune
- **DJ-L166** · « La lecture du corps d'une réponse n'est bornée par aucun délai ; `TimeoutStartSec` est la seule borne de la course. »
  source : PR3 l.220 ; code : `apps/dojo/src/collect.ts` l.131 à `d1120612`
  nature : code · item : RPC-GUARD-BODY-TIMEOUT-1 (PAROXYSME) · déclencheur : avant A-9 (7) (PR3 l.434)
  état : clos (preuve : partie 1 réunie à `1b57566c`, ETAT l.45, l.52 ; checkpoint-2 `3bc97433…`, ETAT l.89) · suite : voir DJ-L80
- **DJ-L167** · « Les verrous de la course en vol ne sont pas rendus sur SIGTERM. »
  source : PR3 l.217, l.278 ; code : `apps/dojo/src/collect.ts` l.9, l.292 à `d1120612`
  nature : code · item : DOJO-COLLECT-SIGTERM-UNLOCK-1 · déclencheur : G1 de DRAND-1b, avant A-5
  état : clos (preuve : partie 1 réunie à `1b57566c`, ETAT l.45, l.51 ; checkpoint-2 `3bc97433…`, ETAT l.89) · suite : DJ-L69
- **DJ-L168** · « Une copie du secret hors du dossier de la graine échappe au test boîte noire de `dojo-seed.mjs`. »
  source : PR3 l.224, l.228 ; code : `test/dojo-collect-deploy.test.ts` l.347 à `d1120612`
  nature : test · item : DOJO-SEED-FS-TRACE-1 (PAROXYSME) · déclencheur : avant A-4
  état : clos, preuve à citer (code présent ; clôture non écrite dans les entrées) · suite : citer le G7 qui l'a fusionné
- **DJ-L169** · « Un `.tmp` orphelin après une panne rend le jour illisible (`layout_stray_file`). »
  source : PR2 l.341, l.517 ; PR1B4 l.188 ; PR3 l.284 ; code : `apps/dojo/test/dojo-collect.test.ts` l.587 à `d1120612`
  nature : code · item : DOJO-TMP-STRAY-1 · déclencheur : G1 de DRAND-1b, avant A-5
  état : clos, preuve à citer (mesure par test au code ; clôture non écrite) · suite : citer le G7
- **DJ-L170** · « Aucun test ne rejoue verrou, `unlock` et pas suivant sur l'arbre de collecte. »
  source : PR3 l.281 ; code : `test/dojo-collect-deploy.test.ts` l.315 à `d1120612`
  nature : test · item : DOJO-UNLOCK-CHAIN-TEST-1 · déclencheur : prochain lot touchant le collecteur
  état : clos, preuve à citer (test présent ; clôture non écrite) · suite : citer le G7
- **DJ-L171** · « Les bornes de l'historique ne sont évaluées qu'en fin de phase B : la course continue après une faute certaine. »
  source : PR2B l.740, l.996 ; code : `apps/dojo/src/history-collect.ts` l.16 à `d1120612`
  nature : code · item : DOJO-HISTORY-EARLY-BOUNDS-1 · déclencheur : G1 de PR-2b-4
  état : clos, preuve à citer (code présent ; clôture non écrite) · suite : citer le G7
- **DJ-L172** · « La clé Helius est ajoutée à l'URL sans contrôle d'hôte. »
  source : MÈRE l.688 ; PR2B l.491, l.723 ; code : `packages/rpc-guard/src/guarded.ts` l.32 à `d1120612`
  nature : code · item : RPC-GUARD-HELIUS-HOST-1 · déclencheur : prochain lot rpc-guard
  état : clos, preuve à citer (code présent ; clôture non écrite) · suite : citer le G7
- **DJ-L173** · « La reprise d'un grand livre neuf sans tête est refusée. »
  source : PR3 l.218, l.434 ; ETAT l.187
  nature : code · item : RPC-GUARD-FIRST-APPEND-HEAD-1 · déclencheur : avant A-9 (7)
  état : clos, preuve à citer (« fait », test `packages/rpc-guard/test/first-append.test.ts`, ETAT l.187) · suite : citer le G7
- **DJ-L174** · « Les bornes de la relecture du site pourraient diverger de celles du vérificateur. »
  source : PR1B4 l.191 ; PR4 l.306, l.316
  nature : test · item : DOJO-LIVE-BOUNDS-KEYS-1 · déclencheur : G0 de PR-4c-1
  état : clos (preuve : fusion `3911be76`, oracle G7 `62a1180e…`, PR4 l.382-383) · suite : aucune
- **DJ-L175** · « Ce que `fetch` applique par défaut à TLS n'est pas lu. »
  source : PR1B4 l.168 (TY-4), l.192, l.205
  nature : procurement · item : FAITS-NODE-FETCH-TLS-1 (PAROXYSME) · déclencheur : G1 de PR-3b-2
  état : clos (preuve : `docs/dojo/FAITS-node-fetch-tls-2026-09-30.md`, `cc3d747a`, sha256 `7de80c82…`, PR1B4 l.236) · suite : DJ-L11
- **DJ-L176** · « La publication serait visible avant l'annonce. »
  source : PR3 l.181 (TB-11) ; MÈRE l.1342 (QI-4)
  nature : code · item : QI-4 · déclencheur : aucun (tranché)
  état : décision (300 : page servie dès le premier `snapshot`, PR3 l.442 ; A-1 fait, ETAT l.285) · suite : aucune
- **DJ-L177** · « Une course Bell qui tient le verrou fait perdre une lecture. »
  source : PR2 l.298 (TY-4), l.385 (§9 point 11) ; PR3 l.79
  nature : code · item : QI-2 · déclencheur : aucun (tranché)
  état : décision (254 : collecte sur l'hôte Bell, collision disparue, PR3 l.79, l.274) · suite : aucune
- **DJ-L178** · « Production sans relais de la balise tant que DRAND-RELAY-GET-1 manque. »
  source : PR2 l.513 ; code : `apps/dojo/src/collect.ts` l.8, `packages/rpc-guard/src/index.ts` l.21 à `d1120612`
  nature : code · item : DRAND-RELAY-GET-1 · déclencheur : avant le G1 de PR-2-2
  état : clos (preuve : relais par le garde réunis à `1b57566c`, ETAT l.51 ; checkpoint-2 `3bc97433…`, ETAT l.89) · suite : aucune
- **DJ-L179** · « Éditeur absent : la composition servie complète n'est pas prouvée. »
  source : PR2 l.236 ; PR2B l.549
  nature : test · item : TU-1c (tuyau formé, PR2 l.331) · déclencheur : G7 de PR-3a
  état : clos (preuve : TU-1c composé en test, fusion `948d74c2`, PR3 l.394-395) · suite : aucune
- **DJ-L180** · « La garde de `DojoSentence` n'est exécutée par aucun test. »
  source : PR4 l.221, l.321
  nature : test · item : DOJO-FIGURES-GUARD-TEST-1 · déclencheur : G1 de PR-4c-1b
  état : clos (preuve : fusion `b8d18877`, oracle G7 `56c5cb90…`, PR4 l.392) · suite : aucune
- **DJ-L181** · « Trois lacunes du marcheur : version sur jours d'historique, historique avant l'ancre, ancre sur un jour publié. »
  source : MÈRE l.692
  nature : code · item : DOJO-WALK-GAPS-1 · déclencheur : mission de PR-1b-2
  état : clos (preuve : rapport du checkpoint-2 `8014339f…`, gel `f5214f6`, MÈRE l.1011) · suite : aucune
- **DJ-L182** · « Le comparateur de la borne de profondeur du chargeur n'est épinglé par aucun test ; trois commentaires faux. »
  source : ETAT l.76-80
  nature : test · item : DEPTH-CORR (C-1, C-2 du G2 DEPTH-BOUND) · déclencheur : avant la fusion de la partie 1
  état : clos (preuve : `e6b52de6`, checkpoint-2 ciblé `206bc5e3…`, ETAT l.201) · suite : aucune
- **DJ-L183** · « Le test de la vraie unité de collecte rougit environ 1,5 % du temps près de la fin du jour. »
  source : ETAT l.44, l.62 ; code : `test/dojo-collect-deploy.test.ts` l.327 à `d1120612`
  nature : test · item : DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1 · déclencheur : inspection de la partie 1
  état : clos (preuve : corrigé à l'inspection, checkpoint-2 `3bc97433…`, ETAT l.62, l.89) · suite : aucune
- **DJ-L184** · « Le paquet d'historique écrit ses trois contrôles à `pass` sans condition ; seule garde, la composition du collecteur. »
  source : PR2B l.553, l.738, l.958
  nature : code · item : DOJO-HISTORY-CHECKS-COMPOSITION-1 · déclencheur : G1 de PR-2b-3 ; G7 de PR-2b-4
  état : clos (preuve : fusion `59adcfb5` du G7 de PR-2b-4, PR2B l.992) · suite : aucune
- **DJ-L185** · « Le marcheur admet un jour d'effet postérieur au lendemain de la fenêtre. »
  source : PR2 l.503 (C-V-1) ; MÈRE l.307
  nature : code · item : DOJO-VERSION-EFFECT-DAY-1 · déclencheur : pli de la mère qui amende D-17
  état : clos, preuve à citer (règle N1 au vérificateur, MÈRE l.307 ; clôture de l'item non écrite) · suite : citer
- **DJ-L186** · « Le site pouvait composer un chiffre que `dojo-verify` refuse. »
  source : PR4 l.120, l.149, l.244, l.261
  nature : code · item : DOJO-SERVED-WINDOWS-1, DOJO-SERVED-VERIFIED-FIGURES-1 · déclencheur : PR-4a-1 et PR-4a-2
  état : clos (preuve : rapport du checkpoint-2 de PR-4a-1 `93832675…`, PR4 l.246 ; fusion `52e07d56`, PR4 l.248) · suite : aucune

## 5. Couverture des marques PAROXYSME des entrées (Review Focus 2)

Chaque ligne d'entrée qui porte le mot PAROXYSME (`grep -n -i paroxy` sur les neuf entrées à `eb3ee3ec` : 34 lignes, MÈRE n'en porte aucune) :

- DOCTRINE l.8 (chemin d'un avis) · l.21 (registres Narabi et Ukemi) · l.24 (nature Dr, mandat : sans objet pour la pièce 1) : sans item Dōjō.
- DOCTRINE l.28 : nature Tiers, appliquée (§0) · l.33 : les registres PAROXYSME restent dans `docs/**`, non exporté (ce fichier aussi).
- ETAT l.297 : PAROXYSME-DOJO-FILE-1 = ce registre · ETAT l.300 : DJ-L112.
- PR1B4 l.190 : DJ-L97 · l.192 : DJ-L175 (et DJ-L11).
- PR1B5 l.166 et l.187 : DJ-L96 · l.252 : DJ-L98 · l.265 : DJ-L100 · l.266 : DJ-L99.
- PR2 l.513 : registre dû à la clôture de phase, sans item : ce fichier.
- PR2B l.975 : règle « rien de testable à bas prix ne reste non testé » (Q-9) ; trois voies testées aux corrections, sans item.
- PR3 l.219 : DJ-L68 · l.220 : DJ-L166 · l.221 : DJ-L66 · l.224 : DJ-L168 · l.228 : DJ-L166, DJ-L66, DJ-L168, DJ-L68.
- PR3 l.276 : DJ-L67 · l.290 : DJ-L165, DJ-L51, DJ-L52, DJ-L104 · l.359 : DJ-L161 · l.360 : DJ-L162 · l.361 : DJ-L53.
- PR3 l.364 : DJ-L95 · l.369 : DJ-L161, DJ-L162, DJ-L53, DJ-L95, DJ-L163 · l.395 : DJ-L161, DJ-L162.
- PR4 l.244 : forme (B) « décidée PAROXYSME » : DJ-L186 · l.378 : TY-9, TY-11, TY-13 : DJ-L110, DJ-L43, DJ-L111.
- PR4 l.384 : DJ-L101 · l.385 : consignes du G0 de PR-4c-1b, sans item, tenues au G7 `b8d18877` (PR4 l.392).
- PR4 l.398 : DJ-L112 (deux items), DJ-L113, DJ-L101, DJ-L114.

## 6. Sources lues (empreintes recalculées le 2026-10-02)

| Fichier | Lignes | sha256 |
|---|---|---|
| `docs/DOCTRINE.md` | 46 | `53319a2c0d007b19bca505d6b981400b567defffdc6d92a742f590da50d008b0` |
| `docs/ETAT.md` | 302 | `83e4b28af9843c70e12f0313215e3c8d1406f1ab3d35527bb227bbd28e3e9e4b` |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | 1 367 | `cd976054b22837b0aeef1d50fdafcd360f768b7c97a4241e583a2ee6769111ec` |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | 247 | `ffc7e139be26997b2c6dfc925f2ccc65b6d1e39f26772c88ac20bdc0eb2853da` |
| `docs/adr/ADR-DOJO-PR-1B-5.md` | 270 | `c822f03905ee6369aff632188c68a46b7eac508aa5655098647aa75c07dca0e7` |
| `docs/adr/ADR-DOJO-PR-2.md` | 517 | `268f2f099dc10a6f43920817ce28818e0fb2cb3579961eb03943865771bba870` |
| `docs/adr/ADR-DOJO-PR-2B.md` | 1 003 | `222c13251a067412c08a9424c3be1faebf1c9f4222c27ce6b07e6965e1b816cb` |
| `docs/adr/ADR-DOJO-PR-3.md` | 442 | `e13d6784eb337dc18e4d94e4e311dc2deb2c116715bbe98b149293a1de2184a6` |
| `docs/adr/ADR-DOJO-PR-4.md` | 400 | `b71297be12c43868cdfc2557e855caaea09ec9766ec3ac3ae61e1d8b53e138e3` |
| COPY à `d1120612` (blob `b97873b7`) | 112 | `a4c9302ac29f77ea6972e09cede86c27334ee1764d5269cb455b19815fe2da76` |
| PAGE à `d1120612` (blob `d18ce65b`) | 47 | blob git cité, lu par `git show` |
