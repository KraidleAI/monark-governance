# G0 du lot P1-b2 du chantier L2 : chaîne (h) du carnet d'ordres

- **Rattachement** : ADR-L2-CAPTURE-1 (D-8, D-24, TL-2, TL-6, D-27 : 547 lignes par lot au gel) ; plan `docs/G0-partie-l2-p1.md` §2
  (D24-2), §3 point 7, §4 (S1 à S7, A1 à A3, §4.3), §7, §8.2 (ligne P1-b2), §8.3 ; faits `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md`
  (e) et (h), `docs/marche/FAITS-L2-ACCESS-1-2026-10-03.md` l.21-25.
- **Q-P1-7 tranchée** (prérequis du G1, §8.3) : bloc daté « Décision de l orchestrateur sur Q-P1-7 (2026-10-04, 02:2x UTC) » du plan,
  commit `90b294bd` (branche `origin/lot/etude-suite`), absent de la copie du plan de cette branche : lecture de chaîne. Après S5, un
  premier événement restant dont `U` = `lastUpdateId` + 1 est accepté, sans nouvel instantané ; même règle à la bascule (§4.3) ;
  `S5-U-plus-2` reste un essai vain nommé. Le bloc du 2026-10-03 21:33 UTC de la copie de la branche dit déjà « lecture de chaîne ».
- **Base** : `e402797a`, fusion `--no-ff` de `origin/recherches/l2-p1-b1` (`29db1863`, b1 plié) dans `origin/lot/l2-p1-a3`
  (`44d62963`, a3 avec a1 et a2), branche locale `recherches/l2-p1-b2-base` (voir « Réempilement »). Branche `recherches/l2-p1-b2`.
  Auteur : RECHERCHES, en partage de charge (demande de MONARK `2026-10-04-MONARK-vers-RECHERCHES-trois-taches.md` §1.1). Aucun
  réseau : place factice de boucle locale de P1-a1, instantanés servis par son REST au client de b1.
- **Dépendances** (§8.3 : b2 sur a3 et b1) : les deux sont sur la base. Le carnet reçoit les messages texte d'une connexion par
  `feed(text, cid)`, `cid` étant le `<cid>` de la liaison de a3 ; c5 branchera les liaisons (Q-B2-3).

## Contenu (fichiers de §8.2)

`scripts/l2/book.mjs`, `scripts/l2/book.d.mts`, `test/l2-book.test.ts`. Couture : `createBook(io)`, io = { `symbol`, `rest` (client de
b1), `wallUs`, `monoNs` (les deux horloges de `LinkIo` de a3), `sleep(ms)`, `out` } ; ni minuterie ni horloge prises au processus.

1. **S1** : le carnet nomme le flux qu'il lit, `<symbole en minuscules>@depth@100ms` ; un message de la connexion combinée dont `stream`
   diffère (meilleur prix, transactions) est ignoré, rendu `false`. L'URL combinée, `timeUnit` et les PONG sont à a3 ; le cas `S1`
   ouvre une vraie liaison de a3 (`openLink`, `spotUrl`) sur la place factice, relit les trames de son segment brut par le lecteur de
   a2 (`readSegment`) et les donne au carnet sous le `<cid>` de la liaison ; le flux du carnet est contrôlé contre `spotUrl`.
2. **S2** : événements tamponnés tant que le carnet n'est pas posé ; l'instantané est demandé après le premier, jamais avant ; aucun
   appliqué avant S6.
3. **S3** : instantané par `rest.request("depth", symbole)` de b1 (`limit=5000`, poids 250, ligne de `requests.jsonl`, corps gardé).
4. **S4** : `lastUpdateId` strictement inférieur au `U` du PREMIER tamponné : essai vain `snapshot_before_buffer`, instantané suivant.
5. **S5** : tamponnés de `u` ≤ `lastUpdateId` écartés (comptés) ; premier restant de `U` > `lastUpdateId` + 1 : essai vain
   `first_event_after_snapshot` (Q-P1-7). `S5-vide` : carnet posé ; l'événement suivant passe A1, dont le test est le même sous Q-P1-7
   (`U` ≤ identifiant + 1) ; seul écart : un `u` = `lastUpdateId` y est appliqué sans effet au lieu d'écarté, et un échec est une
   rupture nommée suivie d'une synchronisation neuve.
