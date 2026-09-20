# PLI — sous-lot U-2a (treillis cascade-cluster Q_*/Q^* dans `packages/ukemi`)

Worker implémenteur G1, modèle épinglé **`claude-opus-4-8[1m]`**, effort max, 2026-09-20. Base **`5fe6c12f57cff3cb129e424c319844568eecbd3a`** (`lot/etude-suite` HEAD). Branche `lot/u-2a`, worktree `F:\Monark-wt-u2a`. Le worker ne committe pas (R-20). Sortie à vérifier adversarialement (R-21).

## 1. Touched set (exact, mesuré `git status --short` + `git diff --numstat HEAD`)
| Fichier | +/- | Rôle |
|---|---|---|
| `packages/ukemi/src/lattice.ts` | +159/-0 (nouveau) | L-1 : opérateur T, Picard Q_*/Q^*, Prop. 4, domaine, formes de demande |
| `packages/ukemi/test/lattice.test.ts` | +204/-0 (nouveau) | L-3 : 8 tests, 7 mutants |
| `packages/ukemi/test/derive-weth-lattice-fixture.mjs` | +87/-0 (nouveau) | L-2 : dérivation de la fixture WETH (rejeu `recordBook`) |
| `packages/ukemi/test/fixtures/weth-book-23545087.json` | +43/-0 (nouveau) | L-2 : fixture WETH dérivée (N=2, 0 éligible) |
| `packages/ukemi/test/PROVENANCE-weth-book-lattice.md` | +39/-0 (nouveau) | L-2 : provenance + shas + caveat |
| `packages/ukemi/test/fixtures/lattice-scenario-a.json` | +14/-0 (nouveau) | L-3 : NOTE §1 (Picard/monotone/m5) |
| `packages/ukemi/test/fixtures/lattice-scenario-b.json` | +14/-0 (nouveau) | L-3 : Λ=0/D=0,15 (m3, Prop. 4 vrai) |
| `packages/ukemi/test/fixtures/lattice-scenario-c.json` | +13/-0 (nouveau) | L-3 : contre-exemple 3 points fixes (m2/m4) |
| `packages/ukemi/src/prediction.ts` | +14/-6 | L-4 : `emitPrediction(yhat, producedAt, {predictorId, taskClass})` ; retrait des constantes v0 |
| `packages/ukemi/src/index.ts` | +20/-7 | L-4 : exports treillis ; retrait export `UKEMI_PREDICTOR_ID` ; en-tête reformulé |
| `packages/ukemi/test/prediction.test.ts` | +10/-5 | L-4 : valeurs neutres `test:predictor`/`test-class` |
| `packages/ukemi/package.json` | +1/-1 | L-4 : ligne 6 scrubée (« liquidation book primitives … cascade-cluster lattice (annex) ») |
| `apps/harness/src/tools/cascade.ts` | +10/-2 | L-4 exception harnais 1/2 (C-1) : `CASCADE_PREDICTOR_ID` + `TASK_CASCADE`, ligne d'appel |
| `apps/harness/test/cascade.test.ts` | +3/-2 | L-4 exception harnais 2/2 (C-1) : import `CASCADE_PREDICTOR_ID`, assertion l.66 |
| `docs/adr/ADR-U2-clearing-lattice.md` | nouveau (docs, hors R-25) | L-5 |
| `docs/PLI-lot-u2a.md` | ce fichier (docs, hors R-25) | L-6 |

**CA-11** : aucune pièce nouvelle `built` (treillis = `annex`). `apps/site/lib/fleet.ts`, README, skills, site, `apps/harness/src/tools/registry.ts`, `gate.ts`, `version.ts`, `fixtures/h5-e2e-trace.json` **intacts** (hors les deux fichiers harnais de C-1, sans effet servi). Aucun fichier partagé avec U-3.

