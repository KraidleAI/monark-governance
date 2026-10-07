# G0 de SHORT-DIGEST-INVERSION-1 : ce qu'une ligne kata publiée laisse retrouver par énumération, mesuré sur les 280 lignes de la vague 1, et la règle de publication qui le tient

- **Demande** : item SHORT-DIGEST-INVERSION-1, porteur RECHERCHES (`docs/ETAT.md` l.539-544 à la base ; constat F-1 de la
  vérification de la spécification 1.1.0, contrat §10 « Short 0/1 sequences »). C'est un des deux maillons d'avant E-2a sur le
  chemin de la mise en service de la vague 1, visée vers le 2026-10-20 (ETAT l.26-28 ; message de RECHERCHES
  `recherches:coordination/messages/2026-10-06-RECHERCHES-vers-MONARK-plan-apres-T0.md` l.112, l.116-117). Cadrage de
  RECHERCHES (même message, l.93) : le remède n'est pas choisi ; une colonne ajoutée demande une valeur neuve de `row_format` et
  un acte d'ADR (contrat l.449) ; une lecture sur `n` se contente d'une révision datée.
- **Base** : `lot/etude-suite` = `d8fe354c`, worktree `F:/Monark-wt-shortdigest`, branche `monark/short-digest-inversion-1`.
  - Le tronc a avancé depuis à `57a131fc` (R-a d'ENGINE-ROW-RETIRE-PATH-1 fusionné). Les lignes citées de `policy-guard.ts`
    (l.43, l.50), `policy-projection.ts` (l.116), `policy-table-file.ts` (l.59) et `spec-publish.mjs` (l.288-289) y sont
    inchangées (relu par `git show 57a131fc:<chemin>`).
  - R-b (`monark/retire-path-rb` @ `9bccd2e5`, non fusionné) touche `spec-publish.mjs` l.18 et l.207 et ajoute une fonction
    après l.299 : aucun recouvrement avec `tableRowProblems` (l.284-298). La partie 3 de VERIFIERS-LIST-F5A-1 réécrit, elle,
    des clauses de `tableRowProblems` (son G0 §3.4 et R-3, branche `monark/verifiers-list-f5a-1` l.394-413, l.554-555).
  - `recherches` est lu dans le clone du scratchpad, à `8437a42e`. Node 24.21.0. Aucun Python.
- **Zone proposée** (détail au §5) : `apps/harness/src/policy-digest-floor.ts` (neuf), `scripts/spec-publish.mjs`
  (`tableRowProblems` et son commentaire, l.284-298), `scripts/spec-publish.d.mts`, `apps/harness/src/policy-guard.ts` (une
  clause), `test/short-digest-floor.test.ts` (neuf), `test/spec-1-1-0-release.test.ts` (l.144-159),
  `apps/harness/test/policy-guard.test.ts`. `docs/ETAT.md` n'est pas touché : l'orchestrateur y écrit au G7.
- **Auteur** : MONARK. Rédaction par un worker `claude-opus-5-5` (effort max) le 2026-10-06, horloge lue à 22:36 UTC au début
  et à 23:13 UTC à la rédaction. Ce G0 est le seul fichier écrit dans le worktree. Les scripts de mesure vivent sous
  `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/shortdigest/` (annexe A). Aucun commit (R-20),
  aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, rien écrit sur C:.

## 1. Sources (toutes [lu], sur place, dans cette session)

| Source | Lignes citées | sha256 |
|---|---|---|
| Contrat 1.1.0, `recherches:kata/spec/CONTRACT-1.1.0.md` (= `contract-1.1.0/CONTRACT.md` publié à `ffb5ea3`, = épingle `test/spec-1-1-0-release.test.ts` l.37) | l.289, l.293, l.345-347, l.351, l.361, l.393, l.399-405, l.410, l.419, l.439-449, l.463, l.470, l.490-494, l.582, l.585-588, l.597 | `ac8187fa…` |
| `recherches:kata/spec/KATA-SPEC.md`, version 2026-10-02 | l.7, l.17 | `b32a4062…` |
| `recherches:kata/registry/FORMAT.md` (= épingle d'A-2 l.25) | l.3, l.21, l.23, l.26, l.35-38, l.46-49 | `dc1ec944…` |
| `recherches:kata/registry/wave1.json` : lu en entier par script ; seuls des comptes, des bits et des égalités de digests en sortent | §2.3 | `811fcd57…` (565 462 octets) |
| `recherches:kata/registry/census.json` : comptes par bloc (`flat`, `decisions`) seulement | §2.3 | `95e5b984…` |
| `recherches:kata/registry/PROVENANCE-wave1.md` | l.8, l.11-12 | `ba7942ab…` |
| Rapport de vague 1 publié (`reports/wave1-report.md` de `monark-kata-spec` @ `ffb5ea3` = copie de `recherches`) | l.3, l.8-9, l.12-14, l.580-591 | `e91edb41…` |
| `recherches:kata/spec/vectors-1.1.0.json` (tables `synthetic_kata`) | §2.3 | `190b9fd8…` (= épingle du test l.38) |
| Banc générateur, `recherches:kata/bench/calibrate.ts` (identique à l'octet au commit générateur `1ea4f64`, `git show`) | l.17, l.44, l.71-72, l.81-85, l.117-119, l.128-131 | `fc6422b9…` |
| Plan P2, `recherches:decisions/0005-G0-part-P2-calibration.md` | l.21, l.41-51, l.109, l.112, l.116, l.121 | `87b57c01…` |
| ADR 0005 v3.1 (pré-enregistrement) | l.16, l.77-82, l.89, l.105, l.119 | `b011e4de…` |
| ADR 0006 v8.1 (vague 2) | l.25, l.41-43 | `fe48c03a…` |
| A-2 r3, `recherches:decisions/0004-ADR-amendment-A-2-import-guard.md` | l.65-68, l.75, l.94-100, l.108, l.154, l.162-164, l.168, l.177 | `d883725a…` |
| Message de RECHERCHES, plan d'après T0 | l.82-98, l.112, l.114-125 | `3b9c12dd…` |
| Message de MONARK, séries Binance enregistrées (2026-10-01) | l.14, l.22, l.51, l.57 | `053430e7…` |
| `monark-precommitments` @ `43472d7`, `PRECOMMITMENTS.md` | l.8 | - |
| governance @ `d8fe354c` : `scripts/spec-publish.mjs`, `scripts/spec-policy-tables.mjs`, `apps/harness/src/policy-guard.ts`, `policy-projection.ts`, `policy-table-file.ts`, `kata-path.ts`, `tools/gate.ts`, `packages/hikae/src/runs.ts`, `schemas/policy-row.schema.json`, `schemas/coverage-verdict.schema.json`, `test/spec-1-1-0-release.test.ts`, `scripts/lang-gate.mjs`, `scripts/lang-exempt.json` | par ligne | base |
| G2 delta a-et-b de SPEC-1-1-0-RELEASE, `docs/G2-lot-spec-1-1-0-release-delta-a-et-b.md` (M-1, origine de la règle actuelle) | l.174-178 | base |
| G0 de VERIFIERS-LIST-F5A-1 (`monark/verifiers-list-f5a-1` @ `e8800192`) | l.312-313, l.322, l.344-347, l.394-413, l.427-430 | - |

## 2. Constat, à la base `d8fe354c`

### 2.1 La porte, la garde, l'écrivain : aujourd'hui, aucune ligne kata ne passe

- **La porte.** `tableRowProblems(table, fixture)` (`scripts/spec-publish.mjs` l.289-298) rend `short_digest` pour toute ligne :
  - dont `n` n'est pas un entier sûr ou vaut au plus `SHORT_N` = 30 (l.288, l.293) ;
  - dont `p_served` est non nul et n'est pas un entier sûr ou vaut au plus 30 (l.293) ;
  - hors fixtures, dont `aux_sha256` ou `series_sha256` est non nul (l.294).

  Le commentaire (l.284-287) en donne la raison : le nombre de points de ces deux empreintes n'est pas écrit dans la ligne.
- **Origine de la clause sur `aux_sha256` et `series_sha256`** : constat M-1 de la G2 delta a-et-b (l.176-178), « Ces
  empreintes peuvent couvrir une suite plus courte que `n` », et correctif « jusqu'à la révision kata ». C'était une
  précaution, pas une mesure. Le §2.2 la mesure.
- **La garde exige ces deux empreintes.** `guardKataRow` refuse toute ligne kata dont `aux_sha256` ou `series_sha256` est nul
  (`policy-guard.ts` l.50). La projection les copie du registre (`policy-projection.ts` l.116). Le schéma les admet nulles
  (`schemas/policy-row.schema.json` l.94-95) ; le contrat ne les dit pas « not null », à la différence de `scores_sha256`
  (l.405).
- **Une ligne refusée fait refuser sa table entière.** Chaque cellule projetable d'une classe a exactement une ligne
  (`policy-table-file.ts` l.38-59 ; refus l.59), et un côté de direction porte ses trois seaux (contrat l.439). Une ligne ne
  peut donc être ni retirée ni vidée : sa table n'est pas publiée, et sa classe garde son fichier sans ligne.
- **L'écrivain lie le servi au publié.** `tableText` lève sur le premier problème de `tableRowProblems`
  (`scripts/spec-policy-tables.mjs` l.48-53). `expectedFiles` construit les fichiers depuis `SERVED_POLICY_TABLES`, la valeur que
  le service bâtit au chargement (l.10-13, l.57-61).
  - Une table servie qui porterait une ligne refusée fait donc lever `expectedFiles`. Cela rougit
    `the_published_schemas_load_together_and_validate_a_served_decision`, qui l'appelle à la l.94 (test l.91-105). C'est aussi
    ce que montre `the_writer_refuses_through_expected_files_what_the_gate_refuses` (l.161-168).
  - `published_tables_are_the_served_tables_byte_for_byte` (l.123-130) rougit, lui, pour toute ligne kata servie, refusée ou
    non : il exige les 32 tables kata vides (l.129). E-2a le réécrit (G0 de R-b, Q-Rb-7, branche `monark/retire-path-rb`).
- **Conséquence** : toute ligne kata porte les deux empreintes (garde l.50), et la porte les refuse (l.294). Aucune table kata
  ne peut être publiée aujourd'hui, donc aucune servie.
- **Tests qui tiennent la règle** : `no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer` (l.144-159 ; attendus
  `(aux_sha256)` et `(n 30, series_sha256)` l.155-156), `the_writer_refuses_through_expected_files_what_the_gate_refuses`
  (l.161-168), `spec_publish_refuses_a_hand_edited_table_even_pinned_again` (l.184-194),
  `the_vectors_file_may_hold_tables_and_only_its_synthetic_fixtures_skip_recompute` (l.328-335).

### 2.2 Ce que digère chaque empreinte d'une ligne kata

| Empreinte | Ligne | Suite digérée | Longueur | Alphabet | Ce que la ligne en publie | Source |
|---|---|---|---|---|---|---|
| `scores_sha256` | `sign-set` (direction) | score 0 si le label est du côté de la case, 1 sinon (un plat est un manqué) | n | 0/1 | n ; nombre de 1 = `misses` ; issue de runs | plan P2 l.45 ; `calibrate.ts` l.71, l.85, l.117-118 ; FORMAT l.35 |
| `scores_sha256` | `scaled-band` | label / sigma_hat | n | réel | n, `qhat` (la valeur d'un score, plan l.109), `calib_support` | plan l.46-48 ; `calibrate.ts` l.81, l.85 |
| `aux_sha256` | `sign-set` | 1{label up} (plat = 0) | n | 0/1 | issue `runs_aux` | `calibrate.ts` l.72 ; ADR 0005 l.82 |
| `aux_sha256` | `scaled-band` | **les scores eux-mêmes** | n | réel | comme `scores_sha256` | `calibrate.ts` l.44 (commentaire), l.82 |
| `series_sha256` | toute ligne kata | le fichier source épinglé de 15 minutes du symbole | 70 080 bougies, 12,3 Mo pour BTCUSDT | réel (OHLCV) | rien d'autre | FORMAT l.23 ; PROVENANCE l.11-12 ; message séries l.14, l.22, l.57 |

- **Écriture** : `JSON.stringify` de la suite (`calibrate.ts` l.17 ; FORMAT l.36). Une suite 0/1 de n points s'écrit
  `[0,1,…]`, soit 2n + 1 octets.
- **La longueur de la suite auxiliaire est toujours n.** `aux.push` (l.72 en direction, l.82 en bande) et `scores.push` (l.85)
  sont dans la même itération, après tous les `continue`. `n` est la longueur des scores (l.117). Le doute de M-1 est donc levé
  par le code du générateur.
- **Les bits de `balancedExceedance` n'entrent dans aucun digest.** Ils ne servent qu'au contrôle 2 d'une bande (l.130-131 ;
  `runs.ts` l.91-107). Le digest auxiliaire d'une bande est celui des scores réels.
- **Relation entre les deux suites 0/1 d'une ligne de direction** (de `calibrate.ts` l.71-72) :
  - côté `up` : label 1 exactement quand le score vaut 0, donc la suite des labels est le complément des scores ;
  - côté `down` : label 1 quand le label est up, score 1 quand il est up ou plat ; les deux suites ne diffèrent qu'aux plats.

  Les issues de runs sont donc liées :
  - sur un côté `up` qui sert {up} (`qhat` 0), `runs_miss` et `runs_aux` portent sur le même nombre de runs (FORMAT l.38) ;
  - quand `qhat` vaut 1, `runs_miss` porte sur une suite toute nulle et vaut `empty` (FORMAT l.46). Seule `runs_aux` contraint
    alors l'arrangement des scores.
  - Mesuré sur la vague 1 : une seule ligne `sign-set` a `qhat` 0, sol vote4 up-b3 (`vetoed`, côté `up`) ; les 239 autres ont
    `runs_miss` `empty`.
- **`series_sha256` n'est pas une suite de points de calibration.** C'est le sha256 d'un fichier. « Lire sa longueur sur `n` »
  serait faux : sa longueur n'a aucun rapport avec `n`.
- **Les autres empreintes d'une ligne** ne digèrent aucune suite non publiée :
  - `scale_table.sha256` : celui de `values`, publiées à côté (contrat l.399, l.419) ;
  - `recompute.scores_sha256` : égal à `scores_sha256` (A-2 l.94) ;
  - `recompute.report_sha256` : un fichier publié avec la table (A-2 l.97) ;
  - `calib_parent` : une ligne publiée (contrat l.444) ;
  - `source.registry_sha256` : un fichier de 565 462 octets ;
  - `fit_sha256` : nul en vague 1 (`policy-projection.ts` l.103).

### 2.3 Mesures sur les 280 lignes de `wave1.json`

Script `measure.mjs` (annexe A). Il lit `wave1.json` et `census.json`. Il imprime des comptes, des bits et des égalités de
digests, jamais une valeur par décision.

- **Statuts** : direction 239 `silence` et 1 `vetoed` ; bande 37 `silence`, 2 `region` et 1 `vetoed`. C'est le rapport publié
  (l.8-9). Aucune ligne `under_calib`, aucune ligne de n = 0, aucun digest de `[]`.
- **`series_sha256`** : 280 lignes sur 280 égales à l'épingle de leur symbole (PROVENANCE l.12) ; 4 valeurs distinctes.
- **`aux_sha256` = `scores_sha256`** :

| Lignes | Égales | Lecture |
|---|---|---|
| bande (40) | 40 | la suite auxiliaire est la suite des scores |
| direction, côté `up` (120) | 0 | complément, jamais égal |
| direction, côté `down` (120) | 92 | égales exactement quand la case n'a aucun plat |

  Côté `down`, par symbole : BTCUSDT 30/30, ETHUSDT 26/30, BNBUSDT 27/30, SOLUSDT 9/30. Plats du bloc CALIB dans
  `census.json`, 1h / 4h : BTCUSDT 0 / 0, ETHUSDT 2 / 0, BNBUSDT 2 / 0, SOLUSDT 34 / 2, sur 4 368 / 1 092 décisions (= ADR 0005
  l.81). L'égalité publiée dit seulement « aucun plat dans cette case » : c'est un compte par case, que la précision 2 admet
  (plan l.109).
- **n** : direction de 20 à 1 254 (1h : 348 à 1 254 ; 4h : 20 à 456 ; médiane 377) ; bande 1 092 à 4h et 4 368 à 1h.
- **Travail d'énumération d'une suite 0/1 de direction**, H0 = log2 C(n, `misses`) : min 16,94 ; p05 89,91 ; p25 171,14 ;
  médiane 372,39 ; p75 697,87 ; max 1 248,53 bits.

| Seuil | Lignes sous le seuil (H0) |
|---|---|
| 30 bits | 2 |
| 40 bits | 4 |
| 64 bits | 8 |
| 80 bits | 10 |
| 112 bits | 20 |
| 128 bits | 28 (29 avec l'issue de runs) |
| 256 bits | 104 |

- **Les 28 lignes sous 128 bits sont toutes à 4h.** Le minimum à 1h est de 343,32 bits. Les dix lignes sous 80 bits :

| Table | Case | n | misses | Statut | H0 (bits) |
|---|---|---|---|---|---|
| eth-dir-4h | trend-ema-v1 / up-b3 | 20 | 12 | silence | 16,94 |
| sol-dir-4h | trend-ema-v1 / up-b3 | 20 | 12 | silence | 16,94 |
| sol-dir-4h | vote4-v1 / up-b3 | 41 | 12 | vetoed | 32,88 |
| bnb-dir-4h | takerflow-v1 / up-b3 | 43 | 24 | silence | 39,54 |
| eth-dir-4h | vote4-v1 / up-b3 | 46 | 24 | silence | 42,84 |
| btc-dir-4h | trend-ema-v1 / up-b3 | 56 | 28 | silence | 52,76 |
| btc-dir-4h | takerflow-v1 / up-b2 | 58 | 33 | silence | 53,95 |
| btc-dir-4h | takerflow-v1 / up-b3 | 62 | 33 | silence | 58,51 |
| btc-dir-4h | takerflow-v1 / up-b1 | 71 | 33 | silence | 67,34 |
| btc-dir-4h | trend-ema-v1 / up-b2 | 81 | 46 | silence | 76,43 |

  `n` et `misses` sont déjà publics, case par case, dans le rapport publié (l.12-14).
- **Ce que l'issue de runs retire.** Le contrôle refuse l'ensemble {R ≤ r*} (`runs.ts` l.59-77, niveau 0,05, queue basse).
  Connaître l'issue réduit les candidats à cet ensemble (`reject`) ou à son complément (`pass`). Mesuré : de 0,04 à 4,53 bits
  de moins ; l'ensemble refusé pèse de 2,46 % à 4,99 % de C(n, k). Aucune marge fixe ne suffit en général : avec r* = 2,
  l'ensemble refusé compte 2 suites. Il faut donc compter exactement.
- **Compte exact N(n, k, issue)**, par la forme close de `runs.ts` l.60-62 (`ladder.mjs`). Contrôlé contre l'énumération
  complète des 2^n suites pour 91 couples (n, k), n ≤ 14 : 0 différence. Minimum de log2 N par table de direction, avec
  l'issue publiée :

| Table | min log2 N (bits) |
|---|---|
| eth-dir-4h | 16,91 |
| sol-dir-4h | 16,91 |
| bnb-dir-4h | 39,49 |
| btc-dir-4h | 52,71 |
| sol-dir-1h | 343,25 |
| btc-dir-1h | 398,07 |
| bnb-dir-1h | 399,68 |
| eth-dir-1h | 416,24 |

- **Côté `down`, la suite des labels a `misses` − f uns**, où f est le nombre de plats de la case, inconnu de la ligne. Borné
  par les plats du bloc (`auxcap.mjs`), min sur u de `misses` − cap à `misses` de log2 N(n, u, `runs_aux`) :
  - cap 34 (le plus grand compte de plats d'un bloc CALIB de la vague 1, SOLUSDT 1h) : tables 1h ≥ 537,04 bits ; tables 4h
    de 70,06 (bnb) à 133,25 (eth) bits ;
  - cap 2 : mêmes ordres, à moins d'un bit près.
- **Fixtures `synthetic_kata`** (`vectors.mjs`, `ladder.mjs`) : six lignes `sign-set`, min log2 N = 80,23 bits (up-b2, n 92,
  `misses` 62). Une ligne de bande à `misses` 0 a des scores réels : la règle 0/1 ne s'y applique pas.
- **La porte actuelle sur la vague 1** : toutes les lignes kata sont refusées (l.294). La seule partie « n et `p_served` »
  refuserait 4 lignes : eth trend-ema up-b3 (n 20, `p_served` 16) ; bnb takerflow up-b3 (n 43, `p_served` 30) ; sol trend-ema
  up-b3 (n 20, `p_served` 16) ; sol vote4 up-b3 (n 41, `p_served` 29). Elle refuserait donc 3 tables (eth, bnb et sol
  dir-4h).

### 2.4 Coût d'une inversion, mesuré sur des suites de synthèse

Script `rate.mjs`. Il ne lit que des suites tirées d'un générateur pseudo-aléatoire à graine, jamais une valeur du registre.

- **Débit** de `createHash("sha256")` de Node 24.21.0 sur un cœur de cet hôte : 8,38e5 /s (41 octets, n = 20), 8,52e5 /s
  (83 octets), 6,89e5 /s (401 octets), 4,38e5 /s (2 001 octets).
- **Inversions de synthèse** par énumération des k-parties :
  - n = 20, k = 12 : retrouvée en 20 789 essais, 0,04 s ;
  - n = 200, k = 2 : 4 395 essais, 0,02 s ;
  - n = 500, k = 3 : 15 051 662 essais, 92,6 s.

  La règle « plus de 30 points » ne protège donc rien quand k est publié et petit.
- **Équivalents au débit mesuré** (hachage seul, un cœur) :

| Candidats | Exemple | Temps |
|---|---|---|
| C(20, 12) = 125 970 | n 20 | 0,15 s |
| C(41, 12) = 7 898 654 920 | n 41, vetoed | 2,6 heures |
| C(43, 24) = 800 472 431 850 | n 43 | 11 jours |
| C(56, 28) = 7,65e15 | n 56, btc-dir-4h | 289 années-cœur |
| 2^64 | - | 7,0e5 années-cœur |
| 2^80 | - | 4,6e10 années-cœur |
| 2^128 | - | 1,3e25 années-cœur |

- **Limite de la mesure** : un seul cœur. Aucun débit de matériel parallèle n'est mesuré ni cité. Item
  DIGEST-FLOOR-ATTACKER-COST-1 (§8).

### 2.5 Ce qu'une inversion révèle, et qui peut le recalculer sans inverser

- **Révélé** : l'ordre des réussites et des manqués de la case sur CALIB, sans heure ni prix (FORMAT l.37). Pour la suite des
  labels : sur un côté `up`, le complément, rien de plus ; sur un côté `down`, la position des plats parmi les manqués. Rien
  sur une ligne de bande : ses suites sont réelles.
- **Déjà public** : n, k*, `misses` et les deux issues de contrôle de chaque case, dans le rapport publié (l.12-14) ; les mois
  du bloc TEST (l.299 et suivantes) ; la part de plats et la part de up du bloc TEST par symbole (l.580-591).
- **Qui peut recalculer la suite sans inverser** (attaquant « A ») :
  - les données : point d'accès public `https://api.binance.com/api/v3/klines` (message séries l.14) ;
  - la fonction de kata : `KATA-SPEC.md`, publiée ;
  - les seuils et les facteurs : colonnes publiées de la ligne (contrat l.398-399) ;
  - en revanche, les labels, les règles d'abandon et les bornes du bloc CALIB ne sont écrits que dans l'ADR 0005 et le plan
    (KATA-SPEC l.7). Leur texte est absent des dépôts publics lus ici : `monark-kata-spec` @ `ffb5ea3` (fichiers listés par
    `git ls-files`) et `monark-precommitments` @ `43472d7`, dont `PRECOMMITMENTS.md` l.8 ne porte que le nom du fichier et
    son sha256. Ils se devinent : par exemple, n = 4 368 = 182 × 24 sur une bande à 1h (ADR 0005 l.81).
  - Pour A, toute empreinte, courte ou longue, confirme une reconstruction devinée. Aucune règle de longueur ni de plancher n'y
    change rien ; seule une non-publication ou un engagement à clé le ferait (§3, option e).
- **Ce que la règle protège** : l'attaquant « B », qui n'a que les fichiers publiés. Pour lui, un digest inversé en 0,15 s
  vaut publication de la suite. Le précommitment l'interdit :
  - plan P2 l.21 : « No series byte, price or derived per-decision value is ever committed » ;
  - l.109 : les suites par décision n'entrent au registre que par leur sha256 ;
  - raison écrite à Q-P2-2 (l.121, réponse l.116) : le statut de non-redistribution des séries (message séries l.51).
  - L'accepter (option f) demande donc une ligne datée du plan et la décision de l'investisseur sur l'usage public des données
    (ETAT l.33-34 : « usage interne »).
- **Première apparition publique des quatre digests de séries.** `git grep` des quatre préfixes rend 0 sur governance
  (`d8fe354c`, dépôt entier, d'où le miroir public est exporté), `monark-precommitments` (`43472d7`) et `monark-kata-spec`
  (`ffb5ea3`). Une ligne kata publiée les montrerait
  pour la première fois, comme la liste `inputs` du rapport du vérificateur (G0 VERIFIERS l.322). C'est le hachage d'un
  fichier non redistribuable, pas son contenu, mais c'est une première : à nommer (Q-7).

### 2.6 Les autres canaux d'une empreinte

- **Le verdict servi** porte `scores_sha256` = `row.scores_sha256` (contrat l.470 ; `kata-path.ts` l.83). Le champ est requis et
  non nul (contrat l.405 ; `schemas/coverage-verdict.schema.json` l.86). Le digest des scores d'une ligne servie ne peut donc pas
  être retenu ; seule sa table peut l'être.
- **La ligne de résumé** en tronque l'affichage (`gate.ts` l.758-769), pas le verdict.
- **Le rapport du vérificateur**, publié dans le dossier daté (G0 VERIFIERS l.312-313) :
  - il liste chaque digest différent avec l'indice du premier terme qui diffère (l.344-347) ;
  - un digest 0/1 ne peut différer sans une différence de décision (`n` ou `misses`), et le rapport n'est écrit qu'à 280
    décisions égales (l.359) ;
  - il publie les quatre digests de séries dans `inputs` (l.322). Item VERIFIER-REPORT-DIGESTS-1 (§8).
- **Le rapport de vague 1 publié** ne porte aucun digest de case. Une seule chaîne de 64 hex : la tête du registre des essais
  (l.3).

## 3. Options

Mesure commune : les 32 tables kata ; 8 de direction à 30 lignes chacune, 24 de bande à 40 lignes en tout. Les deux lignes
`region` sont des bandes : `btc-range-4h` et `bnb-mae-down-1h`.

### (a) Lire la longueur sur `n`

- **Texte** (révision datée) : `aux_sha256` couvre les n points de la ligne ; `series_sha256` est le digest d'un fichier
  source, pas une suite de points ; la règle des 30 points reste.
- **Code** : la clause l.294 tombe. `n` et `p_served` ≤ 30 restent.
- **Acte** : révision datée seule. Le contrat la prévoit : l.361, dernière phrase ; l.585-588, « clarify text » et tables
  neuves dans un dossier neuf.
- **R-25** : ~60 lignes.
- **Effet sur la vague 1** : 3 tables refusées (eth, bnb et sol dir-4h, par `n` ou `p_served`), 29 publiées (190 lignes). La
  plus faible empreinte publiée est dans btc-dir-4h : 52,71 bits, soit 289 années-cœur au débit mesuré.
- **Risque résiduel** : la protection est un accident de `p_served`, pas une règle. Une ligne de n 60 à 2 manqués passerait
  avec C(60, 2) = 1 770 candidats. Le principe du §2.5 n'est pas tenu.

### (b) Ajouter une colonne de nombre de points

- **Texte** : nouvelle valeur de `row_format` (`class-policy-v3`) et révision datée (contrat l.393, l.449, l.582), plus un acte
  d'ADR : A-2 §2.1 fixe les colonnes (l.65-68).
- **Code** : schéma, `@monark/contracts`, projection, garde, porte, écrivain, et un second format de table que le serveur lit à
  côté de `class-policy-v2`.
- **R-25** : estimé de 500 à 800 lignes, en plusieurs lots.
- **Effet** : le même que (a). La colonne vaudrait toujours `n` pour la suite auxiliaire (§2.2) et n'aurait pas de sens pour
  `series_sha256`. Elle ne mesure pas non plus la difficulté d'énumérer : une suite de 41 points à 12 uns reste à 32,88 bits.
- **E-2a** : plusieurs jours de plus, sur le chemin critique.
- **Conclusion** : dominée par (a) et par (c).

### (c) Plancher d'entropie sur les lignes 0/1, au lieu d'une règle de longueur

- **Règle** : une ligne `sign-set` n'est publiée que si ses deux suites 0/1 ont chacune au moins 2^F candidats compatibles avec
  ce que la ligne publie. Les détails sont au §4.1.
- **Texte** : révision datée. Le §10 délègue à la révision qui publie des lignes kata de dire « how it keeps the rule » (l.361).
  Ni colonne neuve, ni changement de sens d'un champ du verdict (l.582).
- **Code** : un module pur, quelques lignes de porte, une clause de garde (§5). R-25 ~300 lignes.
- **Effet sur la vague 1, selon F** (la règle des 30 points restant en place) :

| F (bits) | Tables de direction refusées | Tables publiées | Lignes publiées | Plus faible empreinte 0/1 publiée |
|---|---|---|---|---|
| ≤ 52,71 | eth, bnb, sol dir-4h (comme (a)) | 29 | 190 | 52,71 bits |
| de 52,72 à 343,25 | les quatre dir-4h | 28 | 160 | 343,25 bits |
| au-delà de 343,25 | aussi sol-dir-1h, puis les autres 1h | ≤ 27 | ≤ 130 | - |

  Toute valeur de F entre 53 et 343 donne le même résultat sur la vague 1. Le choix y est libre.
- **Lignes retenues** : 120 lignes dir-4h, dont 119 `silence` et 1 `vetoed`, aucune `region`. Ces classes gardent leur fichier
  sans ligne : abstention `under_calib` (contrat l.293, l.463-466), au lieu de `calib_silence` ou `calib_vetoed`. Les deux
  lignes `region` et toutes les bandes sont servies.
- **Risque résiduel** :
  - contre A, rien (§2.5) ;
  - côté `down`, la borne des plats est une mesure de la vague 1 (cap 34), pas une loi : item FLAT-CAP-NEXT-WAVE-1 ;
  - le service des quatre dir-4h attend une construction ou une décision : item DIR-4H-DIGEST-COMMIT-1.

### (d) Ne pas publier les empreintes 0/1 (`aux_sha256` nul dans la ligne publiée)

- **Possible pour `aux_sha256` seulement.** `scores_sha256` est non nul dans la ligne (l.405) et servi dans le verdict
  (l.470).
- **Code** : projection l.116 (`aux_sha256: null`), garde l.50, tests de projection
  (`apps/harness/test/policy-projection.test.ts` l.101-107).
- **Acte** : publié = servi, à l'octet (l.351 ; test l.123-130). Il faut donc une ligne datée d'A-2 : §2.1 l.65 lie les suites
  par `scores_sha256` **et** `aux_sha256`, et §2.2 point 1 (l.75) fixe la projection. A-2 est posté en P0 (l.168), donc il
  faudrait peut-être une ligne P0 de plus.
- **R-25** : ~40 lignes chez MONARK, plus le texte de RECHERCHES.
- **Effet** : supprime le cap des plats et l'égalité qui dit « aucun plat » (§2.3), mais pas l'exposition des scores. Seule,
  elle laisse le résultat de (a) ; avec (c), celui de (c).
- **Conclusion** : utile seulement si RECHERCHES refuse le cap (Q-5). Mise de côté par défaut.

### (e) Engagement salé ou à clé

- **Pour `scores_sha256`**, changer sa définition sur une ligne kata, fixée à l.597, change le sens d'un champ du verdict, donc
  la version (l.582) : contrat 1.2.0, `schema_version` relevé, 1.1.0 refusé.
- **Pour `aux_sha256` seul** : nouvelle valeur de `row_format`. Mais cela ne libère pas les tables dir-4h, dont les scores
  restent exposés par le verdict.
- **Les deux variantes** :
  - à clé : seul le détenteur de la clé peut vérifier. Pour le public, cela revient à ne pas publier ;
  - salée par les données : un digest sur les paires (lean, score), recalculable par quiconque a les séries et les règles,
    impossible à énumérer sans elles.
- **Dans tous les cas** :
  - régénérer `wave1.json` : `811fcd57…` est épinglé par A-2 l.75, PROVENANCE l.8 et le rapport du vérificateur, et A-2 l.154
    dit qu'aucune ligne du registre n'est réécrite ;
  - modifier l'outil du vérificateur et ajouter une ligne d'A-2.
- **Délai** : rien de tout cela n'entre avant le 2026-10-20.
- **Vague 2** : pas de cellule de direction (ADR 0006 l.25) ; ses suites sont réelles (l.41-43). FORMAT-W2 n'a donc pas besoin
  de cette construction.
- **Conclusion** : c'est la construction PAROXYSME du service des dir-4h (item DIR-4H-DIGEST-COMMIT-1), pas le chemin d'E-2a.

### (f) Accepter la divulgation des lignes sous le plancher

- **Effet** : 32 tables, 280 lignes ; la plus faible empreinte publiée est à 16,91 bits.
- **Actes** :
  - ligne datée du plan P2 qui assouplit l.21 et l.109 pour ces cases ;
  - décision de l'investisseur sur l'usage public de valeurs dérivées par décision (§2.5) ;
  - révision du §10, qui refuse aujourd'hui toute ligne de 30 points ou moins (l.361).
- **Conclusion** : contraire au précommitment tant que ces actes manquent. PAROXYSME l'interdit comme limite nue.

### Synthèse

| Option | Acte | R-25 | Tables publiables (vague 1) | Plus faible digest 0/1 publié | E-2a |
|---|---|---|---|---|---|
| actuel | - | - | 0 | - | bloqué |
| (a) | révision datée | ~60 | 29 | 52,71 bits (par accident) | prêt |
| (b) | `row_format` + ADR | 500-800 | 29 | 52,71 bits | retardé |
| (c), F = 128 | révision datée | ~300 | 28 | 343,25 bits | prêt, sans dir-4h |
| (d) seule | ligne d'A-2 | ~40 | 29 | 52,71 bits | prêt |
| (e) | version 1.2.0 | > 1 000, plusieurs dépôts | 32 | aucun énumérable | après le mois |
| (f) | plan, investisseur, révision | ~60 | 32 | 16,91 bits | prêt si décidé |

## 4. Recommandation

### 4.1 Défaut : (c), F = 128, avec la borne des plats, sans colonne neuve

- **Règle de porte** (`tableRowProblems`, lignes hors fixtures) :
  1. **inchangé** : `n` ou `p_served` ≤ 30, ou non entier sûr → `short_digest` ;
  2. `series_sha256` non nul **admis** sur une ligne `sign-set` ou `scaled-band`. Sur toute autre ligne, il est refusé comme
     suite non définie ;
  3. `aux_sha256` non nul :
     - sur une ligne `scaled-band` à `aux_seq` `score`, il doit égaler `scores_sha256` (mesuré 40 sur 40) ;
     - sur une ligne `sign-set` à `aux_seq` `label`, il passe par le plancher (point 4) ;
     - sinon, il est refusé comme suite non définie ;
  4. **plancher, sur une ligne `sign-set`** :
     - suite des scores : N(n, `misses`, o) ≥ 2^F. o est l'issue qui porte sur les scores : `runs_miss` quand `qhat` vaut 0
       (l'indicateur de manqué est alors la suite des scores), sinon `runs_aux`. Côté `down`, `runs_aux` porte sur la suite des
       labels, comptée comme si la case n'avait aucun plat : c'est l'hypothèse la plus favorable à l'énumérateur ;
     - suite des labels : côté `up`, c'est le complément (même compte, par symétrie de la forme close) ; côté `down`,
       min sur u de `misses` − 34 à `misses` de N(n, u, `runs_aux`) ≥ 2^F ;
     - `runs_level` doit valoir `"0.05"` (déjà épinglé par la garde l.54), et `source.wave` doit valoir 1 : aucune borne de
       plats n'est épinglée pour une autre vague, donc fermé ;
     - une issue `empty` donne N = 1 : refusé. C'est conservateur ; la suite serait de toute façon déterminée par les comptes
       publiés.
- **Fixtures `synthetic_kata`** : dispensées des points 2 à 4, comme elles le sont aujourd'hui de la clause l.294 (l.143).
  Raison mesurée : la borne des plats refuserait la fixture down-b2 (u = 5 : C(140, 5), soit 28,6 bits), et
  `vectors-1.1.0.json` est publié, jamais réécrit, et porté à chaque release (test l.291). Le point 1 continue de s'y appliquer.
- **Calcul** : en entiers exacts (`BigInt`), sans flottant dans la décision, comme `runs.ts` (l.9) ; la comparaison est
  `N >= 1n << 128n`. Le détail du refus imprime log2 N, arrondi à deux décimales.
- **Le serveur applique la même règle** : une clause dans `guardKataRow` (Q-4). Elle remplace, pour les lignes kata, la phrase
  « The server has no check of its own for this rule » (l.361).
  - La clause se place avant `if (dir) return;` (`policy-guard.ts` l.104).
  - Une ligne de direction `under_calib` (n < 6) n'y arrive pas : la garde l'admet et rend avant (l.69-72), comme A-2 l'exige
    (l.177). Le point 1 de la porte la refuse (n ≤ 30), et le servi est le publié (§2.1). La vague 1 n'en a aucune.
- **Pourquoi F = 128** :
  - toute valeur entre 53 et 343 donne le même résultat sur la vague 1 (§3 c) ;
  - 2^128 hachages valent 1,3e25 années-cœur au débit mesuré, donc l'énumération n'est jamais la voie bon marché ;
  - 128 garde une marge de 215 bits sous la plus faible table 1h (343,25), pour un recalibrage futur au même ordre de n.
  - Variante sans coût mesuré : F = 256, la largeur du digest. Toute valeur de 53 à 343 se défend ; c'est à RECHERCHES
    (Q-2).
- **Résultat sur la vague 1** :
  - 28 tables publiables : 4 dir-1h (120 lignes, ≥ 343,25 bits ; labels `down` ≥ 537,04 bits) et 24 bandes (40 lignes,
    dont les 2 `region` et 1 `vetoed`) ;
  - 4 tables dir-4h retenues (120 lignes, 0 `region`), qui gardent leur fichier sans ligne de `contract-1.1.0/`.
- **Pourquoi pas (a)** : sur la vague 1, (a) publie btc-dir-4h à 52,71 bits, et sa règle laisse passer, en général, une suite
  de 60 points à 2 uns.
- **Pourquoi pas (d)** : elle demande un acte d'A-2 pour un gain que le cap mesuré donne déjà (Q-5).

### 4.2 Qui décide

| Décision | Porteur | Forme |
|---|---|---|
| Règle, plancher F, cap des plats, sort des fixtures | RECHERCHES (spécification) | révision datée du §10 (Q-1, Q-2, Q-5, Q-9) |
| Les quatre classes dir-4h servies sans ligne ; « all calibrated and served, K = T » (ADR 0005 l.89) | RECHERCHES ; la cellule et l'investisseur pour le périmètre servi (go Q-F5, message l.116) | ligne datée d'ADR 0005, ou constat (Q-3) |
| Accepter la divulgation (f) au lieu de retenir | RECHERCHES (plan P2) et investisseur (usage des données) | ligne datée du plan ; décision (Q-3) |
| Le serveur refuse aussi (garde) | RECHERCHES (texte) ; MONARK (code) | phrase de la révision ; clause de garde (Q-4) |
| Code, tests, tueurs | MONARK | la partie unique (§5) |

### 4.3 Texte proposé à RECHERCHES pour la révision datée (brouillon, anglais du contrat)

> **Short 0/1 sequences (revision of <date>).** `scores_sha256` and `aux_sha256` digest the n calibration points of a row in
> time order; `series_sha256` is the sha256 of the pinned source series file of the row's symbol, not a sequence of
> calibration points. On a `scaled-band` row the scores are real numbers and the auxiliary sequence is the scores
> themselves, so `aux_sha256` equals `scores_sha256`. On a `sign-set` row both are 0/1 sequences: a score is 1 for a miss (a
> flat label counts as a miss), and the auxiliary sequence is 1 for an up label. Let N(n, k) be the number of 0/1 sequences of
> n points with k ones whose runs outcome at `runs_level` is the one the row states. A published table file carries no row of
> 30 points or fewer, and no `sign-set` row with N(n, `misses`) below 2^128 or, on a `down` side, with N(n, u) below 2^128 for
> some u from `misses` − 34 to `misses` (34 is the largest number of flat labels in a calibration block of wave 1). The class
> of such a row keeps its table file without rows. The tool that writes the published table files and the server's import
> check both refuse such a row.

## 5. Découpe : une seule partie

- **Ordre** :
  1. réponses de RECHERCHES à Q-1, Q-2, Q-4 et Q-5 ;
  2. la partie unique ;
  3. texte de la révision, publié par E-2a dans son dossier daté.
- **Collisions** :
  - `tableRowProblems` est aussi réécrite par la partie 3 de VERIFIERS-LIST-F5A-1 (clauses `recompute_held`). La seconde
    fusion se reprend sur la première ; chaque clause garde son test (même parade que R-3 de ce G0-là, l.554-555) ;
  - `policy-guard.ts` reçoit aussi `identityOf` de cette partie 3. Les deux modifications ne se recouvrent pas.
- **Tueurs** : forme fermée `// killer: fichier:ligne OP "avant" -> "après"`, écrits par contenu ; leurs lignes sont fixées au
  gel.

### La partie unique : la porte, le module du plancher, la clause de garde (une G2)

| Fichier | Contenu | R-25 estimé |
|---|---|---|
| `apps/harness/src/policy-digest-floor.ts` (neuf, pur, sans import) | `DIGEST_FLOOR_BITS` = 128, `LABEL_FLAT_CAP` = 34 (provenance : `census.json` `95e5b984…`, CALIB SOLUSDT 1h) ; `runsOutcomeCount(n, ones, outcome)` ; `digestFloorProblem(row)` | ~50 |
| `scripts/spec-publish.mjs` | points 2 à 4 du §4.1 dans `tableRowProblems` ; commentaire l.284-287 ; import du module (précédent : `scripts/registry-root.mjs` l.13 importe un `.ts`) | ~25 |
| `scripts/spec-publish.d.mts` | exports | ~3 |
| `apps/harness/src/policy-guard.ts` | une clause après l.103 (si Q-4 = oui) | ~5 |
| `test/short-digest-floor.test.ts` (neuf) | tests ci-dessous | ~150 |
| `test/spec-1-1-0-release.test.ts` | attendus l.155-156 et détails | ~12 |
| `apps/harness/test/policy-guard.test.ts` | un cas | ~40 |

Total ~285 lignes (incertitude ±30 %), sous la borne R-25 de 1 205 (`.github/workflows/ci.yml` l.56).

**Tests rouges** (rouges à la base par assertion, ou par module neuf) :
- `the_runs_outcome_count_matches_every_sequence_of_up_to_14_points` :
  - oracle non-LLM : énumération des 2^n suites, chacune jugée par `runsLowerTailLeq` de hikae (`runs.ts` l.63-77) ; le
    compte par issue doit égaler `runsOutcomeCount` pour chaque (n, k) ;
  - rouge : module neuf ;
  - tueur : `policy-digest-floor.ts:<l> CONST "r % 2 === 0" -> "r % 2 !== 0"`.
- `a_sign_set_row_under_the_floor_is_refused_by_its_bits` :
  - ligne `sign-set` de synthèse, côté `up`, n 60, `misses` 2, `runs_aux` `pass`, `p_served` > 30, `aux_sha256` et
    `series_sha256` non nuls : `short_digest`, avec le détail des bits (10,74). La même ligne à n 300 et 150 manqués passe ;
  - rouge à la base par assertion : la base refuse la seconde ligne (aux et séries) ;
  - tueurs : `CONST "DIGEST_FLOOR_BITS = 128" -> "DIGEST_FLOOR_BITS = 10"` ; `spec-publish.mjs:<l> SDL` sur l'appel du
    plancher.
- `a_down_side_label_digest_is_counted_over_the_flat_cap` :
  - côté `down`, n 200, `misses` 40, `runs_aux` `pass` : refusée par la borne des plats seule (u = 6 : 36,24 bits) ; la même
    ligne côté `up` passe (140,51 bits) ;
  - rouge : module neuf ;
  - tueur : `CONST "LABEL_FLAT_CAP = 34" -> "LABEL_FLAT_CAP = 0"`.
- `a_band_row_publishes_its_series_digest_and_an_auxiliary_digest_equal_to_its_scores` :
  - ligne `scaled-band`, `aux_seq` `score`, `aux_sha256` = `scores_sha256`, `series_sha256` non nul : aucun problème ;
  - avec `aux_sha256` ≠ `scores_sha256` : `short_digest` ;
  - rouge à la base par assertion ;
  - tueur : `spec-publish.mjs:<l> CONST "r.aux_sha256 === r.scores_sha256" -> "true"`.
- `the_guard_refuses_a_sign_set_row_under_the_digest_floor` :
  - table de synthèse de `apps/harness/test/helpers/synthetic-registry.ts` dont une case de direction a un N sous le
    plancher ; `guardKataTable` lève ;
  - rouge à la base par assertion ;
  - tueur : `policy-guard.ts:<l> SDL` sur la clause.

**Gardes de non-régression** (pas rouges à la base) :
- `an_auxiliary_or_series_digest_of_an_unstated_sequence_is_refused` (ligne marginale à `aux_sha256` non nul) ;
- l.329-335 inchangé : `["recompute_held", "short_digest"]` pour la ligne de synthèse sans `region_rule` ;
- `contract_1_1_0_passes_the_spec_publish_gate_offline` (l.239) et
  `a_later_version_carries_the_published_tables_and_still_checks_their_rows` (l.291) restent verts, fixtures comprises.

**Actes de la G2 de la partie** :
- rejouer `measure.mjs`, `ladder.mjs` et `auxcap.mjs` (annexe A) et retrouver les nombres du §2.3 ;
- relire la preuve de symétrie de la forme close ;
- tirer les tueurs à la main.

### Après la partie : le test de composition, au lot d'E-2a qui verse le registre

- Ce chantier tient en une seule partie. Le test de composition n'en est pas une seconde : il appartient au lot d'E-2a qui verse
  `apps/harness/data/kata/registry/wave1.json` (racine de R25-REGISTRY-ROOT-1, `scripts/registry-root.mjs` l.16), et passe par
  la G2 de ce lot.
- Il rejoue registre → projection → garde → porte, et affirme le partage mesuré ici : 28 tables publiables, 4 dir-4h retenues,
  et le minimum par table du §2.3.
- Item E2A-DIGEST-FLOOR-TEST-1 (§8) : c'est le tuyau qui rend la règle « branchée ».

### Tuyaux (branchement)

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État | Test de composition |
|---|---|---|---|---|
| `policy-digest-floor.ts` | lignes projetées (E-2a) ; tables de synthèse | `tableRowProblems` (porte et écrivain) ; `guardKataRow` | `apps/harness/src/` (exporté) | la partie : `plan()` sur une racine de synthèse ; E-2a : registre réel |
| porte `short_digest` | `spec-publish-inputs.json` d'une release | la publication (F-5) ; `expectedFiles` (écrivain, l.57-61) | `scripts/` | tests l.144-194 réécrits ; première release datée (E-2a) |
| clause de garde | chargeur E-2a (seul consommateur de production de la garde, G0 VERIFIERS l.73-74) | le service | `policy-guard.ts` | E-2a (item) ; d'ici là la pièce reste « upcoming » |

### Effet sur E-2a

- Le chargeur ne pose de lignes que dans les tables qui passent la porte : par défaut, 28 classes. Sinon `expectedFiles` lève,
  et deux tests rougissent (§2.1).
- Les quatre classes dir-4h gardent leur fichier sans ligne de `contract-1.1.0/`. Le dossier daté ne porte que les tables
  changées (R-b, son G0 l.40).
- Le texte servi de la clause kata (KATA-CLAUSE-COMMITTED-STATE-1) doit dire quelles classes portent des lignes.
- La révision datée du §10 entre dans le même dossier daté, sous la forme que RECHERCHES choisit (Q-8).
- Calendrier (estimation, non mesurée) : la partie ≈ 1 jour avec sa G2, après les réponses, sur le précédent des lots des blocs
  C et D (message de RECHERCHES l.102). Le 2026-10-20 reste tenable si les réponses arrivent dans la semaine.

## 6. Risques

- **R-1, plancher sans modèle d'attaquant sourcé.** La mesure est sur un cœur. Parade : F = 128 est loin au-dessus ; item
  DIGEST-FLOOR-ATTACKER-COST-1.
- **R-2, borne des plats propre à la vague 1.** Parade : fermé (`source.wave` = 1 exigé) ; item FLAT-CAP-NEXT-WAVE-1.
- **R-3, l'hypothèse « aucun plat » pour l'issue de runs sur les scores d'un côté `down`.** Elle n'est exacte que si f = 0.
  - Si f > 0, l'issue publiée porte sur une autre suite, et contraint moins les scores. Je n'en ai pas fait la preuve ; je l'ai
    seulement mesuré : au pire, ignorer l'issue change log2 N de 4,53 bits sur la vague 1.
  - Parade : côté `down`, la règle prend le plus petit des comptes de u = `misses` − 34 à `misses`, qui inclut le compte à
    f = 0. Une variante plus prudente, `C(n, misses) ≥ 2^(F+6)` en plus, ne change aucune table de la vague 1. C'est Q-6.
- **R-4, lecture du §10 par RECHERCHES.** Si RECHERCHES lit un changement de format, c'est un `row_format` et un acte d'ADR : la
  partie reste valable, le texte change.
- **R-5, garde de langue.** `scripts/lang-gate.mjs` l.73 compte « aux » comme mot français. Seuls `aux_sha256`, `runs_aux` et
  `aux_seq` sont masqués (`scripts/lang-exempt.json` l.28, l.36-37). Le code neuf dit `label`, jamais `aux` seul.
- **R-6, collision sur `tableRowProblems`** avec la partie 3 de VERIFIERS (§5).
- **R-7, MAST.** Les modes visés sont la vérification incomplète (une règle de longueur prise pour une règle de secret) et la
  divergence entre spécification et code (porte et garde). Parades : l'oracle d'énumération complète, et un seul module pour
  la porte et la garde.

## 7. Questions pour RECHERCHES (défaut entre parenthèses)

- **Q-1** : quelle règle ? ((c), plancher sur le compte exact des suites 0/1 compatibles avec la ligne, et non une règle de
  longueur. (a) publie btc-dir-4h à 52,71 bits par accident de `p_served`, et sa règle admet en général une suite de 60 points
  à 2 uns.)
- **Q-2** : quel plancher F ? (128. Toute valeur de 53 à 343 donne le même résultat sur la vague 1 ; 256 aussi.)
- **Q-3** : les quatre classes dir-4h : retenues ou divulguées ? (Retenues, servies sans ligne, `under_calib`, jusqu'à
  DIR-4H-DIGEST-COMMIT-1. Aucune ligne `region` n'y est, et leur service changerait seulement la raison de l'abstention. Faut-il
  une ligne datée d'ADR 0005 pour « all calibrated and served, K = T » (l.89) ? Défaut : oui, une ligne de constat. Le registre
  et le rapport gardent les 280 cases (l.105).)
- **Q-4** : le serveur applique-t-il aussi le plancher ? (Oui, une clause de `guardKataRow`, et la phrase « The server has no
  check of its own » de l.361 tombe pour les lignes kata.)
- **Q-5** : suite des labels d'un côté `down` : cap des plats 34, ou (d) `aux_sha256` nul par une ligne d'A-2 ? (Cap 34 : pas
  d'acte d'A-2, et une marge mesurée de 537 bits sur les tables 1h.)
- **Q-6** : l'hypothèse « aucun plat » pour l'issue de runs (R-3) suffit-elle, ou faut-il la marge `C(n, misses) ≥ 2^(F+6)` en
  plus ? (L'hypothèse suffit ; la marge ne change rien à la vague 1.)
- **Q-7** : publier les quatre digests de séries, pour la première fois, dans les lignes et dans le rapport du vérificateur ?
  (Oui : un hachage, non le fichier. À dire dans la note de release.)
- **Q-8** : où vit la révision datée ? (Un fichier texte du premier dossier daté `contract-1.1.0-tables-<date>/`, nommé par les
  notes de release. `contract-1.1.0/CONTRACT.md` n'est jamais réécrit, l.441 et l.587. Tension à trancher en connaissance de
  cause : `spec-publish.mjs` l.119-120 nomme ce dossier « a dated table-only revision ». Rien dans la porte n'y refuse une
  entrée texte (l.140-143, l.198-201), mais l'intention écrite est « tables seulement ». Soit le commentaire s'élargit, soit la
  révision vit dans les notes de release seules.)
- **Q-9** : fixtures `synthetic_kata` dispensées du plancher et des règles d'empreinte ? (Oui. Elles sont de synthèse, et la
  borne des plats refuserait down-b2, à 28,6 bits.)
- **Q-10** : `p_served` ≤ 30 : garder ? (Oui. Sa raison, une suite plus courte que `n`, est mesurée fausse : la suite
  auxiliaire a n points, et `series_sha256` n'est pas une suite. Mais la règle ne coûte rien à F ≥ 40 : les 4 lignes qu'elle
  refuse sont sous 40 bits.)

## 8. Items formés

- **DIR-4H-DIGEST-COMMIT-1** (PAROXYSME). Porteur : RECHERCHES (spécification), puis MONARK (code).
  - Déclencheur : avant tout service d'une table dir-4h, ou avant le pré-enregistrement de cellules de direction d'une autre
    vague (F-K-5, F-K-6 ; ADR 0006 l.25).
  - Limite : les quatre tables dir-4h ne peuvent être servies sans divulguer des suites sous 2^128.
  - Recherche : l'engagement salé par les données (digest sur les paires (lean, score)) ou à clé. Prix : contrat 1.2.0 (l.582),
    régénération du registre, outil du vérificateur, ligne d'A-2.
- **E2A-DIGEST-FLOOR-TEST-1** (tuyau). Porteur : MONARK, au titre d'E-2a.
  - Déclencheur : le lot qui verse `wave1.json` dans `apps/harness/data/kata/registry/`.
  - Objet : le test de composition (§5, après la partie), et la sélection des classes par le chargeur.
- **VERIFIER-REPORT-DIGESTS-1**. Porteur : MONARK, au titre de la partie 2 de VERIFIERS-LIST-F5A-1.
  - Objet : le rapport publié ne porte aucun digest d'une ligne retenue, ni de digest 0/1 sous le plancher ;
  - sa liste `inputs` publie les quatre digests de séries (Q-7).
- **FLAT-CAP-NEXT-WAVE-1**. Porteur : RECHERCHES.
  - Déclencheur : une vague autre que la 1 avec des lignes `sign-set`.
  - Objet : mesurer et épingler sa borne de plats ; d'ici là, la porte refuse, fermée.
- **DIGEST-FLOOR-ATTACKER-COST-1** (recherche). Porteur : MONARK.
  - Déclencheur : si RECHERCHES choisit F < 80, ou avant tout texte public qui chiffre le coût d'une inversion.
  - Objet : lire sur place une source primaire de débit SHA-256 sur matériel parallèle, et la citer [lu]. Aucun chiffre de
    seconde main d'ici là.

## 9. Ce que je n'ai pas fait

- Aucune série lue. J'ai lu `wave1.json`, `census.json` (comptes par bloc), les fixtures de synthèse et le rapport publié. Aucune
  sortie ne porte de valeur par décision.
- Aucun digest réel inversé : les inversions du §2.4 portent sur des suites de synthèse.
- Aucune modification de code, de test ou de donnée. Ce G0 est le seul fichier écrit dans le worktree.
- Aucun débit de matériel parallèle mesuré, aucune source externe lue.
- Je n'ai pas lu les définitions des labels (`labelsAt` de `kata/src`). Je me fie au plan l.45 et à `calibrate.ts` l.71-72.
- Aucun test lancé : aucun code n'a changé.
- Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, aucun git qui écrit, aucun commit, aucun workflow, aucun Python,
  rien écrit sur C:.

## Annexe A. Reproduction

Depuis `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/shortdigest/`, avec R = le clone `recherches` à
`8437a42e`.

| Script | sha256 | Commande | Sortie (sha256) |
|---|---|---|---|
| `measure.mjs` | `85a74131…` | `node measure.mjs R` | `measure.out` `45ecef62…` |
| `list.mjs` | `3c9e56d6…` | `node list.mjs R` | `list.out` `0b3c5b97…` |
| `ladder.mjs` | `2d3c08db…` | `node ladder.mjs R` | `ladder.out` `d584e230…` |
| `auxcap.mjs` (+ `ladder-lib.mjs` `06bd740d…`) | `82f9e288…` | `node auxcap.mjs R` | `auxcap.out` `e6f1ed52…` |
| `vectors.mjs` | `8d12edca…` | `node vectors.mjs R/kata/spec/vectors-1.1.0.json` | (console) |
| `rate.mjs` | `7e83d9c5…` | `node rate.mjs` (suites de synthèse) | `rate.out` `67e70c2e…` |

## 10. Pli des décisions de RECHERCHES et construction

- **Rédaction** : worker `claude-opus-5-5` (effort max) ; horloge lue à 23:32 UTC le 2026-10-06 au début de la partie, et à 00:26 UTC le
  2026-10-07 avant d'écrire cette section. Worktree `F:/Monark-wt-digestfloor`, branche `monark/short-digest-floor-1`, base `5348b9d2`
  (R-a et R-b d'ENGINE-ROW-RETIRE-PATH-1 fusionnés). Aucun commit (R-20), aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`,
  rien écrit sur C: (`os.tmpdir()` = `F:\tmp`). Scripts sous
  `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/digestfloor/` (annexe B). Reprise à la demande de
  l'orchestrateur (§10.7), horloge `now.mjs` de 00:36 à 00:4x UTC le 2026-10-07.
- **Décisions** : `recherches:coordination/messages/2026-10-06-RECHERCHES-vers-MONARK-short-digest-decisions.md` (sha256
  `9da1fc2d…`), lu en entier. Q-1 : (c), plancher exact. Q-2 : F = 128. Q-3 : les quatre dir-4h retenues, sans ligne. Q-4 : la garde
  applique la même règle. Q-5 : borne de 34 plats. Q-6 : suffisant si le G0 montre en une ligne qu'ignorer les plats ne fait que
  sous-estimer N ; sinon la borne de 34 le couvre explicitement. Q-7 : oui (la phrase de la note de version est un lot ultérieur).
  Q-8 : révision datée du texte de la spécification, lot ultérieur. Q-9 : fixtures dispensées. Q-10 : `p_served` ≤ 30 gardé.
- **Source des deux suites, lue dans cette partie** [lu], à 00:31 UTC : `recherches:kata/bench/calibrate.ts`, sha256 `fc6422b9…` (=
  l'épingle du §1 ; clone du scratchpad à `7d100eef`, dernier commit du fichier `522f897`). l.71 : « `s = (v > 0 && p.labels.dir ===
  "up") || (v < 0 && p.labels.dir === "down") ? 0 : 1; // flat is a miss` » ; l.72 : `aux.push(p.labels.dir === "up" ? 1 : 0)` ;
  l.82 (bandes) : `aux.push(s)` ; l.17 : digest = sha256 de `JSON.stringify`. D'où : côté `up`, labels = 1 − scores ; côté `down`,
  labels = scores − 1{plat} ; bande, suite auxiliaire = scores ; deux suites égales ont le même digest.

### 10.1 Q-6 : la monotonie n'est pas montrée, le cap couvre chaque nombre de plats

- **La ligne demandée ne tient pas seule.** « f = 0 est admis, donc l'ensemble compté sans plat est inclus dans les candidats »
  vaut contre un attaquant qui ignore f. Or la ligne publiée le dit : sur un côté `down`, les deux digests sont égaux exactement
  quand la case n'a aucun plat (§2.3). Quand ils diffèrent, f ≥ 1 est su et cet ensemble n'est plus inclus.
- **Mesure** (énumération complète, chaque issue jugée par `runsLowerTailLeq`, `q6-enum.mjs`) : à n ≤ 14 et aux niveaux 0,05, 0,2 et
  0,3, quand l'issue déclarée est possible à f plats, les suites de scores compatibles sont toujours au moins N(n, m, issue) (728
  cas sur 728 à chaque niveau). Rien ne le prouve pour n de 20 à 1 254. Si f n'est su que ≥ 1, 7 cas (0,05) restent sous N, tous où
  l'issue déclarée est impossible pour tout f ≥ 1 (par exemple n de 10 à 14, m = 2, `reject` : 2 suites sans plat, aucune avec).
  La condition de Q-6 n'est donc pas remplie par une preuve : sa seconde branche s'applique.
- **Construction, en une ligne** : avec f plats, chaque couple (s, F) d'une suite de scores et de f de ses uns donne une suite de
  labels à m − f uns ; il y a C(n, m)·C(m, f) = C(n, m − f)·C(n − m + f, f) couples ; chaque suite de labels en reçoit
  C(n − m + f, f) et chaque suite de scores en donne C(m, f) ; donc au moins C(n, m)·N(n, m − f, `runs_aux`)/C(n, m − f) suites de
  scores sont compatibles, et c'est N(n, m, `runs_aux`) à f = 0. La règle prend le plus petit de ces nombres sur les f admis :
  f = 0 seul quand les deux digests sont égaux ; f de 1 à min(34, m) quand ils diffèrent (deux suites égales ont le même digest,
  `calibrate.ts` l.17 : des digests différents prouvent un plat au moins, §10.7) ; f de 0 à min(34, m) quand le digest des labels
  n'est pas publié (la ligne ne dit alors rien de f).
- **Contrôle mesuré, dans la CI** : `the_flat_bounds_hold_against_every_sequence_of_up_to_12_points` (5 448 cas, toutes issues,
  `runs_miss` donné ou non) : aucune borne au-dessus du compte énuméré, aucun f écarté qui cache une suite compatible.
- **Prix, sur une ligne de synthèse** (n 162, 118 manqués, `down`, `runs_aux` `reject`, digests différents) : N(n, m) = 2^128,35,
  admise par la règle du §4.1 ; la borne à f = 1 vaut 2^127,88 : refusée. Aucun effet sur la vague 1 (§10.4). Item
  DIGEST-FLOOR-FLAT-EXACT-1 (§10.6).
- **Deux points que Q-6 ne posait pas, réglés dans le même sens** :
  1. un f sous lequel l'issue déclarée est impossible (N(n, m − f, `runs_aux`) = 0, ou f = 0 avec `runs_miss` ≠ `runs_aux` à
     `qhat` 0) n'est pas celui de la case : il est écarté, et une ligne qu'aucun f n'admet est refusée. Sans cela, « u de
     `misses` − 34 à `misses` » (§4.1) refuserait toute ligne `down` à 34 manqués ou moins : N(n, 0, `pass`) = 0 ;
  2. `qhat` 0 sur un côté `down` à digests différents : `runs_miss` porte sur les scores, `runs_aux` sur les labels, et les deux
     suites diffèrent aux plats. N(n, m, `runs_miss`) seul n'y borne rien par en dessous. La règle joint les deux par la borne de
     l'union : x = C(n, m)·N(n, m − f, `runs_aux`) − (C(n, m) − N(n, m, `runs_miss`))·C(n, m − f) ; scores ≥ x/C(n, m − f),
     labels ≥ x/C(n, m). Même énumération. La vague 1 n'a aucune telle ligne : son seul `qhat` 0 de direction est un côté `up` (§2.2).

### 10.2 Où vit le module, et pourquoi

- `apps/harness/src/policy-digest-floor.ts` (neuf, 136 lignes, sans import, syntaxe effaçable) : `DIGEST_FLOOR_BITS` = 128,
  `LABEL_FLAT_CAP` = 34 (provenance : `census.json` `95e5b984…`, CALIB SOLUSDT 1h), `runsOutcomeCount`, `flatBounds`,
  `digestProblems`.
- Importé par `apps/harness/src/policy-guard.ts`, hors du graphe servi (`guard_modules_are_not_served` et
  `served_policy_modules_are_the_four_marginal_ones` verts : la liste servie ne change pas), et par `scripts/spec-publish.mjs`
  (précédent : `scripts/registry-root.mjs` l.13 importe un `.ts` de `apps/harness/src/`). Aucun module servi ne l'importe.
- **Réemploi de `runs.ts`** : il n'expose que le test sur une suite (`runsLowerTailLeq`) ; une entrée par comptes y demanderait une
  exception de zone (en-tête de `tail.ts`). Une dichotomie de r* par `runsLowerTailLeq` coûterait ~20 ms par compte (1,8 ms par
  appel à n 1 254, `perf.mjs`), soit ~0,7 s par ligne `down` : inutilisable dans la garde. Le module porte donc la forme close de
  `runs.ts` l.60-62 et la décision de l.77, sommées en une passe ; les tests la tiennent à `runsLowerTailLeq` (énumération complète
  n ≤ 14 ; frontière de rejet sur des suites construites à n 60, 132, 150, 200, 377 et 1 254). Accord avec `ladder-lib.mjs` du G0 :
  3 540 cas, 0 différence (`check-module.mjs`), et les nombres du §2.3 et du §5 retrouvés (10,74 ; 36,24 ; 140,51 ; 28,6 bits).
- **Coût mesuré** : une ligne `down` à digests différents (35 comptes) : 7 ms à n 377, 33 ms à n 1 254 ; 0,2 s pour les 60 lignes
  calibrées du registre de synthèse.
- **Lignes des tueurs** : les deux imports sont posés en fin de fichier (hissés), le commentaire de `tableRowProblems` garde ses
  quatre lignes, et la clause de la garde décale l.105 et suivantes de 2. Les quatre tueurs touchés sont recalés
  (`policy-guard.test.ts` l.65 et l.133, `policy-retire.test.ts` l.149, `kata-path.test.ts` l.306) ; les 136 tueurs des neuf
  fichiers de test qui visent ces fichiers, le nouveau compris, sont relus sur leur ligne à l'état final (`killers.mjs` : 0 hors
  ligne).

### 10.3 Ce qui a changé

| Fichier | Changement | R-25 (ins. + suppr.) |
|---|---|---|
| `apps/harness/src/policy-digest-floor.ts` (neuf) | le module (§10.2) ; l.111-112 : la plage des f (§10.7) | 136 |
| `scripts/spec-publish.mjs` | l.284-287 (commentaire, 4 lignes), l.294 (`digestProblems`, fixtures dispensées), l.297 (texte du refus), import l.323-325 | 10 + 6 |
| `apps/harness/src/policy-guard.ts` | l.105-106 : la clause, avant `if (dir) return;` ; import l.134-136 | 6 + 0 |
| `test/short-digest-floor.test.ts` (neuf) | 13 tests | 203 |
| `apps/harness/test/policy-guard.test.ts` | `the_guard_refuses_a_sign_set_row_under_the_digest_floor` ; deux tueurs recalés | 16 + 2 |
| `apps/harness/test/policy-retire.test.ts`, `kata-path.test.ts` | un tueur recalé chacun | 2 + 2 |
| `apps/harness/test/helpers/synthetic-registry.ts` | l.53, l.56, l.75 réécrites en place (§10.6, écart E-1) | 3 + 3 |
| **Total** (forme de la CI : les 21 pathspecs de `ci.yml`, `r25.mjs`) | G0 : ~285 (±30 %) ; borne 1 205 | **389** |

- Détail d'un refus : `<cell_key> (scores <log2> bits, labels <log2> bits)`, deux décimales ; refus fermés : `sign-set off wave 1
  or runs_level 0.05, no flat cap pinned (FLAT-CAP-NEXT-WAVE-1)`, `sign-set counts unreadable (...)`, `sign-set outcomes that no
  count of flats up to 34 admits`. La garde refuse avec le même détail.
- Non touchés : `scripts/spec-publish.d.mts` (aucun export neuf) et `test/spec-1-1-0-release.test.ts` (la ligne marginale de
  l.155-156 est `upper-bound` : ses refus `aux_sha256` et `series_sha256` gardent leur texte ; le test reste vert).

### 10.4 Effet sur la vague 1, mesuré (2026-10-07, 00:36 et 00:39 UTC)

- **Commande** : `node wave1-floor.mjs F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/recherches/kata/registry/wave1.json`,
  depuis le dossier des scripts (annexe B). Le registre est lu seul, jamais copié dans le dépôt ; sha256 contrôlé `811fcd57…`
  (565 462 octets). Chaîne du harness : `readRegistry` → `projectCell` → `digestProblems`. Pour chaque ligne `sign-set`, la plus
  petite borne est recalculée par `flatBounds` sur la plage des f du module, et son verdict confronté à celui de `digestProblems` :
  aucun désaccord. Sortie : comptes et bits par classe, jamais une valeur par décision (`wave1-floor-after.out`, `8b1cf6ab…`).
- **Résultat** : 280 lignes, 32 classes ; **28 publiables** (4 dir-1h, 24 bandes) ; **retenues : bnb-dir-4h, btc-dir-4h, eth-dir-4h,
  sol-dir-4h**.
- **Plus petite borne par classe** : dir-1h : bnb 399,68, btc 398,07, eth 416,24, sol 343,25 bits ; dir-4h : bnb 39,49 (6 lignes
  refusées), btc 52,71 (9), eth 16,91 (7), sol 16,91 (7), soit 29 lignes refusées, comme le compte du §2.3 avec l'issue de runs ;
  les 24 bandes n'ont aucune empreinte 0/1 et aucun refus.
- **Avant et après le point 1 du §10.7** : la même commande avec `--f0-when-differ` (f compté dès 0 malgré des digests
  différents) donne la même sortie à l'octet près, hors la mention du drapeau (`wave1-floor-before.out`, `6f2f2f21…`, 00:36 UTC).
- **Concordance avec l'argument d'avant la mesure** : l'enveloppe sans registre (`envelope.mjs`, 256 150 couples (n, u) des plages
  1h de `measure.out` ; part minimale 2^−0,0740 pour `pass`, 2^−4,9292 pour `reject`) donnait des scores 1h ≥ 338,39 bits ; mesuré :
  343,25 au plus bas. Le test de composition reste à E-2a (E2A-DIGEST-FLOOR-TEST-1) ; le chargeur doit retenir les quatre classes
  avant la garde, qui lève sur elles.

### 10.5 Contrôles, sur l'état final (2026-10-07, de 00:40 à 00:43 UTC ; premier passage de 00:10 à 00:26 UTC)

- `node -r ./test/helpers/blocking-stdout.cjs --test --test-timeout=300000 --test-force-exit test/short-digest-floor.test.ts
  "test/spec-*.test.ts" "apps/harness/test/*.test.ts"` : 337 tests, 336 verts, 0 rouge, 1 sauté (modes POSIX sur win32, déjà
  sauté à la base), exit 0. `test/surfaces-1-1-0.test.ts` : 15 sur 15, exit 0. `test/ci-gates.test.ts`, `export-hygiene`,
  `deps-hygiene`, `red-proof-support` (`--test-skip-pattern="\(test 42\)"`) : 51 sur 51, exit 0.
- `npx --no-install tsc --noEmit` : exit 0. ESLint sur les sept `.ts` touchés : exit 0. `node scripts/lint-ratchet.mjs` : 69/69,
  exit 0. `node scripts/grep-forbidden.mjs` : 348 fichiers, exit 0. `node scripts/lang-gate.mjs` : exit 0.
  `node scripts/export-public.mjs --check` : exit 0.
- `node scripts/red-proof.mjs --base 5348b9d2 --gel F:/Monark-wt-digestfloor --draw 14 --seed 47 --out
  F:/tmp/dojo/redproof-digestfloor` (tous les tueurs admis : 14) : OK, 14 jugés (1 F2P, 13 new-module), 43 inchangés, 14 tueurs
  tirés, 14 tués ; exit 0 ; `RED-PROOF.json` sha256 `c9e2fe0f…`, digest des changements `f54e11b3…`, recalculé à l'identique sur
  l'arbre final (`digest.mjs`). La première preuve (13 sur 13, `72fe2303…`) est gardée sous `RED-PROOF-first.json`.
- Mutants à la main (`node hand-mutants.mjs`, fichier remis et sha256 contrôlé après chacun), tous tués par assertion ; entre
  parenthèses, le nombre de tests rouges : plancher 128 → 127 (5) et 128 → 52 (6) ; cap 34 → 33 (5) ; issue de runs ignorée (10) ;
  clause de la garde supprimée (1) ; dispense des fixtures élargie à toute table, l.294 (10) ; plage de plats réduite à f = 0 (5) ;
  égalité des digests ignorée (3) ; f impossible gardé (1) ; appel de la règle retiré de la porte (10) ; dispense élargie à toute
  table du fichier de vecteurs, l.143 → `true` (1) ; point 1 : f = 0 compté de nouveau à digests différents (1) ; digest des labels
  non publié lu comme différent (1).
- R-25 dans la forme de la CI (`node r25.mjs 5348b9d2` : les 21 pathspecs lus dans `ci.yml`, insertions + suppressions, plus les
  lignes des fichiers non suivis qu'un commit ajouterait) : 37 + 13 + 339 = **389**, borne 1 205.

### 10.6 Écarts, questions et items

- **E-1, registre de synthèse** (hors de la zone du §5). Avec la clause de garde (Q-4), toutes les tables de direction du registre
  de synthèse avaient une ligne sous 2^128, et ses 24 lignes de bande un `aux_sha256` ≠ `scores_sha256` (`syn-floor.mjs`) : sept
  fichiers de test tombaient. Les trois lignes sont réécrites en place, sans déplacer ses tueurs (l.58 et l.76 de
  `policy-table-file.test.ts`) : n de direction de 400 à 800, `misses` dès k*/2 (au-dessus de k* sur une ligne refusée par les runs),
  `aux_sha256` d'une bande égal à ses scores, comme l'écrit la vague 1. Chaque `between` consomme un tirage : les bandes (dont P1,
  n 740, de `policy-wave2.test.ts`) ne changent pas. Les 60 lignes calibrées passent le plancher (`syn-module.mjs`).
- **E-2, règle renforcée par rapport au §4.1** : §10.1 (borne des scores sur chaque f, f impossibles écartés, borne de l'union à
  `qhat` 0, f = 0 seul à digests égaux, f ≥ 1 à digests différents : §10.7).
- **E-3, noms** : `digestProblems` (une liste, lue par la porte et par la garde) et `flatBounds` remplacent `digestFloorProblem`.
- **Q-11 pour RECHERCHES** : la règle des bandes (`aux_sha256` = `scores_sha256`) n'est mesurée que sur la vague 1 ; la porte et la
  garde l'appliquent aussi aux bandes de la vague 2. FORMAT-W2 doit dire ce que digère `aux_sha256` d'une bande de vague 2 ;
  d'ici là, une telle ligne à `aux_sha256` ≠ `scores_sha256` est refusée par les deux (fermé).
- **Q-12 pour RECHERCHES (texte du §4.3)** : ajouter, pour la révision datée (Q-8) : « On a `down` side with f flat labels (f
  unknown, at most 34; f = 0 when the two digests are equal, f ≥ 1 when they differ), at least C(n, misses) N(n, misses − f) / C(n, misses − f) score
  sequences are compatible, and the rule requires this number and N(n, misses − f) to reach 2^128 for each f that the stated
  outcomes admit. When qhat is 0, runs_miss bears on the scores themselves and is joined to runs_aux by the union bound. »
- **DIGEST-FLOOR-FLAT-EXACT-1** (PAROXYSME, recherche). Porteur : MONARK, avec RECHERCHES pour la preuve.
  - Limite : la borne du double comptage et celle de l'union sont des minorants ; elles peuvent retenir une ligne dont le compte
    exact atteint 2^128 (exemple mesuré au §10.1 : 2^127,88 contre 2^128,35).
  - Recherche : une preuve de la monotonie mesurée à n ≤ 14 (alors f = 0 suffit pour les scores), ou un compte exact des suites
    compatibles. Prix : une preuve combinatoire, ou un algorithme de comptage et son oracle d'énumération.
  - Déclencheur : une ligne `sign-set` d'une vague future entre la borne et le compte f = 0, ou la révision du texte du §10 si
    RECHERCHES veut y écrire « exact » sans réserve. Vague 1 : sans effet (marge ≥ 210 bits sur les dir-1h).
- Items inchangés : DIR-4H-DIGEST-COMMIT-1, E2A-DIGEST-FLOOR-TEST-1, VERIFIER-REPORT-DIGESTS-1, FLAT-CAP-NEXT-WAVE-1,
  DIGEST-FLOOR-ATTACKER-COST-1.
- **Non fait** : aucune série lue (`wave1.json`, le registre, est lu seul à la demande de l'orchestrateur, §10.4) ; la note de
  version (Q-7) et la révision du texte (Q-8) sont des lots ultérieurs ; aucun commit, aucune G2.

### 10.7 Reprise du 2026-10-07 (demande de l'orchestrateur, deux points)

- **Point 1, f = 0 à digests différents.** Deux suites égales ont le même digest (`calibrate.ts` l.17) : sur un côté `down`, des
  digests différents prouvent f ≥ 1, et compter f = 0 contredisait le principe du module (« un f sous lequel les issues déclarées
  ne peuvent pas tenir n'est pas celui de la case »). Plage des f : f = 0 seul à digests égaux, **f de 1 à min(34, m) à digests
  différents**, f de 0 à min(34, m) quand le digest des labels n'est pas publié (lecture : « différents » demande deux digests
  publiés ; un digest absent ne dit rien de f). Code : `policy-digest-floor.ts` l.111-112 et l'en-tête l.11-18.
  - Une ligne `down` à 0 manqué et digests différents est désormais refusée par `sign-set outcomes that no count of flats up to 34
    admits` (avant : `scores 0.00 bits, labels 0.00 bits`).
  - Ligne qui épingle le point (test `differing_digests_on_a_down_side_count_one_flat_at_least`, tueur l.111) : n 548, 525
    manqués, `down`, `runs_aux` `reject`, digests différents. Avant : refusée, la borne à f = 0 (N(548, 525, `reject`) = 2^127,98)
    était la plus petite ; après : publiable (2^128,16 au moins pour f ≥ 1). À digests égaux, refusée (127,98) ; sans digest des
    labels, refusée par ses scores (127,98). Trouvée par `scan-f0b.mjs`.
  - **Chiffres déplacés : aucun** dans les attendus des tests existants. Le 115,63 de la fixture down-b2 ne bouge pas : à `qhat` 0,
    la borne de l'union rend f = 1 plus petit que f = 0 (115,635 contre 115,705 bits, `fixture-terms.mjs`). Les plus petites bornes
    par classe de la vague 1 ne bougent pas non plus (§10.4). Les tueurs du fichier de test suivent les lignes du module (+2 dans
    l'en-tête, +1 après la ligne de `fMin`).
- **Point 2, la vague 1 mesurée** : §10.4 (28 publiables, les quatre dir-4h retenues).

## Annexe B. Scripts de la partie (sha256)

| Script | sha256 | Rôle |
|---|---|---|
| `q6-enum.mjs` | `4b413dce…` | Q-6, énumération sans le module (n ≤ 14, trois niveaux) |
| `q6-module.mjs` | `970dd6b3…` | Q-6, bornes du module contre l'énumération (n ≤ 12) |
| `check-module.mjs` | `1ef8b3f6…` | module contre `ladder-lib.mjs` ; coûts |
| `perf.mjs` | `7522b6a6…` | coût de `runsLowerTailLeq` |
| `scan.mjs`, `rows.mjs`, `digits.mjs` | `d823dc3c…`, `9d43570b…`, `d4bb30c7…` | lignes frontières des tests et des mutants |
| `syn-floor.mjs`, `syn-module.mjs` | `eac49d2c…`, `ee042c51…` | registre de synthèse avant et après E-1 |
| `envelope.mjs` | `b734e9dd…` | enveloppe des parts d'issue sur les plages 1h (§10.4) |
| `wave1-floor.mjs`, `syn-bytes.mjs` | `20defe1b…`, `b6d486ac…` | rejeu de la vague 1 (§10.4), et ses registres d'essai |
| `wave1-floor-before.out`, `wave1-floor-after.out` | `6f2f2f21…`, `8b1cf6ab…` | sorties du rejeu, avant et après le point 1 |
| `hand-mutants.mjs`, `killers.mjs` | `d7968682…`, `5561d2a2…` | mutants à la main (13) ; tueurs relus sur leur ligne |
| `scan-f0.mjs`, `scan-f0b.mjs`, `fixture-terms.mjs` | `59a7ec34…`, `74610f8b…`, `0b341232…` | point 1 : ligne épingle, termes de la fixture |
| `digest.mjs`, `r25.mjs` | `c307514f…`, `560c74c4…` | digest de red-proof recalculé ; R-25 dans la forme de la CI |
| `RED-PROOF-first.json` | `72fe2303…` | la première preuve (13 sur 13), gardée |
