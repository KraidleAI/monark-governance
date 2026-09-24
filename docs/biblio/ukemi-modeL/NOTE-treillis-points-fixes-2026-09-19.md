# NOTE — Treillis des points fixes de la cascade-cluster T (vérification formelle)

**Provenance.** Worker `claude-opus-4-8[1m]`, effort max, 2026-09-19. Mission de
vérification formelle en **lecture seule** (aucun code de dépôt modifié, aucun commit, R-20).
Oracle non-LLM = deux scripts Node déterministes (graine fixe), dans
`scripts-mesure/treillis/` :
- `treillis-fixedpoints.mjs` — sha256 `f60e7c0b711ed61fab6e143e9310b7e3828924fdbbc5053fdcacd331c7446ef7`
- `stress-monotonie-picard.mjs` — sha256 `8f1960e444acb87c842381861e1ad999309cd2dcd9e67def074231b1b41e8caa`

**Sources.** [lu] `_txt/eisenberg-noe-2001.txt` (EN) ; [lu] `_txt/rogers-veraart-2013.txt` (RV) ;
[lu] `_txt/amini2016.txt` (AFM) ; [lu] `packages/ukemi/src/clearing.ts`, `.../liquidable.ts`.
Les chiffres cités « sortie de script » sont **mesurés** (rejouables). Gatto/CFS/Glasserman = [2nd]
(procurement, §fin). Références de lignes données pour chaque énoncé primaire.

---

## §0. Définition (Q1)

**Définition 1 (cascade-cluster).** N positions ; position *i* de collatéral commun, quantité
`C_i`, seuil `K_i∈(0,1]`, dette `B_i≥0`. Critère Perez Eq.3 (`liquidable.ts:6-10,32-35`) :
*i* liquidable ⇔ `C_i·P·K_i < B_i` ⇔ `HF_i(P) := C_i·K_i·P/B_i < 1` ⇔ `P < P_i^crit`, avec
**prix critique** `P_i^crit := B_i/(C_i·K_i)`. Prix endogène (CFS linéaire [2nd], déclaré)
`P(Q) = c·(1−Λ·Q)`, `c := P₀(1−D)`, `Q∈[0,ΣB]`. Application de cascade
> **T(Q) = Σ_i B_i · 1{ HF_i(P(Q)) < 1 } = Σ_{i : P(Q) < P_i^crit} B_i.**

L'inégalité est **stricte** : à `P=P_i^crit` (HF=1), *i* n'est pas liquidée. La forme
`(P_i^crit, B_i)` est **équivalente** à `(C_i,K_i,B_i)` (posant `C_i=1, K_i=B_i/P_i^crit`) —
vérifié : `HF=C·P·K/B = P/P_i^crit` bit-identique (script §faithfulness, `1.0109… = 1.0109…`).

**Lemme 1 (monotonie).** T est **non décroissante** sur `[0,ΣB]`.
*Preuve.* `P(·)` est décroissante en Q (Λ≥0). Donc `Q↦HF_i(P(Q))` décroissante, et
`1{HF_i<1}` non décroissante en Q. Somme de termes `B_i≥0` non décroissants ⇒ T non
décroissante. ∎ (Empirique : 0 violation sur grille 4000 pts × 4 scénarios + 300 000 configs
à graine fixe, script 2 `H1=0`.)

**Théorème 1 (Tarski).** T : `[0,ΣB]→[0,ΣB]` monotone sur un treillis complet (intervalle
compact de ℝ) ⇒ l'ensemble des points fixes est un treillis complet non vide ; il existe un
**plus petit** `Q_*` et un **plus grand** `Q^*`, `Q_*≤Q^*`. *Preuve.* `T(Q)=Σ_{S(Q)}B_i∈[0,ΣB]`
(sous-somme de B_i≥0) ⇒ T stable sur `[0,ΣB]`. Tarski (aucune continuité requise). ∎
C'est exactement la voie « Lemma 1 + Tarski ⇒ existence » d'AFM (`amini2016.txt:129,140-141`),
d'EN (`Theorem 1`, `eisenberg-noe-2001.txt:288-291`) et de RV (`Theorem 3.1`,
`rogers-veraart-2013.txt:282-287`, `Remark 3.2(i)` unicité de `L̄,L`).

