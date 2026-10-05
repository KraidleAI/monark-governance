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
