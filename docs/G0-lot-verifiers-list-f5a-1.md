# G0 de VERIFIERS-LIST-F5A-1 (chantier en trois parties) : la liste épinglée des vérificateurs, l'outil de recalcul versé, son rapport, et la porte `recompute_held` levée par conditions

- **Demande** : item VERIFIERS-LIST-F5A-1, porteur MONARK (`docs/ETAT.md` l.518-538 à la base ; la mission cite l.518-541, dont
  l.539-541 ouvrent SHORT-DIGEST-INVERSION-1). Déclencheur amendé le 2026-10-06 à 02:39 UTC (l.520-525) : l'item bloque dès la
  première table publiée dont une ligne porte `recompute`. C'est un des trois maillons de la mise en service de la vague 1, avec
  E-2a et SHORT-DIGEST-INVERSION-1, visée vers le 2026-10-20 (ETAT l.26-28). La conception suit les réponses de RECHERCHES à
  Q-V1..Q-V3 (`recherches:coordination/messages/2026-10-06-RECHERCHES-vers-MONARK-VERIFIERS-Q-V1-V3.md`, commit `821008d`,
  sha256 `9879828f…`), qui répondent aux questions de MONARK (`…/2026-10-06-MONARK-vers-RECHERCHES-verifiers-list-questions.md`,
  `413fd46`, sha256 `65710c0c…`). Je n'y ai trouvé aucune contradiction. Deux écarts de forme sont motivés (lieu de l'épingle,
  §3.2) ou posés en question (liaison de la révision, Q-3 ; lecture du rapport par la porte, Q-7).
- **Base** : `lot/etude-suite` = `6792411d`. Branche `monark/verifiers-list-f5a-1`, worktree `F:/Monark-wt-verifiers`. Node
  24.21.0, Python 3.14.5 (`python -B`). `recherches` est lu dans le clone du scratchpad, à `821008de` (tête : les réponses
  Q-V1..Q-V3).
- **Zone du chantier** (détail par partie au §5) :
  - partie 1 : `tools/kata-recalc/**` (neuf), `test/kata-recalc.test.ts` (neuf), `test/byte-guard.test.ts` (`TEXT_EXT`,
    `PIN_EXT`), `scripts/lang-gate.mjs` (`TEXT_EXTS`), `apps/harness/data/verifiers.json` (neuf),
    `apps/harness/src/policy-verifiers.ts` (neuf), `test/verifiers-list.test.ts` (neuf) ;
  - partie 2 : `apps/harness/data/kata/recompute/wave1-monark-kata-recalc.json` (neuf), et les deux derniers fichiers de la
    partie 1 ;
  - partie 3 : `scripts/spec-publish.mjs`, `scripts/spec-policy-tables.mjs`, `apps/harness/src/policy-guard.ts`,
    `test/spec-1-1-0-release.test.ts`.

  `docs/ETAT.md` n'est pas touché : l'orchestrateur y écrit au G7.
- **Auteur** : MONARK. Rédaction par un worker `claude-opus-5-5` (effort max) le 2026-10-06, horloge lue à 21:52 UTC. Ce G0 est
  le seul fichier écrit ; aucun commit du worker (R-20).

## 1. Sources (toutes [lu], sur place, dans cette session)

| Source | Lignes citées | sha256 |
|---|---|---|
| A-2 r3, `recherches:decisions/0004-ADR-amendment-A-2-import-guard.md` | point 7 l.93-97 ; l.100 ; §4 l.156-164 ; tueurs l.169-170 | `d883725a…` |
| Réponses de RECHERCHES ; questions de MONARK | l.6-32 ; l.17-27 | `9879828f…` ; `65710c0c…` |
| `policy-guard.ts`, `policy-projection.ts`, `spec-publish.mjs`, `spec-policy-tables.mjs`, `test/spec-1-1-0-release.test.ts` | par ligne | base `6792411d` |
| Outil `F:/tmp/kata-p2b/tool/` (7 fichiers), journal `G1-P2-RECALC-TOOL-1.md`, `REPONSE.md` | par ligne | `b6c8e9b9…`, `34c56286…` (= `DELIVERED.sha256` l.2-3) |
| G2 de P2b, `recherches:coordination/pieces/2026-10-02-P2b-revue-close/RAPPORT.md` | par ligne | `db253115…` |
| Sortie de comparaison, `…/pieces/2026-10-02-P2b-comparaison/compare-recherches.txt` | l.1-50 | `8a014594…` |
| `recherches:kata/registry/FORMAT.md` (égal à l'épingle d'A-2 l.25) | l.3, l.8, l.41-49 | `dc1ec944…` |
| `recherches:kata/registry/PROVENANCE-wave1.md` | l.7-12 | `ba7942ab…` |
| `recherches:kata/registry/wave1.json` (clés de tête seulement, aucune ligne lue) | - | `811fcd57…` |
| Plan P2, `recherches:decisions/0005-G0-part-P2-calibration.md` | l.10-15, l.84, l.109 | `87b57c01…` |
| `recherches:kata/spec/KATA-SPEC.md`, version 2026-10-02 | l.5, l.42, l.70-74 | `b32a4062…` |
| Brouillon du G0 d'ENGINE-ROW-RETIRE-PATH-1, `…/pieces/2026-10-06-G0-retire-path/` | l.87-88, l.124, l.174-178, l.180-188, l.197 | `14033044…` |

## 2. Constat, à la base `6792411d`

### 2.1 Ce que `recompute_held` refuse, et ce qui le tient

- `tableRowProblems(table, fixture)` (`scripts/spec-publish.mjs` l.284-298) retient, hors fixtures, toute ligne dont
  `recompute !== null` (l.292 ; une clé absente aussi, `undefined !== null`). Le code est `recompute_held`, avec le détail
  « VERIFIERS-LIST-F5A-1: … the published list of verifiers comes first » (l.296). Rien ne peut lever la retenue : la porte ne
  connaît ni liste, ni rapport.
- Trois appelants : `contentProblems` sur une entrée `policy-table` (l.153) ; chaque table du fichier de vecteurs (l.143, les
  fixtures `synthetic_kata` étant dispensées) ; l'écrivain `tableText` (`scripts/spec-policy-tables.mjs` l.48-53, appelé l.60).
- Quatre tests la tiennent (`test/spec-1-1-0-release.test.ts`) :
  - `no_table_with_a_recompute_row_is_published_before_the_verifier_list` (l.133-142 ; tueur l.132 sur `spec-publish.mjs:292`) ;
  - `the_writer_refuses_through_expected_files_what_the_gate_refuses` (l.162-168 ; regex `/^Error: VERIFIERS-LIST-F5A-1/` l.167) ;
  - `spec_publish_refuses_a_hand_edited_table_even_pinned_again` (l.185-194 ; cas `someone@1` l.187) ;
  - `the_vectors_file_may_hold_tables_and_only_its_synthetic_fixtures_skip_recompute` (l.329-335 ; attendu
    `["recompute_held", "short_digest"]` l.334).
- Les 32 tables kata servies sont vides (même fichier, l.129) : aujourd'hui, aucune ligne kata n'est servie ni publiée.

### 2.2 Ce que la garde fait déjà du point 7, et ce qu'elle n'épingle pas

- `guardKataRow` (`apps/harness/src/policy-guard.ts` l.98-103) vérifie quatre choses :
  - `recompute` est non nul et lié à `scores_sha256` (l.99) ;
  - la liste ne contient que des identités (l.101) ;
  - le vérificateur est dans la liste (l.102) ;
  - son identité diffère de celle de `source.generator` (l.103).

  `verifierIdentity` prend la chaîne avant le premier « @ », en minuscules ASCII (l.24).
- La liste est un paramètre : `GuardPins = ProjectionInputs & { verifiers }` (l.17). Les tests passent des listes de synthèse
  (`apps/harness/test/policy-guard.test.ts` l.22 ; cas du point 7 l.123-130). Aucune liste réelle n'est épinglée.
- La garde n'a aucun consommateur de production. `git grep` de `guardKataTable|guardKataRow|GuardPins` hors de
  `apps/harness/test/` ne trouve que les définitions. `guard_modules_are_not_served` (l.168-181) la garde hors du graphe servi.
- La projection reçoit l'attestation par case, `{verifier, report_sha256}` (`policy-projection.ts` l.79). Elle lève sur une case
  calibrée sans attestation (l.96) et copie `calib.scoresSha256` dans `recompute.scores_sha256` (l.118). La liaison d'A-2 l.94
  est donc vraie par construction. Elle ne dit pas que le vérificateur a retrouvé ce digest (§2.4).

### 2.3 L'outil P2-RECALC-TOOL-1 tel qu'il a été livré

| Fichier | Lignes (`wc -l` = insertions de `git diff --no-index --shortstat`) | sha256 (= `DELIVERED.sha256` l.57-63) |
|---|---|---|
| `kata_lib.py` | 439 | `11656b35…` |
| `binom_exact.py` | 353 | `c83d971a…` |
| `vectors_check.py` | 197 | `d96f4fab…` |
| `binom_check.py` | 1 014 | `036a5f5f…` |
| `recalc_p2.py` | 451 | `7a7ee0e5…` |
| `compare_p2.py` | 226 | `6f00b36c…` |
| `compare_check.py` | 111 | `635e0f5b…` |

- **Octets** : 2 791 lignes ; ASCII seul, 0 TAB, 0 CR, LF final ; la ligne la plus longue fait 159 octets (mesuré).
- **Empreinte d'arbre** (règle du §3.2) : `bca9ee5251a43126fe3e052eee1974a91d6352811caa24077889c4c4e60a5231`. Je l'ai mesurée
  deux fois, par une boucle `sha256sum` et par `manifestText` de `spec-publish.mjs` (l.167). C'est l'arbre **revu** par la G2
  de P2b ; ce n'est pas l'arbre à épingler (§3.1).
- **Lu à l'exécution** :
  - les quatre séries `F:/PRODUITS/marche/series-2026-10-01/<SYM>/<SYM>-15m.csv` (`recalc_p2.py` l.23, l.73), de 70 080 lignes
    chacune (REPONSE l.38). Chaque fichier est haché en mémoire et refusé avant toute analyse si son sha256 n'est pas
    l'épingle (l.71-77). Épingles : BTCUSDT `271c4e07…`, ETHUSDT `cf521c53…`, BNBUSDT `c5225573…`, SOLUSDT `e318b752…`
    (l.25-30 ; plan P2 l.10-14 ; PROVENANCE-wave1 l.12) ;
  - les sorties de l'enregistreur de MONARK, `manifest.json` et `missing.json` de chaque symbole (l.109-125), pour un
    recoupement de recensement. Aucun rapport ne donne leur empreinte et rien ne les épingle ;
  - les trois sorties d'oracle de la porte D-2 (l.61-68), lues dans `ORACLE_DIR`, écrit en dur (l.24) : `vectors-check.txt`
    `9a1647c0…`, `binom-check.txt` `63606d4f…`, `hikae-replay.txt` `83fb3afc…` (DELIVERED l.12, l.5, l.9) ;
  - `vectors.json` (`vectors_check.py` l.22), lu à `0795d70e…` (journal l.24) ;
  - `packages/hikae/test/served-scores.ts`, lu par `git -C F:/Monark show 207f021f:…` (`binom_check.py` l.904-924), en
    mémoire, et identifié par `calibDigest` (journal l.101-104).
- **Lu pour comparer, après le sceau** : `compare_p2.py` lit A et B (l.89). B est `wave1.json` `811fcd57…`
  (`compare-recherches.txt` l.4). En mode recensement, il lit `census.json` `95e5b984…` (journal l.244). La G2 a aussi joué
  `binom_check.py --registry` sur B (RAPPORT l.42).
- **Jamais lu** (journal l.35-36, l.318-319) : `kata/src/`, `kata/bench/`, `kata/oracle/`, `kata/test/`, `kata/scripts/`, ni
  aucun registre ou rapport de RECHERCHES avant le sceau `7eb07d4d…`.
  - Le générateur produit `wave1.json` et `wave1-report.md` (`kata/bench/write-p2.ts` à `1ea4f64`) ; `census.json` vient de
    `kata/bench/run-census.ts` à `e91aa7a` (PROVENANCE-wave1 l.7-9).
  - L'étape de recalcul ne lit aucun de ces fichiers. L'étape de comparaison lit B, par définition.
- **Ce qui est commun avec le générateur : le moteur.**
  - `binom_exact.py` porte `binomial.ts`, `l1-split.ts` et `runs.ts` de hikae à `207f021f` (journal l.26-28 ; RAPPORT
    l.126-127). C'est le moteur que le banc importe : `engine`, FORMAT l.8 ; valeur au §2.5.
  - La parade est double. Une seconde écriture, par sommes directes en rationnels exacts : 16 821 contrôles, 0 échec (journal
    l.159-162). Et le rejeu des 24 tests de hikae : 207 756 assertions (l.163-165).
  - Katas, étiquettes, facteurs et seaux sont écrits depuis les seules définitions écrites (journal l.38-90).
- **Ce qu'il ne sait pas encore faire** :
  - sept champs restent à `null`, faute de forme écrite au moment du G1 (REPONSE l.52-53 ; journal l.105-110) ;
  - le terme EWMA est `w * (r * r)` (`kata_lib.py` l.265), alors que KATA-SPEC version 2026-10-02 écrit `(w_i * r_i) * r_i`
    (l.42 ; SPEC-EWMA-ASSOC-1, `recherches` `4ad765d`) ;
  - `UTest` s'écrit `"1.0000000"` quand kTest = nTest (RAPPORT l.154, N-4 l.183-184), au lieu de `"1"` (FORMAT l.49) ;
  - `months` d'une case de bande `under_calib` n'a pas la forme écrite (N-5, l.185) ;
  - des chemins sont écrits en dur (`recalc_p2.py` l.23-24, `compare_check.py` l.14-16, `binom_check.py` l.910 ; IT-G2-3,
    RAPPORT l.216-217) ;
  - le comparateur juge les flottants à 1e-12 relatif (journal l.233-237) : il ne liste pas les écarts d'un ulp, il les passe.

### 2.4 La comparaison de P2b : ce qu'elle a couvert, ce qu'elle a sauté

- **Les sept champs ignorés**, liste fermée imprimée par le comparateur : `calib.check1, calib.check2, calib.reason, engine,
  plan, trialId, trialRegistryHead` (`compare-recherches.txt` l.5). C'est la même liste qu'à REPONSE l.52-53 et l.93, et
  qu'au journal l.243.
- **Le point 7 (A-2 l.96) contre la comparaison** :

| Champ du point 7 | Champ du registre | P2b |
|---|---|---|
| n, misses, k_obs | `calib.n`, `calib.misses`, `calib.kObs` | comparés, égalité stricte |
| qhat | `calib.qhat` | comparé à 1e-12, écarts au bit non listés |
| les deux issues des contrôles de dépendance | `calib.check1`, `calib.check2` | **sautées** ; la G2 a mesuré à part 280 sur 280 égales, sur `wave1-monark-checks.json` (RAPPORT l.144-145) ; l'outil, lui, ne les compare pas |
| bloc TEST | `test.{nTest, kTest, UTest, vetoed, months}` | comparés |
| calib_support | `calibSupport` | comparé à 1e-12 |
| thresholds | `thresholds` (chaînes) | comparés, égalité stricte |
| valeurs de scale_table | `hourOfWeekFactors`, `factorTableSha256` | valeurs à 1e-12 ; digest différent sur 34 cases |

- **Écarts au bit des valeurs, avant Node** : 255 facteurs sur 4 200, 6 `qhat`, 1 `calibSupport`. Ces trois nombres sont la
  mesure de l'orchestrateur, citée par la G2 (RAPPORT l.77) : niveau [2nd], à remesurer par le rapport de la partie 2.
- **Résultat** : 280 paires, 40 cases différentes, toutes d'échelle. Les différences ne portent que sur des digests :
  `calib.scoresSha256` 40, `calib.auxSha256` 40, `factorTableSha256` 34. Sortie 1 (`compare-recherches.txt` l.46-50).
- **Cause, mesurée par la G2** : verdict APPROUVE-AVEC-CORRECTIONS sur l'outil, constat C-1 (RAPPORT l.14, l.165-174).
  - `ln` diffère d'un ulp sur 444 entrées de `log` sur 327 983 ; `pow` jamais, 0 sur 100 (l.62-63).
  - L'association du terme EWMA fait le reste. Sous Python avec l'association de RECHERCHES, 15 des 114 digests deviennent
    égaux. Sous le `log` de Node avec la même association, 114 sur 114, et `compare_p2.py` sort 0 (l.107-114).
  - Statuts et issues des contrôles sont invariants dans toutes les passes (l.118-119).

### 2.5 Le générateur, mesuré

- Les clés de tête de `wave1.json`, lues seules (`python -B`, toutes clés sauf `rows`) :
  - `plan` = `0005-G0-part-P2-calibration.md v3, section 9 of 2026-10-02 (87b57c01)` ;
  - `engine` = `monark-governance main 207f021f` ;
  - `trialRegistryHead` = `{length: 80, hash: 648709d0…}` ;
  - 280 lignes.
- `engine` nomme le commit du **moteur** de governance (`207f021ff36469a5…`), comme le veut FORMAT l.8 et l.43, et non le
  banc. Le banc générateur est `kata/bench/write-p2.ts` à `1ea4f64738625d918b9e177e1657207c330a5261` (PROVENANCE-wave1 l.8 ;
  `git rev-parse` dans le clone).
- Le G0 de CM-4a-i proposait `kata/bench/write-p2.ts@207f021f` (`docs/G0-lot-cm-4a-i.md` l.130). Cette valeur accole le
  chemin du banc au commit du moteur. Les valeurs publiées restent à fixer par une ligne datée avant F-5a (l.140).
- Par la règle de `policy-guard.ts` l.24, les deux formes donnent la même identité, `kata/bench/write-p2.ts`, distincte de
  `monark-kata-recalc` (Q-2).

### 2.6 Où vivraient les fichiers : export, R-25, gardes (mesuré)

- **Export public** :
  - les candidats sont `packages/*`, et `apps/harness` et `apps/sentinel` réduits à `src`, `test`, `package.json`, `README.md`
    (`scripts/export-public.mjs` l.38, l.47, l.358-382), plus `WHITELIST_DIRS` et `WHITELIST_FILES` (l.56-128, l.385-395) ;
  - `tools/kata-recalc/**`, `apps/harness/data/**` et le dossier racine `test/` ne sont donc pas exportés. C'est la même
    lecture que le G0 de R25-REGISTRY-ROOT-1 (l.46-48) ;
  - un module neuf sous `apps/harness/src/` l'est.
- **R-25** :
  - la borne est 1 205 (`.github/workflows/ci.yml` l.56) ;
  - aucun des 20 pathspecs d'exclusion de la ligne `STAT=` (l.100) ne couvre `tools/`, `apps/harness/data/verifiers.json` ou
    `apps/harness/data/kata/recompute/` : seul `apps/harness/data/kata/registry/**/*.json` est exclu. Tout compte ;
  - le refus des lignes de plus de 2 000 octets épargne un `.json` qui se lit comme JSON et dont le chemin est ASCII
    (`scripts/lot-size-integration.mjs` l.229, l.237-239). Un rapport canonique sur une seule ligne compte donc 1 ligne et
    passe ;
  - les liens et les gitlinks sont refusés avant le compte (l.216).
- **Gardes d'octets et de langue** :
  - `.py` n'est lu ni par `byte_guard` (`TEXT_EXT` de `test/byte-guard.test.ts` l.37-38 ; `PIN_EXT` l.126-127), ni par la
    garde de langue (`TEXT_EXTS` de `scripts/lang-gate.mjs` l.106-108) ;
  - la CI lance la garde de langue sur tout l'arbre, toutes portées (`npm run lang:gate`, `ci.yml` l.163 ; `lang-gate.mjs`
    l.322-338) ;
  - `scanFile` mesuré sur les sept fichiers : 0 hit, sauf `recalc_p2.py`, qui a 8 hits du mot « aux », l'identifiant de la
    suite auxiliaire (l.177, l.186, l.189…). Les formes `aux_seq`, `runs_aux` et `aux_sha256` sont masquées
    (`scripts/lang-exempt.json` l.28, l.36-37).
- **Un `.ts` importé depuis un script** : le précédent est `scripts/registry-root.mjs` l.13 (`readRegistry` de
  `policy-projection.ts`) ; `spec-policy-tables.mjs` le fait par `import()` (l.58).
- **Chemins de lecteur dans un fichier suivi** : aucun test ne les cherche (`git grep` dans `test/` et `apps/*/test/`). La garde
  de chemin Windows ne lit que les fichiers exportés (`export-public.mjs` l.264-270, l.506-511, l.582-586), et des tests suivis
  en portent déjà (`test/u3-realized-param.test.ts` l.235). L'import à l'octet des lots 1a à 1c passe donc avec ses chemins en
  dur ; M-6 les retire.
- **Tueur sur une ligne `.py`** : `scripts/red-proof.mjs` l'admet. `killerProblem` (l.54-62) exige un fichier du clone, hors code
  de test, où le texte d'avant figure une seule fois, sans condition d'extension. Tout fichier changé hors `*.test.ts`, hors
  `test/` et hors Markdown de `docs/` compte comme production (l.250).
- **ESLint** ignore `**/*.mjs` (`eslint.config.mjs` l.39) ; la garde de langue et `byte_guard` lisent les `.mjs`.

## 3. Construction

### 3.1 L'outil versé : `tools/kata-recalc/`

- **Chemin** : `tools/kata-recalc/`, un dossier racine neuf (il n'y a pas de `tools/` à la base, `git ls-tree 6792411d`). Il
  est hors de l'export et compté par R-25 (§2.6).
- **Versement en deux temps** :
  1. les sept fichiers **à l'octet** (sha256 = `DELIVERED.sha256` l.57-63 ; arbre `bca9ee52…` après le troisième lot) ;
  2. les modifications, en diff relisible contre l'arbre revu.

  La G2 relit ainsi un diff, et non 2 791 lignes neuves. L'arbre épinglé dans la liste est l'arbre **modifié**, mesuré au gel
  (§3.2).
- **Modifications** (liste fermée, chacune sourcée) :

| # | Modification | Fichier | Source |
|---|---|---|---|
| M-1 | terme EWMA : `_EWMA_W[nret - j] * (r * r)` devient `(_EWMA_W[nret - j] * r) * r` | `kata_lib.py` l.265 | KATA-SPEC l.42 ; C-1 et IT-G2-1 (RAPPORT l.165-174, l.208-212) |
| M-2 | contrôles de conformité de la version 2026-10-02, dont `ewma_association` au bit | `vectors_check.py` | KATA-SPEC l.5, l.70 ; `vectors.json` `06ecf069…` |
| M-3 | les sept champs remplis selon « Written forms » ; liste `--ignore` vide par défaut | `recalc_p2.py`, `compare_p2.py` | FORMAT l.43-48 ; REPONSE l.52-53 ; RAPPORT l.135-147 ; RECALC-FIELDS-2 (ETAT l.1224) |
| M-4 | `UTest` vaut `"1"` quand kTest = nTest ≥ 1 | `recalc_p2.py`, `binom_check.py` l.969-972 | FORMAT l.49 ; N-4 |
| M-5 | `months` vaut `{}` sans kTest (bande `under_calib`) | `recalc_p2.py` | FORMAT l.49 ; N-5 |
| M-6 | chemins passés en arguments (séries, sorties d'oracle, dépôt, dossier de travail) | `recalc_p2.py` l.23-24, `compare_check.py` l.14-16, `binom_check.py` l.910 | N-1, N-2, IT-G2-3 |
| M-7 | porte d'entrée `io_guard.py` (ci-dessous) | neuf ; importé en premier par chaque script d'entrée | Q-V1, précision 2 |
| M-8 | comparateur : décisions à l'égalité stricte ; flottants contrôlés au bit, chaque écart listé avec sa distance en ulps ; digests listés ; `trialRegistryHead.hash` nommé hors décision | `compare_p2.py` | Q-V3 ; A-2 l.97 ; N-6 |
| M-9 | identifiant `aux` renommé `aux_seq` (8 sites) ; `.py` ajouté à la garde de langue | `recalc_p2.py`, `scripts/lang-gate.mjs` l.106-108 | §2.6 |
| M-10 | passe croisée : le `log` de V8 remplace celui de la bibliothèque C dans la chaîne d'échelle, pour expliquer chaque écart ; `v8_log.mjs` passe la garde de langue et `byte_guard` | neufs `libm_cross.py`, `v8_log.mjs` | méthode de la G2, RAPPORT l.47-63, l.98-119 |
| M-11 | écrivain du rapport (§3.3) ; journal de course à part (durées) | neuf `report.py` | Q-V3 ; RAPPORT l.38 |

- **Porte d'entrée : l'indépendance écrite de Q-V1, précision 2.**
  - `io_guard.py` pose un crochet d'audit Python (`sys.addaudithook`) avant toute lecture. Chaque événement `open`,
    `os.listdir` et `subprocess.Popen` est jugé.
  - Sont admis : la bibliothèque standard (sous `sys.base_prefix`), l'arbre de l'outil, le dossier de sortie, et des rôles
    d'entrée en liste fermée : `series` (les quatre épingles), `recorder`, `oracle-output`, `spec-vectors`,
    `engine-test-source` (`git show 207f021f:…`) et `libm`. Le rôle `registry` (B) n'est admis que pour la comparaison, après
    le sceau.
  - Tout autre chemin arrête la course. Chaque entrée lue est notée (rôle, nom de base, sha256, octets) et passe au rapport.
  - Mesuré sur l'hôte, sous Python 3.14.5 : `open`, `os.open`, `os.listdir` et `subprocess.Popen` lèvent leur événement, avec
    le chemin. Un `import` lève `import`, puis `open` sur le `.py`, ou sur le `.pyc` de la bibliothèque standard.
  - Limite déclarée : une extension C qui lirait sans passer par Python échapperait au crochet. L'outil n'utilise que la
    bibliothèque standard (en-tête l.1 de chaque fichier).
- **Python en CI** : aucun dans ce chantier. La CI vérifie l'arbre (§5) ; la G2 de chaque partie exerce l'outil. Item
  VERIFIER-TOOL-CI-1 (§8).

### 3.2 La liste de référence et son épingle

- **Fichier** : `apps/harness/data/verifiers.json`. Il est écrit en canonique, comme le contrat 1.1.0 le définit en section 2
  (`canonicalJson`, `spec-publish.mjs` l.79-90), sans LF final. Il est hors de la racine fermée
  `apps/harness/data/kata/registry` (G0 R25-REGISTRY-ROOT-1 l.27 ; `scripts/registry-root.mjs` l.16, dont les refus ne lisent
  que cette racine, l.27-30), comme le dossier du rapport (§3.3), et n'est pas exporté (§2.6). Format fermé :

  ```
  {"format":"monark-verifiers-v1","verifiers":[{"commit":"<40 hex>","identity":"monark-kata-recalc","repository":"KraidleAI/monark-governance","tree":"tools/kata-recalc","tree_sha256":"<64 hex>"}]}
  ```

- **Règles du lecteur** :
  - clés exactes, aucune de plus et aucune absente ;
  - `identity` est une identité : égale à son image par la règle de `policy-guard.ts` l.24, donc en minuscules et sans « @ » ;
  - identités uniques et triées ;
  - `commit` : 40 hex en minuscules ; `tree_sha256` : 64 hex ; `tree` vaut `tools/kata-recalc`.
- **Empreinte d'arbre** (`tree_sha256`), pour qu'un relecteur la recalcule :
  1. lire les blobs de l'index ou du commit sous `tools/kata-recalc/`, récursivement, jamais l'arbre de travail. Tout mode
     autre que `100644` est refusé : lien `120000`, gitlink `160000`, exécutable `100755` ;
  2. écrire une ligne par fichier : le sha256 du blob (64 hex), deux espaces, le chemin relatif à `tools/kata-recalc/`, puis
     LF. Les lignes sont triées par chemin (octets ASCII). C'est `manifestText` de `spec-publish.mjs` (l.167), le format de
     `MANIFEST.sha256` ;
  3. `tree_sha256` est le sha256 de ce texte.

  Recette POSIX, en lecture seule :

  ```
  C=<commit>; R=<clone>
  git -C "$R" ls-tree -r --full-tree "$C" -- tools/kata-recalc | awk '$1 != "100644" { bad = 1 } END { exit bad }' &&
  git -C "$R" ls-tree -r --name-only --full-tree "$C" -- tools/kata-recalc | LC_ALL=C sort | while read -r p; do
    printf '%s  %s\n' "$(git -C "$R" cat-file blob "$C:$p" | sha256sum | cut -c1-64)" "${p#tools/kata-recalc/}"
  done | sha256sum | cut -c1-64
  ```

  La même règle donne `bca9ee52…` sur l'arbre livré (§2.3).
- **Séquence** : la liste ne peut pas épingler le commit qui la contient.
  - Elle entre au dernier lot de la partie 1 (1f), après la fusion du lot 1e.
  - `commit` = le commit de fusion de 1e sur `lot/etude-suite` ; `tree_sha256` = l'empreinte de `tools/kata-recalc/` à ce
    commit.
  - L'attestation des lignes devient `monark-kata-recalc@<ces 40 hex>`.
  - Toute modification ultérieure de l'outil rougit le test d'arbre (§5) tant qu'un lot, avec sa G2, n'a pas changé la liste
    (Q-V2, point 2).
- **L'épingle est une constante gelée dans un module neuf**, `apps/harness/src/policy-verifiers.ts`, et non dans
  `policy-guard.ts`. Le module porte `VERIFIERS_SHA256`, le lecteur fermé `readVerifiers`, `identityOf` et `toolTreeSha256`.
  Raisons :
  1. `policy-guard.ts` est tenu par R-a d'ENGINE-ROW-RETIRE-PATH-1 (brouillon l.87). Dans un module neuf, l'épingle peut entrer
     avant ;
  2. la porte `spec-publish.mjs` doit lire l'épingle. Le module neuf n'importe que `node:crypto`, alors que `policy-guard.ts`
     tire `@monark/contracts`, `@monark/hikae` et quatre modules du harnais (l.9-14) ;
  3. la liste reste une donnée : la copie du dossier daté se compare par sha256 à une seule constante, sans écriture dérivée ;
  4. `apps/harness/src` est exporté. La constante est donc lisible dans le miroir public, et chacun peut confronter une copie
     publiée à la source.
- **Suite de l'épingle** :
  - en partie 3, `policy-guard.ts` importe `identityOf` : la garde et la porte ont une seule règle d'identité ;
  - le câblage de `GuardPins.verifiers` sur la liste épinglée revient au chargeur E-2a, seul consommateur de production de la
    garde (§2.2 ; item VERIFIER-GUARD-PINS-E2A-1).

### 3.3 Le rapport de recalcul

- **Lieu** :
  - dans governance : `apps/harness/data/kata/recompute/wave1-monark-kata-recalc.json`, versé en partie 2 ;
  - publié dans chaque dossier daté qui porte des lignes qu'il atteste, sous
    `contract-<x.y.z>-tables-<date>/recompute/wave1-monark-kata-recalc.json` (dossier daté de R-b, brouillon l.124) ;
  - aucun segment `policy/`, aucun objet en forme de table (`rows` avec `class.task_class`, `spec-publish.mjs` l.125) : sa
    sorte est `json`.
- **Contenu** (format fermé `monark-recompute-report-v1`, canonique, ASCII) :
  - `verifier` = `monark-kata-recalc@<commit>`. `tool` = `{commit, tree, tree_sha256}`, recalculés par l'outil sur son propre
    arbre (règle du §3.2) ;
  - `registry` = `{file: "wave1.json", sha256: 811fcd57…, generator_identity: "kata/bench/write-p2.ts", cells: 280}`. Seule
    l'identité du générateur figure, sans révision (constante de `report.py`, source PROVENANCE-wave1 l.8) : le rapport ne
    dépend pas de la réponse à Q-2 ;
  - `inputs` : la liste du crochet, une ligne par fichier lu, `{role, name, sha256, bytes}`, partagée entre `recompute` et
    `compare`. B est la seule entrée de `compare` ;
  - `platform` : `sys.version`, `platform.platform()`, `platform.machine()`, la bibliothèque C du `log` (nom, version, sha256 du
    fichier), et Node et V8 pour la passe croisée. Valeurs mesurées ce jour : `Windows-10-10.0.19045-SP0`, `AMD64`,
    `3.14.5 (tags/v3.14.5:5607950, May 10 2026, 10:43:50) [MSC v.1944 64 bit (AMD64)]`, `ucrtbase.dll` 10.0.19041.3636,
    Node v24.21.0. Aucune bibliothèque numérique tierce : seulement `math`, `fractions`, `hashlib` et `json` de la bibliothèque
    standard ;
  - `oracles` : vecteurs, seconde écriture binomiale, rejeu des tests de hikae, avec leurs comptes et leurs échecs. Le compte
    de la version 2026-10-02 est 333 contrôles (KATA-SPEC l.5). Ancien écart de compte : 317 = 315 + les deux contrôles de
    longueur (`recherches:coordination/messages/2026-10-02-RECHERCHES-vers-MONARK-P2-clos-publication.md` l.22) ;
  - `fields` : les champs comparés et leurs règles, exactement `decisions`, `digest_rule`, `digests`, `value_rule` et `values`
    (voie 1, §17 : aucun champ hors des décisions). Les sept champs sautés en P2b ont chacun leur sort :
    - `check1`, `check2` : comparés. Ce sont les issues des contrôles de dépendance, que le point 7 exige ;
    - `reason` : comparé ; c'est l'une des sept chaînes de FORMAT l.48 ;
    - `trialId` : comparé ; forme de FORMAT l.45 ;
    - `plan`, `engine` : comparés. Forme de FORMAT l.43, construite depuis le plan épinglé `87b57c01…` et le moteur porté
      `207f021f` ;
    - `trialRegistryHead.length` (80) : comparé ;
    - `trialRegistryHead.hash` : comparé (voie 1, §17). L'outil recalcule la chaîne des essais depuis ses propres lignes (§8 de
      R1 ; `trial_chain` de `recalc_p2.py`) ; FORMAT l.44 ne la nommait que dans le code du générateur (`append` et `wave1Trials()`
      de `kata/src/trials.ts`), et `readRegistry` la lit comme un objet (`policy-projection.ts` l.68) ;
  - `cells` : 280 entrées `{task_class, cell_key, decisions_equal}` ;
  - `differences` :
    - chaque valeur non identique au bit (`qhat`, `calibSupport`, `thresholds`, `hourOfWeekFactors[i]`), avec sa distance en
      ulps ;
    - chaque digest différent (`scoresSha256`, `auxSha256`, `factorTableSha256`), avec l'indice du premier terme qui diffère ;
    - pour chacun, son explication mesurée : égal à B sous le `log` de V8 (M-10), et le nombre d'entrées de `log` qui
      diffèrent ;
  - `summary`, et `replay` (la commande exacte, ci-dessous).
- **Preuve** : « égalité de chaque décision, chaque écart d'un ulp listé et expliqué » (A-2 l.97 ; RECHERCHES l.27).
  - **Décisions** : tout champ entier, booléen ou chaîne, à l'égalité stricte. Ce sont `calib.{n, status, reason, rank, kStar,
    kObs, misses, U, check1, check2}`, `drops`, `test.*`, `status`, `epoch`, les clés et colonnes d'identité (dont
    `seriesSha256` et `trialId`), et les champs de tête comparés.
  - **Valeurs** : les flottants et leurs écritures (`qhat`, `calibSupport`, `hourOfWeekFactors`, `thresholds`), dans 1e-12
    relatif (KATA-SPEC l.71), listés quand ils ne sont pas identiques au bit. Un seuil qui changerait l'appartenance à un seau
    changerait `n`, donc une décision.
  - **Digests** : égaux, ou listés.
  - Le rapport n'est écrit qu'avec 280 cases égales en décision et toute différence expliquée. Sinon l'outil sort non nul et
    n'écrit pas de rapport.
- **Prédiction écrite avant la course** (à confirmer ; jamais reportée comme un fait) :
  - décisions égales, 280 sur 280. La G2 a trouvé les statuts 276/2/2 et les issues des contrôles égales dans toutes ses passes
    (RAPPORT l.45, l.118-119, l.144) ;
  - après M-1, sous le `log` de Python, 99 des 114 digests restent différents (l.110) ;
  - sous le `log` de V8, tous sont égaux (l.110-112).
- **Commande exacte**, depuis un clone de governance détaché au commit listé (TEMP et TMP sous `F:/tmp`) :

  ```
  python -E -S -s -B tools/kata-recalc/report.py --repo <clone> --series <dossier des quatre séries> --vectors <vectors.json> --registry <wave1.json> --out <dossier vide>
  ```

  Elle écrit `report.json`, le rapport haché, et `run-log.json` (heures et durées), qui n'est jamais haché ni publié. Un clone
  à un autre commit écrirait un autre `tool.commit`, et le test T2-1 le refuserait.
- **Stabilité de `report_sha256`** :
  - les octets hachés ne contiennent ni heure, ni durée, ni chemin absolu, ni nom d'hôte ou d'utilisateur ;
  - les tableaux sont triés : cases par `(task_class, cell_key)`, entrées par `(rôle, nom)` ;
  - écriture canonique, LF seul (`newline="\n"`, leçon de E-4 au G1 et de E-6 à la G2) ;
  - l'outil a déjà rendu deux fois les mêmes octets, d'une instance à l'autre (journal l.221-222 ; RAPPORT l.35, l.44) ;
  - le haché dépend de la plateforme par construction, et le rapport nomme sa plateforme (A-2 l.97, « on a named platform »).
    La G2 rejoue sur la même plateforme, ou documente l'écart (RECHERCHES l.30).
- **Contenu interdit** : le rapport et la liste passent `contentProblems` en sorte `json`, sur le texte et sur les chaînes
  décodées (`spec-publish.mjs` l.133-148).
  - Mesuré sur des brouillons gardés en mémoire : la liste (283 octets) et un squelette de rapport (1 294 octets) donnent 0
    problème au chemin daté.
  - Refus mesurés : un identifiant d'item (`RECALC-TOOL-1`, règle b) ; un chemin de lecteur (`F:/P…`, e) ; « worker » (k) ;
    « recherches » (privé) ; « A-2 » (c) ; le nom de la place hors d'une clé de case (règle a, `vocab-banned.json` l.55). Dans
    une clé `kata:…@<place>/…`, le nom est masqué (`spec-publish.mjs` l.95, l.113).
  - Règle d'écriture qui en découle : aucun nom d'item, de rôle d'agent, de dépôt privé ni de chemin local ; le nom de la place
    seulement dans les clés de case ; aucune heure ; aucun prix, aucune bougie, aucune valeur par décision. Seulement des
    comptes, des indices, des ulps et des digests, comme le registre (plan P2 l.109).

### 3.4 La porte (partie 3)

- **Clauses de ligne**, dans `tableRowProblems`, que voient aussi l'écrivain et le fichier de vecteurs. Une ligne à
  `recompute` non nul est retenue (`recompute_held`, avec un détail qui nomme la clause) si :
  1. l'identité de `recompute.verifier` n'est pas dans la liste épinglée ;
  2. sa révision n'est pas le `commit` de l'entrée (Q-3) ;
  3. son identité est celle de `source.generator` ;
  4. `recompute.scores_sha256` diffère de `scores_sha256`.

  Les fixtures `synthetic_kata` restent dispensées (l.143). Le détail ne cite plus l'item, qui sera clos.
- **Clauses de dossier**, dans `plan()`, qui voit toutes les entrées de la release. Pour chaque dossier `contract-*` qui
  tient une table à ligne `recompute` :
  - `verifier_list_copy` : le dossier n'a pas de `verifiers.json` ; ou bien, pour le dossier de la release, ses octets ne
    sont pas l'épingle ; ou bien, pour un dossier porté de `previous_commit`, une de ses entrées manque à la liste épinglée
    (liste en ajout seul, Q-4) ;
  - `recompute_report_missing` : aucune entrée du même dossier n'a pour sha256 `report_sha256` ; ou le rapport, lu par
    `readRecomputeReport`, ne nomme pas le même `verifier`, ne porte pas le même `registry.sha256` que
    `source.registry_sha256` ni la même identité que `source.generator`, ou ne liste pas la case avec `decisions_equal` vrai
    (Q-7).

  Une ligne `recompute` hors d'un dossier `contract-*` (une table à la racine, `policy/`) est retenue.
- `short_digest` et le traitement du fichier de vecteurs ne changent pas.

### 3.5 Tuyaux (branchement)

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État | Test de composition |
|---|---|---|---|---|
| outil `tools/kata-recalc/` | séries scellées, vecteurs publiés | le rapport | dépôt governance | arbre = liste (partie 1) ; rejeu du rapport par la G2 (partie 2) |
| `verifiers.json` et `VERIFIERS_SHA256` | lot 1f, avec la G2 de la partie 1 | `spec-publish` (copie du dossier) ; E-2a (`GuardPins.verifiers`) | `apps/harness/data/` | `plan()` sur un dossier daté de synthèse (partie 3) ; E-2a (item) |
| rapport | l'outil, au commit listé | `spec-publish` (`report_sha256`) ; E-2a (`attestation` de la projection, `policy-projection.ts` l.79) | `apps/harness/data/kata/recompute/` | porte de publication sur le rapport réel (partie 2) ; première release datée réelle (E-2a, item) |

Tant que la première release datée réelle n'a pas publié le rapport, celui-ci reste « upcoming » dans tout registre public.

## 4. Ce que ce chantier ne lève pas

- `short_digest` refuse toute ligne dont `aux_sha256` ou `series_sha256` est non nul (`spec-publish.mjs` l.293-297). La garde
  exige ces deux colonnes sur toute ligne kata (`policy-guard.ts` l.50).
- Ce chantier seul ne fait donc publier aucune table kata. Il faut aussi SHORT-DIGEST-INVERSION-1 (RECHERCHES) et le chargeur
  E-2a (ETAT l.26-28).
- Partage des rôles : ce chantier livre l'outil, la liste, le rapport et la porte ; E-2a charge les lignes et pose leurs
  attestations.

## 5. Découpe en parties

- **Ordre** : les parties 1 et 2 ne modifient aucun fichier tenu par R-a ou R-b ; elles peuvent partir tout de suite. Leurs
  tests importent `policy-guard.ts` et `spec-publish.mjs` en lecture seule. La partie 3 vient après la fusion de R-a et de
  R-b : elle touche `spec-publish.mjs`, `spec-policy-tables.mjs` et `policy-guard.ts`, et s'appuie sur le dossier daté de R-b
  (brouillon l.88, l.124).
- **Tueurs** : forme fermée `// killer: fichier:ligne OP "avant" -> "après"`, écrits par contenu ; leurs lignes sont fixées
  au gel.

