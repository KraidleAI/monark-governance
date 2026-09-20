# CHECKPOINT-2 — lot T-1a-ii-b3a (Bell : trajectoire Token-2022 ScaledUiAmount, scan d'autorité décision 60, gate 3 états, résiduels, g_t par action) — acceptation du LIVRABLE

Validateur-humain `claude-fable-5-1` (R-1 ; effort high), 2026-09-20. Contexte frais : artefacts seuls, jamais le fil du worker.
Worktree `F:\Monark-wt-bellb3a`, branche `lot/t-1a-ii-b3a`, HEAD `c4b3dc2` (base `3315ea7`, gel `1925736`, G2 `c5c01bf`, pli -b3a-4 `c4b3dc2`) ; cible `lot/etude-suite` `024f63d`.
Preuve AM-2 ter : `git status --porcelain` = 0 ligne et HEAD `c4b3dc2` AVANT et APRÈS tous mes rejeux ; aucun octet écrit dans le dépôt, aucun `git` mutatif, aucun RPC, aucune clé lue. Chemin de rejeu : `F:/tmp/cp2-b3a/src` (`git archive c4b3dc2`, `npm ci --cache F:/tmp/npm-cache`, TEMP/TMP/TMPDIR=F:/tmp) ; script mutants `F:/tmp/cp2-b3a/mut.mjs` ; harnais fail-open exécuté puis supprimé de la copie.

## DÉCISION : ACCEPTE-AVEC-CORRECTIONS (C-V-1..C-V-4, liste fermée ; C-V-1 et C-V-2 = docs + items formés AVANT G7 ; aucune n'exige de code dans ce lot — l'édition du commentaire `collect.ts` de C-V-2 est DIFFÉRÉE à l'item, pour que R-25 reste 1 191)

## 1. Artefacts lus
`docs/G0-lot-t1a-ii-b3.md` (+C-1..C-12) ; `docs/CHECKPOINT1-lot-t1a-ii-b3a.md` ; `docs/PLI-lot-t1a-ii-b3a.md` (+annexes -b3a-2/-b3a-3, pli -b3a-4) ; `docs/G2-lot-t1a-ii-b3a.md` ; `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` (D1-quater) ; `docs/biblio/bell/L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md` ; `apps/bell/src/{rebase-trajectory,rebase-scan,supply,residuals}.ts`, `collect.ts` (l.95-170, 390-510), `gap.ts` (l.75-112), `digest.ts` (l.50-80) ; `apps/bell/test/{rebase-trajectory,rebase-scan,rebase-gate-gt,rebase-course}.test.ts`, `collect.test.ts` (l.59, 75, 480-500) ; séries `rebase-TSLAx.json`, `rebase-SPYx.json` (intégral), NVDAx/AAPLx (structure par script), `PROVENANCE-rebase-course.md` ; `docs/CHANTIERS.md` décisions 47, 55, 56, 60 ; `.github/workflows/ci.yml` l.65 ; diff `c5c01bf..c4b3dc2`.

