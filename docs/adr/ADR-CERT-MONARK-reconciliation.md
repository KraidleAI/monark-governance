# ADR — Réconciliation token : `$CERT` (Grok) → mécanique de MONARK (2026-09-04)
- **Statut** : **RATIFIÉ par l'investisseur le 2026-09-04** (réponse « Oui, ratifié » à la question formée (b) de
  l'ADR-M002 §4, posée en langage simple : un seul token MONARK ; sa mécanique = capacité d'autorisation conforme
  restante de la flotte, ressource depletable, jamais un rendement ni un PnL). Historique : proposé par
  l'orchestrateur le 2026-09-04 (G7 Phase 0), ratification due avant la Phase 3 — **rendue**. Sur le fil,
  `GateDecision.remaining_budget: number` reste agnostique du token ; la Phase 3 vitrine/token s'appuie sur cette ADR.
- **Rattachement** : `ROADMAP-MONARK.md` §Phase 0/3 ; décortication Grok `hikae/GROK-DECORTICATION.md` §4/§9 ;
  nommage MONARK (mémoire 08043503) ; Grok ADR-0005/0008/0013 + Thm H5.

## Contexte — la contradiction
L'app HIKAE de Grok est bâtie autour de **`$CERT`, un token propre à HIKAE** (Grok ADR-0005 : « souverain de
Shōgen et de Kraidle ; token `$CERT` licite ici » ; trois souverains, chacun son token). Sa thèse-token (Grok
Thm **H5** / ADR-0013) est **originale et bonne** : `$CERT` **tokénise la capacité d'autorisation conforme
restante** `B_t` (le slack de couverture), **pas un Sharpe/PnL** — analogue au serveur d'autorisation von Solms.
**MAIS** décision investisseur (2026-09-03) : **MONARK = le SEUL token/ticker/vitrine** ; les sous-agents
(Shōgen/HIKAE/UKEMI) sont des « X agent », **pas des tokens**. → `$CERT` séparé **contredit** MONARK-seul.

## Décision
1. **`$CERT` est RETIRÉ comme token distinct.** Aucun token HIKAE séparé. Un seul token : **MONARK**.
2. **La thèse H5 SURVIT, attachée à MONARK.** L'utilité-token de MONARK = **la capacité d'autorisation conforme
   restante à travers la flotte des trois agents** : le droit de faire *agir* l'agent (un `perps_order_*`, une
   décision UKEMI) **sous couverture attestée** — une ressource **depletable**, soldée par les labels arrivés,
   **jamais un rendement**. C'est le récit de Grok ADR-0008 (« spread brut → certifié ») + H5, **re-cible sur MONARK**.
3. **Le nom `$CERT` disparaît** des docs, du site, du token ; on écrit **MONARK**. La mécanique (B_t, le gate
   COMMIT/DEFER/ABSTAIN) reste, comme **attribut de MONARK**.
4. **Discipline de vocabulaire conservée** (09 Grok) : le token n'est pas un PnL/Sharpe ; interdit de citer un
   rendement papier (Renkema) comme live ; l'erreur|COMMIT n'est pas 1−α (H2.3).

## Conséquences
- **La feuille de route token de Grok (S5-S7 : lancement, SLA on-chain, revente x402) re-cible MONARK** — pas un
  token par agent. La Phase 3 vitrine/token de `ROADMAP-MONARK.md` s'appuie sur cette thèse.
- **Utilité on-chain** : comme chez Grok, **pas d'utility avant le pricer/x402** (leur S7). Avant : le token est
  l'inscription ClawPump + le récit — **l'écrire honnêtement**, ne pas inventer un buyback.
- **Aucune fusion de calcul entre agents** au niveau on-chain ; MONARK est la **couche de tokenisation** au-dessus,
  pas un runtime qui recalcule Shōgen/HIKAE/UKEMI.
- Les trois agents restent **techniquement souverains** (dépôts/worktrees séparés, contrats d'interface) ; seule
  la **tokenisation** est unifiée sous MONARK — cohérent avec « un agent, un token, N piles ».

## Alternatives écartées
- **Garder `$CERT` + MONARK** (deux tokens) : rejeté — contredit MONARK-seul, dilue, casse le récit vitrine.
- **Abandonner H5** : rejeté — c'est le meilleur angle-token du corpus (la capacité d'autorisation, pas un
  rendement). On le garde, on le déplace.

## À faire — propriétaire : **orchestrateur MONARK** ; jalon : **Phase 3** (vitrine/token)
- Purger `$CERT` des futurs docs/site/token → MONARK. *(orchestrateur MONARK, Phase 3)*
- Écrire la thèse-token MONARK (capacité d'autorisation conforme de la flotte) dans le dossier vitrine.
  *(orchestrateur MONARK, Phase 3 — après ratification investisseur de cette ADR)*
