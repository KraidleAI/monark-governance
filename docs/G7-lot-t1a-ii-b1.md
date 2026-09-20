# G7 — lot T-1a-ii-b1 (Bell, jambe Solana) : corrections collecteur, spike, découverte des pools 2025, abstention nommée — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-20. Gel `2ac2e25` (base `96ca634`), revue `c5d15a4`, pli 2 `3b0a92a`, delta `9c77f0f`, checkpoint-2 + C-V-5 `0e2d848`. Fusion `--no-ff` `7467023` sur `lot/etude-suite` ; correctifs post-fusion `677ea2f` (C-V-5 ADR), `4536802` (gate:vocab).

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 | `docs/G0-lot-t1a-ii-b.md` + C-1..C-15 | approuvé-avec-corrections |
| G1 worker Opus 4.8 max | `docs/PLI-lot-t1a-ii-b1.md` | 402/402, 12 mutants, spike ~90 appels, **course non lancée** : consultation formée (pools census nés en 2026 ; xStocks à multiplicateur mutable) |
| Décision investisseur 47 | CHANTIERS | option (a) variante SPLIT : registre fondateur = pools 2025 découverts ; g_t fondatrice → -b1-bis après -b3 |
| G2 fraîche Opus 4.8 | `docs/G2-lot-t1a-ii-b1.md` | APPROUVÉ-AVEC-CORRECTIONS C-G2-1..8 (fail-open live C-6 reproduit) |
| Pli -b1-2 | annexe PLI | 49/49, 5 mutants, R-25 983 |
| G2 delta bornée | `docs/G2-delta-lot-t1a-ii-b1-2.md` | CONFORME |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-t1a-ii-b1.md` | ACCEPTE-AVEC-CORRECTIONS C-V-1..5 (rejeu à froid 49/49, 5 mutants) |
| G7 | ce fichier | 1er oracle **rouge** : `gate:vocab` (« verified » dans un commentaire, pli 2) → corrigé `4536802` ; 2e oracle arbre fusionné : **412/412** (396 + 16), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:/tmp/g7-bellb1-ci.log`) |

## Ce que le lot livre
`apps/bell/src/` : `operators.ts` (quorum = 2 opérateurs distincts, Chainstack = 1), close par jour de référence look-ahead-safe + `close_source`, `--max-calls` fail-closed, gate rebase `rebase_unverified` **fail-closed dans `main()`**, `readMintToken2022` fail-closed, `coverage.ts` (décision 45), 5 motifs secret dans `no_secret_in_repo` ; `scripts/bell-report.mjs` (rapport non-LLM, garde close) ; spike Solana committé en séries réduites (`series/spike/`, bruts hors dépôt sha-pinnés, ToS collé) ; PoC découverte pinné honnêtement (`raw_sha256: null`) ; ADR-T1aii D1-ter (SPLIT, -b1-bis, tuyaux) ; ADR-B0 amendé.

## Branchement (CA-11)
Bell absent de `fleet.ts`, README, site, skills (plus fort qu'`upcoming`) ; aucune surface servie touchée ; `coverage.ts` déclaré upcoming avec consommateur -b1-bis.

## R-25
983 sous la pathspec UNION (≤ 1 205) ; > cible 700 : `error_origin` planificateur (les 8 corrections G2 étaient hors estimation).

## error_origin
Hypothèse D1 « pools census = pools 2025 » : planificateur. C-G2-1 (fail-open), C-G2-2 (signe effTs), C-G2-5 (C-5 non livré) : rédacteur -b1. `gate:vocab` manqué : worker du pli (mot) + orchestrateur (consigne d'oracles sans `gate:vocab`) ; ni G2 delta ni checkpoint-2 ne l'ont lancé (§F-gate-vocab). C-V-5 : rédacteur.

## Items formés (déclencheurs)
- **-b1-bis** (après -b3) : découverte des pools 2025 + registre fondateur `founding_pool` + course rebase-aware ; reprendre C-V-2 (amorce `before` de `signaturesUntil`, parallélisme borné, coût crédit/appel gTfA) et C-V-3 (constructeur `SymbolInput` injectable + test « quorum mint échoué ⇒ `rebase_unverified`, aucun gT » + smoke `main()` mint forcé en échec **avant toute course**) dans son G0.
- **PR-B-SPL-TOKEN2022** : lecture formée lancée 2026-09-20 (lecteur Sonnet 5) ; déclencheur -b3.
- **-b2b** : budget fail-closed ETH/Massive (C-G2-7).
- **-b3** : hypothèse « autorité null maintenant = null en 2025 » à confronter (C-G2-8).