## 2. Re-mesures (CA-9, toutes reproduites par moi en copie froide)
| Mesure | Attendu | Re-mesuré | Verdict |
|---|---|---|---|
| tests `apps/bell/test/*` | 69/69 | 69 pass / 0 fail | OK |
| + `test/no-secret-in-repo` + `test/ci-gates` | verts | 95 pass / 0 fail (`bell_no_secret_in_repo`, `series_pinned_are_declared_and_hashed`, `no_secret_in_repo` verts) | OK |
| `gate:vocab` | 171 OK | 171 fichiers, no forbidden claim | OK |
| `typecheck` / `lint` | 0 / 0 | 0 / 0 | OK |
| `lint:ratchet` | 69/69 | 69/69 | OK |
| `lang:gate` / `export:check` | 0 / 0 | 0 hit (bell GATED) / 0 chemin interdit, 0 hit | OK |
| R-25 (`STAT=` exact ci.yml l.65, `3315ea7..c4b3dc2`) | 1 191 ≤ 1 205 | 1 137 ins + 54 del = 1 191, 15 fichiers (PROVENANCE .md compté, 4 json exclus) ; marge 14 | OK |
| `PINNED_BELL_SHA` | `126abfae…` | `collect.test.ts:59` = `126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3` ; test bit-identique vert | OK |
| sha256 LF des 4 séries | = PROVENANCE | TSLAx `bd68590c…b998`, SPYx `43243b87…1d9b`, NVDAx `f2776fe6…161a`, AAPLx `02b37ecf…2a43` = PROVENANCE (LF = brut) | OK |
| `git merge-tree --write-tree 024f63d c4b3dc2` | propre | exit 0, arbre `308ff929…`, merge-base = `3315ea7` | OK |
| secrets / clés close-like dans séries + PROVENANCE | 0 | api-key/UUID/URL = 0 ; close/adv/g_t/gT/gap/vwap = 0 | OK |
| registres publics | Bell absent | `fleet.ts` 0 ; README l.33 « labelled » (substring) ; site 2 substrings (« labelled », « embellished ») ; skills 0 | OK |
| séries : invariance d'autorité, `scan_complete`, `overwritten_pending`, gate | 4/4 | TSLAx 1 ev `constant` ; SPYx 9, NVDAx 11, AAPLx 11 `trajectory_known` ; `initialize_authority == oracle.authority` x4 ; `c3_final_state_ok` x4 ; `overwritten_pending` 0 x4 | OK |

### Mutants rejoués (5, copie froide ; restauration `cp` depuis pristine, sha LF avant = après ; jamais `git checkout`)
| # | mutation | fichier (sha pristine) | test tueur | résultat |
|---|---|---|---|---|
| M6 | breakpoint effTs retiré (`constantMultiplierOver`) — C-1 | rebase-trajectory.ts `b831c087…` | `bell_rebase_constant_needs_trajectory` | KILLED (1 fail) |
| M12 | `* m` → `/ m` (`gap.ts` l.103) — C-7 | gap.ts `9dd168af…` | `bell_gt_rebase_direction_m2` (+3 autres) | KILLED (4 fails) |
| CPI | entrelacement → ancien concat top-level puis inner — C-G2-1 / -b3a-4 | rebase-scan.ts `1c993525…` | `bell_rebase_scan_cpi_ordered_after_parent` | KILLED (1 fail) |
| M-r1 | émission des résiduels d'autorité neutralisée — décision 60 | supply.ts `b7352581…` | `bell_rebase_authority_residuals_named_and_gated` + `…course_replays_bit_identical` | KILLED (2 fails) |
| M8 | `maxSupportedTransactionVersion` → 0 — C-5 | rebase-scan.ts `1c993525…` | `bell_rebase_scan_tx_version_1` | KILLED (1 fail) |
Restauration prouvée : 5/5 restored=true ; shas LF du worktree = pristine (`b831c087`, `1c993525`, `b7352581`, `9dd168af`, `580575ca`).

### Harnais de fail-open (chemin servi, copie froide ; fonde C-V-2)
`buildSolanaSymbol(call, providers, tok, pool, window, …, trajectory = {events: [init m=1 ; update m=1,5 replié in-window], scanComplete: true})` avec un stub où les DEUX opérateurs lisent le mint à `multiplier "1", newMultiplier "1", effTs 0` ⇒ `sym.rebase.status = "trajectory_known"` (mint lu = 1). Le chemin servi croit le `scanComplete` du fichier et ne compare jamais `replayTriplet(events)` à l'état lu (`collect.ts` l.442-444 : `trajectory && mint ? rebaseGateFromTrajectory(…) : rebaseForMint(mint)` — la lecture live n'est qu'un test de présence, en `jsonParsed`, donc pas bit-exacte).

