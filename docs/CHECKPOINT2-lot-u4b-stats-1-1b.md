# Checkpoint-2 (LIVRABLE) — lot U-4b-STATS-1, unité 1b (4c5fa8d) — validateur-humain claude-fable-5-1, 2026-09-23

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (LIVRABLE) — lot U-4b-STATS-1, unité 1b (`lot/u4b-stats-1` @ `4c5fa8d` ; 1a-corr `66141fb` ; 1a `564292d` ; base `50f78b0`)

Rendu intégral (au fil de l'eau) : `F:\tmp\cp2-u4bstats1\CP2-1b.md` — sha256 `103b3fb57dc83c57d563b1901ebca2744f2d9833979b5eda2616152801806bba`. G2-delta de 1b non lu (CA-9).

**Condition de 1a LEVÉE** : le G2 1a est rendu PASS-AVEC-CORRECTIONS (5 corrections test-only), concordant avec mon cp-2 1a (test-only, aucun défaut de comportement) ⇒ CA-6 de 1a satisfaite ; C-V-3 fermée (VX-3/5/6 tués par leurs tests nommés, VX-1 par T7).

## Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-W-1..C-W-4), **conditionnée à un G2-delta de 1b rendu et concordant au G7** (CA-6). Pas d'ESCALADE-INVESTISSEUR. Point de vocabulaire à réconcilier : je n'adopte PAS le mot « dérogation » pour 826 — la borne « < 800 » est celle de la mission, aucun gate n'est franchi (STOP A-5 1 150, CI 1 205) ; c'est la D-4 déclarée du rendu v3. Si l'orchestrateur la journalise comme dérogation de gate, cela entrerait dans ma frontière d'escalade — la réconciliation doit être visible au G7.

| # | Correction | Porteur | Déclencheur |
|---|---|---|---|
| C-W-1 | Tests seuls : (a) niveau `clause359` — H-3 poolé NON sans strate servie NON ⇒ `h3_pooled_verdict_outside_condition === "NON"`, `condition_satisfied` inchangé (VY-6 ; volet clause de C-G2-1 différé par le G2) ; (b) frontière H-4 : fraction exactement 5/100 ⇒ OUI, au-dessus ⇒ NON (VY-2 ; « NON ssi > 5/100 » de l'ADR sans test) ; (c) I-G2-1 : consommateur test de `VERDICTS` (assert d'appartenance sur T11/T17) ; VY-2/VY-6 rejoués rouges (`vy-mutants.mjs`) | worker micro-pli / orchestrateur | avant G7 (micro-commit test-only mesuré R-25) |
| C-W-2 (= C-V-1) | Deux fusions first-parent : `66141fb` (735) puis `4c5fa8d` (826) — la branche est linéaire, un seul `merge --no-ff` ferait un segment de 1 535 > 1 205 ; preuve au G7 : `git log --first-parent` + R-25 par segment | orchestrateur | fusion |
| C-W-3 (= C-V-2 + I-B + I-C) | ADR à l'insertion : Q-1 daté (a) (§4/§8 disent encore « attendu »), renvoi `:207 → :402`, chiffres 735/826 + compte de mutants ; RUNBOOK :501 « demande formée Q-1 du G1 » → ruling (a) daté (docs, hors R-25) | orchestrateur | insertion / G7 |
| C-W-4 (= C-V-4) | Procurement JKK (ISBN/DOI/section ou clôture « non requis ») ; I-2 versement A&B (`c69aa191…`, présent) ; I-G2-2 (chaîne `u4b-hyp → u4b-scores → abi.ts → rpc.ts`) inscrit au G0 du pli NARABI-OPS-1d | orchestrateur | G7 / G0 du pli |

## Mesures propres (CA-9, `F:\tmp\cp2-u4bstats1\`)
- DELIVERED-1b-v3 **5/5** sur le clone `4c5fa8d` ; `1a-corr.patch` = `g2-proto-tests.diff` à l'octet (`ff461d44…`) = diff `564292d..66141fb`.
- Oracle 7 gates `4c5fa8d` : **7 × 0 ; 951/950/0/1**. Fusion à blanc sur `lot/etude-suite` = `fad24ab` (pointe à l'heure du rejeu, refaite après un premier essai invalide — pointe non fetchée — écarté et consigné) : 0 conflit, **7 × 0 ; 988/986/0/2**.
- Mutants : harnais worker v46 recopié (chemins seuls) **46/46**, sha mutés/restaurés/verdicts/tests rouges identiques au run v3 du worker 46/46 ; harnais G2 phase B **12/12**, identiques 12/12 ; mes VX-1..8 **8/8 tués** ; mes VY-1..8 sur le code 1b : 5 tués, VY-7 équivalent (`wx` = seconde garde ; refus non nommé, observation), **2 survivants réels VY-2 et VY-6** (champs rapportés, hors `condition_satisfied`).
- A-6 **13/13** à `4c5fa8d`. R-25 pathspec verbatim : segment 1 **735**, segment 2 **826**, bloc 1 535.
- CA-11 durci : `report` rejoué PAR MOI depuis les fixtures committées réelles : 2 sorties byte-identiques entre elles ET au fichier de fumée du worker (`5179f3de…`), `body_digest` `49b138c3…`, tool sha `07e25e19…` (= valeur attendue au sidecar 6), `clause_359 = {true, 0, true, OUI}`, 0 jeton « go », 0 chemin absolu ; `--out` dans le dépôt et `--alpha` refusés exit 1 sans écriture. Statut **upcoming** jusqu'à la première 6d (I-4) — conforme.
- Export public rejoué : 328 fichiers, manifest `5d5f8fbd…` et empreinte agrégée `f69c8e74…` identiques à la référence worker ; 0 fuite.
- H-4/H-6 recomputés hors outil (Python, fixtures brutes) : 24/189, 11/99, rapprochement 194/194, H-6 179/177/2/0 retard max 3, histogramme `price` {70, 26, 6, 5}, 1 sur l'ancre ; anti-close : seuls littéraux synthétiques.

## AM-1
- Attrapé : VY-6 (verdict poolé RAPPORTÉ — l'information investisseur du ruling Q-1 — jamais pinné à NON au niveau clause) ; VY-2 (frontière H-4 non testée) ; topologie linéaire ⇒ risque de segment unique 1 535 ; oracle fusionné invalide détecté et refait.
- Manqué : à mon cp-1, la frontière H-4 (C-6) et le dimensionnement R-25 ; à mon cp-2 1a (signal a posteriori = G2 1a) : C-G2-1 (ruling Q-1 accepté sans épingle de test), C-G2-3 (champs C-11 non assertés), C-G2-4 (décision flottante fail-open), C-G2-5 (E2_MIN_N d'un seul côté) — consignés dans `CP2-1b.md` §8.

## Preuve AM-2 ter
`F:\Monark` : status 1 ligne avant (`?? docs/course-bell/FAITS-floor-helius-n3-2026-09-23.md`, fichier de l'orchestrateur, non touché) → 0 après (committé par lui) ; blobs `4c5fa8d` = DELIVERED-1b-v3 5/5 aux deux extrémités ; `F:\Monark-wt-u4bstats1` intact (status 0) ; `clone-mut` outil restauré `07e25e19…`, status 0. Journaux : `F:\tmp\cp2-u4bstats1\{oracle-1b\, oracle-merged-1b\, merge-1b.log, mutants-run-cp2-full.log, mutants-result-cp2-full.json, g2-mutants-B.{log,json}, vx-1b.{log,json}, vy-mutants.{mjs,log,json}, cli-replay.log, hyp-report-e2-{a,b}.json, export-4c5fa8d\ + export-4c5fa8d-fingerprint.log, h4h6-recompute.{py,log}, frozen-4c5fa8d.txt}`. Rendu 1a inchangé : `CP2-1a.md` sha `05ca47aa…`.
