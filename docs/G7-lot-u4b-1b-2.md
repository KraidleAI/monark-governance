# G7 — U-4b-1b-2 (préconditions de course Ukemi : discover v2, sélecteur d'épisode, prober D_e paramétré) — ACCEPTED, fusion `cabe67f`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 16:38 UTC (`date -u`). Branche `lot/u4b-1b-2` = 3 PR empilées (couture appliquée par l'orchestrateur, chacune < 1 150 : PR-C `e0276d4` 209, PR-B `6930c7a` 547, PR-A `2be517f` 929) + pli final `bed8cb4` ; fourche `e60ea07` ; fusionnée `--no-ff` sans conflit ; amendement ADR-U4b inséré au commit suivant.

## 1. Oracle complet sur l'arbre FUSIONNÉ (clés payantes retirées du process)
`npm run ci` → 0 : **896 / 896 pass / 0 fail / 0 skip** (le rejeu C-1 sur le brut e2 hors dépôt tourne ici) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-1b2\*.log`. 9 sha gelés (prereg §2) byte-identiques : `2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`.

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | mission + `docs/CHECKPOINT1-lot-u4b-1b-2.md` (reconstitué — sortie d'agent vide, défaut de persistance consigné) : C-1..C-9, 3 bloquantes intégrées avant écriture | APPROUVE-AVEC-CORRECTIONS |
| G1 | `docs/G1-lot-u4b-1b-2.md` (887/886/0/1, 19 mutants, couture nommée) + ajouts mesurés sur la course réelle (brut perdu, pocket élague) | — |
| G2 | `docs/G2-lot-u4b-1b-2.md` (19 + 8 mutants, 2 lacunes H-1/H-2) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u4b-1b-2.md` : PR-B rouge seule (couture), refus « ts manquant » sans chemin, « brut avant témoin » faux au code, `--events` non exécutable, preV33 survivant | ACCEPTE-AVEC-CORRECTIONS |
| Pli + re-couture | `--fill-ts` (sidecar sha-lié), phase getlogs-only durable, `events-<id>.json` + sha octets, H-1/H-2, exclusions par PR | — |
| G2-delta | `docs/G2-DELTA-lot-u4b-1b-2.md` : 36/36 mutants, 894/893/0/1 | PASS |
| Re-checkpoint-2 | `docs/CHECKPOINT2-DELTA-lot-u4b-1b-2.md` : PR-C/PR-B vertes seules, SIGKILL réel prouvé, V-M12 + 2 gardes | ACCEPTE-AVEC-CORRECTIONS |
| Pli final | `bed8cb4` : liaison sidecar↔brut testée, keyless-only par code, `phase` ≠ complete refusé ; 31 + 7 mutants ; 896/895/0/1 | — |

## 3. Livré
`u4b-discover.mjs` v2 (brut durable `getlogs-only` → `complete`, `block_ts` sous sha, `--block-operators`, témoin en échec non fatal) ; `u4b-select-episode.mjs` (§DISC hors ligne : e2 exclu, N_min distincts, fenêtre, argmin + tie-break ; `episode-selection.json`, `A-rawlogs-<id>.jsonl`, `events-<id>.json` avec sha des octets ; `--check-version` EIP-1967 v3.5.0 ; `--fill-ts` gardé keyless quorum-2) ; `u4-oracle-path.mjs` (défauts e2 supprimés, `--episode-file`, `run(argv, deps)`) ; `u4-guard.mjs` (`canon`/`sha256Hex` parité épinglée) ; test de chaîne réel discover → select → `parseArgs(--events)` du labeler gelé.

## 4. Branchement
Tuyaux (amendement ADR-U4b) : brut discover → sélecteur → `--events`/`--rawlogs`/`--rawlogs-sha` du labeler, `--episode-file` du prober, `--block B0` du recorder ; test de composition committé. Chemin servi = la course U-4b-1b.

## 5. Items formés
Prereg §5b `--block-operators`/§5b-fill/§5b-bis/§5a `--block`/§5e alimentés par `episode-selection.json` ; ordre labeler → prober pour `--usdt-blocks` (D-n) — réécriture docs-only du prereg au commit suivant (sha recomputé, sidecar) ; brut sans `phase` accepté (legacy) ; relance réelle du discover (maintenant).

## 6. `error_origin`
Ts absents du brut, `collateral:"WETH"`, tuyau `--rawlogs` : plan (attrapés au cp-1) ; couture PR-B rouge : orchestrateur ; « brut avant témoin » : worker (description) ; refus sans chemin : plan (attrapé au cp-2) ; cp-1 non persisté : outillage (sortie d'agent vide).

## 7. MAST résiduel
FM-3.3 (vérification par le refus) fermée par la chaîne réelle ; résiduel : brut sans `phase` accepté (déclaré).
