# R-P1 — Harnais ClawPump / UsePod : forme technique pour le prédicteur MONARK

**Chercheur** : modèle résolu **`claude-sonnet-5`** (Gate 0 : conforme à l'attendu ADR-M003 D5, aucune
divergence de préfixe — contrôle fait avant toute production ci-dessous).
**Date de la passe** : 2026-09-06. **Mission** : ADR-M003 D5 (Phase 2 MONARK) — trancher la forme du
harnais ClawPump/UsePod pour un client prédicteur TypeScript appelé par `crossAgentGate`.
**Statut** : EN COURS D'ÉCRITURE (au fil de l'eau) — ce document est complété section par section ;
ne pas consommer comme clos tant que la ligne « CLÔTURE » n'apparaît pas en pied de fichier.
**Discipline** : [lu] = page/doc ouverte par moi aujourd'hui ; [2nd] = fait établi par une recherche
antérieure du corpus interne (`F:\Clawpumptech\gap-recherche\G3-inference.md` et
`H-INF3b-outillage.md`, chercheur Sonnet 5, 2026-08-26/27 ; `F:\Clawpumptech\agent\HERMES-FONDEMENTS.md`,
worker Opus 4.8, 2026-08-27→31) que je n'ai pas re-ouverte moi-même à l'instant où je le cite — reporté
avec sa date pour signaler le risque de péremption (~10 jours, plateforme hackathon en mouvement rapide) ;
je re-vérifie en [lu] ce qui est critique pour la décision. « not_found » est une réponse légitime.
**Ne lifte aucun code. N'ouvre pas `grok 1\src\**`. N'appelle pas l'outil advisor intégré. Ne committe pas.**

---

## Contexte hérité (orientation, non re-dérivé) — collision de noms telle que posée par la mission

- **ADR-M001 l.47** (Décision 2, « Flotte polyglotte ») : « runtime Hermes/`claw-agent` = **Python** »,
  cité comme composant du recensement `.py` vs `.ts` (`HERMES-FONDEMENTS §1`). ADR-M001 l.63-64
  désambiguïse déjà en interne : « Shōgen ADR-0023 “Hermes” = **Pyth Hermes** (prix) ; Grok “Hermes” =
  **Nous Research Hermes** (runtime). Deux Hermes, toujours qualifier. »
- **ADR-M003 §1.3 item 2 et item 4** : « Forme de l'API UsePod/Hermes (harnais ClawPump) : absente du
  corpus » → item de recherche formé **R-P1** (ce document). Collision nommée : « Hermes » = (a) Pyth
  Hermes (Shōgen ADR-0023) **≠** (b) harnais Hermes/claw-agent ClawPump. Vocabulaire imposé dans le code :
  `pyth-hermes` vs `clawpump-hermes`, jamais « Hermes » nu.
- **Fait interne déjà établi en source primaire (à re-vérifier ci-dessous, pas ré-inventé)** :
  `F:\Clawpumptech\agent\HERMES-FONDEMENTS.md` (Opus 4.8, audit direct du dépôt `github.com/Clawpump/claw-agent`,
  commit `fce83ab7…` du 2026-08-27, re-vérifié 2026-08-31 au HEAD `7b81ee98…`) établit que **le dépôt
  `claw-agent` de ClawPump SE DÉCLARE LUI-MÊME**, verbatim README L26, « a downstream distribution of the
  Hermes Agent by Nous Research ». C'est donc un fait [2nd] pour ce document (je n'ai pas rouvert ce README
  moi-même à l'instant T) mais avec provenance solide (audit dédié, deux passes indépendantes). **Distinct**
  de la question posée par R-P1 : est-ce que **UsePod** (le sponsor du track « Inference Markets »,
  entité distincte de ClawPump — à trancher ci-dessous Q1/Q4) a un rapport quelconque avec ce runtime Hermes ?
  Réponse préliminaire du même document [2nd] : **non établi ni infirmé** — GAP FORMÉ (§4 de ce fichier
  interne), jamais résolu côté UsePod spécifiquement.
