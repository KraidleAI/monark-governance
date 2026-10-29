# G7 du lot 2a de Genkan, partie 1, première PR : les formats du noyau, leurs vecteurs et l'encodeur d'ordres de la porte

- **Base** : `c252e35c`. **PR** : #350, branche `lot/genkan-l2a`, tête `cc7074a4`, trois commits : le lot (`9c4ea439`), la fusion du
  tronc `c252e35c` (`9b4a1660`) et les enregistrements de tests (`cc7074a4`). **Fusion au tronc** : `bb75c5a2`, tronc avant fusion
  `c252e35c`.
- **Plan** : partie 1 de Genkan, lot 2a (items GENKAN-LAKEFILE-LIB-1, GENKAN-MAIN-IO-1 et GENKAN-PANIC-2), sous l'accord du
  fondateur pour la partie (2026-10-28 16:38 UTC) et sa directive du 2026-10-29 03:40 UTC. Le lot passe en deux PR sous une rangée
  de zone : celle-ci, les formats ; la seconde, sur la même branche, les règles de l'audit qui bornent ce que les sources du noyau
  nomment à l'entrée et à la sortie standard (GENKAN-MAIN-IO-1). La relecture des lots de la partie est la G2 de la partie, à sa fin.

## Ce que la PR livre

- `apps/genkan/kernel/Genkan/` : `Bytes.lean` (lecteurs gros-boutistes, l'alphabet de 42 octets d'un `str`, un `sec`), `Sha256.lean`
  (SHA-256 sur une liste d'octets), `Format.lean` (le cadre d'ordre GNK1, sa ligne, la requête et la réponse).
  - Une requête est `GNKQ`, un octet de mode, puis une section qui doit être tout ce qui reste ; 1 Mio (1 048 576 octets) au plus en
    tout.
  - Le mode 2 décode l'ordre GNK1 de la section en une ligne finie par `0x0a` : `invalid`, ou
    `order kind=<k> flags=<f> target=<t> asset=<a> amount=<n>`, puis ` assetOut=<o> minOut=<m>` pour un SWAP.
  - Le mode 3 rend les 32 octets bruts du SHA-256 de la section. Toute autre requête n'a pas de réponse.
- `apps/genkan/kernel/Main.lean` lit toute l'entrée standard sous une borne de carburant, et refuse une entrée au-delà de la borne
  (sortie 3) avant toute conversion. Il écrit la réponse brute sur la sortie standard et sort 0, ou sort 3 sans rien écrire. Il
  n'écrit rien sur la sortie d'erreur.
- `apps/genkan/kernel/lakefile.lean` : une cible bibliothèque (`lean_lib Genkan`, aux globs des sous-modules de `Genkan`) construit
  chaque module de `Genkan/`, pas seulement ceux que `Main` importe. `apps/genkan/scripts/audit.mjs` épingle le nouveau fichier par
  son sha256.