6. **S6, S7** : carnet posé à l'instantané, identifiant = `lastUpdateId` ; tampon appliqué dans l'ordre de réception, puis le flux.
7. **A1 à A3** : `u` < identifiant : ignoré ; `U` > identifiant + 1 : rupture `chain_gap` nommée, carnet jeté, l'événement fautif
   ouvre le tampon d'une synchronisation neuve ; quantité posée telle que reçue (chaîne décimale, jamais re-sérialisée), niveau retiré si
   elle vaut zéro (`0`, `0.00000000`) ; identifiant = `u`.
8. **Reprises bornées** (D24-2) : n = 3 instantanés par reprise, pause de 1 s entre deux essais, puis `sync_suspended` de 60 s avant une
   reprise neuve ; un instantané qui échoue est un essai vain nommé de son code de b1 ; 429 et 418 : aucun instantané avant la fin de
   la suspension de b1 ; un arrêt de b1 (451, 418 sans `Retry-After`, plus de 3 jours) arrête le carnet, `chain_stopped`. Plafond
   (pli de la G2, B-1) : au plus 3 instantanés du symbole dans toute fenêtre glissante de 60 s, réussis compris, sinon attente nommée
   `sync_suspended` (`cause` `window`, celle des n essais étant `tries`) ; c'est l'hypothèse chiffrée de D24-2 (« deux salves d'un même
   symbole ne partagent jamais une minute », pire minute 4 000). Un arrêt du client REST partagé (451 d'un autre symbole) arrête le
   carnet à la différence suivante (`chain_stopped`, `rest_stopped`).
9. **Bascule** (§4.3, D-8) : `feed` d'une autre connexion tamponne ; `switchTo(cid)` écarte ses `u` ≤ identifiant, applique le reste par
   A1 (Q-P1-7 : `U` = identifiant + 1 continue) et retire l'ancienne, dont les messages sont ensuite ignorés (elle reste au brut, a4).
   Pendant une synchronisation, le tampon de la neuve remplace celui de l'ancienne. Une différence mal formée de la neuve est nommée à
   la bascule (`event_shape`), synchronisé ou non. `switchTo` rend `false`, sans rien changer, pour la connexion suivie, une chaîne qui
   n'est pas un `<cid>` de a3, ou un carnet arrêté ou fermé.
10. **Journal** : lignes du `journal.jsonl` de la liaison, liste fermée `chain_synced`, `sync_try_vain`, `sync_suspended`, `chain_gap`,
    `chain_switched`, `chain_stopped`, `buffer_trimmed`, tête de ligne de a3 (`host_us`, `mono_ns`, `symbol`, `cid`, `event`, Q-3 de
    a3), puis les champs, chaque chaîne passée au filtre PLAIN de a3 (`links.mjs` l.39 : écrite `null` si elle porte un point ou deux
    points) ; un `cid` qui n'est pas de la forme de `segments.mjs` l.28 est refusé par `feed` et `switchTo`, jamais écrit. Les deux
    expressions sont recopiées dans `book.mjs` : a3 ne les exporte pas, et ses fichiers sont hors de la zone du lot. c1 porte les
    ruptures au `missing.json` du jour (Q-P1-8).
11. **Forme** : `U`, `u` entiers sûrs, `U` ≤ `u`, niveaux en paires de chaînes décimales ; sinon rupture `event_shape` (différence) ou
    essai vain `snapshot_shape` (instantané).
12. **Tampons bornés** (pli de la G2, B-2) : le tampon de S2 et celui de la connexion neuve (`s.next`) gardent chacun leurs
    `BUFFER_MAX` = 1 200 événements les plus récents ; au-delà, le plus ancien est écarté, compté (`counts.trimmed`) et nommé une fois
    par tampon (`buffer_trimmed`, `buffer` = `sync` ou le `<cid>`, `bound`). Après un essai vain sur un instantané lisible, les
    événements de `u` ≤ `lastUpdateId` sont écartés aussi (un instantané suivant a un `lastUpdateId` au moins égal). Chiffre : 1 200 =
    120 s de différences à 100 ms (§3 point 2 : 10 par seconde). La plus longue attente que le carnet s'impose lui-même entre un
    événement tamponné et la réponse d'un instantané est la suspension de 60 s de D24-2 (ou l'attente du plafond, au plus 60 s), plus le
    délai de 30 s d'une requête de b1 (`TIMEOUT_MS`) : 90 s, sous 120 s. Au-delà (suspension de b1 jusqu'à 3 jours, REST injoignable,
    connexion neuve jamais basculée), garder plus ne sert à rien : un instantané lu ensuite a un `lastUpdateId` postérieur aux
    événements écartés, que S5 écarterait de toute façon. Écarter le plus ancien est sûr : S4 compare au `U` du nouveau premier, et un
    instantané trop ancien pour le tampon gardé est un essai vain nommé, jamais un carnet faux. Mémoire : borne en nombre, non en
    octets ; huit tampons au plus (quatre symboles, deux tampons chacun) ; taille réelle d'une différence mesurée en M-1.
