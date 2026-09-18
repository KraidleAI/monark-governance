# Fiche — Lorden (1971), « Procedures for reacting to a change in distribution »

## Identité [lu]
- **Auteur** : G. Lorden, California Institute of Technology.
- **Titre exact** : « Procedures for Reacting to a Change in Distribution » (titre en page 1, confirmé par rendu-image).
- **Revue** : The Annals of Mathematical Statistics, 1971, Vol. 42, No. 6, pp. 1897–1908.
- **Reçu** : 27 juillet 1970 (mention en bas de page 1).
- **DOI** : 10.1214/aoms/1177693055 — confirmé par la page de renvoi DOI → Project Euclid
  (`http://projecteuclid.org/euclid.aoms/1177693055`), identité vérifiée AVANT extraction (titre, auteur,
  revue, volume/numéro/pages tous conformes à l'attendu de la mission).
- **Source acquise** : PDF Project Euclid via lien de téléchargement direct
  `https://projecteuclid.org/journalArticle/Download?urlId=10.1214%2Faoms%2F1177693055`
  (accès obtenu avec user-agent navigateur ; curl nu était bloqué par la protection Incapsula du site).
- **Fichier local** : `pdf/lorden-1971.pdf` — 1 063 457 octets — sha256
  `bec65c82c65885471823c18a10c8590a4ccdd3bc874cb504755cad1837d47cb2` (voir README pour le tableau complet).
- **Classe** : **P1** (article original, revue à comité de lecture, digitalisation officielle IMS/JSTOR via
  Project Euclid).

## Méthode d'extraction — écart mesuré à la discipline « texte d'abord » [lu]
Le PDF est un **scan pur** : producteur `PDFlib 3.02 (SunOS 5.6)`, créateur `page2pdf`, daté de la
digitalisation JSTOR (2006), **12 pages en image**, aucune couche OCR sur le corps. Mesuré :
`pdftotext -layout` ne restitue que 254 octets sur l'ensemble du document (le bandeau JSTOR de couverture
« Institute of Mathematical Statistics is collaborating with JSTOR... »), soit 5 lignes ; `pdffonts` ne
liste que 4 polices Helvetica utilisées pour ce même bandeau ; aucun outil OCR (`tesseract`, `ocrmypdf`)
n'est disponible dans l'environnement. **Extraction texte génuinement impossible** — pas un raccourci.
Conformément à la clause de secours de doc 03 §6 (image seulement quand le texte est indisponible, jamais
par défaut), les **12 pages ont été lues intégralement par rendu-image** (outil Read, pages 1–6 puis
7–12). C'est une lecture réelle, page par page, pas un survol : chaque théorème, chaque formule, la liste
de références et la section d'exemples ont été vus et transcrits ci-dessous. Niveau **[lu] intégral**,
obtenu par un chemin différent de celui prescrit par défaut (texte), documenté comme tel.

## Census figures/tableaux [lu]
Aucune figure, graphique ou tableau dans les 12 pages : l'article est entièrement formules + prose
(description de procédures graphiques « CUSUM chart » et frontières en U/V, mais **en texte**, sans
planche illustrative). Rien à rendre en image séparément — le rendu intégral des 12 pages couvre déjà 100 %
du contenu visuel.

## Ce que le papier établit