- `apps/genkan/kernel/vectors/gnk1.json`, écrit à la main d'après les formats, jamais d'après l'encodeur : 9 ordres qui se décodent,
  avec leurs champs et leur ligne ; 49 qui ne se décodent pas ; 20 jeux de champs que l'encodeur refuse ; 23 requêtes que le noyau
  refuse ; les entrées du contrôle SHA-256 (longueurs 0 à 130, 1000 et 4096, et quatre motifs ; aucun condensé n'est stocké).
- `apps/genkan/src/frame.ts` : `encodeOrder`, les octets d'un ordre depuis ses champs ; un champ hors du format lève une
  `RangeError`.
- Tests :
  - `gnk1_vectors_encode` (`frame.test.ts`) : le fichier de vecteurs seul (noms, hex, la ligne de chaque vecteur valide depuis ses
    champs, le compte de chaque famille, les cinq genres), puis les champs de chaque vecteur valide s'encodent en son hex, et chaque
    jeu inencodable lève une `RangeError`.
  - `gnk1_vectors_decode_by_kernel` et `sha256_kernel_equals_node_crypto` (`formats.kernel.test.ts`, sous la chaîne épinglée) : la
    cible bibliothèque construit chaque module ; chaque vecteur valide se décode en sa ligne, chaque invalide en `invalid`, chaque
    requête refusée sort 3 sans rien écrire ; chaque longueur et chaque motif se condense comme `node:crypto`, et une requête à la
    borne reçoit sa réponse.
  - `audit_pins_lakefile` reçoit les cas du nouveau lakefile : le vrai est celui-ci, et celui du lot 1 est refusé.
  - Deux tests de `records.kernel.test.ts` changent de fixtures, pas d'affirmations (écarts ci-dessous).
  - `export.test.ts` nomme les nouveaux fichiers de l'export public.
- `apps/genkan/README.md` dit les modules du noyau, ses réponses, les vecteurs, l'encodeur et les formats.

## Mesures

La sonde de l'IR de GENKAN-PANIC-2, hors du dépôt, sur le noyau du commit `9b4a1660` construit sous la chaîne épinglée (Lean
4.32.1) : depuis `main` et `IO.FS.Stream.ofHandle`, 256 nœuds et 39 externes (25 inline dans `lean.h`, 4 déclarés `LEAN_EXPORT`
dans `lean.h`, 10 absents de `lean.h`).
- Aucun n'atteint `lean_panic_fn`, `lean_panic_fn_borrowed`, `lean_array_get_panic` ni `lean_array_set_panic`, par son symbole ni
  par le corps inline qu'il suit dans `lean.h`.
- Un seul atteint un `lean_internal_panic*` : `lean_mk_empty_byte_array` (inline, `lean.h` l.1078), pour une mémoire épuisée ou un
  débordement.
- Le seul initialiseur lié est `IO.stdGenRef` d'`Init`, qui atteint `panicCore` par l'`assert!` de `ByteArray.toUInt64LE!`.
- Le C émis des 4 modules du noyau n'appelle aucune fonction `lean_*` hors de ce parcours, de `lean.h` et des deux prototypes que le
  `main` émis déclare lui-même (`lean_setup_args`, `lean_initialize_runtime_module`).
- Trois noyaux témoins sont refusés : un `panic!` atteint depuis `main`, un `a[i]!` sur `Array` dans `main`, un `initialize` dans un
  module du noyau.

## Écarts au plan

- R-25 : le lot entier comptait 1244 lignes, au-delà de la borne de 1205. Il passe en deux PR sous la même rangée de zone : celle-ci,
  931 lignes, puis la seconde, sur la même branche après cette fusion.
