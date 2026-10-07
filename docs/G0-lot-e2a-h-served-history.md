# G0 du lot H d'E-2a : l'écrivain de l'historique servi `kata-served-history-v1`, une ligne par (déploiement, classe)

RECHERCHES, 2026-10-07. Base `1cddd2e5` (lot/etude-suite). Plan : G0 court d'E-2a v6.1 (§3.6 ligne « historique servi », §3.7, §5
ligne H, §6 T-15), accepté par MONARK (`51fe3ee` de recherches) ; CM-5 v4 §4.1 (« accordé à E-2a v6 »), Q-CM5-8, Q-CM5-19 ;
décisions de MONARK `bb993d5` (E-2a, items 2 et 4 : voie (b), une classe et sa table par ligne).

- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:41 UTC pour ce G0. Worktree neuf détaché du scratchpad,
  branche `recherches/e2a-h-served-history` ; `git add` par chemins explicites ; poussé sans force.
- **Ordre** : §5 ligne H, « a1, L-T15 ; **avant le go de c** (v6 : plus avant le go de L) ». H ne touche aucun fichier de L-T15
  (PR #232) : branche séparée sur la base. Le code de H ne lit rien d'a1 ni de #226 (il lit l'enregistrement `retire-probe-v1` comme
  un fichier JSON, champs de `scripts/retire-probe.mjs` à `f7ec02ef`) ; PR en brouillon jusqu'à la fusion de L-T15 et d'a1.

## Définitions reprises (citées)

- E-2a v6.1 §3.6 : « une ligne JSON canonique par couple (déploiement, classe kata servie), qui porte une classe et sa table » ;
  « champs proposés (fermés) : `format`, **`release_dir`** (le dossier daté […]), **`task_class`**, `policy_table_sha256`,
  **`probe_record_sha256`** (l'enregistrement `retire-probe-v1` de cette classe, d'où l'empreinte est lue), `merge_commit`, `t_e`,
  `t_f`, `ca_record_sha256` ; lignes triées par (`t_e`, `task_class`) » ; « **L n'écrit aucune ligne** (voie (b)) » ; chemin
  « `apps/harness/data/kata/served/served-history.json`, versé avec la fusion des actes ».
- E-2a v6.1 §6 T-15 : « chaque `policy_table_sha256` est lu sur l'enregistrement `retire-probe-v1` de sa classe, lié par
  `probe_record_sha256` ; un enregistrement d'une autre classe, ou une liste de classes dans une ligne, est refusé ; une table
  marginale n'a pas de ligne (voie (b)) ».
- CM-5 v4 §4.1 : « T_e = instant du commit de fusion, T_f = `checked_at` de la CA verte » ; « jamais recopié ».
- `bb993d5` : « L n écrit aucune ligne `kata-served-history-v1`, puisqu il ne sert aucune table kata » ; « une ligne doit porter
  **une classe et sa table**, pas une liste de classes avec un seul `policy_table_sha256` ».
- Q-CM5-19 : le rôle `served-history` (avec un tiret) est celui de l'outil figé qui **lit** ce fichier (CM5-c2) ; hors de ce lot.

## Construction

- `scripts/served-history.mjs` (+ `.d.mts`) : `node scripts/served-history.mjs --release-dir <contract-1.1.0-tables-AAAA-MM-JJ>
  --merge-commit <sha> --ca <enregistrement de CA> --probe <retire-probe-v1> [--probe …] [--root <dir>]`, lancé par MONARK à T_f
  (c-ii, c′-ii).
  - `compose` : une ligne par table kata (`cell_key_rule` `kata-bucket`) de `spec/<release_dir>/policy/`, chacune lue sur
    **exactement un** enregistrement accepté (`ok`, `equal`, `problem` nul) dont `table` est ce fichier, dont la classe est celle du
    fichier, et dont `policy_table_sha256` est le sha256 du fichier ; reçu après T_e. Une table marginale n'a ni sonde ni ligne ; un
    dossier sans table kata est refusé (`no_kata_table`) : **voie (b), L n'écrit rien**. La CA doit être verte (chaque contrôle `ok`,
    TLS autorisé sur les deux hôtes) ; `t_f` = son `checked_at`, `ca_record_sha256` = sha256 de ses octets.
  - `mergeInstant` : T_e lu par git (seconde UTC) sur un commit à deux parents ou plus.
  - `checkLine` : champs fermés, `task_class` une chaîne (une liste de classes est refusée), sha256 en hex, `merge_commit` sha complet,
    `t_e ≤ t_f`.
  - `render` : le fichier est un tableau JSON, **un élément canonique (`canonicalJson` de `scripts/spec-publish.mjs`) par ligne**,
    trié par (`t_e`, `task_class`) ; les lignes déjà là doivent être son écriture canonique ; un couple (`release_dir`, `task_class`)
    déjà écrit est refusé. Écriture par fichier temporaire et renommage.
- **Choix déclaré** : « une ligne JSON canonique par couple » et un fichier `.json` : le tableau JSON à un élément par ligne tient les
  deux (lisible par `JSON.parse` et `json.load`, une ligne par couple). Le lecteur de CM5-c2 lit ce format.
- Le fichier `served-history.json` n'est pas créé ici : sa première ligne vient avec c-ii (§3.7).

## Tests (T-15, `test/served-history.test.ts`) et tueurs

- `served_history_line_is_closed_and_read_from_a_verdict` (deux classes kata et la table liq : deux lignes, champs fermés, écriture canonique) — tueur :
  scripts/served-history.mjs:58 CONST "probe.policy_table_sha256, probe_record_sha256" -> "probe.policy_row_sha256, probe_record_sha256"
- `served_history_refuses_each_departure` (autre classe, autre table, sonde non acceptée, empreinte, sonde avant la fusion, classe
  manquante ou deux fois, CA rouge, `t_f < t_e`, dossier marginal seul) — tueur :
  scripts/served-history.mjs:52 COR "probe.ok !== true || " -> ""
- `served_history_file_is_one_line_per_class_sorted_and_closed` (second déploiement d'une classe, tri, doublon, fichier non canonique,
  liste de classes, clé inconnue) — tueur :
  scripts/served-history.mjs:70 COR "o.release_dir === l.release_dir && " -> ""
- `served_history_cli_reads_t_e_from_the_merge_commit` (dépôt git jetable, T_e lu sur le commit de fusion, commit à un parent refusé,
  réécriture refusée, fichier inchangé) — tueur :
  scripts/served-history.mjs:77 ROR "parents.length < 2" -> "parents.length < 1"

## Mutants équivalents

- Balayage à la main de 25 mutants (fichier restauré, sha256 contrôlé) : 23 tués après deux ajouts aux tests (liste d'**une** classe,
  que `String([c])` laissait passer le motif ; `equal: false` seul).
- `scripts/served-history.mjs:58` `probe.policy_table_sha256` → `sha(table)` : **équivalent**, la l.56 refuse toute différence entre
  les deux ; c'est l'énoncé « lu sur l'enregistrement » qui fixe la source, pas une sortie observable.
- Garde `full !== commit` de `mergeInstant` : équivalente à `checkLine` (sha complet) ; **retirée**.

## Preuves

- `node scripts/red-proof.mjs --base 1cddd2e5 --gel <worktree> --repo <worktree> --draw 4 --seed 15` : voir le corps de la PR.
- R-25 : 3 fichiers hors `docs/**/*.md`, voir le corps de la PR.
