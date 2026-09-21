# G7 — POOL-RPC-1a (pool RPC Ethereum révisé : retrait Blast/LlamaRPC, admission Pocket, ordre épinglé, concordance) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~12:50 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/pool-rpc-1a`, base `49e738b`, HEAD de lot `6ac398c`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **Oracle complet sur l'arbre FUSIONNÉ** (règle ADR-C01 complément) : `npm run ci` = `gate:vocab` OK (192 fichiers), typecheck 0, **663/663**, exit 0 ; `npm run lint` = 1 erreur **pré-existante** (`apps/bell/test/rebase-crosscheck.test.ts:600`, fusion b1a) ; `lint:ratchet` = 70/69 **pré-existant** (b1a). Ce lot n'ajoute ni erreur ni violation (mêmes chiffres qu'avant la fusion) ; les deux sont en résorption dans le lot b1b (déclarés, `error_origin` G7 b1a orchestrateur). Journal `scratchpad/ci-pool1a.log`.
- R-25 : `lot/etude-suite...lot/pool-rpc-1a` pathspec `ci.yml:65` = 435 + 34 = **469 ≤ 1 205** (11 fichiers).
- **Résolution de fusion (orchestrateur, déclarée)** : conflit sur `apps/sentinel/test/ukemi-record.test.ts:115-116` (HEAD : chemins portables `/tmp/…` posés par EXPORT-CLEAN ; lot : `F:/tmp/…` + `--concordance-out`). Première résolution « côté lot » refusée par l'oracle (garde de chemins Windows d'EXPORT-CLEAN : 2 tests rouges) ; résolution finale = chemins `/tmp/…` de HEAD + argument `--concordance-out "/tmp/conc.jsonl"` du lot. Interaction inter-lots attrapée par l'oracle, pas par une relecture — consignée.
- Ré-acceptation sur pièces (régime B) : **ACCEPTE** sur `6ac398c` (rejeu copie fraîche 567/567, 3 mutants d'ordre/CA-9 tués, R-25 469 ; C-1..C-6 levées, C-7 ci-dessous).
- Aucun appel réseau dans ce G7 (la sonde L-5 de 8 appels gratuits a été faite par l'orchestrateur le 21/09 04:44 UTC, bruts hors dépôt).

## Chaîne
G0 (`docs/G0-lot-pool-rpc-1.md`, checkpoint-1 `84c4df6`, escalade E-1 levée par la décision 106) → sonde L-5 (orchestrateur) → G1 (`5b9bc37`) → G2 séparée (`e982913`) ‖ checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (C-1..C-7) → pli par reprise + ADR (`6ac398c`) → ré-acceptation ACCEPTE → G7.

## error_origin (assigné, C-7)
C-G2-1 (ordre des fournisseurs non épinglé) worker G1 + plan/orchestrateur ; C-G2-2 plan + worker G1 ; C-G2-3 worker G1 ; C-G2-4 pré-existant + RENDU ; `CHANTIERS:409` (getLogs@B₀ sur 1 bloc présenté comme preuve d'archive) orchestrateur ; C-1 (ADR absent au G1) orchestrateur ; conflit de fusion `F:/tmp` : worker G1 (chemins non portables) — attrapé par la garde EXPORT-CLEAN.

## Registre et conditions (ADR-POOL-RPC-1 : PROPOSÉ → **ACCEPTÉ** à ce G7)
- L-1 (pool révisé) reste **WIRED à E-5**, jamais « built » avant la première ligne JOURNAL post-déploiement listant `pocket` sans `llama`/`blast`. L-4 (instrument concordance) : câblé CLI, aucun registre public.
- **SHA de fusion 1a nommé pour le journal E-5 = le commit de cette fusion** ; condition E-5 : `git merge-base --is-ancestor <sha-fusion-1a> <sha-E-5>` == 0 + critère C-8 ; 1a après E-5 ⇒ escalade (décision 92 = un seul redéploiement). E-5 attend aussi le lot `run.ts` (G0 à écrire).
- Débloqués : **GARDE-HELIUS-2** (Ukemi, après 1a corrigée) ; **U-4b-0** (consommer `@monark/rpc-guard`) ; **U-4b-1b** (prereg avec `--concordance-out`).
- Items formés (ADR) : `operators.ts` (a)/(b), `rpc.ts:87` (lot Narabi suivant), snapshot, `--exclude-operator` deux drapeaux, `--resume` HIT, RPS [2nd] procurement.
