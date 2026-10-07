# G0 du lot 2a de VERIFIERS-LIST-F5A-1 (E-2a) : le lecteur fermé du rapport de recalcul, `readRecomputeReport`, sur des rapports de synthèse de forme neuve

RECHERCHES, 2026-10-07. Base `6c53e0a1` (tête du lot 1f au pli de sa G2, `recherches/verifiers-list-1f`, PR #231, brouillon ;
`6c53e0a13cf9f1eaddf3d177b0fbfd186d6c48e6`, lue par `git fetch +refs/heads/recherches/verifiers-list-1f:refs/remotes/origin/recherches/verifiers-list-1f`),
fusionnée sans conflit par `20e2f213` à 10:53 UTC (base d'avant : `b894a587`). Ce lot est **empilé sur 1f** et sera rebasé avec lui
quand l'outil figé de MONARK fusionnera. Chantier : `docs/G0-lot-verifiers-list-f5a-1.md` §3.3 et §5 partie 2 (amendée ici, §2).

- **Demande** : G0 court d'E-2a v6.1 (`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), §5 ligne 2a,
  §6 ligne T-RR, §8 Q-M5 ; accepté par MONARK (`recherches` `51fe3ee` : « Tes lots peuvent partir sur cette base, dans l ordre de la
  chaîne. 2a part dès 1f »). G0 de la partie 3 v4 (`recherches:coordination/pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`),
  §2.3 (forme du rapport), §3.2 (contrat du lecteur, `recompute_report_digest`), §5.2 (« Partie 2 (lot 2a) »).
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:38 UTC au début de l'écriture, 09:41 pour ce G0. Worktree
  détaché neuf du scratchpad, branche `recherches/e2a-2a-report-reader` ; `node_modules` lié en dur depuis un autre worktree du
  scratchpad, retiré à la fin. Node 24.21.0, Linux ; CPython 3.14.8 autonome (sans venv) pour la seule mesure croisée du §4.
- **Zone** : `apps/harness/src/policy-verifiers.ts` (ajout en fin de fichier, aucune ligne de 1f déplacée : les tueurs de 1f, l.18 à
  l.115, restent à leur ligne), `test/recompute-report.test.ts` (neuf), `docs/G0-lot-verifiers-list-f5a-1.md` (amendement sur place,
  nombre de lignes inchangé), ce G0. Pli N-6 (MONARK, `recherches` `8ac6bd6`) : `registry` sans `file`.

## 1. Le contrat, cité

- **Partie 3 v4, §3.2** : « **Le contrat de `readRecomputeReport`** (2a ; constat 4) : il juge la **forme fermée** (clés exactes,
  `scope` compris, types, `format` = `monark-recompute-report-v1`, hex bien formés, `scores_sha256` chaîne de 64 hex ou `null`,
  `decisions_equal` booléen, cases uniques et triées, `scope` liste triée de classes sans doublon) et l'**écriture canonique**, et rien
  d'autre. Il ne lie le rapport ni à la liste, ni au registre, ni aux cases, ni à la portée. Ainsi un rapport d'un autre registre, d'un
  autre arbre ou d'un autre vérificateur **se lit** et donne `recompute_report_mismatch`, jamais `recompute_report_invalid` ».
- **La forme neuve** (partie 3 v4, §2.3, points 1 à 4, au lot « outil figé » de MONARK) : « les entrées `differences` de genre digest ne
  portent plus **aucune** valeur d'empreinte ; restent le champ, `first_index`, `terms`, `max_ulps` et la classe » ;
  « `cells[].scores_sha256` est l'empreinte **de B** […] pour une classe **que publie la release du rapport**, et `null` sinon » ;
  forme (a), « un rapport publié porte le `scores_sha256` des seules lignes que publie sa release » (les 24 classes de bande à la
  release 1 ; les 8 classes de direction, `FLOOR_HELD_CLASSES` et `ORDER_HELD_CLASSES` du G0 d'E-2a §3.1, retenues, digest `null`) ;
  « le rapport écrit sa portée […]. Le champ s'appelle `scope` ». MONARK (`recherches` `dcfdc79`) : « les empreintes en forme (a) :
  `scope`, `scores_sha256` à null hors de la release 1 ou pour une case sans ligne, aucune empreinte sous `differences` ».
- **Q-M5** (G0 d'E-2a §8) : « le lot 2a de RECHERCHES précède ta course et ne peut les asserter que sur un rapport de synthèse » ;
  T2-3 et la remesure de (d5) sur le rapport réel vont au commit de versement ; « Le lot 2a n'en fait que la mesure sur synthèse et son
  test de forme (T-RR, §6) ».

## 2. Construction

- **`readRecomputeReport(bytes)`** (`policy-verifiers.ts` l.176-183), sur octets ou texte : UTF-8 strict et JSON, sinon « not UTF-8
  JSON » ; ASCII seul ; forme fermée ; puis égalité des octets à l'écriture canonique, sinon « not its canonical writing ». Chaque refus
  est nommé (`MONARK recompute report: <chemin> …`), le chemin du champ fautif compris (`report.cells[0].scores_sha256 is off the form`).
- **La forme fermée** (l.139-169), clés exactes à chaque niveau typé :
  - premier niveau : les 13 clés d'`assemble` de `report.py` **et `scope`** (14) ;
  - `format` = `monark-recompute-report-v1` ; `verifier` = `<identité>@<40 hex>`, l'identité égale à `identityOf` (règle de 1f) ;
  - `tool` = `{commit: 40 hex, tree, tree_sha256: 64 hex}` ; `registry` = `{cells: entier ≥ 0, generator_identity, sha256: 64 hex}`, sans `file` (N-6) ;
  - `inputs` = `{compare, recompute}`, listes de `{bytes: entier ≥ 0, name, role, sha256: 64 hex}` ;
  - `scope` : liste strictement croissante de classes (`^[a-z0-9]+(-[a-z0-9]+)*$`), donc triée et sans doublon ;
  - `cells` : `{cell_key, decisions_equal: booléen, scores_sha256: 64 hex ou null, task_class: classe}`, strictement croissantes par
    `(task_class, cell_key)`, donc uniques et triées ;
  - `differences` : genre `value` = `{a, b, cell_key, class, field, kind, task_class, ulps}`, `a` et `b` en hexadécimal de flottant
    (`float.hex()` de Python) ; genre `digest` = `{cell_key, class, field, first_index, kind, max_ulps, task_class, terms}`, **sans** `a`
    ni `b` ; `class` ∈ {`explained, ln`, `explained, association`} ;
  - `platform`, `oracles`, `fields`, `explanation`, `summary` : objets, contenu libre (la plateforme Linux de la course n'est pas encore
    écrite ; la clause (d5) de la porte juge toute empreinte où qu'elle soit) ; `replay` : chaîne.
- **L'écriture canonique** (l.170-173) : celle de `report.py` (`canonical`) : clés triées, sans espace, entiers sûrs seuls (une
  fraction est refusée, `-0` n'est pas canonique), chaînes de `JSON.stringify`, ASCII, sans LF final. Le module n'importe toujours que
  `node:crypto`, `node:fs`, `node:url` (le test de 1f qui le tient passe) : l'écriture est locale, sans `@monark/contracts` ni `scripts/`.
- **`REPORT_NON_ROW_DIGESTS`** (l.124) : la liste fermée de (d5), exportée pour la porte de 3a : `inputs.compare[].sha256`,
  `inputs.recompute[].sha256`, `platform.libm.sha256`, `registry.sha256`, `tool.tree_sha256` ; `cells[].scores_sha256` à part (jugé par
  (d1) et (d2)). Mesurée au §4.
- **Ce que le lecteur ne fait pas** (contrat) : aucune liaison à la liste, au registre, aux cases ni à la portée ; aucun tri imposé à
  `inputs` ni à `differences` (T2-2 et la porte) ; aucun contrôle de 64 hex hors des champs typés (la porte, (d4) et (d5)).
- **Amendement du chantier l.493-505** (sur place, 13 lignes pour 13) : le lot 2a teste dans un fichier neuf ; T2-1 garde ses
  liaisons comme **assertions sur le rapport réel**, portées par le commit de versement ; son tueur passe sur le lecteur de forme
  (`typeof v === "boolean"`, l.156). Le texte proposé au tueur par le G0 d'E-2a (`typeof c.decisions_equal === \"boolean\"`) est écrit
  `typeof v === "boolean"` : la colonne est un prédicat de la table `CELL`.

## 3. Tests rouges et tueurs

Tous dans `test/recompute-report.test.ts` (neuf). Le fichier importe le module par espace de noms : à la base, `policy-verifiers.ts`
se charge et n'a pas le lecteur, et chaque test rougit par une **assertion** (`typeof verifiers.readRecomputeReport === "function"`),
non par un échec de chargement (red-proof refuse un import rouge sur un fichier qui existe à la base).

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| **T-RR** `recompute_report_reader_judges_the_closed_form` | admis : le rapport de synthèse de forme neuve, en texte et en octets, écrit par `canonicalJson` du contrat ; 24 classes dans `scope`. Refus nommés : forme ancienne sans `scope`, clé de plus au premier niveau, `format` autre, cinq `verifier` faux, `commit` majuscule, `tree_sha256` court, clé de plus dans `tool`, `registry.sha256` majuscule, `registry.cells` à -1, 1,5 ou chaîne, `registry.file` présent (forme d'avant N-6), taille négative, clé de plus dans une entrée, quatre `scores_sha256` faux, trois `decisions_equal` non booléens, second digest par case (forme ancienne), classe hors forme, cases non triées ou répétées, quatre `scope` faux, digest sous `differences` (forme ancienne), trois flottants mal écrits, différence non expliquée, genre autre, `platform` liste, `summary` nul, fraction, `-0`, clés dans l'ordre d'insertion, espaces, LF final, LF, CR ou CR LF brut entre jetons, octet non ASCII, non-JSON, non-UTF-8 | `apps/harness/src/policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "true"` |
| `recompute_report_reader_binds_nothing_the_gate_binds` | se lisent (Q-P3-2) : registre autre (sha256, 0 case), nom d'entrée `compare` autre, vérificateur autre, arbre autre (chemin, digest), case à `decisions_equal` faux, digest d'une classe retenue (hors portée), classe de portée sans case, portée vide, sans différence, sans entrée `compare` | `apps/harness/src/policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "v === true"` (l'ancienne règle de T2-1 dans le lecteur) |
| `recompute_report_non_row_digests_are_a_closed_list` | mesure (d5) sur synthèse : les chemins des sous-chaînes de 64 hex (valeurs et clés) = `REPORT_NON_ROW_DIGESTS` ∪ `cells[].scores_sha256` ; aucun sous `differences` ; digest pour chaque case de la portée, `null` pour chaque classe retenue | `apps/harness/src/policy-verifiers.ts:124 CONST "\"platform.libm.sha256\", " -> ""` |
| `recompute_report_synthetic_passes_the_spec_gate` | les octets admis par le lecteur passent `contentProblems` en sorte `json` au chemin `contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json` (textes fixes de `report.py`, clés de case du registre) | `scripts/spec-publish.mjs:113 CONST "k.replace(VENUE, \"@$1KEY/\")" -> "k"` |

- **Le rapport de synthèse** : les 280 cases de `wave1.json` (`811fcd57…`), triées ; `scores_sha256` = `calib.scoresSha256` de la ligne
  pour une classe de bande, `null` pour les 8 classes `*-dir-1h` et `*-dir-4h` ; les textes fixes lus dans le bloc `TEXTS` de
  `report.py` ; une différence de chaque genre ; plateforme Linux inventée. 42 168 octets, sha256 `e5ef12a4…` (§4).
- **Mutants équivalents** (mesurés, 22 mutants à la main sur le lecteur, chacun seul, fichier de test rejoué) : un seul vivant au premier
  tour, `|| rfail(…)` dans `each`, mort-né parce que chaque élément de liste est un objet fermé qui lève lui-même. La branche est
  retirée (l.154) ; au second tour, 21 sur 21 tués (clés exactes, ordre des cases sur les deux champs, ordre de la portée, ASCII,
  canonique, entier sûr, identité du vérificateur, compte ≥ 0, flottant, classe, `class`, choix du genre, `scores_sha256`, objets libres,
  `format`, forme du vérificateur, et les quatre tueurs) ; au pli N-6, trois de plus, tués : `file` rendu à `registry`, `registry` libre, CR et LF ignorés à l'égalité canonique.

## 4. Mesures

- **Écriture canonique croisée avec l'outil** : `canonical` de `report.py` à `09f49fc2` (arbre extrait par `git archive`, importé tel
  quel, `io_guard` compris, sous `python3.14 -I -E -s -B`) rend, sur le rapport de synthèse relu, **les mêmes octets** (sha256
  `e5ef12a4bb0734445144e4dcd3cfcdb5b57f7c97ff569ac87d1c93816d92b4b6`) que `canonicalJson` du contrat, que le lecteur admet (remesuré au pli N-6, CPython 3.14.0rc2).
- **Forme d'`assemble` à `09f49fc2`**, sur des entrées inventées (une case, une différence de chaque genre) : 13 clés de premier
  niveau, **sans `scope`** ; cases `{cell_key, decisions_equal, task_class}` sans `scores_sha256` ; différence de genre digest avec `a`
  et `b`. Chemins de 64 hex : `differences[].a`, `differences[].b`, plus les cinq de `REPORT_NON_ROW_DIGESTS`. La forme neuve retire les
  deux premiers et ajoute `cells[].scores_sha256` : la liste fermée de (d5) est complète pour la forme écrite ici. **Le lecteur refuse la
  forme de `09f49fc2`** (sans `scope` : T-RR).
- **Ce qui n'est pas mesuré** : la forme réelle de l'outil figé. À `09f49fc2` (tête poussée, `git ls-remote` à 09:2x UTC),
  `report.py` n'écrit encore ni `scope` ni `scores_sha256` (partie 3 §2.3 point 4 ; MONARK `dcfdc79` : fait « en arbre de travail sur
  `09f49fc2` »). Ce lecteur suit la forme écrite par la partie 3 et par MONARK ; la confrontation au rapport réel est au versement (§5).

## 5. Q-M5 : les textes proposés au commit de versement de MONARK (défaut du G0 d'E-2a)

Le commit de versement (MONARK : `apps/harness/data/kata/recompute/wave1-monark-kata-recalc.json` et l'entrée `COMMITTED_REPORTS`, après
a1) porte trois contrôles sur le rapport réel ; la G2 de RECHERCHES les relit. Textes proposés, dans `test/recompute-report.test.ts` :

- **T2-1** `recompute_report_is_closed_and_bound_to_the_list` : `readRecomputeReport(bytes)` admet le fichier ; `verifier` =
  `monark-kata-recalc@<commit>` et `tool.tree_sha256` = l'entrée de liste de `pinnedVerifiers()` à ce commit ; `tool.commit` = ce
  commit ; `registry.sha256` = `811fcd574e182f33e24e19795b18139adb1917cf392a02810705c6adda1dd9cb`, `inputs.compare[0].name` = `wave1.json`,
  `registry.cells` = 280 ; `registry.generator_identity` = `kata/bench/write-p2.ts`, distincte de l'identité listée ; 280 cases,
  toutes avec `decisions_equal === true` : **cette exigence est celle de T2-1 ; le lecteur n'exige qu'un booléen** (MONARK, `recherches` `274cdac`) ;
  `scope` = les 24 classes de bande ; chaque classe de `FLOOR_HELD_CLASSES` et d'`ORDER_HELD_CLASSES` a `scores_sha256` à `null` ; chaque différence a sa
  classe d'explication ; `fields.outside_decisions` = `[trialRegistryHead.hash]`. Tueur : `policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "true"`
  n'y suffit plus (le fichier réel n'a que des booléens) : celui du versement vise l'épingle du rapport dans `COMMITTED_REPORTS` (a1).
- **T2-3** `recompute_report_is_canonical_and_passes_the_spec_gate` : `contentProblems` au chemin daté est vide sur les octets réels
  (même forme que `recompute_report_synthetic_passes_the_spec_gate`, sur le fichier). Tueur : `scripts/spec-publish.mjs:113`, comme ici.
- **Remesure de (d5)** : la fonction `paths` de `recompute_report_non_row_digests_are_a_closed_list`, sur le rapport réel, rend
  `REPORT_NON_ROW_DIGESTS` ∪ `cells[].scores_sha256`, rien sous `differences`. Si le rapport réel porte une empreinte ailleurs, la liste
  fermée change par un lot de RECHERCHES avant 3a, jamais au versement.
- **Si la forme réelle diffère du §2** (une clé de l'outil figé que la partie 3 n'écrit pas) : T2-1 rougit au versement sur
  `readRecomputeReport` ; RECHERCHES amende le lecteur par un lot court, sur la forme réelle, avant le versement.

## 6. Preuves

- **red-proof**, après la fusion de `6c53e0a1` (gel `4b8ebfa9`, tueurs déplacés) contre la tête de 1f : `node scripts/red-proof.mjs --base
  6c53e0a13cf9f1eaddf3d177b0fbfd186d6c48e6 --gel HEAD --repo <worktree> --out <dossier> --draw 4 --seed 1007`, Node 24.21.0, Linux :
  sortie 0, « red-proof OK: 4 judged, 0 unchanged, 4 killer(s) drawn » ; quatre F2P (rouges à la base par l'assertion d'import, verts au
  gel), quatre tueurs tués, dont l.124 et l.156 ; `RED-PROOF.json` sha256 `b9ec8e957ae45fc8877a8c4b86381a5a5d032ae6cec43cb9164214ce122d295f` (au pli N-6 : `16c44a48…`).
- **Voisins** (Node 24.21.0, `(test 42)` filtré) : `recompute-report`, `verifiers-list`, `kata-recalc`, `spec-*`, `byte-guard`, `ci-gates`,
  `export-public`, `lang-gate*`, `short-digest-floor`, `policy-guard` : 172 tests, 171 verts après la fusion (remesuré à `63b554fe` : 171 et 170,
  non 172 ; 1f ajoute un test) ; `test:main` complète (Linux, à `4b8ebfa9`) : 2 845 tests, 2 822 verts, 22 sautés ; seul rouge, dans les deux : le témoin de 1f.
- `tsc --noEmit` 0 ; `eslint` des deux fichiers TypeScript 0 ; `lang:gate` 0 (un « é » de test, premier jet, écrit `\u2603`) ; `gate:vocab` 0
  (349 fichiers) ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint (atelier de RECHERCHES) `--base 6c53e0a1` : 4 fichiers, aucun risque Windows ;
  `verifie-ancres.mjs` (recherches, CM-2) sur l'arbre fusionné : 1 533 tueurs, aucun PERDU ni DERIVE.

## 7. Taille

- R-25, forme de la CI (`git diff --shortstat 6c53e0a1...HEAD`, `docs/**/*.md` exclus) : **2 fichiers, 217 insertions**, soit 217
  (borne de lot 547 ; attendu au G0 d'E-2a : ~260 ; inchangé par la fusion). Un seul lot, sans coupe.

## 8. Ce qui n'est pas fait

- Le rapport réel, son entrée `COMMITTED_REPORTS`, T2-1, T2-3 et la remesure de (d5) sur lui : commit de versement de MONARK (§5).
- Aucun consommateur du lecteur n'est branché : la porte (3a), l'écrivain (b1-a) et la table d'épingles de la garde (b2).
- La forme réelle de l'outil figé n'est pas lue (§4) ; aucune course, aucune série lue.
- Le témoin de 1f (commit de 40 zéros) est hérité : `verifier_list_commit_carries_the_listed_tree` reste rouge sur cette pile
  jusqu'au rebase de 1f.