## 2. R-25 (pathspec exacte de `ci.yml:65`, `git add -N` intent-to-add avant mesure)
- **Mi-G1 (après L-1 + L-3 core, avant PROVENANCE/ADR/PLI)** : `13 files changed, 592 insertions(+), 23 deletions(-)` = **615**.
- **Fin de G1 (avec PROVENANCE, tous fichiers)** : `14 files changed, 631 insertions(+), 23 deletions(-)` = **654**.
- Cible C-4 : 560-720 ⇒ **dans la cible**. Plafond fail-closed 1 205 ⇒ **loin sous** (654 < 1 205).
- Exclus de R-25 (mesuré) : `docs/**/*.md` (ADR-U2, ce PLI). **Comptent** : `packages/ukemi/test/fixtures/*.json` (4), `derive-*.mjs`, `PROVENANCE-*.md` sous `packages/` (racine `packages/ukemi/test/fixtures` **non** exclue ; Q-e du checkpoint-1). État de l'index au PLI : `git add -N` des 8 nouveaux fichiers (jamais de commit ; R-20). Reproductible depuis un checkout frais : `git add -N packages/ukemi/src/lattice.ts packages/ukemi/test/lattice.test.ts packages/ukemi/test/derive-weth-lattice-fixture.mjs packages/ukemi/test/PROVENANCE-weth-book-lattice.md packages/ukemi/test/fixtures/{weth-book-23545087,lattice-scenario-a,lattice-scenario-b,lattice-scenario-c}.json` avant le `git diff --shortstat`.

## 3. sha256 (LF) des fichiers de code au PLI
```
ef04399a8c6ce7a71488b41f968abf1933ba72794b148b607a87de46c7ffab5d  packages/ukemi/src/lattice.ts
88c09f341f122caab595b6c61fdb6d1ff20c800950e985b601b77fa0c4e9c90a  packages/ukemi/src/prediction.ts
562ba5e46e9fa4897408d5f37d046847417cbd50d5f70a6e67884781da99642d  packages/ukemi/src/index.ts
59eceebfcaaf7bb1b40d0ffb1fb1606e724fac270fd36d6fb8d3e00ca9aeb1e0  packages/ukemi/package.json
f411d79225ec3e284f4330eb5aabec65a2b529f9657c1dfe0ddf5d735ef3f446  packages/ukemi/test/lattice.test.ts
9200a62af223b665f3607470a272d719c08d88a322bdc4910c23dc7ac4cc320c  packages/ukemi/test/prediction.test.ts
9a8c230de030974e5fee64092fc61f1572cd7141f3cb00b3c7683a7a3355ae9f  packages/ukemi/test/derive-weth-lattice-fixture.mjs
89085f7c9d2b55341bf888427c95d7a580f9fa6679a0c779a31708cd3327c5dd  packages/ukemi/test/fixtures/weth-book-23545087.json
2c3dd3d47a474b26d5873329c4beec978f144e5b39bf3f1a9506ea4cf143b965  apps/harness/src/tools/cascade.ts
e58efead1d43071bbd4f61d8ade50cfc22b63704f5c56b3e7a244c37e26107a6  apps/harness/test/cascade.test.ts
```

## 4. Mutants (7 rouges, restauration byte-exacte vérifiée sur les fichiers finaux)
Rejeu `node --test packages/ukemi/test/lattice.test.ts` ; restauration = `cp` de la copie pristine + `sha256sum` recomparé à la sha finale (§3).
| # | Mutation (fichier) | Test tué | Comptes | Restauration |
|---|---|---|---|---|
| m1 | `price < pos.pCrit` → `<=` (lattice.ts, `applyT`) | `lattice_lambda_zero_equals_static_liquidable` | 7 pass / 1 fail | sha=`ef04399a…` OK |
| m2 | Picard-up depuis `sumB` au lieu de 0 (lattice.ts, `smallestFixedPoint`) | `lattice_three_fixed_points_counterexample` (Q_*=200≠0) | 7/1 | OK |
| m3 | retrait du facteur `(1 - drop)` (lattice.ts, `priceAt`) | `lattice_lambda_zero_equals_static_liquidable` (scénario-b : 20≠50) | 7/1 | OK |
| m4 | prédicat Prop. 4 inversé `<=`→`>` (lattice.ts, `noDormantActivation`) | `lattice_three_fixed_points_counterexample` | 7/1 | OK |
| m5 | signe de Λ inversé `(1 - λQ)`→`(1 + λQ)` (lattice.ts, `priceAt`) | `lattice_monotone_in_lambda` (+ 3 collatéraux) | 4/4 | OK |
| m8 | formes linéaire/exponentielle échangées (lattice.ts, `priceAt`) | `lattice_linear_bounds_exponential_from_above` (Q^*lin≠100) | 7/1 | OK |
| m-pred | `UKEMI_PREDICTOR_ID` réintroduite non-exportée (prediction.ts) | `ukemi_package_exports_no_predictor_id` (grep source (b)) | 7/1 | sha=`88c09f34…` OK |

