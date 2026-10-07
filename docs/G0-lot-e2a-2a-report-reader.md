# G0 du lot 2a de VERIFIERS-LIST-F5A-1 (E-2a) : le lecteur fermé du rapport de recalcul, `readRecomputeReport`, sur des rapports de synthèse de forme neuve

RECHERCHES, 2026-10-07. Base `e6d13075` (tête du lot 1f au pli du second tour de la chaîne, `recherches/verifiers-list-1f`, PR #231,
brouillon ; `e6d13075cab9f6611a9e6a0903beed2268c24118`, lue par `git fetch +refs/heads/recherches/verifiers-list-1f:refs/remotes/origin/recherches/verifiers-list-1f`),
fusionnée sans conflit par `a525f347` à 14:33 UTC ; bases d'avant : `c601290b`, fusionnée par `57bae562` à 14:00 UTC ; `12588884`, fusionnée par `6fea7076` à 12:46 UTC (même arbre qu'une
première fusion de 12:29 UTC, refaite avant tout envoi pour porter la ligne d'attribution) ; `6c53e0a1`, fusionnée par `20e2f213` à
10:53 UTC ; `b894a587`.
Ce lot est **empilé sur 1f** et sera rebasé avec lui quand l'outil figé de MONARK fusionnera. Chantier : `docs/G0-lot-verifiers-list-f5a-1.md` §3.3 et §5 partie 2 (amendée ici, §2).

- **Demande** : G0 court d'E-2a v6.1 (`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), §5 ligne 2a,
  §6 ligne T-RR, §8 Q-M5 ; accepté par MONARK (`recherches` `51fe3ee` : « Tes lots peuvent partir sur cette base, dans l ordre de la
  chaîne. 2a part dès 1f »). G0 de la partie 3 v4 (`recherches:coordination/pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`),
  §2.3 (forme du rapport), §3.2 (contrat du lecteur, `recompute_report_digest`), §5.2 (« Partie 2 (lot 2a) »).
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:38 UTC au début de l'écriture, 09:41 pour ce G0. Worktree
  détaché neuf du scratchpad, branche `recherches/e2a-2a-report-reader` ; `node_modules` lié en dur depuis un autre worktree du
  scratchpad, retiré à la fin. Node 24.21.0, Linux ; CPython 3.14.0rc2 autonome (sans venv) pour la seule mesure croisée du §4.
  - **Fusion du second pli de 1f** : worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge lue (`date -u`) à 12:29 UTC à la
    première fusion, 12:46 UTC à la fusion gardée, 12:48 UTC pour ce G0. Même worktree, repris propre à `5c984244` ; mêmes règles (`node_modules` lié en dur puis retiré, ni
    `GIT_DIR`, ni `GIT_WORK_TREE`, ni `--write-tree`). Node 24.21.0, Linux. La fusion n'apporte que le test de 1f et son G0 : aucune
    ligne de `policy-verifiers.ts` ne bouge, donc ni tueur ni citation de ce G0 (l.124, l.139-183, l.156) ne se déplace (§6).
  - **Pli de la G2 de #234** (MONARK, `recherches` `e6d5517`, pièce `pieces/2026-10-07-g2-234-235/g2-234.json` : deux M, quatre m ; §9) :
    worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge lue (`date -u`) à 13:19 UTC au début, 13:55 UTC pour ce G0. Un premier
    agent, arrêté par un redémarrage du conteneur vers 13:16 UTC, avait laissé dans ce worktree trois commits locaux jamais poussés
    (`7e395485`, `25b2c988`, `6dc19799`) : lus, puis refaits depuis `e0bfe0f4`, en ne gardant que ce qui est vérifié ici. Mêmes règles
    (`node_modules` lié en dur puis retiré, ni `GIT_DIR`, ni `GIT_WORK_TREE`, ni `--write-tree`). Node 24.21.0, Linux ; CPython 3.14.0rc2
    sous `-E -S -s -B` pour les mesures du §4 (seule version 3.14 ici : le « 3.14.8 » de la première écriture de la l.15 était faux,
    observation 7 de la G2 ; il ne reste que dans la plateforme inventée de la synthèse).
  - **Fusion de la réécriture du §6 de 1f** (`c601290b`, décision de MONARK `29f8ea9`) : même worker, même session ; horloge lue
    (`date -u`) à 14:02 UTC après la fusion (`57bae562`, 14:00 UTC), 14:03 UTC pour ce G0. La fusion n'apporte que le G0 de 1f : aucune
    ligne de code ne bouge, donc ni tueur ni citation de ce G0 ne se déplace, et le digest du gel ne change pas (§6).
  - **Fusion du second tour de 1f** (`e6d13075` : l'aide partagée des chargements, le test qui la tient, `--no-replace-objects` et le G0
    de 1f) : même worker, même session ; fusion `a525f347` à 14:33 UTC, 14:35 UTC pour ce G0. Aucune ligne de `policy-verifiers.ts` ni de
    `test/recompute-report.test.ts` ne bouge : ni tueur ni citation de ce G0 ne se déplace, et le digest du gel ne change pas (§6).
  - **Pli de la décision de MONARK sur la profondeur de `canon`** (`recherches` `b97d5b1`, 16:18 UTC, message
    `2026-10-07-MONARK-vers-RECHERCHES-passation-g2.md`, point 3 ; §10) : worker `claude-opus-5-5`, **effort: max**, déclaré ; horloge
    lue (`date -u`) à 16:29 UTC au début, 16:44 UTC pour ce G0. Worktree détaché neuf du scratchpad (`wt-canon64`) à `306760b3` ;
    `node_modules` fait de liens vers celui du clone principal, `@monark/*` repointés dans le worktree, retiré à la fin ; ni `GIT_DIR`,
    ni `GIT_WORK_TREE`, ni `--write-tree`. Node 24.21.0, Linux ; CPython 3.14.0rc2 sous `-E -S -s -B` pour la mesure de `canonical()`
    (§4). Le pli ne touche rien sous `tools/kata-recalc/` : la règle du lot qui se liste lui-même (G0 de 1f, §6) ne demande pas de
    commit de liste ; ses commits sont poussés ensemble, sans rebase.
