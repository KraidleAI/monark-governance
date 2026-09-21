# ADR-M004 — Infrastructure et plateforme MONARK (dépôts, site, backend, exposition aux agents, export public)

- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS au checkpoint 1** (validateur-humain, 2026-09-06, 17 items intégrés dans cette version — avis verbatim : `docs/CHECKPOINT1-M004.md`) ; **escalades investisseur** : **Q2 hébergement TRANCHÉ le 2026-09-07 (Cloudflare + VPS, Addendum D2)** ; restent ouvertes Q1 ordre de coupe, Q3 tokenomics, Q4 licence — §6. Paramètres investisseur attendus **≤ 2026-09-09** (§4).
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
- Dépôts : `KraidleAI/monark-governance` (privé, `main` poussé le 2026-09-06, protection PR + 5 jobs requis) et `KraidleAI/monark` (privé, vide). Signature locale active ; le `unknown_key` initial venait d'un **email de commit rattaché à un autre compte GitHub** (corrigé le 2026-09-06 : identité de commit = compte Kraidle, comme Shōgen ; journal). Commits antérieurs non vérifiés, conservés.
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

**Addendum D2 — pile d'outillage + hébergement tranché (2026-09-07 ; plan F-public v2 + escalade Q2)** :
- **Hébergement (Q2 tranché, investisseur)** : **Cloudflare** = registrar + DNS + proxy (TLS edge, cache, WAF/rate-limiting pour les quotas D5, masque l'IP d'origine) ; le **site Next.js est auto-hébergé comme conteneur sur le VPS derrière Caddy** (2e option de D2). Motif : D3 rend le VPS obligatoire de toute façon ⇒ un seul origin (pas de split CORS/cookies), un seul chemin de déploiement (D6 inchangé), pas d'ambiguïté SSE pour `/live`, zéro coût récurrent en plus. **Écartés** : **Vercel** (2e plateforme, Pro obligatoire car commercial [Hobby non-commercial, lu], DX non requise) ; **Cloudflare Pages** (`@cloudflare/next-on-pages` déprécié [lu, npm 2026-09-07]) ; **Cloudflare Workers + OpenNext** (`@opennextjs/cloudflare`, voie courante si Cloudflare hébergeait [lu]) = **fallback** pour des routes marketing avant l'existence du VPS, non retenu (le site n'est pas mis en ligne au démarrage). §5 « Astro statique » reste écarté (temps réel conservé).
- **Pile front (plan F-public v2 ; DÉCIDÉ, dans la tranche, [lu])** : **Next.js App Router** (D2), **shadcn/ui** (source copié own-the-code, MIT ; R-8 = version CLI `shadcn` épinglée + composants copiés journalisés), **`@next/mdx`** pour le contenu. **ORIENTATION à confirmer au lot concerné** : **Fumadocs + Orama** (`/docs`), **Tremor** (`/live`,`/console`). **PROCUREMENT avant décision** : **Scalar** (OpenAPI→MCP, licence NON TROUVÉ), **Nextra vs Fumadocs** (non comparés), **Velite**. Recherche : `F:\Clawpumptech\research\site-vitrine-best-practices.md`. Aucun prix ici (D9).

**Addendum D2-ter — base de primitives shadcn tranchée (2026-09-07 ; PLAN F-2, workflow 4 chercheurs Sonnet 5 → synthèse advisor Fable 5.1 → verdict orchestrateur ; checkpoint 1 validateur)** :
- **Décision : Base UI** — `npx shadcn@4.21.0 init -b base`. Défaut shadcn **depuis 2026-07-02** (réaffirmé 2026-07-17 à l'ajout de React Aria : « Base UI remains the default »), GA `1.0.0` (2025-12-11), `1.8.0` (2026-09-04), **MIT**, trace de correctifs **Next.js 16 + RSC** datée dans son CHANGELOG [lu]. **Épinglés exact (R-8)** : CLI `shadcn 4.21.0`, `@base-ui/react 1.8.0`.
- **Écartés** : **Radix** (accessibilité **non sourcée** dans les 4 rapports ; **bris RSC documenté sur la pile exacte** Next 16.2.11 + React 19.2.8, themes#813 ; contre-courant 2:1) ; **React Aria** pour F-2 (meilleure preuve a11y mais opt-in ~7 semaines comme base shadcn, **7 deps directes Apache-2.0** vs MIT, issue Turbopack locales #9213).
- **WCAG (escalade E-2 tranchée investisseur, 2026-09-07)** : comportement **WCAG 2.2 revendiqué par Base UI + ARIA APG**, **sans cible contractuelle** ni matrice de lecteurs d'écran nommés. Réversibilité vers React Aria notée si l'investisseur exige un jour AA + lecteurs nommés.
- **Item G0 distinct** : **preset de style** (8 styles, défaut « nova ») tranché au même `init`, tracé (anti défaut silencieux).
- **Caveats portés au PLAN F-2** (§8/§9, sourcés) : composition `render` ≠ `asChild` ; `CSPProvider`+nonce si CSP stricte ; **oracle RSC = `next build` + frontière RSC compilée, hydratation en CA manuelle `next dev`** (pas couverte par `next build`) ; paquet `cn` 0.2.6 (tranché à l'`init`, `--dry-run`) ; collision `@base-ui/react` vs `@base-ui-components/react` (test anti-collision). Mémoire : memstack `a1ee7030…`. PLAN : `docs/PLAN-F2-lot.md`.

### D3 — Backend : un VPS, conteneurs, reverse proxy — **périmètre par lot**
VPS (fournisseur = paramètre ; Ubuntu LTS ; SSH par clé ; pare-feu ; fail2ban ; snapshots), Docker Compose, Caddy TLS automatique. Services **et leur lot** (item 14) :
1. `monark-api` — HIKAE + UKEMI + gate, TS sans état, HTTP JSON sur les contrats gelés, OpenAPI générée — **B-api**.
2. `mcp` — mêmes opérations en outils MCP, lecture seule au pivot — **B-mcp**.
3. `journal` (Postgres) + `events` (SSE) — **B-journal, après le pivot** (D4).
4. `shogen` — vérificateur Rust + campagne : image construite **depuis `F:\Shogen` (autre dépôt, non exporté)**, hors du job D6 ⇒ **Phase 3, lot Shōgen dédié** ; `shogen.<domaine>` **retiré de la surface du pivot** ; Shōgen est exposé au pivot par la console (témoignage `s3-binance`, Lot I) et par la page produit.
5. `claw-agent` — runtime Hermes (Nous Research) : exige une **clé de fournisseur d'inférence** (secret + coût investisseur, §4) ⇒ **Phase 3**.
Un seul VPS ; isolation par conteneurs ; aucun Kubernetes.

**Addendum D3 — Cloudflare devant Caddy (2026-09-07, Q2)** : (1) l'ACME **HTTP-01** de Caddy ne se complète pas derrière l'orange cloud (Cloudflare termine le TLS) ⇒ **Caddy DNS-01 avec un token API Cloudflare scoped-zone** (secret investisseur), ou cert **Cloudflare Origin CA** + SSL **Full (strict)**. (2) Le SSE a un **idle timeout ~100 s** à travers le proxy Free/Pro (erreur 524 ; Workers exemptés) [lu, communauté Cloudflare 2026-09-07] ⇒ **heartbeat ~30 s** dans B-journal/F-live et le stream MCP (ou grey-cloud `mcp.`). (3) SSH/deploy contourne le proxy (IP d'origine brute) ⇒ port 22 clé-seule (D6). Figures à re-lire à la mise en place.

### D4 — Journal persistant (**première décision** sur la persistance)
Au pivot, la console et le live lisent des **fichiers commis** (D1) : aucune base n'est requise. **Après le pivot**, le flux continu exige un journal interrogeable : **Postgres** (image épinglée par digest, R-8), tables par contrat gelé + `provenance` (sha256 du document canonique, source, `harness_version`, date) ; écriture uniquement par `monark-api` ; import des journaux S2 commis avec vérification de hash ; migrations versionnées ; SQL explicite. **Alternatives écartées** (item 13) : JSONL append-only + chaîne de hash commise (suffisant au pivot — c'est D1 — mais sans requêtes ni concurrence pour la console à comptes) ; SQLite embarqué (un seul écrivain, pas de SSE multi-lecteurs ; acceptable en repli si le VPS est petit — consigné). Motif Postgres = **flux continu post-pivot seulement**.

### D5 — Exposition aux agents et acheteurs
HTTP `api.<domaine>` (OpenAPI ; clés API par acheteur après le pivot ; quotas ; journal d'usage ; aucun paiement avant listing) ; MCP `mcp.<domaine>` (transport Streamable HTTP **[lu]** = révision **2026-07-28**, per-request sans état — R-P3, `docs/R-P3-mcp-streamable-http.md`) ; skills `claw-agent` (SKILL.md `metadata.hermes.*`, R-P2) en Phase 3 ; `usepod-client` reste interne à HIKAE.

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

**Addendum D7 — 2026-09-06 (finding Lot X, G1 §9.1 : dépôt public simulé = 77 tests, 2 rouges)** : deux tests exportés lisent des fichiers hors liste blanche. Décisions : (a) **`packages/atelier/{index.html,main.js,style.css,serve.js}` entrent dans la liste blanche** (ce sont les fichiers de démo scannés par `atelier_no_network`, à traduire au lot E-atelier) ; (b) **liste fermée commise `scripts/export-exclude-tests.json`** des tests réservés à la gouvernance, initialement `packages/hikae/test/s2.test.ts` seul — motif : `s2_report_reproducible` régénère `packages/hikae/docs/S2-RAPPORT-*.md` (rapport français, exclu par D7) ; **pendant formé** : quand E-hikae passe `scripts/s2-report.mjs` en anglais (nouveau sha256 du rapport, test byte-exact rejoué), le rapport et le test rentrent dans l'export et la liste se vide. Le test 42 gagne l'assertion (e) : `npm ci && npm run ci` **vert dans la sortie d'export** (CA-X « CI verte à distance » vérifiée localement avant toute publication). Options écartées : tests tolérants à l'absence (change `packages/**`, masque un défaut) ; export des rapports S2 français (viole D0.5). `error_origin` = orchestrateur (D7 n'avait pas simulé la CI du dépôt exporté).

**Addendum D7 bis — 2026-09-06 (revue G2 du Lot X, 4 réserves)** :
- **R1, CI du dépôt public** : le workflow de gouvernance exporté verbatim ne tourne pas dans la vitrine (`on: pull_request` seul, job `r25` sans base de merge). Décision : `export-public.mjs` **dérive** `.github/workflows/ci.yml` de façon déterministe — déclencheur `on: [push, pull_request]`, **job `r25-taille-de-lot` retiré** (la taille de lot est une gate de gouvernance ; la vitrine reçoit des instantanés), jobs g1/g3/g4/g6 conservés à l'identique (SHA épinglés). Test 42(f) : le workflow exporté ne contient pas `r25` et porte `push` ; mutant (transformation retirée) ⇒ rouge. CA-X « CI verte à distance » = ces quatre jobs verts sur la première poussée de `KraidleAI/monark` (le dépôt public est **public** ⇒ minutes gratuites, non soumises à la facturation qui bloque la gouvernance). `error_origin` = orchestrateur.
- **R2, LICENSE** : (a) le script **échoue** (exit 1) sur toute entrée de liste blanche absente, sauf `apps/site` (seule tolérance, D7) ; (b) **Q4 investisseur** : licence du dépôt public — proposition **Apache-2.0** (brevets explicites, compatible usage commercial ; MIT en alternative) ; tant que non tranché, **aucune publication** (une vitrine sans licence est « tous droits réservés » par défaut, ce qui contredit « atteignable par d'autres agents »). Le fichier `LICENSE` est ajouté à la liste blanche **non tolérée** dès que Q4 est tranché.
- **R3, `enforcement/`** : confirmé en liste blanche (script `lint-model-pinning.sh`, anglais, requis par le job g1 exporté). D7 amendé.
- **R4, `.md` français** : l'exclusion des `.md` français est **une exclusion avec rapport** (liste imprimée par `--check`), distincte de la liste noire de gouvernance qui reste **fail-closed et évaluée en premier** (avant toute règle de langue) — le finding MINE-B (un fichier de gouvernance masqué par la règle FR) est ainsi impossible ; test 42(g) : `docs/JOURNAL-PROVENANCE.md` glissé en liste blanche avec la règle FR active ⇒ rouge.
Observations O1-O3 : exemptions inertes conservées (elles documentent les clés Shōgen attendues au Lot I) ; composés à trait d'union = matière des lots E.

**Addendum D7 bis — clarifications (checkpoint 2 Lot X, 2026-09-06, correction C4)** :
- **R1** : la dérivation retire aussi le commentaire « Delivery flow » (seule autre occurrence de `r25`, faux dans la vitrine où `push` déclenche un run) ; les 4 corps de job g1/g3/g4/g6 restent byte-identiques à la source.
- **R2(b)** : `export-public.mjs` traite **déjà** `LICENSE` comme entrée **non tolérée** (échec dès l'absence) ; la publication reste bloquée tant que Q4 n'est pas tranchée. La rédaction « ajouté dès que Q4 tranché » constatait l'intention ; le code est en avance, effet identique.

### D7 ter — Durcissement du test 42 (O1, checkpoint 2 Lot X, correction C1)
Le test 42(f) certifie l'absence de `r25` et la présence de `push` mais **ne détecte ni la perte d'un job ni un corps de job corrompu** du workflow vitrine dérivé (la splice `/^ {2}\S/` s'arrête sur tout non-blanc en colonne 2 ; un commentaire indenté inséré laisserait un corps `r25` orphelin, YAML cassé, 42(f) encore vert). Durcissement dû = **assertion 42(f′)** : les **4 corps de job g1/g3/g4/g6 du workflow exporté sont byte-identiques à ceux de la source de gouvernance** (invariant « ensemble de jobs == {…} » trop faible). **Propriétaire** : le premier lot qui touche `.github/workflows/ci.yml`, au plus tard la première publication de `KraidleAI/monark`. Non bloquant pour le merge de gouvernance (le workflow dérivé commis est prouvé correct au checkpoint 2).

### D7 quater — Exemption des noms de test ADR à collision « _le_ = ≤ » (2026-09-07, consultation R-26 du worker E-ukemi)
Le lot E-ukemi a atteint **0 hit sauf 2** sur `lang-gate --scope ukemi` : le nom de test gelé **`fictitious_default_le_n_rounds`** (ADR-M002 D11, Lot U test #19 ; `packages/ukemi/README.md`, `test/clearing.test.ts`), où le substring `le` = l'abréviation de **≤**, faux-positif de la fr-word `le`. Non renommable (défini en spec ADR-M002 + **enregistré verbatim** dans les provenances `docs/G1-lot-K.md`, `docs/G2-lot-U.md` : renommer romprait la traçabilité = contournement P5), non exemptable par un worker (`lang-exempt.json` = plume orchestrateur). **Même collision en hikae** : **`interval_lo_le_hi`** (ADR-M002 test #15, M5 `buildIntervalRegion` ; `packages/hikae/test/region-predictor.test.ts`). **Décision (option i du worker, tranchée une fois pour la classe)** : les deux noms sont ajoutés aux `terms` de `scripts/lang-exempt.json` — cohérent avec le traitement des identifiants gelés à collision française déjà exemptés (`score_de_confiance`, `verdict_de_verite`, `revision_amont_deleguee`). Le générateur Lot X ne couvrait que schémas/enums, jamais les noms de test définis par ADR — trou de classe, fermé ici. `error_origin` = générateur du gate (Lot X, angle mort de classe), attrapé par la discipline lang-gate. Bénéficie à E-ukemi **et** E-hikae (pas de fork ad-hoc).

### Addendum D7 quinquies — SECURITY.md whitelisted (Lot CRA-B, 2026-09-19)
`SECURITY.md` (repo root) is added to `WHITELIST_FILES` in `scripts/export-public.mjs`. Rationale: it is a
public surface GitHub renders on the Security tab and researchers read, so the private repo must be its single
source of truth (motif `out/mint.txt`). It is scanned by the root language gate (English) and, added
EXPLICITLY to `surfaces()`, by `public_surfaces_make_no_probative_claim`; `cra_surfaces_stay_conditional`
scans it for CRA over-claims. Tuyaux (branchement): SECURITY.md -> GitHub Security tab (served) + the export
whitelist; `product_boundary_matches_export_list` asserts `collectFiles(ROOT).kept` contains it (mutant: drop
the whitelist line => red). It carries no link into `docs/**` (not exported). The full policy ships in this lot
(investor decisions 42-43, 2026-09-19): Reporting (GitHub Security Advisories only), Scope, Supported versions,
Timelines (72 h acknowledgement, 90-day coordinated disclosure), Data. See ADR-CRA-B.

### Addendum D7 sexies — U-4a governance/upcoming test exclusions + orphan fixtures (Lot U-4a, 2026-09-21)
Two test files under `apps/sentinel/test/` are added to `scripts/export-exclude-tests.json` (the D7-addendum
governance-only exclusion mechanism, NOT the structural blacklist), each because it reads or imports a file the
public export deliberately omits. Found by the U-4a checkpoint-2 (C-V-1): `npm run test` had been deferred at
G1, so test 42 (`export_public_no_governance_no_french`, assertion (e) = the exported CI) was RED and unseen.
- `apps/sentinel/test/ukemi-u4-governance.test.ts` (seam α) — `u4_prereg_sha_matches_committed_plan` reads
  `docs/PLAN-u4-prereg.md`, a governance file excluded by the D7 blacklist, so an exported run ENOENTs. The
  prereg check was ISOLATED into this dedicated file (out of `ukemi-u4a.test.ts`), never a silent skip.
- `apps/sentinel/test/ukemi-u4-scores.test.ts` (seam β) — imports `scripts/census/u4-scores.mjs` + its `.d.mts`
  (the U-4 calibration reducer), which is not whitelisted, so the exported `tsc --noEmit` reds TS2307.
  `scripts/census/**` is deliberately NOT whitelisted: Ukemi is `upcoming` (ADR-U4), the calibration recipe is
  not yet a public surface. Consequence, stated plainly: **the U-4 calibration is not replayable from the public
  mirror at this stage** (its reducer is not exported). Formed item « rejouabilité publique de la calibration
  U-4 » — trigger: G0 U-7 / Ukemi publication; owner: orchestrator.
- Fixtures `apps/sentinel/test/fixtures/ukemi/u4/*` (incl. `U4-book-23545087.json`, 5.96 MB) and
  `PROVENANCE-u4.md` (its local F: raws path REMOVED as of `88d28a5`, replaced by a `<U4_RAWS_DIR>` placeholder —
  checkpoint-2 bis C-VB-4, 2026-09-21; the real location stays in the private PLI under `docs/`, never exported) ARE
  copied to the export via the `apps/sentinel/test` package-style walk. They are LEFT as-is (Option A, smallest coherent form): after the two
  tests are excluded they are orphan data in the mirror, EXACTLY like the already-shipped
  `apps/sentinel/test/fixtures/ukemi/u3/*` + `PROVENANCE-u3.md` (the u3 reducer test lives at repo root, never
  exported) — an orphan state accepted at CHECKPOINT2-u3 (measured: the current export ships the u3 series + its
  F:-path provenance). The u4 fixtures are NEVER added to `STRUCTURAL_BLACKLIST` (a whitelisted path there fails
  the export hard, exit 1, and diverges from test 42's own BLACKLIST mirror). Test 42 assertion (d) compares
  `manifest.excluded_tests` to this exact config; assertion (e) runs the exported CI green once the two tests are
  excluded.
Disjunction constraint (two pli commits α then β): `scripts/export-exclude-tests.json` is edited in BOTH — the
governance test in the α-fix, the scores test in the β-fix — because assertion (d) requires
`manifest.excluded_tests == cfg.tests` exactly and a path absent from the tree is never a candidate (pre-adding
the β test would red the α-alone tree). `error_origin` = worker + orchestrator (same class as C-G2-1).

**Addendum daté (checkpoint-2 bis, 2026-09-21) — item C-G2D-1 (b) porté ici (item formé ; déclencheur : AVANT la
prochaine publication du miroir public ; propriétaire : orchestrateur).** Le chemin local u4 est **RETIRÉ** de
`PROVENANCE-u4.md` depuis `88d28a5` (placeholder `<U4_RAWS_DIR>` ; l'emplacement réel reste dans le PLI privé sous
`docs/`, jamais exporté). Trois volets restent formés :
- (i) **mécanisme d'exclusion des DONNÉES orphelines `upcoming`** de l'export public (analogue de
  `export-exclude-tests.json` pour les fixtures) — **jamais** `STRUCTURAL_BLACKLIST` (échec dur exit 1 + divergence du
  miroir `BLACKLIST` de test 42) ;
- (ii) **nettoyage de `apps/sentinel/test/fixtures/ukemi/u3/PROVENANCE-u3.md:42`** (un chemin de lecteur local
  `F:\PRODUITS\etude-2026-09-20\u3-raws-clean\u3-reads.jsonl` toujours exporté) ;
- (iii) **extension de `export:check` aux chemins de lecteur Windows** (`[A-Z]:\`) — **constat MESURÉ** : le gate rend
  « 0 forbidden path » sur un export qui en contient un (u3:42) ⇒ il est **AVEUGLE à cette classe**.

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
- **Investisseur ≤ 2026-09-09** : **licence du dépôt public (Q4, proposition Apache-2.0)** ; nom de domaine ; fournisseur VPS ; hébergement du site (Q2) ; `DEPLOY_SSH_KEY` ; enregistrement de la clé de signature GitHub ; contenu tokenomics (Q3) ou « to be announced » ; ordre de coupe (Q1) ; passage de `monark` en public (avec (h)). Inchangés : (g), (h), (e), (a′).
- **Recherche** : R-P2 schéma SKILL.md `claw-agent` ; ~~R-P3 spec MCP streamable HTTP [lu]~~ **R-P3 CLOS** (2026-09-07, `docs/R-P3-mcp-streamable-http.md`, 23 sources datées, **vérifié R-21** par WebFetch indépendant/verbatim primaire) : révision courante **2026-07-28** = Streamable HTTP **per-request sans état** (suppression session/`Mcp-Session-Id`/`initialize`/GET/reprise `Last-Event-ID` ; POST unique ; SSE scopé requête ; MRTR SEP-2322 ; `Origin` MUST-validate). Seul `subscriptions/listen` reste un flux SSE long-lived (keepalive commentaire SSE `:`, SDK TS 15 s < ~100 s Cloudflare D3 — **D3 confirmé, non contredit** : la reprise SSE ne s'applique qu'aux flux longs `events`/`subscriptions/listen`, pas aux réponses d'outil per-request). SDK scindé v1 `@modelcontextprotocol/sdk` gelé vs v2 `@modelcontextprotocol/{server,node,…}` ; **Hermes/`claw-agent` épingle déjà `mcp==2.0.0`** (2026-07-28). Prérequis Lot B-mcp/Genkan levé.
- **Phase 3** : image `shogen` + `shogen.<domaine>` ; `claw-agent` + clé d'inférence ; console à comptes ; clés acheteurs ; paiement token ; agents commerciaux ; notation croisée ; Kraidle.
- **Q2 tranché (2026-09-07)** : hébergement = Cloudflare + VPS (Addendum D2). Prérequis investisseur associés : domaine chez **Cloudflare** ; **VPS** créé (Ubuntu LTS, IP notée, non configuré — RUNBOOK avec B-infra) ; **token DNS Cloudflare scoped-zone** (TLS DNS-01, Addendum D3) ; paire **`DEPLOY_SSH_KEY`**.

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
- **Q2 (hébergement du site) — TRANCHÉ 2026-09-07** : **Cloudflare (registrar/DNS/proxy) + site Next.js auto-hébergé sur le VPS derrière Caddy** ; Vercel, Cloudflare Pages et Workers écartés (Addendum D2 ; consult. advisor + décision investisseur). Question d'origine conservée pour trace : « Vercel Pro payant, ou VPS derrière Caddy ? »
- **Q3 (tokenomics)** : « Le contenu tokenomics est-il fourni avant le pivot, ou la page porte-t-elle “to be announced” jusqu'à (h) ? » (orchestrateur : par contenu on entend au minimum offre, utilité, distribution.)
Aucune escalade ne bloque E-root, E-contracts ni X.

## Addendum D13 — exemption vocab-site de la phrase-invariant d'honnêteté (F-2b, 2026-09-09)
Le gate vocab scope `site` (F-2a) bannit `confidence` sur `apps/site`. Or l'invariant d'honnêteté MONARK s'énonce le plus clairement par la **négation** « MONARK keeps **no confidence field** » (Home + panneau Shōgen). **Décision** : `vocab-banned.json` `scan.site.exemptPhrases` exempte la **phrase exacte, minuscule, intra-ligne** `no confidence field` — et rien d'autre (l'exemption ne masque ni `confidence` ailleurs, ni « high confidence »). Garde : test `vocab_site_confidence_exemption`, **load-bearing + non-inert** (walker AST `renderedTexts()`, F-2b R-E) — retirer l'exemption, déplacer la phrase hors position **rendue**, ou l'élargir au mot nu, rougit le test (mutants M1/M3). **C'est la SEULE exemption site** ; toute nouvelle passe par un addendum daté. **Ferme le pendant F-2a** « `\bconfidence\b` (copy invariant rougira vocab site) → ADR scopé ». `error_origin` = n/a (invariant d'honnêteté voulu, pas une erreur).

## Addendum D14 — câblage segment→produit sur la vitrine (C-2, F-2c, 2026-09-09)
**Décision investisseur (memstack uid=9864041b ; résout la réserve C-2 du checkpoint-2 de F-2b)** : sur la vitrine, chaque **carte de segment ouvre le panneau du produit correspondant** (Leverage→Softlanding, Vault LP→Firebreak, Betting desk→Verdict, DAO/agent→Warden, Rate treasury→Ballast). **Invariant** : **aucun des 5 produits (doigts) n'est bâti aujourd'hui** — le produit est un **câblage d'agents de flotte**, distinct de l'agent-moteur (Softlanding/Firebreak restent `upcoming` même si Ukemi est bâti). Donc **tout segment ouvre un placeholder `upcoming`** (« to be announced »), jamais un panneau « built ». **Amende** la réserve ROADMAP-MONARK §9 (l.176 « un produit n'apparaît en public que quand il est bâti ») : C-2 est plus récente et explicite — un produit **non bâti** peut apparaître **en tant que `upcoming`** derrière son segment (pas comme bâti). Les **5 produits ne figurent pas sur `/roadmap`** (le compte « three built, eight on the roadmap » reste vrai). **Verrou** : test racine (F-2c C-2) — `built` ⊂ exactement {Shōgen, Hikae, Ukemi} ; les 13 autres (8 agents roadmap + 5 produits) `upcoming` ; mutant nommé. Gate `site` étendu aux noms de plateformes tierces (F-2c C-4). `error_origin` = n/a (décision investisseur).

## Addendum D15 — campagne F-site (implémentation du design Claude Design) (2026-09-10)
Porte le design `MONARK.dc.html` en app Next.js gouvernée (PLAN-Fsite-lot.md, checkpoint-1 validateur ACCEPTE-AVEC-CORRECTIONS C-1..C-9 + escalade E-1). Décisions d'infrastructure/doctrine actées :
- **7 nouvelles routes** App Router : `/how`, `/products`, `/fleet`, `/token`, `/console`, `/writing`, `/integrators` (renommage de `#/api` → `/integrators` pour éviter la confusion avec les route-handlers). Chacune exporte un `const metadata` **statique, sans chiffre** ; **jamais** `generateMetadata` (gate `no_generate_metadata_in_apps_site`).
- **Refonte `globals.css` navy/gold → papier/encre/Sora** : ce n'est **pas** un choix neuf — application du **gel de marque investisseur 2026-09-07** (memstack `03a0a1f4…` : « tout en Sora ; fond papier #FAF7F2 / encre #1F1B16 ; UI 500/400 ; IBM Plex/JetBrains Mono pour la donnée ; Newsreader serif réservé au texte académique long ; un accent fixe par agent »). Cité en verbatim comme source.
- **Sim illustratif** : `COST`, `α`, `budget`, `AMBIENT`, `decide()` sont des **paramètres de simulation illustratifs** (le design l'affiche), **pas** des figures de marché ni les paramètres du moteur réel (ADR-M003 K porte α réel = 0.01 pour une classe). **Le caveat « illustrative simulation of the policy, not market activity » DOIT être rendu aux TROIS montages** (engine board Home, explainer How, mini-sim Token) — pas seulement Token (C-5).
- **Thème** : classe `.dark` (`@custom-variant dark` existant) + provider client.
- **Polices** : `next/font/google` (Sora, IBM Plex Mono, Newsreader), auto-hébergées au build. **Réserve écrite (C-2)** : `next/font` fait un fetch réseau **au build** vers Google (non épinglé par hash, build rouge hors-ligne) ; alternative `@fontsource` épinglé (R-8) laissée à l'orchestrateur, réserve consignée.
- **`lib/gate-enums.ts`** : loader build-time des enums `action`/`reason` de `gate-decision.schema.json` pour sortir la valeur `abstain` d'apps/site (`abstain` ∈ CoverageVerdict.required → citer le littéral rougirait `frozen_contract_fields_stay_dynamic`). Type d'action **dérivé du tableau chargé**, jamais l'union littérale. **Test racine** (hors apps/site) épinglant l'ordre `action = [commit, defer, abstain]` (C-9).
- **Exemptions `honesty-lint.exempt.json`** : `01–04` (ordinaux de section rendus), `1.0.0` (version de schéma) — **non-figures**, chacune avec porteur en position rendue ; **ajout d'une garde d'inertie** (entrée exempt sans porteur rendu ⇒ rouge) avec la première entrée (C-6). Jamais `0/1/2/3` nus.
- **Registre VISAGE** : les 3 produits « visage » (MONARK Attestation=The File / Hallmark=The Seal / Threshold=The Trigger — copie & acheteurs **tirés de la décision uid 28b02686**, jamais des blurbs `CORE` du design qui en **inversent le sens**) sont rendus via un **tableau de registre testé** (3 `upcoming`, compte global 16, mutant nommé), **jamais** un statut codé hors registre (interdit par D14 + la garde de consommation). Les 5 doigts restent `PRODUCTS` (mapping `fleet.ts` : Softlanding→Leverage, Firebreak→Vault LP ; le design **inverse**, on suit `fleet.ts`).
- **Sim honnête par construction** : état calculé, aucun littéral numérique en position rendue ; les nouveaux **modules de données rendues** (`agents-presentation`, `sim`, pipeline, steps, profils, VISAGE) sont couverts par le scan « numeric-hole » du test registre (étendu ou frère) — pas de contournement silencieux de la convention « prose = JSX scanné » (C-4).
`error_origin` = n/a (décisions d'implémentation/doctrine actées au checkpoint-1). **E-1 escaladée à l'investisseur** (picker de profils, cf. journal).

## Addendum D16 — harnais MCP appelable (ADR-M005) : amendements à M004 (2026-09-10)
La campagne « harnais » (piste 1, `docs/adr/ADR-M005-harnais-mcp-appelable.md`, `PLAN-harnais-lot.md`) est cadrée par un ADR dédié, avec **quatre décisions investisseur du 2026-09-10** : **Q1** « honorer l'archi littéralement », **Q2** « n'amende pas » (déploiement harnais), **Q-A** « exporter (open-source) », **Q-B** « garder l'auto-déploiement de la vitrine ». Amendements portés à M004 :
- **Déploiement — D0.3 tient pour le HARNAIS (Q2), exception datée pour la VITRINE (Q-B)** : le **harnais** est **déployé par l'investisseur** (`docs/RUNBOOK-harness.md` + `scripts/verify-harness.mjs` commis ; l'agent ne `scp`/`ssh` pas). La **boucle SSH de la vitrine** par l'agent (`/opt/monark-redeploy.sh`, clé `monark_vps`) est **RATIFIÉE comme exception datée** (Q-B : l'itération rapide voulue par l'investisseur, mémoire `b70af090`) — **la clé est maintenue, aucune révocation**. La qualification « déviation non ratifiée » du brouillon est **retirée**. Entrée dédiée au `JOURNAL-PROVENANCE.md` (déploiement vitrine par l'agent, `error_origin`).
- **K-7(a) — correction D2/§4 (registrar/DNS/TLS réels)** : les mentions « domaine chez **Cloudflare**, DNS-01 » (Addendum D2, §4) sont **périmées**. État réel au 2026-09-10 (mémoire `0072dd81`) : **registrar + DNS chez Hostinger**, **VPS Hostinger**, **TLS par Caddy en HTTP-01**. **Cloudflare (proxy/WAF) n'est pas posé** ; il est séquencé **après** MCP→agent→token (M005 D10). PF-2 (DNS A `mcp.`/`api.`) = **panneau Hostinger**.
- **Q-A — export open-source** : `apps/harness` **et** les fixtures `fixtures/s3-binance.*` entrent dans la **liste blanche** de `export-public.mjs` ; le test 42 couvre le harnais ; exemption de langue **par chemin** pour les fixtures Shōgen verbatim (M005 D9/K-2). Le miroir public `KraidleAI/monark` devient reproductible e2e.
- **D6/D10 (B-infra, B-api, B-mcp) — topologie amendée (ADR-M005 D7/D10)** : harnais = service **systemd `monark-harness`** (`127.0.0.1:3001`) derrière Caddy `mcp./api.monarkgate.tech`, **pas** docker-compose/GHCR + job `deploy` (reportés). Le lot **B-mcp** est **réalisé par M005** (outils `attest`/`gate`/`cascade`), pas comme « vues lecture de fixtures ».
- **D11 test 45 REFORMULÉ (ADR-M005 D11)** : `mcp_tools_readonly_fixtures` → **`mcp_tools_have_no_side_effects`** (oracle : registre fermé + scan statique sans `node:fs`/`node:net`/`node:child_process`/`fetch`). **Ajouts** : `origin_invalid_returns_403` + `origin_absent_is_accepted` (R-P3 §5.4 : « present and invalid ») et `harness_binds_localhost_only`.
- **test 47 (`runbook_checklist_verified_by_deploy`) REPORTÉ** avec B-infra (docker) : le déploiement investisseur du harnais est couvert par `verify-harness.mjs` + CA enregistrée par l'investisseur (M005 D10).
- **`attest` = Lot I (ADR-M003 D10)** : M005 **dépend** de Lot I (adaptateur Shōgen→`AttestedPrice` + `crossAgentGate` réel + tests 29/30, `packages/monark`), non construit à ce jour, scindé I-a/I-b (M005 K-5) — **pas** ré-inventé par M005. Les tests 31/41 + panneau atelier de M003 CA-I ne sont **pas** réduits silencieusement (pendant formé, owner post-H5).
`error_origin` = orchestrateur (le premier jet de M005 avait présumé docker-compose et réinterprété attest/cascade ; attrapé aux deux checkpoint-1 validateur + vérification R-21). Amendements non bloquants pour la vitrine déjà en ligne.

## Addendum D17 — Q2 RÉVISÉ (investisseur, 2026-09-10) : déploiement du harnais par l'agent
La clause « déploiement » de l'**Addendum D16** (« le **harnais** est **déployé par l'investisseur** ») est **supersédée** par la décision investisseur du 2026-09-10 (`AskUserQuestion`, après H3, « Je le déploie (comme la vitrine) ») : l'**agent déploie aussi le harnais**, par le **même canal que la vitrine** — clé `~/.ssh/monark_vps` root, systemd `monark-harness` (`127.0.0.1:3001`), Caddy `mcp./api.` **appended** (jamais remplacé), redéploiements `/opt/monark-harness-redeploy.sh` (sur le VPS, motif vitrine). **D0.3 : le harnais rejoint désormais l'exception datée de la vitrine (Q-B)** — clé maintenue, **aucune révocation**, **aucune exposition nouvelle** (canal / clé / discipline identiques ; harnais stateless ; aucun secret commis). Détail : ADR-M005 **Addendum D12**. Les autres bullets de D16 (K-7 Hostinger/HTTP-01, Q-A export, topologie systemd, tests) **tiennent inchangés**. **PF-2 (DNS A `mcp.`/`api.`) a été posé par l'agent** (panneau Hostinger, compte investisseur connecté, aucun mot de passe manipulé). `error_origin` = n/a (décision investisseur).

## Addendum D18 — DA « Console » + diagramme vivant SVG (F-site-9, investisseur 2026-09-18, correction C-1 du checkpoint-1)
> **Rectificatif 2026-09-18 (checkpoint-2 9a-i C-1, BRIEF addendum 6 quater)** : la bande du bas du diagramme ne nomme **aucune blockchain** ; elle rend trois nœuds
> génériques « Web2 agents », « Web3 agents · any chain », « Your own agent » sous le titre « Blockchain-agnostic · Web2 / Web3 agents ». Toute mention ci-dessous
> d'une « bande Blockchains where agents run », d'un « registre chaînes » / `lib/agents-ecosystems.ts`, ou de la phrase « Agent frameworks run on these chains … »
> est **superseded** ; le concept de référence est **D v5** (BRIEF l.190). Sources ajoutées : addenda 6 ter et 6 quater. Les copies de cadrage rendues sont
> fixées par le lot 9a-ii (PLAN-Fsite-9aii-diagram.md §8 C-2), pas ici.
Cadre le lot F-site-9 (mise à niveau DA « Console » B + illustration vivante du moteur), sourcé au **verbatim investisseur du 2026-09-18** (`PLAN-Fsite-9-sas.md` §0 ; `BRIEF.md` **addenda 6 et 6 bis** [lu]). **L'illustration 3D three.js/GLB (« le sas ») est ABANDONNÉE** (investisseur, BRIEF addendum 6) ; le lot livre un **diagramme vivant SVG + CSS** (concept D v3 : providers en 3 classes → moteur MONARK conteneur, 4 étapes attest/calibrate/gate/agir (id `agir`, libellé rendu en anglais « act » choisi en 9a-ii), 11 pièces, Hikae ×2 → 8 profils ; bande « Blockchains where agents run » reliée au gate). Cet addendum applique la **correction C-1 du checkpoint-1** et supersède la variante 3D de la version acceptée du PLAN. Décisions :
- **(a) DA « Console » supersède le gel de marque 2026-09-07 cité en D15** : la mise à niveau porte sur **palette / typo / mouvement seuls**, **structure conservée** (base = `apps/site` tel quel, pas de refonte). Le gel de marque reste la source pour tout le reste ; seule sa surface visuelle est amendée, en verbatim, par cette décision.
- **(b) AUCUNE dépendance nouvelle** : le diagramme vivant est **SVG React + CSS écrit à la main, zéro dépendance** (`three` et `@types/three` **retirés** — 3D abandonnée). **R-8 sans objet** pour ce lot ; le `three.min.js` UMD 2023 du concept n'est pas repris ; aucun GLB, aucun `GLTFLoader`.
- **(c) Marques d'inférence ET blockchains sur la vitrine** : la doctrine D14 (câblage segment→produit) reste **scopée aux venues câblées par les produits** ; les **providers** (3 classes : décentralisés/open-weight ; agrégateurs ; majors) et les **blockchains** (bande amont ; **superseded par BRIEF addendum 6 quater 2026-09-18 : bande « Blockchain-agnostic · Web2 / Web3 agents », aucune chaîne nommée**) sont admis sous **cadrage rendu obligatoire** — providers : « Illustrative, provider-agnostic routing. No endorsement. » ; chaînes : « Agent frameworks run on these chains — and any agent a client builds — call the gate directly. Examples, no endorsement. ». Noms en **9a-ii** (registre `lib/agents-ecosystems.ts` sourcé [lu] par le chercheur) ; **icônes officielles** (SVG/PNG HD, licence verbatim, **jamais redessinées** ; logo introuvable ⇒ procurement formé) en **9c**.
- **(d) Remplacement du pipeline de cartes de la home par le diagramme vivant SVG** (concept D v3, **pas** « le sas ») : porté dans `board.tsx` (données `fleet.ts`/`profiles.ts` + registre chaînes), **conservés** : `<aside>` panneau latéral, picker `PICKER_PROFILES`, `{CAVEAT}` ; clic pièce ⇒ chemin accentué + panneau (résout Q-1) ; clavier ; `prefers-reduced-motion` ; aucun chiffre ; commit/defer/abstain en couleurs seules. Intégration en **F-site-9a-ii**.
- **(e) Polices OFL en `next/font/local`** : lève la réserve « fetch réseau au build » de D15 (C-2) — les polices Open Font License sont **vendorées** et chargées via `next/font/local`, build reproductible hors-ligne, plus de dépendance réseau à Google au build.
`error_origin` = n/a (décision investisseur actée ; correction C-1 du checkpoint-1). Le présent addendum est commis avec **F-site-9a-i**, dont les livrables — `components/sas/{sas-model,sas-machine,sas-audit,use-sas-state}.ts` (purs, **zéro dépendance**) + tests racine `test/sas-*.test.ts` — **restent valides et alimentent le diagramme vivant** (BRIEF addendum 6 : « 9a-i … reste valide »), sous G1 `docs/G1-lot-fsite-9a-i.md`.