## 3. Jugement par pièce
- C-1 (`constant` sur trajectoire, rejeu depuis Initialize, breakpoints effTs) : conforme — `constantMultiplierOver` échantillonne bornes, blockTimes et effTs in-window ; `rebaseGateFromMint` renvoie toujours `unverified` ; M6 tué. Cas réel attrapé : SPYx passe `trajectory_known` en fenêtre par un effTs 2025-10-31T23:55Z (m@23:59:59 = 1.00099942056, bits `22ece9f7…`) — exactement le motif visé par C-1.
- C-2 (json/base58, CPI, ordre (slot,index), blockTime null fail-closed, f64 hex) : conforme après -b3a-4 (CPI entrelacées après leur parent, groupes hors-plage ajoutés jamais perdus, vecteur mixte même-mint ; mutant CPI tué) ; `same_slot_order_undecidable` fail-closed.
- C-3 (oracle d'état final quorum-2 sur bits) : conforme dans `scanMultiplierEvents` (`pinOracleState` base64 sur 2 opérateurs, S = min, `finalStateOk` ; M9 rejoué par G2) et dans les 4 séries (`replayTriplet` == `oracle_triplet` bits). NON porté sur le chemin servi `main()` — C-V-2.
- C-4 (coût, sonde avant corps, clé de quorum corps = événement décodé) : conforme — `bodyEventKey` (sig|slot|mint|bits|effTs|kind), test `body_quorum` ; budget écrit avant les corps ; full-mint réfuté par mesure (~5,34 M cr) ; réel 6 323 cr Helius / 4 042 appels Chainstack, sous décision 56 (1 M / 200 k).
- C-5 : conforme — `MAX_TX_VERSION = 2` (`rpc.ts:56`) réutilisé ; M8 tué. Observation G2 (le test ne fige pas « 2 ») : non exigé.
- C-6 (injectable + C-V-3 + smoke, puis course) : conforme — `bell_symbol_build_mint_quorum_fail_unverified` (mint no-quorum ⇒ unverified, 0 gT) ; smoke hors dépôt déclaré.
- C-7 (÷ m par fill) : conforme — `gap.ts` l.103 somme(|b|·m) au dénominateur ; direction m=2 ⇒ g_t=0 ; `multiplier_before_vwap` numérique ; défaut -b1 `constant m≠1` corrigé ; M12 tué.
- C-8 (R-25) : 1 191 ≤ 1 205, seam non invoqué ; marge 14 lignes ⇒ mes corrections sont docs-seules.
- C-9 / C-11 / C-12 : E-1/E-3 clos par argument ; E-2/E-4/E-5/E-6/E-7 avec déclencheur + propriétaire ; MAST + rejeu circulaire + upgrade ; `SetAuthority` = résiduel nommé.
- C-10 / CA-11 : flag `--rebase-trajectory` consommé par `main()` (l.484-491) — mais producteur absent et composition non rejouée — C-V-1.
- Décision 60 : invariance d'autorité testée par mint ; résiduels `authority_scan_mono_operator` + `set_authority_unscanned` dans l'enum fermé, requis sur `trajectory_known` sous `scanMethod="authority"` (M-r1 tué) ; TSLAx `constant` sans résiduel, déclaré. Réserve `scanMethod` non passé par `main()` = item formé (ADR l.280-282), conforme comme item ; fusionne avec C-V-2. Ratification investisseur « due au retour » = ouverte (C-V-4).
- C-G2-1 / C-G2-2 : pliés (-b3a-4 : code + vecteur ; item runner non épinglé au PLI).
- Décision 47 : aucune g_t fondatrice — séries sans clé g_t/gap/vwap/close ; g_t rebase-aware sur fixtures synthétiques seules.

## 4. Checklist CA
- CA-6 conforme : oracle d'exécution non-LLM rejoué par moi (69/69, 95/95, 5 mutants) ET revue G2 fraîche (`claude-opus-4-8[1m]`, 9 mutants, 432/432) — jamais l'un sans l'autre.
- CA-7 accepté-avec-corrections : items formés partout (E-n, runner, `gate.residuals`, `scanMethod`, débits, complétude à l'échelle) ; manquent : producteur/composition du tuyau gate → g_t (C-V-1), ancrage C-3 du chemin servi (C-V-2), ratification décision 60 consignée ouverte (C-V-4).
- CA-8 accepté-avec-corrections : modèles résolus (worker `claude-opus-4-8[1m]`, G2 idem en instance séparée, validateur `claude-fable-5-1`) ; `error_origin` assignés pour « constant m≠1 » (rédacteur -b1) et « full-mint réfuté » (orchestrateur) ; manque `error_origin` de C-G2-1 (ordre CPI) + pins PLI périmés après -b3a-4 (C-V-3).
- CA-9 conforme : indépendance imposée par le système — copie froide, mes shas, mes mutants, mon harnais.
- CA-10 conforme : aucun argument de vitesse ; lot sous plafond, seam déclaré.
- CA-11 accepté-avec-corrections : rien de déclaré « built » (ADR l.207-210 : `upcoming`, consommateur servi = -b1-bis) ; Bell absent des registres ; MAIS la ligne tuyau gate → g_t « branché dans `main()` » (ADR l.203) surdéclare : (i) aucun producteur in-repo n'écrit la forme `{symbol: {events, scanComplete}}` (`runRebaseScanCli` s'arrête au probe ; `scanMultiplierEvents` n'a que des appelants de test ; les séries committées sont per-fichier en `scan_complete` snake_case, non chargeables par `loadTrajectories`) ; (ii) `loadTrajectories` n'a aucun appelant de test ; `buildSolanaSymbol` n'est testé qu'avec `trajectory = undefined` (`rebase-gate-gt.test.ts:107`) ; la « preuve de câblage » `collect.test.ts:494-498` est une regex sur le source ; `bell_gt_trajectory_known_integration` construit le gate à la main et saute la composition. Sous la clause de repli de C-10 (« sinon état = fixture, dit tel quel »), l'état honnête est « flag consommé ; producteur ABSENT ; composition non rejouée », pas « branché ».
- CA-2 : pas d'ESCALADE — aucune décision de valeur/périmètre nouvelle ; méthode hybride moins chère sans sacrifice de périmètre, budget dans la décision 56 ; la ratification investisseur de la décision 60 reste due (item, pas escalade : déjà annoncée « au retour »).
- CA-1/3/4/5 : n-a au checkpoint-2 ; G0 amendé respecté livrable par livrable (L-5 faite sous décision 60 ; rapport `--rebase` reporté à -b1-bis avec item).

## 5. Corrections (liste fermée)
- C-V-1 (CA-11 ; ADR D1-quater tuyaux l.203 + PLI section Branchement ; docs seules, R-25-exclues) : la règle Branchement (investisseur 2026-09-19) dit qu'une pièce n'est branchée que si son chemin servi « est couvert par un test d'intégration non-LLM qui rejoue la composition de bout en bout » — mon C-10 du checkpoint-1 en était une sous-spécification ; C-V-1 applique la clause elle-même. réécrire l'état du tuyau gate → g_t en « flag `--rebase-trajectory` consommé par `main()` ; producteur ABSENT (aucun code n'émet `{symbol: {events, scanComplete}}`) ; composition fichier → `loadTrajectories` → `buildSolanaSymbol` → gate → `sessionGapRebase` NON rejouée (preuve actuelle = regex + gate construit à la main) » et former l'item : producteur (extension de `runRebaseScanCli` ou export des séries au format d'entrée, `scanMethod` porté) + test d'intégration non-LLM qui EXÉCUTE la composition depuis un fichier ; déclencheur : G0 -b1-bis, AVANT toute g_t fondatrice ; propriétaire orchestrateur.
- C-V-2 (fail-open C-3 sur le chemin servi ; `collect.ts` l.440-444 ; docs + item, code au choix de l'orchestrateur) : le commentaire « a scanned trajectory is trusted ONLY with a live mint read (the C-3 oracle anchor) » est vrai pour sa première moitié (mint absent ⇒ `rebaseForMint`) et FAUX pour la parenthèse, qui est la partie porteuse : la lecture live est un test de présence, pas un ancrage C-3 (harnais section 2 : fichier contradictoire + `scanComplete: true` ⇒ `trajectory_known`) — corriger l'ADR maintenant (l'édition du commentaire `collect.ts` = 1-2 lignes comptées R-25, différée à l'item) ; `error_origin` proposé pour le G7 : rédacteur -b3a (câblage L-3/C-10), avec sous-spécification du checkpoint-1 consignée en section 7 ; former l'item « ancrage C-3 dans `buildSolanaSymbol` : `getAccountInfo` base64 quorum-2, `replayTriplet(trajectory.events)` == triplet lu SUR LES BITS sinon `rebase_unverified` ; `scanMethod` passé pour que les résiduels décision 60 soient émis (fusion avec la réserve ADR l.280-282) » ; déclencheur : AVANT toute g_t fondatrice de -b1-bis ; propriétaire orchestrateur. Si le code est voulu maintenant : pli `-b3a-5` explicite ; R-25 marge 14 lignes ⇒ seam probable, à mesurer.
- C-V-3 (CA-8, provenance) : (a) PLI section sha256 périmée après -b3a-4 — `rebase-scan.ts` `7f7cd4c7…` → `1c9935258ab095a5…`, `rebase-scan.test.ts` `5efb9f6e…` → `1cccded721cc23ab…` (LF, worktree) ; (b) `error_origin` de C-G2-1 (ordre CPI) à assigner au G7 / JOURNAL-PROVENANCE (proposition G2 : rédacteur -b3a L-2) ; (c) entrée journal datée du lot.
- C-V-4 (décision 60) : consigner au G7 « ratification investisseur de la méthode hybride = OUVERTE » (séries : `method: "hybrid-authority-scan (pending R-26 ratification)"`), `error_origin` orchestrateur si renversée ; ne pas présenter la décision 60 comme close.

## 6. Décision
ACCEPTE-AVEC-CORRECTIONS C-V-1..C-V-4. Fusion sur `lot/etude-suite` admissible une fois C-V-1/C-V-2 (docs + items) et C-V-3 pliés ; C-V-4 = ligne du G7. Pas d'ESCALADE-INVESTISSEUR. Les corrections ne contredisent pas le G2 (qui a lui-même réservé `scanMethod` non servi et déclaré `upcoming`) ; elles resserrent l'énoncé du tuyau et nomment un fail-open non déclaré sur le chemin que -b1-bis consommera.

## 7. AM-1 — attrapé / manqué
- Attrapé : (1) tuyau gate → g_t surdéclaré « branché » alors que producteur absent et composition jamais exécutée (preuve = regex) ; (2) fail-open C-3 sur le chemin servi (`scanComplete` cru, aucun rejeu vs état lu), prouvé par harnais ; (3) pins PLI périmés après -b3a-4 ; (4) `error_origin` C-G2-1 non assigné ; (5) ratification décision 60 encore ouverte dans les séries. Rejoués moi-même : 69/69, 95/95, R-25 1 191, sha x4, merge-tree, 5 mutants.
- Manqué par ma propre checklist au checkpoint-1 (à consigner) : C-10 a accepté « flag consommé par `main()` + test C-V-3 » comme preuve de branchement sans exiger un producteur ni un test qui EXÉCUTE la composition ; C-3 a été exigée dans le scan mais pas dans le chemin servi. Amendement à proposer à l'investisseur : CA-11 exige pour tout tuyau « branché » un test qui exécute la composition de bout en bout depuis l'artefact d'entrée, jamais une assertion sur le texte source.

## 8. Modèle résolu (R-1)
`claude-fable-5-1` (Fable 5.1, effort high). Biais d'affinité Fable/Fable déclaré, mitigé (contexte frais, checklist fermée, re-exécution imposée par le système). Avis = acceptation, pas verdict (G7 orchestrateur en place).
