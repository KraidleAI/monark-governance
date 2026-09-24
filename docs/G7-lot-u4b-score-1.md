# G7 — U-4b-SCORE-1 (score de calibration unilatéral, décision 126) — ACCEPTED, fusion `6652ed0`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 02:22 UTC (`date -u`). Branche `lot/u4b-score-1` @ `5381f9c` (G1 `35f7a67` + pli documentaire orchestrateur), fourche `f26693f`, fusionnée `--no-ff` dans `lot/etude-suite`. Petit lot (cadence 116) passé au checkpoint-2 parce qu'il re-gèle un sha D4.

## 1. Oracle complet sur l'arbre FUSIONNÉ `6652ed0` (clés payantes retirées du process)
`npm run ci` → 0 : tests **781 / 780 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b`) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-score1\*.log`. Gel post-fusion : `u4b-scores.mjs` = `2f9a31f6…` (re-gelé), `u4b-reduce.mjs` = `a5e66cd3…`, `record-u4b-calib.mjs` = `5733daeb…` (inchangés). R-25 = 83 (+9/−7 de pli docs/commentaires).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Décision | 126 (`docs/CHANTIERS.md`), sur audit R-21 de l'avis advisor-defi (persisté `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-vacuite-region-A-options-2026-09-22.md`) | option 1 |
| G1 | `F:\tmp\u4bscore\G1-lot-u4b-score-1.md` ; 1 ligne de score + commentaire, fixture régénérée par la recette PROVENANCE §3, 2 tests neufs, ADR/PROVENANCE/prereg CANDIDAT | — |
| G2 | `docs/G2-lot-u4b-score-1.md` (8 vérifications refaites, D-4 par diff, 1 contenu + 3 wording) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u4b-score-1.md` (fixture régénérée byte-identique, q̂ recomputés, mutant ROUGE à `:245`, fusion à blanc 781/780/0/1) | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `5381f9c` (orchestrateur, docs/commentaires seuls) : `:245`/`:176`/`:224`, phrase `region.kind` reste `"interval"` (ADR + prereg), licéité, « régions (bornes hautes) », `PLAN:74` sha `2f9a31f6…` | — |

## 3. Livré
Score `s = max(Y − ŷ, 0)` (`u4b-scores.mjs:245`) ; fixture `U4b-scores-e2.jsonl` `301d39fa…` (census identique, seul `score` bouge) ; q̂ A : k0 = 23 169 870 364, k1 = 3 609 978 241 254 (= max, p = n), k2/k3 under_calib ; tests `u4b_score_is_one_sided_exceedance`, `u4b_scores_fixture_kind_census` ; ADR-U4b amendement daté (9 sha, région servie = borne haute `[0, ŷ+q̂_k]`, `region.kind` inchangé, item Mondrian conditionnel-au-label) ; prereg CANDIDAT : H-3 conservateur sous ex æquo, H-2bis n ≥ 199, compteurs `crossed_yhat_zero` (1) et « liquidé sans franchissement » (3, disjoints), score en §Définitions.

## 4. Branchement
Aucun chemin servi touché (7 fichiers, aucune surface publique, `gate.ts`/`region.ts` intacts) ; `branché`/`built` inchangés. Le consommateur du score est le prereg -1b (commit suivant, seul).

## 5. Items formés
- Mondrian conditionnel-au-label (option 3) — propriétaire orchestrateur, déclencheur : épisode frais ≥ 100 liquidés mono-WETH dans une strate.
- Prereg : au commit réel, recomputer la table §2 (régime B) et relire une dernière fois les lignes de prose citant des sha.
- G0 U-4b-2 déjà plié pour la forme borne haute (`f0720ae`).

## 6. `error_origin`
Numéros de ligne périmés (`:244` cité après insertion du commentaire) : worker (rendu) + orchestrateur (mission citant `:244`, décision 126 citant des arrondis d'affichage) ; attrapé par le checkpoint-2 (mutant à la ligne citée = faux vert). Sha périmé `PLAN:74` : worker. Aucun défaut de code.

## 7. MAST résiduel
Strate 0 reste large (×227) sous tout score — propriété de la strate (ŷ ≈ 1 $), rapportée ; q̂₀ = gravité des échecs de règle. Strate 1 : q̂ = max tant que n < 199 (clause H-2bis).
