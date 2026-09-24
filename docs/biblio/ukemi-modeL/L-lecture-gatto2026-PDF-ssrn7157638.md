# Lecture PDF — Gatto (2026), SSRN 7157638 — « Liquidation Without Loss: A Live-Book Decomposition of Aave v3 »

## Identification
- **Auteur** : Daniel Gatto (*1), Universidade Paulista (UNIP).
- **Titre** : *Liquidation Without Loss: A Live-Book Decomposition of Aave v3*.
- **Date** : juin 2026. **SSRN** : 7157638. **Pages** : 52 (confirmé : 52 marqueurs form-feed `\f` dans le texte pré-extrait, comptés octet par octet).
- **PDF** : `F:\Monark\docs\biblio\ukemi-modeL\pdf\gatto2026-ssrn-7157638.pdf`.
- **sha256** (recalculé par moi via `certutil -hashfile ... SHA256`) : `038706df7b786164266ef92fa6c8885deafd4b2beae7be7725e469643f6e5d65` — **CONFORME** à la valeur attendue par la mission. Identification positive : ce PDF est bien l'article attendu (titre, auteur, SSRN, date concordent avec l'en-tête p.1).
- **Texte pré-extrait** : `F:\Monark\docs\biblio\ukemi-modeL\_txt\gatto2026-ssrn-7157638.txt` (2554 lignes, `pdftotext -layout`). Lu intégralement (totalité des 52 pages), plus **une page en image** (p. 40, Figures 9-10) pour lever une ambiguïté de graphique (cf. Q11) — seul rendu-image de toute la lecture, conforme doc 03 §6.
- **Méthode de pagination** : chaque `\f` (0x0C) est le **premier caractère de la première ligne de la page suivante** (vérifié par script Python sur les 52 occurrences : contexte avant = vide, `\f` puis texte immédiatement). Formule utilisée : `page(ligne n) = 1 + (nombre de marqueurs \f à une ligne ≤ n)`. **Validée par recoupement à 9 reprises indépendantes** contre (a) les numéros de page imprimés en pied de page (ex. ligne 1210 = pied « 25 », ligne 1680 = pied « 34 » — Table 14, Table 15 et le §14 tombent bien tous les trois sur la même page imprimée 34 ; page 40 confirmée par rendu-image, pied « 40 » visible) et (b) la table des matières elle-même (Annexe A→p.45, B→p.46, C→p.47, D→p.48, E→p.49, Section 2→p.6, Section 3→p.7, Section 4→p.8, Section 7→p.16, Section 15→p.35, Section 16→p.41, Section 17→p.42 : concordance exacte dans tous les cas testés).
- **Modèle résolu** : `claude-sonnet-5`, effort **max**.
- **Niveau global** : **[lu]** — texte intégral lu (introduction, related work, data/méthodologie, les 5 parties, les 19 tableaux, les 10 figures, les 5 annexes A-E, les 30 références). Aucun passage laissé en [abs].
- **Note de discipline** : toutes les citations verbatim ci-dessous sont ≤ 25 mots (comptées une à une) ; au-delà, l'information est restituée en discours indirect (paraphrase signalée, sans guillemets), avec page exacte dans tous les cas.

---

## Q1 — « $47M at 10% » et « $0.1M at 5% » : révision du verdict « absent de Gatto »

**Le chiffre EXISTE dans le PDF, verbatim, dans l'abstract, PAGE 1** (avant le premier saut de page) :
> « a discrete price gap (a jump no liquidator can step through) books $0.1M at a 5% gap but $47M at 10% » — p. 1, abstract. (21 mots)

C'est la phrase exacte citée par la mission. Recherche exhaustive (`grep` sur les 2554 lignes, motifs `47M`, `\$47`, `0.1M`) : **ces deux valeurs n'apparaissent NULLE PART AILLEURS dans les 52 pages** — ni dans Table 9 (le tableau que la mission suppose être la source), ni dans aucune autre table, figure ou paragraphe du corps.

**Table 9** (« Sizing the channels that break the continuous path », **page 26**, colonne « gap risk (cf 1.0, deep pool) », normalisée **« per $100M-scale loop »** — précision de la légende, p. 26) donne pour la paire e-mode LT 0.95 : 2 %=$0, 5 %=$0, 8 %=$0.58M, 12 %=$4.54M, 20 %=$12.46M, 35 %=$27.31M ; pour la réserve LT 0.81 : 5 %=$0, 8 %=$0, 20 %=$2.69M, 35 %=$16.84M. **Aucune ligne à 10 % de gap, aucune valeur $47M ou $0.1M.** Le paragraphe en prose juste avant (p. 25) confirme cette même grille en substance (paraphrase, pas de guillemets) : le loop e-mode ne porte rien à 5 % de gap, $0,58M à 8 % (0,6 % de la dette), et monte à $12,5M (14 %) à 20 % — pas de point à 10 %.

**Révision explicite à porter** : le verdict de la lecture web (« absent de Gatto », `L-lecture-gatto2026-garciaseuma2026.md` §Chiffres, ligne 6) est **inexact pour le PDF** : la phrase existe verbatim, page 1. Mais il faut nuancer en trois temps, pas juste « présent » : (a) présent **uniquement dans l'abstract**, à l'échelle du **cluster réel** (« we size each channel on the live cluster », p. 1 — 8 mots) — pas normalisé « per $100M-scale loop » comme Table 9 ; (b) **absent du corps et de Table 9 elle-même** sous cette forme exacte (grille et échelle différentes) ; (c) donc « absent de Gatto » était faux pour le PDF (texte introuvable sur la page web) mais reste **littéralement vrai pour la page web** — les deux lectures ne se contredisent pas, elles portent sur deux supports différents.