**Théorème 2 (Picard en escalier, ≤ N+1 itérations).** Soit `Q^{(0)}=0`, `Q^{(k+1)}=T(Q^{(k)})`.
Alors `Q^{(k)}↑Q_*` en **≤ N+1** itérations (≤ N sauts stricts). Symétriquement depuis
`Q^{(0)}=ΣB`, `Q^{(k)}↓Q^*`.
*Preuve.* (bas) `T(0)≥0=Q^{(0)}` ; par L.1 et récurrence la suite est croissante, majorée par ΣB.
`S(Q^{(k)})` est croissante (⊆) le long de la chaîne ; chaque **saut strict** ajoute ≥1 position
(valeur = somme de B sur S), donc **≤ N** sauts, puis stationnarité — une itération de plus la
confirme. La limite `Q̃` est un point fixe. Par récurrence `Q^{(k)}≤Q_*` (car `0≤Q_*` et
`T(Q_*)=Q_*`), donc `Q̃≤Q_*` ; et `Q_*≤Q̃` (Q_* est le plus petit) ⇒ `Q̃=Q_*`. (haut) dual :
`T(ΣB)≤ΣB`, suite décroissante, `Q^{(k)}≥Q^*`, limite `=Q^*`. ∎
**Point clé vs RV.** La preuve n'utilise **aucune continuité** — seulement la **portée finie**
de T (staircase). C'est ce qui **évite les redémarrages** de RV : chez RV, itérer depuis 0 donne
une limite `L̂` qui *n'est pas* un point fixe si α,β<1 (Φ « not continuous from below »,
`rogers-veraart-2013.txt:246-262`, ≤ n−1 restarts), reproduit en garde dans `clearing.ts:19-21,160-163`.
Ici, T étant à valeurs dans un ensemble fini, la chaîne **atteint** (n'approche pas) son point
fixe, qui **est** `Q_*`. Empirique : Picard(0)=`Q_*` et Picard(ΣB)=`Q^*` sur **300 000** configs
(graine `mulberry32(20260919)`), `H2=H3=H4=0` violation ; steps ≤ N+1 toujours.

---

## §1. Étiquetage Q_* / Q^* (Q2)

**Proposition 2 (Q_* = cascade séquentielle mécanique).** Le procédé « au prix courant, liquider
*exactement* les positions dont HF<1 ; mettre à jour le prix ; répéter, depuis l'état non liquidé »
**est** l'itération de Picard depuis 0 : l'étape *k* liquide `S(Q^{(k)})` pour un montant
`Q^{(k+1)}=T(Q^{(k)})`. Par le Th. 2 il converge vers `Q_*`. `Q_*` est donc l'issue de la **cascade
mécanique causale** (price-taking, myope). ∎

**Proposition 3 (Q^* = run auto-réalisateur).** Un point fixe `Q=T(Q)` est un ensemble liquidé
**auto-cohérent** : les positions liquidées sont exactement celles sous l'eau au prix `P(Q)`
qu'induit cette liquidation. `Q^*` est le **plus grand** tel ensemble : le maximum de dette
liquidable comme **équilibre auto-réalisateur** (si le marché anticipe la liquidation de `S(Q^*)`,
le prix tombe à `P(Q^*)` auquel `S(Q^*)` est précisément sous l'eau, validant l'anticipation).
Picard depuis ΣB (« tout liquidé, retirer les solvables au prix extrême, itérer ») y converge
(Th. 2). C'est la **borne de run**. ∎

**Numérique (script 1).** Scénario A : `P0=100,D=0,Λ=0.004`, positions `(P^crit,B)=(105,20),(91,30),(85,40)`, ΣB=90.
```
staircase:  Q in (0,22.5]: S={1} T=20 | (22.5,37.5]: S={1,2} T=50 | (37.5,90]: S={1,2,3} T=90
TOUS les points fixes: [20, 90]   Q_*=20  Q^*=90  unique=false
Picard depuis 0    -> fp=20  path=[0->20->20]      (cascade cale : pos.2 a HF>1 a P=92)
Picard depuis sumB -> fp=90  path=[90->90]
```
Cascade mécanique : la position 1 (sous l'eau dès `P0`) liquide 20, le prix tombe à 92 ; la
position 2 (P^crit=91) reste solvable (marge) ⇒ **cale à Q_*=20**. Mais si les trois sont
liquidées ensemble, `P=64<85` les met toutes sous l'eau : **run auto-cohérent Q^*=90**. Le
« coin » `[20,90]` est l'amplification de coordination.

**Coïncidence (Λ=0).** Scénario B (`Λ=0, D=0.15 ⇒ P≡85`) : `S` constant ⇒ `T≡50` ⇒ **point fixe
unique 50** = `liquidableAmount` (`liquidable.ts`). Scénario B' (`Λ=0, D=0`) : `T≡20`, unique.
Λ=0 ⇒ T constante ⇒ `Q_*=Q^*=` liquidable statique (cible A). Confirme la bascule B→A de l'avis.

---

## §2. EN/RV et RV(α,β) vs T (Q3)

| Objet | EN / RV (`clearing.ts`) | T (cascade-cluster) | Correspondance |
|---|---|---|---|
| Variable d'état | vecteur de paiements `p∈[0,p̄]` (ℝⁿ) | **scalaire** `Q∈[0,ΣB]` | ✗ dimension |
| Réduction scalaire | — (vectoriel) | oui | **≈ AFM** (prix scalaire `p=f(Θ(p))`, `amini2016.txt:161-174`) |
| Squelette | monotone + Tarski, plus grand/petit FP | idem | ✓ identique |
| Itération « d'en haut » | `fictitiousDefault`/GA depuis p̄, ≤ n tours → `pPlus=L*` | Picard depuis ΣB, ≤ N+1 → `Q^*` | ✓ borne max, MAIS sens inverse (§4) |
| Itération « d'en bas » | `clearingFromBelow` depuis 0 → `pMinus=L_*` (restarts si α,β<1) | Picard depuis 0 → `Q_*` (sans restart) | ~ (portée finie ⇒ pas de restart) |
| Réponse au défaut | **continue, proportionnelle** `α·e+β·(Πᵀp)` (`clearing.ts:197-208`) | **escalier binaire** (0 ou B_i) | ✗ T discontinue |
| Rétroaction | couplage réseau Π (interbancaire) | impact prix Λ (inverse-demande CFS) | ✗ Λ ≈ `f` d'AFM, **pas** α/β |
| Coût/perte | `1−α,1−β` (recouvrement partiel) | bonus de liquidation (haircut) | ~ analogie |

**Ce qui NE correspond pas (exact).** (a) T est **scalaire**, EN/RV **vectoriels** : T est
structurellement le **cousin de la réduction scalaire d'AFM** (`p=f(Θ(p))`), pas de la map
vectorielle Φ. (b) La réponse d'EN/RV est **continue** (min(p̄,valeur), concave chez EN,
`clearing.ts:14,204`) ; T est un **escalier discontinu** (tout-ou-rien) — c'est la source de la
multiplicité (§4). (c) Λ **n'est pas** α/β : α,β sont des **fractions de perte au défaut** ;
Λ est l'**impact-prix** (pente d'inverse-demande, rôle de `f` chez AFM). Le mapping de l'avis
« pro-rata → bonus ; α/β → 1−bonus et impact » est **imprécis** : le bonus est un haircut
forfaitaire (pas un pro-rata entre créanciers de Π), et l'impact est Λ (≈ f), distinct de α/β.
**Seuls vrais cas particuliers** (réductions exactes) : `α=β=1 ⇒ EN` (RV, `clearing.ts:13,110-113`,
test 36) ; `Λ=0 ⇒ T = liquidable statique` (§1). **Conclusion Q3 : EN/RV et T sont des cousins
(même squelette Tarski), pas des cas particuliers l'un de l'autre.**

