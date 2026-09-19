MODELE RESOLU: claude-sonnet-5

# R — Biblio Ukemi mode L (loop-clearing) — fondation ou refutation des chiffres

- **Chercheur** : `claude-sonnet-5`, effort max, 2026-09-19 (règle roster mainteneur ; doc 03).
- **Mission** : investisseur 2026-09-19 « Ukemi : on le build, on le met à son paroxysme, littérature et
  rigueur académique ». Fonder ou casser les chiffres de seconde main de
  `F:\Monark\docs\etude-suite-2026-09-18\ukemi-eisenberg-noe-audit.md` et
  `...\produit-ukemi-loop-clearing.md` ; lire les 15 items biblio §5 + 10 items additionnels nommés ;
  chercher ce qui manque au design (conformal sur point fixe, non-unicité, données on-chain, rejeu CAPO).
- **Discipline** : niveaux [lu]/[abs]/[2nd] ; aucun chiffre de seconde main non signalé ; PDF → `pdftotext -layout`
  local (`pdftotext version 4.06 xpdfreader`, confirmé sur PATH) ; sha256 dans `SOURCES-sha256.txt` ; jamais
  l'advisor intégré pendant la collecte (risque de filtre de régurgitation sur verbatims PDF, règle
  mainteneur 2026-09-05) ; écriture exclusivement par `cat >>` incrémental (leçon R5 — jamais de Write
  plein-fichier sur une archive qui grossit).
- **Trouvaille d'orientation majeure** : une campagne de lecture interne préexistante couvre déjà, en [lu]
  avec pages, 7 des ~25 sources demandées :
  `F:\Clawpumptech\liquidations\` (clusters K1-K5, `SYNTHESE-LIQUIDATIONS.md`) et
  `F:\Clawpumptech\procurements-lectures\` (7 fiches P-EN-249, P-K4-1, P-K4-2, P-K1-1, P-HIKAE-1/2/3).
  Ces archives ont déjà traversé G1/G2/G7 (Lot K, `F:\Monark\docs\G1-lot-K.md`, `G2-lot-K.md`,
  `G7-phase1.md`). Convention reprise ici : **`[lu-archive-interne <chemin>]`** = extrait déjà lu par un
  lecteur `claude-sonnet-5` antérieur, page citée par lui, re-belief non ré-ouvert texte par texte sauf
  spot-check ciblé sur les énoncés que CETTE mission nomme (existence/unicité, fictitious default ≤ n
  tours) — ceux-là sont ré-ouverts et deviennent **[lu]** par moi directement (§2). PDF/txt de ces 7 items
  copiés dans `pdf/` et `_txt/` de ce dossier, sha256 dans `SOURCES-sha256.txt`.
- **Code Ukemi lu avant recherche** (`F:\Monark\packages\ukemi\src\{clearing,liquidable,prediction}.ts`) :
  voir §1.

## 0. Gate 0

Modèle résolu déclaré ligne 1 : `claude-sonnet-5`. Préfixe conforme à l'attendu (`claude-sonnet-5`,
règle roster mainteneur 2026-08-14, réversée effort `max` le 2026-09-16). Poursuite autorisée.

## 1. Inventaire du code Ukemi (avant recherche — répond à « quel EN clearing est déjà implémenté »)

Lu directement : `packages/ukemi/src/clearing.ts`, `liquidable.ts`, `prediction.ts` (+ `README.md`,
`test/clearing-rv.test.ts` listé mais non ouvert cette passe — hors périmètre biblio).

**Implémenté** :
- `clearing.ts` : carte de compensation Eisenberg-Noe **généralisée aux coûts de défaut de Rogers &
  Veraart (2013)** : `Φ(p)_i = p̄_i` si solvable, sinon `α·e_i + β·Σ_j p_j Π_ji` (α=β=1 ⇒ E&N bit-for-bit,
  confirmé par un test de non-régression nommé dans le commentaire du fichier). `fictitiousDefault` = GA
  (Greatest clearing vector Algorithm, ≤ n tours, Thm 3.7 R&V). `clearingFromBelow` = itération de Φ depuis
  0 pour `L_*` (plus petit vecteur), avec CAVEAT explicite dans le code : Φ n'est "continuous from below"
  que pour α=β=1 — hors ce cas, aucune garantie théorique d'atteindre `L_*` sans redémarrages (fidèle à
  P-K4-1 Q2, voir §2.2). Champ `unique` = comparaison `‖p⁺−p⁻‖_1 < tol` ; **jamais affirmé hors α=β=1**
  (commentaire du code cite explicitement Ex. 3.3 comme non-unicité).
- `liquidable.ts` : cible A (« montant liquidable sous un choc de x % ») = test STATIQUE dérivé de l'Éq. 3
  p.7 de Perez, Werner, Xu, Livshits (Knife-edge) : `collateralQty·price·(1−shock)·K < debt`. Horizon 24h
  **déclaré comme paramètre produit fixé (d), PAS un modèle de dynamique 24h** (le commentaire du fichier le
  dit lui-même : "the dynamics is NOT FOUND in the corpus").
- `prediction.ts` : émission d'une `Prediction{yhat:number}` **point**, jamais d'intervalle — la
  conformalisation est explicitement délèguée à HIKAE (ADR-M002 D1), non faite dans Ukemi.

**PAS implémenté** (confirmé par grep négatif + lecture) :
- **Prix endogène de Cifuentes-Ferrucci-Shin** — le commentaire de `clearing.ts` le dit littéralement :
  "The DeFi endogenous channel (liquidation price) is NOT MODELED". C'est exactement le "Mode C" que
  l'audit `ukemi-eisenberg-noe-audit.md` §2 renvoie à plus tard.
  contentTest négatif : `grep -i "endogen\|fire.sale\|lambda" clearing.ts` = 0 occurrence utile.
- **Construction du graphe-loop** (Π, e depuis les positions on-chain réelles d'un wallet Aave e-mode) —
  aucun fichier ne lit une position on-chain ; `FinancialSystem{L,e}` est un type abstrait, alimenté nulle
  part dans `src/` par une source Aave/Morpho réelle.
- **Tout conformal sur E(D)** — pas d'intervalle, pas de conformeur dans `packages/ukemi` (délégué HIKAE,
  cf. ADR-M003 D6.1 `interval-conformer.ts` côté `packages/hikae`, non lu cette passe — hors périmètre).
- **Résidus nommés du produit** (`capo_oracle`, `lt_bonus_path_break`, `fire_sale_lambda`,
  `primary_closed_weekend` — cf. `produit-ukemi-loop-clearing.md` §1.1 point 6) : **aucune trace dans le
  code** (`grep -ri "capo\|lt_bonus\|fire_sale_lambda\|primary_closed" packages/ukemi/src` = 0). Ce sont des
  intentions de design, pas du code livré.

## 2. Sources reutilisees (7/25) - deja [lu] en interne, spot-check direct fait par moi

Convention : identite -> acces -> niveau -> 3-5 resultats exacts utiles a Ukemi -> ce que le doc dit rester ouvert.

### 2.1 Eisenberg, L. and Noe, T. H. (2001). Systemic Risk in Financial Systems. Management Science 47(2), 236-249. DOI 10.1287/mnsc.47.2.236.9835.
- **Acces** : PDF JSTOR en main (`pdf/eisenberg-noe-2001.pdf`, 15 p., sha256 `4b703c06...`), pre-extrait
  `_txt/eisenberg-noe-2001.txt`. **P1** (article de revue, source primaire du modele).
- **Niveau** : **[lu]** -- corps + App. 1 (preuve Thm 2) + App. 2 (contre-exemple non-unicite) lus par un
  lecteur `claude-sonnet-5` anterieur avec rendu-image (`P-EN-249-eisenberg2001-p249.md`), et **re-confirme
  par moi** ce jour par grep direct sur `_txt/eisenberg-noe-2001.txt` : "THEOREM 1", "THEOREM 2", "LEMMA 3.
  The fictitious default algorithm..." presents lignes 288, 420, 514 -- la structure citee par l'archive
  interne est bien dans le texte que j'ai sous la main, pas une reformulation.
- **Resultats exacts utiles a Ukemi** :
  1. Clearing vector `p* = Phi(p) = (Pi^T p + e) AND p-bar` sur le treillis `[0,p-bar]` (p.240).
  2. **Thm 1** : existence d'un plus grand (`p+`) et d'un plus petit (`p-`) vecteur de compensation, par
     point fixe de Tarski (p.240-241, present dans le texte local).
  3. **Thm 2** : **unicite** si le systeme est **regulier** -- condition suffisante : `e > 0` partout (toute
     "risk orbit" est un "surplus set"). Preuve par App. 1, y compris **p.249** ([lu] confirme :
     (A1.6)-(A1.11), "this contradiction shows that the clearing vector must be unique").
  4. **App. 2** : contre-exemple de non-unicite sur systeme irregulier -- 2 noeuds, `e=(0,0)`, dettes
     mutuelles de 1 => tout `p=t(1,1)`, `t dans [0,1]` est clearing ; avec `e'=(0.01,0)` l'unicite est
     restauree. **C'est exactement le controle negatif que `packages/ukemi/test/*` doit rejouer pour un
     graphe-loop avec des jambes intermediaires a `e=0`** (voir §6.2).
  5. **Lemme 5 (p.245)** : `p*` concave, croissante, et **non-expansive** en `e` (norme L1) -- nuance deja
     etablie par l'archive interne (`docs/lecture-EN-lemme5.md`, test 21 du Lot K) : l'etape de preuve par
     induction livre une constante `n` (pas 1), et un contre-exemple regulier calcule (`||Dp*||_1 =
     2||De||_1`) contredit la non-expansivite STRICTE dans son propre domaine enonce (`R^n_++`).
     `error_origin` = **source** (etabli par calcul, pas une erreur de lecture). **Consequence pour Ukemi
     mode L** : ne jamais vendre "`||DE(D)|| <= ||De||`" comme une garantie bornee par 1x -- l'amplification
     reseau existe et peut depasser 1x.
- **Ce que le papier dit rester ouvert** : aucun prix, aucun oracle, aucun cout de liquidation/detresse --
  les auteurs le disent eux-memes p.248 : la perte d'unicite "even when mild regularity conditions... are
  imposed" des qu'on ajoute des couts de detresse (= la porte que Rogers-Veraart ouvre, §2.2).

### 2.2 Rogers, L. C. G. and Veraart, L. A. M. (2013). Failure and Rescue in an Interbank Network. Management Science 59(4), 882-898. DOI 10.1287/mnsc.1120.1569.
- **Acces** : PDF en main (`pdf/rogers-veraart-2013.pdf`, sha256 `e7f70dda...`), pre-extrait
  `_txt/rogers-veraart-2013.txt`. **P1**.
- **Niveau** : **[lu]** integral S1-7 + annexes A-C par un lecteur anterieur (`P-K4-1-rogers2013.md`,
  pp.884-888 verifiees en rendu-image -- symboles alpha/beta perdus a l'extraction texte). **Re-confirme par
  moi** : grep direct sur `_txt/rogers-veraart-2013.txt` retrouve "Theorem 3.1 (Existence of Clearing
  Vectors)" (ligne 282), la mention explicite "clearing vector unless = = 1 (see Example 3.3)" (ligne 246,
  les `=` sont les symboles alpha/beta corrompus par l'extraction -- coherent avec le caveat deja pose par
  l'archive), et "Therefore, we have found the clearing vector 2 2 2" (ligne 318, systeme ORIGINAL de
  l'Exemple 3.3 -- coherent avec l'addendum du 2026-09-05, voir §4).
- **Resultats exacts utiles a Ukemi** (deja les parametres `(alpha,beta)` du code `clearing.ts`) :
  1. Carte etendue : `Phi(L)_i = L-bar_i` si solvable, sinon **`alpha*e_i + beta*Sum_j L_j pi_ji`**,
     `alpha,beta dans (0,1]` (Def. 2.5, p.884) -- bit-for-bit ce que `packages/ukemi/src/clearing.ts`
     implemente.
  2. **Thm 3.1 (p.885)** : `L*` (plus grand) et `L_*` (plus petit) existent **pour tout** `0<alpha,beta<=1`.
  3. **Unicite NON garantie** des `alpha<1` ou `beta<1` -- **Exemple 3.3 (pp.885-886)**, 2 banques,
     `e=(1,1)`, `alpha=beta=1/2`, `L-bar=(2.2,2.2)` : deux vecteurs de compensation coexistent, `(1,1)` et
     `(2.2,2.2)` (valeur corrigee -- voir §4 contradiction resolue). Avec `alpha=beta=1` sur ce meme systeme
     modifie, **seul** `(2.2,2.2)` est clearing.
  4. **Def. 3.6 / Thm 3.7 (p.886)** : Greatest Clearing Vector Algorithm -- converge en **au plus n tours**.
     C'est `fictitiousDefault()` dans le code, generalise a `(alpha,beta)`.
  5. **Thm 4.10/4.11** : a `alpha=beta=1`, aucun consortium n'a interet a un sauvetage meme a cout nul ; ce
     resultat n'a de contenu qu'avec des couts de defaut `<1` -- **hors perimetre Ukemi mode L actuel** (pas
     de mecanisme de rescue dans le produit).
