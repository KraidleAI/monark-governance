# INVENTAIRE — API, MCP, plugins, skills et agents tiers utilisés (récupération rapide)
Établi le 2026-09-19 par l'orchestrateur, mesuré sur la machine (`claude mcp list`, `~/.claude/settings.json`, `~/.claude.json`, `~/.claude/plugins/`). Aucune valeur de secret ici : seuls les NOMS de variables et où elles vivent. À relire à chaque bascule de compte et à chaque réinstallation.

## 1. Ce qui est LOCAL (survit à un changement de compte claude.ai)
| Élément | Où | Comment le récupérer |
|---|---|---|
| Instructions globales | `C:\Users\KACIMI\.claude\CLAUDE.md` | fichier ; sauvegarde dans `F:\MONARK SUITE\backup-2026-09-18\` à faire à chaque bascule |
| Agents utilisateur (9) | `C:\Users\KACIMI\.claude\agents\{advisor,advisor-defi,advisor-marche,chercheur,designer,lecteur,lecture-advisor,validateur-humain,worker}.md` | fichiers ; roster : workers `claude-opus-4-8` max, lecteurs/chercheurs `claude-sonnet-5` max, advisors `claude-fable-5-1` medium, validateur high, designer medium ; tous portent `ToolSearch, mcp__memstack, mcp__6144e146-7ed5-4073-b7f2-864b9335f725` |
| Agents projet Shōgen (2) | `F:\Shogen\.claude\agents\shogen-{orchestrator,devops}.md` | fichiers |
| Skills utilisateur (18) | `C:\Users\KACIMI\.claude\skills\` : caveman, diagnose, git-guardrails-claude-code, grill-me, grill-with-docs, handoff, improve-codebase-architecture, migrate-to-shoehorn, prototype, scaffold-exercises, setup-matt-pocock-skills, setup-pre-commit, tdd, to-issues, to-prd, triage, write-a-skill, zoom-out | dossiers (origine : `setup-matt-pocock-skills`) |
| Réglages Claude Code | `C:\Users\KACIMI\.claude\settings.json` : `advisorModel: claude-fable-5-1`, `enabledPlugins`, `extraKnownMarketplaces` | fichier |
| Corpus qualité | `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\docs\` (doc 02 gates, doc 03 méthode, 06 AgileGates, templates) | dossier |

## 1 bis. Règle disque (investisseur 2026-09-19 : « on n'enregistre rien sur le C, même pas les fichiers temporaires »)
Variables utilisateur (`setx`, scope User, effet aux NOUVEAUX shells/sessions) : `TEMP`/`TMP`/`TMPDIR` = `F:\tmp` ; `npm_config_cache` = `F:\cache\npm` (+ `npm config set cache`) ; `UV_CACHE_DIR` = `F:\cache\uv` ; `PIP_CACHE_DIR` = `F:\cache\pip` ; `XDG_CACHE_HOME` = `F:\cache\xdg` ; `MONARK_PUBLIC_MIRROR` = `F:\monark-public-mirror` (clone miroir déplacé). Caches npm/uv/pip déplacés par `robocopy /MOVE`. Reste sur C: par construction du harness : `~/.claude` (agents, settings, transcripts `projects/`), scratchpad de session `%LOCALAPPDATA%\Temp\claude\` (suit `TEMP` au prochain démarrage), Docker Desktop (données WSL déjà sur F:). Données investisseur `F:\PRODUITS\etude-2026-09-19` et `F:\MONARK SUITE` : à déplacer vers `F:\` quand aucun lecteur n'y écrit (chemins cités dans BASCULEMENT §4, ADR-B0, CHANTIERS — à réécrire dans le même commit). Tout worker/agent qui lance `npm`/`uvx` dans un shell hérité d'avant la règle exporte `TEMP/TMP/TMPDIR=F:\tmp`.

## 2. Serveurs MCP enregistrés en scope utilisateur (`~/.claude.json` → `mcpServers`)
| Nom | Type | Commande / URL | Rôle | Récupération |
|---|---|---|---|---|
| `memstack` | HTTP | `http://127.0.0.1:8848/mcp` | mémoire prioritaire (10 outils) | serveur local : `F:\claude-memory\.venv\Scripts\python.exe scripts\run_server.py` lancé depuis `F:\claude-memory` (port 8848) ; le relancer s'il répond ConnectionRefused ; `claude mcp add --scope user --transport http memstack http://127.0.0.1:8848/mcp` |
| `higgsfield` | HTTP | `https://mcp.higgsfield.ai/mcp` | génération image/vidéo (designer) ; **outils de facturation JAMAIS** | `claude mcp add --scope user --transport http higgsfield https://mcp.higgsfield.ai/mcp` puis auth dans la session |
| `arxiv` | stdio | `uvx arxiv-mcp-server --storage-path C:/Users/KACIMI/.mcp-papers/arxiv` | papiers (chercheurs/lecteurs) | `claude mcp add --scope user arxiv -- uvx arxiv-mcp-server --storage-path C:/Users/KACIMI/.mcp-papers/arxiv` |
| `openalex` | stdio | `npx -y openalex-mcp` | métadonnées académiques | `claude mcp add --scope user openalex -- npx -y openalex-mcp` |
| `semantic-scholar` | stdio | `uvx --with "mcp<2" semantic-scholar-mcp` | papiers | `claude mcp add --scope user semantic-scholar -- uvx --with "mcp<2" semantic-scholar-mcp` |
| `alphaxiv` | HTTP | `https://api.alphaxiv.org/mcp/v1` | papiers (enregistré, peu utilisé) | `claude mcp add --scope user --transport http alphaxiv https://api.alphaxiv.org/mcp/v1` |
Prérequis binaires : `uv`/`uvx` (Python via uv, `C:\Users\KACIMI\AppData\Roaming\uv\`), Node 24 + `npx`.

## 3. Connecteurs claude.ai (LIÉS AU COMPTE — à refaire sur l'autre abonnement)
| Connecteur | URL | État mesuré 2026-09-19 | Usage | Note |
|---|---|---|---|---|
| **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp-search` | Connected | recherche web + papiers pour TOUS les agents | nommé en interne par UUID **`mcp__6144e146-7ed5-4073-b7f2-864b9335f725`** (a CHANGÉ à la bascule 2026-09-19 : ancien `8aa0cccf-…` ; 22 agents + CLAUDE.md réécrits, sauvegarde `pre-firecrawl-uuid-2026-09-19`) ; **si l'UUID change après ré-inscription, mettre à jour les 11 agents (`tools:`) + CLAUDE.md global §memstack/firecrawl** ; alternative robuste : `claude mcp add --scope user firecrawl` avec clé API (entrée stable `mcp__firecrawl`) |
| Blockscout | `https://mcp.blockscout.com/mcp` | Connected | explorateur EVM (Ukemi) | réinscrire |
| Claude Docs | `https://api.anthropic.com/v1/pages/mcp` | Connected | docs Anthropic | réinscrire |
| Origin | `https://mcp.originhq.com/mcp` | Needs authentication | non utilisé | optionnel |
| Vercel | `https://mcp.vercel.com` | Needs authentication | **non utilisé** (site sur VPS) | ignorer |
| CoinDesk | `https://mcp.coindesk.com/mcp` | Needs authentication | actualités (Bell GTM) | optionnel |
Connecteurs en attente d'auth listés par la session mais jamais utilisés : product-management (amplitude, asana, atlassian, clickup, figma, fireflies, intercom, linear, monday, notion, pendo, similarweb, slack) — ignorer.

## 4. Plugins Claude Code (`enabledPlugins`, marketplaces GitHub)
| Plugin | Marketplace (repo GitHub) | Version | Usage |
|---|---|---|---|
| `claude-mem@thedotmack` | `thedotmack/claude-mem` | 13.24.1 | mémoire de session (`mcp-search`, observations) |
| `security-guidance@claude-plugins-official` | `anthropics/claude-plugins-official` | 2.0.7 | conseils sécurité |
| `claude-security@claude-plugins-official` | `anthropics/claude-plugins-official` | 0.11.0 | scan sécurité (agents `claude-security:*`) |
| `vercel@claude-plugins-official` | `anthropics/claude-plugins-official` | 0.48.0 | **inutile** (VPS) — peut être désactivé |
| `ui-ux-pro-max@ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` | — | design (designer) |
| `21st@21st-dev` | `21st-dev/magic-mcp` | — | composants UI ; clé env `API_KEY_21ST` |
| `pdf-viewer` (outils `mcp__plugin_pdf-viewer_pdf__*`) | officiel | — | lecture PDF en session |
Récupération : `claude plugin marketplace add <repo>` puis `claude plugin install <nom>@<marketplace>` ; les caches sont dans `~/.claude/plugins/cache/` (locaux, survivent).

## 5. API et clés (variables d'environnement Windows, scope User — jamais dans le chat ni le dépôt)
| Variable | Service | État | Usage |
|---|---|---|---|
| `POLYGON_API_KEY` | Polygon.io = **Massive** (renommé 2025-10-30), Individual Use, Bearer sur `api.polygon.io` / `api.massive.com` | posée (32 car.) | Bell : calendrier NYSE, fills, tickers |
| `HELIUS_API_KEY` | Helius (archive Solana) | **absente** — à poser `setx HELIUS_API_KEY <clé>` | Bell : course fondatrice (rejeu 15 mois) |
| `API_KEY_21ST` | 21st.dev magic | posée | plugin 21st |
| `PERPLEXITY_API_KEY` | Perplexity | posée | recherche (non utilisée par MONARK) |
| `RAILWAY_TOKEN` | Railway | posée | hors MONARK |
| `CLAUDE_CODE_MESSAGING_TOKEN` | Claude Code | système | ne pas toucher |
| `DEPLOY_SSH_KEY` (secret GitHub, dépôt public) + clé locale `~/.ssh/monark_vps` | VPS `monarkgate.tech` | posés par l'investisseur | déploiement harnais/site (RUNBOOK-*) |
Accès sans clé utilisés par le code : RPC Ethereum keyless (drpc, mevblocker, blastapi, nodies, tenderly, 1rpc), Solana (`api.mainnet-beta.solana.com`, publicnode), GitHub via `gh` (compte Kraidle, dépôts `KraidleAI/monark-governance` privé et `KraidleAI/Monark` public).

## 6. Comptes tiers (identité = investisseur)
GitHub `KraidleAI` (`gh auth status`) ; Polygon/Massive (abonnement payé 2026-09-19) ; Helius (abonnement à ouvrir) ; Cloudflare (DNS/proxy `monarkgate.tech`) ; VPS (fournisseur = paramètre ADR-M004) ; Higgsfield ; X (annonces sous go) ; SSRN (compte gratuit pour Gatto).

## 7. Check-list de récupération sur un nouveau compte (10 min)
1. `claude mcp list` → les 6 serveurs user-scope doivent être là (sinon §2) ; memstack Connected (sinon relancer `F:\claude-memory`).
2. Connecteurs claude.ai : Firecrawl, Blockscout, Claude Docs (§3) ; vérifier l'UUID Firecrawl dans les outils exposés (`mcp__8aa0cccf…`) — si différent, mettre à jour agents + CLAUDE.md.
3. Plugins (§4) : `claude plugin list` ; réinstaller ceux qui manquent.
4. `setx` : vérifier `POLYGON_API_KEY` (longueur 32) ; poser `HELIUS_API_KEY` quand disponible.
5. Redémarrer la session (les agents/MCP sont chargés au démarrage), puis reprendre depuis `BASCULEMENT-COMPTE.md`.
