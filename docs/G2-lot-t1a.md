# Revue G2 — lot T-1a (MONARK Bell, ADR-B0), gel `8e5752a` sur `lot/t-1a` (base `58fe309`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~07:45 UTC). Persisté par l'orchestrateur AVANT le pliage (règle : la G2 est écrite sur disque avant tout checkpoint-2). Mutants joués dans une copie `git archive`, `node_modules` réel non jonctionné ; porcelain vide avant/après ; 7 src byte-identiques au gel après restauration (sha G1 §1 = mesurés).

## Oracle re-exécuté
`npm run test` 302/302 ; bell 13/13 ; tsc 0 ; eslint propre ; ratchet 69/69 ; gate:vocab 149 fichiers ; lang:gate / export:check OK. **R-25 (commande de la gate) = 892** (14 fichiers, +892/−2) — ni 880 (G1) ni 1010 (mission) ; `apps/bell/test/fixtures/halts-reduced.csv` (6 lignes) est compté (aucune racine exclue).

## Mutants
| # | Mutation | Test tueur | Résultat |
|---|---|---|---|
| a | `digest.ts:24` `CLOSE_KEY` inerte | `bell_close_field_reddens` | ROUGE (`Missing expected exception`) |
| b | `reason-canon.ts:61` `?? "REASON_UNKNOWN"` → `"LULD_PAUSE"` | `bell_reason_graphie_break` + `bell_halt_residues_named_never_silent` | ROUGE ×2 |
| c | `sessions.ts:57` offset fixe −5 h | `bell_dst_wrong_zone_reddens` | ROUGE (`expected 19 / actual 20`) |
| d | `rpc.ts:125` dédup retirée | `bell_volume_dedup_by_signature` | ROUGE (`expected 2 / actual 3`) |
| f-signe | `rpc.ts:113` `post−pre` → `pre−post` | `bell_vwap_matches_recorded_swap` | ROUGE (`−15349152n`) |
| f-side | `gap.ts:35-36` num/den inversés | idem | ROUGE (`'27.46'`) |
| halt+1s | `halts.ts:82` `>=` → `>` | `bell_halt_shift_one_second_changes_delta` | ROUGE |
| **e** | `digest.ts:20` `.sort()` retiré | aucun | **SURVIT 13/13** → C-2 |

## Faits première main reproduits
Parse indépendant (Python RFC4180) et parseur committé identiques : 73 431 lignes ; 4 539 resume vides ; 18 graphies ; LULD_PAUSE 61 747 ; `REASON_UNKNOWN` 0 ; recensé-15 depuis 2025-06-30 = 0 ; historique 8 ; ETF ×5 graphies (correction G1 exacte). Fenêtre TSLAx×week-end n=52 non rejouée (réseau + clé) ; cohérence interne OK (close implicite ≈ [masqué], jamais écrit).

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin | déclencheur |
|---|---|---|---|---|---|
| C-1 | `sessions.ts:102-106` | ancre sur jour non-boursier (sam 2026-07-04 → 07-03 férié ; lun 01-19 sur lui-même) | ancrer par la marche l.119 sur le dernier jour de bourse ; `regime=gapRegime(ancre)` | générateur | avant gel T-1b / entrypoint T-1a-ii |
| C-2 | `digest.ts:20` | invariance d'ordre des clés non gardée (mutant e survit) | test `bell_canonical_key_order_invariant` | générateur (oracle) | avant gel T-1b |
| C-3 | `digest.ts:24-26` | `CLOSE_KEY` rate `refPrice`/`pRef` (camelCase) | élargir `/close|ref[_]?price|p[_]?ref|reference/i` | générateur | avant gel T-1b |
| C-4 | `gap.ts:56` | volume nul ⇒ `gT="0.0000000000"` indistinguable d'un écart nul réel | abstention volume-nul branchée avant toute publication | générateur | avant gel T-1b |
| C-5 | G1 §4 | R-25 880 ≠ 892 ; asymétrie fixture bell comptée | rapporter 892 ; racine bell dans l'exclusion (lot R-25-séries C-4) | générateur / planificateur | clôture G1 |
| C-6 | G1 §5 | « 2 passes concordantes n=52/55 » sur-qualifie 3 fills d'écart ; bornes UTC non épinglées | épingler `[fromUtc,toUtc]`, expliquer 52/55 | générateur | avant course fondatrice |
| C-7 | `halts.ts:83` | `before` sans borne basse `>= haltUtcMs` | borner ou documenter | générateur | avant gel T-1b |

## Observations formées
- O-1 : ADR item (g) census complet 839+395 + source MWCB assigné à T-1a, différé sans lot → re-former (a) census [déclencheur PR-B-ONDO + `v3/reference/tickers`] ; (b) flux MWCB [procurement feed SIP MWCB ; CSV = 0 ligne market-wide]. Fermé avant release (décision 19).
- O-2 : PR-B-ONDO cité (`pools.ts:72`) absent de la table procurement ADR → enregistrer.
- O-3 : conflation « Ondo 837,9 M$ » (USDY/OUSG ≠ actions) → item d'amendement ADR-B0 (orchestrateur), revoir « ≈ 47 % ».
- O-4 : ETF ×6 → ×5 résolu en code ; texte ADR D2 ii à corriger.
- O-5 : scission T-1a-i/ii + `bell_sha` non Ed25519 + mesure fondatrice = 0 ligne : plus étroit que D7 → amendement ADR-B0 daté (orchestrateur + validateur), tension D7 « signé » vs D8 « clé sur VPS à T-1b » à entériner.
- O-6 : spike §0 fondé (drpc 400, ankr 403, mevblocker 200 reproduits) mais sondes/réponses brutes non committées → consigner en provenance.
- O-7 : G1 §2 liste 12 tests sur 13 (`bell_csv_parses_quoted_names_and_dst_rows` omis).
- O-8 : scope lang:gate/export:check sans `bell` ni `sentinel` → « 0 hit » vrai par lecture, pas par gate.

## Branchement (ADR-M018)
Conforme : 14 fichiers, aucun sous `apps/site`/README/skills ; `fleet.ts` inchangé ; brique `upcoming`, rien de servi, aucun `built`. Additions vocab purement additives.

## Décision 19
Bloquants avant release Bell : Helius + mesure fondatrice ; T-1a-ii (iii, iv) ; Ed25519 ; census + MWCB (O-1) ; C-1 ; C-4. Oracle/texte : C-2, C-3, O-2, O-3, O-4.
