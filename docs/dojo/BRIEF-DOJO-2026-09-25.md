# MONARK Dōjō — note de cadrage de l'orchestrateur (2026-09-25, avant discussion)

Statut : compréhension de l'orchestrateur (`claude-fable-5-1`) de ce que l'investisseur a dit les 24 et 25 septembre (décisions 218 et 221). Rien ici n'est décidé au-delà des mots de l'investisseur ; les points ouverts sont pour la discussion. Aucun code avant le G0 et son checkpoint-1.

## 1. Ce que l'investisseur a dit (verbatim ou au plus près)
- Le Dōjō est « la première utilité du token MONARK ».
- « Les holders produisent un score calculé par le nombre de tokens holdés ainsi que la période de hold. » « C'est la première pièce qu'on devra mettre en place. » « On fixera un seuil où un holder obtient son agent. »
- « L'agent ensuite entrera dans le dojo. Le dojo c'est quoi ? Paper trading, DeFi, perpétuels, spots, actions, forex ; on commencera par les plus simples. On jugera. »
- « Avant, on doit fixer les prérequis pour reproduire ou produire cet environnement. Cet environnement aura des avantages inégalés, des API Nansen par exemple, et d'autres avantages qu'on fixera ensemble. »
- « L'agent ne sera pas branché sur le moteur MONARK ; le dojo servira à produire sa data, qui sera à la fin de sa formation utilisée pour le calibrer avec MONARK. » « Training park. »
- « On ajoutera des tokens comme Squire, Ansem et Claw. » « Des tâches de bag holders seront assignées. » « Les snapshots vont bientôt commencer, visibles pour tout le monde sur notre plateforme. »
- « The data and the skills : on va mettre à disposition des agents une panoplie d'outils », « analyse technique et fondamentale ».
- « J'ai mis en place une biblio qui recense toutes les stratégies de trading possibles » : classée le 25/09 sous `Downloads\BIBLIOTHEQUE\MONARK\Trading-analyse-technique` (53), `Trading-strategies-ML-RL` (38), `Trading-analyse-fondamentale` (3), plus `CLAWPUMP\Agents-de-marche` (27) et `MONARK\Tokenomics-actions-tokenisees` (17).
- Méthode : « mêmes étapes » (AgileGates : bibliographie → plan/G0 → checkpoint-1 → …), « on commence par la biblio, se fixer un plan », « on discutera au fur et à mesure », « il faudra que tu comprennes bien ce que je veux pour commencer vraiment à le construire ».

## 2. Lecture de l'orchestrateur : les pièces telles que je les comprends
1. **Snapshot** (pièce 1, décision 218) : lecture on-chain des soldes des holders du token MONARK à des instants datés ; score = f(quantité, durée de détention) ; publication sur le site, visible de tous, recomputable (même discipline que Bell : fichiers signés, hachés, lisibles, jamais un chiffre tapé). Seuil → droit à un agent.
2. **Agent du holder** : une instance d'agent attribuée au holder au-dessus du seuil ; identité liée à l'adresse ; il « entre au Dōjō ».
3. **Dōjō = environnement de paper trading** : marchés simulés ou rejoués (spot crypto d'abord, puis perps, actions, forex), ordres fictifs, journal de trades, mesure des résultats ; « on jugera » = une évaluation (classement, métriques de risque, discipline).
4. **Outils fournis aux agents** : données (API de type Nansen : flux on-chain, wallets, smart money), analyse technique, analyse fondamentale, « skills » ; avantages à fixer ensemble.
5. **Sortie du Dōjō** : la data produite par l'agent (ses décisions, ses trades, ses erreurs) sert, en fin de formation, à le **calibrer avec MONARK** (le moteur reste séparé pendant la formation).
6. **Extensions** : autres tokens (Squire, Ansem, Claw) ; « tâches de bag holders » (missions assignées aux détenteurs).

## 3. Points que je dois comprendre avant tout G0 (questions pour la discussion)
- **Score** : forme exacte (linéaire en quantité × jours ? plafonds ? décroissance si vente partielle ? adresses multiples ?) ; instant de départ du comptage (depuis le TGE, depuis le premier snapshot ?) ; fréquence des snapshots ; règle anti-Sybil.
- **Seuil** : un seuil fixe en score, ou un rang (top N) ? Un agent par adresse ?
- **Agent** : quel modèle, qui paie l'inférence, quelle autonomie (stratégies écrites par le holder ? par nous ? apprises ?), quelle mémoire ; « skills » = bibliothèque de stratégies encodées ?
- **Dōjō** : données de marché rejouées (historique) ou simulées, ou temps réel en papier ? Quels marchés pour le premier lot (mon hypothèse : spot crypto sur données publiques) ; frais et slippage modélisés ? Durée d'une « formation » ?
- **« On jugera »** : critères (PnL papier, drawdown, respect des règles, calibration des annonces : un agent qui dit « 70 % » doit-il avoir raison 70 % du temps ?), et qui juge (déterministe, jamais un score LLM).
- **Calibration avec MONARK** : quel est le lien précis ? Mon hypothèse : les décisions de l'agent deviennent une série sur laquelle les pièces MONARK (inférence conforme, détection de rupture) mesurent une couverture ; à confirmer.
- **Nansen et autres API** : conditions d'usage à lire AVANT tout appel (règle 2026-09-20) ; coût ; noms de fournisseurs jamais affichés sur les surfaces publiques.
- **Surfaces publiques** : page Dōjō sur le site (snapshots visibles) ; pas de promesse de rendement, pas de date ; vocabulaire D8.

## 4. Ce que je fais en attendant (autorisé par 221)
- Bibliographie Dōjō : lacunes de la bibliothèque existante mesurées (fondamental quasi vide : 3 papiers ; rien sur les incitations de détention / score de hold ; rien sur les environnements de paper trading et l'évaluation d'agents LLM en trading ; peu sur les perps) ; téléchargement des papiers en accès ouvert sous `F:\PRODUITS\dojo\biblio\` avec index et niveau [lu]/[abs] ; demandes de procurement formées pour ce qui n'est pas ouvert.
- Aucun code, aucun G0 avant la discussion.
