# BASCULEMENT DE COMPTE CLAUDE — notes de reprise (lis-moi en premier)
Créé le 2026-09-19 par l'orchestrateur (Fable 5.1). Mis à jour à chaque fenêtre de bascule.

## 0. Session à reprendre
- Projet : `F:\Shogen` (répertoire de travail de la session, même si le gros du travail est dans `F:\Monark`).
- Transcript local : `C:\Users\KACIMI\.claude\projects\F--Shogen\90684fb2-4e7b-42e9-b820-f042dc4465f3.jsonl`
- Reprise : liste des sessions de l'app desktop (Code) → cette session ; sinon terminal : `claude --resume` dans `F:\Shogen`.
- Mots d'ordre au redémarrage : « reprends depuis `F:\Monark\docs\CHANTIERS.md` et `BASCULEMENT-COMPTE.md` ».

## 1. Ce qui est conservé (local, indépendant du compte)
CLAUDE.md global et projet ; agents `~/.claude/agents/*.md` (advisor/advisor-marche/advisor-defi/lecture-advisor = medium, validateur high, workers Opus 4.8 max, lecteurs/chercheurs Sonnet 5 max) ; `advisorModel = claude-fable-5-1` dans settings.json ; MCP locaux user-scope : memstack (127.0.0.1:8848), arxiv, openalex, semantic-scholar, claude-mem ; variable d'environnement utilisateur `POLYGON_API_KEY` (testée) ; dépôts `F:\Monark`, `F:\Monark-wt-p1b1` (worktree), `F:\Shogen`, campagne `F:\shogen-campagne` ; sauvegardes `Downloads\MONARK SUITE\backup-2026-09-18\` ; étude `Downloads\PRODUITS\etude-2026-09-19\`.

