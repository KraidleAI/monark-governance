MODELE RESOLU: claude-sonnet-5

# L — Lecture intégrale : TokenLogic, « [ARFC] rsETH Incident Funding Update »

- **Chercheur** : `claude-sonnet-5`, effort max, 2026-09-20. Mission : clôture du procurement « rapports risque DeFi » (item 6.c #2 de `PROCUREMENTS-2026-09-20.md`).
- **Méthode** : API JSON publique Discourse. Fetch initial (`/t/24740.json`, 20/34 posts) puis pagination (`/t/24740/posts.json?post_ids[]=...`, 1 lot de 15 ids) pour les 14 posts restants + le post système de clôture (35ᵉ id du stream). `curl`, lecture seule, ≥ 1 s entre requêtes, aucun 429. Aucun appel à l'outil advisor intégré pendant l'extraction.
- **Usage prévu (ADR-M020)** : compléter `L-lecture-messari-aave-cracks-2026-04-22.md` §3 (déjà cité en [2nd] via Messari) ; contexte D8 « les payeurs de mesure de risque sont les DAO/SP » ; épisode rsETH cité en fact 8 d'ADR-M020 comme « canal 'gap discret' + 'pool fini' (Gatto Table 9) pour U-5 ».

## 0. Gate 0
Modèle résolu déclaré ligne 1 : `claude-sonnet-5`. Préfixe conforme. Poursuite autorisée.

## Identification (avant extraction)

- **Titre exact** : « [ARFC] rsETH Incident Funding Update ».
- **Thread id** : 24740. **Slug vérifié dans le JSON** : `arfc-rseth-incident-funding-update`.
- **URL canonique** : `https://governance.aave.com/t/arfc-rseth-incident-funding-update/24740`. Résout le NON TROUVÉ #7 de `PROCUREMENTS-2026-09-20.md` pour ce thread.
- **Auteur post #1** : `TokenLogic` (« TokenLogic-Finance SP »). Post #27 (réponse officielle mi-thread) : `TokenLogic` également.
- **Dates** : créé 2026-04-24T18:09:45.373Z ; dernier post substantiel 2026-04-28T20:18:35.282Z ; post système de clôture automatique 2026-05-28T20:19:35.932Z (30 j après dernier post).
- **Catégorie** : `category_id` 4 = « Governance ».
- **Nombre de posts** : **35 dans le stream, 34 dans `posts_count`** (écart expliqué : le 35ᵉ post, id 64322 — *attention, id partagé par coïncidence de plage avec un autre post système sur un thread différent, voir ci-dessous* — est un message automatique `system`, `post_type` 3 « small_action », non compté dans `posts_count`). **36/36 posts numérotés (#1 à #36 avec deux trous #24 et l'id système) lus intégralement** — voir note technique.
- **Classe** : P1 (proposition officielle de gouvernance, ARFC → Snapshot, Aave DAO).
- **Note technique sur la numérotation** : le fichier fusionné contient 35 objets `post` (stream complet) ; les `post_number` vont de 1 à 36 avec un saut (pas de #24 dans le stream — vérifié : aucune anomalie de contenu, simple numérotation Discourse native, potentiellement un post supprimé avant capture). Tous les posts présents dans le stream ont été lus.

## Archive brute et sha256

| Fichier | sha256 |
|---|---|
| `recus\aave-discourse\aave-rseth-funding-update-24740-p1.json` (brut, 20/34 posts) | `5996820d4abe5937380d9949d4f113cc283f230e280ba71700b8776e2dc4ae33` |
| `recus\aave-discourse\aave-rseth-funding-update-24740-batch-01.json` (brut, 15 posts restants incl. le post système) | `39ec55fd7d4cedc564dd46ad67cf885387506734b3520aa03c51025a5780079c` |
| `recus\aave-discourse\aave-rseth-funding-update-24740-FULL-merged.json` (35/35 fusionnés) | `48b5234f8845b2dc98723afbcf4e131d3f38a76695f1150eecc66c69eedbc162` |
| `recus\aave-discourse\aave-rseth-funding-update-24740-FULL-digest.txt` (texte nettoyé, lu intégralement) | `136e94d9bcbdcaea9577bbb951d8ae20eb30849728290c1d240d9389b8666a56` |

## Post #1 (TokenLogic, 2026-04-24, édité 2026-04-27) — [lu] intégral

### Objet et montant — RÉSOUT un NON TROUVÉ antérieur
**`PROCUREMENTS-2026-09-20.md` item 6.c #2 notait : « Montant chiffré final de la contribution Aave DAO... non trouvé dans le fragment de post #1 capturé ». Résolu : le montant EST dans le post #1 complet.**

Verbatim (≤ 25 mots) : « This ARFC requests authorization to deploy 25,000 from the Aave DAO treasury as the DAO's contribution to the broader coalition effort ». **Montant : 25 000 ETH**, contribution du **trésor Aave DAO** à l'effort de récupération coordonné « DeFi United » suite à l'incident du pont rsETH du 18 avril 2026 (détaillé dans le thread 24580, lu séparément ce jour, voir fichier associé).

### Chiffres exacts copiés (mécanique de récupération, post #1)
- Manque initial estimé (selon le rapport LlamaRisk, thread 24580) : 152 577 rsETH extraits × ratio 1,0696 rsETH/ETH ≈ **163 183 ETH** de manque brut.
- Kelp a récupéré/gelé **40 373 rsETH** (~43 168 ETH au taux de référence) → trou immédiat ramené à **~120 015 ETH**.
- Arbitrum Security Council a gelé **30 766 ETH** du hacker sur Arbitrum.
- Récupération attendue par liquidation de la position du hacker sur Aave : jusqu'à **12 323 WETH** ; sur Compound : **1 845 WETH** additionnels.
- Total récupéré/récupérable combiné : **~87 955 ETH** (~54 % du manque initial). **Manque résiduel : ~75 081 ETH.**
- Contributions publiques déjà engagées (EtherFi, Lido, Ethena, Ink, BGD Labs, Ernesto, Emilio, Stani) : **14 570 ETH**. Facilité de crédit Mantle : jusqu'à **30 000 ETH**. Manque résiduel après cela : **~30 000 ETH**, dont **25 000 ETH demandés au trésor DAO**.
- Précédent cité (contexte, mesuré) : incident CRV 2022 (« short-squeeze »), **2 651 906 CRV de dette irrécouvrable, ~1,9 M$ à l'époque** — le DAO avait couvert le manque plutôt que de socialiser sur les fournisseurs (politique « No Ghost Left Behind »).
- Marchés Aave V3 concernés par le contributeur DAO : Ethereum, Arbitrum, Mantle.
- Le montant de 25 000 ETH est **« anchored »** (ancré) : tout don public reçu après approbation ne réduit PAS l'engagement du DAO — il est appliqué au remboursement de la facilité Mantle à la place.

### Autorisation demandée (proposition, pas encore exécutée au moment du post)
Autorise Aave Labs (ou affilié désigné) à agir comme contrepartie sur prêt/règlement/indemnité pour l'exécution du plan de récupération ; collatéral potentiel = actifs DAO + revenu futur du protocole ; plafonds définis (montant max agrégé, part de revenu affectée au remboursement plafonnée, durée de remboursement max, refinancement possible).

### Disclaimer
TokenLogic, SP actif, bénéficiaire du stream 100072, périmètre défini par thread 23223.

## Débat communautaire (posts #2-26, #28-36) — positions, pas des faits, résumé sans reformuler les chiffres porteurs

Vaste débat sur la **conditionnalité** de la contribution (poser une réforme du cadre de risque collatéral AVANT décaissement) — position développée en détail par `robtg4` (post #4, alias « Robby Greenfield | tokedex.org ») : plaide pour un cadre de LTV par « profondeur de dérivé » (natif 80-85 %, 1er ordre type stETH 75-80 %, 2ᵉ ordre type rsETH 65-70 %, bridgé-rehypothéqué type rsETH-sur-L2 50-55 % ou inéligible) — **proposition personnelle, non adoptée dans ce thread**, publiée par ailleurs sur un blog externe (tokedex.org, hors vérification primaire).

`AlanWestbrook` (post #10) : demande de séquencement — ajuster les paramètres de risque AVANT le retour à la normale, et propose un tableau de bord public indépendant façon L2BEAT pour le risque collatéral — position, pas un fait.

Nombreux posts (post #18, `ST0X`) confirment de façon indépendante (encore une fois, en dehors des threads CAPO déjà lus) : **« ACI's Marc Zeller and Chaos lab are exiting now »** — troisième source primaire concordante (après le post-mortem CAPO thread 24269/24275 et thread 24446) sur le départ de Marc Zeller/ACI et de Chaos Labs.

Post #27 (**TokenLogic, réponse officielle, 2026-04-27T15:48:49Z**) : découple explicitement les deux chantiers — le sauvetage (25 000 ETH) avance vers Snapshot **sans condition** de réforme du cadre de risque ; la réforme du cadre de risque sera portée séparément par LlamaRisk, « on its own timeline ». **Snapshot annoncé** : créé 27 avril 2026 16:02 UTC+1, ouvert 28 avril 16:02 UTC+1, clos 1er mai 16:02 UTC+1. Lien : `snapshot.org/#/s:aavedao.eth/proposal/0xb866cbbc...`.

## Contradiction chiffrée notable (doc 03 règle 7, non tranchée)

Le montant de rsETH « libéré »/« volé » varie selon la source, y compris dans ce thread par rapport au thread 24580 (lu séparément le même jour) :
- **116 500 rsETH** — montant cité par `LEON_THE_GR8T` (post #32, thread 24740) comme « silently minted... without a matching source-side burn », et confirmé dans le rapport primaire lui-même (thread 24580, voir fichier associé) comme le montant effectivement transféré à l'attaquant.
- **152 577 rsETH** — cité par TokenLogic (post #1, thread 24740, paraphrasant « the Llamarisk report ») comme le total des « remote claims » (créances L2 cumulées contre l'adaptateur, incluant les détenteurs légitimes préexistants ET la part volée).
**Résolution obtenue par la lecture complète du thread 24580 (voir fichier associé) : ce ne sont PAS deux valeurs contradictoires du même fait, mais deux mesures différentes** (montant dérobé vs total des créances L2 en circulation contre l'adaptateur) — clarifié ici pour éviter qu'un lecteur futur de ce seul thread 24740 ne les traite comme incohérentes.

## Ce que ce thread n'établit pas

- Le résultat du vote Snapshot lui-même (créé/ouvert/clos dans la fenêtre du thread, mais le résultat n'est pas posté dans ce thread — voir thread 24580 post #173 pour la suite : AIP levé le 2026-05-01).
- Le montant exact final (« refined figures ») de la contribution — le post #1 dit explicitement que « refined figures... will be disclosed in a subsequent publication ».
- Aucune donnée sur les paramètres d'oracle rsETH (hors périmètre de ce thread, traité dans le thread 24580).
- Le détail des « backers institutionnels de Kelp » ou toute négociation avec eux (mentionné par des posts tiers, non confirmé officiellement dans ce thread).

## NON TROUVÉ

1. Chiffrage final « refined » de la contribution DAO (renvoyé à une publication ultérieure par le texte lui-même).
2. Contenu du thread 24726 (« temp-check... rsETH collateral framework tier-based LTV reductions »), cité par `robtg4` post #4, non lu cette passe.
3. Contenu du thread 24450 (« ARFC add support for Rocket Pool staked ETH (rETH) on Aave v4 »), cité en comparaison par `robtg4`, non lu.
4. Résultat détaillé du vote Snapshot 0xb866cbbc... (pourcentage, quorum) — non capturé, hors périmètre Discourse.

## Procurements formés (nouveaux)

| Réf | Document | Identité | Tentatives | Usage prévu |
|---|---|---|---|---|
| PR-UK-18 | « temp-check-post-rseth-collateral-framework-tier-based-ltv-reductions-and-wrap-depth-ineligibility-limits » | thread 24726, cité par thread 24740 post #4 | URL identifiée, non fetchée | Cadre de LTV par profondeur de dérivé, si Ukemi doit modéliser des seuils LTV différenciés pour LST/LRT bridgés |

## Journal des URL

| URL | Outil | Résultat | Date |
|---|---|---|---|
| `governance.aave.com/t/24740.json` | curl | 200, 20/34 posts (page 1) | 2026-09-20 |
| `governance.aave.com/t/24740/posts.json?post_ids[]=...` (15 ids) | curl | 200, 15/15 posts demandés reçus (incl. post système) | 2026-09-20 |

Aucun 429 rencontré sur ce thread.