**Tentative de réconciliation arithmétique (MON calcul, PAS un chiffre du papier, à ne pas citer comme [lu])** : le cœur pur-loop porte $1,36 Md$ d'éligible (p. 1, p. 18) ≈ 13,6× un loop de $100M. En mettant à l'échelle la colonne e-mode de Table 9 (×13,6), les points encadrants donneraient environ $7,9M à 8 % et $61,7M à 12 % — un point interpolé à 10 % dans cette fourchette convexe est compatible en ordre de grandeur avec $47M, sans le reproduire exactement (et le $0 exact à 5 % dans Table 9 ne peut pas, par construction, remettre à l'échelle vers $0,1M). Ceci est une hypothèse de réconciliation, **non vérifiée**, pas un fait du papier — niveau **[abs]** au mieux, à traiter comme piste, pas comme preuve.

**Niveau** : [lu] pour la localisation exacte (p. 1, abstract) et l'absence ailleurs (grep exhaustif [lu]) ; [abs]/spéculatif pour toute tentative de réconciliation avec Table 9.

---

## Q2 — Invariant LT(1+b) < 1

**Énoncé exact** (p. 20-21, paraphrase des deux régimes, pas de guillemets pour rester sous 25 mots) : le signe de LT(1+b) − 1 sépare les loops en deux régimes — si LT(1+b) < 1, le loop se liquide comme du volume pur sur une bande propre [f_HF, f_exh] avant toute perte (p. 20) ; si LT(1+b) > 1, la mauvaise dette commence dès que le loop devient liquidable (p. 20).

**Généalogie** (important, absent de la lecture web) : la condition de solvabilité au tour unique **1 − LT(1+b) > 0 n'est PAS originale à Gatto** — elle est explicitement créditée à **Qin et al. (2021)** [réf. 4, IMC 2021, arXiv:2106.06389] :
> « The single-round solvency condition 1 − LT(1+b) > 0 is due to Qin et al. [4] » — p. 41, Discussion. (17 mots)

La suite (paraphrase, p. 41) : la contribution propre de Gatto n'est pas cette condition, mais son extension à une borne multi-tours en chemin continu — c'est-à-dire étendre la condition ponctuelle à l'échelle du book et dériver la borne D multi-tours (Q3).

**Hypothèses** (explicites, p. 20-23) :
- **Chemin continu** : le résultat "$0" suppose un glide continu, pas un saut discret — c'est précisément ce qui est relâché dans les 4 canaux (Q5).
- **Close factor** : le résultat $0 est **robuste** au close factor tant que le chemin reste continu et le pool profond : « cf=1.0 glide gives the same $0 through 30%, and cf=0.5 versus cf=1.0 single-shot differ by under 0.1% » (p. 23 — 24 mots). Le close factor ne devient déterminant qu'une fois le chemin cassé (canal « partial liquidation into a finite pool »).
- **Catégorie e-mode, pas réserve** : chaque loop est liquidé sous le bonus de **sa catégorie e-mode** (lu depuis le contrat Pool), pas le bonus de la réserve sous-jacente : « a reader who mistook the 6% reserve bonus for the category bonus would compute LT(1+b) = 1.007 and a spurious zero-buffer D = 3.5% » (p. 20-21 — 25 mots, limite). Piège explicitement nommé par l'auteur lui-même.

**Valeur 0,9595** (p. 1, 18, 20, 21, 25, 26, 41, 42, 49…) : paire e-mode ETH-corrélé, LT 0,95 × bonus catégorie 1 % = **LT(1+b) = 0,9595 < 1**.

**Seuil de bonus 5,26 %** (p. 1, 18, 20, 21, 42, 43) : « reaching the loss-on-crossing regime would require a bonus above 5.26%, five times what Aave sets » (p. 1 — 15 mots). Vérification arithmétique (mienne, cohérente) : 1/0,95 − 1 = 5,263…%.

**wstETH réserve (≠ e-mode)** : LT 0,81 × bonus réserve 1,06 (6 %) = **0,859** (p. 21 : « the wstETH reserve is 0.81 × 1.06 = 0.859 < 1 » — 12 mots). **Ce n'est pas une catégorie e-mode** — le papier distingue systématiquement « e-mode category » et « reserve ».

**Les « huit catégories e-mode »** — **pas de tableau dédié imprimé qui les énumère toutes.** Le papier affirme en prose (p. 21, renvoi « Section 3 ») : « all eight live e-mode categories carry LT(1+b) between 0.876 and 0.960 » (12 mots) — repris identique p. 18 (Section 3), p. 42 (Discussion), p. 43 (Limitations iv). **J'ai vérifié Section 3 (p. 7, intégralement lue) : elle ne contient PAS cette énumération** (elle liste le panier RMT à 29 actifs et la classification ETH-class/BTC-class/STABLE/ALT à 66 réserves pour le moteur de stress — un classement différent des « e-mode categories » d'Aave). Seules **3 catégories e-mode sont nommées explicitement avec LT/bonus** (Table 6, p. 22, dans sa légende) : ETH-corrélé (LT 0,95, bonus 1 %), stablecoin (LT 0,92, bonus 4 %), BTC (LT 0,86, bonus 3 %) — plus la réserve wstETH (0,81/6 %, hors e-mode). Les données des 8 catégories existent comme **artefact non imprimé** `emode_categories.json` (référencé dans l'inventaire d'artefacts, Table 18, p. 48) mais ne sont pas reproduites en table dans le papier. **NON TROUVÉ (tableau imprimé des 8 catégories)** — à ne pas confondre avec le [0,8586 ; 0,9595] rapporté par la lecture web (voir « Révisions »).

**Niveau** : [lu] pour tout ce qui précède, sauf l'énumération complète des 8 catégories = **NON TROUVÉ** dans le texte imprimé.

---

## Q3 — Borne D = max{1 − 1/HF0, 1 − (1+b)LT/HF0}

**Formule exacte** (notation propre, p. 1 abstract, p. 18, p. 41, p. 49) :
D = max( 1 − 1/HF₀ , 1 − (1+b)·LT/HF₀ )

