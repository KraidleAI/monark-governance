# G7 — lot U-3 : étiquettes réelles Y_{i,e} (3 événements Aave v3 core), séries sha-pinnées, prereg gardé — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-20. Prereg `e87549a` (seul, C-10), lot `6cd991c`, revue `f0eefb2`, pli 2 `3a0cdd9`, pli 3 `634113c` (base `13b8391`). Fusion `--no-ff` `06de941` sur `lot/etude-suite`.

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 | `docs/G0-lot-u3.md` + C-1..C-11 | approuvé-avec-corrections (source gitignorée, racine R-25, prereg imposé par le script, cross-checks underlying, contrôle positif déficit) |
| G1 worker Opus 4.8 max | `docs/PLI-lot-u3.md` | 400/400, 5 mutants, R-25 825 ; 3 événements : 5/239/1 appels, 3/194/1 positions ; H1-H3 tenues ; 2 runs à froid byte-identiques ; 0 `no_quorum` |
| G2 fraîche Opus 4.8 | `docs/G2-lot-u3.md` | APPROUVÉ-AVEC-CORRECTIONS C-G2-1..6 (docs) ; rejeu offline + depuis bruts identiques ; **re-tirage live indépendant 3/3 à l'unité** |
| Pli 2 | annexe PLI | docs seules, séries/script/test sha inchangés |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u3.md` | ACCEPTE-AVEC-CORRECTIONS C-V-1..4 (rejeu à froid, 5 mutants dont M5a/M5b, **D-5 trouvée** : jointure déficit sans tx) |
| Pli 3 | annexe PLI | D-5 déclarée (in_event 3 sous la règle prereg, Σ inchangée), item bad-debt inter-tx → U-4, `.d.mts`, preuve prereg |
| G7 | ce fichier | arbre fusionné **425/425** (421 + 4), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:/tmp/g7-u3-ci.log`) |

## Ce que le lot livre
`scripts/census/u3-realized.mjs` (quorum-2 par méthode, `--prereg-sha` obligatoire, `--max-calls`, resumable) ; séries réduites sous `apps/sentinel/test/fixtures/ukemi/u3/` (`U3-realized` 198 lignes, `U3-sources`, `U3-deficit`, `U3-inputs` rejeu offline, PROVENANCE) ; 4 tests CI ; rapport `docs/census-2026-09-20/U3-realized.md` ; `docs/adr/ADR-U3-realized-labels.md`. Faits : e1 2025-02-21 sUSDe 5 appels / 3 positions ; e2 2025-10-10/11 WETH 239 / 194 (29 hors fenêtre), 28 `DeficitCreated` dont 4 in_event (3 sous la règle prereg), Σ déficit 180 k$ ; e3 2026-01-19 1 / 1 ; sources d'oracle constantes par événement ; Dunn : seul e2 (194 > 99) calibrable à α = 0,01.

## Branchement (CA-11)
Sortie `annex` ; consommateur U-4 (test réservé `u4_calibrates_from_u3_realized_labels`), U-7 ; `fleet.ts` inchangé.

## R-25
825 sous la pathspec UNION (≤ 1 205 ; cible « 400 » du G0 = récurrence corrigée par C-4, `error_origin` planificateur).

## error_origin
Plan (source gitignorée, cible R-25, cross-checks) : planificateur. D-1 (leg déficit abandonnée), D-4 (impl par storage), D-5 (jointure sans tx) : worker ; D-5 non détectée : G2. C-G2-1..6, C-V-2/3 : worker. Mission G2 avec commits inversés : orchestrateur.

## Items formés
- **Attribution du bad debt inter-tx à Y_{i,e}** (D-5) : déclencheur checkpoint-1 U-4, propriétaire orchestrateur.
- Mapping impl → release taguée `aave-v3-origin` (U-7) ; `deficit_base_no_price` (commodité) ; PR-U1-1 Perez Eq. 3 paginée (procurement investisseur, citation U-7) ; règle U-4 : prereg committé avant le lancement du worker.
