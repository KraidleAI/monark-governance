# G7 — NARABI-OPS-1c (`run.ts` : budget de rattrapage en processus, horloge injectée, `elapsed_ms`/`max_day_ms`) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 14:06 UTC (`date -u`). Fusion `--no-ff` **`c4981d03c27b528b234a9a5a6d67de3fbdafc810`** sur `lot/etude-suite` (branche `lot/narabi-ops-1c`, base `5d177db`).

## Vérifications de l'orchestrateur (exécutées sur l'arbre FUSIONNÉ)
- `npm run ci` exit 0 : **710 tests / 709 pass / 0 fail / 1 skip pré-existant** ; `npm run lint` exit 0 ; `lint:ratchet` **69/69**. Journal `scratchpad/ci-narabi1c.log`.
- `git show --stat c4981d0` : 4 fichiers, +758/-18 (dont 302 lignes de docs de gates). **R-25 = 456 + 18 = 474 ≤ 1 205** (pathspec `ci.yml:65`, mesuré par moi, égal à la G2).
- **sha256 de `apps/sentinel/src/run.ts` sur l'arbre fusionné = `54619a40252f842a77ccf6dedc89c129d5a11eba764cd5018ff5dafa1d7d0ef3`** = sha du checkpoint-2, de la ré-acceptation et de la G2 ⇒ **sha de production E-5**.
- Ascendance E-5 : `git merge-base --is-ancestor 6bb2f84 c4981d0` = 0 (POOL-RPC-1a) ; `… c0027cb c4981d0` = 0 (NARABI-OPS-1b-ii) ; docs (ADR amendement -1c, RUNBOOK §6 « REDUCED, not lifted », `feca317`) dans le même SHA.

## Chaîne
G0 (`docs/G0-lot-narabi-ops-1c-runts.md`, checkpoint-1 C1..C9 `5d177db`) → G1 (`ff98be4`) → G2 séparée ‖ checkpoint-2 (régime B) → pli TEST SEUL (C1 câblage env→`runDue`, C3 skip d'export) → ré-acceptation **ACCEPTE** (`docs/CHECKPOINT2-lot-narabi-ops-1c.md`) → G2 **PASS-AVEC-CORRECTIONS** sur `90150c4` (`docs/G2-lot-narabi-ops-1c.md` : différentiel base↔HEAD `state.json` byte-identique, 7/7 mutants worker + G1/G2/G3 + V-1 rouges, G4 survivant) → G7.

## Corrections G2 (3, non bloquantes, aucune ne touche `run.ts`) — items FORMÉS
Ruling orchestrateur : ne pas faire bouger le sha E-5 ni rejouer le checkpoint-2 pour des corrections de test/commentaire ; elles sont portées par le **lot NARABI-OPS-1d** (décision 118 : migration du chemin payant sous garde, après la release du temps 1, qui touche `run.ts`/`rpc.ts` et redéploie). Propriétaire orchestrateur, déclencheur = G0 du lot -1d (exigences d'entrée) :
- **C-G2-1** : `budgetMsFromEnv` tolère les décimaux à zéros de tête (`"0180"`) — documenter la tolérance ou la refuser, avec test.
- **C-G2-2** : `sentinel_max_day_ms_covers_a_faulting_day` ne tue pas le mutant « mesure sur succès seulement » (G4 survivant) — jour fautif à 2×STEP. Le code est correct (lu par la G2) ; trou de force de test.
- **C-G2-3** : commentaires `run.ts:26`/`:105` énoncent la réduction du Mode A sans le qualificatif « pool sain »/résiduel (ADR et RUNBOOK, eux, sont exacts).

## Tuyaux (règle Branchement)
Entrée : timer systemd → `run.ts` (env `MONARK_SENTINEL_BUDGET_S`, défaut code). Sortie : `timeline.jsonl`/`state.json` publiés, lus par `/narabi/` et par la sonde Bell (`state_checked`). État : VPS site `/opt/monark-harness`. Preuve : `sentinel-catchup-budget.test.ts` (dont `sentinel_budget_env_value_reaches_rundue`) + test 42. **Registre** : le budget de rattrapage reste **WIRED jusqu'à E-5** ; « built » à la première ligne JOURNAL post-déploiement (`exit_code:0`, `stopped:null`, `elapsed_ms`/`max_day_ms` consignés, endpoints listant `pocket`).

## error_origin
C1 (câblage env non épinglé) : worker G1 ; C3 (skip d'export) : plan ; C-G2-1/-2 : worker G1 (couverture) ; C-G2-3 : worker G1 (précision de commentaire) ; HEAD déplacé sous la G2 (régime B) : sans effet, `run.ts` byte-identique — consigné comme propriété attendue du régime.

## Suite
**E-5** sous la décision 119 (GO durable), checklist en 9 étapes du validateur (sauvegarde rollback, `git archive c4981d0`, sha `run.ts` déployé == `54619a40…`, `TimeoutStartUSec=5min`, dry-run, premier run, tir suivant de la sonde). Critères STOP/rollback inchangés.