- **Zone** : `apps/harness/src/policy-verifiers.ts` (ajout en fin de fichier, aucune ligne de 1f déplacée : les tueurs de 1f, l.18 à
  l.115, restent à leur ligne), `test/recompute-report.test.ts` (neuf), `docs/G0-lot-verifiers-list-f5a-1.md` (amendement sur place,
  nombre de lignes inchangé), ce G0. Pli N-6 (MONARK, `recherches` `8ac6bd6`) : `registry` sans `file`. Pli de la G2 : les mêmes
  fichiers ; dans le module, les l.150 et l.164 changent sur place et les lignes ajoutées sont après la l.170, si bien qu'aucun tueur ne
  bouge (ceux de 1f, l.18 à l.115 ; ceux de ce lot, l.124 et l.156) ; le chantier change à sa l.503, à lignes égales. Pli de la
  profondeur (§10) : dans le module, les l.170-178 (la borne `NESTING` et `canon` ; `canonOf` retiré) et la l.186 (`canon(doc)`), le
  contrôle ASCII des chaînes passant de la l.173 à la l.177 ; dans le test, la l.71 (commentaire), la l.135 (le cas à 65 niveaux), le
  tueur de la l.141 réancré (`:173` → `:177`) et un test neuf en fin de fichier (l.207-219). Aucun autre tueur ne bouge.

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

- **`readRecomputeReport(bytes)`** (`policy-verifiers.ts` l.181-188 depuis le pli de la profondeur), sur octets ou texte : UTF-8 strict et JSON, sinon « not UTF-8
  JSON », le décodeur gardant un BOM, qui échoue donc en JSON (`{ fatal: true, ignoreBOM: true }`, l.183, pli 1) ; ASCII seul (« not
  ASCII », sur le texte, avant la forme) ; forme fermée ; puis égalité des octets à l'écriture canonique, sinon « not its canonical
  writing ». Chaque refus est nommé (`MONARK recompute report: <chemin> …`), le chemin du champ fautif compris
  (`report.cells[0].scores_sha256 is off the form`) ; une valeur imbriquée au-delà de 64 niveaux aussi (pli 6 et §10, ci-dessous).
- **La forme fermée** (l.139-169), clés exactes à chaque niveau typé :
  - premier niveau : les 13 clés d'`assemble` de `report.py` **et `scope`** (14) ;
  - `format` = `monark-recompute-report-v1` ; `verifier` = `<identité>@<40 hex>`, l'identité égale à `identityOf` (règle de 1f) ;
  - `tool` = `{commit: 40 hex, tree, tree_sha256: 64 hex}` ; `registry` = `{cells: entier ≥ 0, generator_identity, sha256: 64 hex}`, sans `file` (N-6) ;
  - `inputs` = `{compare, recompute}`, listes de `{bytes: entier ≥ 0, name, role, sha256: 64 hex}` ;
  - `scope` : liste strictement croissante de classes (`^[a-z0-9]+(-[a-z0-9]+)*$`), donc triée et sans doublon ;
  - `cells` : `{cell_key, decisions_equal: booléen, scores_sha256: 64 hex ou null, task_class: classe}`, strictement croissantes par
    `(task_class, cell_key)`, donc uniques et triées ;
  - `differences` : genre `value` = `{a, b, cell_key, class, field, kind, task_class, ulps}`, `a` et `b` à l'écriture exacte que
    `float.hex()` de Python donne d'un double fini (`DOUBLE`, l.150, pli 3) : un normal `0x1.` suivi de 13 chiffres hex minuscules et d'un
    exposant signé de -1022 à 1023, sans zéro de tête ni `-0` ; un sous-normal `0x0.` suivi de 13 chiffres non tous nuls, à `p-1022` ;
    zéro `0x0.0p+0` ; un `-` en tête au besoin ; genre `digest` = `{cell_key, class, field, first_index, kind, max_ulps, task_class,
    terms}`, **sans** `a` ni `b` ; `class` ∈ {`explained, ln`, `explained, association`} ;
  - `platform` : objet libre, sauf `platform.libm.sha256`, une chaîne de 64 hex minuscules (l.164, pli 5 : `isObj(v.libm)`, un chemin de
    `REPORT_NON_ROW_DIGESTS`) ; `oracles`, `fields`, `explanation`, `summary` : objets, contenu libre (la plateforme Linux de la course
    n'est pas encore écrite ; la clause (d5) de la porte juge toute empreinte où qu'elle soit) ; `replay` : chaîne.
- **L'écriture canonique** (l.173-178) : celle de `report.py` (`canonical`) : clés triées, sans espace, entiers sûrs seuls (une
  fraction est refusée, `-0` n'est pas canonique), chaînes de `JSON.stringify`, **chaque chaîne et chaque clé ASCII** (les clés passent
  par `canon(k)` ; refus « a string that is not ASCII », le message de `report.py`, l.176-177, pli 1 : un demi-substitut échappé, ASCII
  en texte, ne se lit plus), sans LF final, et **au plus 64 niveaux de listes et d'objets, le rapport lui-même étant le premier**
  (`NESTING`, l.170-172 ; décision de MONARK, §10) : `canon` porte le niveau, et une liste ou un objet au-delà est refusé par nom, « not
  its canonical writing (nested too deep) » (l.174). La forme du rapport a 4 niveaux ; la borne ne dépend ni de la pile d'appel ni de
  l'optimisation du moteur (§4). Le `canonOf` du pli 6, qui attrapait la `RangeError`, est retiré. Le module n'importe toujours que
  `node:crypto`, `node:fs`, `node:url` (le test de 1f qui le tient passe ; depuis le second tour de 1f, `forbiddenLoads` de l'aide
  partagée lit l'AST du module entier, le lecteur compris, et n'y trouve aucun chargement calculé) : l'écriture est locale, sans
  `@monark/contracts` ni `scripts/`.
- **`REPORT_NON_ROW_DIGESTS`** (l.124) : la liste fermée de (d5), exportée pour la porte de 3a : `inputs.compare[].sha256`,
  `inputs.recompute[].sha256`, `platform.libm.sha256`, `registry.sha256`, `tool.tree_sha256` ; `cells[].scores_sha256` à part (jugé par
  (d1) et (d2)). Mesurée au §4.
- **Ce que le lecteur ne fait pas** (contrat) : aucune liaison à la liste, au registre, aux cases ni à la portée ; aucun tri imposé à
  `inputs` ni à `differences` (T2-2 et la porte) ; aucun contrôle de 64 hex hors des champs typés (la porte, (d4) et (d5)).
- **Amendement du chantier l.493-505** (sur place, 13 lignes pour 13) : le lot 2a teste dans un fichier neuf ; T2-1 garde ses
  liaisons comme **assertions sur le rapport réel**, portées par le commit de versement ; son tueur passe sur le lecteur de forme
  (`typeof v === "boolean"`, l.156). Le texte proposé au tueur par le G0 d'E-2a (`typeof c.decisions_equal === \"boolean\"`) est écrit
  `typeof v === "boolean"` : la colonne est un prédicat de la table `CELL`. Au pli de la G2, la l.503 dit la forme de `fields` (pli 2).

## 3. Tests rouges et tueurs

