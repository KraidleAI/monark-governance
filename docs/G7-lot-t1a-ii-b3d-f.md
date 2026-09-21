# G7 — Bell T-1a-ii-b3d-f (condition (f) : le ledger chaîné du crosscheck ENGAGE le payload de page) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 16:06 UTC (`date -u`). Fusion `--no-ff` **`1fc89a9e5d7d191b28565500fa0233ac97ab99fd`** sur `lot/etude-suite` (branche `lot/t-1a-ii-b3d-f`, G1 `291d389`, plis TEST SEULS `85d4db6` et `e453680`, docs G7 sur la branche). **Ce SHA est le « sha de fusion » qui tient la condition (f) du G0-b `:239`.**

## Vérifications de l'orchestrateur (exécutées sur l'arbre FUSIONNÉ)
- `npm run ci` exit 0 : **712 tests / 711 pass / 0 fail / 1 skip pré-existant** ; `npm run lint` exit 0 ; `lint:ratchet` **69/69**. Journal `scratchpad/ci-b3df.log`.
- R-25 (pathspec `ci.yml:65`, mesuré) : 207 + 48 = **255 ≤ 1 205** (2 fichiers de code).
- sha256 de `apps/bell/src/rebase-crosscheck.ts` sur l'arbre fusionné = `2c852f0c98f9c6b90b869826ea9a04cbe78fce612b35f5a8f2bf68e8ae69fdb2` = sha du checkpoint-2, de la ré-acceptation, de la G2, de la G2-delta et du constat final (aucun pli n'a touché le source).
- §2 du PLI : `7071484f…7867` recomputé par moi AVANT l'amendement, APRÈS l'amendement et APRÈS la résolution de fusion — inchangé.
- **Résolution de fusion (orchestrateur, déclarée)** : conflit « ajout en fin de fichier des deux côtés » sur `docs/PLI-lot-t1a-ii-b3d.md` (HEAD : Amendement 3 committé seul ; lot : Amendement de format n°2). Résolution = les DEUX textes, Amendement 3 d'abord (antérieur), sans toucher une ligne de l'un ni de l'autre. Docs seuls, aucun code en conflit.
- Chaque commit d'un rendu de worker confronté au sha annoncé et à `git show --stat` avant annonce (ADR-C01 complément 2).

## Chaîne
G0 + checkpoint-1 (`c83ff2e`, option A) → G1 (`291d389`) → G2 séparée ‖ checkpoint-2 (régime B) : **même trouvaille centrale trouvée indépendamment** (le test ne pouvait pas distinguer un mutant « deux côtés ») → pli test seul `85d4db6` (vecteur littéral) → ré-acceptation **ACCEPTE** (liste résiduelle fermée, due au G7) → G2-delta PASS-AVEC-CORRECTIONS (C-G2-DELTA-1 : le vecteur à 1 événement n'épingle pas l'ordre) → pli test seul `e453680` (vecteurs à deux événements non triés et à deux handoffs non triés) → constat final G2 **PASS** (`docs/G2-DELTA2-lot-t1a-ii-b3d-f.md` : trois hex re-mesurés hors helper, MINE-1..4 rouges, oracle vert) → docs G7 → G7.

## Liste résiduelle du validateur — soldée dans ce SHA
1. PASS de la G2 séparée : tenu (G2, G2-delta, constat final persistés).
2. **Amendement de format n°2** (`docs/PLI-lot-t1a-ii-b3d.md`) : les 9 points + la limite « re-hachage complet » + §2 recomputé + les hex de référence (trois vecteurs). Notes datées au G0-b (M-b1a-7/9 inversés ; (f) tenue). ADR-T1aii **D1-octies** (le G0 disait « D1-quater », nom déjà pris : écart de nommage déclaré).
3. C-V-3 : item formé, déclencheur nommé **GARDE-HELIUS-1b** (`ledger-format-lock.test.ts:16-17`, `RefMod` arité 5, `[], []`).
4. C-V-4 / C-F-4 : l'ancrage externe par page reste une **ESCALADE-INVESTISSEUR au G0 de la course** (il mord dès le premier record) — non tranché ici, porté sur la fiche de GO de course.
5. Ré-acceptation persistée dans `docs/CHECKPOINT2-lot-t1a-ii-b3d-f.md`.

## Ruling orchestrateur
Le vecteur 2 du pli `e453680` (deux handoffs non triés) dépasse les objets exacts de la G2-delta : GARDÉ, c'est le seul tueur du mutant de tri des handoffs (un handoff unique ne peut pas épingler un ordre). Déviation déclarée par le worker, confirmée par le constat final.

## Tuyaux (règle Branchement)
Entrée : pages tirées par le CLI crosscheck. Sortie : `ledger-<MINT>.jsonl` → `resumeFromLedger` et artefact `crosscheck-<MINT>.json`. État : `<out>/` hors dépôt. Preuve : `bell_crosscheck_resume_refuses_edited_payload` (composition `runMain`) + `…rederives_committing_page_payload`. **Registre** : le crosscheck et Bell restent `upcoming` (décision 117 : Bell = temps 2 ; aucune course tirée).

## error_origin
Trou de test « mutant deux côtés » : worker G1 + plan (le G0 ne demandait pas de valeur littérale) ; vecteur à 1 événement là où la correction demandait deux événements non triés : worker du premier pli ; C-V-3 (consommateur `rpc-guard` non vu) : orchestrateur ; nommage « D1-quater » : plan ; amendement de format rédigé après le code : conforme au plan (la spéc option A du G0 précédait le code), déclaré dans l'amendement.

## Suite (temps 2, Bell)
a1-bis (pli final en cours) → GARDE-HELIUS-1b (CONV-2, `RefMod`, phantom-fresh) → G0 de la course (C-F-4 + plafond ~5,4 M cr : questions investisseur, hors portée de la décision 119).