## Tests (les trois de §8.2, et trois du pli de la G2), tueurs

Chaque test charge le module par un import dynamique qu'il affirme : la base, sans `scripts/l2/book.mjs`, rougit par assertion.
- `l2_h_steps_table` : un cas par étape et par borne de §4.1 et §4.2 (S1, S2, S3, S4-sous, S4-egal, S5-u-egal, S5-u-plus-1,
  S5-U-egal, S5-U-dedans, S5-U-plus-1, S5-U-plus-2, S5-vide, S6, S7, A1-u-sous, A1-u-egal, A1-U-plus-1, A1-U-plus-2, A2-pose,
  A2-zero, A2-neuf, A3) ; tueur déclaré : `U` du premier tamponné (C-4 du cp-1).
- `l2_chain_gap_named_then_resync` (TL-2) : rupture, instantané neuf et reprise ; instantané antérieur au tampon ; trois essais vains,
  suspension de 60 s sans instantané avant son terme, reprise ; 429 ; 451 ; tueur déclaré : n.
- `l2_overlap_switch_no_gap` (TL-6) : deux connexions chevauchantes, `serverShutdown` de l'ancienne, bascule sans rupture, une seule
  suite au carnet ; tueur déclaré : borne d'écart de la bascule.
- `l2_snapshot_cap_three_per_minute` (B-1, sonde de la G2) : un trou tous les trois événements pendant 10 s de temps de la place ;
  jamais plus de 3 instantanés en 60 s glissantes, attente nommée ; tueur déclaré : borne du plafond (`>=` ou `>`).
- `l2_buffers_bounded_oldest_dropped` (B-2) : 429 de 2 h, 1 300 différences sur la connexion suivie et 1 299 sur une neuve ; 1 200
  gardées chacune, un `buffer_trimmed` par tampon, S4 contre le nouveau premier ; tueur déclaré : `BUFFER_MAX`.
