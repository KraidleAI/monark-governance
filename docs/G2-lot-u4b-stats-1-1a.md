# G2 — lot U-4b-STATS-1, unité 1a — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# G2 — U-4b-STATS-1, unité 1a (`564292d`, base `50f78b0`) : **PASS-AVEC-CORRECTIONS**

Aucun comportement faux n'a été trouvé. Tous les défauts sont des épingles de test manquantes. Les 5 corrections sont des ajouts de tests : aucune ligne de l'outil ne change.

**Correctif prêt à poser :** `F:\tmp\g2-u4bstats1\logs\g2-proto-tests.diff` (sha256 `ff461d44f3bfebf22becd91d3191d78d797751f2e27419e8237b7b8cee13f82d`, +95 lignes, 7 tests `g2proto_*`).
- **Où l'insérer :** avant le dernier test de `apps/sentinel/test/u4b-hyp.test.ts`, sans toucher les imports (lignes 1-27, hunk 1 de `1b.patch`) ni la fin de fichier (hunk ancré en EOF).
- **Portes :** vertes sur l'outil livré (19/19) ; 12/12 mutants visés tués byIntended ; gate:vocab, typecheck, lint et lang:gate à 0, ratchet 69/69.
- **Compatibilité avec 1b :** `seam/1b.patch` s'applique encore par-dessus (27/27). Le diff lui-même s'applique aussi sur l'arbre 1a+1b (`git apply --check` exit 0).

## Corrections (liste fermée)

| # | Défaut | Mutant(s) qui survivent (1a ; 1a+1b) | Test tueur (prototype) | error_origin |
|---|---|---|---|---|
| C-G2-1 | Le ruling Q-1 (a) n'est épinglé par aucun test : un NON poolé pourrait faire basculer le prédicat :359 sans que rien ne rougisse | G05 ; G05 | `g2proto_pooled_non_is_reported_outside_the_359_predicate_q1a`. Au G2-delta de 1b, le même cas est à poser au niveau `clause359` | orchestrateur : ruling postérieur au G1, sans exigence de test (part worker : (a) déclaré sans épingle) |
| C-G2-2 | C-3 (i)/(iii) n'est prouvé qu'au niveau `h3Cell` : `computeH3` peut recalculer q̂ au lieu de le lire sans qu'aucun test le voie. Les gardes `n_min` et `score` ne sont pas testées | G06, G07, G17, G18 ; les mêmes | `g2proto_tampered_meta_qhat_is_refused_through_computeH3`, `g2proto_producer_drift_n_min_and_score_guards_refuse` | worker |
| C-G2-3 | Les valeurs chiffrées de C-11 ne sont pas assertées : E[K], couvertures, manque, écart, atomes, `qhat_is_max`. En 1a+1b, seule les attrape l'épingle de régression T17, produite par l'outil lui-même et sans aucune cellule NON | G10 à G14 ; T17 seul | `g2proto_c11_fields_on_non_cell_equal_closed_forms`, `g2proto_atoms_ties_and_qhat_is_max_match_prereg_counts` | worker |
| C-G2-4 | L'exactitude de la décision n'est pas épinglée. Une régression en flottant serait fail-open (NaN ⇒ OUI) dès n ≈ 12 000 pour N = 565 : 0 cas jusqu'à n = 10 000, 351 à n = 12 000 | G02 ; G02 | `g2proto_level_decision_exact_where_float_cannot_tell` | worker |
| C-G2-5 | La frontière E2_MIN_N n'est épinglée que d'un côté (49) : n_e2 = 50 doit être testé | G03 ; G03 | `g2proto_e2_min_n_boundary_50_testable_49_not` | worker |

**Mutants non retenus comme corrections :**
- G01 (`pOfN` en flottant) est équivalent : 0 divergence sur n ∈ [1, 5·10⁷].
- G20 (sha comparé sur 8 hexa) est équivalent en pratique : seule une préimage partielle de 32 bits le tuerait.
- G08 et G09 (phrase C-11 retapée en dur) sont tués par `lang:gate`, qui tourne en CI (`ci.yml:95`).

## Items à traiter

- **I-G2-1 :** `VERDICTS` n'a aucun consommateur, ni en 1a ni après 1b. Déclencheur : G2-delta de 1b.
- **I-G2-2 :** la chaîne d'import `u4b-hyp → u4b-scores → abi.ts:7 → rpc.ts` (`TRANSFER_TOPIC`) rend l'outil de l'étape 6d dépendant de `rpc.ts`. Le pli NARABI-OPS-1d doit inclure 6d dans sa liste de déclenchement ou préserver `TRANSFER_TOPIC`. Déclencheur : G0/G1 de ce pli.

## Vérifications faites

- **Exécution indépendante :**
  - Oracle sur le clone `564292d` : 7 gates à 0, 933/932/0/1.
  - Harnais du worker recopié (seules les 4 constantes de chemin changent) : 16/16 mutants tués byIntended.
  - R-25 avec le pathspec verbatim de `ci.yml:65` : 640.
  - A-6 : 13/13 invariants identiques.
- **Fusion à blanc sur `dc364cb`, pointe du moment :** 0 conflit ; 949/947/0/2. Aucun commit jusqu'à `b147db0` ne touche les fichiers du lot, donc la fusion reste représentative.
- **Export public :** 327 fichiers sur 328 sont octet-identiques. Seul `EXPORT-MANIFEST.json` gagne une ligne `excluded_tests`, ce qui est voulu.
- **Statistique :** la dérivation par rangs est correcte et complète, y compris l'argument des atomes (K fermé ≥ K départagé point par point). Un code indépendant, qui n'importe pas l'outil, reproduit exactement les masses Q6 et les p-values du G1.
- **Erratum O-6/I-5 :** le blob `50436e8f…` est identique au golden du journal de mutants écrit avant la coupure (21:34Z) et à `seam/1a`. L'arbre de `564292d` est identique à `tree-1a` (`f6670e0c…`).

## Dérive des arbres pendant la revue, et advisor

- **AM-2 (dérive, pas de mon fait) :**
  - `F:\Monark` est passé de `7c70826` à `b147db0` : 17 commits, tous de l'auteur Kraidle.
  - À 00:02:20Z, un tiers a réécrit le worktree `F:\Monark-wt-u4bstats1` : état 1b plus les tests VX-1/3/5/6 du cp-2. Le fichier de test y est `bf1301c5…`, différent de celui de DELIVERED-1b.
  - Toutes mes écritures sont restées sous `F:\tmp\g2-u4bstats1\`. Mes commandes sur les deux arbres protégés étaient en lecture seule.
  - Convergence avec le cp-2 : son VX-5 recoupe mon G18, son VX-1 mon constat sur T7. Tous mes mutants et prototypes datent d'avant ce que j'ai vu du cp-2 : le diff du worktree à 00:03Z, puis son résumé dans `CHANTIERS.md:919` à 00:10Z. Je n'ai pas ouvert le document cp-2.
- **Advisor :** le premier appel (23:38Z) a expiré, c'est consigné. Le second (~00:05Z) a répondu ; ses avis ont été suivis après vérification.

Files are in `F:\tmp\g2-u4bstats1\` :
- G2-1a.md — sha256 `c4b1c14b5ea8334998769139665ddfd57c29ac2e3c1d7121ec66808f5f01deaa`, LF, 0 NUL
- logs\
- logs\g2-proto-tests.diff
- g2-mutants.mjs — sha256 `239d8404c424549d065b3a9d216e410b81700c2374009607b6311929393d0aae`
- logs\am2-before.log
- logs\am2-after.log
- logs\a6-invariants-g2.log
