# G2 delta — lot T-1a-ii-b1, pli -b1-2 (fold C-G2-1..8)

Relecteur G2 **delta BORNÉE**, instance **FRAÎCHE** (≠ générateur, ≠ G2 -b1), `claude-opus-4-8[1m]` effort max.
Worktree `F:\Monark-wt-bellb1`, branche `lot/t-1a-ii-b1`, HEAD **`3b0a92a`** (pli -b1-2 sur `c5d15a4`).
Périmètre = `git diff c5d15a4..3b0a92a` (**12 fichiers**). Aucun commit / aucun workflow (R-20). Sortie brute pour
l'orchestrateur, vérifiable (R-21). Offline : aucun RPC live, aucune variable d'env imprimée. Scratch `F:/tmp/g2-bellb1-2/`.

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` vérifié (Opus 4.8, 1M contexte, non banni), effort max.
Source : identité de l'environnement d'exécution de la session (2026-09-20).

## VERDICT : **CONFORME**

Le pli -b1-2 corrige les 8 items C-G2 à contexte localisé, sans débordement. Chaque correction est re-exécutée
first-hand ci-dessous (décodage, recompute sha, mutants rouges à restauration sha-exacte, oracles verts). `collect()`
intact (rejeu bit-identique vert) ; graphe linéaire (`c5d15a4` = parent direct de `3b0a92a` ⇒ 2-points = 3-points) ;
R-25 sous plafond ; périmètre = exactement les 12 fichiers déclarés ; CA-11 intact. Le verdict G7 et la vérification
adversariale restent à l'orchestrateur (R-21).

## Méthode (tout re-exécuté, TMP/TEMP/TMPDIR=F:/tmp)
Diff borné lu intégralement ; `npm run ci` **NON lancé** (consigne). effTs décodés first-hand depuis `spike-measures.json` ;
LF-sha recomputé par la méthode exacte du test (`sha256(readFileSync(utf8).replace(/\r\n/g,"\n"))`) ; 3 mutants plantés
(1b/3/4), rougis, restaurés par `git checkout 3b0a92a -- <f>` avec `git hash-object` re-comparé.

## Tableau par correction

| # | Attendu | Mesuré (first-hand) | Verdict |
|---|---|---|---|
| **C-G2-1** | `main()` abstient `rebase_unverified` sur mint illisible ; `collect()` inchangé (rejeu bit-identique vert) ; repro-A-after ; mutant 1b rouge + restauration sha-exacte | `collect.ts` : `const rebase: RebaseGate = rebaseForMint(mint);` + push inconditionnel `rebase`. `rebaseForMint(undefined)→rebaseGate(null,null)→{status:"unverified",residue:"rebase_unverified"}` (supply.ts:144,226-228, vérifié). `collect()` = lignes 90-204, **hors** des 2 hunks (import ~L20, `main()` @L422) ⇒ inchangé ; `bell_collector_replays_fixture_bit_identical` **vert**. `repro-A-after.mts` (importe le src du worktree) : AVANT `gT=-0.5753641449`, vwap 360, `rebase_unverified=0`, `no_quorum=1` ; APRÈS **abstain=rebase_unverified**, pas de gT, vwap 360 porté, `rebase_unverified=1`, `no_quorum=1`. **Mutant 1b** (`git checkout c5d15a4 -- collect.ts` = fail-open `... : undefined`) ⇒ `bell_mint_read_failure_abstains_fail_closed` **ROUGE** (SRC ne matche pas `/const rebase: RebaseGate = rebaseForMint\(mint\);/`) ; restauré blob `dd8c8992…` **SHA-EXACT**, arbre propre. (Preuve 1b = câblage/SRC ; `main()` non exécutable offline.) | **CONFORME** |
| **C-G2-2** | effTs décodés = ÉCHUS (décodage indépendant depuis `spike-measures.json`) | `spike-measures.json` `generated_at`=2026-09-19T23:53:40Z. effTs lus l.114/125/136/147 : TSLAx 0 ; SPYx **1781755200→2026-06-18T04:00Z** ; NVDAx **1789000200→2026-09-10T00:30Z** ; AAPLx **1786149000→2026-08-08T00:30Z**. Les 3 non-nuls < date de lecture ⇒ **PASSÉS/échus** (pas « future/pending »). Libellé corrigé dans `supply.ts`, `PROVENANCE-spike.md` (finding 5), `PLI` l.81. | **CONFORME** |
| **C-G2-3** | `readMintToken2022` fail-closed (multiplicateur STORED conservé) + procurement formé complet | Test `bell_mint_readout_preserves_scaled_fields` **vert** : `m.multiplier="1.0039"` (STORED verbatim) ≠ `m.newMultiplier="1.0057"` ; gate mutable ⇒ unverified. Procurement **PR-B-SPL-TOKEN2022** (ADR-T1aii) : quoi lire (3 sources nommées : solana-program-library `scaled_ui_amount`, `@solana/spl-token amountToUiAmount`, `spl.solana.com`), version (à épingler — **non devinée**), tentatives (`@solana/spl-token` absent — vérifié first-hand : pas de `node_modules/@solana`, **0** hit `spl-token` dans `package-lock.json`, **0** `scaledUiAmount`/`amountToUiAmount` transitif en `node_modules/*.js`), usage prévu, propriétaire (orchestrateur→mainteneur). Formé, zéro dette nue. | **CONFORME** |
| **C-G2-4** | Mutant 3 rouge | Garde `assertNoCloseLike` dans `aggregate()` ; `CLOSE_KEY` **byte-identique** à `digest.ts` (duplicat déclaré fidèle, aucun écart dans les deux sens) ; `isNumericLike` identique (nom de param près). **Mutant 3** (suppression de l'appel `assertNoCloseLike(st);`) ⇒ `bell_report_input_close_guard` **ROUGE** (« Missing expected exception ») ; restauré blob `c1416b97…` **SHA-EXACT**, propre. | **CONFORME** |
| **C-G2-5** | Mutant 4 rouge | `coverage.ts` `coverageDecision` : null→abstain `projection_not_computable` ; fits 3 budgets→full-population ; sinon top20 + `publishCoverageShare`. **Mutant 4** (retrait du conjoint `&& proj.days <= t.maxDays`) ⇒ `bell_c5_coverage_projection_over_threshold_top20` **ROUGE** (over3 renvoie `full-population` au lieu de `top20-per-chain`) ; restauré blob `a35ca727…` **SHA-EXACT**, propre. | **CONFORME** |
| **C-G2-6** | `spike-poc-discovery.json` déclaré dans series_pinned ; `raw_sha256: null` honnête | LF-sha recomputé (méthode du test) = `4dc927bb9d7ea71f9b825701a4dc933b6f8b64c559048488f529653ccbac696c` = **pin** de `PROVENANCE-spike.md` (identique). `series_pinned_are_declared_and_hashed` **vert** (le test **énumère** l'arbre `seriesWalk` ⇒ un orphelin/octet altéré rougirait ⇒ déclaration réellement imposée). JSON : `raw_sha256: null`, `measure_backed:false`, `raw_retained:false`, `reason_raw_absent` explicite + item C-G2-6 formé (re-mesure au go -b1-bis). Honnête. | **CONFORME** |
| **ADR (C-G2-8 incl.)** | SPLIT + -b1-bis + ordre décision 47 ; hypothèse C-G2-8 présente | ADR-T1aii **D1-ter** : variante **SPLIT** retenue, **FUSION écartée (C-2)** ; nouveau sous-lot **-b1-bis** avec Tuyaux (entrée/sortie/état/test) ; **ordre `-b1 → -b3 → -b1-bis → -b2a → -b2b`** = substance + séquence de décision 47 (`F:\Monark\docs\CHANTIERS.md`:106, option (a), g_t déplacée APRÈS -b3 en -b1-bis). ADR-B0 amendé (décision 47 + résumé folds). **C-G2-8** présente : docstring `rebaseGateFromMint` (supply.ts:155-157) + ADR-T1aii:133-134, clause « sauf découverte contraire », déférée -b3. | **CONFORME** |
| **Oracles** | suite ciblée 49/49 ; typecheck/lint/ratchet/lang/export verts ; pas de `npm run ci` | `npx tsx --test apps/bell/test/*.test.ts test/no-secret-in-repo.test.ts` = **49 pass / 0 fail** (dont les 4 neufs + `no_secret_in_repo`). `typecheck` rc=0 ; `lint` rc=0 ; `lint:ratchet` **69/69** ; `lang:gate` 0 hit (bell) ; `export:check` 0 chemin interdit / 0 FR ; `series_pinned` 1/1 ; `bell_collector_replays_fixture_bit_identical` vert. `npm run ci` non lancé (consigne respectée). | **CONFORME** |
| **R-25** | ≤ 1 205 sous STAT= de ci.yml, 96ca634..3b0a92a | Pathspec `STAT=` exact (ci.yml l.64) : `96ca634..3b0a92a` = **927 ins + 56 del = 983** ≤ **1 205** (2-points = 3-points, base ancêtre). Delta -b1-2 = 235 (8 fichiers comptés) = annexe PLI. Sous plafond ; > cible G0 700 de 283 (déclaré : `coverage.ts` + tests + garde rapport). | **CONFORME** |
| **Périmètre** | rien hors périmètre | **Exactement 12 fichiers**, tous sous `apps/bell/` ou `docs/`. Aucun `fleet/README/apps/site/contracts/schemas`. CA-11 intact (Bell reste `upcoming`, aucune surface servie touchée). HEAD `3b0a92a` inchangé ; arbre **propre** après restauration sha-exacte des 3 mutants. | **CONFORME** |

## Mutants (rouges par construction, restauration sha-exacte, `git hash-object` re-comparé)

| # | Corr. | Mutation | Test | Résultat | Restauration |
|---|---|---|---|---|---|
| 1b | C-G2-1 | `collect.ts` → `c5d15a4` (fail-open `mint ? … : undefined`) | `bell_mint_read_failure_abstains_fail_closed` | **ROUGE** (SRC ne matche pas `rebaseForMint(mint)`) | `dd8c8992…` SHA-EXACT, propre |
| 3 | C-G2-4 | retrait appel `assertNoCloseLike(st);` | `bell_report_input_close_guard` | **ROUGE** (Missing expected exception) | `c1416b97…` SHA-EXACT, propre |
| 4 | C-G2-5 | retrait conjoint `&& proj.days <= t.maxDays` | `bell_c5_coverage_projection_over_threshold_top20` | **ROUGE** (full-population vs top20) | `a35ca727…` SHA-EXACT, propre |

## Observation (HORS périmètre borné, transmise à l'orchestrateur — non bloquante)
La chaîne d'ordre de **décision 47** dans `F:\Monark\docs\CHANTIERS.md`:106 annote « **-b1 (fusion)** → -b3 → -b1-bis
→ … » alors que (a) la prose de la même décision décrit un arrangement SPLIT (-b1 = corrections+spike+découverte+
décomptes+abstention, **aucune g_t** ; g_t déplacée APRÈS -b3 en -b1-bis) et (b) l'ADR sous revue déclare la FUSION
**écartée** (C-2) et la SPLIT retenue. La séquence des sous-lots est identique dans les deux ; « (fusion) » est un
artefact de rédaction de CHANTIERS.md (fichier **hors** des 12 du périmètre), pas un défaut de l'ADR revu — l'ADR
capture fidèlement la substance et l'ordre de décision 47. À aligner par l'orchestrateur au prochain toucher de CHANTIERS.

Réviseur : G2 delta FRAÎCHE `claude-opus-4-8[1m]` effort max · HEAD `3b0a92a` · base `c5d15a4` · 2026-09-20.
