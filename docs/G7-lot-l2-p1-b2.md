# G7 du lot P1-b2 du chantier L2 : chaîne (h) du carnet d'ordres

- **Plan** : `docs/G0-lot-l2-p1-b2.md` ; ligne P1-b2 de `docs/G0-partie-l2-p1.md` §8.2, §4 (S1 à S7, A1 à A3, §4.3), §8.3.
  **Décisions relues** : Q-P1-7 (`90b294bd`), avant le G1 de a3 et ordre topologique (`4d5b70df`), Q-1 à Q-8 de a3 (`b58fd8b5`),
  b1 plié (`6cc209cf`, `lot/etude-suite`).
- **Base** : `e402797a`, fusion `--no-ff` de `origin/recherches/l2-p1-b1` (`29db1863`) dans `origin/lot/l2-p1-a3` (`44d62963`), branche
  locale `recherches/l2-p1-b2-base` ; fusion sans conflit, b1 n'ajoute que ses cinq fichiers. Branche `recherches/l2-p1-b2`. Commits :
  `6bb637a5` (G0), `bdb9c0f3` (tests rouges), `73e61fc7` (code, premier gel), `452b45c1` (G7) ; pli de la G2 : `e32998eb` (tests,
  rouges au premier gel), `9878fb65` (code, **gel**), puis G0 et G7. Rien n'est poussé.
- **Réempilement** (2026-10-04) : la première écriture (`ab67065a`, `675ae717`, `5c3b304b`, étiquette locale `b2-old`, jamais poussée)
  était sur b1 seul (`37128b0`) ; elle est rejouée sur la base neuve, G0 puis tests puis code, et adaptée à a3 et à b1 plié (G0,
  « Réempilement »).

## Pli de la G2 (A CORRIGER, `G2-l2-p1-b2.md`), 2026-10-04

Tests d'abord : au commit `e32998eb`, contre le code du premier gel `73e61fc7`, les six tests rougissent par `ERR_ASSERTION` (la sonde
de B-1 y compte 34 instantanés en 10 s). Puis le code (`9878fb65`).

