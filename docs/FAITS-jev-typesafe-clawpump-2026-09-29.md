# FAITS — Jev (TypeSafe AI) tel que ClawPump l intègre, lu sur place le 2026-09-29 (04:39-04:41 UTC)

Orchestrateur `claude-fable-5-1`, demande investisseur (« lis cet article, nos partenaires, c est un peu ce que fait MONARK »). Lecture sur place (règle 2026-09-20) : navigateur interne, pages publiques, accès entier (article X affiché en intégralité sans connexion ; documentation TypeSafe publique). Niveau [lu] = première main, citation ≤ 25 mots. Aucun chiffre de marché ; aucune action de compte.

## 1. Sources lues
- S1 [lu] `https://x.com/tomi204/status/2104672497496997980`, article X « How Jev can change blockchain and finance, and how we built it into ClawPump », @tomi204, horodaté « 21:40 · 28 sept. 2026 », 2 404 vues au moment de la lecture (04:39 UTC).
- S2 [lu] `https://docs.typesafe.ai/introduction` (04:40 UTC).
- S3 [lu] `https://docs.typesafe.ai/confidence` (04:41 UTC).
- S4 [2nd] extraits de recherche (beam.ai, requesty.ai, marktechpost.com, towardsai) : non lus en entier, non utilisés comme faits.

## 2. Ce qu est Jev (S2, S3)
- « Jev is TypeSafe's flagship model and the first System One model. » Il ne génère pas de texte : il reçoit un état et des questions typées, et rend des réponses typées.
- Trois primitives : **Choice** (une option d une liste ; retourne `choice`, `probabilities`, `confidence`), **Score** (un niveau sur une rubrique ; idem), **Noul** (« Is this statement true? », un réel 0-1, sans `confidence`).
- Les questions sont évaluées « in parallel and in isolation against the same state in one go » ; doctrine : questions atomiques, composées dans le code.
- **`confidence` est une statistique dérivée de la distribution de probabilités** (« a statistic computed from the probability distribution the answer already gives you ») : une distribution concentrée donne une confiance haute, une distribution plate une confiance basse. La page dit : « you are never locked into our definition ».
- Usage prescrit : trois plages (agir / agir avec précaution / ne pas agir), seuils « scale with risk », et : « The correct threshold values depend on your domain and the performance of the model for your use case. Start with conservative thresholds, test with your own data ».
- **Ce que la documentation ne dit pas** (absence mesurée sur S2 et S3) : aucune garantie de calibration énoncée (aucune couverture nominale, aucune méthode conforme, aucun jeu de calibration cité) ; la confiance est une mesure de concentration, pas une probabilité de justesse garantie.

## 3. Ce que ClawPump en fait (S1)
- Motif : « An LLM guessing a token mint is how you lose money onchain. So we stopped letting it decide. »
- Architecture : Jev choisit l outil et les arguments « from a fixed set of options and says how confident it is » ; si les vérifications passent, « the Jev path executes the tool directly, with no LLM in between » ; un LLM n écrit que la réponse finale.
- Partage des rôles : Jev interprète (jeton parmi des mints connus, action, montant, chemin du tour, langage ambigu) ; **le code tient les limites dures** : slippage et positions rejetés au-dessus du maximum ; autorité du propriétaire et validation de l exécuteur « however confident Jev is » ; lecture fraîche du portefeuille par requête ; résultats pris du reçu de transaction ; aucune relance automatique si une transaction a pu partir.
- Seuils : « 0.75 confidence and probability to take a shortcut, and 0.90 for anything that moves money » ; sinon question à l utilisateur ou passage à l agent complet.
- Bornes : décision ≤ 16 Ko, requête ≤ 48 Ko ; Jev sur les agents standard ; prix cité 0,042 $ par million de jetons d entrée (exemple, « not measured traffic »).
- Sélection d outils : benchmark statique du 24 septembre, 107 outils / 32 080 jetons en base ; « Swap: 21 tools, 7,109 tokens (−77.8%) ».
- **Honnêteté des chiffres** : « We don't have a defensible cost-savings number yet » ; observations Supabase 17-19 vs 21-23 septembre : coût moyen par enregistrement −3,4 % toutes lignes ; pour 18 agents Kimi K2.5, −38,2 % en agrégat mais **+42,8 % en pondération égale** (« the traffic mix drives the result ») ; la table ne compte ni la dépense de Jev ni le succès des tâches.
- Suite annoncée : coût total par tâche accomplie, évaluations des suites ambiguës, extension aux perps, DCA, transferts, lancements de jetons, paiements x402.