Tous dans `test/recompute-report.test.ts` (neuf). Le fichier importe le module par espace de noms : à la base, `policy-verifiers.ts`
se charge et n'a pas le lecteur, et chaque test rougit par une **assertion** (`typeof verifiers.readRecomputeReport === "function"`),
non par un échec de chargement (red-proof refuse un import rouge sur un fichier qui existe à la base). Au pli de la G2, rouge d'abord :
le commit des tests (`6e7249e9`) rougit sur le lecteur de `e0bfe0f4` par assertion dans T-RR et dans les deux tests neufs (§6), puis le
commit du lecteur les rend verts ; un test par tueur, les deux tueurs neufs sur les lignes neuves ou changées (l.150, l.173). Au pli de
la profondeur (§10), rouge d'abord de même : le commit des tests (`bc0657f7`) rougit sur le lecteur de `306760b3` par assertion dans
T-RR et dans le test neuf, une valeur de 65 niveaux s'y lisant ; puis le commit du lecteur (`9eeed44a`) les rend verts. Le tueur neuf
est sur la borne (l.172) ; celui du test des octets suit le contrôle ASCII à la l.177.

| Test | Ce qu'il tient | Tueur |
|---|---|---|
| **T-RR** `recompute_report_reader_judges_the_closed_form` | admis : le rapport de synthèse de forme neuve, en texte et en octets, écrit par `canonicalJson` du contrat ; 24 classes dans `scope`. Refus nommés : forme ancienne sans `scope`, clé de plus au premier niveau, `format` autre, cinq `verifier` faux, `commit` majuscule, `tree_sha256` court, clé de plus dans `tool`, `registry.sha256` majuscule, `registry.cells` à -1, 1,5 ou chaîne, `registry.file` présent (forme d'avant N-6), taille négative, clé de plus dans une entrée, quatre `scores_sha256` faux, trois `decisions_equal` non booléens, second digest par case (forme ancienne), classe hors forme, cases non triées ou répétées, quatre `scope` faux, digest sous `differences` (forme ancienne), trois flottants mal écrits, différence non expliquée, genre autre, `platform` liste, `summary` nul, fraction, `-0`, clés dans l'ordre d'insertion, espaces, LF final, LF, CR ou CR LF brut entre jetons, octet non ASCII (« not ASCII », au nom exact depuis le pli), non-JSON, non-UTF-8. **Pli de la G2** : `fields` aux cinq clés ; 2^53 dans un objet libre ; deux cases inversées à une frontière de classes (classe décroissante, clé croissante) ; `cells`, `differences` et `inputs.compare` en texte ; les huit colonnes texte en nombre (`replay`, `tool.tree`, `registry.generator_identity`, `name` et `role` d'une entrée, `cell_key` d'une case et d'une différence, `field`) ; `tool` et `cells[0]` nuls ; une clé en double au sommet et dans une case ; `platform.libm.sha256` double, majuscule, nombre ou absent, `platform.libm` nul, texte ou absent, `platform` nul, chacun « report.platform is off the form », et `platform` à clé de plus lu ; une valeur imbriquée sur 65 niveaux comptés depuis le rapport, dans `summary` (« nested too deep » ; elle prend la place du cas à 100 000 niveaux, §10) | `apps/harness/src/policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "true"` |
| `recompute_report_reader_is_closed_on_the_bytes_and_the_strings` (pli 1) | les octets canoniques se lisent ; refus au nom exact : un BOM devant les octets canoniques et un octet UTF-8 invalide dans une chaîne (« not UTF-8 JSON ») ; un demi-substitut échappé en valeur (`replay`) et en clé (la dernière d'un objet libre) (« a string that is not ASCII ») | `apps/harness/src/policy-verifiers.ts:177 CONST "!/^[\\x00-\\x7f]*$/.test(v)" -> "false"` (l.173 avant le pli de la profondeur) |
| `recompute_report_doubles_are_the_writings_of_float_hex` (pli 3) | se lisent, en `a` et en `b`, dans un seul rapport de 2 103 différences : `2^e` pour chaque exposant d'un normal (-1022 à 1023), chaque puissance de deux des sous-normaux, `-0x1.fffffffffffffp+1023`, `0x1.999999999999ap-4`, le plus grand sous-normal, `0x0.0p+0` et `-0x0.0p+0` ; refusées, chacune nommée au chemin : dix-sept écritures que `float.hex()` ne donne jamais (mantisse courte ou longue, exposant `+01`, `-0`, `+00` ou sans signe, zéro écrit en sous-normal, `0x0.0p-0`, sous-normal à `p+5` ou à `p-1021`, `p+99999`, `p+1024`, `p-1023`, `0x2.…`, majuscule, `+` en tête, `p+1e3`), et une en `b` | `apps/harness/src/policy-verifiers.ts:150 CONST "102[0-3]" -> "102[0-9]"` |
| `recompute_report_reader_binds_nothing_the_gate_binds` | se lisent (Q-P3-2) : registre autre (sha256, 0 case), nom d'entrée `compare` autre, vérificateur autre, arbre autre (chemin, digest), case à `decisions_equal` faux, digest d'une classe retenue (hors portée), classe de portée sans case, portée vide, sans différence, sans entrée `compare` | `apps/harness/src/policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "v === true"` (l'ancienne règle de T2-1 dans le lecteur) |
| `recompute_report_non_row_digests_are_a_closed_list` | mesure (d5) sur synthèse : les chemins des sous-chaînes de 64 hex (valeurs et clés) = `REPORT_NON_ROW_DIGESTS` ∪ `cells[].scores_sha256` ; aucun sous `differences` ; digest pour chaque case de la portée, `null` pour chaque classe retenue | `apps/harness/src/policy-verifiers.ts:124 CONST "\"platform.libm.sha256\", " -> ""` |
| `recompute_report_synthetic_passes_the_spec_gate` | les octets admis par le lecteur passent `contentProblems` en sorte `json` au chemin `contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json` (textes fixes de `report.py`, clés de case du registre) | `scripts/spec-publish.mjs:113 CONST "k.replace(VENUE, \"@$1KEY/\")" -> "k"` |
| `recompute_report_nesting_is_bounded_at_64_levels` (§10) | la forme du rapport de synthèse a 4 niveaux (le rapport, `inputs`, `inputs.compare`, une entrée) ; dans chacun des cinq objets libres (`explanation`, `fields`, `oracles`, `platform`, `summary`), en listes puis en objets, une valeur dont le rapport compte 64 niveaux se lit et une de 65 est refusée au nom exact « not its canonical writing (nested too deep) », le compte de chaque cas vérifié (64, 65) | `apps/harness/src/policy-verifiers.ts:172 CONST "64" -> "65"` |

- **Le rapport de synthèse** : les 280 cases de `wave1.json` (`811fcd57…`), triées ; `scores_sha256` = `calib.scoresSha256` de la ligne
  pour une classe de bande, `null` pour les 8 classes `*-dir-1h` et `*-dir-4h` ; les textes fixes lus dans le bloc `TEXTS` de
  `report.py` ; une différence de chaque genre ; plateforme Linux inventée. 42 168 octets, sha256 `e5ef12a4…` (§4). **Au pli de la
  G2** : `fields` a les cinq clés que l'outil figé écrit, `decisions`, `digest_rule`, `digests`, `value_rule`, `values`, sans
  `outside_decisions` et sans lire `TEXTS.outside_reason` (pli 2) : 41 939 octets, sha256 `b0d03f7e…` (§4).
- **Mutants équivalents** (mesurés, 22 mutants à la main sur le lecteur, chacun seul, fichier de test rejoué) : un seul vivant au premier
  tour, `|| rfail(…)` dans `each`, mort-né parce que chaque élément de liste est un objet fermé qui lève lui-même. La branche est
  retirée (l.154) ; au second tour, 21 sur 21 tués (clés exactes, ordre des cases sur les deux champs, ordre de la portée, ASCII,
  canonique, entier sûr, identité du vérificateur, compte ≥ 0, flottant, classe, `class`, choix du genre, `scores_sha256`, objets libres,
  `format`, forme du vérificateur, et les quatre tueurs) ; au pli N-6, trois de plus, tués : `file` rendu à `registry`, `registry` libre, CR et LF ignorés à l'égalité canonique.
- **Mutants au pli de la G2** (recomptés ; détail au §9) : 57, chacun seul sur le module de la tête, tout le fichier de test rejoué,
  fichier restauré et sha256 revérifié : les 24 ci-dessus, tués ; les huit que nomme la G2 (N1, N2, N5, N8, N10, N12, N13, N14), tués ;
  25 sur les clauses du pli, dont 24 tués. Le seul vivant est **équivalent** : la garde `typeof v === "string" &&` de la l.173 retirée,
  le test de l'expression sur un nombre, un booléen ou `null` lit leur texte ASCII et ne refuse rien ; `tsc` refuse ce mutant (TS2345).
  Soit 56 tués et un équivalent. N1 était équivalent avant le pli (`ignoreBOM: false` est le défaut) ; il est tué depuis.
- **Mutants au pli de la profondeur** (§10 ; même méthode, sur le module de `9eeed44a`) : les deux mutants de la `RangeError` (pli 6)
  n'ont plus de code ; treize mutants neufs sur la borne, tous tués par assertion : la borne à 65 (le tueur) et à 63 ; `>=` ; le
  rapport compté 0 ou 2 ; une liste, ou un objet, sans niveau de plus ; la borne sur toute valeur, scalaires compris ; sur les seuls
  objets ; sur les seules listes ; pas de borne ; un autre nom ; un refus sans son nom (la valeur écrite vide). Trois mutants de
  `canon` rejoués sur leurs lignes neuves, tués : clés écrites sans `canon`, le tueur de la l.177, `isInteger` pour `isSafeInteger`.
  Hors ces trois, les 55 mutants restants du pli de la G2 ne sont pas rejoués : aucune ligne qu'ils mutent ne change, sauf le numéro
  de la l.173, devenue l.177 (l'équivalent y reste). Compte : 68 mutants (55 et 13), 67 tués, un équivalent.

## 4. Mesures

- **Écriture canonique croisée avec l'outil** : `canonical` de `report.py` à `09f49fc2` (arbre extrait par `git archive`, importé tel
  quel, `io_guard` compris, sous `python3.14 -I -E -s -B`) rend, sur le rapport de synthèse relu, **les mêmes octets** (sha256
  `e5ef12a4bb0734445144e4dcd3cfcdb5b57f7c97ff569ac87d1c93816d92b4b6`) que `canonicalJson` du contrat, que le lecteur admet (remesuré au pli N-6, CPython 3.14.0rc2).
  **Remesuré au pli de la G2**, sur la synthèse à cinq clés de `fields`, sous `python3.14 -E -S -s -B` (CPython 3.14.0rc2 ; la forme de
  lancement qu'exige l'`io_guard` de l'outil figé, qui refuse `-I`), avec `report.py` de `09f49fc2` (`30e41c83…`, le même que celui de
  la tête), la synthèse lue avant l'import de l'outil : **les mêmes octets**, 41 939, sha256
  `b0d03f7ee2390ce0f76c43ae1eb5eb2a33ff44af70097ed631a42e4678692a9f`, que le lecteur admet. La méthode redonne 42 168 octets et `e5ef12a4…` sur le fichier de test de `e0bfe0f4`. La mesure croisée finale
  se refait contre l'outil figé, sous `-E -S -s -B`, à sa PR (MONARK, `e6d5517`).
- **La règle de `float.hex()`** (pli 3 ; CPython 3.14.0rc2 sous `-E -S -s -B` pour oracle, `float.fromhex(s).hex() == s`) : les 20 009
  écritures de doubles finis tirés (graine 1007, plus 9 bornes) sont admises ; sur 53 362 écritures voisines (formes de l'exposant de
  -1 100 à 1 100, longueur de la mantisse, casse, signe, premier chiffre), `DOUBLE` admet exactement celles dont l'aller-retour tient ;
  sur 1 333 320 textes d'exposant (1 à 5 chiffres, signe `+`, `-` ou aucun, quatre mantisses), il décide comme l'expression de la pièce
  suivie de sa borne [-1022, 1023], que la l.150 écrit dans l'expression même. L'ancienne règle admettait 12 des 17 écritures refusées
  par le test (les cinq autres : sans signe, `0x2.…`, majuscule, `+` en tête, `p+1e3`).
- **La profondeur** (pli 6) : `canonical()` de `report.py` écrit au plus 499 niveaux de listes (limite de récursion 1 000). Le `canon`
  du lecteur va plus loin, et sa borne dépend de l'optimisation du moteur : sous Node 24.21.0, la plus grande profondeur lue est 3 125
  niveaux sans chauffe et 12 852 après 1 000 à 30 000 lectures, si bien qu'un cas à 10 000 niveaux se lit après chauffe (un premier
  appel à 10 000 niveaux est refusé par nom). Le cas prend donc 100 000 niveaux, refusés par nom dans chaque état mesuré (Node 22.22.2
  aussi). **Remplacé par la borne fixe de 64 niveaux** (décision de MONARK, §10), mesurée ainsi :
  - `canonical()` de `report.py`, remesuré : 499 niveaux au plus, en listes nues comme dans un rapport (le rapport compté premier,
    `summary` deuxième), pour `report.py` de `09f49fc2` (`30e41c83…`, celui de cet arbre) et de l'outil figé à `29c53bd5` (`b2e5767f…`) ;
    CPython 3.14.0rc2 sous `-E -S -s -B`, `io_guard` importé, appel depuis le niveau d'un script, recherche par dichotomie, limite de
    récursion 1 000. Les niveaux 65 à 499 sont donc écrits par l'outil et refusés par le lecteur : la borne est la plus stricte
    (fail-closed).
  - **La forme du rapport a 4 niveaux** : le rapport, `inputs`, `inputs.compare` (ou `recompute`), une entrée. Sur la synthèse, le test
    neuf le mesure. Dans l'outil figé à `29c53bd5`, lu (`assemble`, l.383-400 ; `platform_fields`, l.127-128 ; `oracles_of`,
    l.199-202 ; `census`, l.308 ; `entries_of`, l.340-349, et ses termes, l.287) : `platform.libm`, `oracles.*`, `fields.values`, `fields.digests`,
    `explanation.classes`, `explanation.log`, `cells[]` et `differences[]` sont au niveau 3, les entrées de `inputs` au niveau 4, et rien
    n'est plus profond. La borne est à 60 niveaux de la forme.
  - **Sonde** (`probe-depth.mjs`, hors dépôt ; une synthèse, `z` dans `summary`), à froid puis après 3 000 lectures des cas à 64 et 65
    niveaux, Node 24.21.0 : sur le lecteur de `306760b3`, 64, 65 et 3 200 niveaux se lisent, 13 000 et 100 000 sont refusés par nom ;
    sur celui de `9eeed44a`, 64 se lit, et 65, 3 200, 13 000 et 100 000 sont refusés par nom, dans les deux états. `JSON.parse` lit les
    100 000 niveaux sans erreur, la forme fermée ne descend pas dans les objets libres, et `canon` s'arrête au niveau 65 : aucun refus ne
    dépend plus de la pile d'appel.
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
  classe d'explication ; `fields` a exactement {decisions, digest_rule, digests, value_rule, values}, sans `outside_decisions` (voie 1). Tueur :
  `policy-verifiers.ts:156 CONST "typeof v === \"boolean\"" -> "true"` n'y suffit plus (le fichier réel n'a que des booléens) : celui du versement vise l'épingle du rapport dans `COMMITTED_REPORTS` (a1).
