# G7 du lot P1-b2 du chantier L2 : chaîne (h) du carnet d'ordres

- **Plan** : `docs/G0-lot-l2-p1-b2.md` ; ligne P1-b2 de `docs/G0-partie-l2-p1.md` §8.2, §4 (S1 à S7, A1 à A3, §4.3), §8.3.
  **Décisions relues** : Q-P1-7 (`90b294bd`), avant le G1 de a3 et ordre topologique (`4d5b70df`), Q-1 à Q-8 de a3 (`b58fd8b5`),
  b1 plié (`6cc209cf`, `lot/etude-suite`).
- **Base** : `e402797a`, fusion `--no-ff` de `origin/recherches/l2-p1-b1` (`29db1863`) dans `origin/lot/l2-p1-a3` (`44d62963`), branche
  locale `recherches/l2-p1-b2-base` ; fusion sans conflit, b1 n'ajoute que ses cinq fichiers. Branche `recherches/l2-p1-b2`. Commits :
  `6bb637a5` (G0), `bdb9c0f3` (tests rouges), `73e61fc7` (code, **gel**), puis ce G7. Rien n'est poussé.
- **Réempilement** (2026-10-04) : la première écriture (`ab67065a`, `675ae717`, `5c3b304b`, étiquette locale `b2-old`, jamais poussée)
  était sur b1 seul (`37128b0`) ; elle est rejouée sur la base neuve, G0 puis tests puis code, et adaptée à a3 et à b1 plié (G0,
  « Réempilement »).

## Ce qui a changé à cause de a3 et de b1

| Source | Changement dans b2 | Preuve |
|---|---|---|
| a3, `links.mjs` `SYMBOLS`, `LinkStop` | le carnet prend les symboles de sa liaison ; `bad_symbol` est un `LinkStop` | — (garde d'entrée, sans test propre) |
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
- **Garde `bad_symbol`** : sans test propre (une ligne).

## Questions pour MONARK

- **Q-B2-1** : FAITS-L2-ACCESS-3 (d) (noms `b`, `a` de `depthUpdate`, `bids`, `asks` de `depth`) toujours absent du dépôt ; à
  confirmer avant la fusion (le code rompt en `event_shape` ou rate en `snapshot_shape`).
- **Q-B2-2** : tampon de S2 non borné en nombre (environ 600 événements pendant une suspension de 60 s) ; borne propre au carnet,
  ou item ?
- **Q-B2-3** : `openLink` donne chaque message au seul écrivain de segments (`links.mjs` l.129-135). c5 nourrit-il le carnet depuis le
  segment relu (comme `S1`), ou a4 ajoute-t-il un crochet `onText(cid, text)` à `LinkIo` ?
- **Q-B2-4** : les lignes du carnet partagent `journal.jsonl` avec la liaison, sans le filtre PLAIN de a3 (aucun champ du carnet ne
  vient de la place hors nombres, codes et `<cid>`). Le contrat de Q-3 pour c1 l'admet-il, ou le carnet doit-il écrire son propre
  fichier ?

## Autocontrôle

- Aucun réseau : place factice de boucle locale ; `fetch` et `WebSocket` globaux pris au piège.
- Aucune adresse au journal : les champs du carnet sont des nombres, des codes de liste fermée et le `<cid>` de a3.
- Valeurs synthétiques seulement.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans le worktree n'est pas commis.

## Sortie

Prêt pour la G2 du lot (RECHERCHES, instance neuve) et le contrôle par diff de MONARK ; fusion après a3 et b1 (§8.3).
