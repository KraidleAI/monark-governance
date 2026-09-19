# Avis advisor-marché (Fable 5.1) — payeur de l'objet Ukemi B (`cascade-liquidated-debt-24h`), 2026-09-19
Conseil, pas verdict. Sources en pied.

## Qui subit la perte que B mesure
Perte **emprunteur** (bonus + slippage), pas shortfall protocole. Census A [lu] : 2025-02-21 21,4 M$ liquidés (boucle sUSDe, HF 1,0031) ; 2026-01-19 3,3 M$ ; bad debt protocole = 0 ; 465/497 jours à Y=0. Les grands événements payants 2025-26 ne sont pas des cascades de prix : rsETH/KelpDAO (2026-04-18, ~177-230 M$ bad debt, collatéral volé) [abs] ; Stream/xUSD (nov. 2025, oracle figé, pertes curateurs Morpho/Euler) [abs] ; CAPO (2026-03-10, ~27 M$ remboursés par le DAO, 512,19 ETH) [abs] = résidu `capo_oracle`. **Désalignement objet/payeur** : B mesure la perte du looper ; ceux qui paient portent le shortfall.

## Précédents de pricing (mesure de risque tierce)
| Acheteur | Vendeur | Montant | Niveau |
|---|---|---|---|
| Aave DAO | Gauntlet | 2,0 M$/an (2022-23) → 1,6 M$/an ; départ 2024 | [lu]/[abs] |
| Aave DAO | Chaos Labs | 1,5 M$ (2023) → 3 M$ (2025) ; 5 M$ offerts / 8 M$ demandés ; 3 ans à perte ; départ 2026-04-06 | [lu] |
| Aave DAO | LlamaRisk | 250 k$ → 400 k$/6 mois → 3,5 M$/an (2026-04-14), Aave-exclusif | [lu] |
| Compound DAO | Gauntlet | 2,3 M$ fixe (Y5, 2025-09 → 2026-09), 50 déploiements, fonds d'insolvabilité 30 % remboursable | [lu] |
| Sky/Maker | Risk CU | 546 k DAI/trimestre | [2nd] |
| Curateurs Morpho | Credora (RedStone) | gratuit DAO, opt-in ; sortie = probabilité de perte A+..D | [lu]/[abs] |
| Looper | DeFi Saver | 0,05 % du montant — exécution, pas mesure | [lu] |
| Looper | Nexus Mutual | 9,6 M$ actifs [2nd] ; termes illisibles (procurement) | [2nd] |
**Constat** : tous les paiements sont côté DAO/protocole, 1,6–3,5 M$/an pour un mandat complet ; **aucun looper/desk ne paie pour une mesure** (ils paient exécution ou couverture). Pricing du doc produit (10-20 % bonus, 2-8 bps, 2-10 k$/mois) : zéro précédent → demande non démontrée.

## Encombré / gap
Simulation de cascade encombrée (Chaos stETH depeg + Curve, Collateral-at-Risk ; Gauntlet ABS Monte-Carlo ; Credora 100k trajectoires) [abs]. **Gap réel = packaging** : point fixe étiqueté, couverture conforme intra-événement, octets rejouables — une garantie vérifiable, pas une simulation de plus. Incumbent académique emprunteur : arXiv:2604.14583 « From Risk to Rescue » [abs]. Aucun « cascade score » Chaos trouvé.

## Options et recommandation
A licence looper/desk : fit bon, capture non démontrée. **B fournisseur d'évidence à un SP/curateur/underwriter** : acheteur et budget existent (Aave a perdu 3 SP en 90 j ; LlamaRisk manque de bras) ; risque de réplication. **C input d'underwriting** (Umbrella, « volunteer underwriters » TokenLogic 2026-09-11, Nexus) : exige d'étendre la classe à un **shortfall** (E_i(D) < 0 agrégé) — extension de classe, pas trahison de doctrine ; forme contractuelle précédente = fonds d'insolvabilité Gauntlet-Compound (paiement lié à issue falsifiable). **D papier + rapport public** : ticket d'entrée vers les mandats (Gauntlet/Chitra 25+ papiers), jamais un revenu.
**Reco : B + D couplés, C pré-enregistré, A rétrogradé en hypothèse à sonder.** Pivot : un acteur à précédent de paiement (LlamaRisk, Gauntlet, Steakhouse, TokenLogic, Nexus) consomme Q_*/Q^* ou E_i(D) dans un artefact public avant U-4. **Le choix de classe (dette liquidée vs shortfall du cluster) décide du payeur** → ordre du jour U-0.

## Signaux
Confirmation : LOI/post d'un SP citant la pièce ; Λ ≠ 0 sur ≥ 1 cluster e-mode ; ≥ 1/5 desks « oui » à une sonde (2 k$/mois pour l'intervalle seul). Mort : Λ ≈ 0 ; 0/5 desks et 0 SP en 90 j ; seuil DFS aussi bon sur 12 mois ; acheteur exige un score → escalade. Ne tue pas : un « cascade score » Chaos.

## Procurement
1. Nexus Mutual Leveraged Liquidation Cover Terms (PDF IPFS, illisible) ; 2. TokenLogic proposition Aave V4 bad-debt backstop 2026-09-11 ; 3. rsETH Incident Report 2026-04-20 (thread 24580) ; 4. LlamaRisk épisode 4 scope §4 R&D (thread 24446) ; 5. Credora méthodologie (docs.redstone.finance) ; 6. arXiv:2604.14583 ; 7. Gauntlet–Compound Y5 clause de refund (comp.xyz/t/7200) ; 8. non trouvés : grant Risk DAO, revenu Steakhouse (contradiction 0,5 / 6,79 / 2,79 M$), tout pricing looper.

Sources [lu] : governance.aave.com/t/24386, /24446 ; comp.xyz/t/7200 ; forum.morpho.org/t/1652 ; help.defisaver.com ; census A. [abs] : theblock, coindesk (2026-04-06/20/26, 2026-03-10, 2025-02-04), chaoslabs.xyz, blog.redstone.finance, chorus.one, blockeden, nexusmutual.io, sentora, arXiv 2604.14583 / 2512.01112, defillama, morpho.org, sky MIP40c3.