### Partie 1 : l'outil versé et la liste épinglée (avant R-a et R-b ; une G2)

| Lot | Fichiers | R-25 (mesuré + estimé) |
|---|---|---|
| 1a | `kata_lib.py`, `binom_exact.py`, `vectors_check.py`, à l'octet ; `.py` ajouté à `TEXT_EXT` et `PIN_EXT` de `test/byte-guard.test.ts` ; `test/kata-recalc.test.ts` | 989 + ~60 = ~1 050 |
| 1b | `binom_check.py`, à l'octet ; épingle du test | 1 014 + ~2 |
| 1c | `recalc_p2.py`, `compare_p2.py`, `compare_check.py`, à l'octet ; épingle `bca9ee52…` | 788 + ~2 |
| 1d | M-1 à M-9 | ~450 |
| 1e | M-10, M-11 | ~450 |
| 1f | `apps/harness/data/verifiers.json`, `apps/harness/src/policy-verifiers.ts`, `test/verifiers-list.test.ts` | ~260 |

Total : environ 4 000 lignes, chaque PR sous 1 205. L'incertitude est de ±30 % sur la part estimée.

Tests rouges :
- `kata_recalc_tree_is_the_pinned_manifest` (lots 1a à 1e, `test/kata-recalc.test.ts`) : modes et blobs de l'index sous
  `tools/kata-recalc/` ; l'empreinte par `manifestText` égale l'épingle du lot. Rouge à la base par assertion : aucun fichier,
  donc l'empreinte du texte vide. Tueur (1a), sur le texte exact de la ligne livrée :
  `tools/kata-recalc/kata_lib.py:265 CONST "_EWMA_W[nret - j] * (r * r)" -> "(_EWMA_W[nret - j] * r) * r"` ; le sens inverse
  en 1d, après M-1.
- `.py` dans `byte_guard` : support de test, dont le détecteur vit dans le test lui-même ; pas de tueur de production. Mutant à
  la main : retirer `.py` de `TEXT_EXT` rougit l'assertion de la l.181 (fixture `t/x.py` avec un TAB).
- `lang_gate_reads_python_sources` (1d) : `scannable("tools/kata-recalc/recalc_p2.py")` est vrai, et l'arbre donne 0 hit. Rouge
  à la base par assertion. Tueur : `scripts/lang-gate.mjs:107 CONST "\".txt\", \".py\"" -> "\".txt\""`.
- `kata_recalc_entry_scripts_import_the_input_guard_first` (1d) : statique ; chaque script d'entrée a `import io_guard` pour
  premier import. Rouge à la base par assertion. Tueur : `tools/kata-recalc/recalc_p2.py:<l> CONST "import io_guard" -> "import
  os"`. C'est un fil-piège seulement ; la preuve est la liste des entrées du rapport (partie 2).
- `verifier_list_is_the_pinned_canonical_bytes` (1f) : le sha256 du fichier est `VERIFIERS_SHA256`, l'écriture est canonique,
  sans LF final. Rouge à la base : module neuf. Tueur : la constante `VERIFIERS_SHA256` remplacée par 64 zéros.
- `verifier_list_reader_refuses_each_departure` (1f) : clé inconnue, clé absente, format faux, `Monark-Kata-Recalc`, `a@b`,
  identité en double, entrées non triées, `commit` ou `tree_sha256` mal formés, `tree` autre : chaque refus est nommé. Module
  neuf. Tueur : `policy-verifiers.ts:<l> CONST "v.identity === identityOf(v.identity)" -> "true"`.
- `verifier_tool_tree_is_the_listed_tree` (1f ; remplace l'épingle du test d'arbre) : l'empreinte de l'index égale le
  `tree_sha256` de l'entrée. Sur un dépôt jetable, un fichier en plus, un octet changé, un lien ou un exécutable donnent un refus
  ou un écart. Module neuf. Tueur : `policy-verifiers.ts:<l> CONST "p.slice(TOOL_ROOT.length + 1)" -> "p"`.
- `verifier_identity_rule_is_the_guard_rule_and_not_the_generator` (1f) : `identityOf(x) === verifierIdentity(x)` sur un
  échantillon (casse, « @ » multiples, chaîne vide, non-ASCII) ; l'identité listée diffère de
  `identityOf("kata/bench/write-p2.ts@1ea4f64…")`. Module neuf. Tueur : `policy-verifiers.ts:<l> CONST "/[A-Z]/g" ->
  "/[A-Y]/g"`.
- `verifier_list_copy_passes_the_spec_gate` (1f) : `contentProblems("contract-1.1.0-tables-<date>/verifiers.json", "json", …)`
  est vide. Module neuf. Tueur : `scripts/spec-publish.mjs:96 CONST "/^monark-governance$/i.test(v.word)" -> "false"`.

Actes de la G2 de la partie :
- relire le diff de 1d et 1e contre l'arbre revu ;
- rejouer les oracles de l'outil : vecteurs de la version 2026-10-02, seconde écriture, tests de hikae, cas du comparateur,
  refus du crochet d'entrée ;
- recalculer, par la recette du §3.2, que le `commit` de la liste porte bien l'arbre listé.

### Partie 2 : le rapport (avant R-a et R-b ; une G2)

- **Acte** (MONARK, sur l'hôte des séries) : la commande du §3.3, depuis un clone au commit listé.
- **Lot 2a** : le rapport (1 ligne) ; `readRecomputeReport` dans `policy-verifiers.ts` ; tests ajoutés à
  `test/verifiers-list.test.ts`. Environ 190 lignes.
- Tests rouges (module ou fichier neuf à la base) :
  - T2-1 `recompute_report_is_closed_and_bound_to_the_list` :
    - format fermé ;
    - `verifier` et `tool.tree_sha256` égaux à l'entrée de la liste ;
    - `registry.sha256` = `811fcd57…` ; `registry.generator_identity` = `kata/bench/write-p2.ts`, distincte de l'identité
      listée ;
    - 280 cases uniques, toutes `decisions_equal` ;
    - chaque différence a une cause mesurée et une explication ;
    - `fields` : exactement `decisions`, `digest_rule`, `digests`, `value_rule` et `values` (voie 1 : aucun champ hors des décisions).

    Tueur : `policy-verifiers.ts:<l> CONST "c.decisions_equal === true" -> "true"`.
  - T2-2 `recompute_report_inputs_are_sealed_series_and_published_files_only` :
    - rôles pris dans la liste fermée ;
    - les quatre sha256 de séries sont ceux du plan P2 (l.11-14) ;
    - aucune entrée `recompute` ne s'appelle `wave1.json`, `wave1-report.md` ou `census.json` ;
    - la seule entrée `compare` est `wave1.json` `811fcd57…`.

    Tueur : la liste fermée des rôles du lecteur.
  - T2-3 `recompute_report_is_canonical_and_passes_the_spec_gate` : écriture canonique, ASCII, sans CR ; `contentProblems` au
    chemin daté est vide. Tueur : `scripts/spec-publish.mjs:113 CONST "k.replace(VENUE, \"@$1KEY/\")" -> "k"` ; le nom de la
    place, dans les clés, serait alors refusé.
- **Acte de la G2** : elle rejoue la commande et retrouve le même `report_sha256` sur la plateforme nommée, ou documente l'écart.
  Elle relit chaque explication.

### Partie 3 : la porte (après R-a et R-b ; une G2)

- **Fichiers**, environ 250 lignes :
  - `scripts/spec-publish.mjs` : les clauses du §3.4, et les codes `verifier_list_copy` et `recompute_report_missing` ajoutés à
    l'en-tête (l.14-21) ;
  - `scripts/spec-policy-tables.mjs` : commentaire (l.12-13) et message ;
  - `apps/harness/src/policy-guard.ts` : `verifierIdentity` importé de `policy-verifiers.ts` ;
  - `test/spec-1-1-0-release.test.ts`.
- **Tests réécrits** (aucun supprimé) :
  - l.133 devient `a_recompute_row_needs_a_listed_verifier_other_than_the_generator`.
    - `v@1` → `recompute_held` ; l'attestation listée → aucun problème de ligne.
    - Le générateur pris pour vérificateur, une autre révision, un autre `scores_sha256` → `recompute_held`, chacun nommé.
    - Rouge à la base par assertion : la base retient aussi la ligne listée.
    - Tueur : `scripts/spec-publish.mjs:<l> CONST "ids.includes(identityOf(rc.verifier))" -> "true"`.
  - l.162 : la regex suit le nouveau message, et une ligne listée passe l'écrivain. Tueur inchangé (`spec-policy-tables.mjs:60`).
  - l.185 : le cas `someone@1` → `recompute_held` (non listé) est gardé. Ajout : une ligne listée sans dossier complet →
    `verifier_list_copy` et `recompute_report_missing`. Tueur inchangé (`:153`).
  - l.329 : inchangé. `{verifier: "v"}` reste non listé, donc `["recompute_held", "short_digest"]`.
- **Tests neufs** :
  - `a_recompute_row_publishes_with_its_report_and_the_pinned_list_in_its_folder`.
    - Racine governance de synthèse avec `contract-1.1.0-tables-2026-10-20/` : une table de synthèse à ligne attestée, sans
      digest de suite ; la copie de la liste réelle ; un rapport de synthèse. `plan()` ne rend aucun problème.
    - Rapport retiré → `recompute_report_missing`. Un octet de la copie changé, ou la copie retirée → `verifier_list_copy`.
    - Rouge à la base par assertion.
    - Tueurs : `CONST "reports.has(rc.report_sha256)" -> "true"` ; `CONST "sha(copy) === VERIFIERS_SHA256" -> "true"`.
  - `a_carried_folder_keeps_its_list_while_the_pinned_list_extends_it` : un dossier porté dont la copie a une entrée E1. Si
    l'épingle porte E1 et E2 → admis ; si elle n'a plus E1 → `verifier_list_copy`. Rouge à la base par assertion. Tueur :
    `CONST "carried.every((e) => pinned.has(key(e)))" -> "true"`.

## 6. Risques

- **R-1, plateforme.** `report_sha256` dépend du `log` de la bibliothèque C. Parade : le rapport nomme sa plateforme et la G2
  rejoue sur la même ; ailleurs, l'écart est documenté (RECHERCHES l.30).
- **R-2, séries privées sur un seul hôte** (`F:/PRODUITS/marche/series-2026-10-01`). Une G2 ailleurs aurait besoin de leurs
  octets : procurement par la release privée `monark-series-binance-15m-2026-10-01` (plan P2 l.10), contrôlé par les épingles.
- **R-3, collision avec SHORT-DIGEST-INVERSION-1** sur `tableRowProblems` (`spec-publish.mjs` l.289-298). Le second lot fusionné
  se reprend sur le premier ; chaque clause a son test.
- **R-4, dépendance à R-b.** Il n'y a pas de repli : `contract-1.1.0/` est publié, et un dossier publié n'admet aucun fichier
  neuf (`added_to_published`, `spec-publish.mjs` l.200). La partie 3 attend R-b.
- **R-5, erreur commune par le moteur porté.** Parade : la seconde écriture et le rejeu des tests (§2.3), déclarés dans le
  rapport.
- **R-6, crochet d'audit contourné par une extension C.** L'outil n'en a pas. Restent le test statique de 1d et la liste des
  entrées du rapport.
- **R-7, taille de la partie 1** : six lots. Si 1d ou 1e dépassent 1 205 lignes, ils se coupent par fichier.
- **R-8, calendrier.** Le 2026-10-20 (ETAT l.28) suppose les parties 1 et 2 avant la fusion de R-a et R-b, et la partie 3 juste
  après. Si R-b glisse, la vague 1 glisse avec lui (P-R4 du brouillon, l.197).

## 7. Questions (défaut entre parenthèses)

- **Q-1 (MONARK)** : comment R-25 traite l'import. (Trois lots à l'octet ; pas d'addendum D9. R-25 protège la revue du code, et
  l'outil est du code.)
- **Q-2 (MONARK, RECHERCHES)** : quelle révision écrire dans `source.generator`. (`kata/bench/write-p2.ts@1ea4f64738625d918b9e177e1657207c330a5261`,
  le banc selon PROVENANCE-wave1 l.8. `207f021f` est le moteur, déjà dans `engine`. L'identité ne change pas ; la valeur est
  fixée par la ligne datée d'E-2a. La question ne bloque pas la partie 2 : le rapport ne porte que l'identité.)
- **Q-3 (RECHERCHES)** : la porte lie-t-elle la révision du vérificateur au `commit` de l'entrée ? (Oui, clause 2 du §3.4 : c'est
  l'épingle des octets de Q-V1, précision 1, appliquée à la ligne. Une révision nouvelle de l'outil demande une entrée
  nouvelle.)
- **Q-4 (RECHERCHES)** : liste en ajout seul, et dossier porté jugé sur sa propre copie, incluse dans l'épingle. (Oui. Retirer
  un vérificateur passe par un ADR.)
- **Q-5 (RECHERCHES)** : le rapport est-il recopié dans chaque dossier daté qui porte des lignes qu'il atteste ? (Oui, mêmes
  octets, « dans le même dossier ».)
- **Q-6 (RECHERCHES)** : expliquer les écarts par une passe au `log` de V8 dans l'outil (M-10) ? (Oui. Elle ne touche aucune
  décision, et une seule commande rejoue l'explication. Variante moins chère : citer la mesure de la G2 de la partie 2.)
- **Q-7 (MONARK)** : la porte lit-elle le contenu du rapport (même vérificateur, même registre, case listée égale) ? (Oui,
  au-delà de la réponse Q-V2 (4), pour environ 10 lignes. Une table éditée à la main ne peut alors pas citer un rapport qui ne
  la couvre pas.)
- **Q-8 (MONARK)** : Python en CI ? (Non dans ce chantier : item VERIFIER-TOOL-CI-1.)
- **Q-9 (MONARK)** : `.py` dans la garde de langue, avec le renommage d'`aux` ? (Oui, au lot 1d.)

## 8. Items formés

- **VERIFIER-TOOL-CI-1**. Porteur : MONARK. Déclencheur : avant qu'une seconde révision de `monark-kata-recalc` n'entre dans la
  liste, ou avant le rapport de la vague 2. Objet : les auto-tests de l'outil en CI (vecteurs, seconde écriture, cas du
  comparateur, refus du crochet), sur un Python épinglé (action épinglée par SHA, R-8). Prix à chiffrer à son G0.
- **VERIFIER-GUARD-PINS-E2A-1** (tuyau). Porteur : MONARK, au titre d'E-2a. Déclencheur : le G0 d'E-2a. Objet :
  - le chargeur construit `GuardPins.verifiers` depuis `readVerifiers`, et `attestation` depuis le rapport (cases listées
    égales) ; test `served_guard_pins_carry_the_pinned_verifiers` ;
  - la première release datée réelle passe `plan()` avec la liste et le rapport réels.
- **VERIFIER-PUBLIC-REPLAY-1** (PAROXYSME). Porteur : MONARK. Déclencheur : avant tout texte public qui dirait le recalcul
  rejouable par un tiers. Limite : un tiers ne peut pas rejouer, car les séries sont privées (plan P2 l.10) et l'outil n'est pas
  exporté (§2.6). Recherche : lire sur place les conditions de la source des séries ; la ligne d'ADR qui exporterait l'outil ;
  le prix.
- **TRIAL-HEAD-WRITTEN-1** (PAROXYSME). Porteur : RECHERCHES, puis MONARK. Déclencheur : la prochaine version de FORMAT, ou le
  registre de la vague 2. Objet : écrire la construction de la chaîne des essais (§8 de R1), pour que `trialRegistryHead.hash` soit
  une décision comparée : fait côté outil par la voie 1 (§17, aucun champ hors des décisions) ; la publication reste à RECHERCHES.
- **RECALC-FIELDS-2** (ETAT l.1224) : soldé par le rapport de la partie 2, où les sept champs sont comparés ou nommés.
  L'orchestrateur écrit la ligne d'ETAT au G7.

## 9. Ce que je n'ai pas fait

- Aucune course de recalcul. Aucun contenu de série lu : empreintes, chemins et comptes viennent des rapports. De `wave1.json`,
  seules les clés de tête.
- Aucune modification de code, d'outil, de test ou de donnée ; ce G0 est le seul fichier écrit.
- Lectures et mesures sans écriture : `sha256sum`, `wc -l`, `git diff --no-index --shortstat`, `manifestText` et
  `contentProblems` par `node -e`, `scanFile` de la garde de langue, sondes du crochet d'audit par `python -B -c`, version de
  `ucrtbase.dll` par PowerShell.
- `node scripts/spec-policy-tables.mjs --check` a été tenté et refusé : `@monark/hikae` est introuvable, faute de
  `node_modules` dans ce worktree. Il montre seulement qu'un `.mjs` charge un `.ts`.
- Aucun `GIT_DIR` ni `GIT_WORK_TREE` (mesure `env` : 0), aucun `--write-tree`, aucun git qui écrit, aucun commit, aucun
  workflow, rien écrit sur C:.

## 10. Réponses de RECHERCHES (`516b862`, 2026-10-06) et ce qu'elles changent

Ligne datée (MONARK, 2026-10-06 22:1x UTC). Découpe accordée (parties 1, 2 et 3) ; G2 courte pour les lots 1a à 1c (égalité à
l'octet avec la livraison, provenance, aucune modification glissée), G2 complète pour 1d et 1e. Ce paragraphe prime sur les
paragraphes antérieurs qu'il contredit.

- **Q-3 : oui.** La porte lie la révision du vérificateur (après « @ ») au `commit` de son entrée ; le rapport porte le sha256 de
  l'arbre, comparé à l'entrée.
- **Q-4 : oui, précisé.** La liste ne change que par ajout. Retirer un vérificateur se fait par une entrée datée de révocation,
  jamais par une suppression. Un dossier daté est jugé sur sa propre copie, qui doit être un **préfixe** de la liste épinglée en
  vigueur (le test `a_carried_folder_keeps_its_list_while_the_pinned_list_extends_it` de la partie 3 vérifie le préfixe, et la
  révocation y a son cas).
- **Q-5 : oui.** Chaque dossier daté qui porte des lignes attestées porte une copie à l'octet du rapport ; un dossier se suffit.
- **Q-6 : pas de passe V8 dans l'outil.** M-10 est remplacée : l'outil liste chaque écart d'un ulp (case, champ, les deux valeurs
  en hexadécimal) et le classe en Python, de façon déterministe, en recalculant la valeur avec l'association de remplacement de
  KATA-SPEC l.42 et le `log` en cause. Bits du moteur retrouvés : « expliqué, classe ln/association ». Sinon : « non expliqué », et
  le rapport échoue. La mesure V8 de la G2 de P2b est citée comme preuve de la classe. `v8_log.mjs` et `libm_cross.py` sortent du
  lot 1e ; le classement entre dans `report.py` (M-11).
- **Q-2 : le défaut, sous condition.** La révision écrite dans `source.generator` est celle qui a vraiment écrit `wave1.json`. Le
  défaut `1ea4f647…` (le banc) tient s'il est prouvé que le générateur relancé à cette révision redonne `811fcd57…` à l'octet ;
  sinon, la révision qui le redonne. Preuve due avant la ligne datée d'E-2a ; elle n'entre pas dans la partie 1.
- **TRIAL-HEAD-WRITTEN-1** : RECHERCHES demande à MONARK un brouillon de quelques lignes pour KATA-SPEC, tiré du code du
  générateur ; RECHERCHES en fait la G2. `trialRegistryHead.hash` reste hors décision dans le rapport de la vague 1, à condition que
  le rapport cite l'item.

## 11. Lot 1a : mesures

Worker `claude-opus-5-5` (effort max), le 2026-10-06, horloge lue de 22:10 à 22:3x UTC. Worktree `F:/Monark-wt-verifiers`, tête
`e8800192` ; rien n'est committé ni indexé dans le worktree (R-20). Journaux et script de recensement (`census.mjs`, sha256
`f0a4eeab…`) sous `F:/tmp/verifiers-1a/`.

| Fichier versé (`cp` depuis la livraison) | Lignes | Octets | sha256 (`DELIVERED.sha256`) | Blob git |
|---|---|---|---|---|
| `tools/kata-recalc/kata_lib.py` | 439 | 15 106 | `11656b35…` (l.61) | `23bb9688…` |
| `tools/kata-recalc/binom_exact.py` | 353 | 11 965 | `c83d971a…` (l.58) | `23e4d8be…` |
| `tools/kata-recalc/vectors_check.py` | 197 | 10 574 | `d96f4fab…` (l.63) | `1a29468a…` |

- **Égalité à l'octet** : `sha256sum -c --strict` des lignes 58, 61 et 63, réécrites vers le worktree : 3 OK ; `cmp` : 3 identiques.
  Chaque fichier : ASCII seul, 0 TAB, 0 CR, sans BOM, 0 U+2028 ou U+2029, LF final, ligne la plus longue de 144 octets ; 0 hit des
  six classes de `byte_guard`, 0 hit de `scanText` (garde de langue), 0 hit des motifs globaux de `grep-forbidden.mjs` (les trois
  fichiers en cibles). Aucun octet ne fait refuser un fichier. Dans un clone isolé (`git clone --no-local`, sans `alternates`,
  `F:/tmp/verifiers-1a/clone`, détaché à `e8800192`, `git add` dans ce clone seul) : chaque objet de l'index égale
  `git hash-object --no-filters` du fichier livré, `git cat-file blob | sha256sum` redonne les trois digests, `--eol` : `i/lf w/lf`.
- **Épingle du lot** : `72b1c80c6a1e6b18d05abdc8d6589c8245efae8ff8cf051ea96ab9c60e6860b5`, mesurée deux fois : boucle `sha256sum`
  (règle du §3.2) et `manifestText` (`spec-publish.mjs` l.167, par `node -e`).
- **`test/byte-guard.test.ts`** : `.py` ajouté à `TEXT_EXT` (l.38) et à `PIN_EXT` (l.127), commentaire l.36 ; trois lignes changées.
  Aucun `.py` n'est suivi à la base. Sur le clone : un TAB posé l.10 de `vectors_check.py` rougit `byte_guard_tracked_tree_is_clean`
  (`tools/kata-recalc/vectors_check.py:10:TAB`). Mutant à la main, `.py` retiré de `TEXT_EXT` : seul
  `byte_guard_tab_licit_types_are_closed` rougit, à la l.181 (`t/x.py` manque). Fichiers restaurés, `sha256sum -c` 6 sur 6.
- **`test/kata-recalc.test.ts`** (49 lignes) : tueur l.39, `tools/kata-recalc/kata_lib.py:265 CONST "_EWMA_W[nret - j] * (r * r)" ->
  "(_EWMA_W[nret - j] * r) * r"` (une seule occurrence, l.265 de la copie). Index lu par `git ls-files -s -z` sans variable `GIT_*`
  (`gitOut`, `test/helpers/git-tracked.ts`) : modes `100644` et étape 0 (l.42) ; blobs par `git --no-replace-objects cat-file blob` ;
  empreinte par `manifestText` égale à l'épingle (l.46).
  - **Ajout déclaré, l.47** : l'arbre de travail porte les blobs de l'index. Motif : `fire()` de `scripts/red-proof.mjs` (l.200-208)
    change le fichier de l'arbre de travail, jamais l'index. Tueur posé sur le clone sans `git add` : l.46 passe, l.47 rougit
    (`[ 'kata_lib.py' ]`) ; sans l.47, le tueur serait mort-né. Tueur indexé : l.46 rougit (`44e70a50…`). Mode `100755` : l.42 rougit.
  - Base `d8fe354c` (second clone, test copié) : rouge par assertion (`ERR_ASSERTION`, l.46, `e3b0c442…`, le texte vide).
- **Hors de la liste du §5, déclaré** : `scripts/spec-publish.d.mts`, une ligne, `export function manifestText(...)`. Sans elle,
  `tsc --noEmit` sort 2 (`TS2305`, mesuré). Surface de types seule : Node ne lit pas ce fichier, et il n'est pas exporté.
- **Courses** (`node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit test/byte-guard.test.ts
  test/kata-recalc.test.ts`) : clone indexé, 17 sur 17, sortie 0 ; worktree, 16 sur 17, sortie 1, seul le test d'arbre rougit
  (`e3b0c442…` : l'outil n'y est pas indexé ; il verdit au commit). Worktree : `tsc --noEmit` 0 ; `eslint` des deux tests 0 ;
  `lint-ratchet` 69/69 ; `grep-forbidden` 0 (346 fichiers) ; `lang-gate` 0 ; `export-public --check` 0. `collectFiles` garde
  573 chemins, aucun sous `tools/`, aucun `.py` : l'outil n'est pas exporté.
- **red-proof** (`--base d8fe354c --gel F:/Monark-wt-verifiers --draw 1 --seed 37 --out F:/tmp/dojo/redproof-verifiers-1a`) :
  sortie 1, `not green at gel (assert-fail)`, 1 jugé, 16 inchangés, 0 tueur tiré ; `killerProblem` nul. Un gel d'arbre de travail
  copie les fichiers sans les indexer ; un test qui lit l'index demande un gel commité. Étape arrêtée sans commit (R-20) : à
  rejouer par l'orchestrateur avec `--gel <commit du lot>`.
