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

## 5.8 Repères pris sur le nouveau compte (2026-09-19, session Fable 5.1 ouverte dans F:\Clawpumptech puis basculée sur F:\Monark)
- Check-list INVENTAIRE §7 rejouée : MCP user-scope 6/6 Connected (memstack répond) ; Claude Docs / Blockscout / Firecrawl Connected ; plugins 6/6 ; `POLYGON_API_KEY` 32 car. (scope User), `HELIUS_API_KEY` absente ; agents épinglés conformes ; `advisorModel = claude-fable-5-1` ; dépôt conforme à §5.2.
- **Écart mesuré** : Firecrawl n'exposait AUCUN outil dans cette session (ni `mcp__8aa0cccf…` ni autre nom) — session ouverte avant le changement de répertoire. Décision investisseur : **redémarrage** dans `F:\Monark`. Mémoire memstack uid `ab9314ff`.
- **À faire au redémarrage, avant §5.4-A** : `ToolSearch "+8aa0cccf"` — si vide, chercher `firecrawl` ; si l'UUID a changé, mettre à jour les 9 agents `~/.claude/agents/*.md` (`tools:`) + CLAUDE.md global §memstack/firecrawl, puis lancer A.