- **T2-3** `recompute_report_is_canonical_and_passes_the_spec_gate` : `contentProblems` au chemin daté est vide sur les octets réels
  (même forme que `recompute_report_synthetic_passes_the_spec_gate`, sur le fichier). Tueur : `scripts/spec-publish.mjs:113`, comme ici.
- **Remesure de (d5)** : la fonction `paths` de `recompute_report_non_row_digests_are_a_closed_list`, sur le rapport réel, rend
  `REPORT_NON_ROW_DIGESTS` ∪ `cells[].scores_sha256`, rien sous `differences`. Si le rapport réel porte une empreinte ailleurs, la liste
  fermée change par un lot de RECHERCHES avant 3a, jamais au versement.
- **Si la forme réelle diffère du §2** (une clé de l'outil figé que la partie 3 n'écrit pas) : T2-1 rougit au versement sur
  `readRecomputeReport` ; RECHERCHES amende le lecteur par un lot court, sur la forme réelle, avant le versement.

## 6. Preuves

- **Pli de la profondeur** (§10 ; gel `9eeed44a1c4d68d004e406f8128ff6375b6e18f0`, la tête de code du pli ; le commit suivant ne
  change que ce G0, hors du digest) :
  - **Rouge d'abord** : le fichier de test de `bc0657f7` sur le lecteur de `306760b3` (module sha256 `fa9e9af2…`) : 7 tests, 2 rouges
    par assertion, T-RR (« Missing expected exception: a value 65 levels deep in a free object ») et le test neuf (65 niveaux : `reads`
    au lieu du refus ; 64 niveaux : `reads`, comme attendu), 5 verts ; à `9eeed44a`, 7 verts.
  - **red-proof comme ce G0 le déclare**, contre la tête de 1f : `node scripts/red-proof.mjs --base
    e6d13075cab9f6611a9e6a0903beed2268c24118 --gel 9eeed44a1c4d68d004e406f8128ff6375b6e18f0 --repo <worktree> --out <dossier> --draw 7
    --seed 1007`, Node 24.21.0, Linux : sortie 0, « red-proof OK: 7 judged, 0 unchanged, 7 killer(s) drawn » ; sept F2P ; les sept
    tueurs tirés et tués, l.172, l.150, l.177, l.124, l.156 `true` et `scripts/spec-publish.mjs:113` par assertion, l.156 `v === true`
    par le refus du lecteur lui-même (`other-fail`, comme à chaque passe) ; digest du gel
    `121aab69e1ff1b2c1db287369d7d9fcac27bf733eb3626fdf5814ed06eec2941` ; `RED-PROOF.json` sha256
    `0bdb0ba27143648aa4677542e6585f8182220f45fc862fe07ec0705f806afb42`.
  - **red-proof du pli seul**, contre `306760b3` : même commande, `--base 306760b3428ae0087f5f271f32f6560efeb15737 --draw 2` : sortie 0,
    « red-proof OK: 2 judged, 5 unchanged, 2 killer(s) drawn » ; T-RR et le test neuf F2P (rouges à `306760b3` par assertion) ; les
    tueurs l.172 et l.156 `true` tués par assertion ; digest du gel `8e46b59d7010d66b0fed6b6024e1e1e19f25f49be5d051162049e0c1ec56db1c` ;
    `RED-PROOF.json` sha256 `880caa4199d8922455d2953ec79aba3a700d7344f7f25570cdff9ba109887023`.
  - **Voisins** (les douze fichiers du pli de la G2, Node 24.21.0, `(test 42)` filtré) : 176 tests, 175 verts ; seul rouge, le témoin
    de 1f.
  - **Portes** : `tsc --noEmit` 0 ; `eslint` du module et de `test/recompute-report.test.ts` 0 ; `gate:vocab` 0 (349 fichiers) ;
    `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base 306760b3` : 2 fichiers, aucun risque Windows.
  - **Ancres** : `verifie-ancres.mjs` (`--ref 306760b3 --ref e6d13075`) : 1 537 tueurs dans l'arbre, tous ANCRE, aucun PERDU ni
    DERIVE ; les 7 de `test/recompute-report.test.ts` (`--touched e6d13075 HEAD`), tous ANCRE.
  - **La garde des tueurs du tronc** (`every_killer_line_is_readable`, `test/killer-lines.test.ts`, absente de cette pile) : `9eeed44a`
    fusionné en local, `--no-ff`, dans le tronc `377f40cd` (worktree jetable, rien de poussé, retiré) : aucun conflit ; la garde passe,
    les 7 tests du lecteur passent, ceux de 1f aussi sauf le témoin ; `tsc --noEmit` 0 ; `verifie-ancres.mjs` (`--ref 377f40cd --ref
    9eeed44a`) : 1 621 tueurs, tous ANCRE.