- **R-25** : `git diff --shortstat d8fe354c -- . ':(exclude,glob)docs/**/*.md'` donne 2 fichiers, 4 insertions, 3 suppressions ;
  non suivis 49 + 353 + 439 + 197 = 1 038 ; total **1 045** (estimé ~1 050 ; borne 1 205). Sur le clone indexé, avec les 21 jetons
  de la ligne `STAT=` (`ci.yml` l.100) : 6 fichiers, 1 042 insertions, 3 suppressions, 1 045.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; `git add` et `update-index` dans le seul clone ; dans le
  worktree, lectures (un `git status` a pu rafraîchir le cache de l'index, sans objet ni référence). Rien sur C:.

## 12. Lot 1b : mesures (MONARK, 2026-10-06 23:0x UTC)

- `tools/kata-recalc/binom_check.py` : copie à l'octet de la livraison, sha256 `036a5f5f34abe8d7e44bb58c20907eb8ae970523a2f11ae097f9e84098487f2e`
  (`DELIVERED.sha256` l.57), `cmp` identique ; 1 014 lignes, ASCII, 0 TAB, 0 CR, sans BOM, LF final, ligne la plus longue 135 octets.
- Épingle du test d'arbre déplacée sur les quatre fichiers de l'index : `23cf6c82c661d94adf5d185db939334ae6836fc6ddc208e7dfcdc3595eee0d4b`
  (manifeste par `manifestText`, blobs lus par `git cat-file`).
- L épingle passe dans le corps du test : `scripts/red-proof.mjs` ne juge un test que sur une ligne changée dans son corps, et le premier
  essai de red-proof sur 1b, épingle hors du corps, a été refusé (« 0 judged, 1 unchanged »).
- `test/kata-recalc.test.ts` et `test/byte-guard.test.ts` : 17/17. `grep-forbidden`, `lang-gate` et `export-public --check` : OK.

## 13. Lot 1c : mesures (MONARK, 2026-10-06 23:1x UTC)

- `tools/kata-recalc/recalc_p2.py` (451 lignes, `7a7ee0e5…`, `DELIVERED.sha256` l.62), `compare_p2.py` (226 lignes, `6f00b36c…`, l.60),
  `compare_check.py` (111 lignes, `635e0f5b…`, l.59) : copies à l'octet, `cmp` identiques ; ASCII, 0 TAB, 0 CR, sans BOM, LF final,
  ligne la plus longue 159 octets.
- L'épingle du test d'arbre couvre les sept fichiers : `bca9ee5251a43126fe3e052eee1974a91d6352811caa24077889c4c4e60a5231`, égale à
  l'empreinte de l'arbre livré mesurée au §2.3. Les lots 1d et 1e se lisent en diff contre cet arbre.

## 14. Lot 1d : mesures

Worker `claude-opus-5-5` (effort max), horloge lue de 2026-10-06 23:16 à 2026-10-07 01:4x UTC (tampons de `now.mjs` : 00:25 et 01:10 aux
départs des deux reprises, 01:4x à la fin). Worktree `F:/Monark-wt-verifiers-1d` : tête `63367732` pour M-1 à M-9, puis `ad2a45b6`, le
lot committé par MONARK, pour la reprise de la G2 de RECHERCHES ; le worker ne committe ni n'indexe rien (R-20). Sorties sous
`F:/tmp/verifiers-1d/` : `final3/` est la passe sur l'arbre gelé après la G2 ; elle redonne à l'octet les sorties d'oracle de `final2/`,
sauf la ligne 2 de `registry-binom-check.txt`, qui écrit le chemin passé par `os.path.abspath` (séparateurs `\`) ; `b1/` porte la mesure
des événements ; `events/`, `probe/` et `smoke/` portent les sondes.

| M | Diff (lignes du nouvel arbre) | Source |
|---|---|---|
| M-1 | `kata_lib.py` l.265 : `(_EWMA_W[nret - j] * r) * r` ; l.1 amendée sur place | KATA-SPEC l.42 ; C-1, IT-G2-1 |
| M-2 | `vectors_check.py` : section `ewma_association` au bit (`float.hex`), l.95-113 ; les deux longueurs de table comptées (l.136) ; `SPEC_CHECKS = 333` (l.15) exigé (l.215) ; l.68 → l.71 (l.3, l.19, l.34) | KATA-SPEC l.5, l.70-71 ; message du 2026-10-02 l.22 (317 = 315 + 2) |
| M-3 | `recalc_p2.py` : `PLAN`, `ENGINE`, `TRIALS` (l.25-31), `check1`, `check2`, `reason` (l.262-280), `trialId` (l.327), tête `{length, hash: null}` avec 80 essais exigés (l.461-467) ; invariant `reason` et statut (l.375-376) | FORMAT l.9, l.43-48 ; plan l.5, l.112 ; `87b57c01…` |
| M-4 | `recalc_p2.py` l.308 et `binom_check.py` l.966 : `"1"` | FORMAT l.49 ; N-4 |
| M-5 | `recalc_p2.py` l.301-302 : `months = {}` sans kTest ; invariant adapté (l.371-374) | FORMAT l.49 ; N-5 |
| M-6 | `recalc_p2.py <séries> <oracles> <sortie>` ; `binom_check.py <dépôt> …` ; `compare_check.py <registre> <travail> <sortie>` ; 0 chemin de lecteur | N-1, N-2, IT-G2-3 |
| M-7 | `io_guard.py` (neuf, 326 lignes), premier import des cinq scripts d'entrée ; changements de fichiers jugés (l.30-38, l.191-220) et sorties neuves (l.264-273) depuis la décision du 2026-10-07 ; table fermée des événements (l.44-105) et chemins absolus (l.145-148) depuis la G2 de RECHERCHES | §3.1 ; Q-V1, précision 2 ; décision de MONARK du 2026-10-07 ; G2 de RECHERCHES `3719b88` |
| M-8 | `compare_p2.py` : classes `DECISION`, `VALUE` (hex, ulps, « beyond 1e-12 »), `DIGEST`, `OUTSIDE` ; `compare_check.py` : 32 cas, sans la liste D-6 (le `--ignore` de `compare_p2.py` était déjà vide par défaut à la livraison, l.208) | §3.3 ; Q-V3 ; A-2 l.97 ; N-6 |
| M-9 | `aux` → `aux_seq` (8 sites de `recalc_p2.py`) ; `lang-gate.mjs` l.107 : `".py"` | §2.6 |

- **Oracles** (`python -B`, hors ligne ; `final3/`) : vecteurs `06ecf069…` : 333 contrôles de conformité, 0 échec, `ewma_association` 4
  sur 4 au bit, valeurs de kata identiques au bit 86 sur 86 (84 avant M-1) ; mutant (l.265 remis à l'ancien ordre, copie sous `F:/tmp`) :
  2 échecs, RED. Seconde écriture : 16 821 contrôles, 0 échec, sortie identique à l'octet à celle de P2b (`63606d4f…`). Tests de hikae :
  24 tests, 207 756 assertions, 0 échec, 4 non rejouables ; seule différence avec P2b, la ligne d'entrée. `--registry` sur le registre
  scellé de P2b (`7eb07d4d…`, forme ancienne : sept champs nuls, aucun kTest = nTest) : 1 680 contrôles, 0 échec. Cas du comparateur, sur
  ce même registre : 32 cas, 0 échec. Vecteurs du 2026-10-01 (`0795d70e…`) : RED, 317 contrôles comptés pour 333, sortie 1.
- **Garde d'entrée** (état après la décision du 2026-10-07) :
  - jugés : `open`, `os.listdir`, `os.scandir`, `subprocess.Popen`, et les changements de fichiers que Python 3.14.5 lève sur cet hôte,
    noms et ordre des arguments mesurés (`events/events_probe.py`, `052d6efe…`) : `os.mkdir`, `os.rename` (aussi `os.replace`),
    `os.link`, `os.symlink`, `os.remove`, `os.rmdir`, `os.truncate`, `os.chmod`, `os.utime`, `shutil.copyfile`, `copymode`, `copystat`,
    `copytree`, `rmtree`, `move` et `_winapi.CopyFile2` ; `file.truncate()` ne lève qu'un `open` en `r+`, jugé comme une écriture ;
  - un changement n'est admis que si chaque chemin touché est sous une sortie ; une source (déplacée, liée ou copiée) est en plus un
    fichier que la course a écrit ou un dossier qu'elle a fait (N-1 : la clause « entrée lue » était morte) ; `os.mkdir` fait aussi les
    dossiers qui mènent à une sortie (`os.makedirs` d'une sortie neuve) ; un descripteur ou un `dir_fd` est refusé ;
  - une sortie est absente, ou un dossier vide, quand elle est déclarée. Règle ajoutée en fermant le point 2 : sans elle, une ouverture
    en écriture d'un fichier déjà présent, ratée ou sans troncature, rendait lisibles sans note des octets que la course n'a pas écrits.
    Une relance écrit donc dans des chemins neufs ;
  - un nom entre chevrons n'est admis en lecture que si aucun fichier ne le porte (`os.path.lexists`, qui ne lève aucun événement :
    mesuré). Windows refuse de créer `<x>` : Errno 22 par chemin simple, par `\\?\` et par `os.open` (mesuré). La sonde P19 fait donc dire
    à `lexists` que `<x>` existe : la lecture tombe sous les règles communes et elle est refusée ;
  - une erreur pendant le jugement arrête la course (P39 : un événement levé à la main avec un chemin illisible) ; un chemin à octet nul
    est refusé par Python avant tout événement (P37 : mesuré) ;
  - 37 sondes à cette étape (P1 à P39), 57 après la G2 (`probe/guard_probes.py`, `c681aedc…`, plus bas), toutes à 0 échec. Passent : P24
    (`os.makedirs` d'une sortie neuve sous un parent absent, écriture, relecture, renommage, copie `CopyFile2`, suppression, `chmod` et
    `utime` dans la sortie ; sans `rmtree` depuis la G2), P33 (dossier vide), P36 (lien dur dans la sortie). Refusés : `os.mkdir`,
    renommage, `CopyFile2`, `os.link`, `os.remove`, `os.chmod`, `os.utime`, `os.truncate` et `rmtree` hors des sorties ; le renommage
    d'une entrée vers une sortie ; un lien symbolique vers un fichier non lu ; la copie d'une entrée lue, hors des sorties ; une sortie
    qui tient déjà un fichier. Les fichiers témoins sont intacts après les sondes ;
  - sans `-B`, la course s'arrête à sa première écriture de bytecode après le crochet, depuis la G2 sur `marshal.dumps`, refusé avant
    toute ouverture (mesuré) ; une exception non rattrapée d'un script de l'outil garde sa trace, dont les lignes sont lues dans l'arbre
    de l'outil (mesuré ; un script hors de l'arbre est refusé à la lecture de sa source, comme toute lecture non listée) ; une relance
    dans une sortie existante est refusée, sortie 4 (mesuré).
- **Fumée de `calibrate_cell`** sur bougies de synthèse (`smoke/smoke_calibrate.py`, `12a14a54…`, aucune série) : les sept chaînes de
  FORMAT l.48, `UTest` `"1"`, `months` `{}`, 80 `trialId` sur les 280 cellules ; invariants verts.
- **Épingle d'arbre** : `ff72522e3abe1b7b311854ef807b25b69f6653fbec3b510be85dfba0fdeda1ac`, mesurée par la boucle `sha256sum`, par
  `manifestText` et sur l'index d'un clone `--shared` à `ad2a45b6` où le delta est indexé (`git add` dans le clone seul).
- **Node** : clone indexé (`ad2a45b6` et le delta), `kata-recalc` et `byte-guard` 19 sur 19 ; le fichier de test copié à `ad2a45b6` : le
  test d'arbre rouge par assertion (son épingle change), les deux autres verts ; à `63367732` : les trois rouges par assertion ; tueurs
  tirés à la main sur le clone, chacun rougit son test (`ERR_ASSERTION`), fichiers restaurés. Worktree : fichiers de test de la garde de
  langue 109 sur 110 (seul rouge, le test d'arbre, qui lit l'index) ; `tsc` 0 ; `eslint` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0
  (354 fichiers, les huit `.py` en cibles) ; `lang-gate` 0 ; `export-public --check` 0.
- **R-25**, forme de la CI sur l'index du clone, tout le lot contre `63367732` : 9 fichiers, 696 insertions, 175 suppressions, soit 871
  (estimé ~450 ; borne 1 205) ; le delta de la G2 sur `ad2a45b6` : 7 fichiers, 129 insertions, 47 suppressions. L'excédent :
  `io_guard.py` (326), `compare_check.py` (98/63, les cas réécrits pour les classes de M-8) et `compare_p2.py` (92/39).
- **Écarts au G0** : `trialRegistryHead.hash` reste nommé hors décision (TRIAL-HEAD-WRITTEN-1 non versé) ; ordre de `reason` quand
  check1 rejette et check2 est vide : la liste de FORMAT l.48 (rejet d'abord), non exercé en vague 1 ; `length` compté sur les
  `trialId` (80 exigés) ; codes de sortie du comparateur gardés (0, 1, 2) ; la garde juge aussi `os.scandir` et les changements de
  fichiers, classe tout événement dans une table fermée (refus par défaut), exige des sorties neuves et des chemins absolus ; pas de
  refus explicite sans `-B` (le mot `dont` de l'attribut ferait rougir la garde de langue) ; le test de langue passe par
  `collectTextFiles`, qui applique `scannable` (pas de déclaration de type ajoutée) ; mode recensement du comparateur et recalcul non
  joués (séries : partie 2).
- **Décision de MONARK (2026-10-07)** : la ligne `OUTSIDE` du comparateur garde le nom de l'item TRIAL-HEAD-WRITTEN-1. La sortie de
  `compare_p2.py` est un fichier de course interne, jamais publié, et les `.py` ne sont pas exportés. Le rapport publié du lot 1e dira la
  raison en mots, sans le nom de l'item (règle de contenu du §3.3) ; la citation de l'item vit dans ce G0 et dans les pièces de G2. MONARK
  demande à RECHERCHES d'agréer cette forme de la condition du §10. Deux règles de la garde, ajoutées par le worker en fermant le
  point 2, sont gardées : les sorties neuves et l'arrêt sur une erreur de jugement. La lecture littérale de la sonde P35 est aussi
  gardée : une entrée notée qui vit hors des sorties n'y est jamais copiée, car l'outil n'en a pas besoin.
- **IO-GUARD-NATIVE-READS-1** (PAROXYSME). Porteur : MONARK. Déclencheur : avant que la course de la partie 2 ne lise une série. Limite :
  un module d'extension C qui lit un fichier sans passer par Python ne lève aucun événement d'audit, et la garde ne le voit pas (§3.1,
  R-6). Construction qui donnerait la garantie : par exemple une liste, tenue par le système, des fichiers que le processus a ouverts,
  comparée à la liste des entrées ; ou une course où seules les entrées déclarées sont visibles du processus. Prix à mesurer par la
  recherche. Aucun contournement.
- **REPORT-TRIAL-HEAD-SENTENCE-1** (condition de RECHERCHES, `1a6cc2d`, en agréant la forme ci-dessus). Porteur : MONARK.
  Déclencheur : le lot qui publie la révision datée de KATA-SPEC portant la section 8 (TRIAL-HEAD-WRITTEN-1). Objet : ce lot retire
  du rapport publié la phrase qui met `trialRegistryHead.hash` hors décision, et fait entrer ce champ dans les décisions comparées ;
  sinon la phrase resterait dans le texte après être devenue fausse. Fermeture : le rapport de ce lot ne porte plus la phrase, et
  `compare_p2.py` compare le champ en classe `DECISION`.
- **Pour le lot 1e** : `import ctypes` est refusé sur cet hôte (il charge `kernel32`) ; la version de la bibliothèque C du rôle `libm`
  devra se lire dans les octets du fichier (`io_guard.read("libm", …)`), ou le lot 1e admettra `ctypes.dlopen` sous ce rôle.
  `platform.platform()` lève `socket.gethostname` (refusé) et `_wmi.exec_query` (hors de la table, donc refusé) : le lot 1e les classera
  dans `EVENTS`, mesures à l'appui. La sortie de `report.py` sera un dossier neuf (règle des sorties neuves).
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (seul `GIT_EDITOR`, posé par le harnais), aucun `--write-tree` ; `git add` et
  `checkout` dans les clones de `F:/tmp` seulement. Rien sur C:.

### G2 de RECHERCHES (3719b88) : B-1, B-2, N-1 à N-3

- **Source** : `coordination/messages/2026-10-07-RECHERCHES-vers-MONARK-G2-214-lot-1d.md` (`004e4afc…`), lu en entier ; leurs sondes
  tournaient sous Python 3.11.15, rejouées ici sous 3.14.5. Faits de MONARK :
  `F:/tmp/verifiers-1d/faits/FAITS-audit-events-3-14-2026-10-07.md` (`5b1b4877…`), les 192 noms de la table des événements d'audit de
  3.14, lue sur docs.python.org à 01:09 UTC.
- **B-1, refus par défaut** : `EVENTS` (`io_guard.py` l.44-105) classe 194 noms, les 192 de la table (`b1/documented-192.txt`,
  `2489be60…`) et 2 que cet hôte lève hors d'elle (`_thread.start_joinable_thread`, `_winapi.CopyFile2`) : 20 jugés, 12 admis avec leur
  raison, 9 admis seulement pendant que io_guard lance git ou un script de l'outil, 153 refusés ; un nom hors de la table arrête la
  course, quel que soit son préfixe. Provenance : un crochet de journal posé avant la garde (`b1/evlog/sitecustomize.py`, `bc946cae…`),
  sur 13 courses des scripts dans tous leurs modes, les deux fumées et les sondes (`b1/measure.sh`, `959ab06a…`) : 29 noms levés après
  le crochet (`b1/measured-after.txt`, `72e79669…`, courses et sondes), dont 19 dans les courses de l'outil ; sous la garde neuve, 18
  (`b1/measured-after-new-guard.txt`, `66853942…` : `msvcrt.get_osfhandle` est parti avec `DEVNULL`), chacun jugé, admis, ou levé
  pendant un lancement. `recalc_p2.py` court jusqu'à sa première lecture de série, sur un dossier de séries vide (aucune série lue) ;
  son calcul et ses écritures sont couverts par les deux fumées (`b1/smoke_writes.py`, `06d47b1f…`). `sys._getframe` et
  `cpython._PySys_ClearAuditHooks` sont admis sur décision de MONARK, sans avoir été vus. Sondes P40 à P50, chacune en sortie 4 :
  `socket.__new__` ; `sendto` sans `connect`, le socket créé avant la garde ; `sqlite3.connect` sur un fichier ; `os.setxattr` levé à la
  main (absent de `os` sous Windows : mesuré) ; un nom inconnu `x.y` ; `os.walk`, donc `shutil.rmtree` même dans une sortie ;
  `tempfile` ; `glob` ; un fil hors d'un lancement ; `os.chdir` ; `os.putenv`.
- **B-2, option (a)** : tout chemin jugé est absolu (`_absolute`, l.145-148 : `open`, `os.listdir`, `os.scandir`, changements,
  `output()`) ; chaque script d'entrée passe ses arguments de chemin par `os.path.abspath`. Mesuré : après le crochet, l'interpréteur
  n'ouvrait qu'un chemin relatif dans les courses de l'outil, `nul` (`os.devnull`), par `subprocess.DEVNULL` dans les 33 lancements de
  io_guard ; supprimé par construction (`input=b""`, un tube d'entrée vide), sans exception ajoutée. Imports, traces et `sys.path` :
  aucun chemin relatif. Leur cas `dir_fd` tel qu'écrit, depuis un dossier courant imbriqué : sur cet hôte, `os.open` d'un dossier lève
  `PermissionError` et `dir_fd` lève `NotImplementedError` (mesuré) ; P55 sort en 1, rien n'est lu. L'événement que leur appel lève sous
  POSIX, levé à la main (P56), et `os.open` du même chemin relatif (P57) sortent en 4 ; P51 à P54 (lecture, `listdir`, sortie, `mkdir`
  relatifs) aussi.
- **N-1** : la clause `p in _reads` et `_reads` sont retirées ; une source est un fichier que la course a écrit ou un dossier qu'elle a
  fait ; l'en-tête est corrigé.
- **N-2** : le drapeau de jugement est propre à chaque fil (`threading.local`, l.130). P58 : un fil créé avant la garde est retenu dans
  un jugement pendant que le fil principal lit un fichier non listé : sortie 4 ; la même sonde contre la garde de `ad2a45b6` lit le
  fichier (`BYPASS`, sortie 0).
- **KATA-SPEC-REASON-ORDER-1** (N-3). Porteur : MONARK. Déclencheur : le lot qui publie la révision datée de KATA-SPEC portant la
  section 8. Fermeture : le texte fixe l'ordre, celui des deux générateurs (décision de RECHERCHES, `f51322c`) : une suite auxiliaire
  constante est nommée avant un rejet, quel que soit le contrôle 1 ; un cas de vecteur le porte. Corrigé en place le 2026-10-07 : ce
  point disait « un rejet nommé avant un contrôle 2 vide », l'ordre de la garde et du vérificateur d'alors, qu'aucun générateur ne
  suit (§16).
- **Mesures** : 57 sondes, 0 échec (`probe/guard_probes.py`, `c681aedc…` : les 37 d'avant, dont P24 sans `rmtree`, les 19 neuves, et
  P58 contre la garde de `ad2a45b6`) ; oracles, comparateur et fumées dans `final3/` ; épingle, Node et R-25 : plus haut.

## 15. Lot 1e : mesures

Worker `claude-opus-5-5` (effort max), horloge lue de 2026-10-07 02:06 à 03:2x UTC (tampons de `now.mjs` : 02:06 au départ, 02:56, 03:12,
03:20 à la fin), puis de 03:23 à 03:2x UTC pour la correction de licence et les décisions de MONARK (tampons 03:23, 03:27, 03:28).
Worktree `F:/Monark-wt-verifiers-1e`, tête `2a46eeb8` (lots 1a à 1d fusionnés) ; le worker ne committe ni n'indexe rien dans le worktree
(R-20). Sorties sous `F:/tmp/verifiers-1e/` : `port/` et `vectors/` (mesures du `log`), `platform/` (sondes), `selftest/` (auto-tests),
`e2e/` (composition jusqu'au recalcul), `final/` (oracles, Node, gardes), `cache-probe/`, `clone/` et `base-clone/` (clones `--shared`).

| M | Diff (lignes du nouvel arbre) | Source |
|---|---|---|
| M-11 | `report.py` (neuf, 453 lignes) : textes fixes `TEXTS` (l.42-55), écriture canonique (l.66-84), plateforme (l.88-116), empreinte du `log` (l.119-124), identité de l'outil (l.127-158), enfants (l.163-209), passes (l.213-299), classes (l.303-339), rapport (l.342-365), course (l.373-425) | §3.3 ; Q-6 du §10 ; RAPPORT l.62-63, l.107-114 |
| Q-6 | `fdlibm_log.py` (neuf, 207 lignes) : avis de fdlibm et de V8, licence de V8 en entier (l.10-50), `log` porté (l.77-128), entrées de la mesure (l.133-174), sorties de Node épinglées (l.177-191), contrôle (l.194-207) | `ieee754.cc` l.1638-1717 ; `LICENSE.v8` (ci-dessous) |
| M-11 | `report_check.py` (neuf, 217 lignes) : auto-tests, 39 contrôles | §5, partie 1 |
| M-7 | `io_guard.py` : `_wmi.exec_query` classé refusé (l.93) ; `_git` et `git_tree` (l.308-334) ; un cache de bytecode arrête la course à l'import (l.351-352) ; en-tête l.1-5, l.20-22, l.43-47 | sondes ci-dessous |
| M-11 | `recalc_p2.py` : `freezes` (l.206-211) et `registry_text` (l.214-217) partagés avec `report.py`, `seqs` de `calibrate_cell` (l.220, l.256-257), lignes d'entrée imprimées (l.495) ; en-tête l.1-2 | lecture interdite d'un fichier écrit par un autre processus (`io_guard.py` l.172-178) |
| tests | `test/kata-recalc.test.ts` : épingle (l.46), tueur l.73 déplacé en `recalc_p2.py:12`, deux scripts d'entrée de plus (l.78-79), test neuf `kata_recalc_report_texts_pass_the_spec_gate` (l.85-115) | §5 |

- **Le `log` du générateur, porté** (Q-6 : « le `log` en question » ; mission : le portage seulement si les sources lues sur place le fixent).
  - Sources lues par le worker entre 02:06 et 02:16 UTC (`curl` en mémoire sur `raw.githubusercontent.com/nodejs/node/v24.21.0/deps/v8/src/`,
    rien écrit), sha256 :
    - `base/ieee754.cc` `1bf99980…` : 3 036 lignes ; `double log(double x)` l.1638-1717, macros de mots l.54-95, avis de fdlibm l.3-10 ;
    - `base/ieee754.h` `d04cd7f7…` : l.65 ; `V8_USE_LIBM_TRIG_FUNCTIONS` ne vise que sin et cos (l.10, l.40-57) ;
    - `builtins/math.tq` `a877efef…` (l.302-309), `compiler/code-assembler.h` `ad67e4bc…` (l.312) ;
    - `compiler/backend/instruction-selector.cc` `2cc910e2…` (l.1649-1650), `compiler/backend/x64/code-generator-x64.cc` `8bfa2d74…`
      (l.1073-1077, l.1930-1931), `codegen/external-reference.cc` `5e348eeb…` (l.1210-1211) ;
    - `compiler/machine-operator-reducer.cc` `a5d69439…` (l.803-806), `compiler/turboshaft/machine-optimization-reducer.h` `f9f35c29…`
      (l.479), `maglev/maglev-ir.h` `3b7a83fc…` (l.3421), `maglev/maglev-ir.cc` `ce66e2bf…` (l.502-510).

    Tous les étages de `Math.log` appellent `base::ieee754::log`.
  - Les onze fichiers ont les mêmes octets dans Node v24.15.0 (relus à 03:12 UTC, onze sha256 égaux). C'est le Node de la mesure de la
    G2 de P2b (RAPPORT l.7) : le `log` porté est celui de cette mesure. `PROVENANCE-wave1.md` ne nomme pas le Node qui a écrit
    `wave1.json` ; KATA-SPEC l.74 nomme v24.21.0 pour le code de référence.
  - Le portage reprend chaque opération dans l'ordre du C (binary64, arrondi au plus près, sans FMA). Ses dix constantes sont égales à
    leurs commentaires hexadécimaux. `log(-1)` rend les bits que Node rend sur cet hôte (`7ff0000000000001`, mesuré par `node -e`).
  - Vecteurs : 2 122 614 entrées positives et finies, d'un générateur écrit dans le fichier (splitmix64, jamais le module `random`),
    `in.bin` `41a801ce…` ; sorties de `Math.log` de Node v24.21.0 (V8 `13.6.233.17-node.53`), `out.bin` `aee206b3…`
    (`F:/tmp/verifiers-1e/vectors/`, 02:35 UTC ; scripts `write_inputs.py` `54a33d5b…`, `node_log.mjs` `ca3fccba…`,
    `compare_outputs.py` `ec5a1e95…`). Le portage les redonne au bit, 0 écart.
  - Le `log` de Python en diffère d'un ulp sur 5 780 entrées, dont douze épinglées (`PINNED`), avec dix cas limites (`SPECIALS`).
    Première mesure, sur 3 322 499 entrées tirées par `random` : 0 écart du portage, 6 756 du `log` de Python (`port/`, 02:16 UTC).
    `held_to_vectors` rejoue tout en 6 à 9 s, dans chaque course.
  - Le `log` de Python est celui de `C:\WINDOWS\System32\ucrtbase.dll` : chemin du module chargé, et 0 écart sur 3 322 493 entrées
    contre son export `log`, par `ctypes`, hors de l'outil (`port/ucrt_cmp.py`), car `import ctypes` est refusé dans l'outil (§14).
  - Licence, correction demandée par MONARK le 2026-10-07 à 03:2x UTC, d'après son fichier de faits. `ieee754.cc` est sous la licence
    BSD à trois clauses de V8, dont une redistribution du source garde la notice, les conditions et l'avertissement. L'en-tête de
    `fdlibm_log.py` (l.10-50) garde donc, à l'octet après le préfixe de commentaire :
    - l'avis de fdlibm, `ieee754.cc` l.3-10 ;
    - l'avis de V8, l.12-14 : « modified significantly by Google Inc. » et « Copyright 2016 the V8 project authors. All rights
      reserved. » ;
    - le texte entier de `deps/v8/LICENSE.v8` de Node v24.21.0, lu sur place à 03:2x UTC : 26 lignes, 1 527 octets, sha256
      `4af93c12062c58058378de2397dc1c92bbff9ddfb1d583a01c84127557ce97ca`.

    Mesuré : en retirant le préfixe, les deux textes redonnent leurs sources à l'octet (`cmp`, `licence/`). ASCII, sans TAB : `scanText`
    de la garde de langue rend 0, `grep-forbidden` 0, `byte-guard` vert. Le fichier de faits numérote l'avis de V8 l.12-13 sur 3 037
    lignes. `nl -ba` sur le fichier brut (3 036 lignes, LF final, même sha256) place « modified significantly » en l.13 et la ligne de
    copyright en l.14 : un écart de numérotation du visualiseur, pas de texte.
- **Les classes** (Q-6), `report.py` l.213-339.
  - Trois passes du pipeline de `recalc_p2.py` dans le processus de `report.py`, sur les séries qu'il lit sous le rôle `series` :
    - la base, qui doit redonner les octets du registre du recalcul (le sha256 imprimé par l'enfant), sinon la course s'arrête ;
    - `ln` : le `log` porté, mémorisé, à la place de `math.log` dans tout `kata_lib` ;
    - `association` : ce même `log` avec l'autre ordre du terme EWMA, `w_i * (r_i * r_i)`. Depuis M-1, la base suit déjà l'ordre de l.42.
      Le générateur tourne son propre `log` : l'ordre seul ne peut donc pas être sa cause.
  - Les registres des deux variantes sont écrits sous `passes/`, puis comparés à B par `compare_p2.py`, comme le recalcul.
  - Une différence de valeur ou d'empreinte entre le recalcul et B est « explained, ln » si la comparaison de la passe `ln` avec B ne la
    liste plus ; sinon « explained, association » si celle de la passe `association` ne la liste plus ; sinon « not explained ».
  - Une passe n'explique que si elle est égale à B dans chaque décision, sans faute de structure. Une cause qui demanderait autre chose
    que ces deux passes reste « not explained », et le rapport échoue.
  - Refus (sortie 1, pas de rapport) : une décision qui diffère, en case ou en tête ; une valeur au-delà de 1e-12 relatif (KATA-SPEC
    l.71), même expliquée ; une différence non expliquée. Une faute de structure sort en 2.
  - Pour une empreinte, le rapport donne l'indice du premier terme où la suite du recalcul diffère de la passe qui l'explique (celle dont
    l'empreinte est celle de B), le nombre de termes et l'écart maximal en ulps. Pour une valeur : les deux doubles en hexadécimal et les ulps.
  - Le recensement du `log` (entrées distinctes, entrées qui diffèrent, écart maximal) compte aussi les entrées de `tsmom`. Il ne se lit
    donc pas comme les 327 983 entrées de RAPPORT l.57, qui laissaient `tsmom` au `log` de Python.
  - La mesure de RAPPORT l.107-114 (sous le `log` de Node, 114 empreintes sur 114) est citée dans le texte de la classe ln, jamais rejouée.
- **Composition**, `report.py` l.373-425, dans cet ordre :
  1. plateforme et bibliothèque C (rôle `libm`) ;
  2. identité de l'outil ;
  3. vecteurs du `log` ;
  4. enfants `vectors_check.py`, `binom_check.py`, puis `recalc_p2.py` (porte D-2) ;
  5. lecture des séries et les trois passes ;
  6. trois enfants `compare_p2.py` : recalcul, `ln` et `association` contre B.

  B n'est lu que par ces trois enfants, après les passes. Un enfant ne rend que sa sortie standard : la garde refuse au parent la
  lecture d'un fichier qu'un autre processus a écrit (`io_guard.py` l.172-178), et `recalc_p2.py` imprime donc ses lignes d'entrée.
  Les entrées de `compare` sont celles des comparateurs, moins les registres de la course (nom et sha256) ; il doit en rester exactement
  une, de rôle `registry`, sinon la course s'arrête. Toute sortie non nulle écrit `run-log.json` (étapes, durées, dernières lignes de
  l'enfant en faute, entrées vues par les comparateurs, recouvrement par passe) et aucun `report.json`.
- **Le rapport** (format fermé `monark-recompute-report-v1`).
  - Clés : `format`, `verifier`, `tool`, `registry` (nom de base du registre lu, son sha256, `generator_identity`, `cells`), `inputs`
    (`recompute` et `compare`, triées), `platform`, `oracles` (conformité, seconde écriture, tests de hikae, vecteurs du `log`),
    `fields` (exactement `decisions`, `digest_rule`, `digests`, `value_rule`, `values` ; voie 1, aucun champ hors des décisions),
    `cells` (280, triées), `differences` (triées), `explanation`, `summary`, `replay`.
  - Écriture canonique, ASCII, sans LF final ; seulement des entiers, des chaînes, des booléens et null (`canonical`, l.66-84). La course
    refuse un chemin passé en argument, un chemin à lettre de lecteur, un CR ou un LF dans le texte.
  - Rapport de synthèse de l'auto-test (66 694 octets, `7f5913f7…`, mêmes octets sur trois courses) : `contentProblems` au chemin daté
    `contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json`, sorte `json`, rend 0 problème, et
    `canonicalJson(JSON.parse(t)) === t` (`node -e`).
  - `sys.version` porte l'horodatage de construction de l'interpréteur (« May 10 2026, 10:43:50 ») : une constante de la plateforme
    (§3.3), pas une heure de course.
- **Plateforme** (point 3 de la mission). Mesure par un crochet de journal, hors de l'outil (`platform/probe_platform.py`).
  - `platform.machine()`, au premier appel, lève `socket.gethostname` et deux `_wmi.exec_query`. `platform.platform()` lève deux
    `_wmi.exec_query`. `sys.getwindowsversion()` ne lève rien.
  - `report.py` compose donc la chaîne depuis `sys.getwindowsversion()[:3]`, la table des versions du module `platform` et
    `PROCESSOR_ARCHITECTURE`. Mesuré : `Windows-10-10.0.19045-SP0` et `AMD64`, égaux à `platform.platform()` et `platform.machine()`
    (`platform/probe_compose.py`). `platform_version` donne 19041 : il n'est pas utilisé.
  - `_wmi.exec_query` n'est pas dans les 192 noms de la table (`documented-192.txt`, `2489be60…`) : il est classé refusé, troisième nom
    que cet hôte lève hors d'elle. Aucun nom d'hôte n'est lu.
  - Bibliothèque C : `ucrtbase.dll` lu sous `libm` (1 046 080 octets, `3c600563…`), version `10.0.19041.3636` lue dans
    `VS_FIXEDFILEINFO`, égale à `FileVersionRaw` de PowerShell. La course refuse une copie de `ucrtbase.dll` à côté de l'interpréteur.
  - Empreinte : le nombre d'entrées des vecteurs où le `log` qui tourne diffère du portage (`log_vectors_differing`). Avec la bibliothèque
    de la mesure (`3c600563…`), il doit valoir 5 780, sinon la course s'arrête (`fingerprint`, l.119-124 ; mesuré : 5 780).
- **Identité de l'outil** (`tool`, §3.2). `git_tree` lit `HEAD` de `--repo`, puis les blobs sous `tools/kata-recalc` (`rev-parse`,
  `ls-tree`, `cat-file`) ; ce n'est ni une entrée ni une note. L'outil doit tourner depuis `<repo>/tools/kata-recalc`, et ses fichiers
  doivent être ces blobs, mode `100644`, rien de plus : ni cache, ni lien, ni dossier.
  - Vecteur : au commit `2a46eeb8`, l'empreinte est `ff72522e…`, l'épingle du lot 1d.
  - Refus mesuré dans ce worktree non committé : sortie 2, « the files that run are not the tool's tree at its commit ».
  - La course complète ne part donc que d'un arbre committé, qu'elle nomme. Avant le commit, la G2 de la partie 1 rejoue les pièces
    (auto-tests, oracles, passes de synthèse) ; la course sur les séries est l'acte de la partie 2.
  - La branche positive de l'identité n'a pas encore tourné. Étape proposée à l'orchestrateur après le commit du lot, sans aucune série :
    depuis un clone propre détaché à ce commit, `python -B tools/kata-recalc/report.py --repo <clone> --series <dossier vide>
    --vectors <vectors.json> --registry <wave1.json> --out <dossier neuf>`. Attendu : identité admise, empreinte 5 780, deux oracles
    verts (environ 70 s), sortie 2 au recalcul, `run-log.json` seul.
  - `report_check.py` lit par `git_tree` le commit `2a46eeb8` (vecteur `ff72522e…`) : il lui faut un dépôt qui tient ce commit (un clone
    `--depth 1` au commit du lot ferait échouer cette lecture).
- **Cache de bytecode** (trouvé dans ce lot). Sans `-B`, l'import de `io_guard` écrit `__pycache__/io_guard.cpython-314.pyc` avant que le
  crochet n'existe (mesuré). Une course suivante chargerait un cache dont la date et la taille de source concordent, même sous `-B`, et
  le test d'arbre de Node, qui lit l'index, ne le voit pas.
  - `io_guard` refuse donc à l'import un `__pycache__` dans l'arbre de l'outil, ou un `sys.pycache_prefix` (l.351-352, avant le crochet,
    par `os.path.lexists`).
  - Sondes sur une copie (`cache-probe/`) : C1, sans `-B` → 4 (le cache de `io_guard` est écrit, puis la course s'arrête) ; C2, sous
    `-B` avec ce cache → 4 ; C3, sous `-B` avec `-X pycache_prefix` → 4 ; C4, sous `-B`, arbre propre → 0.
  - Les caches laissés par les courses sans `-B` de ce lot ont été retirés du worktree.
- **Mesures** (`python -B`, hors ligne).
  - `report_check.py F:/Monark-wt-verifiers-1e <travail> <sortie>` : 39 contrôles, 0 échec, GREEN, 84 s (`selftest/report-check-4.txt`,
    `f2e5d594…`). Il couvre :
    - le portage sur ses vecteurs, et le refus d'une empreinte autre que 5 780 avec la bibliothèque mesurée ;
    - l'écriture canonique et ses trois refus ; la plateforme ;
    - l'arbre du lot 1d à `2a46eeb8`, et six refus de la règle d'arbre ;
    - les trois passes sur quatre marches LCG : 280 lignes ; `ln` : 1 044 entrées sur 425 676 diffèrent, d'un ulp ; `association` :
      24 lignes séparées de `ln`, toutes du kata EWMA ;
    - neuf cas par `compare_p2.py` enfant :
      - B = recalcul → 0 différence ;
      - B = passe `ln` → 103 différences (88 empreintes, 15 valeurs), toutes ln ;
      - B = passe `association` → classes ln et association, chaque association dans une case du kata EWMA ;
      - empreinte de tête posée → hors décision, rapport possible ;
      - un facteur d'un ulp de plus → non expliqué, sortie 1 ;
      - `calib.n` + 1, `engine` changé, `qhat` × (1 + 1e-9) → sortie 1 ;
      - une ligne retirée → sortie 2 ;
    - l'écriture du rapport : canonique, triée, raison sans nom d'item, aucun chemin ;
    - `report.py` en enfant : usage → 2 ; sortie non vide → 4 ; course qui ne peut finir → 2, `run-log.json` seul.
  - Composition jusqu'au recalcul, par un pilote de brouillon qui fixe l'identité, sur une copie de l'outil (`e2e/`). Oracles enfants
    verts, sorties égales à l'octet à `final3/` du lot 1d : `vectors-check.txt` `43d88e25…`, `binom-check.txt` `63606d4f…`,
    `hikae-replay.txt` `68e16302…`. Vecteurs du `log` 8,1 s ; oracles binomiaux 59,3 s. Recalcul arrêté sur un dossier de séries vide,
    aucune série lue ; sortie 2, `run-log.json` seul.
  - Oracles d'avant, inchangés (`final/oracles.sh`, `run2/`, 03:00-03:02 UTC), chacun en sortie 0 : `vectors_check.py` sur `06ecf069…`,
    `binom_check.py` (ii)/(iii), `--registry` et `compare_check.py` sur `7eb07d4d…`. Leurs sorties sont égales à l'octet à celles de
    `final3/`. Sondes de la garde (`guard_probes.py`, `c681aedc…`) : 56 sur 56 ; P58-old vise la garde de `ad2a45b6`, non rejouée.
    Fumées 0. Sans `-B`, `vectors_check.py` et `report.py` sortent en 4 à l'import de `io_guard`.
  - Épingle d'arbre, après la correction de licence : `e9e11ccb63a7f5c538f853d2e4773f63cca3cce4a8d7b55fccd1f5d6646cef24` (onze
    fichiers ; `3ddfabfd…` avant). Mesurée trois fois : boucle `sha256sum` sur l'arbre de travail, boucle sur l'index du clone
    (`ls-files` et `cat-file`), test de Node.
  - Après la correction (03:23-03:27 UTC) :
    - `report_check.py` 39 contrôles, GREEN ; le rapport de synthèse garde ses octets (`7f5913f7…`), car seuls des commentaires changent ;
    - sur le clone : `byte-guard` et `kata-recalc` 20 sur 20, `lang-gate` 0 ;
    - worktree : `lang-gate` 0, `grep-forbidden` 0 (359 fichiers) ;
    - aucune ligne de tueur n'a bougé, et les trois tueurs, retirés, rougissent encore leur test par assertion.
  - Node :
    - clone `--shared` à `2a46eeb8`, lot indexé dans le clone seul : `byte-guard` et `kata-recalc` 20 sur 20 ;
    - fichier de test copié sur un second clone à `2a46eeb8` : les trois tests jugés rougissent par assertion (`ERR_ASSERTION`), le
      test de langue reste vert ;
    - tueurs tirés à la main sur le clone, fichiers rendus ensuite ; chacun rougit son test par assertion : `kata_lib.py:265`,
      `recalc_p2.py:12`, `report.py:50` (le nom d'item dans la raison, règle b de `contentProblems`) ;
    - worktree : `tsc --noEmit` 0 ; `eslint test/kata-recalc.test.ts` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (359 fichiers, les
      onze `.py` en cibles) ; `lang-gate` 0 ; `export-public --check` 0.
  - red-proof non joué : il lui faut un gel committé (précédent du §11). L'orchestrateur le rejoue avec `--gel <commit du lot>`.
- **R-25**, forme de la CI sur l'index du clone contre `2a46eeb8`, après la correction de licence : 6 fichiers, 978 insertions,
  25 suppressions, soit **1 003** (966 avant ; estimé ~450 ; borne 1 205). L'excédent : `report.py` (453), `report_check.py` (217),
  `fdlibm_log.py` (207, dont 41 lignes d'avis et de licence), `io_guard.py` (35/8), `recalc_p2.py` (23/9), le test (43/8).
- **Écarts au G0**.
  - M-10 sort du lot (Q-6) ; le portage du `log` la remplace.
  - `platform` ne porte ni Node ni V8 (Q-6), mais l'empreinte du `log` ; `oracles` porte les vecteurs du `log` ; `fields` porte deux
    règles en mots ; `inputs.recompute` liste aussi les sorties d'oracle, que lit la porte D-2 de `recalc_p2.py`.
  - Le rapport n'a pas de LF final, comme la liste (§3.2).
  - La classe « association » s'entend sous le `log` du générateur (voir les classes).
  - `io_guard.py` change au-delà de M-11 : `_wmi.exec_query`, `git_tree`, le refus d'un cache. `recalc_p2.py` gagne trois points de
    partage et imprime ses entrées.
  - Noms privés, voulus : `kata_lib.math` (le global que les passes remplacent), `kata_lib._EWMA_W` (les poids que l'autre ordre relit),
    `platform._WIN32_CLIENT_RELEASES` et `_WIN32_SERVER_RELEASES` (une seule source du nom de version ; bibliothèque standard épinglée).
  - La raison `OUTSIDE` de `compare_p2.py` garde le nom de l'item TRIAL-HEAD-WRITTEN-1 : fichier interne, décision de MONARK au §14,
    l.784-789. Seule la phrase du rapport est sans nom (`report.py` l.50) ; REPORT-TRIAL-HEAD-SENTENCE-1 les retirera.
  - Sources de V8 lues par le worker (`curl`, et deux appels WebFetch) : le §10 de CLAUDE.md réserve la lecture primaire à
    l'orchestrateur, avec un fichier de FAITS ; la mission demandait des sources lues sur place. Rien n'a été écrit ni téléchargé sur
    disque ; aucun compte, aucun formulaire.
  - Régularisation : MONARK a lu ensuite ces sources sur place, dans le navigateur interne, à 03:2x UTC. Elle les consigne dans
    `F:/tmp/verifiers-1e/faits/FAITS-v8-ieee754-log-2026-10-07.md` (sha256 `c2d3007d…`) : même sha256 de `ieee754.cc`, et
    `LICENSE.v8`. Ce fichier régularise l'écart. `error_origin` « worker » au G7 de la partie.
- **REPORT-LIBM-POSIX-1** (PAROXYSME). Porteur : MONARK. Déclencheur : avant une course du rapport sur un hôte qui n'est pas Windows (une
  G2 ailleurs, VERIFIER-PUBLIC-REPLAY-1). Limite : hors de Windows, `report.py` sort en 2, la bibliothèque C du `log` n'y étant pas
  localisée. Construction : localiser sans `ctypes` la bibliothèque qu'appelle `math.log`, lire ses octets sous `libm`, sa version dans
  ses octets, son empreinte sur les vecteurs comme sur Windows. Prix : environ 30 lignes, une mesure sur un hôte POSIX, une G2.
- **REPORT-LIBM-FINGERPRINT-1** (PAROXYSME). Porteur : MONARK. Déclencheur : une course dont `ucrtbase.dll` n'a pas le sha256 de la
  mesure (une mise à jour de Windows suffit). Limite : l'empreinte est alors écrite, pas confrontée à une mesure ; le lien entre le
  fichier nommé et le `log` appelé repose sur la règle du chargeur (`System32`, aucune copie à côté de l'interpréteur). Construction :
  rejouer `port/ucrt_cmp.py` (`ctypes`, hors de l'outil) sur la nouvelle bibliothèque, puis ajouter son sha256 et son compte à
  `fdlibm_log.VECTORS` par un lot avec sa G2. Prix : une mesure d'environ 10 s, deux lignes, une entrée de liste.
- **Décisions de MONARK** (2026-10-07, 03:2x UTC), sur les quatre questions du lot :
  - Q-1e-1, décidée : la classe « association » reste sous le `log` du générateur, et toute cause combinée reste « not explained »,
    comme construit. Q-6 de RECHERCHES écrit « classe ln/association » : MONARK la soumet à RECHERCHES dans la demande de G2.
  - Q-1e-2, décidée : la course complète ne part que d'un arbre committé (`HEAD` de `--repo`). C'est la commande du §3.3, depuis un
    clone détaché au commit listé.
  - Q-1e-3, décidée : le défaut tient. Hors de la bibliothèque mesurée, l'empreinte est écrite, sans refus ; le rapport nomme sa
    plateforme, et la G2 rejoue sur la même plateforme ou documente l'écart (§3.3). L'item REPORT-LIBM-FINGERPRINT-1 reste formé.
  - Q-1e-4, décidée : `git_tree` et le refus d'un cache de bytecode entrent dans la G2 de la partie 1.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : 0 ; seul `GIT_EDITOR`, posé par le harnais), aucun `--write-tree`.
  `git add` dans `F:/tmp/verifiers-1e/clone` seulement ; `git checkout` de fichiers dans les clones de `F:/tmp` pour rendre les tueurs.
  Dans le worktree : des lectures, et le `rm` des caches que ce lot a créés. Rien n'est écrit sur C: (`ucrtbase.dll` et la bibliothèque
  standard y sont lus).

## 16. Lot REASON-ORDER-GUARD-VERIFIER-1 : mesures

Worker `claude-opus-5-5` (effort max), horloge lue de 2026-10-07 03:57 à 04:3x UTC (tampons de `now.mjs` : 03:57 au départ, 04:11,
04:16, 04:20, 04:21, 04:27, 04:29 à l'écriture de ce paragraphe, 04:31 à la relecture de la copie de RECHERCHES). Worktree
`F:/Monark-wt-reason-order`, branche `monark/reason-order-1`, tête `177b5755` (fusion du lot 1e) ; le worker ne committe ni n'indexe
rien dans le worktree (R-20). Sorties sous `F:/tmp/reason-order/` : `clone/` (clone `--shared` détaché à `177b5755`, lot indexé dans ce
clone seul, `node_modules` lié comme celui du worktree, `@monark/*` vers les paquets du clone), `base-clone/` (même base, fichiers de
test copiés), `base-tool/` (l'outil de la base, par `git archive`), `selftest/`, `oracles/`, `out/`.

- **Sources**, lues en entier : message de RECHERCHES `f51322c` (`74f95562…`, §B) et sa pièce `short-digest-spec-text/TEXT.md`
  (`ac1e456`, `82a53d67…`, §B) ; réponse de MONARK `fa8fdc1` (le lot pris ; le vecteur reste dans R1) ; R1, `KATA-SPEC-proposed.md` §10
  (`594028c`, `c8ce9720…` à `dcb7f13`), et sa note (`785c3301…` : FORMAT.md n'est pas touché, l'ordre fin est écrit au §10 de KATA-SPEC).

**L'ordre des générateurs, lu sur place** (copie de RECHERCHES à `dcb7f13`, relue à `c91802c` à 04:31 UTC).
- Vague 1, `kata/bench/calibrate.ts` (`fc6422b9…`) :
  - l.122-124 : sans rang, `under_calib`, raison `empty bucket (no thresholds on this side)`, `empty bucket` ou `n <n> below n0 <n0>` ;
  - l.126 : contrôle 1 sur `1{s > qhat}` ; l.127-132 : contrôle 2 sur les labels up (direction) ou sur l'excédent équilibré des scores
    (bande, `empty` si l'excédent est vide) ;
  - l.135-136 : `silence` si le contrôle 1 rejette, si le contrôle 2 rejette ou s'il est vide. La raison est `auxiliary sequence
    constant (fails closed)` dès que le contrôle 2 est vide, sinon `dependence check rejects` ;
  - l.138-139 : une direction à `qhat` ≠ 0 donne `misses <m> above k* <k>` ; l.141 : `region`, raison vide ;
  - contrôle 1 vide et contrôle 2 qui rejette : l.135-136, `dependence check rejects`, comme la garde. Direction à `qhat` 1 : aucun score
    ne dépasse 1, le contrôle 1 est vide, et `misses …` ne vient que si le contrôle 2 passe (l.138), comme la garde ;
  - seul écart : le contrôle 1 rejette et le contrôle 2 est vide.
- Vague 2, `kata/w2c/calibrate2.ts` (`fa0559bd…` ; `c4450022…` depuis `4b4136b`, W2C-N0-REASON-1, qui ne change que la l.95) :
  l.95 et l.102, `under_calib` (`empty bucket` à n 0 depuis `4b4136b`, `n <n> below n0 <n0>` ou `score refused`) ; l.121, queue vide,
  `tail sequence constant (fails closed)` ; l.122, queue ou contrôle 1 qui rejette, `dependence check rejects` ; l.123, `region` (un
  contrôle 1 vide n'est pas un refus). Écart : la queue est vide et le contrôle 1 rejette.
- Le worker a lu ces lignes parce que la mission le demandait. Le commentaire du vérificateur cite la décision écrite (`f51322c`, pièce
  §B), pas le générateur : l'en-tête de l'outil dit qu'il s'écrit d'après les définitions (mission D-1).

**Où le cas arrive** (lu dans le code) :
- bande de vague 1 : l'excédent équilibré est vide si et seulement si les scores sont constants (`binom_exact.py` l.322-342,
  `runs.ts` l.91-107). `1{s > qhat}` est alors constant, et le contrôle 1 vide : le cas n'arrive pas ;
- direction, côté up : le score vaut 1 moins le label (calibrate.ts l.71-72), donc un label constant rend le score constant : le cas
  n'arrive pas ;
- direction, côté down : un label plat est un manqué, et la suite des labels ne compte que les labels up. Des plats groupés font
  rejeter le contrôle 1 avec un contrôle 2 vide : le cas arrive ;
- une telle ligne reste refusée par le plancher de digest, à la porte de publication comme à la garde. Sonde `floor-probe.ts`
  (`3a9b5ec8…`) : avec m ≤ 34, seul f = m est admis et la borne des labels vaut −4,39 à −6,02 bits (n 40 et m 6, n 400 et m 20, n 800
  et m 34) ; avec m > 34, aucun f n'est admis. Le lot aligne la raison ; il ne rend pas une telle ligne publiable ;
- vague 2 : le générateur ne produit jamais ce cas (queue vide, contrôle 1 qui rejette). Sur tout n admis, n − k* ≥ tailRank(n,
  tail_frac), avec une marge minimale de 18 à 1h et de 36 à 4h, donc `qhat` ≥ tau ; une queue vide donne alors k_obs 0, donc un
  contrôle 1 vide (`calibrate2.ts` l.106-110, `tail.ts` l.119-121 et l.153 ; sonde `reach-probe.ts` et simulations `w2-sim.ts`,
  `w2-sim2.ts` du vérificateur, sous `F:/tmp/reason-order-verify/` : 0 cas sur 9 200 calibrations). La ligne du test de vague 2
  ci-dessous est forgée : elle passe toutes les autres clauses de la garde, et sert à fixer l'ordre de la garde, pas un cas du
  générateur. (Pli de la G2 du vérificateur, constat 1, MONARK 2026-10-07 05:0x UTC.)

| Point | Diff (lignes du nouvel arbre) | Source |
|---|---|---|
| garde | `apps/harness/src/policy-guard.ts` l.83 : `adm.empty` avant `adm.reject`, pour les deux vagues ; un échange pur (284 octets avant et après) : aucune ligne ne bouge, et les tueurs qui épinglent l.24 à l.124 gardent leur ligne | `f51322c` §B ; pièce §B |
| tests de la garde | `policy-guard.test.ts` l.226-238, `guard_names_a_constant_auxiliary_sequence_before_a_rejection` ; `policy-wave2.test.ts` l.250-258, `w2_guard_names_a_constant_tail_before_a_rejection` | pièce §B (un cas par vague) |
| vérificateur | `recalc_p2.py` l.291-294 (l'échange), l.280-282 (l'ordre et sa source écrite), l.2 (en-tête) ; 507 lignes, l.12 inchangée | idem |
| auto-test | `report_check.py` section 9 (l.208-233) et en-tête (l.7-8) ; 246 lignes | mission, point 2 |
| épingle | `test/kata-recalc.test.ts` l.48 : `289756d3…` ; commentaire l.43-47 ; en-tête l.11-12 | §3.2 |
| G0 | §14 : KATA-SPEC-REASON-ORDER-1 corrigé en place ; ce §16 | mission, point 3 |

- **L'invariant du vérificateur** (`recalc_p2.py` l.393 : `region` si et seulement si la raison est vide) ne dépend pas de l'ordre. Le
  statut vaut `silence` dès que `reasons` n'est pas vide (l.269-275) : un contrôle 1 qui rejette, un contrôle 2 qui rejette ou qui est
  vide, une direction à `qhat` 1. Ce sont exactement les cas d'une raison non vide, sous les deux ordres. Il n'est pas changé.
- **Pourquoi l'auto-test va dans `report_check.py`** : c'est le seul auto-test de l'outil qui importe `recalc_p2` et fait tourner
  `calibrate_cell` (section 5, les passes). La raison y est une décision que `compare_p2.py` compare (cas « calib.reason altered » de
  `compare_check.py`). Les autres ne s'y prêtent pas : `vectors_check.py` lit les vecteurs de KATA-SPEC (le vecteur de l'ordre viendra
  par R1), `binom_check.py` éprouve le moteur, et `compare_check.py` le comparateur sur un registre. Un auto-test neuf tournerait seul,
  donc avec un bloc `__main__` : il aurait changé la liste des scripts d'entrée que fige
  `kata_recalc_entry_scripts_import_the_input_guard_first`.
  - La section 9 construit à la main les points CALIB d'une case de direction, côté down : 40 points (k* 12 à alpha 0,45 ; n0 6), ni
    bougie ni série. Elle contrôle `(check1, check2, qhat, status, reason)` sur huit cas.
  - Un seul cas sépare les deux ordres : « check 1 rejects, no up label » (6 plats en tête, puis 34 labels down).
  - Les sept autres tiennent les autres branches : un rejet avec un label up au milieu ; un contrôle 1 qui passe, ou vide, avec un
    contrôle 2 vide ; `qhat` 1 avec un contrôle 2 qui rejette ou qui passe ; une région ; 5 points sous n0.

**Mesures** (`python -B`, hors ligne ; aucune série lue).
- `wave1.json` (`811fcd57…`, un registre, pas une série), par `wave1_reason_count.py` (`4794e07f…`, sortie `2679796d…`) :
  - 280 lignes. Contrôle 1 qui rejette et contrôle 2 vide : 0 ; contrôle 2 vide : 0 ;
  - `check1` : `empty` 239, `pass` 29, `reject` 12 ; `check2` : `pass` 235, `reject` 45 ; statut CALIB : `region` 4, `silence` 276 ;
  - la raison recalculée depuis les contrôles publiés égale celle du registre sous les deux ordres, sur 280 lignes ; aucune ligne ne
    change de raison. La vague 1 n'est pas touchée.
- Auto-test : `report_check.py F:/Monark-wt-reason-order …` donne 47 contrôles, 0 échec, GREEN, en 85 s (`selftest/report-check-new.txt`,
  `393b36e8…`). Contre la sortie du lot 1e (`report-check-5.txt`, `f2e5d594…`), `diff` ne montre que les huit lignes ajoutées. Le
  rapport de synthèse garde ses octets (`7f5913f7…`), comme les registres des trois passes de synthèse (`a.json`, `ln.json`,
  `association.json`) : aucune de leurs 280 lignes n'a un contrôle 2 vide.
- Rouge à la base : le nouveau `report_check.py` contre l'outil de `177b5755` (`base-tool/`, `recalc_p2.py` `833e8b31…`) donne 1 échec,
  RED, sortie 1. Seul le cas « check 1 rejects, no up label » échoue : il rend `dependence check rejects`.
- Oracles d'avant (`oracles.sh`, `oracles/`, de 04:24 à 04:26 UTC), chacun en sortie 0, stderr vide : `vectors_check.py` sur
  `06ecf069…` ; `binom_check.py` (ii)/(iii) ; `--registry` et `compare_check.py` sur `7eb07d4d…` ; la fumée de `calibrate_cell` du
  lot 1d (`smoke_calibrate.py`, `12a14a54…`, copiée). Les six sorties sont égales à l'octet à celles de `F:/tmp/verifiers-1e/final/run2/` :
  `43d88e25…`, `63606d4f…`, `68e16302…`, `bf9412ba…`, `094e6556…`, `92017cbd…`.
- Épingle d'arbre : `289756d342031997b2b051d49b10429c17a5bc1840614f44a5813001c27649e1` (onze fichiers ; `e9e11ccb…` avant). Mesurée
  trois fois : boucle `sha256sum` sur l'arbre de travail, `manifestText` (`node -e`), boucle sur l'index du clone (`ls-files` et
  `cat-file`). Seuls `recalc_p2.py` (`a1671bc9…`) et `report_check.py` (`0324ca52…`) changent ; aucun `__pycache__`.
- Node :
  - clone indexé : `apps/harness/test/*.test.ts` (38 fichiers), `test/kata-recalc.test.ts` et `test/byte-guard.test.ts`, 293 sur 293 ;
  - clone de base, les trois fichiers de test copiés : 290 sur 293. Les trois rouges sont les trois tests jugés, chacun par assertion
    (`ERR_ASSERTION`) : les deux tests de la garde (« Missing expected exception ») et le test d'arbre (`e9e11ccb…` lu pour `289756d3…`) ;
  - tueurs tirés à la main sur le clone (`fire-killers.mjs` : lus par `parseKiller` de `red-proof.mjs`, posés dans l'arbre de travail
    seul, fichiers rendus, sha256 égaux avant et après) :
    - les deux tueurs neufs, `policy-guard.ts:83` COR : l'un ne vise que la vague 1 (`adm.empty && (w2 || !adm.reject)`), l'autre que la
      vague 2 (`adm.empty && (!w2 || !adm.reject)`). Chacun rougit son test par assertion ; croisés, chacun laisse vert le test de
      l'autre vague ;
    - deux variantes proposées par l'advisor, sur l'entrée du choix : `policy-guard.ts:82` (`empty: … && r.runs_miss !== "reject"`) et
      `policy-wave2.ts:42` (`empty: t.empty && !c.reject`). Chacune rougit le test de sa vague par assertion ;
    - le tueur existant de `w2_guard_refuses_region_with_empty_or_low_tail` (`policy-guard.ts:83`) : sa chaîne reste unique sur la ligne,
      et il rougit encore son test. Il le rougit par l'erreur de la garde (`ERR_TEST_FAILURE`), à la base comme au gel (mesuré sur les
      deux clones) ;
    - les quatre tueurs de `test/kata-recalc.test.ts` (`kata_lib.py:265`, `lang-gate.mjs:107`, `recalc_p2.py:12`, `report.py:50`) :
      chacun rougit son test par assertion ;
  - worktree : `tsc --noEmit` 0 ; `eslint` des quatre `.ts` touchés 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (348 fichiers ; 359
    avec les onze `.py` en cibles ; 362 avec en plus les trois fichiers de test) ; `lang-gate` 0 ; `export-public --check` 0 ;
  - red-proof non joué : le test d'arbre lit l'index, il lui faut un gel committé (§11). L'orchestrateur le rejoue avec
    `--gel <commit du lot>`.
- **R-25**, forme de la CI (`ci.yml` l.100) sur l'index du clone contre `177b5755` : 6 fichiers, 69 insertions, 14 suppressions, soit
  **83** (borne 1 205). Le G0 n'entre pas dans le compte (`docs/**/*.md` exclus).
- **Écarts au G0** :
  - l'écart du §14 sur l'ordre de `reason` (« la liste de FORMAT l.48 (rejet d'abord) ») est clos par ce lot ;
  - trois énoncés de conception de la garde sont remplacés par ce lot : `docs/G0-lot-cm-4a-ii.md` l.51 (G-2 point 4, vague 1) et
    `docs/G0-lot-cm-4a-ii-b.md` l.32 et l.41 (vague 2, « Ordre rejet avant vide : celui de FORMAT »). Le texte qui fait foi est le §10
    de R1 avec `f51322c` §B. Les G0 historiques ne sont pas réécrits (pli de la G2 du vérificateur, constat 2) ;
  - l'en-tête de `recalc_p2.py` est amendé sur place (l.2, 170 octets, la plus longue ligne du fichier) : aucune ligne ne bouge, ni le
    tueur `recalc_p2.py:12` ;
  - le cas de vague 1 de la garde passe par une bande, la seule forme de ligne de vague 1 qui traverse toutes les autres clauses. Le
    même test pose aussi la forme qui arrive (direction, côté down) : la raison est admise, puis le plancher refuse la ligne.
- **Fermeture de l'item** (pièce §B : « le texte posé, le code aligné, le vecteur publié »). Ce lot aligne le code. Le texte est au §10
  de la révision de KATA-SPEC que RECHERCHES propose (R1). Le vecteur reste dans R1 (`fa8fdc1`), avec le déclencheur de
  KATA-SPEC-REASON-ORDER-1 (§14). Pour ce vecteur, RECHERCHES doit savoir qu'en vague 1 une ligne publiée de ce cas n'arrive que du
  côté down d'une case de direction, et que le plancher de digest refuse de la publier. Ce refus vise une ligne de table, pas un vecteur
  de conformité sur des points de synthèse. En vague 2, le cas n'arrive pas du générateur (ci-dessus) : la ligne qui passe la garde
  est forgée, et le cas ne peut porter qu'un vecteur de ligne pour la garde, jamais un vecteur sur des scores.
- **G2 du vérificateur** (instance neuve `claude-opus-5-5`, effort max, de 04:37 à 05:02 UTC ; copies sous
  `F:/tmp/reason-order-verify/`) : CORRECTIONS, quatre constats m, aucun sur le code. Il a rejoué 293 sur 293 au lot et 290 sur 293 à la
  base (les trois tests jugés), treize tirs de tueurs, l'épingle `289756d3…` par son propre script, les six oracles à l'octet, et la
  raison du registre 280 sur 280. Plis : constats 1 et 2 ci-dessus ; constat 3 par l'item W2-GUARD-MISSES-TAIL-1 ci-dessous ; constat 4
  vise le rapport du constructeur, pas ce G0 (la pièce R1 vaut `c8ce9720…` à `9c1b486` et `dcb7f13`, `5a0748be…` à `594028c` ; le §10
  est identique aux deux).
- **W2-GUARD-MISSES-TAIL-1** (formé ici, constat 3 du vérificateur, préexistant). Porteur : MONARK. La garde admet une ligne de vague 2
  dont `misses` dépasse `tail_m` (rien ne les lie dans `wave2Admission`, `policy-wave2.ts` l.26-43, ni à `policy-guard.ts` l.80), alors
  que toute ligne du générateur a `misses` ≤ `tail_m` (`qhat` ≥ tau). Le refus reste fermé (la ligne admise est une `silence`, liée au
  registre épinglé). Correctif : une clause `misses ≤ tail_m` dans `wave2Admission` avec son tueur ; le test
  `w2_guard_names_a_constant_tail_before_a_rejection` devient alors un test de refus, ou la décision de `f51322c` §B est rouverte avec
  RECHERCHES pour la vague 2. Déclencheur : avant le gel de FORMAT-W2, et au plus tard avant le service de la vague 2.
- **Scripts de preuve** (sous `F:/tmp/reason-order/`, hors du lot, sha256) : `sync.sh` `734b839b…`, `oracles.sh` `b31c3458…`,
  `fire-killers.mjs` `e534efe9…`, `fire-one-at-base.mjs` `bb537228…`, `link-node-modules.mjs` `1b5f19ea…`, `proto_reason.py`
  `ab31b0eb…` (le prototype de la section 9), `gf-targets.mjs` `0444ff49…`, `wave1_reason_count.py` `4794e07f…`, `floor-probe.ts`
  `3a9b5ec8…`.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : seul `GIT_EDITOR`, posé par le harnais), aucun `--write-tree`.
  `git clone --shared`, `checkout --detach` et `git add` dans `F:/tmp/reason-order/clone` et `base-clone` seulement ; dans le worktree,
  des lectures (`diff`, `status`, `show`, `log`, `archive`). Rien n'est écrit sur C: (`ucrtbase.dll` y est lu par l'auto-test, sous le
  rôle `libm`).

## 17. Lot « outil figé » : mesures

Six workers `claude-opus-5-5` (effort max), en six missions sur le worktree `F:/Monark-wt-reason-order`, branche `monark/reason-order-1`,
tête `09f49fc2` (REASON-ORDER-GUARD-VERIFIER-1, committé), base du chantier `177b5755`. Mission 1, horloge de 05:14 à 06:06 UTC :
`io_guard.py` et `guard_check.py`. Mission 2, horloge de 06:07 à 07:08 UTC (tampons de `now.mjs` : 06:07, 06:14, 06:59, 07:00, 07:06,
07:08) : les autres fichiers de l'outil, `test/kata-recalc.test.ts` et ce paragraphe. Mission 3, de 07:57 à 09:0x UTC : les plis de la G2
des vérificateurs (paragraphe « G2 des vérificateurs », en fin de section ; sorties sous `F:/tmp/frozen-tool/m3/`). Mission 4, de 09:09 à
10:1x UTC : REPORT-INPUT-NAMES-1 fermé et la forme `python -E -s -B` (deux décisions de MONARK du 2026-10-07 ; paragraphe « Mission 4 », en
fin de section ; sorties sous `F:/tmp/frozen-tool/m4/`). Mission 5, de 10:52 à 12:1x UTC : la forme `python -E -S -s -B`, son contrôle
par `io_guard` à l'import, la liste fermée des bibliothèques du `log` et les constats m du vérificateur de la mission 4 (paragraphe
« Mission 5 », en fin de section ; sorties sous `F:/tmp/frozen-tool/m5/`). Mission 6, horloge lue à 13:11 UTC : les deux constats m du
vérificateur de la mission 5, l'item 11 du suivi et le fichier de FAITS de `PYTHON_PRESITE`, dans ce G0 seulement, Bash refusé par le
harnais en cours de mission (paragraphe « Mission 6 », en fin de section). Les numéros de ligne du tableau ci-dessous et des paragraphes
des missions 1 et 2 sont ceux de l'arbre de la mission 5, qui les a réancrés ; ceux des paragraphes des missions 3 et 4 restent ceux de
leurs arbres (déplacements donnés au paragraphe « Mission 5 »). Une seule épingle d'arbre pour tout le lot
(décision de MONARK, `2f28639f…` l.16). Les workers ne committent ni n'indexent rien dans le worktree (R-20). Sorties de la mission 1 sous
`F:/tmp/frozen-tool/` ; de la mission 2 sous `F:/tmp/frozen-tool/m2/` : `base-m1/` (l'outil de la mission 1, copié avant toute écriture de
la mission 2 ; `base-m1.sha256`), `clone/` (clone `--shared` détaché à `09f49fc2`, lot indexé dans ce clone seul, `node_modules` lié comme
celui du worktree, registre copié non suivi), `base-red/` (l'outil de la mission 1 avec les auto-tests neufs), `node-base-09f49fc2/` et
`node-base-177b5755/` (fichier de test neuf et registre copiés), `mut1/` à `mut4/` (mutants), `runs/`, `scratch/`.

- **Sources**, lues en entier, copie de RECHERCHES à `f41647a` :
  - addendum à la G2 de #214, `coordination/messages/2026-10-07-RECHERCHES-vers-MONARK-addendum-214.md` (`69c19514…`) : A-1, A-2, N-2,
    N-4, N-5, N-6 ;
  - addendum à la G2 de #217, `…-addendum-217-PR-218-219.md` (`8d91c3d7…`), et sa pièce `pieces/2026-10-07-rattrapage-G2/catchup-217.md`
    (`f1ddc697…`) : N-1 à N-6 ;
  - empreintes : la proposition de MONARK, `…-MONARK-vers-RECHERCHES-g2-r3-g0.md` (`90c9474`, `b3d4ddd4…`, l.11-28) ; l'accord de
    RECHERCHES, `…-empreintes-rapport.md` (`cb00b19`, `1c3dffdd…`, points 1 à 4 et la précision du point 3) ; la forme (a),
    `…-q3-q-p3-11-forme-a.md` (`619fcfe`, `184b1047…`) ; sa prise par MONARK, `…-forme-a-prise.md` (`0d71d8f`, `c9901835…`) ;
  - la voie 1 : `…-decisions-e2a.md` (`76ffa25`, `8097ab7d…`, décision 2) ; `…-voie1-deja-agreee.md` (`90185549…`) ; la G2 de la §8,
    `2026-10-06-RECHERCHES-vers-MONARK-trial-head-G2.md` (`452892b`, `d0715361…`) ; la §8 figée de R1, `KATA-SPEC-proposed.md`, `c8ce9720…`
    à `9c1b486`. La révision `94cd153` (`cd0b4303…`) la garde à l'octet : `git show` des deux commits, du titre de la §8 à celui de la §9
    (l.80-101), 22 lignes, 2 509 octets, sha256 `dff6da3e…` aux deux ;
  - décisions de MONARK : `…-recu-217-218-219-w2.md` (`2f28639f…`) et `…-tronc-220-deploiement.md` (`f1b2fea7…`). Venue après l'écriture
    de la mission, la deuxième G2 de la partie 3, `…-g2-r3-bis-cm5-v2.md` (`ab352b0`, `7cec3753…`, l.20-23, l.38-41, l.50-52) : MONARK
    y prend dans ce lot la portée écrite du rapport, `null` pour une case sans ligne, le `short_digest` de la porte dans le test, le refus
    d'une sous-chaîne de 64 hex sous `differences` et le rejeu de la porte sur le rapport de synthèse. Le G0 v3 de la partie 3
    (`pieces/2026-10-07-G0-verifiers-partie-3/G0-verifiers-part3.md`, `1538ce3`, `2c763c6f…`, §2.3 points 1 à 5, §3.4, §5.2) les liste
    comme livrables de ce lot ; ils y sont ;
  - `kata/registry/wave1.json` de la copie (`811fcd57…`, vérifié par `sha256sum`), lu pour les classes, la projection et le plancher.
    Aucune série n'est lue.

| Item | Diff (lignes du nouvel arbre) | Source |
|---|---|---|
| A-1 (#214) | `io_guard.py` l.65-71 (`NATIVE`), l.92 (`import` jugé), l.301-315 (`_judge_import`), l.338-339 ; en-tête l.5-7, l.21-32 | addendum #214 l.19-27 |
| A-2 (#214) | `io_guard.py` l.109-110 : `time.sleep` dans la classe « spawn » (`os.posix_spawn` y était ; jugé dans `_CREATE`, l.90, depuis la G2) | addendum #214 l.29-34 |
| N-2 (#214) | `io_guard.py` l.182, l.219, l.279, l.322, l.375-380, l.386-390 : états de lecture et de lancement propres au fil | addendum #214 l.38 |
| N-4 (#214) | `io_guard.py` l.25-31 : limites nommées (`stat`, `mkfifo`, `mknod`, `importlib.import_module`) | addendum #214 l.39 |
| N-5 (#214) | `compare_p2.py` l.11-12 | addendum #214 l.14 |
| N-6 (#214) | `compare_p2.py` l.70-71, l.197-198, en-tête l.16-17 ; `compare_check.py` l.116-117 (cas 33) | addendum #214 l.15 |
| N-1 (#217) | `fdlibm_log.py` l.69, l.183-185 | catchup-217 l.33-39 |
| N-2 (#217) | `fdlibm_log.py` l.9-11 ; `report.py` l.53 (`engine_log`, « on x64 ») | catchup-217 l.41-48 |
| N-3 (#217) | `report_check.py` l.141-149 (`stage` et ses fichiers de passe), l.170-171, l.186-187 (cas 10) | catchup-217 l.70-76 |
| N-4 (#217) | `report_check.py` l.334-374 (section 11) ; `report.py` l.373-374 (garde : `OUTSIDE` vide) | catchup-217 l.78-88 |
| N-5 (#217) | `io_guard.py` l.59-64, l.409-426 ; `report.py` l.167, l.478 ; `report_check.py` l.68, l.109 | catchup-217 l.106-117 |
| N-6 (#217) | `report.py` l.386 (`registry` sans `file`) | catchup-217 l.134-139 ; `2f28639f…` l.14 |
| empreintes, point 1 | `report.py` l.334-352 (`entries_of`) ; `report_check.py` l.203-204 | `cb00b19` l.11 |
| empreintes, point 2 | `report.py` l.354-368 (`cell_digests`), l.393 ; `report_check.py` l.213-245 | `cb00b19` l.12 ; `90c9474` l.21-22 |
| empreintes, point 3 | `report.py` l.56-65 (`RELEASE_1_CLASSES`), l.375-377, l.387 (`scope`) ; `test/kata-recalc.test.ts` l.144-175 | `619fcfe` l.8-18 ; `0d71d8f` l.8-13 |
| `ab352b0` | `report.py` l.364 (case sans ligne), l.379-380 (64 hex refusés), l.387 ; test l.167-168 (`short_digest`, case sans ligne) | `ab352b0` l.20-23, l.38-41, l.50-52 |
| voie 1 | `recalc_p2.py` l.9, l.214-258, l.522 ; `compare_p2.py` l.2-3, l.14, l.34 ; `compare_check.py` l.4-6, l.106-107 ; `report.py` l.43-55 (sans `outside_reason`), l.373-374, l.391-392 ; `report_check.py` l.33-35, l.132-134, l.178-179, l.304-332 | `76ffa25` décision 2 ; §8 de R1 |
| épingle | `test/kata-recalc.test.ts` l.50-60 ; en-tête l.12-17 ; test de la porte l.110-142 (forme, tueur déplacé, l.121) | §3.2 ; REPORT-TRIAL-HEAD-SENTENCE-1 |

**A-1, A-2, N-2 et N-4 de #214, N-5 de #217 (mission 1).**
- Forme des événements, sous 3.14.5 (`probe-import/ev_import.py`, `636f99a7…`) : une extension lève deux `import`, `(nom, None)` puis
  `(nom, chemin du .pyd)` ; un module intégré un seul, sans chemin ; `importlib.import_module` d'un intégré aucun. Règle (`_judge_import`) :
  chemin `None` et nom intégré hors de `NATIVE`, refus ; chemin présent, fichier sous la bibliothèque standard (jamais `site-packages`) ou
  sous l'arbre de l'outil, et nom dans `NATIVE` ; une source ou un bytecode reste jugé par son `open`.
- `NATIVE` mesurée : un journal d'imports posé par `sitecustomize` hors de l'outil (`measure/evlog/sitecustomize.py`, `12e49b78…`), 14
  courses de tous les scripts dans tous leurs modes sur un clone détaché à `09f49fc2` (`measure/measure.sh`, `c0e90a08…`), analysées par
  `measure/analyse.py` (`f817279f…`) : 80 processus, 52 noms importés après le crochet, 9 natifs (`_ast`, `_datetime`, `_json`, `_opcode`,
  `_sre`, `_struct`, `_tokenize` et `math`, intégrés ; `_wmi`, extension importée par `platform`). La trace d'une exception non rattrapée
  (`measure/crashtool/crash_probe.py`, `81693aae…`) ajoute `_suggestions` : dix noms. Au lot, 76 processus et les mêmes neuf ; la
  composition de `report.py` jusqu'au recalcul (`measure/measure-extra.sh`, `188ce12f…`) et `measure/analyse_procs.py` (`477ef0a5…`) : hors
  de `NATIVE`, seuls `_ctypes` et `faulthandler`, dans les enfants négatifs voulus de `guard_check.py`, refusés. 28 modules natifs chargés
  avant le crochet (`probe-pre/pre.py`, `a90f6c28…`). Sous POSIX, lu dans la source 3.14 de l'hôte et non mesuré : `subprocess` charge
  `_posixsubprocess`, `select` et `math` avant le crochet.
- `guard_check.py` (neuf, 265 lignes, script d'entrée : la liste de `kata_recalc_entry_scripts_import_the_input_guard_first` change,
  test l.92) : 18 cas, rejoués par la mission 2 (`runs/oracles-final1/guard-check.txt`, `73bed479…`, 0 échec). Refusés en sortie 4 : les
  trois `import` hors de la règle, `time.sleep` et `os.posix_spawn` hors d'un lancement (A-2), un événement de lancement levé par un
  autre fil et la lecture d'un autre fil (N-2), `git_tree` sans rôle, sur un autre dépôt ou relatif (N-5). Admis : un import de la liste,
  la trace d'une exception, `time.sleep` et `os.posix_spawn` dans un lancement, `git_tree` limité à l'arbre de l'outil. Trois mesures des
  limites qui restent : un intégré chargé par `importlib` sans événement, la famille `stat`, `os.mkfifo` absent sous Windows. Contre la
  garde de `09f49fc2`, les trois cas d'`import` chargent leur module (sortie 0, « LOADED ») ; mutants M1 à M4 tués (rapport de la
  mission 1). La sortie ne diffère de celle de la mission 1 (`F:/tmp/frozen-tool/oracles/final/`) que par les chemins du dossier de
  travail dans trois raisons de refus.

**N-5 et N-6 de #214 (`compare_p2.py`).**
- N-5 : le commentaire (l.11-12) dit que l'écriture d'un double compte pour un champ écrit en chaîne (`thresholds`), et que `json.loads`
  efface celle d'un nombre JSON.
- N-6 : `float()` d'un entier au-delà des doubles lève `OverflowError`, que la branche `except ValueError` ne prenait pas ; l'exception
  remontait, sortie 1 par la trace. La l.70-71 en fait une faute de structure (`STRUCTURE <case> <champ>: an integer beyond the range of a
  double`) et la l.197-198 donne la sortie 2 à toute faute de structure, dans une paire comme à la tête. `report.py` lit la ligne
  `STRUCTURE` et sort en 2 (`classify`, l.317-318). Cas 33 de `compare_check.py` : `calib.qhat` = 10^400, sortie 2. Contre le comparateur de
  `09f49fc2` : sortie 1 par la trace, le cas échoue (`runs/base-red/compare-check.txt`).

**N-1 et N-2 de #217 (`fdlibm_log.py`).**
- N-1 : `SPECIALS` (l.183-185) et `SIGNALING_NAN` (l.69) nomment leur plateforme, Windows x64. Le motif de Linux, `7ff4000000000000`
  pour `log(-1)`, `log(-inf)`, `log(-5e-324)` et `log(-NaN)`, est la mesure de RECHERCHES (catchup-217 l.34-39), citée et non rejouée.
  Aucun effet sur le rapport : le recensement du `log` ne compte que des rapports positifs (`report.py` l.306).
- N-2 : l.9-11 : « no fused multiply-add » vaut pour Node sur x64. Sur arm64, Node v24.21.0 n'est pas compilé avec `-ffp-contract=off`
  (`tools/v8_gypfiles/toolchain.gypi` l.307, l.328, lus par RECHERCHES, catchup-217 l.42-44 : [2nd] pour MONARK, demande de lecture
  formée plus bas). `TEXTS["engine_log"]` (`report.py` l.53) dit « on x64 ». Item REPORT-LOG-PORT-ARM64-1.

**N-3 et N-4 de #217 (`report_check.py`).** Tueurs de mutants : verts contre l'outil de la mission 1, prouvés par les mutants (plus bas).
- N-3, cas 10 (l.186-187) : B est la passe ln, et les deux fichiers de passe du cas portent `calib.n` + 1 sur une ligne (`stage`,
  l.141-149). Aucune passe n'est admissible, aucune différence n'est expliquée : sortie 1. Le mutant de RECHERCHES (`ok = {c: v for c, v in
  variants.items()}`, `report.py` l.325-326) rend la passe ln admissible : sortie 0, le cas échoue.
- N-4, section 11 (l.334-374) : `report.run()` mené au bout. Plateforme, identité, vecteurs du `log`, oracles, recalcul, séries et passes
  sont pris des sections 1, 3 et 5 (aucun commit, aucune série) ; les trois comparateurs enfants, le classement, l'assemblage et
  l'écriture de `report.json` tournent comme dans `report.py`. Trois courses : B = la passe ln, `report.json` écrit, son sha256 celui que
  rend `run()`, portée et cases comme en section 7 ; B avec `calib.n` + 1, `Failed(1)` et aucun `report.json` ; un `OUTSIDE` non vide
  (`calib.n`), `Failed(2)` et aucun `report.json`. Le `Failed(1)` avalé à l'appel de `classify` (l.451) fait écrire le rapport à la
  deuxième course ; la garde `C.OUTSIDE` retirée (l.373-374), à la troisième ; les deux mutants à la fois font échouer les deux.

**N-6 de #217 et son reste.**
- `registry.file` sort du rapport (`report.py` l.386) : le sha256 nomme le registre (décision de MONARK `2f28639f…` l.14, raison de Q-P3-5).
- Reste, mesuré : `inputs.compare[0].name` porte encore le nom de base passé à `--registry`, et `inputs.recompute` celui de `--vectors`
  (rôle `spec-vectors`). Sur le rapport de synthèse, renommer B de `wave1.json` en `B.json` change le sha256 (`5160891e…` → `c3ddb2ae…`,
  `scratch/report_shape.mjs`, `3bb07860…`) : le même registre sous un autre nom donne encore un autre `report_sha256`. Item
  REPORT-INPUT-NAMES-1 (plus bas), fermé par la mission 4 : une course sous un autre nom est refusée avant tout calcul.

**Les empreintes du rapport (points 1 à 3 de `cb00b19`, forme (a), `ab352b0`).**
- Point 1 : une entrée `differences` de genre digest ne porte plus d'empreinte (`report.py` l.349) : le champ, `first_index`, `terms`,
  `max_ulps` et la classe. `entries_of` vérifie encore que la ligne du comparateur porte les deux empreintes (l.345-348).
- Point 2 : `cells[].scores_sha256` (l.393), par `cell_digests` (l.354-368). Pour une classe de `RELEASE_1_CLASSES` dont la case fait une
  ligne de table, l'empreinte de B ; sinon `null`. C'est celle du recalcul quand la comparaison ne liste aucune différence sur la case
  (alors égale à celle de B) ; sinon celle de la passe qui l'explique, tenue à la ligne du comparateur (`A=<recalcul> B=<passe>`, sinon
  sortie 2) : jamais l'empreinte du `log` qui tourne quand elle n'est pas celle de B. Une case sans ligne de table (côté de direction sans
  seuils, `policy-projection.ts` l.85-93) porte `null` (l.364, prémisse V-2).
- Point 3, forme (a) : `RELEASE_1_CLASSES` (l.56-65), constante fermée et triée des 24 classes de bande (range, mae-down, mae-up) ; les 8
  classes de direction sont retenues. Le rapport écrit sa portée, `scope` (l.387 ; le nom que le G0 de la partie 3 supposait, Q-P3-12) ;
  une classe de la portée sans case refuse le rapport (l.375-377).
- `ab352b0` : une sous-chaîne de 64 hex sous `differences` refuse le rapport sans condition (l.379-380, prémisse V-3).
- Rapport de synthèse (`report_check.py` section 7, cas 02, B = la passe ln) : 280 cases ; 40 portent l'empreinte de B (les cases des 24
  classes de bande), dont 39 sont celles de la passe ln et non de la passe de base ; 240 sont `null`. 103 différences (88 empreintes, 15
  valeurs), sans empreinte. 62 902 octets, sha256 `5160891e…` (66 694 octets, `7f5913f7…`, avant le lot), écriture canonique ;
  `contentProblems` au chemin daté `contract-1.1.0-tables-2026-10-20/recompute/wave1-monark-kata-recalc.json`, sorte `json` : 0 problème
  (prémisse V-4, rejouée). Remplacé par la G2 : 62 961 octets, `3cf6a3f1…` (la phrase de la classe ln, le compte 363) ; `contentProblems`
  0, aller-retour canonique exact, mêmes chemins à 64 hex, 280 cases dont 40 avec empreinte, 103 différences (rejoués par la mission 3).
  Chemins qui portent 64 hex : `cells[].scores_sha256` (40), `inputs.recompute[].sha256` (5),
  `inputs.compare[].sha256`, `platform.libm.sha256`, `registry.sha256` et `tool.tree_sha256` (1 chacun) ; c'est la liste fermée de la
  clause (d5) de la partie 3, plus les cases ; rien sous `differences`.
- Registre (`scratch/classes.mjs`, `b981d8a8…` : `readRegistry`, `projectCell`, `digestProblems`, `tableRowProblems`) : 280 cases, 32
  classes, aucune case sans ligne ; 29 lignes refusées par `digestProblems`, toutes dans les quatre dir-4h (bnb 6, btc 9, eth 7, sol 7) ;
  le `short_digest` de la porte retient exactement ces quatre classes (prémisse V-1) ; les 24 classes de bande passent les deux. La règle
  du plancher reste celle du G7 du plancher (`docs/G7-lot-short-digest-floor.md` l.40).
- Test Node neuf, `kata_recalc_release_classes_are_the_published_bands` (test l.144-175). Il lit le bloc `RELEASE_1_CLASSES` de `report.py`
  et le registre `apps/harness/data/kata/registry/wave1.json`, puis rougit dans chaque sens : une classe absente du registre (l.169) ; une
  classe qui n'est pas une bande (Q-3, l.170) ; une bande qui manque (l.171) ; une classe que le plancher ou la porte retient : une ligne
  refusée par `digestProblems`, une case sans ligne, le `short_digest` de `tableRowProblems` (l.172) ; une liste non triée ou répétée
  (l.173) ; un compte autre que 24 (l.174). Le registre arrive par la PR 2 de R25-REGISTRY-ROOT-1, #228, fusionnée depuis dans
  `lot/etude-suite` (`1cddd2e5`, `wave1.json` `811fcd57…` au commit ; constat 4 de la G2, plus bas). La branche du lot part de `177b5755`,
  avant cette fusion : le test reste rouge dans le worktree (fichier absent, par assertion) tant que le tronc `lot/etude-suite` n'est pas
  fusionné dans la branche (fusion, sans rebase) avant la PR. Mesuré par la mission 3 : sur un clone à `1cddd2e5` où le lot est appliqué
  et indexé, registre suivi, 57 tests sur 57 (dont ce test) ; dans le clone à `09f49fc2`, registre copié non suivi, il est vert aussi.

**La chaîne des essais (voie 1).**
- `trial_order` (l.221-225, point 1 de la §8), `trials_of` (l.228-245, point 2) et `trial_chain` (l.248-258, points 3 à 5) ;
  `registry_text` (l.214-216) écrit leur tête, pour le recalcul (l.522) comme pour les trois passes de `report.py` (l.305, l.309).
- L'ordre est celui du point 1, quel que soit celui des lignes ; chaque essai a ses huit clés, lues sur les lignes de ses cases, qui
  doivent s'accorder ; son `trialId` doit être `<taskClass>|<kataId>|<venue>|<symbol>|<horizon>|CALIB` ; chaque ligne est dans un essai,
  aucun `trialId` ne se répète, un seul lieu sert la vague. Forme canonique : `json.dumps` à clés triées, sans espace, après le contrôle
  du point 3 (chaînes ASCII imprimables sans guillemet ni barre oblique inverse, entiers non négatifs). Chaîne : SHA-256 de `prev`, d'un
  saut de ligne et de la forme, depuis 64 zéros.
- Le lieu vient des lignes ; la chaîne n'a aucune constante de lieu. La constante `VENUE` de `recalc_p2.py` l.39 (lot 1d, Q-10, ADR l.28),
  qui écrit `venue`, `key` et `trialId` des cases, est antérieure : ce lot ne l'ajoute ni ne la retire (écart plus bas).
- Contrôle demandé par RECHERCHES (`76ffa25`) : l'outil recalcule 80 et `648709d0ae8e858e80a527b4b69cf6629f4f9fb7e8b4b5d15752bb7e383caa0e`
  à partir de ses propres essais. Course : `report_check.py` section 5, sur les quatre marches LCG (aucune série) ; les trois passes portent
  `{"length": 80, "hash": "648709d0…caa0e"}`. Les essais ne dépendent pas des bougies : la tête des passes synthétiques est celle des séries.
  Fumée : `scratch/head_smoke.py` (`67097202…`) sur 280 lignes d'identité écrites par `cells_of` : 80, `648709d0…`.
- Section 10 (l.304-332) : l'ordre du point 1, les huit clés, la même tête depuis les lignes renversées ; deux essais échangés, une clé
  renommée, une valeur changée donnent une autre empreinte ; refus d'une case d'un essai avec un autre lieu, d'une ligne hors essai, d'un
  essai sans case, d'une valeur avec un guillemet.
- En classe DECISION : `OUTSIDE = {}` (`compare_p2.py` l.34) ; `compare_check.py` cas 24 (sortie 1, `DECISION top-level
  trialRegistryHead.hash`) ; `report_check.py` cas 04 (B dont la tête change : « decision(s) differ », sortie 1).
- **REPORT-TRIAL-HEAD-SENTENCE-1 : fermé.** `TEXTS["outside_reason"]` et `fields.outside_decisions` sortent du rapport ; la garde
  d'`assemble` (l.373-374) refuse tout nom dans `OUTSIDE`. Le test de la porte affirme l'absence de la phrase (test l.121), et son tueur
  passe de `report.py:50` (la phrase retirée) à `report.py:48` (texte `decisions`, même opérateur, un nom d'item injecté).

**VERIFIER-REPORT-DIGESTS-1** (G0 de SHORT-DIGEST-INVERSION-1 §8 ; ETAT l.562-564).
- Fait côté outil : le rapport ne porte l'empreinte d'aucune case retenue ni d'aucune case sans ligne (`null`), aucune empreinte sous
  `differences` (refus sans condition), et sa portée ; ses digests de séries restent dans `inputs` (Q-7, publiés par décision).
- Reste à la partie 3 (G0 v3 de RECHERCHES) : la clause de dossier `recompute_report_digest`, (d1) à (d5), à la porte ;
  `readRecomputeReport` au contrat fermé, qui admet `scope`, et la remesure de la liste (d5) sur le rapport réel (lot 2a). Mesurée ici
  sur le rapport de synthèse (plus haut).

**IO-GUARD-NATIVE-READS-1** (PAROXYSME ; élargi par ce lot aux écritures, aux lancements et au réseau du code natif, addendum #214
l.27). Porteur : MONARK. Déclencheur inchangé : avant que la course de la partie 2 ne lise une série. Texte de la mission 1 :
- ce que la liste fermée ferme, mesuré : tout module natif chargé après le crochet hors de `NATIVE`, ou depuis un fichier hors de la
  bibliothèque standard et de l'arbre de l'outil, arrête la course à son import, avant d'agir. Les voies de RECHERCHES (Tcl : lancement,
  écriture, socket ; `ssl` : lecture ; `dbm` : écriture ; `pwd` : lecture ; un `.so` posé sur `sys.path`) passent toutes par un tel import ;
- ce qui reste : (a) le code natif admis, les dix modules de `NATIVE` et les 28 chargés avant le crochet, dont les fonctions hors de la
  table ne lèvent aucun événement. Mesuré : `os.stat`, `os.lstat`, `os.path.exists`, `os.path.getsize`, `os.access`, `os.path.realpath`
  et `os.readlink` ne lèvent rien (`probe-import/ev_stat.py`, `7b707030…`) ; sous POSIX, `os.mkfifo` et `os.mknod` créent un fichier hors
  des sorties (RECHERCHES, catchup-214 N-4, sonde g), absents sous Windows (mesuré). (b) Un module intégré chargé par
  `importlib.import_module` ne lève aucun `import` (mesuré : `xxsubtype`, `faulthandler` ; cas `residual-builtin-through-importlib`).
  (c) Rien de ce qui tourne avant le crochet n'est jugé : démarrage, `site`, fichiers `.pth`, `sitecustomize`, `PYTHONPATH`, imports
  d'`io_guard` ;
- constructions à chiffrer par la recherche, prix non mesurés : (a) une course bornée par le système : sous Linux, Landlock (lectures :
  entrées et bibliothèque standard ; écritures : sorties) avec seccomp ou un espace de noms réseau vide ; sous Windows, un AppContainer
  sans capacité réseau ou un objet Job ; à défaut, une liste des fichiers ouverts et des processus tenue par le système (ETW, strace),
  comparée aux entrées et aux sorties. (b) Une sentinelle posée par `io_guard` dans `sys.modules` pour chaque module intégré hors de la
  liste (estimation : une dizaine de lignes et un cas). (c) `python -I -S` dans la commande de rejeu, ce qui change `TEXTS["replay"]`,
  donc les octets du rapport, et le jugement des modules présents à la pose du crochet (estimation : une dizaine de lignes, un cas, une
  mesure sur un hôte tiers). Aucun contournement. Ce texte est repris du rapport entier de la mission 1, lu dans le journal du workflow
  (extrait `F:/tmp/frozen-tool/m3/inputs/journal-results.json`, `2ea6be36…`) : la mission 2 et le vérificateur l'avaient reçu tronqué ;
- ajouts de la G2 (mission 3) :
  - (a) `_winapi`, chargé avant le crochet, lit le registre de Windows et `os.getlogin` le nom d'utilisateur, sans événement : mesuré par le
    vérificateur et rejoué ici (`probe_preloaded.py`, `2a04ba23…`, sortie 0 sous la garde du lot). La table refuse les `winreg.*`, mais la
    même donnée passe par le code natif admis ; l'en-tête d'`io_guard.py` le nomme ;
  - (c) corrigé par mesure : `-I` implique `-P`, qui retire le dossier du script de `sys.path`, et l'outil ne trouve plus `io_guard`
    (`ModuleNotFoundError`, sortie 1, sous `-I -B` comme sous `-I -S -B`) ; `-E -s -B` passe (`vectors_check.py` vert). Le vérificateur
    a mesuré qu'un `sitecustomize` posé par `PYTHONPATH` neutralise la garde sans `-E`, et que `-E` le bloque (sortie 4). La forme viable est
    donc `-E -s -B` pour `kata-recalc` ; `kata-quarter` trouve `io_guard` par `PYTHONPATH`, ne peut pas prendre `-E`, et sa forme reste à
    écrire au G0 court de c1a ;
  - (c) décidé en partie (MONARK, 2026-10-07 ; écrit par la mission 4 à 10:0x UTC) : la commande de rejeu publiée prend la forme
    `python -E -s -B` (`TEXTS["replay"]`, `report.py` l.54), et chaque enfant d'`io_guard.run_tool` est lancé sous la même forme
    (`io_guard.py` l.413-417). Ce qu'elle ferme : les variables `PYTHON*` (dont `PYTHONPATH` et le `sitecustomize` qu'il porterait :
    mesuré) et le site utilisateur (`site.ENABLE_USER_SITE` faux sous `-s` : mesuré ; `usercustomize` n'est alors pas importé : lu dans
    `site.py` de 3.14.5, `a035d4c8…`, l.270-271 et l.716-717, non planté ici, le site utilisateur n'existant pas sur cet hôte et sa
    création écrivant sous C:), dans `report.py` et dans chacun de ses enfants (`vectors_check.py`, `binom_check.py`, `recalc_p2.py`,
    `compare_p2.py`), qui lisent les vecteurs, les séries et le registre. Sans le changement de
    `run_tool`, l'enfant d'un parent lancé sous `-E -s -B` tournait sous `-B` seul, et un `sitecustomize` posé par `PYTHONPATH` y
    tournait avant `io_guard` (sonde de la mission 4, avant et après, plus bas). Ce qui reste de (c) : le démarrage de l'interpréteur ;
    `site` lui-même (aucun `-S`) sur les dossiers de site de l'installation de base, `site.getsitepackages()` = le préfixe et
    `Lib\site-packages`, dont un fichier `.pth` ou un `sitecustomize` posé là tournerait avant le crochet (aucun sur cet hôte, mesuré) ;
    les imports d'`io_guard` lui-même ; la forme de `kata-quarter`, toujours à écrire au G0 court de c1a. La course bornée par le système
    de (a) couvrirait aussi ce reste ;
  - (c) avancé par la mission 5 (décision de MONARK du 2026-10-07, items 8 et 10 de `F:/tmp/dojo/frozen-tool-followup.md` ; CM-5
    v6.1) : la forme devient `python -E -S -s -B` (`FORM`, `io_guard.py` l.48), dans `TEXTS["replay"]` et pour chaque enfant de
    `run_tool` (l.433), et `io_guard` la contrôle à son import (l.44-57 ; paragraphe « Mission 5 »). Ce que `-S` ferme, mesuré sous
    3.14.5 : `site` n'est pas importé (absent de `sys.modules`), donc rien de ce qu'il ferait ne tourne, ni les `.pth` ni le
    `sitecustomize` du site-packages de base, ni le site utilisateur et son `usercustomize` ; un `sitecustomize.py` posé à côté des
    scripts d'une copie de l'arbre, ou dans un dossier que nomme `PYTHONPATH`, ne tourne pas (cas `launch form` ; B9). Ce qui reste : le
    démarrage de l'interpréteur, ses modules gelés et les modules natifs chargés avant le crochet (28 mesurés par la mission 1, sous
    l'ancienne forme) ; les
    imports d'`io_guard` lui-même, cherchés d'abord dans l'arbre de l'entrée (précision de la mission 6, ci-dessous) ; la bibliothèque
    standard crue telle qu'installée (point (d)) ; un lancement sous une autre forme, que
    le contrôle détecte sans le prévenir (ce qui tourne avant `io_guard`, un `sitecustomize` sous `PYTHONPATH` sans `-E` ni `-S` ou un
    module nommé par `PYTHONWARNINGS`, a déjà tourné quand le refus sort : mesuré, B8 et B9) ; les options sans champ de `sys.flags`
    (`-u`, `-x`, `-R`, `--check-hash-based-pycs`), mesurées sans effet sur les octets. La course bornée par le système de (a) couvrirait
    ce reste ; la forme de `kata-quarter` (l'entrée pose `sys.path[1]` puis importe `io_guard`, qui fait le contrôle) est écrite au G0
    de CM-5 (v6, acceptée par MONARK, `…-cm5-v6-234-n6.md` ; v6.2, `…-cm5-v6-2-237.md`).
  - (c) précisé par la mission 6 (constat m 1 du vérificateur de la mission 5, `F:/tmp/dojo/frozen-m5-verifier.json` ; ses mesures,
    sous `F:/tmp/frozen-tool/m5v/probes/`, lues et non rejouées : paragraphe « Mission 6 ») : les imports d'`io_guard` sont cherchés
    d'abord dans l'arbre de l'entrée, `sys.path[0]` étant le dossier du script. Sous la forme, `import io_guard` charge 41 modules,
    dont 18 depuis un chemin : `_hashlib`, `_py_warnings`, `_weakrefset`, `collections`, `contextlib`, `enum`, `functools`,
    `hashlib`, `keyword`, `locale`, `operator`, `reprlib`, `signal`, `subprocess`, `sysconfig`, `threading`, `types`, `warnings`
    (`shadow/preloaded.txt`) ; les modules gelés (`os`, `ntpath`, `stat`, `genericpath`, `abc`, `io`, `codecs`) et les modules
    intégrés n'y sont pas cherchés. Un fichier posé dans l'arbre de l'entrée sous l'un de ces 18 noms, ou un paquet `io_guard/` à côté
    d'`io_guard.py` (un paquet passe avant un module du même dossier), tourne donc sous la forme avant le crochet et avant le contrôle
    de la forme, et peut neutraliser la garde. Mesuré par le vérificateur (`shadow/shadow-runs.txt`, `pkg/PKG-WITNESS.txt`) : un
    `threading.py` témoin qui rend la main au vrai module laisse `vectors_check.py` sortir en 0, sa sortie égale à `8708d1ec…`, le
    crochet non posé quand il tourne ; le même fichier, `sys.addaudithook` rendu inerte, laisse passer `time.sleep` hors d'un lancement
    (`--case sleep-outside-spawn` : sortie 0, « SLEPT » ; 4 au lot) et une ouverture sous un troisième arbre (`--case third-tree-read` :
    sortie 1 par `FileNotFoundError` ; 4 au lot) ; le paquet `io_guard/` : sortie 0, `8708d1ec…`. Seul `tool_identity` de `report.py`
    (l.154-170, appelé par `run` avant tout enfant, l.414) le refuse, après coup : une entrée de plus ou un dossier dans l'arbre qui
    tourne, sortie 2, aucun rapport, sauf si le code qui a tourné se cache ; aucun autre script d'entrée n'appelle `tool_identity`, et
    une course d'oracle prise seule (mesuré sur `vectors_check.py`) ne le refuse pas. Même chose pour les deux arbres de `kata-quarter` :
    son entrée pose `sys.path[1]` sur `kata-recalc` puis importe `io_guard` ; les deux arbres passent avant la bibliothèque standard, et
    `homonyms` (`io_guard.py` l.445-448) ne compare les deux arbres qu'entre eux, jamais à la bibliothèque standard. Un cache forgé
    (en-tête d'`io_guard.py` l.33-36) est de la même classe : il faut écrire dans l'arbre. Item IO-GUARD-POSED-FILES-1 (paragraphe
    « Mission 6 »).
  - (d) neuf : la bibliothèque standard de l'interpréteur de base est crue telle qu'installée, et un fichier posé dans un `platstdlib`
    inscriptible y serait lu sans note (remarque du constat 5). Construction : la course bornée de (a), ou les fichiers de la bibliothèque
    lus notés par sha256 ; prix à chiffrer avec (a).

**Items formés ou changés par ce lot** (règle PAROXYSME).
- **REPORT-HELD-SET-PER-RELEASE-1**. Porteur : MONARK. Déclencheur : la release des lignes de direction. Objet : l'ensemble des classes
  publiées devient une entrée épinglée par release, lue dans le dossier daté, sous le même test Node appliqué à cette entrée ;
  `RELEASE_1_CLASSES` vaut l'ensemble de la première release (forme (a), `619fcfe` l.16-18 ; `0d71d8f` l.12-13).
- **REPORT-INPUT-NAMES-1** (PAROXYSME, reste de N-6). Porteur : MONARK. Limite : les noms de base passés à `--registry` et à `--vectors`
  entrent dans le rapport (`inputs`), donc dans `report_sha256` (mesuré plus haut). Constructions : refuser une course dont ces noms ne
  sont pas `wave1.json` et `vectors.json` (ceux de la commande de rejeu), ou retirer `name` de ces deux entrées ; la clause (d5) et
  `readRecomputeReport` de la partie 3 suivent la forme retenue. Prix : quelques lignes, un cas d'auto-test, une épingle. Déclencheur :
  avant le lot 1f, qui épingle l'arbre ; sinon une seconde révision de l'outil et son entrée de liste. Décision de MONARK demandée.
  Confirmé par la G2 (constat 2 du rapport, plus bas) ; la mission 3 ne tranche pas, la forme du rapport étant celle que lit la partie 3.
  Le détail des deux voies et leur prix sont dans le paragraphe de la G2.
  **Fermé le 2026-10-07 à 10:0x UTC (mission 4)**, décision de MONARK du même jour, voie (1) « refuser » : `report.py` (`main`, l.472-475)
  refuse une course dont le nom de base de `--registry` n'est pas exactement `wave1.json`, ou celui de `--vectors` pas exactement
  `vectors.json` (`NAMES`, l.464 : les noms de `TEXTS["replay"]`), avant tout calcul : sortie 2, la raison nommée, rien de lu ni d'écrit,
  la sortie jamais créée. La forme du rapport ne change pas (`inputs` garde `name`) : la clause (d5) et `readRecomputeReport` de la
  partie 3 restent valides. Preuve : avant, le même registre (`a78cc24a…`) sous `B.json` ou `WAVE1.JSON`, et les mêmes vecteurs
  (`7414b2fc…`) sous `spec-vectors.json`, donnaient par `report.run()` mené au bout trois autres `report_sha256` (`02a3728a…`,
  `917494da…`, `0d8953d4…`, contre `357682e6…` sous les noms de la commande), chacun égal au premier une fois le nom remis ; maintenant
  chacune de ces courses est refusée, et quatre contrôles de `report_check.py` le tiennent (paragraphe « Mission 4 »).
- **REPORT-LOG-PORT-ARM64-1** (PAROXYSME, N-2 de #217). Porteur : MONARK, avec RECHERCHES. Limite : le portage est le `log` de Node sur
  x64 ; un registre écrit par Node sur arm64, où les produits et les sommes peuvent fusionner, ferait reposer la classe ln sur un `log` qui
  n'est pas celui du générateur. Constructions : épingler dans la provenance de chaque registre la plateforme du générateur (système,
  architecture, Node) et refuser la classe ln hors de x64 ; ou mesurer `Math.log` de Node sur arm64 contre les 2 122 614 entrées de
  `fdlibm_log.VECTORS` et porter une variante fusionnée si elles diffèrent. Prix : une ligne de provenance par registre ; ou un hôte arm64
  (procurement) et environ 10 s de mesure. Déclencheur : avant la course réelle de la partie 2, la plateforme du générateur de
  `wave1.json` devant y être nommée (`PROVENANCE-wave1.md` ne nomme pas le Node qui l'a écrit, §15).
- **Demande de lecture formée** (N-2 de #217, [2nd] pour MONARK) : lire sur place `tools/v8_gypfiles/toolchain.gypi` de Node v24.21.0,
  l.307 et l.328 (`https://raw.githubusercontent.com/nodejs/node/v24.21.0/tools/v8_gypfiles/toolchain.gypi`), et les consigner dans un
  fichier de FAITS daté, comme les sources de V8 au §15. Usage : la phrase de `fdlibm_log.py` l.9-11 et l'item ci-dessus. Tentative : aucune
  par le worker, la lecture primaire revenant à l'orchestrateur (§10 de CLAUDE.md, écart du §15).
- **IO-GUARD-NATIVE-READS-1** : élargi (plus haut). **REPORT-TRIAL-HEAD-SENTENCE-1** : fermé. **VERIFIER-REPORT-DIGESTS-1** : fait côté outil,
  reste à la partie 3. **TRIAL-HEAD-WRITTEN-1** : côté outil, la chaîne est calculée et comparée ; la publication de la révision datée de
  KATA-SPEC qui porte la §8 reste à RECHERCHES.

**Mesures** (`python -B`, hors ligne ; aucune série lue).
- Oracles et auto-tests sur l'outil du worktree (`scratch/oracles.sh`, `0707da28…` ; `runs/oracles-final1/`, de 06:50 à 06:55 UTC),
  chacun en sortie 0, stderr vide. Égales à l'octet à celles de la mission 1 (`F:/tmp/frozen-tool/oracles/final/`) : `vectors-check.txt`
  `43d88e25…`, `binom-check.txt` `63606d4f…`, `hikae-replay.txt` `68e16302…`, `registry-binom-check.txt` `bf9412ba…`, la fumée du lot 1d
  `92017cbd…`. Différentes, chaque écart expliqué : `compare-check.txt` (`0fd01f9e…`, 33 cas : le cas 24 devient une décision, le cas 33
  s'ajoute) ; `report-check.txt` (`883a353d…`, 63 contrôles au lieu de 47 : seize lignes ajoutées, deux changées, celles que décrit ce
  paragraphe ; aucune autre ne bouge) ; `guard-check.txt` (`73bed479…` : les chemins du dossier de travail) ; le rapport de synthèse
  (`5160891e…`, sa forme).
- Node, clone indexé : `test/kata-recalc.test.ts` et `test/byte-guard.test.ts`, 21 sur 21 ; avec `apps/harness/test/*.test.ts` (38
  fichiers), `test/short-digest-floor.test.ts` et `test/spec-1-1-0-release.test.ts` : 331 tests, 330 verts, 1 sauté sous win32
  (`a_failed_write_gives_back_the_mode_of_the_files_it_replaced`), 0 rouge.
- Worktree : `tsc --noEmit` 0 ; `eslint test/kata-recalc.test.ts` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (348 fichiers ; 361 avec
  les douze `.py` et le fichier de test en cibles) ; `lang-gate` 0 ; `export-public --check` 0. winlint (`--repo` le clone, `--files`,
  contenu entier) : les neuf fichiers de code du lot, aucun risque ; ce G0 entier, quatre W1 sur des lignes antérieures (l.232, l.586,
  l.731, l.828 : deux noms de périphérique de Windows entre accents graves), aucun dans ce §17 (la mission 3 a retiré de cette phrase les
  deux noms cités, qui y faisaient un cinquième W1) ; en mode diff, winlint ne lit le texte que des fichiers de code.
  En mode diff (`--base 09f49fc2`), il ne voit rien ici : le lot est indexé, pas committé.
- Épingle d'arbre : `2fb204ddd563c6a7da479b5053f7a159d1c701816ca8db278f79f0e2f35e91a4` (douze fichiers ; `289756d3…` avant), mesurée par
  la boucle `sha256sum` sur l'arbre de travail et par le test d'arbre sur l'index du clone. Aucun `__pycache__`. Remplacée par la G2 :
  `08b00ed1…` (plus bas).

**Rougeur à la base.**
- Python, contre l'outil de la mission 1 (`base-red/`, le choix de base : le nouveau `report_check.py` déclare le rôle `tool-tree` et
  appelle `git_tree` sous la signature de la mission 1, que `09f49fc2` refuse) : `report_check.py` sort en 1, RED, six échecs (la tête
  des passes, le cas 04, `differences` sans empreinte, l'assemblage du rapport, la chaîne des essais, `run()` au bout avec B = la passe ln) ;
  `compare_check.py` contre le comparateur de `09f49fc2` (identique à celui de la mission 1, `6d989edb…`) : RED, cas 24 et 33.
- Node, le fichier de test neuf sur deux clones, à `09f49fc2` et à `177b5755`, registre copié : quatre tests rouges par assertion
  (`ERR_ASSERTION`) aux deux bases, chacun pour sa raison : l'épingle, la liste des scripts d'entrée (`guard_check.py`), la phrase de la tête
  (test l.121), le bloc `RELEASE_1_CLASSES` absent ; le test de langue reste vert (corps inchangé, non jugé).
- Tueurs tirés à la main sur le clone (`scratch/fire-killers.mjs`, `29ec125f…` ; fichiers rendus, sha256 égaux avant et après) : les cinq
  tueurs du fichier (`kata_lib.py:265`, `lang-gate.mjs:107`, `recalc_p2.py:12`, `report.py:48`, `report.py:62`), chacun rouge par assertion ;
  et cinq tirs de plus sur le test neuf, chacun rouge par assertion : une classe dir-4h ajoutée, une bande retirée, une classe absente du
  registre, deux classes inversées, et une ligne de bande du registre copié dont `auxSha256` n'est pas ses scores (refusée par
  `digestProblems`).
- Mutants (`scratch/mutants.py`, `4df5c75e…`, de 06:49 à 06:58 UTC, quatre clones en parallèle, chaque fichier rendu et vérifié) : 18 sur
  18 tués. `report_check.py` tue N-3 (cas 10), N-4 (le `Failed(1)` avalé ; la garde `OUTSIDE` retirée ; les deux), les empreintes (une
  empreinte remise sous `differences` ; le filtre de portée retiré ; l'empreinte de base toujours ; le refus de 64 hex retiré ; le nom du
  registre remis ; la portée retirée) et la chaîne (deux familles de katas échangées dans l'ordre ; `block` renommé ; `W` + 1 ; `prev`
  initial changé ; le saut de ligne retiré). `compare_check.py` tue `OUTSIDE` remis (aussi `report_check.py`), `OverflowError` non pris, la
  faute de structure qui ne sort pas en 2.

**R-25**, forme de la CI (`ci.yml` l.100) sur l'index du clone : contre `177b5755`, 12 fichiers, **847** (borne 1 205) ; contre
`09f49fc2`, le lot seul, 9 fichiers, 780 (mission 1 : 400) ; après la G2 : 1 067 et 1 000 (plus bas). Le G0 n'entre pas dans le compte
(`docs/**/*.md` exclus), ni le registre (`apps/harness/data/kata/registry/**/*.json` exclus, et non suivi ici). Aucune autre borne de lot
au chantier (§5 : chaque PR sous 1 205).

**Écarts au G0.**
- Le rapport garde le format `monark-recompute-report-v1` alors que ses clés changent (`scope`, `cells[].scores_sha256` ; `registry.file`,
  `fields.outside_decisions` et les empreintes des différences retirés) : aucun rapport n'est publié et `readRecomputeReport` (lot 2a)
  n'est pas écrit.
- La constante `VENUE` de `recalc_p2.py` l.39 reste (voie 1, plus haut). Si « aucune constante de lieu dans l'outil » doit la viser, son
  retrait change les clés et les `trialId` des 280 cases : décision de MONARK demandée.
- Le test Node neuf lit un fichier que ce lot ne verse pas : #228 l'a versé dans `lot/etude-suite` (`1cddd2e5`) ; rouge dans le worktree tant
  que le tronc n'est pas fusionné dans la branche (fusion, sans rebase) avant la PR (constat 4 de la G2).
- Les points pris de `ab352b0` (portée, `null` sans ligne, `short_digest`, 64 hex, rejeu de la porte) ne figuraient pas dans la mission ;
  ils viennent de la décision de MONARK citée et du G0 v3 de la partie 3.
- Le test de la porte change de corps (forme du rapport) : pour qu'il reste jugeable par red-proof, il porte une assertion neuve (test
  l.121), rouge à la base.