m5 tue son test nommé (monotone) et 3 collatéraux (le signe négatif casse la convergence de Picard globalement) : avec `(1+ΛQ)` le prix croît en Q, donc sur le scénario-c `applyT(200)` ne vaut plus 200 (P(200)=140 > les deux pCrit ⇒ T=0) et Picard diverge → `LatticeDomainError` — mutant tué par ≥ 1 test nommé, conforme. Les 6 autres sont des morts propres à un seul test.

## 5. Preuve d'innocuité servie (L-4, C-1)
- **Pin h5 inchangé** : `sha256(fixtures/h5-e2e-trace.json)` = `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1` **avant et après** le lot (recomputé). Le littéral `internal:ukemi-cascade-v0` n'est dans la trace qu'en **données** (jamais `tools/list`), et le harnais passe désormais les deux mêmes chaînes via `CASCADE_PREDICTOR_ID`/`TASK_CASCADE` ⇒ Prediction octet-identique.
- `probe_harness_records_real_decision` **vert** (`deepEqual(live, committed)` + pin trace). `cascade_returns_frozen_prediction` **vert** (`predictor_id === CASCADE_PREDICTOR_ID`).

## 6. Fixture WETH (L-2, C-2)
Rejeu `execFileSync(process.execPath, [derive-weth-lattice-fixture.mjs])` → sha256(LF) de la sortie = `89085f7c…` = sha du fichier committé (test `lattice_weth_fixture_replays_bit_identical`). `book_digest` = `034fbff9…` (identique au PIN recorder de `apps/sentinel/test/ukemi.test.ts`). N = 2 comptes, 0 éligible (déclaré). Import `apps/sentinel/src/ukemi/{book,clusters}.ts` depuis un script de test seulement (précédent `packages/monark/test/adapter-book.test.ts:30-32`) ; jamais depuis `packages/ukemi/src`.

