# Avis advisor-DeFi (Fable 5.1) — programme « Ukemi au paroxysme », 2026-09-19
Conseil, pas verdict. Rejeu de `packages/ukemi/src/clearing.ts` en scratchpad (lecture seule).

## Fait mesuré qui gouverne tout
- Looper → pool à 2 nœuds : `rounds=0`, `unique=true`, équité = max(0, C·P·(1−D) − B). **Le clearing d'un loop isolé est un health factor re-libellé** : sans cycle de créances à responsabilité limitée, Eisenberg–Noe est trivial. La thèse « mode L = réseau EN à n petit » ne survit pas au rejeu.
- Cycle 3 nœuds α=β=0,5 : `pPlus` tous solvables, `pMinus` ≈ [37,1 ; 23,6 ; 14,3], `unique=false` : un équilibre de défaut auto-réalisateur coexiste avec l'équilibre fondamental. Publier [L_*, L*] sans étiqueter run vs cascade serait faux.

## Objet recommandé (B) : dette liquidée dans un cluster de collatéral sous choc, prix endogène
- Cible Y = Σ `debtToCover` des `LiquidationCall` du cluster sur 24 h (octets recalculables, topic0 déjà dans `scripts/census/aave-liquidations.mjs`). Choc D = vecteur par actif porté par l'appelant (jamais une distribution produite par MONARK). `task_class` M016 : **`cascade-liquidated-debt-24h`** (≠ `cascade-liquidable-24h` = seuil statique Perez Eq. 3). Clé Mondrian `predictor_id = ukemi:cluster-clearing-v1@eip155:1/aave-v3-core/emode-<id>`.
- Pourquoi pas un HF : point fixe — la quantité liquidée baisse le prix qui liquide le voisin ; projection par wallet E_i(D) = C_i·P*(D) − B_i.
- Bascule : si l'impact Λ mesuré est nul sur les clusters visés, B dégénère en A (HF) et Ukemi n'a pas d'objet propre — mesurable (U-3).

## Mathématiques
- T : Q ↦ Σ B_i·1{HF_i(P(Q)) < 1}, P(Q) = P₀(1−D)(1−Λ·Q) (Cifuentes–Ferrucci–Shin, linéaire déclaré). T monotone sur [0, ΣB] ⇒ Tarski : plus petit et plus grand points fixes. Structure exacte de `clearing.ts` (GA descend, Picard monte) ; EN/RV = cas particuliers (pro-rata → bonus ; α/β → 1−bonus et impact).
- Sélection d'équilibre : liquidations séquentielles déclenchées par HF depuis l'état fondamental ⇒ **Q_* = cascade séquentielle** (itération depuis 0), **Q^* = borne de run**. Publier deux nombres étiquetés, jamais un vecteur.
- `clearing.ts` : GA ≤ n tours juste ; `clearingFromBelow` sans restarts = la trajectoire, pas un défaut ; T en escalier ⇒ ≤ N pas ; `cascade.ts` (nœuds = banques, K=1) = fiction v0 à remplacer.
- Contrat gelé `yhat` scalaire : option (α) deux `Prediction` (`-seq` / `-run`) chacune dans sa classe — recommandée (zéro octet gelé) ; option (β) amendement additif.
- Unicité sous coûts : Amini–Filipović–Minca 2016 (ORL) à procurer avant tout énoncé.

## Conformalisation
- Couple A temporel (ŷ_t à choc réalisé, Y_t 24 h) : census A mesure 465/497 jours à Y=0 ⇒ strate calme q̂≈0 ⇒ `under_calib` ; strate stress (|D| > 5 %) n'a pas 99 fenêtres sur ~2,7 ans. **Résultat, pas défaut** : la couverture temporelle 99 %/24 h n'est pas atteignable par split conformal — à dire.
- Couple B transversal intra-événement (ŷ_{i,e}, Y_{i,e} par position) : échangeabilité plausible dans l'événement, Mondrian par strate de levier/e-mode ; n ≥ 99 atteignable sur 2025-10-10/11 (1199 liquidations) ou 2025-02 ; CAPO (34 comptes [2nd]) s'abstient par construction. Couverture énoncée « entre positions, dans l'événement », validation leave-one-event-out, gap inter-événements rapporté (Barber 2023 Thm 2). Calibration primaire = B ; A = monitoring.
- Résidus mesurés : impact réalisé vs Λ, chemin d'oracle (CAPO), séquencement des liquidateurs, bonus, intérêts.

