Modèle résolu : claude-opus-5-5[1m]

# Fiche — Angelopoulos & Bates, « A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification », arXiv:2107.07511v6 — p.14, p.43 (§A.1.1), p.49-50 (ann. C), p.50-51 (ann. D)

Chercheur Opus 5.5 (`claude-opus-5-5[1m]`, effort max), 2026-09-23. Mission : item I-2 (ADR-U4b, G7 STATS-1 ;
C-W-4 (b)), avant l'étape 6 de la course Ukemi. Aucun commit (R-20). Aucune consultation de l'advisor intégré
pendant l'extraction (filtre de régurgitation) ; les questions ouvertes sont formées en fin de fiche.

## 1. Identification [lu]

- **Titre exact** (page abs arXiv et p.1 du PDF) : « A Gentle Introduction to Conformal Prediction and
  Distribution-Free Uncertainty Quantification ».
- **Auteurs** : Anastasios N. Angelopoulos, Stephen Bates (page abs ; `citation_author`).
- **Identifiant** : arXiv:2107.07511 [cs.LG] ; DOI arXiv (DataCite) `10.48550/arXiv.2107.07511`. Aucune
  « Journal reference » sur la page abs (champ absent — NON TROUVÉ sur cette page).
- **Version lue : v6**, déposée « Wed, 7 Dec 2022 05:08:01 UTC » (historique de la page abs). Historique :
  v1 2021-07-15, v2 2021-12-27, v3 2022-01-30, v4 2022-05-31, v5 2022-09-03, v6 2022-12-07. Le « 2021 » du nom
  de la fiche est l'année de la v1 ; le texte lu est celui de la v6 (2022). Les tailles « KB » de l'historique
  (v6 : 25,296 KB) ne correspondent pas au PDF servi (5 360 733 octets) ; il s'agit vraisemblablement de la
  taille du dépôt source (non vérifié).
- **Licence** : licence arXiv non exclusive de distribution 1.0 (`arxiv.org/licenses/nonexclusive-distrib/1.0/`)
  — **pas** une licence CC : accès ouvert en lecture, texte sous droits ⇒ citations ≤ 25 mots.
- **Sources consultées** : `https://arxiv.org/abs/2107.07511v6` (HTTP 200, 45 903 octets) et
  `https://arxiv.org/pdf/2107.07511v6` (HTTP 200, `application/pdf`, 5 360 733 octets), récupérées le
  2026-09-23 à 07:13:27 UTC (horloge de la machine, `date -u`).
- **PDF** : 51 pages (`pdfinfo` : pdfTeX-1.40.21, créé le 2022-12-08 01:12:58 GMT, format lettre).
  **sha256 = `c69aa191d8363c25b36685db4adb7e6980e55ee39892fd3626206c16e1e0efa1`** — **identique** à l'attendu
  de l'ADR-U4b (§3, versement I-2). Pas de collision de nom : titre, auteurs et identifiant conformes.
- **Fichiers locaux** : `docs/biblio/ukemi-modeL/pdf/angelopoulos-bates-gentle-intro-v6.pdf` et
  `docs/biblio/ukemi-modeL/_txt/angelopoulos-bates-gentle-intro-v6.txt` (ignorés par git : `.gitignore:17-18`).
- **Classe** : **P1** (texte des auteurs, dépôt arXiv officiel).
- **Pagination** : les numéros imprimés coïncident avec les indices de page du PDF (p.2 imprimée « 2 », p.3
  imprimée « 3 » ; pieds de page contrôlés aussi en p.4-6, 14-15, 40-44, 49-51). Toute « p.N » de cette fiche = page N du PDF
  = page imprimée N.
- **Table des matières (p.2-3) [lu]** : §3.2 « The Effect of the Size of the Calibration Set » p.14 ; §3.3
  « Checking for Correct Coverage » p.15 ; ann. A « Distribution-Free Control of General Risks » p.39 ; A.1
  « Instructions for Learn then Test » p.40 ; **A.1.1 « Crash Course on Generating p-values » p.43** ; A.1.2
  p.44 ; **ann. C « Concentration Properties of the Empirical Coverage » p.49** ; **ann. D « Theorem and Proof:
  Coverage Property of Conformal Prediction » p.50**.

## 2. Méthode d'extraction [lu]

- `pdftotext -layout -enc UTF-8` (Poppler **25.07.0**), sortie CRLF avec 51 sauts de page (`\f`) — même
  convention que les autres textes de `_txt/`. Texte sha256
  `e7e49bc91e621b1d36f2115d676fa49956dc12fca118fc7b249f2b830c4aaadd` (195 906 octets).
- Découpage par page sur `\f` (page N = N-ième segment) ; le numéro imprimé en pied de chaque segment lu a été
  contrôlé.
- Formules : la couche texte perd la mise en forme de certaines expressions (fractions, indices, crochets
  ⌊ ⌋) ; toute formule reproduite ici est **en notation propre**, recomposée depuis la couche texte ; quand la
  couche texte ne suffit pas, la zone a été rendue en image (zones ciblées listées en tête du §3) et la
  recomposition le dit.

## 3. Extraits [lu] — pages demandées

