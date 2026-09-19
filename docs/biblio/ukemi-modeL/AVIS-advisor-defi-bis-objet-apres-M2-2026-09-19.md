# Avis advisor-DeFi bis (Fable 5.1) — objet honnête d'Ukemi après M-2, 2026-09-19
Conseil, pas verdict. Vérifications propres : sha des sorties M-2 identiques ; recompte 268 événements / 213 users / 28 users liquidés plus d'une fois ; heure 21:00Z = 88,4 % ; rebond en V confirmé. `m2-lambda.mjs` non rejoué (écrit son out ; horodatage dans le JSON haché ⇒ sha non reproductible par construction — item : hacher un bloc de verdict sans horodatage).

## Fait structurel nouveau [lu first-hand] — recensement des sources d'oracle Aave v3 core (`AaveOracle.getSourceOfAsset` + `description()`, archive drpc)
| Actif | 2025-02-21 (bloc 21895693) | 2025-10-10 (B 23545087) et latest |
|---|---|---|
| sUSDe | Capped sUSDe / **USDe/USD** | Capped sUSDe / **USDT/USD** |
| USDe | Capped **USDe/USD** | Capped **USDT/USD** |
| wstETH / weETH / rsETH | Capped × / ETH/USD (taux de change) | idem |
| WETH | ETH/USD direct | ETH/USD proxy |
**Conséquence** : depuis avant octobre 2025, une vente de sUSDe/USDe dans Curve ne peut pas entrer dans le HF Aave (prix = taux contractuel plafonné × USDT/USD) ; LST/LRT = taux plafonné × ETH/USD. Seul canal endogène atteignant le HF de ces clusters = ETH/USD Chainlink, exactement celui testé par M-2 (0,318 % du volume spot). **Λ_oracle nul par construction** pour les clusters cibles, pas par mesure. En février 2025 le feed USDe/USD était encore de marché : décote −2,21 % exogène ; ce chemin n'existe plus.

## Attaque de M-2
« Indéterminé » est juste ; la « pente forte » ne vient pas de l'IC : IC95 bas × Q_krach = −0,31 log (marché) / −0,57 log (oracle) — compatible avec un impact de −27 à −43 % sur l'heure de krach ; « 0,014 % ≪ τ_dev » utilise la médiane horaire (11,73 WETH), pas l'heure qui compte ; bootstrap-bloc bivalué. Ce qui porte la direction : signe positif des points-estimés, rebond en V, échelle 0,318 % (mais part de l'heure 21:00Z dans le volume Binance de cette heure **non mesurée**), recensement des sources. Le lead-lag à 15 min est aveugle à l'impact intra-bloc.
**M-2b (avant U-0)** : (1) Q_21:00Z / volume ETHUSDT de cette heure ; (2) test intra-bloc « mise à jour oracle au bloc de liquidation vs bloc précédent » sur les 119 blocs ; (3) fraction de réplicats bootstrap contenant le bloc du krach.