## Données
- Reconstruction par compte à bloc archive (`getUserAccountData` / `UiPoolDataProvider`) : faisabilité = coût des `eth_call` archive (census A n'en a fait ~25, fournisseur non nommé) — **à mesurer avant tout ADR de lot**. Book attesté = digest (positions, prix oracle, bloc).
- Chiffres FC26/BoC/Gatto/CAPO : tous [2nd] ; date CAPO incohérente dans nos docs (mars / avril / 10 mars) — épingler par plage de blocs.
- Rejeu CAPO = teste le résidu de fait `capo_oracle` (oracle attesté vs marché attesté), pré-enregistré A-H1 ; « aurait alerté » interdit.
- Meilleur premier rejeu : 2025-02-21 (loop sUSDe, HF 1,0031, oracle −2,2 %, 21,4 M$, déjà mesuré) — point fixe ou liquidation exogène ?

## Branchement M018
- Nouvelle classe committée par clé, nouveau bras de dispatch, phrase d'honnêteté Thm 2, re-pin h5 ; ancienne classe fixture inchangée ou retirée par ADR.
- **Test d'intégration anti-vacuité** : mêmes params, `yhat` ∈ {petit, grand} ⇒ décisions différentes. (Avis : tant qu'il n'existe pas, statut = upcoming — décision investisseur 2026-09-19 : built maintenu, programme obligatoire.)
- Tuyaux : `sentinel-2` (Ukemi quotidien, hors harnais) → book attesté + réalisations → JSONL chaîné `/ukemi/` ; `cascade` réécrit → `Prediction` → `gate` ; témoin résiduel oracle/marché → `attested`.

## Plan de passe
| Lot | Entrée → Sortie | Oracle / mutant | ADR |
|---|---|---|---|
| U-0 | avis + advisor-marché → objet, classe, payeur, option (α) | checklist validateur | ADR-M020 |
| U-1 | mesure `eth_call` archive → recorder book pinné (digest) | rejeu bit-identique ; oracle décalé d'un bloc ⇒ digest différent | U-1 |
| U-2 | `clearing.ts` → point fixe cluster T, Q_*/Q^* étiquetés | test 36 conservé ; monotonie ; Λ=0 ⇒ Q_*=Q^*=liquidable | U-2 |
| U-3 | census A → Y par événement/position ; Λ empirique | sha JSONL, quorum 2 fournisseurs | U-3 |
| U-4 | Mondrian transversal, calibration committée, bras gate, test anti-vacuité, phrase Thm 2 | ci, h5 re-pin ; yhat varié ⇒ décision identique = rouge | U-4 |
| U-5 | témoin résiduel oracle/marché ; rejeux pré-enregistrés 2025-02-21 puis CAPO | hypothèses A-H avant pull | U-5 |
| U-6 | `sentinel-2`, `/ukemi/`, `wiring`, statut | test d'intégration non-LLM | W-1 étendu |
| U-7 | papier | relecture externe | — |
Prérequis : W-1. Advisor-marché à U-0 (payeur looper/desk). À mesurer avant U-0 : Λ ≠ 0 ; coût `eth_call` archive.

## Paroxysme (contribution publiable)
(1) Théorie : cascade collatéralisée avec impact comme application monotone sur treillis ; EN/RV cas particuliers ; deux points fixes étiquetés ; unicité sous coûts (AFM). (2) Empirique : calibration conforme transversale intra-événement sur cascades Aave réelles, gap inter-événements. (3) Résultat négatif mesuré : couverture temporelle non atteignable. Titre de travail : *Conformal clearing: lattice bounds and within-event coverage for collateral liquidation cascades*.

## Procurement (identité à résoudre par le chercheur)
Amini–Filipović–Minca 2016 ORL ; Cifuentes–Ferrucci–Shin 2005 JEEA 3(2-3) ; Glasserman–Young 2016 JEL 54(3) ; Lehar–Parlour BIS WP 1062 ; Gatto 2026 SSRN 7157638 (existence à confirmer) ; Garcia Seuma arXiv:2608.03616 (idem) ; Vovk–Gammerman–Shafer 2005 ch. 4 (Mondrian) ; Tibshirani–Barber–Candès–Ramdas 2019 NeurIPS (covariate shift) ; Qin et al. 2021 IMC ; Chow 1970.

## Pièges
Score (Q^*/ΣB, DebtRank, λ « sous-critique ») ; « oracle Aave » ; fiction interbancaire de `cascade.ts` ; look-ahead (prix à `latest`) ; chiffres [2nd] dans un ADR ; « aurait alerté » ; abstention vendue comme mérite.
