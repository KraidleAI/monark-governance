# G7 du lot L2-P1-c2 (rejeu du carnet, minutes et parité), par RECHERCHES

Base `173ea0fd` (`lot/etude-suite`, c1 #143 et #144 fusionnés) ; branche `recherches/l2-p1-c2` ; commits `bff0ffc3` (G0), `1fee9d2e`
(tests rouges, `derive.d.mts`, type du crochet dans `day.d.mts`), `6a263a27` (gel), puis ce commit (G7). Aucun push, aucune PR.
Node v24.21.0. Aucun réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, ancres et instantanés écrits à
la main, horloges injectées ; données synthétiques, aucune série brute au dépôt. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.
Tronc relu au G7 : `origin/lot/etude-suite` toujours en `173ea0fd`.

## Périmètre livré

- `scripts/l2/derive.mjs` (116 lignes), `scripts/l2/derive.d.mts` (30), `test/l2-derive.test.ts` (5 tests) ; `scripts/l2/day.mjs` :
  onze lignes changées en place, aucune ajoutée (les onze tueurs de c1 gardent leur ligne) ; `scripts/l2/day.d.mts` : `derive`,
  `DeriveContext`, `Derived`.
- Crochet `derive` de `sealDay` (m-9 de c1) : appelé après l'index, avant la création du dossier ; ses fichiers (noms de `DAY_FILES`,
  sinon `stray_file`) écrits et synchronisés avant `SHA256SUMS` ; clés ajoutées au manifeste et à `missing.json` ; `refs` listés au
  `SHA256SUMS`, sans doublon ; `scripts/l2/derive.mjs` dans `script_sha256`. Sans crochet, sortie de c1 identique (11 tests verts).
- Rejeu depuis le brut seul : ancre d'ouverture, instantanés `depth` gardés par b1 dans [début − 1 h ; fin) (après l'ancre s'il y en
  a une), différences des segments spot de la fenêtre de c1 ; règle de chaîne de b2 transcrite en synchrone (S4 en lecture de chaîne,
  S5 large, A1 à A3) ; amorce rejouée en place, ses segments référencés.
- Prix en entiers `BigInt` à l'échelle du jour ; `off_scale` et `bad_scale` ajoutés aux `STOPS` de `day.mjs` ; rien d'écrit sur arrêt.
- `minutes.jsonl` : 1 440 lignes (00:00 à 23:59), niveaux à ±100 pb tels que reçus, nombre, `dist_bp` arrondie vers le bas ; absentes
  nommées `chain_open`, `side_empty`, `no_later_event`.
- `missing.json` : `chain_holes` en heure de place (m-5 de c1). Manifeste : `replay` (`scale`, `start`, `syncs`, compte des minutes)
  et `parity` (`u`, `since`, écarts par côté, ou absente nommée).
- Écart au G0 : aucun sur le fond. Le G0 nommait le rejeu « départ à l'ancre » ; un carnet n'est posé qu'au premier événement qui
  enchaîne (S5) : sans amorce avant minuit, les minutes jusqu'à cet événement sont absentes et le trou est nommé (lecture prudente,
  Q-C2-4).

## Preuves