## Objet par option
- **(a) B sur pools fins** : mort sur Aave v3 core (sources plafonnées ; le canal « pool fin » de Gatto touche le produit du liquidateur, pas le HF). Ne vit que sur des venues à source de marché — à recenser par `description()` avant d'y croire.
- **(b) Stress conditionnel au chemin d'oracle** : Y_{i,e} = dette liquidée de la position i dans l'événement e sur 24 h, **décomposée** repayment (`debtToCover`) / seized (`liquidatedCollateralAmount × oracle@bloc`) / bad debt (événement de déficit v3.3+, topic à vérifier) ; ŷ_{i,e} = éligible statique depuis le book attesté à B et le chemin d'oracle réalisé (porté par l'appelant). Aléa nommé : liquidation partielle (28/213), séquencement, top-up/auto-remboursement, poussière, staleness. Classe **`liquidation-realized-given-oracle-path-24h`**, Mondrian (e-mode × strate HF₀ × taille). C'est l'objet calibrable.
- **(c) Témoin de faits** : book attesté (digest positions/prix oracle/sources/bloc), HF par compte, éligible vs réalisé, résidus nommés, sans gate ; chemin `attested` comme TSV. **Honnêtement « built » à court terme** (surface servie + test d'intégration).
**Reco : (c) + (b) ; (a) fermé sur Aave core avec preuve.** Paroxysme sans mensonge = (1) résultat structurel (sources plafonnées ⇒ boucle coupée ; bloc de bascule à trouver par bissection) ; (2) échelle mesurée sur le plus grand événement, borne haute non serrée ; (3) calibration intra-événement de l'écart éligible → réalisé (Gatto dit « eligible ≠ perte » sans le calibrer). Treillis Q_*/Q^* = annexe (cas limite : source de marché ⇒ treillis ouvert ; Aave core ⇒ point). Titre de travail : *Eligible is not liquidated: within-event conformal bounds on realized liquidation under an attested oracle path, and why oracle design cuts the cascade loop on Aave v3*.

## Échangeabilité intra-événement (b)
Tient mieux que sous B (facteur commun conditionné). Ruptures : score dépend de HF₀ et taille ⇒ Mondrian par strate ; calibration post-hoc sur événement complet — un split « premières liquidées / suivantes » est une sélection par HF, **interdit** comme split conformal. Barber 2023 Thm 2 exact intra-événement ; gap inter-événements rapporté, non estimable. Q_* = Q^* si Λ = 0 (liquidable statique, Perez Eq. 3) ; « mythe de la cascade » = claim universelle interdite ; publiable : « non détectée sur le plus grand événement ; borne haute non serrée ; mécanisme coupé par construction (liste, blocs) ».

## Dunn, Wasserman, Ramdas 2022 (lu §1-5)
Garantie Tâche 1 (nouveau groupe) **marginale sur Π**, jamais conditionnelle ; non trivial si k ≥ 2/α − 1 (Thm 5), 1−2α (Thm 6), supervisé k > 1/α − 1 ; pooling de CDF asymptotique (sous-couvre à k ≲ 35). Tâche 2 (groupe observé) = conformal intra-groupe (Thm 11 ≡ Vovk), n₁ > 1/α − 1. **À α = 0,01, un nouvel événement exige k ≥ 100 événements ; K = 3 ⇒ aucun ensemble non trivial ; même α = 0,1 exige k > 9.** Hypothèses violées à déclarer : n_j fixé a priori (ici aléatoire, dépendant de l'issue) ; iid intra-groupe (population, pas tirages) — Mondrian atténue la seconde, rien la première (demande de recherche formée). **Conséquence produit** : un gate prospectif sur un nouvel événement émet `abstain`/`under_calib` sauf si l'appelant porte l'événement passé emprunté ; c'est la phrase d'honnêteté de la classe (b).

## Plan U-0..U-7 révisé
| Lot | Sortie | Oracle / mutant |
|---|---|---|
| U-0 | ADR-M020 : (c) built-able, classe (b), (a) fermé ; option (α) ; payeur SP/curateur ; 3 tuyaux (book → attested ; réalisations → `/ukemi/` ; Prediction → gate) — **après M-2b + bissection de source** | checklist validateur |
| U-1 | recorder book à B (N+2 appels, quorum-2) + **sources oracle par actif dans le digest** | rejeu bit-identique ; bloc décalé ⇒ digest différent ; source changée ⇒ digest différent |
| U-2 | `clearing.ts` : Λ = 0 ⇒ point fixe = liquidable statique (test) ; treillis en annexe | test 36 conservé ; monotonie |
| U-3 | census → Y_{i,e} décomposé pour 2025-02, 2025-10, 2026-01 ; bissection du bloc de changement de source sUSDe/USDe ; topic de déficit v3.3 | sha, quorum-2 |
| U-4 | Mondrian intra-événement, calibration committée par événement, bras gate, **abstain sur nouvel événement**, phrases Thm 2 + Dunn | anti-vacuité ; « nouvel événement ⇒ under_calib » ; h5 re-pin |
| U-5 | témoin résiduel oracle/marché (capo_oracle, staleness, source-change) ; rejeux 2025-02-21 puis CAPO | A-H pré-enregistrées |
| U-6 | `sentinel-2` → `/ukemi/` servi ; test d'intégration ⇒ (c) built | non-LLM bout en bout |
| U-7 | papier | relecture externe |

## Bascules
Source de marché pure sur un collatéral de cluster ⇒ (a) rouvre ; M-2b : part > ~5 % du volume horaire ou mise à jour oracle négative systématique au bloc ⇒ Λ intra-bloc ; traitement publié du conformal à n_j dépendant de l'issue ; 0 SP/curateur en 90 j ⇒ (c) témoin sans payeur.

## Pièges
« Λ = 0 » ; 0,014 % comme borne ; sha M-2 « reproductible » ; « mythe » ; split temporel intra-événement ; pooler 3 événements ; chiffres Gatto/Garcia sans [lu] paginé.

## Items / procurement
M-2b (3 mesures) ; bloc de bascule de source + proposition de gouvernance Aave [lu] ; topic déficit v3.3 ; recherche conformal hiérarchique à taille dépendante de l'issue ; Gatto PDF SSRN paginé.
