# G0 du lot H d'E-2a : l'écrivain de l'historique servi `kata-served-history-v1`, une ligne par (déploiement, classe)

RECHERCHES, 2026-10-07. Base : tronc `591b3a30` (lot/etude-suite), **fusionné** dans la branche (`git merge -m "Merge the trunk"`,
commit `e961f615`, parents `e87ce77a` et `591b3a30`) : la branche était déjà poussée et en revue, donc une fusion et non un rebase, et
aucune poussée forcée. Plan : G0 court d'E-2a v6.1 (§3.6 ligne « historique servi », §3.7, §5 ligne H, §6 T-15), accepté par MONARK
(`51fe3ee` de recherches) ; CM-5 v4 §4.1, Q-CM5-8, Q-CM5-19 ; décisions de MONARK `bb993d5` (voie (b), une classe et sa table par
ligne) et `ac1cb86` (toute classe kata servie après le déploiement). **Pli de la G2 de MONARK** : `1aebcdb` de recherches, message
`2026-10-07-MONARK-vers-RECHERCHES-g2-232-235.md`, section #235 (cinq M, m 6 à 10), pièce `pieces/2026-10-07-g2-232-235/g2-235.json`.

- **Provenance** : worker `claude-opus-5-5`, effort max ; horloge lue (`date -u`) à 09:41 UTC (premier G0), 10:00 (pli d'`ac1cb86`),
  11:18 (début du pli de la G2), 11:40 (ce texte). Worktree du scratchpad, branche `recherches/e2a-h-served-history` ; fetch par
  refspecs explicites ; `node_modules` lié en dur depuis un autre worktree du scratchpad, retiré à la fin ; `git add` par chemins
  explicites ; poussé sans force.
- **Ordre** : §5 ligne H, « a1, L-T15 ; avant le go de c ». H ne touche aucun fichier de L-T15 (PR #232). **H dépend d'a1** (m 8) : il lit
  `COMMITTED_TABLES` du module servi `apps/harness/src/policy-committed-pins.ts`, qu'ajoute a1-i (PR #233) ; brouillon jusqu'à la fusion
  d'a1 et d'a2 (décision de MONARK), puis une nouvelle fusion du tronc.

## Définitions reprises (citées)

- E-2a v6.1 §3.6 : « une ligne JSON canonique par couple (déploiement, classe kata servie), qui porte une classe et sa table » ; champs
  fermés `format`, `release_dir`, `task_class`, `policy_table_sha256`, `probe_record_sha256`, `merge_commit`, `t_e`, `t_f`,
  `ca_record_sha256` ; « lignes triées par (`t_e`, `task_class`) » ; « L n'écrit aucune ligne (voie (b)) » ; chemin
  `apps/harness/data/kata/served/served-history.json`, versé avec la fusion des actes.
- E-2a v6.1 §6 T-15 : « chaque `policy_table_sha256` est lu sur l'enregistrement `retire-probe-v1` de sa classe, lié par
  `probe_record_sha256` ; un enregistrement d'une autre classe, ou une liste de classes dans une ligne, est refusé ; une table
  marginale n'a pas de ligne (voie (b)) ».
- `ac1cb86` : « chaque déploiement écrit une ligne pour **toute** classe kata servie après lui (24 lignes pour c, 28 pour c′) ».
- Tronc `591b3a30` : `docs/RUNBOOK-harness.md` l.375-376, « **T_e** = the committer date of the merge commit (`git log -1
  --format=%cI`), in UTC » ; l.388-389, « **T_f** = the `checked_at` of that green record […], cut to the second » ;
  `scripts/retire-latency.mjs` l.20-22 et l.50, T_e ≤ T_f ≤ T_g (`order_not_monotone`). Le §6 du RUNBOOK n'écrit **aucune** fenêtre de
  T_f après T_e : H n'invente pas de borne de temps (m 6).
- Q-CM5-19 : le rôle `served-history` est celui de l'outil figé qui **lit** ce fichier (CM5-c2), hors de ce lot.

## Construction

`scripts/served-history.mjs` (130 lignes, + `.d.mts`), `node scripts/served-history.mjs --release-dir <contract-1.1.0-tables-AAAA-MM-JJ>
--merge-commit <sha> --ca <enregistrement de CA> --probe <retire-probe-v1> [--probe …] [--root <dir>]`, lancé par MONARK à T_f (c-ii,
c′-ii). Les règles sont **importées du tronc**, jamais réécrites :

- **Ensemble servi** (l.63-67) : `versionDirs` (exporté de `scripts/spec-policy-tables.mjs` l.134, le seul changement de ce fichier) donne
  les dossiers de version, un dossier daté ne nommant qu'un jour réel (`validDate`) ; `release_dir` doit être **le dernier** dossier
  daté de l'arbre, et un dossier (l.64) ; chaque table kata (`cell_key_rule` `kata-bucket`) d'un dossier daté est servie depuis le
  dossier que `servedTableDirs` donne à sa classe (le dernier qui la tient ; deux dossiers aux octets identiques : refus,
  `input_invalid`). Cet ensemble doit être **les classes épinglées de `COMMITTED_TABLES`** (l.81, `served_not_pinned`).
- **Sonde** (l.68-75) : chaque classe servie a **exactement un** enregistrement `retire-probe-v1` (`class_not_once`), pris par la règle de
  cycle réel de `retire-instants` : `instant("T_g", …, "real")` (l.70 ; format, `ok`, `problem` nul, statut 200, `equal`, `api` en https
  hors loopback par adresse, `tls_authorized`, `api_host`) ; `table` est une chaîne et le fichier servi de sa classe (chemins `\` et `./`
  admis), d'une table de cette classe, dont le sha256 est son `policy_table_sha256` ; reçu **au plus tôt à t_f** (l.75,
  `probe_before_ca`). `probe_record_sha256` = sha256 des octets de l'enregistrement.
- **CA** (l.65) : `instant("T_f", …, "real")` : notée verte par `recordKind(failedOf(…))` avec ses `CHECK_NAMES` ; `t_f` = son
  `checked_at` coupé à la seconde ; `ca_record_sha256` = sha256 de ses octets.
- **`mergeInstant`** (l.96-106) : `instant("T_e", …)` du tronc (40 hex contrôlés avant git, exactement deux parents, date du committer
  à la seconde), lu par un git sans variable `GIT_*` héritée, `--end-of-options`, `%H` égal à l'id donné (un tag annoté est refusé) ;
  `spec/<release_dir>` présent dans la fusion et absent de son premier parent (`git cat-file -e`, `merge_not_release`).
- **`checkLine`** (l.52-59) : champs fermés ; chaque champ une **chaîne** de son motif (`typeof` avant le motif) ; `release_dir` d'un
  jour réel ; `t_e` et `t_f` des secondes UTC réelles (aller-retour de `retire-latency` l.46-47, sans millisecondes) ; `t_e ≤ t_f`.
- **`render`** (l.86-93) : tableau JSON, un élément canonique par ligne, trié par (`t_e`, `task_class`) ; les lignes déjà là doivent être
  son écriture canonique, et les lignes d'un même `release_dir` partager `merge_commit`, `t_e`, `t_f`, `ca_record_sha256`
  (`history_invalid`) ; un couple (`release_dir`, `task_class`) écrit deux fois, déjà là ou deux fois dans le lot, est refusé
  (`pair_written`).
- **`main`** (l.108-128) : les épingles sont lues dans `PINS` (le module servi ; un test passe un autre module par `io.pins`) ;
  écriture par `writeAtomic` de `scripts/verify-harness.mjs`.
- **Forme du fichier** : le tableau JSON à un élément par ligne est **accepté par MONARK** (m 7) ; la lecture est celle du fichier
  entier (`json.load`). Le pli dans E-2a §3.6 et CM-5 §4.1 est fait ailleurs ; la fixture de L-T13 est dans CM5-c2, pas dans ce lot.

## Pli de la G2 de MONARK (constat → changement → fichier:ligne, à la tête du pli)

| Point | Changement | Où |
|---|---|---|
| M 1, sonde | règle de cycle réel de `retire-instants` importée (`instant("T_g", …, "real")`) ; cas : sonde locale (http 127.0.0.1, TLS nul), TLS false, `localhost`, statut 500, `api_host` vide, autre format | `served-history.mjs:70` ; test 3 |
| M 1, CA | `instant("T_f", …, "real")` ; cas : CA à un seul contrôle, `checks` vide, un contrôle rouge, TLS false sur chaque hôte, CA locale | `:65` ; test 3 |
| M 1, ensemble servi | `versionDirs` exporté et `servedTableDirs` ; cas : dossier `2026-02-30` (`release_dir` refusé, sa table non servie), octets identiques, dossier postérieur | `:63-64`, `:66-67`, `spec-policy-tables.mjs:134` ; test 2 |
| M 2, types | `typeof === "string"` avant chaque motif ; un cas `[valeur]` par champ (boucle sur `FIELDS`), et `table` de la sonde | `:46`, `:55-57`, `:71` ; tests 3, 4 |
| M 3, `GIT_*` | filtrées dans `mergeInstant` et dans le test ; cas : un `GIT_DIR` hérité ne change rien | `:97` ; test 5 |
| M 4, gardes | dates d'auteur et de committer distinctes, assertion sur le committer ; octets réels (sonde par `judge()` plus « \n », CA `docs/deploy-CA-harness.json`) ; un cas par garde | tests 1 à 5 |
| M 5, `merge_commit` | 40 hex avant git, `--end-of-options`, `%H` = id, deux parents, `spec/<release_dir>` dans la fusion et pas dans son premier parent ; cas : tag annoté, fusion à trois parents, `--no-such-option`, fusion antérieure, fusion suivante | `:96-106` ; test 5 |
| m 6 | `t_e ≤ t_f ≤ received_at` ; une sonde reçue avant la CA est refusée ; aucune borne de temps (le RUNBOOK n'en écrit pas) | `:57`, `:75` ; test 3 |
| m 7 | quatre champs communs contrôlés par `release_dir` ; `t_e` à la seconde ; `t_f` coupé à la seconde ; jours réels ; lot dédoublonné | `:48`, `:89-91` ; tests 1, 4 |
| m 8 | sondes données sans table kata servie : `probe_other_table` qui les nomme ; le cas `probe(LIQ)` remplacé par le vrai cas de L ; recoupement avec `COMMITTED_TABLES` | `:71`, `:81-82`, `:117` ; tests 3, 5 |
| m 9 | `writeAtomic` importé ; `release_dir` doit être un dossier ; le test 5 écrit un second déploiement sur le fichier | `:64`, `:121` ; tests 2, 5 |
| m 10 | test de composition (test 1, et le test 5 par la CLI) ; CI relancée sur la nouvelle tête ; `killer-lines` retiré des voisins | tests 1, 5 ; Preuves |

## Tests (T-15, `test/served-history.test.ts`) et tueurs

Les enregistrements sont ceux des producteurs : sonde par `judge()` de `scripts/retire-probe.mjs` plus « \n » ; CA
`docs/deploy-CA-harness.json`, telle que commitée (test 1) ou un champ changé, écrite comme `verify-harness` l'écrit ; les instants
sont comptés depuis son `checked_at`.

- `served_history_line_is_closed_and_read_from_a_verdict` (**le test de composition** : sonde et CA réelles, deux lignes, `t_f` coupé à
  la seconde, sha256 des octets lus) — tueur : scripts/served-history.mjs:76 CONST "probe_record_sha256: sha(bytes)" ->
  "probe_record_sha256: sha(JSON.stringify(probe))"
- `served_history_writes_every_class_served_after_the_deployment` (`ac1cb86` ; dossier `2026-02-30`, dossier non daté, refus de
  `release_dir` absent, non dernier, sans jour réel, fichier, octets identiques) — tueur : scripts/served-history.mjs:66 CONST
  "dated.flatMap(" -> "[releaseDir].flatMap("
- `served_history_refuses_each_departure` (règles de la sonde et de la CA, ordre des instants, épingles, voie (b)) — tueur :
  scripts/served-history.mjs:70 CONST "}, \"real\"));" -> "}, \"rehearsal\"));"
- `served_history_file_is_one_line_per_class_sorted_and_closed` (couples, champs communs, `[valeur]` par champ, formes) — tueur :
  scripts/served-history.mjs:89 CONST "o.release_dir === l.release_dir && " -> ""
- `served_history_cli_reads_t_e_from_the_merge_commit` (dépôt jetable sans `GIT_*`, date du committer, liaison de la fusion, épingles
  par défaut, usage, second déploiement) — tueur : scripts/served-history.mjs:99 CONST "--format=%H %cI %P" -> "--format=%H %aI %P"
- Rouges d'abord : les cinq tests, à la tête d'avant le pli (après la fusion du tronc), sont rouges par assertion (`t_f` à la
  milliseconde, dossier `2026-02-30` servi, statut 500 admis, paire en double dans le lot, `--no-such-option` passé à git).

## Mutants

- **Les 13 mutants survivants de la G2**, rejoués là où leur garde vit désormais (H, ou la règle du tronc qu'il importe), fichier
  restauré et sha256 contrôlé : **13 tués sur 13** (M 2 rejoué deux fois). M1 `%cI` → `%aI` ; M2 la CA prise comme en répétition
  (`:65`), et la liste `["green"]` du cycle réel (`retire-instants.mjs:75`) ; M3 les `CHECK_NAMES` non exigés (`retire-instants.mjs:75`) ;
  M4 le format de sonde (`retire-instants.mjs:81`) ; M5 `replaceAll` ; M6 `./` ; M7 `>=` → `>` (`:75`) ; M8 `<=` → `<` (`:57`) ; M9 et
  M10 le sha256 d'une re-sérialisation ; M11 l'usage sans sonde ; M12 `!== 2` → `< 2` (`retire-instants.mjs:68`) ; M13 `{64}` →
  `{63,64}`.
- **Balayage des gardes neuves** (45 mutants, un à un) : 40 tués, 5 survivants, **équivalents** :
  - `:55` `str(l.release_dir, DIR)` → `DIR.test(…)` : `validDate` ne lit qu'une chaîne, `[valeur]` reste refusé ;
  - `:66` `f.endsWith(".json")` retiré : un dossier daté ne tient que ses tables `.json` sur un arbre déployable (`spec-policy-tables
    --check` signale tout autre fichier, `extra`, l.205 ; RUNBOOK l.377) ;
  - `:71` `!Object.hasOwn(served, cls)` retiré : sauf pour une sonde dont `table` serait littéralement `spec/undefined/policy/…` ; garde
    lisible ;
  - `:99` `--end-of-options` retiré : les 40 hex sont contrôlés avant git, aucun id ne peut y être une option ; gardé, demandé ;
  - `:100` `r.status !== 0` retiré : un git en échec n'imprime aucun id, et `own !== id` refuse aussi.
- **Correction** : la garde `full !== commit` retirée au pli d'`ac1cb86` **n'était pas équivalente** à `checkLine` : l'id d'un tag annoté
  (40 hex) était pelé par `^{commit}` et accepté. Elle revient sous la forme « `%H` égal à l'id donné » (`:100`), tenue par le cas du
  tag annoté. Les mutants triviaux de l'écriture (M14, M15) : l'écriture est `writeAtomic` du tronc.

## Décisions et réserves

- **Base de l'import des épingles (m 8)** : le module n'est pas au tronc. Empiler sur #236 n'est pas possible proprement : #233, #236 et
  #237 partent de `9090da6d` sans `591b3a30`, dont H importe les règles (M 1) ; avec #236 pour base, le diff de la PR porterait #223,
  #226 et #227. H lit donc le module **par son chemin dans a1** (`PINS`, `COMMITTED_TABLES`), à l'exécution de `main` ; un lancement
  avant a1 est refusé (module absent) ; `compose` prend les classes épinglées en paramètre, et le test 5 donne un module jetable. À la
  fusion d'a1, le défaut lit les épingles réelles (vides jusqu'à c) ; la constante `PINS` est tenue par le test 5.
- **Dossier daté postérieur** : `servedTableDirs` lit tout l'arbre ; `release_dir` doit donc être le dernier dossier daté (comme
  `datedFiles`, `spec-policy-tables.mjs` l.168-169 : « a dated version follows every published one »). Un dossier postérieur est
  **refusé**, non plus ignoré : l'arbre n'est pas celui du déploiement.
- **CA réelle et #225** : le test de composition lit `docs/deploy-CA-harness.json` (15 contrôles, vert pour les 15 `CHECK_NAMES` du
  tronc). #225 porte `CHECK_NAMES` à 18 : à sa fusion, cet enregistrement n'est plus vert pour la règle du tronc, jusqu'à la CA du
  déploiement suivant ; une fusion du tronc dans H entre les deux rend le test 1 rouge sur sa prémisse. Les instants sont comptés depuis
  le `checked_at` du fichier, si bien qu'une CA nouvelle ne demande aucun autre changement.
- Hors de ce pli : la remarque de la G2 sur un BOM (`input_invalid` et non `history_invalid`) ; la lecture des tables dans l'arbre de la
  fusion (proposée par la G2, non retenue par MONARK au point 5).

## Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 591b3a30b24d14e4286c2dbb731ec2a24f07eb9d --gel 5b09ca1a --repo <worktree> --out <dossier>
  --draw 5 --seed 235` (Node v24.21.0, Linux, 11:39Z) : sortie 0, « 5 judged, 0 unchanged, 5 killer(s) drawn » ; les cinq tests
  `new-module`, les cinq tueurs tués (`assert-fail`), fichier restauré (sha256 `92d17904…` avant et après) ; digest du gel `3bcc607b…`,
  `RED-PROOF.json` sha256 `84e0952f…`. Le commit de ce texte ne touche que `docs/**/*.md`, hors du digest.
- **Rouges d'abord** : la copie du test sans l'import de `PINS`, à la tête `e961f615` (fusion du tronc, code d'avant le pli) : 0 sur 5,
  chaque test rouge par assertion ; avec l'import, le fichier ne se charge pas (`PINS` absent).
- **Voisins** : `ci-gates`, `r25-integration`, `spec-1-1-0-release`, `spec-publish`, `spec-retire-path`, `export-public` (hors test 42),
  `retire-instants`, `retire-probe` et ce fichier : **211 sur 211**. `killer-lines` n'est plus dans la liste : ce fichier n'existe pas à la
  tête (G2, m 10).
- **Portes** : `tsc --noEmit` 0 ; `eslint .` 0 ; `lang:gate` 0 ; `gate:vocab` 0 (348 fichiers) ; `lint:ratchet` 69/69 ; `export:check` 0 ;
  winlint (atelier de RECHERCHES) `--base origin/lot/etude-suite` et `--files` : aucun risque Windows.
- **R-25** (forme de la CI, `docs/**/*.md` exclus) : 5 fichiers, +335 −1, soit 336 (borne 547).
- **CI** : relancée par la poussée de cette tête, qui contient `591b3a30` : la fusion de test de GitHub voit #223, #226 et #227 (G2, m 10).
