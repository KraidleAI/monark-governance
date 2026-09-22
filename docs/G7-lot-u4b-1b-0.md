# G7 — U-4b-1b-0 (outillage de course : garde prereg par code, diagnostic durable, découverte keyless) — ACCEPTED, fusion `5d58a8a`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 06:15 UTC (`date -u`). Branche `lot/u4b-1b-0` @ `0578514` (G1 `57ac8ae` + pli), fourche `3afde03`, fusionnée `--no-ff` dans `lot/etude-suite` avec deux unions (`scripts/export-exclude-tests.json` : 9 tests ; ADR-U4b : ordre 126 → 2a-8 → D4).

## 1. Oracle complet sur l'arbre FUSIONNÉ `5d58a8a` (clés payantes retirées du process)
`npm run ci` → 0 : tests **820 / 819 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b-iii`) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-u4b1b0\*.log`. R-25 du lot 722 (borne 1 150 / CI 1 205). Les 9 sha gelés U-4b byte-identiques (dont `u4b-scores.mjs` `2f9a31f6…`, labeler `755b3a38…` — re-gel du labeler = lot U-4b-1b-1, séparé).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Décision | 128 (rulings Q-A..Q-E du prereg final) | — |
| G1 | `F:\tmp\u4b1b0\G1-lot-u4b-1b-0.md` ; 789/788/0/1, 5 mutants, R-25 626 | — |
| G2 | `docs/G2-lot-u4b-1b-0.md` (9 sha concordants, sondes, 5+3 mutants, fusion à blanc 818/817/0/1) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u4b-1b-0.md` (gardes sans contrôle positif, variantes de casse, conflit JSON, libellé D4, prereg à réaligner) + question d'escalade tranchée (flags obligatoires par code dès que le prereg existe ; `--no-prereg-binding` pour les usages hors U-4b) | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `0578514` : contrôles positifs, variantes + label payant inconnu, flags obligatoires + `--no-prereg-binding` (provenance `prereg_binding:"none"`), usages génériques adaptés (survie après commit du prereg prouvée), wording ; amendement ADR D4 inséré ; 11 mutants | — |
| G2-delta (reprise) | `docs/G2-DELTA-lot-u4b-1b-0.md` : 14/14 mutants, simulation du commit du prereg 791/790/0/1, fusion à blanc 820/819/0/1 | PASS |

## 3. Livré
`record.ts` : `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`) + `--prereg-sha` liés par code ; `--labeler-sha` vérifié contre le labeler ; les deux REQUIS dès que le fichier prereg existe ; `--no-prereg-binding` explicite (provenance) ; refus de garde pré-vol (0 appel, 0 ledger, pas de diag) ; `<out>.diag.json` durable sur tout échec (rpc_errors, tally, n_at_risk_seen, sha) sans clé ni URL — clôt C-R-b7. `scripts/census/u4b/liquidation-logs.mjs` (module pur, n'importe jamais le labeler) + `u4b-discover.mjs` (keyless-only via le client gardé, refus fail-closed de tout label non keyless, sortie triée + sha). Tests non-LLM d'intégration ; `export-exclude-tests.json` +3.

## 4. Branchement
Outillage consommé par la course -1b elle-même (chemin servi = course + journal + provenance) ; aucun registre public touché ; `discover` = témoin consultatif (n'exécute pas §DISC:31/:42-46/:49 — réducteur de sélection = item formé, déclencheur prereg -1b).

## 5. Items formés
- Prereg -1b : §5 aligné sur les flags réels (`F:\tmp\prereg2\PLAN-u4b-prereg.md`, à finaliser après U-4b-1b-1) ; valeur LIÉE de `prereg_binding` non testée (déclarative).
- Réducteur de sélection d'épisode `episode-selection.json` (tuyau `u4b_episode_selection_is_deterministic`).
- Rouges non signés hors diff observés par le validateur (h5-e2e-probe, http.test.ts ; verts seuls et au 2e run) : nouvelle occurrence de l'item D4 environnement/amont Node.

## 6. `error_origin`
Gardes sans contrôle positif : worker (+ relecteur G2 partiellement) ; conflit JSON : plan (fusion en cours de -2a) ; libellé « D4 vraie par code » : worker ; effet de bord sur les usages génériques : plan (attrapé par le worker au pli).

## 7. MAST résiduel
FM-3.2 (couverture) soldé par les contrôles positifs ; résiduel nommé : `stripUrls` non load-bearing (le transport scrubbe déjà — ceinture-bretelles).
