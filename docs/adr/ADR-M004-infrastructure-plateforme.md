# ADR-M004 — Infrastructure et plateforme MONARK (dépôts, site, backend, exposition aux agents, export public)

- **Statut** : PROPOSÉ — soumis au **checkpoint 1** du validateur-humain (AgileGates : approbation du plan avant tout code). Paramètres investisseur en attente : **nom de domaine**, **fournisseur VPS** (Hetzner proposé), **confirmation Next.js sur Vercel**.
- **Rattachement** : ADR-M003 (Phase 2 ; D0.5 langue et dépôts ; D8/W supersédés par le présent ADR ; D5 addendum R-P1), ADR-M001 (contrats gelés), `docs/R-P1-clawpump-hermes.md`, `ROADMAP-MONARK.md`.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` le 2026-09-06 après consultation advisor (R-26, outil intégré, 1 appel de cadrage). Aucun code écrit.
- **Décisions investisseur fondatrices (verbatim, 2026-09-05)** : « MONARK […] une entreprise, une compagnie, où les agents sont les produits, chaque agent collabore, note, améliore son produit » ; « si une personne veut voir, auditer les décisions de son agent, il le fait où ? » ; « exposer tout Shōgen […] via MONARK » ; « MONARK sera la vitrine de nos produits, et c'est par ça qu'on va financer le développement continu » ; « tout ce qui est github, site, plateforme, doit être en anglais » ; « je suis ta recommandation des deux dépôts ».

## 1. Contexte

### 1.1 Ce que la vitrine doit être
Pas une landing page. Une **plateforme à trois niveaux** : (1) **public** — la compagnie, la flotte d'agents (trois premiers : Shōgen, HIKAE, UKEMI ; dizaines à venir : DeFi, inférence, IA), ce que chacun résout, chiffres sourcés [lu], tokenomics, roadmap (agents commerciaux → phase Kraidle → flotte de trading) ; (2) **live** — ce que les agents font en temps réel, négatifs inclus (abstentions) ; (3) **console** — une personne audite les décisions de son agent : entrées, prix attesté, région conforme, budget, raison, hash du journal. Shōgen exposé en entier via MONARK tout en restant atteignable seul.

### 1.2 Contrainte liante : le calendrier, pas la liste des fonctions
Aujourd'hui J-14 (tokenisation 2026-09-20 23:59 UTC ; judging 21-30 sept.). Mesuré sur la Phase 2 : un lot = 1 à 2 jours avec des workers Opus qui meurent quotidiennement sur limite d'usage. Reste à livrer côté ADR-M003 : S, I, P, E (export anglais). Le présent ADR ajoute : F (site), B (backend + journal), X (export). **Sept lots en quatorze jours ne tiennent pas tous** : ce document nomme la **surface publique minimale** du 2026-09-21 (D1) et date le reste après le listing. Si le compte ne tient pas, c'est écrit ici et l'investisseur tranche (CA-2), pas un lot qui se réduit en silence.

### 1.3 Pré-vérifications machine (orchestrateur, 2026-09-06)
- Dépôts : `KraidleAI/monark-governance` (privé, `origin` de F:\Monark, vide côté distant, atteignable) et `KraidleAI/monark` (privé, vide). Signature SSH configurée, commits signés depuis `c6091c4` ; 22 commits antérieurs non signés (historique conservé tel quel).
- Atelier actuel : 59 lignes (index.html + main.js + style.css) — un artefact de démo, pas une vitrine ; il devient un composant du niveau « live ».
- MONARK n'a **aucun état persistant** aujourd'hui (journaux S2 = fichiers commis). ADR-M003 §5 écartait « une base de données » : **le présent ADR revient sur ce point** (D4), la console d'audit et le live exigent un journal interrogeable.
- Contrats gelés inchangés (ADR-M001) : l'API expose exactement `AttestedPrice`, `Prediction`, `CoverageVerdict`, `GateDecision`.

## 2. Décisions

### D0 — Sièges et périmètre inchangés
D0.1-D0.5 d'ADR-M003 s'appliquent (permission par action pour tout push ; secrets et comptes = investisseur ; pas de trading ; anglais sur tout le public). **Ajout** : l'orchestrateur **ne touche jamais le VPS** — le déploiement passe par un job GitHub Actions dont le secret SSH est posé par l'investisseur dans les réglages du dépôt, ou par des commandes que l'investisseur exécute lui-même (D6).

### D1 — Surface publique minimale du 2026-09-21 (le plan), et le reste daté
| Niveau | Au 2026-09-21 | Après le listing |
|---|---|---|
| Public | pages compagnie / flotte / trois agents / tokenomics / roadmap ; chiffres [lu] seulement (P-K1-1 : 1,07 Md USD liquidable MakerDAO à −43 % ETH ; 807,46 M liquidés ; 63,59 M profit) | agents commerciaux, notation croisée, Kraidle |
| Live | rapports S2 commis (S2a synthétique déclaré ; S2b réel si (e) positif) ; clearing UKEMI sur scénarios commis ; **un flux réel** minimal : attestations Shōgen du témoignage `s3-binance` et verdicts HIKAE rejoués depuis le journal | flux continu depuis les services (D4), SSE |
| Console | **lecture seule**, sans compte : chaque décision des journaux commis a une page (entrées, verdict, raison, hash) | comptes, agents par utilisateur, clés API acheteurs |
| API/MCP | spec OpenAPI générée des 4 schémas, publiée ; serveur MCP en lecture (`hikae_conform`, `hikae_gate`, `ukemi_clearing`) sur fixtures commises | inférence réelle, quotas, clés |

Règle d'honnêteté : **rien n'est une maquette** ; chaque chiffre live vient d'un journal hashé et commis ; chaque page d'agent porte son vrai état (production / campagne / développement).

### D2 — Frontend : Next.js sur Vercel (confirmation investisseur attendue)
Pages dynamiques, temps réel, comptes à venir ⇒ Next.js (App Router), déployé sur Vercel relié à `KraidleAI/monark`. Design system propre (typographie, grille, mode sombre), pas de template. Le dépôt public porte le site sous `apps/site` (le monorepo npm workspaces existant l'accueille sans changement de structure). Alternative Astro écartée (§5).

### D3 — Backend : un VPS, conteneurs, reverse proxy
Un VPS (fournisseur : paramètre investisseur ; Ubuntu LTS ; SSH par clé uniquement ; pare-feu ; fail2ban ; snapshots activés), Docker Compose, Caddy en frontal avec TLS automatique, sous-domaines : `api.<domaine>`, `mcp.<domaine>`, `shogen.<domaine>`. Services :
1. `monark-api` — HIKAE + UKEMI + gate, TypeScript, sans état, HTTP JSON sur les contrats gelés ; spec OpenAPI générée depuis `schemas/`.
2. `shogen` — vérificateur Rust + campagne d'attestation (sessions longues ⇒ VPS, jamais serverless).
3. `claw-agent` — runtime Hermes (Nous Research, distribution ClawPump) où MONARK vit comme agent, skills `hikae_*` / `ukemi_*` (R-P1).
4. `journal` — Postgres : décisions, attestations, verdicts, chacun avec hash et provenance (D4).
5. `events` — SSE depuis le journal vers le site.
Un seul VPS au départ : isolation par conteneurs, séparation triviale plus tard. Aucun Kubernetes, aucun second VPS, aucune base autre que le journal.

### D4 — Journal persistant (revient sur ADR-M003 §5 « pas de base de données »)
Table par contrat gelé (`attested_prices`, `predictions`, `coverage_verdicts`, `gate_decisions`) + `provenance` (hash sha256 du document canonique, source, `harness_version`, date). Écriture uniquement par `monark-api` et `shogen` ; lecture par le site et `events`. Les journaux S2 commis sont **importés** (jamais ressaisis) par un script d'import qui vérifie le hash de chaque ligne. Migration versionnée ; aucun ORM lourd (SQL explicite).

### D5 — Exposition aux agents et acheteurs
- **HTTP** : `api.<domaine>` documentée par OpenAPI ; authentification par clé API par acheteur (après listing) ; quotas ; journal d'usage. Aucun paiement avant le listing.
- **MCP** : `mcp.<domaine>` expose les mêmes opérations comme outils ; transport streamable HTTP ; lecture seule au 21 sept.
- **Skills** : `claw-agent` SKILL.md (schéma `metadata.hermes.*`) pointant sur l'API — track pump.fun.
- **UsePod** : `usepod-client` (ADR-M003 D5 addendum) reste un prédicteur interne à HIKAE, jamais exposé.

### D6 — Déploiement sans que l'orchestrateur touche le VPS
Job GitHub Actions `deploy` (dépôt public, `workflow_dispatch` + tag) : build des images, push vers GHCR, puis `ssh` vers le VPS avec un secret `DEPLOY_SSH_KEY` **posé par l'investisseur** dans les réglages du dépôt ; le job exécute `docker compose pull && up -d`. Le site : déploiement Vercel automatique par commit sur `main` du dépôt public. Repli : l'investisseur exécute les deux commandes compose lui-même.

### D7 — Export vers le dépôt public (Lot X) : script commis, jamais copie manuelle
`scripts/export-public.mjs` : copie **liste blanche** (`packages/*` hors `docs/G*`, `schemas/`, `fixtures/`, `apps/site`, `README.md`, `LICENSE`, CI), **liste noire** explicite (`docs/adr/`, `docs/G1-*`, `docs/G2-*`, `docs/CHECKPOINT*`, `docs/JOURNAL-PROVENANCE.md`, `docs/R-P1-*`, tout `.md` en français), puis gate vocabulaire + **gate de langue** (0 chaîne française : détecteur par liste de mots et diacritiques, faux positifs listés) avant push. Historique du dépôt public **neuf** (un commit par export, message = tag de gouvernance). Test nommé 42 `export_public_no_governance_no_french`.

### D8 — Lot E (English only) et R-25
Une passe de traduction touche des commentaires dans tous les fichiers : **hors borne 1205 par construction**. Décision : Lot E **scindé par package** (E-contracts, E-hikae, E-ukemi, E-monark, E-atelier, E-root), une PR chacune, chacune sous la borne ; aucun lot exempté. Ordre : root + contracts d'abord (CI et schémas), puis hikae, ukemi, monark, atelier.

### D9 — Chiffres et fournisseurs
Aucun prix n'est écrit ici : les tarifs Vercel, VPS, registrar se vérifient sur les pages des fournisseurs au moment de réserver (règle « aucun chiffre de seconde main »). Réservations, dans l'ordre, toutes investisseur : domaine + DNS Cloudflare ; VPS ; Vercel relié à l'organisation ; supervision (Uptime Kuma auto-hébergé) ; snapshots.

### D10 — Lots ajoutés (numérotation continue avec ADR-M003)
| Lot | Contenu | Dépend de | Avant le 21 sept. ? |
|---|---|---|---|
| **X** Export | `export-public.mjs`, gate de langue, test 42, première publication de `KraidleAI/monark` | E-root, E-contracts | oui |
| **F** Site | Next.js `apps/site` : niveau public + live (rejeu des journaux commis) + console lecture seule | X, domaine, Vercel | oui (minimal) |
| **B** Backend | `monark-api` + OpenAPI + MCP lecture ; compose ; Caddy ; journal Postgres + import S2 ; `events` | VPS, F | **API + MCP lecture : oui ; journal/SSE : après listing** |
| **E-\*** | traduction par package | — | root, contracts, hikae : oui ; reste : au fil |
Ordre global (avec ADR-M003) : **ratchet-K → première PR → E-root ∥ E-contracts → X → F ∥ S → I → B (API/MCP) → P → listing → B (journal/SSE) → E-reste → console comptes.**

### D11 — Tests nommés (suite)
42 `export_public_no_governance_no_french` ; 43 `openapi_generated_matches_frozen_schemas` ; 44 `site_pages_only_committed_journal_data` (le site ne rend aucun chiffre qui ne vient pas d'un fichier commis et hashé) ; 45 `mcp_tools_readonly_fixtures` ; 46 `compose_no_secret_in_repo`.

### D12 — MAST
| Mode | Contre-mesure |
|---|---|
| Pression de délai | D1 surface minimale nommée ; tout le reste daté ; R-22 ; R-25 ; aucune publication avant checkpoint 2 |
| Maquette présentée comme réel | test 44 ; règle d'honnêteté D1 ; ligne D10 sur chaque rapport |
| Fuite de secret | D0 (orchestrateur jamais sur le VPS) ; test 46 ; jeton UsePod jamais dans une URL journalisée |
| Dérive de périmètre (trading) | D0.4 M003 |
| Générateur = vérificateur | D10bis M003 reconduit ; D10 M003 (option a) sous ses trois conditions |

## 3. Critères d'acceptation
- **CA-X** : dépôt public publié par le script, 0 fichier de gouvernance, 0 chaîne française (test 42), CI verte à distance.
- **CA-F** : site en ligne sur le domaine investisseur, trois niveaux présents, chaque chiffre live tracé à un fichier commis (test 44), négatifs visibles.
- **CA-B** : `api.<domaine>` répond avec OpenAPI conforme aux schémas gelés (test 43) ; MCP lecture (test 45) ; aucun secret dans le dépôt (test 46) ; déploiement par job Actions sans intervention orchestrateur sur le VPS.
- **CA-E** : chaque PR E sous 1205 lignes ; gate de langue vert sur le package.
- **Global** : contrats gelés intacts ; zéro dette nue ; journal de provenance ; checkpoint 2.

## 4. Pendants formés
- **Investisseur** : domaine ; VPS ; confirmation Next.js/Vercel ; secret `DEPLOY_SSH_KEY` ; passage du dépôt `monark` en public (date = avec (h)) ; (g), (h), (e), (a′) inchangés.
- **Recherche** : R-P2 — schéma SKILL.md `claw-agent` exact et mécanisme d'enregistrement (R-P1 Q3 l'a identifié, pas spécifié) ; R-P3 — MCP transport streamable HTTP : spec de référence à citer ([lu]) avant B.
- **Phase 3** : console avec comptes ; clés API acheteurs ; paiement token ; agents commerciaux ; notation croisée ; Kraidle.

## 5. Alternatives écartées
- **Astro / site statique** : pas de console ni de temps réel ; écarté après le repositionnement.
- **GitHub Pages** : refusé par l'investisseur.
- **Serverless pour Shōgen / claw-agent** : sessions longues, incompatibles.
- **Un seul dépôt public traduit** : réécriture de provenance ou traduction de gouvernance sans valeur ; écarté (ADR-M003 D0.5).
- **Lot E exempté de R-25** : écarté, scindé par package (D8).
- **Orchestrateur avec accès SSH au VPS** : viole D0.3 ; écarté (D6).