- `l2_book_guards_named` (mineurs de la G2) : `bad_symbol`, filtre PLAIN, `<cid>` refusé, arrêt sans code, formes (`U` > `u`, prix
  `1e3`, quantité `abc`, `bids` d'instantané), `switchTo` de la connexion suivie, arrêt du REST partagé ; tueur déclaré : PLAIN.
- Campagne de l'outil du tronc (`scripts/mutants/run.mjs`) sur les tueurs de §8.2 : S4, S5, A1 (deux), n, délai, pause, retrait à zéro,
  `U` noté à S2, Q-P1-7 (S5 et bascule).

## Taille

Plan : c 105, d 33, t 150 à 238 (288 à 376). Borne 547. Au pli de la G2 (gel `9878fb65`) : 544 (c 173, d 58, t 313), solde 3,
sous les 10 lignes de §8.1 : aucune compaction, scission proposée au G7.

## Questions pour MONARK

- **Q-B2-1 (close, pli de la G2)** : FAITS-L2-ACCESS-3 (d) est sur la base (`docs/marche/FAITS-L2-ACCESS-3-2026-10-04.md`
  l.55-58, commit `b078bf1f`, ancêtre de `e402797a`) : `b`, `a`, `U`, `u` de `depthUpdate`, `lastUpdateId`, `bids`, `asks` de
  `depth`, niveaux `[prix, quantité]` en chaînes ; le code lit ces noms. La phrase « n'est pas au dépôt » de la première écriture était
  fausse.
- **Q-B2-2 (tranchée au pli de la G2)** : borne propre au carnet, dans b2 (point 12).
- **Q-B2-3** : `openLink` de a3 donne chaque message au seul écrivain de segments (`links.mjs` l.129-135) ; aucun crochet ne le donne
  au carnet. Recommandation (G2) : un crochet en direct `onText(cid, text)` de `LinkIo`, appelé après `c.w.push` (`links.mjs`
  l.133), et `onOpen(cid)` pour que c5 appelle `switchTo` ; propriétaire a4, au plus tard c5. Relire le segment lierait la chaîne à
  la latence d'écriture ; sans crochet, les reconnexions non planifiées s'empileraient dans `s.next` (borné, point 12).
- **Q-B2-4 (pli de la G2)** : un seul `journal.jsonl` (contrat de Q-3 de a3), filtré par PLAIN, `<cid>` contrôlé (point 10).
  À MONARK : exporter PLAIN et l'expression de `<cid>` de a3 (a4 ou c5), pour que `book.mjs` les importe au lieu de les recopier.

## Réempilement (2026-10-04, RECHERCHES)

MONARK a rappelé que b2 dépend de a3 et de b1 (§8.3 ; bloc daté 02:3x UTC, commit `4d5b70df`) ; la première écriture (`ab67065a`,
`675ae717`, `5c3b304b`, gardée en étiquette locale `b2-old`, jamais poussée) était empilée sur b1 seul (`37128b0`).
- **Base neuve** : `git checkout -B recherches/l2-p1-b2-base origin/lot/l2-p1-a3` (`44d62963`) puis `git merge --no-ff
  origin/recherches/l2-p1-b1` (`29db1863`) : fusion sans conflit (`e402797a`) ; b1 n'ajoute que ses cinq fichiers à a3.
- **Décisions relues** : Q-P1-7 (`90b294bd`) inchangée ; Q-1 à Q-8 de a3 (`b58fd8b5`), dont Q-3 (contrat du journal pour c1) et Q-6
  (`openLink({ symbol, url, out }, io)`) ; `4d5b70df` (ordre topologique, b2 après a3) ; b1 plié (`6cc209cf`).
- **Ce qui change** : (1) symboles du carnet pris de la liste de la liaison (`links.mjs` `SYMBOLS`, arrêt `LinkStop` `bad_symbol`) ;
  (2) lignes du journal à la tête de a3, `host_us` au lieu de `at_us`, `mono_ns` et `cid` ajoutés, io `wallUs`/`monoNs` au lieu de
  `nowUs` ; (3) `cid` obligatoire, celui de la liaison ; (4) le compte d'événements gardés s'appelle `remaining` (le `kept` de b1 est
  désormais un chemin posix : un même nom pour deux sens dans deux journaux voisins est écarté) ; (5) cas `S1` sur une vraie liaison
  et le lecteur de a2, plus de connexion `.example` à la main ; `S3` contrôle le `kept` posix de b1. Le 451 posé au statut seul (b1
  plié) ne change rien au carnet : il lit `rest.stopped` après l'échec, vrai dans les deux versions.

## Pli de la G2 (A CORRIGER, `G2-l2-p1-b2.md`, 2026-10-04, RECHERCHES)

Tests d'abord (rouges au gel `73e61fc7`, les six par `ERR_ASSERTION`), puis le code. Bloquants : B-1 (point 8, plafond glissant de
3 instantanés par 60 s, réussis compris) ; B-2 (point 12, tampons bornés à 1 200, le plus ancien écarté et nommé, écart de `u` ≤
`lastUpdateId` après un essai vain). Mineurs : m-1 (Q-B2-1 close) ; m-2 et Q-B2-4 (PLAIN, `<cid>`) ; m-3 (`switchTo` de la
connexion suivie refusé) ; m-4 (différence mal formée de la neuve nommée pendant une synchronisation) ; m-5 (arrêt du REST partagé
propagé à la différence suivante) ; m-6 (`chain_stopped` porte `snapshot_error`, jamais `undefined`) ; m-7 (clé de niveau : limite
déclarée au G7) ; survivants de la G2 tués par des cas neufs (G7). m-8 (une seule connexion neuve en attente) : laissé, sûr.