- Mission 2 : aucune lecture de source en ligne ; les faits de V8 et de Node viennent du §15 et de RECHERCHES, cités.

**Scripts de preuve** (sous `F:/tmp/frozen-tool/m2/scratch/`, hors du lot, sha256) : `sync.sh` `322d3947…`, `oracles.sh` `0707da28…`,
`r25.sh` `50dc8736…`, `mutants.py` `4df5c75e…`, `fire-killers.mjs` `29ec125f…`, `classes.mjs` `b981d8a8…`, `report_shape.mjs` `3bb07860…`,
`head_smoke.py` `67097202…` ; de la mission 1, sous `F:/tmp/frozen-tool/` : ceux cités plus haut, et `link-node-modules.mjs`.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : seul `GIT_EDITOR`, posé par le harnais), aucun `--write-tree`.
  `git clone --shared`, `checkout --detach` et `git add` dans les clones de `F:/tmp/frozen-tool/m2/` seulement ; dans le worktree, des
  lectures (`diff`, `status`, `show`, `log`, `rev-parse`). Rien n'est écrit sur C: (`ucrtbase.dll` y est lu par l'auto-test, sous le rôle
  `libm`).

**G2 des vérificateurs (mission 3).** Deux instances neuves `claude-opus-5-5` (effort max), lentilles « garde » et « rapport » : CORRECTIONS
chacune ; onze constats, un M et dix m. La mission 3 les a reçus coupés au milieu du constat 4 du rapport ; le reste (fin du 4, constat 5)
et le rapport entier de la mission 1 viennent du journal du workflow (extrait `F:/tmp/frozen-tool/m3/inputs/journal-results.json`,
`2ea6be36…`). Worker `claude-opus-5-5` (effort max), horloge de 07:57 à 09:0x UTC (tampons de `now.mjs` : 07:57, 08:37, 08:49, 08:55,
08:57, 09:02, 09:05). Aucun constat n'est réfuté. Les preuves sont sous `F:/tmp/frozen-tool/m3/` (`runs/`, `scratch/`, `probes/`, `layout/`) ; les sondes
du vérificateur sont rejouées sans modification (`F:/tmp/frozen-tool-verify/probes/`), contre la garde du lot et contre celle d'avant la
G2 (`base-lot/`, l'outil du worktree copié avant toute écriture de la mission 3, `base-lot.sha256`).

| Constat | Verdict et pli | Preuve |
|---|---|---|
| garde 1 (M) : le git enfant rapatrie un objet manquant d'un clone partiel | plié : `_git` passe `GIT_NO_LAZY_FETCH=1` (`git.html` de git 2.55.0, `8d0eee7d…` : « equivalent to setting the GIT_NO_LAZY_FETCH environment variable to 1 ») ; la variable plutôt que l'option `--no-lazy-fetch`, qu'un git plus ancien refuserait même sur un clone plein | cas `git-no-lazy-fetch` : « NOT FETCHED, STILL MISSING » ; à la base « FETCHED », objet présent après (`--no-lazy-fetch cat-file -e`) ; mutant tué ; `probe_lazy.py` (`c8c1d1bb…`) : objet absent avant et après au lot, rapatrié à la base |
| garde 2 : un flux NTFS de l'arbre lu sans note | plié : sous Windows, `_judge_open` refuse un chemin qui nomme un flux (deux-points après le lecteur, sur le nom donné et sur le chemin résolu, car `realpath` efface `::$DATA` : `stream_paths.py`, `881bd24d…`) | cas `ntfs-stream` refusé, lu à la base (25 644 octets) ; mutant tué ; `probe_ads.py` (`4d8081c5…`) : sortie 4 au lot, flux lu à la base |
| garde 3 : la fenêtre de lancement admet toute création de processus | plié : `_CREATE` (`_winapi.CreateProcess`, `_posixsubprocess.fork_exec`, `os.posix_spawn`) passe de « spawn » à « jugé » : une seule création après le Popen jugé du lancement, sur le fil qui lance ; sous POSIX, un argument doit être la liste épinglée (`subprocess.py` de 3.14.5, `a7b6bdf4…`, l.1819 et l.1920, lu, non mesuré ici) ; sous Windows, nom d'application et dossier `None` | quatre cas refusés au lot, admis à la base ; quatre mutants tués ; `probe_spawn_window.py` (`cda634dc…`) : sortie 4 et aucun marqueur au lot, marqueur écrit à la base ; reste : item IO-GUARD-CREATE-CMDLINE-1 |
| garde 4 : la limite IO-GUARD-NATIVE-READS-1 a d'autres exemples | plié en texte : en-tête d'`io_guard.py` et item (registre par `_winapi`, `os.getlogin`) | `probe_preloaded.py` (`2a04ba23…`) : sortie 0 au lot comme à la base, la limite reste déclarée |
| garde 5 : `_STDLIB` d'un environnement virtuel | plié : `io_guard` refuse un environnement virtuel à l'import, avant le crochet (premier correctif du constat) | venv `F:/tmp/frozen-tool/m3/venv`, `probe_venv.py` (`4d46a204…`) : sortie 4 à l'import au lot ; à la base, `_STDLIB` tient `venv\lib` et la lecture passe sans note (`runs/venv.txt`, `0e283abc…`) ; aucun cas d'auto-test (un enfant ne change pas son préfixe) |
| garde 6 : quatre points ne se mesurent que sous Linux | pas un défaut : consignés [2nd] ci-dessous, avec leur mesure de première main formée | course Linux de RECHERCHES à la G2 de la partie 1 (demande `outil-fige-r3` l.22-26, `85cfc37e…` ; accord `recu-outil-fige` l.6-9, `9e8d4d71…`) |
| rapport 1 : quatre gardes qu'aucun cas n'atteint | plié : quatre contrôles, sections 7 et 10 de `report_check.py` | les mutants du vérificateur (`mutants.py`, `baa55421…`) : 20 sur 20 tués ; les quatre survivants rejoués sur l'arbre final (`runs/rmut-final/`), chacun tué par son contrôle |
| rapport 2 : REPORT-INPUT-NAMES-1 | confirmé, non tranché : la forme du rapport est celle que lit la partie 3 ; voies et prix ci-dessous ; fermé depuis par la mission 4 (voie 1) | mesure du vérificateur (`names.mjs`, `c6fbe645…`) |
| rapport 3 : l'épingle est provisoire (contrat de l'outil figé ; `reason_order`) | plié : (a) et (b) ci-dessous | ci-dessous |
| rapport 4 : §17 périmé et tronqué | plié : registre fusionné (texte du test des classes et écart), IO-GUARD-NATIVE-READS-1 complété | clone à `1cddd2e5`, lot appliqué et indexé : 57 sur 57 |
| rapport 5 : « an earlier replay under that runtime itself » | plié : `TEXTS["explained, ln"]` dit ce qui a été mesuré, « an earlier replay under the logarithm of Node v24.15.0 itself, whose source is that of v24.21.0 » (RAPPORT de P2b l.7 ; §15, onze fichiers de V8 égaux) | test de la porte vert ; rapport de synthèse 62 961 octets, `3cf6a3f1…` (+59 octets, la phrase) |