## 2. À refaire sur le nouveau compte
- Connecteurs claude.ai : Firecrawl (`mcp-search`, UUID `8aa0cccf-8b75-49a2-b5b7-f037a083f6da` — si l'UUID change, mettre à jour les 20 agents + CLAUDE.md global), Blockscout, Claude Docs, Higgsfield (outils billing jamais appelés), Origin/Vercel/CoinDesk (non nécessaires).
- Rien d'autre.

## 3. Règles de bascule
- Basculer uniquement quand **aucun sous-agent ne tourne** (ils meurent avec la session ; leurs fichiers sur disque restent).
- Avant de basculer : l'orchestrateur écrit l'état ici (§5) et dans `REPRISE.md`.
- Après : redémarrage de session = prise d'effet des frontmatters d'agents et des MCP ; vérifier `claude mcp list` (memstack Connected).

## 4. Documents de vérité (dans l'ordre)
0. `F:\Monark\docs\INVENTAIRE-OUTILS-TIERS.md` — API, MCP, connecteurs, plugins, skills, clés (noms) : check-list de récupération §7.
1. `F:\Monark\docs\CHANTIERS.md` — tableau de bord des chantiers (P1/W-1, Ukemi ADR-M020, témoin TSV, opérations, items formés, règles apprises).
2. `Downloads\MONARK SUITE\backup-2026-09-18\REPRISE.md` — journal de reprise horodaté.
3. `Downloads\PRODUITS\etude-2026-09-19\DECISIONS-investisseur-2026-09-19.md` — décisions verbatim.
4. `F:\Monark\docs\JOURNAL-PROVENANCE.md` — journal G1..G7.
5. `F:\Monark\docs\biblio\ukemi-modeL\` — biblio, avis, mesures Ukemi.

## 5. État au dernier point (2026-09-19 ~09:45 UTC, horloge système) — **BASCULE SÛRE : aucun sous-agent en vol**
Les deux agents en vol ont terminé et leurs résultats sont pliés et committés. Rien ne se perd à la bascule.

### 5.1 Dépôt
- `lot/etude-suite` HEAD = voir `git log -1` (dernier commit de ce fichier), poussée sur `KraidleAI/monark-governance` ; `main` privé `144ce68` ; miroir public `KraidleAI/Monark` `5bde13a` (site sur VPS, pas Vercel ; restyle B validé « tout est bon »).
- Oracle sur `lot/etude-suite` : 292/292 (après fusions R-25 `f4428b4` et E-bon-marché `4ffe553`).
- Sauvegardes : `Downloads\MONARK SUITE\backup-2026-09-18\` (docs, décisions, CLAUDE-global.md, agents/) ; inventaire outils : `docs/INVENTAIRE-OUTILS-TIERS.md`.

### 5.2 Lots — état exact
| Lot | Branche / worktree | Gel | État | Prochaine action |
|---|---|---|---|---|
| R-25-séries | `lot/r25-series` / `F:\Monark-wt-r25` | `e58d2c1` | CLOS, fusionné `f4428b4` | worktree supprimable |
| E-bon-marché | `lot/e-bon-marche` / `F:\Monark-wt-ecart` | `16cd39e` | CLOS, fusionné `4ffe553` | worktree supprimable |
| **U-1a Ukemi** | `lot/u-1a` / `F:\Monark-wt-p1b1` | **`dedfcd5`** | G2 pliée (C1/C2/C3), G2 persistée, 301/301, `npm ci` vert sur archive, merge-tree propre | **checkpoint-2 (prompt §5.4-A)** → plier → G7 → `git merge --no-ff lot/u-1a` sur `lot/etude-suite` |
| **T-1a Bell** | `lot/t-1a` / `F:\Monark-wt-bell` | **`a3f5393`** (G7 clos `9c515ce`) | G2 + checkpoint-2 (V-1..V-7) pliés, G7 CLOS, `npm ci` vert sur archive | **fusion après U-1a** : conflit additif attendu `vocab-banned.json` (garder bloc `sentinel` étendu ET bloc `bell`) ; puis `npm ci && npm run ci` + `gate:vocab` sur l'arbre fusionné, consigner au journal |
| U-1b-a AttestedBook | à créer | — | ADR-U1b `b60201d`, (A)/(B) tranchés (décision 20) | après G7 U-1a : worktree neuf, worker Opus 4.8 max, checkpoint-1 |
| T-1a-ii | à créer | — | ADR-B0 amendement O-5 + V-6/V-7 | ADR de lot + checkpoint-1 |

### 5.3 Ordre
checkpoint-2 U-1a → G7 U-1a → merge U-1a → merge T-1a → oracle fusionné → PR `lot/etude-suite` → `main` privé à la fenêtre investisseur (sans `--delete-branch` sur pile) → miroir public (`release-public.mjs` depuis `F:\Monark-wt-main` après `git pull`) → U-1b-a ∥ T-1a-ii.

### 5.4 Prompt à relancer
**A — Checkpoint-2 U-1a** : `Agent(subagent_type: validateur-humain)`, run_in_background — « Checkpoint-2 (livrable) lot U-1a (ADR-M020 / ADR-U1 recorder book Aave v3 ; décisions 15, 19, 20), worktree `F:\Monark-wt-p1b1`, branche `lot/u-1a`, gel `dedfcd5` (base `58fe309`). Lecture par SHA ; Bash vérification seule ; copies `git archive` + `npm ci` (jamais de jonction node_modules). Pièces : ADR-U1 D1-D9, ADR-M020 D2, `docs/G1-lot-u1a.md` (§5 offline `034fbff9`, §5b live borné `d35df289` avec wrapper non committé déclaré, §7 items, section G2 pliée), `docs/G2-lot-u1a.md` (C1/C2/C3, O1-O10), code `apps/sentinel/src/ukemi/{abi,wadray,clusters,rpc2,book,record}.ts`, `apps/sentinel/test/ukemi.test.ts` (12 tests), `apps/sentinel/test/fixtures/ukemi/{weth-book.fixture.json,PROVENANCE-weth-book.md}`, `vocab-banned.json` scope sentinel + exemptPhrases, `scripts/grep-forbidden.mjs`. CA-1..CA-11 + AM-1 : (1) `npm ci` sur `git archive dedfcd5` puis `npm run ci` (301/301), lint, ratchet 69/69, lang-gate, export:check, gate:vocab, R-25 commande de la gate (957 courante / 914 D9 sexies) ; (2) rejouer : C2 catch large ⇒ `ukemi_description_disagreement_abstains_book` rouge ; keccak `RHO` altéré ⇒ rouge ; `percentMul` demi-bas ⇒ rouge ; quorum divergent ⇒ abstention ; vocab `cascade` inséré ⇒ rouge ; fixture altérée d'un octet ⇒ `series_pinned_are_declared_and_hashed` rouge sur l'arbre fusionné (`git merge-tree lot/etude-suite lot/u-1a`) ; (3) recomputer `book_digest` par canonicaliseur indépendant et `holders_digest` par la recette de PROVENANCE §3 ; (4) ADR-U1 D3 : plus aucun chemin où un désaccord fournisseur produit un digest ; (5) CA-11 : `upcoming`, aucun registre touché ; (6) exemption vocab `cascade` bornée (phrase exacte, scope sentinel) ; (7) items formés décision 19 (durcissement `record.ts` propriétaire orchestrateur, sUSDe/USDe, book plein, U-1b, U-6, K-1) ; (8) merge-tree avec `lot/etude-suite` et `lot/t-1a` `a3f5393` (conflit `vocab-banned.json` additif). Rendre ACCEPTE / corrections / ESCALADE ; modèle résolu `claude-fable-5-1`. »

### 5.5 Décisions investisseur du jour (fichier DECISIONS, points 1-20)
… 18 lecture M018 D4 (b) ; 19 release gate zéro dette ; 20 ADR-U1b (A) témoin total + (B) motif M017 par classe (délégation). ADR-M013 (T0/T1/T2 vitrine) réaffirmé.

### 5.6 Attentes investisseur (à son rythme)
Clé Helius (`setx HELIUS_API_KEY`) ; PDF Gatto SSRN 7157638 ; VPS Bell (ADR-B0 D8) ; ratifications journal.jsonl Shōgen et bFloor M002 (bloquantes release) ; go annonces X ; fenêtre publique suivante après fusion U-1a/T-1a. **À corriger de son côté si utilisé** : « ≈ 47 % du marché » (Bell) était faux, retiré.

### 5.7 Règles apprises aujourd'hui (CHANTIERS §F)
G2 sur disque AVANT tout checkpoint-2 ; jamais `--delete-branch` sur une pile de PR ; **tout lot qui ajoute un workspace rejoue `npm ci` sur `git archive` propre avant gel** (T-1a V-1) ; re-sha G1 dans le même commit qu'un pliage ; lire le vérificateur avant de ratifier un tuyau ; site sur VPS.

## 6. Interdits permanents (rappel)
Jamais « partner », « autonomous », « guarantee » nu, probabilité d'avoir raison ; jamais de secret dans le chat ; jamais de commit par un worker ; Opus 5 banni ; sci-bot oublié ; Higgsfield billing jamais.


---
# MISE À JOUR 2026-09-20 (~10:30 UTC) — KIT DE REPRISE POUR UN 3ᵉ COMPTE (limite hebdomadaire)
Écrit par l'orchestrateur Fable 5.1 à la demande de l'investisseur (« prépare le même kit… au cas où on atteint la limite de la semaine »). **Ce §7 remplace le §5 pour l'état courant.** Lis dans l'ordre : ce fichier → `F:\Monark\docs\CHANTIERS.md` (décisions 40-64, note « REPRISE DE SESSION », §E items, §F règles) → `F:\Monark\docs\JOURNAL-PROVENANCE.md` (dernières lignes).

## 7.0 Session à reprendre (mise à jour 2026-09-20 ~13:15 UTC)
- Projet : `F:\Monark` (branche `lot/etude-suite`). Transcript local de la session courante : `C:\Users\KACIMI\.claude\projects\F--Monark\0b28054b-ca58-4cf1-820c-991d31d99595.jsonl`.
- Reprise : app desktop (Code), projet `F:\Monark`, **nouvelle session**. Premier message : « reprends depuis `F:\MONARK SUITE\BASCULEMENT-COMPTE.md` §7 et `F:\Monark\docs\CHANTIERS.md` ; investisseur = KACIMI ; règles CLAUDE.md global ». Tout ce qui compte est dans les fichiers.
- Rôles et modèles (inchangés) : orchestrateur Fable 5.1 `claude-fable-5-1` high ; workers Opus 4.8 `claude-opus-4-8` max (agent `~/.claude/agents/worker.md`, jamais le tier nu `opus`) ; lecteurs Sonnet 5 max ; validateur-humain Fable 5.1 high ; advisors Fable 5.1 medium ; Opus 5 banni.
- **Mode de permission** : la session a dû passer de `auto` (le classificateur refuse tout déploiement en production et toute écriture de règle, quoi qu'on dise dans le chat) à `default` puis « ignorer les permissions » (choix investisseur). Règle projet écrite par l'investisseur : `F:\Monark\.claude\settings.local.json` (allow `ssh -i ~/.ssh/monark_vps … root@31.97.155.188`). Sur le 3ᵉ compte : même réglage à refaire si un déploiement est prévu.

## 7.1 Conservé en local (indépendant du compte)
- `~/.claude/CLAUDE.md` global et `~/.claude/agents/*.md` (9 agents). Sauvegarde : `F:\MONARK SUITE\backup-2026-09-20\`.
- `settings.json` : `advisorModel = claude-fable-5-1`.
- MCP user-scope : memstack (127.0.0.1:8848 ; **401 DCR persistant toute la journée**, non bloquant, à re-enregistrer), arxiv, openalex, semantic-scholar, claude-mem. Firecrawl = connecteur claude.ai, **UUID `6144e146-7ed5-4073-b7f2-864b9335f725` (caduc, voir 7.11)** (22 agents + CLAUDE.md). **Vérifier l'UUID par `ToolSearch firecrawl` avant tout lecteur/chercheur.** Note : `WebFetch` tronque `databento.com/docs/*` ; les lecteurs passent par `firecrawl_developer_search`.
- Variables User (jamais dans le chat ; contrôle par longueur) : `HELIUS_API_KEY` (36), `POLYGON_API_KEY` (32), `DATABENTO_API_KEY` (32, `db-`), `CHAINSTACK_{SOLANA,ROBINHOOD,BSC,BASE,ETH}_URL` (72-78), `TMP/TEMP/TMPDIR = F:/tmp`. **Rien sur C:** ; scratch `F:\tmp\…` ; `npm --cache F:/tmp/npm-cache` ; Pillow `F:\tmp\pylib` ; Chrome headless profil `F:\tmp\chrome-prof`.
- Abonnements : Helius Developer (10 M crédits/mois, cycle 19 sept → 19 oct) ; Chainstack Growth (20 M RU, ~4 600 consommés au dernier relevé ; renouvellement avant le 19 oct) ; Massive Starter 29 $/mois (croisement interne seulement) ; Databento usage-based (0 $ engagé, 125 $ crédits ; coût mesuré 0,000031 $ pour 20 bars ⇒ ≈ 28–30 $/GB, décision 53 corroborée). Hostinger : VPS site `31.97.155.188` (harness + vitrine + **Narabi, redéployé le 20/09**) et VPS Bell KVM 2 `178.16.131.29` (base configurée, services Bell non déployés : T-1b). **Décision 65** : relais SMTP de l'alerte Narabi = Hostinger ; destinataire encore dû par l'investisseur.
- SSH : `ssh -i ~/.ssh/monark_vps root@31.97.155.188` / `root@178.16.131.29`. Secret Chainstack posé sur le VPS site : `/etc/monark/sentinel.env` (`root:sentinel 0640`, sha256 `88f8130d6fce…` = local).
- Claude in Chrome : à ré-appairer sur le 3ᵉ compte. Navigateur interne : Cloudflare bloque Hostinger/Databento ; l'investisseur passe le challenge.

## 7.2 À refaire sur le nouveau compte
1. Connecteurs claude.ai : Firecrawl (vérifier l'UUID), Claude Docs. 2. Appairer Claude in Chrome. 3. `claude mcp list` (memstack 401 : consigner). 4. Premier worker : contrôle R-1 (`claude-opus-4-8`). 5. Mode de permission (7.0) si déploiement prévu.

## 7.3 Règles de bascule
Basculer quand **aucun sous-agent ne tourne** ; avant : écrire l'état ici ; **deux chantiers en parallèle toujours** (décision 49) ; un seul `npm run ci` complet à la fois (§F) ; `gate:vocab` par tout pli/G2 delta ; prereg committé seul avant tout worker qui tire des données ; **CA-11 durci** (proposé, appliqué d'emblée) : « branché » = test qui exécute la composition depuis l'artefact d'entrée, jamais une regex sur le source ; **anti-close** (proposé, appliqué) : à chaque checkpoint-2 Bell, diff des littéraux close-like (formes `.` et `,`, entiers scalés) contre les bruts sha-pinnés ; les docs masquent par jeton `[masqué]`, jamais par une valeur ; un worker ne copie jamais un enregistrement brut réel dans un test.

## 7.4 État du dépôt à l'écriture
- `F:\Monark` `lot/etude-suite` HEAD **`d520908`** (voir `git log -1`), arbre propre. Oracle du dernier G7 (Bell -b3b) : **464/464**.
- Fusionnés le 20/09 (ordre) : CRA-B `9abf532`, Bell -b1 `7467023`, U-2a `58596b6`, U-3 `06de941`, **NARABI-OPS-1 `ad0569a`**, **Bell -b3a `27da5ab`**, **Bell -b3b `0013258`** (G7 : `docs/G7-lot-*.md`). Worktrees de ces lots supprimés.
- **NARABI-OPS-1 déployé** sur le timer vivant (RUNBOOK-sentinel §6) à 08:44 UTC : run immédiat `chainstack: true`, `exit_code: 0` ; 4 créneaux 00:30/03:30/06:30/09:30 UTC (+ jusqu'à 30 min aléatoire). **Dû** : consigner en JOURNAL-PROVENANCE le premier run de chaque créneau (`ssh … 'journalctl -u monark-sentinel --since "1 day ago" --no-pager | grep -E "processedDays|chainstack|exit_code"'`) — 09:30 du 20/09 puis 00:30/03:30/06:30 du 21/09.
- **Non poussé** : `lot/etude-suite` non poussé sur `KraidleAI/monark-governance` depuis le 19/09 — à la prochaine fenêtre publique.

## 7.5 Lots en vol — état exact et prochaine action
| Lot | Worktree / branche | État | Prochaine action |
|---|---|---|---|
| **Bell -b1-bis-i** | pas encore de worktree ; G0 `docs/G0-lot-t1a-ii-b1-bis.md` (`1928e49`), checkpoint-1 `docs/CHECKPOINT1-lot-t1a-ii-b1-bis.md` (`d520908`, C-1..C-11, C-1..C-6 bloquantes, ESCALADE Q5) | **pli du G0 EN VOL** (worker plie C-1..C-11 dans le G0) | quand le G0 est plié : committer, `git worktree add F:\Monark-wt-bellb1bis -b lot/t-1a-ii-b1-bis`, lancer le G1 (7.6-A). Q5 = escalade investisseur (plafond course -ii), non bloquante pour -i |
| **U-4a** | `F:\Monark-wt-u4a` / `lot/u-4a`, base `b1302db`, 7 fichiers modifiés/nouveaux non committés (record.ts, rpc2.ts, resume.ts, tests, `scripts/census/u4-probe.mjs`, `docs/PLI-lot-u4a.md`) | **passe filtre EN VOL** (`--filter-only --exclude-operator mevblocker.io --min-interval-ms 50 --resume`, ETA ~4 h depuis 11:30 UTC) ; cache/bruts `F:\PRODUITS\etude-2026-09-20\u4-raws\{U4-inputs.jsonl,U4-probe.json}` ; sortie attendue `U4-filter-23545087.json`. Sonde : N = 69 481 détenteurs, à-risque ≈ 22,6 % ⇒ ≈ 15 700 ; go course pré-autorisé si `n_at_risk_config` ≤ 17 730 (course ≈ 280 k appels < 300 000) | si le worker est mort : relire `docs/PLI-lot-u4a.md` (D-1..D-5) ; si `U4-filter-23545087.json` existe et ≤ 17 730 : relancer « go course » (7.6-C) ; sinon relancer le filtre `--resume` (rien n'est re-payé). Ensuite A-4..A-8, G2 fraîche (offline + re-tirage ≥ 3 comptes / 3 `AnswerUpdated`), checkpoint-2, G7, fusion ; découpe R-25 (C-10, U-4a-i = A-1..A-4) sur chiffres réels ; puis G0 U-4b (outil `book`, re-pin h5), U-4c |
| NARABI-OPS-1b | — | après destinataire mail | G0 : sonde externe sur le VPS Bell + alerte mail via relais Hostinger (décision 65) ; inclure `after()`+`rmSync` du test retry et la vérification `providerOf` p2pify |
| Bell -b1-bis-ii, -b2a, -b2b, -b3c, T-1b | — | après -b1-bis-i | -ii = course g_t fondatrice (fenêtre Cong, close Databento ≥ +24 h, plafond Q5) ; -b3c = corporate actions non-rebase (déclencheurs CHANTIERS §E) ; T-1b = site Bell charte C, logo 01, données du board, local d'abord ; design en pause |
| Ukemi U-5/U-6/U-7 | — | après U-4 | U-6 = `/ukemi/` sur le VPS harness (décision 57) |
| Cartographie totale, CI-site (+42(f′) + lacune R-25 `series/**/*.md`), K-1, release | — | fin de produit | ordre décision 46 |

## 7.6 Prompts à relancer (consignes détaillées = G0 de chaque lot + amendements)
- **A — G1 Bell -b1-bis-i** : `Agent(worker)` — « worker Opus 4.8, worktree `F:\Monark-wt-bellb1bis`, implémente `docs/G0-lot-t1a-ii-b1-bis.md` + amendement checkpoint-1 (C-1 `scanMethod` obligatoire enum fermé ; C-2 appariement quote par owner ; C-3 paramètres chiffrés au PLI avant tout appel, plafond -i ≤ 20 000 crédits ; C-4 test registre == discovery JSON ; C-5 carte programId→dex committée ; C-6 `quote_class` liste fermée ; C-7 ancrage C-3 par `replayTriplet` + quorum2 bits ; C-8 ordre L-3..L-6 puis L-1/L-2, run réel du scanner) ; aucune g_t ; aucun close ; R-25 ≤ 1 205 avec seam ; PLI ». Puis G2 fraîche → checkpoint-2 (anti-close diff) → G7 → fusion.
- **B — Pli du G0 -b1-bis-i** (si le worker de pli est mort) : `Agent(worker)` — « plie `docs/CHECKPOINT1-lot-t1a-ii-b1-bis.md` C-1..C-11 dans `docs/G0-lot-t1a-ii-b1-bis.md` (section Amendement checkpoint-1) ; Q5 = escalade intérim : plafond proposé ≤ 1 M crédits Helius / ≤ 200 k Chainstack, ratification due ; pas de commit ».
- **C — Reprise worker U-4a (go course)** : `Agent(worker)` — « reprends U-4a dans `F:\Monark-wt-u4a` (état : `git status`, `docs/PLI-lot-u4a.md` D-1..D-5, cache `F:\PRODUITS\etude-2026-09-20\u4-raws\`) ; prereg sha `9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb` ; course `record.ts --cluster weth --block 23545087 --exclude-operator mevblocker.io --min-interval-ms 50 --max-calls 300000 --resume … --prereg-sha …` ; puis A-4..A-8 (scores |Y−ŷ| sans clipage, `calibration.ts` inerte, `fromRealizedBook` lié `book_digest` 0 octet gelé, Hikae nMin 100, ADR-U4) ; jamais `--from-block` ; si un 2ᵉ opérateur > 5 % d'erreurs : arrêt + consultation ».

## 7.7 Ratifications investisseur dues (non bloquantes)
Décisions 60 (scan d'autorité) et 61 (U-4c) ; **Q3(ii) Bell** (sans croisement Massive : publier avec résiduel = option (a), intérim sous délégation 50) ; **Q5 -b1-bis-ii** (plafond course ≤ 1 M crédits Helius + ≤ 200 k Chainstack, reco oui) ; **amendement CA-11 durci** ; **amendement anti-close** ; destinataire de l'alerte mail 1b ; renouvellement Chainstack avant le 19 oct ; MCP Registry à U-4b ; push `lot/etude-suite` à la prochaine fenêtre.

## 7.8 Décisions du jour (verbatim dans CHANTIERS) — 46 → 65
46 test local / cartographie / zéro dette ; 47 Bell option (a) SPLIT ; 48 SECURITY.md 72 h / 90 j ; 49 Ukemi-perps + deux chantiers en parallèle ; 50 délégation ; 51 Ukemi built, `cascade` retiré avec son remplaçant ; 52 juriste GO (interne) ; 53 Databento EQUS.SUMMARY ; 54 VPS Bell ; 55/56 course -b3a ; 57 Ukemi sur VPS harness ; 58 alerte mail ; 59 skip ; 60 (orch.) scan d'autorité ; 61 (orch.) U-4c ; 62 design revue légère ; 63 landing = board, design après backend ; 64 logo 01 ; **65 relais SMTP = Hostinger**.

## 7.9 Interdits (rappel)
Jamais de secret dans le chat ni le dépôt (contrôle par longueur) ; jamais lire le DOM d'une page portant une clé ; jamais un commit par un worker ; Opus 5 banni ; jamais « verified / guarantee / score » sur une surface publique ; jamais un close en clair (dépôt, tests, docs, chat) ; jamais de download sans permission ; jamais de contournement d'un CAPTCHA ; jamais d'action sortante (DNS, PR publique, mail) sans go.

## 7.10 POINT D'ARRÊT — 2026-09-20 ~13:30 UTC (écrit juste avant la bascule, à la demande de l'investisseur)
**Où je me suis arrêté** : l'agent de pli du G0 -b1-bis-i a été **arrêté avant d'écrire** (le G0 `docs/G0-lot-t1a-ii-b1-bis.md` est tel qu'au commit `1928e49`, non plié ; `F:\Monark` arbre propre). Le seul agent encore vivant à l'arrêt : la **passe filtre U-4a** (processus node en tâche de fond du worker ; il meurt avec la session, mais le cache `--resume` `F:\PRODUITS\etude-2026-09-20\u4-raws\U4-inputs.jsonl` (≈ 39 Mo à 14:16 locale) conserve tout ce qui a été lu : rien n'est re-payé).

**Ce que le Claude qui arrive fait, dans l'ordre, dès la première minute** :
1. Lire ce §7 en entier, puis la fin de `docs/CHANTIERS.md` (entrées 2026-09-20) et les 5 dernières lignes de `docs/JOURNAL-PROVENANCE.md`. Vérifier `git -C F:\Monark log -1` et `git status` (attendu propre). Vérifier `ToolSearch firecrawl` (UUID 7.1). Contrôle R-1 au premier worker.
2. **U-4a (chantier 1)** : `git -C F:\Monark-wt-u4a status --short` (7 fichiers attendus, non committés — ne rien committer avant la G2). Regarder si `F:\PRODUITS\etude-2026-09-20\u4-raws\U4-filter-23545087.json` existe.
   - S'il existe : lire `n_at_risk_config` ; si ≤ 17 730 ⇒ relancer un worker avec le prompt 7.6-C (**go course**) ; sinon arrêter et consulter (advisor-defi) avant toute course.
   - S'il n'existe pas : relancer un worker (prompt 7.6-C) en lui demandant d'abord de **reprendre le filtre** `--filter-only --exclude-operator mevblocker.io --min-interval-ms 50 --resume` (HIT du cache instantané), puis la même règle de go.
3. **Bell -b1-bis-i (chantier 2)** : worker avec le prompt 7.6-B (pli C-1..C-11 du checkpoint-1 dans le G0), committer le G0 plié, `git worktree add F:\Monark-wt-bellb1bis -b lot/t-1a-ii-b1-bis`, puis G1 (prompt 7.6-A). Boucle : G2 fraîche → checkpoint-2 (avec diff anti-close) → G7 (`npm run ci` une seule fois) → fusion `--no-ff` → CHANTIERS + JOURNAL.
4. **Narabi** : à la première occasion, lire sur le VPS le journal des runs (`ssh -i ~/.ssh/monark_vps root@31.97.155.188 'journalctl -u monark-sentinel --since "2026-09-20 09:00" --no-pager | grep -E "processedDays|chainstack|exit_code|stopped"'`) et consigner en JOURNAL-PROVENANCE le premier run de chaque créneau (09:30 J, puis 00:30/03:30/06:30 J+1) : attendu `chainstack: true`, `exit_code: 0`. Un `chainstack: false` ou un exit ≠ 0 = STOP et enquête (RUNBOOK-sentinel §6).
5. **Ne pas faire sans l'investisseur** : DNS `bell.`, déploiement T-1b, mail sortant, push public, course -b1-bis-ii (Q5 non ratifiée), toute dépense nouvelle.
6. Dans le premier message à l'investisseur : la liste des ratifications dues (7.7) et la demande du **destinataire de l'alerte mail** (1b).

**Toujours deux chantiers en parallèle** (décision 49) : U-4a et Bell -b1-bis-i sont les deux en cours ; quand l'un se termine, le suivant dans l'ordre de 7.5.

## 7.11 Reprise 2026-09-20 ~14:00 UTC (3ᵉ compte) — faits nouveaux
- **Firecrawl : UUID courant `1e993196-5288-40f1-bf6f-0cb66830757d`** (précédent `6144e146-7ed5-4073-b7f2-864b9335f725`) ; 22 agents + CLAUDE.md global réécrits, sauvegarde `F:\MONARK SUITE\backup-2026-09-20\pre-firecrawl-uuid-2026-09-20\` ; effet au redémarrage de session.
- **memstack reconnecté** : la cause du 401 DCR était une entrée user-scope SANS header ; ré-enregistré avec `Authorization: Bearer` (lu depuis `F:\claude-memory\config\token`) + `X-Agent-Id` ; `claude mcp list` = Connected ; outils disponibles au redémarrage de session.
- Narabi créneau 09:30 UTC du 20/09 : `chainstack: true`, `exit_code: 0` (JOURNAL). Workers relancés : filtre U-4a (`--resume`), pli G0 Bell -b1-bis-i.
