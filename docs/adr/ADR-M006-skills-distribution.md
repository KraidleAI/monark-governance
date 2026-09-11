# ADR-M006 — Couche de distribution « skills » : publier le gate MONARK 4-outils appelable, honnêtement

> **Statut** : **accepté** (re-checkpoint-1 validateur `claude-fable-5-1`, 2026-09-11 : accepte-avec-corrections ; liste fermée C-1..C-7/M-1..M-9 **et** les 5 corrections du re-checkpoint intégrées ; aucune escalade investisseur due — le seuil N de D8 routé near-publication §7). Intègre les décisions investisseur 2026-09-11 (framing = implémentation de référence + BYO ; skill **générique**, pas de cas trading nommé ; négatives **SKILL.md seulement**) + le **grounding matérialisé** (`docs/R-P4-skills-recon.md` 24 sources [lu] 2026-09-11 ; `docs/advisor-marche-M006.md`).
> **Siège committeur** `claude-opus-4-8` (Opus-seat) ; workers `claude-opus-4-8` effort high ; orchestrateur/validateur `claude-fable-5-1`.
> **Rattachement** : ADR-M005 + ADR-M007 (`calibrate` BYO) + endpoint LIVE 4-outils `{attest,gate,cascade,calibrate}` (CA `docs/deploy-CA-harness.json`). **N'ajoute AUCUN outil, aucun effet de bord, ne modifie AUCUNE description MCP live** (K-8/D9). Grounding gouverné : `docs/R-P4-skills-recon.md` + `docs/advisor-marche-M006.md`.

## 1. Contexte
Couche de distribution demandée par l'investisseur (skills ClawPump/Hermes/OpenClaw). L'endpoint 4-outils (avec `calibrate` BYO) est LIVE ; la boucle « un tiers calibre SON prédicteur → région transférable → `gate` » est prouvée (`gate_byo_call` : `verdict.calib_digest === set_digest`).

### 1.1 Le fait qui commande le framing (`docs/advisor-marche-M006.md` ; D0 = `l3-gate.ts:125-135`)
`gate` gate une **PRÉDICTION**, pas un **ACTE** — il n'appelle jamais `input.tool` (D0, `gate.ts:425`). La douleur DÉMONTRÉE de l'écosystème est l'**AUTORISATION/spend**, pas la sur-confiance ⇒ risque #1 : lu comme un **spend guard**. Négatives D2 obligatoires. Renforcé par R-P4 : ClawHub **interdit** « Fraud, scams, and deceptive financial workflows » (`R-P4:331`, catégorie de contenu interdit) — un skill qui se lit comme un outil financier/spend est un risque de rejet ET d'honnêteté.

### 1.2 Demande & audience (`docs/R-P4-skills-recon.md`, [lu] 2026-09-11)
Whitespace techno réel (couverture calibrée) MAIS **demande de l'objet NON démontrée** (verdict advisor-marché ; « whitespace » ne glisse jamais vers « demande »). Framing honnête = « implémentation de référence + BYO ; adoptez le contrat » (E-2 confirmé). Audience (`gh api`, 2026-09-11) : **OpenClaw `openclaw/openclaw` 389 422★** (le plus gros) ; **Hermes amont `NousResearch/hermes-agent` 244 433★** ; **ClawHub `openclaw/clawhub` 9 411★** (licence MIT) ; **fork ClawPump `claw-agent` 9★**. ⇒ cible = amont générique Hermes/OpenClaw, pas le crowd ClawPump-hébergé.

## 2. Décisions

### D0 — Distribution honnête d'une surface EXISTANTE et INCHANGÉE ; gratuite ; gatée
Décrit `{attest,gate,cascade,calibrate}` (live, CA-attesté) ; aucun outil neuf, aucun effet de bord, **aucune modification des descriptions MCP live** (décision investisseur SKILL-only ⇒ CA `2026-09-11T12:33` valable, pas de redéploiement). Publication après passe de sécurité + bascule PUBLIC investisseur + revue ClawHub (D2).

