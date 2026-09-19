# Revue G2 — lot W-1 (ADR-M018 D2 + ADR-W1), gel `b1594c4` sur `lot/w-1` (base `79c4206`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~05:20 UTC). Mutations en place intra-fichier, restauration byte-exacte vérifiée (`git diff --quiet`), `git status` final propre.

## Oracle re-exécuté
`npm run ci` 289/289 ; lint 0 ; ratchet 69/69 ; typecheck 0 ; lang-gate root 0 ; export:check 0 ; `next build` OK (13 pages) ; diff hors portée (`schemas packages apps/harness apps/sentinel`) vide ; sha G1 §1 7/7 ; R-25 code +149/−20.

## Mutants
| # | Mutation | Cible | Mesuré |
|---|---|---|---|
| m1 | `wiring` retiré d'un built | typecheck | ROUGE TS2322 |
| m4 | `wiring` sur un upcoming | typecheck | ROUGE TS2322 (`wiring?: never`) |
| m2 | `integration_test:"no_such_test"` | gel (garde 3) | ROUGE |
| m3 | `status="built"` attribut sur AgentCard | gel (garde 5) | ROUGE |
| m5 (propre) | `served_by:""` | gel (garde 3) | ROUGE |
| A1 | `status={"built"}` (littéral JSX-wrappé) | gel (garde 5) | **VERT — trou** |
| A2 | rendu destructuré `const {served_by}=a.wiring` | gel (garde 4) + site-honesty AST | **VERT — trou** |

## Wiring mesuré
Shōgen ✅ (`attest → gate`, `gate_attested_concordant_files_residual`) ; Hikae ✅ (`gate`, probe h5 ; BYO `probe_byo_demo_loop_closes` existe) ; Ukemi ✅ (« abstains under_calib by construction » présent) ; Narabi ⚠️ (deux jambes vraies, mais le test nommé prouve le fenêtrage **offline**, pas « fresh on-chain pull »).

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| C1 | `test/ci-gates.test.ts:671-672` | garde (5) contournable par `status={"built"}` | scoper au tag `<AgentCard>` ; interdire tout littéral, exiger `status={IDENT}` | worker |
| C2 | `test/ci-gates.test.ts:656`, ADR-W1 D3(4), G1 §3 | garde (4) contournable par destructuration ; « trou fermé » = surclaim | élargir aux identifiants nus hors `lib/fleet.ts` ; reformuler en limite déclarée ; prérequis du lot designer | worker |
| C3 | `fleet.ts:157`, ADR-W1:75 | « fresh on-chain pull » faux (offline, série sha-pinnée) | reformuler ; optionnel `narabi_live_parses_real_state_shape` | worker |
| C4 | `shogen-panel.tsx:36,42`, ADR-W1:84-88 | jumeau « verified price testimony » incohérent avec `fleet.ts:70` ; déclencheur disjonctif | aligner « attested » maintenant ; un seul lot propriétaire pour :51,:57 et `fleet-presentation.ts:33` | worker |

## Adjudication des points du worker
1 Narabi mono-test : acceptable (C3 requis). 2 « attested » : validé. 3 rendu `wiring` → designer : confirmé, C2 prérequis. 4 Hikae `gate` (pas `calibrate`) : correct. 5 report « verified » : scindé (C4).

## Observations
O1 garde (3) vérifie l'existence, pas la nature (déclaré). O2 `TEST_ROOTS` omet `packages/*/test/`. O3 `README.md:48,111,112` « verified testimony » → même lot vocabulaire. O4 `.next` produit par l'oracle, gitignoré. O5 `integrators/page.tsx:15` commentaire vrai.
