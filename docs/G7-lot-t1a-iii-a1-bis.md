# G7 — Bell T-1a-iii-a1-bis (univers : ledger chaîné persisté par page, sonde de fin après le brut, durcissement de lecture, assainisseur, verrou réseau, drains) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 16:30 UTC (`date -u`). Fusion `--no-ff` **`780a6312573759df50b3e9db18fcab0b3c284805`** sur `lot/etude-suite` (branche `lot/t-1a-iii-a1-bis`, base `4f81f67`, G1 `9992e5b`, plis `72b3cb9` puis `e1a6ec9`, docs G7 sur la branche) + correctif d'interaction de fusion **`138df67`**. L'état accepté est `138df67`.

## Vérifications de l'orchestrateur (exécutées sur l'arbre FUSIONNÉ)
- **Premier oracle ROUGE, attrapé par la règle ADR-C01 complément 1** : `npm run ci` exit 2 — `apps/bell/test/universe.test.ts(306,21): error TS2554: Expected 5 arguments, but got 3`. Cause : interaction inter-lots — le test 8d (C-3, « format byte-identique au calque -b3d ») appelle `chainedLedgerEntry` du crosscheck, dont le lot -f (`1fc89a9`, fusionné 25 min plus tôt) a porté l'arité à 5 et le core à dix champs. Chaque lot était vert seul. **Résolution orchestrateur déclarée (`138df67`, TEST SEUL, 2 lignes)** : appel en arité 5 avec payload vide `[], []` ; `payload_sha256` ajouté en dernier au core comparé. Intention du test inchangée (discipline de hachage identique au calque ; un hachage `canonical()` à clés triées rougit toujours).
- **Oracle final sur `138df67`** : `npm run ci` exit 0 — **720 tests / 719 pass / 0 fail / 1 skip pré-existant** ; `npm run lint` exit 0 ; `lint:ratchet` **69/69** ; 0 occurrence de `UV_HANDLE_CLOSING` dans ce run. Journal `scratchpad/ci-a1bis.log`.
- R-25 (pathspec `ci.yml:65`, mesuré sur la fusion) : 670 + 51 = **721 ≤ 1 205** (12 fichiers).
- **`npm run lint` rejoué par moi sur le pli final AVANT commit** (exit 0, code de retour capturé directement) : le rendu précédent du worker déclarait « lint exit 0 » en lisant le code de retour de `tail` derrière un pipe ; la G2-delta a mesuré exit 1 (C-VD-1).
- **Constat des quatre ex-survivants du validateur, rejoué par moi** avec SON harnais (`F:\tmp\cp2-a1bis\replay\mutants-v2.mjs` re-pointé sur un `git archive e1a6ec9`, `F:\tmp\g7-a1bis\`) : V1b (persist du `finally` de sonde retiré) ROUGE ; V2b (avalement `RedirectBlockedError` retiré) ROUGE ; V2e (`transport_error` → re-jet) ROUGE ; V2f (brut sauvé APRÈS la sonde) ROUGE ; `universe-cli.ts` restauré `03ca162d…` après chacun. C'est la clôture prescrite par le validateur pour sa C-R-1 (pas de re-passage).
- Rendus de worker confrontés à leurs listes sha (`final-sha-v2` 12/12, `final-sha-v3` 12/12) et à `git show --stat` avant annonce.

## Chaîne
G0 + checkpoint-1 (C-1..C-13) → G1 (`9992e5b`) → G2 séparée ‖ checkpoint-2 (C-V-1..6 ; C-G2b-1..6) → pli `72b3cb9` → G2-delta PASS-AVEC-CORRECTIONS (**C-VD-1 bloquante** : lint cassé par le pli) ‖ ré-acceptation ACCEPTE-AVEC-CORRECTIONS (C-R-1..4 non bloquantes) → pli final `e1a6ec9` → constats orchestrateur (lint, 4 mutants) → docs G7 (C-R-3) → fusion → correctif d'interaction → G7.

## Corrections du validateur — soldées
- C-R-1 : quatre assertions tueuses (8e, 12b) — constat ci-dessus. C-R-2 : « relance LOCALE Windows seulement, aucun retry en CI » ; le validateur a LU la signature, il ne l'a pas reproduite (la G2 l'a reproduite, 1/30). C-R-4 : en-tête de l'assainisseur aligné ; survivants nommés (entier nu suivi d'un ticker ou d'un mot, `5USDx`, décimale sans partie entière, devises hors liste fermée, faux-rejet conservateur d'un entier à virgule).
- **C-R-3 (docs, propriétaire orchestrateur)** : amendements datés 2026-09-21T16:20Z — critère D4 re-diagnostiqué (`docs/G2-DELTA-lot-t1a-iii-a1.md`), G0 D4 (`docs/G0-lot-t1a-iii-a1-bis.md`), liste des gates de la première course univers (`docs/G7-lot-t1a-iii-a1.md`), contenu exigé de la fiche de GO de course.

## Finding D4 (flake local ~4 %) — item FORMÉ et SOURCÉ
Défaut amont Node sous Windows : `nodejs/node#56645` (Closed), correctif `nodejs/node#61999` (Merged ; backports 22.x/24.x NON LUS) ; FAITS `F:\PRODUITS\etude-2026-09-21\bell-a1bis\FAITS-flake-libuv-windows-2026-09-21.md`. Attribution : 2 signés + 2 inférés. Règle : relance locale Windows seulement sur signature exacte ; tout rouge non signé reste rouge ; aucun retry en CI. **Déclencheur de l'item** : bump du Node local vers une version portant #61999, OU lecture [lu] du backport 24.x, OU premier rouge de cette forme sur ubuntu. Propriétaire orchestrateur.

## Tuyaux (règle Branchement)
Entrée : API émetteur (pagination) + RPC de confirmation. Sortie : brut sha-pinné + `universe` + journal chaîné `UNIVERSE_LEDGER_JOURNAL` → `provenanceMd(head)`. État : `<out>/` hors dépôt. Preuve : `bell_universe_cli_composes_from_file_to_artifact` (composition du journal écrit jusqu'à la ligne de tête de la provenance). **Registre** : tout `upcoming` (Bell = temps 2, décision 117 ; aucune course tirée).

## Items formés (déclencheur, propriétaire orchestrateur)
- **Phantom-fresh** (`--out` déplacé ⇒ état frais fantôme, `universe-cli.ts:124-129`) et **CONV-2** : lot **GARDE-HELIUS-1b** (aucune course payante ne précède le garde).
- Résidus de l'assainisseur nommés en C-R-4 : G0 T-1b (surface `/bell/`), où l'identité assainie devient visible.
- Flake D4 : ci-dessus.

## error_origin
C-VD-1 (lint cassé + déclaration d'oracle fausse par lecture du code de retour derrière un pipe) : worker — règle ajoutée aux consignes : **code de retour capturé directement, jamais après un pipe**. C-V-1..6 / C-G2b-1..6 : worker G1, sauf D4 : plan (diagnostic « handles » de la G2-delta -a1). Sur-attribution « confirmé par le validateur » : worker. Interaction de fusion TS2554 : aucune faute de lot ; ordre de fusion orchestrateur, attrapé par l'oracle sur l'arbre fusionné (2ᵉ cas du jour après POOL-RPC-1a ⇒ la règle paie). Deux chemins mal échappés dans des docs écrits par script (caractères de contrôle, corrigés `2 commits`) : orchestrateur — les textes à barres obliques inverses passent désormais par l'outil d'écriture, pas par un heredoc.
