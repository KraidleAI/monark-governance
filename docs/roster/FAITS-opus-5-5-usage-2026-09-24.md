# FAITS — « Getting the Most Out of Opus 5.5 in Claude and Claude Code » (Addy Osmani, claude.dev, 22 septembre 2026)

Lu le 2026-09-24T06:00Z par l'orchestrateur, niveau **[abs]** : le navigateur interne a refusé `claude.dev` (« navigation denied or failed »), lecture par WebFetch (conversion markdown), donc pas une lecture sur place. Transmis par l'investisseur le 2026-09-24 (« voici comment la team Anthropic conseille de travailler avec Opus 5.5 »). URL : https://claude.dev/blog/getting-the-most-out-of-opus-5-5/

## Règles de l'article (citations ≤ 25 mots)

1. Tâche complète en un message, ligne d'arrivée nommée : « Give the whole task in one message. Name the finish line. Then leave it alone. »
2. Retirer « think carefully » et équivalents : « Opus 5.5 always thinks before it replies. » Pour une question rapide : « Answer directly ».
3. Design : lister les styles à exclure plutôt que décrire vaguement.
4. Ajustements en cours de route par message, sans relancer.
5. Règles d'arrêt dans CLAUDE.md : « Stop and ask only when you can't continue without me, or before anything destructive. » Garder les invites de permission pour les actes destructifs.
6. Gros audits et migrations : « split the work across subagents and check each result ».
7. Fichier de tâches suivi (TASKS.md) pour les longs runs qui dépassent les résumés de contexte.
8. À la fin d'un run : lire d'abord ce qui demande une décision (« Needs from you »), ensuite le reste.
9. Revue de code par le modèle avant la revue humaine, en ne listant que les bloquants de fusion.
10. Recherche : « mark anything you couldn't confirm, and say where you looked. »
11. Ne jamais demander de reproduire le raisonnement interne dans la réponse (déclencheur de filtres bio/cyber ; en cas de bascule automatique vers un modèle plus ancien : `/model`, `/feedback`).
12. Fast mode (`/fast`) : aperçu de recherche, texte plus rapide, coût en jetons plus élevé.

## Application MONARK (orchestrateur, 2026-09-24)

- Déjà en place : tâche entière + rendu attendu dans chaque mission ; fan-out par sous-agents pour audits (workflow site 5 jours) ; CHANTIERS.md = fichier de tâches horodaté ; G2 (revue modèle) avant checkpoint (revue humaine déléguée) ; niveaux [lu]/[abs]/[2nd] = « mark anything you couldn't confirm ».
- À appliquer dès la prochaine mission : (a) aucun « réfléchis bien », « avec soin », « analyse en profondeur » dans les missions ni dans les frontmatters `~/.claude/agents/*.md` (à balayer : item ROSTER-THINK-WORDING-1) ; (b) chaque rendu de worker/relecteur/validateur ouvre par une section **« Needs from you »** (bloquants, arbitrages, dus) avant les mesures ; (c) jamais « montre ton raisonnement » ; (d) règle d'arrêt explicite dans chaque mission : continuer seul, s'arrêter seulement si bloqué sans l'orchestrateur ou avant un acte destructif ou réseau sortant.