- **red-proof du pli de la G2** (gel `bca14f41fe001c01b8062d611b1813408d6717a8`, la tête de code du pli) contre la tête de 1f :
  `node scripts/red-proof.mjs --base 12588884d6a7f7d259ff3bd3ec86d1ddc636e85b --gel HEAD --repo <worktree> --out <dossier> --draw 6
  --seed 1007`, Node 24.21.0, Linux : sortie 0, « red-proof OK: 6 judged, 0 unchanged, 6 killer(s) drawn » ; six F2P (rouges à la base
  par assertion, verts au gel) ; les six tueurs tirés et tués : l.150, l.173, l.124, l.156 `true` et `scripts/spec-publish.mjs:113` par
  assertion, l.156 `v === true` par le refus du lecteur lui-même (`other-fail`, comme à chaque passe) ; digest du gel
  `a816b71b6adc8d888d4604aabc978c2e44c869e93e03775f86a32e1d5488fb7a` ; `RED-PROOF.json` sha256
  `2a549c6a379843661e15f5cb704f433cc616f11f7bdd6a43f2989d295589dd9e`. Le commit suivant ne change que `docs/**/*.md`, hors du digest.
- **Rouge d'abord** : le fichier de test du pli (`6e7249e9`) sur le lecteur de `e0bfe0f4` : 6 tests, 3 rouges par assertion (T-RR,
  « platform.libm.sha256 two digests » ; octets, « a byte order mark before the canonical bytes » ; flottants, « 0x1.0p+0 »), 3 verts ;
  au commit du lecteur (`bca14f41`), 6 verts. Cas par cas sur l'ancien lecteur : 22 écarts lus (BOM, deux demi-substituts, sept de
  `platform.libm`, douze flottants), 2 refus sans nom (`RangeError`, 10 000 et 100 000 niveaux), 25 refus nommés (les dix-sept du pli 4,
  l'octet non ASCII et l'octet UTF-8 invalide, `platform` nul, cinq flottants) ; sur le neuf, 49 refus nommés, et les trois cas qui
  doivent se lire se lisent. Les six mutants survivants de la G2 survivent bien aux tests de `e0bfe0f4` (module sha256 `377813c2…`).