---

## §3. Unicité (Q4)

**Fait 1 — `Λ·ΣB<1` ne suffit pas.** `Λ·ΣB<1` ⇔ `P(ΣB)=c(1−ΛΣB)>0` : c'est la **positivité du
prix**, sans rapport avec l'unicité.

**Fait 2 — l'analogue d'AFM (iii) ne suffit pas non plus.** AFM (iii) : `x·f(x)` croissante
(`amini2016.txt:131`). Pour `f(x)=c(1−Λx)`, `x·f(x)=c(x−Λx²)`, dérivée `c(1−2Λx)>0` ⇔ `x<1/(2Λ)`,
donc (iii) sur `[0,ΣB]` ⇔ **`2Λ·ΣB<1`**. Mais AFM Lemme 3 exige AUSSI que `Θ(p)` soit **continue**
(hyp. 1, `amini2016.txt:161-163`). Or notre demande `Θ=g` (dette liquidée au prix P) est un
**escalier** (positions discrètes) — hypothèse violée. **Contre-exemple C** (script 1) :
```
P0=100,D=0,Λ=0.001 ; positions (P^crit,B)=(99,100),(85,100) ; sumB=200
Lambda*sumB=0.2   2*Lambda*sumB=0.4          <-- (iii) VRAIE pour f
TOUS les points fixes: [0, 100, 200]   Q_*=0  Q^*=200  unique=false
```
`2Λ·ΣB=0.4<1` (donc `x·f(x)` strictement croissante sur `[0,200]`) et pourtant **trois** points
fixes. L'analogue nu d'AFM (iii) est **réfuté** comme condition suffisante pour T, à cause de la
discontinuité de la demande (positions discrètes).

