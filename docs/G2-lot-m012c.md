# G2 — Revue du Lot M012-c (instrument + runbook + clôtures, ADR-M012 item (j))

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur, 2026-09-18. Lecture seule ; mutant vocab apply-and-revert
  avec preuve sha (`instrument.ts` `ed828df1…` avant = après). 5 shas cibles conformes.

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS (R-1, R-2 — non bloquantes, appliquées par le worker)** ; rien ne bloque go 2 / go 3.

- **R-1 (durcissement)** — `sentinel_imports_bidirectional` ne verrouillait que `harness/src/tools` ; un import nu `@monark/harness`
  (→ `server.ts` → `tools/**` transitif) ne rougirait pas. **Appliqué** : le seul spécifieur `@monark/harness*` admis sous `apps/sentinel/**`
  est `@monark/harness/calibration`.
- **R-2 (trivial)** — `p_value ≤ 0,01` tolérait `exceed` 0..9 ; **appliqué** : `exceed === 0`.
- **O-1** — `--day D` non-dry sur état frais = J0 de facto (conforme D5/O-b : discipline runbook). **O-2** — `G1-lot-m012c.md` apparu pendant
  la revue (exclu R-25, hors scopes vocab ; ses shas vérifiés vrais). **O-3** — publication de `instrument.json` sous `/narabi/` post-J0 non
  formée ⇒ **item (l) ADR-M012 formé par l'orchestrateur**. **O-4** — garde `runReadsInstrument` regex, `await import()` non couvert ; mitigé
  par `ExecStart = run.ts`.

## Oracle rejoué par le relecteur
`ci` **253/253** ; sentinelle **18/18** ; `gate:vocab` **129** ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `lint` 0 ; `export:check` 0 ;
`diff --check` propre ; **R-25 = 485** (476+/9−) ; `npm ci --dry-run` OK, `npm ls @monark/harness` = symlink workspace, 0 externe ;
`USDE_STABLE_RUN_CALIB_DIGEST == PINNED` (`c9793b28…`).

## Instrument (CLI exécuté 2× octet-identique)
CUSUM paires calmes : **9.544601061384807**, n = 616, misses = 63, N = 1000, exceed = 0, **p = 1/1001** ; all-evaluable 25.08 (n 694,
misses 116, déclaré) ; rejeux `c = q̂` `ebf868d8…`, `ε = 0,01` `e6c8cd53…` ≠ live `fb6ba08e…` ; `T(ε = 0,01) = 453`. **Honnêteté 613 vs 616
VÉRIFIÉE** : `cusum613 = cusum616` exactement, `misses613 = 60` (= §0), les 3 clôtures 10-13/14/15 sont des ratés de queue qui ne bougent pas
le max de Page. Jamais importé par `run.ts` ; `stateSummary` = 4 clés, sans `instrument` ; `ExecStart` = `run.ts`.

## C3 / C2 / RUNBOOK / O-a
Sous-chemin `./calibration` transitivement pur ; arête workspace seule ; K-8 et `harness_export_whitelisted` verts. Scope `sentinel` = 12 cibles
(6 src + 1 test + 5 deploy), 12 motifs ; mutant CLI réel ROUGE puis vert au revert. RUNBOOK : diff = RC1 + O-b + O-d + ligne O-a ; bloc vitrine
intact (backup, validate, reload, curl, rollback) ; seul « secret » = IP VPS déjà acceptée ; `docs/` non exporté. `j0SourceOf` épouse `dueDays` ;
`resolveStartDay` inchangé.

## Honnêteté / MAST
0 « adaptive coverage… » hors motifs et mutants ; 0 ARL, 0 citation (item (h) non déclenché) ; 0 français ; 0 TODO. MAST : O-1 (procédural),
O-4 (import dynamique), coordination O-2 ; le reste clos par les tests et mutants.
