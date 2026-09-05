# Lecture formée (l) — Eisenberg & Noe (2001), Lemme 5 sur page rendue

- **Mission** : ADR-M002 §4 pendant (l) ; doc 03 §6, exception page rendue (formule illisible dans `_txt`).
- **Lecteur** : `claude-sonnet-5` (modèle résolu déclaré), effort max, 2026-09-05 ; advisor intégré **non** consulté (règle 4bis `lecteur.md`, instituée après la perte de la première lecture sous filtre de régurgitation). Rapport rendu en texte final (Write indisponible dans la session du lecteur) et consigné ici par l'orchestrateur, verbatim des passages porteurs conservé, citations courtes.
- **Document** : « Systemic Risk in Financial Systems », L. Eisenberg, T. H. Noe, *Management Science* 47(2), Feb. 2001, pp. 236-249, DOI `10.1287/mnsc.47.2.236.9835`. Fichier : `C:\Users\KACIMI\Downloads\pour le projet clawpump\idée inférence\papiers demandés\supplément\SUPP é\liquidations\eisenberg2001.pdf` — 14 pages PDF (p.1 = couverture RightsLink ; **page PDF = page imprimée − 234**, vérifié sur 238/240/244/245/248). **Page imprimée 249 absente du fichier** (gap de fichier, voir procurement).
- **Niveau** : [lu] sur pp. 238, 240, 244, 245.

## Q1 — p.238 : norme et définition de « nonexpansive »
- Norme : « Let ‖·‖ denote the ℓ¹-norm on ℜⁿ » ; ‖x‖ := Σ|xᵢ|.
- Norme d'opérateur : « |||M||| ≡ Sup_{‖x‖≤1} ‖Mx‖ ».
- Définition : « A map T : ℜⁿ → ℜⁿ is (ℓ¹)-nonexpansive if, ∀x ∈ ℜⁿ, ‖T(x) − T(y)‖ ≤ ‖x − y‖ » (p.238). Quantificateur imprimé sur x seul (y non quantifié) — rapporté tel quel.
- ⇒ **La norme est ℓ¹, explicitement.**

## Q2 — pp.244-245 : énoncé du Lemme 5, définitions de F et f
- Énoncé : « The clearing payment vector is a concave, increasing function of operating cash flow vector and the level of nominal liabilities. In other words, the function e → FIX(Φ(·; Π, p̄, e)), and the function p̄ → FIX(Φ(·; Π, p̄, e)) are **concave, increasing, and nonexpansive** » (pp.244-245).
- Preuve, définitions : « F: [0, p̄] × ℜⁿ₊₊ → [0, p̄] by F(p, e) ≡ Φ(p, e; Π, p̄) » ; « f: ℜⁿ₊₊ → [0, p̄], defined by f(e) = FIX(F(·, e)) » (p.245).
- ⇒ **Objet : e ↦ p*(e) (et p̄ ↦ p*). Domaine : e ∈ ℝⁿ₊₊. Non-expansivité revendiquée, en ℓ¹ (Q1).**

## Q3 — p.245 : étape d'induction
- « f_n(e) = F(f_{n−1}(e), e), f_0(e) ≡ 0 ».
- Propriété invoquée : « Using the fact that F is nondecreasing, jointly concave in p and e, and nonexpansive, induction shows that, for all n, f_n is concave and nonexpansive ».
- Conclusion : « f is the pointwise limit of nonexpansive concave functions, and thus concave and nonexpansive ».
- **Aucune norme reprécisée**, **aucune hypothèse supplémentaire** à cet endroit (seul rappel : « For each fixed e ∈ ℜⁿ₊₊ »). Appuis externes [2nd] : Milgrom & Roberts (1994) pour la croissance ; « standard results on the convergence of iterates of monotone increasing operators ».

## Bonus — p.240 : ‖Πᵀ‖ = 1
- Non trouvé dans le périmètre : la preuve du Thm 1 commence p.240 (« Φ is positive, increasing, concave, and nonexpansive ») et continue p.241 (non lue). L'extrait `_txt` l.365-368 (« column sums of Πᵀ all equal 1 … |||Πᵀ||| = 1 ») reste [lu-txt].

## NON LU / procurement
- pp. 236-237, 239, 241-243, 246-247 : hors périmètre. p.248 : vue pour l'offset seulement.
- **P-EN-249 (procurement formé)** : page imprimée 249 absente du fichier (fin App. 1 / références). Identité : DOI ci-dessus, pp. 236-249, page manquante 249. Tentative : fichier local (14 p., incomplet), 2026-09-05. Usage : compléter App. 1 (preuve Thm 2) et références. Non bloquant pour (l).

## Adjudication orchestrateur (pour le G7, test 21)
Sur page rendue [lu] : le Lemme 5 énonce bien `e ↦ p*` **ℓ¹-nonexpansive** sur `ℝⁿ₊₊`, et sa preuve passe par l'induction `f_n = F(f_{n−1}(e), e)` avec « F … nonexpansive » jointement. Sous la norme de somme, la 1-Lipschitzianité jointe de F donne `‖f_n(e)−f_n(e′)‖₁ ≤ ‖f_{n−1}(e)−f_{n−1}(e′)‖₁ + ‖e−e′‖₁`, soit constante `n`, pas 1. Notre contre-exemple (chaîne régulière, `e = [10, .5, .5] → [11, .5, .5]`, `e ≫ 0`, unique) donne `‖Δp*‖₁ = 2‖Δe‖₁` **dans le domaine énoncé**. Les deux autres sous-énoncés (croissante, concave) sont **confirmés** par nos tests. `error_origin` (test 21) = **source** : sous-énoncé « nonexpansive » du Lemme 5 non soutenu par son étape d'induction et contredit par calcul dans son domaine ; archive K4:90 = paraphrase fidèle ; implémentation correcte (Thm 1 confirmé en p). Formulation retenue partout : « l'étape d'induction ne livre pas la constante 1 sous ℓ¹ ; contredit par calcul sur système régulier, e ≫ 0 » — on n'écrit pas « Lemme 5 faux » au-delà de ce sous-énoncé.
