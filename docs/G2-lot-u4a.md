# G2 — lot U-4a (Ukemi : book Aave v3 @B₀=23545087 cluster WETH, chemin d'oracle D_e, réduction A-4 → calibration)

Relecteur G2, instance séparée à contexte frais (n'a ni écrit ce code ni mené la course).
**Modèle résolu : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme R-1, effort max ; Opus 5 banni respecté).
Date : 2026-09-20 (UTC). Cible : worktree `F:\Monark-wt-u4a`, branche `lot/u-4a`, HEAD `b1302db`, état **NON COMMITTÉ** (git status + git diff b1302db + fichiers non suivis). Bruts LECTURE SEULE `F:\PRODUITS\etude-2026-09-20\u4-raws\` (ouverts en lecture partagée ; copie de travail sous `F:\tmp\u4a\g2\`). Aucun réseau/RPC, aucun secret, aucune écriture dans le worktree, aucun commit (R-20). Revue statique → exécution → mutants, oracles un à un (pas `npm run ci`). Toutes les mesures rejouables sous `F:\tmp\u4a\g2\{replay-book.mjs, analyze.mjs, refine.mjs, h6.mjs, mutate.mjs, cache-mutants.mjs}`.

## VERDICT : **PASS-AVEC-CORRECTIONS**

La mesure est **saine et intégralement reproduite** : `book_digest`, `holders_digest`, `calib_digest` et **les 7 hypothèses H1–H7 recalculées indépendamment** correspondent **exactement** aux chiffres rapportés ; aucun résultat n'est maquillé, aucun réajustement post-données sur les valeurs. Le réducteur est correct (9 mutants tués, aucun tautologique). Prereg committé **avant** la course et inchangé. Aucune fuite de secret. **Le lot est NON-FUSIONNABLE EN L'ÉTAT** : le gate racine `series_pinned_are_declared_and_hashed` est **ACTUELLEMENT ROUGE** (C-G2-1, bloquant — `PROVENANCE-u4.md` manquant, non vu car `npm run ci` a été différé ; cette rougeur prouve que le report de `npm run ci` a masqué un échec réel — l'orchestrateur DOIT relancer la suite complète avant G7). Le reste est **documentaire/test** : liste fermée C-G2-2..7 + trois décisions orchestrateur/checkpoint-2 (R-20). **Aucune correction ne requiert de refaire une course** (au plus 1 `getLogs` off-tool pour C-G2-5).

---

## 1. Intégrité du pré-enregistrement + H1–H7 recalculés (point 1)

**Ordre prereg → course : PROUVÉ.** `docs/PLAN-u4-prereg.md` committé en `6ac8d4a` (parent de HEAD `b1302db`), LF sha256 = `9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb` (== pin prereg ; recomputé). `git diff b1302db -- docs/PLAN-u4-prereg.md` = **vide** (inchangé). Les bruts portent `meta.prereg_sha = 9209cdab…` (le script refuse de démarrer sans) et sont datés du 2026-09-20 (bien après le commit 07:52). Le test `u4_prereg_sha_matches_committed_plan` verrouille l'égalité. **Aucune post-hocité.**

**H1–H7 recalculés par MA propre arithmétique d'ensembles** (script `analyze.mjs`, sans passer par `computeScores` pour H2/H3/H5/H7) sur le book brut (16096 comptes) + `U3-realized` (194 lignes e2, 189 comptes) + oracle brut :

| H | énoncé | verdict recalculé | chiffre recalculé | == PLI ? |
|---|--------|-------------------|-------------------|:---:|
| H1 | détenteurs aWETH `balanceOf>0` ≤ 20 000 | **INDÉTERMINABLE (bornée)** | book lit balanceOf sur 16 096 config-passants ; zero_balance=0 ⇒ borne **[16 096, 69 481]** ; 20 000 dedans | ✓ |
| H2 | 189 liquidés ⊂ à-risque book B₀ | **NON** | **185/189** (4 `liquidated_not_in_book`) | ✓ |
| H3 | ŷ>0 pour ≥90 % des liquidés | **NON** | **162/189 = 85,7 %** (< 90 %) | ✓ |
| H4 | ≥50 AnswerUpdated | **OUI** | **140** | ✓ |
| H5 | ≥1 éligible non liquidé | **OUI** | **608** | ✓ |
| H6 | dernier update ≤ b == getAssetPrice@b (107 blocs) | **NON (forme prereg 69/107)** ; feed validé autrement (voir §2) | **69/107** (union ≤b/<b = 77) | ✓ |
| H7 | n=\|cellule\| ≥ 100 | **OUI** | **797** | ✓ |

Recensement cellule recalculé (indépendant) : eligible_static_b0 **64**, eligible_under_De **770**, liquidated_in_cell 189, liquidated_not_in_book **4**, liquidated_not_eligible_under_De **23**, eligible_not_liquidated **608**, emode≠0 in-cell **42**, clamps **0**. cell = 770 ∪ 189 (recouvrement 162) = **797**. **Tous identiques au PLI.** Un « NON » (H2/H3/H6) est un résultat mesuré, pas un défaut ; aucun n'est maquillé.

## 4. Book (point 4) — rejeu offline vérifié

**`book_digest` REPRODUIT depuis le cache, ZÉRO réseau.** Copie `U4-inputs.jsonl` (sha `09968df1…`, 138 711 lignes, kinds : ethCall 138 706 / getLogs 1 / holders 1 / finalized 1 / blockAt 1 / meta 1) sous scratch, rejeu de `recordBook` avec base reader qui **compte et jette** :
- `book_digest = 695d862fd1560d5a0ae1349f358accd36ecf394437bd2f497fa1a0fae7d7ab09` ✓
- `holders_digest = 92f6509d…` ✓ (recalculé aussi **indépendamment** depuis le `getLogs` réduit ⇒ == ligne `holders`)
- counts : holders 69481, at_risk 16096, eligible 64, coll_off 31341, no_debt 22044, **zero_balance 0** ✓ ; eligible_aggregate {64, 5838106985, 6052074070} ✓
- **hard misses réseau = 0**, appends = 0 ; **seuls 2 reverts `description()` reproduits** (oracles fixed-price type GHO — non mis en cache car `ConcordantRevertError` toléré ; un `book_digest` correct prouve que les descriptions forcées `""` égalent le book réel). `enumerateAndCountAtRisk` rejoué → 16 096 / `92f6509d…`.

**Note de méthode (subtilité réelle, non un défaut)** : le cache ne mémorise **pas** les appels qui *revert* (les `description()` de GHO) ; un rejeu offline fidèle DOIT reproduire ce revert. `assertResumeHoldersMatch` ne garde que **l'énumération** (holders) ; l'intégrité des lectures par-compte est portée par le `book_digest` lui-même (démontré par le mutant M-G2-8).

**`assertResumeHoldersMatch`** : vert au rejeu ; garde fail-closed prouvée par M-G2-9b (holders_digest cache trafiqué ⇒ `ResumeCacheError`).

**Comptes d'appels — recalculés, VÉRIFIABLES depuis les deltas de cache que je possède** :
- run 1 book mort : `U4-inputs.mid-run1-109k.jsonl` (109 246 l.) − `U4-inputs.pre-course.jsonl` (69 488 l.) = **39 758 lectures logiques × 2 (quorum-2) = 79 516** = `dead_run_calls` du PLI. ✓ (delta de fichiers réel, pas une reconstruction de heartbeat)
- run 2 : final (138 711) − mid-run1 (109 246) = **29 465 logiques × 2 = 58 930** ; provenance run 2 = **58 942** (mesuré ; +12 benching). ✓
- course = 79 516 + 58 942 = **138 458** ✓. Cumul lot **278 987 < 300 000** (marge ~21 013).
- **Réserve honnête** : la portion FILTRE tuée (62 398 lectures → 124 796 réseau) est **reconstruite** (run killé, aucune provenance) ; mais les 69 481 lectures config du filtre COMPLET sont vérifiables dans `pre-course.jsonl`, et le coût réseau ≥ 2×69 481 = 138 962 est un plancher. Même avec 5 % de benching sur les portions reconstruites (~204 k), le cumul reste < ~290 k < 300 000 ⇒ **plafond robuste**.

**Règle des 5 % par opérateur** : appliquée honnêtement — max mesuré = nodies **9/183 = 4,9 %** < 5 % (échantillon 183 ≪ 1 000, backfill quand drpc/blastapi benchés) ⇒ observé, **non déclenchant**. mevblocker exclu (D-5) car dégradation fournisseur mesurée (34 % à 200 ms). Fail-closed quorum-2 maintenu (drpc+blastapi, nodies/chainstack en réserve).

## 2. D-9 / H6 (point 2) — ce qui est démontré, ce qui ne l'est pas

**Reproduit exactement** (`h6.mjs`) : forme prereg « dernier AnswerUpdated ≤ b == getAssetPrice@b » = **69/107** (union ≤b/<b = 77/107) ⇒ **H6 NON**. Appartenance-valeur = **106/107** (le 1 non-membre = **bloc 23545088, prix 434687000000 = p0**, pré-fenêtre). **p_min = 345670460000 = min(AnswerUpdated) = min(getAssetPrice) EXACT.**

**Buckets des 38 échecs de la forme prereg** (mesurés) : **0** « updates multiples dans le bloc / logIndex intra-bloc » ; **37** « getAssetPrice@b == un AnswerUpdated d'un bloc ANTÉRIEUR » (retard/lag) ; **1** « pas d'update ≤ b » (ancre pré-fenêtre). **Cas 23549850 reconstitué** : getAssetPrice@23549850 = **390044087065** = AnswerUpdated@**23549845** (logIndex 552) — **pas** le dernier update ≤ b, qui est @23549848 (392636000000). Retard de plusieurs blocs, un seul update par bloc.

**DÉMONTRÉ** : (a) H6 forme prereg est un vrai NON (69/107) ; (b) la quantité **load-bearing pour ŷ** — `p_min` = min des `AnswerUpdated` — est **juste** (== min getAssetPrice, exact) ; (c) 106/107 des prix getAssetPrice sont des valeurs de la série AnswerUpdated.

**NON DÉMONTRÉ / défauts** : (i) l'**explication mécaniste** du PLI/D-9 (« updates multiples par bloc, la liquidation lit un logIndex intra-bloc avant/après le backrun ») est **contredite par les données** : 0 cas multi-update intra-bloc ; le motif réel est que **le proxy SVR (`getAssetPrice`) retarde le flux `AnswerUpdated` de l'agrégateur d'≥1 bloc** (⇒ C-G2-4). (ii) Le test `u4_oracle_path_monotone_and_matches_u3_prices` **assère la forme D-9 (106) non ratifiée**, pas la forme prereg/C-4 (69) ; le 69/107 n'est **disclosé qu'en commentaire** (ligne 68), non épinglé en assertion (⇒ C-G2-3, c'est l'instance « critère réajusté après avoir vu les données » — divulguée, mais pas verrouillée). (iii) **C-4 exigeait que D_e inclue le dernier update ≤ B₀** ; `first_update.block = 23545382 > B₀ = 23545087` ⇒ ancre pré-fenêtre absente (= le 1/107) (⇒ C-G2-5). Immatériel à `p_min` (p0 > p_min) mais lettre de C-4 non respectée.

**À trancher par checkpoint-2 / advisor-defi (R-20)** : ratifier ou rejeter D-9 (appartenance-valeur + p_min-exact comme validation d'oracle, en remplacement de l'identité bloc-niveau) ; exiger l'épinglage du NON 69/107 ; exiger la correction de l'explication mécaniste (retard SVR, data-backed) ou son marquage « non expliqué » ; décider si l'ancre pré-B₀ doit être récupérée (1 `getLogs`). Question de fond pour advisor-defi : l'agrégateur `0x7c7fdfca` (résolu via `aggregator()`) est-il bien celui que le proxy SVR `0x5424384b` sert pour `getAssetPrice`, ou une couche liée (expliquerait le retard) ?

## 3. Réduction A-4 (point 3)

**calib_digest recalculé — non tautologique.** `computeScores` rejoué (`analyze.mjs`) **sur le brut** (avec `emode_lt` que J'AI décodé de `emode_raw` via `decodeEModeCategoryData`, 15 catégories, == fixture) **ET sur la fixture réduite** : les deux donnent **n=797, p=791, q̂=364550606513851, calib_digest=`668ab214925c3e76ef4e0e68d3b6d564d6b57b6b88d7d12c8919c2ae18dd9d0a`** (== pin). Field-diff brut vs fixture sur la **projection lue par le réducteur** (5 scalaires + montants aWETH/vWETH) = **0/16096** ⇒ réduction **fidèle** ; les 15 389 comptes qui diffèrent sur les balances complètes = **entrées de dette non-WETH élaguées** (le réducteur ne les lit pas). **La fixture reproduit le brut ; le pin n'est pas maquillé.**

**Ancrage HF(D_e) sur `hf_onchain`** : robuste. J'ai recalculé l'éligibilité par la formule ancrée ET par `wadDiv` direct (recompute non ancré) sur les 16 096 comptes ⇒ **eligible_under_De = 770 dans les deux cas, 0 désaccord** ⇒ le choix d'ancre (hf_onchain autoritaire vs recompute) **ne bascule aucune éligibilité** (pas de cherry-picking par l'ancre). Valorisation WETH juste : mono-collatéral **9482/9482** ont `aWethBal·p0/1e18 == total_collateral_base (±100)`. Limitation « collatéral non-WETH corrélé-ETH tenu à p0 » : **20/23** des `liquidated_not_eligible_under_De` sont multi-collatéral (décodage `user_config`) ⇒ limitation **correctement déclarée comme résiduel data-backed** ; direction confirmée : tenir le collatéral non-WETH à p0 ne peut que **SOUS-estimer** l'éligibilité (les 23 ratés), jamais fabriquer les 608 faux-positifs.

**q̂ « structurel » : score sensé mais région quasi-vide — À DIRE EN CHIFFRES, ne pas ré-adjuger.** q̂ = 364550606513851 (~$3,65 M base 8 déc.). **q̂ n'est PAS le max** : à n=797, p=791 < n ⇒ **6 scores strictement au-dessus de q̂, 1 égal, 790 en-dessous ; couverture 791/797 = 99,25 % ≥ 99 %** (conforme, α=0,01). Les 6 « échappées » : 5 sont Y=0 (faux-positifs whales, score=ŷ) + **1 vraie liquidation** (`0x984292…`, score 368763614218023 > q̂ ⇒ sa région rate son Y). ŷ (dette totale) vs Y (remboursé ~50 %, close factor) ⇒ même une liquidation parfaite score ~50 % de la dette ; les 608 faux-positifs (Y=0) pilotent q̂. **790/797 comptes ont ŷ ≤ q̂ ⇒ la région ŷ±q̂ couvre 0** ⇒ calibration **statistiquement valide mais quasi-non-informative** pour la question binaire « sera-t-il liquidé » : c'est un **RÉSULTAT à énoncer dans ADR-U4** (q̂, couverture 99,25 %, 790/797 couvrant 0, 6 échappées), **pas un défaut G2** (changer le score maintenant serait post hoc — le score |Y−ŷ| avec ŷ=dette totale est prereg'd P-1/C-2). **Mais** C-2 disait « q̂ = score maximal » : **faux à n=797** ⇒ C-G2-2.

**Les 3 mutants A-4 sont de vrais tueurs (non tautologiques)** — chacun change une éligibilité RÉELLE, pas seulement le digest : D_e ignoré (p_min=p0) ⇒ 770→**64** ; LT_W←0 ⇒ 770→**59** ; Y altéré ⇒ un score change. eligible_under_De=770 ≫ 64 prouve que le recompute p_min est load-bearing (pas l'identité d'ancre tautologique). Rejoués en mutation SOURCE ci-dessous (M-G2-1/2/3), tous ROUGES.

## 5. Fuite (point 5) — D-8 confirmé, 0 secret

Contrôle refait avec le motif correct **`https?://|chainstack|p2pify|api-key`** :
- **Bruts hors dépôt** (U4-book.raw, U4-inputs, U4-oracle-path.raw, U4-oracle-inputs, U4-filter, U4-probe) : **0** pour les 6. D-8 confirmé : sur le book brut, « http » nu = **66**, dont **66/66 = le nom de champ JSON `"http":`** (`RpcErrorRecord.http`, code de statut), **0 `://`** ⇒ ce sont des codes 429, pas des URL/secrets. (Note : le « 0 run hex ≥ 26 » de D-8 est vide de sens — toute adresse fait 40 hex ; ne pas s'y fier.)
- **Fixtures dépôt** (u4/*.json,jsonl) : **0** pour les 3.
- **Fichiers dépôt src/test/scripts** : hits présents mais **tous bénins, classés un par un** : `record.ts:30` = commentaire (`?api-key=`) ; `rpc2.ts:250-251` = URL keyless PUBLIQUES (drpc/mevblocker/blastapi/nodies/tenderly, sans clé) ; `u4-oracle-path.mjs:120` = commentaire ; `ukemi-u4a.test.ts`/`ukemi-record.test.ts` = **fakes de test** (`FAKEKEY_deadbeef`, `api-key=K`) que les tests **assèrent scrubbés**. Chasse au secret réel (chainstack.com/<clé>, p2pify.com/<clé>, api-key=<valeur>) : **0** (seul `api-key=K` du test unitaire scrubUrls). Gate `no-secret-in-repo` (patterns haut-signal, non-vacuité prouvée, walk complet) = **VERT**.

## 6. D-10 — fixture 5,96 Mo (point 6)

**`series_pinned_are_declared_and_hashed` est ROUGE** (mesuré, `test/ci-gates.test.ts:1113`) : « series file not declared+hashed same-dir: …/u4/U4-book-23545087.json (sha256 LF 743e9499…). Add a PROVENANCE-*.md line ». Ce test **walk le working tree** sous `apps/sentinel/test/fixtures` et exige chaque `.json/.jsonl/.csv` déclaré+haché same-dir. **`PROVENANCE-u4.md` est ABSENT** (le répertoire ne contient que les 3 fixtures) — c'est un **livrable A-3 manquant**, latent car `npm run ci` non lancé. ⇒ **C-G2-1 (bloquant)**.

Le chemin **EST** couvert par la **R-25** (`SERIES_EXCLUDED_ROOTS` inclut `apps/sentinel/test/fixtures` ; pathspec `:(exclude,glob)apps/sentinel/test/fixtures/**/*.json` — vérifié) pour le **comptage de lignes**, mais **PAS exempt de `series_pinned`** (déclarer+hacher) — d'où la rougeur. Les deux sont orthogonaux.

**Option la plus sobre, non tautologique (recommandation, R-20)** : **GARDER les 16 096 comptes**. La cellule (770 éligibles sous D_e) **dérive** de la population complète ; une fixture « cellule seule » (797) rendrait `eligible_under_De=770` / `eligible_static_b0=64` **tautologiques** (on épinglerait l'appartenance au lieu de la dériver en CI). La fixture actuelle est déjà fidèle (projection réducteur byte-identique) ; un élagage minimal (retirer user_config/eligible_static/ltv_bps, ne garder que champs-réducteur + balances aWETH/vWETH) économise ~13 % (5,96→**5,19 Mo** mesuré) — marginal, et perd l'audit multi-collatéral (user_config). **Donc** : garder la fixture, **CRÉER `PROVENANCE-u4.md`** (corrige C-G2-1) épinglant les 3 shas fixture **+** le sha du **book brut** (`8f620f6c`), du **cache** (`09968df1`) et de l'**oracle brut** (`7b87f6d3`) — le `book_digest` autoritaire (695d862f) est vérifié par le **rejeu du cache** (§4), pas par le champ `book_digest` de la fixture réduite (qui est une **copie-référence** ; la fixture est une projection *lossy* — les balances de dette sont élaguées, à dire dans la PROVENANCE). Réduire à la cellule = **refusé** (tautologique). Si la taille git est un blocage dur → git-lfs (le fichier reste requis au moment du test).

## 7. D-11 / R-25 (point 7) — découpe C-10

**Recalculé exactement (pathspec ci.yml `CHANGED=ins+del`, base b1302db)** :
- Tracked (diff) : abi 37+0, record 258+38, rpc2 37+10, ukemi-record.test 3+3 = **386** (335 ins + 51 del).
- Untracked comptés : resume **157**, ukemi-u4a.test **236**, ukemi-u4-scores.test **94**, u4-probe **152**, u4-oracle-path **163**, u4-scores **142**, u4-scores.d.mts **31** = **975**.
- **Total = 1361 > 1205** (== annoncé). Sans les 4 scripts census (488) ⇒ **873**. Fixtures u4/ + `docs/**/*.md` exclus (mesuré). L'exclusion `scripts/census/**` de R-25 = **dérogation de gate** touchant `ci.yml` (niveau investisseur) ⇒ **la découpe C-10 est préférée** (confirmé).

**Seam proposé (dépendances d'import vérifiées) — chaque sous-lot VERT SEUL, ordre α → β** :
- **U-4a-i-α (fusion 1)** = { `abi.ts`, `record.ts`, `rpc2.ts`, `ukemi-record.test.ts` (tracked, 386), `resume.ts` (157), `ukemi-u4a.test.ts` (236), `u4-probe.mjs` (152) } = **931 ≤ 1205**. R-25 α = 931. **Vert seul** : `abi.ts` DOIT être ici (les additions D_e — `ANSWER_UPDATED_TOPIC0`/`decInt256`/`decodeEModeCategoryData` — sont **testées** par `ukemi-u4a.test.ts` `u4_de_selectors…`/`u4_decode_emode…`) ; `u4-probe` importe record/rpc2/abi/clusters/resume (tous α) ; les tests α utilisent `weth-book.fixture.json` (déjà en dépôt) — **aucune fixture u4/ requise**. `ukemi-u4a.test.ts` **n'importe pas** `u4-scores` (vérifié : 0).
- **U-4a-i-β (fusion 2, SUR α)** = { `u4-scores.mjs` (142), `u4-scores.d.mts` (31), `ukemi-u4-scores.test.ts` (94), `u4-oracle-path.mjs` (163) } + fixtures u4/ (R-25-exclues) + `PROVENANCE-u4.md` (~10 l.) = **~440 ≤ 1205**. **Vert sur α** : `u4-oracle-path.mjs` importe `record.ts`+`abi.ts` (D_e) de α ⇒ **exige α d'abord** ; `u4-scores.mjs` n'importe que `wadray.ts` (en dépôt, inchangé) ; `ukemi-u4-scores.test.ts` lit u4-scores + fixtures u4/ + U3-realized (en dépôt). `series_pinned` vert **une fois `PROVENANCE-u4.md` ajouté dans β**.
- **Ordre de fusion : α PUIS β** (β dépend de α via record+abi ; α indépendant de β). 931 + 440 ≈ 1371 ≈ total (l'écart = PROVENANCE-u4.md ~10 l., un `.md` **hors `docs/`** donc **compté** par R-25 — à noter).

## 8. Branchement / CA-11 (point 8)

**Rien de nouveau `built` — conforme à l'annexe U-4a.** Diff hors ukemi/census/PLI = **NÉANT** ; `gate.ts`, `registry.ts`, `calibration.ts` (A-5), `attestation-binding.ts`, `version.ts`, `adapter-book.ts` (A-6), `liquidable-24h.ts` (A-7), `apps/site` = **tous intacts** (diff vide, vérifié). Donc **A-5/A-6/A-7 NON faits** — cet état est **U-4a-i (A-1..A-4) seul**.
- **calib_digest** (`668ab214`) : consommé **uniquement** par son propre test `u4_calibrates_from_u3_realized_labels` ⇒ **« upcoming », pas « built »** (correct). Son consommateur servi (entrée `UKEMI_REALIZED_E2` de `calibration.ts` → gate) est **U-4a-ii / U-4b**, absent ici.
- **book** / **D_e** : consommés uniquement par les tests A-4 (réducteur + monotone). Pas de chemin servi (`fromRealizedBook` A-6 absent). Correct (annexe).
- **DÉFAUT C-G2-7** : **`ADR-U4` (A-8) est ABSENT** ⇒ la règle de branchement « chaque ADR de pièce déclare ses tuyaux (entrée/sortie/état/test) » n'est **pas satisfiable** pour ce lot. Les tuyaux sont dans G0 §Tuyaux + PLI, mais **aucun ADR de lot**. Un G7 (même sur U-4a-i) exige l'ADR déclarant : entrée (labels U-3 + book B₀ + D_e), sortie (calib_digest → `calibration.ts`, produite en aval), état (fixtures u4/ + bruts hors dépôt), test (`u4_calibrates_from_u3_realized_labels`), et le statut **« upcoming »** explicite.

## 9. Oracles (un à un) + mutants (point 9)

**Oracles** (tous rejoués, pas `npm run ci`) :
| oracle | résultat |
|---|---|
| tests ukemi (u4a + u4-scores + ukemi-record + ukemi) | **49 pass / 0 fail** |
| `no-secret-in-repo` | **PASS** (non-vacuité prouvée) |
| `typecheck` (tsc --noEmit) | **exit 0** |
| eslint (fichiers .ts touchés) | **0 erreur**. **Note (convention, pas défaut)** : `eslint.config.mjs:30,38-40` ignore **tous** les `**/*.mjs` par design (« type-checked linter only sees the project's TypeScript; out-of-program JS/MJS/CJS are ignored » ; `--no-ignore scripts/census/u4-*.mjs` **erreure** — les règles type-aware exigent le programme TS). Donc les 3 scripts census sont ignorés par la MÊME convention que tous les `.mjs` du dépôt (u3-realized.mjs, etc.) ; le réducteur load-bearing reste couvert par **typecheck** (types via `u4-scores.d.mts`) **+ tests** (u4-scores 3 tests + mutants). « lint 0 » du G0 satisfait sans triche. |
| `gate:vocab` | OK (173 fichiers, 0) |
| `lint:ratchet` | **69/69** |
| `export:check` | OK |
| `lang:gate` | OK |
| **`series_pinned_are_declared_and_hashed`** | **ROUGE** ⇒ C-G2-1 |

**Mutants — tous TUEURS (mutation SOURCE, restauration byte-exacte par buffer sauvegardé + sha256, JAMAIS `git checkout` ; `git status` inchangé après)** :
| # | mutant | cible | test | résultat |
|---|--------|-------|------|:---:|
| M-G2-1 | Y altéré (drop `deficit_base`) | u4-scores.mjs:49 | u4-scores | **RED** |
| M-G2-2 | D_e ignoré (`hfMin<WAD`→`hf0<WAD`) ⇒ 770→64 | u4-scores.mjs:78 | u4-scores | **RED** |
| M-G2-3 | LT_W←0 (`ltWeth=0n`) ⇒ 770→59 | u4-scores.mjs:69 | u4-scores | **RED** |
| M-G2-4 | décodeur e-mode bare-tuple (`base=0`) | abi.ts:176 | u4a | **RED** |
| M-G2-5 | decInt256 non signé | abi.ts:101 | u4a | **RED** |
| M-G2-6 (mien) | drop filtre `event_id !== E2` | u4-scores.mjs:47 | u4-scores | **RED** (n≠797) |
| M-G2-7 (mien) | drop `cell.add(liquidated)` ⇒ n=770 | u4-scores.mjs:87 | u4-scores | **RED** |
| M-G2-8 (mien) | flip 1 hex d'un `ethCall.result` (cache scratch) | — | rejeu book | **book_digest→82c1e951** (garde holders NE tire PAS ; couvert par le pin book_digest) |
| M-G2-9b (mien) | flip `holders_digest` cache (scratch) | — | rejeu book | **`ResumeCacheError` (abstention)** |

Byte-exact : shas PRE == POST (`u4-scores.mjs 1adc054f…`, `abi.ts 3376eb08…`) ; `git status` identique (4 modifiés + mêmes non-suivis, rien de neuf). Mutants cache sur **copie scratch uniquement** (bruts et worktree jamais touchés). Aucun mutant tautologique : chacun vise une propriété distincte (calcul de Y, éligibilité D_e, LT WETH, décode e-mode, signe int256, portée événement, appartenance cellule, intégrité cache par-compte, intégrité énumération).

---

## Défauts (liste fermée) — C-G2-n

| # | sévérité | fichier:ligne | constat | correction minimale | error_origin |
|---|----------|---------------|---------|---------------------|--------------|
| **C-G2-1** | **BLOQUANT** | `apps/sentinel/test/fixtures/ukemi/u4/` (manque) ; `test/ci-gates.test.ts:1113` ROUGE | `PROVENANCE-u4.md` absent ⇒ 3 fixtures orphelines ⇒ `series_pinned` rouge (non vu : `npm run ci` non lancé) | créer `PROVENANCE-u4.md` : `U4-book-23545087.json`=`743e9499f81055bec7ab4f6b9cb5fb27347b94cf85b40eb93fc63cebb9f1ec87`, `U4-oracle-path-e2.jsonl`=`970357153ff60e305c8c6818439358db0140dc72d2eb538d5efbdf944b15daed`, `U4-scores-e2.jsonl`=`e80386c6cd0ba200699fdb011370ae86b109b4711a9ab9f5f2ff35a0d52fda97` (chaque nom + sha LF **même ligne**) + shas bruts (book `8f620f6c`, cache `09968df1`, oracle `7b87f6d3`) | **worker** (livrable A-3 omis) |
| **C-G2-2** | correction | `docs/CHECKPOINT1-lot-u4.md:45,57` (C-2) ; à répercuter dans ADR-U4 | « q̂ = score maximal de la cellule » **faux à n=797** (p=791<797 ; 6 scores > q̂, 1 = q̂ ; couverture 791/797=99,25 %) | ADR-U4 : « q̂ = 791ᵉ plus petit score, 6 échappées, couverture 99,25 % ; région ŷ±q̂ couvre 0 pour 790/797 (quasi-non-informative) » — jamais « max » | **checkpoint-1** (C-2 supposait n≤198 ; n=797 mesuré l'invalide) |
| **C-G2-3** | correction | `apps/sentinel/test/ukemi-u4-scores.test.ts:58-71` | assère la forme D-9 (106/107, non ratifiée), pas la forme prereg/C-4 (69/107) ; le NON 69/107 n'est qu'en commentaire | ajouter une assertion épinglant 69/107 (union 77/107) comme **NON enregistré** (regression-guard) ; laisser la ratification D-9 au checkpoint-2/advisor-defi (R-20) | **worker** (critère basculé sur la forme passante) |
| **C-G2-4** | correction | `docs/PLI-lot-u4a.md` D-9 (§8) ; commentaires u4-scores/test | mécanisme « updates multiples par bloc / logIndex intra-bloc » **contredit par les données** (0 cas ; 37 = retard bloc-antérieur) | restater : « le proxy SVR `getAssetPrice` retarde le flux `AnswerUpdated` d'≥1 bloc » (cas 23549850 : gp=390044087065=update@23549845≠dernier≤b@23549848) ou marquer « non expliqué » | **worker** (mécanisme plausible mais non mesuré) |
| **C-G2-5** | correction / item formé | course D_e (`u4-oracle-path.mjs`) | C-4 exigeait D_e ⊇ dernier update ≤ B₀ ; `first_update=23545382 > B₀=23545087` (= le 1/107 : p0 @23545088) | récupérer le dernier `AnswerUpdated` ≤ B₀ (1 `getLogs` off-tool sur [<B₀]) et le préfixer, OU déclarer explicitement p0-du-book comme valeur pré-fenêtre et amender C-4 (immatériel à p_min car p0 > p_min) | **worker** (getLogs D_e planché à ~B₀, pas de recherche pré-B₀) |
| **C-G2-6** | correction | `scripts/census/u4-scores.mjs:13-15,69,72` ; PLI §5quinquies | 12 des 42 comptes e-mode in-cell sont **non-cat-1** (dist {1:30,2:7,11:3,19:1,23:1}), **tous eligibleDe** ⇒ l'hypothèse C-3 « WETH est le collatéral e-mode » pilote leur calibration ; « clamps=0 ⇒ aucune surestimation » **trop fort** (clamps ne capte que riskAdjMin<0) | compter les 12 comme résiduel nommé dans ADR-U4 ; soit lire le bitmap collatéral de la catégorie (off-tool, 1 champ v3.2) pour confirmer WETH∈catégorie, soit marquer les 12 `non_evaluable` et compter | **worker** (résiduel non détaillé ; affirmation surétendue) |
| **C-G2-7** | correction | `docs/adr/ADR-U4-*.md` (manque) | ADR-U4 (A-8) absent ⇒ tuyaux non déclarés dans un ADR de lot (règle branchement) | écrire ADR-U4 (ou ADR-U4-i) : entrée/sortie/état/test + statut « upcoming » (rien built) ; requis avant G7 | **worker** (A-8 différé « après course » ; courses faites) |

**Décisions ORCHESTRATEUR / checkpoint-2 (R-20, hors mon ressort)** : (1) **ratifier/rejeter D-9** (advisor-defi/checkpoint-2) ; (2) **D-10** — recommandation §6 (garder 16 096 + PROVENANCE ; pas cellule-seule) ; (3) **D-11 seam** — α→β §7 (vs dérogation `scripts/census/**` non retenue).

## Provenance / reproduction
Tout rejouable, aucun réseau : `F:\tmp\u4a\g2\{replay-book.mjs (book_digest), analyze.mjs (H1-H7+calib), refine.mjs (field-diff+sizing+e-mode), h6.mjs (D-9), mutate.mjs (7 mutants source), cache-mutants.mjs (2 cache)}`. Copie de cache `U4-inputs.copy.jsonl` (sha `09968df1…`, == brut). Worktree et bruts **inchangés** (bruts lus en partagé ; sources source-mutées puis restaurées byte-exact, sha PRE==POST). Aucun commit, aucun workflow (R-20). Sortie destinée à vérification adversariale de l'orchestrateur (R-21).