- **Rapport 3 (a), le contrat de l'outil figé** (MONARK, `ecace80` l.17-26, et `26ae460` l.6-13, avant la PR) :
  - `TREES` (`io_guard.py` l.47), liste fermée de deux arbres de code : `tools/kata-recalc`, puis `tools/kata-quarter`, pris à côté du premier
    sans le résoudre ; lecture et listage admis sous les deux (`_judge_open`, `_judge_list`) ; `output()` refusé dans les deux ; le refus
    du cache de bytecode étendu aux deux ; un arbre absent admis ; un troisième arbre refusé (aucune règle ne l'admet) ;
  - un module du second arbre homonyme d'un module du premier est un refus nommé, à l'import, avant le crochet (`homonyms`) ;
  - le rôle `served-history`, avec un tiret ;
  - `run_tool` et `git_tree` inchangés, sur `kata-recalc` ;
  - test neuf `kata_recalc_guard_admits_two_trees_of_code` (« un test rougit sur un troisième arbre ») : la liste lue dans `io_guard.py`,
    et aucun fichier de l'index sous `tools/` hors des deux arbres ; tueur `io_guard.py:47`, un troisième arbre ajouté ;
  - mesuré sur des copies (`layout/layout.sh`, `3c8a4b6c…` ; `runs/layout-lot.txt`, `d9dc2ab2…`) : deux modules dans `kata-quarter`, `io_guard`
    trouvé par `PYTHONPATH`, sortie 0 (à la base, sortie 4 sur le `.pyc` du module frère, le N1 du G0 de CM-5) ; un cache dans le second
    arbre, sortie 4 à l'import ; un homonyme `kata_lib.py`, sortie 4 à l'import ; le second arbre absent, `vectors_check.py` vert ;
  - pour CM-5 : `git_tree` reste sur `kata-recalc` (contrat, l.23). L'identité de `kata-quarter` au relevé (G0 de CM-5 v3 §5.2 (D) :
    « `io_guard.git_tree` sur `tools/kata-recalc` et sur `tools/kata-quarter` ») ne passe donc pas par `io_guard` : à dire à RECHERCHES.
