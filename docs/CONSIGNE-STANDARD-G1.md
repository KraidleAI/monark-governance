# CONSIGNE STANDARD G1 — exigences d'entrée de tout worker de code (MONARK, décision investisseur 122, 2026-09-21)

Objet : faire attraper AU G1 ce que les revues G2 / checkpoint-2 attrapent aujourd'hui en récidive (mesuré sur les 18 lots du 21/09 : 5 à 9 corrections par lot, presque toutes de la liste ci-dessous). Aucun gate n'est retiré : G2 ‖ checkpoint-2, pli, G2-delta, G7 sur l'arbre fusionné restent intégraux. Cette consigne est CITÉE par l'orchestrateur dans chaque mission G1 et le rendu porte une section « Consigne standard : point par point » (fait / n-a avec motif).

## A. Environnement et preuve
- A-1 Première ligne du rendu : « Modèle résolu : <id exact> » (R-1) ; stop si ce n'est pas `claude-opus-4-8…`.
- A-2 `node_modules` du worktree reconstruit par `F:\tmp\g2-garde2bi\mk-nm.ps1` (`@monark/*` → le worktree) ; `require.resolve('@monark/rpc-guard')` dans le rendu. Retrait : `rm-nm.ps1`, jamais `Remove-Item -Recurse`.
- A-3 Codes de retour capturés DIRECTEMENT (`cmd > log 2>&1; echo exit=$?`), jamais après un pipe ; oracle complet : `gate:vocab`, `typecheck`, `test` (compte pass/fail/skip), `lint`, `lint:ratchet`, `lang:gate`, `export:check`.
- A-4 `DELIVERED.sha256` (chemins relatifs au worktree, tous les fichiers touchés) ; rendu sous `F:\tmp\<lot>\` ; aucun commit (R-20) ; rien sur `C:` ; aucun réseau (fetch bouchonné, clés factices, hôtes `.invalid`).
- A-5 R-25 mesuré vs la base avec le pathspec VERBATIM de `.github/workflows/ci.yml:65` (docs exclus) ; > 1 150 ⇒ STOP + seam pré-déclaré, jamais un dépassement rendu.
- A-6 Invariants byte-identiques listés AVANT/APRÈS (sha) ; tout fichier du gel U-4b (`docs/adr/ADR-U4b-calibration-episode-frais.md` D4 + amendement) intact, sinon STOP + demande de consultation formée.

## B. Sécurité des secrets (récidives : 2a C-R-1, 2a C-R-3, 2b-i C-R-1, 1b C-2)
- B-1 Aucun texte libre d'un corps de réponse d'opérateur PAYANT dans un message/journal : indice à vocabulaire FERMÉ seulement (D6). Test nommé par opérateur payant (chainstack ET helius) — un mutant `paid = op === "<un seul>"` doit rougir.
- B-2 Expurger PUIS tronquer, sur tous les chemins ; test « clé à cheval sur la coupure ».
- B-3 Formes de la clé à couvrir : brute, userinfo, query, hex, base64, partielle, fractionnée — chaque forme non couverte est déclarée résidu à l'ADR (jamais tue).
- B-4 Lecture de clé : le code ne SONDE pas l'env (`env.X`, `env["X"]`, `"X" in env`, destructuration) hors du module allowlisté ; opérateurs et cycle = arguments CLI explicites, REQUIS sans défaut.
- B-5 Grep CI fail-closed : motifs `fetch(`, `node:http(s)`, `undici`, `child_process`, lecture de clé sous TOUTES les formes ; allowlist `Map<path,trigger>` avec non-vacuité PAR ENTRÉE + mutant « entrée retirée de la portée ».
- B-6 Hôtes : le label d'opérateur ne résout qu'un hôte ADMIS par la conformité des sources (`api.mainnet.solana.com`, pas `mainnet-beta`) ; test hôte + mutant.

## C. Identités et erreurs (récidives : 2b C-1, 1b C-1, 1b C-3)
- C-1 Une seule classe canonique par erreur (`RpcError`, `TransportError`, `BudgetExceededError`), ré-exportée, `instanceof` stable ; mutant « classe locale restaurée » rouge.
- C-2 Un refus de budget n'est JAMAIS réessayé ; test `*_budget_refusal_is_not_retried` + mutant.
- C-3 Une seule couche de retry ; 403/3xx/Retry-After conservés lors d'une migration (test par sémantique, mutant « redirect suivi »).
- C-4 Classifieurs (`isResultLimit`/`isPlanLimited`/`isRpcRevert`) importés de `classify.ts` ; test structurel « chaque alternative de regex ∈ `ERROR_HINT_TOKENS` » ; garde de code (3 / −32000) épinglée.

## D. Tests qui prouvent (récidives : 1b C-4 lock-test vacueux, b1b C-V-1, 2b-i C-G-1..3)
- D-1 Chaque test imposé a son mutant nommé ROUGE, rejoué par un harnais (`mutants.mjs` : mutation transitoire, test nommé, restauration byte-exacte par sha) ; un test sans mutant qui le tue est déclaré « déclaratif », jamais « couverture ».
- D-2 Un test vert sur une entrée vide/legacy n'est pas une preuve : vecteur synthétique NON vide, liste FERMÉE des clés attendues, valeur recomputée.
- D-3 Test d'intégration non-LLM de bout en bout par tuyau déclaré (seul `globalThis.fetch` bouchonné, pas de faux client) ; c'est lui qui autorise « branché » (règle Branchement) ; `built` seulement à la première course rapprochée.
- D-4 Aucune assertion affaiblie lors d'une adaptation (diff des tests annoté : + / − avec motif).

## E. Concurrence et état (récidives : 1d Q3, 2a lock)
- E-1 Verrou de cycle : `openSync("wx")` ; un verrou périmé (SIGTERM, crash) est DÉTECTABLE et récupérable, jamais un blocage définitif ; test + mutant.
- E-2 Ledger durable hors dossier de travail, parent pré-existant, jamais « reset-on-missing » (HELIUS-1).
- E-3 Cooldowns/backoffs déclarés à l'ADR avec leur valeur.

## F. Rédaction
- F-1 ADR : chaque pièce livrée a sa ligne « Tuyaux » (entrée / sortie / état / test) ; aucun renvoi vers `F:\tmp` (sources en dépôt seulement) ; résidus nommés avec déclencheur.
- F-2 ASCII dans les sources ; `gate:vocab` propre (le mot `score` nu compris) ; aucune clé réelle, même factice ressemblante.
- F-3 Déviations D-n déclarées au rendu, jamais un contournement ; blocage ou double échec ⇒ demande de consultation formée (R-26).

Amendements : par ligne datée ci-dessous, à chaque récidive nouvelle relevée en G2/checkpoint-2.
- 2026-09-22 — **G-1 (orchestrateur et rédacteurs de G0)** : tout plan ou ruling touchant une pièce PUBLIQUE (outil servi, liste d'outils, registre `built`/`upcoming`, README, skill, site, export) relit d'abord les décisions investisseur qui la nomment (`grep -n "<pièce>" docs/CHANTIERS.md`) et les cite. Récidive fondatrice : ruling U-4b-2 contre la décision 51, attrapé par le checkpoint-1.
