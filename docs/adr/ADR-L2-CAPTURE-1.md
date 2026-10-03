# ADR-L2-CAPTURE-1 : enregistrement vers l'avant du carnet spot et des flux qui ne se rattrapent pas (chantier L2, G0, sans code)

- **Second pli, 2026-10-03, de 19:32 à 20:02 UTC** (`date -u`) : checkpoint-1 du validateur-humain `claude-fable-5-1`, verdict
  ACCEPTE-AVEC-CORRECTIONS, corrections C-1 à C-8 ([V]) ; décisions de l'orchestrateur du 2026-10-03 sur Q-2, Q-6, Q-9, Q-10, Q-12,
  Q-17, Q-18, Q-20, Q-21 et Q-23 ([O]) ; reçus dans la mission du second pli, pliés sur la version `a9b560f8…` par un worker
  `claude-opus-5-5` (effort max, instance fraîche) ; correction par correction : `F:/tmp/rech/l2/adr/PLI-2.md`. Neufs : §6.1 MAST
  (C-1), D-24 à D-27 (C-2, C-4, C-8, C-5), L2-REGION-LOCAL-1 (C-3), L2-REAL-REPLAY-1 (C-4) ; D-23 étendue ; dix questions closes par
  [O] (§8). Hors checkpoint : huit renvois « [R] l.35 » corrigés en « [R] l.20 », ligne de la décision 300 dans [R] (l.35 est sa
  ligne dans la copie de [Mi]).
- **Provenance de [F] (C-6)** : le lecteur de [F] est le siège d'orchestrateur, tenu par `claude-opus-5-5` sur décision de
  l'investisseur du 2026-10-03 vers 04:2x UTC, verbatim : « fais avec OPUS 5.5 comme orchestrateur pour la suite. » ; ligne datée de
  l'orchestrateur, [F] l.132-136 (ajout de 19:32 UTC, commit `92e19698`), qui renvoie au HANDOFF du tronc, [H] l.437.
- **Décisions de périmètre ou de dépense (C-7)** : aucune n'est répondue par « ok go, enchaîne tout ». Fondateur : Q-3, Q-4, Q-16,
  Q-19 ; investisseur : Q-7, Q-11, Q-13, Q-14, Q-15, Q-22 (avec C-3 : L2-REGION-LOCAL-1). Closes AVANT le plan de P1 : Q-3, Q-4,
  Q-19 (fondateur) ; Q-2, Q-17, Q-20, Q-21, Q-23 (orchestrateur, closes par [O]) ; Q-5 (RECHERCHES et fondateur, après
  FAITS-L2-ACCESS-2 (c)). Réponses du fondateur et de l'investisseur : inscrites par l'orchestrateur le 2026-10-03 à 20:04 UTC, bloc
  suivant ; §8 garde les questions telles que posées.
- **Réponses du fondateur et investisseur (2026-10-03, de 19:33 à 19:39 UTC, outil de questions de la session, choix verbatim** :
  `F:/tmp/rech/l2/adr/REPONSES-INVESTISSEUR.md`) : Q-3, quatre parties ; Q-4, instantanés par minute dès P1 ; Q-19, liquidations
  dès P1 ; Q-16, fichiers publics admis pour la recherche seulement, jamais servis ni publiés (licence CC BY-NC-SA, [F] section 4) ;
  Q-22, go de M-1 sur le poste local, en France, hors de la liste du 5 janvier 2026 : L2-REGION-LOCAL-1 clos ; Q-7, M-1 mesure les
  quatre symboles, décision sur chiffres ; Q-11, quota fixé après M-1 (alarme à 70 %, arrêt propre à 85 %, chiffres soumis) ;
  Q-13 et Q-14, copie à chaque scellé tirée depuis le poste et vérifiée par sha256, rien supprimé sur l'hôte sans son accord ;
  Q-15, second hôte décidé après P3, sur chiffres, rien acheté sans son accord. Restent ouvertes : Q-5 (après FAITS-L2-ACCESS-2)
  et Q-8 (après M-1).
- **Q-5 close (2026-10-03, 20:53 UTC)** : microsecondes, choix du fondateur (vers 20:38 UTC) et accord de RECHERCHES
  (`coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-Q-5-temoins-et-CM-2.md`), à quatre conditions reprises par le plan de P1 :
  (1) l unité écrite dans chaque manifeste (`time_unit: "us"`), jamais déduite d une grandeur ; (2) horodatages gardés en entiers
  tels que reçus, jamais en flottant ; (3) heure de réception locale dans la même unité, nommée à part de l heure de la place ;
  (4) pour les fichiers publics (recherche seulement), la frontière d unité (spot en microsecondes depuis le 2025-01-01) écrite fichier
  par fichier au manifeste d import, avec un contrôle croisé de grandeur qui arrête l import en cas de contradiction.
- **Cinq parties (2026-10-03, 21:33 UTC)** : sur le plan de P1 (`docs/G0-partie-l2-p1.md`, 12 lots, Q-P1-11), le fondateur et investisseur
  a choisi « Couper après b2 (Recommandé) » : P1 (capture brute et chaîne), P1-bis (scellé, rejeu, instantanés, commande), P2, P3, P4.
  Carte des tuyaux après la coupe (correction C-2 du cp-1 bref du plan de P1, inscrite le 2026-10-03 à partir de 21:57 UTC ; même
  carte, détaillée, au bloc de décisions datées du plan) : P1 (lots a1 à b2, 1 642 à 2 074 lignes estimées) porte TL-2 et TL-6
  complets, les trois assertions FM-2.6 de TL-1 (`l2_capture_raw_as_served`), `l2_write_tail_marked`, `l2_backpressure_named_stop`,
  la capture brute de `/market` (`l2_market_link_futures_watchdog`) et le test de la condition (3) de Q-5 ; P1-bis (lots c1 à c6,
  1 629 à 1 973 lignes estimées) porte TL-1 complet (`l2_capture_record_seal_replay`), TL-3, TL-4, TL-5, TL-7a, les tests des trois
  limites de FAITS-L2-ACCESS-2 (L2-TRADE-ID-CONSEC-1, L2-BOOKTICKER-U-1, L2-LIQ-DEDUP-1), ceux du délai de grâce (Q-10) et ceux
  des conditions (1) et (2) de Q-5. Re-datés « G7 de P1-bis » : le test de L2-BOOKTICKER-GAP-1, le « au plus tard » de
  L2-TRADES-BACKFILL-1 (§7) et le délai de grâce (§2.3, « Jour et scellé »). Le G7 de P1 déclare « scellé et rejeu non exécutés,
  pièce upcoming » (D-14, D-25). Se lit au pli, posé en Q-P1-12 du plan : la commande et la boucle d'enregistrement (lots c4, c5)
  n'existant qu'en P1-bis, la sortie de P1 de §4 (relecture de RECHERCHES, puis M-1) et les prérequis « G7 de P1 » de M-1 (§2.1,
  §5, Q-22) et de P3 (§4) se lisent « de P1-bis ».
- **Pli du cp-1 bref du plan de P1 (2026-10-03, à partir de 21:57 UTC, `date -u`)** : checkpoint-1 bref du validateur-humain
  `claude-fable-5-1`, ACCEPTE-AVEC-CORRECTIONS, C-1 à C-6 (`F:/tmp/cp1-l2-p1/RAPPORT-cp1-bref-L2-P1-2026-10-03.md`, sha256
  `68a95082ab40bfbfad06bc38bc21dd87eb74931b52d04d78a4f6d81e8b0d2a6f`) ; C-1 et C-2 pliés ici par un worker `claude-opus-5-5`
  (effort max, instance fraîche) : carte ci-dessus (C-2), trois lignes datées ci-dessous (C-1) ; C-3 à C-6 dans le plan ;
  correction par correction : `F:/tmp/rech/l2/p1plan/PLI-CP1.md`.
- **Lecture de §3 et §4 (Q-P1-2 ; orchestrateur, 2026-10-03, 21:33 UTC ; inscrite au pli, C-1)** : chaque test de composition est
  écrit dans le lot où sa composition est complète ; les parties que §3 donne aux tests TL (« P1-a », « P1-b », « P1-c ») et les
  lots P1-a à P1-c de §4 se lisent par la répartition du plan de P1 (§8.2) : TL-1, ses trois assertions FM-2.6 en a3
  (`l2_capture_raw_as_served`), `l2_write_tail_marked` en a2, `l2_backpressure_named_stop` en a3, `l2_capture_record_seal_replay`
  en c6 ; TL-2 en b2 ; TL-3 en c2 ; TL-4, `l2_bookticker_day_rule` en c1 et `l2_replay_byte_identical` en c6 ; TL-5 en c2 ; TL-6,
  `l2_half_open_watchdog_named` en a3 et `l2_overlap_switch_no_gap` en b2 (part brute `l2_overlap_planned_raw` en a4) ; TL-7a,
  `l2_forceorder_record_replay` en c6 (liaison `/market` en a4).
- **Lecture de D-7 (Q-P1-5 ; orchestrateur, 2026-10-03, 21:33 UTC ; inscrite au pli, C-1)** : « trames texte telles que reçues » se
  lit « messages texte tels que le client WebSocket embarqué (D-15) les délivre » : fragments réassemblés, UTF-8 décodé (invalide :
  liaison coupée en 1007), BOM de tête retiré, décompressés si `permessage-deflate` est négocié ; pas les octets du fil ; extensions
  négociées journalisées ; un message non compressé est tenu par le client jusqu'à 2^31 octets avant toute borne de l'enregistreur.
  Limite et construction visée (client propre sur `node:tls`) : item L2-OWN-WS-CLIENT-1 (plan de P1, §10 ; mesures L-1 et L-3) ;
  déclencheur : rapport de M-1.
- **Amendement daté de D-20 (Q-P1-9 ; orchestrateur, 2026-10-03, 21:33 UTC ; inscrit au pli, C-1)** : la suite canonique d'un flux
  et d'un jour (§2.3, « Empreintes canoniques ») garde chaque charge une fois par ses octets exacts, ordonnée par (clé, octets), au
  lieu de « une fois par clé », « ordonnées par clé » ; deux charges de même clé aux octets différents y restent deux entrées,
  nommées au manifeste, jamais fondues ; `@forceOrder`, sans clé documentée (FAITS-L2-FUTURES-2 (c)), s'y ordonne par ses octets.
  Motif : aucune unicité non documentée n'est supposée (L2-TRADE-ID-CONSEC-1, L2-BOOKTICKER-U-1 ; FAITS-L2-ACCESS-2 (f), (j)).
  Tests et contre-mesures : plan de P1, §9. À signaler à RECHERCHES à sa relecture (D-6).
- **Pli de l'avis [Ad], 2026-10-03, de 19:01 à 19:21 UTC** (`date -u`) : avis de l'advisor `claude-fable-5-1` (effort medium, contexte
  frais, lecture seule ; un conseil, jamais un verdict) sur la version sha256 `969a730d…` de cette ADR, points 1 à 13 (bloquants 1 et 2,
  importants 3 à 9, mineurs 10 à 13), tous pliés par un worker `claude-opus-5-5` (effort max, instance fraîche) ; point par point :
  `F:/tmp/rech/l2/adr/PLI.md`. D-7, D-9, D-10 et D-12 réécrites, D-2 à D-4 annotées, D-17 à D-23 neuves ; Q-9, Q-12 et Q-19 mises à
  jour, Q-20 à Q-23 neuves ; items : 5 neufs, 6 mis à jour. Hors avis : l'ajout daté de [F] (l.125-130, commit `dfdd7e3b` de
  l'orchestrateur, lu à 19:11 UTC) répond à Q-1, reporté en place ; « plan de P1-a, P1-b » de [Ad] lu « plan de P1 » ([R] l.20).
- **Statut** : accepté le 2026-10-03. Circuit de la décision 300 ([R] l.20) : avis de l'advisor marché rendu ([Av], un conseil, jamais un verdict) ;
  avis de l'advisor sur cette ADR rendu et plié ([Ad]) ; checkpoint-1 du validateur-humain rendu, ACCEPTE-AVEC-CORRECTIONS, et plié
  ([V], second pli) ; validation du fondateur et investisseur DONNÉE le 2026-10-03 vers 19:39 UTC, verbatim
  « ok, publie-la quand le pli est fini / je valide » ; le code part après le plan de P1 et son cp-1 bref (D-24).
- **Dates** : rédaction le 2026-10-03, ouverture à 18:09:35 UTC, texte écrit à 18:32 UTC, dernière retouche à 18:40 UTC (`date -u`) ;
  pli de [Ad] ensuite (ligne de pli) ; second pli de [V] et [O] ensuite (ligne de second pli) ; contrôles après chacun (heures :
  `REPONSE.md`, `PLI.md`, `PLI-2.md`) ; approbation : à venir.
