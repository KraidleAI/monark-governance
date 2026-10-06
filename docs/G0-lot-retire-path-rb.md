# G0 du lot R-b d'ENGINE-ROW-RETIRE-PATH-1 : la version de table datée, la carte des dossiers servis, la liste de retrait publiée (F-1) et la mesure de latence

- **Demande** : MONARK écrit R-a et R-b (réponse Q-R4 de sa relecture, `2026-10-06-MONARK-vers-RECHERCHES-204-finale-d9-retrait.md` §5). Entrées :
  - le brouillon de G0 de RECHERCHES (`coordination/pieces/2026-10-06-G0-retire-path/G0-ENGINE-ROW-RETIRE-PATH-1-brouillon.md`), §3 ligne R-b, §4.3, §4.5 et §5 (R-T7 à R-T10) ;
  - la relecture de MONARK, §5 : F-1 à F-4, réponses Q-R1 à Q-R6 ;
  - l'acceptation de RECHERCHES (`2026-10-06-RECHERCHES-vers-MONARK-G2-204-205-zone.md`, section « G0 d'ENGINE-ROW-RETIRE-PATH-1 » : F-1 à F-4 acceptées) ;
  - au repli : le verdict REFUSE de la G2 (vérificateur neuf, `F:/tmp/dojo/verify-rb.json` : B-1, M-1, M-2, m-1 à m-10), les décisions de MONARK sur chacun, et deux précisions liantes de RECHERCHES (un dossier daté n'est jamais réécrit, quelle que soit l'option ; M-2 écrit et testé).
