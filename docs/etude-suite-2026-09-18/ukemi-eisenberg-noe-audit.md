# UKEMI × Eisenberg–Noe — audit des sous-produits

Date : 7 septembre 2026.  
Parent : **Ukemi** (受身) — acte roadmap, cascade de liquidation.  
Ce fichier n’ajoute **pas** un 12ᵉ agent. Il dit quels *modes* d’Ukemi sont de vrais produits, lesquels sont du théâtre académique, et comment les vendre (abonnement **ou** bps **ou** licence — l’abonnement n’est pas une contrainte).

Invariant flotte : **aucun score de résilience, aucun `p_cascade`**. Sortie = `CoverageVerdict` (intervalle) + `GateDecision`.

---

## 0. Deux objets mathématiques distincts (le point que l’autre IA rate)

### Eisenberg–Noe (2001)

Réseau de *paiements nominaux* entre nœuds. Clearing vector unique sous conditions faibles :

\[
p_i^* \;=\; \min\Bigl(\bar p_i,\; e_i + \sum_j \Pi_{ji}\, p_j^*\Bigr)
\]

Priorité de la dette, limited liability, **pro-rata** si défaut. Existence par point fixe (treillis). Algorithme *fictitious default*.

**Ce n’est pas** un modèle de prix. **Ce n’est pas** un modèle de liquidation collatéralisée.

### Ukemi / DeFi lending

Positions **surcollatéralisées**, dette envers **un pool**, pas envers une autre banque. Contagion principale = **fire sale** (le collatéral vendu fait baisser \(P\), ce qui liquide le voisin). Canal Cifuentes–Ferrucci–Shin (2005), documenté on-chain par Lehar & Parlour (BIS WP 1062) : **$2,49 Md** de liquidations Compound+Aave, impact de prix transitoire *et* permanent, queues plus lourdes.

| | EN (2001) | DeFi lending |
|---|---|---|
| Arc | dette bilatérale | user → pool (pas user → user) |
| Défaut | insolvabilité, pro-rata | HF < 1, bonus au liquidateur |
| Contagion | shortfall de paiement | **prix** du collatéral commun |
| Unicité | oui (EN) ; **non** dès coûts de faillite (Rogers–Veraart 2013) | n/a |
| Objet Ukemi | le *loop* de l’utilisateur comme petit graphe | + impact de prix Cifuentes |

**Conséquence.** Coller EN sur « Aave, Compound, Maker, EigenLayer comme banques » est un **mauvais isomorphisme**. Le graphe EN *utile* en DeFi est :

1. le **loop de l’utilisateur** (cycle : deposit → borrow → re-deposit) — \(n = 2\ldots 5\) nœuds ;
2. le **cluster de collatéral** d’un marché (wstETH e-mode, Morpho isolated) — fire sale, pas pro-rata ;
3. **pas** « Ethereum doit à Solana via Wormhole ».

---

## 1. Audit des 6 idées (l’autre discussion)

Légende : **TUE** = ne pas construire. **FAIBLE** = existe déjà / mauvais payeur. **GARDE** = Ukemi peut le porter, sous l’invariant.

### Idée 1 — « Oracle de contagion » + score de résilience systémique

**TUE**, telle qu’écrite.

| Problème | Preuve |
|---|---|
| Champ `score` | Interdit (03 §0, `FORBIDDEN_KEYS`). Un « Resilience Score » est un lemon Akerlof. |
| Mauvais graphe | Pools ≠ banques. Pas de \(\Pi\) bilatéral Aave↔Compound. |
| Unicité | Rogers–Veraart : dès qu’il y a des *bankruptcy costs*, le clearing n’est plus unique (plus grand / plus petit vecteur). Publier « le » vecteur est un mensonge. |
| Payeur | Chaos Labs **part d’Aave** avr. 2026 en refusant **$5 M** de rétention, mandat à perte 3 ans, **$2 Md** de liquidations pricées, 0 bad debt matériel — puis incident CAPO **$26,9 M** de liquidations indues (mars 2026). Le SP protocole est un acheteur qui te fait travailler à perte. |
| Gouvernance | Aucune DAO ne *halt les retraits* sur un oracle tiers. C’est un coup d’État oracle. |

**Ce qui reste.** Un `CoverageVerdict.interval` sur la *taille* d’une cascade **nommée** (marché, choc \(D\), résidus), consommé par Ukemi. Pas un oracle on-chain.