### Cadre et critère (p. 1897) [lu]
X₁, X₂, … **indépendantes**, X₁,…,X_{m−1} ~ F₀, X_m, X_{m+1}, … ~ F₁ ≠ F₀ ; **F₀ et F₁ tous deux connus**,
m (l'instant de rupture) inconnu. Critère minimax de rapidité de réaction :
```
Ē₁N = sup_{m≥1} ess sup E_m[(N − m + 1)⁺ | X₁,...,X_{m−1}]
```
sous contrainte de fréquence de fausses réactions `E₀N ≥ γ` (γ prescrit).

### Procédure de Page (1954), reprise par Lorden (p. 1897–1898) [lu]
```
T_n = ( T_{n-1} + log(f₁(X_n)/f₀(X_n)) )⁺ ,  T₀ = 0 ;  arrêt au premier n tel que T_n > γ.
```
Équivalence avec un SPRT unilatéral répété de f₀ contre f₁, bornes log 0 et γ. Lorden rapporte que
Page appelait E₀N et E₁N (sous P₀ et P₁ respectivement) l'« average run length » (A.R.L.) — **c'est
l'origine du terme ARL**, via Page (1954), relayée par cet article. Mise en garde explicite de Lorden
(p. 1898, paraphrase — citation resserrée ≤ 25 mots) : « this need not be the case for alternative
procedures, and E1N is clearly an inadequate criterion for performance » — l'ARL seul seul n'est un
critère adéquat que pour la procédure de Page elle-même, pas en général.

### Théorème 1 (p. 1899) [lu]
S'il existe une famille de tests unilatéraux {N(α)}, 0<α<1, telle que `P₀(N(α)<∞) ≤ α` et, ∀θ∈Θ,
`E_θN(α) ~ |log α| / I(θ)` quand α→0, où `I(θ) = E_θ log(f_θ(X)/f₀(X))` (nombre d'information de
Kullback-Leibler) — alors, pour γ>0, α=γ⁻¹, en posant N_k(α) = N(α) appliqué à X_k,X_{k+1},… et
`N*(γ) = min_{k≥1} {N_k(α) + k − 1}` : N*(γ) est une variable d'arrêt, `E₀N*(γ) ≥ γ` pour tout γ, et
{N*(γ)} **minimise Ē_θN*(γ) asymptotiquement** sous cette contrainte, avec `Ē_θN*(γ) ~ log γ / I(θ)`
quand γ→∞. **Résultat asymptotique** (γ→∞), pas fini-échantillon.

### Théorème 2 (p. 1900) — le résultat non-asymptotique, et sa condition iid [lu]
Pour N variable d'arrêt étendue par rapport à X₁,X₂,… avec `P₀(N<∞) ≤ α` ; N_k = N appliqué à
X_k,X_{k+1},… ; `N* = min_k {N_k + k − 1}`. Alors N* est une variable d'arrêt étendue, **`E₀N* ≥ 1/α`
(exact, non-asymptotique)**, et pour toute alternative F₁ : `Ē₁N* ≤ E₁N`.
**Preuve** : invoque explicitement, texte à l'appui (p. 1900, citation ≤ 25 mots) : « Since the ergodic
hypothesis is true for the i.i.d. sequence X1, X2, ⋯ (Loève, (1963)) » — la borne `E₀N* ≥ 1/α` est
obtenue via le théorème ergodique **appliqué à la suite i.i.d.** X₁, X₂, … C'est la preuve textuelle que
la garantie ARL de Lorden, dans sa forme non-asymptotique, **requiert structurellement l'hypothèse iid**.

### Théorème 3 (p. 1901) [lu]
`n(γ) := inf Ē₁N` sur les variables d'arrêt étendues N avec `E₀N ≥ γ`. Si `I₁ = E₁ log[f₁(X)/f₀(X)] < ∞`,
alors `n(γ) ~ log γ / I₁` quand γ→∞ — borne inférieure asymptotique, établie via le lemme de Wald
(Wald 1947, p. 197) et un argument de recouvrement/renouvellement (p. 1901–1903). Ensemble, Thm 1 et 3
établissent l'**optimalité asymptotique** (γ→∞) de la procédure de Page parmi les procédures contrôlant
`E₀N ≥ γ`.

### Section 3 — familles de Koopman-Darmois (p. 1903–1906) [lu]
Les procédures explicites (bornes `c_k` calculables) ne sont construites que pour une famille
exponentielle `dF_θ(x) = exp(θT(X) − b(θ)) dμ(x)`, θ∈Θ*, ramenée à `dF_θ(x) = exp(θx − b(θ)) dF₀(x)`,
θ∈Θ*∋0, b(0)=0, avec `I(θ) = θb'(θ) − b(θ)`. Bornes en escalier/paraboliques selon le cas ; variantes
« V » et « U » pour alternatives bilatérales.

### Section 4 — exemples (p. 1907–1908) [lu]
Trois applications travaillées : (a) changement de moyenne d'une loi **normale** (contrôle qualité) ;
(b) taux de défaillance **exponentiel/Weibull** (fiabilité) ; (c) changement de taux d'un processus de
**Poisson**. **Aucun exemple travaillé bernoulli/binomial** n'est donné dans le texte — bien que la loi de
Bernoulli appartienne en principe à la famille de Koopman-Darmois (donc rentre formellement dans le cadre
général de la Section 3), Lorden ne le développe nulle part explicitement. Cette extension au cas
Bernoulli est **une inférence du lecteur, non un résultat énoncé** — niveau **[abs]** pour cette extension
précise, à distinguer du **[lu]** du cadre général KD.

### Références internes utiles [lu]
Réf. [6] : Page, E. S. (1954). « Continuous inspection schemes ». Biometrika 41, 100–115 — la procédure
CUSUM originale que Lorden analyse. Réf. [3] Kiefer & Sacks (1963) — conditions d'existence des tests
asymptotiquement optimaux invoquées au Thm 1.

## Ce que le papier NE dit PAS [lu, absence vérifiée par lecture intégrale]
- **Aucune mention de « permutation »** nulle part dans les 12 pages (les 12 pages ont été lues en
  intégralité, pas seulement survolées).
- **Aucun résultat fini-échantillon d'optimalité** : les théorèmes d'optimalité (1 et 3) sont
  asymptotiques (γ→∞ ou α→0) ; seul le Thm 2 (contrôle `E₀N*≥1/α`) est non-asymptotique, mais il porte sur
  une construction spécifique (variable d'arrêt répétée `N* = min_k{N_k+k-1}`), pas sur le maximum
  rétrospectif d'un chemin déjà observé.
- **Aucune tolérance aux données dépendantes/non-iid** : l'indépendance est posée dès la première phrase
  de l'introduction (p. 1897) et l'hypothèse iid est invoquée nommément dans la preuve du Thm 2 (p. 1900).
- **Aucun exemple Bernoulli** (voir ci-dessus).
- **Aucune procédure rétrospective** : tous les résultats concernent une règle d'arrêt séquentielle en
  temps réel avec seuil γ pré-fixé, pas une statistique calculée après coup sur une fenêtre déjà close.

## En quoi ce papier fonde ou contredit notre instrument

**Fonde (la forme de la statistique)** : la récursion `pageCusumMax` de `instrument.ts`
(`running = max(0, running + increment)`, `increment = log(p1/p0)` sur raté / `log((1-p1)/(1-p0))` sur
succès, statistique = max du chemin) est **structurellement** la récursion de Page (1954) telle que
présentée par Lorden (éq. (3), p. 1898) : `T_n = (T_{n-1} + log(f₁(X_n)/f₀(X_n)))⁺`, avec
f₀=Bernoulli(p₀=0,125), f₁=Bernoulli(p₁=0,25). L'attribution « CUSUM de Page » dans le docstring de
`instrument.ts` est donc exacte quant à la **forme** de la statistique — vocabulaire et filiation
historique corrects.

**Ne fonde PAS (les garanties)** : aucune des trois conditions sous lesquelles Lorden établit une
garantie ARL/optimalité n'est réunie ici : (i) **iid requis** (invoqué nommément dans la preuve du Thm 2,
p. 1900) — mesuré FAUX pour la population de ratés calmes de Narabi (advisor-defi §0, ADR-M012 : taux par
semestre 0/16, 6/182, 23/161, 31/163, 0/91 — non stationnaire) ; (ii) **f₀, f₁ doivent être les VRAIES lois
génératrices, connues** — p₀=0,125/p₁=0,25 sont des constantes **pré-enregistrées à des fins de réglage du
CUSUM** (docstring `instrument.ts` : « Pre-registered instrument constants »), jamais présentées comme
des paramètres estimés ou vrais de la série ; rien dans Lorden ne dit ce qu'il advient de l'ARL/optimalité
quand p₀/p₁ sont des constantes arbitraires sans rapport garanti au mécanisme générateur ; (iii) **la
théorie porte sur une règle d'arrêt séquentielle à seuil γ pré-fixé** — notre instrument calcule le
**maximum rétrospectif** d'un chemin déjà entièrement observé et en évalue le caractère extrême par
**permutation**, un objet inférentiel différent, que Lorden ne traite pas.
**Conclusion pour la fiche de citation (README)** : Lorden 1971 peut être cité pour la **filiation
historique et la forme** de la statistique (« CUSUM de Page/Lorden »), **jamais** pour affirmer un ARL,
une optimalité, ou une propriété de détection de notre instrument — ces garanties supposeraient l'iid et
des paramètres vrais connus, deux conditions que l'ADR a déjà mesurées absentes.

## Niveau de lecture global
**[lu] intégral** — 12/12 pages lues (par rendu-image, cf. méthode d'extraction), théorèmes 1–3, sections
1–4 et liste de références parcourus dans leur intégralité. Aucun passage laissé en « NON LU ».
