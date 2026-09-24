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
rebase-scan.ts             1c9935258ab095a597af13fa89d61fd703c694f183b00969675bb7aa2da473cb
rebase-trajectory.test.ts  69b8bca2d0fb3eaaf1d7f861f4fa1437680ff1c2d6e4d086aa38ac04c308ceee
rebase-scan.test.ts        1cccded721cc23abaf5bb496ff3ebc93c09047d323d97be64ee02f481798afd4
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
- **Runner hors dépôt non épinglé (C-G2-2, G2 -b3a)** — `PROVENANCE-rebase-course.md` épingle les SORTIES (séries +
  bruts `course/series-*.json`, `authority-probe.json`) mais PAS le CODE du runner `course-hybrid`/`authority-probe` qui
  les a produites ⇒ sha-épingler le script (ou une chaîne entrée→sortie vérifiable) ; sévérité faible (séries auto-vérifiées `replayTriplet`==oracle C-3 sur les bits) ; déclencheur : reprise/relance du runner à -b1-bis ; propriétaire orchestrateur.
- **`bell-report.mjs --rebase`** — reporté à -b1-bis (aucune donnée de course à rapporter avant L-5).

## Oracles (ciblés VERTS ; `npm run ci` complet lancé UNE fois en fin, §F)
`gate:vocab` OK (171 fichiers) ; `typecheck` 0 ; `eslint` 0 ; `lint:ratchet` 69/69 ; `lang:gate` 0 ; `export:check`
0 ; tests ciblés `apps/bell/test/*.test.ts` + `test/no-secret-in-repo.test.ts` = **67 verts** (48 base + 18 nouveaux
+ 1 racine ; +18 tests, ≥ 13 requis ; 14 mutants ≥ 11 requis). `npm run ci` complet = **430 verts** (412 base + 18
bell). `error_origin` du défaut « constant m≠1 = brut » = rédacteur -b1.

## ANNEXE pli -b3a-2 (course L-5 ; worker `claude-opus-4-8[1m]`, effort max, 2026-09-20)