- **Base** : `lot/etude-suite` `a43b0126` (fusion de #187), branche `monark/retire-path-rb`, worktree `F:/Monark-wt-rb`. Écrit par un worker `claude-opus-5-5` (effort max) pour MONARK ; replié par un worker `claude-opus-5-5` (effort max), le 2026-10-06 de 21:45:57 à 22:45 UTC (horloge lue), sur l'arbre que la G2 a jugé (sha256 des sept fichiers égaux à `F:/tmp/verify-rb/sha-after.txt`). Aucun commit (R-20), aucun `GIT_DIR`, aucun `--write-tree`.
- **Zone** :
  - `scripts/spec-policy-tables.mjs` et `.d.mts` (le compagnon de type, nécessaire à `tsc` : zone confirmée par MONARK, m-5) ;
  - `scripts/spec-publish.mjs`, là seulement où F-1 l'exige : une fonction en fin de fichier, son appel en l.210, la l.21 de l'en-tête ;
  - `scripts/retire-latency.mjs` et `.d.mts`, neufs ;
  - `test/spec-retire-path.test.ts`, neuf ;
  - ce G0.

  `scripts/spec-publish-inputs.json` n'est pas touché (voir « Tuyaux »). Aucun fichier du harnais, aucun octet servi.
- **Sources** :
  - CONTRACT 1.1.0 : `F:/tmp/dojo/CONTRACT-ffb5ea3.md`, sha256 `ac8187fa…32aa`, égal à l'épingle de `contract-1.1.0/CONTRACT.md` (`scripts/spec-publish-inputs.json` l.20). Lignes l.441 (nouveaux fichiers dans un dossier neuf), l.447 (ligne retirée gardée `current`), l.449 (un fichier publié n'est jamais enlevé ni réécrit), l.488 (le `policy_table_sha256` servi est l'empreinte du fichier publié), l.492 (F-2) ;
  - ADR 0006, addendum 9 : points 1, 5 et 6.

## Constat (mesuré à `a43b0126`)

- **L'écrivain ne connaît qu'un dossier** (`scripts/spec-policy-tables.mjs`) :
  - l.24-25 : `VERSION_DIR = "contract-1.1.0"`, `OUT_DIR` ;
  - l.60 : chaque table servie est écrite sous `OUT_DIR`.
- **`spec-publish` admet déjà le dossier daté** (`scripts/spec-publish.mjs`) ; ancres réancrées depuis `febf7735` (F-3) :
  - l.121-122 : nom `contract-<x.y.z>-tables-<YYYY-MM-DD>`, jour réel par `validDate` (l.46-50) ;
  - l.150-151 : une table neuve sous le dossier de sa release, ou portée à l'octet (`carried`) ;
  - l.200 `added_to_published`, l.201 `foreign_version_dir`, l.203 `withdrawn`, l.207 `rewritten`.
- **Les règles de ligne** `recompute_held` et `short_digest` (l.289-298) bloquent toujours toute ligne kata calibrée (P-R4 du brouillon, inchangé).
- **Constat neuf : le mot « live » est refusé par la porte de vocabulaire du dépôt de la spécification.**
  - Mesure : `vocabularyHits("live:1")` rend `[{"rule":"a","line":1,"word":"live"}]`, de même `"retired: live:1"` et `"live:12"` ; `"adr:decisions/0007-retire-btc.md"` rend `[]` (confirmé par la sonde 1 de la G2, rejouée au repli).
  - Chaîne : `spec-publish.mjs:114` → `checkPublicText` → `public-text-deny.mjs:162` (`checkReleaseText`, portées `site`, `skills`, `bell`, l.88) → `vocab-banned.json:127`, `\blive\b` de `scan.skills` (ADR-M006 M-9).
  - Or une ligne retirée sur `live:<k>` porte `status_reason` `retired: live:<k>` (`apps/harness/src/policy-guard.ts:88`, `:92`).
  - Donc aucune table portant un retrait `live:<k>`, ni sa liste, ne passe aujourd'hui `spec-publish` (`vocabulary`). Voir Q-Rb-6.

## Construction

1. **Version de table datée** (brouillon 4.3, R-T7). `node scripts/spec-policy-tables.mjs --write --date <YYYY-MM-DD> [--root <dir>]` :
   - il écrit `spec/contract-1.1.0-tables-<date>/policy/<task_class>.json` pour les seules classes dont la table servie diffère du fichier de leur dossier, chacune en fichier entier, canonique (`tableText`, même règle de lignes que la porte) ;
   - `writeDated` (l.178-186) refuse par son nom tout chemin hors `spec/contract-1.1.0-tables-<jour réel>/(policy|retire)/` (l.182 : jamais sous `spec/contract-1.1.0/`, jamais un autre segment), puis tout dossier daté qui existe déjà (l.184) ;
   - refus nommés : date irréelle (`validDate` de `spec-publish.mjs`) ; un dossier daté plus récent existe déjà ; aucune table changée ; le dossier daté de cette date existe déjà ;
   - il imprime les entrées `governance` de la release, au format de `scripts/spec-publish-inputs.json`, puis contrôle l'arbre entier.

   **Un dossier daté n'est jamais réécrit, quelle que soit l'option** (B-1 de la G2, élargi par RECHERCHES) :
   - `--write --date` à la date d'un dossier qui existe : refus nommé, sortie 1 (« … already exists: a dated directory is never rewritten, whatever the option; to redo it before its publication, remove it with git, then write it again ») ;
   - `--write` sans `--date` (`writeFlat`, l.210-218, appelé par `main` l.106) : un fichier attendu d'un dossier daté dont les octets changeraient est refusé par son chemin, **avant toute écriture**, avec le renvoi à `--write --date <YYYY-MM-DD>` ; un fichier d'un dossier daté aux mêmes octets n'est pas écrit non plus.

   **Sans `--date`, `--check` et `--write` gardent le comportement de la base (M-2)**, sur tout arbre que la base sait lire (aucun dossier daté) : `--check` compare et sort 1 sur `differ`, `missing` ou `extra` ; `--write` écrit chaque fichier de `contract-1.1.0/`, un manquant ou un changé compris. Mesure : sonde 5 de la G2, rejouée au repli, sorties de la base et du gel identiques (`--check` : `missing spec/contract-1.1.0/policy/eth-dir-1h.json`, sortie 1 ; `--write` : sortie 0, fichier restauré). L'en-tête du script le dit (l.14-17) ; le test `the_write_without_a_date_keeps_the_base_behaviour_and_never_rewrites_a_dated_directory` l'épingle par assertion, sorties de la base mot pour mot (l.154-158) ; la sonde `probe5b.mjs` compare base et gel octet pour octet sur cinq scénarios (« Repli de la G2 »). `--check --date` est une erreur d'usage (sortie 2).
2. **`SERVED_TABLE_DIRS`** (brouillon 4.3, R-T8) : `servedTableDirs(root, tables, without)` rend la carte fermée et gelée classe → dossier.
   - **Dérivée** : le dernier dossier de version sous `spec/` qui porte `policy/<classe>.json`. L'ordre est `contract-1.1.0`, puis les dossiers datés par date. Sur une racine sans aucune version, `contract-1.1.0` pour toutes les classes : c'est l'écriture initiale, que gardent les tests existants.
   - **Contrôlée** : `expectedFiles` place chaque table dans ce dossier (l.58, l.60), et `differences` compare octet pour octet. Le fichier de `contract-1.1.0/` qu'un dossier daté remplace est **gardé, non comparé, couvert par l'épingle de la release** : `contract_1_1_0_declares_every_published_file_pinned` épingle le sha256 de chaque fichier de `contract-1.1.0/` (m-2 ; sonde 2 (d) : un fichier remplacé corrompu donne `differences` `[]`). Un fichier daté remplacé à son tour reste sans épingle jusqu'à SPEC-DATED-RELEASE-ENTRY-1, qui étend alors le test d'épingles à toutes les releases. Un fichier inconnu d'un dossier daté est compté en trop.
   - **Refus nommés** : une classe dont deux dossiers portent la même table, octet pour octet (« two directories publish the same table », Q-Rb-1) ; une classe qu'aucun dossier ne porte, **dans la voie datée seulement** (`without !== null`, l.145 : « no directory publishes its table »). Sans `--date`, une telle classe est attendue sous `contract-1.1.0/` : `--check` la rapporte `missing`, `--write` la restaure, comme à la base (M-2). R-T8 tient les deux (test l.107-109).
3. **F-1** (relecture de MONARK §5, acceptée). Une table écrite qui porte une ligne `retired` emporte la liste de retrait en vigueur à la date du dossier : `retire/retire-<date>.json` du même dossier, canonique.
   - Liste en vigueur : le dernier `apps/harness/data/kata/retire/retire-<jour>.json` (lieu de Q-R2) dont le jour est au plus la date. Une liste cumule les retraits antérieurs (brouillon 4.1). Une table changée sans ligne retirée n'emporte pas de liste, même quand une liste est en vigueur (m-1, test l.136).
   - Écrivain : sans liste en vigueur, refus nommé (« F-1: … no retire list is in force »). `--check` signale `missing <dossier>/retire/retire-<date>.json` quand un dossier daté porte une ligne retirée sans sa liste.
   - Porte de publication (`retireProblems`, `spec-publish.mjs` l.303-321, appelée l.210) :
     - `retire_list_missing` (M-1 de la G2, l.311-314) : tout fichier de la release sous un segment `policy/` (`(^|/)policy/`, l.312) qui porte une ligne `retired` se trouve dans un dossier daté `contract-<x.y.z>-tables-<date>/policy/`, et la liste `<dossier>/retire/retire-<date>.json` figure parmi les fichiers de la release : la sienne, ou une liste portée depuis la release précédente (`root: "previous"`). Un `policy/` de premier niveau, ou un dossier non daté, est refusé (sonde 2 (a) rejouée : refusé dans les quatre cas) ;
     - `retire_list_invalid` : une liste ailleurs, ou sous un autre nom ;
     - `not_canonical` : une liste non canonique.
   - **Décision limitée au contrat 1.1.0 (m-4)** : le refus d'une ligne retirée hors d'un dossier daté vaut aussi pour une version de contrat non datée (`contract-1.2.0` dans le test). Il ferme, pour le contrat 1.1.0 seulement, la voie d'une version de contrat qui publierait une ligne retirée. Item RETIRE-NEXT-CONTRACT-1 (« Items »).
   - « Jamais réécrite » : la règle `rewritten` existante s'applique à tout chemin sous `contract-*/`.
   - Aucun champ neuf dans la ligne : le contrat reste 1.1.0. Le contenu de la liste reste à R-a ; ni l'écrivain ni la porte ne lisent ses clés.
4. **Latence** (brouillon 4.5, R-T10). `node scripts/retire-latency.mjs <instants.json>`.
   - Entrée fermée `retire-latency-v1` : `cycle` (`rehearsal` ou `real`, Q-R1), les sept instants `T_a` à `T_g` en UTC, `mention`.
   - Sortie : rapport fermé, chaque instant avec sa définition (celles du brouillon 4.5), les pas, `T_g − T_a`.
   - Plafond de 14 jours (Q-R6) : un dépassement sans `mention` est refusé (`ceiling_unmentioned`).
   - Objectif de 3 jours ouvrés (lundi à vendredi UTC, sans calendrier de fériés, Q-Rb-2) : rapporté, jamais bloquant.
   - Refus nommés : `format_invalid`, `instant_missing` (absent, ou instant irréel), `order_not_monotone`.
   - Ni horloge, ni réseau.
   - **D6 (« latency measured ») reste ouvert** tant que les deux mesures, la répétition (RETIRE-LATENCY-REHEARSAL-1) et le premier cycle réel (E-2a), ne sont pas au JOURNAL (Q-R1) : R-b livre l'outil, pas la mesure (m-7).
5. **Ancres** : tout le code neuf est en déclarations de fonction en fin de fichier (précédent de `scripts/red-proof.mjs`) ; aucune constante neuve en fin de fichier, car `main` s'exécute au-dessus. Les modifications au-dessus se font ligne pour ligne (au repli : écrivain l.14-17, l.106, l.109, l.131, l.140, l.145 ; porte l.210). Les 46 tueurs existants qui visent `spec-policy-tables.mjs`, `spec-publish.mjs`, `spec-publish-inputs.json` et `btc-dir-1h.json` gardent leur texte à leur ligne : contrôle `parseKiller` de `red-proof.mjs` (sonde 1 rejouée), **54 ancres tenues, 0 perdue** (46 existantes, 8 neuves).

## Tuyaux (règle de branchement)

- **Entrées** :
  - `SERVED_POLICY_TABLES` (`apps/harness/src/tools/gate.ts:1042`) ;
  - la liste de retrait de R-a, sous `apps/harness/data/kata/retire/` (absente à la base ; les tests en posent une, synthétique). C'est le seul couplage de R-b à R-a : si la G2 de R-a déplace la liste, la constante `RETIRE_DIR` (`scripts/spec-policy-tables.mjs:25`) suit.
- **Sortie** : `spec/contract-1.1.0-tables-<date>/`, lue par `spec-publish` à travers l'entrée de release de `scripts/spec-publish-inputs.json`.
  - L'écrivain imprime les lignes `governance` de cette entrée.
  - Restent à poser au premier cycle réel : les lignes portées (`root: "previous"`, une par sortie de la release précédente) et `previous_commit`, tête publiée du dépôt de la spécification. Aucune release datée n'existe : une épingle aujourd'hui serait une épingle sans octets. Item SPEC-DATED-RELEASE-ENTRY-1.
- **Tests de composition** :
  - R-T9 : fichiers de l'écrivain → lignes imprimées → `plan` de `spec-publish` sur un arbre précédent git ;
  - F-1 : écrivain → liste → `plan` ;
  - M-1 : arbre précédent git qui porte une table retirée et sa liste → release suivante qui les porte (`root: "previous"`) → `plan` : `[]` ; la liste abandonnée → `withdrawn` et `retire_list_missing`.
- **`retire-latency.mjs`** : un outil de mesure. Son rapport va au JOURNAL (condition D6) ; aucun chemin servi, aucune revendication publique.

## Preuve rouge

Commande : `node scripts/red-proof.mjs --base a43b0126 --gel F:/Monark-wt-rb --draw 8 --seed 31 --out F:/tmp/dojo/redproof-rb-fold`. Sortie 0 :
- 8 jugés, 8 F2P (base : `assert-fail`), 0 inchangé ; 8 tueurs tirés sur une population de 8, 8 tués (`assert-fail`), sha256 du fichier identique avant et après chaque tir ;
- `RED-PROOF.json` sha256 `d5ab48ce…19f1` ; condensé du changement `b34f163b…ac32` ;
- TAP : base `8d8f2886…5c36`, gel `4d6b3d1a…17f1` ;
- `node` v24.21.0, à 2026-10-06T22:19:36Z (arbre final du repli ; une première tirée, avant le dernier changement de la l.109, était verte de même : `F:/tmp/dojo/rb-fold-final/redproof-first-run`).

| Test | Base | Gel | Verdict |
|---|---|---|---|
| R-T7 `tables_writer_targets_a_dated_dir` | rouge par assertion (« scripts/spec-policy-tables.mjs exports the dated table version ») | vert | F2P |
| R-T8 `served_table_equals_published_table_by_dir` | idem | vert | F2P |
| R-T9 `dated_release_keeps_publication_rules` | idem | vert | F2P |
| F-1 `a_dated_directory_with_a_retired_row_carries_its_retire_list` | idem | vert | F2P |
| B-1, M-2 `the_write_without_a_date_keeps_the_base_behaviour_and_never_rewrites_a_dated_directory` | idem | vert | F2P |
| B-1 `a_dated_directory_is_never_rewritten_even_on_its_own_date` | idem | vert | F2P |
| M-1 `a_retired_row_is_published_from_a_dated_directory_with_its_list_only` | rouge par assertion (la porte de la base rend `[]`) | vert | F2P |
| R-T10 `retire_latency_report_closed` | rouge par assertion (« scripts/retire-latency.mjs loads ») | vert | F2P |

R-T9 n'est plus « vert à la base » comme dans le brouillon : il passe la sortie de l'écrivain daté par les règles de publication, et l'écrivain daté manque à la base.

## Tueurs

Chacun est tiré seul : par `red-proof` (8 sur 8 « killed », statut `assert-fail`, fichier restauré, sha256 contrôlé) et à la main (`ERR_ASSERTION`).
- `` scripts/spec-policy-tables.mjs:155 CONST "`${VERSION_DIR}-tables-${date}`" -> "VERSION_DIR" `` (R-T7 : `datedDir` vaut `contract-1.1.0`) ;
- `scripts/spec-policy-tables.mjs:60 CONST "dirs[t.task_class]" -> "VERSION_DIR"` (R-T8 : la carte ignorée, la table changée attendue sous `contract-1.1.0/`) ;
- `scripts/spec-publish.mjs:201 CONST " && o.split(\"/\")[0] !== release" -> ""` (R-T9 : le propre dossier de la release lu comme étranger) ;
- `scripts/spec-policy-tables.mjs:172 CONST "t.table.rows.some((r) => r?.status === \"retired\")" -> "false"` (F-1 : la ligne retirée n'exige plus sa liste) ;
- `scripts/spec-policy-tables.mjs:216 CONST "changed.length > 0" -> "false"` (B-1 : `--write` sans date ne refuse plus un dossier daté) ;
- `scripts/spec-policy-tables.mjs:184 CONST "there.length > 0" -> "false"` (B-1 : un dossier daté réécrit à sa propre date) ;
- `scripts/spec-publish.mjs:312 CONST "/(^|\\/)policy\\//i.test(f.path)" -> "dated.test(f.path)"` (M-1 : seuls les dossiers datés examinés, le `policy/` de premier niveau passe) ;
- `scripts/retire-latency.mjs:50 CONST "at[i].t < at[i - 1].t" -> "false"` (R-T10 : l'ordre n'est plus contrôlé).

Tueurs existants, re-tirés au repli sur l'arbre final, un à la fois contre leur seul fichier (`F:/tmp/dojo/rb-fold-final/existing1.txt`, `existing2.txt`, de 22:27:51Z à 22:44:38Z) : `test/spec-1-1-0-release.test.ts` 23 sur 24 tués (le 24e, `:90`, modes POSIX, vise un test sauté sous win32 par construction, comme à la G2) ; `test/spec-publish.test.ts` 22 sur 22, tous par `ERR_ASSERTION`. Aucune restauration en échec ; ancres tenues (sonde 1).

Mutants à la main, au repli, sur l'arbre final : un à la fois contre les trois fichiers `test/spec-*.test.ts`, restauration contrôlée par sha256 (outil de la G2 recopié, `F:/tmp/dojo/rb-fold-final/mutants.mjs`, lots `batchA.json` et `batchB.json`, sorties `mutants-A.txt` et `mutants-B.txt`) : 19 appliqués, 19 tués par assertion (`ERR_ASSERTION`), 0 survivant, 0 restauration en échec.
- M1 de la G2 (`:181`, `(?:policy|retire)` → `[^/]+`) : tué par R-T7 ; M17 (`:172`, une liste attachée sans ligne retirée) : tué par F-1 ;
- B-1 : le refus ôté (`:216`), le filtre ôté (`:217`, un fichier daté aux mêmes octets réécrit), `main` revenu à `writeAll` (`:106`), le refus du même jour ôté (`:184`) : tous tués ;
- M-2 : `:145` revenu à `(dirs.length > 0 || without !== null)` : tué par R-T8 et par le test B-1/M-2 ; M13 (`:145`, `has.length === 0 &&` → `false &&`) : tué par R-T8 ;
- M-1 : le contrôle ôté (`spec-publish.mjs:313` → `false`) : tué par F-1 et par le test M-1 ; la portée ramenée aux dossiers datés (`:312`) : tué par les mêmes ;
- réadressés : M2 (`:148`), M3 (`:161`), M4 (`spec-publish.mjs:317`), M8 (`:204`), M9 (`:146`), M10 (`:169`), M14 (`:205`), M15 (`spec-publish.mjs:318`), et le contrôle de chemin de `writeDated` (`:182`) : tous tués.

`scripts/retire-latency.mjs` n'a pas changé au repli (sha256 `caee0698…`) : les mutants M5, M6, M11, M12 et M16b de la G2 y tiennent.

## Tests gardés verts

- `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit` sur `test/spec-1-1-0-release.test.ts` (24), `test/spec-publish.test.ts` (21), `test/spec-retire-path.test.ts` (8), `test/surfaces-1-1-0.test.ts` (15) : 68 tests, 67 verts, 1 sauté (`a_failed_write_gives_back_the_mode_of_the_files_it_replaced`, win32), 0 rouge, sortie 0 ;
- dont `no_table_with_a_recompute_row_is_published_before_the_verifier_list` et `no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer`.
- `test/spec-1-1-0-release.test.ts` et `test/spec-publish.test.ts` ne sont pas modifiés.

## R-25

`git diff --shortstat a43b0126 -- . ':(exclude,glob)docs/**/*.md'` : 3 fichiers, 148 insertions, 26 suppressions.

Fichiers neufs comptés (`git diff --no-index --shortstat /dev/null <fichier>`) : `scripts/retire-latency.mjs` 76, `scripts/retire-latency.d.mts` 14, `test/spec-retire-path.test.ts` 220. Ce G0 (exclu par `docs/**/*.md`) n'est pas compté.

Total **484** lignes, sous la borne de 1 205 (1 150 dans la consigne). La cible de ~220 (brouillon §6, ±30 %) est dépassée. Causes :
- les modifications ligne pour ligne qui gardent les ancres comptent double ;
- F-1 est tenu des deux côtés (écrivain et porte) ;
- `--check` connaît les dossiers datés (`published`) ;
- les entrées de release sont imprimées ;
- R-T9, F-1 et M-1 rejouent des compositions ;
- le repli de la G2 (+78 lignes) : `writeFlat`, le refus du même jour, la porte M-1, trois tests neufs.

## Questions (défaut entre parenthèses)

- **Q-Rb-1. « Deux dossiers pour une classe ».** (Deux dossiers qui portent la même table, octet pour octet. Une classe recalibrée deux fois a légitimement un fichier par dossier : la lecture littérale refuserait tout second retrait. La lecture retenue fait respecter « les seules classes changées » (brouillon 4.3), que `rewritten` ne voit pas sous un chemin neuf.)
- **Q-Rb-2. Jours ouvrés.** (Lundi à vendredi UTC, sans calendrier de fériés : aucun calendrier n'est sourcé. Le 1er janvier compte.)
- **Q-Rb-3. Nom de la liste publiée.** (`retire-<date du dossier>.json`, même quand la liste source est datée plus tôt : F-1 nomme un seul `<date>`.)
- **Q-Rb-4. Relance le même jour.** Tranchée au repli par RECHERCHES : **refusée par son nom**, un dossier daté n'est jamais réécrit, quelle que soit l'option. Cette règle remplace le défaut du brouillon 4.3 (« un second retrait le même jour va dans le même dossier avant publication »). Pour refaire un dossier daté avant sa publication, on le retire à la main avec git, puis on l'écrit de nouveau. Le constat m-3 de la G2 (une relance laissait le fichier d'une classe qui ne change plus) tombe avec elle.
- **Q-Rb-5. Un dossier daté plus récent déjà présent.** (Refus nommé : la carte prend le dernier dossier.)
- **Q-Rb-6. « live » au vocabulaire public** (constat ci-dessus). Pistes :
  - (a) une exception fermée au jeton de cause `live:[1-9][0-9]*` dans `vocabularyHits`, masqué comme le segment de place de marché d'une clé de cellule (`KEY_TOKEN` et `VENUE`, `spec-publish.mjs:95`, `:113`) : le plus étroit ;
  - (b) une autre grammaire de cause : elle touche la garde (`policy-guard.ts:92`) et l'addendum 9, publié en ligne P0, donc un addendum daté.

  (Défaut : (a), décidé par MONARK, relu par RECHERCHES, avant le premier dossier daté qui porte un retrait `live:` ; le premier est possible après 2027-01-01, addendum 9 point 6. Item RETIRE-CAUSE-VOCAB-1, gardé tel quel, m-8.)
- **Q-Rb-7. `published_tables_are_the_served_tables_byte_for_byte`.** Ce test lit `contract-1.1.0/` seul ; il rougira par construction au premier dossier daté. (Il passera alors par `servedTableDirs`, dans le lot de ce premier dossier, E-2a. Item SPEC-TABLES-TEST-PER-DIR-1.)
- **Q-Rb-8. Répétition chronométrée** (Q-R1). Elle n'est pas faite ici : il lui faut la liste et la garde de R-a. (Acte de l'orchestrateur après la fusion de R-a et R-b, rapport au JOURNAL ; item RETIRE-LATENCY-REHEARSAL-1. Elle inclura une cause `live:<k>` dès que RETIRE-CAUSE-VOCAB-1 sera tranché, m-7 : une répétition sur une cause `adr:` n'exerce pas `live:<k>`.)
- **Q-Rb-9. `--write` sans `--date` après T0, sous `contract-1.1.0/`.** Tranchée au repli : **pas de refus sous `contract-1.1.0/`** ; le refus vaut pour les dossiers datés (B-1).
  - La G2 (B-1) proposait d'étendre là le refus de R-T7. Cette lecture contredit le dessin du G0 tel que MONARK le fixe (M-2 : sans `--date`, le comportement de la base, « exactly as at a43b0126 ») et la précision 2 de RECHERCHES : à la base, `--write` réécrit un fichier de `contract-1.1.0/` aux octets changés, et c'est ce qu'exercent `a_failed_write_gives_back_the_mode_of_the_files_it_replaced` (tueur `:90`) et `writer_check_reports_any_drift_in_a_copy_and_exits_by_it`, dans `test/spec-1-1-0-release.test.ts`, hors zone et non modifié. Lecture retenue, la plus sûre sans enfreindre une décision liante : le comportement de la base sous `contract-1.1.0/`. MONARK l'accepte ou la renverse.
  - Filets : (1) en CI, `contract_1_1_0_declares_every_published_file_pinned` compare chaque fichier de `contract-1.1.0/` à son sha256 épinglé, et une réécriture locale le rougit (mesure ci-dessous) ; (2) à la publication, `rewritten` refuse une release qui déclare depuis `governance` un fichier de `contract-1.1.0/` aux octets autres que ceux de `previous_commit` (test `a_file_under_a_version_directory_is_never_rewritten`, tueur `:207`). Une release qui porte ces fichiers (`root: "previous"`) les lit dans l'objet git de `previous_commit` (`spec-publish.mjs:179`), jamais dans l'arbre de travail : une réécriture locale n'est jamais publiée, mais elle ferait diverger la table servie de la table publiée (CONTRACT l.488). Le filet effectif est donc l'épingle CI.
  - Mesure du filet (1) : la réécriture locale `spec/contract-1.1.0/policy/btc-dir-1h.json:1` `"rows":[]` → `"rows":[ ]`, tirée seule contre `test/spec-1-1-0-release.test.ts` (outil de mutants, fichier restauré, sha256 contrôlé), rougit par assertion `contract_1_1_0_declares_every_published_file_pinned` et cinq autres tests (`F:/tmp/dojo/rb-fold-final/mutants-D.txt`).
  - Garantie manquante, item formé (PAROXYSME) : SPEC-WRITER-PIN-GUARD-1.

## Items (règle zéro dette)

| Item | Objet | Porteur | Déclencheur |
|---|---|---|---|
| SPEC-DATED-RELEASE-ENTRY-1 | l'entrée de release datée (lignes portées, `previous_commit`) ; puis (m-2) étendre le test d'épingles de `contract-1.1.0` à toutes les releases | MONARK | le premier `--write --date` réel (E-2a) |
| SPEC-TABLES-TEST-PER-DIR-1 | `published_tables_are_the_served_tables_byte_for_byte` lu par `servedTableDirs` (Q-Rb-7) | MONARK | le lot du premier dossier daté (E-2a) |
| RETIRE-LATENCY-REHEARSAL-1 | la répétition chronométrée (Q-Rb-8), avec une cause `live:<k>` dès RETIRE-CAUSE-VOCAB-1 tranché (m-7) | orchestrateur MONARK | la fusion de R-a et de R-b |
| RETIRE-CAUSE-VOCAB-1 | « live » au vocabulaire public (Q-Rb-6), inchangé (m-8) | MONARK décide, RECHERCHES relit | avant le premier dossier daté qui porte `live:`, au plus tôt après 2027-01-01 |
| RETIRE-RUNBOOK-1 | la ligne `docs/RUNBOOK-*` du brouillon §3 (m-6) : la procédure d'un retrait au RUNBOOK (liste, `--write --date`, entrée de release, publication, fusion, déploiement, sonde, rapport de latence ; un dossier daté à refaire avant publication se retire avec git) | MONARK | la fusion de R-b |
| RETIRE-NEXT-CONTRACT-1 | (m-4) une version de contrat non datée peut-elle publier une ligne retirée avec sa liste ? décision, puis `retireProblems` adapté | MONARK décide, RECHERCHES relit | le G0 de la prochaine version de contrat après 1.1.0 |
| SPEC-WRITER-PIN-GUARD-1 | (Q-Rb-9) `writeFlat` n'écrit sous `contract-1.1.0/` que les octets que la release `contract-1.1.0` épingle (`scripts/spec-publish-inputs.json`) : la restauration reste (M-2, sonde 5), une réécriture à d'autres octets est refusée par son nom, avec le renvoi à `--write --date`. Prix : environ 6 lignes dans `writeFlat`, une assertion et un tueur. Il change M-2 pour ce seul cas, que CONTRACT l.449 interdit : décision de MONARK | MONARK | avant le premier changement d'une table servie après T0, au plus tard au G0 court de E-2a |
| TEST-GIT-ENV-ISOLATION-1, inventaire (m-10) | entrée : `test/spec-retire-path.test.ts`, `previousTree` (l.60-72), corrigée dans ce lot en deux lignes (l.62, l.65 : l'enfant git ne reçoit ni `GIT_DIR`, ni `GIT_WORK_TREE`, ni `GIT_INDEX_FILE`) ; restent à l'inventaire, non modifiées ici : `test/spec-1-1-0-release.test.ts:214`, `test/spec-publish.test.ts:31` | le lot dédié de l'item (`docs/adr/ADR-BELL-OTS-PRB.md:263`) | le sien, inchangé |

## Repli de la G2 (verdict REFUSE, `F:/tmp/dojo/verify-rb.json`)

- **B-1** : `writeFlat` (écrivain l.210-218, `main` l.106) ; le refus du même jour (l.184, précision 1 de RECHERCHES) ; Q-Rb-9 tranchée (ci-dessus) ; tests l.151-169 et l.171-181 ; sonde 3 rejouée : refus nommé, sortie 1, fichier daté inchangé (`f3e81aee…` avant et après) ; sonde 6 rejouée par le chemin de `main` (`writeFlat`, variante `probe6b.mjs`) : refus, fichier daté inchangé, puis une version datée plus tardive écrit la table servie. `writeAll` reste la primitive non gardée que `writeDated` et `writeFlat` appellent : les sondes 2 (c) et 6, qui l'appellent directement, montrent encore la réécriture ; ce n'est plus le chemin d'aucune option.
- **M-1** : `retireProblems` (porte l.309-321) ; test l.183-199 et cas ajouté au test F-1 (l.146) ; sonde 2 (a) rejouée : `retire_list_missing` dans les quatre cas ; sonde 4, dans sa variante `probe4b.mjs`, qui continue après le refus du même jour où la sonde d'origine s'arrête (sortie 1) : la table retirée d'un dossier daté plus ancien, non portée, donne `["policy_table_invalid","retire_list_missing"]`.
- **M-2** : l.145 (`without !== null`) ; en-tête l.14-17 ; la ligne de bilan de `main` (l.109) reprend le texte de la base quand tous les fichiers sont sous `contract-1.1.0/` ; tests l.107-109 et l.154-158 (sorties de la base, mot pour mot) ; sonde 5 rejouée : base et gel identiques ; sonde `probe5b.mjs` : cinq scénarios sans date (arbre propre, fichier manquant, fichier changé, schéma changé et fichier en trop, pas de `spec/`) et quatre erreurs d'usage, statut, stdout, stderr et condensé final de l'arbre identiques octet pour octet entre la base et le gel.
- **m-1** : refus de `.../other/x.json` (test l.86) ; aucune liste sans ligne retirée (test l.136). M1 et M17 de la G2 meurent par assertion.
- **m-2**, **m-4**, **m-5**, **m-6**, **m-7** : écrits ci-dessus. **m-3** : tombe avec Q-Rb-4. **m-8**, **m-9** : inchangés (décision de MONARK). **m-10** : inventaire et correction en deux lignes, dans le test neuf seul.
