# FAITS — vocabulaire du README v0.7 (lecture sur place, orchestrateur `claude-fable-5-1`, 2026-09-24 01:2x-01:3x UTC)
Règle « lecture sur place » (investisseur 2026-09-20) : navigateur interne d'abord ; citations ≤ 25 mots ; aucun chiffre réutilisé comme fait.

## Lus (navigateur interne, `get_page_text`)
- `https://en.wikipedia.org/wiki/Agentic_AI` → redirigé « AI agent » [lu 01:2x UTC] : « An AI agent is an artificial intelligence program that can pursue goals, use software or other tools, and take actions with some level of autonomy » ; « no universally agreed-upon definition » ; attributs communs : « goal-directed behavior, use of external tools, the ability to interact with and modify an external environment » ; **« Agent harness »** : « the software layer surrounding a large language model that enables it to function as an AI agent » (prompts, contexte, outils, mémoire, permissions) ; « reinforcement learning environments to train or evaluate AI agents » ; motifs d'orchestration : prompt chaining, routing, parallelization, **planner-critic**. Bandeau de fiabilité des sources (déc. 2025) — vocabulaire seulement, aucun fait probant tiré.
- `https://www.anthropic.com/research/building-effective-agents` [lu 01:3x UTC] (Anthropic, 2024-12-19) : « we categorize all these variations as **agentic systems**, but draw an important architectural distinction between **workflows** and **agents** » — « Workflows are systems where LLMs and tools are orchestrated through predefined code paths » ; « Agents … dynamically direct their own processes and tool usage ».

## Non lu (non contourné)
- `https://academy.binance.com/en/articles/what-is-defai-and-how-does-it-work` : page rendue vide par le navigateur interne (contenu JS) — non contournée ; le terme **DeFAI** est déjà celui du README v0.6 (« Harness — DeFAI, multi-directional ») et reste employé tel quel.

## Choix de vocabulaire retenus pour le README (et pourquoi)
- « **AI agents** » / « **agentic systems** » (Anthropic) à la place du mot de l'investisseur « agents autonomes » : « autonomous » est dans la liste des mots interdits sur les surfaces publiques (contrainte investisseur permanente) ; « some level of autonomy » (Wikipedia) montre que le mot promet plus que ce qui est mesuré.
- « **agent harness** » (Wikipedia) : nomme exactement `apps/harness` (MCP/HTTP) — la couche par laquelle un agent atteint le moteur.
- « **instrumented environment** » plutôt que « environnement étudié » : un environnement où chaque lecture est attestée (bytes + hash + résidus), chaque contrat gelé, chaque timeline rejouable, et où l'abstention est le défaut — ce qu'un agent peut vérifier, pas seulement croire.
- « **measurement-first** / **empirically grounded** » pour « en partant d'études empiriques » : chaque pièce naît d'une étude sur données de chaîne et garde ses artefacts (calibration committée, book enregistré à bloc d'archive, timeline chaînée).
- « **DeFAI layer** » (moteur) et « **AI layer** » (agents d'adaptation) — deux faces ; « one handle, several blades » pour le couteau suisse.
- « **adaptive** / **kept adapted** » plutôt que « évolutif » (evolvable = jargon) ; « **workflows** under human acceptance » pour la façon dont le moteur est construit aujourd'hui (aucun nom d'agent, aucune gouvernance interne en public).