- **Rapport 3 (b), `reason_order` : voie (i).** R1 est figé (`ea64d03e…`, accord de MONARK `f089150`), et `kata/spec/vectors.json` vaut déjà
  `7414b2fc…` à la tête de RECHERCHES (depuis `281a27a`), alors que `KATA-SPEC.md` y est encore la version du 2026-10-02 (`b32a4062…`, 333).
  - `vectors_check.py` lit `reason_order` (R1 §6 l.71) : trois cas de direction, recalculés par `recalc_p2.calibrate_cell` sur des points
    CALIB construits à la main, comme la section 9 de `report_check.py` ; dix contrôles par cas (n0, n, misses, kStar, p_served, qhat par le
    moteur et par misses ≤ kStar, check1, check2, raison) ; `SPEC_CHECKS` = 363 (l.75) ; les clés du fichier forment une liste fermée,
    et une section inconnue le refuse ; la ligne de compte cite « KATA-SPEC section 6 », et l'expression de `report.oracles_of` suit.
  - Mesures (`runs/oracles-final2/`) : 7414b2fc, 363 contrôles, 0 échec, GREEN ; 06ecf069, RED (333 pour 363) ; la même section contre
    l'outil de `177b5755`, RED sur la seule raison de `constant_before_reject` (`runs/vc-177.txt`, `0342c766…`) ; une clé en plus, RED
    (`vectors-extra`, `e282d2a2…`) ; le `vectors_check.py` d'avant la G2 sur 7414b2fc, GREEN « 333 », la mesure du vérificateur rejouée.
  - Écart : l'outil refuse désormais les vecteurs du 2026-10-02 ; la course réelle de la partie 2 lira ceux de la révision figée. Le vecteur
    de KATA-SPEC-REASON-ORDER-1 est aussi vérifié par l'outil (30 contrôles).
- **Rapport 2, REPORT-INPUT-NAMES-1 : les deux voies.** (1) refuser une course dont `--registry` ne s'appelle pas `wave1.json` ou `--vectors`
  pas `vectors.json` : trois lignes dans `report.run`, `TEXTS["replay"]` qui le dit, deux appels de `report_check.py` à renommer (section 8,
  `no-vectors.json` ; section 11, le dossier de travail passé en `vectors`) et un contrôle ; la forme du rapport ne bouge pas. (2) retirer
  `name` de ces deux entrées : la forme change, la clause (d5) et `readRecomputeReport` suivent. Recommandation du worker : (1). Décision
  de MONARK avant la PR, l'épingle bougeant alors une fois de plus dans le lot. Décidé (MONARK, 2026-10-07) : (1), mais dans `main`, au
  plus près de la lecture des arguments, et non dans `report.run` ; la section 11 n'est donc pas renommée (paragraphe « Mission 4 »).
- **Garde 6, les points de Linux, [2nd]** : (1) `os.posix_spawn` et `time.sleep` levés par `subprocess` sous POSIX (A-2, mesure de RECHERCHES) ;
  (2) `_posixsubprocess`, `select` et `math` chargés avant le crochet sous POSIX (lu dans la source 3.14, non mesuré) ; (3) `os.mkfifo` et
  `os.mknod` hors des sorties (catchup-214, sonde g) ; (4) le NaN `7ff4000000000000` de `SPECIALS` (catchup-217 l.34-39). Prédictions
  écrites avant la course Linux, jamais reportées comme des faits : les lancements d'io_guard passent le jugement des créations (la liste
  d'arguments de `subprocess` est l'argv épinglé) ; `git-no-lazy-fetch` vert si le git de l'hôte connaît la variable ; `ntfs-stream` sauté ;
  `residual-mkfifo` « MADE WITHOUT AN EVENT » ; `guard_check.py` est à ajouter à la liste de cette course (demande de la mission 1).
- **Remarque du rapport 1, la 281e ligne** : non pliée ; `trials_of` admet une ligne qui double une case, mais `compare_p2.py` refuse les
  doublons (faute de structure) et `recalc_p2.main` exige 280 cases distinctes (l.515), avant toute chaîne.

**Items formés ou changés par la G2** (règle PAROXYSME).
- **IO-GUARD-CREATE-CMDLINE-1** (PAROXYSME, neuf). Porteur : MONARK. Limite : sous Windows, la ligne de commande d'une création de processus
  ne se lit pas dans l'événement : 3.14.5 donne un seul caractère à sa place (`'\x01'`, `'\x02'`, mesuré par `create_args.py`, `e927edeb…`,
  cause non lue dans le source C) ; sous POSIX, le chemin du programme de `os.posix_spawn` et de `_posixsubprocess.fork_exec` n'est pas
  épinglé (non mesuré ici). Une création faite juste après le Popen d'un lancement, avec un autre programme, passerait. Constructions :
  envelopper `_winapi.CreateProcess` dans `io_guard` (la ligne lue en Python avant l'appel ; environ six lignes, un cas, l'épingle) ;
  signaler l'événement à CPython et l'épingler une fois corrigé ; sous POSIX, épingler le programme après la mesure de leurs arguments par
  la course Linux de RECHERCHES. Déclencheur : cette course Linux, et au plus tard avant la course réelle de la partie 2.
- **IO-GUARD-PARTIAL-CLONE-1** (PAROXYSME, neuf, reste du constat garde 1). Porteur : MONARK. Limite : un git qui ignorerait
  `GIT_NO_LAZY_FETCH` rapatrierait encore dans un clone partiel ; mesuré ici sur git 2.55.0 seulement, et le cas `git-no-lazy-fetch` le
  montre sur chaque hôte où `guard_check.py` tourne. Construction : refuser un clone partiel (`remote.<nom>.promisor` ou
  `extensions.partialclone` à la lecture de `git config`, mesuré sur le clone partiel : `remote.origin.promisor=true`) dans `git_tree` et
  `git_show` ; environ huit lignes, un cas, l'épingle. Déclencheur : avant un rejeu sur un hôte dont le git n'est pas mesuré
  (VERIFIER-PUBLIC-REPLAY-1).
- **IO-GUARD-NATIVE-READS-1** : complété et élargi (plus haut : (a) le registre et `os.getlogin`, (c) corrigé par mesure, (d) neuf) ;
  (c) décidé en partie par la mission 4 (`-E -s -B`, plus haut).
- **REPORT-INPUT-NAMES-1** : confirmé, décision de MONARK ; fermé par la mission 4. **KATA-SPEC-REASON-ORDER-1** : le vecteur est aussi
  vérifié par l'outil.

**Mesures de la G2** (`python -B`, hors ligne ; aucune série lue).
- Oracles et auto-tests sur l'outil final (`scratch/oracles.sh`, `c32916d8…` ; `runs/oracles-final2/`, de 08:52 à 08:55 UTC), stderr vides :
  égales à l'octet à celles de la mission 2, `binom-check.txt` `63606d4f…`, `hikae-replay.txt` `68e16302…`, `registry-binom-check.txt`
  `bf9412ba…`, `compare-check.txt` `0fd01f9e…`, la fumée `92017cbd…`. Différentes, chaque écart expliqué : `vectors-check.txt` (`8708d1ec…`,
  les vecteurs de R1, trois sections et la ligne de compte) ; `report-check.txt` (`dcce46a2…`, 67 contrôles au lieu de 63, quatre lignes
  ajoutées et rien d'autre) ; `guard-check.txt` (28 cas et les homonymes, au lieu de 18 ; dix cas et une ligne ajoutés, des chemins) ;
  rapport de synthèse `3cf6a3f1…`, 62 961 octets, mêmes octets sur deux courses. Après ces courses, une ligne de commentaire
  (« reddened by: » de la liste fermée) est ajoutée à `vectors_check.py` : relancé sur les trois fichiers de vecteurs, mêmes octets
  (`runs/vc-final/`) ; épingle, Node du fichier de test, tueurs (`runs/killers2/`, mêmes octets) et R-25 remesurés après elle.
- Rougeur à la base : `guard_check.py` neuf contre la garde d'avant la G2 (`base-red/`, clone à `09f49fc2` et l'outil de `base-lot/`) : RED,
  dix échecs, exactement les cas de la G2 (`runs/gc-base.txt`, `d6aaefdc…`) ; `vectors_check.py` neuf contre l'outil de `177b5755` : RED
  (plus haut). Mutants de la garde (`scratch/guard_mutants.py`, `4bf11f7c…`) : onze sur onze tués, chacun par son cas, fichier rendu.
- Node, clone à `09f49fc2` (lot indexé, registre copié non suivi) : `kata-recalc` et `byte-guard` 22 sur 22 ; avec `apps/harness/test/*.test.ts`,
  `short-digest-floor` et `spec-1-1-0-release` : 332 tests, 331 verts, 1 sauté sous win32, 0 rouge (`runs/node-wide.txt`, `9982c091…`).
  Fichier de test neuf à `09f49fc2` et à `177b5755` : cinq tests rouges par `ERR_ASSERTION` aux deux bases (épingle, scripts d'entrée, liste
  `TREES` absente, phrase de la tête, bloc `RELEASE_1_CLASSES`) ; le test de langue reste vert. Tueurs tirés sur le clone
  (`scratch/fire-killers.mjs`, `bd66dacb…`, copie de celui de la mission 2 avec le test neuf ; `runs/killers/killers.txt`, `230e52eb…`) :
  les six tueurs du fichier et cinq tirs de plus, chacun rouge par assertion, fichiers rendus. Clone à `1cddd2e5` : 57 sur 57.
- Épingle d'arbre : `08b00ed1e6cf92f3343692e6abf6c85282c185b42f0f340c5b5184a3f08fbf20` (douze fichiers ; `2fb204dd…` avant la G2), mesurée
  par la boucle `sha256sum` sur l'arbre de travail, sur l'index du clone et par `manifestText` (`scratch/pin.sh`, `b207bf2b…`). Changent :
  `io_guard.py` (`c6a56b94…`), `guard_check.py` (`e606a098…`), `vectors_check.py` (`bb81674c…`), `report.py` (`f8bf64e1…`),
  `report_check.py` (`0eed166d…`) ; les lignes des tueurs `report.py:48` et `:62` ne bougent pas. Aucun `__pycache__`. Remplacée par la
  mission 4 : `ca63fb3c…` (plus bas).
- **R-25** (`scratch/r25.sh`, celui de la mission 2) : contre `177b5755`, 13 fichiers, 926 insertions, 141 suppressions, **1 067** (borne
  1 205) ; contre `09f49fc2`, le lot seul, 10 fichiers, 1 000. La G2 en ajoute 220. Après la mission 4 : 1 120 contre `1cddd2e5`, 1 053
  contre `09f49fc2` (plus bas).
- Worktree : `tsc --noEmit` 0 ; `eslint test/kata-recalc.test.ts` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (348 fichiers ; 361 avec les
  douze `.py` et le fichier de test en cibles) ; `lang-gate` 0 ; `export-public --check` 0 ; winlint (`--files`, contenu entier, `--repo` le
  worktree, sous lequel `--files` lit) : les treize fichiers de code, aucun risque ; ce G0, les quatre W1 antérieurs (l.232, l.586, l.731,
  l.828), aucun dans ce §17.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : 0), aucun `--write-tree`. `git clone --shared`, `checkout --detach` et
  `git add` dans les clones de `F:/tmp/frozen-tool/m3/` seulement ; clones partiels de mesure sous `F:/tmp/frozen-tool/m3/` ; dans le
  worktree, des lectures (`diff`, `status`, `archive`, `rev-parse`, `merge-base --is-ancestor`). Rien n'est écrit sur C: (`ucrtbase.dll` et la
  bibliothèque standard y sont lus).

**Mission 4 : REPORT-INPUT-NAMES-1 fermé, et la forme `python -E -s -B`.** Worker `claude-opus-5-5` (effort max), horloge de 09:09 à
10:1x UTC (tampons de `now.mjs` : 09:09, 09:19, 09:26, 09:30, 09:36, 09:39, 09:45, 09:47, 09:56, 09:59, 10:00, 10:03, 10:05, 10:06,
10:09, 10:10). Deux
décisions de MONARK du 2026-10-07, reçues dans la mission : la voie « refuser » du constat 2 du rapport (REPORT-INPUT-NAMES-1) ; sous
IO-GUARD-NATIVE-READS-1 (c), la forme `python -E -s -B` de la commande de rejeu publiée (`-I` écarté : il casse l'import d'`io_guard`,
mesuré par la mission 3). Lus d'abord : ce §17 (paragraphe de la G2, rapport 2) et la mesure du vérificateur (`names.mjs`, `c6fbe645…`).
Départ : l'arbre de travail tel que la mission 3 l'a laissé, copié avant toute écriture (`F:/tmp/frozen-tool/m4/base-m3/`,
`base-m3.sha256`, `649e4f0f…`) ; ses fichiers ont les sha256 donnés plus haut (`report.py` `f8bf64e1…`, `report_check.py` `0eed166d…`,
`io_guard.py` `c6a56b94…`, `guard_check.py` `e606a098…`) : aucune course antérieure n'avait touché `report.py` ni `report_check.py`.
Sorties sous `F:/tmp/frozen-tool/m4/` (`runs/`, `scratch/`, `probes/`).

