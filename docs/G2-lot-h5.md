# G2 — Lot H5 (démonstration bout-en-bout enregistrée)

> **Lot** : H5 du harnais (ADR-M005 PLAN §H5, correction C-6). Ferme le résidu « seam SDK `tools/call` » (H2/H3).
> **Réviseur ≠ générateur** : instance fraîche `claude-opus-4-8[1m]`, distincte du générateur H5. **R-20** : lecture seule, aucun commit, aucun `git checkout` (mutant testé par `cp`-backup, sha vérifié au restore).

## Périmètre livré (5 fichiers neufs)
- `test/h5-e2e-probe.test.ts` — `probe_harness_records_real_decision`.
- `test/h5-trace-builder.ts` — driver + oracles indépendants + `buildTrace()`.
- `scripts/record-h5-e2e-trace.mjs` — recorder reproductible.
- `fixtures/h5-e2e-trace.json` — trace commise (« démo enregistrée »), sha256 épinglée.
- `fixtures/PROVENANCE-h5-e2e-trace.md` — provenance + sha256.

## Verdict G2 : **PASS-WITH-RESERVES (0 bloquante)**
Le lot **prouve ce qu'il revendique** : `tools/call` réel sur le fil (initialize + tools/list + 4× tools/call + 1 miroir HTTP, SSE `text/event-stream`, Accept sans event-stream ⇒ 406), pas `tool.run()`. Décision honnête enregistrée : cascade→gate = **abstain/under_calib** (n_calib:0), btc-dir-15m = commit/covered sur calibration **synthétique** déclarée, attest **démonstratif non probatif**, B_t caller-carried **echo non déplété**. Contrats gelés 0 octet ; K-8 respecté ; R-8 aucune dépendance neuve.

### Le crux (Probe 1) — anti-mock load-bearing ET non circulaire — vérifié
Le réviseur a **rejoué le mutant** (geler `cascade` pour rejouer la réponse commise) : la sonde échoue à `h5-e2e-probe.test.ts:131` sur l'assertion de perturbation `shock=0.6 ⇒ yhat=150` (actual 100 ≠ 150) — **APRÈS** avoir passé le `deepEqual` de fidélité (`:79`) et le pin sha (`:82`). Donc **le `deepEqual` seul NE capture PAS la trace figée ; la perturbation shock=0.6 le fait** (revendication centrale du worker, empiriquement vraie). **Non-circulaire** : `h5-trace-builder.ts` n'importe **pas** `@monark/ukemi` ; `independentCascadeYhat` (`:130-154`) réimplémente un clearing E&N **Picard-par-le-haut** (algorithme différent de la production `clearing()`/`solveLinear` par élimination gaussienne — même spec mathématique, code indépendant : la bonne norme d'indépendance).

### Oracle R-21 corroboré (10 chiffres re-exécutés)
ci **147/147** (dont la sonde, ~120 ms), lint **0**, ratchet **92/92**, lang-gate `root`/`harness` **0** (tous scopes 0), grep-forbidden **0** (107 fichiers défaut ; 108 avec la trace explicite), `git diff main -- schemas/ packages/contracts/` **0 octet**, recorder **reproductible byte-for-byte**.

### Réserves non bloquantes (0 bloquante) et leur disposition orchestrateur
1. **Errata ADR-M005 D7 (version de protocole)** : SDK GA négocie `2025-11-25` (vs `2026-07-28` cité) ; la propriété SANS ÉTAT tient et est démontrée. → **Disposé** : `ADR-M005 Addendum D13` (annotation seule, dans ce lot). `error_origin` = R-P3.
2. **Placeholder `reviewer` de la trace** : nommait `claude-fable-5-1` (inexact pour la campagne Opus-seat). → **Disposé** : re-pin UNIQUE et prudent (recette G2) vers une chaîne finale exacte pointant `docs/JOURNAL-PROVENANCE.md` + `docs/G2-lot-h5.md` (committer Opus-seat `claude-opus-4-8`). Nouvelle trace sha `2a81509a…`, 15624 o ; probe `:50` + PROVENANCE sha/octets re-épinglés ; probe re-vert ; recorder reproductible re-vérifié.
3. **Portée vocab** (Probe 6) : `predicts`/`probative`/`live` non policés sur la surface trace/fixture par design (site-scoped / attest-tool-scoped) ; extension éventuelle = ligne `vocab-banned.json`, **hors H5**.
4. **Portée mutant no-clearing** (Probe 1) : la perturbation H5 ne discrimine pas un mutant production `pPlus→p̄` — c'est la couverture shock=0.57 de H2. Revendications des deux lots gardées distinctes.

### OBSERVATIONS mineures (non bloquantes, non-défauts)
- La sonde n'**enforce** pas le cadrage SSE (fallback JSON dans `extractJsonRpc`) — la revendication SSE est vraie (vérifiée) mais pas auto-gardée.
- PROVENANCE sha/octets **non** enforced par test (le pin trace l'est) — footgun de re-pin documenté ; recette suivie prudemment.

## error_origin
- Correction 1 (D7) = R-P3 (version amont) ; correction 2 (reviewer) = générateur (placeholder) / procédure (re-pin par l'orchestrateur, byte-exact vérifié). Aucune correction n'a touché la logique du produit ni les contrats gelés.

**Verdict : PASS-WITH-RESERVES (0 bloquante) — merge autorisé après R-21 orchestrateur (fait) + R-25.**
