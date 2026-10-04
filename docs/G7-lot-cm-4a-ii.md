# G7 du lot CM-4a-ii-a (contrat 1.1.0, bloc B2)

- **Plan** : `docs/G0-lot-cm-4a-ii.md` (commit `593e4991`, et sa section « Mesure au code » ajoutée par ce commit) ; plan r3 §4, §5.2.1, §5.3, §8.3 (ligne B2) ; A-2 r3 §2.2, §2.3, §5 ; décision déléguée sur `PolicyRow`, condition 2 ; addendum 8 de l'ADR 0006 (gelé, P0 `ec202d00`), non touché.
- **Base** : `7a0b1a49` (`base/chantier-moteur-2026-10-03`, refetchée). **Gel** : `b85da486` (branche `recherches/cm-4a-ii`, non poussée). Commits : `593e4991` (G0), `066e8021` (tests rouges, garde kata), `f4394af3` (code, garde kata), `371fa31e` (tests rouges, lignes marginales), `b85da486` (code, gel), ce commit (G7, et la section « Mesure au code » du G0).
- **Statut** : en attente de la G2 et du contrôle par diff de MONARK. Rien n'est poussé. Le lot b (G-6, vague ≥ 2) attend Q-1.

## Ce que le lot change

Tout dans `apps/harness/` ; **aucun fichier existant modifié** ; aucun fichier de `packages/contracts/src/` ni de `schemas/` ; manifeste figé fermé (`contracts_frozen` vert sans ré-épinglage).

- `apps/harness/src/policy-classes.ts` (27 lignes) : `kataClassEntries(text)`, les 32 entrées de la spec §9 (G-1 ; reçu 1 et m-4 de B1), `n_min` par `zeroErrorFloor` ; `KATA_BASE_DELTA`, `KATA_H_MS`.
- `apps/harness/src/policy-guard.ts` (105 lignes) :
  - `guardKataRow(row, cls, pins)` (G-2) : contrôle fermé du bloc A, puis, dans l'ordre : vague 1 (`source.wave` = 1, colonnes de vague 2 nulles) ; classe (`statement`, `task_class`, `region_rule`, `alpha`, `test_delta` de base, `horizon` ↔ `h_ms`, `bucket`, `thresholds`, `aux_seq` selon le mode) ; colonnes kata non nulles ; `cell_key` recomposée et lien `symbol` ↔ classe (m-1) ; `source` épinglée et `trial_id` recomposé ; constantes (`runs_level`, `test_delta` = `spendDelta("0.05", 1)`, essai 1, `initial`, `none`) ; `epoch` = 1 ; `scale_table` `hour-of-week` à 168 ou 42 valeurs (m-3) ; `qhat` `-0` et `calib_support.min ≤ max` ; `n_min` = n0 ; `k_star` exact ; `u_test` exact au niveau du veto ; branche `under_calib` (colonnes calibrées nulles, raison `empty bucket` ou `n <n> below n0 <n0>`, veto faux) ; `p_served` = n − k\* ≥ rang split ; `marginal_alpha` ; `qhat` et `k_obs` de direction depuis (misses, k\*), `k_obs` = misses en bande ; `runs_miss` `empty` ssi `k_obs` ∈ {0, n} ; statut CALIB et raison dans l'ordre de FORMAT ; veto TEST conditionnel ; statut et raison égaux au recalcul (m-2) ; `retire` (grammaire `live:<k>` ou `adr:<fichier>.md`, comptes, règle binomiale sur `live:`, `epoch:` refusée) ; `bound_on` et `miss_bound` ; `recompute` lié à `scores_sha256`, vérificateur dans la liste épinglée, identité ≠ générateur ; bande : `qhat` normal, `bandEdge(qhat, min)` > 0, `bandEdge(qhat, max)` fini.
  - `guardKataTable(table, bytes, pins, expected)` (G-3) : `assertTableMatchesRegistry` de B1 avec l'entrée attendue, G-2 sur chaque ligne, clés `YYYY-MM` de `test.months` et `calib.status` égal au statut CALIB recalculé (m-1, m-2).
  - `vetoFires`, `verifierIdentity`.