### D1 — UN artefact commun, ClawHub d'abord (E-1 confirmé) — formes CLI VÉRIFIÉES [lu]
(1) endpoint 4-outils ; (2) `skills/monark/SKILL.md` (schéma **triangulé OpenClaw/Hermes/ClawHub** : `name`+`description` suffisent — verbatim OpenClaw `R-P4:156` ; le label « AgentSkills » via agentskills.io reste [abs] `R-P4:212`), découverte `.agents/skills/monark/SKILL.md` (seul chemin partagé Hermes ∩ OpenClaw — `R-P4:201-211` ; la moitié Hermes est **[2nd via R-P2:101, HEAD `claw-agent` inchangé `R-P4:46`]**) ; (3) page d'intégration deux one-liners **exacts** :
- Hermes/claw-agent : `hermes mcp add monark --url https://mcp.monarkgate.tech/mcp` (**PAS de `--transport`** sur `hermes mcp add` ; clé YAML `transport` séparée — `R-P4:56,65`).
- OpenClaw : `openclaw mcp add monark --url https://mcp.monarkgate.tech/mcp --transport streamable-http` (option `--include`/`--exclude` pour scoper les outils ; `openclaw mcp doctor monark --probe` pour vérifier — `R-P4:113`).
**Nuance de découverte (à porter en honnêteté)** : le tiers OpenClaw est **ouvert par défaut** (Agent allowlists) alors qu'Hermes exige un opt-in `trusted_project_dirs` (`R-P4`) — l'opérateur reste maître de l'activation.
**Registre** : **ClawHub d'abord** (`clawhub skill publish [--categories] [--topics] [--version] [--dry-run]` — `R-P4:259`) ; Registre MCP officiel add-on ; PR Hermes `optional-mcps` différée ; ClawPump hébergé abandonné (aucun mécanisme MCP externe ; recherche négative `gh api` sur 5 dépôts de l'org — `R-P4`).