- **Stabilité du cas profond** : fichier rejoué 8 fois, T-RR seul (`--test-name-pattern`, comme red-proof) 5 fois, Node 22.22.2 3 fois :
  tous verts.
- **Voisins du pli** (les douze fichiers ci-dessous, Node 24.21.0, `(test 42)` filtré) : 174 tests, 173 verts ; seul rouge, le témoin
  de 1f. `test:main` (Linux, à `bca14f41`) : 2 847 tests, 2 824 verts, 22 sautés ; seul rouge, le témoin de 1f.
- **Portes du pli** : `tsc --noEmit` 0 ; `eslint` des trois fichiers TypeScript (module, `recompute-report`, `verifiers-list`) 0 ;
  `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base 12588884` : 4 fichiers,
  aucun risque Windows ; `verifie-ancres.mjs` (`--ref e0bfe0f4 --ref 12588884`) : 6 tueurs de ce lot, 20 dans les fichiers de test de la
  pile, 1 535 dans l'arbre, aucun PERDU ni DERIVE.
- **Après la fusion de la réécriture du §6 de 1f** (gel `57bae5628961267e4e5f80b95b2f0f8155ae0df0`) : `node scripts/red-proof.mjs --base
  c601290b0e2ed283e08a1eda5dff5260182534fc --gel HEAD --repo <worktree> --out <dossier> --draw 6 --seed 1007`, Node 24.21.0, Linux :
  sortie 0, « red-proof OK: 6 judged, 0 unchanged, 6 killer(s) drawn », les six F2P et les six tueurs tués comme ci-dessus ; digest du gel
  `a816b71b…`, le même ; `RED-PROOF.json` sha256 `70db0e5a828f47c39123695b9511cc2d5a661fd6c08d66a58d675a6c96bb72db`. Voisins : 174 tests,
  173 verts, seul rouge le témoin de 1f ; portes : `tsc --noEmit` 0, `eslint` des trois fichiers TypeScript 0, `lang:gate` 0,
  `gate:vocab` 0, `lint:ratchet` 69/69, `export:check` 0, winlint `--base c601290b` 4 fichiers sans risque Windows, `verifie-ancres.mjs`
  (`--ref 89e76c44 --ref c601290b`) 6 tueurs de ce lot et 1 535 dans l'arbre, aucun PERDU ni DERIVE ; taille contre `c601290b` : 2
  fichiers, 275 insertions.
