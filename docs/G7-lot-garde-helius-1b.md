# G7 — GARDE-HELIUS-1b (1b-i + 1b-ii + 1b-iii, course Bell sur le client gardé unique) — ACCEPTED, fusion `a380867`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 07:19 UTC (`date -u`). Branche `lot/garde-helius-1b` @ `46b6cef` = arbre fusionné des trois sous-lots (`14784ee`, résolutions orchestrateur : `quorum.ts` → 1b-ii, `package.json` → 1b-i, `collect.ts` `readCashKeys` sans `solanaEndpoints`, ADR union, pli m4) + pli checkpoint-2/G2 ; fourche `c10c13d` ; fusionnée `--no-ff` dans `lot/etude-suite` sans conflit (`record.ts` auto-fusionné : ripple `finally` +5/−2 seul). ADR Pli-2 complété à `6ffc5e3` (borne 2 × `--max-calls`).

## 1. Oracle complet sur l'arbre FUSIONNÉ `6ffc5e3` (clés payantes retirées du process)
`npm run ci` → 0 : tests **857 / 857 pass / 0 fail / 0 skip** (`fetch_only_inside_client` LEVÉ : la course atteint `fetch` uniquement via `openGuardedClient`) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-1b\*.log`. R-25 par sous-lot (base `6114ce9`) : 1b-i 1 136, 1b-ii 680, 1b-iii 465, pli 296 — chacun sous 1 150. `packages/rpc-guard/src/**` byte-identique ; 9 sha gelés U-4b byte-identiques à la référence courante du tronc (labeler = `cb020425…` depuis `506db2d`, pas `755b3a38…`).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-garde-helius-1b.md`, `docs/CHECKPOINT1-lot-garde-helius-1b.md` | approuvé |
| G1 ×3 | `F:\tmp\garde1b\1b-{i,ii,iii}\G1-*.md` (11 + 11 + 10 mutants) | — |
| Fusion des sous-lots | `14784ee` (830/830/0/0), pli m4 | — |
| G2 (arbre fusionné) | `docs/G2-lot-garde-helius-1b.md` : 1b-i PASS / 1b-ii PASS-AVEC-CORRECTIONS / 1b-iii PASS ; C-G2-A ETH non câblé, C-G2-B section ADR 1b-ii, C-G2-D R-25 | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-garde-helius-1b.md` (ETH `collect.ts:736`, 429-streak, CLEANED, sondes) | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `46b6cef` : jambe ETH via SECOND client gardé keyless, refus fail-closed AVANT tout verrou (caps ETH requis, labels keyless interdits dans `--operators`), libération des deux clients, sonde fetch-only sur les deux entrées, 429-streak, ADR 1b-ii + Pli-1..6 ; 43 mutants (42 tués + V4 déclaratif) | — |
| G2-delta | `docs/G2-DELTA-lot-garde-helius-1b.md` : sonde anti-fuite indépendante (0 verrou), 835/835/0/0, fusion à blanc 845/845/0/0 | PASS |
| Re-checkpoint-2 | `docs/CHECKPOINT2-DELTA-lot-garde-helius-1b.md` : 4 fetch keyless write-ahead, 0 `.lock`, V4 équivalent accepté | ACCEPTE-AVEC-CORRECTIONS (1 : borne 2× → `6ffc5e3` ; 2 : oracle sur la fusion réelle → §1 ; 3 : RENDU §5 243→296, artefact hors dépôt, mention ici) |

## 3. Livré
`apps/bell/src/{universe-cli,collect,ethereum,quorum,close}.ts` + `apps/bell/src/rpc/*` : univers et collecte Bell servis via `openGuardedClient` (ledger de cycle write-ahead, caps par méthode, `BudgetExceededError` STOP non retry, 429-streak STOP, reprise après STOP sans perte) ; clés cash lues uniquement dans le module allowlisté (`readCashKeys`), zéro lecture de clé dans `collect.ts` ; jambe ETH keyless via un second client gardé ; contrat `--eth` : les labels keyless ne se listent plus dans `--operators` (refus par nom, 0 verrou). Tests d'intégration non-LLM à corps de forme réelle (A-8) sur les deux entrées servies.

## 4. Branchement
Chemin servi = la course Bell (go-1 sonde puis go-2 tirage) ; `bin/rpc-guard.mjs reconcile` = point d'entrée servi du reconcile (Helius per-method `byMethod`, ruling GO1-A). Registres publics inchangés (Bell reste `upcoming`, décision 117).

## 5. Items formés (ADR, déclencheurs nommés)
Pli-2 `callsUsed()` + borne 2 × `--max-calls` (1ʳᵉ course `--eth` rapprochée) ; Pli-3 release au cycle scalaire (course ≥ 2 opérateurs à cycle-ids distincts) ; Pli-4 reclaim d'un verrou orphelin hors fenêtre (1ʳᵉ observation en course) ; check ETH-caps teste la présence, pas la positivité (`eth_getLogs=0` refuse au 1ᵉʳ appel, fail-closed) ; C-G2-E : prose D4 de l'ADR-U4b cite `u4b-scores.mjs = 9ad20666…` (valeur historique, blob réel `2f9a31f6…`) — propriétaire ADR-U4b, à corriger au commit du prereg ; Databento/Polygon plafond au G0 course cash ; `http://` POST paquet.

## 6. `error_origin`
ETH non câblé au site d'appel : worker 1b-iii (attrapé par G2 et checkpoint-2) ; fuite de 6 verrous sur la version intermédiaire du pli : worker (attrapé par l'advisor intégré, corrigé avant rendu) ; chiffres R-25 des rendus G1 : workers 1b-ii/1b-iii ; bordure 2 × `--max-calls` non nommée : plan (attrapé au re-checkpoint-2).

## 7. MAST résiduel
FM-3.2 soldé par les sondes sur les deux entrées servies ; résiduel nommé : V4/Pli-3 déclaratifs (équivalence prouvée non vacue par M5), reclaim orphelin non implémenté (procédure manuelle nommée dans la fiche go-1).
