# FAITS - floor Chainstack, lecture SUR PLACE n°1 (regle 2026-09-20 ; prereg -1b §A-4, decision 121)

Orchestrateur Fable 5.1, Claude in Chrome (session investisseur), `https://console.chainstack.com/statistics`, onglet Elastic Nodes, filtre « Past 2 months », lu le 2026-09-22 05:24 UTC (`date -u`). Niveau : **[lu]** premiere main. Aucune page portant une cle n'a ete ouverte (Projects, Statistics seulement). Bandeau de la page : « Data updates every few hours, not in real time. Today's figures are partial and continue to fill in through the day. »

## Cycle (table « Number of RUs over billing periods | elastic nodes », 1 ligne)
| Org ID | Org | Billing period start | Billing period end | plan | full RUs | archive RUs | debug | trace | Warp |
|---|---|---|---|---|---|---|---|---|---|
| RG-253-734 | Stan | Sep 19, 2026 | Oct 19, 2026 | Growth monthly / Standard support monthly | 546 | 12 358 | 0 | 0 | 0 |

**TOTAL du compte (floor, tous reseaux) = 546 + 12 358 = 12 904 RU** (concordance : graphique par jour 29 + 12 861 + 14 = 12 904). Encadre « Usage : 1% used, Resets in 27 days, Plan Growth, Extra usage Disabled ».

## Par reseau (table « RUs by protocol networks », colonnes Sep 19 / Sep 20 / Sep 21 ; AUCUNE colonne Sep 22 encore = donnees du jour non remontees)
| protocol_network | Sep 19 | Sep 20 | Sep 21 | cumul |
|---|---|---|---|---|
| base-mainnet | 8 | - | - | 8 |
| bsc-mainnet | 6 | - | - | 6 |
| ethereum-mainnet | 6 | 4 258 | 14 | **4 278** |
| robinhood-mainnet | 6 | - | - | 6 |
| solana-mainnet | 3 | 8 603 | - | 8 606 |
Somme par reseau = 12 904 = total (concordant).

## Consequences
- Instance `<FLOOR-INSTANCE>` candidate = **12 904 RU** (total du compte) ; ligne ethereum-mainnet = 4 278. Marge sous le plafond de cycle 16 000 000 RU : ~15,99 M.
- Le run Narabi du 22/09 00:41 UTC (jambe Chainstack `true`) n'apparait pas encore (colonne Sep 22 absente) : la 2e lecture (juste avant le premier appel de la course) DOIT montrer une colonne Sep 22 stabilisee ; l'ecart attendu = le residuel Narabi lu au journal du sentinel (minorant).
- Cycle Chainstack : 19/09 -> 19/10 ; la course -1b et son rapprochement tiennent dans le cycle.
- Prochaine lecture : n°2 immediatement avant le go de la course (double lecture de stabilite = n°2 et n°3 apres la course, espacees de plusieurs heures).