**Dérivation** (Section 9, **p. 20**) : pour un loop pur de levier L = C/(C−D), HF₀ = LT·L/(L−1) ; f_HF = 1 − (L−1)/(L·LT) [seuil d'éligibilité, HF atteint 1] ; f_exh = 1 − (1+b)(L−1)/L [seuil d'épuisement, la saisie majorée du bonus n'est plus couverte]. D = le plus grand des deux — la perte ne peut pas commencer avant que le loop soit même liquidable (paraphrase, p. 20). Le régime LT(1+b) < 1 signifie que le loop liquide comme volume pur sur toute la bande [f_HF, f_exh] avant toute perte.

**D* = 7,4 % — ancre** (p. 18, p. 20, p. 41, Table 6 p. 22) : pour le loop e-mode vivant à 12× de levier, LT 0,95, HF₀ = 1,0364 : « it is liquidation-eligible at f_HF = 3.5% but does not begin losing until D = f_exh = 7.4% » (p. 20 — 17 mots), soit une bande solvable de 3,9 points. Table 6 (p. 22, colonne « D engine ») confirme 7,42 % analytique vs 7,42 % moteur pour cette ligne (« live e-mode anchor (bold) »).

**Médiane 6,9 % / 8,8 % pondérée dette** (p. 18) : « D = 7.4%, and its median across the live slice is 6.9% (8.8% debt-weighted) » (p. 18 — 15 mots).

**Table 6** (« The breakpoint D from (3), analytic versus the cascade-engine onset », **page 22**) — 8 lignes, chaque paire (LT, bonus) « that Aave actually pairs with that threshold » (p. 22 — 8 mots) :

| LT (bonus) | levier | HF₀ | D analytique | D moteur | régime |
|---|---|---|---|---|---|
| 0,95 (1%) | 5× | 1,1875 | 19,20% | 19,22% | solvent-buffer |
| 0,95 (1%) | 8× | 1,0857 | 11,62% | 11,64% | solvent-buffer |
| 0,95 (1%) | **12×** | **1,0364** | **7,42%** | **7,42%** | solvent-buffer (ancre, en gras) |
| 0,95 (1%) | 15× | 1,0179 | 5,73% | 5,74% | solvent-buffer |
| 0,92 (4%) | 8× | 1,0514 | 9,00% | 9,02% | solvent-buffer |
| 0,92 (4%) | 12× | 1,0036 | 4,67% | 4,68% | solvent-buffer |
| 0,81 (6%) | 4× | 1,0800 | 20,50% | 20,52% | solvent-buffer |
| 0,81 (6%) | 5× | 1,0125 | 15,20% | 15,22% | solvent-buffer |

« The closed form matches the engine to one grid step (±0.02%) everywhere » (p. 22, légende Table 6 — 11 mots) — c'est le « one grid step » cité par la mission, confirmé littéralement.

**Note** : les 8 lignes de Table 6 ne couvrent que 3 paires (LT,bonus) distinctes (0,95/1% ×4 leviers ; 0,92/4% ×2 ; 0,81/6% ×2) — la paire « BTC e-mode LT 0,86/3% » nommée dans la légende de Table 6 comme un des couples qu'Aave « pairs » n'a **aucune ligne de données** dans le tableau imprimé (mentionnée pour information, non modélisée dans cette table).

**Niveau** : [lu], toutes valeurs vérifiées avec page exacte.

---

## Q4 — Décomposition éligible ≠ exécuté ≠ bad debt (Table 4, page 18)

**Table 4** : « The live loop cluster (236 positions, $2.19B) down a continuous 5%-20% de-peg » (p. 18, légende abrégée — 13 mots) — source `headline_liveslice.json`.

| de-peg | eligible debt | repaid (executed) | seized collateral | fully closed | protocol bad debt |
|---|---|---|---|---|---|
| 2,0% | $174,3M | $87,1M | $89,3M | 0 | $0 |
| 3,5% | $1 124,4M | $562,2M | $583,7M | 0 | $0 |
| **5,0%** | **$1 356,9M** | **$691,3M** | **$720,2M** | 0 | $0 |
| 10,0% | $2 118,4M | $1 492,4M | $1 594,9M | 0 | $0 |
| 20,0% | $2 177,8M | $2 090,7M | $2 294,5M | 0 | $0 |

La ligne à 5 % confirme exactement les chiffres de la mission : **1,3569 Md$ éligible → 0,6913 Md$ repaid → 0,7202 Md$ seized** (arrondis dans l'abstract p. 1 à « $1.36B … $0.69B … $0.72B »). **Zéro position totalement fermée à toute profondeur** — « no position fully closes, and the protocol books $0 throughout » (légende Table 4, p. 18 — 10 mots) ; à 5 %, 170 appels de liquidation partielle, zéro position totalement fermée (paraphrase, p. 18) — d'où la formule de l'auteur : « "removed" is the wrong verb, "partially liquidated and re-buffered" is right » (p. 18 — 11 mots).

**Close factor utilisé — précision importante non triviale** : le papier modélise le close factor comme une fraction fixe de la dette courante — « the Aave rule: the maximum liquidatable per call is current_debt × close_factor » (p. 8 — 12 mots) ; à la Table 4/5% c'est **cf = 0,5** (p. 18). Mais **Limitation (x)** (p. 44) déclare explicitement (paraphrase, la citation complète dépasserait 25 mots) que ce cf statique est **la règle Aave v2**, pas la règle Aave v3 réelle qui promeut le close factor à 100 % sous un facteur de santé de 0,95 — le fragment exact retenu : « the Aave-v2 rule » (p. 44, 3 mots). Conséquence assumée par l'auteur (paraphrase, p. 44) : la mauvaise dette de liquidation partielle rapportée est une **borne supérieure** pour ces positions par rapport à la clôture unique à 100 % d'Aave v3 — mais aucun chiffre-titre n'en dépend (le tableau-titre tourne en pool profond où le close factor est sans effet).

**Le « 1,76 % mixed-collateral remainder »** (p. 18) : le chiffre-titre $1,381 Md$ (« LST-heavy slice », 1 437 positions, $2,739 Md$) est **plus large** que le cluster pur-loop modélisé (236 positions, $1,356944 Md$ de cet éligible à $0 bad debt). « The unmodeled remainder is $24,303M, 1.76% of the headline » (p. 18 — 10 mots) : positions à collatéral mixte dont les jambes non-staking portent leurs propres paramètres de réserve ou d'e-mode (paraphrase). L'auteur ne fait PAS tourner ce reliquat sous ses paramètres exacts par position — il le déclare explicitement **non modélisé** (paraphrase, p. 18) : le moteur ne fait pas tourner ces comptes sous leurs paramètres exacts par collatéral ; la revendication stricte du $0 vaut pour le cœur pur-loop de $1,357 Md$, et le reliquat de $24M est **« disclosed rather than folded in »** (p. 18, 5 mots).

**Niveau** : [lu], intégral, page unique (18) pour Table 4 et sa légende.

---

## Q5 — Les canaux qui cassent le chemin continu (Table 9, page 26)

**Précision préalable, importante** : Gatto énumère lui-même, deux fois (Contributions p. 5 et p. 18-19), **quatre canaux canoniques** : (1) price gaps, (2) oracle staleness, (3) partial liquidation into a finite pool, (4) **reflexivity** (= Table 10, traitée en Q6). La « profondeur secondaire (30M$→0,70Md$) » que la mission liste comme un 4ᵉ canal séparé **n'est pas un canal distinct** dans la structure propre de l'auteur : c'est un **approfondissement du canal (3)**, qui étudie comment la magnitude de la perte varie avec la profondeur du pool (infini → $1Md$ → $2Md$), pas un mécanisme différent. Et **Table 9 elle-même ne couvre que 3 des 4 canaux** (gap, lag oracle, partial-dans-pool-fini) ; le 4ᵉ (reflexivity) est Table 10, sur une autre page. Je donne les chiffres demandés avec leur table et condition exactes, en corrigeant cette attribution :

**Table 9** (« Sizing the channels that break the continuous path… Loops at the live cushion HF0 = 1.0364; figures are per $100M-scale loop », **page 26**) :

| profondeur | gap risk, e-mode LT 0,95 (deep pool) | gap risk, réserve LT 0,81 | lag oracle (gap fixé à 8%), e-mode | partiel cf=0,5, pool $2Md$, e-mode |
|---|---|---|---|---|
| 2,0% | $0 | $0 | — | (5% gap) $3,01M |
| 5,0% | $0 | $0 | none → $0,58M | (8% gap) $5,51M |
| 8,0% | $0,58M | $0 | +31bp médiane → $0,86M | (12% gap) $8,87M |
| 12% | $4,54M | $0 (« holds $0 through a 17% gap », p. 25 — 8 mots) | +159bp p95 → $2,03M | (20% gap) $15,70M |
| 20% | $12,46M | $2,69M | +500bp queue → $5,13M | — |
| 35% | $27,31M | $16,84M | — | — |

1. **Gap discret** (colonne « gap risk », pool profond, cf=1,0) : condition = saut de prix instantané, pas de continuité — « no liquidator can act between the healthy price and the post-gap mark » (p. 25 — 13 mots). Chiffres ci-dessus.
2. **Pool fini $2Md$, partiel** (cf=0,5) : condition = close factor <1, plusieurs tours, chaque vente déprime le prix du tour suivant — **$3,01M à 5 %** (mission), $5,51M à 8 %, $8,87M à 12 %, $15,70M à 20 %. « This is the channel that bites soonest and hardest » (p. 25 — 10 mots) — confirmé aussi en Limitations p. 43.
3. **Staleness juin 2022** (colonne lag oracle, gap maintenu à 8 %) : condition = l'oracle Chainlink ETH/USD reste haut alors que le marché DEX a déjà bougé — mesuré sur l'épisode réel : « median +31.4 bp at liquidations, p95 159 bp, max 4607 bp » (p. 25 — 11 mots), avec un p95 d'écart de mise à jour d'environ 49 minutes (paraphrase). Effet à 8% de gap : $0,58M(sans lag)→$0,86M(médiane)→$2,03M(p95)→**$5,13M (queue à 5% de staleness profonde)** — la mission dit « jusqu'à 5 M$ à 8% », qui correspond au scénario-queue $5,13M, arrondi $5M dans l'abstract (p. 2).
4. **Profondeur secondaire** (Section 9 « Depth sets the magnitude », **page 21**, PAS Table 9) : pour un cluster dispersé de $2 Md$ (HF₀∈[1,02;1,30], LT 0,95, bonus 1 %), le papier rapporte (p. 21, données extraites, pas une citation continue) que le seuil de conversion tombe de 6,05 % (profondeur infinie) à 2,10 % une fois le pool fini, et que la perte réalisée à un gap fixe de 15 % s'élève de **$30,2M (profondeur infinie) à $695,7M (pool à $1 Md$)**. Repris arrondi dans l'abstract (p. 1-2, « $30M … $0.70B … 15% gap ») et dans la légende de la Figure 5 (**page 24**) : « the magnitude rises from $30M to $0.70B at a $1B pool » (11 mots). Condition exacte : gap discret fixé à 15 %, on fait varier la profondeur du pool secondaire de l'infini à $1Md$.

Un chiffre-frère à noter : Table 8 (« conversion side », **page 25**) fait tourner un **glide continu** (pas un gap) sur un cluster dispersé $2,74 Md$ de collatéral dans un pool fini $2Md$ : la perte converge à **$203M** (« $549M at a coarse 100-step grid, converging to $203M at 200 steps », p. 24-25 — 12 mots) — chiffre différent des $30,2M-$695,7M car la condition diffère (glide continu à profondeur de pool fixe, vs gap discret à 15% à profondeur de pool variable).

**Niveau** : [lu], toutes valeurs et conditions vérifiées avec page exacte.

---

## Q6 — De-peg réflexif (Table 10, page 27)

**Table 10** : « Reflexive (endogenous-peg) protocol bad debt on the live pure LST-loop cluster » (p. 27, légende abrégée — 11 mots) — 236 loops, $2,19 Md$, HF0 médian 1,03, LT 0,95, D médian 6,9 %.

**Mécanisme** (p. 26-27, Section 9.1) : la vente forcée du wstETH saisi déprime elle-même le ratio wstETH/ether (le « peg »), ce qui re-margine le collatéral de tous les autres loops et en pousse davantage sous leur seuil — la boucle toxique de liquidation [1, 6] se referme ici de façon endogène sur le cluster LST vivant (paraphrase, p. 26). Modélisé comme un **point fixe** : le wstETH saisi cumulé est vendu dans un pool wstETH/ether étiqueté, son impact à produit constant (x·y=k, même loi que le noyau de cascade) approfondit le peg, et la boucle itère jusqu'à convergence (p. 26).

**Deux régimes (Table 10)** :
- **Frozen** (pas de backstop de rédemption, style juin-2022) : « a shock past the most-levered loop's 0.19% trigger ignites a runaway peg collapse to a trough of 3% of par » (p. 27 — 23 mots) — le pool est inerte sous ce seuil. **Pourquoi $0 malgré 97% de dé-peg** : « yet the protocol's protocol bad debt stays $0 » (p. 27 — 8 mots), parce que chaque loop e-mode ETH-corrélé (LT(1+b)=0,9595<1) est retiré à son propre franchissement solvable de HF=1 avant que le peg ne le dépasse (paraphrase, p. 27) — c'est le même invariant de chemin continu (Q2) appliqué au cas endogène. Convergence par pas : $0 du pas 5×10⁻³ jusqu'à 5×10⁻⁵ (paraphrase, p. 27). La profondeur du trough dépend du pool choisi (un pool à $2Md$ creuse près de 91 %, soit 9 % du pair, paraphrase p. 27) — hypothèse étiquetée, balayée, pas mesurée sur un pool réel.
- **Live** (rédemptions actives, book actuel 2023+/2026) : « the redemption arbitrage caps the de-peg below the runaway region, so the realized loss is $0 across the 1-3% caps » (p. 27 — 20 mots).

**« Redemption queue frozen »** — phrase exacte trouvée dans l'**abstract, page 2** (pas dans Table 10 elle-même, qui utilise « Frozen (no redemption backstop, June-2022 style) ») : « runs the peg to near-total collapse with the redemption queue frozen, yet still books $0 because the loops exit solvent as the peg runs away » (p. 2 — 25 mots, limite).

**« A live withdrawal backstop is the control, not the threshold »** — phrase exacte, **page 2** (abstract, 10 mots) ; reprise en substance p. 27 (corps, Section 11) : les contrôles opérationnels sont le plafond d'offre et une file de retrait vivante, pas LT (paraphrase, p. 27).

**Niveau** : [lu], Table 10 lue intégralement avec sa légende et ses deux paragraphes de régime (p. 26-27).

---

## Q7 — Les épisodes réels : attribution de table à corriger

**Précision préalable, importante** : Table 7 (« Multi-episode validation », **page 23**) contient exactement **trois lignes**, mais ce ne sont PAS celles énumérées par la mission — ce sont : (1) stETH/ether juin 2022, book pré-événement (−6,8%) ; (2) stETH/ether juin 2022, reconstruction par reçus (−7,8%) ; (3) USDC mars 2023, contrefactuel (−12,1%). **CAPO n'est PAS une ligne de Table 7** — c'est un précédent **cité** (réf. [18]), pas un des « event reconstructions » propres à l'auteur. Les « event reconstructions » formelles de la Partie IV sont **CRV (Table 13), Venus (Table 14), USDC (Table 15)** — trois sections distinctes (12, 13, 14), pages 32-34.

**stETH/WETH Aave v2, juin 2022 (Table 7, page 23)** : book pré-événement reconstruit à l'état archivé (bloc 14 881 677, 2022-06-01), descendu le long du vrai chemin de peg stETH/ether réel (par → creux 0,9322, **profondeur −6,8%** implicite du ratio Curve). Au creux réel : 3 loops touchent HF=1, aucun ne se ferme totalement (3 événements de liquidation), 7 006 WETH de dette affectée, 3 572 ETH de remboursement réel (**$4,29M** de flux à ≈$1200/ETH), **perte protocole $0** sur le chemin continu (p. 23). Variante reconstruction-par-reçus (n=1168, $87,9M de volume reconstruit) : même conclusion $0 (p. 23).

**USDC mars 2023 (pin, Table 15, page 34)** : lors du dé-peg de mars 2023, l'oracle d'Aave a figé USDC à $1 au lieu de suivre le prix de marché jusqu'à son creux de $0,8789 (−12,11 %) (paraphrase, p. 34). Contrefactuel (bloc 16 811 000) : 1 638 emprunteurs v3 recensés, 1 205 actifs-avec-dette, 202 détenteurs de collatéral USDC ($41 732 739), $235,12 déjà liquidable au pin (≈0), **26 positions** franchissent HF<1 dans le contrefactuel, **$332 443** de dette protégée par le pin. Calibration exacte : 116 liquidations v2 / 11 v3 reproduites. Portée : Aave **v3 seulement**, v2 non énuméré (p. 34).

**CAPO mars 2026 — $26M — source primaire citée = réf. [18], PAS la [lu direct]** : phrase reprise plusieurs fois (abstract p.2, Contributions p.5, Discussion p.41, Conclusion p.42-43, et la référence elle-même p.51) : « the March-2026 Aave CAPO event liquidated $26M of wstETH e-mode with no protocol bad debt » (p. 2 — 15 mots). **Référence [18] (page 51)**, en substance (paraphrase, la citation intégrale dépasserait 25 mots) : événement de liquidation par oracle CAPO d'Aave du 10 mars 2026, environ $26M de positions wstETH e-mode liquidées sur une mauvaise configuration d'oracle CAPO, utilisateurs affectés remboursés ; source = post-mortem Chaos Labs + couverture CoinDesk/The Block des 10-11 mars 2026. Fragment exact retenu : « with no protocol bad debt and affected users reimbursed » (p. 51, 9 mots). URL : https://www.theblock.co/post/393121/aave-oracle-glitch-wsteth. **Ceci est un [2nd] pour Gatto lui-même** — il ne le reconstruit pas, il le cite : chaque instance chiffrée antérieure qu'il trouve, CAPO inclus, est une comptabilité forensique rétrospective après incident, pas une figure de stress sur un book vivant non perturbé (paraphrase, p. 5). **Important pour ADR-M020/PR-UK-3** : la source que Gatto cite est **Chaos Labs (post-mortem) + presse (CoinDesk/The Block)** — **pas** les threads governance.aave.com 24269/24275 identifiés comme primaires par l'avis advisor-DeFi (PR-UK-3). Ce sont deux filiations de sources différentes pour le même événement, toutes deux [2nd] par rapport à notre propre lecture.

**Aave-CRV nov. 2022 (Table 13, page 32)** : CRV emprunté 92 000 000, CRV remboursé par liquidation 89 613 602, résidu (recensement) 2 386 398 (unités CRV, données extraites, p. 32) ; valorisé au prix de crash $0,69337 → **modeled bad debt $1 654 663** vs **realized anchor $1 600 000** → **point error 3,42%**, bande à 90% [0,90×, 1,07×] soit [$1 432 627, $1 705 930], far-edge error 10,46% (386 tirages de valorisation, B=5000 bootstrap). Confirme exactement « 3,42%, 1,65M$ » de la mission.

**Venus (BSC, mai 2021) (Table 14, page 34)** : défaillant primaire 0xef0442… détenait 1 987,90 BTC + 6 411,07 ETH, valorisés $96 998 711 aux prix du 19 mai (BTC $39 550,93, ETH $2 866,19) — match à 0,51% de l'ancre de presse $97,5M ($95-100M). Chiffre protocole-large (13 comptes défaillants XVS) rapporté honnêtement à côté : **$114 199 077** (~17% au-dessus du point médian). Méthode : reconstruction par événements, pas par état (le RPC archive BSC gratuit ne sert pas l'état 2021, paraphrase p. 8) — 4 455 LiquidateBorrow, 1 667 Borrow, 3 995 vXVS saisis, via Bitquery — limitation explicitement déclarée (p. 8, p. 42-43).

**Niveau** : [lu] pour toutes les valeurs et pages ; [2nd]-pour-nous explicitement signalé pour le chiffre CAPO (Gatto cite Chaos Labs/presse, pas une reconstruction propre) et pour le chiffre Venus (« press anchor », presse non nommée directement au point de citation mais rattachable à The Block via Related Work p. 7, réf. [27]).

---

## Q8 — Pré-enregistrement et règles de significativité (Appendix C, page 47) ; Table 3 (page 16)

**Table 3** (« Permutation null on the overstatement ratio », **page 16**) — donnée complète :

| schéma | préserve | perm-R médiane | perm-R p95 | p(R) | p(D) | verdict |
|---|---|---|---|---|---|---|
| S-A (plain class-shuffle) | taille/HF₀/mix marginals | 1,288× | 1,818× | 0,000200 | 0,000200 | SIGNIFICANT |
| S-B (size-stratified) | + taille×classe | 1,354× | 2,021× | 0,000200 | 0,000200 | SIGNIFICANT |

Statistique observée **R = 9,128×** (D = $207,1M à −5%, U = $1 890,2M) ; « the observed 9.128× sits far above both null distributions » (p. 16 — 9 mots) ; convention « (1+offset) » sur **M = 5 000 tirages par schéma** ⇒ p = (1+0)/5001 ≈ **0,000200** (plancher, aucun tirage permuté n'a égalé ou dépassé l'observé). **Règle de verdict pré-enregistrée** : SIGNIFICANT ssi p<0,05 sous les deux schémas (p. 16, redite Appendix C p. 47).

**Appendix C — « Pre-Registration and Significance Rules » — page 47** (confirmé par la table des matières ET par la formule de pagination : concordance exacte). Contenu (paraphrase, p. 47) : les schémas de permutation et leurs règles de verdict pré-enregistrées y sont résumés pour référence. Définit : S-A (mélange simple de l'étiquette de classe de dette, préservant taille/HF0/mix et fréquences de classe) et S-B (même mélange par décile de taille de dette, analogue bootstrap par bloc/stationnaire) ; M=5 000 tirages par schéma (plancher 1 000), unilatéral. Seuils de verdict pour les AUTRES tests de robustesse : **RMT** MATERIAL ssi écart médian dénoisé/brut >10% à une sévérité verrouillée quelconque (obtenu : jusqu'à 19,4%) ; **Venus** PASS ssi dans ±25% de l'ancre $97,5M (obtenu 0,51%) ; **CRV** resserre le PASS existant ; **LST** PASS (directionnel) ssi 56,3×>9,1× ET 0,504 vs 7,8×10⁻⁵ ; **USDC** = contrefactuel descriptif, pas de gate PASS/FAIL. La déflation effective-trials/DSR n'intervient qu'à l'assemblage (étape D6), jamais comme gate par cellule (Neff=1,40) — page 47-48 (la fin d'Appendix C déborde sur la page 48, juste avant le titre d'Appendix D).

**Ce qui est pré-enregistré** (Appendix B « Reproducibility », **page 47**, PAS Appendix C) : « Four strengthening tests (T1 permutation null, T2 RMT-denoised covariance, T3 two market-structure reconstructions, T4 LST-heavy slice) » (p. 47 — 16 mots), plus une sensibilité de bande CRV (paraphrase). Verrouillés (paraphrase, pas de citation continue pour rester sous 25 mots) dans `analysis-plan-locked-v2-strengthening.md`, dont le corps hache en sha256 `dce7b93d1958b86fb15514947321c6a9f0c448ce9bebb5e7916f373fa75946d5`, avec une date de verrouillage énoncée du **2026-06-09** (p. 47). Le plan original (« spine ») est verrouillé dans `analysis-plan-locked.md` (2026-06-04, sha256 non enregistré — cité par commit git, pas par hash) ; `calibration-window.md` (2026-06-04) fixe l'événement D8, le cutoff et la bande (p. 47). **Distinct des « gates » D0-D8/D8b** (D0 parité moteur, D1 calibration de slippage, D2 ajustement EVT, D3 régression de robustesse, D6 auto-déflation effective-trials, D8 back-validation stETH, **D8b = test confirmatoire ajouté le 2026-06-13, APRÈS le verrou T1-T4 du 2026-06-09, explicitement hors verrou** — l'auteur le présente comme tel, p. 23 et p. 38, paraphrase).