**Proposition 4 (condition suffisante prouvée — « pas d'activation dormante »).** Soit
`S_* := S(Q_*)` (ensemble de la cascade mécanique) et `P_min := P(ΣB)=c(1−ΛΣB)`. Si
> **pour toute position `j∉S_*`, `P_j^crit ≤ P_min`**,

alors `Q^*=Q_*` (**unicité**).
*Preuve.* Pour `Q≥Q_*` : par L.1, `S(Q)⊇S_*`. Pour `j∉S_*`, *j* liquidable en Q ⇔ `P(Q)<P_j^crit` ;
or `P(Q)≥P_min≥P_j^crit` ⇒ *j* jamais liquidée. Donc `S(Q)=S_*`, i.e. `T(Q)=T(Q_*)=Q_*` constante
sur `[Q_*,ΣB]`. Le seul point fixe ≥Q_* est Q_* ; et aucun < Q_* (plus petit) ⇒ unique. ∎
Interprétation : **même le run maximal ne peut pas activer une position au-delà de la cascade
mécanique.** Λ=0 en est le cas extrême (T constante). **Suffisante, non nécessaire** (stress,
graine fixe) :
```
cond suffisante VRAIE dans 268860 cas ; parmi eux UNIQUES=268860 ; VIOLATIONS P4=0
cond FAUSSE mais unique = 3016 cas (>0 => suffisante, pas nécessaire)
```
0 violation de « cond ⇒ unique » sur 300 000 configs ; 3016 uniques hors condition ⇒ elle est
suffisante mais stricte.

**« bonus·LT<1 à la Gatto ».** Structurellement, une telle condition porterait sur **Λ** (qui
encapsule bonus et LT), même famille que la Prop. 4. Je **ne peux pas** l'affirmer : la valeur et
la forme exactes de la condition de Gatto sont [2nd] dans notre corpus — **demande de procurement
formée** (§fin), pas un « dû ».

---

## §4. Sens du treillis (Q5)

**Proposition 5 (plus grand Q = pire ; anti-isomorphisme avec le prix).** `P(·)` décroissante ⇒
`P(Q^*)≤P(Q_*)` : le **plus grand Q** = **prix le plus bas** = **pire pour le cluster** (plus de
dette liquidée, pertes de liquidation supérieures). Numérique A :
```
Q5 prix   P(Q_*)=92.0000  >=  P(Q^*)=64.0000        (prix plus BAS au plus grand Q : true)
Q5 pertes(bonus=5%)  L(Q_*)=1.0000  <=  L(Q^*)=4.5000 (pertes plus HAUTES au plus grand Q : true)
```
**Levée de l'ambiguïté du lecteur.** AFM/EN/RV ordonnent par le **prix p** (ou le paiement),
un « bien » : chez eux le **plus grand** point fixe = **meilleur** (prix haut / paiement max).
Nous ordonnons par la **quantité liquidée Q**, un « mal ». La correspondance `Q=g(P)` est
**décroissante** ⇒ l'ordre sur Q est le **renversé** (anti-iso) de l'ordre sur P. Donc :
> **notre `Q^*` (plus grand) ⟺ le PLUS PETIT point fixe en prix d'AFM ⟺ le pire.**

Attention au piège symétrique dans `clearing.ts` : EN/RV itèrent « d'en haut » (`p̄`, GA) vers
`pPlus=L*` = **meilleur** (paiement max) ; ici Picard « d'en haut » (`ΣB`) atteint `Q^*` = **pire**.
Même *direction* d'itération pour le « plus grand FP », *bien-être opposé*, car paiement et
quantité liquidée sont des grandeurs opposées et `P(Q)` est décroissante. **« Plus grand Q = pire »
est correct** ; c'est l'énoncé à publier, avec le rappel explicite de l'anti-isomorphisme.

---

## §5. Ce que ADR-M020 peut affirmer (prouvé + rejouable)

1. **T monotone** (L.1) sur `[0,ΣB]` ; **Tarski ⇒ Q_* et Q^*** existent (Th.1) — voie identique
   à EN/RV/AFM, aucune continuité requise.
2. **Picard en escalier** : depuis 0 → `Q_*` ; depuis ΣB → `Q^*` ; **≤ N+1 itérations**, **sans
   redémarrage** (portée finie) (Th.2) — vérifié sur 300 000 configs, 0 violation.
3. **Étiquetage démontré (pas cité)** : `Q_*` = **cascade séquentielle mécanique** (Prop.2) ;
   `Q^*` = **borne de run auto-réalisateur** (Prop.3). Publier **deux nombres étiquetés**, jamais
   un vecteur nu (rejoint l'avis).
4. **`Λ=0 ⇒ Q_*=Q^*=` liquidable statique** (cible A) — oracle U-2 satisfait.
5. **EN/RV et T = cousins** (squelette Tarski), **pas** cas particuliers ; seuls réductions
   exactes : `α=β=1⇒EN`, `Λ=0⇒liquidable` (Q3).
6. **Unicité** : `Λ·ΣB<1` (positivité) **et** `2Λ·ΣB<1` (AFM (iii) pour f) sont **insuffisants**
   (contre-ex. C) ; **Prop.4** donne une condition suffisante prouvée (« pas d'activation
   dormante »), suffisante non nécessaire.
7. **Sens du treillis** : **plus grand Q = pire** = plus petit prix d'AFM (Prop.5) ; ambiguïté
   levée.

## §6. Ce qui reste ouvert (zéro dette : recherche ou procurement formé)

- **[procurement]** Amini–Filipović–Minca 2016, *Oper. Res. Lett.* 44:1–5 — **[lu]** ici
  (`_txt/amini2016.txt`, sha annoncé `98685c64…` dans `L-lecture…`). Rien de dû.
- **[procurement — dû]** **Gatto 2026** (SSRN 7157638, existence à confirmer) : la condition
  « bonus·LT<1 » ne peut être ni affirmée ni réfutée sans le texte primaire. *Identité* : Gatto,
  DARU Finance 2026, SSRN abstract 7157638 ; *usage* : comparer sa condition d'unicité à la Prop.4 ;
  *tentatives* : non présent en `_txt/` (seul `gatto-2026-daru-finance.txt` — à vérifier par le
  chercheur ; s'il porte la condition, la reclasser [lu]). **Demande adressée au mainteneur.**
- **[procurement — dû]** **Cifuentes–Ferrucci–Shin 2005** (JEEA 3(2-3)) : `P(Q)=c(1−ΛQ)` est
  déclaré « linéaire CFS » ([2nd]). Pour ancrer la forme **linéaire** de l'inverse-demande (et non
  exponentielle, cf. AFM sur CFS exponentiel `amini2016.txt:161-162`) : lire CFS. Présent
  (`_txt/cifuentes-ferrucci-shin-2005.txt`) — **recherche** à faire, pas un dû si lu.
- **[recherche]** Extension de la Prop.4 vers une condition **nécessaire-et-suffisante** exacte
  (caractérisation du croisement unique de `T` avec la diagonale). Piste : `Ψ(P)=c(1−Λg(P))`,
  `h=Ψ−P` décroît de pente −1 entre seuils et saute de `+cΛB_i` à chaque `P_i^crit` (sens P
  croissant) ; unicité ⇔ un seul changement de signe de h. À formaliser.
- **[ouvert, mesurable — non un dû]** `Λ` empirique sur les clusters visés (U-3) : si `Λ≈0`,
  T dégénère en A (§1) et Ukemi n'a pas d'objet propre (bascule de l'avis).

**Interdits respectés** : aucun chiffre de seconde main dans les énoncés prouvés (tous mesurés,
sha+graine) ; aucun « aurait ».
