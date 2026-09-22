# G7 — U-4b-1b-1 (labeler paramétré, ruling QF-2 option alpha) — ACCEPTED, fusion `506db2d`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 07:05 UTC (`date -u`). Branche `lot/u4b-1b-1` @ `298e04a` (G1 `2cbdea2` + pli), fourche `a56e739`, fusionnée `--no-ff` dans `lot/etude-suite` sans conflit ; amendement ADR inséré à `fc7eeff`.

## 1. Oracle complet sur l'arbre FUSIONNÉ `fc7eeff` (clés payantes retirées du process)
`npm run ci` → 0 : tests **832 / 831 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b`, Bell, pré-existant) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-u4b1b1\*.log`. R-25 du lot 933 (borne 1 150 / CI 1 205). Les 8 sha gelés inchangés ; **labeler RE-GELÉ** `755b3a38…` → `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af` (recomputé sur HEAD par l'orchestrateur) ; tranche réducteur pur `1c7574ac…` byte-identique ; labels e2 `b4d93590…` byte-égaux (réducteur ET vrai `main()` sur le brut réel, 2 fetch comptés par deux instances).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Ruling | QF-2 option alpha (paramétrage fusionné AVANT le commit du prereg) | — |
| G1 | `F:\tmp\u4b1b1\G1-lot-u4b-1b-1.md` ; 816/815/0/1, 6 mutants, R-25 772 | — |
| G2 | `docs/G2-lot-u4b-1b-1.md` (e2 prouvée, 8/8 refus payants 0 fetch, footgun `--out` démontré, défaut admettait 1rpc.io, 10 mutants, fusion à blanc) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u4b-1b-1.md` (égalité rejouée par `main()` sur le vrai brut, P14 `--out` écrase la série committée, 1rpc.io contre l'en-tête, 5 survivants) — liste (B) gardes par code retenue | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `298e04a` : C-1..C-7 (`--out/--raws-dir` obligatoires + refus sous fixtures, `EXCLUDED_OPERATORS=["1rpc.io"]`, filtre/quorum, casse, prereg-sha pré-fetch), 16 mutants | — |
| G2-delta | `docs/G2-DELTA-lot-u4b-1b-1.md` : 20/20 mutants, 822/821/0/1, fusion à blanc 832/831/0/1 | PASS |
| Re-checkpoint-2 | `docs/CHECKPOINT2-DELTA-lot-u4b-1b-1.md` : 19/19, refus pré-écriture/pré-fetch | ACCEPTE |

## 3. Livré
`scripts/census/u3-realized.mjs` + `.d.mts` : section live paramétrée (`--events`, `--rawlogs`, `--rawlogs-sha`, `--prereg-file` défaut `docs/PLAN-u4b-prereg.md`, `--prereg-sha`, `--operators`, `--out`, `--raws-dir`, `--episode-tag`, `--max-calls`, `--archive-operator` + `--allow-paid` gardé) ; `process.env` = 1 (injection `main`) ; jambe payante uniquement via `openGuardedClient` ; réducteur pur byte-identique. `test/u3-realized-param.test.ts` (16 tests dont le rejeu C-1 depuis l'artefact réel, skip nommé si le brut hors dépôt manque : CI frais = 822/820/0/2).

## 4. Branchement
Entrée : épisode frais (`--events`) produit par la découverte + réducteur de sélection ; sortie `<out>/U3-realized.jsonl` consommée par `u4b-reduce --labels` (CLI réel) ; état `--raws-dir` hors dépôt ; test de composition = C-1. Chemin servi = la course U-4b-1b elle-même (ligne figée dans l'amendement ADR §4 et le prereg §5d).

## 5. Items formés
- Prereg -1b §2 (`cb020425…`), §5c (reconcile = gate séparée, décision 129), §5d (ligne figée) : worker en cours, commit SEUL, propriétaire orchestrateur.
- Portée C-6 = sous-arbre `apps/sentinel/test/fixtures/` ; « hors dépôt » porté par la ligne de course. `--operators` insensible à la casse ne refuse ni n'admet `1RPC.IO` (aucun fail-open).
- R-1/R-2 de l'amendement : déclencheur « première course figée ».
- Marqueurs de conflit résiduels dans l'ADR (3 lignes, hérités de l'union 1b-0 à `5d58a8a`) : retirés à `fc7eeff` — `error_origin` orchestrateur (union manuelle sans contrôle de marqueurs) ; contrôle « 0 marqueur » ajouté à la checklist G7 de l'orchestrateur.

## 6. `error_origin`
Footgun `--out` et 1rpc.io admis : plan (rulings procéduraux au lieu de gardes par code — attrapés par G2 et checkpoint-2) ; e2 prouvée seulement par le réducteur au G1 : worker ; marqueurs ADR : orchestrateur.

## 7. MAST résiduel
FM-3.2 soldé par le rejeu C-1 depuis l'artefact réel ; résiduel nommé : portabilité CI (skip nommé, jamais un faux vert).
