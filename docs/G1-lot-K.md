claude-opus-4-8[1m]

# G1 — Journal de provenance, Lot K (UKEMI Phase 2)

> **GATE-0 (R-1)** — modèle résolu de l'écrivain, vérifié tel quel : `claude-opus-4-8[1m]`
> (préfixe `claude-opus-4-8` attendu ; effort `max`). Worker Opus 4.8, siège worker (aucune écriture
> en siège orchestrateur ; D10 non déclenché — aucune mort sur limite d'usage).

## 1. Provenance

| Champ | Valeur |
|---|---|
| Modèle | `claude-opus-4-8[1m]`, effort `max` (roster D10 ADR-M003 ; CLAUDE.md mainteneur 2026-08-14) |
| Date | 2026-09-05 |
| Contexte | Lot K = UKEMI Phase 2 (ADR-M003 D1/D6, D11 tests 34-37) ; worktree `F:\Monark-wt-ukemi2`, branche `lot-k-ukemi2`, base `main c8ac1b5` |
| Écriture | siège worker (pas de déviation D10 : le worker n'est pas mort sur limite d'usage) |
| Revue | G2 delta DUE : relecteur `claude-opus-4-8` séparé, contexte frais, **mutants re-exécutés** (D10bis) — non faite par ce worker |
| Verdict | G7 orchestrateur + acceptation validateur-humain (checkpoint 2) — non faits par ce worker |
| Commit | **aucun** (R-20 : seul l'orchestrateur committe) ; **aucun push, aucun réseau dans les tests** |

## 2. Rattachement normatif (G0)

ADR-M003 **D6** (D6.1 conformeur `interval` ; D6.2 classe `ukemi-liquidable-24h` α=0.01 paires
synthétiques ; D6.3 coûts `(α,β)` Rogers-Veraart), **D10bis** (revue système), **D11** tests 34-37.
Source d'ingénierie [lu] : `F:\Clawpumptech\procurements-lectures\P-K4-1-rogers2013.md` (citée par
section Q, jamais le papier de mémoire ; PDF non lu).

## 3. Fichiers touchés (état livré)

**Modifiés** (tracked, `git diff --stat` = 7 fichiers, +200 / −52) :

| Fichier | Objet | sha256 (livré) |
|---|---|---|
| `packages/ukemi/src/clearing.ts` | `fictitiousDefault/clearingFromBelow/clearing/phi` généralisés `(α,β)` ; `ClearingResult.{alpha,beta}` | `0052db0d127b572c80e1d164dc19cec6493be90af748e549c64ebec852601173` |
| `packages/hikae/src/l3-gate.ts` | throw `interval` LEVÉ ; chemin `decideInterval` ; champ `GateInput.tauInterval` | `5d77eeaeb72cedb1cdb439b138bd02d70116078f274a2460da4059377e04c425` |
| `packages/hikae/src/index.ts` | exports conformeur `interval` + classe `ukemi-liquidable-24h` | — |
| `packages/hikae/src/s2/instrument.ts` | `baseInput` : `tauInterval` (inerte, chemin `set`) | — |
| `packages/hikae/test/l2.test.ts` | `commitInput` : `tauInterval` (inerte) | — |
| `packages/hikae/test/l3.test.ts` | `input` : `tauInterval` (inerte) | — |
| `packages/ukemi/README.md` | section Phase 2 `(α,β)`, unicité perdue, contrôle négatif, niveaux [lu] | — |

**Nouveaux** (6 fichiers d'artefact ci-dessous + **ce journal** `docs/G1-lot-K.md` = 7 non-suivis au `git status` ; ~435 lignes d'artefact) :

| Fichier | Objet | sha256 (livré) |
|---|---|---|
| `packages/hikae/src/interval-conformer.ts` | conformeur `interval` (réutilise `splitQuantile`) | `49395698c24e3a215b027a7ce8216b7ef3834b66446df50a23f1b4f3b1e90830` |
| `packages/hikae/src/liquidable-24h.ts` | générateur synthétique seedé (réutilise `mulberry32`) | `757a8df7d91da6da2b0bbea059cf1462125b117f6e0d17d5b3afadd2c5e9d1f7` |
| `packages/hikae/test/interval-conformer.test.ts` | test **34** | — |
| `packages/hikae/test/interval-gate.test.ts` | test **35** | — |
| `packages/ukemi/test/clearing-rv.test.ts` | tests **36** et **37** | — |
| `packages/ukemi/test/fixtures/ex33-two-bank.json` | fixture Ex. 3.3 (JSON pur) | — |

`packages/hikae/src/l1-split.ts` (`splitQuantile`) est **inchangé** : le conformeur `interval`
réutilise la fonction de quantile `⌈(n+1)(1−α)⌉` existante (D6.1), ne la réécrit pas.
Contrats gelés (`packages/contracts`, `schemas/*.json`) : **inchangés** — `contracts_frozen` vert.
Aucune dépendance npm nouvelle (R-8 : aucune attendue, aucune ajoutée ; `package-lock.json` non modifié).
Taille totale ≈ 687 lignes (200+52 modifiés + 435 nouveaux) < `VIBEGATES_PR_LIMIT` 1205 (D9) ; R-25 respecté.

## 4. Livrables (mapping A-G)

- **A** `interval-conformer.ts` : score `|y−ŷ|`, `q̂ = ⌈(n+1)(1−α)⌉`-ième trié (via `splitQuantile`),
  région `[ŷ−q̂, ŷ+q̂]` ; `CoverageVerdict` validé **ajv strict** au test 34 (montage identique à
  `prediction.test.ts`) ; fail-closed sous-calibration = `underCalibVerdict` (littéral gelé partagé).
- **B** `l3-gate.ts` : throw levé ; `interval` → COMMIT si `intent ∈ [lo,hi]` ET `(hi−lo) ≤ τ_interval`,
  DEFER (`interval_too_wide`) si largeur `> τ_interval`, ABSTAIN (`intent_not_in_region`) sinon ;
  gardes amont hoistées (byte-neutre pour `set`) ; `τ_interval` commenté « déclaré non fondé, D6.1 ».
  **Aucune régression `set`** : tests `set` (l2/l3/s2) verts, digests S2 inchangés.
- **C** classe `ukemi-liquidable-24h` : générateur seedé `mulberry32` (réutilisé), n=300, α=0.01 ;
  ligne D10 imposée (§7).
- **D** `clearing.ts` : `fictitiousDefault(sys, α=1, β=1)` (éq. 1 / GA Def. 3.6) ; `clearing` rapporte
  `L*` (GA) et `L_*` (depuis 0, réserve « pas continue par le bas » consignée) et `unique`.
- **E** tests 34-37 + 4 mutants (§6).
- **F** `npm run ci` vert (§5) ; README ukemi section Phase 2.
- **G** ce document.

## 5. Sortie CI (`npm run ci`, racine du worktree, exit 0)

```
> npm run gate:vocab && npm run typecheck && npm run test
gate:vocab OK — scanned 36 file(s), no forbidden claim.
> tsc --noEmit         (0 erreur)
> node --test "test/*.test.ts" "packages/*/test/*.test.ts"
ℹ tests 81
ℹ pass 81
ℹ fail 0
ℹ duration_ms ~590
```

Passage de 77 (Phase 1) à **81** tests : +`interval_conformer_coverage`, +`interval_gate_commit_defer_abstain`,
+`clearing_alpha_beta_regression_en`, +`clearing_rv_ex33_two_vectors`. Sortie complète capturée
(rejouable : `npm run ci` après `npm install --offline --no-package-lock`).

## 6. Mutants (E) — un par test, rouge puis restauration byte-exact vérifiée

Protocole : sauvegarde → sha256 avant → `sed` mutant → `node --test <fichier>` → restauration →
sha256 après. **sha256 avant == après pour chaque fichier** (restauration à l'octet prouvée).

| Test | Mutant (sed) | Fichier | Effet | Run | sha256 avant = après |
|---|---|---|---|---|---|
| 34 `interval_conformer_coverage` | `sorted[p-1]` → `sorted[p-2]` (q̂ décalé d'un rang) | `l1-split.ts` | assertion exacte `98 !== 99` | **RED** (exit 1) | `9543f161…a576a479` (=) |
| 35 `interval_gate_commit_defer_abstain` | `width > tauInterval` → `width < tauInterval` (τ inversé) | `l3-gate.ts` | `'defer' !== 'commit'` | **RED** (exit 1) | `5d77eeae…7e04c425` (=) |
| 36 `clearing_alpha_beta_regression_en` | A-matrice `: 0) - beta *` → `- 0.0 *` (couplage inter-défaillants retiré) | `clearing.ts` | `chain/base: … byte-exact` échoue | **RED** (exit 1) | `0052db0d…52601173` (=) |
| 37 `clearing_rv_ex33_two_vectors` | phi `+ beta * interbankIn` → `+ 1 * interbankIn` (β ignoré) | `clearing.ts` | `L_* … = (1,1) — obtenu [2.2,2.2]` | **RED** (exit 1) | `0052db0d…52601173` (=) |

**Isolation vérifiée** (constat clé de conception, non deviné) :
- Le mutant **34** vit dans `splitQuantile` (partagé) : il rougit aussi les tests `set` — collatéral
  assumé (la fonction de quantile est unique, D6.1). Suffisant : test 34 rouge.
- Le mutant **36** cible l'**A-matrice** et non le RHS `b` : sur chaîne/fan-in, l'apport interbancaire
  SOLVABLE→défaillant du RHS est **nul** (les nœuds solvables ne doivent rien aux défaillants), donc
  le premier mutant essayé (`rhs += beta *` → `0`) était un **no-op** (mesuré : exit 0). Le couplage
  E&N vit dans l'A-matrice (défaillant→défaillant) — mutant corrigé ⇒ test 36 rouge, **test 37 reste
  vert** (Ex. 3.3 n'a aucun défaillant en GA ⇒ A jamais construite : isolation).
- Le mutant **37** vit dans `phi` (branche R&V, non-`enPath`) : test 37 rouge (L_* collapse à (2.2,2.2)),
  **test 36 reste vert** (α=β=1 ⇒ `enPath` `Math.min` atteint avant la branche β : isolation).

Working tree post-mutants : `git status` = 7 modifiés + 6 nouveaux, **aucune mutation résiduelle**,
`npm run ci` re-vert 81/81.

## 7. Ligne D10 imposée — classe `ukemi-liquidable-24h` (D6.2, item 6)

Toute sortie de la classe porte (via `liquidable24hProvenanceLine`, `packages/hikae/src/liquidable-24h.ts`) :

```
D10 : classe = `ukemi-liquidable-24h` (synthétique) · n = 300 · α = 0.01 · seed = <s> · harness_version = `fixtures-synth` · date (injectée) = 2026-09-05
```

`harness_version = fixtures-synth` et le mot « synthétique » sont accolés à l'identifiant. Le test 34
(couverture moyenne) balaie les **seeds 1..100** ; la date est **injectée** (jamais une horloge lue).
Garantie NON revendiquée sur données réelles (pré-vérif 3) : **aucune source de label de dette
liquidée 24 h** n'existe — voir pendant §9.

## 8. Consultation formée — oracle du test 37 : `(2,2.2)` est une coquille pour `(2.2,2.2)`

**Problème (une phrase)** : l'ADR-M003 D6.3, la fiche de mission (bloc D6.2/D6.3 et test 37) et la
lecture `P-K4-1` Q2 écrivent le plus grand vecteur de compensation d'Ex. 3.3 « `(2,2.2)` », valeur qui
n'est un vecteur de compensation sous **aucun** `α` avec les entrées déclarées `e=(1,1)`, `α=β=½`,
`L̄=(2.2,2.2)`.

**Tentatives / preuve** (reproductible, primaire — pas de mémoire du papier) :
1. **Structure forcée** : chaque banque n'a qu'un créancier interbancaire (l'autre) ⇒ `π₁₂=π₂₁=1` ⇒
   `L=[[0,2.2],[2.2,0]]` (sommes de lignes = `L̄`). C'est le seul réseau 2-banques compatible avec les
   entrées.
2. **`(1,1)` plus petit FORCE `π=1`** : pour que `(1,1)` soit compensation (deux banques en défaut à
   `α=β=½`), il faut `1 = 0.5·e_i + 0.5·π_ji·1` ⇒ `π_ji = 1`. Donc pas de créancier externe ⇒ système
   bilatéral symétrique ⇒ **le plus grand = `(2.2,2.2)`** (les deux banques solvables).
3. **`(2,2.2)` n'est pas un point fixe** : `Φ([2,2.2]) = [2.2,2.2]` sous α=β=½ ET sous α=β=1 (asserté
   dans le test 37 par `notDeepEqual` — le test PORTE la réfutation).
4. **Calcul** (scratchpad `rv-check.mjs`, itération de Φ) :
   `α=β=½` ⇒ `L*=(2.2,2.2)`, `L_*=(1,1)`, `unique=false` ; `α=β=1` ⇒ unique `(2.2,2.2)`.
5. **Cohérence interne du témoignage source** : Q2 dit aussi « with α=β=1 only `(2,2.2)` is a clearing
   vector » — or E&N sur ce système donne `(2.2,2.2)`. Les DEUX mentions de « (2,2.2) » pointent vers
   `(2.2,2.2)` : coquille de transcription d'un `.2` (un caractère), pas deux valeurs indépendantes.

**Option retenue (déclarée, non un contournement)** : le code est correct par construction ; le test
37 asserte les valeurs **mathématiquement vérifiées** `L*=(2.2,2.2)`, `L_*=(1,1)`, et porte la
réfutation de `(2,2.2)`. **Déviation d'oracle assumée et signalée** (R-21) : à l'orchestrateur de
trancher au G7 et de corriger, hors périmètre de ce worker (R-20), **la lecture `P-K4-1` Q2** et
**ADR-M003 D6.3** (remplacer `(2,2.2)` par `(2.2,2.2)`). Aucune valeur inventée : la seule source de
`L̄`/`e`/`α`/`β` est la lecture ; seule la coquille d'affichage `2` → `2.2` est corrigée.

## 9. Pendants formés (clôture zéro dette — jamais un « dû » nu, aucun TODO/FIXME)

1. **`τ_interval` fondé** — le seuil de largeur du gate `interval` est **déclaré, non fondé** (D6.1,
   même statut que D6 M002). *Recherche de solutions* : le fonder exige une exigence de couverture/de
   largeur d'un acheteur (G7 UKEMI : NON TROUVÉ) OU une calibration sur des largeurs de perte réelles ;
   aucune source dans le corpus au 2026-09-05. Pendant ADR-M003 §4 (Phase 2b).
2. **`(α, β)` fondés par source empirique** — scalaires exogènes (Def. 2.5) ; hors `α=β=1` (E&N) et
   Ex. 3.3 (valeurs de la source), toute valeur est **déclarée, non fondée**. *Recherche* : estimation
   de taux de recouvrement externe/interbancaire (LGD) en liquidation — procurement à former sur une
   source empirique (ex. données de résolution bancaire), non présente au corpus. Pendant §4.
3. **Label réel 24 h = aucune source** — la classe `ukemi-liquidable-24h` est **synthétique déclarée**
   (pré-vérif 3, ligne D10 §7). *Recherche/procurement* : un jeu de labels de dette liquidée réalisée
   à horizon 24 h (marché DeFi ou CeFi) permettrait une garantie sur données réelles ; aucun dans le
   corpus. Pendant §4. Jusque-là, « données réelles » n'est **pas** revendiqué.
4. **Oracle Ex. 3.3** — consultation §8 (coquille `(2,2.2)`→`(2.2,2.2)`), routée à l'orchestrateur.

Aucun autre point ouvert. Aucun `TODO`/`FIXME` nu introduit (R-13) — vérifiable :
`grep -rn "TODO\|FIXME" packages/{ukemi,hikae}/src packages/{ukemi,hikae}/test` sur les fichiers du lot = 0.

## 10. Sources [lu] citées

- `P-K4-1-rogers2013.md` (Rogers & Veraart 2013) : éq. (1) p.884 (Q1 — carte de compensation `(α,β)`) ;
  Def. 2.5 (Q1 — `α,β ∈ (0,1]` scalaires exogènes) ; GA Def. 3.6 / Thm 3.7 « ≤ n tours » (Q2) ;
  « continuous from above, not from below sauf α=β=1 » (Q2) ; Ex. 3.3 (Q2 — contrôle négatif).
- Reconduit Phase 1 : Eisenberg & Noe 2001 (`eisenberg2001.txt`, [lu]) pour `α=β=1` ; correction
  `(n+1)` du quantile split-CP (`splitQuantile`, l1-split.ts, archives HIKAE [lu]).

## Annexe — sortie CI complète (`npm run ci`, worktree racine, 2026-09-05, exit 0)

> Capturée APRÈS l'ajout des assertions de ligne D10 au test 34 (état livré ; 81/81).

```

> monark@0.0.0 ci
> npm run gate:vocab && npm run typecheck && npm run test


> monark@0.0.0 gate:vocab
> node scripts/grep-forbidden.mjs

gate:vocab OK — scanned 36 file(s), no forbidden claim.

> monark@0.0.0 typecheck
> tsc --noEmit


> monark@0.0.0 test
> node --test "test/*.test.ts" "packages/*/test/*.test.ts"

✔ atelier_state_oracle (6.6711ms)
✔ atelier_replays_root_fixtures (2.0929ms)
✔ atelier_no_forbidden_vocab (309.2779ms)
✔ perps_stubs_throw (2.3169ms)
✔ atelier_no_network (4.3672ms)
✔ digest is 64 lowercase hex chars (1.9094ms)
✔ order-independent (scores are sorted ascending before hashing) (0.2633ms)
✔ different score multisets give different digests (0.1817ms)
✔ deterministic across calls (0.1372ms)
✔ negative zero is normalized (same real → same digest) (0.3929ms)
✔ known vector [0.0, 1.0] (0.1753ms)
✔ empty scores → SHA-256 of the empty byte string (0.1132ms)
✔ a non-finite score is refused (0.5961ms)
✔ valid instances pass the closed-check (2.3545ms)
✔ unknown key at root is REFUSED (CleInconnue-style) (0.4723ms)
✔ unknown key in a nested object (utterance) is refused (0.1906ms)
✔ unknown key in an attestor element is refused (0.1865ms)
✔ unknown key in the nested verdict of a GateDecision is refused (recursive) (0.2749ms)
✔ an unknown region kind is refused (0.2078ms)
✔ schema properties are IN SYNC with the TS allowed-key sets (no drift) (2.3425ms)
✔ every contract schema declares additionalProperties:false at each object node (closed) (0.8254ms)
✔ forbidden-keys.json matches the TS FORBIDDEN_KEYS (0.3117ms)
✔ intentInRegion — set variant (0.1681ms)
✔ intentInRegion — interval variant (0.154ms)
✔ valid contracts serialize without throwing (1.4127ms)
✔ reason enum: both schemas match the TS single source (no drift) (1.7411ms)
✔ method enum: schema matches the TS single source (0.3997ms)
✔ action enum: schema matches the TS single source (0.3206ms)
✔ a clean object has no forbidden key (1.405ms)
✔ a valid verdict has no forbidden key (1.0529ms)
✔ forbidden key at root is found (0.2007ms)
✔ forbidden key nested deep is found (recursive, not root-only) (0.1933ms)
✔ forbidden key inside an array element is found (0.2316ms)
✔ assertNoForbiddenKey THROWS with the path (the test that must fail on violation) (0.6495ms)
✔ every FORBIDDEN_KEY is individually caught at any depth (0.5834ms)
✔ a forbidden key inside a GateDecision's nested verdict is caught end-to-end (G2 M4) (0.5278ms)
✔ all four schemas compile (valid JSON Schema; the $ref resolves) (37.7012ms)
✔ valid fixtures pass their schema (7.5908ms)
✔ schema rejects an unknown key (additionalProperties:false) (0.4072ms)
✔ schema rejects an empty attestor (minItems) (1.2771ms)
✔ schema rejects a duplicate attestor (uniqueItems — EntreeDupliquee mirror) (0.3086ms)
✔ schema rejects a 63-char hash (pattern ^[0-9a-f]{64}$) (0.2301ms)
✔ schema rejects a control char in subject (ASCII-printable pattern) (0.301ms)
✔ schema rejects an EMPTY residual (minItems) — the value constraint the TS type does NOT enforce (0.2301ms)
✔ schema rejects a DUPLICATE residual (uniqueItems) — validateur C4 edge case (0.2708ms)
✔ schema rejects a bad region kind (oneOf) and a set-region missing label_schema (0.5143ms)
✔ no_p_correct_field (3.8399ms)
✔ calib_digest_matches_contracts (0.4688ms)
✔ commit_error_not_alpha_is_labelled (195.5924ms)
✔ interval_conformer_coverage (21.5298ms)
✔ interval_gate_commit_defer_abstain (2.1694ms)
✔ under_calib_abstains (1.5113ms)
✔ quantile_formula_n_plus_1 (0.4673ms)
✔ empty_set_not_allow (1.7546ms)
✔ imocp_update_direction (1.5699ms)
✔ budget_ignores_pending_label (1.1512ms)
✔ budget_exhausted_refuses_commit (2.9138ms)
✔ intent_not_in_region_denied (3.438ms)
✔ timeout_is_deny (0.4176ms)
✔ set_too_large_defers (0.3218ms)
✔ deferral_preserves_miscover (1.5836ms)
✔ interval_lo_le_hi (2.4516ms)
✔ unbounded_is_abstain (0.5526ms)
✔ features_strictly_before_t (0.7229ms)
✔ build_set_region_defensive_copy (1.2318ms)
✔ fixtures_hash_stable (6.0824ms)
✔ s2_campaign_deterministic_and_coherent (7.1979ms)
✔ s2_report_reproducible (28.157ms)
✔ s2_predictors_wired (1.4476ms)
✔ clearing_alpha_beta_regression_en (4.9466ms)
✔ clearing_rv_ex33_two_vectors (1.4177ms)
✔ clearing_fixed_point (4.1574ms)
✔ fictitious_default_le_n_rounds (0.6024ms)
✔ uniqueness_when_e_positive (1.7749ms)
✔ nonexpansive_in_e (7.1133ms)
✔ liquidable_amount_eq3 (3.2103ms)
✔ prediction_numeric_emitted (2.3584ms)
✔ contracts_frozen — schemas/ et packages/contracts/src/ identiques au manifeste Phase 0 (357ef25) (7.6769ms)
✔ contracts_frozen — le manifeste n'est pas vide et couvre les 5 schémas (0.29ms)
✔ fixtures_root_valid — 9 états, hash == manifest (2.4896ms)
✔ fixtures_root_valid — ajv + gardes runtime Phase 0, répartition 3/2/3/1 (52.4197ms)
ℹ tests 81
ℹ suites 0
ℹ pass 81
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 652.0978
```
