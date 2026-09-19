# G7 — lot T-1a-ii-a (Bell collecteur : faits iii-iv, jambe Ethereum, quorum keyless) + pli T-1a-ii-a-2 — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel `f5d86dd` sur `lot/t-1a-ii-a` (base `88c3324` ; G1 `83d016c` ; pli-1 `a52f67c` ; pli-2 `f5d86dd`). Fusion `--no-ff` sur `lot/etude-suite`.

## Chaîne de preuve (chaque maillon = instance séparée)
| Maillon | Artefact | Résultat |
|---|---|---|
| G1 worker Opus 4.8 max | `docs/G1-lot-t1a-ii-a.md` | 6 src, 336/336, mutants W1-W6 rouges, run réel borné TSLAx (0 crédit Helius) |
| G2 fraîche Opus 4.8 | `docs/G2-lot-t1a-ii-a.md` | APPROUVÉ-AVEC-CORRECTIONS → pli-1 `a52f67c` |
| G2 delta-1 | `docs/G2-delta-lot-t1a-ii-a.md` | CONFORME (C-1 R-25 UNION, `error_origin` orchestrateur) |
| Checkpoint-2 validateur | `docs/CHECKPOINT2-lot-t1a-ii-a.md` | ACCEPTE-AVEC-CORRECTIONS : V-1 CLI no-op silencieux (course payée pour rien), V-2 `quorum: 2` constante, V-3 raison de garde effacée |
| Pli-2 worker | `docs/PLI2-lot-t1a-ii-a.md` | `parseArgs` pure fail-closed, `quorum_required` + `providers_distinct`, `fatalMessage` |
| G2 delta-2 | `docs/G2-delta-lot-t1a-ii-a-2.md` | CONFORME, mutants M1-M5 + MG2 rouges, MG1 survivant → O-12 |
| Checkpoint-2 bis | `docs/CHECKPOINT2bis-lot-t1a-ii-a.md` | ACCEPTE : 9 cas CLI hors ligne exit 1 zéro réseau, pin recomputé, UNION 346/346 |
| G7 orchestrateur | ce fichier | oracle rejoué sur l'arbre fusionné : **346/346**, lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:\tmp\g7-t1aiia-*.log`) |

## Fusion
- `.github/workflows/ci.yml` : seul conflit ; résolu en **UNION** (ligne `STAT=` d'etude-suite = D9 septies `docs/**/*.md` + les trois exclusions Bell `apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}` = D9 sexies/C-14) ; 0 marqueur, 1 `STAT=`, bloc commentaire complété ; `test/ci-gates.test.ts` auto-fusionné et vert.
- R-25 sous le pathspec UNION : 1 192 ≤ 1 205 (validateur) ; la fusion est unique (pas de -a2).
- Pliés au G7 (docs, 0 coût R-25) : amendement C-6 ADV daté dans l'ADR ; E-1 ⇔ décision investisseur 38 ; typos `F:\tmp\bell-out` (ADR, G1) ; PLI §5 pointeur de ligne ; CHANTIERS ligne T-1a-ii-a ; JOURNAL-PROVENANCE.

## Branchement (CA-11)
Bell **absent** du registre public (`apps/site/lib/fleet.ts`, README) ⇒ `upcoming` ; sorties du collecteur hors dépôt (`--out` gardé par `assertOutsideRepo`) ; tuyaux déclarés dans l'ADR (D1/D4) ; la mise « built » attend T-1b (chemin servi + test d'intégration non-LLM, O-11).

## error_origin (assignés)
G2-delta-1 C-1 : orchestrateur (base non rebasée après D9 septies). V-1/V-2/V-3 : générateur, co-origine planificateur (§F « CLI officielle hors ligne » non citée dans la mission). OBS-1/O-12 : co-origine planificateur (spec « NaN/négatif ») / générateur (durcissement non épinglé). Erreurs d'orchestration attrapées par les sièges : commit hors périmètre absent ici ; oracle de l'arbre fusionné jamais exécuté avant le checkpoint (corrigé : exécuté deux fois depuis).

## Items formés (liste fermée, bloquants release Bell, déclencheur = avec O-6, avant le lot -b)
O-4 ancre série ; O-6 divergence corps-niveau + sampling ; O-8 tueur `vol_ratio` sous multiplicateur ≠ 1 ; O-9 `isSolRevert` codes transport ; O-10 override env `BELL_SOLANA_RPC` ; O-11 intégration hors ligne jambe Ethereum (+ test spawn CLI quand Bell passe built) ; O-12 `parseArgs` rejette `Infinity` (pin). Procurements -b : MWCB (PR-B-8), CGU Helius (C-13) ; census Ondo réglé (API publique, `por_daily_report_aggregate`).

## Suite
Lot **-b** (course fondatrice) : G1 sur la méthode census investisseur (RWA.xyz / Token Terminal d'abord, adresses de contrat, pools par adresse), chaînes EVM en tête (BNB bStocks, Robinhood Chain, Base, X Layer), rebases/multiplicateurs par émetteur, fichier séance/halts, Helius en second fournisseur + RPC payant (décision 38), parallélisme borné.
