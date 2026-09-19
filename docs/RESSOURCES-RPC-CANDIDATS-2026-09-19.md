# Candidats RPC payants (second fournisseur en plus d'Helius) — visites au navigateur intégré, 2026-09-19
Décision investisseur 38 (« on va trouver un RPC qu'on va payer si non ; en plus de helius ») + consigne « visite les sites des candidats toi-même en navigateur intégré ». Orchestrateur `claude-fable-5-1`. Tout ce qui suit est **[lu]** sur la page de tarifs de chaque candidat le 2026-09-19 (texte de page extrait) ; aucun chiffre repris d'un tiers. Le besoin est celui d'ADR-T1aii C-1 (quorum de **deux fournisseurs indépendants** avec **archive**) et d'ADR-M020 (Ukemi, Ethereum keyless quorum-2 déjà en place).

## Ce que Bell/Ukemi demandent à un fournisseur
1. **Indépendance** vis-à-vis d'Helius (autre opérateur, autre infra) — c'est le sens du quorum.
2. **Profondeur d'archive** : Solana `getSignaturesForAddress`/`getTransaction` sur des sessions passées (course fondatrice -b = mois entiers) ; EVM `eth_getLogs` sur de larges plages (le « free plan » de dRPC refuse > 10 000 blocs, mesuré U-1a-hard).
3. **Coût prévisible par session par pool** (le collecteur fait des signatures + corps échantillonnés).
4. **Aucune clé dans les URL loggées** (déjà garanti côté code par `providerOf`) ; paiement en stablecoin bienvenu (pas de carte).

## Fiches
### Triton One (Solana, Sui, Monad) — `triton.one/pricing`
- **Modèle** : pay-as-you-go, dépôt minimum **125 $** en stablecoins, valable 12 mois, non remboursable ; « every product included on every plan », limites de RPS flexibles, pas de paliers.
- **Tarifs** : RPC standard / gRPC unaire / account & ledger queries **10 $ / million d'appels + 0,08 $/Go** ; streaming 0,08 $/Go ; Metaplex 50 $/M ; shred streaming dès 450 $/mois (hors besoin).
- **Archive** : « Complete Solana ledger from genesis, queryable in milliseconds », « one flat rate across every epoch and method, including gTFA » ; RPC 2.0 (Superbank/Cloudbreak) : `getTransactionsForAddress`, filtres par plage de slots — exactement la méthode qu'Helius vend pour la course fondatrice.
- **Apport** : le **second archival Solana** idéal (opérateur distinct d'Helius, historique complet, méthode équivalente) ; E-1 de l'ADR-T1aii se règle par un dépôt de 125 $. Pas d'EVM (Ethereum/BNB/Base/Arbitrum) : ne couvre que la jambe Solana.
### QuickNode (80+ chaînes dont Solana, Ethereum, BNB, Base, Arbitrum) — `quicknode.com/pricing`
- **Modèle** : crédits API ; Free trial 10 M crédits / 15 RPS / 1 mois ; **Build 34 $/mois annuel (49 $ mensuel) = 80 M crédits, 50 RPS** ; Accelerate 212 $ (450 M) ; Scale 424 $ (950 M) ; crédits additionnels 0,50-0,62 $/M ; paiement crypto possible (top-up) ; multi-chain endpoints ; archive data sur tous les plans ; SOC 2 / ISO 27001 ; Solana gRPC en add-on.
- **Apport** : un **seul compte pour toutes les jambes** (Solana + EVM), archive incluse, 10 endpoints sur Build. Le multiplicateur de crédits par méthode (ex. `trace_transaction` ×2) rend le coût par session à calculer avec leur table.
### Alchemy (EVM + Solana) — `alchemy.com/pricing`
- **Modèle** : Free **30 M CU/mois, 25 RPS**, « full archive data » inclus ; Pay-as-you-go **0,525 $/M CU**, 300 RPS inclus ; Enterprise : « Increased eth_getLogs() ranges » (donc les plages `getLogs` sont bornées en dessous) ; ~27 CU par requête en moyenne (leur chiffre).
- **Apport** : second EVM avec archive complète et gratuit à notre échelle ; Solana gRPC seulement payant (75 $/To). Réserve : plage `eth_getLogs` limitée hors Enterprise (à mesurer avant de compter dessus pour Ukemi).
### dRPC (136 chaînes) — `drpc.org/pricing`
- **Modèle** : Free **210 M CU/mois**, nœuds publics seulement, 100 RPS ; Growth **6 $ / 1 M requêtes**, nœuds haute performance, 5 000 RPS, 99,99 % ; paiement crypto ; debug/trace.
- **Apport** : déjà l'un des cinq keyless d'Ukemi ; le plan Growth lève probablement la limite « ranges over 10000 blocks are not supported on free plan » (mesurée U-1a-hard) — à vérifier sur pièce (non lu sur la page).
### Chainstack — `chainstack.com/pricing` (page partiellement rendue)
- Lu : « Unlimited Node » **dès 149 $/mois pour 25 RPS**, requêtes illimitées dans le palier RPS. Reste à lire : plans Developer/Growth, archive, chaînes. **Visite à refaire.**
### Non encore visités
Ankr (cité par le comparateur dRPC), Chainstack (suite), fournisseurs spécifiques aux chaînes remontées par le census (Robinhood Chain, Base).

## Lecture orchestrateur (préliminaire, avant le census)
- **Solana** : **Triton** comme second archival (125 $ de dépôt, 10 $/M appels) — indépendant d'Helius, historique complet, même famille de méthodes. Alternative unique-compte : QuickNode Build (34-49 $/mois).
- **EVM (Ethereum, BNB, Base, Arbitrum)** : les cinq keyless + **Alchemy Free** (archive, 30 M CU) comme sixième ; si les plages `getLogs` bloquent la course fondatrice : dRPC Growth (6 $/M req) ou QuickNode Build.
- Ordre de grandeur mensuel plausible : **< 100 $** pour les deux jambes (à confirmer par le compte d'appels par session du census).
- Aucune de ces pages ne remplace la mesure : chaque candidat retenu sera **benché par le collecteur** (profondeur réelle, formes d'erreur, latence) avant d'entrer dans le quorum.
