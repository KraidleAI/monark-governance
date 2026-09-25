# MONARK Dōjō — proposition de plan pour la discussion (orchestrateur, 2026-09-25)

Statut : proposition de l'orchestrateur (`claude-fable-5-1`) à discuter avec l'investisseur ; rien n'est décidé. Sources : `BRIEF-DOJO-2026-09-25.md` (vos mots), bibliographie passe 1 (`F:\PRODUITS\dojo\biblio\_RAPPORT-passe1-2026-09-25.md`, 60 papiers au niveau [abs] : résumés lus, textes non lus), faits sur les sources de données (`_FAITS-sources-2026-09-25.md`, lus sur place). Une campagne de lecture [lu] est due avant tout G0 sur les points marqués « à lire ».

## 1. Ce que la bibliographie change dans ma lecture

1. **Le score de hold a un précédent direct : les veTokens.** Lloyd et al. 2023 (arXiv 2311.17589) décrivent un poids obtenu contre un verrouillage long, avec ses effets émergents (pots-de-vin, marchés de votes). Wang et al. 2025 (2505.00888) proposent un **snapshot pondéré dans le temps** contre les prêts éclair. À lire avant de fixer la formule.
2. **Les récompenses à la détention attirent des fermiers.** Messias et al. 2023 : jusqu'à 66 % des tokens d'airdrop revendus rapidement ; Al-Chami et Clark 2025 : programmes de quêtes envahis de bots. La résistance Sybil doit être dans la formule dès le premier snapshot, pas ajoutée ensuite.
3. **Un score publié doit être vérifiable par chaque holder.** DAPOL (Chalkias et al. 2020, CC BY) : preuves de passif sur arbre de Merkle. C'est la même discipline que Bell (fichiers signés, recomputables) appliquée aux snapshots : chaque holder retrouve sa ligne, personne ne voit celle des autres si on le veut.
4. **Les classements d'agents pèsent sur les comportements.** Barton et al. 2026 : sur six mois d'agents en production, le classement pèse causalement sur la sélection, levier médian 5x, aucun avantage directionnel. Yu, Zhao et Sui 2026 : 191,7 M USD perdus par les détenteurs de tokens d'agents DeFi. Le « on jugera » doit récompenser la discipline et la calibration, pas le PnL brut, sinon le Dōjō sélectionne des joueurs à fort levier.
5. **Les benchmarks fuient.** Lopez-Lira et al. 2025 : les LLM mémorisent l'avant-coupure ; seule la période après coupure est évaluable. Gençay 2026 : un oracle fuyant à Sharpe 35 passe le Deflated Sharpe et le PBO. Conséquence : le Dōjō doit tourner en **temps réel papier** (données postérieures à toute coupure, enregistrées à mesure) ou sur des rejeux avec garde-fous structurels contre le look-ahead, jamais sur un simple backtest.
6. **Le juge doit être déterministe.** Zheng et al. 2023 documentent les biais du LLM juge ; Xiong et al. 2023 : la confiance verbalisée des LLM est surestimée. Métriques : règles de score propres (Gneiting-Raftery), diagrammes de fiabilité (Dimitriadis et al. 2021), drawdown, Deflated Sharpe (Bailey-López de Prado) avec garde-fous anti-fuite.
7. **Les données ont des conditions d'usage contraignantes.** Nansen : usage interne seul, interdiction d'entraîner des modèles avec les données, endpoints « smart money » interdits, attribution « Powered by Nansen » obligatoire hors usage interne. Binance Vision : CC BY-NC-SA, bots commerciaux exclus. Alpha Vantage : non commercial. Il faut trancher ce que « avantages inégalés » peut contenir légalement : un accord écrit avec Nansen est un item formé.

## 2. Pièces proposées, dans l'ordre

### Pièce 1 : Snapshot et score de hold (public, vérifiable)
- **Entrée** : lecture on-chain des soldes du token MONARK (Solana, adresse committée `out/mint.txt`) à des instants datés ; source = deux opérateurs RPC comme Bell (quorum), jamais un fournisseur nommé en public.
- **Score** (à discuter) : proposition `score = Σ_j min(solde_j, plafond) × jours_j` avec décroissance si le solde baisse (vente partielle remet le compteur de la part vendue à zéro) ; départ du comptage au premier snapshot public (pas rétroactif au TGE, sauf décision contraire) ; pas d'agrégation multi-adresses (Sybil : une adresse = un score ; un seuil en score, pas en rang, pour ne pas créer un tournoi entre holders).
- **Sortie** : fichier signé et chaîné par snapshot (même bibliothèque de chaîne que Bell), page `/dojo` sur le site : date, nombre de holders au-dessus du seuil, digest ; chaque holder retrouve sa ligne par son adresse ; preuve Merkle par ligne (DAPOL, à lire).
- **Test d'intégration** : reconstruction du score depuis les soldes committés, comparaison au fichier servi.
- **Ce qui n'est PAS dans la pièce 1** : l'agent, le Dōjō. Elle vaut seule : « les snapshots commencent, visibles pour tout le monde ».

