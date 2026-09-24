# Checkpoint-2 — livrable P1-b1 (ADR-M017), gel K-C `149b535` sur `lot/p1-b1`

Validateur-humain (`claude-fable-5-1`, instance séparée, contexte frais), rendu le 2026-09-19 ~00:45 UTC.
Artefacts lus par SHA (`git show`), jamais le fil du worker : ADR-M017 `a814973`, CHECKPOINT1-M017 et G1-lot-p1b1 `149b535`,
`git diff a814973 149b535` (11 fichiers), ADR-M018 `88197f3`, CA-11 (`validateur-humain.md:124-130`).

## Re-exécution (AM-2, Bash vérification seule, mutants en scratchpad)
- `npm run ci` 289/289 ; lint 0 ; ratchet 69/69 ; lang-gate root 0 ; export:check 0.
- Diff `a814973..149b535` sur `schemas packages/contracts packages/hikae packages/monark apps/site apps/sentinel` : vide.
- Trace h5 : sha256 LF `f4014c16…3490` == `TRACE_SHA256_PINNED` ; diff = 1 ligne (`steps[1].result.response_sha256`).
- Table sha G1 §1 : 10/10 identiques. Projection `attested` == frozen strippé (sha `354ac2b0…`), `required == [prediction, params]`.
- « guarantee »/« verified » nu dans le schéma publié : 0 hit ; description `gate` : seule la négation « not re-verified at call time ».
- Chemin concordant rejoué (prix `AttestedPrice` réel de l'étape `attest` de la fixture) : décision deepEqual à l'appel sans `attested`, `verdict.residual = []` (b1 ne file pas — portée déclarée).
- Mutants : m1 `?? []` → (2) rouge ; m6 messages échangés → (2) rouge ; m0 garde neutralisée → (2) rouge ; m3 schéma non strippé → (1) rouge, **(6) survit** ; m4 phrase (iv) blanchie → (4) rouge.
- Intégrité : `git status` vide avant/après, HEAD `149b535`, aucun `git` mutant.

## Checklist
CA-1..5 conformes au plan (portée == D5 b1, rien de plus) ; CA-3 correction (statut ADR périmé). CA-6, CA-9 : oracle re-exécuté + G2 fraîche
`claude-opus-4-8[1m]`. CA-7 : aucun dû nu. CA-8 : correction F3 (D4(5) cite `a40c169`). CA-10 : 259+/35−.
**CA-11 Branchement : accepté comme lot intermédiaire, sans escalade** — ADR-M018 D2 dit « consommé par `gate` via `attested` à partir de P1-b2, test (3) » ;
b1 déclare « non filé : `residual` (b2) », test (3) nommé, ordre b2 < b3 imposé. Conditions : (a) P1 non clôturable et aucune revendication publique
« attest consommé par gate » avant le checkpoint-2 de b2 avec test (3) vert ; (b) **déclencheur** : si b2 n'atterrit pas, la prise `attested`
(clé, phrase, garde) est retirée, jamais laissée en jeton.

## Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée, pliées dans b2)
| # | Correction | error_origin |
|---|---|---|
| K2-1 | ADR-M017 D6 affirme que `gate:vocab` contre « verified » : faux (aucun motif en scope harness ; scrub `PROBATIVE` de `attest.test.ts:109` ne couvre que `ATTEST_TOOL_DESCRIPTION`). Étendre le scrub live/verified/probative à `GATE_TOOL_DESCRIPTION` (négations masquées) + réécrire D6. | planificateur ; manqué au checkpoint-1 (AM-1) |
| K2-2 | Commentaire `openapi.test.ts` (6) « the projection un-stripped reddens here » : faux mesuré (m3 survit en (6), tué par (1)). | worker |
| K2-3 | ADR-M017 : statut « proposé / re-checkpoint dû » périmé après `fe83ea2` ; D4(5) cite `a40c169` au lieu de `a814973`. | orchestrateur |
| K2-4 | ADR-M017 sans section « Tuyaux » (M018 D3) : ajouter entrée/sortie/état/test pour `attested`. | processus (règle postérieure) |
| K2-5 | ADR-M018 absent de `lot/p1-b1` : clôture de P1 exige M018 sur `main`. | orchestrateur (ordre de fusion) — résolu par la fusion `f248907` |

G2 F1 (test ordre des gardes, m5) et F4 (date builder) → b2 / pré-existant. **Prêt pour P1-b2 : OUI.**

## G7 (orchestrateur, 2026-09-19)
Verdict G7 **CLOS** pour b1 : oracle, G2 fraîche, checkpoint-2 concordants ; corrections K2-1..K2-4 + F1 = Sprint Backlog de b2 ; K2-5 résolu par la fusion
`lot/p1-b1 → lot/etude-suite` (`f248907`). Manqué au checkpoint-1 (D6 inexact) consigné, `error_origin` planificateur.
