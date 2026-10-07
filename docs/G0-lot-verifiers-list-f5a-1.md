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
  - `fields` : la liste des champs comparés, et `outside_decisions` = `[{field: "trialRegistryHead.hash", reason}]`, seul
    élément. Les sept champs sautés en P2b ont chacun leur sort :
    - `check1`, `check2` : comparés. Ce sont les issues des contrôles de dépendance, que le point 7 exige ;
    - `reason` : comparé ; c'est l'une des sept chaînes de FORMAT l.48 ;
    - `trialId` : comparé ; forme de FORMAT l.45 ;
    - `plan`, `engine` : comparés. Forme de FORMAT l.43, construite depuis le plan épinglé `87b57c01…` et le moteur porté
      `207f021f` ;
    - `trialRegistryHead.length` (80) : comparé ;
    - `trialRegistryHead.hash` : hors décision. La chaîne de hachage des essais n'est écrite que dans le code du générateur
      (FORMAT l.44 nomme `append` et `wave1Trials()` de `kata/src/trials.ts`), et aucune colonne de ligne ne la lit
      (`readRegistry` la lit comme un objet, `policy-projection.ts` l.68) ;
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
  python -B tools/kata-recalc/report.py --repo <clone> --series <dossier des quatre séries> --vectors <vectors.json> --registry <wave1.json> --out <dossier vide>
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
    - `outside_decisions` = `[trialRegistryHead.hash]`.

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
  registre de la vague 2. Objet : écrire la construction de la chaîne des essais, pour que `trialRegistryHead.hash` sorte de
  `outside_decisions`.
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
    `fields` (décisions, `values`, `digests`, `outside_decisions` = `trialRegistryHead.hash` et sa raison en mots, deux règles),
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
