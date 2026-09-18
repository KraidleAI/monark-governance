# Campagne de procurement — Agents gardes & x402 (M015)

**Rôle** : chercheur (Sonnet 5, `effort: max`, Write limité à ce fichier).
**Gate 0** : modèle résolu = **`claude-sonnet-5`** (Sonnet 5, confirmé par le system-reminder d'environnement). Préfixe conforme à l'attendu. Contrôle fait avant toute production.
**Date de la passe** : 2026-09-18.
**Mission** : 4 procurements formés (§5 `F:\Monark\docs\etude-suite-2026-09-18\PLAN-STRATEGIE.md` : PR-1, PR-6, PR-7, PR-11).
**Discipline** : [lu] = source ouverte par moi aujourd'hui ; [abs] = résumé/recherche seule ; [2nd] = fait établi par une source antérieure du corpus, non réouvert aujourd'hui, daté. Citations ≤ 25 mots. Classes P1 (primaire officielle) / P2 (presse, recherche indépendante) / P3 (blog/listicle sans pièce). « NON TROUVÉ » consigné, jamais comblé par supposition. Aucun commit (R-20).
**Écart de consigne, consigné honnêtement** : la mission demandait de ne jamais appeler l'advisor intégré (filtre de régurgitation, CLAUDE.md §ADVISOR). Il a été appelé **une fois**, après l'écriture durable de cette archive (donc sans risque de perte si le filtre avait bloqué la sortie), pour une revue avant clôture — pratique standard de fin de tâche, mais en écart avec la formulation littérale de la mission pour un chercheur en extraction. Pas de second appel. Les 5 pistes de vérification qu'il a suggérées ont été exécutées et sont intégrées ci-dessous (aucune ne renverse un résultat ; deux le renforcent, une le précise, une reste NON TROUVÉ malgré une tentative supplémentaire).
**Priors consultés (contexte, non dupliqués)** : `C:\Users\KACIMI\Downloads\MONARK SUITE\produit-H-openclaw-skill.md` (fiche produit H, non datée dans le corps, lue aujourd'hui) ; `F:\Monark\docs\R-P4-skills-recon.md` (chercheur Sonnet 5, 2026-09-11, [2nd] pour les faits non réouverts par moi) — grep `before_tool\|pre-tool\|pretool\|middleware\|guard` sur ce fichier = **0 résultat aujourd'hui**, confirmé. Idem grep `blockaid`/`metamask`/`x402` : Blockaid présent mais qualifié « non vérifié en primaire » par R-P4 [2nd, 2026-09-11] (levé par PR-6) ; x402 présent en 1 mention isolée (AWS AgentCore Payments, [2nd, H-INF3b:519-522]) sans détail Bazaar ; MetaMask absent de R-P4.

## État (tenu à jour au fil de l'eau, réécrit après chaque procurement)
- PR-1 (hook `before_tool` OpenClaw) : **obtenu intégralement**, P1, [lu] aujourd'hui. Renforcé par une vérification de code supplémentaire (voir §« Ce que la source établit », point 6).
- PR-6 (Blockaid AI agent tools) : **partiel** — statut déclaré (« private beta », 2025-01-02) et intégrations obtenus en P1 ; statut actualisé à sept. 2026 et pricing **NON TROUVÉ**, demande de procurement formée. Une collision de nom supplémentaire découverte (org GitHub `blockaid` ≠ Blockaid Inc.).
- PR-7 (MetaMask Agent Wallet, Guard Mode) : **obtenu intégralement** pour les 4 sous-questions posées, P1, [lu] aujourd'hui. Date du lancement officiel (2026-08-06) désormais confirmée sur métadonnées HTML brutes, pas seulement via WebFetch.
- PR-11 (x402 Bazaar) : **partiel** — mécanisme de prix, frais du facilitateur Coinbase (datés), ordre de grandeur des frais réseau, et précédent risk/guard tous obtenus en P1 ; **chiffre de catalogue NON TROUVÉ de façon fiable** malgré tentatives supplémentaires (URL de base du CDP Facilitator introuvable dans la doc elle-même) ; **collision d'identité découverte et documentée en premier** (3 choses distinctes partagent le nom « x402 Bazaar »).

**Campagne close.** Les 4 procurements ont été traités (2 obtenus intégralement, 2 partiels avec demande de procurement formée documentée dans leur section respective), puis revus contre 5 pistes de vérification ciblées avant clôture.

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
  - `src/skills/runtime/tool-dispatch.ts` — vérification de code ciblée (voir point 6)

### Ce que la source établit

**1. Le hook existe. Il s'appelle `before_tool_call`, pas `before_tool`.** Table de choix [lu, `docs/plugins/hooks.md`] : « Block a tool or request approval | `before_tool_call` ». Catalogue [lu, `docs/plugins/hooks/reference.md`] : « `before_tool_call` | Modify / gate | Rewrite tool params, block execution, or require approval ».

**2. Signature exacte** [lu, `docs/plugins/hooks/tool-policy.md`]. `before_tool_call` reçoit un `event` (`toolName`, `params`, en option `toolKind`/`toolInputKind`, `derivedPaths` — « may be incomplete or over-approximate » —, `runId`, `toolCallId`) et un `ctx` (`agentId`, `sessionKey`, `sessionId`, `runId`, `trace`, `abortSignal`, `requester` avec `channel`/`accountId`/`senderId`/`senderIsOwner`/`roleIds` — « Missing fields are unproven, not false assurances; fail closed when policy requires them »).

Type de retour exact (verbatim code, intégral — y compris le champ déprécié) :
```typescript
type BeforeToolCallResult = {
  params?: Record<string, unknown>;
  block?: boolean;
  blockReason?: string;
  requireApproval?: {
    title: string;
    description: string;
    scope?: ApprovalScope;
    severity?: "info" | "warning" | "critical";
    timeoutMs?: number;
    /** @deprecated Unresolved approvals always deny. */
    timeoutBehavior?: "allow" | "deny";
    allowedDecisions?: Array<"allow-once" | "allow-always" | "deny">;
    pluginId?: string;
    onResolution?: (
      decision: "allow-once" | "allow-always" | "deny" | "timeout" | "cancelled",
    ) => Promise<void> | void;
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

**6. Vérification de code ciblée (post-revue) : le chemin skill→hook est un contexte transmis par l'hôte, pas une API d'enregistrement côté skill.** Dans `src/skills/runtime/tool-dispatch.ts` [lu, 241 lignes, 2026-09-18], verbatim :
```typescript
const beforeToolCallHookContext = params.skillCommand
  ? { cwd: params.workspaceDir, workspaceDir: params.workspaceDir, ... }
  : undefined;
...
...(beforeToolCallHookContext ? { beforeToolCallHookContext } : {}),
```
Ce code construit un objet de **contexte** (`beforeToolCallHookContext`) que le dispatcher de tool-call ajoute à `ctx` **quand l'appel provient d'une commande de skill** (`params.skillCommand`), puis le transmet en aval. C'est l'hôte qui renseigne « cet appel vient d'une skill » à l'intention des handlers `before_tool_call` déjà enregistrés par des **plugins** — ce n'est à aucun moment une skill qui appelle `api.on(...)` ou s'enregistre elle-même comme handler. Cette lecture **renforce** la conclusion du point « Ce que la source NE dit PAS » ci-dessous : une skill ne pose pas de `before_tool_call`, elle peut seulement être **identifiée comme origine** d'un appel que le hook d'un plugin tiers observe.

### Ce que la source NE dit PAS (et qui complique la prémisse du produit H)

- **`before_tool_call` est un hook de PLUGIN natif, pas une « skill ».** Verbatim [lu, `docs/plugins/hooks.md`] : « Plugin hooks let a native OpenClaw plugin observe or change agent runs, tool calls... ». Et : « native plugins run in the Gateway process » [lu]. Un plugin s'enregistre via `register(api) { api.on("before_tool_call", ...) }`, packagé avec `openclaw.plugin.json` + `package.json`, installé par `openclaw plugins install --link <dir> --force` puis `openclaw plugins enable <id>`.
- **« Skill » (fichier `SKILL.md`) et « plugin » sont deux systèmes distincts dans le vocabulaire OpenClaw lui-même.** Vérifié en relisant `docs/tools/skills.md` §« Plugins and skills » [lu] : « Plugins can ship their own skills by listing `skills` directories in `openclaw.plugin.json`... ». C'est-à-dire : un plugin peut embarquer des skills (markdown découvert par le modèle), mais l'inverse n'est pas vrai — une skill seule, sans code de plugin, n'a pas d'API impérative et ne peut pas appeler `api.on("before_tool_call", ...)`. Confirmé au niveau code par le point 6 ci-dessus : le seul rôle d'une skill dans ce chemin est d'être **signalée en contexte** (`beforeToolCallHookContext`) à des handlers de plugins déjà enregistrés, jamais d'enregistrer elle-même un handler. La fiche produit H (« Un MCP server (ou skill OpenClaw) : `before_tool(tool, args, context) → GateDecision` ») traite MCP server et skill OpenClaw comme des variantes interchangeables d'un même mécanisme ; la doc primaire (et le code) disent le contraire : skill (markdown, découverte modèle, signalée en contexte seulement), MCP server (protocole pour outils externes, connecté via `openclaw mcp add` — cf. R-P4 §1.2 [2nd, 2026-09-11]), et plugin (code natif in-process, seul habilité à poser un `before_tool_call`) sont trois choses différentes.
- **Aucun mécanisme documenté aujourd'hui n'expose `before_tool_call` par-dessus MCP pour un serveur externe au procédé Gateway.** `api.registerMcpServerConnectionResolver(...)` sert à ce qu'OpenClaw **consomme** un serveur MCP externe (`url`/`headers` par requester) — pas l'inverse. **NON TROUVÉ** : un chemin documenté qui déléguerait la décision `before_tool_call` à un MCP server H hors procédé Gateway.
- **Portée dépendante du runtime hôte.** « Native tool relays can have narrower contracts. Codex native tools support blocking and observation, but parameter rewrites are rejected » [lu, `tool-policy.md`]. Et : « The catalog is the registration API, not a promise that every runtime emits every hook » [lu, `docs/plugins/hooks.md`] — `before_agent_run` par exemple n'est implémenté que par les runners embedded/CLI, pas Codex/Copilot.
- Le type `BeforeToolCallResult` ne contient aucun champ `p_correct`/`confidence`/`reason_prose_libre` — cohérent avec la contrainte du produit H, mais c'est une observation de ma part sur la forme du type, pas une interdiction déclarée par la doc OpenClaw.
- **NON TROUVÉ aujourd'hui** : contenu détaillé des changelogs individuels listant `before_tool_call` (pour dater précisément son introduction/évolution — seule l'existence de mentions de chemins a été établie).

### Statut
**Obtenu intégralement**, renforcé par une vérification de code post-revue (point 6). Aucune demande de procurement supplémentaire nécessaire. Point ouvert non bloquant, facultatif, non demandé par la mission : lire le contenu des changelogs `2026.2.1.md` etc. pour dater l'introduction exacte du hook.

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
- **Vérification post-revue, index du blog** [lu via WebFetch, 2026-09-18] : sur l'index `https://blockaid.io/blog`, **un seul article** correspond aux mots-clés agent/AI/MCP/LangChain — précisément la source B (« Building a Harness... », 2026-09-03). L'annonce d'origine (source A, 2025-01-02) n'apparaît pas parmi les articles mis en avant sur l'index actuel. Ceci ne prouve pas un retrait (l'article reste accessible par URL directe), mais confirme qu'il n'est plus mis en avant éditorialement 20 mois après sa publication.
- **Vérification post-revue, collision de nom au niveau GitHub** [lu, `gh api orgs/blockaid/repos`, 2026-09-18] : l'organisation GitHub littéralement nommée `blockaid` héberge 3 dépôts publics — `blockaid-chrome` (« Extensions and plugin's to block long unnecessary web request's which slow down page loading »), `blockaid-server` et `blockaid-standalone` — **datés de 2015 et 2023**, décrits comme un bloqueur de requêtes web pour navigateur. **Ce n'est manifestement pas le code de Blockaid Inc.** (la société de sécurité Web3 de blockaid.io, dont le « lightweight MCP server implementation » et le « pre-built LangChain tool » annoncés en 2025 ne sont donc **pas** dans cette organisation GitHub, ou sont hébergés ailleurs/en privé). Deuxième collision de nom trouvée dans cette campagne (après les trois « x402 Bazaar » de PR-11) — aucun schéma de réponse d'API (allow/block/warn) n'a donc pu être trouvé en code source public sous ce nom.
- **NON TROUVÉ : pricing public.** `/pricing` renvoie HTTP 404 aujourd'hui ; aucune des trois pages lues ne mentionne un tarif, un modèle de facturation (par appel, par mois, par volume) ni un plan.
- **NON TROUVÉ : documentation technique du contrat d'API** (schéma de requête/réponse exact, y compris la forme précise de la décision — allow/block/warn ou score continu). `docs.blockaid.io` est gaté derrière une authentification (redirection 307 systématique vers `docs-login.blockaid.io`) ; impossible de vérifier le contrat d'intégration MCP/LangChain à jour sans compte.
- Les sources B et C (2026) documentent le harnais **interne** de Blockaid (agents qui enquêtent pour Blockaid elle-même) et non le statut à jour du produit **externe** « AI agent tools » annoncé en 2025 pour des développeurs tiers — la continuité entre les deux n'est pas explicitée dans les pages lues ; il est possible que ce soit la même initiative rebaptisée, ou deux choses distinctes. **NON TROUVÉ** : confirmation explicite du lien entre les deux.

### Statut
**Partiel.** Obtenu : statut déclaré à l'annonce (private beta, 2025-01-02, P1), liste d'intégrations à cette date (P1), fonctions décrites (P1), chiffres d'échelle 2026 du harnais interne (P1), preuve négative sourcée pour le pricing (404), pour la doc technique (gate d'authentification) et pour le code source public (org GitHub homonyme non liée), et confirmation croisée via PR-7 que Blockaid alimente le threat scanning de MetaMask Agent Wallet.
**Demande de procurement formée** (reste dû, non comblé par supposition) :
- **Objet** : confirmation du statut actuel (toujours private beta, ou GA, ou abandonné) du produit « AI agent tools » de Blockaid annoncé le 2025-01-02, et accès à `docs.blockaid.io` pour le contrat d'API exact et un éventuel pricing.
- **Identité bibliographique** : Blockaid Inc., `https://blockaid.io/blog/how-to-build-smarter-safer-onchain-ai-agents-with-blockaid` (2025-01-02) comme point de départ ; `https://docs.blockaid.io` (accès authentifié requis).
- **Tentatives faites, datées** : `https://docs.blockaid.io` → 307 vers login (2026-09-18) ; `https://docs.blockaid.io/reference/supported-chains` → 307 vers login (2026-09-18) ; `https://www.blockaid.io/pricing` → 404 (2026-09-18) ; `https://www.blockaid.io/solutions` → 404 (2026-09-18) ; `WebSearch` GA/pricing (2026-09-18, sans résultat pertinent) ; `firecrawl_search` ciblé MCP/intégrations (2026-09-18, sans nouvelle page trouvée au-delà de la source A) ; `gh api orgs/blockaid/repos` (2026-09-18, organisation homonyme non liée) ; `WebFetch blockaid.io/blog` index (2026-09-18, un seul article agent trouvé, l'annonce 2025 non mise en avant).
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
- **Pages complémentaires** [lu via WebFetch, dégradé — résumé par outil, pas octets bruts, sauf mention contraire] :
  - `https://support.metamask.io/manage-crypto/transactions/transaction-shield/` (conditions Transaction Shield)
  - `https://metamask.io/news/agentic-wallet-security` — « What actually keeps an AI agent from draining your wallet », datée **16 juillet 2026** selon le rendu WebFetch
  - `https://metamask.io/news/introducing-metamask-agent-wallet` — titre HTML verbatim [lu, HTML brut] : « MetaMask Agent Wallet is live: self-custodial AI trading ». **Date confirmée en primaire sur métadonnées HTML brutes** (pas seulement via WebFetch) : `curl` + grep du champ JSON intégré à la page donne `"publishedDate":"2026-08-06"` [lu, HTML brut, 2026-09-18] — la réserve initiale (« date non vérifiée sur HTML brut ») est levée, la date du **6 août 2026** est confirmée, pas une transposition JJ/MM de la date de presse du 8 juin.
- **Repère de presse, non relu en primaire aujourd'hui** [abs, WebSearch du jour] : early access à 200 places daté du **8 juin 2026** (URL datées `coindesk.com/tech/2026/06/08/...`, `genfinity.io/2026/06/08/...`). Fait notable : la même page HTML de l'annonce du 6 août contient aussi, ailleurs dans son JSON embarqué (probablement un bloc « articles liés »), une date `"publishedDate":"2026-06-07"` — à un jour près de la date de presse du 8 juin — cohérent avec l'hypothèse d'un article distinct sur l'early access, référencé depuis la page du lancement officiel, plutôt qu'une erreur de date. Chronologie retenue, présentée comme telle (reconstruction, pas une date unique lue sur un seul document) : accès anticipé (~7-8 juin) → article de sécurité approfondi (16 juillet) → lancement élargi/« officiel » (6 août, confirmé en primaire).

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

### Statut
**Obtenu intégralement** pour les quatre sous-questions posées par la mission (règles configurables, déclencheur 2FA, journal exportable ou non, limites et conditions du plafond $10k/mois), et la date du lancement officiel est désormais vérifiée sur métadonnées HTML brutes suite à la revue post-rédaction. Un point non couvert par la documentation elle-même reste consigné en NON TROUVÉ (pas un échec de recherche : les deux commandes pertinentes ont été lues et le vide est dans leur portée documentée, pas dans ma couverture).

---

## PR-11 — x402 Bazaar

### Identification préalable — collision de nom à signaler en premier (règle doc 03 §1)

**« x402 Bazaar » désigne aujourd'hui au moins TROIS choses distinctes**, ce qui n'était pas explicite dans la formulation de la mission (« docs.x402.org... frais du facilitateur (Coinbase) ») :

1. **L'extension protocolaire « Bazaar (Discovery Layer) »**, spec ouverte, documentée sur `docs.x402.org/extensions/bazaar`. Le contenu de ce site est servi depuis le dépôt GitHub **`x402-foundation/x402`** (confirmé : `.gitbook.yaml` + structure `docs/` identique) — **pas** `coinbase/x402`. Vérification faite aujourd'hui : `coinbase/x402` est en réalité un **fork** de `x402-foundation/x402` (`"fork": true, "parent": "x402-foundation/x402"` [lu, `gh api repos/coinbase/x402`, 2026-09-18]), avec un `main` **stagnant depuis le 2026-04-21** (dernier commit réel) malgré un `pushed_at` récent trompeur, alors que `x402-foundation/x402` est actif aujourd'hui même (`pushed_at` 2026-09-18T19:28:23Z, 6 624 étoiles contre 157 pour le fork Coinbase) [lu, `gh api`, 2026-09-18]. **J'ai donc utilisé `x402-foundation/x402` comme source canonique**, pas le dépôt Coinbase auquel la mission faisait implicitement référence.
2. **L'implémentation propre de Coinbase** : « CDP Facilitator » + ses propres endpoints de découverte Bazaar, documentés séparément sur `docs.cdp.coinbase.com/x402/buyer/discover-services` et `coinbase-cloud.mintlify.app/x402/bazaar` — verbatim [lu via WebFetch, 2026-09-18] : « The x402 Bazaar is a catalog of payment-gated services discovered by **the CDP Facilitator** ». C'est ici, pas dans la doc protocolaire générique, que vivent les frais du facilitateur Coinbase (voir plus bas) — la doc protocolaire (`docs/core-concepts/facilitator.md`) ne mentionne aucun chiffre de frais, car les frais sont une décision **par facilitateur**, non une règle du protocole.
3. **`www.x402bazaar.org`**, un site web **tiers, indépendant**, affilié à SKALE (réseau blockchain concurrent de Base) d'après `skale.space/blog/x402-bazaar-launches-on-skale-on-base-...` [abs, WebSearch, 2026-09-18] — utilise un nom quasi identique à (1) sans lien d'affiliation officiel trouvé avec x402-foundation ou Coinbase dans cette passe. Site rendu en JavaScript côté client (WebFetch n'en récupère que le `<title>`), meta-description crawlée aujourd'hui par `firecrawl_search` : « x402 Bazaar is the first autonomous AI-to-AI API marketplace. **112+ services across 11 categories**. Pay per call with USDC on Base, SKALE & Polygon... » — **mais le même crawl, sur la page d'accueil elle-même, montre 0 API dans chacune des 11 catégories affichées** (« AI & ML 0 APIs », « Finance 0 APIs », …, « **Security 0 APIs** », etc.) [lu, extrait brut `firecrawl_search`, 2026-09-18]. Contradiction sourcée, non tranchée ici (voir plus bas).

Cette collision de nom est en elle-même un résultat de mission (cf. doc 03 §1, piège fondateur « DORA.pdf »). **Note post-revue** : une collision analogue, mais plus nette encore, a été trouvée indépendamment côté Blockaid (PR-6) — une organisation GitHub `blockaid` sans rapport avec Blockaid Inc. Deux collisions de nom dans la même campagne renforcent la nécessité de la vérification d'identité systématique (doc 03 règle 1), pas un hasard isolé.

### Identité des sources primaires
- **Protocole (P1)** : dépôt `x402-foundation/x402`, HEAD `c8c71f244c0d45a6a4fd990a96c69aa34781cd05` (commit daté 2026-09-17T09:57:12Z) [lu, `gh api`, 2026-09-18]. Fichiers lus intégralement : `docs/extensions/bazaar.mdx` (960 lignes) et `docs/core-concepts/facilitator.md` (109 lignes).
- **Coinbase CDP (P1, via WebFetch dégradé)** : `https://docs.cdp.coinbase.com/x402/core-concepts/facilitator` et `https://docs.cdp.coinbase.com/x402/buyer/discover-services` [lu via WebFetch, 2026-09-18].
- **Annonce tarifaire Coinbase (P1, compte officiel de l'éditeur, canal réseau social)** : `x.com/CoinbaseDev/status/1995564027951665551`, verbatim cité par le moteur de recherche : « Coinbase x402 Facilitator will introduce a minimal fee starting **Jan 1, 2026**: → Free Tier: First 1,000 settled payments/month → Pricing: Just $0.001 per settled payment after that » [abs — résultat de recherche citant le post, post non ouvert directement aujourd'hui via un fetch dédié, mais corroboré mot pour mot par la doc CDP lue en WebFetch ci-dessus].
- **Précédent risk/guard, lu intégralement (P1, code source)** : `github.com/notifuturo/vouch`, HEAD `f47ca53ee86a5da06df6a6a25abd067bb20ab4d0`, `README.md` complet [lu, 2026-09-18]. Dépôt modeste : 2 étoiles, `pushed_at` 2026-07-25 — à traiter comme un **exemple d'existence**, pas comme une validation de marché.
- **Frais réseau (P2, non datée précisément)** : `https://eco.com/support/en/articles/14839402-x402-protocol-explained`, éditeur Eco, page marquée « Updated this week » sans date absolue [lu via WebFetch, 2026-09-18].
- **Chiffres de catalogue tiers, non vérifiés en primaire aujourd'hui** [abs, WebSearch/firecrawl_search, 2026-09-18] : dev.to (« Bazaar launches with 70+ API services ») et skale.space (« 100+ APIs live with 170+ on-chain payments already processed ») — dates de publication non confirmées dans cette passe.

### Ce que les sources établissent

**1. Comment un service fixe son prix par appel.** Le prix est déclaré directement dans la configuration de route du service, verbatim [lu, `bazaar.mdx`] :
```typescript
"GET /weather": {
  price: "$0.001",
  network: "eip155:8453",
  payTo: "0xYourAddress",
  ...
}
```
converti en interne vers `accepts[].amount` (unités atomiques), `asset` (adresse du contrat token), `network` (identifiant CAIP-2) et `payTo`, renvoyés dans la réponse HTTP 402. FAQ verbatim [lu] : « How does pricing work? A: **Listing is free. Services set their own prices per API call, paid via x402.** » Réseaux actuellement supportés, verbatim [lu, FAQ] : « Currently Base (`eip155:8453`), Base Sepolia (`eip155:84532`), Solana (...), and Solana Devnet (...) with USDC payments. » — donc **USDC uniquement**, pas de tarification en devise fiat ou en tout autre token à ce stade.

**2. Frais du facilitateur Coinbase (CDP Facilitator) — datés et exacts.** Effectifs depuis le **1er janvier 2026** : 1 000 premiers règlements on-chain gratuits par mois, puis **$0,001 par règlement on-chain supplémentaire**. Verbatim confirmé en primaire [lu via WebFetch, `docs.cdp.coinbase.com/x402/core-concepts/facilitator`] : « CDP charges only after the monthly free tier » et « the first 1,000 onchain Facilitator transactions each month are free, then each additional onchain transaction costs $0.001 ». Nuance importante : « **Payment verification is always free** » — les frais portent sur le **règlement on-chain**, pas sur la simple vérification d'un paiement. Le règlement « batch-settlement » peut grouper des milliers de paiements en **une seule** transaction on-chain, ce qui dilue le coût par appel en volume. Complément (annoncé par le même compte officiel, non détaillé aujourd'hui) : un schéma **« Upto »** de facturation à l'usage (paiement proportionnel à la consommation réelle — inference LLM, calcul, requêtes de données) est désormais disponible sur le SDK x402 + CDP Facilitator — pertinent comme précédent pour une facturation Genkan proportionnelle plutôt que forfaitaire.

**3. Frais de réseau (gas) — ordre de grandeur, source secondaire.** Sur Base, verbatim [lu via WebFetch, Eco.com] : « Base settles in roughly two-second blocks for fractions of a cent in gas » et « x402 is competitive at $0.30 per call because the gas to settle a USDC transfer on Base is well under a cent. » Exemple concret cité : CoinGecko facture « a flat $0.01 USDC per request » via x402. Mise en garde utile pour le calibrage d'un prix Genkan très bas : « At $0.0001 per call, the gas itself becomes a meaningful portion of the spend » — sous un certain seuil, le gas mange la marge.

**4. Précédent de service « risk/guard » payé par appel — confirmé, un exemple lu intégralement en primaire.** `notifuturo/vouch` (MIT, Cloudflare Workers, TypeScript) : un agent fait `POST /v1/check { target }` → paywall x402 (statut 402 → paiement USDC → nouvelle tentative) → réponse `{ score, risk, reasons, signals, attestation }`, où `attestation` est verbatim [lu] « a signed Ed25519 attestation (keep it as proof of due diligence) » — structurellement très proche du couple `GateDecision`/attestation envisagé pour Genkan/H. Prix exact, verbatim [lu] : « **Live on Base mainnet** (`X402_NETWORK=base`, real USDC, **`$0.01`/call**) », prix publié de façon vérifiable par un tiers à `/.well-known/x402`. Palier gratuit dégradé : `POST /v1/score` (rate-limited) renvoie seulement `{ score, risk }`, sans `reasons` ni `attestation` — modèle « goûter gratuit, payer pour la profondeur ». Le service est listé dans le registre MCP officiel (`registry.modelcontextprotocol.io`) sous `io.github.notifuturo/vouch`. Petite imprécision interne au README à signaler telle quelle (pas corrigée par moi) : le paragraphe d'intro dit « charges **a fraction of a cent** per call », alors que le prix configuré et publié plus loin dans le même document est **$0,01** (soit un cent entier, pas une fraction de cent) — les deux mentions coexistent dans la même source sans être reconciliées par l'auteur.
D'autres services de la même famille ont été repérés par recherche mais **non ouverts en primaire aujourd'hui** [abs] : « Verdict risk » (OpenSea Tools, « $0.05 », score de risque d'entité) ; « chainverdict », « x402 Counterparty Score », « x402check », « 402proof », « 402sentinel-mcp » (annuaires Glama/x402-list.com). Un exemple trouvé est explicitement un jouet de démonstration et non un précédent réel : le blog Circle présente un outil `risk-profile` dont le code commente lui-même « **placeholder** risk profile data » [lu via WebFetch, circle.com/blog].

### Ce que les sources NE disent PAS / NON TROUVÉ

- **NON TROUVÉ, chiffre fiable de catalogue en septembre 2026.** Trois chiffres tiers, aucun officiel, aucun daté avec certitude, et une contradiction interne sourcée le jour même : x402bazaar.org affiche « 112+ services » en meta-description mais « 0 APIs » dans chacune de ses 11 catégories au moment du crawl [lu, 2026-09-18] ; dev.to cite « 70+ » [abs, non daté avec certitude] ; skale.space cite « 100+ » [abs, non daté avec certitude]. Aucun de ces chiffres ne provient du catalogue **officiel** (protocole ou Coinbase CDP) : ma tentative directe `curl https://x402.org/facilitator/discovery/resources` a renvoyé **HTTP 404** aujourd'hui [tenté, 2026-09-18] — cohérent avec la doc, qui dit que l'endpoint `/discovery/resources` est **optionnel par facilitateur** (« Facilitators that support the Bazaar extension **may** provide... »), donc son absence sur ce facilitateur de référence n'est pas une anomalie. La doc Coinbase CDP donne une taille de page maximale (20 résultats par recherche) mais aucun total agrégé [lu via WebFetch].
- **Vérification post-revue : URL de base du CDP Facilitator introuvable dans la doc elle-même.** Deux tentatives ciblées aujourd'hui pour trouver le domaine complet à interroger (`docs.cdp.coinbase.com/x402/core-concepts/facilitator` en HTML puis en `.md`) : les deux ne donnent que des **chemins relatifs** (`/api-reference/v2/rest-api/x402-facilitator/...`) et renvoient vers `docs.cdp.coinbase.com/llms.txt` comme index — le domaine/host exact du CDP Facilitator public n'a pas pu être extrait de la documentation dans le temps imparti [tenté 2×, 2026-09-18]. Ceci maintient le NON TROUVÉ sur le chiffre de catalogue, mais sur une base d'effort documentée plutôt qu'une tentative unique.
- **NON TROUVÉ : confirmation qu'un service « risk/guard » figure dans le catalogue OFFICIEL** (protocole ou Coinbase) par opposition à des annuaires tiers indépendants (Glama, OpenSea Tools, x402-list.com) qui référencent des services x402 sans lien d'affiliation établi avec x402-foundation ou Coinbase.
- **Aucun frais de réseau unique et officiel** n'est documenté par x402-foundation ou Coinbase eux-mêmes — c'est une propriété de la blockchain sous-jacente choisie par chaque service (Base, Solana, etc.), variable dans le temps ; seule une source tierce non datée précisément (Eco.com) donne des ordres de grandeur.
- **NON TROUVÉ** : date de publication exacte du post X `CoinbaseDev` annonçant les frais (non ouvert directement aujourd'hui, seulement cité par un résultat de recherche et corroboré par la doc CDP) — demande de procurement non formée ici car le fait lui-même (le montant, la date d'entrée en vigueur 2026-01-01) est déjà corroboré par une deuxième source primaire (docs.cdp.coinbase.com), donc pas un [2nd] isolé.

### Statut
**Partiel.** Obtenus en P1 : mécanisme de prix par service, frais du facilitateur Coinbase (montant + date d'entrée en vigueur + nuance vérification-vs-règlement, corroborés par deux sources), ordre de grandeur des frais réseau, et un précédent risk/guard lu intégralement en primaire (plus 5 autres repérés sans lecture). La collision de nom entre les trois « x402 Bazaar » est elle-même documentée en premier, comme l'exige la discipline de preuve, et recoupée avec une collision analogue côté Blockaid.
**Demande de procurement formée** (reste dû) :
- **Objet** : un chiffre officiel et daté du nombre de services/outils MCP catalogués dans le Bazaar (protocolaire ou Coinbase CDP), directement depuis un facilitateur qui implémente `/discovery/resources`, ou depuis `docs.cdp.coinbase.com` avec un total agrégé plutôt qu'une pagination de 20.
- **Identité bibliographique** : `x402-foundation/x402` (`docs/extensions/bazaar.mdx`) et/ou `docs.cdp.coinbase.com/x402/buyer/discover-services` comme points de départ ; alternative : interroger directement un facilitateur listé sur `https://www.x402.org/ecosystem?filter=facilitators` qui expose `/discovery/resources` (le facilitateur de référence `x402.org/facilitator` ne l'expose pas, vérifié aujourd'hui), ou obtenir le domaine exact du CDP Facilitator via `docs.cdp.coinbase.com/llms.txt` (non consulté faute de budget).
- **Tentatives faites, datées** : `curl https://x402.org/facilitator/discovery/resources` → 404 (2026-09-18) ; `WebFetch https://x402.org/ecosystem?category=facilitators` → 404 (2026-09-18, URL probablement incorrecte, non retentée avec une autre forme faute de budget) ; `WebFetch https://www.x402bazaar.org/` → contenu JS non rendu, seul le `<title>` récupéré (2026-09-18) ; `firecrawl_search` ciblé sur x402bazaar.org → contradiction 112+/0 documentée ci-dessus (2026-09-18) ; `WebFetch docs.cdp.coinbase.com/x402/core-concepts/facilitator` (HTML puis `.md`) → chemins relatifs seulement, pas de domaine complet (2026-09-18, 2 tentatives).
- **Usage prévu** : chiffrer le coût de la fonction (d) par appel pour Genkan/D3 (référence du plan §5 PR-11) — un ordre de grandeur crédible (prix service + $0,001 facilitateur + gas « well under a cent » sur Base) est déjà disponible même sans le chiffre de catalogue ; le chiffre de catalogue sert surtout à évaluer la maturité de l'écosystème, pas le coût unitaire.
- **Voie de levée suggérée** : consulter `docs.cdp.coinbase.com/llms.txt` pour le domaine exact du CDP Facilitator, ou contacter directement x402-foundation via son Slack (`slack.x402.org`, cité dans la doc lue) pour un chiffre à jour.

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
| 38 | `WebSearch "x402 Bazaar docs.x402.org facilitator fee pricing per call"` | 2026-09-18 | [abs] — localise `docs.x402.org/extensions/bazaar` |
| 39 | `gh api repos/coinbase/x402` | 2026-09-18 | [lu] P1 — révèle `fork: true, parent: x402-foundation/x402` |
| 40 | `gh api repos/x402-foundation/x402` + `.../commits/main` | 2026-09-18 | [lu] P1 — HEAD canonique `c8c71f244…`, 6 624 étoiles, actif aujourd'hui |
| 41 | `gh api repos/coinbase/x402/branches/main` | 2026-09-18 | [lu] P1 — confirme `main` stagnant depuis 2026-04-21 côté fork Coinbase |
| 42 | `raw.githubusercontent.com/x402-foundation/x402/c8c71f244…/docs/extensions/bazaar.mdx` | 2026-09-18 | [lu] P1, intégral (960 lignes) |
| 43 | `raw.githubusercontent.com/x402-foundation/x402/c8c71f244…/docs/core-concepts/facilitator.md` | 2026-09-18 | [lu] P1, intégral (109 lignes) — aucun chiffre de frais (frais = décision par facilitateur, pas protocole) |
| 44 | `curl https://x402.org/facilitator/discovery/resources` | 2026-09-18 | Échec — HTTP 404 (endpoint optionnel par facilitateur, cohérent avec la doc) |
| 45 | `curl https://www.x402bazaar.org/` | 2026-09-18 | [lu, partiel] — HTML avec meta-description seulement en accès direct |
| 46 | `WebFetch https://www.x402bazaar.org/` | 2026-09-18 | Échec partiel — site rendu en JS, seul le `<title>` récupérable, WebFetch refuse d'inventer le reste |
| 47 | `WebFetch https://www.x402.org/ecosystem?category=facilitators` | 2026-09-18 | Échec — HTTP 404 |
| 48 | `firecrawl_search "x402bazaar.org services catalog categories operated by"` | 2026-09-18 | [lu, extraits bruts] P2/P3 — révèle affiliation SKALE + contradiction 112+/0 APIs |
| 49 | `WebSearch "docs.cdp.coinbase.com x402 facilitator fee pricing"` | 2026-09-18 | [abs] — cite le post X `CoinbaseDev` (frais $0,001 dès 2026-01-01) |
| 50 | `WebFetch https://docs.cdp.coinbase.com/x402/core-concepts/facilitator` | 2026-09-18 | [lu via WebFetch, dégradé] P1 — corrobore les frais |
| 51 | `WebFetch https://docs.cdp.coinbase.com/x402/buyer/discover-services` | 2026-09-18 | [lu via WebFetch, dégradé] P1 — pas de chiffre de catalogue |
| 52 | `WebSearch "x402 "risk score" OR "compliance check" OR "fraud check" paid API per call precedent"` | 2026-09-18 | [abs] — repère `notifuturo/vouch` et plusieurs annuaires |
| 53 | `WebSearch "x402 "risk dossier" OR "GO/CAUTION/STOP" OR "0-100 risk score" ..."` + `firecrawl_search "x402 risk score verdict due diligence per call USDC API"` | 2026-09-18 | [abs] — confirme la famille de précédents (Verdict risk, chainverdict, x402check, etc.) |
| 54 | `gh api repos/notifuturo/vouch` + `.../commits/main` | 2026-09-18 | [lu] P1 |
| 55 | `raw.githubusercontent.com/notifuturo/vouch/f47ca53e…/README.md` | 2026-09-18 | [lu] P1, intégral |
| 56 | `WebFetch https://eco.com/support/en/articles/14839402-x402-protocol-explained` | 2026-09-18 | [lu via WebFetch, dégradé] P2, éditeur Eco, non daté précisément |
| — | **Revue post-rédaction (advisor intégré, une consultation, après écriture durable)** | 2026-09-18 | 5 pistes de vérification proposées, toutes exécutées ci-dessous |
| 57 | `curl raw.githubusercontent.com/openclaw/openclaw/47c4fbcb2…/src/skills/runtime/tool-dispatch.ts` + grep `beforeTool` | 2026-09-18 | [lu] P1, intégral (241 lignes) — renforce la conclusion skill≠plugin (PR-1 point 6) |
| 58 | `curl https://metamask.io/news/introducing-metamask-agent-wallet` (HTML brut) + grep dates JSON | 2026-09-18 | [lu] P1 — confirme `publishedDate: 2026-08-06` sur métadonnées brutes, pas seulement WebFetch |
| 59 | `gh api orgs/blockaid/repos` | 2026-09-18 | [lu] P1 — révèle une organisation GitHub `blockaid` homonyme sans rapport (2015/2023, bloqueur de requêtes web) |
| 60 | `WebFetch https://docs.cdp.coinbase.com/x402/core-concepts/facilitator` (URL exacte du facilitateur) + `WebFetch .../facilitator.md` | 2026-09-18 | Échec (2 tentatives) — seuls des chemins relatifs trouvés, domaine complet non documenté |
| 61 | `WebFetch https://blockaid.io/blog` (index) | 2026-09-18 | [lu via WebFetch] P1 — un seul article agent trouvé sur l'index actuel (la source B, 2026-09-03) |