**Niveau** : [lu], intégral, pages 16 (Table 3) et 47-48 (Appendices B-C).

---

## Q9 — Données et réplication

**Bloc(s) utilisés — pluriel, plusieurs blocs différents selon l'analyse** (page 7, sauf mention contraire) :
- **Snapshot vivant principal** : bloc **25 253 205** (données de réserve : 17 419 emprunteurs actifs, $6,539 Md$ de dette) ; un second bloc **25 253 082** pour le multicall de composition/collatéral, avec une légère sur-récupération due au décalage prix/timing entre les deux pulls (paraphrase, p. 7) — **deux blocs proches, pas un seul**, un détail que ni la lecture web ni ADR-M020 n'avaient noté.
- **Univers de stress canonique** : filtre pleine-book **12 761 positions / $6,465 Md$** (dette>$1000, HF<5, champs finis, deux jambes de composition présentes) — c'est CE filtre qui alimente tous les tableaux-titres (p. 7-8). Variante plus large 12 826 positions/$6,5Md$ notée en marge, d'accord à <1% sauf à −40% (p. 8).
- **Panel à 7 blocs/dates sur 5 mois** (Table 2, **page 15**) — dates calendaires, pas des numéros de bloc : 2026-06-05 (ancre, $6,5Md$, 12 843 positions) ; 2026-05-29 ($7,3Md$) ; 2026-05-22 ($7,5Md$) ; 2026-05-08 ($8,2Md$) ; 2026-04-10 ($12,9Md$) ; 2026-03-13 ($12,6Md$) ; 2026-01-16 ($17,6Md$, 14 082 positions). Sert uniquement au test de persistance de la structure de loop (part 0,44–0,61), **pas** aux chiffres-titres. Le compte « 12 843 » de la ligne-ancre (même date visée que le snapshot principal) diffère légèrement de « 12 761 » du filtre canonique — deux pulls voisins, pas une incohérence (le papier le dit lui-même pour un cas analogue, p. 15).
- **Blocs historiques** : pré-événement stETH/WETH Aave v2 = bloc **14 881 677** (2022-06-01, p. 21) ; contrefactuel USDC = bloc **16 811 000** (2023, p. 34) ; Venus mai 2021 = **pas de bloc** (RPC archive BSC gratuit ne sert pas l'état 2021 → méthode events-based, p. 8).

**17 419 emprunteurs / 6,5 Md$** = le scan brut complet (« live scan », p. 7-8), à distinguer du filtre 12 761/$6,465Md$ (« stress universe ») — le papier insiste : « They are different filters, not inconsistent counts » (p. 8 — 7 mots).

**236 positions / 2,19 Md$** = cluster pur-loop (Table 4, p. 18) ; **1 437 positions / $2,739 Md$** = tranche LST-heavy plus large (Table 5, p. 19) — le cluster pur-loop est un sous-ensemble de la tranche LST-heavy (Q4, remainder 1,76%).

**Dépôt GitHub** : `https://github.com/DaruFinance/defi-param-stress` (p. 46, exact), structure `python/defi_param_stress/, rust/, acquisition/, parity/, fixtures/, ship/, preregistration/` (p. 46).

**Moteur** : « The hot kernel is Rust with a Python reference and a Numba sweep twin » (p. 8 — 14 mots) ; les trois sont numériquement équivalents avec une tolérance de 10⁻⁹ (paraphrase, p. 8) — écarts absolus maximaux observés : 2,3×10⁻¹³ (300 cas aléatoires), 9,1×10⁻¹³ (fixture de régression), 3,4×10⁻¹³ (sweep accéléré). Seed fixe **20260609** partout, un seul thread, BLAS épinglé (p. 46).

**Fournisseurs de données, avec divulgation de sponsoring à noter** : Bitquery (logs d'événements, énumérations d'emprunteurs) et CoinGecko Pro (marks de prix quotidiens) — « Bitquery and CoinGecko provided the API access used in this study as sponsors of the work » (p. 7 — 16 mots) ; un RPC de nœud public gratuit pour l'état archivé on-chain. Une source a échoué : le RPC archive BSC gratuit ne sert pas l'état 2021 (p. 8), forçant Venus en méthode events-based.

**Table 18** (« Figure provenance… each figure mapped to the on-disk artifact it is rendered from », **page 48** — 13 mots) : 9 des 10 figures sont des panneaux de données rendus depuis des JSON sous `acquisition/out/` ; Fig. 1 = diagramme TikZ autonome (pas de données) ; **Fig. 9 (D6) et Fig. 10 (EVT) sont explicitement rendues depuis les VRAIS artefacts** (`d6_result.json`, `d2_evt_result.json`), « not the illustrative Lab renders » (p. 48, 5 mots) — précision de transparence anti-fabrication ; les 2 panneaux RMT sont « illustrative and non-load-bearing, not reproduced here » (p. 48, 6 mots) ; Table 10 (reflexivité) vient de `reflexive_depeg.json`, produit par `acquisition/reflexive_depeg.py`, « single-thread, seed-free deterministic » (p. 48, 3 mots).

**Niveau** : [lu], intégral, pages 7-8 (données), 15 (Table 2), 46 (dépôt/déterminisme), 48 (Table 18).

---

## Q10 — L'oracle comme canal, les sources plafonnées, la liquidation partielle : rapport avec ADR-M020

**Convergence forte — liquidation partielle / re-buffering.** Table 4 (p. 18, Q4) montre, sur le book Aave v3 réel, **170 appels de liquidation partielle et zéro position totalement fermée à 5 % de dé-peg** : « "removed" is the wrong verb, "partially liquidated and re-buffered" is right » (p. 18, 11 mots). C'est un soutien empirique **indépendant** (moteur/données Aave réelles de Gatto) à la thèse ADR-M020 « eligible is not liquidated » et au constat M-2 (28/213 comptes liquidés plus d'une fois) : le re-buffering partiel est le régime **dominant**, pas un cas limite — deux sources indépendantes convergent.