## 7. Oracles (tous verts)
| Oracle | Résultat |
|---|---|
| `npm run gate:vocab` (obligatoire, règle §F) | exit 0, 170 fichiers, 0 réclamation interdite |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run lint:ratchet` | 69/69 (0 violation ajoutée par `lattice.test.ts`) |
| `node scripts/lang-gate.mjs --scope root,contracts` | exit 0 |
| `npm run export:check` | exit 0 (0 hit français, tous scopes ; « Fait 1 » anglicisé en « Fact 1 ») |
| tests ciblés (`packages/ukemi/test/*`, `apps/harness/test/cascade.test.ts`, `test/h5-e2e-probe.test.ts`) | verts |
| **`npm run ci` complet (une fois)** | **exit 0 — 420 tests, 420 pass, 0 fail** (base 412 + 8 nouveaux ; ≥ 7 requis). Aucun autre `node` de worktree ne tournait (vérifié par ligne de commande). |

## 8. Items formés (règle Dettes — jamais un « dû » nu ; détail dans ADR-U2 §« Items formés »)
- **CPMM** : dérivation `x·y=k` dans l'ADR-U2 (D-U2.3) + item formé — lecture formée de `_txt/milionis-moallemi-roughgarden-zhang-lvr.txt` (lecteur Sonnet 5) **ou** procurement Angeris & Chitra 2020 (AFT, DOI 10.1145/3419614.3423251). **Aucune implémentation `"cpmm"` en U-2a** (`demand: "linear" | "exponential"` seulement).
- **`gate:vocab`** : bans `\bcascade\b`/`(Λ|lambda)\s*=\s*0` scopés `apps/sentinel` ; item formé pour étendre à `packages/ukemi` avec une liste négation-consciente (jamais une extension nue). Décision par ADR de lot.
- **C-12** : `apps/site/lib/fleet.ts:252` « auto-deleveraging cascade on a perp venue » = ADL de perp, licite, distinct de la cascade Aave core — à porter dans la liste negation-aware de **U-4** (décision 51).

## 9. Sourçage (doc 03)
- Treillis (T, Lemme 1, Tarski, Picard ≤ N+1, Q_*/Q^*, Prop. 4, contre-exemple, sens) : NOTE-treillis [lu, mesuré, scripts hachés].
- Forme exponentielle `p = e^{−α·s}` : Cifuentes-Ferrucci-Shin 2005 / BoE WP 264, éq. 5 p. 15 **[lu]** (fiche `L-lecture-cifuentes-ferrucci-shin-wp264.md`) ; `s` = ventes agrégées ; unité Q vs s et « α = Λ » (premier ordre) déclarés (C-5). Analogie « α=0 ⇒ zéro contagion » ↔ « Λ=0 ⇒ liquidable statique » (fiche). CFS **ne** fonde **ni** l'unicité **ni** la condition d'Amini (fiche) — non attribué.
- Forme linéaire : choix propre MONARK (premier ordre), déclaré ; conservatrice par l'ordre prouvé (D-U2.4).
- Aucun chiffre de seconde main dans les artefacts. Un [2nd] nu = défaut : néant ici.

## 10. Provenance
Artefacts générés par le worker U-2a, modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-20 ; scratch `F:/tmp/u2a/` (rien sur C:) ; aucun appel réseau ; arbre propre hors touched set ci-dessus. `error_origin` à assigner au G7. Vérification adversariale due (R-21) : G2 fraîche + checkpoint-2 (rejeu `npm run ci`, sha de trace, script → sha, mutants m1-m5/m8/prédicteur) + G7.

---

## Annexe « pli 2 » — U-2a-2 : branchement du champ `expected` des fixtures (OBS-1)

Worker de pli, modèle épinglé **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme ; R-1), effort max, 2026-09-20. Worktree `F:\Monark-wt-u2a`, branche `lot/u-2a`, HEAD `0538bbf`. Base R-25 `5fe6c12`. Scratch `F:/tmp/u2a-2/` (rien sur C:). Aucun réseau. Le worker ne committe pas (R-20) ; sortie à re-vérifier adversarialement (R-21).

**Motif** : OBS-1 (docs/G2-lot-u2a.md l.51) — `loadLatticeScenario` **valide** `expected: {smallest, greatest}` (throw si absent/mal typé) mais **aucun test ne l'assertait** ; les tests réaffirmaient 20/90 (a) et 0/200 (c) en littéraux codés en dur, et 50/50 (b) **par recoupement avec `liquidableAmount`** (jamais l'assertion directe de `expected` ; ce pli est le **premier** à asserter 50/50 littéralement). Pièce « validée mais non lue » = non branchée (règle Branchement 2026-09-19). Pli : câbler `expected` par un test paramétré, **sans retirer** les littéraux (double garde).

### Touched set (mesuré `git status --short` + `git diff --numstat HEAD`)
| Fichier | Δ (vs HEAD) | Rôle |
|---|---|---|
| `packages/ukemi/test/lattice.test.ts` | +39/-0 | test paramétré `lattice_fixture_expected_values_hold` + 3 lignes d'en-tête (mutant m-fx documenté) |
| `docs/PLI-lot-u2a.md` | cette annexe (docs, **hors R-25**) | provenance du pli |

