# G0 du lot CM-3a : moteur, première moitié (E-8, E-4, E-5, E-12, E-9, E-6)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3 (CM-3 : moteur et contrats, **aucune** différence servie), règles R-2 et R-3, §8 (remède ou raison écrite). Audit `recherches:monark/AUDIT-P3-2026-10-01.md` §2-3 ; statut MONARK `recherches:coordination/messages/2026-10-01-MONARK-vers-RECHERCHES-statut-audit-P3.md` (E-8 confirmé dans le moteur, non atteint au servi ; E-4, E-5, E-6, E-9, E-12 confirmés).
- **Base** : `2abe801` (branche `recherches/cm-3a`, posée sur `recherches/cm-2b`). Auteur : RECHERCHES. Aucun fichier de `schemas/**` ni de `packages/contracts/**` n'est touché.

## Coupe de CM-3 (R-25)

Borne locale de MONARK : 547 lignes comptées par lot au gel (consigne du coordinateur, 2026-10-03), 1 150 par PR. Mesure : `git diff --shortstat 2abe801...HEAD -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json'`. Les six points tiennent ensemble sous 547 (mesuré avant gel : environ 450 lignes) ; la coupe de repli (CM-3a = E-8, E-4, E-5 ; CM-3b = E-12, E-9, E-6) n'est donc pas utilisée.

- **CM-3a (ce lot)** : E-8, E-4, E-5, E-12, E-9, E-6.
- **CM-3b (suivant)** : E-1 avec S-4 côté moteur (bande à l'échelle [0, h*]), E-2 (empreinte ordonnée dans `hikae`, pas dans `contracts`), E-13/S-9, S-13 (un canonicaliseur pour les lignes F-7), raisons écrites d'E-10 et d'E-14. E-13/S-9 touche le contrat gelé (`method`, raisons) : par R-3, RECHERCHES ne le code pas ; il le propose en amendement daté de l'ADR-CM au G0 de CM-3b, pour contrôle par diff de MONARK.

## Règles

### E-8 : NaN et l'infini dans `decide()` (`l3-gate.ts`)

Garde `Number.isFinite` sur les six champs (`remainingBudget`, `bFloor`, `tau`, `tauInterval`, `nCalib`, `nMin`), après `non_evaluable` (ŷ) et `upstream_timeout`, avant toute autre garde numérique ; un champ non fini rend `abstain` / `non_evaluable` (littéral existant de `COVERAGE_REASONS` : la décision ne peut pas être évaluée). Au servi, `validateHarnessParams` refuse déjà ces valeurs (400) et `nCalib` est une longueur : aucune décision servie ne change.

### E-4 : domaine des scores (`l1-split.ts`, fonction neuve)

`scoresInDomain(scores, "finite" | "band")` : `finite` refuse NaN et ±Infinity ; `band` refuse aussi les scores négatifs (−0 passe). Utilisée par les deux points d'entrée neufs du chemin kata (`splitQuantileExact`, `riskControlRow`), qui rendent `under_calib`. `riskControlQuantile` (aucun appelant servi) et `splitQuantile` (servi : BYO, USDe, liq, `calibrate`) sont inchangés : le BYO garde son comportement (R-2 ; raison : le BYO interval refuse déjà les négatifs par un 400 à lui, et le BYO set accepte des scores signés de l'appelant).

### E-5 : rang split entier exact (fonction neuve)

`splitRankExact(n, alphaDec)` = ⌈(n+1)(1−α)⌉ en entiers, α chaîne décimale lue par `parseAlpha` ; `splitQuantileExact(scores, alphaDec, nMin, domain = "finite")` : comparateur à trois voies, garde du domaine (donc de NaN), refus d'α, de nMin non entier, p > n en `under_calib`. `splitQuantile` servi est inchangé (rang flottant), épinglé sur les 112 valeurs de n < 5 000 où il diffère à α 0,45.

### E-12, E-6 : `riskControlRow` (fonction neuve)