- Deux tests de `records.kernel.test.ts`, `records_kernel_refuses_the_planted_native_axiom` et
  `records_kernel_passes_the_real_kernel`, changent de fixtures. Ils copient le noyau avec son dossier `Genkan/`, que la cible
  bibliothèque construit, et lisent l'enregistrement de `main` dans les axiomes admis (`'main' depends on axioms: [propext,
  Quot.sound]` sur ce noyau, mesuré) et le compte de fichiers de l'audit dans la copie. Ils passent aussi à la base, et red-proof les
  refuse comme des tests qui se confirment eux-mêmes ; ils sont déclarés ici, et leurs lignes tueuses sont tuées par les mutants.
- `frame.ts` ne porte que `encodeOrder` : `encodeCtx` et `decodeResp`, que le plan y met dès le lot 2, viennent au lot 3a avec le
  mode 1 du noyau, qui lit `ctx` et écrit `resp`. Les vecteurs de cette PR ne portent donc ni `ctx` ni `resp`.
- Dans `gnk1.json`, la cible non ASCII du vecteur `fields-target-non-ascii` s'écrit `\u00e9` : le fichier reste en ASCII, et la valeur
  lue est le `é` de la mission des tests.
- La mission des tests a reçu un amendement : une requête de mode 3 à la borne exacte. Sans elle, rien ne vérifiait que la borne admet
  une telle requête, ni le SHA-256 du noyau sur 1 Mio.
- Corrections de l'orchestrateur à la revue, avant le commit : une assertion d'existence du fichier de vecteurs en tête de
  `formats.kernel.test.ts` et de `frame.test.ts` (sans elle, les deux tests échouaient à la base par une erreur de lecture, pas par une
  assertion, et red-proof les refusait) ; le commentaire du cas `lakefile.toml` d'`audit_pins_lakefile`, remis au-dessus de son code ;
  des mots du README et des commentaires ; des lignes tueuses ajoutées et renumérotées.

## Vérification

- Sur la branche, le tronc fusionné (`cc7074a4`) :
  - `test:main` vert : 3410 tests, 3363 réussis, 0 échec, 47 sautés ; les enregistrements de tests égaux à ce passage (342 fichiers,
    3410 tests) ;
  - `test:genkan` sous la chaîne épinglée (`ELAN_HOME`) : 20 tests, 20 réussis, 0 sauté ;
  - le vrai noyau passe `audit.mjs --source-only` (5 fichiers Lean, aucun constat) ;
  - red-proof contre `c252e35c` : des 6 tests jugés, 4 sont rouges à la base par une assertion et verts ici
    (`gnk1_vectors_encode`, `gnk1_vectors_decode_by_kernel`, `sha256_kernel_equals_node_crypto`, `audit_pins_lakefile`), et ses 4
    tueurs tirés sont tués ; il refuse les deux tests déclarés de `records.kernel.test.ts`, verts à la base, et eux seuls
    (`RED-PROOF.json` `8bb19ef5…`) ;
  - mutants des lignes tueuses : 30, tous tués, aucun survivant, aucun non conclu, dont celles des deux tests déclarés
    (`RESULTS.json` `c1d222e7…`) ;
  - eslint et tsc propres ; `lang-gate`, `gate:vocab` et `export:check` passent ;
  - lot-check, sortie 0 : le diff reste dans la zone déclarée ; les 24 fichiers de test hors de la zone qui nomment un fichier de la
    zone (la plupart par le nom `README.md`) sont inchangés et passent dans `test:main`.
- CI de #350 : 15 contrôles sur 15 verts à `cc7074a4` (run 40958355851, et l'analyse CodeQL, run 40958351249).
- Rejeu Windows à la fusion : les 5 fichiers de test que la PR change (`audit.test.ts`, `records.kernel.test.ts`,
  `formats.kernel.test.ts`, `frame.test.ts`, `export.test.ts`), sous la chaîne épinglée : 15 tests, 15 réussis, 0 échec.
- Oracle G7 sur `bb75c5a2`, base `c252e35c` : vert, 14 gates sur 14 (enregistrement
  `bb75c5a2e3bc1f55e5f9b110b7dc818ef36d59df-G7-20261029T214052Z-44572.json`, sha256 `9edf057f…`) ; 3410 tests, 3363 réussis, 0 échec,
  47 sautés ; 931 lignes changées au compte de R-25 (borne 1205). Sa gate `npm run test:genkan` a joué les tests du noyau sous la
  chaîne épinglée (`ELAN_HOME`) : 20 tests, 20 réussis, 0 sauté.

## Ce qui reste

- **GENKAN-MAIN-IO-1** : la seconde PR du lot 2a, sur la même branche.
- **GENKAN-PANIC-2** est réécrit dans `docs/ETAT.md` selon la lecture retenue au lot-check : classe 1 (P1, par symbole) depuis R ;
  classe 2 admise sous le contrat de sortie ; initialiseurs liés rapportés. La règle se construit au lot 2b avec `records.mjs
  --reach`, si R-25 le porte, sinon au lot 3b.
- **GENKAN-PANIC-3** reçoit le chemin de l'initialiseur `IO.stdGenRef` d'`Init`, qu'elle seule garde, et deux cas de plus pour son
  test réel.
- **GENKAN-RUNTIME-1** (neuf) : lire les corps compilés du runtime de Lean que le noyau atteint, dans `src/runtime/` du dépôt
  `leanprover/lean4` au tag `v4.32.1`. Déclencheur : le lot 3b.
- `encodeCtx`, `decodeResp` et leurs vecteurs : au lot 3a, avec le mode 1 du noyau.
- GENKAN-LAKEFILE-LIB-1 se clôt avec cette PR : la cible bibliothèque construit chaque module de `Genkan/`, et
  `audit_pins_lakefile` refuse le lakefile du lot 1.
- Les lots 2b à 7 de la partie et la G2 de la partie.
