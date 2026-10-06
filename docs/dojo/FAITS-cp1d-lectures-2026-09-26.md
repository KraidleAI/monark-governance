# FAITS — lectures sur place après le cp-1 bref de PR-2b (C-25, C-28, É-3)

Lecteur : orchestrateur `claude-fable-5-1`, navigateur interne, 2026-09-26 14:2x–14:31 UTC (horloge `date -u`). Demande investisseur (14:1x UTC) : « vérifies très bien pourquoi on a ces incohérences et suis les avis des advisors puis surfe en ligne pour plus d'info ». Chaque ligne : URL, heure lue, niveau, citation ≤ 25 mots. Aucune valeur du jour reprise comme fait ; aucune clé lue ; aucun formulaire, consentement ni téléchargement.

## 1. Pourquoi les incohérences (sur pièces, `git log` de l'ADR-mère)

| Pièce | Écrite | Mesure disponible |
|---|---|---|
| ADR-mère D-18 (troisième pli, décision 227) | `4db79be` 2026-09-25 20:10 UTC+1 | aucune : sonde non exécutée |
| Cinquième pli (sonde mesurée) | `7ef565f` 2026-09-26 06:46 UTC+1 | PROBE-3 exécutée 01:45Z |
| G0 PR-2b (worker, contexte frais, sans web) | `3a5e591` 2026-09-26 06:55Z | sonde + code + FAITS |

Cause 1 (C-24, six points) : D-18 a été rédigée **avant** la sonde, sur la recherche bibliographique ; le G0 de lot, rédigé **après** la sonde, raffine six points (ordre par compte, quorum d'index, moment du correctif du garde, comptes, estimation de lignes, liste de méthodes). Le cycle plan → mesure → raffinement est celui prévu par le corpus (G0 ; C-3 de l'ADR-mère) : le pli de l'ADR-mère est le mécanisme normal, pas une erreur de recherche. Aucun des six points ne contredit une source [lu] ; ils contredisent une estimation antérieure à la mesure.

