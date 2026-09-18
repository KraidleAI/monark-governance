# Fiche — Shin, Ramdas & Rinaldo (2022/2023), « E-detectors: a nonparametric framework for sequential change detection »

## Identité [lu]
- **Auteurs** : Jaehyeok Shin (Google), Aaditya Ramdas (Carnegie Mellon University), Alessandro Rinaldo
  (Carnegie Mellon University) — confirmés en page 1 du PDF et sur la page abs arXiv.
- **Titre exact** : « E-detectors: a nonparametric framework for sequential change detection ».
- **Identifiant** : arXiv:2203.03532, catégorie principale stat.ME (cross-listé math.ST, stat, stat.ML,
  stat.TH).
- **Version utilisée : v4 (la dernière disponible)**, soumise **29 octobre 2023, 23:35:18 UTC**
  (historique complet vérifié sur la page abs : v1 7 mars 2022, v2 1 mai 2023, v3 21 sept. 2023,
  v4 29 oct. 2023 — pas de v5). Le PDF lui-même porte la date de composition « October 31, 2023 » en
  page de titre — cohérent avec le dépôt v4 (à 2 jours près, dépôt vs. recompilation LaTeX).
- **Source** : `https://arxiv.org/pdf/2203.03532v4`.
- **Fichier local** : `pdf/shin-ramdas-rinaldo-2022-v4.pdf` — 703 570 octets — sha256
  `564dc11f356c16691d10b7ef006402ad17237159f8068b1d205d6497492baa1c` — 50 pages (voir README).