### Idée 2 — Moteur EN dans le pipeline de l’agent DeFAI

**GARDE**, c’est déjà Hikae + Ukemi + Genkan.

Ne pas reconstruire LangGraph. L’agent appelle `before_tool(borrow|loop|leverage)` → Prediction (clearing du *loop*) → Hikae → `commit|defer|abstain`. Object Capabilities = B_t.

Faisable dès que `GateDecision` est gelé. C’est le **mode lending** de Genkan, pas un produit séparé.

### Idée 3 — Dashboard B2B DAO / trésorerie (2ᵉ et 3ᵉ ordre)

**FAIBLE** comme flagship. **GARDE** comme module.

- Crowded : Gauntlet, LlamaRisk, TokenLogic, Chaos (parti). Curators Morpho : Steakhouse **$2,14 Md** AUM, ~**$2,79 M** net/an, 5–14 bps — le dashboard n’est pas où l’argent se pose, le *vault* l’est.
- Le 2ᵉ ordre est réel : Galaxy Q1 2026, exploit KelpDAO/LayerZero → Aave **−$5,5 Md** de stables, **−943 k WETH** en 2 semaines. Ce n’est pas EN (pas de dette Aave→Kelp) : c’est **fuite + corrélation de collatéral**.
- Module : intervalle « tes 10 M USDC Aave gèlent-ils si le cluster LST saute de \(D\) » → `hold | rotate | wait`. Vendu à TokenLogic-class, pas un SaaS à 99 $/mois.

### Idée 4 — Prime d’assurance dynamique

**TUE** comme protocole d’assurance. **FAIBLE** comme feed.

- Nexus : **$7 Md** underwritten lifetime ; Leveraged Liquidation Cover **$9,6 M** actif ; Fund Portfolio **$350 M** ; systémique = « currently not insurable » (docs sept. 2026).
- Tu n’as pas de bilan d’assureur. Tu n’as pas de claims committee.
- Plus tard : vendre l’**intervalle de cascade** comme input d’underwriting (licence data). Pas maintenant.

### Idée 5 — Searcher MEV / clearing atomique par flash loan

**TUE**.

- 39 k liquidations, **$2,57 Md** saisis (Aave V3, Spark, Morpho, Fluid) : 569 bots, **50** profitables, top 20 = **89,3 %** de **$91,85 M** net. Oligopole.
- Aave SVR : **$675 M** liquidations / 9 mois, **~$16 M** recapture (65 % DAO / 35 % Chainlink). Le protocole a déjà internalisé une partie du MEV.
- L’algorithme fictitious default **n’est pas** un chemin de flash loan. Les liquidations sont séquentielles, gas-bornées, bonus-bornées. « Dénouer le graphe atomiquement » est un papier, pas un searcher.
- Ukemi est du côté **emprunteur** (survivre), pas du côté **chasseur**.

### Idée 6 — Chains comme nœuds, bridges comme arcs EN

**TUE**.

Un pont n’est pas une créance pro-rata. C’est de la custodie + du messaging. Limited liability / priorité de dette / clearing simultané : **aucune** de ces hypothèses ne tient. Le risque pont est un risque d’attestation (Mokugeki / Narabi), pas un clearing vector.

---

## 2. Ce qui est faisable — trois modes d’Ukemi

Pas de nouveaux kanji. Trois **modes** du même acte, même `GateDecision`.

### Mode L — Loop-clearing (le vrai EN)

**L’idée.** Le loop *est* un réseau EN à \(n\) petit. Chaque jambe (wstETH, weETH, PT, stable) est un nœud ; \(\Pi\) encode le recyclage ; \(e_i\) = l’équité non loopée.

Choc \(D\) (depeg LST, gap week-end, unlock) → fictitious default sur *ce* graphe → équité résiduelle \(E(D)\). Hikae conformalize \(E(D)\) en **intervalle**. Si 0 ∉ intervalle au levier courant → `reduce` / `flatten`.

**Pourquoi ça n’existe pas chez DeFi Saver.** DFS (août 2026) : trigger **point** Safety Ratio 105 % → remonte à 110 %, fee **0,05 %**. CAPO mars 2026 : oracle 2,85 % trop bas → **$26,9 M** de liquidations de positions *saines*. Un seuil 105 % **aurait liquidé / remboursé à tort**. Ukemi s’abstient si l’intervalle contient encore 0.

