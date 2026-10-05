# G7 du lot L2-P1-c3 (empreintes canoniques et recoupements), par RECHERCHES

Base `e6682efd` (tête de `recherches/l2-p1-c2`) ; branche `recherches/l2-p1-c3` ; commits `44e898a5` (G0), `cb4da9ca` (tests rouges,
`canon.d.mts`, types de `day.d.mts` et `derive.d.mts`), `e757c984` (gel), `a90c95a0` (fusion de `origin/lot/etude-suite` en
`c21bc88d` : PR #148 de c2 fusionnée pendant le lot ; commit de fusion seul, arbre identique à `e6682efd`, aucun changement), puis ce
commit (G7). Poussé sur `origin/recherches/l2-p1-c3`, aucune PR. Node v24.21.0. Aucun réseau : segments écrits par l'écrivain de a2
sous le dossier temporaire du système, ancre écrite à la main, horloges injectées ; données synthétiques, aucune série brute au dépôt.
`packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## Périmètre livré

- `scripts/l2/canon.mjs` (142 lignes), `scripts/l2/canon.d.mts` (28), `test/l2-canon.test.ts` (8 tests, 192 lignes).
- `scripts/l2/day.mjs` : deux lignes changées en place, aucune ajoutée (`:35`, `canon_bound` aux `STOPS` ; `:190`, `index: buckets` au
  contexte du crochet) ; les onze tueurs de c1 gardent leur ligne. `scripts/l2/derive.mjs` : deux lignes changées en place (`:70`,
  paramètre `tap` ; `:116`, `tap?.(ev, book)` après A2 et A3) ; les tueurs de c2 gardent leur ligne.
- `canonDay` (crochet de `sealDay`, Q-C2-2) : aucun fichier, clés de manifeste `canon` et `crosscheck` seules, `modules: ["canon"]` ;
  par flux, `raw_sha256` (charges distinctes par octets, ordre (clé, octets), Q-P1-9) et `fields_sha256` (formes re-sérialisées
  distinctes, ordre (clé, forme)) ; `same_key` et `same_fields` nommés (16 listés au plus, tous comptés), jamais fondus ; `keyless`,
  `foreign` comptés ; sauts de `t` comptés (`jumps`), jamais au `missing.json` ; passage de même clé borné, `canon_bound`.
- `bestTap` : branché sur le rejeu de c2 ; recoupement (ii) ; recoupement (i) par l'union des `[U;u]` du jour.
- Écart au G0 : aucun sur le fond.

## Preuves

- `node scripts/red-proof.mjs --base e6682efd --gel e757c984 --repo /home/user/monark-governance-c3 --draw 8 --seed 37` : sortie 0,
  « red-proof OK: 8 judged, 0 unchanged, 8 killer(s) drawn » ; `RED-PROOF.json` sha256 `35d2826144815a4f…`. Huit tests F2P (rouges par
  assertion à la base : l'import dynamique de `canon.mjs` est affirmé) ; tueurs tirés, tous tués : `:92` CONST (ordre par clé), `:99`
  CONST (fusion par clé, FM-2.4), `:112` ROR (`same_fields`), `:116` ROR (saut de `t`), `:120` ROR (recoupement (i)), `:42` SDL
  (relecture du côté quand le meilleur niveau disparaît), `:97` ROR (`canon_bound`), `:75` ROR (trames d'un autre jour).
- Après la fusion, contre le nouveau tronc : `--base c21bc88d --gel HEAD --draw 8 --seed 37` : sortie 0, « red-proof OK: 8 judged, 0
  unchanged, 8 killer(s) drawn » ; sha256 `4202bbd5c72b6605…`.
- Ancres : `verifie-ancres.mjs . --touched e6682efd HEAD` (et `c21bc88d HEAD`) : 8 tueurs, 8 ANCRE, 0 DERIVE, 0 PERDU ; avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts` : 36 tueurs, 36 ANCRE.
- Mutants de ma main, appliqués un à un sur leur test : les huit tueurs (tués). Équivalents relevés : fusion des intervalles à
  `k1 <= his[last]` au lieu de `+ 1` (appartenance entière inchangée) ; garde `at >= 0` du recoupement (i) (`his[-1]` indéfini donne
  le même compte). Le cas du bord bas de (ii) (`U - 1` → `U`) est tenu par le `u` 104 de `l2_bookticker_crosscheck_counts`.
- `node --test test/l2-*.test.ts` : 87 sur 87. `npm test` complet, une fois, dans le worktree : 2 293 tests, 2 271 réussis, 0 échec,
  22 ignorés, sortie 0.
- `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`, base `e6682efd`, puis `c21bc88d`, même compte) : `STAT` 386 (377 insertions,
  9 suppressions) ; détail : `canon.mjs` 142, `canon.d.mts` 28, tests 192, `day.mjs` 2/2, `derive.mjs` 2/2, `day.d.mts` 5/3,
  `derive.d.mts` 6/2. Borne du lot 547, marge 161 ; `CONTENT_STAT` 0 ; GREEN. Plan : 247 à 322 ; écart déclaré au G0 (le recoupement
  (ii) et la borne nommée).

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C3-1 (trames du jour = index du jour hors `foreign`), Q-C3-2 (`fields_sha256` dédoublonné sur la forme), Q-C3-3 (`keyless` en tête),
Q-C3-4 (recoupement (ii) par le `tap` du rejeu de c2, premier événement d'un carnet posé non jugé), Q-C3-5 (mémoire : environ 36
octets par trame tenue, bornée par `INDEX_BOUND` ; item L2-MINUTES-SIZE-1 étendu proposé), Q-C3-6 (`NAMED_BOUND` = 16), Q-C3-7 (sauts
de `t` sur l'union des connexions), Q-C3-8 (quantités du meilleur niveau telles que reçues).

## Notes pour la suite

- c5 : compose dans cet ordre, `bestTap`, puis `deriveDay({ …, tap })`, puis `canonDay({ …, best: result() })` ; clés de manifeste
  disjointes, `modules` réunis. La mesure conjointe de la mémoire (index, `minutes.jsonl`, empreintes) sous `MemoryMax=512M` se fait
  dans son processus (Q-C3-5).
- c6 : `--from-raw` rappelle le même crochet ; les empreintes ne lisent que des segments déjà listés au `SHA256SUMS` (`used` de c1).
- P3 (TL-9, TL-10) : comparer `raw_sha256`, puis `fields_sha256` si M-5 réfute l'identité à l'octet ; `foreign` et `same_*` lus avec.
- Items : L2-TRADE-ID-CONSEC-1 (sauts par connexion en M-1), L2-BOOKTICKER-U-1 (`same_key` de `bookTicker` en M-1 et M-5),
  L2-LIQ-DEDUP-1 (`same_fields` de `forceOrder` en M-5), L2-BOOKTICKER-GAP-1 (test `l2_bookticker_crosscheck_counts` ; clôture au G7 de
  P1-bis).
- MAST FM-2.4 : `l2_canonical_same_key_named`, tueur `:99`.

## G2 (2026-10-05, APPROUVE SOUS RÉSERVE ; réserve m-1, mineurs m-2 à m-7, notes n-1 à n-7) : pli

Pièce : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c3.md`, sur la tête `62ec6c63`. Tronc
`origin/lot/etude-suite` relu (refspec explicite) : toujours `c21bc88d`, aucune fusion. Commits du pli : `3d0fc7da` (tests rouges et
cas de durcissement), `254554fa` (gel), puis ce commit (G0 et G7). Le pli change en place quatre lignes de production, aucune
ajoutée : `canon.mjs:12-13` (en-tête), `:25` (`RUN_BOUND`), `:87`, `:97` ; `day.mjs:35` (`canon_reread` aux `STOPS`, ligne déjà
changée par le lot) ; et un commentaire de type dans `canon.d.mts` et `day.d.mts`. Les 8 tueurs du lot et les 28 de c1 et c2 gardent
leur ligne.

### Pli

- **m-1 (réserve, levée par (a), (b) et (c))** :
  - (a) `canon.mjs:97` : `2 * held > bound`. Le passage tient ses octets, puis ses formes : la borne compte les deux. Choisi contre
    les deux passes, parce que les formes doivent être tenues ensemble pour être triées, et qu'une seconde relecture du passage
    coûte une lecture par trame. Justification et mesures au G0, point 6.
  - (b) Mesures au G0 (point 6) et chiffres de Q-C3-5 corrigés : 8 o par `@bookTicker`, 16 o par intervalle fusionné, 16 o par
    changement de `bestTap` (32 au doublement). Index au ras de la borne : RSS max 324 Mo sans crochet, 439 Mo avec `canonDay`.
    Passage de 62 Mo : au gel du lot, OOM fatal de V8 sous un tas de 120 Mo (reproduit, sortie 134) ; au pli, `canon_bound` nommé,
    RSS max 96 à 97 Mo. Passage de 33 Mo, sous la nouvelle borne : scellé sous un tas de 120 Mo, RSS max 302 Mo.
  - (c) L2-MINUTES-SIZE-1 étendu (voir Items), avec l'arithmétique : 439 Mo plus 131 Mo de minutes dépasse 512 Mo.
  - Test `l2_canon_run_bound_named`, recalé sur le double des octets. Tueur `:97 CONST "2 * held > bound" -> "held > bound"`.
- **m-2** : `l2_crosscheck_nested_interval`, tueur `:118 CONST`.
- **m-3** : `l2_canonical_diff_key_both_parts`, tueur `:96 CONST`. La connexion lue d'abord porte `[101;103]` : le mutant de `:92`
  (départage par `u` retiré) est tué aussi.
- **m-4** : `l2_forceorder_forms_sorted`, tueur `:107 CONST`. `fields_sha256` de `@forceOrder` est affirmé à sa forme close.
- **m-5** : `l2_trade_id_largest_jump_first`, tueur `:116 CONST`.
- **m-6** : `l2_crosscheck_floor_low_edge`, tueur `:34 ROR`. (i) et (ii) dans un même jour, `best` passé à la main.
- **m-7** : `l2_best_tap_fresh_book_edges`, tueur `:51 CONST` (le mutant de `:49`, `top` des asks au sens des bids, est tué aussi) ;
  `l2_canonical_named_bound`, tueur `:103 ROR` (le mutant de `:136`, `first` à 17, est tué aussi).
- Un tueur par test (forme close de red-proof). Les cas sont donc des tests à part, non des assertions ajoutées aux tests existants :
  ceux-ci gardent leur tueur.
- **n-2 (corrigé)** : `canon.mjs:87`, changée en place. Si une entrée de l'index du jour n'est pas relue, arrêt nommé
  `canon_reread`, rien d'écrit. Test `l2_canon_index_all_read` (index forgé d'une entrée, rang 9, qu'aucun segment ne porte). Tueur
  `:87 CONST "x.at !== x.n" -> "false"`.
- **n-4 (porté au G0)** : définition de la forme, point 4.

### Tueurs appliqués à la main (tests de durcissement, verts à `62ec6c63` par nature)

Un à la fois sur `254554fa`, le test seul rejoué, `canon.mjs` restauré et son sha256 vérifié égal après chaque tir. Tous rougissent
par assertion.

| Test | Tueur, ou mutant du G2 | Issue |
|---|---|---|
| `l2_crosscheck_nested_interval` | `:118` `Math.max(his[last], k2)` → `k2` | tué |
| `l2_canonical_diff_key_both_parts` | `:96` `st.k2[perm[j]] === st.k2[perm[i]]` → `true` ; `:92` sans `\|\| cmp(st.k2…)` | tués |
| `l2_forceorder_forms_sorted` | `:107` `cmp(p.f, q.f)` → `0` | tué |
| `l2_trade_id_largest_jump_first` | `:116` `Math.max(max ?? 0, k1 - prev)` → `k1 - prev` | tué |
| `l2_crosscheck_floor_low_edge` | `:34` `a[mid] <= x` → `a[mid] < x` | tué |
| `l2_best_tap_fresh_book_edges` | `:51` `day ? 1 : 0` → `1` ; `:49` `top(b.asks, false)` → `true` | tués |
| `l2_canonical_named_bound` | `:103` `<` → `<=` ; `:136` `<` → `<=` | tués |
| `l2_canon_run_bound_named` | `:97` → `held > bound` (déclaré) | tué |
| `l2_canon_index_all_read` | `:87` → `false` (déclaré) | tué |

Le bord de la borne, `:97` `2 * held > bound` → `>=`, rougit `l2_canon_run_bound_named` par une erreur (`ENOENT` sur le
manifeste du jour non scellé), et non par une assertion. Il n'est pas déclaré.

### Preuves du pli

- Pli : `node scripts/red-proof.mjs --base 62ec6c63 --gel 254554fa --repo /home/user/monark-governance-c3 --draw 2 --seed 37`.
  Sortie 1, « red-proof REFUSED: 9 judged, 7 unchanged, 2 killer(s) drawn » ; `RED-PROOF.json` sha256 `2f60f866b06adcb5…`.
  - Deux tests F2P, rouges à la base par assertion : `l2_canon_run_bound_named`, `l2_canon_index_all_read`. Leurs tueurs `:97`
    et `:87` sont tirés et tués.
  - Le refus vient des sept tests de durcissement, verts à la base par nature : voir les tueurs appliqués à la main.
- Lot entier, contre le tronc : `node scripts/red-proof.mjs --base c21bc88d --gel 254554fa --repo /home/user/monark-governance-c3
  --draw 16 --seed 37`. Sortie 0, « red-proof OK: 16 judged, 0 unchanged, 16 killer(s) drawn » ; sha256 `4485dbc489bc820a…`. Les
  16 tests sont F2P et les 16 tueurs sont tués.
- Ancres : `verifie-ancres.mjs . --touched c21bc88d HEAD` donne 16 tueurs, 16 ANCRE, 0 DERIVE, 0 PERDU. Avec
  `--files test/l2-day.test.ts,test/l2-derive.test.ts,test/l2-canon.test.ts` : 44 tueurs, 44 ANCRE.
- `node --test test/l2-*.test.ts` : 95 sur 95. `npm test` complet, une fois, dans le worktree : 2 301 tests, 2 279 réussis, 0 échec,
  22 ignorés, sortie 0.
- Autres contrôles : `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()`, base `c21bc88d`) : `STAT` 465 (456 insertions, 9 suppressions). Détail : `canon.mjs` 142, `canon.d.mts` 28,
  tests 271, `day.mjs` 2/2, `derive.mjs` 2/2, `day.d.mts` 5/3, `derive.d.mts` 6/2. Le pli seul, contre
  `62ec6c63` : 89 insertions, 10 suppressions. Borne du lot 547, marge 82 ; `CONTENT_STAT` 0 ; GREEN.

### Avis du G2 sur Q-C3-1 à Q-C3-8, et suite donnée

- **Q-C3-1** : oui. Suite : n-1, renvoyé à TL-9 (voir Notes pour c5 et P3).
- **Q-C3-2**, **Q-C3-3** : oui.
- **Q-C3-4** : oui. L'angle mort est d'un événement par synchronisation, compté. L'ordre de composition est imposé : voir n-5.
- **Q-C3-5** : non tel quel. Suite : chiffres corrigés et arithmétique conjointe au G0 (point 6, Q-C3-5) ; borne sur le double des
  octets (m-1) ; L2-MINUTES-SIZE-1 étendu.
- **Q-C3-6** : oui, avec un test de la borne. Suite : `l2_canonical_named_bound` (m-7).
- **Q-C3-7** : oui. La mesure par connexion reste à M-1.
- **Q-C3-8** : oui. Suite : n-7, déclaré pour c5.

### Notes renvoyées (G0 de c5, sauf mention)

- **n-5** : une seule variable `scale` pour `bestTap` et `deriveDay`. À la fusion des manifestes de c2 et c3, une garde de clés
  disjointes, sur le modèle de `stray_file`.
- **n-6** : (ii) vérifie la présence d'un `u`, pas sa valeur. Un recoupement de valeur (b, B, a, A du ticker contre le meilleur
  niveau du carnet quand le `u` du ticker égale le `u` d'une différence) est un item pour M-1.
- **n-7** : `bestTap` compare les quantités telles que reçues, la parité de c2 les normalise (`norm`). Sans effet, la place écrivant
  à précision fixe ; l'écart entre modules est déclaré ici et à reprendre au G0 de c5.
- **n-3** : avec `canonDay`, le scellé passe de 39 à 99 s à 4,1 M trames (seconde lecture de chaque segment, un `readSync` par
  trame). À déclarer au calendrier du scellé, au G0 de c5.
- **n-1** (P3) : TL-9 cite `foreign` à côté des empreintes, pour qu'un écart entre hôtes ne soit pas lu comme une réfutation de
  L2-BYTE-IDENTITY-1.

### Items

- **L2-MINUTES-SIZE-1 (étendu au pli du G2 de c3, m-1)** : mesure conjointe dans le processus de c5, sous cgroup
  `MemoryMax=512M` (D24-4) : index au ras de `INDEX_BOUND`, minutes de c2 au ras de `MINUTES_BOUND`, empreintes de c3 avec un passage
  au ras de `RUN_BOUND`. **Déclencheur : avant le premier scellé sous l'unité dans c5.**
  - Arithmétique : 439 Mo de RSS pour l'index et `canonDay`, plus au moins 131 Mo de minutes vivantes, dépasse 512 Mo. Un passage
    près de la borne (≈ 230 Mo de RSS en plus) sur un index moyen le dépasse aussi.
  - À défaut de cette mesure, c5 scelle avec des bornes provisoires : `MINUTES_BOUND` 64 Mio et `bound` de `canonDay` 32 Mio.