## 4. Comparaison avec MONARK (registre `docs/VISION-ALIGNEMENT-MANIFESTE-2026-09-29.md`, `apps/site/lib/fleet.ts`)
| Point | Jev chez ClawPump (S1-S3) | MONARK (registre de flotte) |
|---|---|---|
| Où passe la décision | modèle de décision typé, puis code pour les limites dures | pièces séparées : attestation des faits (Shōgen), porte à couverture contrôlée (Hikae), borne du liquidable (Ukemi), chronologie publiée (Narabi) ; Genkan (à venir) = le point par lequel passe toute signature : commettre, différer, s abstenir |
| Nature de la « confiance » | statistique de concentration d une distribution ; seuils fixés à la main (0,75 / 0,90), calibration laissée à l intégrateur (S3) | **couverture contrôlée** : la porte tient une garantie de couverture nominale et **s abstient par construction** hors de la strate calibrée ; rejouée sur le fil réel et sur une boucle de calibration apportée par l utilisateur (BYO) |
| Faits en entrée | l état est ce que l agent a collecté (messages, compétences chargées) | chaque réponse de source devient un **témoignage signé**, typé en fait daté, avec mesure d indépendance des sources et résidu porté dans le verdict (Shōgen) |
| Vérification | limites dures dans le code ; résultats lus du reçu de transaction | oracle d exécution non-LLM, tests d intégration nommés par pièce, journal de provenance outillé (méthode AgileGates) |
| État de production | intégré à un agent de trading en production, chiffres partiels et déclarés comme tels | Genkan (la porte des transferts) est **upcoming** ; les quatre pièces built servent des portes MCP et des fichiers publiés, pas encore une exécution de swap |
| Où ils sont en avance | boucle complète intention → décision → exécution → reçu, en production, avec un modèle de coût par tour | — |
| Où MONARK est plus fort | — | la garantie est mathématique et déclarée (couverture), l abstention est structurelle, la provenance des faits est attestée ; le seuil n est pas un nombre choisi mais une couverture tenue |

## 5. Ce que cela change pour nous
- Le partage « le modèle interprète, le code impose les limites dures, l exécution ne passe jamais par un LLM » est **le même principe** que Genkan et Hikae. La différence de fond est la nature de la garantie : Jev donne une confiance auto-rapportée ; Hikae tient une couverture. C est l argument à porter, jamais « plus intelligent ».
- Point d attention honnête : leur boucle est en production et mesurée ; la nôtre a la garantie mais pas encore l exécution (Genkan upcoming). Les deux sont complémentaires plutôt que rivales : une Choice de Jev pourrait alimenter une porte Hikae, ce qui n est ni établi ni promis ici.
- Aucun chiffre de S1 n est repris comme fait de marché ; les pourcentages sont des observations partielles déclarées telles par l auteur.

## 6. Items
- VISION-JEV-COMPARE-1 (propriétaire orchestrateur ; déclencheur : G0 du lot Genkan, après AgileGates, décision 283) : porter au G0 de Genkan la lecture de S1 (limites dures, lecture fraîche, reçu de transaction, aucune relance automatique) comme classes d entrée à couvrir par des tests nommés ; comparer la couverture de Hikae à un seuil fixe sur un jeu rejoué.
- Aucun procurement : sources publiques lues en entier.
