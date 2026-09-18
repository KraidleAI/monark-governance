# Audit du mémo « Prochaine pièce après Narabi et ACI » (Grok, 2026-09-18) — G0 de portefeuille

- **Demande investisseur** : « auditez-la ; trouvez ce qu'on doit faire ; on avait étudié d'autres stables, si on doit enrichir, on le fait, tôt ou tard ».
- **Instances** : advisor-defi (`claude-fable-5-1`, Bash vérification), advisor-marché (`claude-fable-5-1`), chercheur (`claude-sonnet-5`, archive
  `docs/biblio/next-piece-2026-09-18/` : FAITS-memo, INVENTAIRE-stables, SOURCES), orchestrateur (vérification RPC du fait pivot).

## 1. Ce que le mémo a de juste (vérifié)
- §2 day-zero : exact chiffre pour chiffre contre `state.json` / `timeline.jsonl` (C1 recalculée). Rang 0 (« laisser la sentinelle écrire T »),
  interdiction de switcher le gate sur q_t, « ne pas raconter que Narabi a vu le −74 % » : exacts et conformes à ADR-M012.
- Actu Aave IRM 2026-09-11 : chiffres exacts (Core 450,4 M → 117,5 M, −73,9 % ; utilisation 63,1 % → 17,8 % ; base 6,00 → 6,30 %) [lu].
  Correction : « base rate 0 → 6 % » non soutenu (escalier 2 → 3 → 4 → 5 → 6,00 → 6,30 % du 24/08 au 11/09) ; « supply 713 → 661 M » présent ;
  cause = politique de taux (alignement sur le rendement sUSDe), **53 % de la dette réduite re-empruntée en USDC/USDT par les mêmes comptes** :
  un changement de devise de dette, pas un run, aucune liquidation mentionnée.
- Koyomi recalé rang 3 : accord (loi USDC ≠ burn Ethena).

## 2. Ce qui est faux ou non câblé — le rang 1 (Ukemi ← file + book Aave) est rejeté dans cette forme
1. **Fait pivot, vérifié par l'orchestrateur en direct (2 fournisseurs RPC, 2026-09-18)** : `AaveOracle.getSourceOfAsset(USDe)` =
   `0xc26d4a1c…` « **Capped USDT/USD** » ; `getSourceOfAsset(sUSDe)` = `0x42bc86f2…` « **Capped sUSDe / USDT / USD** » (ARFC 20495, Snapshot
   2025-02-09). Un choc de prix secondaire sur USDe **ne se propage jamais** au health factor : la cible gelée d'Ukemi (« liquidable sous choc
   de prix x %, 24 h », ADR-M002 D9) a un outcome réalisé ≈ 0 sur ce livre **par construction** — le 10-11 oct. 2025, zéro liquidation sur
   ~1 Md$ de USDe Aave pendant que Binance affichait ~0,60 $ (LlamaRisk 2025-10-18). C'est msUSD à l'envers : `under_calib` indéfiniment,
   book attesté ou non.
2. **Pas de câble** : `liquidableAmount(positions, shock)` (`packages/ukemi/src/liquidable.ts`) ne consomme aucun flux ; l'outil `cascade` prend
   un graphe `{L, e, shock}` ; ADR-M008 D-Surface l'écrit déjà (« liqThreshold et debt non dérivables d'AttestedFlow »). « AttestedFlow + book
   → ŷ » n'a aucun modèle `v → shock` sourcé (ADR-M002 D9(ii) : dynamique 24 h NON TROUVÉE). « Queue » n'existe pas dans `Position`.