- **UsePod ≠ ClawPump : deux tracks séparés du même hackathon** (ADR-M002 l.39 : « tracks : pump.fun
  (tooling/skills/harness) + UsePod (profondeur d'inférence) ») — hypothèse de travail à confirmer/infirmer
  en Q1/Q4 ci-dessous avec sources primaires fraîches, pas seulement le corpus interne.

---

## Q1 — Qu'est-ce que UsePod ? Lien avec ClawPump et le hackathon ?

**UsePod** = *« The inference marketplace built for agents »* (titre de page `usepod.ai`) [lu, WebFetch
2026-09-06]. Plateforme de **routage d'inférence** de type marché : reçoit des requêtes au format
compatible OpenAI/Anthropic et les route vers le fournisseur de compute le moins cher disponible, avec
règlement en carte, solde USDC, ou micro-paiement x402 à la requête. Ce n'est **ni un framework d'agent,
ni un « harnais »** au sens agentique — c'est un **proxy HTTP** (détail transport en Q2).

**Société/entité de publication** : le code côté fournisseur est publié par l'organisation GitHub
**`Sortis-AI`** [abs, WebSearch 2026-09-06, confirme et étend le repérage du 2026-08-26 : dépôts
`usepod-agent`, `pod_trades`, `cli.city`, `agent-x`, `agent-wallet`] — « UsePod » est le nom de marque/produit,
« Sortis-AI » l'entité qui publie le code. Représentant public visible : **Chris Gilbert**, handle X
**@0xgilbert**, qui revendique verbatim (X, [2nd], repéré 2026-08-26 et re-surfacé 2026-09-06 sans
re-fetch direct — X bloque WebFetch, cf. échecs) : *« I coined the Inference Capital Markets... to
describe UsePod »*.

**Que signifie « pod » ?** **NON TROUVÉ.** Aucune définition explicite du terme sur `usepod.ai` [lu,
2026-09-06, confirme le constat du 2026-08-26] — traité comme un nom de marque sans sens technique déclaré.
(Point de vigilance nominal, non résolu : **RunPod** est un service de cloud GPU *différent et sans rapport*
qui utilise aussi « Pod » — collision de nom à ne pas confondre, cf. Q2/journal des URL.)

**Documentation officielle** : `https://docs.usepod.ai` (PAS `usepod.ai/docs`, qui renvoie **HTTP 404** —
confirmé deux fois indépendamment, 2026-08-26 et 2026-09-06). Whitepaper : `https://usepod.ai/whitepaper.pdf`
[lu, 2026-09-06, mais extraction dégradée — flux compressés, texte non pleinement lisible ; aucune mention
de « Hermes »/« ClawPump »/« hackathon » dans la portion extraite].

**Lien avec ClawPump/hackathon — nature du lien établie** : UsePod est le **sponsor nommé** d'UN SEUL
track (« Inference Markets ») du hackathon **« The AnsemHack Clawrena »**, organisé sur/par la plateforme
**ClawPump**. C'est une relation de **sponsoring/organisation d'évènement**, PAS un lien technique/produit :
aucune des pages UsePod consultées (homepage, docs.usepod.ai en intégral, whitepaper, les deux fichiers
SKILL.md) ne mentionne « ClawPump » nulle part [lu, 2026-09-06, multiples pages].

**Page officielle du hackathon** : `https://clawpump.tech/ansemhack` [lu, 2026-09-06].
- Nom : « The AnsemHack Clawrena ». Dates : ouverture inscriptions 19 août 2026 ; **clôture
  inscription+tokenisation 20 septembre 2026** ; jugement 21-30 septembre ; résultats 1er octobre 2026 —
  **CONFIRME exactement le calendrier d'ADR-M003 §1.2** (aucun écart avec l'ADR lui-même).
- Tracks et prix (copié verbatim/reconstruit, [lu] 2026-09-06) :
  | Track | Part $ANSEM | Cash additionnel | Compute |
  |---|---|---|---|
  | Overall Winner (auto) | 25 % (~$62 500) | — | — |
  | ClawPump × pump.fun | 50 % (~$125 000) | +$40K | — |
  | Inference Markets (**UsePod**) | 15 % (~$37 500) | — | +$10K compute |
  | EasyA Kickstart | 10 % (~$25 000) | +$25K | — |
  Total affiché aujourd'hui : **$350 000** ($250K pool + $65K cash + $10K compute).
- Critère de jugement du track UsePod, verbatim (copié) : *« How deep the UsePod inference goes, and
  what it unlocks »*.
- **Mention « Hermes » — une seule occurrence sur toute la page**, verbatim : *« a use of the Hermes
  DeFi harness nobody has tried »* — **cette phrase est dans la description du track ClawPump × pump.fun,
  PAS dans celle du track UsePod/Inference Markets** (voir Q4 pour le tranchage complet).

**Contradiction datée relevée (reportée, non résolue)** : le corpus interne (`G3-inference.md`, [2nd],
2026-08-26) enregistrait un pool total de **$320 000** (cash ClawPump×pump.fun = +$35K, pas +$40K) et un
jugement « 20-30 septembre » (pas 21-30) et une clôture « 19 septembre » (pas 20). Ma vérification fraîche
de ce jour (2026-09-06) donne systématiquement les chiffres ci-dessus ($350K, +$40K, 21-30, 20 sept.) et
**coïncide exactement avec ADR-M003** (rédigé le 2026-09-05) — je retiens donc les chiffres d'aujourd'hui
comme les plus à jour, et signale l'écart avec le doc du 2026-08-26 comme une **mise à jour probable de la
page entre les deux passes** (~11 jours), pas une erreur d'extraction à trancher ici.

---

## Q2 — Transport : API HTTP, SDK, MCP, limites

**Nature du transport : proxy HTTP REST, compatible OpenAI ET Anthropic. Pas de MCP côté UsePod. Pas de
SDK propriétaire UsePod.** Triangulé sur 5 fetches indépendants qui s'accordent mot pour mot sur le
mécanisme d'auth et la forme des URL : `llms-full.txt`, `using/quickstart/`, `api/proxy/`,
`skill/client-onboard/SKILL.md`, `resources/for-agents/` [tous lu, 2026-09-06].

**Base URLs exactes** :
- Compatible Anthropic : `https://api.usepod.ai/proxy/<token>` (variable client conventionnelle :
  `ANTHROPIC_BASE_URL`)
- Compatible OpenAI : `https://api.usepod.ai/proxy/<token>/v1` (`OPENAI_BASE_URL`)
- x402 sans compte : `https://api.usepod.ai/proxy/x402/v1/chat/completions` et `/v1/messages`

**Endpoints** : `POST /v1/chat/completions` (OpenAI) ; `POST /v1/messages` (Anthropic) ;
`GET /v1/models` ; et, **hors du préfixe `/proxy/`** : `POST https://api.usepod.ai/v1/register`
(création de jeton, détail en Q5).

**Authentification — mécanisme inhabituel, à retenir** : ce n'est PAS un header `Authorization: Bearer`.
Verbatim (≤ 25 mots) : *« The Authorization / api_key your SDK sends is ignored — auth is the token in
the path. »* Le jeton est un **segment de l'URL** (`/proxy/<token>/...`). Un client OpenAI/Anthropic
standard fonctionne sans modification autre que l'URL de base ; la valeur passée comme `api_key` par le
SDK est un **placeholder jamais vérifié**.

**Format requête/réponse** : JSON standard OpenAI/Anthropic (`{"model":"...","messages":[...],
"max_tokens":64}`), streaming supporté, *« token usage is extracted from the stream for settlement »*
[lu].

**Headers custom** :
| Sens | Header | Rôle |
|---|---|---|
| Requête | `Content-Type: application/json` | requis |
| Requête | `X-Pod-Max-Price-Input` | plafond prix/M tokens entrée, microunités USDC |
| Requête | `X-Pod-Max-Price-Output` | plafond prix/M tokens sortie, microunités USDC |
| Requête | `X-Pod-Routing-Mode` | `auto` (défaut) \| `marketplace-only` \| `centralized-only` |
| Requête | `X-Pod-Providers` | liste blanche de fournisseurs, séparée par virgules |
| Réponse | `X-Balance-Remaining` | solde du jeton après la requête |
| Réponse | `X-Pod-Route` | `marketplace` \| `key relay` \| `centralized` |
| Réponse | `X-Pod-Provider-Id` | identifiant du fournisseur ayant servi la requête |

**SDK** : **aucun SDK propre à UsePod pour l'inférence.** Réutiliser un client OpenAI ou Anthropic
standard (TypeScript : `openai` npm, `@anthropic-ai/sdk` — ou même `fetch` natif Node 24, aucune lib
requise) pointé sur l'URL de base. **Pour le dépôt on-chain USDC uniquement** (financement, pas
l'inférence elle-même) [lu, `docs.usepod.ai/api/deposit-on-chain/`, 2026-09-06] : TypeScript
`@coral-xyz/anchor` + `@solana/web3.js` (méthode `depositUsdc(code, amount)`) ; Python `anchorpy` +
`solders` + `solana` (résolution manuelle des comptes). Programme Anchor on-chain :
`BBAdcqUkg68JXNiPQ1HR1wujfZuayyK3eQTQSYAh6FSW` (Solana mainnet-beta).

**MCP** : **NON TROUVÉ côté UsePod.** `WebSearch "UsePod.ai MCP server model context protocol"`
(2026-09-06) ne retourne rien pour UsePod — seulement un serveur MCP **RunPod** sans rapport (collision
de nom signalée : RunPod ≠ UsePod, deux entités distinctes). ClawPump (la plateforme, distincte d'UsePod)
possède SON PROPRE MCP natif (`clawpump.tech/mcp`, lien de nav confirmé [lu] ; détail Agent MCP +
Launchpad MCP, ~126-134 outils : [2nd] `HERMES-FONDEMENTS.md` §2/§4) — **ce n'est pas la même chose que
l'inférence UsePod**, aucun pont documenté entre les deux.

**Limites** :
- **Rate** : qualitatif seulement — *« Per-token requests-per-minute and a concurrency cap apply »*
  [lu, résumé `llms-full.txt`], **aucune valeur numérique publiée** trouvée.
- **Prix** : les headers `X-Pod-Max-Price-*` sont le contrôle documenté ; si aucun fournisseur ne respecte
  le plafond, **la requête est rejetée**, jamais facturée plus cher silencieusement [lu,
  `docs.usepod.ai/api/proxy/`]. Les listings marketplace sont eux-mêmes plafonnés : *« listings are capped
  at the cheapest centralized price for the same model »* [lu, `docs.usepod.ai/marketplace/pricing/`] — le
  routage ne coûte donc jamais plus cher que la voie centralisée directe pour un même modèle.
- **Commission UsePod** : **80 % fournisseur / 20 % trésorerie UsePod** [lu, `marketplace/pricing/`,
  2026-09-06]. **Contradiction datée relevée** : le corpus interne (2026-08-26, [2nd]) enregistrait
  **90 %/10 %** (`G3-inference.md` §1.5 et memstack). Écart réel sur ~11 jours — signalé, non résolu
  (pourrait être une évolution réelle du barème ou une divergence d'extraction ; les deux valeurs sont
  rapportées avec leur date, aucune tranchée).
- **Tailles** : NON TROUVÉ (aucune limite de taille de payload/contexte documentée indépendamment du
  modèle choisi).

**Réserve méthodologique** : tout ce qui précède provient de pages `docs.usepod.ai` lues via WebFetch
(modèle de résumé, pas une lecture brute octet-par-octet par moi). Le mécanisme d'auth-dans-le-chemin et
la forme des URLs sont corroborés **mot pour mot sur 5 fetches indépendants** → confiance haute. Les
limites numériques de rate et le split 80/20 ne sont chacun attestés que par **1 à 2 fetches** → confiance
plus basse, signalée comme telle.

---

## Q3 — Format « skill » et la question `hikae_calibrate`/`hikae_conform`/`hikae_gate`

**Deux formats « SKILL.md » distincts coexistent dans ce corpus — ne pas les confondre.**

### 3.1 — Le format « skill » d'UsePod [lu, 2026-09-06]
Deux fichiers publiés : `https://usepod.ai/skill/client-onboard/SKILL.md` et
`https://usepod.ai/skill/host-onboard/SKILL.md`. Frontmatter observé (structure confirmée sur les deux
fichiers) : **`name`**, **`description`** (long, rédigé comme une liste de phrases-déclencheurs qu'un
utilisateur/agent pourrait prononcer — ex. verbatim ≤ 25 mots : *« should be used when the user asks to
“set up a UsePod host”... or otherwise wants to install the usepod-agent on a GPU box »*), **`version`**
(ex. `0.1.0`). **Aucun champ `author`, `license`, `platforms`, ni `metadata.hermes.*`** observé sur les
deux fichiers. Corps : étapes numérotées + `scripts/` (ex. `register.sh`, `wait-for-funding.sh`) +
`references/` (ex. `api.md`, `harness-snippets.md`). C'est le format générique **« Claude Code Agent
Skills »** — une convention ouverte (cf. `mdskills.ai/specs/skill-md`, `agentskills.io`, [abs, WebSearch
2026-09-06]) adoptée par plusieurs plateformes d'agents, **pas une invention ClawPump/Hermes**.

**Ce que ces deux skills font** : automatiser l'**onboarding** (`client-onboard` = enregistrer un jeton,
le financer, configurer un client ; `host-onboard` = installer l'agent fournisseur, poster la caution,
déployer sous systemd). **Elles n'exposent PAS l'inférence elle-même comme une « skill » invocable** —
appeler l'inférence UsePod reste un simple appel HTTP (Q2), sans skill impliquée.

### 3.2 — Le format « skill » de Hermes/`claw-agent` [2nd, `HERMES-FONDEMENTS.md` §3, audit Opus 4.8
2026-08-27/31 sur `AGENTS.md` L991-1102 du dépôt `claw-agent` — non rouvert par moi aujourd'hui]
Frontmatter : `name` / `description` (≤ 60 caractères) / `version` / `author` / `license` / `platforms` /
`metadata.hermes.{tags,category,related_skills,config}` + `scripts/`+`references/`+`templates/`+`tests/`.
Chargée par l'agent Hermes comme un **slash-command injecté dans le message utilisateur** (pas une
signature de fonction réseau-invocable) ; cycle de vie géré par `agent/curator.py`. **Schéma plus riche**
que celui d'UsePod (champs `author/license/platforms/metadata.hermes.*` absents côté UsePod) — **confirme
que ce sont deux schémas différents**, malgré le nom de fichier partagé `SKILL.md`.