**Convergence de haut niveau — « operative controls ».** Les leviers que Gatto identifie lui-même comme pertinents — « oracle-deviation and heartbeat bounds, supply caps, and the withdrawal backstop, not the liquidation threshold » (p. 2, repris p. 42-43 — 19 mots) — sont la même famille que ceux qu'ADR-M020 traite comme centraux (déviation d'oracle, heartbeat, sources plafonnées). Convergence de posture : les deux documents désignent l'oracle et les paramètres de marché secondaire, pas le seuil de liquidation, comme le vrai levier de risque.

**Silence — sources d'oracle plafonnées (adaptateurs à taux de change).** Recherche exhaustive sur les 52 pages (motifs `adapter`, `capped`, `CapAdapter`, `PriceCap`, `rate.provider`) : **zéro occurrence pertinente**. Les seules occurrences de « capped » concernent le **plafonnement de la saisie** au collatéral détenu par la position (p. 8 : « each round's seizure is capped against the collateral a position still holds », 12 mots ; p. 20, idée similaire) — un mécanisme de comptabilité de liquidation, **pas** l'architecture des sources de prix. Gatto ne mentionne **jamais** l'existence d'adaptateurs de taux plafonné (type `PriceCapAdapter`) pour les LST/LRT et les stablecoins, ni la distinction adaptateur-plafonné / flux de marché brut que l'AVIS-advisor-defi-bis établit par lecture on-chain directe (`AaveOracle.getSourceOfAsset` + `description()`). C'est un silence complet — la question n'est pas posée, ni a fortiori tranchée, dans ce papier.

