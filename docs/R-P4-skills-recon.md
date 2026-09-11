# R-P4 — Recon skills/ClawHub/paysage : grounding gouverné du lot ADR-M006

**GATE 0 (R-1)** : modèle résolu = **`claude-sonnet-5`** (préfixe conforme à l'attendu). Contrôle fait
avant toute production ci-dessous.

- **Rôle** : chercheur (Sonnet 5, Write autorisé sur ce fichier uniquement — aucun dépôt produit touché,
  `F:\Shogen` etc. en lecture seule sauf instruction nommée).
- **Date de la passe** : 2026-09-11.
- **Mission** : matérialiser le grounding gouverné du lot skills MONARK (ADR-M006), correction validateur
  C-5 (« absent du disque, cité seulement = fais-moi confiance »). Informe la page d'intégration
  (formes CLI exactes) + les exigences de publication ClawHub — ne re-décide PAS la stratégie déjà
  tranchée investisseur (framing, skill générique, endpoint 4-outils, cf. mandat).
- **Périmètre d'écriture** : UNIQUEMENT ce fichier. Lecture seule ailleurs. Aucun commit (R-20).
- **Priors réutilisés, non dupliqués** : `docs/R-P1-clawpump-hermes.md` (R-P1), `docs/R-P2-P3-recherche.md`
  (R-P2), `docs/R-P3-mcp-streamable-http.md` (R-P3). Citations en forme `R-Px:ligne`. Prior externe hors
  worktree (corpus recherche antérieur, [2nd] pour cette archive) : `F:\Clawpumptech\gap-recherche\
  H-INF3b-outillage.md` (2026-08-27, chercheur Sonnet 5) — cité `H-INF3b:ligne`.
- **Discipline** : [lu] = source ouverte par moi aujourd'hui (curl brut + Read/Grep pour fichiers,
  `gh api` pour métadonnées — motif R-P3) ; [lu via WebFetch] = résumé WebFetch, dégradé (pas d'octets
  bruts) ; [abs] = résumé/recherche seule ; [2nd] = fait établi par une recherche antérieure du corpus,
  non re-ouvert par moi aujourd'hui, daté. Verbatim ≤ 25 mots (contrainte de mission). « NON TROUVÉ » est
  une réponse légitime, jamais comblée par supposition. Classes P1 (primaire : dépôt de code officiel,
  doc officielle, registre npm/GitHub) / P2 (presse, recherche indépendante) / P3 (blog/listicle sans
  pièce, toujours signalé).
- **Statut** : EN COURS D'ÉCRITURE (au fil de l'eau) — ne pas consommer comme clos avant la ligne
  « CLÔTURE » en pied de fichier.
- **Avis advisor (consultation méthode, avant travail substantiel)** : reçu et suivi — squelette écrit
  en premier ; ne pas rouvrir la question C-5 (définie par la mission, pas à re-dériver) ; motif R-P3
  pour [lu] (curl+gh api) ; pas de second appel advisor après extraction ClawHub verbatim (risque filtre
  anti-régurgitation) — si blocage après cette extraction, demande de consultation formée retournée à
  l'orchestrateur, pas de contournement.
- **Avis advisor n°2 (relecture avant clôture, une fois le brouillon complet)** : reçu et suivi — a
  attrapé trois affirmations non vérifiées présentées comme vérifiées (§2.1 négation non recherchée,
  §1.3 « aucun opt-in » lu seulement en partie du document, §2.2 `--slug`/`--name` non confirmés au niveau
  code) + une formulation à clarifier (§4.1 Coinbase). Les quatre points ont été corrigés ci-dessous par
  vérification réelle (nouvelles requêtes `gh api` + lecture de code), pas par simple reformulation
  prudente — conformément à la consigne « pas de second appel après extraction verbatim », aucun troisième
  appel n'a été fait ; les corrections sont autonomes.

---

## 1. Formes CLI exactes

### 1.1 `hermes mcp add` (Hermes/claw-agent — PF-M006-4)

**Source primaire, code, aujourd'hui** : `Clawpump/claw-agent`, HEAD `7b81ee98645497eac3f00bdf037fe666928e04b8`
[lu, `gh api repos/Clawpump/claw-agent/commits/main`, 2026-09-11] — **identique au HEAD constaté par R-P2/R-P3
le 2026-09-06/07** (R-P2:18) : le dépôt n'a pas bougé depuis 15 jours, les fichiers ci-dessous restent
d'actualité. Fichiers lus intégralement aujourd'hui, verbatim (`raw.githubusercontent.com/Clawpump/claw-agent/
7b81ee98…/<path>`, tous HTTP 200) : `hermes_cli/subcommands/mcp.py` (126 lignes, définition argparse
exacte) et `hermes_cli/mcp_config.py` (1263 lignes, implémentation de `cmd_mcp_add` + résolution des presets).

**Forme exacte** [lu, `hermes_cli/subcommands/mcp.py` L41-73, argparse verbatim] :

```
hermes mcp add <name> --url <endpoint>
  [--auth oauth|header] [--connect-timeout <secondes>]
  [--preset <nom>] [--command <cmd> --args ...] [--env KEY=VALUE ...]
```

- `--url` : « HTTP/SSE endpoint URL » (aide CLI verbatim, L45) — c'est le flag pour un MCP **distant**.
  Le fichier `mcp_config.py::cmd_mcp_add` fait `server_config["url"] = url` (L550) : le flag alimente
  directement la clé YAML `url:` de `mcp_servers.<name>` — **CLI et config-file sont le même mécanisme**,
  pas deux formes distinctes.
- **Pas de flag `--transport`** sur `hermes mcp add` — la clé YAML `transport` existe (documentation
  publique ci-dessous) mais n'est réglable qu'en édition directe du fichier de config ou via `hermes mcp
  set`/`configure`, pas comme flag `add`. Défaut confirmé par la doc publique : Streamable HTTP.
- `--preset <nom>` **N'EST PAS** le catalogue `optional-mcps/*/manifest.yaml` (hypothèse de travail de la
  mission, infirmée par lecture directe) — c'est un dictionnaire Python distinct et minuscule, codé en dur
  [lu, `mcp_config.py` L36-41, verbatim] : `_MCP_PRESETS = {"codex": {"command": "codex", "args":
  ["mcp-server"]}}`, **une seule entrée**, et c'est un preset **stdio** (`--command`), pas HTTP. Le
  catalogue `optional-mcps/` (celui que R-P3:47 avait déjà identifié, ex. `linear/manifest.yaml`) est
  accédé par un **sous-commande distincte** : `hermes mcp install <identifier>` (ou `official/<name>`),
  avec `hermes mcp catalog` (liste) et `hermes mcp picker` (interactif) [lu, `mcp.py` L107-123]. Pour un
  MCP distant qui n'est PAS dans ce catalogue (le cas MONARK), la voie est `--url`, jamais `--preset`.
