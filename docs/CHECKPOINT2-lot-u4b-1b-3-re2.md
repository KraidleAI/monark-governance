# Re-checkpoint-2 (micro-pli 1bcfbd7) — lot U-4b-1b-3 — validateur-humain (claude-fable-5-1), 2026-09-22

Modèle résolu : claude-fable-5-1

# Re-checkpoint-2 — micro-pli U-4b-1b-3 (`d2e36ac..1bcfbd7`, `lot/u4b-1b-3`) — **ACCEPTE** (condition CA-6 levée : G2-delta PASS lu, `docs/G2-lot-u4b-1b-3-delta.md`)

## 1. Artefacts lus (contexte frais)
`F:\tmp\u4b1b3\RENDU-MICROPLI.md` ; en-tête + corrections du G2-delta ; diff `d2e36ac..1bcfbd7` en entier (1 fichier, test seul, +27/−2) ; harnais v3 `F:\tmp\u4b1b3\mutants.mjs` (sha `ae99d1aa…`, 25 mutants). Golden `.mjs` `20e1cf9d…` et `.d.mts` `30d61b79…` inchangés (blobs `b1ff123c` / `20238d31`) ; test `696c7c03…` → `89fefa8d…` (blob `07dd5867`).

## 2. Re-exécuté dans mon clone `F:\tmp\cp2-u4b1b3\tree-delta` (`git fetch` + checkout `1bcfbd7`, status 0, `env -u` des 8 clés, TEMP sur F:)
| vérification | mesuré |
|---|---|
| Oracle | **`test` 935/934/0/1** (skip = `u4b_labels_replay_via_main_real_artifact`, préexistant), `typecheck 0`, `lint 0`, `lang:gate 0` ; 0 `UV_HANDLE_CLOSING`. |
| R-25 | pathspec `ci.yml:65` verbatim `b900b4b..1bcfbd7` : **3 fichiers, 448+/24− = 472** (< 1 205). |
| A-6 | recalculé (`git show b900b4b:` vs `1bcfbd7:`, LF) : **11/11** identiques ; prereg intact. |
| Mutants (harnais v3 repointé sur le clone) | **24/24 tués par leur test nommé** (cœur M1..M17 + **D4** ; extra D6, M18..M22), **D7 survit comme déclaré équivalent** ; baseline 32/32 verte ; `ALL_RESTORED=true FINAL_GOLDEN_INTACT=true`, golden `20e1cf9d` avant == après. M9 rougit désormais 5 tests (chaque refus épinglé). |
| Nouveau test « sans objet `block_ts_extra` » (lu, `:686-707`) | asserte, pour la clé absente ET `null` : `SelectError` nommée `/with no block_ts_extra object/`, 0 fetch (stub rejetant compté), **`locksUnder(w.l) == []`** (scan récursif des `.lock`), répertoire de cycle jamais créé, **sidecar octet pour octet identique**. Fixture `sha256Hex(canon(null))` : seules les gardes self-sha/discover_sha passent, la garde d'objet refuse seule (M18/M19/M22 rouges confirmés ici). |
| Mon mutant **VX-L2** (le refus « sans objet » réécrit d'abord le sidecar en `{}`) | **RED** par ce seul nouveau test (assertion d'intégrité du fichier). (Un premier essai VX-L était syntaxiquement invalide — consigné, non compté.) |
| Fusion à blanc avec `origin/lot/etude-suite` HEAD **`15fb00a`** (HEAD au moment du fetch) | « Automatic merge went well », 3 fichiers 448+/24− ; suite sur l'arbre fusionné **947/945/0/2** (2ᵉ skip = `sentinel_run_releases_chainstack_lock_on_sigterm`, skip win32 déclaré, préexistant sur `etude-suite`) ; abort, clone rendu à `1bcfbd7` status 0. `lot/etude-suite` a depuis avancé à `a703e24` (commit orchestrateur « Power cut n2 », reflog lu) — à refusionner au G7, docs seuls a priori. |

## 3. Checklist (delta)
CA-1 conforme (C-GD-1 a/b/c/d et C-GD-2 : une phrase, un test, un mutant chacun). CA-2 n-a (test seul). CA-3 conforme (ADR v2 inchangée ; C-GD-3 = texte au fold). CA-5 : ligne MAST « Blocage par ressource » à mettre à jour au fold (désormais mesurée refus par refus, D4/D6/M18). **CA-6 conforme** : oracle re-exécuté + G2-delta PASS rendu. CA-7 : items formés (C-GD-3, O-1 élargi, O-D3, O-D4, O-MP-1/2) — aucun dû nu ; **ma C-1 (VX-B : emplacement du tmp non testé) reste un item formé**, déclencheur inchangé. CA-8 conforme (`claude-opus-5-5[1m]` ; générateur ≠ G2-delta ≠ moi). CA-9 conforme (tout ci-dessus re-exécuté). CA-10 conforme (micro-pli 29 lignes). CA-11 inchangé (compositions exécutées depuis l'artefact réel ; registre public cohérent). Anti-close n-a.

## 4. Décision : **ACCEPTE**
Corrections de mon avis précédent maintenues telles quelles pour le fold/G7 (propriétaire orchestrateur) : C-1 (item formé VX-B), C-2 (fold ADR v2 + journal de la mesure §3, erratum C-V-3 inclus), C-3 (`error_origin` de la régression C-V-1 ; ligne de provenance sur `docs/PLI-lot-u4b-1b-3.md`), C-4 (flush du `catch` sous R-BORNE-2). Rien de mesuré ne bloque le G7.

## 5. Preuve AM-2 ter
`F:\Monark` : HEAD `15fb00a` → `a703e24` pendant ce checkpoint = **commit orchestrateur** (reflog 22:48:59 +0100) ; le seul status après = `?? docs/CHECKPOINT2-lot-bell-shortpage-1.md`, fichier d'un autre agent, pas le mien ; `lot/u4b-1b-3` = `1bcfbd7` avant/après. `F:\Monark-wt-u4b1b3` : status 0, HEAD `1bcfbd7`, shas `20e1cf9d` / `89fefa8d` avant == après. Clone : passé par `cp2-merge-blank2` (abort + branche supprimée), à `1bcfbd7` status 0 après 25 + 2 mutants. Écrits : `F:\tmp\cp2-u4b1b3\{mutants-delta.mjs, mutant-vxl.mjs, logs-delta\}` seulement.

**AM-1 — attrapé** : rien de nouveau au micro-pli (les trous C-GD-1/2 venaient du G2-delta, mon avis précédent ne les avait pas vus : liberté de verrou vérifiée globalement, pas refus par refus — **manqué, consigné**). Mon mutant VX-L2 confirme que le nouveau test tient l'intégrité du fichier.