**Tension non résolue (à ne pas trancher, à signaler).** Le canal réflexif de Gatto (Table 10, Section 9.1) **suppose implicitement** que le prix AMM secondaire (wstETH/ether) alimente l'oracle utilisé pour le HF : « the very wstETH the loops dump depresses the wstETH/ether ratio, which re-marks every loop's collateral » (p. 26 — 15 mots). Gatto ne vérifie pas on-chain quelle source de prix Aave v3 core utilise réellement pour wstETH — il traite la profondeur de pool comme une hypothèse étiquetée et balayée (paraphrase, p. 27), jamais comme une question de source d'oracle. Le constat on-chain indépendant de l'AVIS-advisor-defi-bis (hors Gatto) est que wstETH/weETH/rsETH utilisent chez Aave v3 core un « taux plafonné × ETH/USD », pas un prix de marché AMM brut. **Si ce constat est exact**, le mécanisme réflexif de Table 10, tel que modélisé, ne s'appliquerait pas directement à Aave v3 core sans un canal supplémentaire (ex. le taux plafonné devenant lui-même erroné/obsolète) — mais **Gatto ne teste ni n'affirme ni n'infirme cela** ; c'est une hypothèse de modélisation non vérifiée d'un côté, un fait mesuré ailleurs de l'autre. Je rapporte la tension sans trancher, comme demandé.

