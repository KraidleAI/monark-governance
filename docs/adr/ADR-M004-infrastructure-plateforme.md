# ADR-M004 — Infrastructure et plateforme MONARK (dépôts, site, backend, exposition aux agents, export public)

- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS au checkpoint 1** (validateur-humain, 2026-09-06, 17 items intégrés dans cette version — avis verbatim : `docs/CHECKPOINT1-M004.md`) ; **3 escalades investisseur ouvertes** (Q1 ordre de coupe, Q2 hébergement du site, Q3 tokenomics — §6). Paramètres investisseur attendus **≤ 2026-09-09** (§4).
- **Rattachement** : ADR-M003 (Phase 2 ; D0.5 langue et dépôts ; D8/W supersédés ici ; D5 addendum R-P1 ; pendant (i) « hébergement » **repris ici, réduit à la question Q2**), ADR-M001 (contrats gelés), `docs/R-P1-clawpump-hermes.md`, `ROADMAP-MONARK.md` §7.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` le 2026-09-06 (advisor intégré : 1 appel de cadrage), corrigé le même jour après checkpoint 1. Version 1 (`099cdc4`) contenait une **citation fausse** (« ADR-M003 §5 écartait une base de données » — inexistante ; `error_origin` = orchestrateur), corrigée en D4. Aucun code écrit.
- **Décisions investisseur fondatrices (verbatim, 2026-09-05)** : « une entreprise, une compagnie, où les agents sont les produits, chaque agent collabore, note, améliore son produit » ; « si une personne veut voir, auditer les décisions de son agent, il le fait où ? » ; « exposer tout Shōgen […] via MONARK » ; « MONARK sera la vitrine de nos produits, et c'est par ça qu'on va financer le développement continu » ; « tout ce qui est github, site, plateforme, doit être en anglais » ; « je suis ta recommandation des deux dépôts ».

## 1. Contexte

### 1.1 Ce que la vitrine doit être
Une **plateforme à trois niveaux**, pas une landing page : (1) **public** — compagnie, flotte d'agents (Shōgen, HIKAE, UKEMI ; dizaines à venir), ce que chacun résout, chiffres [lu] sourcés et **qualifiés**, tokenomics (contenu investisseur, Q3), roadmap ; (2) **live** — ce que les agents font, négatifs inclus ; (3) **console** — audit d'une décision : entrées, prix attesté, région, budget, raison, hash. Shōgen exposé via MONARK tout en restant atteignable seul.

### 1.2 Contrainte liante : le calendrier — **le compte, écrit** (item 1)
- **Un seul pivot** (item 17) : la date de listing **(h)**, décision investisseur ; par défaut la limite de tokenisation **2026-09-20 23:59 UTC**. « Deploy early » (ROADMAP §7) pousse (h) plus tôt, ce qui **réduit** le temps, jamais l'inverse.
- **Mesure de vitesse** (Phase 2, journal) : un lot = **1 à 2 jours** ouvrés, workers Opus mourant quotidiennement sur limite d'usage.
- **Lots marqués « avant le pivot » après les scissions R-25 (items 9, 10, 11)** : ratchet-K (en cours), X, E-root, E-contracts, E-hikae-src, E-hikae-test, F-public, F-live, F-console, B-infra, B-api, B-mcp, plus S, I, P d'ADR-M003 = **15 lots** ⇒ **15 à 30 jours** de travail pour **14 jours calendaires** (2026-09-06 → 20). **Le compte ne tient pas.** Ordre de coupe proposé à l'investisseur (Q1, §6) — rien n'est coupé en silence ; ce qui n'est pas livré au pivot est **déclaré tel quel sur le site**.

### 1.3 Pré-vérifications machine (orchestrateur, 2026-09-06)
- Dépôts : `KraidleAI/monark-governance` (privé, `main` poussé le 2026-09-06, protection PR + 5 jobs requis) et `KraidleAI/monark` (privé, vide). Signature locale active ; **clé non enregistrée côté GitHub** (`unknown_key`) — action investisseur en cours.
- `package.json` : `"workspaces": ["packages/*"]` — `apps/site` **exige une modification** de ce champ (item 4 : assignée à F-public).
- Atelier (`packages/atelier`) : 59 lignes rendues (html/js/css) **plus** ≈235 lignes `src/*.ts` et 131 de tests (item 1c) ; devient un composant du niveau live.
- Persistance : MONARK n'a **aucun état** aujourd'hui (journaux S2 = fichiers commis) ; **aucun ADR antérieur n'avait tranché la persistance** (item 13) — D4 la tranche pour la première fois. ADR-M003 §5 écartait « site vitrine dédié », point revu par D2.
- Contrats gelés inchangés (ADR-M001) ; l'API expose exactement `AttestedPrice`, `Prediction`, `CoverageVerdict`, `GateDecision`. Leurs identifiants (`octets_recalcules`, `verifier_revision`, `sens_emis_digest`…) sont **gelés** et français : la gate de langue les exempte (D7).
- Volume à traduire (item 11 ; commande rejouable : `cat packages/<p>/src/**/*.ts | grep -c '\S'`, idem `test/`, et heuristique d'accents `grep -c -E '[éèàùçêâîôû]'`) :

| Package | src (lignes non vides) | test | lignes accentuées (borne basse des lignes FR) |
|---|---|---|---|
| contracts | 399 | 404 | 4 |
| hikae | 1 574 | 601 | 393 |
| ukemi | 306 | 343 | 165 |
| monark | 19 | 0 | 0 |
| atelier | 235 | 131 | 58 |
| racine (test + scripts) | 405 | — | 107 (ci.yml, eslint.config, scripts, test) |

Une ligne traduite compte **2** (suppression + insertion). hikae dépasse 1 205 par construction (≥ 393×2 accentuées, sans compter les lignes FR sans accent) ⇒ **scindé `src` / `test`** ; les autres tiennent sous la borne (borne haute = 2× lignes accentuées + marge), à re-mesurer au lot.

## 2. Décisions

### D0 — Sièges (inchangés) + provisionnement
D0.1-D0.5 d'ADR-M003 s'appliquent. **L'orchestrateur ne touche jamais le VPS** : provisionnement par l'investisseur sur **runbook commis** (D6), déploiement par job GitHub Actions avec secret posé par l'investisseur. **R-8** (item 17) : toute dépendance nouvelle (Next.js, Postgres, Caddy, Uptime Kuma, images GHCR) est vérifiée au registre avant installation et **épinglée** (version exacte npm ; image Docker par **digest**).

### D1 — Surface publique minimale au pivot (le plan), le reste daté
| Niveau | Au pivot (h) | Après le pivot |
|---|---|---|
| Public | compagnie / flotte / trois agents / roadmap ; **chiffres depuis `fixtures/figures-sourced.json`** (item 12 : valeur, unité, source, page, date d'état, **qualificatif** — ex. « up to 1.07 B USD liquidatable, MakerDAO only, as of 2021-04-30, P-K1-1 p.344 ») rendus tels quels ; **tokenomics = contenu investisseur (Q3), sinon « to be announced »** (item 6) | agents commerciaux, notation croisée, Kraidle |
| Live | rapports S2 commis (S2a synthétique déclaré ; S2b réel si (e)) ; clearing UKEMI sur scénarios commis ; **flux `s3-binance` + verdicts HIKAE rejoués = dépend du Lot I** (item 7) — si I n'est pas livré, F-live rend S2 + clearing seulement, déclaré | flux continu (B-journal, SSE) |
| Console | lecture seule, sans compte : chaque décision des journaux commis a une page (entrées, verdict, raison, hash) | comptes, agents par utilisateur, clés acheteurs |
| API/MCP | **si VPS livré** : OpenAPI générée des 4 schémas, MCP lecture sur fixtures ; **sinon non publiés, déclaré** (item 16) | inférence réelle, quotas, clés |

Règle d'honnêteté : rien n'est une maquette ; chaque chiffre vient d'un fichier commis et hashé (test 44) ; chaque page d'agent porte son vrai état.

### D2 — Frontend : Next.js, hébergement **à trancher (Q2)**
Pages dynamiques, temps réel, comptes à venir ⇒ **Next.js** (App Router) sous `apps/site` ; **F-public est le seul propriétaire de la modification `workspaces`** en `["packages/*", "apps/*"]` (item 4, quick-verify R1). **Hébergement** : la page fair-use de Vercel [lu, validateur, 2026-09-06, `last_updated 2026-07-29`] réserve le plan Hobby à l'usage **non commercial** ; le site est commercial par décision investisseur ⇒ **Vercel Pro (payant, tarif à lire à la souscription)** ou **site auto-hébergé sur le VPS derrière Caddy** (Next.js en conteneur, ou Astro statique si l'investisseur renonce au temps réel — §5 rouvert dans ce cas). Décision investisseur (item 5, Q2). Design system propre, pas de template.

### D3 — Backend : un VPS, conteneurs, reverse proxy — **périmètre par lot**
VPS (fournisseur = paramètre ; Ubuntu LTS ; SSH par clé ; pare-feu ; fail2ban ; snapshots), Docker Compose, Caddy TLS automatique. Services **et leur lot** (item 14) :
1. `monark-api` — HIKAE + UKEMI + gate, TS sans état, HTTP JSON sur les contrats gelés, OpenAPI générée — **B-api**.
2. `mcp` — mêmes opérations en outils MCP, lecture seule au pivot — **B-mcp**.
3. `journal` (Postgres) + `events` (SSE) — **B-journal, après le pivot** (D4).
4. `shogen` — vérificateur Rust + campagne : image construite **depuis `F:\Shogen` (autre dépôt, non exporté)**, hors du job D6 ⇒ **Phase 3, lot Shōgen dédié** ; `shogen.<domaine>` **retiré de la surface du pivot** ; Shōgen est exposé au pivot par la console (témoignage `s3-binance`, Lot I) et par la page produit.
5. `claw-agent` — runtime Hermes (Nous Research) : exige une **clé de fournisseur d'inférence** (secret + coût investisseur, §4) ⇒ **Phase 3**.
Un seul VPS ; isolation par conteneurs ; aucun Kubernetes.

### D4 — Journal persistant (**première décision** sur la persistance)
Au pivot, la console et le live lisent des **fichiers commis** (D1) : aucune base n'est requise. **Après le pivot**, le flux continu exige un journal interrogeable : **Postgres** (image épinglée par digest, R-8), tables par contrat gelé + `provenance` (sha256 du document canonique, source, `harness_version`, date) ; écriture uniquement par `monark-api` ; import des journaux S2 commis avec vérification de hash ; migrations versionnées ; SQL explicite. **Alternatives écartées** (item 13) : JSONL append-only + chaîne de hash commise (suffisant au pivot — c'est D1 — mais sans requêtes ni concurrence pour la console à comptes) ; SQLite embarqué (un seul écrivain, pas de SSE multi-lecteurs ; acceptable en repli si le VPS est petit — consigné). Motif Postgres = **flux continu post-pivot seulement**.

### D5 — Exposition aux agents et acheteurs
HTTP `api.<domaine>` (OpenAPI ; clés API par acheteur après le pivot ; quotas ; journal d'usage ; aucun paiement avant listing) ; MCP `mcp.<domaine>` (transport streamable HTTP, spec à citer [lu] — R-P3) ; skills `claw-agent` (SKILL.md `metadata.hermes.*`, R-P2) en Phase 3 ; `usepod-client` reste interne à HIKAE.

### D6 — Provisionnement et déploiement sans l'orchestrateur (item 15)
- **`docs/RUNBOOK-VPS.md`** (commis, anglais) : exécuté par l'investisseur — utilisateur de déploiement **non-root** dans le groupe docker, SSH par clé seule, pare-feu (22/80/443), fail2ban, Docker + Compose, snapshots ; **liste de vérification** que le job `deploy` contrôle à son premier run (utilisateur, docker, ports, version).
- Job `deploy` (dépôt public, `workflow_dispatch` + tag) : build des images, push GHCR, `ssh` avec `DEPLOY_SSH_KEY` posé par l'investisseur ; **`known_hosts` du VPS commis** ; **jamais `StrictHostKeyChecking=no`** ; secrets jamais exposés aux PR de forks. Repli : l'investisseur exécute `docker compose pull && up -d`.

### D7 — Export vers le dépôt public (Lot X) : script commis (items 2, 3)
`scripts/export-public.mjs` :
- **Liste blanche** : `packages/*/src`, `packages/*/test`, `packages/*/package.json`, `packages/*/README.md`, `schemas/`, `fixtures/`, `apps/site` (**toléré absent** tant que F n'existe pas), `README.md`, `LICENSE`, `.github/workflows/ci.yml`, `eslint.config.mjs`, `lint-ratchet.*`, `scripts/{grep-forbidden,lint-ratchet,export-public}.mjs`, `vocab-banned.json`, `package.json`, `package-lock.json`, `tsconfig.json`.
- **Liste noire, défense en profondeur derrière la liste blanche** : `docs/adr/`, `docs/G1-*`, `docs/G2-*`, `docs/G7-*`, `docs/CHECKPOINT*`, `docs/AUDIT-ENTREE.md`, `docs/JOURNAL-PROVENANCE.md`, `docs/R-P1-*`, `packages/*/docs/`, tout `.md` en français.
- **Rapports S2 (`packages/hikae/docs/S2-*`)** — décision unique : **exclus de l'export** ; le site rend le **TSV** (colonnes déjà en anglais) via `loadCommitted()` et génère son propre rendu anglais ; `scripts/s2-report.mjs` et le test `s2_report_reproducible` restent intacts dans la gouvernance.
- **Gate de langue** : détecteur (liste de mots FR + diacritiques) avec **liste fermée commise d'exemptions `scripts/lang-exempt.json`** : identifiants des quatre contrats gelés (`octets_recalcules`, `verifier_revision`, `sens_emis_digest`, `residual`…), clés des fixtures Shōgen (`empreinte_du_sens_emis`, `revision_amont_deleguee`, `temoignage`…), identifiants `harness_version`, noms de jobs CI (`g1-controle-generation`, `r25-taille-de-lot`). Test 42 rouge si un fichier de gouvernance ou une chaîne FR hors exemptions subsiste.
- Historique du dépôt public **neuf** (un commit par export, message = tag de gouvernance).

### D8 — Lot E (English only) et R-25 (item 11)
Scindé par package, une PR chacune, **aucun lot exempté** ; **hikae scindé `src` / `test`** (mesure §1.3) ; règle générale : si la mesure d'un lot dépasse 1 205, scission par répertoire (`src`, `test`, sous-répertoire `s2/`). **E-contracts ne touche jamais aux identifiants gelés** (test 0 `contracts_frozen`). Ordre : E-root (CI, scripts, tests racine) ∥ E-contracts → E-hikae-src → E-hikae-test → E-ukemi → E-atelier → E-monark.

### D9 — Chiffres et fournisseurs
Aucun prix écrit ici (règle « aucun chiffre de seconde main ») ; les tarifs se lisent à la réservation. Réservations, dans l'ordre, investisseur : domaine + DNS ; VPS ; hébergement du site (Q2) ; supervision ; snapshots.

### D10 — Lots ajoutés (numérotation continue avec ADR-M003) et ordre
| Lot | Contenu | Dépend de | Avant le pivot ? |
|---|---|---|---|
| **X** | `export-public.mjs`, `lang-exempt.json`, gate de langue, test 42, première publication de `KraidleAI/monark` | E-root, E-contracts | oui |
| **E-\*** | traduction par package (D8) | — | root, contracts, hikae-src/test : oui ; reste : au fil |
| **F-public** | Next.js `apps/site`, `workspaces`, pages compagnie/flotte/agents/roadmap, `figures-sourced.json`, test 44 | X, domaine (repli : sous-domaine de l'hébergeur), hébergement (Q2) | oui |
| **F-live** | rendu des TSV S2 et scénarios UKEMI commis ; flux `s3-binance` **si I livré** | F-public, S ou S2a ; I (optionnel) | oui (minimal) |
| **F-console** | pages de décision en lecture seule depuis les journaux commis | F-public | oui |
| **B-infra** | compose, Caddy, `RUNBOOK-VPS.md`, job `deploy`, test 46 | VPS + `DEPLOY_SSH_KEY` (repli : API/MCP non publiés) | oui si VPS |
| **B-api** | `monark-api` + OpenAPI (test 43) | B-infra | oui si VPS |
| **B-mcp** | serveur MCP lecture (test 45) | B-api | Q1 (coupe candidate) |
| **B-journal** | Postgres, import S2, `events` SSE | B-api | **après le pivot** |
| Phase 3 | `shogen` image + `shogen.<domaine>` ; `claw-agent` + clé d'inférence ; console à comptes ; clés acheteurs | — | non |

**Ordre** : ratchet-K → E-root ∥ E-contracts → X → F-public → F-live ∥ F-console → S → I → B-infra → B-api → P → B-mcp → pivot → B-journal → E-reste. **Fan-outs justifiés par l'isolation seule** (item 17) : E-root (racine, CI, `test/`, `scripts/`) vs E-contracts (`packages/contracts/**`) ; F-live (`apps/site/app/live`) vs F-console (`apps/site/app/decisions`) ; tous les autres lots sont **séquentiels = mono-agent + oracle déterministe**. Aucun fan-out par débit.

### D11 — Tests nommés (suite) — chaque test tué par ≥ 1 mutant nommé en G2 (item 17)
42 `export_public_no_governance_no_french` (mutant : un fichier `docs/adr/*` glissé dans la liste blanche ⇒ rouge) ; 43 `openapi_generated_matches_frozen_schemas` (mutant : un champ requis retiré de l'OpenAPI ⇒ rouge) ; 44 `site_renders_only_committed_data` — oracle (item 8) : (a) `loadCommitted()` vérifie chaque fichier contre `apps/site/data/manifest.sha256.json` commis ; (b) **0 littéral numérique** dans `apps/site/app/**` hors `figures-sourced.json` (mutant : un `1.07` en dur dans une page ⇒ rouge) ; 45 `mcp_tools_readonly_fixtures` (mutant : outil d'écriture exposé ⇒ rouge) ; 46 `compose_no_secret_in_repo` (mutant : une clé dans `compose.yml` ⇒ rouge) ; 47 `runbook_checklist_verified_by_deploy` (mutant : étape retirée du runbook ⇒ rouge).

### D12 — MAST
| Mode | Contre-mesure |
|---|---|
| Pression de délai | compte écrit §1.2 ; coupe = décision investisseur (Q1) ; R-22 ; R-25 ; **aucune publication d'un lot avant son checkpoint 2** (item 17) |
| Décrochage de dépendance externe (domaine, VPS, hébergement, clé de déploiement) | paramètres **datés ≤ 2026-09-09** (§4) ; replis : sans domaine → sous-domaine de l'hébergeur, déclaré ; sans VPS → API/MCP non publiés, surface = F, déclaré (item 16) |
| Maquette présentée comme réel | test 44 ; règle d'honnêteté D1 ; ligne D10 sur chaque rapport |
| Chiffre juste mais mal qualifié (leçon P-K1-1) | `figures-sourced.json` avec qualificatif obligatoire, rendu tel quel (item 12) |
| Fuite de secret | D0/D6 ; test 46 ; jeton UsePod jamais dans une URL journalisée |
| Dérive de périmètre (trading) | D0.4 M003 |
| Générateur = vérificateur | D10bis M003 ; D10 M003 (option a) sous ses trois conditions |

## 3. Critères d'acceptation (chaque lot sous R-25)
- **CA-X** : dépôt public publié par le script ; 0 fichier de gouvernance ; 0 chaîne FR hors `lang-exempt.json` (test 42) ; CI verte à distance.
- **CA-F** (par sous-lot, chacun ≤ 1 205) : site en ligne sur le domaine ou son repli ; niveaux présents ; test 44 vert ; négatifs visibles ; tokenomics = contenu investisseur ou « to be announced ».
- **CA-B** (par sous-lot) : runbook commis + vérifié au premier `deploy` (test 47) ; `api.<domaine>` conforme (test 43) ; MCP lecture (test 45) ; 0 secret (test 46) ; orchestrateur jamais sur le VPS.
- **CA-E** : chaque PR sous 1 205 ; gate de langue vert sur le package ; identifiants gelés intacts.
- **Global** : contrats gelés ; zéro dette nue ; journal de provenance ; checkpoint 2 par lot.

## 4. Pendants formés (datés)
- **Investisseur ≤ 2026-09-09** : nom de domaine ; fournisseur VPS ; hébergement du site (Q2) ; `DEPLOY_SSH_KEY` ; enregistrement de la clé de signature GitHub ; contenu tokenomics (Q3) ou « to be announced » ; ordre de coupe (Q1) ; passage de `monark` en public (avec (h)). Inchangés : (g), (h), (e), (a′).
- **Recherche** : R-P2 schéma SKILL.md `claw-agent` ; R-P3 spec MCP streamable HTTP [lu].
- **Phase 3** : image `shogen` + `shogen.<domaine>` ; `claw-agent` + clé d'inférence ; console à comptes ; clés acheteurs ; paiement token ; agents commerciaux ; notation croisée ; Kraidle.

## 5. Alternatives écartées
- **Astro / site statique** : pas de console ni de temps réel ; **réévalué si Q2 = auto-hébergé sans temps réel**.
- **GitHub Pages** : refusé par l'investisseur. **Vercel Hobby** : non commercial [lu].
- **Serverless pour Shōgen / claw-agent** : sessions longues.
- **Un seul dépôt public traduit** : réécriture de provenance ; écarté (M003 D0.5).
- **Lot E exempté de R-25** : écarté, scindé (D8). **F et B en un lot** : hors borne ; scindés (D10).
- **JSONL + chaîne de hash / SQLite** comme journal post-pivot : écartés (D4), SQLite gardé en repli.
- **Orchestrateur avec accès SSH au VPS** : viole D0.3 ; écarté (D6).

## 6. Escalades investisseur (validateur, 2026-09-06)
**Verbatim de l'avis (CHECKPOINT1-M004.md l.50)** : « Q1 ordre de coupe (proposition : garder X → E-root/contracts → F-public → F-console → B-api ; couper d'abord B-mcp, P, S2b réel, I, E-ukemi/monark/atelier) ; Q2 Vercel Pro payant ou site auto-hébergé sur le VPS ; Q3 tokenomics fourni avant le pivot ou “to be announced” ».
**Reformulées ci-dessous par l'orchestrateur** (précisions entre parenthèses = orchestrateur, pas le validateur). **Compte actualisé (§1.2)** : 15 lots, pivot = (h), défaut 2026-09-20 23:59 UTC — c'est ce compte qui fait foi, pas le « neuf/treize » de l'avis initial.
- **Q1 (compte)** : « Neuf lots (treize après scission R-25) sont marqués “avant le 21 sept.” pour 14 jours calendaires, à 1-2 jours par lot mesurés. Quel ordre de coupe acceptez-vous si le compte ne tient pas ? Proposition à confirmer ou réordonner : garder d'abord X → E-root/contracts → F-public → F-console lecture seule → B-api ; couper en premier, dans l'ordre : B-mcp, P (UsePod réel), S2b réel, I (flux réel `s3-binance`), E-ukemi/monark/atelier. » Sans réponse : l'ordre D10 s'exécute et ce qui manque au pivot est déclaré sur le site.
- **Q2 (hébergement du site)** : « Vercel Hobby est réservé à l'usage non commercial [lu] ; le site est commercial. Plan Vercel Pro (payant), ou site servi depuis le VPS derrière Caddy (Next.js auto-hébergé, ou Astro statique sans temps réel) ? »
- **Q3 (tokenomics)** : « Le contenu tokenomics est-il fourni avant le pivot, ou la page porte-t-elle “to be announced” jusqu'à (h) ? » (orchestrateur : par contenu on entend au minimum offre, utilité, distribution.)
Aucune escalade ne bloque E-root, E-contracts ni X.
