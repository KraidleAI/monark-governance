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

## 5. Complément de l'investisseur (2026-09-25, après-midi) : « ce sont les mauvais scores qui nous intéressent »
Verbatim au plus près : « dans le cas où les agents ont de bons résultats dans le Dōjō, cet entraînement ne sert pas à grand-chose ; c'est pour cette raison que le Dōjō aura aussi des task classes, mais celles-ci sont des simulations d'épisodes passés sur le marché, où il y a eu des pièges, de grosses liquidations, de grosses pertes, des mouvements violents, des hacks. On doit pousser les agents à faire des erreurs ; c'est leur mauvais score qui nous intéresse, et c'est cette mauvaise plage de décision qui doit être isolée avec MONARK engine. Les agents pourront retourner au Dōjō à mesure que de nouveaux outils, task classes et stratégies sont mis en place. »

Lecture de l'orchestrateur, effets sur le plan proposé :
- Pièce 3 (environnement) : deux modes, le paper trading en temps réel ET le rejeu d'épisodes d'échec choisis (task classes). Le rejeu n'est pas un backtest de performance : c'est un banc d'épreuve où l'échec est le résultat attendu. La fuite de mémoire des modèles (Lopez-Lira 2025) reste à traiter : un épisode connu du modèle peut être « reconnu » plutôt que vécu ; à cadrer au G0 de la pièce 3 (épisodes postérieurs à la coupure, ou déguisés).
- Pièce 5 (jugement) : l'objet mesuré est la plage de décisions où l'agent casse (quand, sur quel signal, avec quel levier), pas le classement des bons ; la calibration avec MONARK se fait sur ces échecs.
- Formation cyclique : un agent revient au Dōjō à chaque nouvel outil, task class ou stratégie ; aucun « diplôme » définitif.
- Registre des task classes : un catalogue daté d'épisodes (source publique des données, fenêtre, ce qui s'y est passé, ce que l'agent devait éviter), à construire comme une bibliothèque, chaque épisode recomputable.

## 6. Étude ouverte (investisseur, 2026-09-25, « c'est qu'une étude, pas encore décidé ») : les agents MONARK reliés à des NFT transférables, titre de propriété de l'agent
Verbatim : « les agents monark seront reliés à des NFT, ces NFT seront transférables, et c'est le droit de propriété de l'agent, est-ce faisable ? »

Avis de l'orchestrateur (faisable ; conditions) :
- Technique : NFT Solana (standard Metaplex Core) = identité de l'agent ; la plateforme n'obéit qu'au propriétaire courant du NFT ; le transfert emporte mémoire, historique Dōjō, scores et budget d'inférence ; frappe au palier Egg. Une PR de taille moyenne, après la pièce 1.
- Condition : le lien avec le hold. Trois modèles : (1) NFT seul (le hold ne sert qu'à obtenir le NFT ; un droit transférable crée un marché qui découple droit et détention, cf. lectures Lloyd 2023 Q5-5, Messias 2025) ; (2) **NFT + hold** (recommandé) : le NFT est le titre, l'agent n'entre au Dōjō que si le propriétaire du NFT tient au moins Egg sur son adresse ; un NFT vendu sans MONARK est un agent endormi ; (3) NFT + budget : le NFT porte le budget d'inférence acquis par les points, compatible avec (2).
- À étudier avant décision : juridique (droit d'usage vs instrument si rendement ou classement monnayable ; juriste avec la pièce 1) ; marché (location d'agents, revente d'agents entraînés, tournois biaisés ; registre T étendu) ; données (propriété de ce que l'agent a appris, transfert intégral, effacement du vendeur) ; technique (un agent = un NFT = une clé ; vérification du propriétaire à chaque session).
- Placement : pièce 2 (registre des agents), option « NFT d'agent » ; courte bibliographie (standards NFT Solana, comptes liés à un jeton, précédents d'agents-NFT) à lancer pendant l'implémentation de la pièce 1.