3. **Deux books confondus** : « dette USDe » (USDe emprunté, l'actu) ≠ « collatéral USDe/sUSDe » (les loops, seul livre où un run compte).
4. **Coût** : un book par position = énumération des emprunteurs + `eth_call` archive par compte au bloc N (10³–10⁴ appels/jour × quorum 2)
   sur un pool public hostile à l'archive (leçon FDUSD §6) ; ce n'est pas « un adapter ». Le niveau réserve (3 appels) ne donne aucun HF.
5. **Vocabulaire** : « book absent → `under_calib` » est faux ; la raison gelée serait `attestation_absent`/`binding_broken` ; `under_witness`
   n'existe pas dans l'enum. « ACI tracker fantôme » est faux : `trackerStep` tourne chaque jour ; « pas dans le gate » est une décision (D3).
6. **Marché (advisor-marché)** : demande non démontrée. Le payeur structurel (Aave DAO, ~3,5 M$/an à LlamaRisk, epoch 4) rémunère un titulaire
   qui revendique « liquidation cascades » et le freeze guardian USDe ; les agents ont le HF gratuit (Aave MCP 2026-09-08, Anthias, DefiLlama).
   Le G7 UKEMI du 2026-09-03 (« pas de G0 Ukemi sans acheteur nommé formulant une exigence de couverture ») n'est rouvert par rien.

**Ce qui rouvrirait Ukemi-Aave** : (a) Aave bascule USDe sur un feed sensible au spot (dual-feed / freeze guardian live) ; (b) un acheteur nommé
formule une exigence de couverture sur « liquidations réalisées 24 h » ⇒ redéfinition de cible par ADR = **escalade investisseur**.

## 3. La 2ᵉ clé Narabi (« enrichir ») — table §5 du mémo corrigée, candidats à MESURER (jamais committer avant)
Le test « C1 échoue → refuser » du mémo **ne discrimine pas** : GHO émet bien `Transfer→0x0` (`GhoToken.burn` → `_burn`, Exact Match Etherscan).
Le test qui discrimine est la **loi de rachat** (une seule voie, Diamond–Dybvig) mesurée par **décomposition des burns par brûleur** (`from`).

| Candidat | Fait établi | Verdict |
|---|---|---|
| **FDUSD** | scouté [lu] (`SCOUTING-F-fdusd.md`) : brûleur unique, run 2025-04-03 = 8,37 %/24 h, calme 1,30–3,69 %, séparation 2,3–6,4× ; supply ÷10 depuis | **1er à mesurer** (seul avec churn calme + run reconstruits) ; réserve : supply non stationnaire |
| **sUSDe** | `cooldownShares` → `_withdraw` ERC-4626 ⇒ probable `Transfer→0x0` à l'**entrée dans la file** (à confirmer sur un tx) ; loi ≠ USDe (cooldown 1–7 j) | **2ᵉ à mesurer**, classe distincte « entrée de file », en amont du burn USDe, adjacent à l'exposition Aave payée ; jamais poolé |
| **USDtb** | même rail Ethena, backing BUIDL (loi calendaire possible), aucun stress connu | 3ᵉ : calibrable mais intestable (risque msUSD inverse : trop calme) |
| **GHO** | 4 lois sous un topic : repay Pool (facilitator aToken), flash mint+burn même tx, GSM (seul analogue rachat), DirectMinter | décomposition par `from` ; **refus attendu** comme population unique (désendettement ≠ file) ; sous-population GSM petite, plafonnée |
| USDC | `FiatToken.burn` onlyMinters émet Transfer(0) ; **CCTP `TokenMinter.burn` = même topic** (confound plus gros que le calendrier) ; Circle « next business day » [lu] | après séparation Circle/CCTP par brûleur **et** Koyomi |
| DAI/USDS | ≥ 4 lois (`DaiJoin.join` brûle à toute entrée Vat : repay, DSR, `LitePSM.trim()` batché ; CDP ~12 % [ARK, 2nd]) | refus du pool : juste, raisons corrigées |
| USDT | source déployée non lue (sourcify 403), miroirs divergents sur `Transfer(0x0)` dans `redeem` | indéterminé ; C1 en une fenêtre le tranche |
| USR | burn 1:1 mais fenêtre 24 h + exploit 2026-03-22 (burns de remédiation) | mesurable seulement après isolement de cette fenêtre |
| deUSD, USDX | runs terminaux nov. 2025 (USDX ≈ 0,0088 $ au 2026-09-18) | tests hors-échantillon `attestor_terminated`, jamais calibration |
| USD0, frxUSD, crvUSD, LUSD/BOLD | plusieurs voies de rachat | refus (deux lois) |
| USDe L2 | OFT lock-and-mint, aucun burn natif | hors classe |

Divergence adjugée : le chercheur classe GHO premier (« structurellement propre » = Transfer garanti par le code) ; l'advisor-defi le place en
refus probable (loi). La calibration porte sur une **loi de rachat**, pas sur l'émission d'un topic : l'ordre retenu est FDUSD → sUSDe → USDtb,
GHO en exercice de décomposition seulement.

## 4. Décision proposée (ordre)
- **Rang 0 (inchangé)** : la sentinelle écrit T ; aucun switch sur q_t ; publication (l) à T ≥ 7 sous go.
- **Rang 1 — deux census, zéro commit, protocole F2-B réutilisé** (seuils pré-enregistrés avant pull, C1 par fenêtre, sha-pin, quorum 2
  fournisseurs revalidé par token) :
  - **(B) burns décomposés par brûleur** sur FDUSD, puis sUSDe (`cooldownShares` → Transfer→0x0 ?), USDtb, GHO ; motif `usde-full-pull.mjs`
    (`top byFrom` existe déjà) ; détection mint+burn même tx ; churn calme ; run nommé held-out. **Première mesure à lancer.**
  - **(A) `LiquidationCall` Aave V3 Core** filtré `collateralAsset ∈ {USDe, sUSDe, PT-*}` et `debtAsset = USDe`, Σ `debtToCover` par fenêtre UTC
    depuis le listing, hypothèse pré-enregistrée y ≈ 0 sur le premier filtre (y compris 10-11 oct. 2025). Ferme définitivement la question
    Ukemi-Aave sur pièces, à faible coût (`eth_getLogs`, pas de `eth_call` par compte).
- **Rang 2 (selon (B))** : 2ᵉ clé = la population qui passe loi + C1 + churn calme + épisode held-out → lot F2-C sur le modèle F2-B (nouvelle
  clé, jamais poolée, refus si dégénéré) ; page `/narabi` devient multi-population (vue, pas score).
- **Rang 3** : Koyomi avec une clé USDC (après séparation Circle/CCTP).
- **Jamais dans cette forme** : Ukemi live Aave sur la cible « choc de prix ». Réouverture = escalade (redéfinition de cible par ADR + acheteur nommé).
- **Demande** : lire M1 (journal d'accès Caddy, actif depuis 09:33 UTC) sur 30 jours après l'annonce ; M3 envois directs aux entités nommées.
  Falsifiable : ≥ 3 clients externes distincts non-crawlers × ≥ 10 fetches, ou une entité qui demande une population précise ⇒ mesure ouverte.

## 5. Procurements formés (côté externe, chercheur/advisors)
Rapport d'exécution AIP 262 (sortir « oracle USDT » du [2nd] côté gouvernance — le fait on-chain est [mesuré]) ; source primaire Aave V4 × Ethena
datée 2026-09-07 ; docs StakedUSDeV2 + un tx `cooldownShares` avec logs ; source déployée `TetherToken.redeem` ; rémunération du Risk Committee
Ethena (5ᵉ mandat) ; part Pool vs GSM des burns GHO (= census (B)) ; catalogue x402 Bazaar (pricing par appel).

## 6. Rectificatif après census (A) et (B) — 2026-09-18, chiffres recalculés par l'orchestrateur sur les JSONL
- **A-H1 est FALSIFIÉE à la lettre** : sur le filtre collatéral USDe/sUSDe/PT, 64 jours sur ~470 portent des `LiquidationCall`, dont **2 jours
  ≥ 1 M$** : 2025-02-21 (≈ 21,4 M$, 5 événements, boucles ~100 % sUSDe au HF ≈ 1,003, oracle sUSDe en baisse de 2,2 %) et 2026-01-19 (≈ 3,3 M$).
  Le §2.1 ci-dessus est donc **trop fort** : le feed « Capped USDT/USD » borne le **haut** et laisse passer les décotes qui atteignent le feed
  (USDT/USD, taux de change sUSDe) ; ce qu'il ne propage pas, c'est la **dislocation du marché secondaire USDe** — mesuré le 2025-10-10/11 :
  oracle USDe 1,0003 $ / sUSDe 1,2020 $ pendant que Binance affichait ~0,60 $ ; liquidations F1 ≈ 43,6 k$ puis 17 $.
- **Conséquence inchangée sur la décision** : l'outcome réalisé « liquidations 24 h sur collatéral USDe » est **zéro-inflaté** (≈ 86 % de jours à
  zéro, deux jours matériels en 16 mois) : une calibration de `cascade-liquidable-24h` sur y_t serait dominée par les zéros (NDG-1, ADR-M011) ;
  pas « nulle par construction », mais **dégénérée par parcimonie**. Le rang 1 du mémo reste rejeté dans cette forme ; la réouverture exige un
  acheteur nommé et une cible redéfinie par ADR.
- **A-H2 tenue** : Spearman(y_t F2, v_t) = 0,14 sur 497 jours (dégénéré par les ex æquo à zéro ; 0,48 sur les 32 jours à liquidation).
- **(B) — populations** : FDUSD brûleur unique 100 %, run 2025-04-03 = 8,32 %/24 h, C1 0/271, mais churn calme quotidien médian **0 %** (rachats en
  rafales ; médiane des jours non nuls 0,50 %/j) ⇒ B-H1 partielle. sUSDe : `cooldownShares` brûle les parts (3/3 tx, `totalSupply` décroît),
  `unstake` n'émet rien ⇒ **B-H2 confirmée**, classe « entrée de file » distincte. USDtb (`0xC139…aC1C`, fourni par l'investisseur, vérifié
  eth_call) : top-1 brûleur 97,7 %, churn calme médian 0 %, pics à 37,8 %/24 h ⇒ B-H3 confirmée, risque q̂ = 0. GHO : 100 % flash mint+burn même
  tx sur 90 j, 0 % repay, 0 % GSM ⇒ **B-H4 refus confirmé**. Intégrité : 481 fenêtres (B) + 598 chunks (A), 0 désaccord de quorum, 0 échec C1.
- **Ordre pour la 2ᵉ clé, après mesure** : aucune population ne reproduit le profil USDe (churn calme quotidien non nul). FDUSD garde le meilleur
  dossier (run reconstruit, brûleur unique, C1) mais son churn en rafales impose une fenêtre plus longue que 24 h ou une classe « rafale » à
  pré-enregistrer ; sUSDe est la vraie nouveauté (file en amont, 437 brûleurs, adjacent à l'exposition Aave) et mérite le scouting complet
  (churn calme, épisode 2025-10 held-out) avant tout G0 ; USDtb et GHO sont écartés. **Aucun commit de calibration** : décision investisseur sur
  « FDUSD (fenêtre à pré-enregistrer) ou sUSDe (scouting F2-style) » avant tout lot.
- Données : `docs/census-2026-09-18/data/` (A-rawlogs.jsonl, 11 Mo, hors dépôt : sha256 `d0f4aa1e…a996` dans le rapport A, régénérable par le script).