**Preuves de taille.**

| Fait | Chiffre | Source |
|---|---|---|
| Looping = stratégie dominante | **>65 %** de la dette Aave/Spark liée à des positions corrélées, **<15 %** de l’équité agrégée (pic août 2025) | FC26, *Structural shift in DeFi lending* |
| Volume recursif | **>20 %** du borrowed Aave V3, 2023–2025 | Bank of Canada 2026 |
| Eligible vs bad debt (live book) | choc LST **5 %** : **$1,38 Md** liquidation-eligible, **$0** bad debt protocole si chemin continu ; jump **10 %** : **$47 M** bad debt | Gatto, SSRN 7157638, juin 2026 |
| Boundary e-mode | \(D^* \approx 7,4 \%\) (ancre), médiane 6,9 % | Gatto |
| Liquidations Aave all-time | **$4,65 Md** / 310 k events ; oct. 2025 **$250 M**/j ; jan–fév 2026 **$429 M** | Aave blog fév. 2026 |
| Q1 2026 DeFi | **$15,7 Md** liquidations auto ; 0 insolvabilité de grand lending | Blockeden / stress-test |
| CAPO | **$26,9 M**, 34 comptes, wstETH | Chaos / Blockeden avr. 2026 |

**Objet.**

\[
E(D) \;=\; \mathbf{1}^\top \bigl( p^*(D) - \bar p_{\mathrm{ext}} \bigr),\quad
p^* \;=\; \Phi_{\mathrm{EN}}\!\bigl(e,\,\Pi,\,D\bigr)
\]

Puis `Prediction` = \(\widehat{E}(D)\) (régression) ou set {survive, flatten}. **Pas** un HF.

Cifuentes en plus : le \(D\) n’est pas exogène si le cluster liquide. Haircut endogène \(P \mapsto P - \Lambda \cdot Q_{\mathrm{liq}}\). \(\Lambda\) calibré (Lehar–Parlour).

**Payeur.** Desk / looper (profil 03), pas Aave DAO. Capture : **fraction du bonus évité** (e-mode 1 %, hors e-mode 5–10 %) ou bps du notionnel loopé, ou keeper (comme DFS) *plus* le feu conformal.

**MVP 30 j.** Un wallet, Aave v3 e-mode wstETH/WETH, choc \(D \in \{3,5,7,10\}\%\), fictitious default \(n\le 3\), histogramme \(E(D)\), alerte Telegram `flatten|hold`. Replay CAPO : Ukemi se serait-il abstenu ?

**Ne pas.** Score 0–100, token, « oracle Aave ».

### Mode C — Cluster / fire-sale (Cifuentes, pas EN)

**L’idée.** Sur *un* marché (e-mode ETH, Morpho cbBTC/USDC), la cascade est un processus de branchement + impact de prix.

Garcia Seuma (août 2026) : 7 cascades perp 2022–2025 ; Oct. 2025 Hyperliquid, \(\hat\lambda \approx 0{,}1\)–\(0{,}2\) (**sous-critique**). Le mythe « cascade = criticité » est faux sur ce sample. Ukemi publie un **intervalle sur \(\lambda\)** et sur \(\Delta P\), pas « le système va exploser ».

Lehar–Parlour : liquidations → impact **même off-chain**. C’est le canal que Mode L doit avaler.

**Payeur.** Même que L, plus le curator Morpho d’*un* marché (Gauntlet pocket). Licence, pas un oracle global.

**MVP.** Un cluster, \(\Lambda\) empirique 90 j, intervalle de \(\Delta P\) pour \(Q\) liquidé. Branche L.

### Mode K — Keeper conformal (le hop)

DFS a le keeper. Toi tu as le **feu**. Ne pas cloner DFS. Si tu exécutes : Kessai (TCA) fait l’unwind, Ukemi ne fait que `commit`. Fee : 0,05 % *en plus* n’est pas un métier. Le métier = **ne pas trigger** sur un CAPO.

---

## 3. Composition flotte

```
Shōgen (prix bytes)     ─┐
Mokugeki (unlock / 8-K) ─┼─→  Prediction E(D)  →  Hikae  →  GateDecision
Narabi (si wrapping)    ─┤                         │
Koyomi (53 h)           ─┘                         ├─ Ukemi mode L : flatten loop
Cluster Λ (mode C)      ──┘                        └─ Kessai : exécute l’unwind
```