- **Scoping d'outils (`--include`/exclusion) : PAS un flag de `add`.** Il n'existe **aucun** flag
  `--include`/`--exclude` sur `mcp add` [lu, `mcp.py` L41-73, liste exhaustive des arguments]. Le filtrage
  par nom d'outil est un mécanisme **post-add**, exposé via une sous-commande séparée `hermes mcp
  configure <name>` (alias `config`), décrite « Toggle tool selection » [lu, `mcp.py` L83-86], et via la
  clé YAML `tools.include`/`tools.exclude` (config publique ci-dessous).
- **« mcp doctor »/probe** : la sous-commande la plus proche est `hermes mcp test <name>` — « Test MCP
  server connection » [lu, `mcp.py` L80-81, `mcp_config.py::cmd_mcp_test` L805]. Aucune commande nommée
  littéralement `doctor` côté Hermes (à distinguer d'OpenClaw ci-dessous, qui EN a une).

**Confirmation par la doc publique** (site Docusaurus Nous Research, même dépôt/commit — cf. R-P2:27),
`website/docs/reference/mcp-config-reference.md` [lu, curl brut, 2026-09-11] — schéma YAML complet de
`mcp_servers.<name>` : clé `url` (« Remote MCP endpoint »), `transport` (« Set to `sse` to use the SSE
transport **instead of Streamable HTTP** » — confirme que Streamable HTTP est le **défaut** pour tout
serveur `url:`, cohérent avec R-P3), `tools.include`/`tools.exclude` (« Whitelist/Blacklist server-native
MCP tools […] exact names or fnmatch-style globs »), `auth` (« Set to `oauth` to enable OAuth 2.1 with
PKCE »), `headers`, `ssl_verify`, `client_cert`/`client_key` (mTLS), `protocol` (négociation d'ère :
`auto`/`stateless`/`legacy` — recoupe directement R-P3 §3.3 sur la rétro-compatibilité dual-era),
`trust: full|untrusted` (untrusted ⇒ toute tentative d'écriture exige une approbation utilisateur, sauf
`readOnlyHint: true`).

**Exemple minimal officiel** [lu, `mcp_config.py` L536, message d'aide verbatim] :
```
hermes mcp add ink --url "https://mcp.ml.ink/mcp"
```

### 1.2 `openclaw mcp add` (PF-M006-3)

**Source primaire, code + doc, aujourd'hui** : `openclaw/openclaw`, HEAD `4e32fcc1687725ffc9135d5de0fe3b2436d51218`
[lu, `gh api`, 2026-09-11]. Fichiers lus intégralement : `docs/cli/mcp/registry.md` (248 lignes) et
`src/cli/mcp-cli.ts` (grep ciblé sur les définitions `.option(...)`, lignes 980-992 confirmées). Dépôt
principal, **389 422 étoiles** (cf. §3) — org distincte de ClawPump/Hermes, confirmé et re-daté (H-INF3b:125
l'avait déjà noté [2nd], 2026-08-27 ; re-vérifié en primaire aujourd'hui).

**Forme exacte** [lu, `docs/cli/mcp/registry.md` L79 + L222-235, verbatim des exemples ; confirmé au niveau
code, `src/cli/mcp-cli.ts` L980-992] :

```
openclaw mcp add <name> --url <endpoint> --transport streamable-http
  [--header key=value ...] [--auth oauth [--oauth-scope <scope>]]
  [--timeout <ms>] [--connect-timeout <s>]
  [--include <csv>] [--exclude <csv>]
  [--approval auto|prompt|approve]
```

Exemple officiel « Remote HTTP », copié verbatim [lu, `docs/cli/mcp/registry.md` L222-233] :
```
openclaw mcp add docs \
  --url https://mcp.example.com/mcp \
  --transport streamable-http \
  --auth oauth \
  --oauth-scope docs.read \
  --timeout 20 \
  --connect-timeout 5 \
  --include 'search,read_*'
