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

## 7.0 Session à reprendre
- Projet : `F:\Monark` (branche `lot/etude-suite`). Transcript local de la session courante : `C:\Users\KACIMI\.claude\projects\F--Monark\0b28054b-ca58-4cf1-820c-991d31d99595.jsonl` (lisible par le nouveau compte : même machine).
- Reprise sur le nouveau compte : app desktop (Code), projet `F:\Monark`, **nouvelle session** (l'ancienne appartient à l'autre compte). Premier message : « reprends depuis `F:\MONARK SUITE\BASCULEMENT-COMPTE.md` §7 et `F:\Monark\docs\CHANTIERS.md` ; investisseur = KACIMI ; règles CLAUDE.md global ». Le résumé de contexte n'est pas transféré : tout ce qui compte est dans les fichiers.
- Rôles et modèles (inchangés) : orchestrateur Fable 5.1 `claude-fable-5-1` effort high ; workers Opus 4.8 `claude-opus-4-8` max (agent `~/.claude/agents/worker.md`, jamais le tier nu `opus`) ; lecteurs/chercheurs Sonnet 5 max ; validateur-humain Fable 5.1 high ; advisors Fable 5.1 medium ; Opus 5 banni.

## 7.1 Conservé en local (indépendant du compte)
- `~/.claude/CLAUDE.md` global et `~/.claude/agents/*.md` (9 agents). **Sauvegarde du jour** : `F:\MONARK SUITE\backup-2026-09-20\{CLAUDE-global.md, agents\, CHANTIERS.md, BASCULEMENT-COMPTE.md}`.
- `settings.json` : `advisorModel = claude-fable-5-1`.
- MCP user-scope : memstack (127.0.0.1:8848 ; en échec 401 « Dynamic Client Registration » depuis la reprise du 20/09 : à re-enregistrer, non bloquant), arxiv, openalex, semantic-scholar, claude-mem. Firecrawl = connecteur claude.ai, **UUID courant `6144e146-7ed5-4073-b7f2-864b9335f725`** (porté par les 22 agents et le CLAUDE.md global). **Sur le 3ᵉ compte : vérifier l'UUID par `ToolSearch firecrawl` avant tout lecteur/chercheur ; s'il change, mettre à jour les 22 agents + CLAUDE.md.**
- Variables d'environnement User (valeurs jamais dans le chat ; contrôle par longueur) : `HELIUS_API_KEY` (36), `POLYGON_API_KEY` (32, Massive Stocks Starter), `DATABENTO_API_KEY` (32, préfixe `db-`), `CHAINSTACK_{SOLANA,ROBINHOOD,BSC,BASE,ETH}_URL` (72-78), `TMP/TEMP/TMPDIR = F:/tmp`. Règles : **rien sur C:** ; scratch sous `F:\tmp\…` ; `npm --cache F:/tmp/npm-cache` ; Pillow dans `F:\tmp\pylib` (`PYTHONPATH`) ; Chrome headless profil `F:\tmp\chrome-prof`.
- Abonnements actifs : Helius Developer (10 M crédits/mois, cycle 19 sept → 19 oct ; ≈ 9 000 consommés), Chainstack Growth (20 M RU, 4 593 consommés ; renouvellement avant le 19 oct), Massive Starter, Databento usage-based (0 $ engagé, 125 $ crédits). Hostinger : VPS site `31.97.155.188` (harness + vitrine + Narabi) et **VPS Bell KVM 2 `178.16.131.29`** (Ubuntu 26.04, Caddy, Node 24, ufw, clé SSH `monark-deploy` ; DNS `bell.` non posé, services Bell non déployés : T-1b).
- SSH orchestrateur : `ssh -i ~/.ssh/monark_vps root@31.97.155.188` et `root@178.16.131.29` (clé locale conservée).
- Claude in Chrome : extension installée, appairée au compte courant. **À ré-appairer sur le 3ᵉ compte** (panneau latéral Claude dans Chrome, connexion avec le nouveau compte, puis `list_connected_browsers`). Navigateur interne : Cloudflare bloque Hostinger/Databento ; l'investisseur passe le challenge lui-même.