### D2 — Honnêteté : positif + NÉGATIF, dans SKILL.md + page d'intégration (PAS les descriptions MCP live)
Porteurs = **SKILL.md (corps) + page d'intégration** (2 porteurs ; les descriptions MCP live NE changent PAS — C-2). Le porteur `post_install` de la v2 est **RETIRÉ** : aucun hook post-install n'est sourcé chez Hermes/OpenClaw/ClawHub (`R-P4` §2.4 : `install` = specs brew/node/go/uv, pas de hook exécuté).
- **Positif** : « gate never executes the named tool » ; « commit/defer/abstain ; B_t is caller-carried ; never a probability of being right » ; « attest is demonstrative, not probative ».
- **`calibrate` VERBATIM `CALIBRATE_LABEL` (C-4)** — texte exact de `apps/harness/src/tools/calibrate.ts:52-57` : *« split-conformal quantile at miscoverage α over caller-supplied nonconformity scores. MONARK does not see, store, or verify the caller's data or model, and does not validate that the supplied numbers are nonconformity scores of any model. Marginal 1−α coverage holds ONLY for future points exchangeable with the supplied scores; non-exchangeable data (e.g. distribution-shifted or time-ordered) voids it. Never a probability of being right. »* — un test importe la constante + assert byte-exact dans SKILL.md (mutant paraphrase ⇒ rouge).
- **NÉGATIF, B_t par MÉCANISME (C-1)** : *« B_t is a number YOU pass in each call; MONARK never measures, derives, or stores it (stateless); it is compared only to YOUR bFloor (below it ⇒ budget_exhausted). It is NOT a $/token spend cap and NOT a rate-limit. `allow` is a coverage verdict on YOUR prediction, NOT permission to execute the named tool (MONARK never executes it). MONARK does not evaluate the legitimacy of an act and does not predict prices — it gates YOUR predictions. For a $/token spend cap, use your platform's spend controls; MONARK is not that. »* Cohérent avec `README.md` / `token/page.tsx` (le skill décrit le mécanisme, ne renie pas le token).
- **Ligne opérationnelle (M-6)** : endpoint public, non authentifié, **sans engagement de disponibilité**, borné (`n ≤ 10000`, corps 256 KB).
- **Gate de non-régression** : `grep-forbidden`/`vocab-banned` + `lang-gate` étendus au scope `skills` (**M-3** : `.md/.json/.yaml` ; `spend`/`live` négation-aware ou `exemptPhrases` ; ligne ADR). **Securities (M-2)** : bannir aussi `profit[-\s]?share`, `yield`, `APY`, `pays?\s.{0,12}inference`, `stak` ; **« abstain → MONARK paie » ET le profit-share restent HORS du skill** (page token seulement — Howey/MiCA). Mutant surclaim (positif ET négatif) ⇒ rouge.
- **Revue ClawHub (R-P4, corrigé)** : critères réels = « misleading users about ownership », catégorie interdite « Fraud, scams, and deceptive financial workflows » ; 3 couches (SkillSpector, Tencent A.I.G, ClawScan/OWASP Agentic Skills Top 10) ; **aucune signature crypto par skill** (intégrité d'artefact seulement). Le framing D2 est conçu pour passer cette revue.

### D3 — Versionnement : les skills figent l'URL live, le `schema_version`, le set `{attest,gate,cascade,calibrate}`. Descriptions MCP live inchangées.

### D4 — Licence : **skill ClawHub = `MIT-0` (imposé par ClawHub, `R-P4:286` verbatim `docs/skill-format.md` L198-209) ; harnais/dépôt = Apache-2.0 (inchangé)**
ClawHub impose MIT-0 (« All skills published on ClawHub are licensed under MIT-0 ; attribution not required ») à tout skill publié. Le **skill est un artefact descriptif** (SKILL.md + manifest pointant l'endpoint public) → MIT-0 sans risque (aucun secret ; plus permissif). Le **code du harnais** (dépôt séparé) **reste Apache-2.0** (choix investisseur, non affecté). Le répertoire `skills/monark/` porte la mention MIT-0 ; le reste du dépôt Apache-2.0. **Heads-up investisseur** (déviation de l'Apache-2.0 global, imposée par ClawHub — off-ramp : renoncer à ClawHub contredirait E-1).

### D5 — Emplacement + mécanisme de découverte (C-5/M-5)
Le **source gouverné** est `skills/monark/SKILL.md` (anglais, gaté ; **liste blanche export + création du dossier dans le MÊME lot**, M-4, fail-closed `export-public.mjs:214` ; test `required skills/monark/SKILL.md`). **Mécanisme de découverte (précisé)** : `.agents/skills/monark/SKILL.md` est un chemin **côté consommateur, post-installation** (l'opérateur l'obtient via `clawhub skill add` ou en copiant le source) — MONARK **ne génère PAS** `.agents/skills/` dans son propre dépôt. Un `skills/` nu à la racine du dépôt est vu par OpenClaw (tier 1, ouvert par défaut) mais **pas** par Hermes (`R-P4:206-211`) : la découverte in-repo est donc **OpenClaw-only** ; pour Hermes/le partage, la voie est **ClawHub-first** (D1) puis l'install côté opérateur. Aucune revendication qu'Hermes auto-découvre le dépôt MONARK.

### D6 — Pas de monétisation, 0 outil à effet de bord.

### D7 — `calibrate` BYO LIVRÉ (ADR-M007) ; landmine d'exchangeabilité TRAITÉE et LIVE (`CALIBRATE_LABEL`) ; le skill la reprend verbatim (D2).

### D8 — Mesure post-publication FALSIFIABLE (M-5) : au niveau Caddy (le nom d'outil est dans le corps JSON-RPC pour `/mcp`, pas le chemin ⇒ compter les POST par host/route sur le miroir `api.`, jamais de payload). Seuil : **≥ N appels d'origine ≠ MONARK sous 30 j** — **N est une décision de valeur, fixée par l'investisseur à la near-publication (§7)** ; sans N fixé, la falsifiabilité n'est pas établie. Un compteur = I/O hors `src/tools/` ⇒ **PF-M006-8 (ADR infra Caddy dédié)**, pas ce lot.

### D9 — MVP GÉNÉRIQUE (décision investisseur, renforcée par R-P4 « deceptive financial workflows » interdit) : le skill décrit la capacité générale (« gate any predictor's predictions ; calibrate BYO ») ; **aucun cas trading nommé** ; multi-actifs = propriété du BYO énoncée sans exemple d'actif. ClawPump teste avec ses propres agents → chemin clé-en-main + démo (D10).
**Classes committées (honnêteté anti-omission, C-3/ClawHub déclaré-vs-réel `R-P4:316`)** : la description MCP live (`gate.ts:57-59`) nomme deux `task_class` — `btc-dir-15m` et `cascade-liquidable-24h`. Le SKILL.md les déclare pour ce qu'elles sont — des **fixtures de plomberie internes** (`btc-dir-15m` = calibration **synthétique déclarée**, jamais un prédicteur mesuré ; `cascade-liquidable-24h` = aucune calibration committée ⇒ `under_calib`/abstain) — **ni présentées comme cas d'usage, ni passées sous silence**. Le cas réel est le **BYO** : « bring your own predictor + nonconformity scores ; the two built-in classes are plumbing fixtures, not use cases ».

### D10 — DÉMO BYO (deliverable) : trace enregistrée + reproductible (un appelant calibre sur SES scores → gate → décision couverte, audit `calib_digest === set_digest` fermé), générique, motif `fixtures/h5-e2e-trace.json`, honnêteté aux porteurs, gatée. Lot dédié.

### D11 — Ligne d'honnêteté opérationnelle (M-6, voir D2).

## 3. Modes MAST (M-1) : dérive skill↔surface (test constantes registry↔SKILL.md + `CALIBRATE_LABEL` byte-exact) ; tromperie-par-omission (négatives testées par mutant) ; fausse clôture (G2 fraîche ≠ générateur).

## 4. Critères d'acceptation
Par lot : R-25 ; G2 fraîche ≠ générateur ; oracle (lang+grep+vocab sur `skills`) ; honnêteté testée (mutant `spend cap`/`probative`/`live`/`guarantees`/`profit-share` ⇒ rouge ; `CALIBRATE_LABEL` byte-exact) ; contrats gelés 0 octet ; export fail-closed vert. **Publication gatée** : CA verte (faite) + passe de sécurité (agent) + bascule PUBLIC investisseur. Ordre (M-7) : flip PUBLIC → `schemas/` lisible dans l'export → publier.

## 5. Pendants formés
- **PF-M006-2** — CLOS par R-P4 (mécanique + critères ClawHub [lu]).
- **PF-M006-3/4** — CLOS par R-P4 (formes CLI vérifiées au niveau code).
- **PF-M006-6** — CLOS (`docs/R-P4-skills-recon.md` + `docs/advisor-marche-M006.md` matérialisés).
- **PF-SEC** — passe de sécurité (agent) + flip PRIVATE→PUBLIC (investisseur, outward) avant publication ; contexte : CVE-2026-25253 (CVSS 8.8) + « ClawHavoc » (supply-chain skills) — la revue ClawHub scanne, aucune signature crypto ⇒ notre honnêteté + minimalisme d'artefact sont la défense.
- **PF-M006-7 (nouveau)** — §4.1 paysage concurrentiel cap-$ (Privy/Turnkey/Blockaid non vérifiés en primaire ce jour, `R-P4:445`) : lacune de recherche, à combler si le positionnement concurrentiel devient décisif — **pas** une conclusion sur ces acteurs.
- **PF-M006-8 (nouveau)** — compteur d'adoption D8 (POST par host/route au niveau Caddy, jamais de payload) = I/O hors `src/tools/` ⇒ **ADR infra Caddy dédié** avant instrumentation ; hors ce lot.
- **M-8** — PF-M006-1 (ClawPump hébergé) abandonné ; PF-M006-5 (version protocole) clos par ADR-M005 D13.

## 6. Alternatives écartées
Un skill par plateforme ; Hermes PR d'abord ; ClawPump hébergé ; laisser lire un spend guard ; nommer des cas trading ; toucher les descriptions MCP live ; « abstain → MONARK paie »/profit-share dans le skill ; « live »/« proven »/« MVP abouti » dans le skill (**M-9** restent internes) ; publier avant sécurité + PUBLIC.

## 7. Escalades — RÉSOLUES / heads-up
- **E-1/E-2/E-3** résolus (ClawHub-first ; référence+BYO ; calibrate livré) ; **trading** générique ; **descriptions MCP** SKILL-only.
- **Heads-up D4** : skill ClawHub en **MIT-0** (imposé), harnais Apache-2.0 — off-ramp si l'investisseur refuse MIT-0.
- **Near-publication** : handle/nom ClawHub ; namespace `tech.monarkgate` + vérif domaine (outward) ; flip PRIVATE→PUBLIC (investisseur) ; **N de D8** (seuil d'appels comptant comme « demande démontrée » — décision de valeur investisseur).
