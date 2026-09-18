# Campagne de procurement — Agents gardes & x402 (M015)

**Rôle** : chercheur (Sonnet 5, `effort: max`, Write limité à ce fichier).
**Gate 0** : modèle résolu = **`claude-sonnet-5`** (Sonnet 5, confirmé par le system-reminder d'environnement). Préfixe conforme à l'attendu. Contrôle fait avant toute production.
**Date de la passe** : 2026-09-18.
**Mission** : 4 procurements formés (§5 `F:\Monark\docs\etude-suite-2026-09-18\PLAN-STRATEGIE.md` : PR-1, PR-6, PR-7, PR-11).
**Discipline** : [lu] = source ouverte par moi aujourd'hui ; [abs] = résumé/recherche seule ; [2nd] = fait établi par une source antérieure du corpus, non réouvert aujourd'hui, daté. Citations ≤ 25 mots. Classes P1 (primaire officielle) / P2 (presse, recherche indépendante) / P3 (blog/listicle sans pièce). « NON TROUVÉ » consigné, jamais comblé par supposition. Aucun appel à l'advisor intégré pendant l'extraction (filtre de régurgitation, CLAUDE.md §ADVISOR). Aucun commit (R-20).
**Priors consultés (contexte, non dupliqués)** : `C:\Users\KACIMI\Downloads\MONARK SUITE\produit-H-openclaw-skill.md` (fiche produit H, non datée dans le corps, lue aujourd'hui) ; `F:\Monark\docs\R-P4-skills-recon.md` (chercheur Sonnet 5, 2026-09-11, [2nd] pour les faits non réouverts par moi) — grep `before_tool\|pre-tool\|pretool\|middleware\|guard` sur ce fichier = **0 résultat aujourd'hui**, confirmé. Idem grep `blockaid`/`metamask` : Blockaid présent mais qualifié « non vérifié en primaire » par R-P4 [2nd, 2026-09-11] (levé par PR-6 ci-dessous) ; MetaMask absent de R-P4.

## État (tenu à jour au fil de l'eau, réécrit après chaque procurement)
- PR-1 (hook `before_tool` OpenClaw) : **obtenu intégralement**, P1, [lu] aujourd'hui.
- PR-6 (Blockaid AI agent tools) : **partiel** — statut déclaré (« private beta », 2025-01-02) et intégrations obtenus en P1 ; statut actualisé à sept. 2026 et pricing **NON TROUVÉ**, demande de procurement formée.
- PR-7 (MetaMask Agent Wallet, Guard Mode) : **obtenu intégralement** pour les 4 sous-questions posées, P1, [lu] aujourd'hui (docs GitHub `MetaMask/metamask-docs`, source du site docs.metamask.io) ; un point non couvert par la doc consigné en NON TROUVÉ (journal historique des décisions refusées/expirées, distinct de l'historique on-chain).
- PR-11 (x402 Bazaar) : en cours.

---

## PR-1 — Hook `before_tool_call` OpenClaw

### Identité de la source primaire
- **Éditeur / dépôt** : `openclaw/openclaw` (runtime OpenClaw), GitHub, organisation `openclaw`.
- **Description dépôt (verbatim)** : « The AI that really does things. Any OS. Any Platform. The lobster way. 🦞 » [lu, `gh api repos/openclaw/openclaw`, 2026-09-18].
- **Métriques dépôt aujourd'hui** : 390 050 étoiles, 82 001 forks [lu, `gh api repos/openclaw/openclaw`, `updated_at` 2026-09-18T20:14:36Z]. Comparaison : R-P4 avait mesuré 389 422 étoiles / 81 853 forks le 2026-09-11 [2nd] — écart +628/+148 en 7 jours, cohérent avec un dépôt très actif, pas un artefact de mesure.
- **HEAD épinglé pour cette passe** : `47c4fbcb20d2b2a280d6d6aa55cd9e559206212a`, commit daté `2026-09-18T20:13:41Z` [lu, `gh api repos/openclaw/openclaw/commits/main`, 2026-09-18]. Différent du HEAD R-P4 du 2026-09-11 (`4e32fcc1687725ffc9135d5de0fe3b2436d51218`) — le dépôt a avancé entre les deux passes, cohérence attendue.
- **Version de release** : `2026.9.4` (calendar versioning `YYYY.M.N`) [lu, `package.json` racine à HEAD `47c4fbcb2…`, champ `version`, 2026-09-18].
- **Fichiers lus intégralement aujourd'hui** (raw.githubusercontent.com, SHA épinglée `47c4fbcb2…`) :
  - `docs/plugins/hooks.md` — « Plugin hooks »
  - `docs/plugins/hooks/reference.md` — « Hook catalog »
  - `docs/plugins/hooks/tool-policy.md` — « Tool call policy hooks »
  - `docs/plugins/plugin-permission-requests.md` — « Plugin permission requests »
  - `docs/gateway/audit.md` — « Audit history »
  - `docs/plugins/sdk-overview/infrastructure.md` — « Plugin SDK infrastructure registration »
  - `docs/tools/skills.md` — relecture ciblée §« Plugins and skills », pour trancher la relation skill/plugin

### Ce que la source établit

**1. Le hook existe. Il s'appelle `before_tool_call`, pas `before_tool`.** Table de choix [lu, `docs/plugins/hooks.md`] : « Block a tool or request approval | `before_tool_call` ». Catalogue [lu, `docs/plugins/hooks/reference.md`] : « `before_tool_call` | Modify / gate | Rewrite tool params, block execution, or require approval ».

**2. Signature exacte** [lu, `docs/plugins/hooks/tool-policy.md`]. `before_tool_call` reçoit un `event` (`toolName`, `params`, en option `toolKind`/`toolInputKind`, `derivedPaths` — « may be incomplete or over-approximate » —, `runId`, `toolCallId`) et un `ctx` (`agentId`, `sessionKey`, `sessionId`, `runId`, `trace`, `abortSignal`, `requester` avec `channel`/`accountId`/`senderId`/`senderIsOwner`/`roleIds` — « Missing fields are unproven, not false assurances; fail closed when policy requires them »).

Type de retour exact (verbatim code) :
```typescript
type BeforeToolCallResult = {
  params?: Record<string, unknown>;
  block?: boolean;
  blockReason?: string;
  requireApproval?: {
    title: string; description: string; scope?: ApprovalScope;
    severity?: "info" | "warning" | "critical"; timeoutMs?: number;
    allowedDecisions?: Array<"allow-once" | "allow-always" | "deny">;
    pluginId?: string;
    onResolution?: (decision: "allow-once"|"allow-always"|"deny"|"timeout"|"cancelled") => Promise<void> | void;
  };
};
```

**3. Ce qu'il peut bloquer/différer.** Trois leviers, pas un simple booléen :
- `block: true` → terminal, « skips lower-priority handlers » [lu].
- `params` → réécriture des paramètres outil avant exécution (dernier retour gagnant, jusqu'à approbation demandée).
- `requireApproval` → **suspend** l'exécution et attend une décision humaine via `plugin.approval.*` : « pauses the agent run and asks the user through plugin approvals » [lu]. C'est le mécanisme le plus proche d'un « defer » : décisions possibles `allow-once` / `allow-always` / `deny` / `timeout` / `cancelled`, **fail-closed** par défaut — « Timeout → The call is blocked » et « No approval route → The call is blocked » [lu, `plugin-permission-requests.md`, table « Decision behavior »].
- Délai de la garde elle-même (distinct du délai d'approbation humaine) : **15 secondes**, fail-closed au dépassement — « `before_agent_run`, `before_tool_call`, `before_install` | 15 seconds | Fail closed: block the run, tool call, or install » [lu, `reference.md`]. Délai d'approbation humaine (`requireApproval.timeoutMs`) séparé : défaut 120 000 ms, plafond 600 000 ms [lu, `plugin-permission-requests.md`].
- Palier supplémentaire, plus proche d'une garde de type budget : `api.registerTrustedToolPolicy(...)`, exécuté **avant** les hooks `before_tool_call` ordinaires, réservé « for host-trusted gates such as workspace policy, budget enforcement, or reserved workflow safety » [lu, `tool-policy.md`, verbatim]. C'est la primitive documentée la plus proche d'un « GateEnvelope » côté hôte — mais décrite comme un tiers *host-trusted* distinct des hooks de plugin ordinaires, pas comme un budget prêt à l'emploi.

**4. Comment l'état persiste côté opérateur — trois couches distinctes, aucune n'étant un compteur de budget prêt à l'emploi :**
- **Décisions d'approbation terminales** : « Terminal operator approvals are a separate authoritative source » [lu, `docs/gateway/audit.md`], adaptées en « decision receipts » consultables via `openclaw audit --execution <id> --explain` ou la méthode `audit.run.inspect`. Journal d'audit **métadonnées seulement** : « It never stores prompts, message bodies, tool arguments, tool results, attachments, filenames, URLs, command output, or raw error text » [lu, verbatim]. Stocké dans « the shared OpenClaw state database » (SQLite), **désactivé par défaut** (« off by default, including on fresh installs and upgrades »), persistance **best-effort** : « Queue saturation, storage failure, shutdown timeout, and process crashes can lose evidence » [lu].
- **Confiance durable (`allow-always`)** : **non automatique**. Verbatim [lu] : « `allow-always` is only durable when the requesting plugin or runtime implements that persistence. » Le framework transmet la décision résolue au plugin (`onResolution`) ; c'est au plugin d'écrire et relire cet état lui-même.
- **Primitive pour un état applicatif propre au plugin (ex. un budget `B_t` qui décrémente)** : `runSqliteImmediateTransaction(db, prepare, options?)` (module `openclaw/plugin-sdk/sqlite-runtime`) — admission en écriture sur la base SQLite partagée sans bloquer la boucle d'événements, callback de transaction **synchrone**, non rejoué après commit [lu, `docs/plugins/sdk-overview/infrastructure.md`]. Voie documentée la plus proche pour un compteur `B_t` **persisté par le plugin lui-même** — OpenClaw ne fournit aucun compteur de budget natif clé-en-main.

**5. Historicité.** `before_tool_call` (et les fichiers `before-tool-call*`) apparaissent dans plusieurs fichiers changelog datés (`CHANGELOG/2026.2.1.md`, `2026.2.12.md`, `2026.2.13.md`, `2026.2.17.md`, `2026.3.2.md`, `2026.3.28.md`, `2026.4.5.md`, `2026.5.26.md`) — existence de chemins confirmée par recherche de code [lu, chemins seulement], **contenu non lu** aujourd'hui. Le hook n'est donc pas une nouveauté de la version courante ; présent au moins depuis début 2026 d'après cette liste, sans confirmation de sa date d'introduction exacte.

### Ce que la source NE dit PAS (et qui complique la prémisse du produit H)

- **`before_tool_call` est un hook de PLUGIN natif, pas une « skill ».** Verbatim [lu, `docs/plugins/hooks.md`] : « Plugin hooks let a native OpenClaw plugin observe or change agent runs, tool calls... ». Et : « native plugins run in the Gateway process » [lu]. Un plugin s'enregistre via `register(api) { api.on("before_tool_call", ...) }`, packagé avec `openclaw.plugin.json` + `package.json`, installé par `openclaw plugins install --link <dir> --force` puis `openclaw plugins enable <id>`.
- **« Skill » (fichier `SKILL.md`) et « plugin » sont deux systèmes distincts dans le vocabulaire OpenClaw lui-même.** Vérifié en relisant `docs/tools/skills.md` §« Plugins and skills » [lu] : « Plugins can ship their own skills by listing `skills` directories in `openclaw.plugin.json`... ». C'est-à-dire : un plugin peut embarquer des skills (markdown découvert par le modèle), mais l'inverse n'est pas vrai — une skill seule, sans code de plugin, n'a pas d'API impérative et ne peut pas appeler `api.on("before_tool_call", ...)`. La fiche produit H (« Un MCP server (ou skill OpenClaw) : `before_tool(tool, args, context) → GateDecision` ») traite MCP server et skill OpenClaw comme des variantes interchangeables d'un même mécanisme ; la doc primaire dit le contraire : skill (markdown, découverte modèle), MCP server (protocole pour outils externes, connecté via `openclaw mcp add` — cf. R-P4 §1.2 [2nd, 2026-09-11]), et plugin (code natif in-process, seul habilité à poser un `before_tool_call`) sont trois choses différentes.
- **Aucun mécanisme documenté aujourd'hui n'expose `before_tool_call` par-dessus MCP pour un serveur externe au procédé Gateway.** `api.registerMcpServerConnectionResolver(...)` sert à ce qu'OpenClaw **consomme** un serveur MCP externe (`url`/`headers` par requester) — pas l'inverse. **NON TROUVÉ** : un chemin documenté qui déléguerait la décision `before_tool_call` à un MCP server H hors procédé Gateway.
- **Portée dépendante du runtime hôte.** « Native tool relays can have narrower contracts. Codex native tools support blocking and observation, but parameter rewrites are rejected » [lu, `tool-policy.md`]. Et : « The catalog is the registration API, not a promise that every runtime emits every hook » [lu, `docs/plugins/hooks.md`] — `before_agent_run` par exemple n'est implémenté que par les runners embedded/CLI, pas Codex/Copilot.
- Le type `BeforeToolCallResult` ne contient aucun champ `p_correct`/`confidence`/`reason_prose_libre` — cohérent avec la contrainte du produit H, mais c'est une observation de ma part sur la forme du type, pas une interdiction déclarée par la doc OpenClaw.
- **NON TROUVÉ aujourd'hui** : contenu détaillé des changelogs individuels listant `before_tool_call` (pour dater précisément son introduction/évolution — seule l'existence de mentions de chemins a été établie).

### Statut
**Obtenu intégralement.** Aucune demande de procurement supplémentaire nécessaire pour répondre à la question de mission (existence, signature, ce qui peut être bloqué/différé, persistance d'état côté opérateur). Point ouvert non bloquant, facultatif, non demandé par la mission : lire le contenu des changelogs `2026.2.1.md` etc. pour dater l'introduction exacte du hook.

---

## PR-6 — Blockaid « AI agent tools »

### Identité des sources primaires
- **Éditeur** : Blockaid (blockaid.io), société de sécurité Web3 ; page d'accueil aujourd'hui la décrit comme « The trust layer for onchain finance », clients affichés incluant Coinbase, Stellar, Polymarket, World, Rainbow, Ledger, Uniswap, Anchorage [lu, `https://www.blockaid.io/`, 2026-09-18].
- **Source A — annonce du produit** : article de blog « How to Build Smarter, Safer Onchain AI Agents with Blockaid », `https://blockaid.io/blog/how-to-build-smarter-safer-onchain-ai-agents-with-blockaid`, daté **January 2, 2025** (date affichée sur la page elle-même : « January 2, 2025 • Use Case ») [lu, 2026-09-18, confirmé par deux passages indépendants : résumé WebFetch + extrait brut `firecrawl_search`].
- **Source B — suivi 20 mois plus tard** : article de blog « Building a Harness That Lets an LLM Explore the Blockchain », `https://blockaid.io/blog/building-a-harness-that-lets-an-llm-explore-the-blockchain`, daté **September 3, 2026** [lu via WebFetch, 2026-09-18].
- **Source C** : page produit `https://blockaid.io/ai-exploit-detection` (« AI Exploit Detection — Blockaid », section « AI at Blockaid »), date de publication non affichée [lu via WebFetch, 2026-09-18].
- **Source D (accès refusé)** : `https://docs.blockaid.io` et `https://docs.blockaid.io/reference/supported-chains` — les deux redirigent en HTTP 307 vers `https://docs-login.blockaid.io/?redirect=...` [tenté, 2026-09-18] : **documentation développeur intégralement gatée derrière une authentification** aujourd'hui, contenu non consultable dans cette passe.
- **Source E (introuvable)** : `https://www.blockaid.io/pricing` → **HTTP 404** [tenté, 2026-09-18]. `https://www.blockaid.io/solutions` → **HTTP 404** également [tenté, 2026-09-18].

### Ce que les sources établissent

**1. Statut déclaré à l'annonce (2025-01-02) : private beta**, verbatim [lu, source A, confirmé par extrait brut firecrawl] : « Available now in private beta » (titre de section) et « Now rolling out in private beta, these tools seamlessly integrate into agent workflows ». L'accès se faisait sur inscription : « If you're a company building in this space and you are interested in joining the beta, get in touch with our team today ».

**2. Intégrations listées à cette date (2025-01-02)**, verbatim [lu, source A] :
- LangChain : « Blockaid has created a pre-built LangChain tool ».
- MCP : « Blockaid supports MCP-based integrations », avec « Blockaid's lightweight MCP server implementation » fournissant l'accès aux simulations de transaction et données de menace.
- OpenAI Function Calling : « Through Function Calling, developers can seamlessly connect their OpenAI-based agents ».
- Frameworks crypto-natifs, verbatim : « integration guides for leading crypto-native AI agents frameworks (like eliza and Virtuals' G.A.M.E) » — confirme nommément **eliza** et **Virtuals' G.A.M.E** (pas juste « Virtuals » générique).
- SDKs/API génériques également proposés.

**3. Fonctions décrites (2025-01-02)** : simulation de transaction en temps réel (« simulate transactions in real time, predicting outcomes »), évaluation de risque de tokens, détection dynamique de menaces (« flag and avoid malicious entities »).

**4. Aucune forme de décision structurée (allow/block/warn) n'est publiée dans aucune des trois pages lues.** Les formulations restent descriptives : source A parle de « predicting outcomes » ; source C (page produit, non datée) décrit un « scored verdict in milliseconds » et un seuil d'escalade : « Cases above a certain risk threshold are investigated by agents » ; source B (2026-09-03) mentionne un exemple concret « Verdict: false positive » et « Every call is logged, attributable », mais ces deux dernières pages documentent le **harnais interne de Blockaid** (ses propres agents-enquêteurs), pas un contrat d'API public de type `allow/block/warn` livré à un intégrateur tiers.

**5. Chiffres d'échelle (source B, 2026-09-03), copiés tels quels avec unité** : « Since 2025, Blockaid scanned over 6.3 billion transactions and blocked 585 million attacks. » — chiffres cumulés depuis 2025, non un débit instantané ; dénominateur non précisé (par jour/mois) au-delà de « since 2025 ».

**6. Partenaires/clients cités dans la source B (2026-09-03)**, verbatim court : « the security infrastructure behind Coinbase, MetaMask, Uniswap, Safe, and dozens of the most widely used platforms ». **Confirmé et précisé par PR-7** : la doc primaire MetaMask Agent Wallet dit explicitement que son threat scanning « is powered by Blockaid » (voir PR-7, source Architecture) — le lien Blockaid↔MetaMask porte donc au moins sur le threat scanning d'Agent Wallet, pas seulement une affirmation marketing non spécifiée.

### Ce que les sources NE disent PAS

- **Aucune confirmation d'un passage en disponibilité générale (GA) entre 2025-01-02 et 2026-09-18.** Recherche dédiée aujourd'hui (`WebSearch "Blockaid general availability OR now available AI agents 2026"`) : aucun résultat annonçant une GA Blockaid, seulement des annonces GA d'acteurs tiers (Blackbaud 2026-03-17, Microsoft Agent 365 2026-05-01) [abs, recherche du jour, 2026-09-18]. La page d'accueil actuelle liste 5 produits phares (« End User Protection », « Onchain Monitoring », « Crypto Fraud Prevention », « Cosigner », « Risk Exposure ») [lu, 2026-09-18] — **« AI agent tools » n'y figure pas comme produit nommé distinct**, 20 mois après l'annonce de la beta privée.
- **NON TROUVÉ : pricing public.** `/pricing` renvoie HTTP 404 aujourd'hui ; aucune des trois pages lues ne mentionne un tarif, un modèle de facturation (par appel, par mois, par volume) ni un plan.
- **NON TROUVÉ : documentation technique du contrat d'API** (schéma de requête/réponse exact, y compris la forme précise de la décision — allow/block/warn ou score continu). `docs.blockaid.io` est gaté derrière une authentification (redirection 307 systématique vers `docs-login.blockaid.io`) ; impossible de vérifier le contrat d'intégration MCP/LangChain à jour sans compte.
- Les sources B et C (2026) documentent le harnais **interne** de Blockaid (agents qui enquêtent pour Blockaid elle-même) et non le statut à jour du produit **externe** « AI agent tools » annoncé en 2025 pour des développeurs tiers — la continuité entre les deux n'est pas explicitée dans les pages lues ; il est possible que ce soit la même initiative rebaptisée, ou deux choses distinctes. **NON TROUVÉ** : confirmation explicite du lien entre les deux.

### Statut
**Partiel.** Obtenu : statut déclaré à l'annonce (private beta, 2025-01-02, P1), liste d'intégrations à cette date (P1), fonctions décrites (P1), chiffres d'échelle 2026 du harnais interne (P1), preuve négative sourcée pour le pricing (404) et pour la doc technique (gate d'authentification), et confirmation croisée via PR-7 que Blockaid alimente le threat scanning de MetaMask Agent Wallet.
**Demande de procurement formée** (reste dû, non comblé par supposition) :
- **Objet** : confirmation du statut actuel (toujours private beta, ou GA, ou abandonné) du produit « AI agent tools » de Blockaid annoncé le 2025-01-02, et accès à `docs.blockaid.io` pour le contrat d'API exact et un éventuel pricing.
- **Identité bibliographique** : Blockaid Inc., `https://blockaid.io/blog/how-to-build-smarter-safer-onchain-ai-agents-with-blockaid` (2025-01-02) comme point de départ ; `https://docs.blockaid.io` (accès authentifié requis).
- **Tentatives faites, datées** : `https://docs.blockaid.io` → 307 vers login (2026-09-18) ; `https://docs.blockaid.io/reference/supported-chains` → 307 vers login (2026-09-18) ; `https://www.blockaid.io/pricing` → 404 (2026-09-18) ; `https://www.blockaid.io/solutions` → 404 (2026-09-18) ; `WebSearch` GA/pricing (2026-09-18, sans résultat pertinent) ; `firecrawl_search` ciblé MCP/intégrations (2026-09-18, sans nouvelle page trouvée au-delà de la source A).
- **Usage prévu** : trancher si Blockaid est un « incumbent » comparable pour Genkan au sens d'un produit accessible/tarifé aujourd'hui, ou seulement un signal directionnel (beta 2025 sans suite publique confirmée) — impact direct sur le positionnement concurrentiel du produit H/Genkan (G-0).
- **Voie de levée suggérée** : demande d'accès démo/beta via le formulaire `blocka.id/demo` cité dans la source A, ou compte `docs.blockaid.io` — action hors périmètre d'un chercheur en lecture (nécessite une identité d'entreprise/mainteneur).

---

## PR-7 — MetaMask Agent Wallet, Guard Mode

### Identité des sources primaires
- **Éditeur / dépôt** : `MetaMask/metamask-docs` (source du site `docs.metamask.io`), GitHub, organisation `MetaMask` [lu, `gh api repos/MetaMask/metamask-docs`, 2026-09-18].
- **HEAD épinglé** : `2663f4903af46b0057fc10838661a9ea4dac2a08`, `pushed_at` dépôt `2026-09-17T09:06:41Z`, commit daté `2026-09-17T09:06:38Z` [lu, 2026-09-18] — docs mises à jour la veille de cette passe.
- **Fichiers lus intégralement aujourd'hui** (raw.githubusercontent.com, SHA épinglée `2663f4903…`) :
  - `agent-wallet/reference/trading-modes.md` — « Trading modes » (Guard Mode vs Beast Mode)
  - `agent-wallet/reference/outflow-policy.md` — « Outflow policy »
  - `agent-wallet/reference/architecture.md` — « Architecture »
  - `agent-wallet/reference/commands.md` — « Commands reference » (794 lignes, CLI complète)
- **Recoupement** : le contenu obtenu en lecture directe GitHub correspond mot pour mot à ce que `WebFetch` a restitué pour `https://docs.metamask.io/agent-wallet/reference/architecture/` (ex. phrase « Eligible transactions deemed safe are backed by Transaction Protection coverage up to $10,000/month » présente dans les deux) — confirme que le dépôt GitHub est bien la source du site de doc publié, pas juste un miroir approximatif.
- **Pages complémentaires** [lu via WebFetch, dégradé — résumé par outil, pas octets bruts] :
  - `https://support.metamask.io/manage-crypto/transactions/transaction-shield/` (conditions Transaction Shield)
  - `https://metamask.io/news/agentic-wallet-security` — « What actually keeps an AI agent from draining your wallet », datée **16 juillet 2026** selon le rendu WebFetch
  - `https://metamask.io/news/introducing-metamask-agent-wallet` — datée **~6 août 2026** selon le rendu WebFetch (« officially launches today »)
- **Repère de presse, non relu en primaire aujourd'hui** [abs, WebSearch du jour] : early access à 200 places daté du **8 juin 2026** (URL datées `coindesk.com/tech/2026/06/08/...`, `genfinity.io/2026/06/08/...`). Chronologie cohérente : accès anticipé (juin) → article de sécurité approfondi (juillet) → lancement élargi/« officiel » (août) — présentée telle quelle, sans trancher moi-même une contradiction qui n'en est probablement pas une (trois jalons d'un déploiement progressif), la date exacte du jalon « officially launches » restant [lu via WebFetch, dégradé] et non vérifiée sur le HTML brut.

### Ce que les sources établissent

**1. Règles configurables — stockées comme policy YAML côté server-wallet.** Commandes CLI [lu, `commands.md`] : `mm wallet policy get`, `mm wallet policy set --policy <yaml> [--no-wait]`, `mm wallet policy template`. Contenu de la policy [lu, `trading-modes.md`] : allowlist réseau, allowlist d'adresses, allowlist de destinataires de tokens, et une **limite de sortie roulante sur 24h** (« Rolling 24-hour outflow limit »). Fixée/modifiée au choix pendant `mm init` (`--mode guard`/`--mode beast`) ou après coup via `mm wallet trading-mode set guard|beast`. **Modifier la policy elle-même exige une 2FA** : « This command blocks until the policy change is approved via MetaMask Mobile or email (2FA) » [lu, `commands.md`].

**2. Deux modes, comparaison exacte des garde-fous** [lu, `trading-modes.md`, tableau verbatim reproduit] :

| Guardrail | Guard Mode | Beast Mode |
|---|---|---|
| Threat scanning | oui | oui |
| Network allowlist | oui | non |
| Address allowlist | oui | non |
| Token recipient allowlist | oui | non |
| Rolling 24-hour outflow limit | oui | non |

**3. Ce qui déclenche le renvoi humain (2FA) — table exacte** [lu, `trading-modes.md`] :

| Condition | Guard Mode | Beast Mode |
|---|---|---|
| Malicious transactions | oui | oui |
| Risky contracts | oui | oui |
| Anything outside your allowlists | oui | non |
| Raising your outflow limit | oui | non |

Verbatim : « In Beast Mode, only malicious and risky transactions trigger approval. » Le canal d'approbation dépend de la méthode de connexion [lu] : QR code (MetaMask Mobile) → « MetaMask Mobile push notification » ; Browser (Google ou email) → « Email link ». Pendant l'attente, la requête est dans l'état `AWAITING_MFA` [lu, `architecture.md`] : « the job enters an `AWAITING_MFA` state until you approve via MetaMask Mobile (QR sign-in) or email (browser sign-in) ».

**4. Le threat scanning est explicitement sous-traité à Blockaid**, verbatim [lu, `architecture.md`] : « Threat scanning is powered by Blockaid and production-tested across millions of MetaMask transactions. Malicious transactions get auto-bounced. » — confirme et précise le lien listé côté Blockaid (PR-6, source B) : ce n'est pas qu'une logo-partnership marketing, c'est le moteur de detection cité nommément dans la doc technique MetaMask.

**5. Journal / export.** Flags CLI globaux [lu, `commands.md`] : « `--format` : Output format: `text`, `json`, or `toon` (defaults to `text` in a TTY, `json` when piped) » et note d'architecture : « Headless: ... use `--format json` for machine-readable output in scripts and agents » [lu, `architecture.md`]. `mm tx history` liste l'historique on-chain, filtrable (`--addresses`, `--chain-ids`, `--type`, `--limit` 1–50, pagination par curseur `--after`/`endCursor`) [lu, `commands.md`] — donc **exportable en JSON, scriptable**.

**6. Limites de couverture (« 10 000$/mois ») — conditions exactes** [lu via WebFetch, dégradé, `architecture.md` confirme le chiffre en P1 : « backed by Transaction Protection coverage up to $10,000/month »; détails via support.metamask.io] :
- Plafond : jusqu'à $10 000/mois **au total** (pas par transaction), et jusqu'à **100 transactions éligibles par mois**.
- Abonnement séparé (« Transaction Shield ») : $9,99/mois ou $99/an, essai gratuit de 14 jours, payable en mUSD/USDC/USDT/carte.
- Couverture : interactions dApp, transactions DeFi, mint/vente NFT, réclamations d'airdrop, signatures, transactions par lot ; réseaux supportés listés (Ethereum, Arbitrum, Polygon, Base, Optimism, Avalanche, BSC, Linea, Sei, HyperEVM, MegaETH, Monad, Robinhood).
- Exclusions explicites : compromission de clé privée/phrase de récupération, « speculative and economic loss », exploits au niveau protocole, transferts pair-à-pair, portefeuilles non-MetaMask, modifications du code MetaMask.
- Délais : transaction signée doit être soumise on-chain sous 5 minutes ; réclamation sous 21 jours après confirmation.

### Ce que les sources NE disent PAS

- **NON TROUVÉ : un journal exportable et persistant des décisions passées (approuvé/refusé/expiré), distinct de l'historique on-chain.** `mm wallet requests list` ne liste que les **requêtes en attente** — verbatim [lu, `commands.md`] : « List pending server-wallet requests » — et `mm tx history` **exclut explicitement** les jobs qui n'ont jamais atteint la chaîne : « Pending jobs that never reached the chain are excluded; use `mm wallet requests list` to see stranded or expired requests. » Autrement dit : une transaction **refusée** ou **expirée** en 2FA, une fois sortie de l'état « pending », n'a pas de commande documentée pour la retrouver après coup — ni dans `tx history` (jamais on-chain) ni dans `requests list` (pending seulement). C'est une lacune documentaire réelle, pas juste une absence de recherche : les deux commandes candidates ont été lues en primaire et toutes deux excluent ce cas par construction documentée.
- **Aucune mention d'un format d'export dédié « rapport de conformité »** (CSV signé, écriture vers un tiers, webhook) au-delà du flag générique `--format json`/`--toon` sur les commandes existantes.
- Les pages lues ne précisent pas si le plafond de couverture ($10 000/mois, 100 tx/mois) est **par compte utilisateur** ou **par portefeuille** en cas de multi-wallets — **NON TROUVÉ**.
- Date précise du jalon « lancement officiel » non vérifiée sur HTML brut (seulement via WebFetch dégradé) — voir réserve ci-dessus.

### Statut
**Obtenu intégralement** pour les quatre sous-questions posées par la mission (règles configurables, déclencheur 2FA, journal exportable ou non, limites et conditions du plafond $10k/mois). Un point non couvert par la documentation elle-même est consigné ci-dessus en NON TROUVÉ (pas un échec de recherche : les deux commandes pertinentes ont été lues et le vide est dans leur portée documentée, pas dans ma couverture).

---

## PR-11 — x402 Bazaar

*(en cours — section à compléter après recherche)*

---

## Journal des URL (succès et échecs)

| # | URL / commande | Date | Résultat |
|---|---|---|---|
| 1 | `gh api repos/openclaw/openclaw` | 2026-09-18 | [lu] P1 — métadonnées dépôt |
| 2 | `gh api repos/openclaw/openclaw/commits/main` | 2026-09-18 | [lu] P1 — HEAD `47c4fbcb2…` |
| 3 | `gh search code "before_tool"` etc. (repo:openclaw/openclaw) | 2026-09-18 | [lu] P1 — liste de chemins ; a ensuite rencontré `HTTP 403 rate limit` sur des requêtes suivantes (`api.storage`, `registerTrustedToolPolicy`, `api.kv`) — non critique, contourné via `gh api contents` |
| 4 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/hooks.md` | 2026-09-18 | [lu] P1 |
| 5 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/hooks/reference.md` | 2026-09-18 | [lu] P1 |
| 6 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/hooks/tool-policy.md` | 2026-09-18 | [lu] P1 |
| 7 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/plugin-permission-requests.md` | 2026-09-18 | [lu] P1 |
| 8 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/gateway/audit.md` | 2026-09-18 | [lu] P1 |
| 9 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/sdk-overview/infrastructure.md` | 2026-09-18 | [lu] P1 |
| 10 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/plugins/sdk-overview/memory-and-context.md` | 2026-09-18 | [lu] P1, survolé — non pertinent au fond, pas de citation retenue |
| 11 | `raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/docs/tools/skills.md` | 2026-09-18 | [lu, relecture ciblée] P1 |
| 12 | `gh api repos/openclaw/openclaw/contents/CHANGELOG` | 2026-09-18 | [lu] P1 — liste de fichiers uniquement |
| 13 | `gh api repos/openclaw/openclaw/contents/package.json` | 2026-09-18 | [lu] P1 — version `2026.9.4` |
| 14 | `https://www.blockaid.io/ai-agent-security` (WebFetch) | 2026-09-18 | Échec — HTTP 404 |
| 15 | `https://blockaid.io/blog/how-to-build-smarter-safer-onchain-ai-agents-with-blockaid` (WebFetch) | 2026-09-18 | [lu via WebFetch] P1 |
| 16 | `https://www.blockaid.io/` (WebFetch) | 2026-09-18 | [lu via WebFetch] P1 |
| 17 | `https://blockaid.io/blog/building-a-harness-that-lets-an-llm-explore-the-blockchain` (WebFetch) | 2026-09-18 | [lu via WebFetch] P1 |
| 18 | `firecrawl_search "Blockaid AI agent tools private beta general availability pricing"` | 2026-09-18 | [lu, extraits bruts] — confirme verbatim source A indépendamment de WebFetch |
| 19 | `https://docs.blockaid.io` (WebFetch) | 2026-09-18 | Échec — 307 vers `docs-login.blockaid.io` (authentification requise) |
| 20 | `https://docs.blockaid.io/reference/supported-chains` (WebFetch) | 2026-09-18 | Échec — 307 vers `docs-login.blockaid.io` |
| 21 | `https://www.blockaid.io/pricing` (WebFetch) | 2026-09-18 | Échec — HTTP 404 |
| 22 | `https://www.blockaid.io/solutions` (WebFetch) | 2026-09-18 | Échec — HTTP 404 |
| 23 | `https://blockaid.io/ai-exploit-detection` (WebFetch) | 2026-09-18 | [lu via WebFetch] P1 |
| 24 | `firecrawl_search "blockaid.io AI agent tools MCP server integration guide"` (categories: developer) | 2026-09-18 | [abs] — pas de nouvelle page Blockaid trouvée au-delà de la source A |
| 25 | `WebSearch "Blockaid general availability OR now available AI agents 2026 announcement"` | 2026-09-18 | [abs] — aucune annonce GA trouvée |
| 26 | `WebSearch "MetaMask "Agent Wallet" "Guard Mode" docs rules"` | 2026-09-18 | [abs] — oriente vers `docs.metamask.io/agent-wallet/` |
| 27 | `WebSearch "MetaMask Agent Wallet Guard Mode $10,000 coverage June 2026"` | 2026-09-18 | [abs] — presse datée 2026-06-08 (early access 200 places) |
| 28 | `https://docs.metamask.io/agent-wallet/` (WebFetch) | 2026-09-18 | [lu via WebFetch, partiel — renvoie vers pages de référence] P1 |
| 29 | `https://metamask.io/news/agentic-wallet-security` (WebFetch) | 2026-09-18 | [lu via WebFetch, dégradé] P1, daté 2026-07-16 |
| 30 | `https://docs.metamask.io/agent-wallet/reference/architecture/` (WebFetch) | 2026-09-18 | [lu via WebFetch, dégradé] P1 — recoupé avec lecture GitHub brute |
| 31 | `gh api repos/MetaMask/metamask-docs` + `.../commits/main` + `.../contents/agent-wallet` + `.../contents/agent-wallet/reference` | 2026-09-18 | [lu] P1 — HEAD `2663f4903…`, listing fichiers |
| 32 | `raw.githubusercontent.com/MetaMask/metamask-docs/2663f4903…/agent-wallet/reference/trading-modes.md` | 2026-09-18 | [lu] P1, intégral |
| 33 | `raw.githubusercontent.com/MetaMask/metamask-docs/2663f4903…/agent-wallet/reference/outflow-policy.md` | 2026-09-18 | [lu] P1, intégral |
| 34 | `raw.githubusercontent.com/MetaMask/metamask-docs/2663f4903…/agent-wallet/reference/commands.md` | 2026-09-18 | [lu] P1, intégral (794 lignes) |
| 35 | `raw.githubusercontent.com/MetaMask/metamask-docs/2663f4903…/agent-wallet/reference/architecture.md` | 2026-09-18 | [lu] P1, intégral |
| 36 | `https://support.metamask.io/manage-crypto/transactions/transaction-shield/` (WebFetch) | 2026-09-18 | [lu via WebFetch, dégradé] P1 |
| 37 | `https://metamask.io/news/introducing-metamask-agent-wallet` (WebFetch) | 2026-09-18 | [lu via WebFetch, dégradé] P1, daté ~2026-08-06 |

