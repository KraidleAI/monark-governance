# Checkpoint-2 (livrable) — lot U-4b-STATS-1, unité 1a — validateur-humain (claude-fable-5-1), 2026-09-22

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (LIVRABLE) — lot U-4b-STATS-1, unité 1a (`lot/u4b-stats-1` @ `564292d`, base `50f78b0`)

Rendu intégral (écrit au fil de l'eau) : `F:\tmp\cp2-u4bstats1\CP2-1a.md` — sha256 `05ca47aadbac1591b77219c733f34288fe6d94949c90971b978cfc78075d5107` (131 lignes). G2 non lu (CA-9).

## Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-V-1..C-V-4), **conditionnée à un G2 rendu et concordant au G7** (CA-6). Pas d'ESCALADE-INVESTISSEUR : Q-1 (a) est une lecture littérale pré-donnée de :359 (la cellule poolée n'est ni une strate ni servie), pas une décision de valeur.

| # | Correction | Porteur | Déclencheur |
|---|---|---|---|
| C-V-1 | Fusionner 1a puis 1b en **deux segments first-parent** mesurés séparément (640 ; 771), jamais un segment unique 1 385 > 1 205 (décision 25, CHANTIERS :94) ; 1a fusionnée en statut « upcoming » ; G7/clôture après 1b | orchestrateur | fusion sur `lot/etude-suite` |
| C-V-2 | À l'insertion de l'amendement ADR : remplacer « ruling Q-1 attendu avant 6a » (§4, §8) par le ruling daté (a) (CHANTIERS :913) ; ajouter à `ADR-U4b:207` le renvoi « re-gelé `cb020425…` → :402 » (O-3 = item réel documentaire : :195-207 est l'instantané D4 de la décision 126, antérieur à QF-2) | orchestrateur | insertion (avant G7) |
| C-V-3 | Delta de test 1b : 3 tests pour les gardes amont de `parseScores` sans test (VX-3 `rows ≠ cell_a.n`, VX-5 `score ≠ max(Y−ŷ,0)`, VX-6 `strata ≠ 4`) + 1 cas synthétique T7 cumulant n_frais<100 ∧ n_e2<50 (VX-1 : précédence pinnée par la seule fixture réelle T11) ; 4 mutants rejoués rouges au cp-2 de 1b (`F:\tmp\cp2-u4bstats1\vx-mutants.mjs` réutilisable) | worker 1b / orchestrateur | avant le commit 1b |
| C-V-4 | Procurement JKK : ISBN/DOI/section complétés par le chercheur ou clos « non requis » (pmf établie par dérivation + tests) ; I-2 = versement de la source A&B (PDF présent hors dépôt, sha `c69aa191…` recomputé) | orchestrateur | G7 |

## Mesures propres (CA-9, clones sous `F:\tmp\cp2-u4bstats1\`)
- Oracle 7 gates sur le clone `564292d` : **7 × exit 0 ; 933/932/0/1** (`oracle-1a\`). DELIVERED 4/4 = blobs `564292d`.
- 16 mutants du worker rejoués (harnais recopié, 3 chemins + TEMP changés) : **16/16 KILLED(byIntended)**, `mutated_sha256`/`restored_sha256`/verdict/tests rouges **identiques** au fichier du worker 16/16 ; 0 test déclaratif.
- Mutants propres VX-1..VX-8 : 5 tués ; **3 survivants** (VX-3/5/6, gardes fail-closed de `parseScores` présentes dans le code mais sans test — trou de preuve, pas de code) ; VX-1 tué par T11 seul, pas par T7.
- A-6 : 13/13 invariants LF identiques `50f78b0` = `564292d` = `frozen-before.txt`. R-25 pathspec verbatim `ci.yml:65` : **640**. Fusion à blanc sur `39bea22` (tête `lot/etude-suite` à l'heure du rejeu) : propre, oracle fusionné **7 × 0 ; 949/947/0/2**. `git apply --check seam/1b.patch` sur `564292d` : propre (n'y touche pas `export-exclude-tests.json`).
- Statistique, recomputée hors outil (Python `fractions`) : dérivation BB par rangs complète et terme à terme égale au code ; p-values e2 **120214/174725** et **1951057469/3061898805** égales ; frontière **1/20** exacte ⇒ NON à ≤ ; `⌈99(n+1)/100⌉` vs `Math.ceil` : 0 divergence [1, 20 000] ; masses Q6 3,6/6,3/5,8/10,4 % reproduites avec la règle de l'avis :71-72 ; moments A&B p.50 exacts ; argument des atomes tient (K_fermé ≥ K_départagé ⇒ queue basse super-uniforme ; ma propre énumération : 0 violation / 76 comparaisons, strict 60 fois) — d'où M02/M03 non négociables (l'autre sens serait anti-conservateur). Phrase C-11 : sha `b76dc988…` recomputé par `printf | sha256sum` = constante de T12.
- Erratum O-6/I-5 vérifié : blob `564292d` = `seam/1a` = golden `mutants-run-1a-precut.log:10` (`50436e8f…`), byte-identique à l'état d'avant la coupure. Couture A-5 : légitime (ligne de coupe = la seule statistique de :359 ; unité prouvable seule), sous C-V-1. CA-11 : 1a non branchée et déclarée telle (grep site/README/skills = 0 ; RUNBOOK @ `564292d` dit encore « aucun outil ⇒ R-K »). `error_origin` : NUL = infra + conception sans fsync + contrôle orchestrateur (déjà assigné) ; D-1 couture = dimensionnement du plan (planificateur + mon cp-1) ; D-2..D-5 = choix imposés/patrons, pas des erreurs. Anti-close : aucun chiffre de marché dans le diff.

## AM-1
- Attrapé : 3 gardes sans test (VX-3/5/6) ; précédence pinnée par la seule fixture réelle ; ADR proposé périmé sur Q-1 ; topologie de fusion (segment 1 385 > 1 205) ; O-1/A-13 (transport `\\`→`\` en heredoc) confirmé sur mon propre harnais.
- Manqué (mon cp-1) : le dimensionnement R-25 du lot (« < 800 » vs 1 385 réel) — non chiffré au plan.

## Preuve AM-2 ter
`F:\Monark` : `git status --porcelain` = 0 avant/après (la tête a bougé par commits de l'orchestrateur, sans lien) ; 4 blobs `564292d` inchangés (`50436e8f…`, `6297540c…`, `6778c22b…`, `cb729fef…`) ; `F:\Monark-wt-u4bstats1` intact (status 0, HEAD `564292d`) ; `clone-mut` outil restauré `50436e8f…`, status 0. Journaux : `F:\tmp\cp2-u4bstats1\{oracle-1a\, oracle-merged\, mutants-run-1a.log, mutants-result-1a.json, vx-mutants.{log,json}, pv-recompute.{py,log}, atoms-recompute.log, merge-blanc.log, frozen-564292d.txt, frozen-50f78b0.txt}`.
