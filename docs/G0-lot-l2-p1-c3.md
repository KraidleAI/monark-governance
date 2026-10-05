# G0 du lot P1-c3 du chantier L2 : empreintes canoniques et recoupements

- **Rattachement** : ADR-L2-CAPTURE-1 (D-20 et son amendement daté, Q-P1-9 ; §2.3 « Empreintes canoniques » ; items
  L2-TRADE-ID-CONSEC-1, L2-BOOKTICKER-U-1, L2-LIQ-DEDUP-1, L2-BOOKTICKER-GAP-1) ; plan `docs/G0-partie-l2-p1.md` §8.2 (ligne P1-c3),
  §8.3 (c3 sur c1 et c2 ; Q-P1-9 tranchée), §9 ; faits `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md` (f), (j) ; G0 et G7 de c2
  (`docs/G0-lot-l2-p1-c2.md`, `docs/G7-lot-l2-p1-c2.md` : Q-C2-2, contrat du crochet, L2-MINUTES-SIZE-1) ; G2 de c2 et sa re-revue
  (`recherches/coordination/pieces/2026-10-04-G2-recherches/G2-l2-p1-c2.md`, `G2-l2-p1-c2-delta.md`).
- **Base** : `e6682efd` (tête de `recherches/l2-p1-c2`, PR #148 ouverte sur `lot/etude-suite`, non fusionnée). Branche
  `recherches/l2-p1-c3`. Auteur : RECHERCHES. Aucun réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système,
  ancre écrite à la main, horloges injectées ; données synthétiques, aucune série brute au dépôt.

## Prérequis et faits

- **Q-P1-9, tranchée** (amendement daté de D-20) : la suite canonique d'un flux et d'un jour garde chaque charge une fois par ses octets
  exacts, ordonnée par (clé, octets) ; deux charges de même clé aux octets différents restent deux entrées, nommées, jamais fondues ;
  `@forceOrder` s'ordonne par ses octets. `KEYS` du manifeste de c1 le déclare déjà (`forceOrder: "bytes"`, `order: "key,bytes"`).
- **FAITS-L2-ACCESS-2 (f)** : ni l'unicité ni la consécutivité de `t` ne sont documentées ; **(j)** : `@bookTicker` pousse toute
  variation du prix ou de la quantité du meilleur niveau ; l'unicité de `u` n'est pas documentée.
- **Q-C2-2 de c2** : c3 passe par le même crochet `derive` de `sealDay` ; c5 compose c2 et c3 en une seule fonction.
- **Leçons des G2 de c2**, appliquées ici : aucune chaîne d'un fichier entier (c3 n'écrit aucun fichier : clés de manifeste seules) ;
  toute mémoire tenue a une borne nommée ; le crochet n'écrit que des noms dérivés et n'écrase aucune clé ; tout ce qui change la
  sortie est listé au `SHA256SUMS` (c3 ne lit que des trames de l'index du jour, dont les segments y sont déjà, `used` de c1).

## Contenu (fichiers de §8.2 : `scripts/l2/canon.mjs`, `scripts/l2/canon.d.mts`, `test/l2-canon.test.ts`)

Couture : `canonDay({ ...ctx, best })`, crochet de `sealDay` ; `bestTap({ scale, start, end })`, branché sur le rejeu de c2. c5 compose :
`derive: (ctx) => { const t = bestTap(…); const a = deriveDay({ ...ctx, scale, tap: t.tap }); const b = canonDay({ ...ctx, best:
t.result() }); … }` (clés de manifeste disjointes : `replay`, `parity` ; `canon`, `crosscheck`).

1. **Index passé au crochet** : `day.mjs:190` (changée en place) passe `index: buckets` au contexte du crochet ; `STOPS` (`day.mjs:35`,
   changée en place) gagne `canon_bound`. Aucune ligne ajoutée à `day.mjs` : les onze tueurs de c1 gardent leur ligne.
2. **Trames du jour** : par flux du symbole (`depth@100ms`, `bookTicker`, `trade`, `forceOrder`), les entrées de l'index du jour, lues
   par le lecteur partagé de a2 dans l'ordre de l'index ; une entrée tardive ou précoce d'un autre jour est exclue et comptée
   (`foreign`).
3. **Clés** (`CANON_KEYS`, Q-P1-9) : `(U,u)`, `u`, `t` ; aucune pour `@forceOrder` (un seul passage, ordonné par les octets). Une trame
   sans clé lisible (entier sûr) est rangée en tête et comptée (`keyless`).
4. **Deux empreintes par flux** : `raw_sha256` sur la suite des charges distinctes par octets, ordonnées par (clé, octets), un LF après
   chacune ; `fields_sha256` sur les formes re-sérialisées distinctes (JSON aux clés triées, chaînes intactes ; hors JSON, le texte),
   ordonnées par (clé, forme). Calcul par morceaux (une trame à la fois dans le haché), jamais une chaîne du flux entier.
5. **Nommage, jamais fusion** : même clé et octets différents, `same_key` ; même forme et octets différents, `same_fields` ; comptés
   tous, listés au plus `NAMED_BOUND` = 16 groupes (`named` : flux, motif, clé, `[cid, seg, rank]` de chaque charge).
6. **Borne nommée** : une suite de même clé est tenue entière pour être ordonnée par octets ; au-delà de `RUN_BOUND` = 64 Mio, arrêt
   `canon_bound`, rien d'écrit (le crochet passe avant `mkdirSync`). `@forceOrder` est un seul passage : échantillonné à une trame par
   seconde et par symbole (`SAMPLING`), environ 86 400 trames de quelques centaines d'octets par connexion, soit environ 30 Mo.
7. **Sauts de `t`** : entre `t` distincts consécutifs de la suite canonique (union des connexions) ; `jumps` = `{ count, max }` au
   manifeste, observation ; jamais une entrée de `missing.json`.
8. **Recoupement (i)** : chaque `u` distinct de `@bookTicker` du jour dans l'union des `[U;u]` des différences du jour ; `outside`
   compté ; sans différences, `{ absent: "no_diffs" }`.
9. **Recoupement (ii)** : `bestTap` voit chaque différence appliquée par le rejeu de c2 (`derive.mjs:70` et `:116` changées en place :
   paramètre `tap`, appel après A2 et A3) ; meilleur niveau suivi sans relire le côté entier, sauf quand il a disparu ; une différence
   du jour dont le meilleur niveau (prix ou quantité, l'un des côtés) change doit avoir un `u` de `@bookTicker` dans son `[U;u]` ;
   `unmatched` compté, les premiers listés ; le premier événement d'un carnet posé n'est pas jugé (`unjudged`). Sans rejeu :
   `{ absent: "no_replay" }`.
10. **Manifeste** : `canon` (par flux : `frames`, `entries`, `forms`, `keyless`, `foreign`, `same_key`, `same_fields`, `jumps` pour
    `trade`, les deux empreintes ; `named`) et `crosscheck` (`i`, `ii`) ; `modules: ["canon"]`, donc `scripts/l2/canon.mjs` au
    `script_sha256`. Aucun fichier, aucune clé de `missing.json`.

## Tests (`test/l2-canon.test.ts`), tueurs (un par test)

Le fichier appelle `keepCause` au chargement et fait son dossier temporaire dans `before()` ; chaque test charge `canon.mjs` par un import
dynamique qu'il affirme : la base, sans le module, rougit par assertion.

- **`l2_canonical_digests_two_per_stream`** : deux connexions qui se chevauchent (mêmes octets) et `/market` ; `t` 5 puis 4 ; empreintes
  égales à leur forme close ; aucun fichier ajouté ; segments lus au `SHA256SUMS` ; un second hôte aux clés de `t` 4 dans un autre ordre :
  `raw_sha256` diffère, `fields_sha256` égal. Tueur : `// killer: scripts/l2/canon.mjs:92 CONST "cmp(st.k1[x], st.k1[y])" ->
  "cmp(st.k1[y], st.k1[x])"`.
- **`l2_canonical_same_key_named`** (FM-2.4) : un `t` et un `u` de `@bookTicker`, deux charges chacun ; deux entrées, nommées. Tueur :
  `// killer: scripts/l2/canon.mjs:99 CONST "!e.b.equals(run[n - 1].b)" -> "false"`.
- **`l2_forceorder_dedup_full_payload`** : mêmes octets de deux connexions, une entrée ; deux liquidations, deux ; même sens aux
  octets différents, deux entrées nommées `same_fields`. Tueur : `// killer: scripts/l2/canon.mjs:112 ROR "b - a > 1" -> "b - a > 2"`.
- **`l2_trade_id_jump_counted_not_a_hole`** : `t` 1, 2, 3, 7, 8, 20 (3 répété), une trame sans `t` ; deux sauts, le plus grand 12 ;
  `missing.json` sans entrée par `t`. Tueur : `// killer: scripts/l2/canon.mjs:116 ROR "k1 - prev > 1" -> "k1 - prev >= 1"`.
- **`l2_bookticker_crosscheck_counts`** : c2 et c3 composés ; (i) un `u` hors de tout `[U;u]`, un autre à la borne haute ; (ii) un
  meilleur niveau changé sans `@bookTicker`, un autre couvert à la borne basse ; sans rejeu ni différences, absences nommées. Tueur :
  `// killer: scripts/l2/canon.mjs:120 ROR "k1 <= his[at]" -> "k1 < his[at]"`.
- `l2_best_tap_net_change` : meilleur niveau retiré (relecture du côté), puis sa quantité ; quantité égale ; événement de J+1 ignoré.
  Tueur : `// killer: scripts/l2/canon.mjs:42 SDL "if (prev !== null && !m.has(prev)) return top(m, hi);" -> ""`.
- `l2_canon_run_bound_named` : borne égale aux octets tenus, scellé ; un octet de moins, `canon_bound`, rien d'écrit. Tueur :
  `// killer: scripts/l2/canon.mjs:97 ROR "held > bound" -> "held >= bound"`.
- `l2_canon_day_frames_only` : une transaction tardive de la veille, à l'index du jour, hors de sa suite. Tueur : `// killer:
  scripts/l2/canon.mjs:75 ROR "(st.a[3 * p + 2] & 3) >= 2" -> "(st.a[3 * p + 2] & 3) > 2"`.

## Preuve rouge, contrôles, taille

- Commit de ce G0 ; commit des tests seuls (rouges, avec `canon.d.mts` et les types de `day.d.mts` et `derive.d.mts`) ; gel ;
  `node scripts/red-proof.mjs --base e6682efd --gel <gel> --repo <worktree> --draw 8 --seed 37` ; ancres par `verifie-ancres.mjs
  --touched`, puis avec les fichiers de test de c1 et c2 (`day.mjs` et `derive.mjs` sont touchés) ; tests L2 ; `npm test` une fois dans
  le worktree ; `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.
- **R-25** : plan 247 à 322 (c 90, d 28, t 129 à 204). Estimation de ce G0 : `canon.mjs` environ 140, `canon.d.mts` 28, tests
  environ 195, `day.mjs` 2/2, `derive.mjs` 2/2, types 10/4 : environ 385 contre `e6682efd`, sous la borne de 547. Écart au plan
  déclaré : le code dépasse c 90 par le recoupement (ii) (`bestTap`) et la borne nommée.

## Questions (défaut retenu ; aucune ne touche la zone de MONARK ni une surface servie : `scripts/l2` est hors de la liste d'export)

- **Q-C3-1** : les trames du jour sont les entrées de l'index du jour hors tardives et précoces d'un autre jour (comptées `foreign`).
  Limite : une trame tardive de J n'entre dans aucune suite (elle est comptée à J+1) ; TL-9 en tiendra compte. (défaut : oui)
- **Q-C3-2** : `fields_sha256` dédoublonne sur la forme re-sérialisée et non sur les octets : sinon l'empreinte de repli garde la
  différence d'octets qu'elle doit absorber (L2-BYTE-IDENTITY-1). (défaut : oui)
- **Q-C3-3** : trame sans clé lisible rangée en tête, par octets, comptée `keyless` ; jamais un arrêt. (défaut : oui)
- **Q-C3-4** : (ii) par un `tap` du rejeu de c2 (deux lignes de `derive.mjs` changées en place) plutôt qu'un second rejeu ; le premier
  événement d'un carnet posé n'est pas jugé. c5 compose dans cet ordre. (défaut : oui)
- **Q-C3-5** : mémoire : par flux, 36 octets par trame tenue (clés, offset, longueur, position, permutation), bornée par
  `INDEX_BOUND` (au pire environ 150 Mo pour un flux seul), plus un passage borné par `RUN_BOUND`. Elle s'ajoute à l'index et au corps
  de `minutes.jsonl` (128 Mio au plus) quand c5 compose c2 puis c3. Item proposé : L2-MINUTES-SIZE-1 étendu à la mesure conjointe
  (index, minutes, empreintes) sous `MemoryMax=512M`, dans le processus de c5. (défaut : oui)
- **Q-C3-6** : `NAMED_BOUND` = 16 groupes listés, tous comptés. (défaut : oui)
- **Q-C3-7** : sauts de `t` comptés sur l'union des connexions ; la mesure par connexion reste à M-1 (L2-TRADE-ID-CONSEC-1). (défaut :
  oui)
- **Q-C3-8** : quantités du meilleur niveau comparées telles que reçues (même place, même écriture), sans normalisation. (défaut : oui)