Genkan : `before_tool(loop|borrow|leverage)` appelle le même JSON. Pas un 2ᵉ moteur.

Kyokusen (PT) : le loop PT *est* un nœud de L. Ne pas dupliquer.

---

## 4. Faisabilité solo / argent

| Mode | Solo 30 j | Crowding | Capture 12 mois (ordre) | Verdict |
|---|---|---|---|---|
| **L loop-clearing** | oui (\(n\) petit, on-chain) | DFS = seuil, pas intervalle | $40–180 k si 1–3 desks loopers (bps / bonus évité) | **construire** |
| **C cluster Λ** | oui, 1 marché | dashboards Dune | bundled dans L | construire *après* L |
| K keeper | non (DFS août 2026) | Instadapp, Aave SVR | 0,05 % déjà pris | **ne pas** |
| Oracle systémique | non (données + gouvernance) | Chaos/Gauntlet/LlamaRisk | SP à perte ($5 M refusés) | **tuer** |
| Assurance | non (bilan) | Nexus $7 Md | feed plus tard | **tuer** |
| MEV searcher | non | oligopole 89 % | leur argent | **tuer** |
| Cross-chain EN | non (mauvais modèle) | — | 0 | **tuer** |
| Dashboard DAO | non comme flagship | TokenLogic / Gauntlet | module si un trésorier paie | secondaire |

---

## 5. Biblio (ordre de construction du mode L)

### 5.A — Clearing (l’objet)

1. **Eisenberg, L. & Noe, T. H. (2001).** *Systemic risk in financial systems.* Management Science 47(2), 236–249. Point fixe, unicité, fictitious default.
2. **Rogers, L. C. G. & Veraart, L. A. M. (2013).** *Failure and rescue in an interbank network.* Management Science 59(4), 882–898. Coûts de défaut → **non-unicité**. Lis avant de publier « le » vecteur.
3. **Glasserman, P. & Young, H. P. (2016).** *Contagion in financial networks.* JEL / Oxford DP 764. Survey : ce qu’EN fait et ne fait pas.

### 5.B — Fire sale (le canal DeFi)

4. **Cifuentes, R., Ferrucci, G. & Shin, H. S. (2005).** *Liquidity risk and contagion.* BoE WP 264 / JEEA. Prix endogène.
5. **Lehar, A. & Parlour, C. A. (2022).** *Systemic fragility in decentralized markets.* BIS WP 1062. **$2,49 Md** liquidations, impact de prix. Le papier empirique du canal.
6. **Gatto, D. (2026).** *Liquidation without loss.* SSRN 7157638. \(LT(1+b)<1\) ⇒ bad debt protocole = 0 sur chemin continu ; \(D^*\), jumps. **Le papier qui calibre L.**
7. **Garcia Seuma, R. M. (2026).** *Measuring the engine of a liquidation cascade.* arXiv:2608.03616. \(\hat\lambda \approx 0{,}1\)–\(0{,}2\). Ne pas vendre la criticité.

### 5.C — Le loop comme graphe

8. FC26 (2026). *Structural shift in DeFi lending.* Aave+Spark, 65 % / 15 %.
9. Bank of Canada (2026). Recursive leverage > 20 % Aave V3 2023–2025.
10. Spark glossary — recursive lending (mécanique géométrique).

### 5.D — Décision / flotte

11. **Gibbs & Candès (2021).** ACI — \(E(D_t)\) non-stationnaire.
12. **Chow (1970).** Reject option = `abstain` (CAPO).
13. README MONARK — `CoverageVerdict`, `GateDecision`, B_t.
14. DeFi Saver, 10 août 2026 — Liquidation Protection 105/110, 0,05 %. **Le concurrent à ne pas cloner.**
15. Chaos Labs, 6 avr. 2026 — sortie Aave, $5 M, CAPO $26,9 M. **Le payeur SP à ne pas chasser.**

**MVP L :** papiers 1 + 6 + 14. Rogers = avant toute publication d’un vecteur unique. Cifuentes/Lehar = mode C. Ne pas HJM, ne pas DebtRank (Battiston : c’est un score).

---

## 6. Falsification

Mode L meurt si, sur 12 mois de loops e-mode, un seuil 105 % (DFS) a le même shortfall *et* le même taux de faux positifs que l’intervalle (alors le conformal ne paie pas).  
Ne meurt pas si Gauntlet publie un « cascade score ».