- `node scripts/red-proof.mjs --base 173ea0fd --gel 6a263a27 --repo /home/user/monark-governance-c2 --draw 5 --seed 37` : sortie 0,
  « red-proof OK: 5 judged, 0 unchanged, 5 killer(s) drawn » ; `RED-PROOF.json` sha256 `783aa5e5e7386536…`. Cinq tests F2P (rouges
  par assertion à la base : l'import dynamique de `derive.mjs` est affirmé) ; tueurs tirés, tous tués : `:57` ROR (fenêtre ±100 pb),
  `:75` ROR (minute stricte), `:80` ROR (comparaison de parité), `:94` ROR (borne de S4), `:76` CONST (coupe du trou à minuit).
- Ancres : `verifie-ancres.mjs . --touched 173ea0fd HEAD` : 5 tueurs, 5 ANCRE, 0 DERIVE, 0 PERDU ; avec ceux de c1
  (`--files test/l2-day.test.ts,test/l2-derive.test.ts`, `day.mjs` étant touché) : 16 tueurs, 16 ANCRE.
- Mutants à la main (copie de travail, un à la fois, fichier restauré et comparé), tous tués : arrondi vers le haut de `dist_bp` ;
  S5 `>=` → `>` ; rupture à `U` > id + 2 ; port de parité `U` ≤ L + 1 → ≤ L ; plage de l'ancre retirée ; `norm` retiré de chaque côté ;
  `since` = id ; candidats avant l'ancre admis ; borne basse de la fenêtre des instantanés retirée, puis fenêtre réduite au jour ;
  retrait à zéro (A2) retiré ; `off_scale` retiré ; échelle 19 admise ; `refs` des segments retirés ; `no_later_event` → `chain_open` ;
  garde `to >= start` et garde `from < end` retirées ; trou ouvert à l'heure de l'événement au lieu du dernier appliqué ; minutes au-delà
  de 23:59 ; ordre des niveaux ; plancher des côtés inversé ; `start` réécrit à chaque reprise ; diff illisible non rompu. Crochet de
  `day.mjs` : `refs`, dédoublonnage, `missing`, `manifest`, `modules`, écriture des fichiers, garde `stray_file` : chacun tué.
  Équivalent déclaré au gel : A1 `ev.u < id` → `<=`. **Déclaration retirée au pli du G2** (m-5) : ce mutant n'est pas équivalent,
  il a désormais un test (section G2).
- Garde croisée Q-C2-1 : `l2_day_replay_from_anchor_and_amorce` compare le carnet rejoué à `createBook` de b2 nourri des mêmes trames.
- `test:main` 2 272 tests, 2 250 réussis, 0 échec, 22 ignorés (sortie 0) ; `test:export` 1 sur 1 (sortie 0). `tsc` 0 ; `lint` 0
  erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`, base `173ea0fd`) : `STAT` 357 (345 insertions, 12 suppressions), borne du lot 547, marge
  190 ; `CONTENT_STAT` 0 ; GREEN. Plan : 288 à 376.

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C2-1 (transcription synchrone de la règle de b2, garde croisée), Q-C2-2 (crochet `derive`), Q-C2-3 (candidats de reprise, fenêtre
d'une heure), Q-C2-4 (minute présente seulement si un événement enchaîné la suit), Q-C2-5 (`chain_holes` au `missing.json`, heure de
place), Q-C2-6 (parité portée par l'événement à cheval, `since`), Q-C2-7 (`minutes.jsonl` en mémoire, item proposé L2-MINUTES-SIZE-1),
Q-C2-8 (échelle passée par l'appelant), Q-C2-9 (chevauchement connexion par connexion).

## Notes pour la suite

- c3 : ses deux empreintes par le même crochet (`files`, `manifest`) ; c5 compose c2 et c3 dans une seule fonction `derive`, passe
  l'échelle de la veille, écrit `anchor-open.json` et `anchor-close.json` avant le scellé (mêmes octets que le corps gardé par b1).
- c6 : `--from-raw` rappelle `sealDay` avec le même `derive` ; il copie les instantanés et segments listés au `SHA256SUMS`, dont
  `rest/<SYMBOLE>/…` et les segments de l'amorce.
- MAST FM-3.2 : bornes de TL-3 et TL-5 ici ; l'oracle réel reste M-4 en M-1 (parité contre l'ancre de la place).

## G2 (2026-10-05, APPROUVE SOUS RÉSERVE, B-1) : pli

Rapport : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c2.md`. Tronc relu : `origin/lot/etude-suite` toujours
en `173ea0fd`, aucune fusion. Commits : `6835aa51` (tests rouges et types), `27f9eb5a` (gel), puis ce commit (G0 et G7). Méthode du
lot : un test et un tueur par point. `day.mjs` est changé en place seulement (lignes 20, 35, 193, 194, 209, 210) : les onze tueurs de
c1 gardent leur ligne. `packages/rpc-guard/bin/rpc-guard.mjs` non touché. Poussé sur `origin/recherches/l2-p1-c2`, aucune PR.

### Bloquant

- **B-1 (corrigé)** : `minutes.jsonl` est bâti par morceaux de 64 Kio et compté en octets à chaque ligne. Au-delà de `bound`
  (`MINUTES_BOUND` = 128 Mio, G0 point 9), arrêt nommé `minutes_bound`, ajouté aux `STOPS` à la ligne 35 changée en place. Rien n'est
  écrit, car le crochet passe avant `mkdirSync`. `day.mjs:210` écrit chaque morceau l'un après l'autre et ne joint jamais : la
  copie de `join` disparaît. Le contrat du scellé tient : `SHA256SUMS` est calculé sur le fichier écrit par morceaux. Test
  `l2_minutes_bound_named` :
  - le jour de `l2_minute_place_time_strict` fait 72 Kio, donc deux morceaux ;
  - borne = sa taille exacte : il est scellé, octets identiques, empreinte de `SHA256SUMS` exacte ;
  - borne = taille − 1 : `minutes_bound`, sans `index.jsonl` ni `minutes.jsonl`.

  Tueur `derive.mjs:82 ROR "size > bound" -> "size >= bound"`. Q-C2-7 est remplacée par ce correctif.

### Mineurs

- **m-1 (corrigé)** : `l2_replay_passes_stale_snapshots`, sans ancre, avec deux instantanés gardés 90 et 99 (= `U` − 2) avant
  101..102, 103, 104. Attendu : `syncs: []`, 1 440 minutes `chain_open`, un trou `{ START, null }`. Tueur `:103 CONST "ev.U - 1" ->
  "ev.U - 2"`. Mutant `while` → `if` tué à la main.
- **m-2 (corrigé)** : `l2_parity_port_bounds`. Trois cas : reprise sur un 104 gardé, puis 105..106, avec L = 103 (`chain_open`) ;
  dernier événement 102..103 avec L = 103 (`{ u: 103, … }`) ; L = 200 jamais atteint (`chain_open` de la dernière ligne). Tueur
  `:117 CONST "close.lid + 1" -> "close.lid + 2"`. `>=` → `>` et le nom de la ligne 124 tués à la main.
- **m-3 (corrigé)** : `l2_minute_side_empty`, avec une ancre `asks: []` : `{ t: START, u: 101, absent: "side_empty" }`. Tueur
  `:61 COR`.
- **m-4 (corrigé)** : l'écart est déclaré à l'en-tête de `derive.mjs` et au G0 (point 12), contre FAITS-L2-ACCESS-2 (h) (S4 strict).
  La garde croisée devient une table (`l2_replay_cross_guard_table`), avec les mêmes trames au rejeu et à `createBook`, dont le faux
  REST sert l'ancre, puis l'instantané gardé, puis s'arrête. Lignes :
  - rupture puis reprise après un événement écarté (`U` = `lid` + 1) ;
  - doublon `u` = id ;
  - événement à cheval sur une reprise ;
  - cas P1, attendu divergent et nommé : rejeu posé, b2 nul.

  Tueur `:100 CONST "book.id + 1" -> "book.id + 2"`.
- **m-5 (corrigé)** : `hit` est posé dès qu'une trame du flux de différences est lue (`:97`), et non plus à l'application.
  `l2_refs_every_diff_read` reprend la sonde P4 : une connexion B lue après A, avec une trame illisible de 23:55. Le segment
  `conn/<B>/20261003T23.frames` est listé au `SHA256SUMS`, et la rupture est comptée. Tueur `:97 SDL "hit = true;" -> ""`.
  **A1 n'est pas un mutant équivalent**, déclaration retirée. Une trame `u` = id d'heure postérieure est un événement enchaîné : elle
  porte ses minutes. Test `l2_chain_duplicate_is_chained` (3 minutes présentes ; 0 sous le mutant), tueur `:99 ROR "ev.u < book.id"
  -> "ev.u <= book.id"`.
- **m-6 (corrigé)** : `to_place_us` est coupé au jour (`Math.min(to, end)`). Test `l2_chain_hole_cut_to_day`, sonde P2 : le trou
  finit à `END`. Pour P6, la règle retenue garde le trou de durée nulle `{ START, START }` : la minute 00:00 est absente
  `chain_open`, ce qui reste cohérent (G0 point 6) ; le même test l'affirme. Tueur `:84 CONST "Math.min(to, end)" -> "to"`.
- **m-7 (corrigé)** : contrat du crochet resserré (`day.mjs:193`, `:194`) :
  - noms admis = `DAY_FILES` moins les cinq fichiers du scellé et des ancres (`BASE`) ;
  - une clé de `manifest` ou de `missing` déjà présente arrête, `stray_file` avec `names` et `keys` ;
  - `missingOf` est calculé avant `mkdirSync` (lecture seule), puis fusionné à l'écriture (`:209`, `:210`).

  Test `l2_derive_hook_contract` (sonde P5 : `anchor-open.json`, `manifest.json`, `schema`, `holes`). Tueur `day.mjs:194 COR
  "!DAY_FILES.includes(n) || BASE.includes(n)" -> "!DAY_FILES.includes(n)"`.
- **m-8 (corrigé)** : si `book.since` = L, la parité vaut `{ absent: "synced_on_anchor", u }`, ajoutée au type `Parity`. Test
  `l2_parity_synced_on_anchor` (sonde P7). Le cas `open` de `l2_daily_parity_counts` (ancre de fermeture = ancre d'ouverture) est
  désormais nommé de même. Tueur `:117 ROR "book.since === close.lid" -> "book.since !== close.lid"`.
- **m-9 (corrigé, à bon compte)** : un instantané gardé n'est tenu que par `{ lid, load, ref }`. Il est relu au moment de poser le
  carnet (`:106`), et il n'en reste qu'un en mémoire à la fois, plus les deux ancres. Le rendu est identique : les tests existants
  suffisent (G0 point 10).
- **m-10 (corrigé)** : `l2_derive_bounds_closed` couvre :
  - `bad_scale` à −1 ;
  - un instantané gardé à début − 1 h pile, lu ;
  - un instantané gardé à la fin pile, écarté ;
  - une ancre de quantité `"10"` contre `"1"`, comptée ;
  - une différence `U` > `u`, qui rompt.

  Tueur `:71 ROR "scale < 0" -> "scale < -1"`. Les quatre autres survivants du G2 (`:52` `>=` → `>` et `<` → `<=`, `norm` sans
  garde, `eventOf` sans `U <= u`) sont tués à la main.
- **Q-C2-9** : le compte est au manifeste, `replay.cross_conn_ruptures`. Ce sont les ruptures vues sur une trame d'heure de place
  antérieure au dernier événement appliqué, donc lue depuis une autre connexion. Il vaut 1 dans `l2_refs_every_diff_read`. **Item
  formé L2-REPLAY-INTERLEAVE-1** : mesurer ces cas en M-1 avec M-5, et passer à une lecture entrelacée par heure de place si M-1 en
  trouve. Le second cas du G2 (rupture de l'ancienne connexion après la bascule de b2) n'est pas compté à part : il relève du même
  item.
- **Note sans gravité** (deux instructions par ligne à `day.mjs:194` et `:210`) : gardée, pour les ancres de c1.

### Tueurs appliqués à la main (copie de travail, un à la fois, fichier restauré et empreinte vérifiée)

Les 27 tueurs des deux fichiers sont tous tués, chacun seul (`--test-name-pattern` sur son test) : les 16 de `l2-derive` et les 11 de
`l2-day`. Cinq tests de durcissement sont verts à `55ca5e28` : `l2_parity_port_bounds`, `l2_minute_side_empty`,
`l2_replay_cross_guard_table`, `l2_chain_duplicate_is_chained`, `l2_derive_bounds_closed`. Leurs tueurs (`:117` CONST, `:61` COR,
`:100` CONST, `:99` ROR, `:71` ROR) sont tués à la main. `l2_replay_passes_stale_snapshots` n'est rouge à `55ca5e28` que par la
nouvelle clé `cross_conn_ruptures` : sa substance (S4) est un durcissement, et son tueur `:103` CONST est tué. Survivants du G2 tués à
la main : `:103` `while` → `if`, `:117` `>=` → `>`, nom de `:124`, `:52` (deux bornes), `:38` `norm` sans garde, `:35` `eventOf` sans
`U <= u`.

### Preuves du pli

- Pli : `node scripts/red-proof.mjs --base 55ca5e28 --gel 27f9eb5a --repo /home/user/monark-governance-c2 --draw 14 --seed 37`.
  Sortie 1, « red-proof REFUSED: 14 judged, 2 unchanged, 9 killer(s) drawn » ; `RED-PROOF.json` sha256 `586591d8e698f1ca…`.
  - Neuf tests F2P, rouges à la base par assertion : `l2_minute_place_time_strict`, `l2_daily_parity_counts`,
    `l2_day_replay_from_anchor_and_amorce` (clé et parité nommée), `l2_minutes_bound_named`, `l2_replay_passes_stale_snapshots`,
    `l2_refs_every_diff_read`, `l2_chain_hole_cut_to_day`, `l2_derive_hook_contract`, `l2_parity_synced_on_anchor`.
  - Leurs 9 tueurs sont tirés et tous tués.
  - Le refus vient des cinq tests de durcissement, verts à la base par nature : voir les tueurs appliqués à la main.
- Lot entier, contre `173ea0fd` : `--base 173ea0fd --gel 27f9eb5a --draw 16 --seed 37`. Sortie 0, « red-proof OK: 16 judged, 0
  unchanged, 16 killer(s) drawn » ; sha256 `24f20985c0141a46…`. Les 16 tests sont F2P et les 16 tueurs sont tués.
- Ancres : `verifie-ancres.mjs . --touched 173ea0fd HEAD` donne 16 tueurs, 16 ANCRE, 0 DERIVE, 0 PERDU. Avec
  `--files test/l2-day.test.ts,test/l2-derive.test.ts` : 27 tueurs, 27 ANCRE.
- `node --test test/l2-derive.test.ts test/l2-day.test.ts test/l2-book.test.ts` : 33 sur 33. `npm test` complet, une fois, dans le
  worktree : 2 284 tests, 2 262 réussis, 0 échec, 22 ignorés, sortie 0.
- Autres contrôles : `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()`, base `173ea0fd`) : `STAT` 535 (523 insertions, 12 suppressions). Détail : `derive.mjs` 125, `derive.d.mts` 34,
  `day.mjs` 11/11, `day.d.mts` 10/1, tests 343. Borne du lot 547, marge 12 ; `CONTENT_STAT` 0 ; GREEN.

### Avis du G2 sur Q-C2-1 à Q-C2-9, et suite donnée

- **Q-C2-1** : d'accord sur la transcription, pas sur la garde trop étroite. Suite : écart à S4 déclaré, garde en table (m-4), cas
  à plusieurs candidats (m-1).
- **Q-C2-2** : d'accord, si le contrat est resserré. Suite : noms dérivés seulement, aucune clé écrasée (m-7), corps par morceaux
  (B-1).
- **Q-C2-3** : d'accord. L'ancre de fermeture est un candidat (m-8). Suite : instantanés chargés à la demande (m-9).
- **Q-C2-4** : d'accord ; l'écart du G7 (minutes absentes jusqu'au premier événement enchaîné) est cohérent.
- **Q-C2-5** : d'accord, si `to_place_us` est coupé au jour. Suite : fait (m-6).
- **Q-C2-6** : d'accord sur le port, pas sur la parité triviale lisible par `since` seul. Suite : nommée `synced_on_anchor` (m-8).
- **Q-C2-7** : pas d'accord, c'est B-1. Suite : remplacée par la borne nommée et l'écriture par morceaux. La mesure en M-1 fixe la
  borne (L2-MINUTES-SIZE-1).
- **Q-C2-8** : d'accord. Suite : borne basse testée (m-10).
- **Q-C2-9** : d'accord comme limite déclarée. La lecture par connexion dépasse le cas « hors chevauchement ». Suite : compte au
  manifeste et item L2-REPLAY-INTERLEAVE-1.

### Items

- **L2-MINUTES-SIZE-1** : `MINUTES_BOUND` (128 Mio) révisé en M-1 sur un jour réel de BTCUSDT. Étendu à la re-revue du delta
  (m-b) : mesure conjointe avec `INDEX_BOUND` sous `MemoryMax=512M` (D24-4), dans le processus de c5 et sous cgroup (index au
  plafond, puis minutes au plafond). À défaut, `MINUTES_BOUND` passe à 64 Mio, borne provisoire.
- **L2-SNAPSHOT-RELOAD-1** (re-revue du delta, m-c ; G0 de c5) : arrêt nommé si l'instantané relu à la pose n'a plus le
  `lastUpdateId` lu à la liste (`derive.mjs:106`), avec un test par injection.
- **L2-REPLAY-INTERLEAVE-1** : ruptures entre connexions (`cross_conn_ruptures`) mesurées en M-1 avec M-5 ; lecture entrelacée par
  heure de place si M-1 en trouve.

Re-revue courte demandée par le G2 : le delta de B-1 (`derive.mjs:80` à `:82`, `:123` ; `day.mjs:35`, `:210`), plus
`l2_minutes_bound_named`.

### Re-revue du delta (2026-10-05, APPROUVE ; m-a, m-b, m-c, n-1, n-2) : pli court

Pièce : `G2-l2-p1-c2-delta.md`. Delta relu `55ca5e28..588a5912`, sans condition pour la fusion. Base `173ea0fd` inchangée
(`origin/lot/etude-suite`), aucune fusion. Commits : `c5c24958` (tests rouges), `a7e4a2af` (gel), puis G0 et G7.

- **m-a (corrigé)** : test `l2_minutes_written_by_chunks`. Il appelle `deriveDay` en direct sur le jour de 72 Kio de
  `l2_minute_place_time_strict` et affirme au moins deux morceaux, chacun sauf le dernier d'au moins 65 536 caractères. Tueur
  `derive.mjs:82 CONST "text.length >= CHUNK" -> "false"` : un seul morceau, le test rougit (« 1 chunk(s) »). Le test est vert à
  `588a5912` (durcissement) ; son tueur, appliqué à la main, le tue, et red-proof le tire et le tue aussi.
  **Mutant structurel déclaré** : `day.mjs:210`, `[].concat(text)` → `[[].concat(text).join("")]`. La jointure à l'écriture ne
  change ni les octets ni l'empreinte : aucun test par la sortie ne peut la voir. Elle est tenue par revue, et par l'ordre des
  appels (`deriveDay` rend des morceaux, le test l'affirme).
- **m-b (porté aux documents)** : G0 point 9. La mesure de la re-revue y est chiffrée : mémoire tenue égale à la borne
  (131 Mo après `gc`), RSS maximal de 450 à 470 Mo avec le tas par défaut, de 340 à 360 Mo avec un tas plafonné. L'item
  L2-MINUTES-SIZE-1 est étendu (voir Items). Aucun code.
- **m-c (renvoyé au G0 de c5)** : la relecture d'un instantané gardé (`derive.mjs:106`) n'est pas vérifiée contre le `lid` de la
  liste. Hors du contrat d'écriture de b1 (`flag: "wx"`), on obtient une `TypeError` hors de `STOPS`, ou un carnet posé sur un corps
  autre que celui haché. Le correctif tient en une ligne changée en place, mais son test (injection à la relecture) dépasse la
  marge de R-25 qui reste (5 lignes). Item **L2-SNAPSHOT-RELOAD-1**, au G0 de c5, qui fixe le contrat d'écriture de `rest/` : arrêt
  nommé si `full?.lid !== s.lid`, test par injection.
- **n-1 (gardée)** : `cross_conn_ruptures` compte `E < lastE` au sens strict, conforme au G0 (« antérieure »). Le mutant `<=`
  survit ; le cas relève de L2-REPLAY-INTERLEAVE-1 (M-1).
- **n-2 (corrigé)** : `day.mjs:194`, changée en place, gagne `new Set(names).size < names.length` : deux entrées de même nom dans
  `dv.files` arrêtent, `stray_file`. Cas ajouté au tableau `forged` de `l2_derive_hook_contract` (rouge à `588a5912`, vert au gel).
  Appliqué à la main : sans le terme, le test rougit (« Missing expected exception »).

Preuves du pli court :

- Lot entier : `node scripts/red-proof.mjs --base 173ea0fd --gel a7e4a2af --repo /home/user/monark-governance-c2 --draw 17 --seed
  37`. Sortie 0, « red-proof OK: 17 judged, 0 unchanged, 17 killer(s) drawn » ; `RED-PROOF.json` sha256 `f57252d784e2b238…`. Les
  17 tests sont F2P, et les 17 tueurs sont tirés et tués.
- Ancres : `verifie-ancres.mjs . --touched 173ea0fd HEAD` : 17 tueurs, 17 ANCRE, 0 DERIVE, 0 PERDU. Avec `--files
  test/l2-day.test.ts,test/l2-derive.test.ts` : 28 tueurs, 28 ANCRE.
- `node --test test/l2-*.test.ts` : 79 sur 79. `tsc` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ;
  `lang:gate` OK.
- R-25 (`r25()`, base `173ea0fd`) : `STAT` 542 (530 insertions, 12 suppressions). Borne du lot 547, marge 5 ; `CONTENT_STAT` 0 ;
  GREEN. La ligne 194 de `day.mjs` et le tableau `forged` étaient déjà neufs contre la base : leur changement en place ne coûte
  rien.
