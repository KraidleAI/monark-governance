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

## 5. État au dernier point (2026-09-19 ~03:30 UTC réel — horodatages antérieurs surestimés d'environ 5 h)
- Branche de travail : `lot/etude-suite` (HEAD `565e90c`+, poussée, repo privé `KraidleAI/monark-governance`) ; lots P1-b1/b2/b3 clos et fusionnés ; W-1 en cours sur `lot/w-1` (worktree `F:\Monark-wt-p1b1`).
- Sous-agents en cours (NE PAS basculer tant qu'ils tournent) : validateur checkpoint-2 W-1 (`3e0a150`) ; validateur checkpoint-1 ADR-M020 (`565e90c`).
- Suite prévue : G2 + checkpoint-2 W-1 → G7 → cartographie M018 D4 → rapport de passe P1 ; ADR-M020 Ukemi (plan) → checkpoint-1 → présentation investisseur ; puis lots T-1..T-3 témoin TSV.
- Décisions investisseur du jour : témoin TSV validé ; market making écarté ; lettre SEC 4-927 après T-1 ; Ukemi built + programme paroxysme ; Stocklana = option ultérieure, plan inchangé.
- Attentes investisseur : go annonce X « Day 1 » (non publiée) ; procurements §8 (2 reçus : Amini, Chow) ; fenêtre publique pour PR/miroir ; ratifications D-ADJ Shōgen et bFloor M002.
- Opérations : Narabi T=1 (prochain pas 00:39 UTC) ; Shōgen S2 driver vivant ; Caddy log D3 lecture 2026-10-18.

## 6. Interdits permanents (rappel)
Jamais « partner », « autonomous », « guarantee » nu, probabilité d'avoir raison ; jamais de secret dans le chat ; jamais de commit par un worker ; Opus 5 banni ; sci-bot oublié ; Higgsfield billing jamais.