- **Après la fusion du second tour de 1f** (gel `a525f34740642221560f39472da1999c6b585047`) : `node scripts/red-proof.mjs --base
  e6d13075cab9f6611a9e6a0903beed2268c24118 --gel HEAD --repo <worktree> --out <dossier> --draw 6 --seed 1007`, Node 24.21.0, Linux :
  sortie 0, « red-proof OK: 6 judged, 0 unchanged, 6 killer(s) drawn », six F2P et six tueurs tués ; digest du gel `a816b71b…`, le
  même ; `RED-PROOF.json` sha256 `04493030aaf678b5fee566b4730958e3e6b5cfa11aed9ea63a11789c7648e3ee`. Voisins : 175 tests, 174 verts,
  seul rouge le témoin de 1f (le test neuf de l'aide y passe, sur le module que ce lot étend) ; portes : `tsc --noEmit` 0, `eslint` des
  quatre fichiers TypeScript (l'aide comprise) 0, `lang:gate` 0, `gate:vocab` 0, `lint:ratchet` 69/69, `export:check` 0, winlint
  `--base e6d13075` 4 fichiers sans risque Windows, `verifie-ancres.mjs` (`--ref c53fd342 --ref e6d13075`) 1 536 tueurs, 6 de ce lot
  et 21 dans les fichiers de test de la pile, aucun PERDU ni DERIVE ; taille contre `e6d13075` : 2 fichiers, 275 insertions.
- **CI du pli** (run `37632575842`, `pull_request`, tête `89e76c44`) : six contrôles sur sept verts ; `g3-verification` rouge par le seul
  `verifier_list_commit_carries_the_listed_tree` (2 847 tests, 2 824 verts, 22 sautés, un rouge, le témoin de 1f) ; R-25 en mode
  `written` : 275 (borne 1 205). Runs de `57bae562` (`37633385366`) et de `c53fd342` (`37633551049`) : le même seul rouge.
- **red-proof, après la fusion du second pli de 1f** (gel `6fea707667188f1b144afde18fdf07143828d422`, tueurs inchangés) contre la
  tête de 1f : `node scripts/red-proof.mjs --base 12588884d6a7f7d259ff3bd3ec86d1ddc636e85b --gel HEAD --repo <worktree> --out
  <dossier> --draw 4 --seed 1007`, Node 24.21.0, Linux : sortie 0, « red-proof OK: 4 judged, 0 unchanged, 4 killer(s) drawn » ;
  quatre F2P (rouges à la base par assertion, verts au gel) ; quatre tueurs tués, `scripts/spec-publish.mjs:113`, l.124 et l.156
  par assertion, l.156 `v === true` par le refus du lecteur lui-même (`other-fail`, comme à chaque passe précédente) ; digest du gel
  `6555087149cf5ad0d0cf5c2c87051a9955d15daccce4f255360a73f52fe31331` ; `RED-PROOF.json` sha256
  `815947eda376933a98de47149917ec32af3ad73a7e1a961bc2ffd6e474af5b38`. Le commit suivant ne change que ce G0, hors du digest.
- **Voisins après cette fusion** (mesurés sur l'arbre de la première fusion, le même ; mêmes fichiers que ci-dessous, Node 24.21.0, `(test 42)` filtré) : 172 tests, 171 verts ; seul
  rouge, le témoin de 1f. `test:main` : la CI de la PR la court.
- **Portes après cette fusion** : `tsc --noEmit` 0 ; `eslint` des trois fichiers TypeScript (module, `recompute-report`,
  `verifiers-list`) 0 ; `lang:gate` 0 ; `gate:vocab` 0 (349 fichiers) ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  12588884` : 4 fichiers, aucun risque Windows ; `verifie-ancres.mjs` (`--ref 5c984244 --ref 12588884`) : 4 tueurs de ce lot, 18 dans
  les fichiers de test de la pile, 1 533 dans l'arbre, aucun PERDU ni DERIVE.
- **red-proof, première fusion** : après la fusion de `6c53e0a1` (gel `4b8ebfa9`, tueurs déplacés) contre la tête de 1f : `node scripts/red-proof.mjs --base
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
- Après la fusion du second pli de 1f, même forme (les 21 pathspecs de `.github/workflows/ci.yml`, environnement épinglé de
  `scripts/lot-size-integration.mjs pin`, `origin/recherches/verifiers-list-1f...HEAD`, base `12588884`) : **2 fichiers, 217
  insertions** (`policy-verifiers.ts` 67, `test/recompute-report.test.ts` 150), soit 217, inchangé.
- **Au pli de la G2**, même forme (les 21 pathspecs de `.github/workflows/ci.yml` l.100, base `12588884`) : **2 fichiers, 275
  insertions** (`policy-verifiers.ts` 70, `test/recompute-report.test.ts` 205), soit 275 (borne de lot 547). Le même compte sous
  l'environnement épinglé de `scripts/lot-size-integration.mjs pin --base 12588884`, lu dans un clone `--shared` jetable où `pin` écrit
  ses objets (aucune variable `GIT_DIR` ni `GIT_WORK_TREE`) : 2 fichiers, 275 insertions.
- **Au pli de la profondeur** (§10), même forme (les 21 pathspecs de `.github/workflows/ci.yml` l.100, base `e6d13075`, la tête de 1f) :
  **2 fichiers, 291 insertions** (`policy-verifiers.ts` 72, `test/recompute-report.test.ts` 219), soit 291, contre 275 avant le pli
  (+16 ; borne de lot 547, borne de la CI 1 205). Le même compte sous l'environnement épinglé de `scripts/lot-size-integration.mjs pin
  --base e6d13075`, lu dans un clone `--shared` jetable à la tête du pli (retiré ; aucune variable `GIT_DIR` ni `GIT_WORK_TREE`) : 2
  fichiers, 291 insertions.

## 8. Ce qui n'est pas fait

- Le rapport réel, son entrée `COMMITTED_REPORTS`, T2-1, T2-3 et la remesure de (d5) sur lui : commit de versement de MONARK (§5).
- Aucun consommateur du lecteur n'est branché : la porte (3a), l'écrivain (b1-a) et la table d'épingles de la garde (b2).
- La forme réelle de l'outil figé n'est pas lue (§4) ; aucune course, aucune série lue.
- Le témoin de 1f (commit de 40 zéros) est hérité : `verifier_list_commit_carries_the_listed_tree` reste rouge sur cette pile
  jusqu'au rebase de 1f.
- Les mentions d'`outside_decisions` aux l.332, l.603 et l.934 du chantier, hors du bloc amendé ici : MONARK les plie dans l'outil figé
  (`e6d5517`, point 2). La mesure croisée finale contre l'outil figé, sous `-E -S -s -B` : à sa PR (§4).

## 9. Pli de la G2 de #234 (MONARK, `e6d5517` ; pièce `g2-234.json` : deux M, quatre m)

Lignes lues à la tête `e0bfe0f4` avant le pli : celles de la pièce (relue à `5c984244`) tiennent pour le module et le test, qui n'ont
pas bougé depuis ; dans ce G0, la clause de T2-1 était à la l.121 (la pièce dit l.115, le début de T2-1) et la mesure de la synthèse à
la l.89 (la pièce dit l.83) ; la l.503 du chantier est celle de la pièce.

| # | Constat | Pli | Où (tête `bca14f41`) |
|---|---|---|---|
| 1 (M) | lecteur ouvert sur les octets (BOM admis) et sur les chaînes (demi-substitut échappé admis en valeur et en clé) | `{ fatal: true, ignoreBOM: true }` ; `canon` écrit les clés par `canon(k)` et refuse toute chaîne non ASCII, « a string that is not ASCII » ; test neuf, deux cas et leur tueur ; « not ASCII » tenu au nom exact | `policy-verifiers.ts:181`, `:172-173` ; `test/recompute-report.test.ts:138-151`, `:114` |
| 2 (M) | la synthèse porte `fields.outside_decisions`, que la voie 1 a retiré | `fields` aux cinq clés, `TEXTS.outside_reason` non lu ; T2-1 (§5) et chantier l.503, à lignes égales ; synthèse remesurée (§3, §4) | `test/recompute-report.test.ts:36`, `:117` ; §5 ; chantier l.503 |
| 3 (m) | `DOUBLE` admet des écritures que `float.hex()` ne donne jamais | la règle exacte de la pièce, sa borne écrite dans l'expression (mêmes décisions, §4) ; test neuf, ses cas et son tueur sur la l.150 | `policy-verifiers.ts:150` ; `test/recompute-report.test.ts:153-168` |
| 4 (m) | six refus tenus par aucun cas (N5, N8, N10, N12, N13, N14), clés en double sans cas | les cas de la pièce : 2^53, frontière de classes inversée, `0x2.0000000000000p+0` (au test des flottants), trois listes en texte, huit colonnes texte en nombre, `tool` et `cells[0]` nuls, une clé en double au sommet et dans une case ; mutants recomptés (§3, ci-dessous) | `test/recompute-report.test.ts:118-129`, `:164` |
| 5 (m) | `platform.libm.sha256` non typé | `platform: (v) => isObj(v) && isObj(v.libm) && fits(HEX64)(v.libm.sha256)`, `platform` restant libre ; huit cas refusés, un lu | `policy-verifiers.ts:164` ; `test/recompute-report.test.ts:130-134` |
| 6 (m) | une `RangeError` non nommée à 10 000 niveaux | `canonOf` attrape la seule `RangeError` en « not its canonical writing (nested too deep) » ; un cas à 100 000 niveaux (§4 : 10 000 se lisent une fois `canon` optimisé). **Remplacé** depuis par la borne fixe de 64 niveaux (décision de MONARK, §10) | `policy-verifiers.ts:175-176`, `:184` ; `test/recompute-report.test.ts:135` (à `bca14f41` ; depuis : §10) |
| obs. 7 | provenance : « CPython 3.14.8 » ; lancement `-I` au §4 | l.15 corrigée (3.14.0rc2) ; remesures sous `-E -S -s -B` (§4) | en-tête, §4 |

- **Mutants** (chacun seul sur `policy-verifiers.ts` de la tête, ou `scripts/spec-publish.mjs` pour un tueur, tout le fichier de test
  rejoué, fichier restauré et sha256 revérifié ; « tué » : un test rougit) :

| Famille | Mutants | Tests de `e0bfe0f4` | Tests du pli |
|---|---|---|---|
| les 24 de ce lot (21 du second tour, 3 du pli N-6) | clés exactes, ordres, ASCII, canonique, entier sûr, vérificateur, comptes, flottant, classe, `class`, genre, `scores_sha256`, objets libres, `format`, `registry`, CR et LF, les quatre tueurs | tués (tours d'avant, §3) | tués |
| nommés par la G2 | N1 (`ignoreBOM: false`), N2 (`fatal: false`) | N1 équivalent, N2 ne change que le nom (pièce) | tués (test des octets) |
| | N5, N8, N10, N12, N13, N14 | survivent (rejoués ici) | tués, chacun par une assertion |
| clauses du pli (25) | ASCII des chaînes et des clés (2) ; `RangeError` seule, et toute erreur (2) ; option `ignoreBOM` retirée ; formes et bornes de l'exposant, celui des sous-normaux compris (10) ; les deux longueurs de mantisse (2) ; le zéro (2) ; le signe ; `platform` libre, sa garde, celle de `libm`, le type du digest (4) ; la garde de type de la l.173 | — | 24 tués ; la garde `typeof v === "string" &&` de la l.173 retirée est équivalente (refusée par `tsc`, TS2345) |

  Total : 57 mutants, 56 tués, un équivalent.

## 10. Pli de la décision de MONARK sur la profondeur de `canon` (`recherches` `b97d5b1`, point 3)

La décision, citée : « **La profondeur de `canon`** : une borne fixe de **64 niveaux**, refusée en « not its canonical writing (nested
too deep) ». Un cas à 64 doit passer, un cas à 65 être refusé. La forme du rapport est loin de cette borne. Au-delà, la dépendance au
JIT disparaît, et le refus reste plus strict que `canonical()` de report.py (499) : c est fail-closed. » Elle répond au point 6 de
RECHERCHES pour #234 (`recherches` `5922660` : « À ta décision : une borne de profondeur fixe retirerait cette dépendance au JIT »).

| Quoi | Où (tête `9eeed44a`) |
|---|---|
| le compte, en niveaux de listes et d'objets, le rapport lui-même étant le premier ; la borne `NESTING = 64` | `policy-verifiers.ts:170-172` |
| `canon` porte le niveau (1 au rapport, un de plus par liste ou objet) et refuse une liste ou un objet au-delà de la borne, « not its canonical writing (nested too deep) » ; `canonOf` et la prise de la `RangeError` sont retirés, l'appel est `canon(doc)` | `:173-178`, `:186` |
| T-RR : le cas à 100 000 niveaux devient un cas à 65 niveaux dans `summary` | `test/recompute-report.test.ts:135` (commentaire l.71) |
| test neuf `recompute_report_nesting_is_bounded_at_64_levels` : la forme a 4 niveaux ; 64 se lisent et 65 sont refusés au nom exact, dans les cinq objets libres, en listes et en objets, le compte de chaque cas vérifié | `test/recompute-report.test.ts:207-219` |
| tueur neuf `policy-verifiers.ts:172 CONST "64" -> "65"` ; tueur du test des octets réancré, `:173` → `:177` | `test/recompute-report.test.ts:210`, `:141` |

- **Le compte part du rapport** : un objet libre est au niveau 2, si bien qu'une valeur de 62 listes imbriquées dans `summary` fait un
  rapport de 64 niveaux. C'est le compte du §4, où `canonical()` de `report.py` écrit au plus 499 niveaux, le rapport compté premier.
- **Où vit `canon`** : dans ce lot seul (`git grep -n canon e6d13075 -- apps/harness/src/policy-verifiers.ts` ne trouve que les
  commentaires et le contrôle canonique de la liste de 1f, l.84) ; il n'est pas sous `tools/kata-recalc/**`. #231 ne change donc pas,
  et rien n'est à fusionner dans cette PR.
- **La règle du lot qui se liste lui-même** (G0 de 1f, §6, cinq conditions) : le pli ne touche pas l'outil, donc aucun commit de liste ;
  aucun rebase ; ses trois commits (`bc0657f7` les tests, `9eeed44a` le lecteur, puis ce G0) sont poussés ensemble.
- **Preuves** : §6 (rouge d'abord, deux red-proof, voisins, portes, ancres, garde des tueurs sur une fusion locale avec le tronc) ;
  mesures : §4 ; mutants : §3 ; taille : §7 (291).
- **Non vérifié ici** : le rejeu Windows (MONARK, à la fusion) ; la forme réelle de l'outil figé n'est lue que dans son code (§4), sans
  course.