**Λ / cascade — silence terminologique, méthode différente.** Gatto n'utilise jamais le symbole Λ ni n'estime de coefficient de réflexivité à partir de flux de liquidation réels ; son modèle réflexif est une **simulation à point fixe** sous profondeur de pool étiquetée et balayée (pas mesurée sur un pool réel), par opposition à une estimation économétrique comme M-2/Garcia-Seuma. Silence terminologique et différence de méthode, à ne pas présenter comme équivalents.

**Niveau** : [lu] pour tout ce qui est confirmé présent (p. 2, 8, 18, 20, 26-27, 42-43) ; silence établi par grep exhaustif [lu] pour les adaptateurs plafonnés ; la tension modèle-vs-fait-on-chain est une observation de ma part, pas une affirmation du papier.

---

## Q11 — Limites déclarées et chiffres de tiers ([2nd] pour nous)

**Section 17 « Conclusion and Limitations », page 42-44** — onze points numérotés (i)-(xi), paraphrasés (pas de citation continue, pour rester sous 25 mots partout) :
- **(i)** p.42 : contrefactuel USDC scopé à v3 seulement (v2, plus grand, non énuméré) ; slippage Curve-3pool inutilisable (NaN).
- **(ii)** p.42 : CRV — slippage et valorisation = une **bande**, pas un point (résidu = recensement, robuste ; bande $0,616-$0,696 sur marks ±12h + ±5% capture).
- **(iii)** p.42-43 : Venus — events-based, pas state-based (RPC BSC gratuit ne sert pas 2021) ; ancre $97,5M elle-même une fourchette de presse.
- **(iv)** p.43 : le $0 est un invariant protocolaire ; les canaux sont les façons de le casser (reprend Q2/Q5/Q7, cite CAPO).
- **(v)** p.44 : le ratio de sur-affichage directionnel (6,53×) est une **convention de netting**, pas un résultat.
- **(vi)-(vii)** p.44-45 : RMT non porteur (panier bien conditionné, T/N=18,38) ; **EVT sensible au seuil** — bande 1-en-5-ans **−37 %/−68 %** (pas un IC sur le point à 5 ans, paraphrase p.40), stETH non ajustable (13 dépassements seulement), BTC instable d'une moitié d'échantillon à l'autre ⇒ **verdict de gate D2 = FAIL** (p. 38, p. 44) ; le chiffre-titre du book vivant utilise class-beta, pas EVT (paraphrase, p. 38, p. 44) — **l'EVT ne sert à AUCUN chiffre-titre du papier**.
- **(viii)** p.44 : portée mono-bloc + panel évolutif (dette totale $6,5-17,6Md$, 12 624-14 828 positions sur 5 mois) — persistance affirmée seulement pour la structure de loop, pas pour un chiffre en dollars.
- **(ix)** p.44 : les chiffres de stress sont des sorties de modèle sous un choc énoncé, pas des pertes réalisées.
- **(x)** p.44 : close factor = règle Aave v2 statique, pas la règle v3 réelle (détaillé Q4).
- **(xi)** p.44 : bad debt protocole nul ≠ coût économique nul (bonus payé aux liquidateurs, pertes aux emprunteurs liquidés, compensation DAO possible comme lors de CAPO).

**Figure 10 (EVT, page 40 — vérifiée par rendu-image, doc 03 §6, ambiguïté du texte extrait levée)** : ETH POT-GPD ξ=0,371, choc 1-en-1-an ≈ **−36,7 %**, choc 1-en-5-ans ≈ **−67,6 %** (bande −37%/−68% encadrant la grille de périodes de retour, pas un IC sur le point à 5 ans). **BTC** ξ=0,156, choc 1-en-5-ans ≈ **−31,1 %** (confirmé par lecture d'image — le texte pré-extrait brouillait l'attribution ETH/BTC sur ce graphique en raison de la mise en page du nuage de points), queue instable d'une moitié d'échantillon temporel à l'autre (paraphrase). Matrice de dépendance de queue χ(0,95) : ETH-BTC 0,69 ; ETH-stETH 0,96 ; BTC-stETH 0,73 (moyenne hors-diagonale ρ̄=0,795, p. 39, qualifiée « coherent », pilote l'échantillonneur de crash joint).

**Table 17 (RMT, robustesse non porteuse, pages 45-46)** :

| fenêtre | T | T/N | bord MP | val. propres signal | -5% | -10% | -20% | -30% | max |
|---|---|---|---|---|---|---|---|---|---|
| primaire 730j | 533 | 18,38 | 1,521 | 2 | -6,96% | -14,91% | -19,36% | -9,13% | 19,36% |
| sensibilité 90j | 90 | 3,10 | 1,198 | 6 | -7,64% | -22,91% | -8,98% | -9,27% | 22,91% |

Bêtas brut→dénoisé (730j) : wstETH 1,001→0,673 ; weETH 1,001→0,671 ; LINK 1,036→0,773 ; WBTC 0,526→0,411 ; AAVE 1,066→0,827 ; stables ≈0. Artefact fabriqué à -5% : p95 brut $208,5M vs p95 dénoisé **$795,7M** (médiane dénoisée $166,5M) ; restaurer la variance résiduelle des LST ramène le p95 dénoisé à $185,7M, confirmant l'artefact (p. 45).

**Chiffres du papier qui viennent d'un tiers = [2nd] pour nous** :
- **$26M CAPO** (réf. [18], Chaos Labs post-mortem + CoinDesk/The Block, p. 51) — détaillé Q7.
- **$276,71M, liquidation Aave en un jour, août 2024** (réf. [24], Chaos Labs, governance.aave.com — « Reports $276.71M liquidated in a single day with no accrued protocol bad debt », p. 51, 13 mots) — cité p. 5 comme second précédent réel de « volume sans bad debt », jamais reconstruit par Gatto lui-même.
- **$97,5M ($95-100M), ancre de presse Venus** (p. 33-34) — « the $97.5M anchor is itself a press range » (p. 43, 8 mots), rattachable à The Block via Related Work (réf. [27], p. 7) ; **attention** : le titre même de la réf. [27] (Igamberdiev 2021, The Block, p. 52) porte sur « $200 million in liquidations » — un chiffre de **volume total de liquidation**, distinct des $97,5M (résidu du défaillant primaire) et des $114 199 077 (bad debt protocole-large, 13 comptes) que Gatto utilise réellement : **trois nombres Venus différents, ne pas les confondre**.
- **stETH juin-2022, absence d'insolvabilité matérielle** attribuée à une mise à jour de gouvernance Aave de l'époque, documentée en réf. [19] (paraphrase, p. 35) — réf. [19] = Aave Governance forum, « Staked ETH and Aave Risk, June 11 Update » (2022, 7 mots, titre).
- Le partitionnement Gauntlet « Broad-Market-Downturn vs Broken-Correlation » [22] (p. 5-6) — méthodologie de praticien citée, pas vérifiée par les données propres de Gatto.
- La condition à un tour 1−LT(1+b)>0, due à **Qin et al. [4]** (Q2) — load-bearing pour la dérivation de Gatto mais **pas son résultat empirique propre**.