## 7.2 À refaire sur le nouveau compte
1. Connecteurs claude.ai : Firecrawl (vérifier l'UUID, 7.1), Claude Docs ; Higgsfield/Vercel/Origin non nécessaires.
2. Appairer Claude in Chrome (7.1).
3. `claude mcp list` (memstack) ; si 401 persiste : item non bloquant, consigner.
4. Premier worker lancé : contrôle R-1 du modèle résolu (`claude-opus-4-8` attendu).

## 7.3 Règles de bascule
Basculer quand **aucun sous-agent ne tourne** (ils meurent avec la session ; leurs fichiers sur disque restent, chaque worktree garde son état, cf. 7.5) ; avant : écrire l'état ici ; après : redémarrage = prise d'effet des frontmatters ; **deux chantiers en parallèle toujours** (décision 49) ; un seul `npm run ci` complet à la fois (§F) ; `gate:vocab` par tout pli/G2 delta (§F-gate-vocab) ; prereg committé seul avant tout worker qui tire des données (règle U-3 C-V-3).

## 7.4 État du dépôt à l'écriture
- `F:\Monark` `lot/etude-suite` HEAD **`bfcb2bc`** (voir `git log -1`), arbre propre. Oracle du dernier G7 : **425/425** (U-3) ; Bell -b3a apportera +7, NARABI-OPS-1 +6.
- Fusionnés le 20/09 : CRA-B `9abf532`, Bell -b1 `7467023`, U-2a `58596b6`, U-3 `06de941` (G7 : `docs/G7-lot-{cra-b,t1a-ii-b1,u2a,u3}.md`).
- **Non poussé** : `lot/etude-suite` n'est pas poussé sur `KraidleAI/monark-governance` depuis le 19/09 (fenêtre publique investisseur) — pousser à la prochaine fenêtre. Miroir public `KraidleAI/Monark` inchangé.

## 7.5 Lots en vol — état exact et prochaine action
| Lot | Worktree / branche | Gel | État | Prochaine action (prompts 7.6) |
|---|---|---|---|---|
| **Bell -b3a** | `F:\Monark-wt-bellb3a` / `lot/t-1a-ii-b3a` | **`1925736`** (livraison `c94e8f0`, plis `f0f8e61`, `1925736`) | **G2 fraîche EN VOL** (rapport attendu `docs/G2-lot-t1a-ii-b3a.md` dans le worktree) | si le fichier G2 existe : committer, plier ses corrections (pli -b3a-4 si code), checkpoint-2, G7 (oracle complet attendu 432/432 sur le worktree), fusion `--no-ff`, puis G0 **-b3b** (séance/halts/MWCB/clôture Databento EQUS.SUMMARY, décision 53) ; sinon relancer la G2 (7.6-A) |
| **NARABI-OPS-1** | `F:\Monark-wt-narabiops` / `lot/narabi-ops-1` | **`9bf7c2d`** (gel `ef1cd42` + G2 ACCEPTÉ) | **checkpoint-2 EN VOL** (avis attendu `F:\tmp\cp2-nops\CHECKPOINT2-lot-narabi-ops-1.md`) | si l'avis existe : copier dans `docs/`, plier C-V, G7 (427/427 sur le worktree), fusion ; **déploiement** ensuite (runbook : timer 4 créneaux, `EnvironmentFile` `/etc/monark/sentinel.env` posé via stdin SSH depuis `CHAINSTACK_ETH_URL` + sha256 des deux côtés, jamais `cat`), premier run consigné en JOURNAL ; puis pli **NARABI-OPS-1b** (sonde externe sur le VPS Bell + alerte mail, décision 58 ; relais SMTP à choisir par l'investisseur) ; sinon relancer le checkpoint-2 (7.6-B) |
| **U-4a** | `F:\Monark-wt-u4a` / `lot/u-4a` | base `b1302db` (prereg `6ac8d4a`, sha LF `9209cdab…`) | **worker G1 EN VOL** : A-1 offline, puis **sonde**, puis il s'arrête et attend « go course » | vérifier `git status` du worktree, `F:\tmp\u4a\`, `F:\PRODUITS\etude-2026-09-20\u4-raws\` ; lire la sonde (N détenteurs, appels projetés, durée) dans `docs/PLI-lot-u4a.md` ; si ≤ 300 000 appels et ≤ quota Chainstack (20 M RU − 200 000) : relancer le worker avec « go course » + état partiel (7.6-C) ; ensuite G2 fraîche (offline + re-tirage ≥ 3 comptes / 3 updates), checkpoint-2, G7, fusion ; puis **G0 U-4b** (outil `book` remplace `cascade` dans le même commit, re-pin h5, surfaces ; C-8/C-9 du checkpoint-1 U-4 : union `attested`, pas d'alias) ; puis **U-4c** (classe cluster-shortfall, décision 61 provisoire) |
| Ukemi U-5/U-6/U-7 | — | — | après U-4 | U-6 = `/ukemi/` sur le VPS harness (décision 57) |
| Bell -b1-bis, -b2a, -b2b, T-1b | — | — | après -b3b | -b1-bis = course fondatrice sur pools 2025 (décision 47 SPLIT) ; T-1b = site Bell charte C, logo 01 (décision 64), données du board (décision 63), servi en local d'abord (décision 46) ; design en pause jusqu'à fin backend (décision 63) |
| Cartographie totale, CI-site (+ 42(f′) + lacune R-25 `series/**/*.md`), K-1, release | — | — | fin de produit | ordre décision 46 |