Aucun autre fichier modifié (`git status --short` final = ` M packages/ukemi/test/lattice.test.ts` + ` M docs/PLI-lot-u2a.md`). Fixtures a/b/c **inchangées** : elles portaient déjà `lambda` et `demand` (a : 0,004/linear ; b : 0/linear ; c : 0,001/linear) — rien ajouté (consigne « ajoute lambda/demand si absents » ⇒ **présents, rien à ajouter**). WETH `weth-book-23545087.json` **hors périmètre** : ne porte pas `expected`, et est épinglée octet-identique au script de dérivation par `lattice_weth_fixture_replays_bit_identical` — y ajouter une clé la rougirait.

### Le test (branchement)
`lattice_fixture_expected_values_hold` : découverte **dynamique** de `packages/ukemi/test/fixtures/*.json` ; pour CHAQUE fixture portant `expected` (**fail-closed** : `loadLatticeScenario` throw si mal formé — jamais un skip silencieux, qui recréerait le trou d'OBS-1), asserte sous le Λ et la forme **déclarés dans la fixture** (`stateOf(s)`, sans override) :
- `smallestFixedPoint(state).value === expected.smallest`
- `greatestFixedPoint(state).value === expected.greatest`

Garde de **non-vacuité** : les 3 scénarios a/b/c doivent être découverts et assertés (le test ne peut pas dégénérer en « ne vérifie rien »). Aujourd'hui : 3 fixtures branchées ; toute 4ᵉ scénario au `expected` faux mais bien typé **rougit désormais** (le trou exact nommé par OBS-1 : « une 4ᵉ fixture au expected faux passerait aujourd'hui »). Valeurs re-calculées sous Λ déclaré et vertes : a (Λ=0,004) Q_*=20/Q^*=90 ; b (Λ=0) 50/50 ; c (Λ=0,001) 0/200.

### sha256 (LF) avant/après
| Fichier | avant | après |
|---|---|---|
| `packages/ukemi/test/lattice.test.ts` | `f411d79225ec3e284f4330eb5aabec65a2b529f9657c1dfe0ddf5d735ef3f446` | `83689716e5d836b138f4bfcba8c56a5c12daf1370db8d24add72f62150380175` |
| `packages/ukemi/test/fixtures/lattice-scenario-a.json` | `5a6a75a87cecae18746194d717156a27e58a3c86986fa6d5bf1d7eb45caf45b6` | `5a6a75a87cecae18746194d717156a27e58a3c86986fa6d5bf1d7eb45caf45b6` (inchangée) |

Convention : `sed 's/\r$//' FICHIER | sha256sum` == `git show HEAD:FICHIER | sha256sum`, re-vérifiée sur `lattice.ts`/`lattice.test.ts` == PLI §3 (fichiers LF sur disque).

### Mutant (m-fx : altération de `expected.greatest`)
`sed -i 's/"greatest": 90/"greatest": 91/'` sur `lattice-scenario-a.json` (sha `5a6a75a8…` → `aee61b546b7fdbbcf65362dd8b501ac14216557c0a77d766ae13814ff421e7d0`) ⇒ `node --test packages/ukemi/test/lattice.test.ts` = **9 tests, 8 pass, 1 fail**, la seule rouge = `lattice_fixture_expected_values_hold` (`AssertionError: lattice-scenario-a.json: Q^* == expected.greatest (91) under declared lambda=0.004 linear ; 90 !== 91`). Les **8 vertes** — dont `lattice_monotone_in_lambda`, qui lit aussi le scénario-a — prouvent la **double garde** : les littéraux codés en dur ne lisent pas `expected`, donc le test paramétré est le **seul capteur** du champ. Restauration `git checkout -- packages/ukemi/test/fixtures/lattice-scenario-a.json` ⇒ sha `5a6a75a8…` == avant (**byte-exact**) ; `git status --short` propre hors touched set. Logs : `/f/tmp/u2a-2/{green,mutant,green-final}.log`.