**R-1** : modèle résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`). **R-20** : aucun commit, aucun workflow.

**Budget (décision investisseur 56, 2026-09-20 « va jusqu a 10% », ratifie la 55)** : plafond Helius L-5 porté de
~~500 000~~ à **1 000 000 crédits** (10 % du plan 10 M) ; plafond Chainstack **200 000 appels** inchangé ; règle
inchangée : sonde + coût projeté écrits ICI **avant** les corps ; dépassement = arrêt + consultation, jamais un
dépassement silencieux. Coûts mesurés (décision 55) : gTfA 10 cr/appel (1 000 tx), getTransaction 1, gSFA 1.

**Sonde de coût (mandate étape 1), first-hand, quorum-2 helius+chainstack** : oracle d'état C-3 pinné et VALIDÉ
live (triplet bits concordent sur les 2 opérateurs ET = `spike-measures.json`) ; genesis (plus ancienne tx, gTfA
asc) = 2025-06-10/11 (~465 j). Énumération partielle des signatures du mint (2 opérateurs) ⇒ **mints HYPERACTIFS** :

| mint | débit récent mesuré | N si soutenu ×465 j | corps full-mint gTfA (⌈N/1000⌉×10) |
|---|---|---|---|
| TSLAx | 54 670/j (sur 19,7 j) | ~25 M | ~254 k cr |
| SPYx | 635 832/j (sur 1,43 j) | ~296 M | ~2 957 k cr |
| NVDAx | 359 082/j (sur 2,65 j) | ~167 M | ~1 670 k cr |
| AAPLx | 110 427/j (sur 9,66 j) | ~51 M | ~513 k cr |
| **TOTAL projeté corps full-mint** | | | **~5,4 M cr** |

SPYx seul (~2,96 M) dépasse le plafond 1 M ; borne basse conservatrice (débit récent × 90 j, SPYx+NVDAx seuls) >
1 M ; N exact lui-même prohibitif (SPYx gSFA ~296 k pages, plusieurs heures). `getTransactionsForAddress` n'offre
AUCUN filtre programme/instruction serveur-side (doc Helius [lu] : filtres slot/`blockTime`/statut/transfert-token
seulement) ⇒ le jeu complet des corps doit être tiré pour trouver les 43/x. ⇒ **la méthode mandatée (scan full-mint
des corps) est INFAISABLE sous le plafond 1 M** ⇒ **arrêt mandaté ; aucun scan full-mint corps lancé.**

**gTfA `full` — viable (F-4 sûr), first-hand** : réponse `{data,paginationToken}` ; chaque ligne = la forme
`getTransaction` json qu'attend `eventsFromTx` (slot/blockTime/version top-level, `transaction.signatures`,
`message.{accountKeys(chaînes),instructions}`, `meta.{innerInstructions,loadedAddresses}`) ; `instruction.data` =
chaîne base58 BRUTE (pas d'objet parsé) ; `maxSupportedTransactionVersion:2` accepté ; `sortOrder` asc/desc +
`filters.slot.lte` fonctionnent. Raws `course/shape-v1..v6.json` (sha-pinnés).

### CONSULTATION FORMÉE #2 (R-26 ; worker → orchestrateur ; décision AVANT clôture de la course L-5)
Problème (une phrase) : la méthode mandatée (option 2, corps full-mint via gTfA) coûte ~5,4 M crédits Helius
(mesuré) et dépasse le plafond 1 M ; comment obtenir la trajectoire complète sous plafond ?
Tentatives : sonde de coût full-mint (débits mesurés) ; shape-probe gTfA ; vérification que gTfA rend les corps de
config (Initialize + Update, pas seulement les transferts). Options (à trancher par l'orchestrateur, non le worker) :
1. **HYBRIDE — scan de l'AUTORITÉ partagée S7vYFF (RECOMMANDÉ)**. Les 43/1 UpdateMultiplier ET les 43/0 Initialize
   des 4 mints sont TOUS émis par S7vYFF (`066f5922..45e3`). Énumérer l'AUTORITÉ (164 239 sigs, gSFA 165 pages) +
   gTfA `full` sur ses corps (166 pages), décoder 43/x pour les 4 mints, relire chaque candidat quorum-2. **Coût
   ~1 825 crédits Helius (~2 900× moins cher), trivialement sous plafond.** Complétude PROUVÉE : (a) rejeu bit-à-bit
   (`replayTriplet`) reproduit le triplet d'oracle sur les BITS pour les 4 mints (C-3/C-4(iv)) ; (b) INVARIANCE
   D'AUTORITÉ : autorité de l'`Initialize` == autorité courante (oracle) == S7vYFF ⇒ processor.rs exigeant la
   signature de l'autorité courante, seul S7vYFF a pu émettre un 43/1 ⇒ le scan d'autorité les capture tous.
   PORTÉE de C-3 : C-3 prouve l'état FINAL ; les valeurs `multiplier_at` en fenêtre fondatrice sont des rejeux
   bit-exacts des événements CAPTURÉS — leur complétude repose sur l'invariance d'autorité + la complétude de
   l'historique gTfA Helius de S7vYFF, C-3 étant le backstop de l'état final. Failles résiduelles NOMMÉES, symétriques :
   (i) côté signataire — changement d'autorité A→B→A avec updates B-signés qui s'annulent (couvert par l'item
   « SetAuthority non scanné », C-12) ; (ii) côté énumération — le scan d'autorité gTfA est **Helius seul** (gTfA
   n'a pas d'équivalent Chainstack ; même étape mono-opérateur que la méthode mandatée) : une omission Helius qui
   changerait l'état final serait attrapée par C-3, une qui ne le changerait pas ne le serait pas. Déclencheurs :
   scan SetAuthority du mint ; contrôle croisé de l'énumération d'autorité sur un 2ᵉ archiveur si disponible ;
   propriétaire orchestrateur. (Les candidats 43/x sont, eux, relus quorum-2 helius+chainstack — clé événement décodé.)
2. **Scan full-mint borné à la fenêtre fondatrice** (gTfA `filters.blockTime` [genesis, 2025-10-31]) : donne le gate
   fenêtre (l'étude Cong ne vise que jul-oct 2025) mais PAS la trajectoire courante ; non chiffré, dominé par (1).
3. **Relever le plafond à ~6 M crédits** (~54 % du plan) : NON crédible. Recommandation worker : **option 1**.

**Résultat de la course (first-hand, HYBRIDE ; hors dépôt `course/series-*.json`, PENDING ratification, NON
committé)** — 4/4 : C-3 bit-à-bit OK, invariance d'autorité OK, `overwritten_pending`=0, quorum des corps OK
(helius+chainstack, tous `keyMatch`), `scan_complete`=true :

| mint | événements | gate fenêtre | m@2025-07-01 | m@2025-10-31T23:59:59 | m@2026-09-19 | série sha256(LF) |
|---|---|---|---|---|---|---|
| TSLAx | 1 (init) | constant | 1 | 1 | 1 | `bd68590c7cd4…` |
| SPYx | 9 | trajectory_known | 1 | 1.00099942056 | 1.005714560286254 | `43243b87ab65…` |
| NVDAx | 11 | trajectory_known | 1 | 1.00003086642674 | 1.001701196801074 | `f2776fe6e028…` |
| AAPLx | 11 | trajectory_known | 1 | 1.000781855115 | 1.0032690125398187 | `02b37ecf8704…` |

Motif : rebase ~trimestriel (paire commit(prior)+schedule(next) par tx ⇒ 2 × 43/1 au MÊME slot/MÊME signature ⇒
`same_slot_diff_sig`=false, pas d'ambiguïté ; effTs = jour de l'update à 23:55:00Z ; incréments positifs faibles =
accumulation dividende/frais de portage). Premier update DANS la fenêtre fondatrice : AAPLx 2025-08-14, NVDAx
2025-10-02, SPYx 2025-10-31T23:55 ⇒ **3/4 mints ne sont PAS `constant` en fenêtre** (ajustement g_t = VWAP_raw / m
requis, C-7 ; incréments ≤ ~0,1 %) ; TSLAx `constant`=1 (aucun update, aucun ajustement).

**Budget dépensé (exploration ; ledger hors dépôt `budget.json` ; fail-closed par opérateur)** : Helius ~6 323 cr
(6 283 ledger + 40 à compteur propre `verify-gtfa-config`), Chainstack 4 042 appels ; largement sous plafonds ;
AUCUN scan full-mint corps lancé. Plafonds par opérateur `--max-calls`/crédits fail-closed (BudgetExceeded re-levé).

**Livrables SI ratification option 1** (reprise -b3a-2 ou suivi -b3a-3) : copier `course/series-*.json` sous
`apps/bell/test/fixtures/series/rebase/` (R-25-exclus) + `PROVENANCE-rebase-course.md` (shas LF ci-dessus + ToS
Helius/Chainstack) + test `bell_rebase_course_replays_bit_identical` (rejeu série = valeurs épinglées) ; mutants ≥ 2
(octet série altéré ⇒ rouge via `series_pinned` + rejeu ; oracle forcé divergent ⇒ `rebase_unverified` via
`rebaseGateFromTrajectory(...,scanComplete=false)`). ADR D1-quater : ajouter la méthode hybride + la précondition
d'invariance d'autorité. **R-25 estimé** : +~50 l (test seul ; séries/docs exclues) ⇒ ~1 037 < 1 205, **pas de
seam**.

**R-25 de ce pli = 987 INCHANGÉ** (`git diff --shortstat 3315ea7` sous pathspec `STAT=` de `ci.yml` ; ce pli
n'ajoute que des docs R-25-exclus) < 1 205.

**Items formés (déclencheurs + propriétaires ; zéro dette nue)** :
- **HYBRIDE comme méthode** (option 1) — précondition invariance d'autorité ; déclencheur : ratification orchestrateur ; propriétaire orchestrateur.
- **Débits mints** (54 k–636 k sig/j, mesurés) — fait pertinent pour tout scan full-mint futur ; propriétaire orchestrateur / worker -b1-bis.
- **`sample_events` décimal-seul** (défaut runner `authority-probe`, corrigé dans `course-hybrid` par les bits f64) — clos par correction (F-4 respecté dans la série finale).
- **SetAuthority non scanné** (faille résiduelle de complétude côté signataire, déjà C-12) — déclencheur : scan SetAuthority du mint ; propriétaire orchestrateur.
- **Énumération d'autorité mono-opérateur (Helius seul)** — gTfA n'a pas d'équivalent Chainstack ; backstop = C-3 (état final) ; même limite que la méthode mandatée ; déclencheur : contrôle croisé sur un 2ᵉ archiveur gTfA si disponible ; propriétaire orchestrateur.
- **Motif de rebase Backed** (first-hand [lu] : paire commit(prior)+schedule(next) par tx, effTs = jour à 23:55:00Z, cadence ~trimestrielle, incréments positifs faibles) — contexte pour D1-quater (accumulation dividende/frais), pas une affirmation d'intention ; propriétaire ADR.

## ANNEXE pli -b3a-3 (livraison sous décision orchestrateur 60 ; worker `claude-opus-4-8[1m]`, effort max, 2026-09-20)

**R-1** : modèle résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`). **R-20** : aucun commit, aucun workflow.
Aucun appel RPC (tout déjà mesuré à -b3a-2). Scratch `F:/tmp/bell-b3a-3/`.