`riskControlRow(scores, alphaDec, baseDeltaDec, nMin, { domain, attempt, silenceAt })` : delta de test = `spendDelta(base, attempt)` (attempt 1 à 4, défaut 1), rendu avec `attempt` et `testDelta` ; puis `riskControlQuantile` à ce delta. E-6 : `calibMisses` (les scores ≥ `silenceAt` quand il est donné, soit les erreurs d'une case de direction ; sinon `kObs`) et `silence` (q̂ ≥ `silenceAt`) ; une ligne en silence ne porte **pas** de `missBound`. Le silence des contrôles de runs se décide à l'import (CM-4), pas ici. Types neufs, additifs : `RiskControlRow`, `RiskControlRowOptions`, `ScoreDomain` ; `RiskControlResult` inchangé.

### E-9 : k* en une passe (`binomial.ts`)

`riskControlMaxExceedances` appelle `largestCdfIndexLeq` : une passe sur les termes exacts t_i = C(n, i) a^i q^(n−i) (récurrence à division entière exacte), somme courante comparée à δ · den^n ; même décision que `binomCdfLeq` à chaque k. Mesure à n 4 368, α 0,45, δ 0,05 (k* 1 911) : 8,67 s à la base, 0,017 s après. Les lignes suivantes de `binomial.ts` gardent leurs numéros (tueurs des lots antérieurs).

## Différences servies

**Aucune.** Rejeu : 111 appels de `runGate` (clé USDe commise et autre clé, α imposé violé ; liq s0 à s3 ; cascade ; BYO interval et set, y compris scores négatifs et infinis ; budget, tau, `tauInterval`, horloge variés ; refus enregistrés avec code et message) ; sha256 des décisions sérialisées `b891dcab1b8cb40ca44c60d7dc16f641987aa43df0fab64be09340152181d238`, mesuré à `2abe801`, épinglé dans `apps/harness/test/served-replay-cm3.test.ts`.

## Tests

Sept tests neufs, F2P contre `2abe801` (rouges par assertion : les noms neufs sont lus par l'espace de noms du module), un tueur chacun, épingles pliées dedans :
- `packages/hikae/test/cm3a-engine.test.ts` : `nan_and_infinity_never_commit` (E-8), `score_domain_refuses_non_finite_and_negative_band_scores` (E-4), `split_quantile_exact_uses_the_integer_rank` (E-5), `risk_control_row_spends_test_delta_by_attempt` (E-12), `kstar_in_one_pass_equals_the_exact_cdf_and_is_fast` (E-9 : égalité avec l'ancien calcul sur une grille, borne de temps 1,5 s à n 4 368), `silent_row_counts_calib_misses_and_carries_no_bound` (E-6) ;
- `apps/harness/test/served-replay-cm3.test.ts` : `served_replay_identical_and_nan_never_commits_in_the_served_gate` (rejeu épinglé, plus E-8 dans le `gate` qu'appelle `runGate`).

Tueurs ré-ancrés (ligne tueuse seulement) : `oracle-l3-interval.test.ts` (l3-gate 88→92, 126→130), `gate-empty-set.test.ts` (97→101), `binomial.test.ts` (l'ancienne ligne `k + 1` n'existe plus : `binomial.ts:172 "return i - 1" -> "return i"`). Chacun vérifié tué à la main.

## Oracle

`tsc`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet`, `node --test` sur `packages/hikae/test` et `apps/harness/test`, `npm test` (tolérés : `bell-served.test.ts:153`, les dix rouges des surfaces MONARK de CM-2b, le test 42 instable sous charge), `node scripts/red-proof.mjs --base 2abe801 --gel <sha du code> --repo /home/user/monark-governance-cm3 --draw 8 --seed 9`.

## Questions ouvertes

1. Littéral d'E-8 : `non_evaluable` pour les six champs (choix laissé à RECHERCHES par MONARK). Une raison distincte demanderait d'amender `COVERAGE_REASONS` (gelé).
2. E-12 par une fonction neuve (`riskControlRow`) plutôt qu'une option de `riskControlQuantile` : celle-ci reste octet pour octet (R-2, tueurs ancrés). La consignation de la disjonction des fenêtres (LTT) relève de l'import (CM-4).