### R-25 recalculé (pathspec exact `ci.yml:65`, base `5fe6c12`, plafond 1 205)
`git diff --shortstat 5fe6c12 -- . <14 exclusions de ci.yml:65>` = **14 fichiers, 670 insertions(+), 23 deletions(-) = 693** ≤ **1 205** (plafond `VIBEGATES_PR_LIMIT`) et ≤ 720 (cible C-4). Delta du pli = **+39** (654 → 693), pure addition (aucune suppression). Pas de `git add -N` requis (aucun fichier nouveau ; `lattice.test.ts` déjà suivi ; PLI exclu par `:(exclude,glob)docs/**/*.md`). `packages/ukemi/test/fixtures/*.json` **comptent** (racine non exclue) mais inchangées.

### Pin h5
`sha256(fixtures/h5-e2e-trace.json)` = `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1` — **inchangé** (recomputé après pli ; == PLI §5, G2 C-G2-5). Aucun fichier servi touché (CA-11) : seul `lattice.test.ts` (annex ukemi, consommateurs = tests) modifié ; `apps/*`, `registry.ts`, `fleet.ts`, README, skills, trace h5 **intacts**.

### OBS-3 (renommage de l'ADR) — NON fait, condition non remplie
Consigne : renommer `docs/adr/ADR-U2-clearing-lattice.md` → `docs/adr/ADR-U2-cascade-cluster-lattice.md` **seulement si** aucun autre fichier ne le référence par chemin. Grep `grep -rn "ADR-U2-clearing-lattice"` ⇒ **référencé dans 5 fichiers : 4 par chemin complet** (`docs/adr/…`) — `docs/G0-lot-u2.md:14`, `docs/G0-lot-u2a.md:2` et `:17`, `docs/PLI-lot-u2a.md:22` — **+ 1 par nom seul** (`docs/G2-lot-u2a.md:53`, le slug sans `docs/adr/`). Les 4 références par chemin suffisent : condition **non remplie** ⇒ **laissé tel quel** (un renommage rippellerait G0/PLI/G2, conforme à la note OBS-3 « renommer rippellerait G0/PLI »). Item formé (règle Dettes) : renommer en bloc avec mise à jour des **5 références** ; déclencheur = prochain lot touchant `docs/adr/` (p.ex. U-4/U-7).

### Oracles (consigne : gate:vocab, typecheck, lint, lint:ratchet, tests ciblés — PAS `npm run ci`)
| Oracle | Résultat |
|---|---|
| `npm run gate:vocab` | exit 0, 170 fichiers, 0 réclamation interdite |
| `npm run typecheck` (`tsc --noEmit`) | exit 0 |
| `npm run lint` (`eslint .`) | exit 0 |
| `npm run lint:ratchet` | exit 0, **69/69** (0 violation ajoutée par le pli) |
| tests ciblés `node --test packages/ukemi/test/*.test.ts test/h5-e2e-probe.test.ts` | **19 tests, 19 pass, 0 fail** (18 base + `lattice_fixture_expected_values_hold` ; inclut `probe_harness_records_real_decision`/`h5_carries_attested`) |

`npm run ci` complet **non lancé** (checkpoint-2 U-3 + worker Bell -b3a en cours ; consigne de mission). Logs oracles : `/f/tmp/u2a-2/{vocab,typecheck,lint,ratchet,green-final}.log`.

### Provenance
Pli U-2a-2 généré par le worker de pli, modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-20 ; scratch `F:/tmp/u2a-2/` (rien sur C:) ; aucun appel réseau ; arbre propre hors touched set. Avis ADVISOR consulté (conseil, jamais verdict — R-26) : prédicat de découverte fail-closed (drop du filtre `p0`), raison WETH (pin bit-identique), preuve du capteur (8 vertes/1 rouge), méthode R-25 two-dot — tous appliqués. Vérification adversariale (R-21) + G7/checkpoint restent chez l'orchestrateur/validateur. Le worker ne committe pas (R-20).
