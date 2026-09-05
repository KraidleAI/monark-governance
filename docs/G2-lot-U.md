# Revue G2 — Lot U (paquet `packages/ukemi`)

- **Réviseur** : worker G2, instance séparée, contexte frais (≠ générateur, P6 / D13).
- **Modèle résolu (R-1 / Gate-0)** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8`, effort `max`
  (roster mainteneur 2026-08-14 ; `claude-opus-5` banni, non utilisé). Déclaré à la première prise de parole.
- **Date** : 2026-09-04.
- **Worktree** : `F:\Monark-wt-ukemi`, branche `phase1/ukemi`, HEAD `fcfa4cf`.
- **Spec de rattachement** : `F:\Monark\docs\adr\ADR-M002-phase1-moteurs-hikae-ukemi.md` (lue dans ce worktree,
  version amendée : D9 amendé, D11 tests 18-23 amendé, §4 (l)) ; CA-U1..U3 (§3).
- **Checklist appliquée** : `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\templates\checklist-revue-G2.md`
  (revue 100 %, 3 étapes AgileCoder).
- **Portée** : 100 % de `packages/ukemi/src/**` (4 fichiers), `packages/ukemi/test/**` (4 .ts + 5 fixtures JSON),
  `packages/ukemi/README.md`. Sources primaires relues moi-même (voir item 3).
- **R-20/R-21** : je ne committe pas, je ne modifie aucun fichier hors ce livrable. Toute preuve ci-dessous est
  reproductible (commande + chemin absolu + empreinte + cwd). Vérification adversariale, pas de crédit accordé.

---

## VERDICT : ACCEPTÉ-AVEC-CORRECTIONS — 3 corrections

Le code de clearing et de cible A est **mathématiquement correct** (tous les oracles de fixtures recalculés à la
main ci-dessous, aucune divergence), la **réfutation Lemme 5 est saine et vérifiée contre la source primaire**, les
6 tests nommés **existent et sont non-vacuous** (3 mutants attrapés par des assertions nommées, restauration
byte-identique), la **CI est intégralement verte** (vocab + `tsc --strict` + 51/51). Les écarts relevés sont des
**complétudes documentaires/tests contre des CA fermés** (README CA-U3 incomplet ; test 23 « + schéma ajv » non
exercé), pas des défauts de correction — d'où ACCEPTÉ-AVEC-CORRECTIONS et non REFUSÉ.

**Bloquant pour l'intégration, hors compte de corrections (propriété orchestrateur, R-20)** : le journal de
provenance n'a **pas encore** d'entrée de code Lot U ni de Gate-0 worker (voir §« Pendants »).

---

## 1. Tableau des items (preuve fichier:ligne)

| # | Item (mission + checklist G2) | Verdict | Preuve |
|---|---|---|---|
| 1 | Les 6 tests 18-23 existent et ne sont pas vacuous | **PASS** | `test/clearing.test.ts:12,29,40,82`, `test/liquidable.test.ts:8`, `test/prediction.test.ts:9` ; non-vacuité prouvée par 3 mutants (§4) |
| 2 | Oracles des fixtures recalculés à la main | **PASS** | §2 ci-dessous — chaîne, fan-in (base+bumped), anneau, App.2, Knife-edge ; 0 divergence |
| 3a | Test 21 : (a) Φ non-expansif en p ; (b) e↦p* croissante+concave ; (c) réfutation ratios exacts 2/3 | **PASS** | `test/clearing.test.ts:82-125` ; source vérifiée §3 |
| 3b | Nulle part « Lemme 5 faux » | **PASS** | `test/clearing.test.ts:75` et `README.md:34` — les deux en forme **niée** (« On n'écrit PAS… »/« Ce qu'on n'écrit pas ») |
| 3c | Citent la source primaire (eisenberg2001 l.198-206/349-368/614-660 ; detering2020 l.53/108/951/958) | **PASS (README : voir obs. O1)** | docstring `test/clearing.test.ts:62,66,79-80` (lignes exactes) ; `README.md:18,21-22,41-43` (page + citation verbatim ; sans n° de ligne — O1). Source relue §3 |
| 3d | Formulation de l'écart honnête et non sur-revendiquée | **PASS** | jugement §3 : conservatrice, plutôt sous-revendiquée ; pendant §4(l) tenu |
| 4a | fictitious default ≤ n tours (argument de croissance de l'ensemble de défaut) | **PASS** | `src/clearing.ts:79-81` (invariant), `:91-119` (boucle) ; test `:29-37` ; borne prouvée §5 |
| 4b | `solveLinear` : pivot partiel ; bloc singulier → 0 commenté | **PASS (branche singulière non exercée — voir Pendants)** | `src/clearing.ts:60-65` (pivot), `:67` + `:74` (singulier→0, commenté, non nu) |
| 4c | `unique` à tol 1e-8 vs Picard 1e-10 déclaré au README | **PASS** | `src/clearing.ts:124` (Picard `tol=1e-10`), `:140` (`clearing tol=1e-8`), `:145` (l1<tol) ; `README.md:13` déclare l'écart |
| 5a | Aucun `p_correct`, aucune région émise par UKEMI | **PASS** | `src/prediction.ts:22-30` (émet 5 clés, ni region ni p_correct) ; test `prediction.test.ts:17-18` |
| 5b | `Prediction` via `@monark/contracts` seulement | **PASS** | `src/prediction.ts:10-11` (import type + `serializePrediction`, jamais réimplémenté) |
| 5c | Gate vocab vert | **PASS** | `npm run ci` → `gate:vocab OK — scanned 14 file(s)` ; + oracle sur README+test (non scannés par CI) : `scanned 19 file(s), no forbidden claim`, exit 0 |
| 5d | Pas de TODO nu (R-13), pas de trading | **PASS** | grep `TODO|FIXME|XXX|HACK|trading|perps|Sharpe|PnL` : uniquement négations (« Pas de trading », `README.md:46-48`) + entrée empoisonnée de test |
| 6 | `npm run ci` vert depuis la racine du worktree | **PASS** | §6 : `gate:vocab OK` · `typecheck` (tsc strict, 0 err) · `tests 51 / pass 51 / fail 0` |
| — | CA-U1 (6 tests passent) | **PASS** | CI : les 6 tests Lot U verts (§6) |
| — | CA-U2 (`Prediction{yhat:number}` via contracts, aucune région) | **PASS** | `src/prediction.ts:22-30` ; `test/prediction.test.ts:11-17` (yhat=160 number, `!("region" in p)`) |
| — | CA-U3 (README : cible A + horizon 24 h, « déclaré, non fondé », 3 conséquences (i)-(iii), pas de « 99 % » en sortie) | **PARTIEL → C1, C2** | `README.md:14` : (ii)+(iii) présents, « 99 % » nié ✓ ; **(i) absente**, **« non fondé » absent** |

---

## 2. Recalcul manuel des oracles (la clé : `value_i = e_i + Σ_j Πᵀ[i][j]·p_j`, `p*_i = min(p̄_i, value_i)`)

**Anneau** (`regular-ring-4.json`), `e=[8,8,8,8]`, `p̄=[10,10,10,10]`, chaque nœud reçoit du précédent :
`value_i = 8 + p_{i-1} = 8 + 10 = 18 ≥ 10 ⇒ p*_i = min(10,18) = 10`. **p\*=[10,10,10,10]**, personne ne fait
défaut ⇒ **0 tour**, `e≫0 ⇒ unique`. = test `:23` (pPlus), `:34` (rounds=0). ✔

**Chaîne** (`chain-3.json`), `L: 0→1(100), 1→2(100)`, `p̄=[100,100,0]`, `Πᵀ[1][0]=Πᵀ[2][1]=1` :
- base `e=[10,0.5,0.5]` : `value_0 = 10` (aucun entrant) `< 100 ⇒ paie 10` ; `value_1 = 0.5 + 1·10 = 10.5 < 100 ⇒ paie 10.5` ;
  `value_2 = 0.5 + 10.5 = 11`, `p̄_2=0 ⇒ paie 0`. **p\*=[10,10.5,0]** = test `:24`. Tours : nœud 0 (→1), puis nœud 1
  entraîné (→2), puis stable ⇒ **rounds=2** = test `:35`. ✔
- bumped `e=[11,0.5,0.5]` : `value_0=11`, `value_1=0.5+11=11.5`, `value_2=0`. **p\*=[11,11.5,0]** = test `:113`.
  `Δp*=[1,1,0] ⇒ ‖Δp*‖₁=2` ; `Δe=[1,0,0] ⇒ ‖Δe‖₁=1` ⇒ **ratio L1 = 2** = test `:115`. `‖Δp*‖∞=1=‖Δe‖∞` (L∞ tient
  sur la chaîne, in-degré ≤ 1) = test `:116`. Mécanisme : `D={0,1}`, `Πᵀ_DD=[[0,0],[1,0]]`,
  `(I−Πᵀ_DD)=[[1,0],[-1,1]]`, `(I−Πᵀ_DD)⁻¹=[[1,0],[1,1]]`, sommes de colonnes `[2,1]` ⇒ norme d'op. L1 = 2. ✔
- mono_hi `e=[10,5.5,0.5]` : `value_1=5.5+10=15.5` ⇒ **p\*=[10,15.5,0] ≥ [10,10.5,0]** (monotone) = test `:99`. ✔
- concave lo/mid/hi sur l'axe `e₀` (0.5 / 100.5 / 200.5, `mid = ½(lo+hi)`) : lo `e=[0.5,0.5,0.5]` ⇒ `value_0=0.5, value_1=0.5+0.5=1`
  ⇒ **[0.5,1,0]** (`:103`) ; mid `e=[100.5,…]` ⇒ `value_0=100.5→100, value_1=0.5+100=100.5→100` ⇒ **[100,100,0]** (`:104`) ;
  hi ⇒ **[100,100,0]** (`:105`). Concavité au coude : `p*_0(mid)=100 ≥ ½(0.5+100)=50.25`, **stricte** (`:106-107`). ✔

**Fan-in** (`fan-in-5.json`), `L: 1,2,3→0 (10 ch.), 0→4 (30)`, `p̄=[30,10,10,10,0]` :
- base `e=[0.5]×5` : feuilles `value_{1,2,3}=0.5 ⇒ paient 0.5` ; hub `value_0 = 0.5 + 3·0.5 = 2 < 30 ⇒ paie 2` ;
  `value_4 = 0.5 + 2 = 2.5`, `p̄=0 ⇒ 0`. **p\*=[2,0.5,0.5,0.5,0]** = test `:25`. Tours : feuilles (→1), puis hub (→2)
  ⇒ **rounds=2** = test `:36`. ✔
- bumped `e=[0.5,1.5,1.5,1.5,0.5]` : feuilles paient 1.5 ; hub `value_0 = 0.5 + 3·1.5 = 5 ⇒ paie 5` ; `value_4=5.5⇒0`.
  **p\*=[5,1.5,1.5,1.5,0]** = test `:121`. `Δp*=[3,1,1,1,0]` : `‖Δp*‖∞=3`, `Δe=[0,1,1,1,0] ⇒ ‖Δe‖∞=1` ⇒ **ratio L∞ = 3**
  = test `:123` ; `‖Δp*‖₁=6 = 2·‖Δe‖₁` (`‖Δe‖₁=3`) = test `:124`. Trois chocs unitaires convergent sur le hub. ✔

**App. 2** (`app2-two-node.json`), `L=[[0,1],[1,0]]`, `p̄=[1,1]`, `Πᵀ=[[0,1],[1,0]]` :
- zero `e=[0,0]` : à `p=p̄=[1,1]`, `value_0 = 0 + 1·1 = 1` **n'est pas** `< 1−1e-12` ⇒ aucun défaut ⇒ `p⁺=p̄=[1,1]` ;
  itérés depuis 0 : `Φ(0)=[0,0]` point fixe ⇒ `p⁻=[0,0]` ; `‖p⁺−p⁻‖₁=2 > tol ⇒ unique=false`. **Contrôle négatif tient**
  = test `:48-50` (« ne peut pas passer par vacuité »). ✔
- eps `e=[0.01,0]` : `p⁺=[1,1]` ; le point fixe depuis 0 est `[1,1]` (`p_1=1 ⇒ p_0=min(1,0.01+1)=1`) ⇒ `p⁻=[1,1]`,
  `unique=true` = test `:52-54`. ✔

**Knife-edge** (`knife-edge-positions.json`), Eq. 3 : liquidable ⟺ `qty·price·(1−s)·K < debt`.
- P1 (`1,100,0.8,70`) : `80(1−s) < 70 ⟺ 1−s < 0.875 ⟺ s > 0.125` (**seuil 12,5 %**). `s=0.10 : 72 ≥ 70` non ;
  `s=0.125 : 70 < 70` **faux** ⇒ non ; `s=0.20 : 64 < 70` ⇒ oui = test `:14-16`. ✔
- P2 (`2,50,0.5,20`) : `50(1−s) < 20 ⟺ s > 0.6`. `s=0.5 : 25 ≥ 20` non ; `s=0.7 : 15 < 20` oui = test `:18-19`. ✔
- P3 (`1,100,0.8,90`) : `s=0 : 80 < 90` ⇒ oui (déjà sous l'eau) = test `:21`. ✔
- `liquidableDebt` : `s=0 ⇒ {P3}=90` ; `s=0.2 ⇒ {P1,P3}=160` ; `s=0.7 ⇒ {P1,P2,P3}=180` = test `:23-34`. ✔
- yhat (test 23) `= liquidableAmount(·,0.2).liquidableDebt = 160` = `prediction.test.ts:10-14`. ✔

**Conclusion §2 : aucune divergence sur aucun oracle.**

---

## 3. Test 21 `nonexpansive_in_e` — vérification contre la source primaire (relue moi-même)

Fichier source : `F:\Clawpumptech\liquidations\lecture\_txt\eisenberg2001.txt` (OCR deux colonnes, whitespace-mangled
mais **prose lisible** ; glyphes d'inégalité et indices de domaine, eux, ambigus). Lignes relues :

- **l.185-193 (p.238)** : « Let ‖·‖ denote the 1-norm on ℝⁿ. That is, for each x … ‖x‖ = Σ_{i=1}^n |x_i| ». ⇒ la norme
  de référence est **L1**. Confirme le docstring `test/clearing.test.ts:62`.
- **l.202-206 (p.238)** : « A map T … is 1-nonexpansive if … ‖T x − T y‖ ≤ ‖x − y‖ ». ⇒ « nonexpansive » = **en L1**.
- **l.365-368 (p.240, Thm 1)** : « the column sums of Πᵀ all equal 1 … ‖Πᵀ‖ = 1. Thus ‖Φ(p)−Φ(p')‖ ≤ ‖p−p'‖,
  establishing nonexpansiveness ». ⇒ **Φ non-expansif en p** — exactement ce que confirme le test 21 **(a)** (`:83-93`,
  balayage LCG déterministe seed=42 ×200 + vecteurs fixes). ✔
- **l.656-658 (Lemme 5, p.244-245)** : « **Lemma 5.** The clearing payment vector is a **concave, increasing** function
  of operating cash flow vector … » ; **l.614-616** : « … are concave, increasing, **and nonexpansive** ». ⇒ le Lemme 5
  énonce **lui-même** que `e ↦ p*` est nonexpansive (en L1). La revendication amendée de D9/D11 est **exacte**.
- **l.638-649 (preuve)** : induction `f_n(e)=F(f_{n-1}(e),e)`, `f_0≡0`, `F` « nondecreasing, jointly concave in p and e,
  and nonexpansive » ⇒ « induction shows … f_n is concave and nonexpansive ».

**Vérification de la réfutation (c).** `F(p,e)=(Πᵀp+e)∧p̄` est jointement 1-Lipschitz au sens
`‖F(p,e)−F(p',e')‖₁ ≤ ‖p−p'‖₁ + ‖e−e'‖₁` (car `x↦x∧p̄` non-expansif et `‖Πᵀ‖₁=1`). L'induction
`f_n(e)=F(f_{n-1}(e),e)` donne donc `a_n ≤ a_{n-1}+1`, `a_0=0` ⇒ `‖f_n(e)−f_n(e')‖₁ ≤ n‖e−e'‖₁` — **constante n, pas 1**.
La constante 1 revendiquée dans la preuve **ne suit pas** de la 1-Lipschitzité **jointe**. Le docstring (`:71-75`) et le
README (`:28-32`) identifient **correctement** ce mécanisme et le donnent verbatim (`n‖e−e'‖₁`). Les deux contre-exemples
(§2 : chaîne ratio L1 = 2 ; fan-in ratio L∞ = 3) sont sur des systèmes **réguliers, `e≫0`, uniques** (`p⁺=p⁻`) — donc
**pas** un artefact de non-unicité — et **réfutent la non-expansivité L1 (et L∞) de `e↦p*` de façon irréfutable**.

**« Lemme 5 faux » — nulle part.** `test/clearing.test.ts:75` : « On n'écrit **PAS** "Lemme 5 faux" » ;
`README.md:34` : « **Ce qu'on n'écrit pas** : "Lemme 5 faux" ». Les deux occurrences sont **niées**. ✔ (grep confirmé.)

**Citations detering2020 relues** (`_txt/detering2020.txt`) : l.53 « spreading and **amplifying local shocks** through
large parts of the system, which is known as systemic risk » ; l.108 « large shocks are **amplified** » ; l.951/958
« **amplification effects** are small »/« measure the **size of the amplification** ». ⇒ soutiennent exactement la
phrase « l'amplification d'un choc local par le réseau est un phénomène connu et cité » (`README.md:40-44`,
`clearing.test.ts:78-80`). ✔

**Jugement (item 3d) — formulation honnête et non sur-revendiquée : OUI.** L'écart est réel (source relue : la
revendication L1 y est ; le calcul la réfute sur systèmes réguliers). Le paquet **assère les ratios comme faits**
(justifié : contre-exemples exacts) mais **refuse** de proclamer « bug dans un papier de 2001 », renvoie l'attribution
d'`error_origin` au **G7** et **tient un pendant de lecture formé §4(l)** (page rendue) pour l'énoncé exact. C'est la
direction **prudente/sous-revendiquée**, conforme à doc 03. **Réserve de relecteur (n'inverse pas le verdict)** : la
justification « OCR illisible sur la formule » est **partiellement surdite** — la **prose** du Lemme 5, la définition de
la 1-norme et la preuve **sont lisibles** dans l'extraction `_txt` ; seuls les **glyphes d'inégalité exacts** et
l'**indice de domaine** (`ℝⁿ₊₊` vs `ℝⁿ₊`) restent ambigus. Le pendant §4(l) reste **justifié pour ces deux points
précis**. Je **ne clos pas** §4(l) (je suis G2, pas lecteur) : ce constat de lisibilité est une **entrée** pour
l'adjudication `error_origin` au G7, pas le verdict de lecture.

---

## 4. Non-vacuité des tests — mutation testing (reproductible, restauration prouvée)

Harnais : `scratchpad/mutants2.sh` (sauvegarde `cp -p`, mutation par remplacement exact via `node`, restauration en
`trap EXIT`, vérification sha256). cwd de capture : `F:/Monark-wt-ukemi`. Chaque mutant fait **échouer** le test qui
garde la propriété, avec l'assertion **nommée** qui l'attrape :

| Mutant | Modif | Test attrapeur → assertion exacte |
|---|---|---|
| A | `src/clearing.ts` `unique: l1 < tol` → `unique: true` | **test 20** : `AssertionError: App.2 e=0 : NON unique — le test ne peut pas passer par vacuité` |
| B | `src/liquidable.ts` `… < pos.debt` → `… <= pos.debt` | **test 22** : `AssertionError: P1 s=0,125 : 70 < 70 est faux — le seuil n'est pas liquidable` |
| C | `src/clearing.ts` `let v = e[i] ?? 0;` → `… + 1;` | **test 18** : `AssertionError: chain-3/base: Φ(p⁺)=p⁺` |

Restauration : `clearing.ts` et `liquidable.ts` sha256 **IDENTICAL** avant/après (baseline
`clearing.ts=d030a09a…b3a2`, `liquidable.ts=c3f947b9…eabd`). `git status --porcelain` **inchangé** après campagne
(2 modifiés + 5 non suivis, identique au début de session). Aucune trace laissée. Les tests 19/21/23 sont en outre
non-vacuous par inspection (oracles exacts `deepEqual`, ratios exacts, `assert.throws` sur clé empoisonnée).

---

## 5. Argument « fictitious default ≤ n tours »

`src/clearing.ts:91` boucle `for (iter = 0; iter <= n; iter++)`. À chaque itération : (1) résolution du bloc défaillant
`(I−Πᵀ_DD) p_D = e_D + Πᵀ_{Dᶜ D} p̄_{Dᶜ}` (`:96-106`) ; (2) ajout des nœuds dont `value < p̄ − 1e-12` (`:109-116`) ;
`rounds++` seulement si l'ensemble a **crû** (`:117-118`). L'ensemble de défaut est monotone croissant, borné par `n`,
et croît d'**au moins 1** par tour compté ⇒ **au plus n tours comptés**. La croissance ne peut se produire à `iter=n`
(il faudrait `n+1` nœuds) ⇒ la boucle sort toujours par `break`, jamais par épuisement de borne. Vérifié sur fixtures :
anneau 0, chaîne 2 (n=3), fan-in 2 (n=5) — tous `≤ n`, recalculés §2. Sémantique de `rounds` = « événements de
croissance » (2 sur la chaîne), cohérente en interne et avec les assertions du test. ✔

`solveLinear` (`:57-75`) : **pivot partiel** (`:60-65`, max |·| en colonne + swap) ; **bloc singulier** `|d|<1e-15`
⇒ `continue` + composante 0 (`:67,:74`), **commenté** (« n'arrive que sur un bloc D non régulier, où p⁺≠p⁻ … unicité
`false` ») — pas un TODO nu. Sur les fixtures régulières, `(I−Πᵀ_DD)` est inversible ⇒ branche jamais prise (voir
Pendants).

---

## 6. Oracle CI (R-21 reproduit, pas cru)

Commande : `cd /f/Monark-wt-ukemi && npm run ci` (cwd `F:/Monark-wt-ukemi`, Node v24.15.0, npm 11.12.1). Sortie :

```
gate:vocab OK — scanned 14 file(s), no forbidden claim.
> tsc --noEmit          (strict ; 0 erreur — sinon && court-circuite)
✔ clearing_fixed_point · ✔ fictitious_default_le_n_rounds · ✔ uniqueness_when_e_positive
✔ nonexpansive_in_e · ✔ liquidable_amount_eq3 · ✔ prediction_numeric_emitted
✔ contracts_frozen (×2) · ✔ fixtures_root_valid (×2)
ℹ tests 51 · pass 51 · fail 0
```

Recoupements : **51 = 45** (CI racine post-fichiers orchestrateur, `JOURNAL-PROVENANCE.md:127`) **+ 6** (Lot U) ⇒ rien
hors Lot U n'a bougé le compte. `contracts_frozen` **vert dans ce worktree** ⇒ **CA-0 satisfait ici** (D2/D13). Gate
vocab étendu (oracle non-LLM) sur README + test (non couverts par `npm run ci`) : `scanned 19 file(s), no forbidden
claim`, exit 0 ⇒ **« aucun 99 % en sortie » et vocab README/tests confirmés par machine**, pas seulement à l'œil.

---

## 7. Corrections (numérotées)

### C1 — README : conséquence (i) de D9 absente (CA-U3)
- **Fichier/ligne** : `packages/ukemi/README.md:14` (cellule « Cible A »).
- **Défaut** : CA-U3 exige « les trois conséquences (i)-(iii) de D9 ». Le README porte (ii) [« paramètre déclaré, PAS un
  modèle de dynamique »] et (iii) [« 99 % … cible HIKAE Phase 2 »], mais **pas (i)** : « UKEMI et HIKAE ne partagent
  plus la fenêtre — la cible A devient, à l'intégration Phase 2, une **2e classe de tâche HIKAE** à horizon 24 h et
  `alpha = 0.01` (viser 99 %), **distincte de `btc-dir-15m`** ». Grep confirmé : ni « fenêtre », ni « classe de tâche »,
  ni « alpha », ni « 0.01 », ni « btc-dir » dans le README.
- **Correction proposée** : ajouter une phrase portant la conséquence (i) verbatim de D9 (fenêtre non partagée ;
  2e classe de tâche HIKAE à 24 h, `alpha=0.01` ; distincte de `btc-dir-15m`).

### C2 — README : formule « déclaré, non fondé » absente (CA-U3, réserve C13d de D9)
- **Fichier/ligne** : `packages/ukemi/README.md:14`.
- **Défaut** : CA-U3 exige la cible/horizon écrits « avec « **déclaré, non fondé** » ». Le README a « déclaré » et
  « dynamique NON TROUVÉE » (pour la dynamique 24 h), mais **n'énonce pas** que la **cible/horizon** est *non fondée* au
  sens de la réserve C13d : « aucun acheteur n'a encore nommé une exigence de couverture (G7 UKEMI, NON TROUVÉ) ; le
  niveau 99 % est une cible HIKAE Phase 2, pas une sortie UKEMI Phase 1 ». Grep : « non fondé » absent du README.
- **Correction proposée** : ajouter le cadrage « déclaré, non fondé » (aucun acheteur nommé ; réserve C13d), distinct de
  la non-trouvaille de la dynamique.

### C3 — Test 23 : « + schéma ajv » non exercé (D11)
- **Fichier/ligne** : `packages/ukemi/test/prediction.test.ts` (corps du test, `:9-29` — aucun import ajv).
- **Défaut** : D11 test 23 spécifie que la `Prediction` émise « passe `serializePrediction` **+ schéma ajv** ». Le test
  n'exerce que `serializePrediction` (closed-check + garde de clés, `contracts/src/serialize.ts:23-27`), **pas** la
  validation ajv contre `schemas/prediction.schema.json`. **Sévérité faible** : j'ai vérifié que l'instance émise
  `{schema_version:"1.0.0", task_class:"cascade-liquidable-24h", yhat:160, predictor_id:"internal:ukemi-cascade-v0",
  produced_at:"2026-09-04T00:00:00Z"}` **passerait** ajv (SemVer `^\d+\.\d+\.\d+$`, task_class/predictor_id `^[ -~]+$`,
  yhat `["string","number"]`, produced_at `date-time`, tous `required` présents, `additionalProperties:false`) — c'est
  une **assertion manquante**, pas une rupture. Mais c'est dans la liste **fermée** D11.
- **Correction proposée** : ajouter au test 23 une validation ajv de la `Prediction` émise contre
  `schemas/prediction.schema.json` (miroir de `test/fixtures-root.test.ts` racine), `ajv`/`ajv-formats` étant déjà
  dev-deps.

---

## 8. Observations mineures (non bloquantes, non comptées)

- **O1** — `README.md:18,21-22,41-43` cite la source primaire par **page** (p.244-245) + **citation verbatim** du Thm 1
  et les lignes detering, mais **sans n° de ligne** eisenberg (198-206/349-368/614-660), là où le docstring les donne.
  Citation [lu] valide (page + verbatim) ; ajouter les ancres de ligne mettrait le README à parité de traçabilité avec
  le docstring. Optionnel.
- **O2** — `src/liquidable.ts:32` `isLiquidable` ne valide pas `shock ∈ [0,1]` à l'exécution (précondition déclarée au
  docstring `:31` ; tous les appelants sont des fixtures valides). Robustesse d'entrée (piège checklist « validation
  d'entrée ») — mineur pour un moteur Phase 1 piloté par fixtures. Optionnel : clamp ou garde explicite.
- **O3** — Test 21 **(b)** : le docstring dit « CONFIRME croissante et concave ». Ce que le test **fait** réellement :
  **un** point de contrôle de concavité sur l'axe `e₀` (lo/mid/hi) + **un** contrôle de monotonie composante-à-composante.
  C'est un **contrôle ponctuel cohérent avec** les sous-énoncés, **pas** une démonstration. Les sous-énoncés **sont
  vrais** (la concavité **compose** correctement à travers l'induction E&N — contrairement à la non-expansivité — et la
  monotonie est Milgrom-Roberts), donc « tiennent » est **exact**. Formulation acceptable ; ne pas lire (b) comme une
  preuve.

---

## 9. Ce que je n'ai PAS pu vérifier / pendants

- **P1 — BLOQUANT POUR L'INTÉGRATION (propriété orchestrateur, R-20 ; hors compte de corrections)** : le journal de
  provenance `docs/JOURNAL-PROVENANCE.md` — dont la règle propre `:3-4` dit « **une entrée par lot de code généré ; un
  artefact sans entrée ne s'intègre pas** » — n'a **pas encore** (a) de **ligne de table pour le code Lot U** (seule
  Phase 0 en `:8`), ni (b) de **déclaration Gate-0/R-1 du worker générateur Lot U** (`:119-120` note que les workers
  H/U initiaux sont morts sur limite d'usage puis relancés ; la résolution de modèle du worker abouti n'est pas
  consignée). **Je ne peux donc pas confirmer depuis le journal que le générateur du code relu était `claude-opus-4-8`.**
  À écrire par l'orchestrateur au G1/G7 **avant** intégration. Je le sépare des corrections C1-C3 (qui portent sur
  l'artefact Lot U) car R-20 me l'interdit et il est écrit au merge.
- **P2 — branche singulière de `solveLinear` (`clearing.ts:67,:74`) non exercée** : par trace manuelle, App.2/zero
  laisse `D` vide (`value == p̄` n'est pas `< p̄ − 1e-12`), donc `solveLinear` n'est **jamais** appelé sur un bloc
  singulier par aucun test. Le commentaire (« n'arrive que sur un bloc non régulier ») est **plausible mais non testé**.
  Pas une correction (code défensif, commenté, aucun test D11 ne l'exige) — je le **nomme**.
- **P3 — §4(l) reste ouvert (correctement)** : l'énoncé exact du Lemme 5 (glyphe d'inégalité, domaine `ℝⁿ₊₊`) sur
  **page rendue** relève du lecteur Sonnet 5 (pendant formé §4(l)), pas de moi. Mon constat de lisibilité de la prose
  (§3) est une **entrée** pour l'adjudication `error_origin` au G7, pas une clôture.
- **P4 — je n'ai pas exécuté HIKAE ni l'intégration Phase 2** (hors périmètre Lot U ; l'émission de région est propriété
  Lot H, D9/C4 — correctement **absente** d'UKEMI).

---

**VERDICT : ACCEPTÉ-AVEC-CORRECTIONS — 3 corrections** (C1 README conséquence (i) ; C2 README « déclaré, non fondé » ;
C3 test 23 schéma ajv). Bloquant d'intégration hors compte : entrée de provenance Lot U + Gate-0 worker (P1,
orchestrateur).
