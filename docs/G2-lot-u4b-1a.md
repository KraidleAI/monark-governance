MODELE RESOLU: claude-opus-4-8[1m]

# G2 — sous-lot Ukemi U-4b-1a (OFFLINE : code de score close factor sur e2, gel avant les données)

- **Relecteur G2** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort max, instance séparée / contexte frais, revue 3 étapes (AgileCoder). 2026-09-21.
- **Objet** : worktree `F:\Monark-wt-u4b1a`, branche `lot/u-4b-1a`, base `2f4456f`, HEAD `2be3a98` (commit G1). Parent de HEAD = `2f4456f` ⇒ deux-points ≡ trois-points pour R-25.
- **Discipline** : AUCUNE écriture dépôt, AUCUN commit (R-20), AUCUN réseau, aucun `npm ci/install`. Mutants par sauvegarde+restauration byte-exacte sha256 (jamais `git checkout`/`stash`). Scratch `F:\tmp\g2-u4b1a\`. Sortie destinée à vérification adversariale de l'orchestrateur (R-21).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le livrable central est **fidèle et solide** : ŷ close factor v3.5.0 au premier franchissement recalculé À LA MAIN de façon indépendante (crossed=563 reproduit au niveau population), 6 mutants de code + 3 voisins ROUGES avec restauration byte-exacte, deux cellules Mondrian à digests gelés, générateur classe A borné 2^53, R-25=821, suite complète 559/559, fixtures byte-identiques, PROVENANCE conforme, aucun secret/chemin/prix de clôture. **4 corrections NON BLOQUANTES** : les **digests de cellule** (`dc9ab572…`/`89897a61…`) et **tous les pins de test** restent inchangés par les corrections, MAIS **C-G2-1/C-G2-2 changent 2 des 3 sha de GEL** (voir la CONSÉQUENCE GEL ci-dessous) ⇒ à trancher AVANT le commit du prereg -1b. Deux corrections sont des durcissements de *runner*, deux sont des corrections d'exactitude doc 03 (dont un procurement formé). Le verdict G7 final et l'assignation `error_origin` restent à l'orchestrateur.

---

## 1. Fidélité de ŷ à la règle v3.5.0 [lu] — RE-EXÉCUTÉ (point 1) : **CONFORME**

Règle lue [lu] `PR-U4-3` (v3.5.0, tag `6138e1fda…`, sha `201159d0…`) : `CF_base = min(D_r, 0,5·D_tot)` si `C_r ≥ 2000e8 ET D_r ≥ 2000e8 ET HF > 0,95e18` (strict) sinon `D_r` ; `CA = C_r/m` ; `ŷ_base = min(CF, CA)` ; multi-réserves `max` ; `MustNotLeaveDust` en OU ; bonus e-mode = catégorie.

Constantes vérifiées dans `u4b-scores.mjs` (l.44-47) : `T=2000e8`, `LEFT=1000e8`, `HF95=0,95e18`, `CF_BPS=5000`. Le gate `l.193` = `C_weth>=T && D_r>=T && hfStar>HF95` (ET, strict). `CF l.194` = `min(D_r, halfDtot)` où `halfDtot=percentMul(D_tot,5000)=0,5·D_tot`. `CA l.176` = `(C_weth*10000n)/bonusWeth = C_weth/m`. `yb l.195` = `min(CF,CA)`. Max multi-réserves `l.197` `if (yb>yhat) yhat=yb`. Bonus e-mode depuis `emode_params` (décodé de `emode_raw`) `l.155`.

**Équivalence de bord** `min(D_r,halfDtot) ≡` Solidity l.268 (`D_r>half ? half : D_r`) : à `D_r==half`, les deux rendent `D_r`. ✓ (analytique + reproduit à la main).

**Recalcul À LA MAIN, indépendant** (script `mutants`/hand-recompute n'important RIEN de `u4b-scores.mjs` ; HF calculée en DIRECT `wadDiv(percentMul(coll(p),LT_WETH), debt(p))`, pas l'identité de mise à l'échelle hf0 du code) :

| compte | type | emode/LT/bonus | p* | ŷ (main) | fixture ŷ / pstar / m_bps | verdict |
|---|---|---|---|---|---|---|
| `0x071c6780…` | e-mode cat-1 (nommé) | 1 / 9500 / **10100** | 410285071172 | 42492 | 42492 / 410285071172 / **10100** | **MATCH** |
| `0x01acb380…` | multi-dette (3 jambes) | 0 / 8300 / 10500 | 402690840220 | 6521633626603 | idem | **MATCH** |
| `0x0a9aca1a…` | dust (2 jambes) | 0 / 8300 / 10500 | 374649369662 | 268753320554 | idem | **MATCH** |

- **e-mode** : bonus **10100** vient de `emode_raw` (catégorie), PAS de la réserve (10500) ⇒ C-14 porteur. `hf_direct(p0)−hf_onchain = −1,18e−6` (delta de rounding de bord documenté `wadray.ts:7-10`, jamais un franchissement flippé).
- **multi-dette** : Σ_jambes ŷ = 7 338 108 421 738 ≠ max = 6 521 633 626 603 ; le code rend le **max** ⇒ règle C-7 porteuse ; la jambe USDT (D_r=12 226e9 > halfDtot) est **plafonnée à 0,5·D_tot** ⇒ réduction 50 % démontrée.
- **dust** : porte OU déclenchée côté DETTE (`(D_r−ŷ)=26 458 646 232 < 1000e8`), ŷ inchangé (E-I-4(b)). **Compte de dust à la main = 9 = census `dust_bounded`**.

**Contrôle POPULATION** : ma HF DIRECTE (méthode indépendante) donne **crossed=563 = `census.crossed`** exactement (les deux méthodes s'accordent sur la décision de franchissement pour les 16 096 comptes). Distribution `hfStar` au premier franchissement : **544/563 ∈ (0,95e18, 1e18)**, 19 ≤ 0,95e18, **0 exactement à 0,95e18**. ⇒ la condition `HF>0,95e18` est presque toujours vraie au premier franchissement (la réduction 50 % est pilotée par les seuils de TAILLE), ce qui rend les mutants b/c non tautologiques (19 comptes) et explique la non-discriminabilité de `>=`/`>` (§7).

## 2. Premier franchissement p* — RE-EXÉCUTÉ (point 2) : **HONNÊTE**

- p* = **premier** prix le long de `[ancre p0, puis D_e en ordre (block,logIndex)]` où HF<1e18 (`l.170`), **pas p_min** — confirmé par le recalcul à la main (traversée ancre-d'abord) ET par le mutant **b (p_min) ⇒ ROUGE** (digest). L'ancre (bloc 23545087, prix 434687000000, `source:book_weth_price_base_8dec`) précède TOUS les updates (min update bloc 23545382). ✓
- `pstar_is_anchor=52` : traité honnêtement — `u4b_anchor_identity_h7` recompte indépendamment les statique-éligibles évaluables = **52** (identité H-7 : HF(ancre)==hf0). ✓
- `crossed_yhat_zero=1` : franchi mais toutes les D_r floor à 0 ⇒ ŷ=0, **compté** (`l.219`), exclu de la cellule sauf si liquidé — **jamais un 0 silencieux**. Réconciliation : 563 franchis − 1 (ŷ=0) = 562 (ŷ>0) ; cellA n=565 = 562 ∪ 3 liquidés-évaluables à ŷ=0. Cohérent.

## 3. Anti-sélection C-12 — RE-EXÉCUTÉ (point 3) : **substance OK, littéraux de runner à nettoyer (C-G2-1)**

- **3 sha de gel == fichiers HEAD** (recomputés première main, LF-normalisés, 0 CR) :
  `u4b-scores.mjs` **`f5accf72…`** ; `u4b-reduce.mjs` **`a5e66cd3…`** ; `record-u4b-calib.mjs` **`22f23014…`** — identiques à RENDU §2. ✓
- **Fonction gelée épisode-agnostique** : `computeScoresU4b` filtre par le PARAMÈTRE `oracle.event_id` (fail-closed `l.78`), `predictor_id` dérivé de `eventId` (`l.259`) ; `buildRegistryEntries` prend `predictorBase` du meta. Prouvé par `u4b_event_id_is_a_parameter` (renommage ⇒ même digest ; absence ⇒ THROW). La correction du défaut critique du RENDU §7 (labels/predictor_id câblés e2) est **réelle**.
- **grep `23545087` / `E2` / `e2`** : `u4b-reduce.mjs` = commentaires SEULS (args obligatoires, aucun défaut). MAIS **littéraux de runner subsistent** : `u4b-scores.mjs:275` (`…?? "U4b-book-23545087.json"`), `:276` (`…?? "U4b-oracle-path-e2.jsonl"`), `record-u4b-calib.mjs:64` (`arg("--scores") ?? "…/U4b-scores-e2.jsonl"`). ⇒ la revendication RENDU §2/§7 « **aucun e2 en dur / épisode-agnostique** » n'est **pas littéralement vraie** du bloc runner. Voir **C-G2-1**.

## 4. Cellules A/B, coupes, q̂ L1, digests — RE-EXÉCUTÉ (point 4) : **CONFORME**

- Coupes de strates `STRATA_CUTS = {2000e8, 100k$=1e13, 1M$=1e14}` FIXÉES A PRIORI (`l.53`, Mondrian 2003 §4.4 κ avant données), exportées pour `strateOf` serveur (C-10). `u4b_strate_boundaries` (semi-ouvert `[cut,…)`) vert ; mutant coupe+1 ⇒ ROUGE (§7).
- q̂ par `splitQuantile` L1 unique (`packages/hikae/src/l1-split.ts`), la MÊME importée par le chemin servi `gate.ts:466` et `interval-conformer.ts` ; anti-circularité (hand p-ᵉ vs L1, throw si divergent, `record-u4b-calib.mjs:49`). ✓
- **`null` pour `under_calib`** : `qhatOf` rend `{qhat:null}` si `n<nMin=100` (`u4b-scores.mjs:67`) — cellule B (n=99) et strates 2 (n=46) / 3 (n=8) ⇒ q̂ null, jamais clampé. ✓
- **Digest par cellule ET par strate** : cellA `dc9ab572…`, cellB `89897a61…` gelés. Recalcul indépendant du digest cellA depuis les lignes IN-REPO de `U4b-scores-e2.jsonl` = **`dc9ab572…`** = meta = pin (boucle code→fixture fermée ; lignes en ordre canonique trié). Strates cellA {0:363,1:148,2:46,3:8}. ✓

## 5. Générateur C-9 — RE-EXÉCUTÉ (point 5) : **CONFORME**

`u4b_registry_recomputes_from_scores_jsonl` recompute depuis le fichier IN-REPO (anti fixture-self-recording) : classe A seule (décision 108), scale 1 (division exacte requise, throw sinon), **borne 2^53/strate** (throw > 2^53 ; 2^53 accepté), q̂ par L1 + null pour under_calib. Entrées par strate vertes : `[0,363,361,199069846640,false]`,`[1,148,148,9315546795545,false]`,`[2,46,47,null,true]`,`[3,8,9,null,true]` + 4 calibDigest C5 (float64_be). ✓ Cellule B **non émise** (item formé, non servie). ✓

## 6. « Choix à ratifier » — classification (point 6)

| item RENDU §7 | lecture du contrat | choix de méthode (à pré-enregistrer) |
|---|---|---|
| **porte dust** | STRUCTURE OU-revert, ≥1000e8 sur 2 jambes partielles = **verbatim PR-U4-3 §5** | **tie-break** ŷ_base égaux → 1er dans l'ordre des balances (affecte `dust_bounded` seul) |
| **X=0 exact** (483 résidus sub-$1) | identité floor `total_collateral_base==aWETH·p0/1e18` = lecture GenericLogic ; 483 = mesure | **valeur X=0** vs X>0 (G0 C-8 « proposé=0 ») |
| **e-mode fail-closed hors {0,1}** | — | **choix** (conservateur : `getEModeCategoryData` sans collateralBitmap ⇒ WETH∈cat non vérifiable hors ligne ; plus prudent que u4-scores) |
| **LST = emcat 1 ∧ ≠WETH** (rsETH emcat0 hors) | « ETH-correlated » = lecture | **choix** d'opérationnalisation + tenir la dette LST à p0 (contrefactuel mesuré négligeable ~$695) |
| **scale 1** | — | **choix** (échelle explicite bigint→number) |

**Omis du RENDU (à ajouter, C-G2-3)** : (a) **score/ŷ en devise de base 8-dec** alors que la branche réduite Solidity floor-convertit en unités natives `debtAsset` (`PR-U4-3:269`) — choix cohérent (Y aussi en base) mais NON déclaré ; (b) **`CA=floor(C_weth·1e4/bonus)`** est en division floor ; `PR-U4-3 §6` ne donne `CA=C_r/m` qu'en PROSE pour les lignes 609-660 (aucun verbatim) ⇒ l'arrondi on-chain exact du plafond de disponibilité **n'est pas vérifiable depuis le prérequis dans cette session** (aucun réseau) — approximation ≤ 1 unité de base (≤ $1e-8) non déclarée.

## 7. Mutants ≥ 8/14 + voisins — RE-EXÉCUTÉ (point 7) : **9 tueurs ROUGES / 1 survivant non-discriminable, restauration byte-exacte**

Harnais `F:\tmp\g2-u4b1a\mutants.py` (sauvegarde bytes → mutation exacte → `node --test` sur le fichier u4b → restauration → sha vérifié == `f5accf72…` après CHAQUE mutant ; **jamais git checkout/stash**). **sha final == gelé, `git status` VIDE.**

| mutant | verdict | assertion tueuse |
|---|---|---|
| **a** ŷ=D_tot | **ROUGE** | cellA n (565) + digest |
| **b** p_min (pas p*) | **ROUGE** | digest cellA (⇒ p* porteur, non tautologique) |
| **c** gate=true (50 % toujours) | **ROUGE** | digest cellA |
| **d** bonus e-mode ← réserve | **ROUGE** | digest cellA (réserve 10500 rétrécit CA sous CF, 6 comptes e-mode) |
| **g** dust OU→ET | **ROUGE** | census `dust_bounded` 9→1 (ŷ inchangé — census seul, correct) |
| **h** Σ au lieu de max | **ROUGE** | digest cellA |
| voisin **coupe strate +1** (constante) | **ROUGE** | `STRATA_CUTS` deepEqual |
| voisin **strateOf `y<c`→`y<=c`** (logique, MESURÉ) | **ROUGE** | `strateOf(2000e8)===1` ⇒ la borne est pinnée indépendamment de la constante des coupes |
| voisin **bonus bps (retirer ×1e4)** | **ROUGE** | CA s'effondre ⇒ appartenance cellA |
| voisin **`>=` vs `>` sur 0,95** | **VERT (survit)** | **non-discriminable sur e2** : 0 compte à HF==0,95e18 exact ; strict `>` asserté par lecture `PR-U4-3:263`, non un défaut, non un kill |
| voisin **ancre absente** (input) | THROW `TypeError` (fail-closed via `BigInt(undefined)`, message non explicite) | — |
| voisin **ancre = 0** (input) | **NO THROW — garbage silencieux** (cellA.n=99, 9451 « franchissent » à prix 0) | ⇒ **C-G2-2** |

Les 4 mutants d'entrée permanents (e D_e ignoré, f LT_W←0, f' LT e-mode←réserve, Y altéré) et 4 gardes (2^53, scale inexacte, bornes strate, m_bps) sont **verts in-test** dans la suite (déjà tueurs). Total rejoué : **10 mutations de fichier (9 ROUGE, 1 survivant attendu) + 2 sondes d'entrée + 8 permanents** ≫ seuil « ≥ 8 ».

## 8. Fixtures, PROVENANCE, exclusions, secrets, anti-close — RE-EXÉCUTÉ (point 8) : **CONFORME**

- **Fixtures u4b sha (LF) == PROVENANCE** : `baf717b7…` / `5e6448dc…` / `84f8aa13…`. ✓ `series_pinned_are_declared_and_hashed` **vert** dans la suite.
- **Fixtures u4 byte-identiques** (C-17) : `743e9499…` / `970357153…` / `8b84e095…` == pins du test `u4_e2_fixtures_byte_identical`. ✓ Le réducteur u4b ne re-génère PAS e2.
- **Limite déclarée — `u4b-reduce.mjs` NON re-exécuté** : il exige les bruts HORS-DÉPÔT (`8f620f6c…`, non détenus, non touchés) ⇒ correction validée **transitivement** (fixtures réduites → `computeScoresU4b` → digests gelés). Contrôle indépendant SANS bruts (couvre le mode MAST « fixture auto-enregistrée ») : `U4-book` et `U4b-book` sont deux projections du MÊME brut ⇒ comparaison sur les **16 096** comptes : **ensembles d'adresses ÉGAUX**, et **0 divergence** sur `total_collateral_base`/`total_debt_base`/`hf_onchain`/`emode`/`current_liquidation_threshold_bps` ⇒ le réducteur u4b n'a pas corrompu les agrégats (il ajoute `liquidation_bonus_bps`/`reserve_emode_category` + toutes les jambes de dette, 39 réserves).
- **PROVENANCE conforme** `series_pinned_are_declared_and_hashed` (table filename+sha LF même-répertoire, anglais, recettes de reproduction). ✓
- **Aucun chemin local** : seuls des **placeholders `<U4_RAWS_DIR>`** (angle-bracket, explicitement « never in an exported file ») — pas de `F:\`/`C:\` réel. **Aucun secret** (0 Bearer/clé/URL). **Aucun prix de clôture** (les prix committés sont des valeurs oracle/getAssetPrice on-chain, exemptées décision 110). `export:check` = **0 forbidden path**, `gate:vocab`/`lang:gate` = 0. ✓
- **`export-exclude-tests.json`** : +`apps/sentinel/test/ukemi-u4b-scores.test.ts` (upcoming, importe `scripts/census/u4b/**` non-surface) — +1/−1 correct. ✓

## 9. Suite complète + R-25 — RE-EXÉCUTÉ (point 9) : **CONFORME**

- **`npm run ci`** (= `gate:vocab` + `typecheck` + `test`) : **exit 0**, **559 tests, 0 fail** (log `F:\tmp\g2-u4b1a\ci-full.log`). `npm run test` est le maillon `test` de `ci` (même invocation). `lint:ratchet` 69/69 (exit 0), `lang:gate` 0, `export:check` 0. ✓
- **R-25** : `git diff --shortstat 2f4456f..HEAD` avec la pathspec `STAT=` EXACTE de `.github/workflows/ci.yml` (`:(exclude,glob)` docs/**/*.md + fixtures json/jsonl/csv + apps/sentinel/test/fixtures/** + apps/bell/…) = **820 insertions, 1 suppression = 821** (plafond `VIBEGATES_PR_LIMIT=1205`). Deux-points ≡ trois-points (parent==base). Détail : `PROVENANCE-u4b.md`(81)+test(220)+reduce(90)+scores.d.mts(51)+scores.mjs(284)+calib.d.mts(17)+calib.mjs(76)+export-exclude(+1) = 820 ; les 3 fixtures json/jsonl (808 lignes) exclues par la pathspec. ✓

---

## Écarts formés — C-G2-n (fichier:ligne, error_origin) — tous NON BLOQUANTS

- **C-G2-1** (`record-u4b-calib.mjs:64` ; aussi `u4b-scores.mjs:275-276`) — **error_origin : worker (G1)**. Le `main()` du générateur a un défaut `--scores` **vers le jeu de CONCEPTION e2** (`U4b-scores-e2.jsonl`) : un `node scripts/record-u4b-calib.mjs` nu en -2 construirait SILENCIEUSEMENT un registre depuis le design set (jamais servable). Non exploitable en -1a (le test appelle `buildRegistryEntries` directement), mais **piège -2** que le gel va figer. Le runner de `u4b-scores.mjs` (275-276) défaute aussi vers e2 (cosmétique : il n'imprime que du diagnostic). **Correction** : rendre `--scores`/`argv[2..4]` OBLIGATOIRES (motif déjà appliqué par `u4b-reduce.mjs`) — touche le SEUL runner, **laisse les digests de CELLULE et tous les pins de test byte-identiques** (le runner ne participe pas au calcul des scores), et rend littéralement vraie la revendication « aucun e2 en dur ». **Attention : cette correction CHANGE le sha de gel du fichier** (voir CONSÉQUENCE GEL).
- **C-G2-2** (`u4b-scores.mjs:79`) — **error_origin : worker (G1)**. Ancre non validée : ABSENTE ⇒ `TypeError` (fail-closed mais message implicite, contrairement à `event_id`) ; **`anchor_price="0"` ⇒ AUCUN throw, scoring dégénéré** (cellA.n=99, 9451 comptes « franchissent » à prix 0). En -1b l'ancre est un `AnswerUpdated≤B₀` réel de la course oracle ⇒ un champ manquant/nul produirait un scoring garbage sans erreur. **Correction** : garde `if (anchorPrice <= 0n) throw …` (+ message explicite pour l'absence). Sans effet sur les digests de cellule e2 (ancre = prix book WETH > 0) mais **change le sha de gel du fichier** (voir CONSÉQUENCE GEL). Fix-before-freeze recommandé.
- **C-G2-3** (RENDU §7 « choix déclarés » ; `PROVENANCE-u4b.md:66-72`) — **error_origin : worker (G1)**. Liste de choix incomplète (doc 03) : ajouter (a) **scoring en devise de base** vs floor natif Solidity `l.269` ; (b) **`CA` en division floor**, arrondi on-chain du plafond de disponibilité NON vérifiable depuis le prérequis dans cette session (aucun réseau). **Procurement formé (règle Dettes, pas un dû nu) — `PR-U4-3-ter`** : lire `LiquidationLogic.sol` v3.5.0 lignes **609-660** (source DÉJÀ procurée et hashée, sha `201159d0dcacc2282ad24295d24bed55888c087d885fe7f878073683f17a0b9e`), verbatim l'arithmétique de `_calculateAvailableCollateralToLiquidate`, déclarer floor vs half-up ; propriétaire orchestrateur, déclencheur AVANT le prereg. À pré-enregistrer (choix a) / résoudre (choix b) ; approximation ≤ 1 unité de base (≤ $1e-8) si floor confirmé.
- **C-G2-4** (RENDU §5) — **error_origin : worker (G1)**. Trivial : « PROVENANCE-u4b.md (78) » alors que `numstat` = **81** insertions. Le total R-25 (820+1=821) est correct ; seul le décompte par-fichier de la narration est décalé de 3.

### CONSÉQUENCE GEL (à trancher par l'orchestrateur AVANT le commit du prereg -1b) — défaut C-12 potentiel

Appliquer **C-G2-1** et/ou **C-G2-2** modifie les BYTES de `u4b-scores.mjs` (`f5accf72…`) et, pour C-G2-1, `record-u4b-calib.mjs` (`22f23014…`) ⇒ **2 des 3 sha de gel changent** (`u4b-reduce.mjs` `a5e66cd3…` reste INTACT). Les **digests de cellule** (`dc9ab572…`/`89897a61…`), **les 4 calibDigest de strate** et **tous les pins de test** restent inchangés (le runner et la garde d'ancre ne participent pas au calcul des scores e2). RENDU §2 ordonne au prereg -1b de figer les sha COURANTS — si l'orchestrateur applique les corrections PUIS fige les valeurs de RENDU §2, le prereg pointerait des bytes qui n'existent plus (**défaut C-12 réel**). Décision requise :
- **(i) recommandé** : appliquer C-G2-1/2 → recomputer les 3 sha de gel → **ré-émettre RENDU §2 avec les NOUVELLES valeurs** → figer au prereg.
- **(ii)** : figer les bytes tels quels et **porter C-G2-1/C-G2-2 en items formés** (déclencheur : invocation du générateur en -2 / course -1b fournissant l'ancre), résolus avant leur consommation.

---

## Provenance G2
Modèle `claude-opus-4-8[1m]`, effort max, 2026-09-21. Entrées lues : `docs/G0-lot-u4b.md` (plié), `docs/CHECKPOINT1-lot-u4b.md`, `F:\tmp\u4b1a\RENDU-G1.md`, `PR-U4-3-liquidationlogic-close-factor.md` [lu], `git diff 2f4456f..HEAD`, les 5 livrables + 4 fixtures + `wadray.ts`/`abi.ts`/`ci.yml`/`export-exclude-tests.json`. Re-exécutions : suite complète `npm run ci` (559/0), gates, hand-recompute indépendant de 3 comptes + population (crossed=563), boucle digest code→fixture, 10 mutations (sauvegarde/restauration byte-exacte, sha final == gelé, `git status` vide), contrôle réducteur (U4-book vs U4b-book, 0 divergence/16 096), grep anti-sélection, scan secrets/chemins/close. Aucun réseau, aucun commit, aucune écriture dépôt (R-20). Consultation advisor : **2** (avant re-exécution = calibrage de sévérité ; avant clôture = conséquence gel/réducteur/procurement) — verdict et R-21 restent à l'orchestrateur. Scratch : `F:\tmp\g2-u4b1a\` (`G2-lot-u4b-1a.md`, `ci-full.log`, `mutants.py`, `u4b-scores.mjs.orig`, `anchor_probe.mjs`).
