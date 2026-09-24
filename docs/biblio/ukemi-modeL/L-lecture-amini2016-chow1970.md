# Lecture — Amini, Filipović, Minca (2016) ORL 44:1-5 [lu] ; Chow (1970) IEEE TIT 16(1):41-46 [lu]
Lecteur Sonnet 5, 2026-09-19. PDF procurés par l'investisseur (sha `98685c64…`, `54677401…`).

## (A) Amini–Filipović–Minca — unicité avec coûts de liquidation
- Modèle : EN classique (L_ij, π_ij) + un actif illiquide unique liquidé via une fonction de demande inverse f exogène. Hypothèses standing : f(0)=P ; f continue non-croissante ; **x·f(x) croissante** (iii, condition centrale de coût).
- Lemme 1 (p.2) : Φ monotone, continue, bornée sur [Pmin,P]×[0,L̄].
- **Théorème 2 (p.2)** : point fixe **unique** si (i) y_i+π_i>0 ∀i, ou (ii) y_tot+Σπ_i>0 et réseau fortement connexe. Preuve : réduction à un point fixe scalaire en p (Lemme 3).
- Théorème 4 (p.4) : classes de séniorité. Lemme 5 : algorithme (fictitious default généralisé, Section 6) converge en ≤ m itérations.
- Hors hypothèses : multiplicité vient du manque de (iii) (exemple CFS exponentiel β > 1/y_tot). **« RV [9] do not feature unique fixed points » (p.4)** — source primaire pour la non-unicité déclarée dans `clearing.ts`.
- Lien RV α/β : ABSENT (le β du papier est celui de CFS, pas de RV).
- Citable : Th. 2/Lemme 3 (structure de preuve), constat RV, algorithme.
- **Extrapolations** (non couvertes) : appliquer Th. 2 au cadre RV(α,β) ; dériver f depuis (LT, bonus) Aave et vérifier (iii) ; **toute correspondance petit/grand point fixe ↔ cascade séquentielle / borne de run — absente du papier, sens du treillis (prix vs pertes) à vérifier nous-mêmes sur `clearing.ts`**.
- Limites : f exogène non microfondée ; pas de multi-actifs/multi-période (not_found).

## (B) Chow — erreur/rejet optimal
- Règle (eq. 2'/4', p.42) : accepter et classer k si m(v) ≥ 1−t, rejeter si m(v) < 1−t, m(v) = max posterior ; preuve dans Chow 1957 [2nd].
- Borne (p.43) : E(t) ≤ t·A(t) ≤ t. **Théorème du tradeoff (eq. 13, p.43-44)** : E(t) = −∫₀ᵗ τ dR(τ) (Stieltjes, sans forme explicite des densités) ; dE/dR = −t ≤ 0, convexe (eq. 20-21).
- Seuil coût-minimal (eq. 22-23, p.44-45) : t = (W_r − W_c)/(W_e − W_c) ; risque minimal = ∫₀ᵗ R(τ)dτ.
- Applicable à `defer`/`under_calib` : forme du seuil, monotonie, calibrage par coûts. **Non applicable tel quel** : suppose posteriors vrais connus ; sous score mal calibré, ni optimalité ni borne ni identité (13) ne tiennent — seule l'idée qualitative survit. Rien sur dérive, adversarial, séquentiel.
- Limites (Sect. VII) : distributions non connues en pratique, comparaison empirique/théorique comme « checkpoint ».

## Conséquences pour ADR-M020
1. L'étiquetage « Q_* = cascade séquentielle, Q^* = borne de run » doit être **démontré** (monotonie de T, ordre du treillis, itération depuis l'état fondamental), pas cité.
2. Une condition d'unicité pour la cascade DeFi (bonus, impact Λ) exige une extension propre de la condition (iii) — contribution possible du papier, ou déclaration de non-unicité (deux nombres étiquetés).
3. L'abstention se justifie par Chow **qualitativement** ; toute garantie quantitative de rejet exige une calibration, donc reste conditionnelle à l'échangeabilité intra-événement.