### Pièce 2 : Le registre des agents
- Un agent par adresse au-dessus du seuil ; identité = adresse + clé ; le holder signe une demande ; le registre est public (adresses, pas de noms).
- Modèle et coût d'inférence : à discuter (qui paie ; plafond de tokens par agent et par jour).

### Pièce 3 : L'environnement (paper trading, spot crypto d'abord)
- **Temps réel papier** : flux de prix publics enregistrés à mesure (données postérieures à toute coupure), ordres fictifs exécutés au prix enregistré avec frais et glissement modélisés (Almgren-Chriss à lire), journal de trades signé par agent.
- Rejeu historique seulement pour l'entraînement, jamais pour le jugement (fuite).
- Marchés : spot crypto (BTC, ETH, SOL, MONARK, puis Squire, Ansem, Claw), puis perps (Rao 2025, Chitra 2025 sur l'ADL à lire), puis actions et forex (conditions d'usage à lire).

### Pièce 4 : Les outils des agents (« the data and the skills »)
- Analyse technique : indicateurs classiques (bibliothèque de 53 papiers déjà classée), servis comme fonctions déterministes.
- Analyse fondamentale : métriques on-chain (Llanos 2026 : séries reproductibles depuis un nœud complet ; NVT, adresses actives) ; rapports financiers pour les actions (FinanceBench : les LLM échouent à 81 % sans structure ; à cadrer).
- Données externes premium (type Nansen) : après lecture juridique et accord écrit ; jamais nommées en public.

### Pièce 5 : Le jugement et la sortie vers MONARK
- Juge déterministe : score de Brier des annonces probabilistes, fiabilité, drawdown, respect des règles (levier, taille), Deflated Sharpe avec garde-fous structurels ; classement publié avec ses limites (Aldous 2019 : le vainqueur d'un tournoi n'est souvent pas le meilleur).
- Sortie : la série des annonces et des résultats de chaque agent devient l'entrée d'une calibration conforme (pièce Hikae) : « calibrer avec MONARK » = mesurer la couverture réelle des annonces de l'agent, puis lui servir une borne. À confirmer avec vous : c'est mon hypothèse la plus proche de vos mots.

### Extensions
- Tâches de bag holders (missions assignées) ; autres tokens ; tournoi entre agents (Witkowski 2021 : le « winner-take-all » fausse les incitations, à lire).

## 3. Questions pour la discussion, avec ma recommandation
1. Formule du score : quantité × jours avec plafond et remise à zéro de la part vendue ; départ au premier snapshot. **Reco : oui, plafond à fixer ensemble.**
2. Seuil : en score, fixe et public, pas un rang. **Reco : seuil fixe.**
3. Sybil : une adresse = un score, pas d'agrégation. **Reco : oui, et pas de bonus de parrainage.**
4. Fréquence : snapshot quotidien à heure fixe UTC, publié dans l'heure. **Reco : quotidien.**
5. Agent : modèle Anthropic, inférence payée par MONARK sous plafond quotidien ; stratégies = « skills » fournis + mémoire propre ; le holder ne code pas. **Reco : à trancher, coût à chiffrer.**
6. Environnement : temps réel papier, spot crypto d'abord. **Reco : oui.**
7. Jugement : déterministe, calibration avant PnL. **Reco : oui, PnL publié mais non classant seul.**
8. Données premium : Nansen seulement après accord écrit ; sinon données publiques. **Reco : commencer sans.**
9. Lien MONARK : calibration conforme des annonces. **Reco : à confirmer avec vous.**
10. Surfaces : `/dojo` sur le site, vocabulaire D8, aucune promesse de rendement ni de date. **Reco : oui.**

## 4. Ce que je lance ensuite si vous êtes d'accord
- Campagne de lecture [lu] par lecteurs (Opus 5.5) : 12 papiers prioritaires (Lloyd 2023, Wang 2025, Messias 2023, Chalkias 2020, Barton 2026, Lopez-Lira 2025, Gençay 2026, Zheng 2023, Gneiting-Raftery 2007, Dimitriadis 2021, Balch 2019, Rao 2025) ; questions cadrées par le lecture-advisor.
- Procurement des 12 papiers non ouverts (liste dans `_PROCUREMENT.md`).
- G0 de la pièce 1 (snapshot) après la lecture, checkpoint-1, puis implémentation ; rien avant votre accord.
