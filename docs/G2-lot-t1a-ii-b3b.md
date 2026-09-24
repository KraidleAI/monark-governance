# G2 — Revue 100 % du lot T-1a-ii-b3b (Bell : clôture cash Databento, croisement Massive, delta de halt, calendrier)

Relecteur G2 `claude-opus-4-8[1m]` (effort max, R-1), instance séparée à contexte frais, 2026-09-20. Gel `e0de31d`, base `2da0bf5`, cible `lot/etude-suite` `e9c17b5`. Aucun `git` mutatif ; mutants en copie froide `F:\tmp\g2-b3b` avec restauration sha-exacte ; aucun appel Databento/Massive ; aucune clé ni close réel imprimés. Consultation advisor faite avant la campagne (avis, non verdict). Transcrit par l'orchestrateur depuis la sortie finale du relecteur (le relecteur n'écrit pas dans l'arbre, R-20).

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS — C-G2-1 (non bloquante, liste fermée)

## Chiffres re-mesurés
| Contrôle | Mesure |
|---|---|
| `npm run ci` (worktree) | **464 / 464, 0 fail**, exit 0 (31,6 s) ; `git status` vide avant et après |
| `lint` / `lint:ratchet` / `lang:gate` / `export:check` | 0 / 69/69 / 0 hit / 0 chemin interdit |
| Tests bell + racine | 81 + 91 = **172** (= PLI) ; 12 nouveaux bell |
| Copie froide `npm ci` / `npm audit` | exit 0 (282 paquets) / 0 vulnérabilité |
| R-25 (pathspec `STAT=` ci.yml l.65) `2da0bf5..e0de31d`, `2da0bf5...e0de31d`, `e9c17b5...e0de31d` | **636 + 74 = 710** dans les trois cas ≤ 1 205 ; `halts-tsla-synth.csv` compté ; `series/**` exclu |
| `git merge-tree --write-tree e9c17b5 e0de31d` | propre (`82e7dd9a…`) |
| `PINNED_BELL_SHA` | `0cfbed20fc7ab4391b687d870452211cdce02c3cc19ab1cc8f0425a3c24743d7` ; soustraction (`earliest_publish_utc` + 2 clés `cash_cross_*`) ⇒ `126abfae…` (pin -b3a, vérifié à `2da0bf5`) ; non-vacuité vérifiée |
| Coût Databento | 0,000031292439 $ (lu hors dépôt) ; dérivation 20 records × 56 o [abs] ⇒ 27,94 $/GB décimal, 30,00 $/GiB binaire — corrobore décision 53, écarte « 0,40 $/GB » (niveau service) |
| Bruts hors dépôt | 5 sha256 = PLI §2 = PROVENANCE ; forme vérifiée sans imprimer : `close` chaîne 12 chiffres, `hd.ts_event` minuit UTC, pas de champ `symbol` |

## Axes
1. **Fidélité G0 / C-1..C-11** : les 11 pliées et correctes ; ADR D1-quinquies porte les tuyaux (entrée/sortie/état/test) ; tous `upcoming` ; MWCB ABSENT, PR-B-8 bloquant release, aucune constante.
2. **CA-11** : `bell_close_databento_replays_synthetic_fixture` (`collect.test.ts:634-675`) pilote réellement `runMain(argv, deps)` hors ligne et asserte sur `state.json`/`provenance.json` produits ; aucune regex sur le source ; g_t dérivée hors code (`ln(365/364)`). L-3 exécute la composition CSV réel + fills réels → `collect()`.
3. **ESC-1 c** : diff `digest.ts` = ajouts seuls ; `CLOSE_KEY`, `assertNoClose`, `isNumericLike`, exemption `(?<!no_)` inchangés ; clés `cash_*` hors motif ; aucun close en clair.
4. **C-5** : `scaledFromDecimal` pad/tronque 9 décimales, comparaison BigInt ; tueurs verts.
5. **C-6** : `earliestPublishUtc = ET 16:00 + 24 h`, DST via `Intl` inchangé ; EDT, EST, demi-séance testés.
6. **C-3** : `halts-tsla-synth.csv` 1 ligne `Symbol=TSLA`, `Name="SYNTHETIC halt row - test fixture, not an NYSE event"`, hors `series/`, encadre les 8 fills réels ; second token en mémoire.
7. **Re-pin** : prouvé (ci-dessus).

## Mutants (copie froide, restauration sha-exacte prouvée)
| # | Cible | Mutation | Tueur | Résultat |
|---|---|---|---|---|
| M1 | close.ts frac9 | padding retiré | `bell_cash_cross_scaled_integer_equality` | RED |
| M2 | close.ts:162 | `===`→`!==` | `bell_read_reference_closes_cross_matched_mismatch_unavailable` | RED |
| M3 | collect.ts:142 | bump mismatch retiré | `bell_cash_cross_mismatch_is_a_named_residual` | RED |
| M5 | collect.ts:565 | seam non consommé | `bell_close_databento_replays_synthetic_fixture` | RED |
| M7 | collect.ts:222 | jointure absente | `bell_halt_delta_brackets_real_fills_integration` | RED |
| M8 | collect.ts:221 | tokens fusionnés | idem | RED |
| M10 | residuals.ts:39 | `cash_`→`close_cross_mismatch` | `bell_residual_counter_passes_close_guard` | RED |
| G2a | collect.ts:154 | bump unavailable retiré | `bell_cash_cross_mismatch_is_a_named_residual` | RED |
| G2b | close.ts:60 | offset EDT figé | `bell_earliest_publish_utc_close_plus_24h` | RED |
| SONDE | close.ts:161 | « clé présente + Massive 5xx/vide » `unavailable`→`matched` | close + collect (37 tests) | **SURVIT** → C-G2-1 |

## Correction (liste fermée)
- **C-G2-1 (non bloquante, `error_origin: generator`)** : branche `close.ts:161` (clé Polygon présente, Massive rejette ou résultats vides ⇒ `cross = "unavailable"` + `cash_cross_unavailable_days`) correcte mais sans tueur. Correctif ≈ 5 lignes dans `bell_read_reference_closes_cross_matched_mismatch_unavailable` (`close.test.ts:73-105`) : cas `polygonKey` présente + `polygonGet` qui rejette (ou `{results:[]}`), asserter `crossByUnderlying.TSLA[day] === "unavailable"` et `cash_cross_unavailable_days`. À plier avant le G7.

## Signalements (non corrections)
- O-1 : le fil `BELL_HALTS_CSV → runMain → haltsSince` n'est pas rejoué en composition (L-3 conforme au G0 via `collect()`) ; affinage 2 lignes possible en -b1-bis.
- O-2 : `close.ts:162` `scaledFromDecimal(String(massiveC))` hors try/catch (inatteignable depuis un close réel) ; symétrie au choix du checkpoint-2.
- O-3 : numérotation PLI saute M4.

## Intégrité
R-20 respecté ; worktree et dépôt cible propres (HEAD `e0de31d` / `e9c17b5`) ; copie froide isolée sous `F:\tmp\g2-b3b`.