- **Le refus** (`report.py`) : `NAMES` (l.461-464), les deux noms de base de `TEXTS["replay"]` ; dans `main` (l.472-475), après le
  contrôle d'usage (`--repo` seul donne toujours l'usage) et avant `io_guard.declare`, `io_guard.output` et `os.makedirs` : rien n'est lu
  ni écrit, la sortie n'est pas créée (le rejeu refusé se relance avec le même `--out`). Message : `REFUSED (exit 2): --registry is named
  'B.json', not 'wave1.json' (the names of the replay command, which the report lists); nothing read or written`. Le nom comparé est le
  nom de base après `os.path.abspath` : le chemin que reçoit chaque enfant, et le nom que sa garde note (`io_guard.read`, l.365).
  Comparaison exacte : sous NTFS, `WAVE1.JSON` ouvre le même fichier que `wave1.json` mais y porterait un autre nom ; un point ou une
  espace finale est retiré par `abspath` sous Windows (mesuré), et l'enfant reçoit le chemin ainsi normalisé, dont le nom noté est alors
  `wave1.json`. Placement : `main`, et non `report.run` comme le proposait la G2 ; `report.run()`, appelé par `main` après le contrôle,
  ne le refait pas, et la section 11 de `report_check.py`, qui l'appelle directement avec ses enfants simulés, reste inchangée.
- **Qui reçoit ces noms** : `compare_p2.py` (B, le chemin de `--registry`, trois fois) et `vectors_check.py` (`--vectors`), de `report.py`
  seul, qui refuse désormais avant de les lancer. Ils ne sont pas touchés : chacun est aussi un oracle sur ses propres entrées, et
  `compare_check.py` lance `compare_p2.py` sur 33 copies, `case01.json` à `case33.json` (un refus y casserait l'oracle). `recalc_p2.py` ne
  reçoit aucun des deux : ses noms sont fixés par l'outil (`<sym>/<sym>-15m.csv`, `manifest.json`, `missing.json`, les trois fichiers des
  oracles). Aucun autre nom donné par l'appelant n'entre dans le rapport (toutes les lectures notées, `io_guard.read` et `git_show`,
  relevées par `grep`).
- **La forme `-E -s -B`** : `TEXTS["replay"]` (l.54 ; seuls `-E -s` ajoutés, `<vectors.json>` et `<wave1.json>` nommant déjà les deux
  fichiers), l'en-tête (l.18-19) et l'usage (l.469) de `report.py` ; `io_guard.run_tool` (l.413-417) lance chaque enfant sous la même
  forme, et l'en-tête d'`io_guard.py` le dit (l.31). La §3.3 (l.369) garde sa commande d'origine ; celle qui vaut est `TEXTS["replay"]`.
- **Auto-tests** : `report_check.py`, section 8 (l.251-275) : deux appels renommés (la sortie non vide passe `<work>/vectors.json`, la
  course qui échoue `<work>/no-vectors/vectors.json`) ; un contrôle de la commande (elle commence par `python -E -s -B
  tools/kata-recalc/report.py`, et `NAMES` vaut les deux noms qu'elle écrit) ; quatre courses refusées (`--registry` nommé `B.json`,
  puis `WAVE1.JSON`, `--vectors` nommé `spec-vectors.json` : sortie 2, la raison qui nomme l'option et le nom, la sortie jamais créée ;
  `--registry` `B.json` avec une sortie non vide : sortie 2, et non le 4 de la garde). En-tête l.12-13. `guard_check.py`, cas
  `child-flags` (l.64-66, l.272-273) : l'enfant, lancé par `run_tool` comme tout cas, imprime ses `-E` et `-s` en vigueur et ses options
  d'interpréteur (`sys.orig_argv`) : `-E 1 -s 1, options -E -s -B`. Une première écriture lisait le drapeau de `-B` par son attribut,
  dont le premier mot est un mot français pour la porte de langue (le test `lang_gate_reads_python_sources` rougissait, mesuré) : remplacée.
- **Mesures, avant et après** :
  - avant (`scratch/names_before.py`, `843d55ac…`, sur une copie de l'outil d'avant ; `report.run()` mené au bout comme en section 11,
    mais avec les vrais enfants `vectors_check.py` et `compare_p2.py` ; `runs/names-before.txt`, `81898c1b…`) : B = la passe ln des
    quatre marches synthétiques (`a78cc24a…`), les vecteurs de R1 (`7414b2fc…`). Sous `wave1.json` et `vectors.json`, `report_sha256`
    `357682e6…` (62 611 octets) ; B sous `B.json`, `02a3728a…` ; sous `WAVE1.JSON`, `917494da…` ; les vecteurs sous `spec-vectors.json`,
    `0d8953d4…` ; chaque texte égal au premier une fois le nom remis ;
  - après (`scratch/names_after.sh`, `38972c51…` ; `runs/names-after2.txt`, `4ffd9057…`) : `report.py` lancé comme la commande de rejeu,
    sous `python -E -s -B`, sur les mêmes octets ; sous `B.json`, sous `WAVE1.JSON`, sous `spec-vectors.json`, et sous `B.json` avec
    `spec-vectors.json` : sortie 2 à l'instant, la raison nommée, la sortie jamais créée ; sous les noms de la commande, la course passe
    le contrôle et s'arrête plus loin, à l'identité de l'outil (le lot n'est pas committé) ;
  - les enfants (`probes/children/`, `runs/probe-children.txt`, `8d18c05a…` ; un `sitecustomize` posé par `PYTHONPATH`, le parent sous
    `python -E -s -B`) : avec l'`io_guard` d'avant, l'enfant tourne sous `-E 0, -s 0` et le `sitecustomize` y tourne avant `io_guard` ;
    avec celui du lot, `-E 1, -s 1`, et rien ne tourne ;
  - le reste de (c), sous `python -E -s -B -c` : `site.ENABLE_USER_SITE` faux ; `site.getsitepackages()` = le préfixe de l'installation
    et son `Lib\site-packages`, sans `.pth`, `sitecustomize` ni `usercustomize` ; `sitecustomize` absent de `sys.modules`.
- **Rougeur à la base** (`base-red/`, clone détaché à `09f49fc2`, l'outil d'avant et les deux auto-tests neufs) : `report_check.py` RED,
  exactement les cinq contrôles neufs (`runs/rc-red2.txt`, `ea6f1dce…`) : l'outil d'avant crée la sortie et s'arrête à l'identité de
  l'outil (sortie 2, une autre raison), et sort en 4 sur la sortie non vide ; `guard_check.py` RED, le seul cas `child-flags` (`-E 0 -s 0,
  options -B` ; `runs/gc-red2.txt`, `d1a5493c…`). Node : le fichier de test neuf à `09f49fc2` et à `177b5755`, registre copié : les cinq
  mêmes tests rouges par `ERR_ASSERTION` qu'à la mission 3, le test de langue vert.
- **Mutants** (`scratch/mutants.py`, `0966758c…` ; quatre clones, chaque fichier rendu et son sha256 vérifié ; `runs/mutants.txt`,
  `44f8c87f…`) : sept sur sept tués, chacun par son contrôle : le refus retiré (quatre contrôles) ; `--vectors` non contrôlé (deux) ; le
  refus placé après la garde (un : sortie 4) ; le nom comparé sans sa casse (un : `WAVE1.JSON`) ; la commande revenue à `python -B` (un) ;
  les enfants revenus à `-B` seul, puis sans `-s` (`child-flags`, chaque fois).
- **Rejeux** (tout sous `python -E -s -B` ; `scratch/oracles.sh`, `7215cdbc…` ; `runs/oracles-final2/`, de 09:47 à 09:51 UTC ; stderr
  vides). Égaux à l'octet à ceux de la mission 3 : `vectors-check.txt` `8708d1ec…`, celui de `06ecf069` (RED voulu) `c05f8cc1…`,
  `binom-check.txt` `63606d4f…`, `hikae-replay.txt` `68e16302…`, `registry-binom-check.txt` `bf9412ba…`, `compare-check.txt`
  `0fd01f9e…`, la fumée `92017cbd…`. Différents, chaque écart expliqué : `report-check.txt` (`af18294c…`, 72 contrôles au lieu de 67 :
  cinq lignes ajoutées, rien d'autre) ; `guard-check.txt` (`e1c32e4b…` : le cas `child-flags`, la ligne de compte, 29 cas, et des chemins,
  dont celui, relatif, d'un cas lancé d'un autre dossier de travail) ; le rapport de synthèse, 62 967 octets, `48899a37…` (+6 octets,
  `-E -s ` dans `replay` ; le texte de la mission 3 une fois retirés), mêmes octets sur deux courses ; au chemin daté, `contentProblems`
  vide, aller-retour canonique exact, mêmes chemins à 64 hex (40 cases, 5 entrées, et 1 pour chacun des quatre autres), 280 cases dont 40
  avec empreinte, 103 différences (`runs/inspect-synthetic.txt`, `698a567e…`, script du vérificateur `be8e1938…`).
- **Node** : clone à `09f49fc2` (lot indexé, registre copié non suivi) : `kata-recalc` et `byte-guard` 22 sur 22 ; avec
  `apps/harness/test/*.test.ts`, `short-digest-floor` et `spec-1-1-0-release`, 332 tests, 331 verts, 1 sauté sous win32, 0 rouge. Clone à
  `1cddd2e5` (la branche appliquée et indexée, registre suivi) : `kata-recalc`, `byte-guard`, `policy-guard` et `policy-wave2`, 57 sur 57
  (les noms de la mission 3) ; le jeu large, 333 tests, 332 verts, 1 sauté, 0 rouge (un test de plus à `1cddd2e5`,
  `the_repository_passes_the_writer_check`). Tueurs (`scratch/fire-killers.mjs`, celui de la mission 3, `bd66dacb…`) : les six du fichier
  et cinq tirs de plus, chacun rouge par assertion, fichiers rendus ; `runs/killers/killers.txt` `230e52eb…`, les mêmes octets qu'à la
  mission 3 : aucune ligne de tueur n'a bougé.
- **Épingle d'arbre** : `ca63fb3cfe9d53d62a463472981b7f6d229a982618c9fc0b3a277b4786c8d8cd` (douze fichiers ; `08b00ed1…` avant), mesurée
  par la boucle `sha256sum` sur l'arbre de travail, sur l'index des deux clones et par `manifestText` (`scratch/pin.sh`, copie de celui de
  la mission 3, `7bbbec52…`). Changent : `io_guard.py` (`799b2cf9…`), `guard_check.py` (`6532df5b…`), `report.py` (`f985ce98…`),
  `report_check.py` (`6a34321c…`). Aucun `__pycache__`.
- **R-25** (`scratch/r25.sh`, celui de la mission 2, `50dc8736…` ; la forme de `ci.yml` l.100, la même à `09f49fc2` et à `1cddd2e5`) :
  contre `1cddd2e5` (clone où la branche est appliquée et indexée), 13 fichiers, 971 insertions, 149 suppressions, **1 120** (borne
  1 205) ; contre `09f49fc2`, le lot seul, 10 fichiers, 1 053. La mission 4 en ajoute 53.
- **Worktree** : `tsc --noEmit` 0 ; `eslint test/kata-recalc.test.ts` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (348 fichiers ; 361 avec
  les douze `.py` et le fichier de test en cibles) ; `lang-gate` 0 ; `export-public --check` 0 ; winlint (`--files`, contenu entier,
  `--repo` le worktree) : les treize fichiers de code, aucun risque ; ce G0, les quatre W1 antérieurs (l.232, l.586, l.731, l.828), aucun
  dans ce §17.
- **Lignes déplacées** : `report.py` après l.465, dix de plus (le `declare` de N-5, l.466 au tableau, est l.476) ; `io_guard.py` après
  l.415, deux ; `guard_check.py` (352 lignes) et `report_check.py` (386 lignes), plus haut. Écart, mesuré : les numéros de ligne du
  tableau d'en-tête et des paragraphes des missions 1 et 2 sont ceux de leurs arbres, et la G2 en avait déjà déplacé (par exemple `stage`
  de `report_check.py`, l.139-147 au tableau, est l.141 ; la section 11, l.300-340 au tableau, commence l.333 ; le test des classes,
  l.128-159 au tableau, commence l.148 du fichier de test). Ils ne sont pas ré-ancrés ici, hors de la mission : décision de MONARK.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : seul `GIT_EDITOR`), aucun `--write-tree`. `git clone --shared`,
  `checkout --detach` et `git add` dans les clones de `F:/tmp/frozen-tool/m4/` seulement ; dans le worktree, des lectures (`diff`,
  `status`, `show`, `rev-parse`, `merge-base --is-ancestor`, `ls-tree`, `log`, `config --get`) : rien n'y est indexé ni committé. Rien
  n'est écrit sur C: (l'interpréteur, `ucrtbase.dll` et la bibliothèque standard y sont lus ; `TEMP` et `TMP` sous `F:/tmp`, cache npm
  sous `F:`).

**Mission 5 : la forme `python -E -S -s -B`, son contrôle à l'import, la liste fermée des bibliothèques du `log`.** Worker
`claude-opus-5-5` (effort max), horloge de 10:52 à 12:1x UTC (tampons de `now.mjs` : 10:52, 11:40, 11:48, 12:00, 12:04, 12:11, 12:12). Entrées
lues d'abord : le rapport du vérificateur de la mission 4 (`F:/tmp/dojo/frozen-m4-verifier.json`, quatre constats m) ; les décisions de
MONARK, `F:/tmp/dojo/frozen-tool-followup.md` items 8 et 10, et son message `2026-10-07-MONARK-vers-RECHERCHES-226-cm5-v6-1.md` (CM-5
v6.1 : le contrôle de la forme passe dans `io_guard`) ; sa mesure `F:/tmp/dojo/sitecustomize-measure` ; ce §17. Départ : l'arbre de la
mission 4, copié avant toute écriture (`F:/tmp/frozen-tool/m5/base-m4/`, `base-m4.sha256` `f7a06001…`), aux sha256 de l'instantané du
vérificateur (`io_guard.py` `799b2cf9…`, `report.py` `f985ce98…`, `report_check.py` `6a34321c…`, `guard_check.py` `6532df5b…`, test
`6060e5e8…`, ce G0 `c8bbb317…`). Sorties sous `F:/tmp/frozen-tool/m5/` (`runs/`, `scratch/`, `probes/`).

- **La forme (item 8 ; constat m 3)** : `python -E -S -s -B` dans `TEXTS["replay"]` (`report.py` l.54), dans l'en-tête et l'usage de
  chaque script d'entrée (`binom_check.py` l.10-11, `compare_check.py` l.6, `compare_p2.py` l.20-21, `guard_check.py` l.16-17 et l.380,
  `recalc_p2.py` l.11 et l.542, `report.py` l.19 et l.471, `report_check.py` l.14, `vectors_check.py` l.8), dans la commande de la §3.3
  (l.369, point ouvert (a) de la mission 4) et dans le texte de l'épingle du test (l.57-58) ; `io_guard.run_tool` lance chaque enfant
  sous `FORM` (`io_guard.py` l.433). Aucun autre lanceur Python dans le dépôt (`git grep` : la CI ne lance pas l'outil, le test Node n'en
  lance aucun) ; les lanceurs de preuve de cette mission (oracles, mutants, sondes) prennent la même forme.
- **Le contrôle à l'import (item 10)** : `io_guard.py` l.44-57, avant tout jugement et toute lecture (après ses propres imports, qui ne
  lisent aucune entrée). Refus en sortie 2 : la raison sur `sys.stderr`, `flush()`, puis `os._exit(2)` (dans un `finally`), si un champ
  de `sys.flags` qu'une option pose, de `debug` à `isolated` puis `safe_path`, diffère de sa valeur sous `FORM`, si `sys.warnoptions` ou
  `sys._xoptions` n'est pas vide, ou si l'interpréteur est un build debug (`hasattr(sys, "gettotalrefcount")`). Écart voulu à la liste de
  l'item 10, qui nomme sept champs : les sept y sont, avec les six autres qu'une option pose (`debug` par `-d`, `interactive` par `-i`,
  `verbose` par `-v`, `bytes_warning` par `-b`, `quiet` par `-q`, `isolated` par `-I`) et `hash_randomization` (1 sous `-E`) ; les trois
  champs que seul `-X` pose passent par `sys._xoptions` (`utf8_mode` vaut aussi 1 sous une locale C de POSIX : non contrôlé). Les champs
  sont lus par leur position (`sys.flags.__match_args__`) : le nom du champ de `-B` commence par un mot que la porte de langue lit comme
  français (mesuré par la mission 4). Mesuré option par option (`probes/flags_probe.py` `55b6a541…`, `runs/flags.txt` `9c70af3b…`) :
  chaque option pose son champ ; `-i` pose `inspect` et `interactive`, `-I` pose `isolated` et `safe_path`, `-b` ajoute
  `default::BytesWarning` à `sys.warnoptions` ; `-ESsB` égale la forme ; `-R`, `-u`, `-x` et `--check-hash-based-pycs` ne changent aucun
  champ et ne sont pas détectés, sans effet sur les octets (`-R` : le champ vaut déjà 1 sous `-E` ; `-u` : le tampon des sorties ; `-x` :
  la première ligne de chaque script d'entrée est un commentaire ; `--check-hash-based-pycs` : les `.pyc` de la bibliothèque standard de
  l'hôte sont à horodatage, mot de drapeaux 0 mesuré sur `subprocess` et `hashlib`, et l'outil n'en a aucun). C'est une détection, pas une
  prévention : ce qui tourne avant `io_guard` a déjà tourné quand le refus sort (B8 et B9, plus bas) ; la forme, écrite dans `replay`,
  prévient ce qu'elle retire (les variables `PYTHON*`, `site` et ce qu'il ferait tourner, le site utilisateur, l'écriture du cache), et
  non un fichier posé dans l'arbre de l'entrée sous le nom d'un des 18 modules qu'`io_guard` charge depuis un chemin, ni un paquet
  `io_guard/` : ils tournent sous la forme avant le crochet (précision de la mission 6, sous IO-GUARD-NATIVE-READS-1 (c)).
- **Les cas de `guard_check.py`** (382 lignes) : quatorze lancements (l.86-92) par `_launch` (l.152-160), sur une copie de l'arbre que fait
  le parent (l.329-336), avec un `sitecustomize.py` témoin à côté de ses scripts et un autre dans un dossier que nomme `PYTHONPATH`. Sous
  la forme, un script d'entrée de la copie (`--case site-absent`, l.293-294) : « SITE NOT RUN », ni `site` ni `sitecustomize` dans
  `sys.modules`. Sous une autre forme, `-c` importe `io_guard` de la copie (sous `-P`, un script d'entrée ne le trouverait pas) :
  `-S -s -B`, `-E -s -B`, `-E -S -B`, puis `-O`, `-i`, `-P`, `-d`, `-v`, `-q`, `-W error`, `-X presite=sitecustomize` ajoutés à la forme,
  et un build debug tenu par `sys.gettotalrefcount` posé avant l'import (aucun build debug sur cet hôte) : chacun en sortie 2, son champ
  nommé ; sans `-B`, en dernier (son import écrit le cache de la copie) : sortie 2. Le cas `child-flags` (l.66, l.290-292) affiche aussi
  `-S` et `site` : « -E 1 -S 1 -s 1, options -E -S -s -B, site absent ».
- **L'environnement virtuel sous `-S`, mesuré** (`probes/venv_probe.py` `c37ab74b…`, `runs/venv/`) : un venv jetable,
  `F:/tmp/frozen-tool/m5/venv`, fait par `python -m venv --without-pip` depuis l'interpréteur de base. Sous `-E -S -s -B`, sans `site`,
  `sys.prefix` vaut le dossier du venv (posé par `getpath`), différent de `sys.base_prefix`, et `platstdlib` vaut `venv\Lib`. L'outil
  (`vectors_check.py`) lancé par le `python.exe` du venv sous la forme : sortie 4 à l'import, « a virtual environment: run the base
  interpreter », aucune sortie écrite ; sous `-E -s -B` : sortie 2 (`no_site 0`). Le prédicat `sys.prefix != sys.base_prefix` tient sous
  `-S` : inchangé.
- **Constat m 1** (`report_check.py`, section 8, l.269) : trois courses refusées de plus, `--registry` nommé `wave1.jsonl` puis
  `wave1.JSON`, `--vectors` nommé `vectors.jsonl`. Les deux mutants du vérificateur (le nom comparé par son début, `startswith` ; par sa
  racine, `os.path.splitext`) sont tués : `report_check.py` en sortie 1, deux puis trois échecs (`runs/mutants/MA-*`, `MB-*`). À la base,
  ces trois courses sont vertes (l'égalité exacte de la mission 4 les refuse déjà) : leur preuve rouge, ce sont ces deux mutants.
- **Constat m 2** (en-tête d'`io_guard.py`) : l.8-10 (git sous `GIT_NO_LAZY_FETCH`, IO-GUARD-PARTIAL-CLONE-1 ; une création de
  processus, une fois, après son Popen jugé, sur son fil, avec son argv sous POSIX, sa ligne de commande non épinglée sous Windows,
  IO-GUARD-CREATE-CMDLINE-1), l.14 (les créations de `_CREATE` parmi les événements jugés), l.28-29 (pas de `site` sous la forme),
  l.32 (l'outil tourne sous `FORM`).
- **Constat m 4** (la bibliothèque du `log`). (i) Fait : `LIBMS` (`report.py` l.68-69), liste fermée et mesurée, sha256 → (version,
  nombre d'entrées de `fdlibm_log.VECTORS` où son `log` diffère du portage) ; une entrée, celle de l'hôte de la mesure du lot 1e
  (`3c600563…`, `10.0.19041.3636`, 5 780 ; 1 046 080 octets). `fingerprint` (l.131-136) refuse en sortie 2 une bibliothèque absente de
  la liste, d'une autre version ou d'une autre empreinte : l'empreinte s'applique toujours. `report_check.py` section 3 (l.103-106) le
  tient (une bibliothèque inconnue, une autre version, une autre empreinte : trois refus) ; mutants tués : la liste ouverte, la version non
  comparée. Rejeu de la course du vérificateur (`scratch/sysroot_runs.sh` `8345ad26…`, son `e2e_v.py` `752f0746…`, `report.main` de
  l'outil du worktree ; `runs/sysroot.txt` `e2e0d622…`) : sous le `SystemRoot` de l'hôte, rapport écrit, `19ff55c3…`, 62 620 octets ;
  sous son `SystemRoot` factice (`python3.dll` copié en `ucrtbase.dll`, `f3d0cd26…`), sortie 2, « the C library of log named is not in
  the measured list LIBMS », aucun `report.json` ; sous un `SystemRoot` dont `System32` porte une copie du `ucrtbase.dll` du système,
  rapport écrit, les mêmes octets `19ff55c3…` (la bibliothèque nommée a les octets de la chargée). (ii) Non fait, la borne R-25 ne le
  laissant pas : item IO-GUARD-LIBM-PATH-1 (plus bas), avec la construction mesurée.
- **Correctif après relecture** (conseil intégré du harnais, 12:0x UTC) : sous `-c`, `sys.path[0]` est le dossier de travail ; la copie
  passait en second (`sys.path.insert(1, …)`). `guard_check.py` lancé depuis un dossier de travail qui porte `io_guard.py` (le dossier
  de l'outil) faisait importer l'`io_guard` de ce dossier, et le lancement sans `-B` y écrivait son cache. Mesuré sur le clone, avant :
  `guard_check.py` vert (`runs/cwd-before/guard-check.txt` `62b3ae77…`), mais `__pycache__/io_guard.cpython-314.pyc` écrit dans son
  `tools/kata-recalc`, et la course suivante refusée en sortie 4 (« a bytecode cache in a tree of the tool », `vc-after.err`
  `5ec2e7e2…`) ; cache retiré du clone. Correctif : la copie en tête (`sys.path.insert(0, …)`, `guard_check.py` l.157 ; docstring de
  `_launch` l.153-155), zéro ligne au compte R-25 (`scratch/step2-fix.py` `db351f00…`). Après : vert, rien d'écrit dans l'outil
  (`runs/cwd-after/guard-check.txt` `58839fa2…`). Les mutants ont tourné avant ce correctif, depuis `F:/tmp`, qui ne porte aucun
  `io_guard.py` : leurs lancements importaient déjà la copie, et leurs verdicts tiennent. Écart à « une fois » : l'épingle a été posée
  deux fois dans le worktree, `7e72e1b0…` avant ce correctif (rejouée dans les clones), puis `ef31a618…`, la seule livrée.
- **Conséquence de `LIBMS` sur un autre hôte** : avec une seule entrée, la course de `report.py` (sortie 2) et la section 3 de
  `report_check.py` (RED) sont refusées sur tout hôte Windows dont `ucrtbase.dll` n'est pas `3c600563…` en `10.0.19041.3636` ; avant
  la mission 5, un autre hôte passait sans empreinte. Procédure : mesurer sa bibliothèque (sha256, version, nombre d'entrées de
  `fdlibm_log.VECTORS` où son `log` diffère du portage, comme au lot 1e), l'ajouter à `LIBMS` ; l'épingle bouge.
- **Point ouvert (b) de la mission 4** : le tableau d'en-tête et les paragraphes des missions 1 et 2 sont réancrés sur l'arbre de cette
  mission (`scratch/reanchor.py` `5d412c5d…` : chaque ligne de l'arbre de la mission 2, `m3/base-lot/`, cherchée par son texte dans
  l'arbre final ; `scratch/reanchor-g0.py` `49bbdedb…` : 42 réancrages, chacun tenu à un texte unique sur sa ligne ; les plages
  d'en-tête relues à la main ; deux bornes de fin corrigées à la main, l'épingle l.50-60 et le test de la porte l.110-142). Les références
  à d'autres documents ne bougent pas. Lignes que cette mission déplace, pour lire les paragraphes des missions 3 et 4, qui gardent les
  numéros de leurs arbres : `io_guard.py` +1 de l.10 à l.42, +16 au-delà (le contrôle, l.44-57 ; `TREES` passe de l.47 à l.63, et le tueur
  du test des deux arbres suit : `io_guard.py:63`, test l.101) ; `report.py` +2 après l.67 (`LIBMS`) ; `report_check.py` +1 après l.268 ;
  `guard_check.py` 382 lignes ; le fichier de test +1 après l.58.

**Items formés ou changés par la mission 5** (règle PAROXYSME).
- **IO-GUARD-LIBM-PATH-1** (PAROXYSME, neuf, reste du constat m 4 du vérificateur de la mission 4). Porteur : MONARK. Limite :
  `report.py` lit la bibliothèque C du `log` au chemin que nomme la variable `SystemRoot`, que `-E` ne neutralise pas ; `LIBMS` refuse
  désormais toute bibliothèque inconnue et l'empreinte s'applique toujours, mais le fichier lu n'est pas forcément celui que le processus
  a chargé (un autre fichier passe s'il en a les octets, et il est refusé sinon). Construction candidate, mesurée hors de l'outil (`probes/libm/walk.py` `531a5ae1…`,
  `runs/walk.txt` `620b95d6…`) : parcourir l'espace d'adresses du processus avec `_winapi.VirtualQuerySize` et nommer chaque début de
  région qui est la base d'un module avec `_winapi.GetModuleFileName` ; `_winapi` est chargé avant le crochet, `ctypes` n'est pas dans
  `NATIVE`, et `nt` n'offre aucune fonction qui nomme un module chargé (liste de ses fonctions lue). Mesuré : 189 à 212 régions selon le
  processus, 16 modules, 1 à 2 ms ; un seul `ucrtbase.dll`, `C:\WINDOWS\System32\ucrtbase.dll`, le même sous le `SystemRoot` factice.
  Pièges mesurés : l'adresse 0 nomme l'exécutable (partir de 0x10000) ; `VirtualQuerySize` au-delà du haut de l'espace utilisateur
  (0x7FFFFFFF0000 pour un processus 64 bits) rend une valeur avec une exception posée (`SystemError` à l'appel suivant), d'où une borne
  tenue. Prix mesuré : environ dix lignes dans `platform_fields` (le parcours, un seul `ucrtbase.dll` exigé, sa lecture sous le rôle
  `libm`), trois dans `report_check.py` (un `SystemRoot` factice ignoré), l'épingle : environ 16 lignes au compte R-25, quand la borne du
  chantier n'en laisse que 5 après cette mission (1 200 sur 1 205). Déclencheur : avant la première course réelle sur un autre hôte que
  celui mesuré.
- **IO-GUARD-NATIVE-READS-1** : (c) avancé par la mission 5 (plus haut, sous l'item).
- **Demande de lecture formée** ([2nd] pour cette mission) : lire sur place `https://docs.python.org/3.14/using/cmdline.html`,
  entrées `PYTHON_PRESITE` et `-X presite` (« build debug seulement », cité par le contrôle de CM-5 v4, `cm5-v4-check.json`), et la
  consigner dans un fichier de FAITS daté. Usage : B8 et le refus du build debug ci-dessus. Tentative : aucune par le worker, la
  lecture primaire revenant à l'orchestrateur (§10 de CLAUDE.md, écart du §15). **Fermée** : lue sur place par MONARK le 2026-10-07 à
  13:10 UTC, navigateur interne, page « 1. Command line and environment — Python 3.14.8 documentation » ; fichier de FAITS
  `docs/FAITS-PYTHON-PRESITE-2026-10-07.md` ([lu] ; copie à l'octet de `F:/tmp/dojo/FAITS-PYTHON-PRESITE-2026-10-07.md`) : `-X presite`
  et `PYTHON_PRESITE` n'existent que dans un build debug (« Needs Python configured with the --with-pydebug build option. »), et `-E`
  ignore toute variable `PYTHON*`. La limite « pas de build debug pour mesurer » est fermée par ces deux voies (paragraphe « Mission 6 »).

**La preuve (C′) pour CM-5 : B8 et B9 rejoués contre l'`io_guard` étendu** (`probes/b8b9/b8b9.sh` `8681ba03…`, `runs/b8b9-2.txt`
`fcd79436…` ; l'oracle des vecteurs, `vectors_check.py`, sur les vecteurs de R1, `7414b2fc…`).
- B8 : 39 variables `PYTHON*` posées, dont `PYTHON_PRESITE=witness`, `PYTHONPATH` vers un dossier qui porte `sitecustomize.py`,
  `usercustomize.py` et un module témoin (`probes/b8b9/pp/witness.py` `821413b2…`), `PYTHONWARNINGS=default::witness.W`,
  `PYTHONSTARTUP`, `PYTHONINSPECT`, `PYTHONOPTIMIZE=2`, `PYTHONSAFEPATH`, `PYTHONPYCACHEPREFIX`, `PYTHONIOENCODING=utf-16`, et
  `PYTHONHOME` vers un dossier absent. Sous la forme : sortie 0, la sortie de l'oracle égale à l'octet à celle d'une course sans ces
  variables (`8708d1ec…`, celle de la mission 4), aucun témoin écrit. Sans `-E` (`PYTHONHOME` retiré, sans quoi l'interpréteur ne démarre
  pas ; `PYTHONSAFEPATH`, `PYTHONINSPECT` et `PYTHONIOENCODING` retirés pour que l'oracle trouve `io_guard`) : les variables agissent, le
  module témoin est importé au démarrage par `PYTHONWARNINGS`, et `io_guard` refuse en sortie 2 (« optimize 2, ignore_environment 0,
  verbose 1, hash_randomization 0, -W default… ») ; avec toutes les variables et sans `-E`, `PYTHONSAFEPATH` cache `io_guard`
  (`ModuleNotFoundError`), aucune sortie. `PYTHON_PRESITE` n'agit que sur un build debug ([lu] : `docs/FAITS-PYTHON-PRESITE-2026-10-07.md`,
  la page cmdline de 3.14 lue sur place par MONARK le 2026-10-07 à 13:10 UTC, qui remplace le [2nd] du contrôle de CM-5 v4,
  `cm5-v4-check.json` ; aucun build debug ici), que le contrôle refuse, et `-E` l'ignore (même page) : la limite « pas de build debug »
  de B8 devient ce refus.
- B9 : un `sitecustomize.py` témoin posé à côté des scripts d'une copie de `kata-recalc`. Sous la forme, il ne tourne pas et la sortie
  est la même (`8708d1ec…`) ; sous `-E -s -B`, il ne tourne pas non plus (`sys.path[0]` posé après `site`, la mesure de MONARK) et
  `io_guard` refuse (`no_site 0`) ; avec `PYTHONPATH` vers la copie, sans `-E` ni `-S`, il tourne (témoin écrit) puis `io_guard` refuse
  (`no_site 0, ignore_environment 0`). Portée (précision de la mission 6) : B9 vaut pour le nom `sitecustomize`, qu'aucun module
  chargé sous la forme n'importe (cas `launch form`, « SITE NOT RUN »). Sous la forme, un fichier posé au même endroit sous le nom d'un des 18 modules qu'`io_guard` charge depuis un chemin
  (`threading.py`, mesuré par le vérificateur de la mission 5), ou un paquet `io_guard/`, tourne avant le crochet : B9 ne prouve rien
  contre un fichier posé dans l'arbre de l'entrée, ni pour `kata-recalc` ni pour les deux arbres de `kata-quarter` (IO-GUARD-NATIVE-READS-1
  (c), précision de la mission 6 ; IO-GUARD-POSED-FILES-1).

**Mesures** (`python -E -S -s -B`, hors ligne ; aucune série lue).
- Oracles et auto-tests sur l'outil du worktree (`scratch/oracles.sh` `6cad8e9a…`, copie de celui de la mission 4 sous la forme neuve ;
  `runs/oracles-final1/`, de 11:48 à 11:52 UTC, `oracles-final1.log` `ca94e068…` ; stderr vides). Égaux à l'octet à ceux de la mission 4 :
  `vectors-check.txt` `8708d1ec…`, celui de `06ecf069` (RED voulu) `c05f8cc1…`, `binom-check.txt` `63606d4f…`, `hikae-replay.txt`
  `68e16302…`, `registry-binom-check.txt` `bf9412ba…`, `compare-check.txt` `0fd01f9e…`, la fumée `92017cbd…`. Différents, chaque écart
  expliqué : `report-check.txt` (`a38d8832…`, 75 contrôles au lieu de 72 : les deux lignes de la bibliothèque et celle de la commande
  changées, les trois noms ajoutés, rien d'autre) ; `guard-check.txt` (`46e8fa1d…` : `child-flags`, les quatorze lancements, la ligne de
  compte, 43 cas, et des chemins ; après le correctif plus bas, `runs/oracles-final2/guard-check.txt` `d57fa18f…`, seuls des chemins
  changent) ; le rapport de synthèse, 62 970 octets, `0c123b5e…` (+3 octets, `-S ` dans `replay`).
- Rougeur à la base (`base-red/`, clone détaché à `09f49fc2`, l'outil de la mission 4 et les deux auto-tests neufs ; `runs/gc-red.txt`
  `43260154…`, `runs/rc-red.txt` `94e7a79d…`) : `guard_check.py` RED, exactement quinze échecs, `child-flags` (« -E 1 -S 0 -s 1, options
  -E -s -B, site loaded ») et les quatorze lancements (sortie 0 sans contrôle, sortie 4 sous `-i` par `cpython.run_stdin` refusé, sortie 4
  sans `-B` par le cache) ; `report_check.py` RED, exactement trois échecs (les deux contrôles de la bibliothèque, la forme de la
  commande), les trois noms neufs verts (plus haut). Node : le fichier de test neuf à `09f49fc2` et à `177b5755`, registre copié : les
  cinq mêmes tests rouges par `ERR_ASSERTION` qu'aux missions 3 et 4, le test de langue vert (`runs/node-base-*.txt`).
- Mutants (`scratch/mutants.py` `7c1bb09b…` ; quatre clones `mut1/` à `mut4/` détachés à `09f49fc2`, chaque fichier rendu et son sha256
  vérifié, aucun `__pycache__` laissé ; `runs/mutants.txt` `29805045…`) : 25 mutants, 21 tués, chacun par son contrôle ou son cas : les
  deux du vérificateur, la liste des bibliothèques ouverte, la version non comparée, la commande sans `-S`, dix champs de `sys.flags` non
  contrôlés un par un (`debug`, `inspect`, `optimize`, celui de `-B`, `no_user_site`, `no_site`, `ignore_environment`, `verbose`, `quiet`,
  `safe_path`), `-W`, `-X` et le build debug non contrôlés, le refus en sortie 0, l'enfant de `run_tool` sans `-S`, `FORM` sans `-S`.
  Quatre survivent, équivalents : `interactive` (seul `-i` le pose, avec `inspect`), `bytes_warning` (`-b` ajoute aussi un `-W`),
  `hash_randomization` (sous `-E`, seul `PYTHONHASHSEED` le baisserait, ignoré ; mesuré à 0 sans `-E`, refusé par `ignore_environment`),
  `isolated` (`-I` pose aussi `safe_path`).
- Node : clone à `09f49fc2` (lot indexé, registre copié non suivi) : `kata-recalc` et `byte-guard` 22 sur 22 ; avec
  `apps/harness/test/*.test.ts`, `short-digest-floor` et `spec-1-1-0-release`, 332 tests, 331 verts, 1 sauté sous win32, 0 rouge. Clone à
  `1cddd2e5` (la branche appliquée et indexée, registre suivi) : `kata-recalc`, `byte-guard`, `policy-guard` et `policy-wave2`, 57 sur 57 ;
  le jeu large, 333 tests, 332 verts, 1 sauté, 0 rouge. Tueurs (`scratch/fire-killers.mjs`, celui des missions 3 et 4, `bd66dacb…` ;
  `runs/killers/killers.txt` `a90bfd62…`) : les six du fichier et cinq tirs de plus, chacun rouge par assertion, fichiers rendus ; seul
  le tueur des deux arbres change de ligne (l.47 → l.63).
- Épingle d'arbre : `ef31a61893852ce67b998ad0fda437e19501a54743458f0f77ed82fe294c0522` (douze fichiers ; `ca63fb3c…` avant), mesurée par la
  boucle `sha256sum` sur l'arbre de travail, sur l'index des deux clones et par `manifestText` (`scratch/pin.sh` `2332ab0a…`, copie de
  celui de la mission 4 ; `runs/pin.txt` `84720d4e…`). Changent : `binom_check.py` (`5a69f466…`), `compare_check.py` (`012b7804…`),
  `compare_p2.py` (`877dd2fc…`), `guard_check.py` (`0665ab21…`), `io_guard.py` (`a3efa844…`), `recalc_p2.py` (`c2611a3a…`), `report.py`
  (`1f7e91bd…`), `report_check.py` (`58c74b2e…`), `vectors_check.py` (`713e28a2…`). Aucun `__pycache__`.
- **R-25** (`scratch/r25.sh`, celui de la mission 2, `50dc8736…` ; la forme de `ci.yml` l.100) : contre `1cddd2e5` (clone où la branche
  est appliquée et indexée), 14 fichiers, 1 036 insertions, 164 suppressions, **1 200** (borne 1 205) ; contre `09f49fc2`, le lot seul, 11 fichiers, 1 133. La mission 5 en ajoute 80 : la borne laisse 5 lignes.
- Worktree : `tsc --noEmit` 0 ; `eslint test/kata-recalc.test.ts` 0 ; `lint-ratchet` 69/69 ; `grep-forbidden` 0 (348 fichiers ; 361 avec
  les douze `.py` et le fichier de test en cibles) ; `lang-gate` 0 ; `export-public --check` 0 ; winlint (`winlint.mjs` de RECHERCHES,
  `676416fe…`, `--files`, contenu entier, `--repo` le worktree) : les treize fichiers de code, aucun risque ; ce G0, les quatre W1 antérieurs (l.232, l.586, l.731, l.828), aucun dans ce §17.
- **Git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE` (mesure `env` : seul `GIT_EDITOR`), aucun `--write-tree`. `git clone --shared`,
  `checkout --detach` et `git add` dans les clones de `F:/tmp/frozen-tool/m5/` seulement ; dans le worktree, des lectures (`diff`,
  `status`, `show`, `rev-parse`, `grep`) : rien n'y est indexé ni committé. Rien n'est écrit sur C: (l'interpréteur, `ucrtbase.dll`,
  `python3.dll` et la bibliothèque standard y sont lus ; `TEMP` et `TMP` sous `F:/tmp` ; le venv sous `F:/tmp`).

**Mission 6 : les constats m du vérificateur de la mission 5, l'item 11 et `PYTHON_PRESITE` ; ce G0 seulement, Bash refusé.** Worker
`claude-opus-5-5` (effort max). Horloge : une lecture de `now.mjs`, 13:11 UTC (13:11:23Z ; `date -u` 13:12:09), aucune ensuite (plus
bas, « Arrêt »). Entrées lues d'abord : le rapport du vérificateur de la mission 5 (`F:/tmp/dojo/frozen-m5-verifier.json`, deux
constats m), l'item 11 de `F:/tmp/dojo/frozen-tool-followup.md`, le fichier de FAITS de MONARK
(`F:/tmp/dojo/FAITS-PYTHON-PRESITE-2026-10-07.md`), les sondes du vérificateur sous `F:/tmp/frozen-tool/m5v/probes/` (`shadow/` :
`list_preloaded.py`, `preloaded.txt`, `shadow_runs.sh`, `shadow-runs.txt`, les deux `threading.py` témoins, `WITNESS.txt`,
`r3-third-tree-read.txt` ; `pkg/PKG-WITNESS.txt`) et ce §17. Décisions de MONARK reçues avec la mission, sur les points ouverts de la
mission 5 : le contrôle sur 13 champs et `hash_randomization` est gardé (plus strict, sans coût) ; `LIBMS` est gardée avec sa procédure
d'ajout ; IO-GUARD-LIBM-PATH-1 reste un item formé. Départ : l'arbre de travail de la mission 5, relu par son vérificateur (son
instantané `F:/tmp/frozen-tool/m5v/snap/`, `snap.sha256` `a9153320…`, égal au worktree à 13:06 UTC selon lui) ; à 13:11 UTC, tête
`09f49fc2`, branche `monark/reason-order-1`, les douze mêmes entrées de `git status`. Aucune copie avant écriture n'a pu être faite
(Bash refusé) : ce G0 est le seul fichier écrit, par remplacements de texte, que `git diff` contre l'instantané du vérificateur montre.

- **Constat m 1 (a), fait** : la précision est écrite à quatre endroits de ce §17 : le reste de la mission 5 sous
  IO-GUARD-NATIVE-READS-1 (c) (l.1450-1452 : « les imports d'`io_guard` lui-même, cherchés d'abord dans l'arbre de l'entrée ») ; le
  sous-point neuf « (c) précisé par la mission 6 » (l.1458-1477 : les 18 noms, le paquet `io_guard/`, le refus après coup de
  `tool_identity`, l'oracle pris seul, les deux arbres de `kata-quarter`, le cache forgé) ; le paragraphe du contrôle à l'import
  (l.1828-1831 : la forme prévient ce qu'elle retire, et non un fichier posé dans l'arbre de l'entrée) ; le paragraphe B9 (l.1930-1934,
  « Portée »). Les mesures citées sont celles du vérificateur, lues dans ses fichiers et non rejouées ; leurs sha256 sont les siens.
- **Constat m 1 (b) : IO-GUARD-POSED-FILES-1** (PAROXYSME, neuf). Porteur : MONARK. Limite : sous la forme, un fichier posé dans
  l'arbre de l'entrée sous le nom d'un des 18 modules qu'`io_guard` charge depuis un chemin, un paquet `io_guard/` ou un cache forgé
  tourne avant le crochet et avant le contrôle de la forme ; seul `tool_identity` le refuse, après coup, dans `report.py` seulement ;
  une course d'oracle prise seule ne le refuse pas. Construction candidate (MONARK) : `-P` ajouté à la forme (`safe_path` : le dossier
  du script n'est plus posé en tête de `sys.path`) et, dans chaque script d'entrée, le dossier de l'outil ajouté en fin de `sys.path`
  (après la bibliothèque standard) avant `import io_guard` ; `io_guard` attend alors `safe_path` 1 (`FORM`, l.48, et les poids, l.49),
  `TEXTS["replay"]` et les lignes d'usage prennent `-P`, et l'entrée de `kata-quarter` pose ses deux arbres de la même façon.
  **Mesure : non faite par la mission 6** (Bash refusé). À mesurer sur une copie sous `F:/tmp/frozen-tool/m6/`, sous
  `python -E -S -s -B -P` (prédictions écrites avant la mesure, jamais reportées comme des faits) :
  1. `sys.path` d'un script d'entrée sous la forme neuve (prédit : aucune entrée de l'arbre avant l'ajout) ;
  2. un témoin posé dans l'arbre sous chacun des 18 noms, puis sous le nom de chaque module de la bibliothèque standard que l'outil
     importe après le crochet (`json`, `re`, `platform`…) : prédit qu'aucun ne tourne, la bibliothèque standard passant avant l'arbre ;
  3. le paquet `io_guard/` : prédit qu'il tourne encore (même dossier, un paquet passe avant un module : la construction ne l'atteint
     pas, comme l'a écrit le vérificateur) ; un cache forgé, de même ;
  4. les noms qu'un module de la bibliothèque standard cherche sans les trouver (un import facultatif rattrapé) : leur recherche finit
     dans l'arbre, posé en fin, où un fichier posé sous un tel nom tournerait ; à recenser par un chercheur posé en dernier dans
     `sys.meta_path`, pour `import io_guard` et pour les courses complètes ;
  5. les entrées de `sys.path` de l'installation passent toutes avant l'arbre : un fichier posé là sous le nom d'un module de l'outil
     (`io_guard.py`, `kata_lib.py`) masquerait celui de l'outil, et la confiance passe à l'installation (point (d)) ; à mesurer sur une
     copie de l'interpréteur sous `F:` ;
  6. aucun module de l'outil ne porte un nom de `sys.stdlib_module_names` (à vérifier ; sinon la bibliothèque standard le masquerait).

  Prix, estimé et non mesuré : une ligne insérée avant `import io_guard` dans chacun des huit scripts d'entrée (`import os, sys` et
  l'ajout au chemin), +8, ou deux, +16 ; le test `kata_recalc_entry_scripts_import_the_input_guard_first` (test l.85-97), dont la règle
  « premier import : `io_guard` » change, et son tueur `recalc_p2.py:12`, qui se déplace (une ligne de la base, +2), environ +4 à +6 ; un
  cas « shadow » dans `guard_check.py` (fichier neuf : chaque ligne ajoutée compte), environ +3 ; `FORM`, les poids, `replay`, les
  lignes d'usage et le contrôle de la commande dans `report_check.py` sont des lignes du lot, réécrites à nombre égal, +0 ; l'épingle,
  +0. Soit environ +15 à +25, au-delà de la marge de 5. Seule construction mesurée à ce jour : la voie (a) du vérificateur
  (`F:/tmp/frozen-tool/m5v/fix/` : `io_guard` refuse à l'import toute entrée de l'arbre dont le nom est dans
  `sys.stdlib_module_names` ; cas « launch shadow » vert, rouge contre la garde du lot ; +20 contre `09f49fc2`). Elle n'atteint ni le
  paquet `io_guard/` ni un cache forgé, que sa voie (b) (un contrôle en ligne dans chaque script d'entrée, avant `import io_guard`,
  environ 2 à 3 lignes par script, estimée) atteindrait ; à défaut, la course bornée par le système de IO-GUARD-NATIVE-READS-1 (a).
  Déclencheur : avant le prochain lot qui déplace l'outil, ou avant toute course d'oracle prise seule comme preuve. Non appliquée dans ce
  lot (marge de 5, décision de MONARK).
- **Constat m 2 : non porté dans `report.py`.** La règle de MONARK (« si R-25 dépasse 1 205, le texte au G0 seulement ») n'est pas
  la raison : le calcul ci-dessous tient sous la borne. La raison est l'arrêt : sans Bash, ni épingle reposée de trois façons, ni
  oracle, ni R-25 mesurée, et un `report.py` changé sans son épingle laisserait `kata_recalc_tree_is_the_pinned_manifest` rouge. Le
  texte, à lignes égales (caractères comptés à la main ; largeur des commentaires de l'outil : 141 au plus, `report_check.py` l.34,
  sauf la l.2 de `recalc_p2.py`, 170 ; 140 dans `report.py` ; mesuré par `awk` à 13:1x UTC) :
  - (a) l.16 inchangée (« … 2 a step failed ») ; l.17, 136 caractères : `# (usage, platform, tool identity, an oracle, recomputation,
    base pass, a comparison's structural fault), or a launch under another form` ; l.18, 140 : `# than FORM (refused by io_guard at
    import); 4 the input guard. Usage (G0 section 3.3; options in order; input names of the replay command):` ;
  - (b) l.132, 130 : `    """The count of measured inputs where the log that runs differs from the port; LIBMS must hold it, with the
    library's version:` ; l.133, 139 : `    the library named is a measured one, and the log that runs has its fingerprint (the file
    loaded is not named: IO-GUARD-LIBM-PATH-1)."""` ;
  - prix, calculé sur les hunks lus de `git diff 09f49fc2 -U0` (13:1x UTC) et non mesuré : les l.16 et l.17 de `report.py` sont des
    lignes de la base, les l.18 et l.132-135 des lignes du lot (`@@ -18,2 +18,2 @@`, `@@ -120,4 +132,4 @@`), comme la ligne de
    l'épingle du test (`PIN` `289756d3…` retiré, `ef31a618…` ajouté) ; réécrire une ligne du lot à nombre de lignes égal ne change pas
    le compte. (a) +2 (l.17), (b) +0, l'épingle +0 : 1 202 contre `1cddd2e5`, 1 135 contre `09f49fc2` (borne 1 205). Variantes : la
    l.16 réécrite aussi, +4 ; une quatrième ligne, +3, mais chaque référence à `report.py` au-delà de la l.18 bouge (les tueurs
    `report.py:48` et `report.py:62` du test, ce G0). Le vérificateur estimait +4 (« about 2 changed lines ») : une seule des deux
    lignes changées est de la base.
- **Item 11, fait** : `fields.outside_decisions` retiré ou corrigé aux l.332-333 (`fields` : exactement `decisions`,
  `digest_rule`, `digests`, `value_rule` et `values`), l.602-603 (TRIAL-HEAD-WRITTEN-1 : `trialRegistryHead.hash`, décision comparée,
  fait côté outil) et l.937 (la l.934 du suivi, où commence le paragraphe du rapport) ; et, trouvés par `grep`, l.503 (le plan de T2-1)
  et l.340-342 (`trialRegistryHead.hash` « hors décision » devenu « comparé » : hors de la lettre de l'item, même objet). Chaque
  remplacement garde son nombre de lignes : les quatre W1 de winlint (l.232, l.586, l.731, l.828) ne bougent pas. Après : `outside_decisions`
  ne reste qu'aux deux lignes qui en notent le retrait (l.1390 et l.1564), `outside_reason` qu'au tableau (l.1274, « sans
  `outside_reason` ») et à la l.1390 ; `report.py` n'a plus `outside_reason` (`grep` : aucune ligne ; `TEXTS` tient format, identity,
  tree, generator_identity, decisions, values, digests, explained ln, explained association, engine_log et replay) ; `report_check.py`
  l.221 et le test l.121 affirment l'absence. « hors décision » reste aux l.231, l.642, l.777, l.797 et l.991, états datés des lots 1a à
  1e (la l.797 note la décision qui fait entrer le champ dans les décisions) : non touchés, à juger par MONARK.
- **Fichier de FAITS, fait à moitié** : la demande de lecture formée par la mission 5 est marquée fermée (l.1906-1911) et B8 cite
  `docs/FAITS-PYTHON-PRESITE-2026-10-07.md` ([lu], au lieu du [2nd] du contrôle de CM-5 v4 ; l.1923-1926). **La copie n'est pas
  posée** (Bash refusé ; l'outil d'écriture ne garantit pas l'octet, fins de ligne comprises) : ce G0 cite un chemin absent du lot
  jusqu'à la copie (`cp F:/tmp/dojo/FAITS-PYTHON-PRESITE-2026-10-07.md F:/Monark-wt-reason-order/docs/`, puis les deux sha256 comparés).
- **Épingle et R-25** : aucun fichier de code ni le test ne sont touchés. L'épingle reste `ef31a618…` (mission 5, rejouée par son
  vérificateur). R-25 reste 1 200 contre `1cddd2e5` et 1 133 contre `09f49fc2` (mission 5 et son vérificateur ; non remesurée ici) :
  ce G0 et le fichier de FAITS sont exclus par `:(exclude,glob)docs/**/*.md` (`ci.yml` l.100, lue).
- **Rejeux : aucun.** Ni oracles ni auto-tests de l'outil, ni `guard_check.py`, ni `report_check.py`, ni tests Node (clone à
  `09f49fc2`, clone à `1cddd2e5`), ni `tsc`, `eslint`, `lint-ratchet`, `grep-forbidden`, `lang-gate`, `export-public --check`, winlint,
  ni R-25 : tous restent à rejouer. Par construction seulement : `lang-gate` saute le dossier `docs` de la racine
  (`scripts/lang-gate.mjs` l.113 et l.239-246, lus), `export-public` ne sélectionne pas `docs/**` (`scripts/export-public.mjs`, lu),
  et aucun nom de périphérique de Windows n'est écrit ici.
- **Arrêt** (écart, consigné) : vers 13:1x UTC, une recherche récursive en lecture seule que j'ai lancée pour trouver le chemin de
  winlint (`grep -r` sous `F:/tmp/frozen-tool/m2`, où sont des clones et leurs jonctions `node_modules`, et sous les `scratch` et `runs`
  des missions 3 à 5) est passée en arrière-plan (limite de 120 s). Le `kill` de ses deux processus, les miens seuls, a été refusé par
  le classifieur du harnais (« Interfere With Workloads »), puis toute commande Bash, `now.mjs` compris (deux tentatives). La recherche a
  fini seule (sortie 0, aucun chemin de winlint trouvé). Aucun processus d'un autre n'a été touché ; aucun argument ne visait
  `F:/tmp/rech/` ni `F:/PRODUITS/marche/` (où mènent les jonctions des clones de m2 n'est pas vérifié). Le chemin de winlint reste
  inconnu hors des zones interdites.
- **Git** : aucun `GIT_DIR` ni `GIT_WORK_TREE` posé (mesure `env` non faite dans cette mission), aucun `--write-tree`. Dans le
  worktree, des lectures (`rev-parse`, `branch --show-current`, `status`, `diff --stat`, `diff -U0`, `ls-files`) ; aucun clone, aucune
  copie : `F:/tmp/frozen-tool/m6/` n'existe pas. Rien n'est écrit sur C:.

**Mesure de IO-GUARD-POSED-FILES-1 (RECHERCHES, 2026-10-07, de 16:31 à 16:53 UTC ; Linux).** Instance `claude-opus-5-5` (effort max) de
RECHERCHES, auteur de la branche `recherches/kata-recalc-frozen`, prise de `29c53bd5` (passation de MONARK, point 5). Hôte : Linux x86_64,
CPython 3.14.5 (build `python-build-standalone`, liée statiquement : `_hashlib`, `_struct` ou `_json` y sont intégrés), git 2.43.0. La
construction n'est pas appliquée à l'outil : elle l'est à une copie, pour la mesure seule. Copies : trois clones `--shared` creux (`tools/`
seul), détachés à `29c53bd5`, hors du dépôt : `base` (l'outil tel quel), `cand` (la construction candidate : `-P` dans `FORM`, le poids de
`safe_path` à 1, et dans chacun des huit scripts d'entrée, avant `import io_guard`, la ligne `import os, sys;
sys.path.append(os.path.dirname(os.path.realpath(__file__)))` ; `git diff --stat` : 10 insertions, 2 suppressions) et `rec` (la même, plus
un enregistreur). Prédictions : celles des l.2008-2018, copiées et horodatées avant toute mesure (`00-predictions.txt`, `c0afc2e3…`,
16:31:53Z). Courses complètes sur fixtures seules, sous `python -E -S -s -B -P` (`cand`, `rec`) et sous la forme livrée (`base`, contraste) :
`vectors_check.py` sur les vecteurs de R1 (`7414b2fc…`) et sur ceux du 2026-10-02 (`06ecf069…`, RED voulu), `binom_check.py` (le dépôt, puis
`--registry` sur `wave1.json`, `811fcd57…`), `compare_check.py` (le même registre), `report_check.py`, `guard_check.py`, `recalc_p2.py` et
`report.py` ; ces deux derniers reçoivent un dossier de séries vide et s'arrêtent avant toute lecture : aucune série n'est lue. Témoins : un
fichier qui s'annonce sur stderr (`os.write`) et laisse une marque (une FIFO, `os.mkfifo` ; ni l'un ni l'autre ne lève d'événement d'audit,
la marque vaut donc dans tout processus, avant comme après le crochet), puis rend la main au module que l'import aurait trouvé sans lui, par
la seule machinerie gelée d'import : la course continue et ses sorties sont celles d'une course sans témoin.

1. **`sys.path` d'un script d'entrée** (enregistreur, chaque processus, au départ du script puis au crochet d'`io_guard`) : au départ,
   `[…/lib/python314.zip, …/lib/python3.14, …/lib/python3.14/lib-dynload]`, aucune entrée de l'arbre (73 processus sur 73, enfants
   compris) ; au crochet, l'arbre est la dernière entrée (indice 3 sur 4) ; `safe_path` vaut `True`. Sous la forme livrée, `sys.path[0]`
   est le dossier du script (mesuré). **Conforme à la prédiction.** Les entrées d'une installation Windows (`python314.zip`, `DLLs`,
   `Lib`, le dossier de l'installation) : **rejouées par MONARK sous Windows à la fusion, par script**.
2. **Un témoin sous chaque nom** : `import io_guard` charge ici 38 modules (`io_guard` compris), dont 21 depuis un chemin : `io_guard` et
   `_py_warnings`, `_sysconfigdata__linux_x86_64-linux-gnu`, `_weakrefset`, `collections`, `contextlib`, `enum`, `functools`, `hashlib`,
   `importlib`, `keyword`, `locale`, `operator`, `reprlib`, `selectors`, `signal`, `subprocess`, `sysconfig`, `threading`, `types`,
   `warnings`, soit les 18 de Windows moins `_hashlib` (intégré ici), plus trois. Après le crochet, les courses importent 36 modules de
   premier niveau de la bibliothèque standard : 26 sources (`__future__`, `_colorize`, `_opcode_metadata`, `annotationlib`, `ast`,
   `calendar`, `codeop`, `copy`, `copyreg`, `dataclasses`, `datetime`, `dis`, `fractions`, `inspect`, `json`, `linecache`, `numbers`,
   `opcode`, `platform`, `re`, `struct`, `textwrap`, `token`, `tokenize`, `traceback`, `weakref`), 9 intégrés (jamais cherchés sur un
   chemin, sous aucune forme) et `_wmi`, absent (point 4). Les 47 témoins posés ensemble dans l'arbre (les 20, `_hashlib`, les 26) : sous
   la forme neuve, **aucun ne tourne dans un processus de script d'entrée**, et les sorties des oracles sont égales à l'octet à celles de
   la course sans témoin. Les seules marques (234, dans 13 processus) viennent des 13 lancements `-c` de `guard_check.py` sous une autre
   forme : le cas y pose lui-même la copie de l'arbre en tête de `sys.path` (`_launch`), et le contrôle de la forme les refuse ensuite,
   en sortie 2 (détecté, non prévenu : B8, B9). Contraste, sous la forme livrée : 46 des 47 tournent (tous sauf `_hashlib`), 1 939
   marques, sorties inchangées. **Conforme à la prédiction.** La liste des modules chargés depuis un chemin sous Windows (les 18) :
   **rejouée par MONARK sous Windows à la fusion, par script**.
3. **Le paquet `io_guard/` et un cache forgé** : le paquet tourne sous la forme neuve (marque, sortie 0, `vectors-check.txt` `8708d1ec…`
   inchangé : aucune trace), comme sous la forme livrée. Un cache forgé (`__pycache__/io_guard.cpython-314.pyc`, son en-tête à la date et
   à la taille de la source) tourne aussi : s'il reste, le contrôle du cache d'`io_guard` refuse ensuite, après coup (sortie 4) ; s'il
   s'efface avant de rendre la main, sortie 0 et sortie inchangée, sous les deux formes. **Conforme à la prédiction** : la construction ne
   les atteint pas.
4. **Les noms cherchés sans être trouvés** (un chercheur posé en dernier dans `sys.meta_path`, 73 processus) : deux noms de premier
   niveau, et deux seulement. `msvcrt`, avant le crochet, dans chaque script d'entrée (`subprocess` l'essaie pour savoir s'il tourne
   sous Windows) ; `_wmi`, après le crochet, par `platform` (`report.py`, `report_check.py`, le cas `import-listed` de `guard_check.py`).
   Un témoin « absent » (sa marque, puis `ModuleNotFoundError`) posé dans l'arbre sous ces deux noms tourne sous la forme neuve (courses
   de `vectors_check.py`, `report_check.py`, `guard_check.py` et `report.py` : 48 processus pour `msvcrt`, 3 pour `_wmi`), sorties
   inchangées ; de même sous la forme livrée. **Conforme à la prédiction** : sur cet hôte,
   la construction réduit les noms exposés, de tout module chargé depuis un chemin à ces deux-là. Les noms qu'une installation Windows ne
   trouve pas (des imports facultatifs de POSIX) : **rejoués par MONARK sous Windows à la fusion, par script**.
5. **Les entrées de l'installation passent avant l'arbre** (une copie de l'interpréteur, `cp -a`, hors du dépôt ; forme neuve) : un
   `io_guard.py` posé dans `lib/python3.14` tourne à la place de celui de l'outil (sortie 0, sortie inchangée : le témoin a rendu la main) ;
   de même dans `lib-dynload` et dans un `python314.zip` posé ; un `kata_lib.py` posé dans `lib/python3.14` tourne après le crochet (lu
   comme un fichier de la bibliothèque standard, admis) ; posé dans le `python314.zip`, il est refusé en sortie 4 sans tourner (l'archive
   n'est pas sous `_STDLIB`). Sous la forme livrée, les mêmes `io_guard.py` et `kata_lib.py` ne tournent pas : l'arbre passe d'abord.
   **Conforme à la prédiction** : la confiance passe à l'installation (point (d)). Les entrées d'une installation Windows : **rejouées
   par MONARK sous Windows à la fusion, par script**.
6. **Aucun module de l'outil sous un nom de la bibliothèque standard** : sous 3.14.5, aucun des douze n'est dans
   `sys.stdlib_module_names` (297 noms), ni dans `sys.builtin_module_names`, ni offert par une entrée de `sys.path` de cette installation.
   **Conforme à la prédiction.** `sys.stdlib_module_names` est le même sur toute plateforme ; les noms offerts par une installation
   Windows : **rejoués par MONARK sous Windows à la fusion, par script**.

- **Comparaison avec la G2 de RECHERCHES** (instance neuve, distincte de l'auteur ; pièce
  `coordination/pieces/2026-10-07-g2-recherches/G2-tool-29c53bd5.json`, `6c7523e9…`, commit `1cefc5f` ; CPython 3.14.8, sur ses propres
  copies, scripts `posed.py` et `posed4.py`) : les six conclusions concordent, **aucun désaccord**. Point 1 : les mêmes entrées, l'arbre
  en dernier. Point 2 : la même liste de 20 modules chargés depuis un chemin ; la G2 pose un témoin à la fois sous 35 noms (ces 20 et 15
  de la bibliothèque standard), course `report.py` (usage) : 26 sur 35 tournent sous la forme livrée (les 9 autres sont intégrés ou gelés,
  ou hors de sa chaîne d'imports), 0 sur 35 sous la candidate ; ici, 47 témoins ensemble sur les courses complètes : 46 sur 47 sous la
  forme livrée, aucun dans un processus de script d'entrée sous la candidate. Point 3 : le paquet et le cache forgé tournent sous les deux
  formes, aux deux mesures (ici, en plus, le cache qui reste est refusé après coup, celui qui s'efface passe sans trace). Point 4 : les deux
  mêmes noms, `msvcrt` (`subprocess`, avant le crochet et avant le contrôle de la forme) et `_wmi` (`platform`, après) ; la G2 a mené
  `report_check.py` jusqu'à sa section 3 seulement (son dépôt jetable n'avait pas le commit du lot 1d) ; ici, il est mené à son bout sous
  la forme neuve par un pilote (les deux remplaçants du rejeu, paragraphe suivant), avec ses 49 enfants (39 `compare_p2.py`, 10
  `report.py`) : les deux mêmes noms, aucun autre. Point 5 : concordant (la G2 dans `lib/python3.14` d'une copie de 3.14.8 ; ici aussi
  `lib-dynload` et un `python314.zip`). Point 6 : concordant (297 noms, sous 3.14.8 comme sous 3.14.5). Lecture commune : la construction
  candidate ferme le point 2 seul ; elle laisse les points 3 et 4 et déplace la confiance vers l'installation (point 5).
- **Pour le prix de la construction** (mesuré sur la copie, non appliqué) : sous elle, toutes les sorties d'oracle (vecteurs, vecteurs du
  2026-10-02, seconde écriture, tests de hikae, `--registry`, comparateur) sont égales à l'octet à celles de la forme livrée ;
  `guard_check.py` a deux cas à réécrire, `child-flags` (son texte) et le lancement `-P`, qui devient la forme (sortie 0 au lieu de 2).
  La ligne ajoutée se rejoue quand un script d'entrée en importe un autre (`recalc_p2` par `vectors_check`, `report` par
  `report_check`) : elle remet l'arbre en fin de `sys.path` une fois de plus, sans effet mesuré ; la construction réelle l'écrirait
  idempotente. `tools/kata-quarter` n'est pas dans cet arbre : la pose de ses deux arbres n'est pas mesurée.
- Scripts (espace de travail de RECHERCHES, hors du dépôt, sha256) : `apply_construction.py` `dfb4f03f…`, `recorder.py` `2d761ccd…`,
  `witness.py` `3369c8e5…`, `driver.py` `f6b86874…`, `posed.sh` `d39fded4…`, `rest.sh` `84cc3591…`, `analyse_rec.py` `6cc4c98a…` ;
  journal de l'enregistreur `66725223…`, son analyse `6507274f…`.

**Clôture du §17 (RECHERCHES, 2026-10-07, 17:1x UTC ; G2 de `1cddd2e5...29c53bd5` : CORRECTIONS, trois constats m, tous de texte,
aucun sur le code).** Les phrases du paragraphe « Mission 6 » (l.2033-2035, l.2061-2072) restent l'état daté de 13:1x UTC ; ce paragraphe
les clôt (constat m-1). Après la mission 6, MONARK a posé dans `29c53bd5` (16:17 UTC) ce qu'elles disaient non fait, et la G2 l'a vérifié :
- la copie du fichier de FAITS, `docs/FAITS-PYTHON-PRESITE-2026-10-07.md`, sha256 `0c94273f…`, le même blob (`8cee253a`) que la pièce de
  MONARK dans RECHERCHES (`37c29e1`) ;
- les deux commentaires de `report.py`, portés à lignes égales (l.17-18 et l.132-133), égaux à l'octet aux textes (a) et (b) de la
  mission 6 ;
- l'épingle d'arbre `d6c80e9db438fe2fb9ea3ca7fab03dc4cc6902eed23a08ca6863417da2a1b451` (douze fichiers ; `ef31a618…`, celle de la mission 5,
  n'a jamais été committée ; depuis sa liste, seul `report.py` change, `1f7e91bd…` → `b2e5767f…`), recalculée par la G2 de quatre façons
  (la règle du test sur l'index, l'arbre committé, l'arbre de travail, `report.tool_identity` sous la forme) ;
- R-25 en forme de CI, mesuré par la G2 : 1 202 contre `1cddd2e5` (14 fichiers, 1 037 insertions, 165 suppressions ; borne 1 205), 1 135
  contre `09f49fc2`, et 1 202 contre le tronc `102b44d3` sur une fusion d'essai.

**Rejeux sous Linux**, sur fixtures seules, aucune série lue (RECHERCHES auteur sous CPython 3.14.5, la G2 sous 3.14.8, chacun sous
`python -E -S -s -B` ; sorties de l'auteur sous son espace de travail) :

| Course | Linux (auteur ; G2) | Référence Windows (ce G0) |
|---|---|---|
| `vectors_check.py`, vecteurs de R1 (`7414b2fc…`) | GREEN, 363 contrôles, `8708d1ec…` ; idem | `8708d1ec…`, égal à l'octet |
| `vectors_check.py`, vecteurs du 2026-10-02 (`06ecf069…`) | RED voulu, `c05f8cc1…` ; non rapporté | `c05f8cc1…`, égal à l'octet |
| `binom_check.py`, seconde écriture et tests de hikae | GREEN, 16 821 contrôles ; 24 tests, 207 756 assertions, 4 non rejouables ; `63606d4f…` et `68e16302…` ; idem | égaux à l'octet |
| `binom_check.py --registry`, `wave1.json` (`811fcd57…`) | GREEN, 280 lignes, 1 680 contrôles ; non rapporté | tourné sur `7eb07d4d…` : pas de comparaison à l'octet |
| `compare_check.py`, même registre | GREEN, 33 cas sur 33 ; idem | tourné sur `7eb07d4d…` |
| `guard_check.py` | GREEN, 43 cas et les homonymes, 3 sautés (deux cas de module d'extension : ce build les a tous intégrés ; `ntfs-stream`) ; idem | 43 cas, GREEN ; les trois cas sautés : rejoués par MONARK |
| `report_check.py` tel quel | sortie 1 à la section 3 : `platform_fields` ne nomme la bibliothèque du `log` que sous Windows, par construction | 75 sur 75 |
| `report_check.py`, pilote hors de l'arbre (`platform_fields` et `LIBMS` remplacés dans son seul processus) | auteur : 73 sur 75, les deux contrôles de la section 3 qui exigent Windows en échec, comme ils le doivent ; G2 : 75 sur 75 avec un faux `ucrtbase.dll` lu sous le rôle `libm` ; le `log` de cet hôte diffère du portage sur 9 070 entrées mesurées, aux deux | la section 3 avec le vrai `ucrtbase.dll` et `LIBMS` : rejouée par MONARK |
| `recalc_p2.py` et `report.py`, dossier de séries vide | arrêtés avant toute lecture (le premier à son premier fichier de série, absent ; le second à `platform_fields`, sortie 2) | courses complètes sur les séries : rejouées par MONARK |

- Tests Node à `24f50372` (avant la fusion du tronc) : `kata-recalc`, `byte-guard`, `short-digest-floor`, `spec-1-1-0-release` et
  `apps/harness/test/*.test.ts`, 332 tests, 331 verts ; seul `kata_recalc_release_classes_are_the_published_bands` rougit, par assertion (le
  registre arrive avec le tronc). La G2, sur une fusion d'essai avec `102b44d3` : `npm test`, 2 903 tests, 2 881 verts, 0 rouge, 22 sautés ;
  red-proof `--base 102b44d3 --gel dc8054ca --draw 8 --seed 20261007` : 7 jugés, 7 F2P, 7 tueurs tirés, 7 tués ; portes vertes ; winlint :
  les quatre W1 connus de ce G0 seulement. La fusion du tronc, red-proof et R-25 de la tête de la PR sont consignés après la fusion.
- **Constat m-2** : la table des sorties de `report.py` (l.16-18) vaut pour un lancement qui importe `io_guard`. Sous `-P` ou `-I`, le
  dossier du script n'est pas sur `sys.path` : l'import d'`io_guard` échoue (`ModuleNotFoundError`) et la course sort en 1, le code que la
  table donne au refus par la règle de preuve ; aucun rapport n'est écrit (mission 3, l.1425-1426 ; G2 sous 3.14.8 ; ici sous 3.14.5,
  `-E -S -s -B -P` et `-I -S -B` : sortie 1 ; la forme : l'usage, sortie 2). Le texte de `report.py` ne change pas ici (l'épingle ne bouge
  pas). La construction candidate de IO-GUARD-POSED-FILES-1 rendrait la phrase vraie : mesuré sur sa copie, `-I -S -B` y sort en 2
  (« isolated 1 ») et l'ancienne forme aussi (« safe_path False »). Sinon, la l.18 se réécrit à lignes égales avec le lot qui tranche
  l'item (R-25 +0, l'épingle bouge).
- **Constat m-3** : « rebase » est remplacé aux l.1367-1369 et l.1568-1569 par la fusion du tronc dans la branche, sans rebase (la branche
  est poussée), à nombre de lignes égal.