Worktrees anciens (lots clos, supprimables sans perte, branches fusionnées) : `wt-atelier, wt-bell, wt-bell2a, wt-devops, wt-e*, wt-export, wt-f*, wt-gov, wt-hatt, wt-hikae, wt-kratchet, wt-p1b1, wt-preview, wt-r25, wt-restyle*, wt-u1ahard*, wt-u1b, wt-u1bb, wt-ukemi*` (`git worktree remove <chemin>` puis `git branch -d`). Garder `wt-main`.

## 7.6 Prompts à relancer (résumés ; consignes détaillées = G0 de chaque lot + amendements)
- **A — G2 fraîche Bell -b3a** : `Agent(worker)` — « relecteur G2 fraîche lot T-1a-ii-b3a, worktree `F:\Monark-wt-bellb3a` gel `1925736` base `3315ea7` ; plan `docs/G0-lot-t1a-ii-b3.md` + C-1..C-12 ; PLI `docs/PLI-lot-t1a-ii-b3a.md` ; décisions 55/56/60 ; lecture `docs/biblio/bell/L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md` ; vérifier règle `>=`, deux décodeurs, C-3 oracle d'état bit-à-bit sur 4 séries, C-7 direction g_t (VWAP_raw / m), résiduels requis sur `trajectory_known`, secrets 0, mutants ≥ 6 + M-r1/M-r2, oracles + `npm run ci` une fois, R-25 ≤ 1 205 (annoncé 1 159), CA-11 ; écrire `docs/G2-lot-t1a-ii-b3a.md` ».
- **B — Checkpoint-2 NARABI-OPS-1** : `Agent(validateur-humain)` — « checkpoint-2 lot NARABI-OPS-1, worktree `F:\Monark-wt-narabiops` HEAD `9bf7c2d`, base `eac7eea` ; dossier G0 + C-1..C-11, PLI, G2 (ACCEPTÉ, OBS-1..5), ADR, RUNBOOK ; rejeu à froid ; ≥ 3 mutants dont URL brute dans la ligne et exit 0 forcé ; recompute `lineHashOf` 2026-09-19 `f73c700642…` ; pas de `npm run ci` complet ; juger C-1..C-7, OBS, R-25 423, CA-11, plan de déploiement vs décision 46 ; déposer `F:\tmp\cp2-nops\CHECKPOINT2-lot-narabi-ops-1.md` ».
- **C — Reprise worker U-4a** : `Agent(worker)` — « reprends le lot U-4a dans `F:\Monark-wt-u4a` (état partiel : `git status`, `F:\tmp\u4a\`, bruts `F:\PRODUITS\etude-2026-09-20\u4-raws\`) ; plan `docs/G0-lot-u4.md` + amendement C-1..C-13 ; prereg `docs/PLAN-u4-prereg.md` sha `9209cdab…` ; **go course** sous plafond 300 000 appels et `--max-calls`/`--resume` ; livrables A-1..A-8 ; oracles + `npm run ci` une fois ; PLI + ADR-U4 ». Si la sonde n'a pas été faite : relancer le prompt G1 complet (CHANTIERS « REPRISE DE SESSION » + G0).

## 7.7 Ratifications investisseur dues (non bloquantes)
Décision 60 (Bell : scan d'autorité au lieu du full-mint, mesuré 2 900× moins cher) ; 61 (classe cluster-shortfall en U-4c après U-4b). Items investisseur : relais SMTP + adresse destinataire pour l'alerte mail (NARABI-OPS-1b) ; renouvellement Chainstack avant le 19 oct ; entrée MCP Registry `tech.monarkgate/monark` à mettre à jour à U-4b ; prochaine fenêtre publique (push `lot/etude-suite`, PR en série).

## 7.8 Décisions du jour (verbatim dans CHANTIERS) — 46 → 64
46 test local / cartographie / zéro dette ; 47 Bell option (a) SPLIT ; 48 SECURITY.md 72 h / 90 j ; 49 Ukemi-perps chantier formé + deux chantiers en parallèle ; 50 délégation ; 51 Ukemi reste built, `cascade` retiré dans la même fusion que son remplaçant, 4 outils ; 52 juriste GO (interne, jamais en release) ; 53 Databento usage-based EQUS.SUMMARY ; 54 VPS Bell KVM 2 ; 55/56 course -b3a option 2 puis 10 % ; 57 Ukemi sur VPS harness ; 58 alerte mail ; 59 skip description intérimaire ; 60 (orch.) scan d'autorité ; 61 (orch., provisoire) U-4c ; 62 design en revue légère ; 63 landing = données du board, design après backend ; 64 logo 01.

## 7.9 Interdits (rappel)
Jamais de secret dans le chat ni le dépôt (contrôle par longueur) ; jamais lire le DOM d'une page portant une clé ; jamais un commit par un worker ; Opus 5 banni ; jamais « verified / guarantee / score » sur une surface publique ; jamais de download sans permission ; jamais de contournement d'un CAPTCHA ; jamais d'action sortante (DNS, PR publique, mail) sans go.
