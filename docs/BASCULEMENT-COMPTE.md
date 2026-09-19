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
1. `F:\Monark\docs\CHANTIERS.md` — tableau de bord des chantiers (P1/W-1, Ukemi ADR-M020, témoin TSV, opérations, items formés, règles apprises).
2. `Downloads\MONARK SUITE\backup-2026-09-18\REPRISE.md` — journal de reprise horodaté.
3. `Downloads\PRODUITS\etude-2026-09-19\DECISIONS-investisseur-2026-09-19.md` — décisions verbatim.
4. `F:\Monark\docs\JOURNAL-PROVENANCE.md` — journal G1..G7.
5. `F:\Monark\docs\biblio\ukemi-modeL\` — biblio, avis, mesures Ukemi.

## 5. État au dernier point (2026-09-19 ~08:50 UTC, horloge système) — BASCULE PRÉPARÉE
**Ordre investisseur : « ne relance pas de sous-agents, prépare le terrain pour l'autre abonnement ».** Deux sous-agents étaient encore en vol au moment de la préparation ; ils meurent avec la session, leurs prompts sont recopiés en §5.4 pour relance à l'identique.

### 5.1 Dépôt
- Branche de travail `lot/etude-suite`, HEAD **`4fc50af`**, poussée sur `KraidleAI/monark-governance` ; `main` privé = `144ce68` (pile #78-#87 fusionnée ce matin) ; miroir public `KraidleAI/Monark` = `5bde13a` (restyle B, validé investisseur « tout est bon » ; site sur VPS, PAS Vercel).
- Oracle sur `lot/etude-suite` après les deux fusions du jour : 292/292, lint 0, ratchet 69/69, lang-gate / export:check OK.
- Sauvegardes : `C:\Users\KACIMI\Downloads\MONARK SUITE\backup-2026-09-18\` (CHANTIERS, journal, décisions, ce fichier).

### 5.2 Lots — état exact
| Lot | Branche / worktree | Gel | État | Prochaine action |
|---|---|---|---|---|
| R-25-séries | `lot/r25-series` / `F:\Monark-wt-r25` | `e58d2c1` | **CLOS**, fusionné `f4428b4` | rien (worktree supprimable) |
| E-bon-marché | `lot/e-bon-marche` / `F:\Monark-wt-ecart` | `16cd39e` | **CLOS**, fusionné `4ffe553` | rien (worktree supprimable) |
| U-1a Ukemi | `lot/u-1a` / `F:\Monark-wt-p1b1` | `9f3af85` (code = `1e7bb7e`, G1 §5b docs) | gelé ; **G2 fraîche EN VOL (perdue à la bascule)** | relancer la G2 (prompt §5.4-A) → persister `docs/G2-lot-u1a.md` AVANT checkpoint-2 → plier → checkpoint-2 → G7 → `git merge --no-ff lot/u-1a` sur `lot/etude-suite` |
| T-1a Bell | `lot/t-1a` / `F:\Monark-wt-bell` | `9204435` | G2 pliée + ADR-B0 amendé ; G2 persistée `docs/G2-lot-t1a.md` ; **checkpoint-2 EN VOL (perdu à la bascule)** | relancer le checkpoint-2 (prompt §5.4-B) → plier → G7 → merge après U-1a |
| U-1b-a AttestedBook | à créer | — | ADR-U1b `b60201d`, (A)/(B) tranchés (décision 20) | après G7 U-1a : worktree neuf depuis `lot/etude-suite`, worker Opus 4.8 max |
| T-1a-ii | à créer | — | ADR-B0 amendement O-5 | après G7 T-1a : ADR de lot + checkpoint-1 |

### 5.3 Ordre de fusion restant
U-1a → T-1a sur `lot/etude-suite` (E-bon-marché et R-25 sont déjà dedans). Conflits prévisibles à la fusion T-1a après U-1a : `vocab-banned.json`, `scripts/grep-forbidden.mjs`, `package.json` (les deux lots ajoutent un scope vocab et un glob de test) — garder les DEUX additions. Puis PR `lot/etude-suite` → `main` privé à la fenêtre investisseur (sans `--delete-branch` sur une pile), puis miroir public via `release-public.mjs` depuis `F:\Monark-wt-main` (`git pull` d'abord).

### 5.4 Prompts des sous-agents à relancer (copier tel quel)
**A — G2 fraîche U-1a** : `Agent(subagent_type: worker)`, run_in_background — « Relecture G2 (réviseur ≠ générateur, contexte frais) du lot U-1a (ADR-M020 / ADR-U1 recorder book de liquidation Aave v3), dépôt MONARK, worktree `F:\Monark-wt-p1b1`, branche `lot/u-1a`, gel `9f3af85` (code byte-identique à `1e7bb7e`, base `58fe309`). Modèle résolu en tête (`claude-opus-4-8`). Jamais de git en écriture ; mutations en copie `git archive` + `npm ci` (jamais de jonction node_modules). Lire ADR-U1 (D1-D9), ADR-M020 D2 (interdits cascade / Λ = 0 / garantie), `docs/G1-lot-u1a.md` (§5 offline `034fbff9`, §5b live fenêtre bornée [23543087, 23545087] digest `d35df289`), code `apps/sentinel/src/ukemi/{abi,wadray,clusters,rpc2,book,record}.ts`, `apps/sentinel/test/ukemi.test.ts` (11 tests), fixture `apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json`, `vocab-banned.json` (scope sentinel + exemptPhrases `cascade`), `scripts/grep-forbidden.mjs` ; `apps/sentinel/src/rpc.ts` doit être intact. Oracle 300/300, lint, ratchet 69/69, lang-gate, export:check, tsc ; R-25 avec la commande exacte de la gate (≈957 annoncé) ; règle R-25-séries : la fixture ukemi doit être déclarée + hachée LF sur la même ligne d'un `PROVENANCE-*.md` du même dossier — sinon correction. Mutants : bloc B±1, source oracle, compte omis, balance nulle, chaîne timeline, vocab cascade inséré, sélecteur keccak altéré, percentMul demi-bas (HF `+274302`/`−458155`), quorum divergent ⇒ abstention, `asHex` vide ⇒ rejet, `description()` reverté toléré, un seul fournisseur ⇒ `no_quorum`. Juger l'exemption vocab `cascade` (bornée ?), la regex D8 `r.f.rence`, la fixture réelle et reproductible, la fenêtre bornée déclarée honnêtement comme sous-ensemble, ADR-U1 D1-D9 point par point, décision 19 (à fermer avant release Ukemi), branchement M018 (upcoming, rien de servi). Rendre verdict, table corrections (fichier:ligne, défaut, correction, error_origin), table mutants, observations formées. Zéro dû nu. »

**B — Checkpoint-2 T-1a** : `Agent(subagent_type: validateur-humain)`, run_in_background — « Checkpoint-2 (livrable) lot T-1a Bell (ADR-B0 ; décisions 1-3, 10-14, 19), worktree `F:\Monark-wt-bell`, branche `lot/t-1a`, gel `9204435` (base `58fe309`). Lecture par SHA ; Bash vérification seule ; copies `git archive`. Pièces : ADR-B0 (D1-D9, DoD, ESC-1 (c) close jamais publié ; deux amendements orchestrateur 2026-09-19 en fin de fichier : O-1 census/MWCB, O-3 « 47 % » retiré, O-5 scission T-1a-i/ii, O-6, racine R-25), `docs/G1-lot-t1a.md`, `docs/G2-lot-t1a.md` (C-1..C-7, O-1..O-8), code `apps/bell/src/*.ts`, `apps/bell/test/bell.test.ts` (18 tests), fixture `halts-reduced.csv`, racine `package.json`/`tsconfig.json`/`vocab-banned.json`/`grep-forbidden.mjs` ; sources `Downloads\PRODUITS\etude-2026-09-19\sources-T1`. CA-1..CA-11 + AM-1 : (1) oracle 307/307, tsc, lint, ratchet, lang-gate, export:check, gate:vocab, R-25 commande de la gate (1017 avant amendement) ; (2) rejouer C-1 (fériés, sam 2026-07-04 → jeu 07-02), C-2 (.sort), C-3 (refPrice), C-4 (gT=0 réintroduit), C-7 (borne basse), close écrit ⇒ rouge, graphie hors-18 ⇒ REASON_UNKNOWN ; (3) recompute CSV 73 431 / 4 539 / 18 / 61 747 / recensé-15 = 0 ; (4) ESC-1 (c) ; (5) juger `closeRef ≤ 0` lève (portée worker) et la scission O-5 vs « produit full fini » (décision 10) ; (6) CA-11 upcoming, aucun registre touché ; (7) cohérence amendements/G1 (Ondo 100+/430+ vs 395 ; ETF ×5 ; item (g)) ; (8) racine R-25 bell reportée à T-1a-ii : acceptable ? ; (9) merge-tree avec `lot/etude-suite` HEAD et `lot/u-1a` `9f3af85`. Rendre ACCEPTE / corrections / ESCALADE ; modèle résolu `claude-fable-5-1`. »

### 5.5 Décisions investisseur du jour (fichier DECISIONS, points 1-20)
… 18 lecture M018 D4 (b) ; **19 release gate zéro dette** (tous les items formés bloquent la prochaine release) ; **20 ADR-U1b (A) témoin total + (B) motif M017 par classe, par délégation**. ADR-M013 (T0/T1/T2 vitrine) réaffirmé, lots site pré-classés.

### 5.6 Attentes investisseur (à son rythme)
Clé Helius (`setx HELIUS_API_KEY`, course fondatrice Bell) ; PDF Gatto SSRN 7157638 ; VPS Bell (spec ADR-B0 D8) ; ratifications journal.jsonl Shōgen et bFloor M002 (bloquantes release, décision 19) ; go pour annonces X ; fenêtre publique suivante après fusion U-1a/T-1a.

### 5.7 Règles apprises aujourd'hui (déjà dans CHANTIERS §F)
G2 sur disque AVANT tout checkpoint-2 ; jamais `--delete-branch` sur une pile de PR ; re-sha G1 dans le même commit qu'un pliage ; lire le vérificateur avant de ratifier un tuyau vers un contrat gelé ; le site est sur le VPS (RUNBOOK-vitrine), pas Vercel.

## 6. Interdits permanents (rappel)
Jamais « partner », « autonomous », « guarantee » nu, probabilité d'avoir raison ; jamais de secret dans le chat ; jamais de commit par un worker ; Opus 5 banni ; sci-bot oublié ; Higgsfield billing jamais.