**Objet** : ratification opérationnelle de l'option 1 (scan d'autorité, décision 60) — les 4 séries de course sont
copiées sha-pinnées et rejouées bit-à-bit hors ligne, les résiduels nommés sont ajoutés à l'enum et émis par le gate,
l'ADR D1-quater porte la méthode hybride + la précondition d'invariance d'autorité.

### Livrables
- **Séries** (byte-identiques aux sources hors dépôt) sous `apps/bell/test/fixtures/series/rebase/rebase-<MINT>.json`
  + `PROVENANCE-rebase-course.md` (shas LF, shas des bruts hors dépôt, ToS Helius/Chainstack collé, méthode, budget
  réel **6 323 crédits Helius / 4 042 appels Chainstack**, résiduels). `series_pinned_are_declared_and_hashed` **vert**
  (4 séries déclarées+hashées, une ligne nom+sha chacune).
- **Résiduels** : `authority_scan_mono_operator` + `set_authority_unscanned` ajoutés à `COLLECTOR_RESIDUE_CODES`
  (`residuals.ts`) ; le gate `trajectory_known` porte le champ **requis** `residuals` ; `rebaseGateFromTrajectory(…,
  scanMethod="authority")` les émet, jamais un `trajectory_known` sans eux (test d'égalité). **TSLAx `constant` ne
  porte AUCUN résiduel** (scope `trajectory_known`) — déclaré (honnêteté).
- **Test** `bell_rebase_course_replays_bit_identical` : par mint — invariance d'autorité (`Initialize.authority ==
  oracle.authority`), `replayTriplet` == oracle sur les BITS, `overwritten_pending = 0`, `multiplier_at` aux 3 bornes
  (bits + décimal `String()`), gate = `constant` (TSLAx) / `trajectory_known` (3 autres, résiduels portés). +
  `bell_rebase_authority_residuals_named_and_gated` (codes ∈ set fermé ; émis sous `authority`, `[]` sinon).
- **ADR D1-quater** : sous-section « Méthode hybride — scan de l'autorité », précondition d'invariance, coût
  (5,34 M full-mint réfuté [décision 60 l.122, lu] vs ~1 825 projeté ; réel 6 323/4 042), résiduels nommés, tuyaux mis
  à jour + ligne `gate.residuals` ABSENT, item MAST `SetAuthority` corrigé (« sans effet » → résiduel nommé).

### Touched set
Modifiés (tracked) : `apps/bell/src/{residuals,supply}.ts`, `apps/bell/test/{collect,rebase-gate-gt}.test.ts`.
Docs (R-25-exclus `docs/**/*.md`) : `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md`, ce PLI.
Nouveaux : `apps/bell/test/rebase-course.test.ts` (compté), `.../series/rebase/PROVENANCE-rebase-course.md` (compté —
voir R-25), 4 `rebase-*.json` (R-25-exclus par la glob séries).

### sha256 (LF) des fichiers touchés (provenance)
```
residuals.ts                 580575cac0448d844d4a37ef4c847d492e4c69756e87b5e8c4917b46626653df
supply.ts                    b7352581ce1ee8b8a0def09d05ae722e1cf32503724d0790ca4e15fd4ba526bb
collect.test.ts              df17d41988c57a48c7b9a72f8f8231ec1be0920b764a078a3567dfc4628225cd
rebase-gate-gt.test.ts       6dade70fa845455ea082d1e4e4a1f0194ee34f9be78f845051ea9dc367a98f0c
rebase-course.test.ts        7ef275c53c364cd997022b6a91e2cbc261b0f687da7f6b60850891334b7dfe2a
PROVENANCE-rebase-course.md  c2c085c7faa2ad670734b87c23f04cc3a254b3d26a49007b606bf3a2d7bbc0fc
séries (pins complets dans PROVENANCE) : TSLAx bd68590c… · SPYx 43243b87… · NVDAx f2776fe6… · AAPLx 02b37ecf…
```

### Re-pin du digest (`collect.test.ts` `PINNED_BELL_SHA`)
L'ajout de 2 codes agrandit `newResidualCounts()` ⇒ la map `residuals` du digest gagne 2 clés ⇒ le sha glisse (octets
de fixture INCHANGÉS ; extension de vocabulaire voulue, même mécanique qu'au re-pin -b1 `rebase_unverified`) :
`eaed7ea4b200cf97957d5ea0b4ac4a5f3f4fa6870af7c640fcc61d1c700d6df6` →
**`126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3`**. `bell_collector_replays_fixture_bit_identical`
re-vert ; un octet de fixture le redsse toujours.

### Mutants (2 ; rouges par construction ; restauration cp → sha identique, PAS de `git checkout`, R-20)
| # | mutation | fichier | test tueur | résultat |
|---|---|---|---|---|
| M-r1 | émission des résiduels d'autorité neutralisée (`scanMethod === "authority"` → `false`) | supply.ts | `bell_rebase_authority_residuals_named_and_gated` + `bell_rebase_course_replays_bit_identical` | KILLED |
| M-r2 | un octet de série altéré (SPYx oracle bits `…f03f`→`…f03e`) | rebase-SPYx.json | `bell_rebase_course_replays_bit_identical` + `series_pinned_are_declared_and_hashed` (racine, `test/ci-gates.test.ts`) | KILLED |

Restauration vérifiée byte-identique : supply.ts sha LF `b7352581…` (== pristine) ; rebase-SPYx.json sha LF
`43243b87…` (== annexe, `cmp` byte-identique à la source).

### R-25 (`git diff --shortstat 3315ea7` sous pathspec `STAT=` de `.github/workflows/ci.yml`)
**1 159 lignes** (1 105 ins + 54 del) < plafond 1 205 ⇒ **pas de seam**. = 987 (b3a-2, inchangé) + 172 (b3a-3).
**Précondition de reproduction** : mesuré avec `git add -N` sur les 2 nouveaux fichiers comptés (`rebase-course.test.ts`,
`PROVENANCE-rebase-course.md`) — c'est l'état committé, ce que mesure la CI via `HEAD`. Sans ce staging, le diff
deux-points omet ces 155 lignes (1 004 affiché) : `git add -N <les 2 fichiers>` PUIS `git diff --shortstat 3315ea7 -- <pathspec>`.
**Écart avec l'estimé ~1 037 de l'annexe -b3a-2 = fait mesuré, non un dépassement caché** : le `STAT=` exclut les
données de la racine séries (`…/series/**/*.{json,jsonl,csv}`) et `docs/**/*.md`, mais **PAS** les `…/series/**/*.md`
⇒ `PROVENANCE-rebase-course.md` (+78 l) **compte** (les PROVENANCE existants sous cette racine étaient dans la base
`3315ea7`, donc invisibles au diff). **Item formé** (déclencheur : décision ADR/orchestrateur ; propriétaire
orchestrateur) : exclure `:(exclude,glob)apps/bell/test/fixtures/series/**/*.md` du `STAT=` **exige** d'ajouter cette
glob au whitelist `NON_SERIES_GLOB` de `series_pinned` (sinon `extra` rouge, mutant M11) — modification de gate, hors
périmètre worker (R-20). Sans cet item, R-25 = 1 159 reste sous plafond.

### Branchement (règle KACIMI 2026-09-19, CA-11)
L'émission des résiduels par `rebaseGateFromTrajectory(…, "authority")` est **couverte par test non-LLM** mais **pas
encore servie** : `collect()` compte `rebase_unverified` par séance et ne déverse PAS `gate.residuals` dans
`state.json` (granularité mint vs séance non spécifiée — sémantique non inventée). ⇒ **item formé** (tuyau
`gate.residuals → compteur/state.json` = ABSENT ; déclencheur -b1-bis ; propriétaire orchestrateur), consigné dans
l'ADR D1-quater (tuyaux + items). Bell reste **`upcoming`** (consommateur servi = -b1-bis ; absent de fleet/README/site).

### Oracles
`gate:vocab` OK (171) ; `typecheck` 0 ; `eslint` 0 ; `lint:ratchet` 69/69 ; `lang:gate` 0 (bell) ; `export:check` 0 ;
tests ciblés `apps/bell/test/*.test.ts` + `test/no-secret-in-repo.test.ts` = **69 verts** (67 -b3a-2 + 2 nouveaux) ;
`series_pinned_are_declared_and_hashed` vert. **`npm run ci` complet = 432 verts** (430 -b3a-2 + 2 bell nouveaux ;
0 fail ; `gate:vocab` + `typecheck` passent en tête du script `ci`). Lancé UNE fois en fin, après vérification qu'aucun
node de worktree bell ne tournait (aucun processus node introspectable ne portait `wt-`/`--test` ; NARABI-OPS-1 =
worktree distinct, isolé au niveau fichier). `error_origin` de la réfutation full-mint = orchestrateur (décision 55,
sonde -b1 capée à 8 pages) — décision 60.