| Correction | Code | Test | Tueur |
|---|---|---|---|
| B-1 (bloquant) : plafond de 3 instantanés du symbole par 60 s glissantes, réussis compris, attente nommée `sync_suspended` `cause` `window` (celle des n essais : `tries`) | `book.mjs:110-124` | `l2_snapshot_cap_three_per_minute` (sonde de la G2 : un trou tous les trois événements pendant 10 s ; chaque triplet d'instantanés espacé d'au moins 60 s) ; TL-2 avance l'horloge de 60 s avant la rupture et avant le 451 | `:112` `>=` → `>` (déclaré) ; `takes.push` ôté |
| B-2 (bloquant) : tampons de S2 et de la connexion neuve bornés à 1 200, le plus ancien écarté, compté (`counts.trimmed`), nommé une fois par tampon (`buffer_trimmed`) ; `u` ≤ `lastUpdateId` écartés après un essai vain | `:56-64`, `:94-97` | `l2_buffers_bounded_oldest_dropped` (429 de 2 h, 1 300 et 1 299 différences, S4 contre le nouveau premier) ; `S5-U-plus-2` (`dropped` 0 au `chain_synced`) | `:25` `BUFFER_MAX` (déclaré) ; `:59` `<=` → `<` |
| m-1 : Q-B2-1 close (FAITS-L2-ACCESS-3 (d) l.55-58 sur la base, `b078bf1f`) | — | — | — |
| m-2, Q-B2-4 : lignes au filtre PLAIN de a3, `<cid>` hors de la forme de `segments.mjs` refusé par `feed` et `switchTo` | `:27-28`, `:54`, `:133`, `:151` | `l2_book_guards_named` (`10.0.0.1:9443` refusé, code d'erreur portant une adresse écrit `null`) | `:54` PLAIN (déclaré) ; `:133` contrôle du `<cid>` |
| m-3 : `switchTo` de la connexion suivie rend `false`, rien ne change | `:151` | guards : le carnet continue | — |
| m-4 : différence mal formée de la neuve nommée à la bascule pendant une synchronisation | `:158` | `l2_overlap_switch_no_gap` (rig `z`) | `if (next.bad)` → `if (false)` |
| m-5 : arrêt du REST partagé propagé à la différence suivante (`chain_stopped`, `rest_stopped`) | `:132` | guards (451 d'ETHUSDT) | garde ôtée |
| m-6 : arrêt sans code nommé `snapshot_error`, jamais `undefined` | `:86-88` | guards | — |
| m-7 : clé de niveau | — | — | limite déclarée (ci-dessous) |
| Survivants de la G2 : borne u = id + 1 de la bascule (l.138), trou au milieu du rejeu du tampon (l.51, l.105), rupture en cours de rejeu des gardés (l.141), garde du tampon vide et de la fermeture pendant un instantané en vol (l.74), `next.bad` (l.140), tampon remplacé et synchronisation lancée par la bascule (l.133, l.135), formes `U <= u`, `bids` de l'instantané, décimales (l.24, l.28), `bad_symbol` | — | S7 avec trou, bascules de `l2_overlap_switch_no_gap`, guards | tous tués (ci-dessous) |

### Oracle du pli (gel `9878fb65`, Linux, Node v24.21.0)

- `node scripts/red-proof.mjs --base e402797a --gel 9878fb65 --repo /home/user/monark-governance-b2 --draw 6 --seed 37` : **OK**,
  6 tests jugés F2P, 6 tueurs tirés, 6 tués (`RED-PROOF.json` `92c10827…`). Une tentative, aucune troncature du TAP.
- Outil du tronc (`scripts/mutants/run.mjs --base e402797a --file scripts/l2/book.mjs --table`, 19 lignes : les tueurs de §8.2,
  la borne u = id + 1 de la bascule, le plafond, son relevé, la borne des tampons, PLAIN, `<cid>`) : **19 tués sur 19**, base verte,
  restaurations contrôlées (`RESULTS.json` `d44865b0…`).
- Les 49 mutants de la G2, réancrés sur le texte neuf, et 20 neufs, un à un à la main sur le fichier de test entier : 61 tués par
  assertion ; G18 (`halt` ôté du `catch`) fait tourner le carnet sans fin (boucle de micro-tâches : aucune minuterie ne part), donc
  « non conclu » au sens de l'outil, jamais vert ; 7 survivants : G27 (`!s.stopped` de `live`), G38 (remise à zéro de `halt`), G49
  (cartes neuves à S6 : elles sont déjà vides), G36 (`ceil` → `floor`), quasi équivalents déjà notés par la G2 ; N02 (sortie de la
  fenêtre `>=` → `>` : à l'égalité, une attente de 0 ms de plus) ; N05 (`tries` remis à zéro aussi après l'attente du plafond : seule
  la numérotation des essais change, le plafond tient) ; N20 (`trimmed` non remis à zéro à une rupture : un second débordement après
  une rupture n'est pas nommé à nouveau ; non testé, faute de solde).
- `node --test test/l2-*.test.ts` : 41 sur 41, trois passes ; `tsc --noEmit` sortie 0 ; eslint (test) sans erreur ; `gate:vocab` OK ;
  `lint:ratchet` 69/69.

### R-25 du pli

`r25()` contre `e402797a` : **544** (+544/−0 ; c 173, d 58, t 313), sous 547. Solde 3, sous les 10 lignes de §8.1 : aucune
compaction faite. Scission proposée si MONARK applique la règle : b2 au présent gel, et un lot P1-B2-BIS pour N20 et les mineurs à
venir de la G2 neuve (même précédent que P1-B1-BIS) ; tout pli ultérieur de `book.mjs` y va.

### Limites déclarées

- **Clé de niveau** (m-7) : les niveaux sont indexés par la chaîne du prix telle que reçue ; `"0.1"` à zéro ne retire pas
  `"0.10000000"`. La place écrit un format fixe par symbole (FAITS-L2-ACCESS-3 (d) : chaînes) ; une clé normalisée attend une mesure
  de M-1 montrant deux écritures d'un même prix.
- **Une seule connexion neuve en attente** (m-8) : une troisième `<cid>` remplace le tampon de la deuxième ; la rupture qui suit est
  nommée.
- **PLAIN et `<cid>` recopiés** de `links.mjs` l.39 et `segments.mjs` l.28 (non exportés, hors zone) : à importer dès que a4 ou c5
  les exporte.
- **Borne des tampons en nombre**, non en octets ; taille réelle d'une différence à mesurer en M-1.

### Base de la PR

Ne pas ouvrir la PR de b2 contre `main` tant que a3 et b1 n'y sont pas : le diff contre le tronc les contient et passe 547. Deux voies :
(1) PR empilée sur `recherches/l2-p1-b2-base` poussée (base `e402797a`), reciblée sur `main` après les deux fusions ; (2) après la
fusion de a3 puis de b1 (§8.3), `git rebase --onto origin/main e402797a recherches/l2-p1-b2` (b2 n'ajoute que des fichiers neufs :
rejeu propre), red-proof rejoué sur la base neuve ; R-25 reste 544. Choix à MONARK ; rien n'est poussé ici.

## Ce qui a changé à cause de a3 et de b1

| Source | Changement dans b2 | Preuve |
|---|---|---|
| a3, `links.mjs` `SYMBOLS`, `LinkStop` | le carnet prend les symboles de sa liaison ; `bad_symbol` est un `LinkStop` | `l2_book_guards_named` (pli de la G2) |
| a3, `spotUrl`, `STREAMS` | le flux du carnet (`btcusdt@depth@100ms`) est contrôlé comme l'un des flux de `spotUrl` | `l2_h_steps_table`, cas `S1` |
| a3, `openLink` (Q-6) et a2, `readSegment` | cas `S1` : vraie liaison sur la place factice, trames relues du segment brut, données au carnet sous le `<cid>` de la liaison | `l2_h_steps_table`, cas `S1` |
| a3, journal (Q-3 : contrat pour c1) | lignes du carnet dans le même `journal.jsonl`, tête `host_us`, `mono_ns`, `symbol`, `cid`, `event` ; io `wallUs`, `monoNs` (ceux de `LinkIo`) au lieu de `nowUs` | trois tests (champs `host_us`, `cid`) |
| a3, `<cid>` par connexion | `feed(text, cid)` : `cid` obligatoire, celui de la liaison ; bascule entre deux `<cid>` | `l2_overlap_switch_no_gap` |
| b1 plié, `kept` posix | compte d'événements gardés renommé `remaining` (deux sens d'un même nom écartés) ; `S3` contrôle `rest/BTCUSDT/…` | `l2_h_steps_table`, cas `S3` |
| b1 plié, 451 au statut seul | rien : le carnet lit `rest.stopped` après l'échec, vrai dans les deux versions | `l2_chain_gap_named_then_resync` (451) |

## Couverture de §4

| Étape, borne | Test | Cas ou assertion |
|---|---|---|
| S1 : flux nommé, forme combinée avec `timeUnit`, PONG seul | `l2_h_steps_table` | `S1` : chemin de la place, `time_unit` `MICROSECOND` de la ligne `open` de a3, autre flux rendu `false`, trames du client PONG puis CLOSE |
| S2 : tampon, `U` du premier, instantané après le premier, rien avant S6 | `l2_h_steps_table` | `S2` ; tueur `U` du premier (C-4) |
| S3 : `limit=5000`, ligne de `requests.jsonl` | `l2_h_steps_table` | `S3` : appel, genre, poids 250, statut, `kept` posix |
| S4 strict | `l2_h_steps_table`, `l2_chain_gap_named_then_resync` | `S4-sous`, `S4-egal` (deux tamponnés, C-4) ; trois essais vains |
| S5 large, intervalle fermé, Q-P1-7 | `l2_h_steps_table` | `S5-u-egal`, `S5-u-plus-1`, `S5-U-egal`, `S5-U-dedans`, `S5-U-plus-1` (accepté, Q-P1-7), `S5-U-plus-2` (essai vain nommé), `S5-vide` |
| S6 | `l2_h_steps_table` | carnet égal à l'instantané niveau à niveau (`S5-vide`) |
| S7 | `l2_h_steps_table` | tampon dans l'ordre de réception, puis le flux |
| A1 strict des deux côtés | `l2_h_steps_table` | `A1-u-sous`, `A1-u-egal`, `A1-U-plus-1`, `A1-U-plus-2` (rupture nommée, synchronisation neuve) |
| A2 | `l2_h_steps_table` | `A2-pose`, `A2-zero` (`0.00000000` et `0`), `A2-neuf` |
| A3 | `l2_h_steps_table` | `U` = u + 1 passe ; `U` = u + 2 rompt |
| §4.3 TL-2 | `l2_chain_gap_named_then_resync` | rupture, trois essais 1 s à part, suspension de 60 s sans instantané avant son terme, reprise ; 429 avec `Retry-After` ; 451 arrête tout |
| §4.3 TL-6, bascule | `l2_overlap_switch_no_gap` | B tamponnée, `serverShutdown` non lu comme différence, `u` ≤ id écartés, `U` = id + 1 continue, A retirée ; trou à la bascule nommé |
| Formes (G0 point 11) | `l2_h_steps_table` | `event_shape` sur `u` non entier |

Tueurs déclarés (forme close) : `book.mjs:77 CONST "s.buf[0].U"` (steps), `book.mjs:20 CONST "SNAPSHOTS_PER_RESYNC = 3"` (TL-2),
`book.mjs:138 ROR "ev.u > s.id"` (TL-6).

## Oracle (gel `73e61fc7`, Linux, Node v24.21.0)

- `node scripts/red-proof.mjs --base e402797a --gel 73e61fc7 --repo /home/user/monark-governance-b2 --draw 3 --seed 37` : **OK**,
  3 tests jugés F2P (rouges par assertion à la base : import dynamique affirmé, « scripts/l2/book.mjs is absent »), 3 tueurs tirés,
  3 tués (`RED-PROOF.json` `ffea995c…`). Une tentative, aucune troncature du TAP.
- Campagne de l'outil du tronc (`scripts/mutants/run.mjs --base e402797a --file scripts/l2/book.mjs --table`, table de 12 lignes :
  les tueurs de §8.2) : **12 tués sur 12**, base verte, chaque restauration contrôlée (`RESULTS.json` `5408fd7f…`) : S4, `U` noté à
  S2, S5, Q-P1-7 à S5, A1 (`<` et `>`), n, pause, délai, retrait à zéro, borne de la bascule, Q-P1-7 à A1 et à la bascule.
- Rouge au commit des tests `bdb9c0f3` : les trois par `ERR_ASSERTION`. Vert au gel.
- `node --test test/l2-*.test.ts` : 38 sur 38, trois passes de suite ; `tsc --noEmit` sortie 0 ; eslint sur `test/l2-book.test.ts`
  sans erreur (la configuration ignore `scripts/**/*.mjs` et `.d.mts`) ; `gate:vocab` OK ; `lint:ratchet` 69/69.
- L'oracle complet (`scripts/oracle/run.mjs`, racine `F:/tmp`) n'est pas lancé ici ; à MONARK à la fusion, comme pour b1.

## R-25

`scripts/oracle/r25.mjs` contre `e402797a` : 3 fichiers, +405/−0, **405 lignes comptées** (c 153, d 55, t 197), sous 547, solde 142.
Plan : c 105, d 33, t 150 à 238 (288 à 376) ; dépassement de 29 sur l'estimation haute. Compté contre la base du lot : tant que a3 et
b1 ne sont pas au tronc, le diff de b2 contre le tronc les contient et dépasse 547 ; b2 fusionne après eux (§8.3).

## Écarts au plan

- **Taille** : c 153 contre 105 (en-tête de discipline de 14 lignes, tête de journal de a3, bascule et formes) ; d 55 contre 33 ;
  t 197, dans la fourchette. Aucune compaction.
- **§4.2 `A1-U-plus-2`** : la rupture est nommée au journal ; son report au `missing.json` est à c1 (Q-P1-8), non à b2.
- **§4.3 TL-6** : la borne de 24 h et le `serverShutdown` ne déclenchent rien dans le carnet ; la reconnexion planifiée est à a4, et
  la bascule est l'appel `switchTo(cid)` que c5 fera. Le test simule les deux connexions et le `serverShutdown` de l'ancienne ;
  « les deux suites au brut » est à a4 (`l2_overlap_planned_raw`).
- **S1** : la liaison du cas tourne sans minuterie (le chien de garde et les reprises de a3 sont testés en a3) ; le carnet lit le
  segment relu, non le message en direct (Q-B2-3).
- **Garde `bad_symbol`** : sans test propre au premier gel ; testée au pli de la G2.

## Questions pour MONARK

- **Q-B2-1 (close au pli de la G2)** : la première écriture disait FAITS-L2-ACCESS-3 (d) « toujours absent du dépôt » : c'était
  faux. Il est sur la base (`docs/marche/FAITS-L2-ACCESS-3-2026-10-04.md` l.55-58, `b078bf1f`) et le code lit ses noms.
- **Q-B2-2 (tranchée au pli)** : borne propre au carnet, 1 200 par tampon (G0 point 12).
- **Q-B2-3** : recommandation de la G2, reprise ici pour MONARK : un crochet en direct `onText(cid, text)` de `LinkIo`, appelé après
  `c.w.push` (`links.mjs` l.133), et `onOpen(cid)` pour que c5 appelle `switchTo` ; propriétaire a4, au plus tard c5. Relire le
  segment lierait la chaîne à la latence d'écriture.
- **Q-B2-4 (pliée)** : un seul `journal.jsonl`, filtré par PLAIN, `<cid>` contrôlé. À MONARK : faire exporter PLAIN et la forme de
  `<cid>` par a3 (a4 ou c5). Pour c1 : `rest.mjs` `logTimeOffset` (l.171) écrit ce même fichier sans la tête de a3 ni le filtre.
- **Q-B2-5** : solde 3 sous §8.1 : scission en P1-B2-BIS, ou gel accepté tel quel ?

## Autocontrôle

- Aucun réseau : place factice de boucle locale ; `fetch` et `WebSocket` globaux pris au piège.
- Aucune adresse au journal : les champs du carnet sont des nombres, des codes de liste fermée et le `<cid>` de a3.
- Valeurs synthétiques seulement.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans le worktree n'est pas commis.

## Sortie

Pli de la G2 fait ; prêt pour le contrôle par diff de MONARK (ou une G2 neuve) ; fusion après a3 et b1 (§8.3).