Cause 2 (C-25) — **trou de lecture de l'orchestrateur, `error_origin` orchestrateur** : le worker du G0 n'a pas de navigateur (lecture = acte de l'orchestrateur). Le FAITS-lectures du 26/09 00:43Z (H-4) liste les **noms** des filtres (`slot, blockTime, signature, status, tokenAccounts, tokenTransfer`) sans leur **valeur par défaut**. La question « gTFA rend-il les échecs par défaut ? » n'était donc ni lue ni mesurée (la sonde n'a lu qu'un corps, SIG0). Lecture faite ci-dessous (L-1).

Cause 3 (C-28, Q-6) — **trou de lecture de l'orchestrateur, `error_origin` orchestrateur** : l'atomicité n'a jamais figuré sur la liste de lecture de la campagne ; la recherche n'a pas raté la question, la campagne de lecture l'a. Lecture ci-dessous (L-3).

## 2. Lectures

| # | URL | Heure (UTC) | Niveau | Fait |
|---|---|---|---|---|
| L-1 | `https://www.helius.dev/docs/api-reference/rpc/http/gettransactionsforaddress` | 14:2x (reconstitué ; horloge lue une fois, 14:31Z, après les trois pages) | [lu] | `filters.status` : « string, default: "any" », valeurs `succeeded`, `failed`, `any` ⇒ **sans filtre, les transactions en échec sont rendues** (Q-18 tranchée au niveau documentaire ; la mesure de l'acte 0 (C-26) reste due, mais sans risque de « 24 % absents »). `filters.tokenAccounts` : « default: "none" », valeurs `none`, `balanceChanged`, `all` : « include transactions involving token accounts owned by the address ». `filters.tokenTransfer.mint` : « Token mint to filter on ». `limit` « default: "1000" », « Use 1–1000 » pour `signatures` et `full`. `commitment` « default: "finalized" ; The processed commitment is not supported ». Réponse `signatures` : `signature, slot, transactionIndex, err, memo, blockTime, confirmationStatus`. |
| L-2 | `https://www.helius.dev/docs/billing/credits` | 14:2x (reconstitué) | [lu] | « getTransactionsForAddress, which starts at 10 credits and is metered by returned results » ; « Full transactions cost 10 credits per 100 returned; signatures-only responses cost 10 credits flat » ; table : « 1-100 full transactions 10 ; 250 → 30 ; 1,000 → 100 » ; « Failed API responses Free ». `getSignaturesForAddress` 1, `getTransaction` 1, « Historical data queries … cost 1 credit each ». **Confirme H-4 et É-3** : le garde (`tariff.ts:13`, 10 par appel) sous-compte tout appel `full` rendant > 100 corps ; Bell à `limit: 1000` peut coûter jusqu'à 100 crédits par appel (GARDE-GTFA-FULL-TARIFF-1 confirmé au niveau documentaire ; la mesure reste due). Le barème est **par résultats rendus, pas par `limit`** : une page `limit: 100` qui rend 37 corps coûte 10. Page « Parsed Events … metering starts on September 24, 2026 » (barème récent : la lecture du 21/09 pouvait être antérieure). |
| L-3 | `https://solana.com/docs/core/transactions` | 14:31 (horloge) | [lu] | « If any instruction fails, the entire transaction fails and all state changes are reverted. » ; « Atomic execution: All instructions succeed or all revert. Fees are still charged on failure. » ⇒ **une transaction en échec ne change aucun solde de jeton** (seuls les frais SOL du payeur bougent, hors périmètre) : l'exclusion de F avant lecture des corps (D-4) est sûre ; Q-6 tranchée, FAITS-SOLANA-ATOMICITY-1 (C-28) = cette ligne. |

## 3. Conséquences proposées (pour le pli, à valider par l'orchestrateur puis au G1)

- C-25 : reste à écrire (cohérence gTFA ↔ index sur R seulement, M-Y26) ; **Q-18 est tranchée par L-1** : aucun filtre `status` n'est passé (défaut `any`), la forme fermée D-2 le dit explicitement ; l'acte 0 (C-26) confirme par mesure.
- C-28 : levée par L-3 (ligne datée dans l'ADR de lot, §9 Q-6).
- É-3 / C-30 : `error_origin` de É-3 = « barème lu incomplet le 21/09 (page pricing FAQ) ; page credits du 26/09 fait foi : 10 par 100 rendus ». GARDE-GTFA-FULL-TARIFF-1 : le garde a deux moments — **réservation avant appel** = pire cas `10 × ⌈limit / 100⌉` (c'est ce nombre que la garde ×10 et les plafonds utilisent, fail-closed) ; **grand livre après appel** = réel `10 × ⌈data.length / 100⌉` (minimum 10). Deux nombres, jamais un seul (avis advisor 14:4x).
- Option `filters.tokenAccounts` : la page dit « token accounts **owned by** the address » — le mint ne possède aucun compte, le filtre ne remplace rien sur le mint ; côté propriétaires il suppose de les connaître (fin de phase B) et ne vaut que chez helius (chainstack garde ses pages `getSignaturesForAddress`). Ce n'est **pas** un candidat au pli C-24 : item avec sonde **DOJO-GTFA-TOKENACCOUNTS-1** (sémantique à mesurer, jamais devinée ; déclencheur : avant le G0 de PR-2b-4 ; propriétaire orchestrateur).

Sha256 de ce fichier : rendu hors du fichier (CHANTIERS).

## 4. É-3 mesuré (ajout 2026-09-26 15:0x UTC, orchestrateur) — tableau de bord Helius vs grand livre du garde
| Méthode | Tableau de bord (lu 00:59–01:03Z, FAITS-floor-probe-3-avant) | Grand livre `helius-2026-09-19\helius.jsonl` (`attempted`, dernier write 01:47Z ; script scratchpad 14:5xZ) | Écart |
|---|---|---|---|
| getTransactionsForAddress | 3 690 270 | 35 724 appels × 10 = 357 240 | **× 10,33** |
| getTransaction | 40 295 | 39 390 | + 905 |
| getSignaturesForAddress | 7 376 | 4 128 | + 3 248 |
| total | 3 738 080 | `credits_derived` 400 788 | — |
Lecture : le barème « 10 crédits par 100 transactions complètes rendues » (L-2) appliqué aux pages `full`/`limit 1000` de Bell explique l'ordre de grandeur (jusqu'à 100 par appel) ; résidus (appels hors garde, décalage de début de cycle, sonde PROBE-3 postérieure au relevé) déclarés, non résolus. GARDE-GTFA-FULL-TARIFF-1 : deux nombres (réservation avant appel `10×⌈limit/100⌉` ; grand livre après `10×⌈rendus/100⌉`, min 10) — à livrer avant toute collecte Bell.
