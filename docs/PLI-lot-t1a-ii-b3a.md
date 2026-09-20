# PLI — lot T-1a-ii-b3a (Bell : trajectoire du multiplicateur, gate rebase-aware, g_t rebase-aware sur fixtures)

Worker G1, base `3315ea7`, worktree `F:\Monark-wt-bellb3a` (branche `lot/t-1a-ii-b3a`). G0 qui fait foi :
`docs/G0-lot-t1a-ii-b3.md` + amendement checkpoint-1 C-1..C-12 (`docs/CHECKPOINT1-lot-t1a-ii-b3a.md`). Aucun
commit, aucun workflow (R-20). TMP/TEMP/TMPDIR=F:/tmp ; scratch `F:/tmp/bell-b3a/` ; bruts hors dépôt
`F:\PRODUITS\etude-2026-09-20\bell-b3a-raws\` (sha-pinnés, ToS collé dans `PROVENANCE-b3a.md`).

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max). Déclaré en première ligne de session.

## Contexte C-V-2 (prérequis des corps, propriétaire orchestrateur)
Le coût crédit/appel de `getTransactionsForAddress` (méthode « corps » deux étages, C-4) est **NON TROUVÉ** dans la
doc Helius (`RESSOURCES-HELIUS-2026-09-19.md` l.12 : « à mesurer au spike... compter les crédits dans Usage ») ;
`spike-measures.json` `credit_model` le confirme (« gTfA : credit/call to confirm via Usage dashboard [item] »).
⇒ **C-V-2 = mesure Usage dashboard = prérequis AVANT tout appel de corps** ; la course L-5 est **différée**
(consultation formée ci-dessous), jamais un contournement.

## Livrables (liste fermée du G0) — état
| # | Fichier | État | Tests |
|---|---|---|---|
| L-1 | `apps/bell/src/rebase-trajectory.ts` (nouveau) | FAIT | `bell_rebase_replay_rule_ge`, `bell_rebase_replay_overwrite_counts`, `bell_rebase_decoder_layouts_distinct`, `bell_rebase_constant_needs_trajectory`, `bell_rebase_replay_triplet_reproduces_stored_state` |
| L-2 | `apps/bell/src/rebase-scan.ts` (nouveau) + `--rebase-scan` dans `collect.ts main()` + `slot` sur `SigInfo` (`rpc.ts`) | FAIT (module + probe ; corps différés C-V-2) | `bell_rebase_scan_replays_fixture_bit_identical`, `bell_rebase_scan_state_divergence_is_unverified`, `bell_rebase_scan_budget_fail_closed`, `bell_rebase_scan_tx_version_1`, `bell_rebase_scan_body_quorum` (C-4(iii)), `bell_rebase_scan_band_divergence`, `bell_rebase_scan_base58_decode_roundtrip` |
| L-3 | `apps/bell/src/supply.ts` (gate 3 états + `rebaseGateFromTrajectory` ; C-1/C-12 `rebaseGateFromMint`→unverified) + `buildSolanaSymbol` injectable (`collect.ts`) | FAIT | `bell_rebase_gate_three_states`, `bell_rebase_gate_from_mint_needs_trajectory`, `bell_symbol_build_mint_quorum_fail_unverified` (C-V-3 offline), + smoke `main()` mint forcé en échec |
| L-4 | `apps/bell/src/gap.ts` (`sessionGapRebase`, C-7 ÷ m) + `digest.ts` (`multiplierUsed`) + branche `trajectory_known`/`constant m≠1` (`collect.ts`) + flag `--rebase-trajectory` consommé (C-10) | FAIT | `bell_gt_rebase_direction_m2`, `bell_gt_multiplier_before_vwap`, `bell_gt_constant_m_neq_1_defect`, `bell_gt_trajectory_known_integration` |
| L-5 | course de trajectoire sur les 4 mints | **NON LANCÉE** — sonde faite ; corps bloqués sur C-V-2 (consultation formée) | sonde `rebase-probe-*.json` (hors dépôt, sha-pinnés) |
| L-6 | ADR D1-quater + ce PLI | FAIT | doc |

## Touched set (12 fichiers ; séries/docs exclues R-25)
Modifiés (tracked) : `apps/bell/src/{collect,supply,gap,digest,rpc}.ts`, `apps/bell/test/{bell,collect}.test.ts`.
Nouveaux : `apps/bell/src/{rebase-trajectory,rebase-scan}.ts`, `apps/bell/test/{rebase-trajectory,rebase-scan,rebase-gate-gt}.test.ts`.
Docs (exclus R-25) : `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` (+D1-quater), `docs/PLI-lot-t1a-ii-b3a.md`.

## R-25 — pathspec UNION `STAT=` de `.github/workflows/ci.yml` l.65 (vs `3315ea7`)
`git diff --numstat 3315ea7` sous la pathspec (séries `apps/bell/test/fixtures/series/**` + `docs/**/*.md` +
`package-lock.json` + `fixtures/**` exclus) :
```
collect.ts 78/20 · digest.ts 4/1 · gap.ts 33/0 · rpc.ts 2/2 · supply.ts 27/15 · bell.test.ts 3/3 · collect.test.ts 16/12   = 163 ins + 53 del = 216 (tracked)
rebase-trajectory.ts 163 · rebase-scan.ts 243 · rebase-trajectory.test.ts 104 · rebase-scan.test.ts 146 · rebase-gate-gt.test.ts 115 = 771 (nouveaux)
```
**Total = 987 lignes < plafond 1 205 ⇒ PAS de seam invoqué.** (Cible 700 dépassée, anticipé C-8 : « 700 irréaliste ».)
Estimation par livrable (collect.ts réparti) : L-1 ≈ 267, L-2 ≈ 409 (band + body-quorum inclus), L-3 ≈ 121, L-4 ≈ 190.
**Seam `-b3a-2` déclaré (C-8) NON invoqué** ; l'extension rapport `bell-report.mjs --rebase` et la course L-5 sont
reportées non pour R-25 mais faute de données de course (C-V-2) — voir items.

## sha256 (LF) des fichiers NOUVEAUX (provenance ; = shas pristine post-mutant-sweep, restauration prouvée)
```
rebase-trajectory.ts       b831c0877b85053667aa047522f42ada7dd8721392fb5c9873abcc9fac739c18
rebase-scan.ts             7f7cd4c7e31b6de655e4811fde711f31a181d3018e546d8c8ccbd102e974ac54
rebase-trajectory.test.ts  69b8bca2d0fb3eaaf1d7f861f4fa1437680ff1c2d6e4d086aa38ac04c308ceee
rebase-scan.test.ts        5efb9f6e601ac8a0705b20e8065d989b7dbe27b649eb0b77f31285cc734e36b0
rebase-gate-gt.test.ts     bdeaab7aa7752a41bc3b71fe4c5206fed07cdaf36df6d8df14c2ff1bf61f01cb
```

## Mutants (14, rouges par construction ; restauration cp → sha identique à pristine ; PAS de `git checkout`, R-20)
Sweep `F:/tmp/bell-b3a/mut/sweep2.sh` — restauration vérifiée byte-identique (`pristine.sha` == `after.sha`).
| # | mutation | fichier | test tueur | résultat |
|---|---|---|---|---|
| M1 | `>=`→`>` (lecture) | rebase-trajectory | rule_ge | KILLED |
| M2 | `>=`→`>` (repli) | rebase-trajectory | rule_ge | KILLED |
| M3 | offset décodeur update | rebase-trajectory | decoder_layouts | KILLED |
| M4 | offset décodeur état | rebase-trajectory | decoder_layouts | KILLED |
| M5 | `overwritten_pending` neutralisé | rebase-trajectory | overwrite_counts | KILLED |
| M6 | breakpoint effTs supprimé | rebase-trajectory | constant_needs_trajectory (spike-and-revert) | KILLED |
| M7 | filtre mint (anti-contamination) retiré | rebase-scan | replays_fixture | KILLED |
| M8 | `maxSupportedTransactionVersion` 0 | rebase-scan | tx_version_1 | KILLED |
| M9 | `finalStateOk` toujours vrai | rebase-scan | state_divergence | KILLED |
| M10 | `BudgetExceededError` avalé | rebase-scan | budget_fail_closed | KILLED |
| M11 | `trajectory_known` accordé si `overwritten>0` | supply | gate_three_states | KILLED |
| M12 | `g_t` × m au lieu de ÷ m | gap | direction_m2 | KILLED |
| M13 | `multiplierUsed` retiré | collect | trajectory_known_integration | KILLED |
| M14 | re-lecture corps op B sautée | rebase-scan | body_quorum (C-4(iii)) | KILLED |

## Sonde (L-2/L-5 gate ; first-hand, quorum-2 helius+chainstack ; bruts hors dépôt sha-pinnés)
`PROVENANCE-b3a.md` (raws dir : p1/p2 PRÉ-fix, p3 POST-fix band, p4 labels corrigés). Sortie CLI = domaines +
compteurs seuls (aucune url/clé ; leak scan = 0 sur tous les logs/raws).
- **Validé LIVE** : `getAccountInfo(base64)` + locateur TLV (`account_type`@165, TLV@166, type 25, 56 o) +
  `decodeStateConfig` sur les comptes réels (678 o) + le chemin pin/bande/concordance — oracle-slot pinné chaque run.
  **NON validé live** (vecteurs hors-ligne seuls, corps différés C-V-2) : `eventsFromTx`, le quorum des corps, le rejeu sur corps réels.
- **Défaut de sonde corrigé (R-21)** : les runs PRÉ-fix (p1 flaky, p2 tous no_quorum à 80 pages) étaient un
  **artefact du code de sonde, PAS une divergence d'opérateurs** : (a) `quorum2` renvoyait la valeur du PREMIER
  opérateur ⇒ `S = slot_helius`, pas `min(slotA,slotB)` (le commentaire disait « min ») ; (b) coupe par NOMBRE de
  pages puis filtre `slot<=S` ⇒ extrémité profonde en dents de scie ⇒ sha d'ensemble divergent. **Corrigé** :
  lecture explicite des DEUX opérateurs, `S = min`, concordance sur la **bande settled `[bandLo,S]`** ; `reached_genesis`
  calculé sur l'énumération BRUTE (le p3 le calculait sur la liste filtrée ⇒ faux positif SPYx, corrigé en p4).
- **Re-mesure POST-fix (p4, `--max-pages 3`)** : **les 4 mints concordent** (mêmes 3 pages auparavant flaky) ⇒
  artefact levé. Le `concord=false` de SPYx au p3 était **TRANSITOIRE** (une tx tombée entre les deux lectures
  d'opérateur, tête de bande non settlée), PAS une divergence persistante (p4 : SPYx `concord=true`) ⇒ un mint à
  ~3000 sig/quelques heures peut skewer en tête ⇒ l'**oracle d'état final C-3 est le backstop robuste** (C-4(iv)) +
  quorum des corps par événement (C-4(iii)) ; la concordance d'ensemble des signatures n'est pas le socle.
- **`reached_genesis=false` pour les 4** (cap 3 pages) ; `band_deepest_blocktime` = **2026-09-20** (les 3000 plus
  récentes couvrent seulement les dernières HEURES) ⇒ mints extrêmement actifs ⇒ scan complet jusqu'à l'Initialize
  (2025-06) = énumération profonde volumineuse (confirme C-4 « coût dominé par l'activité du mint »).
- **Budget corps** (écrit AVANT les corps, C-4) : par mint, `getTransaction` quorum-2 = **2·N crédits** (N ≥ 3000
  plancher, réel bien supérieur) ; `gTfA full` = **⌈N/1000⌉ pages** à **crédit/page INCONNU (C-V-2)**. ⇒ décision
  de budget **impossible sans C-V-2** ⇒ **course L-5 arrêtée, consultation formée**.

## CONSULTATION FORMÉE (R-26 ; worker → orchestrateur ; décision AVANT toute course L-5)
Problème (une phrase) : lancer la course de trajectoire des 4 mints exige (a) le crédit/appel `gTfA` (C-V-2, Usage
dashboard, propriétaire orchestrateur) pour chiffrer les corps, et (b) une méthode de complétude fiable — la
concordance d'ENSEMBLE des signatures, même corrigée en bande settled, laisse une divergence résiduelle réelle
(SPYx, mesuré p3). Tentatives : sonde quorum-2 signatures-seules ×3 ; l'artefact de coupe (S=premier opérateur +
cap par nombre) corrigé par la bande settled (p3 : 3/4 concordent) ; oracle d'état + décodeurs validés first-hand.
Options (à trancher par l'orchestrateur, non par le worker) :
1. **Mesurer C-V-2** (Usage dashboard avant/après 1 page `gTfA full`) PUIS méthode « complétude par chunks de
   slot settlés (marge sous la tête) + oracle d'état final C-3 » ; budget écrit, puis course.
2. **Complétude par l'oracle C-3 (backstop dominant, C-4(iv))** : `gTfA full` un opérateur (Helius) pour les corps,
   candidats 43/x relus quorum-2 sur Chainstack (clé = événement décodé, C-4(iii) — implémenté + testé
   `bell_rebase_scan_body_quorum`), la complétude PROUVÉE par le rejeu = état final lu (C-3), la concordance
   d'ensemble des signatures (résiduellement divergente sur SPYx) n'étant pas requise. Reste conditionné à C-V-2.
3. **Reporter L-5** à -b1-bis (qui consomme déjà la trajectoire) : le code de scan + probe est livré et testé
   hors ligne ; la course y est lancée quand C-V-2 est mesuré. (Recommandation du worker : option 2 sur budget
   C-V-2, sinon option 3 ; aucune course lancée d'ici là — budget préservé, ~690 appels de sonde total
   (p1 32 + p2 594 + p1b 32 + p3 32) + 8 smoke.)

## Smoke live `main()` mint forcé en échec (C-6, hors dépôt `F:/tmp/bell-b3a/smoke-out`)
Ordre : la sonde signatures (L-2/L-5 gate) a précédé ce smoke ; C-6 exige le smoke avant la **course** L-5 (jamais
lancée), pas avant la sonde — respecté. `BELL_SOLANA_RPC` = 2 hôtes injoignables, opérateurs distincts
(`*.helius-rpc.com`, `*.core.chainstack.com`), `--max-calls 20`. Résultat : **exit 0**, `calls=8/20`,
`providers=helius-rpc.com,chainstack.com` (domaines seuls), `no_quorum=4`, **0 gap, aucun gT** (fail-closed) ; leak
scan (api-key/UUID/hex-path/url) = 0. La cartographie précise « mint échoué MAIS fills présents ⇒ rebase_unverified,
aucun gT » est prouvée par le test offline `bell_symbol_build_mint_quorum_fail_unverified` (C-V-3).

## Divulgations (honnêteté, R-21 ; pas des défauts)
- **0 événement UpdateMultiplier décodé LIVE** : la sonde est signatures-seules ; les corps sont bloqués (C-V-2).
  Décodeurs + rejeu validés sur **vecteurs binaires construits à la main** (C-1, casse la circularité MAST) ; oracle
  d'état final + locateur TLV validés sur **comptes réels** (sonde). Les événements par mint viennent de L-5 (reporté).
- **Aucune fixture `apps/bell/test/fixtures/series/rebase/`** committée : rien n'a été scanné live à committer ; les
  vecteurs L-1/L-2 sont en-code (hand-built), donc `series_pinned_are_declared_and_hashed` est inchangé (rien à pinner).
- **Séquence des sondes** : 3 runs (p1/p1b pré-fix flaky, p2 pré-fix 80p, p3 post-fix band) ; la correction du défaut
  de sonde (S=premier→min, cap→bande) est tracée dans `PROVENANCE-b3a.md` (raws sha-pinnés).

## Items formés (déclencheurs + propriétaires ; zéro dette nue) — cf. ADR D1-quater
- **E-1** (date activation ScaledUiAmount) — CLOS par argument (rejeu depuis Initialize).
- **E-3** (commit client JS) — CLOS par argument (décodeurs propres, non vendorisés).
- **E-2** (Chainstack getAccountInfo slot passé) / **E-4** (palier Alchemy) — déclencheur : divergence C-3 / contrôle croisé ; orchestrateur.
- **E-5** (`try_validate_multiplier` bornes) — déclencheur : multiplicateur hors bornes décodé ; orchestrateur. Non bloquant.
- **E-6** (correctif PR #522 « not live yet ») — déclencheur : trajectoire au-delà de la date d'activation ; orchestrateur.
- **E-7** (locateur TLV) — validé first-hand par la sonde ; déclencheur : mint au layout TLV différent / échec du locateur ; orchestrateur.
- **C-V-2** (crédit/appel gTfA) — prérequis des corps ; orchestrateur (Usage dashboard).
- **Complétude à l'échelle** (NOUVEAU, first-hand ; corrigé) — l'artefact de coupe (S=premier opérateur + cap par
  nombre) est levé par la bande settled (p3 : 3/4 concordent) ; il reste une divergence RÉSIDUELLE réelle (SPYx,
  `concord=false` en atteignant genesis) ⇒ la complétude L-5 s'appuie sur l'oracle C-3 (C-4(iv)) + quorum des corps
  par événement (C-4(iii), implémenté), pas sur la concordance d'ensemble des signatures ; déclencheur : L-5 ;
  propriétaire orchestrateur + worker -b1-bis.
- **`bell-report.mjs --rebase`** — reporté à -b1-bis (aucune donnée de course à rapporter avant L-5).

## Oracles (ciblés VERTS ; `npm run ci` complet lancé UNE fois en fin, §F)
`gate:vocab` OK (171 fichiers) ; `typecheck` 0 ; `eslint` 0 ; `lint:ratchet` 69/69 ; `lang:gate` 0 ; `export:check`
0 ; tests ciblés `apps/bell/test/*.test.ts` + `test/no-secret-in-repo.test.ts` = **67 verts** (48 base + 18 nouveaux
+ 1 racine ; +18 tests, ≥ 13 requis ; 14 mutants ≥ 11 requis). `npm run ci` complet = **430 verts** (412 base + 18
bell). `error_origin` du défaut « constant m≠1 = brut » = rédacteur -b1.
