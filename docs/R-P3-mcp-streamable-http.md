# R-P3 — Recherche formée : spécification du transport MCP « Streamable HTTP »

**GATE 0 (R-1)** : modèle résolu = **`claude-sonnet-5`** (préfixe conforme à l'attendu ; effort `max`). Contrôle fait avant toute production ci-dessous.

- **Rôle** : chercheur (Sonnet 5, Write autorisé sur ce fichier uniquement).
- **Date de la passe** : 2026-09-07.
- **Mission** : R-P3 — spec du transport MCP Streamable HTTP, prérequis Lot B-mcp / Genkan (storefront MCP de la flotte MONARK, « DeFAI harness »).
- **Périmètre** : lecture seule ailleurs (dont, hors MONARK : dépôts publics `modelcontextprotocol/*`, `Clawpump/claw-agent`, registre npm — aucun n'est un dépôt produit MONARK/Shōgen/Vernier) ; écriture UNIQUEMENT dans ce fichier. Aucun commit, aucune poussée.
- **Rattachement** : `F:\Monark\docs\adr\ADR-M004-infrastructure-plateforme.md` §4 (pendant « R-P3 spec MCP streamable HTTP [lu] ») ; D3 Addendum (Cloudflare devant Caddy, idle timeout SSE ~100 s, heartbeat ~30 s) ; D5 (« MCP `mcp.<domaine>` (transport streamable HTTP, spec à citer [lu]) ») ; D10/D11 test 45 `mcp_tools_readonly_fixtures`.
- **Antécédent direct** : `F:\Monark\docs\R-P2-P3-recherche.md` (2026-09-06) — R-P2 (schéma SKILL.md) CLOS ; **R-P3 NON FAIT** (« worker mort sur limite d'usage avant de commencer la section MCP streamable HTTP »). Cette passe reprend R-P3 intégralement et referme aussi un point ouvert de R-P2 §Q4 (distribution/consommation côté `claw-agent`, cf. §6 ci-dessous).
- **Usage de l'outil advisor intégré — corrigé** : CE document a initialement porté la mention (héritée du brouillon de mission) « outil advisor non appelé ». C'est devenu **faux en cours de passe** : **1 appel** a été fait, **après l'essentiel de l'extraction, avant la rédaction du corps du rapport** (bilan d'orientation + validation de plan d'écriture), conformément à l'instruction du harnais (« consulter avant travail substantiel/rédaction »), en tension avec la règle CLAUDE.md globale « les chercheurs n'appellent jamais l'advisor intégré pendant une extraction ». Les deux consignes sont en conflit direct ; le harnais a été suivi une fois, le fait est consigné ici sans le maquiller, à trancher par l'orchestrateur/mainteneur si un précédent est nécessaire. **Sortie non bloquée** par le filtre anti-régurgitation (sources majoritairement MIT/spec ouverte, pas de contenu sous droits restrictifs détecté). Aucun second appel prévu ; toute question restant ouverte est renvoyée en section 7/8 (procurement / consultation formée), pas contournée.

---

## Avertissement de méthode — piste memstack, vérifiée et confirmée exacte

Une requête `memory_query` (memstack, faite avant toute recherche web, discipline « surtout memstack ») a fait remonter une entrée du **2026-09-06** (projet **Shogen**, pas Monark — trace probable d'une tentative antérieure de cette même R-P3), `uid=b10f62a4695e4e70b8a809daed46520d`, affirmant qu'une révision MCP du **2026-07-28** rendrait le protocole « sans état » et supprimerait l'`initialize`, les sessions et la reprise SSE. L'affirmation était **extraordinaire** au regard de ma connaissance de MCP par entraînement (arrêtée janvier 2026) et contredisait l'hypothèse implicite d'ADR-M004 D3 (reprise de flux SSE via heartbeat) — traitée comme **piste non vérifiée**, jamais comme source, jusqu'à re-vérification primaire complète (§1-6 ci-dessous).

**Verdict après re-vérification directe (aujourd'hui, sources primaires §1)** : **la piste est exacte sur tous les points contrôlables** — révision courante 2026-07-28 confirmée en direct sur `modelcontextprotocol.io`, HEAD du dépôt spec identique (`e76e9c572c6f2bfcb730357101acc90f2f802e02`, 2026-09-04, revérifié par moi aujourd'hui via `gh api`), suppression des sessions/`Mcp-Session-Id`/`initialize`/reprise SSE confirmée mot pour mot dans le changelog officiel, SEP-2567/SEP-2575 réels (PR GitHub existantes). L'entrée memstack est cependant **tronquée/partielle** (elle s'arrête à « Le point d'entrée HTTP G… », ne couvre pas `subscriptions/listen`, MRTR, la suppression de `ping`, l'extension tasks, ni la scission SDK v1/v2) au regard de ce que cette passe établit. **Recommandation à l'orchestrateur** (pas d'action de ma part : `memory_remember` est hors du périmètre d'écriture de cette mission, restreinte à ce fichier) : faire mettre à jour/compléter l'entrée `b10f62a4…` à partir de ce rapport.

---

## 1. Identification des sources

| # | Source | Date de fetch | Méthode | Niveau | Classe | Ce qu'elle établit |
|---|---|---|---|---|---|---|
| 1 | `modelcontextprotocol.io/specification/versioning` | 2026-09-07 | WebFetch (rendu, non re-vérifié en brut) | [lu via WebFetch] | P1 | Révision courante = 2026-07-28 |
| 2 | `modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md` | 2026-09-07 | `curl` brut + `Read`/`Grep` | **[lu]** | P1 | Mécanique complète du transport courant |
| 3 | `modelcontextprotocol.io/specification/2026-07-28/basic/versioning.md` | 2026-09-07 | `curl` brut, fidélité confirmée vs WebFetch | **[lu]** | P1 | Terminologie Modern/Legacy/Dual-era, matrice de compatibilité |
| 4 | `modelcontextprotocol.io/specification/2026-07-28/changelog.md` | 2026-09-07 | `curl` brut, fidélité confirmée | **[lu]** | P1 | Liste exhaustive des 9 changements majeurs + mineurs + dépréciations |
| 5 | `modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index.md` | 2026-09-07 | `curl` brut, fidélité confirmée | **[lu]** | P1 | Exigences OAuth 2.1 / bearer / PRM |
| 6 | `modelcontextprotocol.io/specification/2026-07-28/server/discover.md` | 2026-09-07 | `curl` brut, fidélité confirmée | **[lu]** | P1 | Forme exacte de `server/discover` |
| 7 | `modelcontextprotocol.io/specification/2026-07-28/server/tools.md` | 2026-09-07 | `curl` brut + `Grep` | **[lu]** | P1 | Schéma `annotations` — **`readOnlyHint`/`destructiveHint`/etc. NON TROUVÉS sur cette page** (§6) |
| 8 | `modelcontextprotocol.io/llms.txt` | 2026-09-07 | WebFetch | [lu via WebFetch] | P1 | Index des URLs `.md` de toute la doc, par révision |
| 9 | `gh api repos/modelcontextprotocol/modelcontextprotocol/commits/main` | 2026-09-07 | `gh api` | [lu] | P1 | HEAD = `e76e9c572c6f2bfcb730357101acc90f2f802e02`, 2026-09-04T00:39:11Z |
| 10 | `gh api .../contents/schema` | 2026-09-07 | `gh api` | [lu] | P1 | Dossiers `2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25, 2026-07-28, draft` |
| 11 | `npm view @modelcontextprotocol/sdk` (versions, dist-tags, time, deprecated) | 2026-09-07 | `npm view` (registre live) | [lu] | P1 | v1.x : dernière publiée `1.30.0` (2026-07-27T17:56Z) ; `deprecated` vide au registre |
| 12 | `gh api .../typescript-sdk/releases/tags/1.30.0` | 2026-09-07 | `gh api` | [lu] | P1 | Contenu du 1.30.0 : patch de maintenance v1.x (dont keep-alive SSE) |
| 13 | `npm view @modelcontextprotocol/{server,server-legacy,client,core,node,express}` | 2026-09-07 | `npm view` | [lu] | P1 | 6 packages de la ligne v2.0.0, descriptions exactes |
| 14 | `gh api .../releases/tags/@modelcontextprotocol/server@2.0.0` et `.../server-legacy@2.0.0` | 2026-09-07 | `gh api` | [lu] | P1 | PR #2402 : SDK v2 « first beta ... support for the MCP 2026-07-28 specification revision » |
| 15 | `raw.githubusercontent.com/.../docs/migration/support-2026-07-28.md` | 2026-09-07 | `curl` brut + `Read` intégral (726 lignes) | **[lu]** | P1 | Guide de bascule complet : `createMcpHandler`, `requestState`, auth, `subscriptions/listen` |
| 16 | `raw.githubusercontent.com/.../docs/migration/upgrade-to-v2.md` | 2026-09-07 | WebFetch puis `curl` brut + `Grep` ciblé | [lu, partiel — grep ciblé, pas lecture intégrale des 1874 lignes] | P1 | Origin validation par défaut des app-factories, résumabilité v1 bornée `>=2025-11-25` |
| 17 | `raw.githubusercontent.com/.../docs/troubleshooting.md` | 2026-09-07 | `curl` brut + `Grep`/`Read` | **[lu]** | P1 | **`keepAliveMs` par défaut = 15000 ms, sur toute réponse SSE HTTP** |
| 18 | `raw.githubusercontent.com/.../packages/server/src/server/perRequestTransport.ts` | 2026-09-07 | `curl` brut + `Grep` (code source) | **[lu]** | P1 (code) | Timing exact keepalive vs ouverture du flux selon `responseMode` |
| 19 | `gh api repos/Clawpump/claw-agent/git/trees/7b81ee98…` (recursive) | 2026-09-07 | `gh api` | [lu] | P1 | Recensement fichiers `mcp*` du dépôt (client MCP réel de Hermes) |
| 20 | `raw.githubusercontent.com/Clawpump/claw-agent/7b81ee98…/pyproject.toml` | 2026-09-07 | `curl` brut + `Grep` | **[lu]** | P1 | **`mcp==2.0.0` pin, commentaire verbatim « implements MCP revision 2026-07-28 »** |
| 21 | `.../optional-mcps/linear/manifest.yaml` | 2026-09-07 | `curl` brut, lu intégralement | **[lu]** | P1 | Forme exacte d'une entrée catalogue MCP distant côté Hermes |
| 22 | `.../hermes_cli/mcp_config.py` | 2026-09-07 | `Grep` ciblé (1263 lignes, pas lu intégralement) | [lu, partiel] | P1 | `hermes mcp add <name> --url <endpoint>` — ajout d'un serveur MCP arbitraire hors catalogue |
| 23 | `github.com/.../typescript-sdk/blob/main/CHANGELOG.md` | 2026-09-07 | WebFetch | **ÉCHEC HTTP 404** | — | Mauvais chemin (pas de CHANGELOG.md unique à la racine ; changelogs par package via `gh api releases`) |

---

## 2. Q1 — Révision courante, localisation de la spec, introduction de Streamable HTTP

**Révision courante : `2026-07-28`** [lu, source #1/#3, verbatim] : « The **current** protocol version is [**2026-07-28**](/specification/2026-07-28/). » Cinq révisions datées existent : `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, `2026-07-28`, plus un dossier `draft` [lu, source #10, listing direct du dossier `schema/` du dépôt].

**Où la spec est définie** : site `modelcontextprotocol.io/specification/<révision>/`, texte source en Markdown/MDX dans le dépôt GitHub `modelcontextprotocol/modelcontextprotocol` (HEAD `e76e9c572c6f2bfcb730357101acc90f2f802e02`, poussé 2026-09-04T00:39:11Z [lu, source #9]). Schéma machine : `schema/<révision>/` (TypeScript + JSON Schema, confirmé présent pour les 6 dossiers). Le transport Streamable HTTP est spécifiquement à `basic/transports/streamable-http.mdx` (rendu : `.../basic/transports/streamable-http`).

**Révision d'introduction de Streamable HTTP** [lu, source #2, verbatim] : « Streamable HTTP was introduced in protocol version **2025-03-26** as a replacement for the [HTTP+SSE transport][http-sse] from protocol version **2024-11-05**. » Répond directement à la question de mission.

**Révision d'introduction de la forme ACTUELLE de Streamable HTTP (celle que MONARK doit implémenter)** [lu, source #2, verbatim] : « Revision **2026-07-28** changed the behavior of Streamable HTTP. [...] Changes included: Removal of the GET stream endpoint. Removal of protocol-level sessions. » — **Deux formes de « Streamable HTTP » coexistent dans le corpus documentaire, à ne pas confondre** (piège de collision au sens doc 03, pas de nom mais de forme) : la forme **2025-03-26 → 2025-11-25** (sessions `Mcp-Session-Id`, GET SSE, reprise `Last-Event-ID`) — celle qu'ADR-M004 D3 avait implicitement en tête en écrivant « idle timeout SSE » et « heartbeat » — et la forme **2026-07-28** (sans session, sans GET, sans reprise), aujourd'hui **courante**. Les deux sont détaillées en §3.

---

## 3. Q2 — Mécanique du transport (forme courante 2026-07-28, puis forme antérieure 2025-03-26→2025-11-25)

### 3.1 Forme courante (2026-07-28) [lu, source #2, verbatim sauf note]

- **Un seul point d'entrée HTTP** : « The server **MUST** provide a single HTTP endpoint path (hereafter referred to as the **MCP endpoint**) that supports POST. For example, this could be a URL like `https://example.com/mcp`. »
- **POST uniquement, pas de GET** : « Every JSON-RPC message sent from the client **MUST** be a new HTTP POST request to the MCP endpoint. » Une requête GET ou DELETE sur ce point d'entrée reçoit **`405 Method Not Allowed`** de la part d'un serveur qui ne parle que cette révision (traitement des clients d'ères antérieures, cf. 3.3).
- **Réponse = JSON **ou** SSE, au choix du serveur, par requête** : « the server **MUST** return either `Content-Type: application/json` (a single JSON object) or `Content-Type: text/event-stream` (an SSE response stream). The client **MUST** support both. » Le flux SSE, s'il est ouvert, est **scopé à cette seule requête** (pas de flux partagé multi-requêtes).
- **Pas de session, pas d'`initialize`** : chaque requête porte sa version de protocole et ses capacités dans `_meta` (`io.modelcontextprotocol/protocolVersion`, `clientCapabilities`, `clientInfo`) ; côté HTTP, dupliqué dans l'en-tête `MCP-Protocol-Version` (obligatoire sur tout POST de requête moderne).
- **En-têtes standards obligatoires** (`Mcp-Method`, et `Mcp-Name` pour `tools/call`/`resources/read`/`prompts/get`) — miroir de champs du corps JSON-RPC pour les intermédiaires (routage/observabilité sans parser le corps) ; désaccord corps/en-tête ⇒ `400` + JSON-RPC `-32020` (`HeaderMismatch`).
- **État inter-appels** : plus de session — remplacé par des **« handles » explicites, frappés par le serveur**, transmis par le client dans un round ultérieur (mécanisme `requestState`, détaillé en §6.3) — confirme et précise la piste memstack (SEP-2567).
- **Notifications de changement** : plus de flux GET permanent — un client qui veut être notifié (listes changées, ressource mise à jour) ouvre explicitement un flux long via `subscriptions/listen` (POST), qui reste ouvert et ne délivre QUE les types auxquels le client s'est abonné.
- **Annulation** : fermer le flux SSE de réponse **EST** le signal d'annulation (pas de `notifications/cancelled` sur ce transport).

### 3.2 Forme antérieure, 2025-03-26 → 2025-11-25 (celle implicitement supposée par ADR-M004 D3) [lu, source #2, verbatim]

> « Protocol versions `2025-03-26` through [`2025-11-25`] also used the Streamable HTTP transport, but in a different shape: servers could assign a session via the `Mcp-Session-Id` header (terminated with HTTP DELETE), clients could open a standalone SSE stream with HTTP GET to receive server-initiated messages, servers could send JSON-RPC *requests* on SSE streams, and streams were resumable via `Last-Event-ID`. **None of these mechanisms are part of this revision.** »

C'est la confirmation directe, verbatim, que le triptyque « session HTTP + GET SSE permanent + reprise `Last-Event-ID` » — la mécanique qu'ADR-M004 D3 anticipait en écrivant sa contrainte de heartbeat — **a existé** mais **n'appartient plus à la révision courante**.

### 3.3 Rétro-compatibilité (dual-era) — mécanique de détection [lu, source #2/#3, verbatim]

Un serveur qui veut servir les deux ères peut le faire (« dual-era »). Détection côté client : tenter une requête moderne ; sur `400 Bad Request`, inspecter le corps — une erreur JSON-RPC moderne reconnue (`UnsupportedProtocolVersionError`, etc.) signale un serveur moderne (retenter avec une version compatible) ; un corps vide/non reconnu signale un serveur d'ère antérieure (retomber sur `initialize`, puis éventuellement sur le très ancien HTTP+SSE 2024-11-05 par un GET explicite attendant un évènement `endpoint`). Matrice de compatibilité complète et verbatim en source #3 (« Compatibility Matrix ») — non recopiée ici en entier (tableau de 7 lignes) mais son point saillant : **« Legacy | Modern | Fails »** — un client d'ancienne génération parlant à un serveur strictement moderne **échoue sans repli**, ce qui rend le choix de MONARK (moderne seul vs dual-era) directement consommateur-déterminant (§6).

---

## 4. Q3 — Résumabilité / redélivrance

**Supprimée dans la révision courante**, sans ambiguïté [lu, source #2, verbatim] : « **Resumable SSE streams via `Last-Event-ID` are not supported.** » Et, au niveau changelog [lu, source #4, item majeur 9, verbatim] :

> « Remove SSE stream resumability and message redelivery (the `Last-Event-ID` header and SSE event IDs) from the Streamable HTTP transport. **A broken response stream loses the in-flight request; clients MUST re-issue it as a new request with a new request ID** ([SEP-2575]). »

**Conséquence directe et non triviale pour MONARK** : sous la contrainte ADR-M004 D3 (idle timeout ~100 s à travers le proxy Cloudflare Free/Pro — **fait [2nd] pour cette archive**, sourcé par ADR-M004 lui-même à la communauté Cloudflare, non re-vérifié par moi aujourd'hui, hors périmètre strict de R-P3), si le flux de réponse d'un appel d'outil venait à être coupé en cours de route (silence prolongé), **il n'existe plus aucun mécanisme de reprise** : le client doit renvoyer la requête entière depuis le début. Ceci élève l'enjeu de l'idempotence des outils MONARK (`hikae_conform`/`hikae_gate`/`ukemi_clearing` sont des vérifications déterministes sur fixtures — rejouer la requête entière est **sans risque** dans ce cas précis, contrairement à un outil qui aurait un effet de bord) et l'enjeu du §6.4 (garder les flux courts / ouvrir le flux tôt).

Le mécanisme antérieur (`Last-Event-ID`, 2025-03-26→2025-11-25) est décrit en §3.2 ; sa suppression est ce que la piste memstack annonçait et que cette relecture confirme mot pour mot.

---

## 5. Q4 — Sécurité

### 5.1 Ce que le transport EXIGE (niveau transport, indépendant de l'authentification) [lu, source #2, verbatim, section « Security & Endpoint », inchangé en substance depuis les révisions antérieures]

> « 1. Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks. If the `Origin` header is present and invalid, servers **MUST** respond with HTTP 403 Forbidden. [...]
> 2. When running locally, servers **SHOULD** bind only to localhost (127.0.0.1) rather than all network interfaces (0.0.0.0).
> 3. Servers **SHOULD** implement proper authentication for all connections. »

### 5.2 Authentification/autorisation applicative — OAuth 2.1, mais OPTIONNELLE au niveau protocole [lu, source #5, verbatim]

> « Authorization is **OPTIONAL** for MCP implementations. When supported: Implementations using an HTTP-based transport **SHOULD** conform to this specification. »

Base normative si activée [lu, source #5] : **OAuth 2.1 IETF DRAFT** (`draft-ietf-oauth-v2-1-13`), Bearer Token Usage (RFC 6750), Authorization Server Metadata (RFC 8414), Dynamic Client Registration (RFC 7591 — **déprécié dans cette révision au profit des « Client ID Metadata Documents »**, cf. §5.3), Resource Indicators (RFC 8707), Protected Resource Metadata (RFC 9728), Authorization Server Issuer Identification (RFC 9207), OpenID Connect Discovery 1.0. Le serveur MCP agit comme **OAuth 2.1 resource server** ; les serveurs **MUST** implémenter RFC 9728 (Protected Resource Metadata) ; les clients **MUST** utiliser RFC 8707 (`resource` parameter, audience-binding) ; jeton toujours en `Authorization: Bearer <token>`, jamais en query string.

### 5.3 Nouveauté normative de cette révision, pertinente pour un serveur neuf (2026-07-28) [lu, source #4, changements mineurs #7/#8/#9, « Deprecated » #4]

- Validation `iss` (RFC 9207) désormais attendue côté client (SEP-2468).
- `application_type` requis en Dynamic Client Registration pour éviter des conflits de redirect URI OpenID Connect (SEP-837).
- Identifiants client liés à l'émetteur — pas de réutilisation cross-AS (SEP-2352).
- **Dynamic Client Registration (RFC 7591) déprécié** au profit des **Client ID Metadata Documents** (`draft-ietf-oauth-client-id-metadata-document-00`) — RFC 7591 reste disponible seulement pour compatibilité descendante.

### 5.4 Ce que le SDK TypeScript applique par défaut, au-delà du texte de la spec [lu, source #16, verbatim résumé + citation ciblée]

`createMcpExpressApp()` / `createMcpHonoApp()` / `createMcpFastifyApp()`, quand configurés en mode « localhost », **valident déjà l'`Origin` par défaut** ; un `Origin: null` (iframes sandboxées, pages `file://`, redirections cross-origin) est **rejeté avec 403 et ne peut pas être allow-listé**. Helpers indépendants du framework : `validateOriginHeader`, `localhostAllowedOrigins`, `originValidationResponse` (`@modelcontextprotocol/server`) ; `hostHeaderValidation`/`originValidation` pour `node:http` brut (`@modelcontextprotocol/node`). Authentification Bearer runtime-neutre (`requireBearerAuth`, `verifyBearerToken`) et découverte OAuth (`oauthMetadataResponse`, RFC 9728 + RFC 8414) sont des exports de premier rang de `@modelcontextprotocol/server` — donc disponibles sans dépendre du paquet figé `server-legacy` (§6.2).

**Application à MONARK** : le test 45 (`mcp_tools_readonly_fixtures`) porte sur l'absence d'outils d'écriture, PAS sur l'authentification — la spec elle-même dit l'auth **optionnelle**. Pour un serveur exposant uniquement des vérifications déterministes en lecture sur fixtures, au pivot (avant que « clés API par acheteur » n'existe, D5), une posture minimale défendable est : Origin validation (MUST, gratuite avec les helpers ci-dessus) + rate-limiting/WAF Cloudflare (déjà prévu, D2 Addendum) + PAS d'OAuth 2.1 complet tant qu'aucune clé acheteur n'existe — à confirmer par l'orchestrateur, ce n'est pas tranché par la spec elle-même (silence = permis, pas prescrit).

---

## 6. Q5 — Keepalive / heartbeat (le point le plus directement engagé par ADR-M004 D3)

**Il faut distinguer deux couches, normative (spec) et implémentation (SDK) — ne pas les confondre, ce sont deux P1 différents.**

### 6.1 Couche normative — ce que la spec dit (et ne dit plus)

- **`ping` supprimé** dans cette révision [lu, source #4, changement majeur #5, verbatim] : « Remove `ping`, `logging/setLevel`, and `notifications/roots/list_changed`. » Le mécanisme JSON-RPC générique de vérification de vivacité qui existait dans les révisions antérieures **n'existe plus** dans la révision courante.
- **Recommandation de keepalive, mais seulement pour le flux long `subscriptions/listen`** [lu, source #2, verbatim] :

  > « For long-lived streams — in particular the `subscriptions/listen` response stream — servers are encouraged to periodically emit an SSE comment line (a line beginning with a colon, e.g. `:\r\n`) as a keep-alive. This keeps the connection from being closed by intermediaries or client idle timeouts during quiet periods when no notifications are flowing. »

  C'est une recommandation (« encouraged », pas MUST/SHOULD normatif), et elle vise nommément le flux de notifications long-lived — **pas** explicitement le flux de réponse scopé à une requête `tools/call` (qui, par construction, se termine avec la réponse finale et n'est donc a priori pas « long-lived » sauf si le traitement de l'outil est lui-même lent).
- **`X-Accel-Buffering: no`** recommandé (SHOULD) sur toute ouverture de flux SSE pour empêcher un proxy de type nginx de bufferiser — mention spécifique à nginx dans le texte ; sans objet direct pour Caddy (le proxy de MONARK, ADR-M004 D3) mais à vérifier si Caddy bufferise par défaut (non vérifié dans cette passe — **hors périmètre**, à instruire par B-infra si un symptôme de latence SSE apparaît).

### 6.2 Couche implémentation — ce que le SDK TypeScript fait réellement, par défaut [lu, sources #17/#18, verbatim]

`docs/troubleshooting.md` du SDK, verbatim [lu, source #17] :

> « HTTP SSE streams emit a `: keepalive` comment every **15 seconds** by default so client body-idle timeouts and intermediaries do not terminate an otherwise idle connection. Configure the interval with `keepAliveMs` on the transport or `createMcpHandler`; set it to `0` to disable heartbeats. »

Confirmé au niveau code source (`packages/server/src/server/perRequestTransport.ts`, [lu, source #18]) : `keepAliveMs?: number` avec commentaire de code verbatim « defaults to `15000`, `0` disables » — appliqué à **« every HTTP SSE stream it serves »** (pas seulement `subscriptions/listen`), donc y compris un flux de réponse scopé à un seul `tools/call`.

**15 000 ms est confortablement sous les ~100 s de timeout Cloudflare cités par ADR-M004 D3** (fait [2nd] pour cette archive, non re-vérifié par moi — cf. §4) — et sous le « ~30 s » qu'ADR-M004 D3 avait anticipé construire soi-même. **Avec ce SDK, MONARK n'a rien à construire pour le heartbeat : le comportement par défaut suffit, à une réserve de timing près (§6.3).**

### 6.3 Réserve de timing — quand le keepalive commence réellement à couler [lu, source #18, verbatim de code + commentaires]

Le SDK expose trois modes de réponse (`responseMode`) : `auto` (défaut — le serveur choisit JSON ou SSE selon que le handler émet ou non un message avant son résultat), `sse` (forcé), `json` (jamais de flux). Commentaire de code verbatim [source #18, L69-72] :

> « `sse`: always answer handler output over an SSE stream. **The stream opens once the request has passed the pre-dispatch validation gates**, so ladder rejections keep their mapped HTTP status instead of being framed onto a 200 stream. »

Et le minuteur de keepalive est armé **immédiatement à l'ouverture du flux** (`this._sse.keepAliveTimer = armSseKeepAlive(...)`, juste après la création du flux SSE, avant tout octet produit par le handler). **Conséquence précise** : en mode `responseMode: 'sse'` (forcé), le flux — et donc le keepalive — s'ouvre **avant** l'exécution du handler ; un outil lent (même sans rien émettre) est donc protégé dès le départ contre l'idle-timeout. En mode `auto` (le défaut), le serveur peut rester en attente **sans flux ouvert du tout** tant qu'il n'a pas décidé JSON vs SSE — décision qui, d'après le texte de la doc de migration, dépend de si le handler émet un message intermédiaire avant son résultat. **Un outil lent sous `auto` qui n'émet aucune notification de progression avant de conclure pourrait donc, en théorie, ne bénéficier d'aucun keepalive avant sa propre fin** — point non totalement résolu par cette lecture (le comportement exact d'« auto » face à un long silence sans message intermédiaire n'a pas été lu jusqu'au bytecode ; **NON TROUVÉ** au niveau de détail « auto bascule-t-il en JSON pur si rien n'arrive avant la fin, ou attend-il indéfiniment sans flux » — cf. §8).

**Recommandation pour MONARK (proposition, pas verdict)** : pour tout outil dont la durée n'est pas bornée à quelques centaines de millisecondes (à documenter par outil), configurer explicitement `responseMode: 'sse'` plutôt que de compter sur `auto`, OU garantir qu'un `notifications/progress` est émis suffisamment tôt. **Pour le périmètre concret du pivot (`hikae_conform`/`hikae_gate`/`ukemi_clearing` sur fixtures statiques, test 45)**, cette réserve est vraisemblablement **inerte en pratique** — des vérifications déterministes sur données figées sont improbablement lentes — mais le point reste à vérifier une fois le budget de temps des trois outils mesuré (non fait ici, hors périmètre R-P3).

---

## 7. Q6 — Implications MONARK

### 7.1 SDKs officiels disponibles — scission v1/v2, pas une continuité linéaire

**`@modelcontextprotocol/sdk`** (paquet unifié historique) : dernière version publiée **`1.30.0`** (2026-07-27T17:56:01Z, veille de la révision spec 2026-07-28) [lu, source #11] — **pas dépréciée au registre** (`npm view ... deprecated` vide) mais son contenu (source #12) est un **patch de maintenance de la ligne v1.x** (fixes keep-alive SSE, validation Content-Type, buffer stdio) — **rien n'indique qu'elle implémente la révision 2026-07-28** ; ne pas présumer le contraire.

**Le même jour**, quatre nouveaux paquets **`2.0.0`** sont publiés [lu, source #13] : `@modelcontextprotocol/core` (schémas Zod partagés spec+OAuth), `@modelcontextprotocol/client`, `@modelcontextprotocol/server`, `@modelcontextprotocol/server-legacy`. Confirmé **explicitement** par les notes de version GitHub (PR #2402) [lu, source #14] :

> « First beta release of SDK v2 with support for the MCP **2026-07-28** specification revision. »

`@modelcontextprotocol/server-legacy`, description npm verbatim [lu, source #13] : « Frozen v1 SSE transport and OAuth Authorization Server helpers [...] **Deprecated**; use StreamableHTTP and a dedicated OAuth server in production. » — confirmé indépendamment par `docs/troubleshooting.md` [lu, source #17] : ce paquet héberge le **très ancien** transport HTTP+SSE (2024-11-05) et les helpers pour **héberger soi-même** un serveur d'autorisation OAuth (`mcpAuthRouter`, `ProxyOAuthServerProvider`) ; les helpers de **resource server** (`requireBearerAuth`, `mcpAuthMetadataRouter`, `OAuthTokenVerifier`) restent de premier rang dans `@modelcontextprotocol/express` (2.0.0 [lu, source #13]) — donc pleinement disponibles pour un serveur MONARK moderne qui n'a pas besoin d'héberger son propre AS. `@modelcontextprotocol/node` (2.0.0) fournit l'adaptateur pour un hébergement Node classique (`toNodeHandler`), pertinent pour l'architecture VPS+Caddy de MONARK (par opposition à un hébergement Cloudflare Workers).

**Ce que MONARK doit installer** : `@modelcontextprotocol/server` (+ `@modelcontextprotocol/node` si hébergé en conteneur Node/Express derrière Caddy, ce qui est l'architecture ADR-M004 D3). **Ne pas** partir de `@modelcontextprotocol/sdk` (v1, ligne gelée côté fonctionnalités modernes) ni ajouter `server-legacy` sauf besoin explicite de parler au tout ancien HTTP+SSE 2024-11-05.

### 7.2 Compatibilité dual-era — quasi gratuite avec l'entrée haut niveau [lu, source #15, verbatim, L137-142]

> « `createMcpHandler(factory)` from `@modelcontextprotocol/server` is the v2 HTTP entry that serves 2026-07-28 per request — and, **by default** (`legacy: 'stateless'`), **also serves 2025-era traffic per request** through the established stateless idiom. **One factory, one endpoint, both eras.** »

C'est le point le plus directement actionnable de toute cette recherche : avec la configuration par défaut, un unique serveur MONARK sert simultanément les clients modernes (2026-07-28) et les clients d'ère 2025 (2025-03-26→2025-11-25) qui ouvriraient une session ou un `initialize` — sans code de branchement manuel. **Limite documentée** : ce mode « stateless legacy » ne peut pas offrir aux clients d'ère 2025 le canal serveur→client historique (élicitation/sampling poussés pendant l'appel) — « The shim degrades to the clean capability refusal there » [lu, source #15, §Legacy shim] ; sans objet pour des outils de vérification déterministe à un coup comme ceux visés par MONARK (§7.4).

### 7.3 Qui appellera réellement MONARK — la question d'interopérabilité résolue, pas seulement supposée

R-P2 avait établi (2026-09-06) que `Clawpump/claw-agent` (distribution de Hermes/Nous Research, Python, MIT) est le harnais visé par « Genkan »/« DeFAI harness ». Cette passe a vérifié, **au même commit que R-P2** (`7b81ee98645497eac3f00bdf037fe666928e04b8`), le fichier `pyproject.toml` du dépôt [lu, source #20, verbatim] :

> « mcp==2.0.0 implements MCP revision **2026-07-28** and moved its own HTTP stack from `httpx` to `httpx2`. »

**Le client MCP réel que Hermes/`claw-agent` utilisera pour appeler MONARK est donc déjà épinglé sur la révision moderne (2026-07-28), la même que MONARK doit implémenter.** Ceci réduit substantiellement le risque « dual-era obligatoire » — le dual-era (§7.2) reste une bonne pratique de robustesse pour d'autres appelants hypothétiques, mais n'est **pas** une nécessité dure pour le consommateur identifié.

Deux mécanismes de connexion côté Hermes, tous deux vérifiés en source [lu, sources #21/#22] :
- **Catalogue curé** `optional-mcps/<nom>/manifest.yaml`, exemple réel lu intégralement (`linear`, un vrai serveur MCP distant en production) : champs `transport: {type: http, url: ...}`, `auth: {type: oauth | none | ...}` ; commentaire de tête verbatim : « Nous-approved MCP catalog entry. Presence in this directory = approval. Merged via PR review. » — **c'est la même contrainte de calendrier que R-P2 avait déjà signalée pour les skills in-repo (voie (a), non réaliste pour le pivot 14 jours)** ; s'applique de façon identique ici, pas une découverte nouvelle mais une confirmation croisée.
- **Ajout manuel sans catalogue** : `hermes mcp add <name> --url <endpoint>` [lu, source #22, aide CLI verbatim : « Add a custom MCP server »] — un opérateur peut connecter Hermes à `https://mcp.monark.<domaine>/mcp` **sans aucune revue PR ni inscription au catalogue officiel**. C'est la voie directement disponible pour MONARK au pivot, cohérente avec la voie (c) projet-local déjà retenue par R-P2 pour les skills (aucune dépendance à l'approbation Nous Research).

### 7.4 Opportunité de cache — cohérente avec des fixtures statiques

La révision courante exige `ttlMs`/`cacheScope` sur les résultats « cacheable » (`tools/list`, `resources/list`, `resources/read`, etc.) [lu, source #4, changement mineur #5]. Le SDK par défaut émet la valeur la plus conservative (`ttlMs: 0`, `cacheScope: 'private'`) [lu, source #15]. Puisque le test 45 porte sur des **fixtures** (données figées, pas un flux réel), MONARK peut légitimement configurer `ServerOptions.cacheHints`/`cacheHint` avec un `ttlMs` non nul et `cacheScope: 'public'` — gain de performance direct et sans risque de fraîcheur, à trancher par qui implémente B-mcp (pas tranché ici, proposition seulement).

### 7.5 Sécurité — posture minimale proposée pour le pivot

Cf. §5.4 : Origin validation (MUST, gratuite via les helpers du SDK) + WAF/rate-limiting Cloudflare déjà prévu (D2 Addendum) ; auth OAuth 2.1 complète différée à l'ouverture des « clés API par acheteur » post-pivot (D5) — la spec elle-même rend l'auth optionnelle, rien ne l'impose au pivot pour un serveur strictement lecture-seule sur fixtures.

### 7.6 État de `annotations`/`readOnlyHint` (piste pour l'oracle du test 45)

**NON TROUVÉ** sur `server/tools.md` (2026-07-28) [lu, source #7] : le champ `annotations` y est mentionné (« Optional properties describing tool behavior », avec avertissement que les clients doivent les traiter comme non fiables sauf serveur de confiance) mais **aucun champ nommé** (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` — connus de révisions antérieures par ma connaissance d'entraînement) n'apparaît dans le texte de cette page précise (recherche `Hint` exhaustive sur le fichier : zéro occurrence). Ceci ne prouve PAS leur suppression (la page peut renvoyer au schéma JSON sans les énumérer en prose) — juste qu'ils ne sont **pas documentés en prose à cet endroit**. Si test 45 doit s'appuyer sur un champ d'annotation `readOnly` comme oracle, **vérifier directement `schema/2026-07-28/schema.json`** avant d'en dépendre — non fait ici, hors budget de cette passe (cf. §8).

---

## 8. NON TROUVÉ / points ouverts (non comblés par supposition)

1. **Comportement précis de `responseMode: 'auto'` face à un handler lent sans notification intermédiaire** : reste-t-il sans flux ouvert (donc sans keepalive) jusqu'à la fin, ou bascule-t-il vers un flux après un certain délai ? Non tranché par la lecture faite (§6.3). Pertinence pratique jugée faible pour les outils MONARK visés (vérifications rapides sur fixtures) mais non vérifiée quantitativement (durée réelle non mesurée).
2. **Schéma exact des `annotations` d'outil (`readOnlyHint` etc.) dans `schema/2026-07-28/schema.json`** : non ouvert (§7.6) — pertinent si test 45 veut un oracle structurel plutôt qu'un audit manuel de la liste d'outils exposés.
3. **Comportement de Caddy vis-à-vis du buffering SSE** (la spec recommande `X-Accel-Buffering: no`, nommément pour nginx) : non vérifié, hors périmètre R-P3, à instruire par B-infra si latence anormale constatée.
4. **Version exacte du SDK Python `mcp` au-delà du pin `pyproject.toml`** (changelog propre du paquet Python `mcp==2.0.0`, garanties précises côté client Python face à un serveur `legacy: 'stateless'`) : non ouvert — le pin et son commentaire d'intention suffisent à la décision de compatibilité de cette passe (§7.3), un examen plus fin du client Python lui-même serait un chantier séparé, disproportionné au périmètre de R-P3.
5. **Chiffre « idle timeout ~100 s » Cloudflare** : repris tel quel d'ADR-M004 D3, **non re-vérifié par moi aujourd'hui** — c'est un [2nd] pour cette archive (ADR-M004 cite lui-même la communauté Cloudflare, 2026-09-07). Aucune action requise ici ; signalé pour que la comparaison §6.2 (15 000 ms vs ~100 000 ms) ne soit pas lue comme si j'avais revérifié le second terme.
6. **`Q1` ordre de coupe (ADR-M004 §6)** : B-mcp reste une « coupe candidate » — cette recherche ne tranche pas cette décision d'ordonnancement, elle documente seulement ce qu'il faudrait implémenter SI B-mcp est retenu au pivot.

Aucune procuration formée n'est nécessaire : aucun document n'a été jugé introuvable au sens du corpus (« papier/document introuvable ») — tous les points ci-dessus sont des approfondissements possibles, pas des sources bloquantes manquantes.

---

## 9. Contradictions relevées

Aucune contradiction inter-sources rencontrée dans cette passe (les sources P1 — spec officielle, changelog, releases GitHub, code source, registre npm, dépôt `claw-agent` — se recoupent sans divergence sur tous les points croisés). Seule tension notée : la révision spec « Current » a elle-même bougé après sa propre date de sortie nominale (le SDK note un alignement tardif sur « spec PR #3002 » après la première beta v2, cf. source #15 §« Server identity in result `_meta` ») — pas une contradiction entre sources, mais un rappel que « 2026-07-28 » est un **nom de révision**, pas un instantané figé au jour near son introduction ; chaque page citée porte sa date de fetch (2026-09-07) pour cette raison.

---

## État (chercheur, 2026-09-07)

**R-P3 CLOS** pour les six questions de mission, sourcé P1 sur toute la chaîne (spec officielle → changelog → SDK TypeScript v2 → code source du transport → dépôt réel du consommateur `claw-agent`). Piste memstack vérifiée exacte et créditée (§0). Point R-P2 laissé ouvert (« quel client MCP, quelle version, quelle ère côté claw-agent ») **résolu dans cette même passe** (§7.3). Aucun code produit écrit, aucun commit. Le présent fichier est l'archive ; le rapport à l'orchestrateur (réponse de cet agent) en est un résumé et ne le remplace pas.
