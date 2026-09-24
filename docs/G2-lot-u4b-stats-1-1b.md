# G2-delta U-4b-STATS-1 — 1a-corr 66141fb PASS ; 1b 4c5fa8d PASS-AVEC-CORRECTIONS — relecteur claude-opus-5-5, 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# G2-delta U-4b-STATS-1 — 1a-corr `66141fb` : **PASS** ; 1b `4c5fa8d` : **PASS-AVEC-CORRECTIONS**

1b contient un défaut de code réel : un chemin `--out` dont le nom commence par `..` échappe à la garde, et le rapport est alors écrit dans le dépôt (mesuré). La statistique, H-4, H-6, la clause :359 et le rapport sont justes ; le reste des corrections porte sur des tests manquants.

**Correctif prêt :** `F:\tmp\g2-u4bstats1\logs\g2-proto-1b.diff` (sha256 `137b0b11b551b0bebe47b7cd1146d8b5cf6f12564272dbbb399c2a7dd98f4b07`, +133/−3, R-25 = 136).
- **Contenu :** 2 lignes de correctif dans `outOfRepo` et 7 tests `g2proto1b_*`.
- **À appliquer en entier.** Les tests seuls laissent le test `..` rouge et, sur l'outil livré, écrivent brièvement un fichier à la racine du dépôt (retiré par `finally`).
- **Applicabilité :** `git apply --check` exit 0 sur `4c5fa8d` et sur l'arbre fusionné `fad24ab` + `4c5fa8d`.
- **Résultats :** 37/37 tests du fichier ; 15/15 mutants visés tués byIntended ; 7 gates à 0 ; 958/957/0/1 ; ratchet 69/69.
- **Hors diff :** la phrase RUNBOOK de C-G2D-2 (ii) est à rédiger par vous.
- **Topologie de fusion :** trois segments first-parent (735, 826, 136).

## Corrections (liste fermée)

| # | Défaut | Mutant / preuve | Test tueur | error_origin |
|---|---|---|---|---|
| C-G2D-1 **(code)** | `outOfRepo` accepte tout chemin dont `relative()` commence par `..`, y compris `<ROOT>/..x`. Correctif : `rel === ".." \|\| rel.startsWith(".." + sep) \|\| isAbsolute(rel)`. En plus, T17 accepte l'`EEXIST` de Node comme refus d'écrasement | sonde `logs\probe-outofrepo.log` ; D19 ; D23 | `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository` | worker |
| C-G2D-2 | (i) Q-1 (a) n'est pas épinglé au niveau `clause359`. (ii) RUNBOOK `:501` dit encore « demande formée » et omet la règle « poolé NON ⇒ porté à l'investisseur avant l'application de U-6 » (`CHANTIERS.md:913`) | D15, D16 | `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` + une phrase dans `:501` | orchestrateur (RUNBOOK-DELTA rédigé à 22:22Z, avant le ruling journalisé à 23:24Z) |
| C-G2D-3 | H-4 : départage `log_index`, frontière 1/20 (OUI) et trois gardes (y < Σ, `n_calls`, ligne réalisée sans appel) non épinglés | D02, D03, D04, D07, D08 | `g2proto1b_h4_boundaries_and_guards` | worker |
| C-G2D-4 | H-6 : retard indéfini (valeur seulement future) et conflit de valeurs au même bloc non épinglés | D11, D12 | `g2proto1b_h6_future_value_and_same_block_conflict` | worker |
| C-G2D-5 | Gardes census H-5 et H-2bis, et compteur `deficit_base_no_price_non_usdt`, non assertés | D21, D22, D13 (rouge par l'épingle T17 seule) | `g2proto1b_census_guards_refuse`, `g2proto1b_labels_deficit_base_no_price_non_usdt_only` | worker |
| C-G2D-6 | Item I-G2-1 tranché : **consommer `VERDICTS`** (ensemble fermé C-1), ne pas le retirer | D24 | `g2proto1b_verdicts_closed_set_c1` | worker |

**Item I-G2D-1 (orchestrateur, avant l'étape 6a) :** C-G2D-1 change les octets de l'outil (`07e25e19…` → blob du pli ; `65b0d8f9…` dans mon prototype).
- Le sha consigné au sidecar 6 doit être celui du blob **après** ce pli ; cela remplace I-3 du G1 (« après 1b »).
- Le pli doit être fusionné avant 6a.
- `body_digest` n'est pas touché, parce que la provenance est hors digest : l'épingle T17 reste valide.

## Vérifications

- **1a-corr :** `66141fb` est mon prototype octet pour octet (`cmp`). Mes 12 mutants de C-G2-1..5 sont tous tués sur `4c5fa8d`.
- **Composition de 1b :** `4c5fa8d` = `66141fb` + `seam\1b.patch` v2 + les tests VX du cp-2 ; les blobs de l'outil, du `.d.mts` et du RUNBOOK sont identiques.
- **Oracle `4c5fa8d` :** 7 gates à 0, 951/950/0/1 ; les 46 mutants du worker sont tués byIntended.
- **Mes mutants de 1b :** 9 tués sur 23 ; 14 ne sont pas tués byIntended (13 survivants + D13), et tous le sont par les prototypes.
- **R-25, pathspec verbatim `ci.yml:65` :**

  | Segment | R-25 |
  |---|---|
  | `50f78b0..66141fb` | 735 |
  | `66141fb..4c5fa8d` | 826 |
  | lot entier | 1 535, au-dessus de 1 205 |

  Le lot n'est acceptable que fusionné en plusieurs segments first-parent.
- **A-6 :** 13/13 invariants intacts.
- **Export :** 327 fichiers sur 328 octet-identiques ; le manifeste gagne une ligne `excluded_tests`.
- **Fusion à blanc sur `fad24ab`** (contient A-9, U-4b-1b-3 et HARNESS-DESC-1) : 0 conflit, 7 gates à 0, 988/986/0/2.
- **Rapport :**
  - `body_digest` recalculé par un code indépendant : `49b138c3…`, identique au digest écrit.
  - Aucun jeton de décision, aucune horloge.
  - Octets identiques pour trois formes d'invocation.
  - Refus des drapeaux interdits confirmé.

## Dérive des arbres et advisor

- **Worktree :** inchangé (`4c5fa8d`, propre).
- **`F:\Monark` :** passé de `f1b9f5d` à `fad24ab` (1 commit Kraidle), plus un fichier non suivi d'un tiers que je n'ai pas ouvert.
- **Mes écritures :** uniquement sous `F:\tmp\g2-u4bstats1\`. Les `node_modules` des clones ont été retirés avec des chemins littéraux ; `F:\Monark\node_modules` est inchangé (218 entrées, `@monark` 10).
- **Advisor :** appelé une fois (~01:35Z) et a répondu. Ses cinq points ont été vérifiés sur pièces avant d'être suivis.

Files are in `F:\tmp\g2-u4bstats1\` :
- G2-1b.md — sha256 `a106adf597cfec0fbbed87b2ff580d95bca8e2c82e3bc4059bc0e731e16325ef`, LF, 0 NUL
- logs\g2-proto-1b.diff
- g2-mutants-1b.mjs — sha256 `d4421f50be1190ae6b6219c41332657b49e0ee4c831638126f0576561fd63d59`
- logs\g2-mutants-1b-E.log
- logs\g2-mutants-1b-F.log
- logs\am2-before-1b.log
- logs\am2-after-1b.log
- logs\a6-invariants-1b-g2.log
- G2-1a.md (G2 de 1a, sha256 `c4b1c14b…`)
