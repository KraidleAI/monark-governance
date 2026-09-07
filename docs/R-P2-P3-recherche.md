# R-P2 + R-P3 — Recherche formée (ADR-M004 §4 pendants)

**GATE 0 (R-1)** : modèle résolu = `claude-sonnet-5` (préfixe conforme à l'attendu, effort `max`). Contrôle fait avant toute production ci-dessous.

- **Rôle** : chercheur (Sonnet 5, Write autorisé sur cette archive uniquement).
- **Date de la passe** : 2026-09-06.
- **Mission** : R-P2 (schéma SKILL.md `claw-agent`) + R-P3 (MCP streamable HTTP) — pendants formés d'ADR-M004 §4, déblocage du Lot B.
- **Périmètre** : lecture seule ailleurs ; écriture UNIQUEMENT dans ce fichier. Aucun commit, aucune poussée. `grok 1\src\**` non ouvert. Outil advisor intégré non appelé (consigne mission — filtre de régurgitation sur extraction longue, cf. CLAUDE.md global).
- **Rattachement** : `F:\Monark\docs\adr\ADR-M004-infrastructure-plateforme.md` §4 (« Recherche : R-P2 schéma SKILL.md `claw-agent` ; R-P3 spec MCP streamable HTTP [lu] ») ; D5 (« MCP `mcp.<domaine>` (transport streamable HTTP...) ; skills `claw-agent` (SKILL.md `metadata.hermes.*`, R-P2) »).
- **Antécédent direct** : `F:\Monark\docs\R-P1-clawpump-hermes.md` (2026-09-06) — a identifié le schéma SKILL.md/`metadata.hermes.*` **sans le spécifier**, en citant `F:\Clawpumptech\agent\HERMES-FONDEMENTS.md` §3 comme [2nd] (« audit Opus 4.8 2026-08-27/31 sur `AGENTS.md` L991-1102 du dépôt `claw-agent` — non rouvert par moi aujourd'hui »). **Cette passe rouvre la source primaire** pour élever ce [2nd] en [lu] direct, daté d'aujourd'hui.

---

## R-P2 — Schéma SKILL.md du harnais `claw-agent` (Nous Research Hermes, distribution ClawPump)

### Provenance de la re-vérification primaire (2026-09-06)
- Dépôt : `github.com/Clawpump/claw-agent`. `gh api repos/Clawpump/claw-agent` [lu, 2026-09-06] : `default_branch=main`, `license=MIT`, `pushed_at=2026-08-31T20:18:43Z`, `size=383311` (Ko), `stargazers=9`, `forks=4`, `open_issues=10`.
- HEAD re-tiré aujourd'hui : `gh api repos/Clawpump/claw-agent/commits/main --jq '.sha'` -> **`7b81ee98645497eac3f00bdf037fe666928e04b8`** [lu, 2026-09-06] — **identique** au HEAD constaté par HERMES-FONDEMENTS.md à sa note de clôture du 2026-08-31 (`pushed_at` cohérent : aucun push depuis). Le dépôt n'a **pas bougé** en 6 jours, donc les fichiers cités ci-dessous sont stables, pas un instantané fragile.
- **Observation (non creusée, signalée)** : l'amont `github.com/NousResearch/hermes-agent` a un `pushed_at=2026-09-06T15:31:49Z` (aujourd'hui même) et `size=888302` Ko contre `size=383311` Ko pour le fork ClawPump — **plus du double**. Ceci relativise la portée temporelle de la clause README « the upstream agent... is unchanged below » : c'est vrai au moment du dernier sync, l'amont continue de bouger et diverger en taille. Non investigué plus loin (hors périmètre R-P2, qui porte spécifiquement sur `Clawpump/claw-agent`).
- Fichiers lus **verbatim, aujourd'hui, à ce commit exact** (`raw.githubusercontent.com/Clawpump/claw-agent/7b81ee98645497eac3f00bdf037fe666928e04b8/<path>`, tous HTTP 200) :
  - `AGENTS.md` (95906 octets) — section « Skills » L991-1156.
  - `skills/software-development/hermes-agent-skill-authoring/SKILL.md` (14438 octets) — le skill méta « comment écrire un SKILL.md in-repo ».
  - `skills/clawpump/SKILL.md` (15255 octets) et `skills/pay-sh/SKILL.md` (2791 octets) — deux exemples réels.
  - `agent/skill_commands.py` (37678 octets) — mécanique d'invocation (code).
  - `agent/skill_utils.py` (48702 octets) — mécanique de découverte/scan (code).
  - `tools/skills_tool.py` (85473 octets, fonctions `skills_list`/`skill_view` lues aux lignes exactes) — mécanique d'accès programmatique (code).
  - `website/docusaurus.config.ts`, `website/sidebars.ts`, `website/docs/developer-guide/creating-skills.md` (20113 octets), `website/docs/user-guide/features/skills.md` (48499 octets, consulté par résumé WebFetch en complément) — **doc PUBLIQUE Nous Research**, déployée sur `https://hermes-agent.nousresearch.com` (confirmé live, HTTP 200 sur la racine et sur `/docs/skills`), brandée « Hermes Agent » / org `NousResearch` dans la config Docusaurus (`title: 'Hermes Agent'`, `organizationName: 'NousResearch'`) — **répond directement à la question « doc Nous Research Hermes si publique » : OUI, elle existe et est en ligne**, bien que sa source markdown vive dans le même dépôt/commit que le code (pas un dépôt séparé).
  - Arbre complet du dépôt (`git/trees/main?recursive=1`) — recensement de tous les `SKILL.md` (environ 190 fichiers) et de tous les `.py` liés à « skill » (environ 30 modules + ~90 fichiers de test).

### Q1 — Format exact d'un fichier SKILL.md (frontmatter, metadata.hermes.*, corps)

**[lu, AGENTS.md L1008-1018, verbatim]** :
> « Standard fields: `name`, `description`, `version`, `author`, `license`, `platforms` (OS-gating list: `[macos]`, `[linux, macos]`, ...), `metadata.hermes.tags`, `metadata.hermes.category`, `metadata.hermes.related_skills`, `metadata.hermes.config` (config.yaml settings the skill needs — stored under `skills.config.<key>`, prompted during setup, injected at load time).
> Top-level `tags:` and `category:` are also accepted and mirrored from `metadata.hermes.*` by the loader. »

**Validateur de code, source de vérité citée** : `tools/skill_manager_tool.py::_validate_frontmatter` [lu, cité par le skill méta]. Exigences dures du validateur (distinctes des exigences de revue, plus strictes) : commence par `---` (aucune ligne vide avant), ferme par `\n---\n`, parse en mapping YAML, champ `name` présent, champ `description` présent (plafond validateur **1024 caractères** — mais la norme de revue du dépôt est **60 caractères**, bien plus stricte), corps non vide après le `---` fermant. Taille totale du SKILL.md <= **100000 caractères** (`MAX_SKILL_CONTENT_CHARS`), cible ~100 lignes (simple) à ~200 lignes (complexe).

**Corps — « modern section order » [lu, AGENTS.md L1071-1078, verbatim structure]** :
```
# <Skill> Skill
2-3 sentence intro: what it does, what it doesn't do, dependency stance.

## When to Use          - bulleted triggers (+ "Don't use for:" counter-triggers)
## Prerequisites        - exact env vars, installs, API key sourcing
## How to Run           - canonical invocation through the terminal tool
## Quick Reference      - flat command list, no narration
## Procedure            - numbered steps, each with a checkable completion criterion
## Pitfalls             - known limits, things that look broken but aren't
## Verification         - how to prove the skill worked
```
Toutes les sections ne s'appliquent pas à chaque skill, mais « When to Use + corps actionnable + Pitfalls + Verification » = minimum.

**Deux exemples réels lus intégralement** :
- `skills/pay-sh/SKILL.md` — `name: pay-sh`, `description: "Call x402 APIs with a ClawPump agent wallet."` (<=60c respecté), `version: 2.0.0`, `author: ClawPump`, `license: MIT`, `platforms: [linux, macos, windows]`, `metadata.hermes.tags: [pay-sh, x402, solana, payments, usdc, apis, mcp, clawpump]`, `metadata.hermes.related_skills: [clawpump]`. Ni `category` ni `config` présents — confirme que ces sous-champs sont optionnels.
- `skills/clawpump/SKILL.md` — même schéma de frontmatter, corps qui documente exhaustivement 134 outils MCP distants par nom, sans aucune implémentation locale — le skill est une couche de **prose procédurale pure** au-dessus d'un serveur MCP externe déjà déployé.
- **Note** : ces deux exemples ne suivent pas scrupuleusement le « modern section order » — soit antérieurs à la norme HARDLINE actuelle, soit la norme n'est appliquée qu'en revue de PR pour les nouveaux skills. Observation, pas un fait établi.

**Addendum — schéma PLUS COMPLET trouvé dans la doc PUBLIQUE Nous Research** [lu, `website/docs/developer-guide/creating-skills.md` L47-79, gabarit complet verbatim] :
```yaml
---
name: my-skill
description: Brief description (shown in skill search results)
version: 1.0.0
author: Your Name
license: MIT
platforms: [macos, linux]          # Optional
metadata:
  hermes:
    tags: [Category, Subcategory, Keywords]
    related_skills: [other-skill-name]
    requires_toolsets: [web]            # Optional - only show when these toolsets are active
    requires_tools: [web_search]        # Optional - only show when these tools are available
    fallback_for_toolsets: [browser]    # Optional - hide when these toolsets are active
    fallback_for_tools: [browser_navigate]  # Optional - hide when these tools exist
    config:
      - key: my.setting
        description: "What this setting controls"
        default: "sensible-default"
        prompt: "Display prompt for setup"
    blueprint:                              # Optional - marks this skill a runnable automation
      schedule: "0 9 * * *"              #   cron expr / "every 2h" / ISO timestamp
      deliver: origin
      prompt: "Task instruction for each run"
      no_agent: false
required_environment_variables:          # Optional - top-level, NOT under metadata
  - name: MY_API_KEY
    prompt: "Enter your API key"
    help: "Get one at https://example.com"
    required_for: "API access"
---
```
Table de comportement des 4 champs conditionnels [lu, verbatim, L128-131] : `requires_toolsets`/`requires_tools` = skill **caché** si le toolset/outil listé N'est PAS disponible ; `fallback_for_toolsets`/`fallback_for_tools` = skill **caché** si le toolset/outil listé EST disponible (n'apparaît qu'en repli). Exemple cité : le skill `duckduckgo-search` porte `fallback_for_toolsets: [web]` — n'apparaît que si le toolset web (nécessite `FIRECRAWL_API_KEY`) est absent.

**DISCREPANCE signalée, non tranchée** : la liste « standard fields » d'AGENTS.md (in-repo, L1008-1018) ne mentionne NI `requires_toolsets`/`requires_tools`/`fallback_for_*` NI `blueprint` NI `required_environment_variables` — seulement `tags/category/related_skills/config`. Le gabarit du dev-guide PUBLIC omet à l'inverse `category` de son exemple de frontmatter affiché (L56-59), alors qu'AGENTS.md et l'aperçu public `features/skills.md` (vu par résumé WebFetch, donc [abs]) le mentionnent tous deux. **Aucune source ne dit `category` déprécié** — traité comme toujours supporté (2 sources sur 3 le confirment), mais l'écart entre doc in-repo (plus terse, orientée contributeur) et doc publique (plus riche, orientée intégrateur) est réel et non résolu ici. Les deux sont primaires (même dépôt), aucune n'est secondaire.

### Q2 — Comment une skill est enregistrée et découverte par le runtime [lu, code, aujourd'hui]

Sources : `agent/skill_utils.py` (dossiers, parsing frontmatter, filtres), `agent/skill_commands.py::scan_skill_commands()` (construction du registre slash-command), `tools/skills_tool.py::skills_list/skill_view` (l'autre surface, cf. Q3).

**Trois niveaux de répertoires scannés, par ordre de précédence décroissante, confirmé verbatim (commentaire de code dans `scan_skill_commands`)** : « Scan project dirs first (highest precedence), then local, then external. »
1. **Projet** — `get_project_skills_dirs()` : actif seulement si (a) le cwd (ou `TERMINAL_CWD`) est dans un checkout git (`.git` trouvé en remontant jusqu'à 64 niveaux, `find_project_root`), (b) `skills.project_discovery` n'est pas explicitement `false`, (c) **la racine du projet est listée dans `skills.trusted_project_dirs`** (config utilisateur, opt-in explicite — rien n'est scanné par défaut), et (d) un sous-dossier candidat existe : **`.hermes/skills/`** ou **`.agents/skills/`** à la racine (constante `PROJECT_SKILLS_SUBDIRS`, [lu] verbatim). Commentaire de code cité : « vendored repo skills win inside their repo ».
2. **Local (profil)** — `SKILLS_DIR` : arbres `skills/` (bundled) + `optional-skills/` (installés via `hermes skills install official/<catégorie>/<skill>`), et `~/.hermes/skills/` pour les skills personnels créés via `skill_manage(action='create')`.
3. **Externe** — `get_external_skills_dirs()` (mentionné dans le code, non creusé en détail — hors du périmètre strict de R-P2).

**Pour chaque `SKILL.md` trouvé** : lecture, `_parse_frontmatter`, puis deux filtres avant inscription — `skill_matches_platform(frontmatter)` (champ `platforms:`) et `skill_matches_environment(frontmatter)` (pertinence à l'environnement runtime courant — kanban/docker/s6 ; « offer-time only ; explicit load bypasses » [lu, commentaire verbatim]) — puis exclusion si le nom est dans la liste `disabled` de config. Le nom devient un slug minuscule à tirets ; en collision avec une commande core Hermes, le skill n'est pas auto-enregistré en slash-command mais reste chargeable via `/skill <name>` [lu, verbatim log warning cité dans le code] ; en collision avec un autre skill, premier arrivé gagne (l'ordre de scan projet>local>externe fait déjà office de priorité).

**Mise en cache par session — caveat mesuré, deux sources concordantes** : (a) le skill méta in-repo, verbatim : « the CURRENT session's skill loader is cached — `skill_view`/`skills_list` will not see the new skill until a new session. This is expected, not a bug. » ; (b) le code expose néanmoins `reload_skills()` (`agent/skill_commands.py` L577) et des tests dédiés (`test_skill_commands_reload.py`, `test_reload_skills_command.py`, `test_cli_reload_skills.py`) — un rechargement à chaud existe via commande explicite, mais le comportement par défaut (skill ajouté en cours de session) reste : invisible sans action.

### Q3 — Format d'entrée/sortie d'un appel de skill [lu, code, aujourd'hui] — DEUX surfaces distinctes

**Surface A — invocation slash-command (humain ou message entrant), PAS d'I/O structuré** [lu, `agent/skill_commands.py`] :
- En-tête de fichier, verbatim : « Shared between CLI (cli.py) and gateway (gateway/run.py) so both surfaces can invoke skills via /skill-name commands. »
- Mécanique (`build_skill_invocation_message` -> `_build_skill_message`) : `/skill-name <instruction libre>` fait construire par Hermes un **message texte** injecté dans la conversation comme un tour utilisateur — ce n'est PAS un appel de fonction typé. Entrée = nom du skill (résolu depuis le registre) + instruction libre optionnelle (`user_instruction: str`). Le message assemblé concatène : note d'activation (« [IMPORTANT: The user has invoked the "<name>" skill... The full skill content is loaded below.] »), corps intégral du SKILL.md (après substitution de template vars + expansion shell inline optionnelle), chemin absolu du répertoire du skill, valeurs de config résolues, note de setup si applicable, liste des fichiers annexes avec invite à les charger via `skill_view(name=..., file_path=...)`, instruction utilisateur, note runtime optionnelle. **Sortie** : aucune valeur de retour structurée propre au skill — la suite est la boucle d'agent normale (le modèle lit ce message et enchaîne en appelant les outils natifs/MCP que le corps du skill lui désigne).
- Jusqu'à 5 skills empilables (`/skill-a /skill-b <instruction>`, `_MAX_STACKED_SKILLS = 5`) — le code s'attribue lui-même une inspiration « Claude Code v2.1.199 (July 2, 2026) » [lu, commentaire verbatim] ; non vérifié indépendamment par moi, hors périmètre R-P2.

**Surface B — appel outil programmatique (« progressive disclosure »), I/O structuré JSON** [lu, `tools/skills_tool.py`, signatures exactes] :
- `skills_list(category: str = None, task_id: str = None) -> str` — JSON `{"success": bool, "skills": [...], "categories": [...], "count": int, "hint": "..."}`, chaque entrée = nom+description+catégorie seulement (« Returns only name + description to minimize token usage », [lu] docstring verbatim). Catalogue « niveau 0 ».
- `skill_view(name: str, file_path: str = None, task_id: str = None, preprocess: bool = True) -> str` — JSON avec le contenu du skill ou une erreur (`{"success": false, "error": "...", "hint": "..."}`). `name` accepte une forme qualifiée `"plugin:skill"`. Sans `file_path` = corps complet (niveau 1) ; avec `file_path` = un fichier annexe précis sous le répertoire du skill (niveau 2, ex. `references/api.md`).
- Confirmation indépendante par la doc publique [WebFetch résumé, donc **[abs]** pour cette partie précise — pas relu verbatim par moi] : le site documente un modèle « progressive disclosure » à 3 niveaux nommés Level 0/1/2, correspondant exactement à `skills_list()`/`skill_view(name)`/`skill_view(name, path)` — cohérent avec le code lu indépendamment, aucune contradiction.

**Conclusion Q3** : un « appel de skill » n'a pas un format unique — soit **(A)** expansion de prompt sans schéma (cas normal, déclenché humain/message), soit **(B)** appel de fonction JSON in/out classique quand l'agent lui-même parcourt/charge un skill au fil de son raisonnement. Dans les deux cas, **le skill ne contient pas de logique exécutable propre appelée avec des arguments typés** — c'est de la prose/instructions ; l'exécution réelle passe toujours par les outils que la prose désigne (natifs Hermes ou MCP).

### Q4 — Ce que MONARK doit fournir pour exposer hikae_conform / hikae_gate / ukemi_clearing comme skills

**Réponse fondée sur le critère explicite de Nous Research** [lu, `website/docs/developer-guide/creating-skills.md` L11-23, verbatim] :
> « Make it a **Skill** when: The capability can be expressed as instructions + shell commands + existing tools [...] doesn't need custom Python integration or API key management baked into the agent [...]
> Make it a **Tool** when: It requires end-to-end integration with API keys, auth flows, or multi-component configuration [...] It needs custom processing logic that must execute precisely every time [...] »

`hikae_conform`, `hikae_gate`, `ukemi_clearing` sont des primitives de vérification déterministe (conformité HAC-CP, portes de gate, calcul de clearing) qui doivent « exécuter précisément à chaque fois » — par le critère même de Nous Research, ce sont des **Tools**, pas des Skills. Elles doivent d'abord exister comme **outils MCP** (objet de R-P3) ; le SKILL.md n'est pas le lieu d'implémentation, c'est une **couche de prose procédurale qui documente comment et quand appeler ces outils MCP par leur nom** — le patron exact observé sur `skills/clawpump/SKILL.md` et `skills/pay-sh/SKILL.md` (skills réels documentant respectivement 134 et 4 outils MCP distants, sans logique métier locale).

**Ce qui est concrètement à écrire** :
1. **Précondition bloquante** : le serveur MCP MONARK doit tourner et exposer `hikae_conform`/`hikae_gate`/`ukemi_clearing` en tant qu'outils nommés (namespace probable `mcp_<nom-serveur>_<outil>`, par analogie `mcp_clawpump_swap_execute`) — sans cela il n'y a rien à référencer dans un SKILL.md. **Dépendance directe et bloquante sur R-P3.**
2. **Un (ou plusieurs) fichier(s) `SKILL.md`** conforme(s) au gabarit Q1 : `name`, `description` (<=60 caractères, un point final, sans mot marketing), `version` (semver, `0.1.0` si nouveau), `author`, `license`, `platforms` (à auditer, probablement `[linux, macos, windows]` si le skill ne fait que documenter des appels MCP sans code POSIX-only inline), `metadata.hermes.tags`, `metadata.hermes.related_skills`, et `## Prerequisites` documentant le nom du serveur MCP + l'installation attendue (par analogie `hermes clawpump setup` -> un futur mécanisme d'installation MONARK, **à définir par R-P3/Lot B, non trouvé/inexistant à ce jour**).
3. **Corps** suivant l'ordre de section moderne (Q1) : quand utiliser chaque primitive (`## When to Use`), les outils MCP à appeler par nom entre backticks (`## Quick Reference`/`## Procedure`), pièges connus (ex. lecture seule sur fixtures uniquement au pivot, cf. ADR-M004 test 45 `mcp_tools_readonly_fixtures`), et `## Verification`.
4. **Distribution — trois voies possibles, non exclusives, arbitrage dû** [lu, `agent/skill_utils.py`] :
   - **(a) In-repo upstream** (`skills/` ou `optional-skills/` de `Clawpump/claw-agent`) — nécessite une PR acceptée par les mainteneurs, hors du contrôle de MONARK, revue HARDLINE complète. **Non réaliste pour le calendrier du pivot** (14 jours calendaires, ADR-M004 §1).
   - **(b) Utilisateur-local** (`~/.hermes/skills/<catégorie>/<nom>/SKILL.md`) — chaque opérateur doit copier/installer le fichier lui-même. **NON TROUVÉ** : un mécanisme d'installation tiers hors catalogue officiel (seule `hermes skills install official/<catégorie>/<skill>` pour le catalogue officiel a été confirmée [lu]) — à creuser si cette voie est retenue.
   - **(c) Projet-local** (`.hermes/skills/` ou `.agents/skills/` à la racine du dépôt MONARK lui-même) [lu, `PROJECT_SKILLS_SUBDIRS`, verbatim] — **la voie la plus directement actionnable** : un skill embarqué dans le dépôt MONARK est auto-découvert en **priorité maximale** dès qu'un opérateur lance `claw-agent`/Hermes avec le répertoire de travail dans le dépôt MONARK, **à condition que cet opérateur ait explicitement ajouté cette racine à `skills.trusted_project_dirs`** dans son propre `config.yaml` (opt-in utilisateur — MONARK ne peut pas s'auto-accorder cette confiance). Cohérent avec le montage **(ii) self-hosted** déjà retenu comme hypothèse de travail par R-P1/HERMES-FONDEMENTS.
5. **Ce que MONARK n'a pas à faire** : écrire un parseur de skill, un mécanisme de découverte, un moteur de slash-command — tout existe côté harnais (confirmé par cette relecture directe du code, pas seulement par HERMES-FONDEMENTS §7). Le travail MONARK-side se limite à (i) le serveur MCP (R-P3), (ii) le(s) SKILL.md de prose procédurale, (iii) la décision de distribution (4a/b/c) — **décision non tranchée ici**, cf. section Recommandation en fin d'archive.

---

---

## État (orchestrateur, 2026-09-06)
- **R-P2 CLOS** ([lu], code réel de `Clawpump/claw-agent`) : gabarit SKILL.md (frontmatter `name`/`description`≤60c/`version`, sections `## When to Use`/`Prerequisites`/`How to Run`/`Quick Reference`/`Procedure`/`Pitfalls`/`Verification`) ; découverte par le runtime (projet `.hermes/skills` ou `.agents/skills` ; local `~/.hermes/skills`) ; invocation `/skill-name <instruction>` (≤5 empilables) ; ce que MONARK écrit = un `SKILL.md` pointant sur les outils MCP `hikae_conform`/`hikae_gate`/`ukemi_clearing` (le harnais fournit parseur/découverte/slash-command). Voie retenue proposée : (c) projet-local `.hermes/skills/` du dépôt MONARK. Alimente le lot **P-bis « surface de skill »** (post-pivot).
- **R-P3 NON FAIT** (worker mort sur limite d'usage avant de commencer la section MCP streamable HTTP). Reste dû : spec du transport streamable HTTP (version [lu]), SDK `@modelcontextprotocol/sdk` (version registre), serveur MCP TS minimal lecture seule. **Pendant reconduit** ; à relancer avant le lot B-mcp (hors chemin du pivot, Q1 coupe candidate). Aucune décision B-mcp ne se prend sans R-P3.
