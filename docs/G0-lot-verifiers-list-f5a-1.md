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