openclaw mcp doctor docs --probe
```

- **`--transport streamable-http`** est un flag explicite et documenté (à la différence de Hermes, où le
  transport n'est PAS un flag de `add`). Note de terminologie côté doc : « Use `transport:
  "streamable-http"` for Streamable HTTP MCP servers » [lu, L86] — vocabulaire identique à la spec R-P3.
- **`--include`/`--exclude` SONT des flags directs de `add`** [lu, code `mcp-cli.ts` L987-988, verbatim
  option strings : `"--include <csv>", "Comma-separated MCP tool names or '*' globs to expose"`] —
  différence structurelle avec Hermes (où le filtrage est post-add via `configure`/`tools`). Répond
  directement à la question de mission : **OUI, l'option de scoping existe** côté OpenClaw, au moment de
  l'ajout.
- **`mcp doctor [name] [--probe] [--json]`** existe littéralement sous ce nom [lu, `registry.md` L61, L77] :
  « `doctor` performs static checks without connecting. Add `--probe` when the command should also verify
  that enabled servers connect. » Une sous-commande **`probe`** existe aussi séparément (« connects and
  reports tool counts, resources/prompts support… », L78). `add` lui-même **probe automatiquement avant
  sauvegarde**, sauf `--no-probe` ou si une autorisation OAuth est requise d'abord [lu, L32, verbatim :
  « `add` builds a definition from flags and probes before saving unless `--no-probe` is set or OAuth
  authorization is needed first »].
- **Portée du registre** : ces commandes lisent/écrivent uniquement `mcp.servers` dans la config OpenClaw
  — « These commands do not expose OpenClaw over MCP » [lu, L16-19, verbatim] ; distinct de l'éventuel
  registre `mcporter` (`config/mcporter.json`), non exploré ici (hors périmètre de la question CLI posée).

### 1.3 Schéma SKILL.md AgentSkills minimal + intersection de découverte Hermes ∩ OpenClaw

**Champ minimal requis — triangulé sur trois sources primaires indépendantes, convergence confirmée** :

1. **OpenClaw**, verbatim [lu, `docs/tools/skills.md` L409-415, aujourd'hui] : « Every skill needs at
   minimum a `name` and `description` in the frontmatter », suivi d'un exemple à deux champs exactement
   (`name: image-lab` / `description: ...`).
2. **Hermes/claw-agent** [2nd, R-P2:32-34, audit direct AGENTS.md L1008-1018 du 2026-09-06, non rouvert
   aujourd'hui] : « Standard fields: `name`, `description`, `version`, `author`, `license`, `platforms`,
   `metadata.hermes.*` » — liste plus longue, mais le validateur de code exigeait seulement `name` +
   `description` comme champs présents obligatoires (R-P2:36 : « champ `name` présent, champ `description`
   présent […] corps non vide »), le reste étant recommandé/optionnel en pratique (R-P2:54, `pay-sh/
   SKILL.md` n'a ni `category` ni `config`).
3. **ClawHub** [lu, `docs/skill-format.md` L39-63, aujourd'hui] : « Markdown with optional YAML frontmatter
   […] `description` is used as the skill summary » ; l'exemple « Basic frontmatter » montre `name` +
   `description` + `version` (version non marquée requise dans le texte).

**Verdict** : `name` + `description` est le plancher universel confirmé sur les trois écosystèmes
consultés aujourd'hui ; `version`/`author`/`license`/`metadata.*` sont des extensions par plateforme, pas
un socle commun exigé partout.

**Intersection de découverte Hermes ∩ OpenClaw — vérifiée en primaire aujourd'hui, pas supposée** :

- **OpenClaw**, table de précédence complète [lu, `docs/tools/skills.md` L39-48, verbatim aujourd'hui] :
  | Priorité | Source | Chemin |
  |---|---|---|
  | 1 (max) | Workspace skills | `<workspace>/skills` |
  | 2 | Project agent skills | `<workspace>/.agents/skills` |
  | 3 | Personal agent skills | `~/.agents/skills` |
  | 4 | Managed/local | `<state-dir>/skills` |
  | 5 | Workshop | `<state-dir>/agents/<agentId>/agent/workshop-skills` |
  | 6 | Bundled / Custodian | livré avec l'install |
  | 7 (min) | Extra dirs | `skills.load.extraDirs` + plugins |
  « OpenClaw discovers a skill whenever `SKILL.md` appears anywhere under a configured root (up to 6
  levels deep) » [lu, L62-63]. **Visibilité par défaut — vérifiée dans la section dédiée, pas seulement
  supposée depuis la table de précédence** [lu, `docs/tools/skills.md` L204-240, section « Agent
  allowlists », verbatim] : « Omit `agents.defaults.skills` to leave all skills unrestricted by default. »
  Le document distingue explicitement skill **location** (précédence/découverte) et skill **visibility**
  (quel agent peut l'utiliser) comme deux contrôles séparés ; sans allowlist explicite configurée, un
  skill découvert à `.agents/skills/` est visible par tous les agents dès sa découverte — confirmé par
  lecture de la section de gating elle-même (pas seulement inféré de l'absence de mention dans la table
  de précédence).
- **Hermes/claw-agent** [2nd, R-P2:101, non rouvert aujourd'hui] : `PROJECT_SKILLS_SUBDIRS` scanne
  **`.hermes/skills/`** OU **`.agents/skills/`** à la racine du projet — **seulement si** (a) cwd dans un
  checkout git, (b) `skills.project_discovery` non désactivé, ET (c) **la racine est explicitement listée
  dans `skills.trusted_project_dirs`** côté utilisateur (opt-in, rien n'est scanné par défaut). **Différence
  réelle avec OpenClaw, maintenant établie des deux côtés** : le tiers projet OpenClaw est ouvert par
  défaut (ci-dessus, L204-240) alors que le tiers projet Hermes exige un opt-in utilisateur explicite —
  ce n'est plus une asymétrie supposée d'un seul côté, les deux moitiés de la comparaison sont sourcées.
- **Recoupement réel, confirmé aujourd'hui** : `.agents/skills/<nom>/SKILL.md` à la racine du dépôt
  MONARK est le **seul chemin commun aux deux runtimes** — OpenClaw le scanne nativement en priorité 2,
  visible par défaut ; Hermes le scanne seulement si l'opérateur a ajouté la racine MONARK à
  `skills.trusted_project_dirs` de son propre `config.yaml` (MONARK ne peut pas s'auto-accorder cette
  confiance, R-P2:138, non re-vérifié aujourd'hui mais cohérent avec ce qui est lu ici). **Différence à
  noter** : OpenClaw a AUSSI un tiers de précédence 1, plus haut, sur `<workspace>/skills` (bare, sans
  `.agents/`) — un dossier `skills/` nu à la racine MONARK serait vu par OpenClaw mais **PAS** par Hermes
  (dont le tiers "local" `skills/` est interne au paquet installé, pas un scan du répertoire de travail —
  R-P2:102). **Conclusion actionnable** : si MONARK veut UN SEUL dossier découvert par les deux runtimes
  sans duplication, c'est bien `.agents/skills/<nom>/SKILL.md` (voie (c) déjà proposée par R-P2:138), pas
  `skills/` nu.
- **agentskills.io** — la convention ouverte citée par R-P1:196 restait **[abs]** (WebSearch seul, jamais
  ouverte en primaire). **Non re-ouverte aujourd'hui** (budget de passe ; le triangulation à trois sources
  primaires directes ci-dessus répond déjà à la question posée sans dépendre de ce site). Signalé comme
  point non élevé à [lu], pas comblé.

---

## 2. ClawHub — exigences de publication post-ClawHavoc (PF-M006-2)

### 2.1 Identification de la source (avant extraction, doc 03 §1)

`github.com/openclaw/clawhub` — description GitHub verbatim : « Skill + Plugin Registry for OpenClaw »
[lu, `gh api repos/openclaw/clawhub`, 2026-09-11]. **9 411 étoiles, 1 469 forks, licence MIT**, HEAD
`cbfee7343ddc867316dd9b3de6fa8856730f9f41`, `pushed_at` 2026-09-11T02:42:17Z (actif le jour même). C'est
bien le registre de **skills OpenClaw** (confirmé par le contenu, pas seulement le nom) — distinct de
`skills_publish`/`skill_fork`, les outils MCP natifs de **ClawPump** eux-mêmes documentés par H-INF3b:43
[2nd, 2026-08-27, non re-vérifié aujourd'hui] comme un catalogue gratuit propre à ClawPump, sans mécanique
de rémunération.

**Le journal de provenance MONARK (JOURNAL:211/214) écrit « publication ClawHub » sans qualifier lequel
des deux registres.** Recherche négative dédiée, faite en primaire aujourd'hui (pas une absence de
recherche présentée comme une conclusion) : `gh api search/repositories -f q='clawhub in:name'` [lu,
2026-09-11] ne retourne **aucun** dépôt appartenant à l'organisation `Clawpump` — les correspondances les
plus proches (`avansaber/clawhub`, `PrivyPad/clawhub`, `TeamClawLite/ClawHub`, etc.) sont des dépôts tiers
sans rapport visible, tous à 0 étoile. `gh api orgs/Clawpump/repos` [lu, 2026-09-11] liste les **cinq**
dépôts réels de l'organisation ClawPump : `agents-skills`, `AgentWeedx420x402`, `claw-agent`, `claw-app`,
`ClawpumpSDK` — **aucun nommé « clawhub » ou variante proche**. La cible du mot « ClawHub » dans le
journal MONARK est donc, par recherche négative effectivement menée, le seul ClawHub localisable : celui
d'OpenClaw. Cohérent avec H-INF3b:43 [2nd, 2026-08-27], qui documentait déjà que ClawPump a ses propres
outils MCP natifs (`skills_publish`/`skill_fork`) sans jamais les nommer « ClawHub » — les deux constats
convergent. Collision de nom signalée et le second référent potentiel activement infirmé (pas seulement
non trouvé par défaut de recherche).

Neuf pages `docs/*.md` lues intégralement aujourd'hui (curl brut, HTTP 200 chacune, même HEAD) :
`publishing.md` (371 lignes), `skill-format.md` (209), `security.md` (49), `moderation.md` (120),
`acceptable-usage.md` (110), `cli.md` (969), `security-audits.md` (147), `content-rights.md` et
`namespace-claims.md` (non citées en détail, périmètre non requis par la mission), plus `README.md` et
`SECURITY.md` à la racine. `packages/clawhub/src/cli/commands/publish.ts` (480 lignes) également lu pour
vérifier au niveau code un détail de §2.2.

### 2.2 Mécanique de publication d'un skill — `clawhub skill publish`

[lu, `docs/cli.md` L190-220 + `docs/publishing.md` L19-100, verbatim/paraphrase fidèle, 2026-09-11]

```
clawhub login
clawhub skill publish ./my-skill --slug my-skill --name "My Skill" --owner <owner>
  [--categories <slugs,...>] [--topics <topics,...>] [--version <semver>] [--dry-run] [--json]
```

**Précision code, vérifiée aujourd'hui au niveau implémentation (pas seulement l'exemple de doc)** [lu,
`packages/clawhub/src/cli/commands/publish.ts` L39-94, verbatim] : `--slug` et `--name` sont en réalité
**optionnels**, avec des valeurs par défaut dérivées du nom du dossier — `const slug = options.slug ??
sanitizeSlug(basename(folder))` et `const displayName = options.name ?? titleCase(basename(folder))` ; les
échecs (`fail("--slug required")` / `fail("--name required")`) ne se déclenchent que si le nom du dossier
lui-même ne produit aucun slug/nom valide (ex. dossier au nom entièrement non-alphanumérique). L'exemple de
`publishing.md` avec les deux flags explicites est une pratique recommandée pour un nom lisible, pas une
exigence stricte de la CLI — MONARK peut publier `./skills/monark-gate` sans `--slug`/`--name` et obtenir
un slug/nom dérivés du dossier.

- Le token d'auth est obtenu par `clawhub login` (device-code flow, GitHub) ou `clawhub login --token
  <token>` pour la CI.
- « ClawHub checks that your token can publish for that owner, validates the metadata, name, version,
  files, and source information, then stores the release **and starts automated security checks**. » [lu,
  `publishing.md` L11-14, verbatim]. « If validation fails, nothing is published. New releases may also
  stay out of normal install and download surfaces **until review finishes**. » [L16-17, verbatim].
- Nouveau skill démarre à `1.0.0` ; une republication de contenu changé auto-incrémente en patch.
- Catégories : liste fermée de 14 slugs exacts (`integrations`, `automation`, `research`, `development`,
  `productivity`, `communication`, `creative`, `knowledge`, `agents`, `operations`, `security`, `finance`,
  `lifestyle`, `other`) [lu, `publishing.md` L54-69, table verbatim] — max 3 par skill, `other` retiré s'il
  est combiné à une catégorie spécifique. Topics : max 5, ≤48 caractères, **noms réservés interdits**
  (liste verbatim) : `approved, audited, certified, clawhub, community, curated, endorsed, featured,
  official, officials, openclaw, recommended, staff-pick, trusted, trusted-publisher, verified` [lu,
  L84-88] — un skill ne peut donc PAS s'auto-étiqueter « verified »/« official » via ses topics.
- **Licence imposée, pas de tarification** [lu, `docs/skill-format.md` L198-209, verbatim] : « All skills
  published on ClawHub are licensed under `MIT-0`. […] Attribution is not required. […] ClawHub does not
  support paid skills, per-skill pricing, paywalls, or revenue sharing. » — implication directe pour
  MONARK : publier le SKILL.md prose (pas le code du gate/endpoint lui-même) sur ClawHub place ce fichier
  sous MIT-0, redistribuable sans attribution ; le code du harnais MONARK (repo séparé, hors ClawHub) n'est
  pas concerné par cette clause.

### 2.3 Exigences de sécurité / revue avant publication — l'état ACTUEL (post-durcissement)

**Trois couches documentées, lues aujourd'hui, qui répondent directement à « garde-fou introduit après
ClawHavoc »** [lu, `docs/security-audits.md` L88-147, verbatim] :

1. **SkillSpector** — nommé mais non détaillé sur cette page.
2. **A.I.G**, scanner de Tencent Zhuque Lab [lu, verbatim] : « checks agent instructions for
   vulnerability patterns and supplies supporting evidence to ClawScan's artifact-wide review. It does not
   issue ClawHub's final verdict or independently block installation. » **Garde-fou anti-bytecode
   explicite, daté et motivé par un CVE distinct** [lu, verbatim] : « A.I.G 0.2.1 cannot inspect packaged
   Python bytecode. Until Tencent ships its **CVE-2026-84809** fix, ClawHub rejects skills containing
   `.pyc`, `.pyo`, or `.pyd` files before A.I.G runs. »
3. **Risk analysis / ClawScan** (système interne ClawHub) — « reviews each release as an agent-facing
   artifact: instructions, metadata, declared permissions, files, capability signals, static scan
   signals, SkillSpector findings, A.I.G findings ». Grille explicite : **OWASP Agentic Skills Top 10**
   [lu, lien cité verbatim `owasp.org/www-project-agentic-skills-top-10/`] — « prompt injection, tool
   misuse, credential exposure, unsafe execution, memory or context poisoning, and excessive agency ».

**Statuts d'audit publiés par skill** [lu, `security-audits.md` L40-47, table verbatim] : `Pass` (aucun
problème visible au-dessus du risque bas), `Review` (lire les findings avant d'installer), `Warn`
(prudence, signal à fort impact), `Malicious` (ne pas installer), `Pending`, `Error`. Niveau de risque
séparé (`Low`/`Medium`/`High`) : « blast radius », orthogonal au statut.

**Cohérence déclarée vs comportement réel** — le critère central n'est PAS l'absence de pouvoir mais la
**cohérence** [lu, L98-103, verbatim] : « The main question is coherence: do the name, summary, metadata,
requested authority, and actual content line up with what users would reasonably expect? […] Powerful
behavior is not automatically bad. » Concrètement, ClawHub compare ce que le frontmatter *déclare*
(`requires.env`, `requires.bins`, etc., cf. §2.4) à ce que le corps du skill *fait réellement* : « If your
code references `TODOIST_API_KEY` but your frontmatter doesn't declare it […] the analysis will flag a
metadata mismatch. » [lu, `skill-format.md` L142].

**Politique d'usage acceptable** [lu, `docs/acceptable-usage.md` L39-53, table verbatim] — catégories
interdites nommées incluant : « Hidden, unsafe, or misleading execution requirements » (installeurs
obfusqués, `pipe-to-shell`, exécution `npx @latest` distante sans revue possible, métadonnées cachant ce
que le skill fait réellement) et « Copyright-infringing or rights-violating material ». **Note de
formulation exacte** : la mission citait « no deceptive content » comme critère — cette formule verbatim
n'apparaît pas telle quelle dans les pages lues ; la formulation réelle la plus proche est « misleading
users about ownership, source, capabilities, security posture […] » (marketplace disallowed behavior,
L73) et « Fraud, scams, and deceptive financial workflows » (une catégorie de contenu interdit, pas un
principe général unique) — signalé pour ne pas citer une phrase qui n'existe pas mot pour mot.

**Aucun mécanisme de signature cryptographique/attestation par skill trouvé** — recherche dédiée
(`deceptive|attestation|signature|signed|provenance|sigstore|slsa`) sur les neuf pages `docs/*.md` +
`README.md`/`SECURITY.md` : **NON TROUVÉ** de sigstore/SLSA/signature cryptographique pour les **skills**
(prose Markdown). Nuance : pour les **packages/plugins** (code exécutable, distinct des skills), ClawHub
documente un mécanisme différent — `clawhub package verify` (vérification SHA-256 ClawHub + intégrité npm
`sha512`/shasum) et le « Trusted Publishing » OIDC GitHub Actions sans jeton long-lived [lu, `cli.md`
L241-291, L520-540] — mais ceci est de l'**intégrité d'artefact**, pas une signature d'auteur/attestation
de contenu. Pour un SKILL.md pur (le cas MONARK, prose seulement, sans binaire), aucun de ces deux
mécanismes ne s'applique directement.

### 2.4 Frontmatter attendu par ClawHub (schéma spécifique, distinct de 1.3)

[lu, `docs/skill-format.md` L51-169, verbatim] Champs de base : `name`, `description`, `version`.
Métadonnées runtime sous `metadata.openclaw` (alias acceptés : `metadata.clawdbot`, `metadata.clawdis`) :
`requires.env` (variables d'environnement obligatoires), `requires.bins`/`requires.anyBins` (binaires
CLI), `requires.config`, `primaryEnv`, `envVars` (déclarations par variable avec `required: false` pour
les optionnelles), `always`, `skillKey`, `emoji`, `homepage`, `os`, `install` (specs de dépendances,
types supportés : `brew`, `node`, `go`, `uv`), `nix`, `config`. **Limites serveur** : bundle total ≤ 50 Mo ;
texte indexé pour analyse = `SKILL.md` + jusqu'à ~40 fichiers UTF-8 bornés (best-effort).

### 2.5 « ClawHavoc » — identification et chronologie de l'incident (collision de nom signalée, pas résolue)

**Deux référents distincts co-existent sous le nom « ClawHavoc » dans la presse spécialisée, sans qu'une
source primaire (NVD, ClawHub lui-même) n'utilise ce nom — signalé, pas tranché** :

1. **La campagne de skills malveillants**, nommée « ClawHavoc » par **Koi Security**, disclosure le
   **1er février 2026** [abs, WebSearch + WebFetch résumé de `cybersecuritynews.com/clawhavoc-poisoned-
   openclaws-clawhub/` et `unit42.paloaltonetworks.com/openclaw-ai-supply-chain-risk/`, 2026-09-11,
   dégradé — résumé par petit modèle, pas lecture brute]. Deux comptages, non réconciliés, datés et
   sourcés différemment :
   - Koi Security elle-même (titre de son propre post, cité par `cybersecuritynews.com`, [abs]) : **341
     malicious skills** ;
   - **Antiy** (recherche ultérieure, au **5 février 2026**, [abs]) : **1 184 skills malveillants**,
     **12 comptes publisher**, dont un seul responsable de **677** paquets — famille de malware classée
     « TrojanOpenClaw PolySkill ».
   Lecture la plus probable, NON confirmée par une source qui le dise explicitement : le chiffre de Koi
   Security (341) serait un compte initial/partiel, celui d'Antiy (1 184) une ré-investigation plus large
   quatre jours plus tard — **hypothèse de ma part, pas un fait établi**, signalée comme telle.
2. **CVE-2026-25253**, vulnérabilité distincte, **vérifiée en primaire directement sur NVD aujourd'hui**
   [lu, `services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-25253`, réponse JSON brute, 2026-09-11] :
   publiée **2026-02-01T23:15:49Z**, CVSS 3.1 **8.8 HIGH** (`AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H`),
   description verbatim : « OpenClaw (aka clawdbot or Moltbot) before 2026.1.29 obtains a `gatewayUrl`
   value from a query string and automatically makes a WebSocket connection without prompting, sending a
   token value. » Références NVD : `depthfirst.com/post/1-click-rce-to-steal-your-moltbot-data-and-keys`,
   `ethiack.com/news/blog/one-click-rce-moltbot`, avisory vendeur `github.com/openclaw/openclaw/security/
   advisories/GHSA-g8p2-7wf7-98mq`. **Confirme et élève en [lu]** ce que H-INF3b:129 avait rapporté en
   [2nd] (Ethiack, « 27 janvier 2026 » pour la date de billet de recherche — proche mais non identique à
   la date de publication CVE du 1er février ; les deux dates sont compatibles avec un délai billet→CVE).
   **Un résumé WebSearch agrégé** (non cité comme source individuelle, dégradé, 2026-09-11) attribuait le
   nom « ClawHavoc » à « un ensemble de vulnérabilités découvert par Lobster Security Labs » incluant
   cette CVE — **ni le NVD ni les deux articles P2 individuellement fetchés (cybersecuritynews.com,
   unit42.paloaltonetworks.com) ne mentionnent de CVE en lien avec le nom « ClawHavoc »** dans leur
   contenu extrait. **Conclusion honnête** : « ClawHavoc » désigne le plus clairement, dans les sources
   individuellement vérifiées aujourd'hui, la campagne de skills malveillants (item 1) ; son extension
   éventuelle à CVE-2026-25253 (item 2) n'est confirmée par aucune des sources individuellement fetchées
   ici — traité comme non établi, pas comme faux.

**Durcissement de ClawHub attribué à l'incident** [lu via WebFetch, dégradé, `unit42.paloaltonetworks.com`,
2026-09-11] : « Those findings prompted ClawHub to partner with VirusTotal, enabling proactive screening
of published skills » + adoption de ClawScan pour bloquer le téléchargement des skills signalés. **Ceci
est cohérent avec ce que j'ai lu en primaire aujourd'hui** (§2.3 : A.I.G, ClawScan, OWASP Agentic Skills
Top 10 sont bien les mécanismes EN PLACE actuellement) — mais la doc `docs/security-audits.md` que j'ai lue
directement **ne mentionne PAS VirusTotal dans le texte** que j'ai extrait (seul `cli.md` L275 mentionne un
fichier `virustotal.json` dans l'archive de rapport de `clawhub scan --output`, confirmant indirectement
l'intégration). **Contradiction à signaler, non résolue** : le résumé WebFetch de l'article `unit42`
affirme aussi une collaboration ClawHub↔**NVIDIA** (« run NVIDIA's analysis tool on all published skills »,
annoncée 1er juin 2026) — **ceci contredit directement** ce que j'ai lu en primaire dans
`docs/security-audits.md` (A.I.G est explicitement attribué à **Tencent Zhuque Lab**, pas NVIDIA ; NVIDIA
n'apparaît nulle part dans les neuf pages `docs/*.md` lues aujourd'hui). Les deux ne sont pas
nécessairement exclusifs (NVIDIA et Tencent pourraient être deux outils différents utilisés à des moments
différents, ou l'un remplacé par l'autre) mais je ne peux pas trancher avec les sources en main —
rapporté tel quel, primaire (Tencent, aujourd'hui, [lu]) vs secondaire dégradé (NVIDIA, [lu via WebFetch]),
sans réconciliation.

---

## 3. Chiffres d'audience (re-vérifiés live, datés)

Toutes les valeurs ci-dessous : `gh api repos/<owner>/<repo>` (métadonnées GitHub officielles), **lues
aujourd'hui 2026-09-11**, classe **P1** (registre GitHub, pas une revendication tierce).

| Dépôt | ★ Stars | Forks | Issues ouvertes | `pushed_at` | Note |
|---|---|---|---|---|---|
| `NousResearch/hermes-agent` (amont Hermes) | **244 433** | **50 604** | 41 913 | 2026-09-11T13:02:00Z | Actif aujourd'hui même. R-P2:19 (2026-09-06) n'avait relevé que la taille (888 302 Ko), pas les étoiles — cette valeur est **nouvelle** pour le corpus MONARK, pas une simple re-confirmation. |
| `Clawpump/claw-agent` (fork/distribution) | **9** | **4** | 10 | 2026-08-31T20:18:43Z | **Identique** à R-P2:17 (2026-09-06) — le dépôt n'a pas bougé, ni en HEAD ni en étoiles, depuis 15 jours. Écart de **~27 000×** avec l'amont en étoiles — le fork ClawPump est un point de distribution quasi-confidentiel comparé à l'amont Nous Research. |
| `openclaw/openclaw` (runtime OpenClaw) | **389 422** | **81 853** | 6 761 | 2026-09-11T13:03:39Z | Org indépendante de ClawPump/Hermes (confirmé §1.2). Plus gros dépôt des quatre. |
| `openclaw/clawhub` (registre skills OpenClaw) | **9 411** | **1 469** | 75 | 2026-09-11T02:42:17Z | Cf. §2.1. |

**Lecture, sans sur-inférer** : les deux écosystèmes « racine » (Hermes amont Nous Research, OpenClaw) sont
tous deux des projets massivement adoptés (six chiffres d'étoiles) ; la distribution ClawPump du premier
(`claw-agent`, 9 étoiles) est, à cette mesure, un point de gouvernance/redistribution quasi inconnu en soi
— l'audience réelle pour un skill MONARK dépend de quel canal de découverte il emprunte (catalogue
in-repo `claw-agent` vs ClawHub d'OpenClaw vs ajout manuel `--url`), pas directement du nombre d'étoiles du
fork ClawPump. **Aucune inférence de « demande pour MONARK » n'est tirée de ces chiffres** — ce sont des
mesures d'audience de plateforme, pas une mesure de la demande pour le produit MONARK lui-même (cf. §4,
consigne de mission de ne pas glisser de whitespace vers demande).

---

## 4. Paysage concurrentiel / whitespace (côté demande)

**Cadrage strict** : cette section nomme qui fait quoi (sourcé), et où « couverture calibrée + abstention »
est absente PAR SOURCE individuelle — elle ne conclut PAS que « personne ne le fait donc il y a de la
demande ». Le verdict de demande reste hors du périmètre de cette archive (mandat advisor-marché,
rappelé par la mission).

### 4.1 Acteurs « cap $/token & sécurité » (le créneau encombré, côté portefeuille/dépense)

**Axe le moins servi de cette passe (à souligner, pas à enterrer)** : sur les cinq acteurs explicitement
nommés par la mission, un seul (AWS AgentCore Payments, Circle Nanopayments — via corpus [2nd]) a une
source, aucun n'a été refetch en primaire aujourd'hui, et Coinbase repose sur la seule connaissance
d'entraînement de l'agent, **pas** sur le corpus interne. Ceci est le NON FAIT le plus significatif de
cette recherche — consigné ici en premier, pas en fin de section.

| Acteur | Ce qu'il fait (sourcé) | Couverture/abstention calibrée mentionnée ? |
|---|---|---|
| **Coinbase Agentic Wallets / AgentKit** | Portefeuilles programmatiques pour agents, permissions on-chain, **spend limits** configurables par session. **[abs, connaissance d'entraînement de l'agent SEULE — PAS corroborée par le corpus interne : H-INF3b ne couvre pas Coinbase]** ; non re-fetch en primaire aujourd'hui. À vérifier sur une page officielle avant tout usage comme fait ferme. | **NON TROUVÉ** dans les sources consultées aujourd'hui pour cet acteur spécifiquement — pas de page officielle relue ce jour. |
| **AWS AgentCore Payments** | « Permet aux agents de découvrir/autoriser/exécuter des micro-paiements x402 avec gestion de portefeuille, contrôles de dépense fondés sur des politiques, sessions de paiement à durée limitée avec budgets optionnels, refus de requête au-delà du budget » [2nd, H-INF3b:519-522, WebSearch 2026-08-27, non re-vérifié aujourd'hui]. | **NON TROUVÉ** — c'est un plafonnement de dépense passif (« cap $ »), pas une garantie de couverture statistique sur une prédiction. |
| **Circle Agent Nanopayments** | « Regroupe plusieurs autorisations de paiement en une seule transaction on-chain pour rendre viables les paiements sub-cent » [2nd, H-INF3b:522-523, WebSearch 2026-08-27, non re-vérifié aujourd'hui]. | **NON TROUVÉ** — mécanisme de règlement, pas de gating de décision. |
| **Privy** | Infrastructure de wallet/embedded-signer pour agents et apps — **non vérifié en primaire aujourd'hui**, connu du domaine mais hors budget de cette passe pour une lecture de page dédiée. | **NON TROUVÉ dans cette passe** (pas de source consultée aujourd'hui pour cet acteur — à traiter comme lacune de cette recherche, pas comme absence confirmée chez l'acteur). |
| **Turnkey** | Infrastructure de signature/politiques de clé pour wallets programmatiques — **non vérifié en primaire aujourd'hui**, même réserve que Privy. | **NON TROUVÉ dans cette passe** (idem — lacune de recherche, pas conclusion sur le produit). |
| **Blockaid** | Détection de transactions malveillantes/sécurité on-chain en amont de la signature — **non vérifié en primaire aujourd'hui**, même réserve. | **NON TROUVÉ dans cette passe.** |

**Réserve honnête sur cette sous-section** : par manque de budget de passe, Privy/Turnkey/Blockaid n'ont
PAS été refetch en primaire aujourd'hui malgré leur nomination explicite par la mission, et Coinbase n'a
qu'une base de connaissance d'entraînement non sourcée du corpus — c'est un **NON FAIT** de cette passe,
pas un « non trouvé chez eux » confirmé. Signalé comme lacune à combler si cette section devient
bloquante pour ADR-M006 (pas un procurement — ce sont des pages web publiques ouvertement accessibles,
pas des documents introuvables ; simple item de suivi pour une prochaine passe si nécessaire).

### 4.2 « Spend policies MCP » — dénotation vérifiée

La mission mentionne « spend policies MCP » sans lien. Recherche dédiée : ceci recoupe très probablement
les **headers `X-Pod-Max-Price-Input`/`X-Pod-Max-Price-Output`/`X-Pod-Routing-Mode`** déjà documentés en
détail par R-P1:132-142 (UsePod, plafond de prix par requête MCP-adjacente) — **ce n'est pas un MCP
au sens protocole lui-même mais une convention de header HTTP sur un proxy d'inférence**. Aucune extension
MCP protocolaire officielle nommée « spend policy » n'a été trouvée dans la spec R-P3 elle-même (R-P3 ne
mentionne aucun mécanisme de plafond de dépense au niveau protocole — le protocole MCP 2026-07-28 ne traite
pas de paiement). **Conclusion** : « spend policies MCP » dénote, au mieux, des conventions ad hoc
au-dessus du transport MCP/HTTP (ex. UsePod), pas une primitive du protocole MCP standard — signalé
explicitement plutôt que deviné.

### 4.3 Couverture calibrée + abstention pour agents — recherche négative dédiée

**Recherche menée aujourd'hui** [WebSearch, 2026-09-11, requêtes multiples : "conformal prediction gate AI
agent tool call coverage", "calibrated abstention agent MCP marketplace"] : aucun produit commercial ou
service hébergé combinant nommément (a) prédiction conforme/couverture statistique calibrée ET (b)
abstention explicite ET (c) packagé comme un « gate » pour agents n'a été identifié dans cette recherche
du jour. Ce qui existe, à titre de contexte académique/librairie (pas des « produits gate ») :

- **MAPIE** (`mapie.readthedocs.io`) et familles de librairies de prédiction conforme (scikit-learn
  compatible) — outillage Python académique/open-source pour calibrer des intervalles/ensembles de
  prédiction, **pas un service hébergé, pas orienté agents/MCP**. [abs, connaissance de corpus, non
  re-vérifié par une lecture de page dédiée aujourd'hui — cité pour que l'archive ne prétende pas ignorer
  l'existence de l'outillage conforme académique].
- Les acteurs du §4.1 (Coinbase, AWS, Circle) couvrent le **plafonnement de dépense** (« cap $ »), une
  question orthogonale à la couverture statistique d'une prédiction.

**Formulation stricte de la conclusion (pas de glissement)** : pour chacun des acteurs nommés
individuellement en §4.1, « couverture/abstention calibrée : NON TROUVÉ sur les sources consultées » est
une déclaration **par source**, pas une conclusion de marché. Cette archive ne prétend établir ni qu'un
tel produit n'existe nulle part (recherche non exhaustive, un après-midi de WebSearch), ni qu'il existe
une demande pour MONARK — la question de la demande reste, comme demandé par la mission, au verdict de
l'advisor-marché, non tranchée ici.

---

## 5. Tableau des sources

| # | URL / requête | Date | Niveau | Classe | Ce que la source établit |
|---|---|---|---|---|---|
| 1 | `gh api repos/Clawpump/claw-agent/commits/main` | 2026-09-11 | [lu] | P1 | HEAD `7b81ee98…` inchangé depuis R-P2/R-P3 (2026-09-06/07) |
| 2 | `gh api repos/NousResearch/hermes-agent` | 2026-09-11 | [lu] | P1 | 244 433 ★, 50 604 forks, actif aujourd'hui, id repo confirmé réel (non-collision) |
| 3 | `gh search repositories q="openclaw in:name"` | 2026-09-11 | [lu] | P1 | Localise `openclaw/openclaw` et `openclaw/clawhub` |
| 4 | `gh api repos/openclaw/openclaw` | 2026-09-11 | [lu] | P1 | 389 422 ★, 81 853 forks, HEAD `4e32fcc1…` |
| 5 | `gh api repos/openclaw/clawhub` | 2026-09-11 | [lu] | P1 | 9 411 ★, 1 469 forks, MIT, HEAD `cbfee7343…` |
| 6 | `raw.githubusercontent.com/Clawpump/claw-agent/7b81ee98…/hermes_cli/subcommands/mcp.py` | 2026-09-11 | [lu] | P1 | argparse exact de `hermes mcp add` (tous les flags) |
| 7 | `raw.githubusercontent.com/Clawpump/claw-agent/7b81ee98…/hermes_cli/mcp_config.py` | 2026-09-11 | [lu] | P1 | implémentation `cmd_mcp_add`, `_MCP_PRESETS`, `cmd_mcp_test` |
| 8 | `raw.githubusercontent.com/Clawpump/claw-agent/7b81ee98…/website/docs/reference/mcp-config-reference.md` | 2026-09-11 | [lu] | P1 | schéma YAML complet `mcp_servers.<name>`, doc publique Nous Research |
| 9 | `raw.githubusercontent.com/openclaw/openclaw/4e32fcc1…/docs/cli/mcp/registry.md` | 2026-09-11 | [lu] | P1 | forme exacte `openclaw mcp add`, `doctor`, `probe`, exemples verbatim |
| 10 | `raw.githubusercontent.com/openclaw/openclaw/4e32fcc1…/src/cli/mcp-cli.ts` (grep ciblé) | 2026-09-11 | [lu, partiel] | P1 | confirmation code des flags `--transport`/`--include`/`--exclude`/`--auth` |
| 11 | `raw.githubusercontent.com/openclaw/openclaw/4e32fcc1…/docs/tools/skills.md` | 2026-09-11 | [lu] | P1 | table de précédence des 7 tiers de découverte de skills OpenClaw, champ minimal `name`+`description`, section « Agent allowlists » L204-240 (visibilité par défaut) |
| 12 | `gh search code "agents/skills" repo:openclaw/openclaw` | 2026-09-11 | [lu] | P1 | confirme `.agents/skills` comme chemin réel utilisé dans le dépôt lui-même |
| 13 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/publishing.md` | 2026-09-11 | [lu] | P1 | mécanique complète de `clawhub skill publish`, catégories/topics, plugins, trusted publishing |
| 14 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/skill-format.md` | 2026-09-11 | [lu] | P1 | frontmatter complet, limites, licence MIT-0, pas de skills payants |
| 15 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/security.md` | 2026-09-11 | [lu] | P1 | politique GitHub Security Advisories, périmètre |
| 16 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/moderation.md` | 2026-09-11 | [lu] | P1 | reports, holds, bans, guidance publisher |
| 17 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/acceptable-usage.md` | 2026-09-11 | [lu] | P1 | contenu autorisé/interdit, comportement marketplace interdit |
| 18 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/security-audits.md` | 2026-09-11 | [lu] | P1 | SkillSpector/A.I.G(Tencent)/ClawScan, statuts d'audit, OWASP Agentic Skills Top 10 |
| 19 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/docs/cli.md` | 2026-09-11 | [lu] | P1 | référence CLI complète `clawhub skill publish`/`package publish`/`scan`/`transfer`/etc. |
| 20 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/README.md`, `SECURITY.md` | 2026-09-11 | [lu] | P1 | politique de sécurité dépôt |
| 21 | `services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2026-25253` | 2026-09-11 | [lu] | P1 | enregistrement CVE officiel, CVSS 8.8, dates, références |
| 22 | WebSearch `"ClawHavoc" OpenClaw skill security incident 2026` | 2026-09-11 | [abs] | P2/P3 mêlées | orientation initiale, liste d'articles, résumé agrégé non attribuable à une source unique |
| 23 | WebFetch `unit42.paloaltonetworks.com/openclaw-ai-supply-chain-risk/` | 2026-09-11 | [lu via WebFetch, dégradé] | P2 | 341 skills (Koi Security), VirusTotal + ClawScan, allégation NVIDIA (contredite par #18) |
| 24 | WebFetch `cybersecuritynews.com/clawhavoc-poisoned-openclaws-clawhub/` | 2026-09-11 | [lu via WebFetch, dégradé] | P2 | 1 184 skills, 12 comptes, 677 par un seul compte, classification Antiy |
| 25 | WebFetch `nvd.nist.gov/vuln/detail/CVE-2026-25253` | 2026-09-11 | ÉCHEC | — | Page rendue JS, WebFetch n'a récupéré que le titre — remplacé par #21 (API REST directe) |
| 26 | WebSearch "conformal prediction gate AI agent tool call coverage" / "calibrated abstention agent MCP marketplace" | 2026-09-11 | [abs] | — | Aucun produit hébergé nommé combinant couverture calibrée + abstention pour agents trouvé ; MAPIE cité comme contexte académique |
| 27 | `F:\Clawpumptech\gap-recherche\H-INF3b-outillage.md` | 2026-08-27 | [2nd] | — | Collision ClawHub/ClawPump, CVE-2026-25253 via Ethiack (daté 27 janv.), AWS AgentCore/Circle Nanopayments |
| 28 | `F:\Monark-wt-m006\docs\R-P1-clawpump-hermes.md`, `R-P2-P3-recherche.md`, `R-P3-mcp-streamable-http.md` | 2026-09-06/07 | [2nd] priors internes | — | Réutilisés et cités par ligne tout au long de ce document, non dupliqués |
| 29 | `gh api search/repositories -f q='clawhub in:name'` | 2026-09-11 | [lu] | P1 | Recherche négative : aucun dépôt « clawhub » appartenant à ClawPump |
| 30 | `gh api orgs/Clawpump/repos` (et `gh api users/Clawpump/repos`) | 2026-09-11 | [lu] | P1 | Liste exhaustive des 5 dépôts réels de l'org ClawPump ; aucun nommé « clawhub » |
| 31 | `raw.githubusercontent.com/openclaw/clawhub/cbfee7343…/packages/clawhub/src/cli/commands/publish.ts` | 2026-09-11 | [lu] | P1 | `--slug`/`--name` optionnels avec défauts dérivés du dossier (code, pas seulement l'exemple de doc) |

## 6. Échecs d'accès

| URL / requête | Code / erreur | Note |
|---|---|---|
| `https://nvd.nist.gov/vuln/detail/CVE-2026-25253` (WebFetch, page HTML rendue JS) | Échec d'extraction (page vide côté résumé) | Remplacé par l'appel direct à l'API REST NVD (`services.nvd.nist.gov/rest/json/...`), succès complet |
| Sites Privy / Turnkey / Blockaid | Non tentés aujourd'hui | Lacune de budget de cette passe, consignée en §4.1, pas un échec technique |
| `agentskills.io` | Non re-tenté aujourd'hui | Restait [abs] depuis R-P1 ; non élevé à [lu] faute de budget, la triangulation à 3 autres sources primaires couvrait déjà la question posée |

## 7. Contradictions relevées

1. **§2.5 — VirusTotal + ClawScan (confirmé, cohérent) vs NVIDIA (P2 dégradé) vs Tencent A.I.G (P1,
   lu aujourd'hui)** : l'article `unit42.paloaltonetworks.com` (résumé WebFetch) affirme une collaboration
   ClawHub↔NVIDIA annoncée le 1er juin 2026 pour scanner les skills publiés ; la documentation ClawHub
   elle-même, lue en primaire aujourd'hui, attribue ce rôle à **Tencent Zhuque Lab (A.I.G)**, sans aucune
   mention de NVIDIA sur les neuf pages `docs/*.md` consultées. Non réconcilié — rapporté avec les deux
   niveaux de confiance distincts (P1 direct vs P2 résumé dégradé), la source primaire (docs ClawHub)
   devrait prévaloir en cas d'usage réel, mais l'écart lui-même est signalé plutôt que silencieusement
   résolu par supposition.
2. **§2.5 — comptage de skills malveillants ClawHavoc : 341 (Koi Security) vs 1 184 (Antiy, 4 jours plus
   tard)** : deux chiffres datés et sourcés différemment, non fusionnés, hypothèse de lecture (compte
   initial vs réinvestigation élargie) explicitement marquée comme hypothèse non confirmée.
3. **§2.5 — portée du nom « ClawHavoc » : campagne de skills seule (sources individuellement fetchées) vs
   « ensemble de vulnérabilités incluant CVE-2026-25253 » (résumé WebSearch agrégé, non attribuable)** :
   non tranché, la lecture la plus solidement sourcée (deux articles P2 individuellement fetchés)
   n'incluant pas la CVE dans la définition du nom.

## 8. NON TROUVÉ / procurements formés

Aucun document jugé introuvable au sens strict du corpus (aucune demande de procurement formée n'est due
— toutes les sources visées par la mission ont été localisées et ouvertes, à l'exception des trois lacunes
ci-dessous qui sont des pages publiques non encore visitées, pas des documents indisponibles) :

1. **Privy / Turnkey / Blockaid (+ Coinbase sourcé de manière insuffisante)** — pages officielles non
   lues en primaire aujourd'hui (§4.1, c'est l'axe le moins servi de cette passe). Item de suivi, pas un
   procurement (accès public non restreint) : si le classement CA-1..CA-10 ou ADR-M006 a besoin d'une
   caractérisation précise de ces acteurs, une prochaine mini-passe (30-45 min, 4 WebFetch ciblés) suffit
   à combler.
2. **agentskills.io** — convention ouverte restée [abs] depuis R-P1, non élevée à [lu] dans cette passe
   (question déjà répondue par ailleurs, cf. §1.3). Non bloquant pour ADR-M006 sur la question posée.
3. **Taille du marché exacte du segment « spend policy / cap $ agent »** — non quantifiée dans cette passe
   (H-INF3b:502-517, [2nd] non re-vérifié, donnait des chiffres FinOps généraux mais pas un TAM du segment
   agent-spend-cap précisément). NON TROUVÉ dans le périmètre de cette recherche ; pas un procurement (pas
   de document unique identifié à demander), plutôt un gap de recherche de marché plus large que le budget
   de cette passe.

Point de méthode consigné (pas un procurement, une réserve de confiance) : les sections §2.5 (ClawHavoc)
et §4.1 (acteurs non fetch) reposent en partie sur des résumés WebFetch/WebSearch dégradés ([abs] /
[lu via WebFetch]) plutôt que sur une lecture intégrale de page — la discipline doc 03 interdit de les
présenter comme [lu], et ce document ne le fait pas ; toute décision ADR-M006 qui s'appuierait fortement
sur les chiffres 341/1 184 ou sur la nature exacte du partenariat ClawHub↔scanner devrait re-vérifier ces
points en primaire avant de les citer comme fait ferme.

---

## CLÔTURE (chercheur)

R-P4 est complet pour les quatre axes de la mission (formes CLI, ClawHub, audience, paysage), sourcé très
majoritairement en P1 direct (curl brut + `gh api`, motif R-P3, 24 des 31 sources en [lu] primaire
aujourd'hui) ; les deux principales infirmations d'hypothèses de la mission — `--preset` ≠ catalogue
`optional-mcps/`, et « no deceptive content » n'est pas une citation exacte de ClawHub — ont été établies
par lecture directe plutôt que supposées. Une relecture advisor avant clôture (2ᵉ appel du fil, distinct
de la consultation méthode initiale) a attrapé trois affirmations non vérifiées présentées comme
vérifiées (négation §2.1 non réellement recherchée au premier jet, opt-in §1.3 lu partiellement, flags
`--slug`/`--name` §2.2 non confirmés au code) — les trois ont été corrigées par vérification réelle
(nouvelles requêtes `gh api` + lecture de code, pas par reformulation prudente), documentées ci-dessus
avec leurs nouvelles sources (#29-31). L'axe le moins servi reste §4.1 (paysage cap $/sécurité) : sur
cinq acteurs nommés par la mission, quatre restent non vérifiés en primaire, consigné en tête de section
et non maquillé en absence confirmée. La correction du défaut validateur C-5 (« absent du disque, cité
seulement ») est portée par le fait que chaque affirmation de ce document cite soit un HEAD de commit +
chemin de fichier re-fetché aujourd'hui, soit une réponse JSON d'API brute conservée en `gh api`/`curl`,
soit une inscription explicite [2nd]/[abs] avec sa date de péremption implicite signalée. Trois
contradictions rapportées sans arbitrage (§7) ; lacunes de budget consignées sans être maquillées en
« non trouvé chez l'acteur » (§8, point 1) ; aucune conclusion de demande de marché n'a été tirée du
paysage concurrentiel (§4.3, conforme à la consigne de cadrage de la mission). Aucun code produit modifié,
aucun fichier de dépôt produit touché, aucun commit (R-20). Le présent fichier est l'archive ; le rapport à
l'orchestrateur (réponse de cet agent) en est un résumé et ne le remplace pas.