Rendus image (poppler `pdftoppm -r 200`, zones rognées, fichiers temporaires hors dépôt sous `F:\tmp\i2\`) :
p.14 (l.39-48 et l.49-53), p.15 (haut : Fig. 11 + Tableau 1), p.42 (étape 3), p.43 (l.28-37), p.44 (l.35-48),
p.49 (l.8-20), p.50 (l.15-20). Motif : lever les ambiguïtés de la couche texte (crochets ⌊ ⌋ / ⌈ ⌉, fraction
1/n_val, radicaux, surlignage de C̄, symbole ε perdu, relations < / ≤).

### 3.1 p.14 — §3.2 « The Effect of the Size of the Calibration Set » [lu ; formule confirmée par rendu image]
- Objet (l.32-33) : « the coverage of conformal prediction conditionally on the calibration set is a random
  quantity ».
- **Loi (a)** (l.39-45), notation propre :
  P( Y_test ∈ C(X_test) | {(X_i, Y_i)}_{i=1}^n ) ∼ Beta(n + 1 − l, l),  où  l = ⌊(n + 1)α⌋.
  Couche texte : « l = b(n + 1)αc » — « b…c » est le codage cmsy de ⌊…⌋ ; **le rendu image montre des crochets
  planchers (coins bas seuls)**. Convention : **⌊ ⌋ (partie entière inférieure)**, pas ⌈ ⌉.
- Sens de la quantité (l.46-47) : « Notice that the conditional expectation above is the coverage with an infinite
  validation data set, holding the calibration data fixed. »
- Attribution et preuve (l.39, l.47) : « first introduced by Vladimir Vovk in [14] » ; « A simple proof of this fact
  is available in [14]. » — [14] = V. Vovk, « Conditional validity of inductive conformal predictors », Proceedings
  of the Asian Conference on Machine Learning, vol. 25, 2012, pp. 475–490 (bibliographie p.33 l.5). L'**énoncé** est
  [lu] ici ; la **preuve** n'est pas reproduite par A&B : elle est [2nd] pour cette fiche (voir §10, Q-3).
- Paramétrisation de Beta : non définie sur p.14 ; la convention standard (densité ∝ x^{a−1}(1−x)^{b−1}, moyenne
  a/(a+b), a = premier paramètre) est **confirmée par cohérence interne** avec p.50 :
  E(C̄) = 1 − l/(n+1) = (n+1−l)/(n+1) = a/(a+b) pour a = n+1−l, b = l.
- Chiffres (α = 0,1 d'après la légende de la Fig. 11, p.15) : l.49-50 « choosing n = 1000 calibration points leads
  to coverage that is typically between .88 and .92 » ; l.51-52 : taille n requise pour une couverture 1 − α ± ε
  avec probabilité 1 − δ (ε confirmé par rendu image), valeurs au Tableau 1 (p.15, census §7).
- l.52 : « the average coverage is always at least 1 − α ».
- **Hypothèses énoncées sur p.14 : aucune** dans le paragraphe (ni i.i.d., ni échangeabilité, ni absence d'ex
  æquo) ; le paragraphe s'appuie sur « The coverage guarantee in (1) » (l.27), cf. §4.
- Pied de page imprimé « 14 » (l.59) = page 14 du PDF.

### 3.2 p.49 — Annexe C « Concentration Properties of the Empirical Coverage » [lu ; formule confirmée par rendu image]
- l.2 : « We adopt the same notation as Section 3. » — C_j est la couverture empirique de l'essai j (p.15, §3.3) :
  C_j = (1/n_val) Σ_{i=1}^{n_val} 1{ Y^(val)_{i,j} ∈ C_j(X^(val)_{i,j}) }, j = 1, …, R.
- l.9-10 : « This is true conditionally on the calibration data, but not marginally. » (C_j « looks like » une
  binomiale.)
- l.12-13 : E[ C_j | {(X_{i,j}, Y_{i,j})}_{i=1}^n ] ∼ Beta(n + 1 − l, l), (X_{i,j}, Y_{i,j}) = i-ème point de
  calibration de l'essai j.
- **Loi (b)** (l.14-19), notation propre :
  C_j ∼ (1/n_val) · Binom(n_val, μ),  où  μ ∼ Beta(n + 1 − l, l) ;
  l.19 : « We refer to this distribution as BetaBinom(nval, n + 1 − l, l) ».
  Paramètres, dans l'ordre : (nombre d'essais n_val, premier paramètre n + 1 − l, second paramètre l). Le facteur
  1/n_val (rendu image : fraction 1/n_val devant Binom) **n'est pas porté par l'étiquette** : « this distribution »
  suit immédiatement l'écriture C_j = (1/n_val)·Binom(n_val, μ) ; la variable de loi BetaBinom(n_val, n+1−l, l) est
  donc le **compte** n_val·C_j (l'échelle est laissée implicite par les auteurs).
- l.19-20 : la pmf **n'est pas donnée** — « its properties, such as moments and probability mass function, can be
  found in standard references ».
- l.22-23 : « the histogram of Cj should converge almost exactly to its analytical PMF (which is only a function of
  α, n, and nval) ».
- l.42-44 : « the Cj are independent beta-binomial random variables » ; la loi de C̄ (moyenne des R) « does not have
  a closed form ».
- Pas d'hypothèse nouvelle sur p.49. Pied de page « 49 » (l.50).

### 3.3 p.50 — fin de l'annexe C, annexe D [lu ; moments confirmés par rendu image]
- **Moments (c)** (l.15-20), notation propre (R = nombre d'essais, C̄ = (1/R) Σ_j C_j) :
  E(C̄) = 1 − l/(n + 1) ;
  √Var(C̄) = √[ l(n + 1 − l)(n + n_val + 1) / ( n_val · R · (n + 1)² · (n + 2) ) ] = O( 1/√(R · min(n, n_val)) ).
  Donc Var(C̄) = l(n + 1 − l)(n + n_val + 1) / ( n_val R (n + 1)² (n + 2) ).
  l.15-16 : « Since C is the average of R i.i.d. beta-binomial random variables, its mean and standard deviation
  are » (C surligné = C̄ au rendu ; barre perdue dans la couche texte). **A&B publient l'écart-type (sous radical),
  pas la variance** ; la variance ci-dessus en est le carré (équivalence exacte).
- **Théorème D.1** « Conformal calibration coverage guarantee » (l.32-42) : hypothèse i.i.d. de (X_i, Y_i)_{i≤n} et
  (X_test, Y_test) ;
  q̂ = inf{ q : |{i : s(X_i, Y_i) ≤ q}| / n ≥ ⌈(n + 1)(1 − α)⌉ / n }   (couche texte « d…e » = ⌈…⌉ : A&B nomment
  « ⌈·⌉ » la fonction plafond en p.4 l.28-29) ;
  **C(X) = {y : s(X, y) ≤ q̂}** — ensemble **fermé** ; conclusion P(Y_test ∈ C(X_test)) ≥ 1 − α.
- l.44-45, coquille d'origine conservée : « the theorem also holds if the observations to satisfy the weaker
  condition of exchangeability; see [1]. » — [1] = V. Vovk, A. Gammerman, G. Shafer, *Algorithmic Learning in a
  Random World*, Springer, 2005 (p.32 l.30).
- l.48-49 : preuve étiquetée « Proof of Theorem 1. » (sic : le théorème de l'annexe est D.1) ; « To avoid handling
  ties, we consider the case where the si are distinct with probability 1. » ; « See [25] for a proof in the general
  case. » — [25] = R. J. Tibshirani, R. Foygel Barber, E. Candès, A. Ramdas, « Conformal prediction under covariate
  shift », NeurIPS 32, 2019, pp. 2530–2540 (p.33 l.26).
- Pied de page « 50 » (l.52).

### 3.4 p.43 — §A.1.1 « Crash Course on Generating p-values » (+ voisinage p.42, p.44) [lu ; règles confirmées par rendu image]
- Cadre : Learn then Test (LTT), une nulle par paramètre ; p.42 étape 1 : H_λ : R(λ) > α.
- l.29-30 : « A p-value must satisfy the following condition, which we sometimes refer to as validity or
  super-uniformity » ; l.32 :  ∀t ∈ [0, 1],  P_{H_λ}(p_λ ≤ t) ≤ t  (« P_{H_λ} refers to the probability under the
  null hypothesis », l.34).
- l.36 : « we can reject Hλ if pλ < 5% and expect to be wrong no more than 5% of the time » — **inégalité stricte**
  (rendu image confirmé).
- l.36-37 : « This process is called testing the hypothesis at level δ » (δ = 5 % dans la phrase précédente).
- l.53 : « a p-value with distribution-free validity » ; p-value de Hoeffding p_λ = exp(−2n(α − R̂(λ))₊²)
  (l.56-60, couche texte, non rendue).
- p.44 l.1-15 (fin de §A.1.1) : p-value HB (Hoeffding-Bentkus, renvoi [18] = Angelopoulos, Bates, Candès, Jordan,
  Lei, « Learn then test », arXiv:2110.01052, 2021) ; l.13 : « Note that any valid p-value will work ».
- Règles de rejet écrites par A&B dans le voisinage :
  - p.42 l.46-49 (étape 3) : Bonferroni Λ̂ = {λ : p_λ < δ/|Λ|} — **stricte** (rendu image) ;
  - p.44 l.35-36 (exemple jouet) : Λ̂ = {λ : p_λ < δ}, FWER(Λ̂) = 1 − (1 − δ)^{|Λ|} — **stricte** (rendu image) ;
  - p.44 l.46-48 (Bonferroni formel, §A.1.2) : Λ̂_Bonferroni = {λ ∈ Λ : p_λ ≤ δ/|Λ|} — **large** (rendu image) ;
  - p.44 l.63-65 (fixed-sequence testing) : T = max{ t ∈ {1, …, N} : p_{λ_{t′}} ≤ δ pour tout t′ ≤ t } — **large**
    (couche texte, non rendue) ;
  - p.43 l.9 (code, Fig. 20) : `lambda_hat = lambdas[pvals<delta/lambdas.shape[0]]` — **stricte**.
- Pieds de page « 42 », « 43 », « 44 » contrôlés.

## 4. Hypothèses d'échangeabilité et d'ex æquo énoncées (d) [lu]

| Lieu | Énoncé (verbatim ≤ 25 mots ou notation propre) | Porte sur |
|---|---|---|
| p.4 l.14 | « fresh i.i.d. pairs of images and classes unseen during training » | données de calibration |
| p.4 l.18, éq. (1) | 1 − α ≤ P(Y_test ∈ C(X_test)) ≤ 1 − α + 1/(n+1), α ∈ [0, 1] (couche texte) | garantie marginale |
| p.5 l.51, éq. (2) | C(X_test) = {y : s(X_test, y) ≤ q̂} | ensemble fermé |
| p.5 note 1 (l.55-57) | « Due to the discreteness of Y, a small modification involving tie-breaking is needed to additionally satisfy the upper bound » ; « We will henceforth ignore such tie-breaking. » | ex æquo : ignorés pour la suite |
| p.6 Thm 1 (l.1-4) | « Suppose (Xi, Yi)i=1,...,n and (Xtest, Ytest) are i.i.d. » ⇒ P(Y_test ∈ C(X_test)) ≥ 1 − α (attribué à Vovk, Gammerman, Saunders [5]) | borne basse |
| p.14 | **aucune** hypothèse dans le paragraphe de la loi Beta | — |
| p.49 | « We adopt the same notation as Section 3. » ; essais « independent » (l.43) | indépendance entre essais |
| p.50 l.15 | « R i.i.d. beta-binomial random variables » | indépendance entre essais |
| p.50 Thm D.1 (l.32-45) | i.i.d. ; remarque : vaut aussi sous « the weaker condition of exchangeability; see [1] » | borne basse |
| p.50 l.48-49 | « To avoid handling ties, we consider the case where the si are distinct with probability 1. » ; cas général → [25] | preuve de la borne basse |
| p.51 l.14-19 | « By exchangeability of the variables (X1, Y1), . . . , (Xtest, Ytest), we have » P(s_test ≤ s_k) = k/(n+1) « for any integer k » | cœur de la preuve |
| p.51 l.1-3 | scores triés s_1 < ⋯ < s_n ; q̂ = s_{⌈(n+1)(1−α)⌉} si α ≥ 1/(n+1), q̂ = ∞ sinon (couche texte) | définition de q̂ |
| p.51 l.29-31 | « Technically, the upper bound only holds when the distribution of the conformal score is continuous, avoiding ties. » ; remède : « add a vanishing amount of random noise to the score » | borne haute |
| p.51 Thm D.2 (l.34-40) | scores de loi jointe continue ⇒ P(Y_test ∈ C(X_test, U_test, q̂)) ≤ 1 − α + 1/(n+1) ; « Proof. See Theorem 2.2 of [83]. » ([83] = Lei, G'Sell, Rinaldo, Tibshirani, Wasserman, JASA 113(523):1094–1111, 2018 ; p.35 l.43) | borne haute |

Synthèse (d) :
- Les lois Beta (p.14) et bêta-binomiale (p.49) sont énoncées **sans hypothèse explicite** dans leurs
  paragraphes ; le cadre de référence du texte est **i.i.d.** (p.4, Thm 1 p.6, Thm D.1 p.50) ; l'échangeabilité
  n'apparaît qu'en **remarque** (p.50) et dans la **preuve** de la borne basse (p.51).
- L'**absence d'ex æquo** n'est jamais posée comme condition des lois Beta/BB : elle n'apparaît que pour la preuve
  de la borne basse (scores distincts p.s., p.50) et comme condition de la borne haute (continuité, p.51 ;
  Thm D.2). La note 1 (p.5) écarte le tie-breaking pour toute la suite.
- Route de dérivation de la BB chez A&B (p.49) : binomiale **conditionnelle** aux données de calibration, de
  moyenne Beta — lecture qui suppose des points de validation conditionnellement i.i.d. (cadre de §3). A&B
  **n'énoncent pas** la loi BB sous la seule échangeabilité des n + n_val scores (NON TROUVÉ, pages lues).
- Cas dégénéré l = 0 (α < 1/(n+1), q̂ = ∞, p.51) : non discuté pour la loi Beta (NON TROUVÉ, pages lues).

## 5. Confrontation — ADR-U4b, `u4b-hyp.mjs`, test p50

État du dépôt lu (lecture seule) : HEAD `d55fbb778e645e06bdee76a27874b272261f9d11` ;
`docs/adr/ADR-U4b-calibration-episode-frais.md` sha256 `e902fa6d…9801` ; `scripts/census/u4b/u4b-hyp.mjs` sha256
`65b0d8f9…fc25` ; `apps/sentinel/test/u4b-hyp.test.ts` sha256 `f8d8f3a6…05b3`.

| # | Affirmation du dépôt | Où | Texte A&B lu | Verdict |
|---|---|---|---|---|
| C-1 | « couverture conditionnelle ~ Beta(n+1−l, l), l = ⌊(n+1)α⌋ » | ADR :1568-1569 ; outil :21-22 | p.14 l.41-45 : même loi, mêmes paramètres, même ordre, plancher ⌊ ⌋ (rendu image) | **CONCORDANCE EXACTE** |
| C-2 | « donc n+1−l = p » ; outil : « Note n+1-l = ceil((n+1)(1-alpha)) = p » | ADR :1569 ; outil :23 | identité **non écrite** par A&B (NON TROUVÉ) ; A&B emploient ⌈(n+1)(1−α)⌉ ailleurs (p.4 l.28, p.5 l.48, p.50 l.35, p.51 l.3) | **CONCORDANCE par identité exacte** : pour m entier et x réel, m − ⌊x⌋ = ⌈m − x⌉ ; avec m = n+1 et x = (n+1)α, n+1−l = ⌈(n+1)(1−α)⌉ = p. Recalcul entier : 0 écart sur 1 200 006 cas (§5.1). Étape de l'ADR, pas du texte. |
| C-3 | « le compte suit une BetaBinom(n_val, n+1−l, l) » ; outil : « generative form [lu] (Angelopoulos & Bates p.49): K \| mu ~ Binom(N, mu), mu ~ Beta(a, b) » | ADR :1569-1570 ; outil :22, :109 | p.49 l.16-19 : C_j ∼ (1/n_val)·Binom(n_val, μ), μ ∼ Beta(n+1−l, l) ; « We refer to this distribution as BetaBinom(nval, n + 1 − l, l) » | **CONCORDANCE EXACTE** (paramètres, ordre et forme générative identiques). Nuance d'échelle nommée : A&B écrivent la loi de C_j = compte/n_val et laissent le facteur implicite dans l'étiquette ; « le compte » (ADR) et K (outil) en sont la lecture correcte. |
| C-4 | loi nulle « BetaBinomial(N = n_e2, a = p, b = n + 1 − p) » | ADR :1562-1563 ; outil :14 ; test :137-138 (`l = n + 1 - p` ; `bbDistribution(N, p, l)`) | a ↔ n+1−l ; b ↔ l ; paramétrisation standard confirmée par p.50 (E(C̄) = a/(a+b)) | **CONCORDANCE EXACTE** : a = n+1−l = p ; b = l = n+1−p ; N ↔ n_val. Aucune inversion a/b. |
| C-5 | pmf(j) = C(j+a−1, j)·C(N−j+b−1, N−j)/C(N+a+b−1, N) ; ADR : P(K = j) = C(p−1+j, j)·C(n−p+N−j, N−j)/C(n+N, N) | outil :110 ; ADR :1566 | **absente d'A&B** : « can be found in standard references » (p.49 l.19-20) | **HORS TEXTE A&B** — ni concordance ni écart. L'outil attribue correctement à A&B la seule forme générative (:109) et la pmf à l'intégrale Beta (:110). Recalcul : forme de Pólya = C(N, j)·B(j+a, N−j+b)/B(a, b) exactement (4 cas N ≤ 60) ; masse totale = 1 (9 cas). Cohérent avec la clôture C-W-4 (a) « procurement JKK non requis » (ADR :1754), qui ne demande à A&B que la loi. |
| C-6 | test : « p.50 [lu]: E[C] = 1 - l/(n+1), Var(C) = l(n+1-l)(n+n_val+1) / (n_val R (n+1)^2 (n+2)); with R = 1 and K = n_val C » | test :133-135 ; ADR :1570-1571 ; ADR :1726 | p.50 l.15-20 : E(C̄) = 1 − l/(n+1) ; √Var(C̄) = √[l(n+1−l)(n+n_val+1)/(n_val R (n+1)²(n+2))] | **CONCORDANCE EXACTE**. Écarts de forme nommés, sans effet : (i) A&B publient l'écart-type (radical), le test transcrit la variance (carré) ; (ii) A&B écrivent C̄ (moyenne de R essais), le test écrit C et pose R = 1 (alors C̄ = C_1). Recalcul indépendant (§5.1) : E[K] = N·E(C̄) et Var[K] = N²·Var(C̄) à R = 1, **égalité exacte** sur 9 couples (n, N), dont les 5 du test. |
| C-7 | outil : « p.50 (moments; Thm D.1 closed set s <= qhat) » | outil :22 | p.50 l.40 : C(X) = {y : s(X, y) ≤ q̂} (Thm D.1) ; aussi éq. (2) p.5 et légende de la Fig. 12 p.16 (« covered if and only if s(X, Y) ≤ q̂ ») | **CONCORDANCE EXACTE** (ensemble fermé ; K compte s ≤ q̂). |
| C-8 | q̂ = p-ième plus petit score frais, p = ⌈(n+1)(1−α)⌉ | ADR §3 (épinglages C-3) | p.50 l.35-36 (q̂ = inf{…}) ; p.51 l.1-3 : q̂ = s_{⌈(n+1)(1−α)⌉} si α ≥ 1/(n+1), ∞ sinon | **CONCORDANCE EXACTE** (sous scores distincts, cadre de la preuve A&B). Garde de l'outil : n < 100 ⇒ UNDER_CALIB ; à α = 1/100, α ≥ 1/(n+1) ⇔ n ≥ 99, donc le cas q̂ = ∞ (l = 0) n'est jamais servi ; `bbDistribution` refuse b < 1. |
| C-9 | « A&B annexe A.1.1 [lu] : une p-value valide satisfait P_H(p ≤ t) ≤ t » | ADR :1582 ; outil :141 | p.43 l.29-32 : ∀t ∈ [0, 1], P_{H_λ}(p_λ ≤ t) ≤ t | **CONCORDANCE EXACTE** (condition). |
| C-10 | « la frontière « ≤ » découle de cette condition » ; outil : « reject (NON) iff p-value <= level » | ADR :1582-1583 ; outil :141-143 | p.43 l.36 : l'exemple de §A.1.1 rejette si « pλ < 5% » (**strict**) ; p.42 (Bonferroni) et p.44 (exemple jouet) : « < » ; p.44 (Bonferroni formel, FST) : « ≤ » | **ÉCART DE LETTRE NOMMÉ, sans erreur** : la règle « rejet ssi p ≤ δ » a une taille P_H(p ≤ δ) ≤ δ par la condition prise en t = δ, donc la déduction de l'ADR est exacte. Mais §A.1.1 ne **prescrit** pas « ≤ » (son exemple emploie « < ») et A&B ne sont pas uniformes dans l'annexe A. A&B sont à citer pour la **condition**, pas pour le choix de frontière, ce que fait déjà l'ADR (« découle de ») ; le commentaire de l'outil :141 (« super-uniformity, Angelopoulos & Bates A.1.1 ») est compatible. |
| C-11 | dérivation « sous échangeabilité des n + N scores à valeurs distinctes » | ADR :1563-1566 | A&B : cadre i.i.d. (p.4, p.6, p.50) ; BB obtenue par binomiale conditionnelle (p.49) ; échangeabilité seulement en remarque, pour la borne basse (p.50) | **PORTÉE, pas un écart** : l'hypothèse de l'ADR (échangeabilité jointe, valeurs distinctes) est plus faible que la lettre d'A&B (i.i.d.). La concordance [lu] porte sur la **loi et ses paramètres** ; l'extension à l'échangeabilité repose sur la dérivation propre de l'ADR (rangs uniformes sur C(n+N, N) configurations, jugée correcte par le G2 1a), **pas sur A&B**. |
| C-12 | ex æquo : test conservateur (atomes en 0) | ADR :1575-1580 | A&B : aucune loi Beta/BB avec ex æquo ; preuve sous scores distincts (p.50) ; borne haute sous continuité (p.51) ; note 1 p.5 : tie-breaking ignoré | **HORS TEXTE A&B** — l'ADR ne cite pas A&B sur ce point (il cite Vovk 2012) : cohérent. |

### 5.1 Recalcul indépendant (hors outil, arithmétique exacte)
Script temporaire `F:\tmp\i2\check.py` (sha256 `9a86362aa69938864e2d20313c8887cba2c5e085a302001b79b000cfaff6e616`,
Python `fractions` + entiers ; n'importe rien du dépôt) :
- identité n+1−⌊(n+1)α⌋ = ⌈(n+1)(1−α)⌉ pour α ∈ {1/100, 1/10, 1/20, 7/100, 1/3, 99/100} et n ∈ [0, 200 000] :
  **1 200 006 cas, 0 écart** ; forme entière de l'outil ((n+1)·99 + 99) div 100 = ⌈99(n+1)/100⌉ : 0 écart sur
  n ∈ [0, 200 000] ;
- BB(N, a = n+1−l, b = l), α = 1/100, pmf de Pólya : masse = 1 ; pour N ≤ 60, égalité exacte avec
  C(N, j)·B(j+a, N−j+b)/B(a, b) ;
- moments comparés à A&B p.50 (R = 1, K = N·C) :

| n | N | l | a = n+1−l = p | E[K] = N·E(C̄) | Var[K] = N²·Var(C̄) | E[K] | Var[K] |
|---|---|---|---|---|---|---|---|
| 363 | 363 | 3 | 361 | exact | exact | 360,008242 | 5,909815 |
| 148 | 148 | 1 | 148 | exact | exact | 147,006711 | 1,953512 |
| 565 | 565 | 5 | 561 | exact | exact | 560,008834 | 9,867974 |
| 150 | 565 | 1 | 150 | exact | exact | 561,258278 | 17,508754 |
| 1000 | 565 | 10 | 991 | exact | exact | 559,355644 | 8,733292 |
| 99 | 50 | 1 | 99 | exact | exact | 49,500000 | 0,735149 |
| 100 | 1 | 1 | 100 | exact | exact | 0,990099 | 0,009803 |
| 199 | 46 | 2 | 198 | exact | exact | 45,540000 | 0,557355 |
| 300 | 8 | 3 | 298 | exact | exact | 7,920266 | 0,080769 |

(Valeurs décimales affichées à 6 décimales, arrondies par `float` ; l'égalité est testée sur les rationnels.)

## 6. Verdict de concordance

**CONCORDANCE EXACTE** des trois affirmations paginées de l'ADR — p.14 (Beta(n+1−l, l), l = ⌊(n+1)α⌋), p.49
(BetaBinom(n_val, n+1−l, l)), p.50 (moments) — et de la condition de super-uniformité de §A.1.1 (p.43) ; la
paramétrisation de l'outil (a = p = n+1−l, b = n+1−p = l, N = n_val) est celle d'A&B, **sans inversion a/b et avec
la même convention ⌊ ⌋**. Écarts nommés, tous de forme ou de portée, sans effet sur le calcul :
(1) échelle 1/n_val laissée implicite dans l'étiquette de p.49 ;
(2) écart-type contre variance, et C̄ contre C avec R = 1, en p.50 ;
(3) frontière « ≤ » déduite de la condition, mais non prescrite par §A.1.1 (exemple en « < ») ; A&B ne sont pas
uniformes (p.42, p.43, p.44) ;
(4) identité n+1−l = p et pmf explicite : étapes propres à l'ADR, absentes d'A&B (identité vérifiée exactement) ;
(5) dérivation de l'ADR sous échangeabilité, plus large que le cadre i.i.d. d'A&B (portée assurée par l'ADR, pas par
A&B).

## 7. Census figures / tableaux (doc 03 §6)

| Élément | Page | Statut |
|---|---|---|
| Figure 1 (exemples ImageNet ; légende en tête de p.4) | p.4 | légende lue ; images **NON LUES** (hors objet) |
| Figure 2 (illustration + code Python) | p.4 | code et légende lus en couche texte ; illustration **NON LUE** (hors objet) |
| Schéma sans numéro « Heuristic uncertainty → conformal prediction → Rigorous uncertainty » | p.5 | libellés lus en couche texte ; non rendu (hors objet) |
| Schéma sans numéro (distribution du risque, repères α et δ) | p.41 | fragments de texte seulement ; **NON LU** (hors objet) |
| Formule « SSC metric » (§3.1) | p.14 l.1-10 | lue en couche texte ; hors objet |
| Figure 11 « Distribution of coverage (infinite validation set) » | p.15 | **rendue en image** : courbes n = 100, 1000, 10000 et « 1 − α » en pointillé à 0,90 ; axe x de 0,82 à 0,98 ; légende de l'auteur lue (α = 0,1 ; convergence vers 1 − α « with rate O(n^{−1/2}) ») ; lecture qualitative seulement, aucune valeur relevée sur les courbes |
| Tableau 1 | p.15 | **lu (rendu image)** : ε = 0,1 / 0,05 / 0,01 / 0,005 / 0,001 → n(ε) = 22 / 102 / 2491 / 9812 / 244390 ; « coverage slack ε with δ = 0.1 and α = 0.1 » |
| Figure 12 (code Python, scores en cache) | p.16 (haut) | code et légende lus en couche texte ; non rendue |
| Figure 25 « Distribution of coverage with nval validation points (n = 1000) » | p.49 | légende lue ; libellés (n_val = 100, 1000, 10000, 100000 ; axe 0,75 à 1,00) en couche texte ; **courbes NON LUES** |
| Figure 26 (deux panneaux : n = n_val = 1000 ; n = n_val = 10000 ; R = 100, 1000, 10000) | p.50 | légende lue (« The distribution of average empirical coverage over R trials with n calibration points and nval validation points ») ; axe 0,896 à 0,904 ; **courbes NON LUES** |
| Figure 20 (code PyTorch LTT) | p.43 | code et légende lus en couche texte |
| Figure sans numéro « PDFs of p-values » / « CDFs of p-values » | p.43 | libellés lus (« uniform p-value », « super-uniform p-value ») ; pas de légende ; **courbes NON LUES** |
| Schémas LTT des étapes 1 à 3 | p.42 | fragments de texte seulement ; **NON LUS** |
| Tableaux / figures en p.6, p.14, p.40, p.44, p.51 | — | aucun |

## 8. Contradictions et divergences (rapportées, non tranchées)

- **Intra-source (A&B v6)**, relation de rejet dans l'annexe A : Bonferroni « p_λ < δ/|Λ| » (p.42 l.46-49) contre
  « p_λ ≤ δ/|Λ| » (p.44 l.46-48) ; exemple de §A.1.1 en « < 5% » (p.43 l.36) ; exemple jouet en « < δ » (p.44
  l.35-36) ; FST en « ≤ δ » (p.44 l.63-65). Sous super-uniformité, les deux règles ont une taille ≤ δ (la stricte est
  plus conservatrice).
- **Intra-source**, coquilles : la preuve de D.1 est étiquetée « Proof of Theorem 1 » (p.50 l.48) ; « the
  observations to satisfy » (p.50 l.45) ; « it is valid under without assumptions » (p.43 l.53-54).
- **Dates** : la page de titre porte « December 8, 2022 » (p.1 l.4) ; l'estampille arXiv porte « 7 Dec 2022 » (p.1
  l.5) ; la page abs date la v6 du « Wed, 7 Dec 2022 05:08:01 UTC ». Un effet de fuseau est plausible mais non
  vérifié.
- **Dépôt contre source** : l'outil date la source « (2022) » (outil :21) et le nom de la fiche porte « 2021 » :
  pas de contradiction (v1 du 2021-07-15, v6 du 2022-12-07).
- **Hors objet** (non utilisé par l'ADR) : §3.3 (p.15 l.42-44) calcule les C_j par redécoupages aléatoires des mêmes
  n + n_val points, alors que p.49-50 traitent les C_j comme « independent » / « i.i.d. » ; A&B ne discutent pas
  cette dépendance. Sans objet pour H-3 (R = 1).

## 9. NON TROUVÉ (pages lues : 1 en-tête, 2-6, 14-15, 16 haut, 32-35 entrées [1] [2] [4] [5] [14] [18] [25] [83], 40-44, 49-51)

- L'identité n+1−⌊(n+1)α⌋ = ⌈(n+1)(1−α)⌉ n'est pas écrite par A&B.
- La pmf explicite de la BetaBinom n'est pas donnée (renvoi à « standard references », p.49).
- Les lois Beta/BB ne sont énoncées ni sous seule échangeabilité, ni en présence d'ex æquo.
- Aucune hypothèse explicite n'accompagne la loi Beta de p.14.
- Le cas l = 0 (α < 1/(n+1)) n'est pas discuté pour la loi Beta.
- Aucune définition écrite de la paramétrisation Beta(a, b) (déduite de p.50).
- Aucune « Journal reference » sur la page abs arXiv.
- Le reste du document est NON LU.

## 10. Questions ouvertes — demandes formées

- **Q-1** (orchestrateur, rédaction ADR, non bloquante) : le passage ADR :1582-1583 est exact. Option : ajouter
  « (l'exemple de §A.1.1 emploie « < » ; A&B p.44 écrivent « ≤ » pour Bonferroni) », pour éviter qu'un relecteur lise
  la citation comme prescriptive. Aucune source nouvelle requise.
- **Q-2** (orchestrateur, portée, non bloquante) : si l'ADR voulait citer A&B pour une validité sous
  **échangeabilité**, A&B ne la donnent qu'en remarque pour la borne basse (p.50 l.44-45, renvoi à [1] = Vovk,
  Gammerman, Shafer, Springer 2005). La loi BB sous échangeabilité repose sur la dérivation propre de l'ADR. Pas de
  procurement tant que l'ADR ne cite pas A&B pour ce point (ce qui est l'état actuel).
- **Q-3** (lecture formée, optionnelle) : A&B renvoient la **preuve** de la loi Beta à Vovk 2012 [14] (« A simple
  proof of this fact is available in [14]. », p.14). Ce PDF est déjà procuré : `docs/biblio/M012-h/pdf/vovk-2012.pdf`,
  sha256 `7687a3be5702c52074e1b48e7317f1e068e9581ff832c65f7efca659c665ed3a`, PMLR 25:475–490. Constat de cette
  passe : `grep -i beta` sur `docs/biblio/M012-h/_txt/vovk-2012.txt` donne **0 occurrence**. La forme voisine
  repérée est la Prop. 2b (p.479 imprimée), écrite en queue binomiale, avec « if and only if » quand le score est
  continu. Lecture partielle, symboles grecs perdus dans la couche texte : **pas de [lu] pour la loi Beta chez
  Vovk**. Si une citation primaire de la preuve est voulue : lire Vovk 2012 §3 (p.477-479) avec rendu image ciblé ;
  usage prévu : note de preuve de C-1. Non requis pour I-2 (l'ADR cite A&B p.14, [lu] ici).
- **Q-4** (lecture formée, optionnelle) : A&B renvoient le cas général avec ex æquo de la borne basse à [25] =
  Tibshirani, Foygel Barber, Candès, Ramdas 2019. Ce PDF est déjà procuré :
  `docs/biblio/ukemi-modeL/pdf/tibshirani-barber-candes-ramdas-2019.pdf`, sha16 `d80dba944a136e07`,
  arXiv:1904.06019. Il n'a pas été relu ici. Non requis pour I-2 (l'ADR traite les atomes par son propre couplage et
  par Vovk 2012).
- Aucun procurement externe requis : le seul document de la mission est procuré, et son sha est conforme.
- Consultation de l'advisor : aucune requise (pas de blocage, pas d'option à arbitrer). L'advisor intégré n'a pas été
  appelé.

## 11. Journal des URL et des accès

| Heure (UTC, `date -u`) | Action | Résultat |
|---|---|---|
| 2026-09-23 07:13:27 | GET `https://arxiv.org/abs/2107.07511v6` (curl -L) | HTTP 200, 45 903 octets |
| 2026-09-23 07:13 (même commande) | GET `https://arxiv.org/pdf/2107.07511v6` (curl -L) | HTTP 200, `application/pdf`, 5 360 733 octets, sha256 conforme |
| — | aucune autre URL ; aucun échec ; aucun contournement | — |
| local, lecture seule | `docs/biblio/M012-h/_txt/vovk-2012.txt` (grep, p.479 lue partiellement) ; ADR, outil, test (sed/grep) | cf. Q-3, §5 |

Outils : Poppler 25.07.0 (`pdftotext -layout -enc UTF-8`, `pdftotext -bbox-layout` pour localiser les zones,
`pdftoppm -r 200` pour les rendus), `pdfinfo`, `sha256sum`, Python 3.14 (`fractions`).

## 12. Niveau de lecture et empreintes

- **[lu]** : p.1 (en-tête), p.2-3 (table des matières), p.4-6, p.14-15, p.16 (haut), p.40-44, p.49-51 ; entrées
  bibliographiques [1], [2], [4], [5], [14], [18], [25], [83] (p.32-35). **[2nd]** : la preuve de la loi Beta (renvoi à
  [14]), la remarque d'échangeabilité (renvoi à [1]), le cas général avec ex æquo (renvoi à [25]) et Thm D.2 (renvoi à
  [83]). Reste du document : **NON LU**.
- PDF `pdf/angelopoulos-bates-gentle-intro-v6.pdf` : sha256 `c69aa191d8363c25b36685db4adb7e6980e55ee39892fd3626206c16e1e0efa1`.
- Texte `_txt/angelopoulos-bates-gentle-intro-v6.txt` : sha256 `e7e49bc91e621b1d36f2115d676fa49956dc12fca118fc7b249f2b830c4aaadd`.
- Ligne ajoutée à `SOURCES-sha256.txt` : `c69aa191d8363c25 pdf/angelopoulos-bates-gentle-intro-v6.pdf (arXiv:2107.07511v6, OA, 2026-09-23)`.
- sha256 de cette fiche : rapporté hors fiche (une empreinte ne peut pas figurer dans le fichier qu'elle mesure).