### 3.3 — La question posée par la mission : MONARK doit-il exposer `hikae_calibrate`/`hikae_conform`/
`hikae_gate` comme une « skill » ?

**NON TROUVÉ.** Aucune source consultée — ni la documentation UsePod (§3.1), ni le site/hackathon
ClawPump, ni l'audit `claw-agent` déjà fait (§3.2) — n'établit que les primitives conformes de MONARK
doivent être empaquetées en SKILL.md (de l'un ou l'autre format) pour l'usage défini par ADR-M003 D5 : le
**Lot P** est MONARK **appelant** UsePod pour obtenir une `Prediction` — ce qui ne requiert qu'un client
HTTP simple (Q2), aucune skill n'intervient dans ce sens-là.

Le seul endroit du corpus qui discute d'« exposer nos primitives à un agent Hermes » est
`HERMES-FONDEMENTS.md` §6 [2nd] — et il y recommande explicitement **un serveur MCP maison**
(`shogen_commit/observe/mark/settle/receipt`, `vernier_gate_check`) comme point d'intégration pour des
primitives appelables, **pas une SKILL.md** (les skills y sont décrites comme de la documentation
procédurale qui *référence* des outils MCP par leur nom, pas le contrat appelable lui-même). **Mais ce
passage concerne un produit différent** (le plugin-middleware Vernier/« Coroner », pas MONARK) —
transposer cette recommandation à MONARK sans vérification serait une invention.

