# G7 — GARDE-HELIUS-1b-0 (côté PAQUET pour Bell) — ACCEPTED, fusion `6a639e8`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 03:13 UTC (`date -u`). Branche `lot/garde-helius-1b-0` @ `25e8de4` (G1 `ee8a94f` + pli), base `5394dfe`, fusionnée `--no-ff` dans `lot/etude-suite` avec union de l'ADR (amendements 2b-iii puis 1b-0, 0 marqueur).

## 1. Oracle complet sur l'arbre FUSIONNÉ `6a639e8` (clés payantes retirées du process)
`npm run ci` → 0 : tests **795 / 794 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b` — se lève à 1b-iii) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-1b0\*.log`. R-25 du lot 638 (≤ 1 150).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-garde-helius-1b.md` (plié, sous-lot 1b-0), `docs/CHECKPOINT1-lot-garde-helius-1b.md` ; décisions 121, 122 ; items 1b-0 de `docs/G7-lot-garde-helius-2b-ii.md §5` | — |
| G1 | `F:\tmp\garde1b0\RENDU-G1.md` ; 773/771/0/2, 14 mutants, R-25 523 | — |
| G2 | `docs/G2-lot-garde-helius-1b-0.md` (F-1..F-3) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-garde-helius-1b-0.md` : **C-1 BLOQUANTE — le GET keyless désenveloppait la réponse comme du JSON-RPC (`json.result`) ⇒ `undefined` sur tout corps réel de l'émetteur ⇒ univers vide silencieux (fail-open)** ; C-2 403 non structurel ; C-3 conflit ADR ; C-4..C-9 | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `25e8de4` : GET verbatim + tests à corps de forme réelle, 403 structurel, sosies d'hôte, 3xx sur GET, ligne helius sans `network`, 7 clés épinglées, tuyaux ADR, items C-5/C-6 ; 777/775/0/2, 19/19 mutants, R-25 638 | — |
| G2-delta (reprise) | `docs/G2-DELTA-lot-garde-helius-1b-0.md` : C-1 prouvé à travers `openGuardedClient` (mutant ⇒ `undefined` bout en bout), survivants VH-a2/b2/d3 + F-2 tués, 19 + 5 mutants rouges | PASS |
| Ruling C-5 | ripple du `finally` du recorder ⇒ **1b-iii** (extension explicite ; ADR en-tête 1b0-E + G0 1b ligne 1b-iii, ce commit) | — |

## 3. Livré
`transport.ts` : opérateur GET keyless `xstocks-issuer` (méthode GET, `assertHostAllowed` structurel dans `resolveGetUrl`, corps renvoyé VERBATIM), `chainstack` unique par compte résolu par `opts.network` (défaut `ethereum-mainnet` ⇒ recorder 2b-ii byte-identique), `solana-foundation`, `redirect:"manual"` + `RedirectBlocked` typé (GET et POST), `Retry-After` parsé sauf 403 (structurel). `ledger.ts` : champ `network` optionnel (attribut, jamais un second plafond — 121), récupération crash-in-window dans `openOperatorLedger` (test sentinel `_KNOWN_DEFECT` inversé). `tariff.ts` `getAccountInfo = 1 RU` ; `bell-methods.ts` ; `bin/rpc-guard.mjs` (GO/NO-GO sur ledger + floor). `reconcile.ts` : commentaire rectifié (total du compte).

## 4. Branchement
Lot PAQUET : `bin/rpc-guard.mjs` et l'opérateur GET restent **upcoming** jusqu'aux consommateurs 1b-i (universe), 1b-ii (collect), 1b-iii (eth + dé-skip). Aucun statut public ne change.

## 5. Items formés (propriétaire orchestrateur)
- 1b-i : composition réelle `xstocks-issuer` → `foldPage`/`pageAssets` (corps verbatim), premier reconcile d'un ledger mixte ETH+Solana (quel instantané du tableau de bord), ré-export `BudgetExceededError` côté Bell, wrapper reconcile de course (`--before/--after`).
- 1b-ii : `PUBLIC_SOLANA` mainnet-beta.
- 1b-iii : dé-skip `fetch_only_inside_client`, Databento/Polygon allowlist, **ripple `finally` du recorder** (ruling C-5).
- Unifier les deux tests de grep (reporté de 2b-iii).
- Crash au tout premier append (head absent) : runbook.

## 6. `error_origin`
C-1 (GET désenveloppé) : worker (test enveloppant l'entrée dans la forme attendue par l'aval) ET relecteur G2 (manqué) — attrapé par le checkpoint-2 (sonde de composition CA-11 durci). C-2 : worker (garantie documentée non codée). C-5 : plan (attribution 1b-i fausse). R-25 517 vs 523 : worker (rendu).

## 7. MAST résiduel
FM-2.4 (test fabriquant son entrée) attrapé et fermé ; résiduel nommé : la composition réelle avec l'API de l'émetteur n'est prouvée qu'au 1b-i (corps réel enregistré).