**Non rencontré dans Gatto (à noter pour ADR-M020)** : le chiffre « Lehar–Parlour 2,49 Md$ » cité dans le contexte d'ADR-M020 (§7 littérature) **n'apparaît nulle part dans les 52 pages de Gatto** — Gatto cite Lehar & Parlour [7] uniquement pour la **structure** de l'impact-prix à haute fréquence des liquidations sur DEX (paraphrase, p. 6), sans jamais reprendre un chiffre en dollars de leur papier. Si ce chiffre doit être sourcé, ce n'est pas via Gatto — il faut remonter à Lehar & Parlour eux-mêmes (BIS WP 1062 / SSRN 4164833, réf. [7] p. 50).

**Niveau** : [lu] intégral pour les limites et Table 17 (texte) ; [lu] avec vérification image (doc 03 §6) pour Figure 10 ; [2nd]-pour-nous signalé explicitement pour chaque chiffre tiers listé.

---

## Révisions à porter (avec la page qui le prouve)

1. **`L-lecture-gatto2026-garciaseuma2026.md` (ligne 6) et ADR-M020 (Contexte §3)** : « 47 M$ bad debt à 10 % (absent de Gatto) » → **à corriger** : présent verbatim dans l'abstract du PDF, **page 1** (« $0.1M at a 5% gap but $47M at 10% »). Absent de la page web (lecture antérieure, correcte pour son support) ET absent du corps/Table 9 du PDF sous cette forme exacte (Table 9, **page 26**, grille et normalisation différentes — « per $100M-scale loop », pas de point à 10 %). **PR-UK-7 d'ADR-M020 peut être clos avec cette formulation à trois volets**, pas un simple « présent »/« absent ».

2. **`L-lecture-gatto2026-garciaseuma2026.md` (ligne 10)** : « LT(1+b) ∈ [0,8586 ; 0,9595] sur 8 catégories » → **imprécis, probable conflation**. Le PDF (**page 21**) donne « between 0.876 and 0.960 » pour les 8 catégories e-mode ; **0,8586 (→0,859 arrondi) est la valeur de la réserve wstETH** (0,81×1,06), **explicitement hors e-mode** (p. 21). Correction à porter : « e-mode (8 catégories, p. 21) : LT(1+b) ∈ [0,876 ; 0,960] ; réserve wstETH (hors e-mode, p. 21) : LT(1+b) = 0,859 ».

3. **Toute mention future groupant CAPO avec « Table 7 »** (y compris la formulation de la mission de cette lecture) → à corriger : Table 7 (**page 23**) contient stETH(×2 lignes)+USDC seulement ; CAPO est **cité** (réf. [18], **page 51**), jamais reconstruit par Gatto ; les reconstructions formelles de la Partie IV sont CRV/Venus/USDC (Tables 13/14/15, **pages 32, 34, 34**).

4. **Toute formulation ADR future énumérant « les 4 canaux (Table 9) »** → à corriger : Table 9 (**page 26**) n'en couvre que 3 (gap, lag oracle, partiel-pool-fini) ; le 4ᵉ canal canonique de Gatto est la **réflexivité** (Table 10, **page 27**), pas la « profondeur secondaire » — celle-ci (Section 9, **page 21**, Figure 5 **page 24**) est une analyse de sensibilité du canal « partiel dans pool fini », pas un canal séparé.

5. **PR-UK-3 (ADR-M020)** : ne pas présumer que Gatto corrobore la lecture des threads governance.aave.com 24269/24275 — Gatto (réf. [18], **page 51**) cite une filiation distincte (Chaos Labs post-mortem + CoinDesk/The Block). Les deux peuvent coexister (même événement, deux canaux de documentation) mais ce n'est pas la même source citée.

6. **Toute comparaison méthodologique Gatto ↔ M-2/Ukemi sur le close factor** → préciser : Gatto modélise explicitement la règle **Aave v2** (fraction statique de la dette), pas la règle v3 réelle (100 % sous HF<0,95) — Limitation (x), **page 44**, auto-déclarée par l'auteur comme donnant une **borne supérieure** sur le canal « partial liquidation ».

7. **ADR-M020 (Contexte §7, « Lehar–Parlour 2,49 Md$ »)** : ce chiffre n'apparaît pas dans Gatto (recherche exhaustive [lu]) — Gatto ne cite Lehar & Parlour [7] que pour la structure de l'impact-prix (**page 6**), sans aucun chiffre en dollars. Si le chiffre doit être sourcé/vérifié, la source à consulter est Lehar & Parlour eux-mêmes, pas Gatto.

---

## NON TROUVÉ / NON LU et procurements formés

- **NON TROUVÉ (dans le texte imprimé de Gatto)** : énumération complète et nommée des 8 catégories e-mode (LT, bonus, nom) — seules 3 sont nommées (ETH-corrélé, stablecoin, BTC ; Table 6 p. 22) ; la borne agrégée [0,876 ; 0,960] est assertée en prose (p. 21) avec un renvoi « Section 3 » qui, vérifié [lu] en intégral (p. 7), ne contient pas cette énumération. **Procurement formé** : fichier `acquisition/out/aave_v3_live/emode_categories.json` du dépôt `github.com/DaruFinance/defi-param-stress` (chemin cité dans le manifeste d'artefacts, Table 18, p. 48) — tentative d'acquisition non faite (hors périmètre outillage de cette lecture, pas d'accès réseau GitHub exercé) ; usage prévu : compléter Q2 avec les 5 catégories manquantes et vérifier l'origine exacte de la borne [0,876;0,960].
- **NON TROUVÉ (dans Gatto)** : le chiffre « Lehar–Parlour 2,49 Md$ » du contexte ADR-M020 — absent des 52 pages ; à sourcer directement chez Lehar & Parlour (2022), BIS Working Papers No. 1062, SSRN 4164833 (réf. [7], p. 50) si le chiffre doit être vérifié — **procurement formé** : identité complète ci-dessus, tentative d'acquisition non faite dans cette lecture (hors périmètre : mission bornée au PDF Gatto), usage prévu = vérifier ou retirer la citation « 2,49 Md$ » dans le contexte ADR-M020 §7.
- **NON LU (périphérique, pas demandé par Q1-Q11)** : Table 1 (canonical whole-book at-risk, p. 13) et Table 2 (7-block panel, p. 15) lues en contexte/extraits mais pas ligne à ligne exhaustif comme les tableaux explicitement demandés ; Table 11 (forward fragility scan, p. 29) et Table 12 (wstETH threshold sweep, p. 31) lues en substance (chiffres clés extraits : LST-loop $0 sous crash vs $1 357M sous de-peg, p. 29 ; seuil réserve 0,81→0,59 fait passer l'at-risk de $16,9M à $144,1M, ×8, p. 30) mais pas reproduites intégralement, car hors du périmètre des 11 questions. Aucun procurement nécessaire — disponibles dans le même PDF si une future mission les demande explicitement.
- **Date calendaire exacte du bloc 25 253 205** : non donnée en toutes lettres dans le texte (seule une correspondance approximative est déductible via le panel Table 2, ancre 2026-06-05 — non affirmée être le même instant). Pas de procurement formé : déductible par calcul de timestamp de bloc Ethereum si un besoin futur se présente, hors budget de cette lecture.