- **Classe** : **P1** (dépôt de l'auteur, dernière révision arXiv).

## Méthode d'extraction [lu]
`pdftotext -layout` réussit pleinement (178 232 caractères, 50 pages, prose intégralement lisible).
**Défaut mesuré et documenté** : les caractères grecs (α, β, θ, δ, μ, …) sont **systématiquement absents**
de la couche texte extraite (0 occurrence de « α » dans tout le fichier, vérifié par grep) — artefact
d'encodage de police de ce PDF particulier (Type 3 / mapping Unicode incomplet), pas une erreur de
commande. **Conséquence pour cette fiche** : la prose est lue intégralement au niveau [lu] ; toute formule
comportant un symbole grec ci-dessous est **reconstruite** à partir du contexte environnant (texte adjacent
non ambigu, cohérence avec les définitions données en toutes lettres ailleurs dans l'article) et signalée
comme telle — ce n'est pas une copie verbatim de la couche texte défaillante à cet endroit précis.

## Census figures/tableaux [lu]
Figures 1–4 : illustrations empiriques (Cleveland Cavaliers, données de basket-ball 2010–2018 — Plus-Minus
et taux de victoire), légendes et texte d'accompagnement lus intégralement en clair via `pdftotext`
(ex. légende Fig. 2 p. 25 : « Paths of log e-detectors (SR: red; CUSUM: green)… ensuring that the ARL is
at least 1/α = 10³… »). Ces figures sont purement illustratives de la partie empirique (Section 5),
**sans contenu théorique additionnel** non déjà énoncé en prose/équations ; elles n'ont pas été rendues en
image séparément — décision de portée assumée, pas un « NON LU » silencieux : rien dans ces figures n'était
nécessaire pour statuer sur les théorèmes mobilisés par la présente procurement.

## Ce que le papier établit

### Définition de l'ARL (p. 2) [lu]
`ARL := E_∞[N]` (eq. 1) — même définition classique que chez Page/Lorden. Contrôlé au niveau α si
`E_∞[N] ≥ 1/α`.

### Constat sur le CUSUM classique — dépendance aux paramètres connus (p. 2) [lu]
Paraphrase de contenu (formule reconstruite, pas une citation verbatim intégrale — l'original dépasse
25 mots) : quand les paramètres pré- et post-changement sont **connus**, la procédure CUSUM «has been known
to achieve the optimal worst average delay» (citation ≤ 25 mots) parmi toutes les procédures contrôlant
l'ARL au même niveau [18, 21, 31, 14] (réf.
[23] = Page 1954, réf. **[18] = Lorden 1971**, réf. [21] = Moustakides 1986 *Ann. Statist.* 14(4):1379–1387).
Confirmé en liste de références p. 35 : « [18] Gary Lorden. Procedures for reacting to a change in
distribution. The Annals of Mathematical Statistics, pages 1897-1908, 1971. » — **identité de la cible
de procurement (a) confirmée par un tiers**, indépendamment de Project Euclid.

### Limites de la littérature antérieure — dont Lorden (p. 3) [lu]
Deux limites nommées : (1) hypothèses **paramétriques** sur pré- et post-changement ; (2) garanties
typiquement **asymptotiques** (α→0). Citation resserrée (≤ 25 mots) : « Our procedures come with clean,
nonasymptotic bounds on the average run length ». Contribution nommée (p. 3, item 2, paraphrase de
contenu — l'original dépasse 25 mots) : même avec des classes pré-/post-changement composites et
**sans hypothèse iid**, leurs procédures e-CUSUM/e-SR «can always nonasymptotically control the ARL
at level α» (citation ≤ 25 mots).

### e-process, e-detector (Déf. 2.5–2.6, p. 7–8) [lu, formules reconstruites]
Un **e-process** pour une classe P est une suite (E_t)_{t≥1} non-négative telle que, pour tout P∈P et
tout temps d'arrêt τ : `E_P[E_τ] ≤ 1` (p. 7) — généralisation des (sur)martingales non-négatives et des
rapports de vraisemblance ; le rejet dès que `E_t > 1/α` est valide par l'inégalité de Ville. Un
**e_j-process** (Déf. 2.5, p. 8) est un e-process « retardé », débutant au temps j. Les **e-détecteurs**
SR et CUSUM (Déf. 2.6, p. 8, notation reconstruite à partir des symboles environnants) :
```
M₀^SR = M₀^CU := 0 ;  pour n ≥ 1 :  M_n^SR = Σ_{j=1}^{n} ε_n^(j) ,   M_n^CU = max_{j∈[n]} ε_n^(j)
```
où {ε^(j)}_{j≥1} est une suite d'e_j-processes.

### Théorème 2.4 (p. 7) — contrôle ARL non-asymptotique, sans hypothèse iid [lu]
Pour tout α∈(0,1) et tout e-détecteur M, en déclarant un changement au temps d'arrêt
`N_α := inf{n≥1 : M_n ≥ 1/α}`, alors `inf_{P∈P} E_{P,∞}[N_α] ≥ 1/α` — **exact, non-asymptotique**, sans
hypothèse d'indépendance ni d'identique distribution sur les données, **pourvu que M soit un e-détecteur
valide** (i.e. construit à partir d'e-processes valides). C'est le résultat qui généralise et dépasse le
Théorème 2 de Lorden — mais la validité repose entièrement sur la construction correcte des e-processes
sous-jacents, pas automatique pour n'importe quelle statistique de type log-vraisemblance à paramètres fixes.

### Section 6.2 — la méthode de Lorden relue comme un e-détecteur (p. 32–33) [lu]
Explicite et central pour cette procurement. Citation resserrée (≤ 25 mots, p. 33) : « Lorden proved that
this method controls the ARL at 1/α if the data are iid » — **confirmation indépendante, par une source
distincte, que la garantie ARL classique de Lorden est conditionnelle à l'hypothèse iid**, exactement ce
que la fiche Lorden établit à partir de la preuve du Thm 2. Formule reconstruite de la procédure de
Lorden telle que relue ici :
```
N_Lorden := inf{ n ≥ 1 : max_{1≤j≤n} φ^(j)(X_{n-j+1}, ..., X_n) = 1 }
```
(famille de tests séquentiels de niveau α démarrés à chaque instant j). Les auteurs montrent que
`N_Lorden` est un cas particulier de leur cadre e-détecteur, puis énoncent le
**Lemme 6.1 (« Generalized Lorden's Lemma »)**, p. 33 : soit une classe pré-changement P et une classe
post-changement Q (composite, dépendantes possibles — citation ≤ 25 mots : « note the lack of any iid
assumption ») ; pour chaque j, φ^(j) un test séquentiel unilatéral de niveau α de P contre Q démarré en j
(sans lien requis entre les φ^(j)) ; la procédure qui déclare un changement au premier rejet a un ARL au
plus `1/α`, et **cette généralisation est elle-même un cas particulier d'e-détecteur**. C'est la
généralisation qui **abandonne explicitement** la condition iid de Lorden — mais au prix d'exiger une
construction e-process/martingale valide pour chaque φ^(j), pas une simple statistique de rapport de
vraisemblance à p₀/p₁ fixes.

### Section 5.1 — exemple Bernoulli à moyenne dépendante et variable dans le temps (p. 24–26) [lu]
Exemple structurellement le plus proche de notre instrument. X₁,X₂,…∈{0,1} (indicateurs de victoire des
Cavaliers). Classe pré-changement `P := {(p₁,p₂,...) : p_i ≤ p₀ ∀i}` avec `p_n := E_{P,∞}[X_n | F_{n-1}]`
(moyenne conditionnelle, **pas nécessairement constante ni indépendante dans le temps** — citation ≤ 25
mots, p. 24 : « this formalization allows for the winning probabilities to fluctuate over time before and
after the changepoint »), p₀=0,49 (leur valeur, propre à leur exemple, sans rapport avec les 0,125/0,25 de
notre instrument) ; classe post-changement symétrique avec q₀=0,51. Incrément de base (éq. 65, p. 24,
reconstruit) : `L_n^(λ) = exp{ λ(X_n − p₀) − B(λ) }`, `B(λ) = log(1 − p₀ + p₀e^λ) − λp₀` (fonction génératrice
des cumulants de Bernoulli, **centrée** — l. 1558 ; rectificatif C-1 2026-09-18 : le « − λp₀ » manquait ici). Ce n'est **pas** un simple rapport de vraisemblance log(p₁/p₀) à p₁ fixe — le
paramètre λ est optimisé/mélangé sur une plage `(q_L,q_U)` de post-changement possibles pour obtenir le
contrôle ARL non-asymptotique **sans supposer p₀/p₁ vrais et fixes**.

## Ce que le papier NE dit PAS [absence vérifiée]
- **Aucune occurrence de « permutation »** dans les 50 pages (vérifié par grep exhaustif) — la validité de
  ce cadre repose exclusivement sur la théorie des martingales/e-processes (inégalité de Ville), jamais sur
  un ré-échantillonnage ou un contrôle par permutation.
- Ne valide, n'évalue ni ne mentionne un **CUSUM classique à p₀/p₁ fixes appliqué à des données non-iid** —
  leur réponse au problème de non-iid est de **remplacer** la statistique classique par un e-détecteur, pas
  de fournir une garantie pour la statistique classique telle quelle.
- Aucun traitement d'une statistique **rétrospective** (maximum sur une fenêtre déjà close) — le cadre est
  exclusivement séquentiel/en ligne avec règle d'arrêt.

## En quoi ce papier fonde ou contredit notre instrument
**Fonde/clarifie** : (i) confirme, indépendamment de la lecture de Lorden, que « ARL contrôlé à 1/α » pour
une procédure à la Lorden/Page **suppose l'iid** (p. 33) — deuxième source, même conclusion que la fiche
Lorden ; (ii) montre qu'une voie nonparamétrique/non-iid vers un contrôle ARL **existe dans la littérature**
(Thm 2.4 + Lemme 6.1) — utile pour situer honnêtement ce que notre instrument **pourrait** viser s'il était
un jour reconstruit comme e-détecteur.
**Ne fonde PAS notre instrument tel qu'il est codé** : `instrument.ts` implémente un CUSUM classique à
`p0=0,125`/`p1=0,25` **fixes** (rapport de log-vraisemblance constant), pas un e-processus/e-détecteur au
sens de la Déf. 2.5–2.6 (qui exigerait une construction du type éq. 65, valide sous P pour toute loi de la
classe pré-changement, avec mélange sur les post-changements possibles). Le Théorème 2.4 **ne s'applique
donc pas mécaniquement** à notre statistique : rien ici ne garantit que le CUSUM de Page à p₀/p₁ fixes
utilisé par `instrument.ts`, appliqué à une série non-iid, contrôle un ARL à un niveau donné. Le contrôle
par permutation de `instrument.ts` est une **troisième voie**, orthogonale à la fois à Lorden (iid requis)
et à ce papier (e-processes/martingales requis) — aucun des deux papiers ne peut être cité à l'appui d'une
propriété (ARL, délai, taille) du contrôle par permutation lui-même.

## Niveau de lecture global
**[lu]** pour l'intégralité de la prose (50/50 pages, `pdftotext` complet, sections 1 à 6.3, références,
lues et vérifiées par grep ciblé + lecture directe des passages porteurs). **Formules avec symboles grecs :
reconstruites**, signalées comme telles partout où utilisées — pas une lecture [lu] au sens strict pour le
symbole exact, mais un [lu] de contenu avec reconstruction typographique documentée.

## Rectificatif 2026-09-18 (advisor-defi, vérification Bash sur la fixture, orchestrateur)
Les passages « ce n'est pas un simple rapport de vraisemblance » (§5.1) et « le Théorème 2.4 ne s'applique pas mécaniquement »
(§« En quoi ce papier fonde… ») sont **inexacts sur la forme** : à λ fixe = λ*(p₁) = log(p₁(1−p₀)/(p₀(1−p₁))), l'éq. (65) vaut
exactement (p₁/p₀)^X·((1−p₁)/(1−p₀))^{1−X}, le rapport de vraisemblance Bernoulli (p. 25, « re-parametrized likelihood ratio »),
et la récursion (14) donne log M^CU_n = CUSUM de Page ; identité numérique mesurée 9,5446 sur les 616 paires calmes. Le Thm 2.4
s'applique donc à la statistique codée, pour la classe {E[X_n | F_{n−1}] ≤ 0,125}. La conclusion « aucun ARL revendicable pour
l'instrument tel que publié » **reste vraie**, pour la bonne raison : (a) l'arrêt est un quantile de permutation, pas 1/α ; (b) la classe
≤ 0,125 est violée par la calibration (le e-SR à 0,125, grille ADR-M014 D1, franchit 1/1000 in-sample le 2024-10-11 ; 2024-10-10 avec q_L ∈ {0,20 ; 0,25}). Voir ADR-M014.