**Question formée pour l'orchestrateur/mainteneur (pas tranchée ici, pas comblée par supposition)** :
(a) existe-t-il un besoin réel qu'un tiers appelle `hikae_calibrate`/`conform`/`gate` depuis l'extérieur de
MONARK ? (b) si oui, cet appelant est-il une instance Hermes/`claw-agent` (auquel cas le motif documenté
est un **serveur MCP**, pas un SKILL.md, par analogie avec §3.2/HERMES-FONDEMENTS §6) ou autre chose (auquel
cas ni l'un ni l'autre format ne s'applique nécessairement) ? Cette recherche ne trouve aucune source pour
répondre — le premisse même (« MONARK doit exposer... ») semble importé d'un document conçu pour un produit
distinct et mérite confirmation avant tout code.

---

## Q4 — Identité « Hermes » : tranchée avec sources multiples et convergentes

**TRANCHÉ (2026-09-06), triangulation sur 4 sources indépendantes fraîches + 1 héritée** :

1. **Le dépôt `github.com/Clawpump/claw-agent`** [lu, 2026-09-06, re-fetch indépendant de l'audit
   2026-08-27/31] s'auto-décrit en tête de README : *« The self-improving AI agent built by
   Nous Research »* et, en toutes lettres : *« a downstream distribution of the Hermes Agent by Nous
   Research, used under the MIT License »*. **C'est le MÊME objet qu'ADR-M001 l.47** (« runtime
   Hermes/`claw-agent` = Python ») — confirmé AUJOURD'HUI, pas seulement hérité.
2. **La page hackathon** `clawpump.tech/ansemhack` [lu, 2026-09-06] ne porte le mot « Hermes » **qu'une
   seule fois**, verbatim : *« a use of the Hermes DeFi harness nobody has tried »* — **située dans la
   description du track ClawPump × pump.fun**, PAS dans celle du track « Inference Markets (UsePod) »
   (cf. Q1).
3. **Côté UsePod : zéro occurrence** de « Hermes », « Nous Research » ou « ClawPump » trouvée sur
   `usepod.ai` (homepage) [lu], `docs.usepod.ai` (16 pages indexées via `llms.txt`, contenu intégral via
   `llms-full.txt`, + pages `proxy`/`register`/`x402-payments`/`deposit-on-chain` individuellement fetchées)
   [lu], `usepod.ai/whitepaper.pdf` [lu, extraction dégradée mais rien trouvé dans le texte lisible], et
   les deux fichiers `SKILL.md` d'onboarding [lu] — **toutes ces pages consultées ce jour, 2026-09-06**.
4. **Le site principal `clawpump.tech`** (hors page hackathon) [lu, 2026-09-06] : slogan *« The Home of
   Agentic Finance »*, **zéro mention** de « Hermes »/« Nous Research »/« harness » — cohérent avec
   `HERMES-FONDEMENTS.md` [2nd, 2026-08-31] qui avait fait le même constat un mois plus tôt (le site
   marketing ClawPump ne s'auto-décrit jamais comme « Hermes »).

**Verdict** : « Hermes » désigne, **sans ambiguïté et de façon univoque dans tout ce corpus**, un seul et
même objet — l'agent Hermes de Nous Research, redistribué par ClawPump sous le nom `claw-agent`
(framework d'agent ReAct complet, Python, MIT) — **associé exclusivement au track ClawPump × pump.fun**.
**UsePod (le sponsor du track « Inference Markets », l'objet réellement visé par le prédicteur MONARK)
n'a AUCUN lien technique ou documentaire établi avec Hermes.** Le seul lien entre les deux est
organisationnel/calendaire : deux tracks séparés du même hackathon AnsemHack, hébergé par la plateforme
ClawPump — rien de plus.

**Il n'existe pas de troisième objet fusionné « harnais Hermes/UsePod ».** La formulation d'ADR-M003
§1.3 item 2 (« Forme de l'API UsePod/Hermes (harnais ClawPump) ») **conflate deux entités distinctes** :
UsePod n'est pas un harnais d'agent au sens Hermes — c'est un proxy HTTP stateless (Q2), qui n'a ni skills
au format Hermes (Q3), ni relation documentée avec `claw-agent`.

**Conséquence directe pour le nommage** (reprise en Recommandation) : le terme `clawpump-hermes`
(ADR-M003 §1.3 item 4, déjà réservé pour distinguer de `pyth-hermes`) doit rester réservé à ce qui touche
RÉELLEMENT le runtime `claw-agent`/Hermes. Le client prédicteur MONARK (Lot P, appelant UsePod) **ne
touche à aucun des deux Hermes** — ni Pyth Hermes, ni Nous Research Hermes. Le nommer `clawpump-hermes`
serait, à la lumière de cette recherche, **un troisième mésusage du mot « Hermes »**, aussi trompeur que
les deux collisions déjà identifiées par le corpus.

---

## Q5 — Clés : délivrance, variables d'environnement, ce qu'elles autorisent

**Pas de flux "compte → dashboard → générer une clé" classique.** [lu, `docs.usepod.ai/api/register/` +
`using/quickstart/`, 2026-09-06] Un `POST https://api.usepod.ai/v1/register`, **sans corps ni
authentification** (verbatim ≤ 10 mots : *« No body or auth is required »*), retourne immédiatement :
- **`<token>`** : UUID, sert de jeton d'autorisation pour les appels d'inférence, **inséré dans le chemin
  de l'URL** (Q2) — jamais dans un header.
- **`deposit_code`** : hexadécimal 16 caractères, sert UNIQUEMENT à lier un dépôt USDC on-chain au jeton.
  Verbatim (≤ 20 mots) : *« The API token authorizes inference calls, the deposit_code only authorizes
  inbound credit. »*

Un tableau de bord existe (financement carte via `usepod.ai/fund` ; affichage token/solde/historique,
[lu résumé WebFetch]) mais **n'est pas un pré-requis** — le jeton est utilisable dès sa création, avant
tout financement (les appels échouent seulement faute de solde : *« A token with no balance is rejected
before any upstream call »* [lu]).

**Ce que le jeton autorise** : uniquement les appels d'inférence proxifiés, débités du solde préchargé.
Aucun scope/permission granulaire documenté. Le `deposit_code` n'autorise PAS l'inférence, seulement le
crédit entrant.

**Variable d'environnement conventionnelle côté UsePod** : le skill `client-onboard` mentionne
**`USEPOD_API`** comme *« paramètre optionnel pour déploiements auto-hébergés »* [lu, résumé WebFetch,
2026-09-06] — **PAS `USEPOD_API_KEY`**. UsePod n'impose aucun nom de variable pour le jeton côté client
ordinaire (il va dans l'URL, pas dans un header `Authorization` standard). Le nom **`USEPOD_API_KEY`**
choisi par ADR-M003 D5 reste un choix MONARK, praticable (rien ne s'y oppose), mais ce n'est **pas** le
nom natif UsePod — à noter si une cohérence de nommage avec l'écosystème UsePod est souhaitée.

**Nature du secret** : ce « token » est le UUID retourné par `/v1/register` — **pas un secret
cryptographique fort au sens classique** (pas de signature, pas de rotation documentée) ; sa seule
protection est la non-divulgation (quiconque le détient peut dépenser le solde associé). Cohérent avec
D0.3 (« saisie de la clé API UsePod... jamais dans le dépôt » — action réservée investisseur).

**Financement** : carte bancaire (`usepod.ai/fund`), USDC direct sur Solana (adresse liée au
`deposit_code`), ou **x402 par requête sans compte du tout** (Q2/Q6) — trois voies indépendantes.

---

## Q6 — Sandbox / mock officiel pour un client TypeScript sans réseau sous test

**NON TROUVÉ.** Recherche dédiée : `docs.usepod.ai` intégral (`llms-full.txt` + `llms.txt`, 16 pages
indexées) + page `resources/for-agents/` (destinée spécifiquement aux agents autonomes/consommation
machine) + `WebSearch "UsePod usepod.ai sandbox testnet devnet mock mode API"` [tous 2026-09-06] :
**aucun mode sandbox, testnet, ou clé de démonstration officiel n'est documenté nulle part.** Verbatim
(résumé WebFetch, ≤ 15 mots) : *« No test mode, sandbox, or demo keys documented. »* La page
« for agents » — précisément celle conçue pour les consommateurs programmatiques — **confirme
positivement l'absence** plutôt que de simplement ne pas en parler : elle détaille ce qui EST disponible
pour la consommation machine (`llms.txt`/`llms-full.txt`/`pages.json`, cache 1h) sans mentionner de
sandbox.

**Implication pour le test 39** (`usepod_client_no_network_in_tests`, ADR-M003 D11) : puisqu'aucun
sandbox officiel n'existe, le client TypeScript ne peut être testé que par une **abstraction/mock interne
à MONARK** (interface injectée, faux serveur HTTP local, ou fixtures enregistrées) — pas par un
environnement de test fourni par UsePod. **R-P1 confirme qu'ADR-M003 D5 n'avait pas d'alternative plus
simple à sa disposition** : le choix déjà pris (« tests : aucun réseau... le prédicteur réel n'est exécuté
que par la sonde `scripts/probe-usepod.mjs` lancée par l'investisseur ») était la seule voie disponible.

**Point pratique pour construire ce mock** : comme l'authentification est **positionnelle** (le jeton est
un segment de l'URL, pas un header — Q2/Q5), un faux serveur doit router sur le motif de chemin
`/proxy/:token/...` pour être fidèle au contrat réel — router sur un header `Authorization` serait un mock
infidèle.

**`POST /v1/register` n'est PAS un mode sandbox** : c'est le point d'entrée du service réel et productif
(il crée un jeton réellement facturable dès financement) ; l'appeler en test créerait un jeton non désiré.
**NON TROUVÉ** : un moyen documenté de créer un jeton explicitement « jetable »/test.

---

## Tableau des sources

| # | URL / requete | Date | Niveau | Ce que la source etablit |
|---|---|---|---|---|
| 1 | https://usepod.ai/ | 2026-09-06 | [lu] | Identite UsePod, pas de definition de pod, lien docs.usepod.ai, zero mention Hermes/ClawPump |
| 2 | https://usepod.ai/docs | 2026-09-06 | ECHEC 404 | Mauvais chemin, remplace par docs.usepod.ai |
| 3 | https://clawpump.tech/ansemhack | 2026-09-06 | [lu] | Page hackathon, tracks, dates, seule mention Hermes (track ClawPump x pump.fun) |
| 4 | https://docs.usepod.ai | 2026-09-06 | [lu] | Vue d'ensemble drop-in API |
| 5 | https://usepod.ai/whitepaper.pdf | 2026-09-06 | [lu, degrade] | PDF partiellement illisible, rien sur Hermes/ClawPump dans le texte extrait |
| 6 | https://usepod.ai/host/ | 2026-09-06 | [lu] | Portail fournisseur (Earnings/GPU hosting/BYOK), lien docs, zero Hermes/ClawPump |
| 7 | https://docs.usepod.ai/llms-full.txt | 2026-09-06 | [lu] | Reference technique complete : base URLs, endpoints, auth, headers, SDKs, limites, skills |
| 8 | https://docs.usepod.ai/llms.txt | 2026-09-06 | [lu] | Index 16 pages + lignes verbatim cles |
| 9 | https://docs.usepod.ai/quickstart | 2026-09-06 | ECHEC 404 | Mauvais chemin, remplace par using/quickstart/ |
| 10 | https://docs.usepod.ai/using/quickstart/ | 2026-09-06 | [lu] | Quickstart cote demande, commandes curl, variables ANTHROPIC_BASE_URL/OPENAI_BASE_URL |
| 11 | https://usepod.ai/skill/client-onboard/SKILL.md | 2026-09-06 | [lu] | Frontmatter, workflow, scripts, variable USEPOD_API |
| 12 | https://usepod.ai/skill/host-onboard/SKILL.md | 2026-09-06 | [lu] | Frontmatter, workflow provider (bond USDC, systemd) |
| 13 | https://docs.usepod.ai/api/register/ | 2026-09-06 | [lu] | Endpoint register, sans auth, token + deposit_code |
| 14 | https://docs.usepod.ai/api/proxy/ | 2026-09-06 | [lu] | Endpoint proxy, auth dans le chemin, headers, gestion d'erreurs |
| 15 | https://docs.usepod.ai/api/x402-payments/ | 2026-09-06 | [lu] | Flux x402 3 etapes, headers PAYMENT-REQUIRED/PAYMENT-SIGNATURE |
| 16 | https://docs.usepod.ai/api/deposit-on-chain/ | 2026-09-06 | [lu] | Programme Anchor, SDK TS/Python pour depot |
| 17 | https://docs.usepod.ai/using/spend-controls/ | 2026-09-06 | [lu] | Headers de plafond prix, pas de limite de taille/rate numerique documentee |
| 18 | https://docs.usepod.ai/marketplace/pricing/ | 2026-09-06 | [lu] | Mecanisme de prix, split 80/20 (contradiction vs corpus interne 90/10) |
| 19 | https://docs.usepod.ai/resources/for-agents/ | 2026-09-06 | [lu] | Endpoints consommation machine, confirme absence de sandbox |
| 20 | https://github.com/Clawpump/claw-agent | 2026-09-06 | [lu] | README verbatim "downstream distribution of the Hermes Agent by Nous Research" |
| 21 | https://clawpump.tech/ | 2026-09-06 | [lu] | "The Home of Agentic Finance", zero mention Hermes/Nous Research/harness |
| 22 | WebSearch usepod.ai client-onboard OR host-onboard SKILL.md | 2026-09-06 | [abs] | Confirme le format SKILL.md generique comme convention ouverte (mdskills.ai, agentskills.io) |
| 23 | WebSearch UsePod 100x.dev OR Sortis-AI | 2026-09-06 | [abs] | Confirme Sortis-AI, cinq depots ; lien 100x.dev non resolu |
| 24 | WebSearch UsePod sandbox testnet devnet mock mode API | 2026-09-06 | [abs] | Aucun sandbox trouve, confirme le silence documentaire |
| 25 | WebSearch UsePod.ai MCP server model context protocol | 2026-09-06 | [abs] | Aucun MCP UsePod trouve ; revele RunPod (collision de nom, entite differente) |
| 26 | F:\Clawpumptech\gap-recherche\G3-inference.md | 2026-08-26 | [2nd] | Mecanique UsePod, structure de prix hackathon ($320K), split 90/10, paysage concurrentiel |
| 27 | F:\Clawpumptech\gap-recherche\H-INF3b-outillage.md | 2026-08-27 | [2nd] | Inference native ClawPump (intelligence_*, markup 30%), distinction ClawHub/OpenClaw |
| 28 | F:\Clawpumptech\agent\HERMES-FONDEMENTS.md | 2026-08-27/31 | [2nd] | claw-agent = Hermes downstream, schema skill Hermes complet, recommandation MCP pour primitives maison |
| 29 | memstack memory_query (plusieurs) | interrogee 2026-09-06 | [2nd] | Oriente vers les archives locales ci-dessus, pas une source primaire en soi |

## Echecs d'acces

| URL | Code / erreur | Note |
|---|---|---|
| https://usepod.ai/docs | HTTP 404 | Mauvais chemin ; la doc reelle est a docs.usepod.ai (sous-domaine, pas sous-chemin) |
| https://docs.usepod.ai/quickstart | HTTP 404 | Mauvais chemin ; le quickstart demande est a /using/quickstart/ |
| https://usepod.ai/skill/client-onboard/SKILL.md (1ere tentative) | Refus outil (pas HTTP) | Le modele de resume WebFetch a invoque une contrainte interne de longueur de citation et a refuse la reproduction integrale ; resolu en reformulant la demande vers des faits structures plutot qu'une reproduction verbatim |
| x.com/0xgilbert/... et x.com/pumpspotlight/... | Non re-tentes aujourd'hui | Corpus interne (2026-08-26) rapporte HTTP 402 sur pumpspotlight ; X bloque WebFetch de maniere generale, connu et non recontourne ici (hors budget de cette passe) |
| https://usepod.ai/ (footer 100x.dev) | Non resolu | Lien de bas de page vers 100x.dev, nature du rapport avec UsePod/Sortis-AI NON TROUVE, pas creuse davantage (hors perimetre des 6 questions) |

## Recommandation (proposition, pas verdict)

Cette section est une proposition du chercheur pour faciliter la decision de l'orchestrateur / du
mainteneur ; ce n'est pas un arbitrage G7 ni une clôture de dette.

### Stack client
**TypeScript, sans SDK dedie.** Rien dans cette recherche n'etablit qu'un chemin Python soit necessaire ou
preferable (ADR-M003 D5 : "sauf si R-P1 etablit qu'un SDK Python est le seul chemin - alors ADR
d'amendement" - **R-P1 etablit l'inverse** : aucun SDK, ni Python ni TypeScript, n'est specifique a
UsePod ; un simple client HTTP suffit dans les deux langages). Node 24 (deja la cible MONARK) a un
`fetch` natif suffisant ; le paquet `openai` npm (ou meme `fetch` seul) pointe sur
`https://api.usepod.ai/proxy/<token>/v1` couvre l'integralite du contrat observe en Q2. Aucun code Grok
a lifter, aucune dependance nouvelle a l'exception eventuelle d'un client OpenAI/Anthropic standard deja
courant dans l'ecosysteme npm (verification registre R-8 needed si ajoute).

### Nom definitif du client dans le code
**PAS `clawpump-hermes`.** Q4 tranche que ni "ClawPump" (plateforme agent) ni "Hermes" (runtime Nous
Research) ne s'appliquent techniquement a UsePod. Proposition : **`usepod-client`** (ou
`usepod-predictor-client` si un prefixe de lot est souhaite). Le terme `clawpump-hermes` reste
correctement reserve (ADR-M003 item 4) a tout ce qui touche reellement `claw-agent`/Hermes - ce que le
Lot P ne touche pas. Cette proposition est fondee sur la recherche, pas sur une preference de style.

### Ce qui reste inconnu (non comble, signale)
1. **Le "joint" hikae_* / skill (Q3.3)** : aucune source ne fonde l'exigence que MONARK expose une
   SKILL.md. Question formee pour l'orchestrateur/mainteneur (pas pour l'advisor integre, cf. consigne
   de mission) : le besoin est-il reel, et si oui l'appelant est-il un agent Hermes (auquel cas le motif
   documente serait un serveur MCP, pas SKILL.md, par analogie HERMES-FONDEMENTS §6) ?
2. **Limites de rate numeriques exactes** : NON TROUVE, seulement qualitatif ("per-token
   requests-per-minute and a concurrency cap apply").
3. **Split fournisseur/UsePod 80/20 (aujourd'hui) vs 90/10 (corpus interne, 2026-08-26)** : contradiction
   datee, non resolue - a re-verifier au moment de l'integration reelle si le montant devient materiel.
4. **Pool de prix hackathon $350K (aujourd'hui) vs $320K (2026-08-26)** : evolution probable de la page,
   non re-tranchee ici ; seul le chiffre d'aujourd'hui est verifie a la date de cette recherche.
5. **Lien footer `100x.dev`** sur usepod.ai : NON TROUVE, nature du rapport avec UsePod/Sortis-AI non
   determinee, non creuse davantage (hors perimetre strict des 6 questions).
6. **Nom de variable d'environnement** : UsePod utilise en interne `USEPOD_API` (skill client-onboard),
   pas `USEPOD_API_KEY`. Garder `USEPOD_API_KEY` (deja choisi par ADR-M003 D5) reste un choix MONARK
   valide - signale, pas un defaut a corriger.
7. **Mecanisme anti-triche cote coordinateur UsePod** (le fournisseur a-t-il vraiment servi le bon
   modele ?) : NON TROUVE, confirme a nouveau aujourd'hui (coherent avec le constat du corpus interne du
   2026-08-26) - risque de fond, hors perimetre transport/auth/format de R-P1 mais utile en contexte pour
   toute decision de fiabilite du predicteur.
8. **Modele(s) a appeler via UsePod pour `predictor_id: "usepod:..."`** : `GET /v1/models` liste les
   modeles disponibles dynamiquement [lu] ; aucun choix de modele n'a ete instruit ici (hors perimetre des
   6 questions), a instruire separement si utile.

---

## CLÔTURE (chercheur)

R-P1 est complete pour les six questions posees par ADR-M003 D5, avec triangulation sur sources fraiches
du 2026-09-06 (29 entrees au journal des sources, 2 echecs HTTP + 1 refus d'outil consignes). Trois
contradictions datees rapportees sans arbitrage (prix hackathon, split de commission UsePod, dates
internes vs page live - toutes du cote "corpus interne 2026-08-26 vs verification fraiche 2026-09-06",
la verification fraiche coincidant systematiquement avec ADR-M003 la ou comparable). Une question n'a
pas ete comblee par supposition (Q3.3, le besoin d'exposition skill des fonctions hikae_*) et est
retournee formee, pas tranchee. Aucun code lifte, aucun fichier sous `grok 1\src\**` ouvert, aucun appel
a l'outil advisor integre, aucun commit. Le present document est l'archive ; le rapport a
l'orchestrateur (reponse de cet agent) en est un resume et ne le remplace pas.