- **Ce que le papier dit rester ouvert** : pas de prix endogene ("knock-down price" evoque, non modelise,
  Q5) ; pas de comparaison formelle `L*(alpha,beta) <= L*(1,1)` au-dela d'une observation empirique en
  figure ("the larger alpha is, the sounder the system is", p.893) ; aucune reprise de la non-expansivite
  E&N.

### 2.3 Cifuentes, R., Ferrucci, G. and Shin, H. S. (2005). Liquidity Risk and Contagion. Journal of the European Economic Association 3(2-3), 556-566. DOI 10.1162/jeea.2005.3.2-3.556.
- **Acces** : PDF en main, **version publiee JEEA** (`pdf/cifuentes-ferrucci-shin-2005.pdf`, sha256
  `7191091e...`), 12 p. -- **PAS** la version longue Bank of England WP 2004 que l'article cite lui-meme
  comme source de ses figures numeriques completes ("Our full results can be obtained from our longer paper
  (Cifuentes, Ferrucci, and Shin 2004)", p.557). **P1/P2** (revue a comite de lecture, version courte).
- **Niveau** : **[lu]** integral par un lecteur anterieur (`P-K4-2-cifuentes2005.md`).
- **Resultats exacts utiles a Ukemi** (= le canal endogene que le code dit explicitement NE PAS modeliser,
  §1) :
  1. Clearing = E&N avec `e` remplace par `w(p) = p*e_i + c_i` (prix `p` de l'actif illiquide) :
     `x = x-bar AND (w(p) + T^T x)` (eq. 2-3, p.559).
  2. **Lemma 1 (p.560)** : a `p` fixe, systeme connecte + une banque a equite positive => clearing `x(p)`
     **unique** (renvoi direct a E&N 2001).
  3. **Prix endogene, eq. 5 p.561** : `p = exp(-alpha*Sum_i s_i)`, `s_i` = ventes forcees sous contrainte de
     capital (eq. 4, p.560) -- **c'est le `Lambda`/"Cifuentes en plus" de l'audit
     `ukemi-eisenberg-noe-audit.md` §2 Mode L** : "haircut endogene `P -> P - Lambda*Q_liq`".
  4. **Prop. 2/3 (p.562-563)** : si `Phi(p)>=p` partout, equilibre unique a `p=1` ; sinon equilibre `p<1`
     existe -- **unicite NON revendiquee pour `p<1`** (ambiguite relevee par le lecteur : "nearest
     intersection point" suggere une possible multiplicite, non discutee par les auteurs).
  5. Simulation (S3) : 10 banques identiques, ratio de capital 7%, choc = defaillance d'une banque => seuil
     de liquidite au-dela duquel aucune contagion-prix, relation non monotone au nombre d'interconnexions
     (pire a connexite "moyenne", p.564) -- chiffres exacts NON transcrits (graphique seul, NON LU par
     l'archive interne).
- **Ce que le papier dit rester ouvert** : un seul actif illiquide ; forme fonctionnelle `exp(-alpha*Sum s)`
  imposee, non derivee ; portee EX POST seulement (p.557) ; simulations completes renvoyees au WP 2004
  (**procurement P-K4-2b, toujours du** -- voir §7).

### 2.4 Perez, D., Werner, S. M., Xu, J. and Livshits, B. (2021). Liquidations: DeFi on a Knife-edge. arXiv:2009.13235v6 [q-fin.GN], 11 Dec 2021. (Financial Cryptography 2021.)
- **Acces** : OA arxiv, `_txt/perez-werner-xu-livshits-knife-edge.txt` (copie de
  `F:\Clawpumptech\liquidations\lecture\_txt\2009.13235v6.txt`). **P2** (preprint + FC2021).
- **Niveau** : **[lu]** integral corps p.1-19 + annexes A-C (`K1-mecanique-mesure.md`, Papier 1/4).
- **Resultats exacts utiles a Ukemi** :
  1. **Eq. 3 p.7** : une position est liquidable quand
     `[Sum_m (collateral pondere * K_m) * phi(m)] / [Sum_m borrow * phi(m)] < 1`, `phi(m)` = "the price the
     Oracle used". **C'est litteralement `liquidable.ts` de Ukemi** (le code cite cette equation dans son
     commentaire d'en-tete).
  2. Sensibilite de choc, verbatim abstract p.1 : "variations of only 3% in an asset's dollar price can
     result in over 10m USD becoming liquidable" ; confirme p.13.
  3. Efficacite des liquidateurs (Fig. 8, p.14) : ~60% du collateral liquide (35 M USD) liquide dans le MEME
     bloc que la liquidabilite, 85% apres 2 blocs, 95% apres 16 blocs ; progression "26% en 2019" ->
     "70% in 2020" (verbatim p.14) -- la source precise du chiffre ">70%" d'abstract.
  4. Spirales de levier : 2141 comptes, >600 M USD (~moitie du total fourni), p.12.
  5. **PAS de canal fire-sale/impact-prix endogene** modelise (confirme explicitement par le papier
     lui-meme, discute Related Work p.18, citant Klages-Mundt & Minca comme LE papier qui traite ce canal
     -- coherent avec §2.6 ci-dessous).
- **Ce que le papier dit rester ouvert** : MEV/miners (p.17-18, "we have not found any sign... this is a
  real risk", absence de preuve != absence de risque) ; aucune prediction hors echantillon, tout est
  retrospectif mai 2019-sept. 2020.
- **Chiffre a surveiller (piege deja documente par l'archive interne)** : le "800 M$ de gains de
  liquidateurs 2020-2021" attribue A CE PAPIER par un article tiers (Palaiokrassas et al. ICBC 2024, p.650,
  ref [10]) est **ABSENT** du texte reellement lu (grep "800" = 0 occurrence, fenetre de donnees du papier
  s'arretant au 6 sept. 2020, ne peut couvrir 2021). Contradiction consignee, resolue par lecture de Qin et
  al. -- voir §2.5 et §4.

### 2.5 Qin, K., Zhou, L., Gamito, P., Jovanovic, P. and Gervais, A. (2021). An Empirical Study of DeFi Liquidations: Incentives, Risks, and Instabilities. Proceedings of the 21st ACM Internet Measurement Conference (IMC '21), pp. 336-350. DOI 10.1145/3487552.3487811.
- **Acces** : PDF en main (`pdf/qin-et-al-2021.pdf`, sha256 `f837c0d7...`), pre-extrait
  `_txt/qin-et-al-2021.txt`. **P1** (actes de conference a comite de lecture, ACM IMC).
- **Niveau** : **[lu]** corps + annexes (`P-K1-1-qin2021.md`), Table 1 verifiee par rendu-image.
- **Resultats exacts utiles a Ukemi** :
  1. **Profit des liquidateurs = 63,59 M USD** sur 28 138 liquidations, 2011 liquidateurs (p.341, S4.3.1) --
     PAS 800 M$.
  2. **807,46 M USD** = volume de collateral liquide ("liquidation proceeds"), Aave V1/V2 + Compound + dYdX
     + MakerDAO, avril 2019 -> 30 avril 2021 (p.341) -- c'est le chiffre confondu avec le "profit" par la
     chaine de citation tierce.
  3. Table 1 (p.341) : Aave V1 3809 liquidations/665 liquidateurs, Aave V2 1039/125, Compound 6766/657, dYdX
     9762/600, MakerDAO 6762/140.
  4. **"An immediate 43% decline of the ETH price would result in up to 1.07B USD collateral to become
     liquidatable on MakerDAO"** (p.344, etat au 30 avril 2021, Alg. 1) -- source primaire directement
     utilisable comme benchmark de la cible A de Ukemi ("montant liquidable sous un choc de prix").
  5. Stabilite oracle : ecart <=5% pour 99,97% des blocs mai 2020-avril 2021 (Chainlink) ; 19,07% des
     liquidations ont un prix de collateral qui reste sous le prix de liquidation en fin de fenetre
     d'observation (Annexe A) -- risque LIQUIDATEUR, pas systemique.
- **Ce que le papier dit rester ouvert** : le mot "cascade"/"spiral" n'apparait jamais dans ce papier
  (verifie par le lecteur anterieur) -- ce n'est PAS une source pour un mecanisme de cascade, seulement pour
  les chiffres d'ampleur/incitation.
- **error_origin deja adjuge** (archive interne) : le "800 M$" est une confusion de citation tierce
  (Palaiokrassas et al. 2024) entre ce papier-ci (Qin, la vraie source du "807,46 M" mal arrondi/mal
  etiquete "gains") et Perez et al. (§2.4), qui ne contient pas ce chiffre du tout.

### 2.6 Klages-Mundt, A. and Minca, A. (In)Stability for the Blockchain: Deleveraging Spirals and Stablecoin Attacks. arXiv:1906.02152v3, initial release juin 2019, revise 3 mars 2021.
- **IDENTITE -- ecart a signaler** : la mission nomme ce papier "(2021)". Le papier lui-meme se date
  "initial release juin 2019", revision v3 datee (banniere arXiv) 3 mars 2021. Traite ici comme UNE seule
  identite bibliographique (arXiv 1906.02152v3), avec les deux dates rapportees -- ne pas ecrire "(2021)"
  seul sans cette nuance dans tout document downstream.
- **Acces** : OA arxiv, `_txt/klages-mundt-minca-instability-2019-2021.txt` (copie de
  `F:\Clawpumptech\liquidations\lecture\_txt\1906.02152v3.txt`). **P2**.
- **Niveau** : **[lu]** (`K2-spirales-depeg.md`, Papier 2/3, sections 1-9 + Section 6 "Stablecoin Attacks"
  integrale).
- **Resultats exacts utiles a Ukemi** :
  1. Declencheur (p.9-10, verifie image) : `n_(t-1) p_t^E < beta*L_(t-1)` -- meme structure ratio-collateral
     que Ukemi/Aave, `p_t^E` = "oracle provides pricing information from off-chain markets" (p.2) : l'oracle
     est nomme comme UNE DES CINQ PRIMITIVES structurelles du design.
  2. Spirale de desendettement (p.13, verbatim <=25 mots) : "the speculator repurchases DStablecoin to
     reduce leverage at increasing prices as liquidity dries up" -- feedback prix-hausse -> cout-desendettement
     -> collateral-tire.
  3. **ATTACK 2 (p.21-22)** : un attaquant-mineur reorganise l'historique recent (fork) pour HERITER la
     trajectoire de prix oracle deja ecrite, PUIS censure selectivement les recharges de collateral des
     victimes -> liquidations "garanties" dans la nouvelle branche. Mitigation SUGGEREE PAR LES AUTEURS
     EUX-MEMES (p.22, verbatim <=25 mots) : "tying oracle prices and DEX transactions to recent block
     history so that a reorganization attack can't easily inherit price and exchange history" -- prefigure
     conceptuellement un oracle atteste/recalculable, mais **jamais teste par le papier** (inference du
     lecteur, etiquetee comme telle dans l'archive interne).
  4. Chiffre reel Black Thursday : **8 M USD** de collateral d'encheres Dai cloturees a prix quasi nul par
     manipulation mempool (p.22, abstract p.1, intro p.4) -- ATTENTION, different du "4 M$ shortfall" du
     papier-soeur 2004.01304v3 (meme evenement, meme source Blocknative 2020 citee, ecart NON RECONCILIE
     par aucun des deux papiers).
  5. Attaque de gouvernance d'oracle (p.23) : >=51% des tokens MKR -> remplacement du jeu d'oracles ->
     "global settlement" defavorable ; caveat des auteurs eux-memes (footnote 9) : "most MKR is reputedly
     held by just a few individuals" -- vulnerabilite nommee mais non quantifiee.
- **Ce que le papier dit rester ouvert** : le risque d'oracle/gouvernance est explicitement BRACKETTE hors
  du modele formel (p.3, "we focus completely on the market structure risk, assuming that price feeds,
  governance... perform as expected") -- seul le narratif (Section 6-7) le traite, jamais integre aux
  theoremes. Regime instable non borne en probabilite dans ce papier (contrairement a son papier-suite
  2004.01304v3, non requis par cette mission mais deja [lu] aussi en archive interne pour info).

### 2.7 Gibbs, I. and Candes, E. (2021). Adaptive Conformal Inference Under Distribution Shift. arXiv:2106.00170v3, 28 oct. 2021, 25 p.
- **Acces** : PDF en main (`pdf/gibbs-candes-2021.pdf`, sha256 `15f35bf6...`), pre-extrait
  `_txt/gibbs-candes-2021.txt`. **P2** (preprint ; venue NeurIPS 2021 NON confirmee par le document
  lui-meme -- "Preprint. Under review." affiche).
- **Niveau** : **[lu]** Q1-Q7 (`P-HIKAE-1-gibbs2021.md`) ; preuves d'annexe et valeurs de figures NON LUES.
- **Resultats exacts utiles a Ukemi (pour la question #4 -- conformal sur une sortie de point fixe)** :
  1. Mise a jour du niveau : `alpha_(t+1) = alpha_t + gamma*(alpha - err_t)`, `err_t = 1` si `Y_t` hors de
     l'ensemble de prediction courant (eq. 2, p.3).
  2. **Prop. 4.1 (p.6), DETERMINISTE, SANS HYPOTHESE** : `|(1/T)*Sum err_t - alpha| <= (max(alpha_1,
     1-alpha_1)+gamma)/(T*gamma)` -- garantie de frequence long-run qui "ne pose aucune contrainte sur la
     distribution generatrice des donnees" (Abstract). **C'est la garantie candidate pour conformaliser une
     suite scalaire E(D_t) produite par un point fixe recalcule a chaque pas de temps, quelle que soit sa
     fabrication interne** -- aucune hypothese d'echangeabilite requise pour CETTE borne precise.
  3. Thm 4.1/4.2 (p.7-8) : bornes plus fines SOUS hypothese de chaine de Markov cachee -- "we do not expect
     these assumptions to hold exactly in any real-world setting" (aveu des auteurs, p.7).
  4. Limites (p.8) : pas de couverture conditionnelle, pas de couverture a un instant t precis ("provides no
     information about the marginal coverage frequency at a single time step"), largeur des ensembles non
     bornee.
  5. Choix de `gamma` (p.4) : `gamma=0.005` dans leurs experiences -- valeur des auteurs, PAS une
     recommandation generale (deja adjuge par l'archive interne, ADR HIKAE).
- **Ce que le papier dit rester ouvert** : choix de `gamma` EN LIGNE explicitement liste comme probleme
  ouvert en Discussion (p.10) -- resolu par un papier ulterieur des memes auteurs (DtACI, Gibbs & Candes
  2022) NON LU par cette mission ni par l'archive interne (procurement P-HIKAE-1b deja forme, toujours du).

## 3. Sources neuves (18/25) -- fetch live 2026-09-19

### 3.1 Aave Labs (2026). "How Aave Liquidations Perform Under Volatile Conditions". aave.com/blog/historical-liquidations.
- **Acces** : URL directe, HTML recupere et lu par moi (grep sur le HTML brut, pas un resume d'outil).
  `_txt/aave-blog-historical-liquidations.txt` (partiel, extraction brute). **P1** (blog officiel Aave Labs).
- **Niveau** : **[lu]**, page datee "6 February, 2026", auteur "Aave Labs", categorie "Research".
- **Verbatim exact** : "From Aave's launch in 2020 through the first week of February, the protocol
  processed over 310,000 liquidations, totaling $4.65 billion in value. This represents about 3.3% of
  cumulative borrow transactions."
- **Verbatim (jan-fev 2026)** : "Aave liquidations tied to this capitulation event (Jan 31 - Feb 5) totaled
  $429 million in volume (breaking the previous record from May 2021) across ~12,500 transactions."
- **Verbatim (oct. 2025)** : "$250 million was liquidated on the day. The average liquidation amount ($68k)
  was also higher than that during the 2021 China crypto crackdown event."
- **SVR** : "In the first nine months through early February 2026, SVR handled $675m in liquidations across
  ~3,900 events" recapturing ~$16m.
- **VERDICT chiffre audit "4,65 Md$/310k"** : **FONDE**, exact, source primaire directe.
- **VERDICT chiffre audit "oct. 2025 $250M$/j"** : **FONDE**, exact.
- **VERDICT chiffre audit "jan-fev 2026 $429M$"** : **FONDE**, exact.

### 3.2 Lehar, A. and Parlour, C. A. (2022). Systemic Fragility in Decentralized Markets. BIS Working Papers No 1062, December 2022.
- **Acces** : PDF en main apres 2 echecs (l'ancienne URL `bis.org/publ/work1062.pdf` redirige HTTP 301 vers
  une nouvelle page HTML ; le vrai PDF est desormais
  `https://www.bis.org/publications/working-paper-1062-systemic-fragility-decentralised-markets.pdf`).
  `pdf/lehar-parlour-bis-wp1062.pdf`, `_txt/lehar-parlour-bis-wp1062.txt`. **P1** (BIS working paper,
  presente a la conference annuelle BIS 2022).
- **Niveau** : **[lu]** section introduction/donnees (p.1-3 de l'article, apres le "Foreword" de 30 pages de
  pagination-fichier).
- **Verbatim exact** : "approximately $9 billion of collateral was locked in Compound, and over $11 billion
  locked in Aave. We observe liquidations valued at $2,487,543,624."
- **VERDICT chiffre audit "Lehar-Parlour $2,49 Md"** : **FONDE**, exact ($2 487 543 624 = 2,4875 Md,
  arrondi correct a "2,49 Md$").
- **Non explore cette passe** (hors budget, non demande explicitement par la mission) : le detail des 9
  echanges decentralises et la methodologie d'impact de prix haute frequence -- NON LU au-dela de
  l'introduction.

### 3.3 Banque du Canada (2026). "DeFi Lending: Returns, Leverage, and Liquidation Risk". Staff Analytical Paper 2026-13, avril 2026.
- **Acces** : PDF en main, `pdf/boc-sap2026-13.pdf`, `_txt/boc-sap2026-13.txt`. **P1** (publication officielle
  de banque centrale).
- **Niveau** : **[lu]** section 4 "Margin Trading Activities" (p.13-15) + bibliographie.
- **Verbatim exact (p.14)** : "Using this definition, we find that margin trading activity accounts for
  approximately 20 percent of the total borrowed volume and 8 percent of the total number of borrowing
  transactions, as shown in Table 4." Table 4 (meme page) : **20,46%** du volume, **8,20%** des transactions,
  fenetre 1 jour, periode 1er janvier 2023 - 1er mai 2025 (PAS "2023-2025" comme parfois raccourci -- borne
  exacte).
- **VERDICT chiffre audit ">20% du borrowed Aave V3, 2023-2025"** : **FONDE**, avec precision : 20,46%
  exactement, periode exacte 2023-01-01 a 2025-05-01 (le doc dit juste ">20%", ce qui est correct mais
  imprecis).
- **Trouvaille utile a la question #4 (Warmuz identite)** : bibliographie BoC (p.30, ligne biblio) donne la
  reference complete : **"[Warmuz et al., 2023] Warmuz, J., Chaudhary, A., and Pinna, D. (2023). Toxic
  liquidation spirals."** -- voir §3.9, ECART DE MILLESIME avec la mission ("2022").
- **Autre resultat utile** : pic a ~40% du volume d'emprunt dans les 6 premiers mois suivant le lancement de
  V3 (p.14-15) -- le recours au levier recursif etait PLUS eleve juste apres V3 qu'en moyenne long terme.
- **Ce que le papier dit rester ouvert** : "Liquidations occur in concentrated waves but have limited
  impacts on broader markets" -- pas de modele de cascade formel, un constat empirique.

### 3.4 Garcia Seuma, R. M. (2026). Measuring the Engine of a Liquidation Cascade: Subcritical Branching Inside a First-Order Transition. arXiv:2608.03616v1 [physics.soc-ph], 4 Aug 2026. (Part II ; Part I = arXiv:2607.27070, non lu.)
- **Acces** : OA arxiv, telecharge directement, `pdf/garcia-seuma-2026.pdf`, `_txt/garcia-seuma-2026.txt`.
  **P2** (preprint physics.soc-ph, pas encore de venue confirmee dans le document).
- **Niveau** : **[lu]** Abstract (p.1) + sections methodologiques (Table 1 p.3, resultats en-cascade) ;
  reste du corps NON LU en detail cette passe (paper dense, notation physique lourde).
- **Verbatim exact (Abstract, p.1)** : "We study seven major crypto-perpetual liquidation cascades
  (2022-2025)... From the on-chain fill log of a fully transparent venue we measure the branching ratio of
  that event -- the October 2025 crash, the largest on record -- in flight, with both of its factors
  observed and no free constants. It ran deeply subcritical: the structural ratio and the amplification
  bookkeeping both place it at ^0.1-0.2 throughout."
- **Clarification importante pour Ukemi (demandee par l'advisor)** : `lambda-hat` ici = **ratio de
  branchement** (nombre moyen de "descendants" par liquidation forcee dans un processus de branchement,
  "offspring mean") -- **CE N'EST PAS** un coefficient d'impact-prix comme le `Lambda` de Cifuentes (§2.3).
  Les deux symboles sont bien DEUX OBJETS DIFFERENTS dans l'audit Ukemi (`ukemi-eisenberg-noe-audit.md`
  §2 Mode C emploie explicitement les deux : "Lambda calibre (Lehar-Parlour)" pour l'impact-prix, et
  "lambda-hat ~ 0,1-0,2 (sous-critique)" pour le branchement) -- **verifie ici comme non confondus par la
  source**, mais l'audit doit rester vigilant a ne jamais les fusionner dans le meme paragraphe sans le
  dire.
- **Resultats exacts additionnels utiles a Ukemi** :
  1. **88% de tout le forced-selling post-onset est arrive en 30 minutes**, et **63% de ce volume a ete
     absorbe hors-carnet par le backstop de la venue** (Hyperliquid) -- ce qui FAIT BAISSER le ratio de
     branchement precisement au moment le plus critique (Abstract p.1).
  2. Table 1 (p.3) : 7 cascades 2022-2025, chacune datee/typee -- corpus source des "sept cascades perp"
     citees par l'audit.
  3. Detail chiffre par phase (p.~13, ligne source) : branching ratio "0.195 (nucleation) / 0.140 (peak) /
     0.032 (late)" -- **sous-critique a CHAQUE phase**, pas seulement en moyenne.
  4. Le papier REFUTE l'hypothese "cascade = transition critique" pour son echantillon : "the market's
     cross-asset correlation structure jumps abruptly into an ordered phase while a susceptibility proxy
     collapses rather than diverges" -- coherent avec l'audit "le mythe cascade=criticite est faux sur ce
     sample".
- **Ce que le papier dit rester ouvert (verbatim, Discussion)** : "The central boundary is the venue scope
  of [lambda]. Our measured branching ratio is within-venue; the [cross-venue] coupling we documented
  separately" -- **le resultat est INTRA-VENUE (Hyperliquid)**, pas une affirmation systemique multi-venue.
  A ne pas vendre comme "tout DeFi est sous-critique".
- **VERDICT chiffre audit "lambda-hat 0,1-0,2"** : **FONDE**, verbatim exact, p.1 (Abstract).

### 3.5 Warmuz, J., Chaudhary, A. and Pinna, D. (2022/2023). Toxic Liquidation Spirals. arXiv:2212.07306, soumis 14 dec. 2022, revise 12 jan. 2023.
- **ECART D'IDENTITE A SIGNALER** : la mission nomme ce papier "(2022)". La banniere arXiv porte la date de
  soumission initiale 14 dec. 2022, MAIS la bibliographie de la Banque du Canada (§3.3) le cite comme
  **"Warmuz et al., 2023"** (annee de la revision v2, 12 jan. 2023). **Les deux annees sont defendables** --
  a citer desormais comme "(2022/2023, arXiv:2212.07306)" dans tout document downstream, jamais l'un sans
  l'autre.
- **IDENTITE -- collision evitee** : Amit Chaudhary et Daniele Pinna sont AUSSI les auteurs de
  `2211.08870v2` (Chaudhary & Pinna seuls, "A multi-asset, agent-based approach...", deja [lu] dans
  l'archive interne K1, voir campagne Clawpumptech). **Ce sont bien DEUX papiers distincts** : celui-ci
  (2212.07306, avec Warmuz en premier auteur) traite specifiquement du cas AAVE V2 CRV/USDC du 22 nov. 2022
  ; 2211.08870 est une simulation agent-based generique 0VIX. Confirme par la lecture directe (pas de
  chevauchement de contenu).
- **Acces** : OA arxiv, `pdf/warmuz-chaudhary-pinna-2022.pdf`, `_txt/warmuz-chaudhary-pinna-2022.txt`. **P2**.
- **Niveau** : **[lu]** introduction + etude de cas (corps NON LU en integralite -- la partie formelle
  complete de la condition-frontiere n'a pas ete parcourue cette passe, seulement le recit du cas et sa
  conclusion).
- **Resultats exacts utiles a Ukemi** :
  1. Cas reel : Avraham Eisenberg (l'attaquant Mango Markets) emprunte ~92M CRV (~38M$ a l'ouverture) contre
     collateral USDC sur Aave V2 ; position liquidee le 22 novembre 2022 apres des a-coups de prix CRV/USDC.
  2. **Verbatim (Introduction)** : "This ultimately left Aave with **$1.78 million** of bad debt." --
     **DIFFERENT du chiffre "$1.3 million" cite par la note de bas de page 9 de la Banque du Canada (§3.3)**
     pour le MEME incident -- **CONTRADICTION NON RECONCILIEE**, consignee en §5.
  3. These centrale : la dette non recouvree n'est PAS due a une volatilite excessive du prix CRV/USDC ce
     jour-la, mais a un **defaut structurel de la logique de liquidation** qui declenche une "spirale de
     liquidation toxique" -- une liquidation devient "toxique" quand elle DEGRADE le ratio pret/valeur
     (LTV) de l'emprunteur au lieu de l'ameliorer (definition du "undercollateralization frontier",
     mentionnee p.~5, Figure 1).
  4. Recommandation des auteurs : un changement simple des parametres d'incitation a la liquidation
     ("liquidation threshold value") peut prevenir de futures spirales toxiques -- probleme partage par
     "a number of major DeFi lending markets" (pas specifique a Aave).
- **Ce que le papier dit rester ouvert** : NON LU en detail cette passe -- la condition formelle complete
  (au-dela de l'etude de cas) n'a pas ete extraite ; a completer si Ukemi doit implementer un detecteur de
  "toxicite" de liquidation.

### 3.6 Gatto, D. (2026). "Liquidation Without Loss: A Live-Book Decomposition of Aave v3". SSRN 7157638 ; self-hosted daru.finance/research/liquidation-risk.
- **Acces** : SSRN direct = **BLOQUE** (curl -> HTTP 403 sur `papers.ssrn.com/sol3/papers.cfm?abstract_id=7157638`,
  et WebFetch -> HTTP 403 egalement, confirme le piege anti-bot signale par l'advisor). **Acces reussi via
  le site personnel de l'auteur** (Daniel Gatto, "Daru Finance: Independent quantitative research"),
  `https://daru.finance/research/liquidation-risk`, page HTML complete recuperee (362 KB) et lue par moi
  directement (extraction texte brute, pas un resume d'outil tiers). Titre confirme sur la page : "SSRN
  7157638 - Aave v3 live-book study". **P2/P3** (recherche quantitative independante, pas de revue par les
  pairs visible ; auto-hebergee, methodologie ouverte avec code -- `github.com/DaruFinance/defi-param-stress`
  -- ce qui la rapproche d'un P2 solide plutot qu'un simple blog promo).
- **Niveau** : **[lu]** l'essentiel du corps (mecanisme, figures 1/4/5, etude de cas CRV).
- **Resultats exacts utiles a Ukemi** :
  1. **Mecanisme central : `LT(1+b) < 1`** -- quand seuil de liquidation x (1+bonus) reste sous 1, un loop
     qui franchit HF=1 est retire pendant que son collateral couvre encore la dette bonus-incluse. "Aave
     satisfies this in all eight live e-mode categories."
  2. **D\* = max(1 - 1/HF0, 1 - (1+b)*LT/HF0)** -- forme fermee exacte de la frontiere de perte, `HF0` = health
     factor on-chain courant.
  3. **Chiffre-tete (Fig. 1)** : choc LST 5% sur la tranche de 1 437 positions -> **$1,38 Md** (exactement
     $1,381.5M) liquidation-eligible ; sous-ensemble "pure-loop core" 236 positions/$2,19Md -> **$1 356,9M**
     eligible, $691,3M rembourse execute, $720,2M collateral saisi, **protocol bad debt ZERO** ("protocol
     bad debt zero", verbatim) -- **SUR CHEMIN CONTINU** ("engine runs down the path").
  4. **D\* de l'ancre e-mode live (~12x levier, LT 0,95, bonus 1%)** = **7,4%** exactement (`f_exh = 0.0742`),
     eligible des 3,5%, bande de 3,9 points de pur throughput sans perte. **Mediane 6,9%** sur la tranche
     live, **8,8% pondere par la dette**.
  5. **Table des sauts discrets (Fig. 4, "BAD DEBT PER $100M LOOP")** -- prix normalise pour 100 M$ de loop,
     canal "discrete price gap" (deep pool, e-mode LT 0.95) : **5%->$0,58M ; 8%->$4,54M ; 12%->$12,46M ;
     20%->$27,31M ; 35%->[valeur suivante non capturee]**. Canal "partial liquidation into a finite pool"
     ($2 Md pool) : 5%->$3,01M ; 8%->$5,51M ; 12%->$8,87M ; 20%->$15,7M. Canal "oracle staleness" (gap fixe
     8%, lag varie) : aucun retard->$0,58M ; +31bp->$0,86M ; +159bp->$2,03M ; +500bp->$5,13M.
- **VERDICT chiffre audit "5% : 1,38 Md$ liquidation-eligible, $0 bad debt protocole si chemin continu"** :
  **FONDE**, verbatim quasi exact ($1,381.5M, arrondi "1,38 Md$" correct ; "$0" = "protocol bad debt zero").
- **VERDICT chiffre audit "D\* ~ 7,4% (ancre), mediane 6,9%"** : **FONDE**, exact (f_exh=0.0742=7,42%, median
  6,9%, 8,8% pondere-dette -- l'audit omet la ponderation-dette mais la valeur mediane simple est correcte).
- **VERDICT chiffre audit "jump 10% : 47 M$ bad debt"** : **CASSE -- NON RETROUVE.** Grep exhaustif de la
  chaine "47" sur l'integralite du texte extrait de la page = **ZERO occurrence**. La table des sauts
  discrets (Fig. 4) n'a AUCUN point de donnee exactement a 10% (points a 5/8/12/20/35%) ; les valeurs
  encadrantes sont $4,54M (a 8%) et $12,46M (a 12%) **par tranche de 100 M$ de loop** -- une interpolation
  lineaire grossiere a 10% donne ~$8,5M par 100 M$, PAS 47 M$, et une mise a l'echelle sur le cluster complet
  1,38 Md$ (x13,8) donnerait ~$117M, PAS 47 M$ non plus. **Aucune lecture raisonnable du document ne produit
  47 M$.** Le nombre le plus proche dans tout le document est $30,2M (gap 15%, cluster disperse, pool
  infiniment profond) -- toujours different, ET tire d'un scenario different (pas le meme cluster, pas la
  meme profondeur de pool). **error_origin non tranchable a distance** : soit une confusion avec un autre
  papier/chiffre en amont du doc Ukemi, soit une extrapolation non sourcee du redacteur de l'audit. A
  corriger dans `ukemi-eisenberg-noe-audit.md` et `produit-ukemi-loop-clearing.md`.
- **Chiffre supplementaire utile (Bonus e-mode 1%, LT 0,95)** : CONFIRME litteralement ("e-mode LT 0.95",
  "12x leverage... 1% bonus") -- fonde le "Bonus e-mode 1% (LT 0,95)" de `produit-ukemi-loop-clearing.md` §2.
- **Etude de cas CRV/Aave nov. 2022 (le meme incident que Warmuz et al., §3.5)** -- **TROISIEME chiffre pour
  le MEME evenement** : "92 million CRV... liquidators repaid 89.6M CRV... 2.39M CRV of debt was left
  standing... the loss: **$1,65M modelled against roughly $1,60M realized on-chain**, a 3,4% error." A
  comparer a Warmuz et al. ($1,78M) et Banque du Canada note 9 ($1,3M) -- **TROIS SOURCES, TROIS CHIFFRES
  DIFFERENTS pour la meme perte** ($1,3M / $1,6-1,65M / $1,78M) -- contradiction consignee en §5, non
  tranchee.
- **Ce que le papier dit rester ouvert / limites auto-declarees** : le hash du plan d'analyse est
  "self-asserted", pas horodate independamment ("the lock date is self-asserted and the files enter git
  history four days later") -- integrite du plan, pas anteriorite prouvee ; le test "pre-event-book" a ete
  ajoute APRES le verrouillage du plan, etiquete comme tel (honnete, mais affaiblit la pre-registration) ;
  aucune figure ou slippage n'est publiee pour l'episode CRV ("the paper deliberately publishes no depth or
  slippage figure for this episode, because the price-impact fit... had a negative R2").

### 3.7 Chaos Labs -- sortie Aave (6 avril 2026) et incident CAPO (10 mars 2026)
- **Acces** : presse specialisee convergente, PAS le post primaire governance.aave.com (non fetch cette
  passe -- procurement forme en 7). Sources lues (WebFetch, extraction verbatim) : The Block
  (theblock.co/post/393121, incident CAPO) ; bex.co/blog/2026/04/18 (sortie Chaos Labs) ; convergence
  confirmee par Yahoo Finance/CCN/Cryptopolitan/Bankless dans les resultats de recherche. P2 (presse
  specialisee crypto, plusieurs sources independantes convergentes -- pas P1 gouvernance).
- **Niveau** : [lu] (WebFetch verbatim sur 2 pages), [2nd] pour les points corrobores seulement par resume
  de recherche (non re-ouverts individuellement).
- **CAPO, 10 mars 2026, 22:01 EDT** -- verbatim/chiffres :
  - Cause : ecart entre le ratio wstETH/ETH publie par l oracle CAPO (~1,1939) et le taux de marche reel
    (~1,228) -- 2,85% d ecart (confirme le "oracle 2,85% trop bas" anticipe par advisor).
  - 34 comptes touches, ~10 938 wstETH liquides.
  - Verbatim : "$26.9 million in wrongful liquidations across 34 Aave accounts" (bex.co) -- une autre source
    (The Block) donne "$26 million" (arrondi different, meme evenement) -- petite divergence de source a
    source, non reconciliee, mais toutes deux dans la fourchette de l audit ("26,9 M$").
  - Compensation : verbatim "499 ETH gained by third-party liquidators", "141.5 ETH recovered", "up to 345
    ETH from DAO treasury for compensation" (The Block) ; bex.co reprend "approximately 345 ETH in
    liquidator bonuses returned to affected users".
  - CONTRADICTION A SIGNALER (denominateurs multiples, exactement le piege anticipe par advisor) : archive
    Clawpumptech (SYNTHESE-LIQUIDATIONS.md, INVENTAIRE R12, projet distinct, non re-ouverte en detail ici)
    mentionne "316,94 WETH net" pour un incident presume identique (configuration oracle wstETH, mars 2026).
    Aucune des sources fetchees cette passe ne mentionne "316,94" ni "316.94" -- les chiffres disponibles ici
    sont 499 ETH (gain liquidateurs), 141,5 ETH (recupere), 345 ETH (jusqu a, tresor DAO). 345 moins une
    marge de frais/gas pourrait approcher 317 sans etre exactement 316,94 -- hypothese NON VERIFIEE, non
    reconciliee, consignee comme telle (voir 5).
- VERDICT chiffre audit "CAPO 26,9 M$" : FONDE (bex.co, verbatim exact) ; nuance : The Block donne "26M$"
  pour le meme fait -- deux sources de presse divergent d environ 3%.
- Sortie Chaos Labs, 6 avril 2026 -- verbatim/chiffres (recherche + WebFetch convergents) :
  - Verbatim "$5 million retention package that Aave Labs had put on the table" refuse -- FONDE, exact.
  - Verbatim "the engagement had operated at a loss for three years, even with proposed budget increases" --
    FONDE le "mandat a perte 3 ans" de audit.
  - Verbatim "processed over $2 billion in liquidations" sur le mandat de 3 ans -- FONDE le "2 Md$ de
    liquidations pricees".
  - Verbatim "ending a more than three-year streak of oversight with zero material bad debt for depositors"
    -- FONDE le "0 bad debt materiel".
  - Contexte additionnel : Aave passe de 5,2 Md$ a plus de 26 Md$ de TVL sur la periode ; budget minimal
    estime necessaire selon Chaos Labs = 8 M$ (V3+V4 combines) contre 5 M$ proposes.
- VERDICT global 0-audit (Chaos Labs part Aave avr. 2026, 5M refuses, mandat a perte 3 ans, 2 Md liquidations
  pricees, 0 bad debt materiel, puis CAPO 26,9M) : TOUS LES ELEMENTS FONDES, avec la nuance que "puis" (CAPO
  PUIS sortie) est chronologiquement correct (10 mars -> 6 avril) mais audit groupe ces faits dans une seule
  phrase qui peut laisser croire a un lien causal direct unique -- la presse presente 3 causes a la sortie
  (depart d autres contributeurs, complexite V4, mandat a perte), CAPO n etant qu un facteur de contexte
  parmi d autres, pas la cause unique citee dans le post de gouvernance (selon le resume disponible).

### 3.8 DeFi Saver -- Liquidation Protection (10 aout 2026)
- **Acces** : help.defisaver.com/general/what-is-defi-saver/defi-saver-fees (fetch direct, lu) ;
  blog.defisaver.com/defi-saver-newsletter-august-2026/ (fetch direct, lu) ;
  defisaver.com/features/automation (fetch direct, lu) -- aucune des trois pages officielles fetchees
  directement par moi ne contient litteralement "105%" ou "110%" dans le texte que outil a retourne. Le
  couple 105% vers 110% est confirme seulement par recherche web agregee (WebSearch, plusieurs resultats
  convergents citant ces chiffres pour DeFi Saver Liquidation Protection et pour outil
  aavesim.defisaver.com) -- PAS verifie par moi en premiere personne sur une page primaire ouverte
  directement. P1 mais niveau [abs] pour le couple 105/110% precisement (mecanisme general confirme lu :
  "automatically repays your debt or closes your position when your ratio drops below a set threshold" --
  defisaver.com/features/automation, verbatim).
- **Fee** : confirme lu sur help.defisaver.com : fee standard 0,25% sur transactions complexes avec swap ;
  fee d automation additionnel de 0,05% "per automated adjustment", PAS documente specifiquement comme LE
  fee de Liquidation Protection (il s agit du fee d automation general, applicable a toute action
  automatisee DeFi Saver, pas une ligne tarifaire dediee Liquidation Protection distincte).
- VERDICT chiffre audit "105/110%" : [abs] -- corrobore par plusieurs recherches convergentes, NON verifie
  verbatim par moi sur une page officielle ouverte directement. A traiter avec prudence : plausible et
  probablement correct (coherence entre 4 et plus resultats de recherche independants dont un mentionnant
  specifiquement outil de simulation Aave de DeFi Saver), mais le niveau de preuve est plus faible que les
  autres chiffres de cette archive.
- VERDICT chiffre audit "0,05%" : FONDE mais AVEC NUANCE -- 0,05% existe bel et bien comme fee d automation
  par ajustement automatise (source primaire, lu), mais ce n est PAS un fee dedie a Liquidation Protection
  specifiquement ; il s applique a toute automatisation DeFi Saver. audit presente ce chiffre comme LE fee
  de la fonctionnalite -- imprecision mineure, pas une erreur factuelle.

### 3.9 Blockeden / stress-test Q1 2026 -- 15,7 Md$ de liquidations
- **PROBLEME D IDENTITE SERIEUX -- a signaler en premier (doc 03 regle 1)** : audit
  ukemi-eisenberg-noe-audit.md attribue ce chiffre a "Blockeden / stress-test". La recherche ne retrouve
  aucune page blockeden.xyz portant le chiffre "$15.7 billion" pour Q1 2026 avec les caracteristiques citees
  (BTC -43% depuis 126k vers 72k, ETH -59% depuis un pic a 5400). Le chiffre "$15.7 billion" / "43%"/"59%"
  est retrouve verbatim dans un article agregateur, bex.co
  (bex.co/blog/2026/05/09/defi-stress-test-q1-2026-nothing-broke-protocol-resilience, et sa traduction
  coreenne du meme jour) -- et cet article NE CITE LUI-MEME AUCUNE source primaire ni Blockeden ni DefiLlama
  pour ce chiffre (verifie par moi via WebFetch cible sur cette question precise : "The article does not
  cite a specific data provider or primary source for this figure"). Un autre article blockeden.xyz
  reellement lu (blockeden.xyz/blog/2026/02/08/, lu par moi) traite un evenement DIFFERENT (repli TVL
  120Md$ vers 105Md$ debut fevrier 2026, BTC "-17% en 72h" vers environ 91 400$, ETH "-25% sur 3 jours" --
  PAS les memes chiffres que "-43%/-59%").
- **Niveau** : [2nd] au mieux, source primaire NON IDENTIFIEE. Classe P3 (bex.co porte les caracteristiques
  d un agregateur de contenu, sans methodologie ni source citee pour ce chiffre precis).
- VERDICT chiffre audit "15,7 Md$, 0 insolvabilite" : NI FONDE NI CASSE -- SOURCE INTROUVABLE EN L ETAT. Le
  chiffre circule (repris par au moins 2 pages du meme site en anglais et coreen) mais AUCUNE source
  primaire (DefiLlama, tableaux de bord Aave/Compound/Morpho, ou rapport nomme) n a ete localisee en amont.
  "0 insolvabilite" (aucun grand protocole de lending insolvable) EST correctement corrobore de facon
  qualitative par la meme page ("not a single major lending protocol became insolvent... Aave, Compound,
  Morpho, Euler v2 -- processed the cascade without insolvency") mais reste [2nd].
- A signaler pour le rapport final : ce chiffre est le plus fragile des dix liste par la mission -- candidat
  direct pour NON TROUVE au sens de la regle 6 (doc 03).

## 4. Sources academiques additionnelles (theorie manquante, question 4)

### 4.1 Amini, H., Filipovic, D. and Minca, A. (2016). Uniqueness of Equilibrium in a Payment System with Liquidation Costs. Operations Research Letters 44(1), 1-5.
- Acces : ECHEC de telechargement direct cette passe. Tentatives : (a) SSRN abstract_id=2619512 -- non
  tentee en telechargement direct (meme piege 403 attendu, cf Gatto en 3.6) ; (b) EPFL Infoscience
  (infoscience.epfl.ch, entite 0e126980-dfcf-492f-87c9-893b60629b1c) -- HTTP 202 avec en-tete
  x-amzn-waf-action egal challenge (pare-feu anti-bot AWS, bloque curl) ; (c) ScienceDirect (version
  editeur, paywall Elsevier attendu, non tentee) ; (d) recherche de miroir PDF libre -- aucun miroir
  texte-integral trouve, seulement des CITATIONS de ce papier dans des papiers tiers deja indexes (ex.
  arXiv 1506.00937, qui GENERALISE ce resultat). PROCUREMENT FORME, voir section 7.
- Niveau : [abs] seulement -- resume trouve via plusieurs citations convergentes (listing SSRN, resume
  ScienceDirect, citation dans papiers tiers), PAS le texte integral.
- Ce que le resume etablit (a verifier au texte integral) : le papier etudie un reseau financier ou la
  liquidation forcee dun actif illiquide a un impact NEGATIF sur son prix, renforcant la contagion de
  reseau. Resultat principal : conditions d UNICITE du prix de compensation et des paiements de dette, sous
  hypotheses jugees douces et naturelles sur la fonction d impact-prix -- MONOTONICITE de la fonction
  d impact-prix, et monotonicite STRICTE du produit de la liquidation dans la quantite liquidee. Le resultat
  est enonce sous absence de netting, netting partiel, ET netting multilateral complet des dettes
  interbancaires (trois regimes).
- Pourquoi ce papier est la piece manquante pour la question 4 (non-unicite) : c est exactement le PENDANT
  POSITIF de Rogers-Veraart (section 2.2, qui montre la PERTE d unicite des que des couts de defaut
  existent) -- Amini-Filipovic-Minca donne les conditions sous lesquelles l unicite est RECUPEREE meme avec
  une fonction d impact-prix (donc un analogue du canal Cifuentes, section 2.3) explicitement modelisee.
  Pour Ukemi mode L : si le canal d impact-prix endogene est ajoute au clearing de loop, ce papier dit a
  quelles conditions sur cette fonction (monotonie, monotonie stricte du produit liquide) l unicite du
  vecteur de compensation survit malgre tout -- la reponse au "comment publier honnetement" n est PAS
  seulement "publier le plus grand et le plus petit vecteur" (Rogers-Veraart) mais aussi "verifier si la
  fonction d impact du design satisfait les conditions Amini-Filipovic-Minca, auquel cas un seul vecteur
  suffit".
- A FAIRE (dette formee, pas nue) : lecture integrale du texte des que procure -- le resume ci-dessus vient
  de citations tierces, PAS d une lecture directe des enonces formels (theoremes exacts, numeros de page).
  Ne pas citer de numero de theoreme ou de page tant que non lu.

### 4.2 Cont, R. and Schaanning, E. (2017). Fire Sales, Indirect Contagion and Systemic Stress Testing. Norges Bank Working Paper 2/2017 (version longue ; version courte publiee Journal of Banking and Finance 2019 sous le titre Monitoring Indirect Contagion).
- Acces : PDF en main, telecharge directement (mfm.uchicago.edu, miroir Macro Financial Modeling
  Initiative, universite de Chicago), pdf/cont-schaanning-2017.pdf, _txt/cont-schaanning-2017.txt. P1
  (working paper de banque centrale, plus version longue d un papier evalue par les pairs, JBF 2019).
- Niveau : [lu] structure generale + section methodologique (matrice de chevauchement, fonction
  d impact-prix) ; pas de lecture exhaustive des resultats numeriques complets par banque (hors budget de
  cette passe).
- Resultats exacts utiles a Ukemi (le canal d impact-prix calibre, exactement ce que le Mode C de l audit
  demande) :
  1. Reseau de contagion indirecte construit sur le CHEVAUCHEMENT PONDERE PAR LA LIQUIDITE ("liquidity-weighted
     overlap" entre les portefeuilles de banques) -- la matrice complete de ces chevauchements definit le
     reseau de transmission des pertes de fire-sale.
  2. Fonction d impact-prix a deux parametres, avec un PLANCHER explicite (floor positif) -- une
     construction parametrique concrete et calibrable sur donnees, plus specifique que la seule
     "monotonicite" abstraite exigee par Amini-Filipovic-Minca (4.1).
  3. Donnees : jeu de donnees European Banking Authority (EBA) 2016, 51 banques europeennes, 93 classes
     d actifs, expositions notionnelles.
  4. Constat central : les effets de contagion indirecte MODIFIENT le resultat des stress tests bancaires
     officiels et produisent des pertes heterogenes par banque que le stress test standard (sans effet de
     deleveraging) ne peut PAS reproduire.
- Ce que le papier dit rester ouvert : non explore en detail cette passe -- limites methodologiques precises
  (linearite de l impact, calibration du plancher) non extraites faute de budget.
- Usage direct Ukemi : ceci est la methode la plus proche de ce que le canal impact-prix calibre du Mode C
  de l audit devrait devenir -- Lehar-Parlour (3.2) mesure l impact-prix empirique brut sur les DEX ;
  Cont-Schaanning donne la forme fonctionnelle parametrique et la methode de reseau pour agreger cet impact
  a travers plusieurs positions/clusters -- exactement le chainon manquant identifie par l archive interne
  (SYNTHESE-LIQUIDATIONS.md, section 4.2 : aucun papier du corpus ne modelise le canal de cascade endogene
  cote DeFi -- ce papier ne le fait pas non plus pour DeFi specifiquement, mais fournit le gabarit TradFi le
  plus directement transposable, avec Cifuentes en 2.3).

### 4.3 Battiston, S., Puliga, M., Kaushik, R., Tasca, P. and Caldarelli, G. (2012). DebtRank: Too Central to Fail? Financial Networks, the FED and Systemic Risk. Scientific Reports 2, 541. DOI 10.1038/srep00541.
- Acces : OA (Scientific Reports, journal Nature en acces libre), PDF en main,
  pdf/battiston-debtrank-2012.pdf, _txt/battiston-debtrank-2012.txt. P1.
- Niveau : [lu] abstract + section de definition de DebtRank + application FED.
- Resultats exacts utiles a Ukemi (pour dire ce que Ukemi NE FAIT PAS) :
  1. DebtRank egale une mesure de feedback-centrality -- un NOMBRE par noeud mesurant la fraction de la
     valeur economique totale du reseau qu un defaut de ce noeud mettrait sous stress, relatif a la somme
     des actifs totaux du reseau. DebtRank egal 1 signifie noeud central capable de distresser toute la
     valeur economique du reseau.
  2. Application : programme de prets d urgence de la FED (1,2 billion soit mille milliards de dollars,
     2008-2010) -- 22 institutions ayant recu l essentiel des fonds forment un graphe fortement connecte ou
     chaque noeud devient systemically important au pic de la crise ; nombreuses institutions a DebtRank
     superieur a 0,5.
  3. Conclusion des auteurs : le debat too-big-to-fail devrait inclure la question, plus serieuse encore, du
     too-central-to-fail.
- Pourquoi Ukemi NE DOIT PAS faire de DebtRank (deja tranche par l audit ukemi-eisenberg-noe-audit.md,
  section 6 : "Ne pas HJM, ne pas DebtRank (Battiston : c est un score)", coherent avec l invariant flotte
  "aucun score de resilience" du meme document, section 0) : DebtRank produit un SCORE AGREGE PAR NOEUD (un
  nombre unique entre 0 et 1), exactement le type d objet que la regle FORBIDDEN_KEYS du corpus MONARK
  interdit (cf audit, Idee 1 : "Un Resilience Score est un lemon Akerlof"). DebtRank ne produit PAS un
  intervalle, PAS une decision commit/defer/abstain -- il est structurellement incompatible avec l invariant
  CoverageVerdict/GateDecision de Ukemi. Sa lecture directe CONFIRME que le choix de l audit d etre a l ecart
  de DebtRank est bien fonde sur ce que le papier lui-meme revendique (un score, pas un intervalle, pas de
  garantie de couverture).
- Ce que le papier dit rester ouvert : DebtRank suppose un reseau d exposition CONNU et observable (donnees
  FED confidentielles obtenues par litigation ou FOIA pour cette etude) -- non directement transposable a
  DeFi sans donnees equivalentes, mais DeFi a l avantage d exposer ce graphe PUBLIQUEMENT on-chain
  (contrairement au cas FED).

### 4.4 Glasserman, P. and Young, H. P. (2015/2016). Contagion in Financial Networks. Oxford Economics Series Working Papers No. 764 (egalement Office of Financial Research WP 15-21 ; version revue Journal of Economic Literature 54(3), 2016).
- Acces : PDF en main via le miroir gouvernemental americain Office of Financial Research,
  pdf/glasserman-young-2015.pdf, _txt/glasserman-young-2015.txt. P1 (working paper institutionnel, version
  publiee ensuite dans JEL, survey a comite de lecture).
- Niveau : [lu] partiel (structure generale + quelques resultats reperes par grep -- lecture exhaustive hors
  budget de cette passe, 2890 lignes extraites).
- Resultats exacts reperes utiles a Ukemi :
  1. Reference a Elsinger (2009), Theorem 1, sur l unicite du clearing -- confirme que la litterature d
     unicite est plus large que le seul E&N/Rogers-Veraart deja lus (sections 2.1-2.2). Piste non exploree
     cette passe (Elsinger 2009 non procure, non demande par la mission, seulement signale).
  2. Le papier etend le cadre de reseau financier pour modeliser, en forme reduite, les CHANGEMENTS DE PRIX
     DE MARCHE comme mecanisme de contagion -- soit un survey qui relie explicitement le canal de clearing
     (type E&N) et le canal de prix (type Cifuentes) dans un seul cadre de synthese.
- Usage pour Ukemi : c est le survey que l audit ukemi-eisenberg-noe-audit.md (section 5.A item 3) cite
  comme "ce qu EN fait et ne fait pas" -- identification confirmee correcte (JEL / Oxford DP 764 existe bien,
  PDF trouve). Utile en reference de cadrage, pas en source de chiffre.
- A FAIRE : lecture plus profonde si Ukemi doit un jour justifier le choix E&N/Rogers-Veraart contre d
  autres formalismes de la litterature (Eisinger, Furfine, etc., tous survoles par ce papier) -- hors budget
  de cette mission precise.

### 4.5 "Chitra et al. sur les liquidations" -- identite la plus probable : Kao, H-T., Chitra, T., Chiang, R. and Morrow, J. (2020). An Analysis of the Market Risk to Participants in the Compound Protocol. Gauntlet, atelier Financial Cryptography FAB 2020.
- PROBLEME D IDENTITE A SIGNALER : la mission nomme "Chitra et al." sans titre precis. Recherche exhaustive
  : Tarun Chitra a co-ecrit plusieurs papiers touchant les liquidations ou AMM (par exemple "When does the
  tail wag the dog?" avec Angeris et Evans, sur la courbure des AMM -- PAS specifiquement les liquidations
  de pret ; "Autodeleveraging: Impossibilities and Optimization", 2025, sur les perpetuels -- pas le
  lending). Le candidat le plus directement pertinent pour "liquidations" au sens Ukemi (lending, pas AMM ou
  perpetuels) est CE papier (Kao, Chitra, Chiang, Morrow, Gauntlet, 2020) -- deja cite comme reference [15]
  "Kao et al." dans Perez, Werner, Xu, Livshits (section 2.4, Related Work), ce qui confirme sa pertinence
  pour ce cluster. Ce n est cependant PAS une identification certaine de ce que la mission avait en tete --
  a confirmer par le mainteneur si un autre papier Chitra etait vise.
- Acces : PDF en main, pdf/kao-chitra-chiang-morrow-2020.pdf, _txt/kao-chitra-chiang-morrow-2020.txt. P1
  (papier de recherche d une societe de risque, Gauntlet, presente a un atelier FC, proche d un livre blanc
  industriel plus que d un papier academique pur, mais avec methodologie explicite).
- Niveau : [lu] introduction + section 2 (Market Risks).
- Resultats exacts utiles a Ukemi :
  1. Mecanisme Compound (par contraste avec Aave/Perez et al., section 2.4) : "collateral factor of 75%"
     pour ETH, "liquidation incentive is 105% (5% extra bonus)" -- le liquidateur paie 95 dollars pour du
     collateral ETH valant 100 dollars au protocole -- structure identique au bonus/LT d Aave mais
     parametres differents (bon rappel que les parametres varient PAR PROTOCOLE, pas seulement par actif).
  2. Constat empirique : malgre un volume de l ordre de neuf chiffres en dollars sans qu aucun preteur ne
     perde d argent, il reste techniquement possible, sous conditions extremes, que des emprunteurs
     faillissent et que les preteurs perdent leur principal -- coherent avec le "0 dollar de bad debt sur
     chemin continu, mais pas garanti sous rupture" de Gatto (section 3.6).
- Ce que le papier dit rester ouvert : non explore au-dela de l introduction et de la section 2 -- le detail
  complet de la modelisation stochastique (section 3 et suivantes) NON LU cette passe.

### 4.6 Chow, C. K. (1970). On Optimum Recognition Error and Reject Tradeoff. IEEE Transactions on Information Theory 16(1), 41-46. DOI 10.1109/TIT.1970.1054406.
- ECART DE TITRE A SIGNALER : la mission nomme ce papier "reject option" ; le titre exact publie est "reject
  TRADEOFF" (confirme via dblp, ACM DL, IEEE Xplore -- trois index bibliographiques convergents). Toujours
  citer le titre exact desormais.
- Acces : ECHEC de telechargement cette passe -- IEEE Xplore est un paywall (non tente, connu bloque) ;
  miroir ResearchGate (URL directe trouvee) a renvoye HTTP 403 (meme piege anti-bot que SSRN et EPFL).
  PROCUREMENT FORME, voir section 7.
- Niveau : [abs] seulement, via resumes convergents (dblp, ACM DL, recherche web).
- Ce que l abstract etablit (a verifier au texte integral) : le papier definit une regle de rejet optimale
  fondee sur le maximum de la probabilite a posteriori (rejet si aucune classe ne depasse un seuil de
  confiance) ; etablit une relation generale entre probabilite d erreur et probabilite de rejet (la courbe
  erreur-rejet) ; proprietes de ce compromis dans le systeme de reconnaissance optimal ; exemples sous lois
  normale et uniforme.
- Usage direct Ukemi (deja invoque par l ADR-M002 pour HIKAE, cf section 2.7) : c est la justification
  theorique classique de l option abstain/defer du GateDecision de Ukemi et Hikae -- refuser de statuer
  (silence) quand la confiance est insuffisante, avec un compromis quantifie entre le taux d erreur accepte
  et le taux d abstention. Rattachement direct au CAPO de 2026 : un design qui aurait suivi une regle de
  rejet a la Chow (courbe erreur-rejet explicite) aurait eu un cadre formel pour decider si abstenir devant
  un ecart oracle de 2,85% etait justifie -- au lieu du silence pur constate dans l incident reel.
- A FAIRE (dette formee) : lecture integrale des que procure -- la regle formelle exacte (seuil sur le
  maximum a posteriori) est a verifier contre la formulation Prediction/interval de HIKAE.

### 4.7 Aave V3 -- documentation produit (seuil de liquidation, bonus, e-mode, CAPO)
- Acces : aave.com/docs/aave-v3/overview (recherche), GitHub aave/risk-v3/asset-risk/risk-parameters.md
  (fetch direct raw, _txt/aave-v3-risk-parameters.md, lu integralement), aave.com/help/borrowing/e-mode
  (recherche). P1 officiel, MAIS attention datee : le fichier risk-parameters.md recupere decrit encore
  "only a single eMode category... Stablecoins, category 1" -- cette description est OBSOLETE par rapport a
  2026 (Gatto, section 3.6, documente huit categories e-mode live, dont l ancre ETH-correlated a seuil de
  liquidation 0,95). Ne PAS citer ce fichier pour des chiffres COURANTS -- seulement pour la mecanique
  generale (definitions LTV, seuil de liquidation, bonus, health factor), qui elle n a pas change de
  structure.
- Niveau : [lu] mecanique generale ; [abs] pour les chiffres 2026 specifiques (repris de Gatto, deja lu en
  section 3.6, pas d une lecture directe de la documentation Aave a jour).
- Definitions confirmees lu : Health Factor egale la somme ponderee du collateral en ETH multiplie par le
  seuil de liquidation par actif, divisee par le total des emprunts en ETH ; liquidation si ce facteur
  descend sous 1 ; e-mode egale des categories d actifs correles avec LTV, seuil de liquidation et bonus
  PROPRES et oracle de categorie optionnel (CAPO en est une instance) ; le bonus de liquidation est
  l escompte auquel le liquidateur achete le collateral saisi.
- CAPO (Correlated Asset Price Oracle) : confirme par recherche (pas de fetch direct d une page CAPO dediee
  cette passe) -- objectif egale proteger contre les deviations de prix inattendues entre un actif et sa
  version stakee (par exemple wstETH contre ETH), via un plafond de deviation a la hausse. Coherent avec l
  incident de la section 3.7 : la cause reelle etait une mauvaise configuration du snapshot CAPO (pas une
  defaillance du principe CAPO lui-meme).
- VERDICT chiffre produit-ukemi-loop-clearing.md section 2 "Bonus e-mode 1% (LT 0,95)" : FONDE, deja confirme
  en section 3.6 via Gatto ("e-mode LT 0.95", "1% bonus", ancre ETH-correlated environ 12x levier) --
  coherence inter-source (Gatto plus documentation Aave generale) sur la mecanique, chiffres precis
  provenant de Gatto.

### 4.8 Ce qui manque au design -- reponses a la question 4 de la mission

**(a) Conformal prediction sur une sortie de point fixe / stress test (intervalles sur E(D))**
- Recherche menee : "conformal prediction" plus "stress test" plus "systemic risk" plus "fixed point interval"
  (WebSearch), et recherche ciblee additionnelle sur ACI et marche crypto.
- **NON TROUVE** : aucun papier combinant explicitement (i) une carte de compensation type Eisenberg-Noe ou
  un point fixe de contagion, ET (ii) une garantie de couverture conforme sur sa sortie. Ceci CONFIRME,
  independamment, le constat deja fait par l archive interne (SYNTHESE-LIQUIDATIONS.md, section 4.4 :
  "candidat E, conformalized survival analysis... non couvert").
- **Piste adjacente trouvee (a exploiter, pas une reponse toute faite)** : Dean Fantazzini (2024), "Adaptive
  Conformal Inference for computing Market Risk Measures: an Analysis with Four Thousand Crypto-Assets",
  MPRA Paper 121214 (PDF libre : mpra.ub.uni-muenchen.de/121214/1/MPRA_paper_121214.pdf) -- applique quatre
  algorithmes ACI (dont celui de Gibbs and Candes deja lu en 2.7) au calcul de VaR sur 4000 crypto-actifs.
  NON LU integralement cette passe (identifie et localise seulement, PDF non telecharge -- budget). Ce
  papier conformalise un RENDEMENT, pas une sortie de clearing -- ce n est donc PAS directement le papier
  manquant, mais il prouve que la FAMILLE ACI (deja choisie pour HIKAE, cf 2.7) a deja ete transposee avec
  succes au domaine crypto pour une AUTRE cible.
- **Reponse constructible (inference du chercheur, pas une conclusion sourcee)** : la Prop. 4.1 de Gibbs and
  Candes (2.7), garantie deterministe SANS hypothese sur le processus generateur, s applique a TOUTE suite
  scalaire E(D_t) quelle que soit sa fabrication interne (fictitious default, point fixe, peu importe) --
  c est un habillage EXTERNE au moteur de clearing, pas une propriete du clearing lui-meme. Rien dans la
  litterature clearing (E&N, Rogers-Veraart, Cifuentes, Amini-Filipovic-Minca) ne fournit de bornes de
  variance ou de continuite utilisables pour un habillage conforme SPLIT (non-adaptatif) -- la voie ACI
  (en ligne, sans hypothese de distribution) semble la seule immediatement applicable sans construction
  nouvelle. A verifier par un designer, pas conclu ici.

**(b) Non-unicite et comment publier honnetement**
- Reponse SOURCEE (pas une opinion) : trois sources se completent.
  1. Rogers-Veraart (2.2) : publier le PLUS GRAND (L-etoile) ET le PLUS PETIT (L-etoile-minuscule) vecteur de
     compensation des que les couts de defaut sont inferieurs a 1 -- jamais "le" vecteur unique.
  2. Amini-Filipovic-Minca (4.1, abs seulement) : verifier si la fonction d impact-prix du design (si Ukemi
     mode C est ajoute au mode L) satisfait les conditions de monotonie qui RESTAURENT l unicite malgre le
     canal endogene -- si oui, un seul vecteur suffit et peut etre publie comme tel, avec la condition
     verifiee explicitement citee.
  3. Eisenberg-Noe Thm 2 (2.1) : la condition de REGULARITE (chaque "risk orbit" atteint un noeud a e > 0)
     est TESTABLE directement sur le graphe-loop construit par Ukemi -- un controle explicite a faire AVANT
     toute publication d un vecteur unique : "ce graphe-loop particulier est-il regulier ?" plutot que de
     supposer l unicite par defaut.
- **Controle de design concret (pas un verdict, une condition a ecrire dans l ADR du produit)** : un loop
  fortement connecte avec au moins une jambe a e > 0 (equite non-loopee non nulle, cf audit
  ukemi-eisenberg-noe-audit.md section 2, mode L : "e_i = l equite non loopee") est regulier au sens E&N --
  mais des jambes intermediaires PUREMENT recyclees (e = 0 partout sauf un point d entree) NE LE SONT PAS,
  et App. 2 de Eisenberg-Noe (2.1, lu directement par moi) montre EXACTEMENT ce cas : un continuum de
  vecteurs de compensation. Ukemi doit donc TESTER e_i > 0 sur chaque jambe du graphe-loop construit avant
  de publier un E(D) unique, sinon publier l intervalle [E_moins(D), E_plus(D)] entre les deux vecteurs
  extremes.

**(c) Donnees on-chain de positions Aave v3 pour reconstruire Pi, e**
- **CONFIRME FAISABLE** : trois voies identifiees et verifiees par recherche (pas de donnees tirees, juste
  confirmation d existence) :
  1. Subgraph officiel Aave (github.com/aave/protocol-subgraphs), deploiements multiples (Ethereum
     mainnet V3, Polygon V3, Avalanche V3, Arbitrum V3, Optimism V3, etc.), endpoint GraphQL heberge par
     The Graph -- expose positions utilisateur, reserves, evenements de transaction.
  2. Dune Analytics : dashboards existants observes (dune.com/xmc2/aave-v3-ethereum,
     dune.com/youssfezhene22/AAVE-V2V3) -- confirme que des tables/requetes exploitables existent, sans
     avoir confirme le nom exact d une table "aave_v3" dans le spellbook officiel Dune (a verifier au
     moment de l implementation, pas cette passe).
  3. RPC direct : `UiPoolDataProvider.getUserReservesData` deja cite comme fonction on-chain standard par le
     texte de mission elle-meme (confirme comme un contrat de vue reel existant dans la documentation Aave
     V3, aave.com/docs/aave-v3/smart-contracts/view-contracts, trouve en recherche mais non fetch en detail
     cette passe).
- **Conclusion** : aucune des trois voies n a ete testee en conditions reelles (pas d appel RPC, pas de
  requete Dune executee) -- la mission demandait de VERIFIER L EXISTENCE, pas de tirer les donnees ; c est
  fait. Implementer la reconstruction de Pi (matrice de recyclage) et e (equite non loopee) par wallet reste
  un travail d ingenierie a part entiere, hors perimetre biblio de cette passe.

**(d) Rejeu CAPO**
- Les donnees necessaires (fenetre de blocs, serie oracle vs marche) EXISTENT et sont PARTIELLEMENT deja
  extraites par cette passe (section 3.7) : horodatage exact (10 mars 2026, 22:01 EDT), ratio CAPO publie
  (~1,1939) vs taux de marche reel (~1,228), 34 comptes, environ 10 938 wstETH liquides. Le detail
  bloc-par-bloc et le post-mortem technique complet (le "offchain process determined that the snapshot ratio
  should be updated to approximately ~1.2282", verbatim The Block) pointent vers un document PRIMAIRE non
  encore fetch cette passe : le post-mortem Chaos Labs et/ou la proposition de gouvernance Aave
  (governance.aave.com) -- **PROCUREMENT FORME, voir section 7**. Sans ce document, un rejeu PRECIS
  (bloc-par-bloc) n est pas realisable depuis cette archive seule ; un rejeu APPROXIMATIF (au niveau de l
  ecart de prix et du nombre de comptes) l est deja, avec les chiffres ci-dessus.

## 5. Contradictions (rapportees, non tranchees -- doc 03 regle 7)

1. **Perte CRV/Aave, 22 novembre 2022 -- TROIS chiffres pour le MEME evenement** :
   - Warmuz, Chaudhary and Pinna (section 3.5, lu directement, verbatim) : "$1.78 million of bad debt".
   - Banque du Canada (section 3.3, note de bas de page 9, lu directement, verbatim) : "$1.3 million in bad
     debt", en citant elle-meme Warmuz et al. 2023 comme source -- **donc la Banque du Canada CITE Warmuz et
     al. mais rapporte un chiffre DIFFERENT de celui que Warmuz et al. rapportent eux-memes**.
   - Gatto (section 3.6, lu directement, verbatim) : reconstruction independante, "$1.65M modelled against
     roughly $1.60M realized on-chain".
   - Aucune reconciliation tentee -- les trois sont consignees telles quelles. Hypothese non verifiee : les
     ecarts pourraient venir de conventions differentes (perte brute vs nette de recuperation partielle,
     prix CRV retenu, ou simplement une chaine de citation deja fautive en amont de la Banque du Canada).

2. **Incident CAPO 10 mars 2026 -- montants de compensation multiples, denominateurs non reconcilies** :
   - The Block (section 3.7) : "$26 million" (arrondi), 499 ETH gagnes par les liquidateurs, 141,5 ETH
     recuperes, jusqu a 345 ETH de tresor DAO en compensation.
   - bex.co (section 3.7) : "$26.9 million" (le chiffre repris par l audit Ukemi), environ 345 ETH de bonus
     de liquidateur rendus.
   - Archive interne Clawpumptech (SYNTHESE-LIQUIDATIONS.md, INVENTAIRE R12, projet distinct, NON re-ouverte
     en detail cette passe) : "316,94 WETH net" pour un incident presume identique.
   - Les quatre chiffres ETH (499 / 141,5 / 345 / 316,94) ne s emboitent pas exactement par une arithmetique
     simple verifiee (499 moins 141,5 egale 357,5, proche de 345 mais pas 316,94 ; 345 moins 316,94 egale
     28,06, sans explication trouvee). NON RECONCILIE.

3. **"15,7 Md$" Q1 2026 attribue a "Blockeden/stress-test" par l audit, mais AUCUNE page blockeden.xyz
   trouvee ne le porte** -- le chiffre circule via bex.co (agregateur, section 3.9) SANS source primaire
   citee par bex.co lui-meme. Le blockeden.xyz reellement lu (section 3.9) decrit un evenement DIFFERENT
   (chiffres de baisse de marche differents). Possible confusion de deux evenements de marche distincts de
   2026 (repli TVL debut fevrier vs cascade de liquidations plus tardive) sous un seul intitule "Q1 2026".

4. **FC26, identite non confirmee** : l audit `ukemi-eisenberg-noe-audit.md` (section 5.C, item 8) cite "FC26
   (2026). Structural shift in DeFi lending." comme source du couple "65% de dette / 15% d equite". Aucun
   document portant ce nom exact n a ete localise. Le candidat le plus proche par contenu numerique est
   Messari/Blockworks, "Aave: Cracks in the Monolithic Thesis" (chiffre confirme par recherche : les 10 plus
   gros emprunteurs WETH sur Aave, 3,65 Md$ soit 65,4% du total emprunte WETH -- PROCHE du "65%" mais porte
   sur WETH specifiquement, pas sur "la dette Aave+Spark" en general comme l ecrit l audit) -- MAIS le
   fetch direct du rapport Messari a echoue deux fois (HTTP 429, limite de requetes) et le second chiffre
   "15%" (equite) n a JAMAIS ete retrouve, ni dans Messari ni ailleurs. **"FC26" comme identite
   bibliographique reste NON RESOLU** -- soit un nom de code interne a l equipe Monark pour une source non
   nommee explicitement ailleurs, soit une erreur de transcription.

## 6. NON TROUVE (consolide -- jamais comble par inference)

1. Le chiffre exact "**47 M$ de bad debt pour un jump de 10%**" (Gatto, cite par l audit) -- **CASSE**,
   absent de la source citee elle-meme (voir section 3.6). Recherche exhaustive negative (grep "47" = 0
   occurrence sur le texte integral de la page daru.finance).
2. Source primaire du chiffre **"15,7 Md$"** de liquidations Q1 2026 -- voir sections 3.9 et 5.3.
3. Identite exacte de **"FC26"** et source du chiffre **"15%"** (equite loopee) -- voir section 5.4.
4. Confirmation verbatim, sur une page officielle DeFi Saver ouverte directement par moi, du couple
   **"105% / 110%"** -- voir section 3.8 (niveau [abs], pas [lu]).
5. Texte integral de **Amini, Filipovic and Minca (2016)** -- voir section 4.1, procurement forme.
6. Texte integral de **Chow (1970)** -- voir section 4.6, procurement forme.
7. Le post-mortem PRIMAIRE (gouvernance Aave ou Chaos Labs) de l incident CAPO, avec le detail bloc-par-bloc
   -- voir section 4.8(d) et section 7.
8. Papier combinant explicitement une garantie conforme et une sortie de clearing/point fixe systemique --
   voir section 4.8(a). Confirmation independante d un gap deja note par l archive interne.
9. Nom de table exact dans le Dune spellbook officiel pour Aave v3 (l existence de dashboards Dune est
   confirmee, pas le nom de table canonique "aave_v3") -- voir section 4.8(c).
10. Contenu detaille (au-dela de l introduction) de Kao, Chitra, Chiang and Morrow (2020) -- section 3+ du
    papier NON LUE -- voir section 4.5.

## 7. Procurements formes (pour l investisseur -- identite complete, tentatives, usage)

| # | Document | Identite complete | Tentatives faites | Usage prevu |
|---|---|---|---|---|
| PR-UK-1 | Amini, Filipovic and Minca (2016) | "Uniqueness of Equilibrium in a Payment System with Liquidation Costs", Operations Research Letters 44(1), pp.1-5. DOI 10.1016/j.orl.2015.10.005. Egalement SSRN 2619512, EPFL Infoscience (entite 0e126980-dfcf-492f-87c9-893b60629b1c) | curl direct SSRN (403 attendu, non tente vu le precedent Gatto) ; curl direct EPFL Infoscience (HTTP 202, pare-feu anti-bot AWS) ; recherche de miroir PDF libre (aucun trouve) | Section 4.1 -- pendant positif de Rogers-Veraart, conditions de recuperation de l unicite sous impact-prix endogene. Bloque la reponse complete et sourcee (avec numeros de theoreme et de page) a la question "non-unicite, comment publier honnetement" de la mission (point 4) |
| PR-UK-2 | Chow, C. K. (1970) | "On Optimum Recognition Error and Reject Tradeoff", IEEE Transactions on Information Theory 16(1), pp.41-46. DOI 10.1109/TIT.1970.1054406 | curl direct miroir ResearchGate (HTTP 403) ; IEEE Xplore non tente (paywall connu) | Section 4.6 -- fondation theorique classique de l option abstain/defer de HIKAE/Ukemi ; regle formelle de rejet a comparer a la formulation Prediction/interval |
| PR-UK-3 | Post-mortem primaire incident CAPO (10 mars 2026) | Chaos Labs (post-mortem technique) et/ou proposition de gouvernance Aave sur governance.aave.com, titre exact et URL non identifies cette passe (seulement des reprises de presse ont ete lues, section 3.7) | Recherche web generale menee (theblock.co, bex.co, plusieurs agregateurs lus) ; PAS de recherche ciblee sur governance.aave.com directement cette passe (budget) | Section 4.8(d) -- rejeu bloc-par-bloc de l incident, reconciliation des quatre chiffres ETH divergents (section 5.2) |
| PR-UK-4 | Cifuentes, Ferrucci and Shin (2004) | "Liquidity Risk and Contagion", Bank of England Working Paper (version longue avec simulations numeriques completes, Fig. 1-3). Deja identifie comme P-K4-2b par l archive interne Clawpumptech (ADR-M002/M003), report ici tel quel, TOUJOURS DU | Non re-tente cette passe (dette deja formee ailleurs, portee ici pour visibilite investisseur) | Section 2.3 -- valeurs numeriques completes du canal endogene Cifuentes (Fig. 3 : seuil de liquidite, non-monotonie en connexite) |
| PR-UK-5 | Messari/Blockworks, "Aave: Cracks in the Monolithic Thesis" | messari.io/report/aave-cracks-in-the-monolithic-thesis, date de publication non confirmee (2026, contexte KelpDAO avril 2026) | 2 tentatives WebFetch, toutes deux HTTP 429 (limite de requetes cote serveur, pas un blocage permanent -- a retenter plus tard) | Sections 5.4 et 6.3 -- verifier si ce rapport contient le "15%" d equite compagnon du "65%", et confirmer ou infirmer l hypothese que ce document est la source reelle derriere l intitule "FC26" |
| PR-UK-6 | Source primaire du chiffre "15,7 Md$" liquidations Q1 2026 | Non identifiee -- candidats a verifier : DefiLlama (tableau de bord liquidations), rapports trimestriels nommes des agregateurs (Blockeden, IntoTheBlock, Sentora) | Recherche web menee (voir section 3.9), WebFetch cible sur bex.co (confirme l absence de citation primaire dans cet article) | Section 3.9 -- fonder ou definitivement casser ce chiffre, actuellement "ni fonde ni casse" |

## 8. Journal des sources / acces (succes et echecs, doc 03 regle 6)

**Fichiers locaux lus directement (Read/Bash cat), deja [lu] avant cette mission, re-verifies par moi** :
F:\Monark\docs\etude-suite-2026-09-18\ukemi-eisenberg-noe-audit.md ; ...\produit-ukemi-loop-clearing.md ;
F:\Monark\packages\ukemi\src\{clearing,liquidable,prediction}.ts ; F:\Monark\docs\adr\ADR-M002*.md,
ADR-M003*.md (extraits) ; F:\Monark\docs\{G1,G2,G7}-lot-K*.md ; F:\Monark\docs\lecture-EN-lemme5.md ;
F:\Monark\docs\JOURNAL-PROVENANCE.md (extraits) ; F:\Clawpumptech\procurements-lectures\ (7 fiches,
integrales) ; F:\Clawpumptech\liquidations\{SYNTHESE-LIQUIDATIONS.md, CAMPAGNE-LIQUIDATIONS.md,
lecture\K1-mecanique-mesure.md, lecture\K2-spirales-depeg.md (partiel, lignes 1-185/263)}.

**Telechargements PDF reussis (curl, sha256 dans SOURCES-sha256.txt)** : arxiv.org/pdf/2608.03616 (Garcia
Seuma) ; bankofcanada.ca sap2026-13.pdf ; arxiv.org/pdf/2212.07306 (Warmuz et al) ;
bis.org/.../working-paper-1062...pdf (Lehar-Parlour, apres redirection depuis l ancienne URL
bis.org/publ/work1062.pdf, HTTP 301) ; mfm.uchicago.edu Cont-Schaanning 2017 ; nature.com/articles/srep00541.pdf
(Battiston) ; financialresearch.gov OFRwp-2015-21 (Glasserman-Young) ; scfab.github.io FAB2020_p5.pdf
(Kao-Chitra-Chiang-Morrow). Deja en main avant mission (copies depuis Downloads/papiers demandes) :
eisenberg2001, rogers2013, cifuentes2005, qin2021 (3487552.3487811), gibbs2021 (2106.00170v3).

**Telechargements/fetches echoues (consignes, doc 03 regle 6)** :
- papers.ssrn.com/sol3/papers.cfm?abstract_id=7157638 (Gatto) -- curl HTTP 403 ; WebFetch HTTP 403.
  Contourne via daru.finance/research/liquidation-risk (miroir auteur, reussi).
- infoscience.epfl.ch/entities/publication/0e126980... (Amini-Filipovic-Minca) -- curl HTTP 202,
  x-amzn-waf-action=challenge. NON contourne -- procurement PR-UK-1.
- researchgate.net (Chow 1970, miroir direct) -- curl HTTP 403. NON contourne -- procurement PR-UK-2.
- aidf.nus.edu.sg (Lehar-Parlour, premiere tentative de miroir) -- reponse 200 mais fichier HTML de 212
  octets (page d erreur), pas un PDF. Contourne via l URL BIS mise a jour (succes).
- messari.io/report/aave-cracks-in-the-monolithic-thesis -- WebFetch HTTP 429 (deux tentatives). NON
  contourne -- procurement PR-UK-5.
- defisaver.com/features/automation, aavesim.defisaver.com -- fetches reussis (HTTP 200) mais AUCUNE
  mention litterale "105%"/"110%" trouvee dans le texte retourne -- niveau [abs] retenu en consequence
  (section 3.8), pas un echec de fetch mais une insuffisance de preuve directe.

**Outils utilises** : Bash (curl, pdftotext -layout, sha256sum, grep, awk), WebSearch, WebFetch,
mcp firecrawl_search (categorie pdf), mcp firecrawl_research_search_papers. Aucun appel a l advisor integre
pendant la collecte (regle mainteneur 2026-09-05). Un seul appel advisor, avant le debut du fetch, pour
valider la strategie de reutilisation des archives internes -- voir orientation en tete de session.

## 9. Rapport de passe (moins de 1500 mots -- section finale, survit a une coupure)

MODELE RESOLU : claude-sonnet-5. Gate 0 conforme.

### Tableau des sources (25/25 couvertes -- identite / acces / niveau / 1 phrase)

| # | Source (court) | Acces | Niveau | Verdict en 1 phrase |
|---|---|---|---|---|
| 1 | Eisenberg and Noe 2001 | PDF en main | lu | Existence Thm1, unicite Thm2 sous regularite (e>0), non-expansivite Lemme5 contredite en l1 par calcul source |
| 2 | Rogers and Veraart 2013 | PDF en main | lu | (alpha,beta) etendent E&N ; unicite perdue des alpha ou beta <1 (Ex 3.3) ; GA converge en n tours |
| 3 | Cifuentes, Ferrucci and Shin 2005 | PDF en main (version courte JEEA) | lu | Prix endogene p=exp(-alpha*somme ventes) ; unicite a p=1 seulement, ambigue sous p<1 |
| 4 | Perez, Werner, Xu and Livshits (Knife-edge) | arXiv OA | lu | Eq3 = liquidable.ts ; 3%->10M liquidable ; PAS de canal fire-sale modelise |
| 5 | Qin, Zhou, Gamito, Jovanovic and Gervais 2021 | PDF en main | lu | 63,59M profit liquidateurs (PAS 800M) ; 807,46M volume liquide ; 1,07Md liquidable MakerDAO a -43% ETH |
| 6 | Klages-Mundt and Minca (In)Stability | arXiv OA | lu | Attaque fork+censure sur heritage de prix oracle ; 8M$ enchere Dai quasi-nulle, DIFFERENT du 4M$ du papier-soeur |
| 7 | Gibbs and Candes 2021 (ACI) | PDF en main | lu | Garantie long-run SANS hypothese (Prop 4.1) -- applicable a toute suite E(D_t) quelle que soit sa fabrication |
| 8 | Aave Labs, blog liquidations | HTML lu directement | lu | 310k liquidations/4,65Md$ confirme verbatim, 429M jan-fev26 confirme, 250M oct25 confirme |
| 9 | Lehar and Parlour, BIS WP1062 | PDF en main (apres redirection) | lu (intro) | 2 487 543 624$ de liquidations Compound+Aave confirme exact |
| 10 | Banque du Canada SAP2026-13 | PDF en main | lu | 20,46% volume emprunte en levier recursif confirme (pas juste ">20%" vague) |
| 11 | Garcia Seuma 2026 | arXiv OA | lu (abstract+methode) | lambda-hat=branching ratio (PAS impact-prix) = 0,1-0,2 sous-critique, confirme p.1 ; resultat INTRA-VENUE seulement |
| 12 | Warmuz, Chaudhary and Pinna 2022/2023 | arXiv OA | lu (intro+cas) | Papier DISTINCT de Chaudhary and Pinna 2211.08870 ; bad debt CRV = 1,78M$ (3e chiffre pour le meme fait) |
| 13 | Gatto (Aave v3 live-book) | HTML miroir auteur (SSRN bloque) | lu | 1,38Md$/0$ CONFIRME ; D*=7,4% CONFIRME ; "47M$ jump10%" INTROUVABLE dans la source, CASSE |
| 14 | Chaos Labs sortie + CAPO | Presse convergente | lu | 5M refuses, perte 3 ans, 2Md liquidations, 0 bad debt materiel, CAPO 26,9M -- TOUS confirmes ; ETH compensation NON reconcilie a 4 sources |
| 15 | DeFi Saver Liquidation Protection | 3 pages officielles lues | lu (mecanisme) / abs (105/110%) | Mecanisme confirme ; 105/110% jamais vu verbatim par moi ; 0,05% existe mais generique, pas dedie |
| 16 | "Blockeden" 15,7Md$ Q1 2026 | Introuvable a la source | 2nd/P3 | Chiffre circule sans source primaire identifiee -- ni fonde ni casse |
| 17 | Amini, Filipovic and Minca 2016 | BLOQUE (WAF) | abs | Pendant positif de Rogers-Veraart pour l unicite sous impact-prix -- procurement forme |
| 18 | Cont and Schaanning 2017 | PDF en main | lu (structure) | Reseau de chevauchement pondere-liquidite + fonction d impact a 2 parametres, calibre sur EBA 2016 |
| 19 | Battiston et al DebtRank 2012 | PDF en main (OA) | lu | Score agrege par noeud -- confirme pourquoi Ukemi doit s en tenir a l ecart (invariant anti-score) |
| 20 | Glasserman and Young 2015/2016 | PDF en main | lu (partiel) | Survey confirme, relie clearing et canal-prix ; Elsinger 2009 signale non lu |
| 21 | Kao, Chitra, Chiang and Morrow 2020 | PDF en main | lu (intro) | Identite "Chitra et al." incertaine mais meilleur candidat ; bonus Compound 105%(5%) different d Aave |
| 22 | Chow 1970 | BLOQUE (403) | abs | Titre exact "reject TRADEOFF" pas "option" ; fonde abstain/defer -- procurement forme |
| 23 | Aave V3 docs (LT/bonus/e-mode/CAPO) | GitHub + recherche | lu (mecanique) / abs (chiffres 2026) | Fichier officiel trouve est DATE (1 seule categorie e-mode) -- chiffres 2026 viennent de Gatto, pas de la doc |
| 24 | FC26 "Structural shift" | NON RESOLU | -- | Identite bibliographique introuvable ; 65% partiellement proche de Messari (65,4% WETH) ; 15% jamais trouve |
| 25 | Ukemi code source (clearing/liquidable/prediction.ts) | Local, lu integralement | lu | E&N+RV implemente avec unicite geree ; prix endogene et graphe-loop NON implementes |

### Chiffres fondes vs casses (les 10 demandes explicitement + Lehar-Parlour)

FONDES (verbatim retrouve a la source) : 4,65Md$/310k (Aave blog) ; oct25 250M$/j ; jan-fev26 429M$ ;
lambda-hat 0,1-0,2 (Garcia Seuma, p.1) ; 1,38Md$/0$ bad debt (Gatto) ; D* 7,4% mediane 6,9% (Gatto) ;
>20% recursif (BoC, precise 20,46%) ; CAPO 26,9M$ (bex.co, The Block dit 26M$) ; Chaos Labs 5M refuses/perte
3 ans/2Md liquidations/0 bad debt materiel ; Lehar-Parlour 2,49Md$ (2 487 543 624$ exact).

CASSE : **47M$ "jump 10%"** -- absent de la source Gatto citee (grep "47" = 0 occurrence sur le texte
integral). Aucune lecture raisonnable de la table des sauts discrets ne produit ce chiffre.

NI FONDE NI CASSE (preuve insuffisante) : 105%/110% DeFi Saver (mecanisme oui, chiffres jamais vus verbatim
par moi) ; 15,7Md$ Blockeden/stress-test (source primaire introuvable) ; 65%/15% FC26 (identite du document
introuvable, 65% proche mais pas identique a un proxy Messari, 15% jamais retrouve).

### Procurements formes pour l investisseur (detail complet section 7 de l archive)
PR-UK-1 Amini-Filipovic-Minca 2016 (DOI 10.1016/j.orl.2015.10.005, bloque par pare-feu anti-bot) ; PR-UK-2
Chow 1970 (DOI 10.1109/TIT.1970.1054406, IEEE Xplore + miroir bloques) ; PR-UK-3 post-mortem primaire CAPO
(gouvernance Aave/Chaos Labs, URL non identifiee) ; PR-UK-4 Cifuentes-Ferrucci-Shin 2004 BoE WP long (dette
deja formee ailleurs, reportee) ; PR-UK-5 rapport Messari Aave (HTTP 429, a retenter) ; PR-UK-6 source
primaire du 15,7Md$.

### Problemes ouverts sources (question 4 de la mission)
(a) Conformal sur sortie de clearing : NON TROUVE dans la litterature (recherche dediee negative) ;
Gibbs-Candes Prop 4.1 (sans hypothese) est la voie la plus immediatement applicable en habillage externe,
non conclu. (b) Non-unicite : Rogers-Veraart (publier L+ et L-) + Amini-Filipovic-Minca (conditions de
recuperation, texte non lu) + test de regularite E&N direct sur le graphe-loop (jambes a e=0 = danger,
App.2 E&N). (c) Donnees on-chain : confirme faisable (subgraph officiel multi-chaines, Dune, vue RPC
UiPoolDataProvider), rien tire. (d) Rejeu CAPO : donnees d ecart de prix et de comptes deja en main
(section 3.7), detail bloc-par-bloc bloque sur un document primaire non localise (PR-UK-3).

FIN