- `apps/harness/src/policy-marginal.ts` (68 lignes) : `marginalClassEntries(text)` (USDe, liq, cascade) ; `marginalRow` (ligne `marginal` reconstruite depuis une `CommittedCalibration` et la ligne F-7 de `class-policy.ts` : rang split exact, quantile exact, `marginal_alpha`, `scores_sha256` dans l'ordre stocké, ordre `ascending` refusé si le tableau ne l'est pas, `trial_id` et `wave` nuls, liste fermée du bloc A) ; `assertLiqBandExact` (LIQ-BAND-EXACT-GUARD-1) ; `guardMarginalTable` (entrée attendue, lignes égales aux lignes reconstruites, garde liq).
- Tests : `apps/harness/test/policy-guard.test.ts` (10) et `apps/harness/test/policy-marginal.test.ts` (4), sur le registre synthétique de graine 37 de B1 (non régénéré) et sur `calibration.ts`.

**Écarts au G0, déclarés** : G-4 et G-5 entrent au lot a (section « Mesure au code » du G0, R-25 mesuré) ; la classe cascade prend `additive-band` (même section). Les tests prévus sont tous là, sous leurs noms ; `guard_modules_are_not_served` vise un import de `server.ts` vers `http.ts` (le tueur de B1 vise `version.ts`). Tueurs d'A-2 §5 couverts : tous, sauf celui de la vague 2 (G-6, lot b) et « a `calib_*` row defers » (chemin servi, CM-4b).

## Différences servies

**Aucune.** Les trois modules neufs ne sont importés par aucun module servi : `guard_modules_are_not_served` parcourt les imports relatifs depuis `server.ts`, `http.ts`, `openapi.ts`, `schema-projection.ts` et `tools/*.ts`. `calibration.ts`, `class-policy.ts`, `gate.ts` et les modules de B1 inchangés.

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR dans un dossier de travail propre)

- `node scripts/red-proof.mjs --base 7a0b1a49 --gel b85da486 --repo /home/user/monark-governance-b2c --draw 14 --seed 37` : **OK**, sortie 0 ; **14 jugés, tous new-module**, 0 inchangé ; **14 tueurs tirés, 14 tués** ; `RED-PROOF.json` sha256 `dd5ab367dcfe349e9ac39d2b4f27803973914f537066a22f0ac8785439f0b97b` (dépend des chemins du passage).
- Tueurs (forme fermée, un par test) : `policy-classes.ts:19 CONST "0.45"→"0.46"` ; `policy-guard.ts:101 SDL` (clés de `test.months`) ; `:55 CONST` (comparaison de `k_star` → `true`) ; `:62 CONST r.misses→r.k_obs` ; `:74 SDL` (statut et raison) ; `:70 CONST "region"→"silence"` (condition du veto) ; `:22 CONST toLowerCase→toUpperCase` (identité) ; `:92 ROR "> 0"→">= 0"` (bord de bande) ; `:40 SDL` (`source.wave`) ; `server.ts:31 CONST "./http.ts"→"./policy-guard.ts"` (graphe servi) ; `policy-marginal.ts:28 CONST "upper-bound"→"additive-band"` ; `:45 CONST` (empreinte sur une copie triée) ; `:66 SDL` (lignes reconstruites) ; `:57 CONST Number.MAX_SAFE_INTEGER→0` (strate s3).
- `tsc --noEmit` vert ; `eslint` (5 fichiers neufs) propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (343 fichiers) ; `lang:gate` OK.
- `npm test` complet, au gel : **2 244 tests, 2 222 verts, 22 sautés, 0 rouge**, test 42 compris (vert au premier passage), sortie 0.
- **Rejeu sur `wave1.json`** (`811fcd57…d9cb`, hors dépôt, script en dossier de travail puis effacé ; épingles : sha256 des octets, générateur `kata/bench/write-p2.ts@207f021f`, attestation synthétique `verifier-b`) : 280 cases lues, **280 lignes**, **32 tables sur 32** admises par `guardKataTable` avec l'entrée de `kataClassEntries` ; statuts : `silence` 276, `region` 2, `vetoed` 2.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs` contre `7a0b1a49`) : STAT **464** (+464/−0, 5 fichiers), borne du lot 547, borne de PR 1 205 ; CONTENT_STAT 0.

## Questions

Celles du G0, inchangées : **Q-1** (pour MONARK, zone de la garde des queues de la vague 2 : bloque le lot b, qui ne porte plus que G-6) ; **Q-2** (identité d'un vérificateur, lecture déclarée) ; **Q-3** (époque 1 et causes exemptées refusées tant qu'aucun journal n'est épinglé). Rappel de B1 (Q-3) : valeurs publiées des entrées hors registre (`source.*` des lignes kata et marginales, vérificateurs, textes de ligne et de classe), ligne datée de MONARK avant F-5a.