- **Rédaction** : worker `claude-opus-5-5` (modèle déclaré à l'ouverture, R-1), effort max, contexte frais. Mission de l'orchestrateur
  `F:/tmp/rech/l2/adr/mission.md` ([Mi]) ; porte de lancement verte (`F:/tmp/rech/l2/adr/mission.recu.json`, 2026-10-03T18:09:04Z).
  Pli, puis second pli : deux autres instances `claude-opus-5-5`, effort max, contexte frais chacune, sous le Cadre de [Mi] l.37.
- **Base lue** : worktree `F:/Monark-wt-l2adr`, branche `lot/l2-adr`, base `c2787443`, HEAD `61d69216` (FAITS commis), arbre propre à
  l'ouverture. Aucun réseau, aucun appel à la place, aucun git écrivant (plis compris). Au pli : HEAD `dfdd7e3b` (ajout daté de [F]
  l.125-130 ; [F] l.1-124 identiques à l'octet, sha256 `600e6a3d…`), seul ce fichier non suivi. Au second pli : HEAD `92e19698`
  ([F] l.131-136 ajoutées, C-6 ; [F] l.1-130 identiques à l'octet, sha256 `5004b1d3…`), seul ce fichier non suivi.
- **Propriétaires** : orchestrateur (D-1 à D-6, [Mi] l.43-48 ; réponses [O]) ; investisseur (go, pays de l'hôte et du poste local,
  dépenses, suppressions) ; fondateur (validation de cette ADR) ; validateur-humain (checkpoint-1 [V] ; cp-1 bref du plan de P1,
  D-24) ; RECHERCHES (relecture de l'enregistreur, D-6).
- **Gate concerné** : G0 du chantier (doc 02), sous la méthode par parties ([R] l.20).
- **Éléments affectés** (noms fixés par les plans des parties) : un enregistreur neuf sous `scripts/`, ses tests sous `test/`, une unité
  sous `deploy/`, un mode d'emploi, des FAITS sous `docs/marche/`, les items du chantier L2 de `docs/ETAT.md` ([E] l.459-462).
- **Rattachement** : go de l'investisseur du 2026-10-03 ([Pl] l.10 ; [Mi] l.37) ; items RECORDER-L2-1, RECORDER-LIQ-1, RECORDER-OI-1,
  RECORDER-EXCHINFO-1, RECORDER-L2-REGION-2 ([Pl] l.41-47 ; [E] l.459-462) ; faits lus sur place [F].
- **Lecture** : `[X] l.N` renvoie à la ligne N de la source X ; sources, empreintes et niveaux en §11. Aucune valeur de marché, aucune
  adresse d'hôte : les points d'accès de la place sont cités par leur ligne de [F].

## 0. Décisions, une ligne chacune

D-1 à D-6 sont les décisions de l'orchestrateur ([Mi] l.43-48), appliquées ; D-7 à D-23 ont été proposées au checkpoint-1 (D-7, D-9,
D-10 et D-12 réécrites au pli de [Ad] ; D-17 à D-23 neuves), rendu ACCEPTE-AVEC-CORRECTIONS ([V]) ; D-24 à D-27 naissent de ses
corrections (second pli) ; « Q-n close » renvoie à une réponse de l'orchestrateur ([O], §8).

- **D-1** : une ADR de chantier, quatre parties (§4, Q-3), chacune plan, G2 neuve, revue et G7 ; aucun code avant cp-1 et fondateur.
- **D-2** : partie 1 = écrivain de capture brute : carnet spot reconstruit, meilleur prix, transactions, quatre symboles (liquidations : D-12).
- **D-3** : brut écrit avant toute lecture ; un dossier par symbole et par jour UTC de la place ; manifeste neuf, `missing.json`, `SHA256SUMS`.
  Lecture : D-17 (Q-20 close).
- **D-4** : serveur du site sous limites et quota propre, jamais l'hôte du Dōjō ; aucun appel avant la réponse sur le pays (Q-1, reçue :
  [F] l.128-130).
- **D-5** : les dix points d'intégrité de l'audit, reconnexion avant 24 h et sur `serverShutdown`, limites de [F] §1 à §3.
- **D-6** : RECHERCHES relit chaque sha de l'enregistreur avant son premier appel ; un jour n'est admis que si cette relecture passe.
- **D-7** : brut = trames texte telles que reçues, séparées par LF, une suite par connexion coupée en segments à heure fixe de l'horloge
  de l'hôte, jamais sur le contenu ; index de réception à côté, sa ligne écrite après la trame ; aucune heure ni métadonnée dans les trames.
- **D-8** : reconnexion planifiée en chevauchement : la nouvelle connexion est suivie avant la fermeture de l'ancienne.
- **D-9** : une ancre REST par symbole dans la dernière minute du jour D-1, rangée dans les deux dossiers : parité de D-1, départ du rejeu
  de D (Q-12 close : rejeu autonome) ; ancres des symboles décalées entre elles.
- **D-10** : instantané par minute = carnet reconstruit à l'heure de place t ; niveaux à ±100 pb du milieu jugés en entiers exacts, à
  l'échelle décimale du jour figée au manifeste.
- **D-11** : tout fichier dérivé se reconstruit à l'octet hors ligne depuis le seul brut (`--from-raw`), comme les bougies ([K] l.7-8).
- **D-12** : `exchangeInfo` spot et liquidations brutes en partie 1 (lot P1-a) ; open interest de la veille et `exchangeInfo` futures en
  partie 2 (Q-19).
- **D-13** : gardes des bougies reprises et renforcées : liste admise d'environnement, corps borné, refus de région = arrêt de tout appel.
- **D-14** : la pièce reste « upcoming » tant qu'aucun chemin servi ne la lit (TUYAU-L2-OUT-1) ; aucun texte public.
- **D-15** : client WebSocket du Node embarqué, sans dépendance (Q-6 close).
- **D-16** : différences de BNBUSDT et SOLUSDT gardées sur le seul critère chiffré fixé avant la journée de mesure (Q-7).
- **D-17** : le jour est un INDEX dérivé du brut ; son scellé porte l'index, les segments référencés, les ancres et les dérivés (Q-20 close).
- **D-18** : chaîne = procédure complète de la place, validation de l'instantané comprise ; une reprise = une reprise réussie, essais bornés.
- **D-19** : forme combinée par URL, une connexion par symbole ; aucun message JSON ne part ; hors fermeture, le client n'envoie que des
  PONG (Q-21 close).
- **D-20** : deux empreintes canoniques par flux et par jour au manifeste ; TL-9 et TL-10 les comparent, jamais les seuls `SHA256SUMS`.
- **D-21** : trois gardes contre le trou silencieux : chien de garde de liaison, queue de segment vérifiée, file d'écriture bornée.
- **D-22** : place factice des tests = serveur WebSocket minimal sous `test/`, sans dépendance (Q-23 close) ; prix en lignes mesuré au
  plan de P1 (D-24).
- **D-23** : journée de mesure M-1 sur le poste local, sous go de l'investisseur et après la ligne datée du pays de ce poste
  (L2-REGION-LOCAL-1), au sha relu, avant le plan de P3 (Q-22).
- **D-24** : le plan de P1 fixe chaque paramètre renvoyé (§2.3, dernière puce) avec sa source et passe un cp-1 bref du validateur-humain
  ([R] l.11) avant le G1 de P1-a : ligne datée, items cités, chiffres sourcés ; aucun gate neuf.
- **D-25** : M-1 scelle au moins un jour réel, rejoué `--from-raw` à l'octet, cité au rapport de M-1 par chemin hors dépôt et sha256,
  avant le plan de P3 ; sinon branchement vers la place non exécuté, pièce « upcoming » ; aucune trame réelle au dépôt.
- **D-26** : FAITS-L2-ACCESS-2 lu sur place par l'orchestrateur, daté, épinglé par empreinte et commis avant le plan de P1 ; un fait de
  [Ad] qu'il ne confirme pas redevient une limite avec item (§6).
- **D-27** : R-25 : 547 lignes par lot au gel (`r25` local), 1 205 par PR (porte CI) ; taille de chaque lot au plan de P1 ; un lot qui
  dépasse est scindé, jamais compacté (Q-2 close).

## 1. Contexte mesuré

### 1.1 La demande, l'audit, le go
- RECHERCHES propose d'enregistrer dès maintenant le carnet spot des quatre symboles, puis les flux de dérivés et les rondes d'oracle
  ([Pr] l.21-26) : le carnet et plusieurs flux « ne se téléchargent pas après coup » ([Pr] l.15).
- Son advisor marché rend « conforme avec corrections », sept points ([Au] l.8-35) ; son avis détaille le point 6 en dix points
  d'intégrité ([Av] l.58-70) et marque (m) ses faits de place, à confirmer par un FAITS ([Av] l.8). Aucun fait (m) n'est repris ici.
- MONARK plie les sept points et forme les items ([Pl] l.17-32, l.41-47 ; [E] l.459-462). L'investisseur, verbatim : « maintenant, oui
  pour un second enregistreur » ([Pl] l.10), puis « ok go, enchaîne tout » ([Mi] l.37).
- Départ maintenant : écrivain de capture brute seul, code épinglé dès le premier octet, aucune calibration ; ces jours ne sont admis
  que si la relecture passe ([Pl] l.12-13, règle de [Av] l.40-44). Second enregistreur : oui, identité à l'octet ([Pl] l.14).

### 1.2 Ce que la place documente (lu sur place le 2026-10-03, [F])
- Connexion spot valable 24 h, déconnexion attendue à la borne ; `serverShutdown` avant un arrêt ; ping du serveur toutes les 20 s,
  déconnexion sans pong en une minute ; un point d'accès réservé aux données de marché ([F] l.16-18).
- Limites : 5 messages entrants par seconde (ping, pong, JSON), 1 024 flux par connexion, 300 connexions par tentative toutes les
  5 minutes par adresse ; heures en millisecondes, en microsecondes avec `timeUnit=MICROSECOND` ([F] l.19-20).
- Différences `<symbol>@depth@100ms`, champs `U` et `u` ; procédure : tampon, instantané `GET /api/v3/depth?limit=5000`, rejet des
  événements `u` ≤ `lastUpdateId`, événements manqués si `U` dépasse l'identifiant local + 1 ; l'instantané est borné à 5 000 niveaux
  par côté, les niveaux hors de lui restent inconnus tant qu'ils ne changent pas ([F] l.21-25) → L2-DEPTH-COVERAGE-1.
- `<symbol>@depth<levels>` sert 20 niveaux au plus : la profondeur à 100 pb ne peut venir que du carnet reconstruit ([F] l.26-28).
- `@bookTicker` : « Real-time », champ `u`, prix et quantités en chaînes décimales ; `@trade` : champs `t`, `T`, `m` ([F] l.29-30).
- REST : poids de `depth` 5, 25, 50 ou 250 selon `limit`, au plus 5 000 ; en-têtes `X-MBX-USED-WEIGHT-…` ; 429, puis 418 et
  bannissement de 2 minutes à 3 jours ; `Retry-After` en secondes ; `exchangeInfo` pèse 20 ([F] l.37-39).
- Futures USDⓈ-M, documentation « legacy », relecture due avant la première course ([F] l.43-44) : routes `/public`, `/market`,
  `/private` ; connexion de 24 h ; ping toutes les 3 minutes, déconnexion sans pong en 10 minutes ; 10 messages entrants par seconde
  ([F] l.45-48).
- Liquidations `@forceOrder` sur `/market` : au plus la plus grosse par symbole et par 1 000 ms, un ÉCHANTILLON ([F] l.49-51)
  → L2-LIQ-COMPLETE-1.
- Open interest : `GET /fapi/v1/openInterest`, poids 1 ([F] l.52) ; `GET /futures/data/openInterestHist`, périodes de `5m` à `1d`,
  dernier mois seulement, 1 000 requêtes par 5 minutes par adresse : une lecture par jour de la veille suffit ([F] l.53-55).
- Aucun fichier public de carnet, de meilleur prix, de liquidations ni d'open interest ([F] l.59-62) ; aucun fichier public n'est
  utilisé sans décision du fondateur ([F] l.69-71).
- Conditions générales inchangées, pays interdits, usages interdits hors accès « expressly permitted », mandataires refusés ; région de
  l'hôte NON établie à la lecture ([F] l.75-95), puis établie par la réponse de l'investisseur : France, hors de la liste des pays
  interdits, L2-REGION-HOST-1 clos pour cet hôte ([F] l.126-130 ; Q-1). Licence : usage interne, aucune redistribution (clause 27 :
  [S] l.43-44 ; [F] l.89-90).
- **Faits rapportés par [Ad], [2nd] ici** (lus par l'advisor le 2026-10-03 sur la page primaire de [F] l.13 ; aucune copie locale,
  aucun réseau pour ce pli ; confirmation : FAITS-L2-ACCESS-2 (c), (d), (h), (i), lu par l'orchestrateur avant le plan de P1 ; un
  fait qu'il ne confirme pas redevient une limite avec item, D-26) : la procédure de [F] l.22-24 a une étape de
  validation de l'instantané, citée par [Ad] : « If the lastUpdateId from the snapshot is strictly less than the U from step 2, go back to
  step 3 » ; le premier événement appliqué contient `lastUpdateId` dans `[U;u]` ; la charge de `@bookTicker` n'a ni `e` ni `E`, seuls
  `u, s, b, B, a, A` ; le PONG recopie la charge du ping ; forme combinée `/stream?streams=…`, enveloppe `{"stream":…,"data":…}`
  ([Ad] points 1, 2, 4 et sa prose). Un PONG compte dans les 5 messages entrants par seconde : déjà lu ([F] l.19).
- Le `u` de `@bookTicker` est l'identifiant de mise à jour du carnet ([F] l.29) : il saute, sa suite ne révèle aucun trou ([Ad] point 4).

### 1.3 Ce que le dépôt porte déjà
- Discipline des bougies : conditions lues avant tout appel, jamais dans un dépôt, relecture de RECHERCHES avant le premier appel
  ([K] l.2-5) ; un point d'accès codé, hôte contrôlé, redirections refusées, aucun en-tête, aucune reprise ([K] l.9-13) ; arrêts nommés
  sans sortie normalisée ([K] l.16-19) ; noms d'environnement refusés ([K] l.58, l.110-114) ; sortie hors de tout arbre git
  ([K] l.116-127) ; toute réponse journalisée, corps 200 gardé avant lecture, 451 nommé ([K] l.156-180) ; manifeste avec
  `script_sha256`, `redistributable: false`, `SHA256SUMS` ([K] l.253-275) ; garde d'entrée par chemins réels ([K] l.313-317) ;
  corps non 200 sous `raw/errors/`, détail d'arrêt sans prix ni volume ([C] l.25-28). Écritures synchrones : `appendFileSync`
  importé ([K] l.32) et appelé pour `requests.jsonl` ([K] l.172) ; un flux continu ne peut pas reprendre ce modèle tel quel (D-21).
- Tailles à `61d69216` (`wc -l`) : enregistreur Binance 317 lignes, son test 825 ; enregistreur Coinbase 336, son test 770.
- Unités du Dōjō : utilisateur propre, `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome=true`, `ReadWritePaths`, `CPUQuota`,
  `MemoryMax`, `TasksMax` ([U1] l.40-55, `ProtectHome` l.46 ; [U2] l.48-60, `ProtectHome` l.52).
- Items ouverts qui visent les enregistreurs : SERIES-ENV-ALLOWLIST-1, SERIES-BODY-BOUND-1, SERIES-ABSENT-ROOT-TEST-1,
  SERIES-ERROR-BODY-1, SERIES-PROXY-GUARD-1 ([E] l.240-255) ; MAIN-GUARD-REALPATH-1 ([E] l.256-261) ; SERIES-TLS-PEER-LOG-1
  ([E] l.283-285) ; alias : RECORDER-EXCHANGEINFO-1 ([E] l.437) et RECORDER-EXCHINFO-1 ([E] l.460), un seul nom (Q-17 close, §7).
- Garde-fous de l'investisseur : aucune dépense, aucune adresse d'hôte publiée, aucune suppression définitive sans accord ([E] l.35-38).
- R-25 : la porte CI exclut `docs/**/*.md` du compte de code ([CI] l.82) et borne une PR à 1 205 ([CI] l.49) ; 547 par lot, mesurées
  au gel par `r25` local ([MT] l.38 ; [Mi] l.12) ; décision 300 : R-25 inchangé par PR ou par fusion, une partie plus grande
  part en fusions consécutives ([R] l.20) ; un lot dont le solde passe sous 10 lignes est scindé avant toute compaction ([R] l.9) ;
  Q-2 close : D-27.
- Stockage local : `F:/PRODUITS/marche/` existe, sans dossier `l2` (lu le 2026-10-03 vers 18:15 UTC).

### 1.4 Client WebSocket, mesuré sur le poste de l'orchestrateur (pas sur l'hôte)
- Node v24.15.0, `WebSocket` global présent, undici 7.24.4 embarqué (`process.versions`, 2026-10-03 vers 18:15 UTC) [N].
- Source embarquée `internal/deps/undici/undici` (17 435 lignes), lue par `process.binding('natives')` : sur un PING reçu, le client
  écrit lui-même le PONG puis publie `undici:websocket:ping` ([N] l.14979-14984, l.15154-15161) ; canaux `open`, `close`,
  `socket_error`, `ping`, `pong` ([N] l.2620-2621) ; `open` publie l'adresse LOCALE du socket ([N] l.15393-15394), jamais journalisée ;
  `undici:client:connected` publie le socket ([N] l.9332-9344) : piste pour SERIES-TLS-PEER-LOG-1, non prouvée.
- Relu au pli : le PONG est écrit avec la charge même du PING ([N] l.14981-14982) ; le client refuse une trame masquée venant du serveur
  ([N] l.14760-14761), un contrôle fragmenté ou de plus de 125 octets ([N] l.14784-14785), et lit trois formes de longueur
  ([N] l.14792-14797) : ce que la place factice doit servir (D-22).
- Aucun serveur WebSocket embarqué ni au dépôt : aucun des 72 modules intégrés de Node n'a « ws » dans son nom, ni `WebSocketServer`
  global ou dans `node:http` ; aucun code de serveur WebSocket au dépôt (`git grep`, sortie 1), aucun paquet `ws` dans
  `package-lock.json` ([N2], 2026-10-03 à 18:56:19 UTC) ([Ad] point 8).
- La version de Node du serveur du site n'est pas lue : item L2-NODE-HOST-1.

## 2. Périmètre

### 2.1 Dans le chantier
- **Spot (P1)** : BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT ; flux `@depth@100ms`, `@bookTicker`, `@trade` ; instantané REST `limit=5000` à la
  synchronisation, à chaque reprise et à chaque borne de jour, dans sa dernière minute (D-9) (poids 250 par symbole et par instantané,
  [F] l.37) ; `exchangeInfo`
  spot une fois par jour (poids 20, [F] l.39) ; heure de la place chaque heure (point d'accès à lire : FAITS-L2-ACCESS-2 (a)).
- **Liquidations brutes (P1-a, D-12, Q-19)** : `@forceOrder` des quatre perpétuels sur `/market`, trames écrites telles que reçues, sans
  logique de chaîne ; échantillonnage écrit au manifeste ([F] l.49-51) ; second type de connexion : ping toutes les 3 minutes,
  déconnexion sans pong en 10 minutes, 10 messages entrants par seconde ([F] l.45-48).
- **Différences** gardées dès le premier jour pour BTCUSDT et ETHUSDT ; pour BNBUSDT et SOLUSDT, sur le critère de Q-7 (D-16), sinon le
  repli de Q-8 et la limite de B2 pour ces deux symboles (L2-DIFFS-BNBSOL-1).
- **Dérivés (P2)** : `openInterestHist` 5 minutes lu chaque jour pour la veille ; `exchangeInfo` futures une fois par jour (chemin et
  poids à lire : FAITS-L2-FUTURES-2) ; les liquidations y reviennent si Q-19 retient P2.
- **Mesure (D-23, D-25)** : journée M-1 sur le poste local, après le G7 de P1, la relecture de RECHERCHES et la ligne datée du pays du
  poste local (L2-REGION-LOCAL-1) ; au moins un jour réel scellé et rejoué à l'octet, avant le plan de P3.
- **Hôte (P3)** : unité, quota fixé sur M-1, départ continu, mesures sur l'hôte, copie locale vérifiée, empreintes postées à RECHERCHES.
- **Second hôte (P4)** : autre région, identité des suites canoniques contrôlée (D-20), union déclarée des trous.

### 2.2 Hors du chantier
- Financement (RECORDER-FUNDING-1) et rondes d'oracle (USDT-USD-REFERENCE-1 étendu) : différés ([Pl] l.47 ; [E] l.461).
- Toute analyse, calibration ou étiquette ; toute classe servie (B1, B2, C1 sont des questions de RECHERCHES).
- Les fichiers publics de la place ([F] l.69-71 ; Q-16) ; l'état on-chain (FAITS-ARCHIVE-NODE-1, [F] l.101-103).
- Toute redistribution, tout transfert des données à un tiers : seules les empreintes sont postées ([Pr] l.24).

### 2.3 Exigences de la partie 1 (les dix points de [Av] l.58-70, puis D-7 à D-13)
1. **Chaîne (D-18)** : la règle de TL-2 est la procédure complète de la place, toutes ses étapes de synchronisation et d'application,
   transcrites dans le plan de P1 (D-24) étape par étape avec les numéros du texte lu par FAITS-L2-ACCESS-2 (h), chaque étape paraphrasée,
   citations de 25 mots au plus (sept et trois selon [Ad] point 1, compte [2nd] ici). Contenu déjà sourcé : différences tamponnées,
   `U` du premier événement tamponné noté ; instantané `limit=5000` ([F] l.22-23) ; `lastUpdateId` strictement inférieur à ce `U` ⇒
   instantané neuf ([Ad] point 1, [2nd]) ; événements `u` ≤ `lastUpdateId` écartés du carnet, gardés au brut ([F] l.23) ; le premier
   événement appliqué contient `lastUpdateId` dans `[U;u]`, sinon reprise ([Ad] point 1, [2nd]) ; puis, à chaque événement, `U` >
   identifiant local + 1 ⇒ rupture nommée au `missing.json` ([F] l.23-24), puis reprise (point 6).
2. **Transactions** : `t` gardé ; sa consécutivité, qui rendrait un trou détectable, est à lire (FAITS-L2-ACCESS-2 (f)).
3. **Journal de connexion** : ouverture, fermeture, cause (borne de 24 h, `serverShutdown`, chien de garde, file pleine, erreur), flux
   et cadence, pings reçus de la place (canal de [N]) ; jamais une adresse : ni `remoteAddress` ni `remotePort` du socket ne sont lus,
   ni l'adresse locale que publie le canal `open` ([N] l.15393-15394 ; [Ad] point 12).
4. **Heure de la place** lue chaque heure, à côté de l'écart de l'horloge de l'hôte ; heures d'événement et de transaction gardées par
   message (champs à confirmer : FAITS-L2-ACCESS-2 (d)).
5. **Instantanés REST** : heures de demande et de réponse, `lastUpdateId`. « L'instantané de la minute t » = état du carnet reconstruit
   après tous les événements d'heure de place antérieurs à t (D-10) ; absent, et listé, si une rupture est ouverte à t.
6. **Poids** : en-têtes journalisés à chaque réponse ; 429 et 418 suspendent la reprise jusqu'à `Retry-After`, le trou reste ouvert et
   nommé ([F] l.38-39, l.112-113) ; « une reprise par symbole et par rupture » ([F] l.112, texte de l'orchestrateur) se lit au pli une
   reprise RÉUSSIE par rupture : au plus n instantanés par reprise, puis reprise suspendue, nommée, pendant un délai ; n et ce délai
   fixés au plan de P1 (D-24) sous le plafond de poids par minute lu (FAITS-L2-ACCESS-2 (b)), qui conditionne aussi le repli Q-8 (b)
   ([Ad] point 10) ; chaque essai écrit au `missing.json` ([Ad] point 1) ; un refus de région (451, [K] l.174) arrête tout.
7. **Décimales** gardées telles quelles. Un niveau de prix p est à ±100 pb ssi 100·|2p − b − a| ≤ b + a, où b et a sont les meilleurs
   prix acheteur et vendeur du carnet ; p, b et a sont lus comme entiers à l'échelle décimale commune du jour, lue dans `exchangeInfo`
   (champ à confirmer : FAITS-L2-ACCESS-2 (k)) et figée au manifeste ; une chaîne hors de cette échelle arrête le dérivé du symbole,
   arrêt nommé, le brut continue ([Ad] point 11) ; distance atteinte arrondie vers le bas, jamais surestimée ; aucun flottant.
8. **Empreinte** de l'enregistreur, sa configuration, Node et undici au manifeste de chaque jour (précédent [K] l.264).
9. **Parité quotidienne et amorce (D-9)** : à l'ancre prise dans la dernière minute du jour, carnet reconstruit et ancre portés au même
   `u` (sémantique des quantités : FAITS-L2-ACCESS-2 (e)), écarts comptés par côté dans la plage de prix de l'ancre ; jamais remplacés en
   silence, écrits au manifeste du jour clos ; ancre manquée ⇒ parité absente, nommée. La même ancre est le départ du rejeu du jour
   suivant, dont le dossier la porte avec son amorce : les différences de la veille postérieures à son `lastUpdateId` ; aucun événement
   du jour ne reste ainsi hors de son rejeu ([Ad] point 6). Ancre manquée ⇒ départ au dernier instantané antérieur dont la chaîne jusqu'à
   minuit est intacte, l'amorce s'allongeant d'autant ; à défaut, au premier instantané du jour, le trou de minuit à lui nommé.
10. **Jour** : un message appartient au jour UTC de son heure d'événement de la place ; l'heure de réception est gardée à l'index de
   réception ; un message sans heure de place (`@bookTicker` selon [Ad] point 2, [2nd] ; FAITS-L2-ACCESS-2 (d)) prend, par Q-9 close,
   le jour de l'événement de différences dont l'intervalle `U`..`u` contient son `u` ; sinon (rupture ouverte, symbole sans différences
   gardées), son jour de réception, marqué, qui peut différer d'un hôte à l'autre près de minuit : d'où la fenêtre de TL-10. Si
   FAITS-L2-ACCESS-2 (d) montre une heure de place sur ce flux, la règle de Q-9 est sans objet.
- **Connexions (D-8, D-19)** : une connexion par symbole en forme combinée par URL, ses flux nommés dans l'URL, le flux de chaque
  trame lu plus tard dans son enveloppe (forme à confirmer : FAITS-L2-ACCESS-2 (c)) ; une connexion `/market` pour les liquidations
  (forme d'URL : FAITS-L2-FUTURES-2 (c)) ; aucun message JSON ne part ; hors la fermeture d'une connexion, le client n'envoie que les PONG
  que le client embarqué écrit seul ([N] l.14981-14982), comptés dans les 5 messages entrants par seconde ([F] l.19 ; [Ad] point 10) ;
  reconnexions planifiées avant la borne de 24 h et sur `serverShutdown` ([F] l.16-17, l.111), décalées entre symboles et entre hôtes
  ([Av] l.54) ; tentatives bornées sous la limite de connexions de [F] l.19-20.
- **Chien de garde (D-21, L2-HALF-OPEN-1)** : aucun ping ni trame pendant k intervalles de ping documentés (20 s en spot, 3 minutes en
  futures : [F] l.17, l.47 ; k fixé au plan de P1, D-24) ⇒ fermeture nommée, reconnexion, trou nommé de la dernière trame reçue à la première
  de la connexion neuve, reprise du carnet ; sans lui, une liaison morte sans `serverShutdown` tient le trou ouvert jusqu'au délai TCP
  ([Ad] point 5 a) ; repère : la place coupe un client sans pong en une minute en spot, en dix en futures ([F] l.17, l.47).
- **Brut (D-7)** : par connexion, une suite de trames telles que reçues, chacune suivie d'un LF, coupée en segments à heure fixe de
  l'horloge de l'hôte (période fixée au plan de P1, D-24), jamais sur le contenu d'une trame : aucune trame n'est lue avant d'être écrite, et
  router une trame vers un fichier par flux exigerait de lire son enveloppe ; par segment, un index de réception ligne à ligne (rang,
  décalage, longueur, heures de réception murale et monotone), sa ligne écrite APRÈS la trame ; un octet reçu n'est jamais réécrit.
- **Queue d'un segment (D-21, L2-WRITE-TAIL-1)** : à la reprise après un arrêt, index et fichier sont confrontés dans les deux sens
  (trame sans ligne, ligne tronquée, ligne au-delà du fichier) ; le segment est clos, sa queue marquée au `missing.json`, jamais
  réécrite ; le rejeu exclut une queue marquée et refuse, arrêt nommé, une queue incohérente non marquée ([Ad] point 5 b).
- **File d'écriture (D-21, L2-BACKPRESSURE-1)** : écriture asynchrone, dans l'ordre de réception ; une trame n'est lue qu'une fois
  écrite ; la file entre réception et écriture est bornée en octets (borne fixée au plan de P1, D-24, sous `MemoryMax`) ; au dépassement,
  fermeture nommée de la connexion et trou nommé, jamais une croissance silencieuse jusqu'à l'arrêt de l'unité ; longueur mesurée en
  M-1 ([Ad] point 5 c).
- **Jour et scellé (D-17)** : le dossier d'un jour (symbole, jour UTC de la place) porte l'index du jour, dérivé du brut : par flux, les
  (segment, rang) de ses trames ; l'amorce (point 9) ; les trames tardives d'un jour déjà scellé, marquées de leur jour. Il porte aussi
  les deux ancres, `missing.json`, le manifeste, les dérivés et `SHA256SUMS`, qui liste en plus chaque segment référencé par chemin
  relatif (format `sha256sum -c`) ; les segments vivent par connexion, hors des dossiers de jour ; un segment de borne est référencé par
  deux jours, un segment de la connexion `/market` par les dossiers de ses symboles (disposition : plan de P1). Une trame est tardive si
  sa réception suit la fin de son jour de plus que le délai de grâce, figé au manifeste (Q-10 close : valeur provisoire au plan de P1
  avec sa source, fixée sur M-6) ; elle va à l'index du jour ouvert, marquée, comptée. Un jour se scelle quand ce délai est passé et
  que chaque segment référencé est clos ; un index scellé n'est jamais réécrit ([Ad] point 2, voie (B)).
- **Empreintes canoniques (D-20)** : par flux et par jour, la suite canonique = trames du jour, toutes connexions, une fois par clé
  (`(U,u)` pour les différences, `t` pour les transactions, `u` pour le meilleur prix, clé des liquidations : FAITS-L2-FUTURES-2 (c)),
  ordonnées par clé ; le rejeu écrit au manifeste deux empreintes : suite brute canonique (trames telles que reçues, un LF après chacune)
  et suite des champs re-sérialisés canoniquement (chaînes décimales intactes), repli si M-5 réfute l'identité du JSON ; deux trames de
  même clé aux octets différents sont nommées au manifeste ; unicité des clés à confirmer (FAITS-L2-ACCESS-2 (f), (j) ; M-5) ;
  `timeUnit` (Q-5) et forme d'abonnement identiques sur les deux hôtes, figés au manifeste ([Ad] point 3).
- **Gardes (D-13)** : liste admise de variables d'environnement, mesurée sous l'unité (construction de SERIES-ENV-ALLOWLIST-1) ; sortie
  hors dépôt ([K] l.116-127) ; aucun mandataire ([F] l.87-88) ; trame et corps lus sous une borne, arrêt nommé au-delà
  (SERIES-BODY-BOUND-1) ; corps non 200 gardés (SERIES-ERROR-BODY-1) ; garde d'entrée par chemins réels (MAIN-GUARD-REALPATH-1) ; sous
  un seuil de disque libre, rien n'est écrit et l'arrêt est nommé (Q-11). L'unité de P3 limite `ReadWritePaths` au dossier de sortie et
  pose `ProtectHome=true` ([U1] l.46 ; [U2] l.52) ; les identifiants de transport de Q-13 vivent dans la session de l'investisseur,
  jamais sur l'hôte à portée de l'unité ([Ad] point 12).
- **Paramètres du plan de P1 (D-24, C-2)** : k du chien de garde ; n et délai de suspension des reprises (point 6) ; période de coupe
  des segments (Brut) ; borne en octets de la file d'écriture ; grâce provisoire (Q-10) ; prix en lignes de la place factice (D-22) ;
  étapes de la procédure lues par FAITS-L2-ACCESS-2 (h) (point 1) ; s'y ajoutent, recensés au second pli, la disposition des segments
  (Jour et scellé), le support de la prise de contact Upgrade dans `node:http` (Q-23) et la taille de chaque lot, mesurée ou estimée
  (D-27). Le plan de P1 fixe chacun avec sa source (ligne d'un FAITS, mesure ou motif écrit) et passe un cp-1 bref du validateur-humain
  avant le G1 de P1-a : ligne datée, items cités, chiffres sourcés ; aucun gate neuf ([R] l.11). La configuration retenue est écrite au
  manifeste de chaque jour (point 8).

## 3. Tuyaux (entrée, sortie, état, test de composition)

Règle de branchement : la pièce reste « upcoming » dans tout registre tant qu'aucun chemin servi ne lit sa sortie (D-14). Chaque test
nommé ci-dessous est non-LLM et rejoue la composition de son tuyau ; ceux qui lisent la place (TL-1 à TL-7b) la remplacent par une place
factice en boucle locale (serveur WebSocket et REST sous `test/`, D-22, données synthétiques) ; TL-8 à TL-10 partent de dossiers scellés
de fixture. Fixtures de `test/` toujours synthétiques, aucune trame réelle au dépôt ; la place réelle n'est lue qu'en M-1, dont le jour
scellé, rejoué à l'octet, vit hors dépôt (D-25), puis sur l'hôte (P3) ; jusque-là, le branchement vers la place est « non exécuté ».

- **TL-1, capture** (P1-a) : entrée = la place (flux spot, REST) ; sortie = segments et index de réception, `requests.jsonl`, journal de
  connexion ; état = segments du symbole et dossier du jour ; tests `l2_capture_record_seal_replay` (place factice → écrivain → scellé →
  rejeu égal à l'octet ; au second pli, pour §6.1 FM-2.6 : brut égal aux octets servis, la place factice relève chaque trame du client,
  PONG et fermeture seuls (D-19), le journal de connexion ne porte aucune adresse (§2.3 point 3)), `l2_write_tail_marked` (arrêt
  simulé entre trame et ligne d'index → queue marquée, rejeu vert sans elle ; queue incohérente non marquée → arrêt nommé),
  `l2_backpressure_named_stop` (écriture ralentie → file à sa borne → fermeture et trou nommés).
- **TL-2, chaîne** (P1-b) : entrée = trames de différences et instantanés ; sortie = carnet en mémoire, ruptures et essais au
  `missing.json` ; état = processus, puis `missing.json` ; test `l2_chain_gap_named_then_resync` (trou injecté → rupture nommée →
  instantané neuf → reprise ; instantané antérieur au tampon → instantané neuf, essai nommé ; n essais vains → reprise suspendue, nommée,
  puis réussie après le délai).
- **TL-3, minutes** (P1-c) : entrée = carnet reconstruit ; sortie = instantanés par minute (niveaux à ±100 pb, distance, nombre) ; état =
  fichier dérivé du jour ; test `l2_minute_window_exact` (niveau à la borne retenu, au-delà écarté, rupture ouverte ⇒ minute absente ;
  chaîne hors de l'échelle du manifeste ⇒ arrêt nommé du dérivé).
- **TL-4, rejeu** (P1-c) : entrée = segments référencés et index de réception d'un jour scellé, ses ancres ; sortie = index du jour,
  dérivés, `missing.json`, empreintes canoniques, manifeste ; état = dossier neuf hors dépôt ; tests `l2_replay_byte_identical` (index du
  jour et dérivés reconstruits à l'octet, amorce comprise ; segment altéré ⇒ arrêt nommé, rien d'écrit), `l2_bookticker_day_rule` (jour
  d'une trame `@bookTicker` par l'intervalle de différences qui contient son `u` ; rupture ouverte ⇒ jour de réception, marqué).
- **TL-5, parité** (P1-b) : entrée = carnet reconstruit et ancre de la dernière minute du jour ; sortie = écarts comptés ; état =
  manifeste du jour clos ; test `l2_daily_parity_counts` (0 écart sur une suite cohérente ; écarts comptés sur une ancre altérée ; ancre
  rangée dans les deux dossiers ; ancre manquée ⇒ parité absente nommée, départ du rejeu suivant au dernier instantané intact).
- **TL-6, continuité** (P1-a) : entrée = deux connexions qui se chevauchent, ou une liaison muette ; sortie = une seule suite au carnet,
  les deux au brut ; état = brut et journal de connexion ; tests `l2_overlap_switch_no_gap` (borne de 24 h et `serverShutdown` simulés,
  aucun trou), `l2_half_open_watchdog_named` (place muette sans fermeture → fermeture nommée après k intervalles → reconnexion, trou nommé).
- **TL-7a, liquidations** (P1-a, Q-19) : entrée = la place (route `/market`) ; sortie = segments et index de réception ; état = segments
  et dossier du jour ; test `l2_forceorder_record_replay` (échantillonnage écrit au manifeste ; chien de garde à l'intervalle des futures).
- **TL-7b, dérivés** (P2) : entrée = la place (REST futures) ; sortie = open interest de la veille, `exchangeInfo` futures ; état =
  dossiers du jour ; test `l2_futures_record_replay`.
- **TL-8, copie locale** (P3) : entrée = dossier scellé de l'hôte et ses segments référencés ; sortie = copie sous
  `F:/PRODUITS/marche/l2/` ; état = poste local ;
  test `l2_mirror_verify` (copie conforme verte ; octet altéré ou fichier en trop ⇒ rouge nommé) ; transport : Q-13.
- **TL-9, empreintes** (P3) : entrée = manifestes des jours scellés (empreintes canoniques, D-20) et leurs `SHA256SUMS` ; sortie =
  message à RECHERCHES ; état = messagerie ; test `l2_digest_post_matches_seal` (le texte posté est dérivé des manifestes scellés, jamais
  recopié à la main ; empreintes canoniques et `SHA256SUMS` cités séparément) ; cadence (Q-18 close) : à chaque scellé du premier
  mois, puis une fois par semaine.
- **TL-10, deux hôtes** (P4) : entrée = dossiers des deux hôtes sur la fenêtre (D-1, D, D+1) ; sortie = rapport d'identité et union
  déclarée des trous ; état = poste local ; test `l2_two_hosts_identity` (empreintes canoniques égales ⇒ identité du jour ; sinon
  comparaison par clé sur la fenêtre : trame tardive, contenu différent, trame d'un seul hôte nommés ; trou d'un seul hôte couvert et
  déclaré ; jamais deux `SHA256SUMS` comparés entre eux).
- **TL-11, consommateur servi : ABSENT.** Entrée = jours admis ; sortie = calibrations B1 ou B2 de RECHERCHES, puis une classe servie ;
  test nommé d'avance `l2_sealed_day_to_calibration`, écrit par l'ADR du consommateur ; item TUYAU-L2-OUT-1.

## 4. Parties

Chaque partie : plan, G2 par une instance neuve, revue ou checkpoint, G7 ; ses lots fusionnés l'un après l'autre (tests, tueurs et
mutations à chaque fusion), puis relus ensemble par la G2 de la partie ; accord de l'investisseur une fois par partie ([R] l.20). Jamais
deux lots de code sur une même pièce ([MT] l.68). Quatre parties : chantier « gros » au sens de [R] l.20, motif en Q-3. Un plan par
partie : le « plan de P1 » couvre ses trois lots ; les chiffres que [Ad] renvoie au « plan de P1-a » ou « de P1-b » y sont fixés.

- **P1, capture spot et liquidations brutes** (code, place factice seulement) : TL-1 à TL-7a et §2.3. Prérequis : cp-1 et validation de
  cette ADR ; avant le plan : FAITS-L2-ACCESS-2 lu sur place par l'orchestrateur, daté, épinglé et commis (D-26), Q-3, Q-4, Q-19 et Q-5
  closes (liste C-7 en tête) ; avant le G1 de P1-a : cp-1 bref du plan (D-24 : k, n et délai, période de coupe, borne de la file,
  grâce, prix de la place factice, étapes (h), disposition des segments, prise de contact Upgrade, taille par lot, chacun sourcé) ; si
  Q-19 retient P1, FAITS-L2-NEWDOCS-1 et FAITS-L2-FUTURES-2 (c), (d) lus avant le G1 de P1-a. Lots proposés : P1-a noyau (connexions
  spot et `/market`, segments et index de réception, journal, chien de garde, queue, file bornée, gardes, place factice, liquidations brutes,
  scellé : TL-1, TL-6, TL-7a) ; P1-b carnet (instantanés, procédure complète, reprises bornées, ancre et amorce, parité : TL-2, TL-5) ;
  P1-c dérivés et rejeu (index du jour, minutes, empreintes canoniques, manifeste, `--from-raw`, test de composition complet : TL-3,
  TL-4). Taille : non mesurée ; l'analogue mesuré le plus proche fait 1 142 lignes (enregistreur Binance et son test, §1.3) sans
  WebSocket ni carnet ; le plan de P1 donne la taille de chaque lot, mesurée ou estimée ; borne : 547 par lot au gel par `r25` local,
  1 205 par PR (D-27, Q-2 close) ; un lot qui la dépasse, P1-a d'abord, est scindé, jamais compacté ([R] l.9). Sortie : relecture de
  RECHERCHES (D-6), puis M-1 (D-23, D-25).
- **P2, dérivés** (code) : TL-7b. Prérequis : FAITS-L2-FUTURES-2 (a), (b) lus avant le G1 ; fusion de P1-a (pièce commune). Motif de la
  séparation : open interest rattrapable un mois ([F] l.53-55), `exchangeInfo` futures sans perte s'il attend. Si Q-19 retient P2, les
  liquidations y reviennent (TL-7a, FAITS-L2-NEWDOCS-1 et FAITS-L2-FUTURES-2 (c), (d) avant son G1), avec leur coût : elles ne se
  rattrapent pas, chaque jour entre le départ du spot et celui de P2 est un jour d'échantillon perdu (L2-LIQ-COMPLETE-1 cherche aussi
  une source qui couvrirait ces jours).
- **P3, hôte** (unité, mode d'emploi, outils de mesure, de copie et d'empreintes) : TL-8, TL-9. Prérequis : réponse à Q-1 (reçue,
  [F] l.128-130) ; G7 de P1 ; relecture de RECHERCHES au sha final ; M-1 faite sur le poste local (D-23, Q-22), son jour réel scellé
  et rejoué à l'octet cité au rapport de M-1 (D-25, L2-REAL-REPLAY-1). Contenu : unité sous
  limites et quota fixé sur M-1 (Q-11), `ReadWritePaths` limité au dossier de sortie, `ProtectHome=true`, aucun identifiant de
  transport à sa portée (Q-13) ; décision BNB/SOL (Q-7) ; départ continu ; mesures sur l'hôte (CPU, mémoire, M-8) ; copie locale
  vérifiée ; empreintes postées. Déploie ce qui a passé son G7 : la partie 1 toujours, les dérivés si P2 est close, sinon plus tard
  sous un sha neuf relu.
- **P4, second hôte** : TL-10. Prérequis : dépense de l'investisseur ; pays du second hôte contrôlé par une ligne datée du même type que
  L2-REGION-HOST-1, avant tout appel (Q-15, C-3) ; M-5 faite en M-1 et sur l'hôte.

## 5. Mesures (aucun chiffre n'est écrit avant d'être mesuré)

- **M-1, journée de mesure (D-23, D-25)** : sur le poste local, sous go de l'investisseur (Q-22 : conditions lues, sortie hors dépôt) et
  après une ligne datée du même type que L2-REGION-HOST-1 ([F] l.126-130) : pays du poste local, réponse de l'investisseur, contrôlé
  contre la liste du 5 janvier 2026 ([F] l.79-81) (L2-REGION-LOCAL-1, C-3) ; au sha relu par RECHERCHES, après le G7 de P1 et avant le
  plan de P3 : volume disque et bande passante par jour, par flux et par symbole, longueur de la file d'écriture (D-21) ; le critère
  de Q-7 est fixé AVANT elle ; CPU et mémoire du poste local ne valent pas pour l'hôte (mesurés sur l'hôte en P3, avec M-8). Ce
  placement rompt la boucle quota avant hôte, volume après hôte ([Ad] point 7).
  Volume journalier inconnu : aucun chiffre avant cette mesure ; l'ordre de grandeur de [Av] l.22 est de mémoire (m), non repris.
  **Sortie exigée (D-25, C-4)** : au moins un jour scellé (manifeste, `SHA256SUMS`, `missing.json`, index du jour) sur lequel le rejeu
  `--from-raw` est rejoué à l'octet ; chemin hors dépôt et sha256 cités au rapport de M-1, avant le plan de P3 ; à défaut, le
  branchement vers la place reste non exécuté et la pièce « upcoming » (D-14) ; aucune trame réelle au dépôt. Tout écart relevé entre la
  place réelle et la place factice est nommé au rapport de M-1 et porté par un item formé avant le plan de P3 (§6.1, FM-3.2).
- **M-2, distance atteinte** : par minute et par côté, distance au milieu de la borne de la plage connue complète (le niveau le plus
  profond de l'instantané d'ancrage ou de reprise), nombre de niveaux à ±100 pb, part des minutes sous 100 pb (L2-DEPTH-COVERAGE-1).
- **M-3, ruptures et reprises** : par symbole et par jour, nombre, durée, cause, instantanés par reprise (D-18) ; poids REST consommé
  (en-têtes) contre le plafond lu (FAITS-L2-ACCESS-2 (b)).
- **M-4, parité** : niveaux différents par côté entre carnet reconstruit et ancre, chaque jour ; attendu 0, tout écart nommé.
- **M-5, identité sur un hôte** : pendant chaque chevauchement de D-8, trames des deux connexions comparées à l'octet et par clé :
  identité du JSON, unicité des clés, mêmes bornes `(U,u)` des différences (L2-BYTE-IDENTITY-1) ; faite en M-1 puis sur l'hôte, avant
  le plan de P4.
- **M-6, horloges** : écart de l'hôte à la place, par heure ; retard entre heure d'événement et réception, qui fixe le délai de Q-10.
- **M-7, reconnexions** : par jour et par cause (24 h, `serverShutdown`, chien de garde, file pleine, erreur), avec les trous qu'elles
  laissent (attendu : aucun pour une reconnexion planifiée).
- **M-8, service du site** : temps de réponse d'une page servie, avec et sans l'enregistreur, mesuré sur l'hôte même ; l'enregistreur
  ne concurrence jamais le service ([Av] l.48) ; critère d'acceptation fixé au plan de P3.
- **M-9, deux hôtes** (P4) : par flux et par jour, empreintes canoniques égales ou non ; sur la fenêtre de TL-10, clés identiques,
  différentes, présentes sur un seul hôte.

## 6. Risques et limites (règle PAROXYSME : chaque limite porte son item, §7)

- **Pays de l'hôte** : non établi à la lecture ([F] l.91-95), établi depuis : France, admise ([F] l.128-130) ; L2-REGION-HOST-1 clos
  pour cet hôte ; le second hôte passe le même contrôle avant tout appel ([F] l.130) → RECORDER-L2-REGION-2 (Q-15) ; le poste local
  de M-1 aussi, par une ligne datée du même type avant tout appel (C-3) → L2-REGION-LOCAL-1 (Q-22).
- **Couverture de ±100 pb non garantie** : 5 000 niveaux par côté au plus, les autres inconnus tant qu'ils ne changent pas ([F] l.24-25,
  l.37) → L2-DEPTH-COVERAGE-1 (M-2 ; construction visée : une source de profondeur complète, achat admissible selon [Pl] l.38-39).
- **Liquidations = échantillon** (au plus une par symbole et par seconde, [F] l.49-51), sous-compte pendant les cascades ([Au] l.32) :
  jamais une étiquette ; variable, sentinelle ou borne inférieure déclarée ([Pl] l.32) → L2-LIQ-COMPLETE-1.
- **Open interest au pas de 5 minutes** (statistique d'`openInterestHist`, [F] l.53-54) → L2-OI-RESOLUTION-1 (pas plus fin par
  `GET /fapi/v1/openInterest`, poids 1, [F] l.52).
- **Hôte unique : tout trou du carnet et des liquidations est perdu** ([Av] l.50) → RECORDER-L2-REGION-2 (P4).
- **B2 limité pour BNBUSDT et SOLUSDT** tant que leurs différences ne sont pas gardées : niveau 1 et instantanés seulement ([Av] l.23 ;
  [Pl] l.21-22) → L2-DIFFS-BNBSOL-1.
- **Faits de place non lus** : point d'accès de l'heure, plafond de poids par minute, forme de l'abonnement, champs d'heure des messages,
  sémantique des quantités, consécutivité de `t`, rattrapage des transactions, texte complet de la procédure, PONG et messages sortants,
  unicité du `u` de `@bookTicker`, échelle de prix d'`exchangeInfo` → FAITS-L2-ACCESS-2, faits [2nd] de [Ad] compris ; `exchangeInfo`
  futures, paramètres d'`openInterestHist`, heures et clé de `@forceOrder`, perpétuels → FAITS-L2-FUTURES-2 ; futures sur la nouvelle
  documentation → FAITS-L2-NEWDOCS-1. FAITS-L2-ACCESS-2 est lu sur place par l'orchestrateur, daté, épinglé et commis avant le plan de
  P1 ; un fait de [Ad] qu'il ne confirme pas redevient une limite de ce §6, avec son item (D-26).
- **Client WebSocket mesuré sur le poste local seulement** ([N]) → L2-NODE-HOST-1.
- **Tests de P1 contre une place factice** : écrite dans le même chantier, elle porte notre lecture de la documentation, pas la place
  (§6.1, FM-3.2, FM-3.3) ; M-1 est le seul oracle réel avant l'hôte → D-25, L2-REAL-REPLAY-1.
- **Identité des `SHA256SUMS` entre hôtes impossible par construction** : bornes de connexion et chevauchements diffèrent ([Ad] point 3)
  → empreintes canoniques (D-20) ; leur garantie repose sur L2-BYTE-IDENTITY-1 (puce suivante).
- **Identité à l'octet d'un même événement entre connexions ou hôtes : hypothèse de [Av] l.53, non établie** → L2-BYTE-IDENTITY-1
  (M-5) ; si elle tombe, l'empreinte des champs prend le relais, garantie plus faible ; si les bornes `(U,u)` des différences diffèrent
  d'une connexion à l'autre, la comparaison passe à l'état du carnet aux `u` communs ; l'item cherche la construction qui rend la
  garantie entière.
- **Trous de `@bookTicker` indétectables en ligne** : ni heure ni type selon [Ad] point 4 ([2nd]), `u` non consécutif ([F] l.29) ; un
  trou de ce flux ne se voit pas dans sa propre suite → L2-BOOKTICKER-GAP-1 (PAROXYSME ; construction candidate : recoupement avec les
  différences).
- **Liaison morte sans `serverShutdown`** (TCP demi-ouvert) : sans garde, le trou dure jusqu'au délai TCP ([Ad] point 5 a) → chien de
  garde (D-21), trou borné et nommé ; sur un hôte unique, ce trou reste perdu (RECORDER-L2-REGION-2) → L2-HALF-OPEN-1.
- **Arrêt en cours d'écriture** : dernière trame sans ligne d'index ([Ad] point 5 b) → queue vérifiée et marquée (D-21) →
  L2-WRITE-TAIL-1.
- **Contre-pression** : file non bornée, unité arrêtée par `MemoryMax`, trou sans nom ([Ad] point 5 c ; écritures synchrones de
  l'analogue, [K] l.32, l.172) → file bornée, arrêt nommé (D-21) → L2-BACKPRESSURE-1.
- **418 partagé** : si l'adresse de sortie du serveur du site sert aussi d'autres locataires, leurs appels peuvent faire bannir
  l'enregistreur de 2 minutes à 3 jours ([F] l.38-39 ; [Ad] point 10) → L2-SHARED-EGRESS-1.
- **Trous de transactions sans rattrapage établi** (fichiers publics : décision du fondateur, [F] l.69-71) → L2-TRADES-BACKFILL-1, Q-16.
- **Horloge de l'hôte**, synchronisation non lue → L2-HOST-CLOCK-1 ; le jour suit l'heure de la place (§2.3, point 10).
- **Disque** : mécanisme de quota non lu sur le serveur du site → L2-DISK-QUOTA-1 (Q-11, seuils fixés sur M-1) ; disque plein = arrêt
  nommé, jamais une écriture partielle.
- **Certificat TLS de la place non journalisé** → SERIES-TLS-PEER-LOG-1, porté par P1 (piste [N] l.9332-9344) ; s'il est réfuté,
  l'item reste ouvert avec un client TLS propre pour construction de repli.
- **Concurrence avec le service du site** ([Av] l.48) : bornée par les limites de l'unité, mesurée par M-8 → L2-SERVING-IMPACT-1.
- **Aucun consommateur servi** → TUYAU-L2-OUT-1 ; la pièce reste « upcoming » (D-14).
- **Licence** : usage interne, aucune redistribution ([S] l.43-44) ; voie existante, sans item neuf : décision du fondateur avant tout
  service dérivé ([S] l.57-61), textes des accords avec les plateformes attendus ([E] l.171-172).

### 6.1 MAST : modes d'échec du chantier (checklist de risque résiduel, C-1)

- **Source** : MAST est adopté par le corpus comme checklist de risque résiduel ([MA] l.267-269, [lu]) ; les 14 modes et leurs libellés :
  [MC] l.42-59 ([lu]), que le corpus a lus dans l'article (arXiv:2503.13657v3, [MC] l.35) ; l'article n'est pas relu ici (aucun
  réseau) : [2nd] via le corpus ; lecture primaire aussi consignée au dépôt par un autre worker ([PC] l.84, [2nd] ici). Les libellés
  français sont des gloses du rédacteur, rattachées par leur numéro FM à [MC].
- **Topologie** : investisseur et fondateur (go, dépenses, périmètre : liste C-7) ; orchestrateur sous `claude-opus-5-5` (provenance en
  tête), qui lit les FAITS, écrit les plans et lance M-1 ; un worker G1 par lot ; une G2 neuve par partie ; validateur-humain
  `claude-fable-5-1` (checkpoint-1, cp-1 bref du plan de P1) ; advisors (conseils) ; RECHERCHES (relecture D-6, consommateur à venir,
  TL-11). G1, G2 et orchestrateur sont de la même famille : l'indépendance repose sur le validateur-humain, instance séparée d'une autre
  famille, et sur l'oracle non-LLM (tests, tueurs, mutations, M-1). La place réelle n'est lue qu'en M-1, puis sur l'hôte (P3).
- Chaque mode : menace dans ce chantier ; contre-mesure ; preuve (test nommé ou mesure). Un mode jugé faible ici garde sa ligne.

**FM-1, spécification et conception du système**
- **FM-1.1, spécification non suivie** (plausible ; cas nommé par C-1) : les paramètres renvoyés au plan de P1 (§2.3, dernière puce)
  fixés en silence par un G1, ou sans source par le plan ; une valeur par défaut du code tient lieu de décision. Contre-mesure : D-24
  (chaque paramètre au plan avec sa source, cp-1 bref avant le G1 de P1-a) ; configuration au manifeste de chaque jour (§2.3 point 8).
  Preuve : la ligne datée du cp-1 bref précède le premier commit de P1-a (`git log`) ; la G2 de P1 confronte chaque constante du code à
  sa ligne du plan.
- **FM-1.2, rôle non suivi** (plausible) : un G1 ou une G2 joint la place réelle, committe ou dépose une trame réelle au dépôt ; M-1
  lancée sans go ni contrôle de pays. Contre-mesure : R-20 ; missions sans réseau ([Mi] l.37) ; place factice seule en P1 (D-22) ;
  M-1 lancée par l'orchestrateur seul, après Q-22 et L2-REGION-LOCAL-1 (D-23) ; fixtures synthétiques (D-25). Preuve : la première
  ouverture du journal de connexion de M-1 suit les deux lignes datées ; la G2 de chaque partie liste les fichiers de données ajoutés
  et leur origine.
- **FM-1.3, répétition d'étape** (faible) : un pli ou une lecture refaits sans le précédent (FAITS-L2-ACCESS-2 relu par un sous-agent
  après l'orchestrateur ; un oracle rejoué comme neuf). Contre-mesure : un fichier de pli par avis ou checkpoint, empreintes d'avant et
  d'après ; arbre identique ⇒ enregistrement d'oracle servi ([R] l.5). Preuve : chaîne d'empreintes `969a730d…`, `a9b560f8…`, puis ce
  texte (en-tête, [PL], [PL2]).
- **FM-1.4, perte d'historique** (plausible : passation, sessions coupées) : une décision perdue, ou « ok go, enchaîne tout » pris pour
  une réponse de périmètre. Contre-mesure : décisions écrites, datées, commises, citées par ligne et sha256 (siège d'orchestrateur :
  [F] l.132-136, [H] l.437) ; liste C-7 en tête ; réponses de §8 datées avec leur auteur. Preuve : au cp-1 bref de D-24, chaque
  question à clore avant le plan de P1 porte sa ligne datée, antérieure au plan.
- **FM-1.5, condition de fin ignorée** (plausible) : P1 tenue pour finie, ou la pièce pour « built », sur la seule place factice ; un
  jour admis sans relecture. Contre-mesure : D-14, D-6, D-25. Preuve : rapport de M-1 (jour scellé, rejeu à l'octet, chemin et sha256)
  avant le plan de P3 ; registre public à « upcoming » tant que TL-11 est absent, relu à chaque cartographie de clôture.

**FM-2, désalignement entre agents**
- **FM-2.1, reprise de conversation** (plausible) : orchestrateur ou worker coupé, une instance neuve reprend sans les contraintes.
  Contre-mesure : missions autoportantes à empreinte ([Mi]) ; reprises par l'outil `relance.mjs` seulement ([R] l.9) ; état durable,
  commis ou sous `F:/tmp`. Preuve : sortie `monark.relance.v1` citée par chemin et sha256 à chaque reprise ([R] l.9).
- **FM-2.2, clarification non demandée** (précédent mesuré ; cas nommé par C-1) : « une reprise par symbole et par rupture » ([F] l.112,
  texte de l'orchestrateur) a été recopié tel quel par le premier texte ([A0] l.135), comme règle sans essai ni borne ; [Ad] point 1 a
  montré que, lu ainsi, il laisse le trou ouvert ou boucle, et l'a lu comme une reprise réussie à essais bornés. Menace : les
  paramètres de D-24, « jour », « ancre », « reprise » lus de deux façons. Contre-mesure : toute lecture d'un texte d'un autre siège
  qui change la conception est déclarée (« se lit au pli ») et posée en Q-n ou confirmée par un FAITS ; paramètres sourcés (D-24) ; G2
  neuve. Preuve : §2.3 point 6 et [PL] point 1 (écart déclaré, plié) ; au cp-1 bref, la liste des lectures déclarées du plan de P1.
- **FM-2.3, dérive de tâche** (plausible) : l'écrivain grossit d'analyse, de calibration ou d'étiquettes (§2.2), ou un lot dépasse sa
  borne. Contre-mesure : §2.2, D-2, D-27. Preuve : `r25` local au gel de chaque lot (547), porte CI par PR (1 205) ; la G2 de la
  partie confronte le diff à §2.2.
- **FM-2.4, rétention d'information** (plausible) : un fait [2nd] de [Ad] présenté comme lu ; un trou tu. Contre-mesure : marques [2nd]
  (§1.2), D-26 ; trous nommés au `missing.json`, jamais comblés ; empreintes postées dérivées des manifestes (TL-9). Preuve :
  FAITS-L2-ACCESS-2 épinglé et commis ; `l2_chain_gap_named_then_resync`, `l2_half_open_watchdog_named`, `l2_backpressure_named_stop` ;
  `l2_digest_post_matches_seal`.
- **FM-2.5, entrée d'un autre agent ignorée** (plausible) : un point de [Au], [Av], [Ad] ou [V] non plié. Contre-mesure : un fichier de
  pli point par point (où, comment) ; les dix points de [Av] l.58-70 en §2.3. Preuve : [PL] (13 points), [PL2] (C-1 à C-8, [O]), relus
  par l'orchestrateur avant consommation (R-21).
- **FM-2.6, écart raisonnement / action** (plausible) : l'ADR dit « aucune trame n'est lue avant d'être écrite », « aucun message JSON
  ne part », « jamais une adresse », et le code fait autre chose. Contre-mesure : chaque phrase a son test. Preuve :
  `l2_capture_record_seal_replay` (TL-1 : brut égal aux octets servis ; trames du client relevées, PONG et fermeture seuls ; journal sans
  adresse) ; `l2_write_tail_marked` (trame écrite avant sa ligne d'index).

**FM-3, vérification**
- **FM-3.1, terminaison prématurée** (plausible) : le G7 de P1 pris pour une preuve contre la place réelle. Contre-mesure : D-25, D-14.
  Preuve : rapport de M-1 avant le plan de P3 (L2-REAL-REPLAY-1) ; à défaut, branchement vers la place « non exécuté ».
- **FM-3.2, vérification absente ou incomplète** (principal ; cas nommé par C-1) : tous les tests de P1 lisent une place factice écrite
  dans le même chantier ; ils prouvent la cohérence de l'écrivain avec notre lecture de la documentation, pas avec la place ; M-1 est
  le seul oracle réel avant l'hôte. Contre-mesure : FAITS-L2-ACCESS-2 lu par l'orchestrateur avant le plan (D-26) ; formes des trames
  synthétiques tirées de ses lignes, chaque forme citant sa ligne au plan de P1 ; M-1 (D-23, D-25). Preuve, en M-1 : rejeu à l'octet du
  jour scellé (D-25) ; M-4 (parité à 0, ou écarts nommés) ; M-3 (ruptures, essais) ; M-5 (identité entre connexions) ; écarts à la
  place factice nommés au rapport de M-1, chacun porté par un item avant le plan de P3.
- **FM-3.3, vérification incorrecte** (plausible) : écrivain et place factice, écrits par le même lot, partagent une même lecture
  fausse ; G1 et G2 de la même famille que l'orchestrateur (C-6). Contre-mesure : comportement de la place factice fixé au plan de P1
  depuis FAITS-L2-ACCESS-2 (h), étape par étape, jamais depuis le code de l'écrivain ; parité contre l'ancre REST de la place (M-4),
  oracle que l'écrivain ne produit pas ; tueurs et mutations à chaque fusion ([R] l.20) ; validateur-humain d'une autre famille.
  Preuve : M-4 sur le jour scellé de M-1 ; campagne de mutants de la règle de chaîne, `RESULTS.json` cité par chemin et sha256
  ([R] l.13).

## 7. Items formés par cette ADR (propriétaire : orchestrateur, sauf mention ; état : ouvert)

- **FAITS-L2-ACCESS-2** (lecture sur place, liste fermée) : (a) point d'accès et poids de l'heure de la place ; (b) plafond de poids par
  minute, ou sa lecture dans `exchangeInfo` ; (c) forme de l'abonnement combiné (URL, enveloppe, noms des flux) et de `timeUnit` ;
  (d) champs d'heure d'événement de `@depth`, `@bookTicker`, `@trade` (attendu selon [Ad] : `@bookTicker` sans heure, à confirmer) ;
  (e) sémantique des quantités des différences ; (f) consécutivité et unicité de `t` ; (g) points d'accès de rattrapage des transactions
  et leurs conditions ; (h) procédure de synchronisation et d'application, étape par étape avec ses numéros, paraphrasée, citations de
  25 mots au plus : nombre exact d'étapes, bornes strictes ou larges, étape de validation de l'instantané citée par [Ad] ; (i) messages
  entrants comptés, charge du PONG, aucun message requis par l'abonnement par URL ; (j) unicité du `u` d'une trame `@bookTicker` et
  ce que « Real-time » couvre (toute variation du meilleur prix ou non) ; (k) champ d'`exchangeInfo` qui fixe l'échelle de prix, et son
  unité. Déclencheur : avant le plan de P1, qui transcrit (h) (au pli ; avant : avant le G1 de P1). Conduite (D-26, C-8) : lecture sur
  place par l'orchestrateur (navigateur interne), datée, épinglée par empreinte, commise avant le plan de P1 ; tout fait de [Ad] (§1.2)
  qu'elle ne confirme pas redevient une limite de §6, avec son item.
- **FAITS-L2-FUTURES-2** : (a) chemin et poids d'`exchangeInfo` futures ; (b) paramètres d'`openInterestHist` (bornes de temps,
  `limit`) ; (c) forme d'URL de la route `/market`, champs d'heure et clé de dédoublonnage de `@forceOrder` ; (d) noms des quatre
  perpétuels. Déclencheur : (c) et (d) avant le G1 de P1-a si Q-19 retient P1, sinon avant celui de P2 ; (a) et (b) avant le G1 de P2.
- **L2-DEPTH-COVERAGE-1** (PAROXYSME) : mesurer M-2 ; chercher une source de profondeur complète à ±100 pb (place, ou historique achetable
  dont la licence est lue avant achat, [Pl] l.38-39) ; si elle existe, procurement formé à l'investisseur avec son prix. Déclencheur :
  G7 de P3.
- **L2-LIQ-COMPLETE-1** (PAROXYSME) : chercher une source complète des liquidations (point d'accès documenté ou jeu acheté), sinon
  documenter l'absence, sources à l'appui. Déclencheur : avant le G7 de P2.
- **L2-OI-RESOLUTION-1** (PAROXYSME) : prix exact (requêtes et poids par jour) d'un open interest plus fin que 5 minutes. Déclencheur :
  demande de RECHERCHES, au plus tard au G7 de P2.
- **L2-DIFFS-BNBSOL-1** (nomme le différé « diffs BNB/SOL » de [E] l.461) : décision sur M-1 et le critère de Q-7. Déclencheur : fin de M-1.
- **L2-NODE-HOST-1** : versions de Node et d'undici du serveur du site, et relecture des lignes [N] dans sa source. Déclencheur : plan
  de P3.
- **L2-BYTE-IDENTITY-1** (élargi au pli) : M-5 en M-1 puis sur l'hôte : identité du JSON, unicité des clés, bornes `(U,u)` ; si
  l'identité à l'octet tombe, l'empreinte des champs (D-20) ; si les bornes diffèrent, l'état du carnet aux `u` communs ; recherche d'une
  comparaison qui garde la garantie entière. Déclencheur : M-1, puis P3, avant le plan de P4.
- **L2-TRADES-BACKFILL-1** : rattrapage d'un trou de transactions (FAITS-L2-ACCESS-2 (g), Q-16). Déclencheur : premier trou de `t`
  observé, au plus tard au G7 de P1.
- **L2-HOST-CLOCK-1** : synchronisation d'horloge du serveur du site, lue sur l'hôte sous go. Déclencheur : plan de P3.
- **L2-DISK-QUOTA-1** : système de fichiers et mécanisme de quota du serveur du site, lus sous go ; seuils d'alarme et d'arrêt fixés sur
  le volume mesuré par M-1 (Q-11). Déclencheur : plan de P3, après M-1.
- **L2-SERVING-IMPACT-1** : M-8 contre le critère du plan de P3 ; s'il est dépassé, construction chiffrée : limites resserrées ou hôte
  dédié (dépense : investisseur). Déclencheur : premiers jours sur l'hôte (P3) ; M-1, faite sur le poste local, ne le mesure pas.
- **TUYAU-L2-OUT-1** (branchement) : consommateur servi des jours admis (TL-11). Déclencheur : ADR de RECHERCHES pour B1 ou B2.
- **L2-BOOKTICKER-GAP-1** (PAROXYSME, [Ad] point 4) : construction candidate, le recoupement avec les différences : (i) chaque `u` de
  `@bookTicker` tombe dans un intervalle `[U;u]` reçu ; (ii) toute variation nette du meilleur prix d'un événement de différences a au
  moins une trame `@bookTicker` dans son intervalle, si la sémantique lue (FAITS-L2-ACCESS-2 (j)) le garantit ; sinon, absence de
  garantie documentée, sources à l'appui, et source de remplacement cherchée. Symbole sans différences gardées : aucun recoupement
  possible, limite déclarée dans le même item. Déclencheur : plan de P1 ; clôture : test au G7 de P1, ou recherche documentée.
- **L2-HALF-OPEN-1** ([Ad] point 5 a) : chien de garde de D-21 construit en P1-a, test `l2_half_open_watchdog_named`, k fixé au plan ;
  trou résiduel nommé, couvert par le second hôte (RECORDER-L2-REGION-2). Déclencheur : plan de P1 ; clôture : G7 de P1.
- **L2-WRITE-TAIL-1** ([Ad] point 5 b) : trame puis ligne d'index, queue vérifiée à la reprise (D-21), test `l2_write_tail_marked`.
  Déclencheur : plan de P1 ; clôture : G7 de P1.
- **L2-BACKPRESSURE-1** ([Ad] point 5 c) : file bornée, arrêt nommé (D-21), test `l2_backpressure_named_stop`, longueur mesurée en M-1 ;
  si la borne est atteinte en M-1, construction chiffrée (borne, disque, file sur disque) avant le plan de P3. Déclencheur : plan de
  P1 ; mesure : M-1.
- **L2-SHARED-EGRESS-1** ([Ad] point 10) : l'adresse de sortie du serveur du site est-elle partagée avec d'autres locataires ? Lu sous
  go, sans écrire d'adresse ; si oui, construction chiffrée (adresse ou hôte dédiés, dépense : investisseur). Déclencheur : plan de P3.
- **L2-REGION-LOCAL-1** (C-3 ; réponse : investisseur) : pays du poste local de M-1, réponse de l'investisseur, contrôlé contre la
  liste du 5 janvier 2026 ([F] l.79-81), consigné par une ligne datée du même type que L2-REGION-HOST-1 ([F] l.126-130) ; aucun pays
  supposé. Déclencheur : avant tout appel de M-1 ; clôture : la ligne datée, commise ; pays sur la liste ⇒ aucun appel depuis ce poste.
- **L2-REAL-REPLAY-1** (C-4) : premier jour réel scellé de M-1 (manifeste, `SHA256SUMS`, `missing.json`, index du jour), rejeu
  `--from-raw` à l'octet, chemin hors dépôt et sha256 cités au rapport de M-1 ; écarts de la place réelle à la place factice nommés,
  chacun porté par un item. Déclencheur : M-1 ; clôture : ce rapport, avant le plan de P3 ; d'ici là, le branchement vers la place est
  « non exécuté » et la pièce « upcoming » (D-14, D-25).
- **Repris, déclencheur avancé** : FAITS-L2-NEWDOCS-1 ([F] l.122-123) : avant le G1 de P1-a si Q-19 retient P1 (lecture faite, ou page
  encore absente consignée et datée, la page « legacy » relue le même jour).
- **Repris, état changé** : L2-REGION-HOST-1 ([F] l.121) : clos pour le serveur du site ([F] l.130) ; le même contrôle reste dû pour le
  second hôte (RECORDER-L2-REGION-2, Q-15), par une ligne datée du même type avant tout appel (C-3), comme pour le poste local
  (L2-REGION-LOCAL-1).
- **Repris, nom unifié** (Q-17 close) : RECORDER-EXCHINFO-1 ([E] l.460) est le nom retenu ; RECORDER-EXCHANGEINFO-1 ([E] l.437) est
  clos par renvoi, acte de l'orchestrateur dans [E].
- **Repris sans changement** : FAITS-ARCHIVE-NODE-1 ([F] l.124) ; RECORDER-L2-1,
  RECORDER-LIQ-1, RECORDER-OI-1, RECORDER-EXCHINFO-1, RECORDER-L2-REGION-2, RECORDER-FUNDING-1 ([Pl] l.43-47) ; les items SERIES-*
  et MAIN-GUARD-REALPATH-1 de §1.3 : P1 en porte la construction pour le seul enregistreur L2, les bougies gardent leurs items.

## 8. Questions (aucune tranchée par le rédacteur ; dix closes par l'orchestrateur [O] ; recommandation du rédacteur entre parenthèses)

« **Close** ([O]) » : réponse de l'orchestrateur du 2026-10-03, inscrite au second pli. Les questions du fondateur et de l'investisseur
(liste C-7 en tête) restent ouvertes ici ; leurs réponses sont inscrites par l'orchestrateur après ce pli.

- **Q-1** (investisseur) : dans quel pays le serveur du site est-il hébergé ([F] l.93-95) ? Bloquant pour tout appel. Répondue le
  2026-10-03 vers 18:50 UTC : France, hors de la liste des pays interdits ; close pour cet hôte ([F] l.128-130).
- **Q-2** (orchestrateur) : borne R-25 de ce chantier : 547 par lot ([Mi] l.12 ; [MT] l.38) ou 1 205 par PR ou fusion ([CI] l.49 ;
  [R] l.20) ? Les deux textes coexistent. Au pli, P1-a grossit : place factice (D-22), gardes de D-21, liquidations brutes (D-12).
  **Close** ([O]) : 547 lignes par lot, mesurées par `r25` local ([MT] l.38), la porte CI de 1 205 restant la borne par PR ([CI] l.49) ;
  le plan de P1 donne la taille de chaque lot, mesurée ou estimée ; un lot qui la dépasse, P1-a d'abord, est scindé, jamais compacté
  ([R] l.9) : D-27 (C-5).
- **Q-3** (fondateur) : quatre parties (P3 et P4 séparées : la dépense et la région du second hôte ne retiennent pas le G7 du premier)
  ou trois (P3 et P4 réunies) ? (quatre, conformes à [R] l.20 selon [Ad] point 9) À clore avant le plan de P1 (C-7).
- **Q-4** (fondateur, RECHERCHES) : l'avis voulait un écrivain sans fichier dérivé ([Av] l.42) ; D-2 écrit les instantanés par minute
  dès P1 ([Mi] l.44). Les admettre comme dérivés rejouables à l'octet, l'admission d'un jour reposant sur le brut seul ? (oui) À clore
  avant le plan de P1 (C-7).
- **Q-5** (RECHERCHES, fondateur) : `timeUnit=MICROSECOND` ou millisecondes par défaut ([F] l.20), fixé pour la vie de l'enregistreur et
  identique sur les deux hôtes ? (microsecondes, si FAITS-L2-ACCESS-2 (c) le confirme pour les trois flux) À clore avant le plan de P1,
  après FAITS-L2-ACCESS-2 (c) (C-7).
- **Q-6** (orchestrateur) : client WebSocket du Node embarqué (aucune dépendance, ping observé par canal, [N]) ou paquet tiers vérifié au
  registre (R-8) ? (embarqué) **Close** ([O]) : client WebSocket embarqué de Node, aucune dépendance (R-8) : D-15.
- **Q-7** (investisseur) : critère chiffré, fixé avant M-1, qui autorise les différences de BNBUSDT et SOLUSDT (part du quota disque et
  de la bande passante, mesurées par M-1 sur le poste local ; part du CPU, mesurée sur l'hôte en P3) ; et M-1 les enregistre-t-elle
  pour mesurer leur coût réel ? (oui, les quatre symboles)
- **Q-8** (fondateur, RECHERCHES) : sans leurs différences, repli pour BNBUSDT et SOLUSDT : (b) instantané REST `limit=5000` par minute,
  gardé brut (poids 250 par symbole et par minute, [F] l.37), ou (c) meilleur prix et transactions seuls ? La voie (a), carnet
  reconstruit sans brut gardé, est écartée : non rejouable (D-3). (b, si le plafond lu par FAITS-L2-ACCESS-2 (b) le permet)
- **Q-9** (orchestrateur, après FAITS-L2-ACCESS-2 (d)) : jour d'un message sans heure de place : celui de l'événement de différences dont
  l'intervalle `U`..`u` contient son `u`, ou celui de sa réception ? (le premier, déterministe entre hôtes si leurs bornes `(U,u)` sont
  les mêmes, M-5 ; à défaut, rupture ouverte ou symbole sans différences gardées, le jour de réception, marqué ; [Ad] point 4)
  **Close** ([O]) : la recommandation du pli : jour de l'événement de différences dont l'intervalle contient `u`, sinon jour de
  réception, marqué ; sans objet si FAITS-L2-ACCESS-2 (d) montre une heure de place sur ce flux (§2.3 point 10).
- **Q-10** (orchestrateur, RECHERCHES) : délai de grâce avant le scellement d'un jour, fixé sur M-6 ; quelle valeur provisoire d'ici là ?
  **Close** ([O]) : valeur provisoire écrite au plan de P1 avec sa source (D-24), fixée sur M-6 ; aucun chiffre ici.
- **Q-11** (investisseur) : mécanisme de quota disque sur le serveur du site, seuils d'alarme et d'arrêt, fixés sur le volume de M-1.
- **Q-12** (orchestrateur) : rejeu d'un jour autonome depuis l'ancre de la dernière minute de la veille et son amorce, ou chaîné depuis
  l'état de fin de la veille (D-9) ? (autonome : chaque dossier se vérifie seul, et l'ancre prise la veille ne laisse aucun événement du
  jour hors du rejeu, [Ad] point 6) **Close** ([O]) : rejeu autonome (D-9).
- **Q-13** (investisseur) : transfert de l'hôte vers le poste local : tirage depuis le poste, par la voie des actes sur l'hôte, à
  chaque scellement, `sha256sum -c` à l'arrivée ? (oui, sous go)
- **Q-14** (investisseur) : conservation sur l'hôte après copie vérifiée ; toute suppression attend son accord ([E] l.38).
- **Q-15** (investisseur) : second hôte : fournisseur, région hors des pays de [F] l.79-81, dépense ; avant tout appel, son pays est
  consigné par une ligne datée du même type que L2-REGION-HOST-1 (C-3).
- **Q-16** (fondateur) : fichiers publics de la place admis pour rattraper un trou de transactions ([F] l.69-71) ?
- **Q-17** (orchestrateur) : alias RECORDER-EXCHANGEINFO-1 ([E] l.437) et RECORDER-EXCHINFO-1 ([E] l.460) : un seul nom ?
  (RECORDER-EXCHINFO-1, l'autre clos par renvoi) **Close** ([O]) : RECORDER-EXCHINFO-1, l'autre nom clos par renvoi (§7).
- **Q-18** (orchestrateur, RECHERCHES) : cadence des empreintes postées : à chaque scellement, ou une fois par semaine ? **Close** ([O]) :
  à chaque scellé du premier mois, puis une fois par semaine (TL-9).
- **Q-19** (fondateur) : liquidations brutes dans P1-a (D-12 : aucun jour perdu au départ ; FAITS-L2-NEWDOCS-1 et FAITS-L2-FUTURES-2
  (c), (d), qui sont des lectures, deviennent prérequis du G1 de P1-a) ou dans P2 ? (P1-a, [Ad] point 9 : l'écrivain n'a aucune logique
  de chaîne pour ce flux, le surcoût est un second type de connexion ; le texte d'avant le pli recommandait P2) À clore avant le plan
  de P1 (C-7).
- **Q-20** (orchestrateur) : D-3 se lit-il sous D-17 : le dossier par symbole et par jour porte l'index du jour, le scellé et les dérivés,
  le brut vivant en segments par connexion qu'il référence ? Ou voie (A) de [Ad] point 2 : brut coupé par jour d'événement à l'écriture
  (§9) ? (D-17 : elle garde D-7 strictement vrai et le jour reconstructible hors ligne) **Close** ([O]) : D-17.
- **Q-21** (orchestrateur) : une connexion combinée par symbole, le flux lu dans l'enveloppe à l'index (D-19), ou une connexion par flux
  en forme brute, un fichier par flux sans enveloppe (trois fois plus de connexions à planifier, décaler et garder) ? (combinée)
  **Close** ([O]) : connexion combinée par symbole (D-19).
- **Q-22** (investisseur) : go pour la journée de mesure M-1 sur le poste local (conditions lues, sortie hors dépôt ; avec C-3 : avant
  tout appel, ligne datée du pays du poste local, L2-REGION-LOCAL-1), au sha relu par RECHERCHES, après le G7 de P1 et avant le plan
  de P3 ? (oui)
- **Q-23** (orchestrateur) : place factice : serveur WebSocket minimal sous `test/`, limité à ce que le client exerce (prise de contact
  HTTP Upgrade, support dans `node:http` à vérifier au plan de P1 ; trames du serveur non masquées ; trames du client masquées
  ([N] l.14376-14378), à démasquer ; trois formes de longueur ; PING, PONG, CLOSE ; fragmentation), lignes comptées dans R-25 (Q-2),
  ou dépendance de développement admise après contrôle du registre (R-8) ? (serveur minimal, aucun paquet tiers ; son prix en lignes,
  mesuré, écrit au plan de P1, avant le G1 ; [Ad] point 8) **Close** ([O]) : serveur WebSocket minimal sous `test/`, son prix en lignes
  mesuré au plan de P1 (D-22, D-24).

## 9. Alternatives rejetées

- Instantané de 20 niveaux par minute ([Pr] l.22) : ne couvre pas la bande B1 ([Au] l.10-12), et le flux partiel est borné à 20
  niveaux ([F] l.26-28).
- Instantané REST `limit=5000` par minute pour BTCUSDT et ETHUSDT, à la place des différences : perd le flux entre deux minutes
  ([Av] l.17-20) et pèse 250 par symbole et par minute ([F] l.37) ; gardé seulement comme repli de Q-8.
- Carnet reconstruit sans brut gardé : non rejouable, contraire à D-3.
- Heure de réception entrelacée dans le fichier de trames : casse l'identité à l'octet entre connexions et entre hôtes (D-7).
- Couper puis rouvrir à la borne de 24 h : un trou à chaque borne (D-8).
- Écrivain sans contrôle de la chaîne en ligne : une rupture ne se verrait qu'au rejeu, sans reprise ; chaque minute après elle serait
  perdue.
- Fichiers publics de la place : aucun carnet ([F] l.59-62), usage non admis sans décision du fondateur ([F] l.69-71).
- Open interest sondé toutes les 5 minutes ([Av] l.28) : la lecture quotidienne de la veille donne le même pas avec moins d'appels
  ([F] l.53-55).
- Hôte du Dōjō ([Pl] l.27 ; D-4).
- Brut coupé par jour d'événement à l'écriture (voie (A) de [Ad] point 2) : exige de lire l'heure d'une trame avant de l'écrire, et
  `@bookTicker` n'en porte pas ([Ad] point 2, [2nd]) ; contraire à D-7.
- Brut par connexion sans coupe : un segment reste ouvert jusqu'à la fin de sa connexion, jusqu'à 24 h ([F] l.16), et retient le scellé
  de chaque jour qu'il touche ; d'où la coupe à l'horloge de réception (D-7).
- Reconnexion planifiée calée sur minuit pour aligner les segments sur le jour : une reconnexion non planifiée (`serverShutdown`, chien
  de garde, erreur) défait l'alignement.
- Un fichier par flux depuis une connexion combinée : router une trame exige de lire son enveloppe avant de l'écrire (D-7).
- Identité des `SHA256SUMS` entre hôtes : jamais égaux, bornes de connexion et chevauchements différents ([Ad] point 3) ; remplacée par
  les empreintes canoniques (D-20).
- Ancre prise vers 00:00 du jour : les événements du jour antérieurs à son `lastUpdateId` sortent du rejeu autonome ([Ad] point 6).
- Reprises sans borne : un instantané plus ancien que le tampon reboucle, chaque essai pesant 250 ([Ad] point 1 ; [F] l.37).
- Écriture sans file bornée : sur un disque lent, la mémoire croît jusqu'à l'arrêt de l'unité par `MemoryMax`, trou sans nom
  ([Ad] point 5 c) ; file bornée et arrêt nommé à la place (D-21).
- Paramètres fixés au G1, sans plan sourcé ni cp-1 bref : spécification ambiguë tranchée en silence (§6.1, FM-1.1) ; D-24 à la place.
- Compacter un lot pour tenir la borne R-25 : interdit ([R] l.9) ; le lot est scindé (D-27).
- Plan de P3 sur la seule foi des tests de P1 : la place factice ne prouve que notre lecture (§6.1, FM-3.2) ; jour réel de M-1 exigé
  (D-25).

## 10. Conséquences

- Positives : carnet, meilleur prix et transactions s'accumulent dès le départ continu ; chaque jour se vérifie hors ligne ; les trous
  sont nommés, jamais comblés ; les gardes des bougies sont reprises et renforcées dès le premier octet. Au pli : le jour se reconstruit
  hors ligne depuis les segments, son index compris ; liaison morte, queue tronquée et contre-pression deviennent des trous nommés ;
  l'identité entre hôtes porte sur des suites canoniques mesurables ; les liquidations partent avec le spot si Q-19 retient P1.
- Négatives : charge sur le serveur du site (bornée par l'unité, M-8) ; volume disque inconnu avant M-1 ; un hôte unique perd ses trous
  jusqu'à P4 (RECORDER-L2-REGION-2) ; chaque sha neuf exige une relecture de RECHERCHES (D-6) ; la profondeur à ±100 pb peut être censurée
  (L2-DEPTH-COVERAGE-1). Au pli : un segment de borne sert deux jours ; un jour ne se scelle qu'après la clôture de ses segments (période
  de coupe et délai de grâce) ; P1-a grossit (second type de connexion, place factice, gardes : Q-2) ; M-1 demande un go de
  l'investisseur sur le poste local (Q-22) ; plusieurs règles reposent sur des faits [2nd] de [Ad] tant que FAITS-L2-ACCESS-2 n'est
  pas lu.
- Au second pli : le plan de P1 passe un cp-1 bref avant le G1 de P1-a (D-24) ; FAITS-L2-ACCESS-2 (D-26) et les questions à clore de
  la liste C-7 précèdent le plan de P1 ; M-1 attend la ligne datée du pays du poste local (L2-REGION-LOCAL-1) et doit sceller un jour
  réel rejoué à l'octet avant le plan de P3, faute de quoi la pièce reste « upcoming » (D-25) ; P1-a est scindé si sa taille estimée
  dépasse 547 (D-27), et l'analogue mesuré, sans WebSocket ni carnet, en fait déjà 1 142 (§1.3) ; §6.1 est relue à la G2 et au G7 de
  chaque partie (aucun mode actif avant clôture, [MA] l.269).
- Registre : si la pièce entre un jour dans un registre public, son fichier PAROXYSME s'ouvre à ce moment, depuis §6 et §7.
- Révision : l'ADR étant au statut « proposé », l'avis [Ad] puis le checkpoint-1 [V] sont pliés en place, sans ADR de révision ; le
  squelette de [Ad] point 13 (ISO/IEC/IEEE 42010 §6.10) s'y répartit : contexte en §1.2, décisions en §0, alternatives en §9,
  conséquences ici.

## 11. Sources (toutes [lu] en entier, sauf mention ; empreintes relevées le 2026-10-03 entre 18:09 et 18:29 UTC, puis à chaque pli)

- [V] checkpoint-1 du validateur-humain `claude-fable-5-1`, verdict ACCEPTE-AVEC-CORRECTIONS, corrections C-1 à C-8, et [O] décisions
  de l'orchestrateur du 2026-10-03 sur dix questions : reçus dans la mission du second pli ; le rapport complet du validateur n'est pas
  lu ici, seules ses corrections transmises. Copie du texte reçu, faite par le worker du second pli :
  `F:/tmp/rech/l2/adr/tmp/MISSION-PLI-2-recu.md` ([V] l.7-15, [O] l.17) ; sha256 de la copie
  `2b93313c1dd5b93345067fa43d207170c99d66e1611118a80cf2798334f0c74a` (l'original est à l'orchestrateur).
- [H] HANDOFF, `docs/HANDOFF-2026-10-02-publication.md` : copie de la branche (590 lignes) ; sha256
  `83b7ab1a71bb2ae5325e56be7e05b38bc431b96fa04fe7e4b17e533a1b83729b` ; l.437-438 identiques à l'octet à celles du tronc (`31e119ec`,
  sha256 `4751b7024a26dc921a234c132e4d13554fc6be08fa427dd86d2ece824d04c943`), lues au second pli ; [lu] l.437-438.
- [MA] corpus de conformité, `docs/06-framework-agents.md`, §6.4 l.267-269, [lu] ;
  sha256 `55559227ff1ff79205c5c01746af00ed6cbb34c6999d0d7738c0f411885360f5`.
- [MC] corpus de conformité, `vibegates/templates/review-checklist.md`, l.33-59 (balayage MAST), [lu] ;
  sha256 `c5556bf2b5ea8a88aa51fc32f9e7b0bdf3e28f26fcd22f51a43bca9d39fbcbd5`.
- [PC] `docs/G0-lot-public-cadence-1.md` l.84 (lecture primaire de l'article MAST par un autre worker, 2026-09-26) ; [lu] l.84 ;
  sha256 `316de30e443a3fd9a41e6fb46864d3d82d37209b7e1b1df24003baaa290bf0fd`.
- [PL] `F:/tmp/rech/l2/adr/PLI.md`, relevé du premier pli, point par point ;
  sha256 `c1402db2a7656ff259b37b0392a009db73969fe1f9d0ff1b68ef8a8c8837ebea` ; il porte « REGLES-MISSION l.35 » (l.31), même
  renvoi que l'erratum du second pli, laissé tel quel (artefact clos). [PL2] `F:/tmp/rech/l2/adr/PLI-2.md`, relevé du second pli.
- Texte d'avant le second pli : `F:/tmp/rech/l2/adr/tmp/ADR-pre-pli-2.md` ;
  sha256 `a9b560f873e65f24c4d7f796973244aed6fd9efa9b611f5c4db56dead64aa789`.
- [Ad] avis de l'advisor `claude-fable-5-1` (effort medium) du 2026-10-03 sur la version `969a730d…` de cette ADR, points 1 à 13 et
  prose, lu en entier dans la mission de pli ; ses faits de place, lus par l'advisor sur la page primaire, sont [2nd] ici
  (FAITS-L2-ACCESS-2) ; copie du texte reçu, faite par le worker du pli : `F:/tmp/rech/l2/adr/tmp/AVIS-advisor-recu.md` ;
  sha256 de la copie `7bfbd5a56810de8315ba9583e0b3a54887ecb97fdd2d23878852fffa724e999f` (l'original est à l'orchestrateur).
- [A0] texte d'avant le pli : `F:/tmp/rech/l2/adr/tmp/ADR-pre-pli.md` ;
  sha256 `969a730d295908f08bff3ceab5d84fe90ac923a879aabad6e474b19060e8461e`.
- [N2] mesure locale du 2026-10-03 à 18:56:19 UTC (modules intégrés de Node, `git grep` du dépôt, `package-lock.json`) :
  `F:/tmp/rech/l2/adr/tmp/pli-mesures-node.out` ; sha256 `c75091d1ac72c37f9e9bbc4467ed496472502f96f2445a9bf11ed1c41a8a4016`.
- [Mi] mission `F:/tmp/rech/l2/adr/mission.md` ;
  sha256 `35c5755bf5248832463079ad80f909b87110638b1594f9db6282ce1ae8da9b4c`.
- [F] `docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md` ; à la rédaction (HEAD `61d69216`, 124 lignes) :
  sha256 `600e6a3da392b14e20546b4df2673fb95dee823ff54e5517e21f5e2cb6de03f1` ; au pli (HEAD `dfdd7e3b`, 130 lignes, l.1-124 identiques
  à l'octet, ajout daté l.125-130) : sha256 `5004b1d35b104416c03692d466318511fe0532a50d6c50a158ff5926f00c6ef8` ; au second pli
  (HEAD `92e19698`, 136 lignes, l.1-130 identiques à l'octet, ajout daté l.131-136, C-6) : sha256
  `4f0cbb34000cea12e70a31af27333b355206bf714d8e96bf19ab47bb3e132791`.
- [Pr] dépôt recherches, `coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-proposition-enregistrement-L2.md` ;
  sha256 `1d7eee5246e6b2332933311a223643527a98f8ad586c63511e6025b8208bd40a`.
- [Au] dépôt recherches, `coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-L2-audit.md` ;
  sha256 `f2d3319a7dee3d1b5046369dfbc2bf6fd50f58c378132fb20298e94411bee196`.
- [Av] dépôt recherches, `decisions/0007-AVIS-advisor-market-L2-recorder-audit.md` ;
  sha256 `f6f30842fa892ed77bca5bdbf59959ad0e01b65f9083a4b5ace5fb511a7e1a70`.
- [Pl] dépôt recherches, `coordination/messages/2026-10-03-MONARK-vers-RECHERCHES-L2-pli-et-depart.md` ;
  sha256 `6aecef4846f81f12b89b033dcfa0c7ef56ba49ef0a77550bdf278f36b27b55a0`.
- Copies des quatre messages de RECHERCHES lues aux chemins de [Mi] l.41.
- [E] `docs/ETAT.md` ; sha256 `2baebf25109a82d0ab28570828443cc4f8fd54fd4f722751cb8d00e2f0589e27`.
- [K] `scripts/record-binance-klines.mjs` (pli : l.1-60 et l.172 relues) ;
  sha256 `6fcee7c07234dee0a75ce98e54bf0f6b98d11b98963419e4fb40fa332f7e8ea5`.
- [C] `scripts/record-coinbase-candles.mjs`, [lu] l.1-40 (en-tête) ;
  sha256 `2221b33e1329782860c369d44adbdc26df21a54900224a3ffff04028698c2691`.
- [S] `docs/marche/FAITS-conditions-series-2026-10-01.md` ;
  sha256 `3b304518b4d6061b32eef1545e1ccfc23f1ae7602218346b934896a1a832d317`.
- [R] `docs/methode/REGLES-MISSION.md` (20 lignes ; décision 300 en l.20, l.35 dans la copie de [Mi]) ;
  sha256 `d86bb19d1a384890cff2cd5d478b90eaa5fc11fe32a632eaf09bfde07001a5d6`.
- Outil `r25` local : `F:/Monark/scripts/oracle/r25.mjs`, réimplémentation du job CI de taille de lot ([MT] l.38), [lu] l.1-7 ;
  sha256 `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` (égal à celui de [Mi] l.13).
- [MT] `docs/adr/ADR-METHODE-2.md` ; sha256 `b7e1e30f6abc8d6ef96674b061b2e91d70283eec113fe0302429ff3d53394c2b`.
- [CI] `.github/workflows/ci.yml`, [lu] l.40-103 par recherche, l.49 et l.82 en entier ;
  sha256 `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a`.
- [U1] `deploy/monark-dojo-collect.service`, [lu] directives par recherche (pli : l.46 relue) ;
  sha256 `e084f0f99c5cd1a0c96a03d76118fb69da68e1c622d67a614c3a6e6b609bb661`.
- [U2] `deploy/monark-sentinel.service`, [lu] directives par recherche (pli : l.52 relue) ;
  sha256 `d526f9c061c44814e0ca73cfeb996259d715c072319fd453caad3f39d4976e46`.
- [N] mesure locale du 2026-10-03 : Node v24.15.0, undici 7.24.4 ; source embarquée `internal/deps/undici/undici`, 17 435 lignes, lues
  aux lignes citées (pli : l.14370-14412, l.14750-14807, l.14972-14990, l.15154-15161, l.15390-15396, même empreinte) ;
  sha256 du texte `d6332aa1ca04f71ffdba505a7e2cb61d15d3e0799bdcc06352a89d6a58ebe475`.
- Forme : gabarit `templates/adr.md` du corpus de conformité (Nygard, ISO/IEC/IEEE 42010 §6.10) ;
  sha256 `ffface97bbf71d4f89dcb6b08b3cd443154cd6993dd5fa0c9af28a5f3286511e`.
