claude-opus-4-8[1m]

# G2 — Revue du Lot K (UKEMI Phase 2), Phase 2 MONARK

> **GATE-0 (R-1)** — modèle résolu du RELECTEUR, vérifié tel quel : `claude-opus-4-8[1m]`
> (préfixe `claude-opus-4-8` attendu ; effort `max`). Instance SÉPARÉE, contexte frais, ≠ générateur
> (le G1 fut écrit par un worker `claude-opus-4-8[1m]` distinct ; D10bis). Aucun commit, aucun push,
> aucune modification de code (mutants restaurés à l'octet, prouvé par sha256 §b). Worktree
> `F:\Monark-wt-ukemi2`, branche `lot-k-ukemi2`, base `c8ac1b5`.

Rédigé de façon **incrémentale** (anti-coupure). Références lues : ADR-M003 (D0.5, D6.1/2/3, D10,
D10bis, D11 34-37) ; `P-K4-1-rogers2013.md` (+ addendum 2026-09-05) ; `docs/G1-lot-K.md` ; checklist
G2 du corpus (revue 3 étapes AgileCoder). PDF Rogers **non lu** (consigne).

---

## (a) Conformité par point

### Point 1 — Contrats gelés intacts (`contracts_frozen` vert) — **CONFORME**

- `git status --short packages/contracts schemas` = **vide** (rien de modifié ni ajouté sous ces
  chemins). `git diff --name-only` = 7 fichiers, **aucun** sous `packages/contracts/` ni `schemas/`.
  Untracked = 6 artefacts + `docs/G1-lot-K.md`, **aucun** sous ces chemins.
- Le test `contracts_frozen` (schemas/ et packages/contracts/src/ identiques au manifeste Phase 0
  `357ef25`) passe en CI (§10, ligne « ✔ contracts_frozen … »). Le conformeur `interval` **consomme**
  `PredictionRegion`/`CoverageVerdict` gelés (`import type … from "@monark/contracts"`,
  `interval-conformer.ts:21`, `l3-gate.ts:29-30`) sans les réécrire.
- `GateInput.tauInterval` ajouté (`l3-gate.ts:53`) n'est **pas** un contrat gelé : `GateInput` est
  une interface interne HIKAE, pas l'un des 4 schémas (déclaré `l3-gate.ts:50-52`, cohérent M003 D4).

### Point 2 — D6.1 conformeur `interval` — **CONFORME**

- **Quantile réutilisé, jamais réécrit** : `conformInterval` appelle `splitQuantile(scores, α, nMin)`
  (`interval-conformer.ts:79`), la seule implémentation de `p = ⌈(n+1)(1−α)⌉`, `q̂ = sorted[p−1]`
  (`l1-split.ts:37-42`). `l1-split.ts` est **inchangé** (pas au `git diff`). Score `s_i = |y_i − ŷ_i|`
  (`absoluteResidualScores`, `interval-conformer.ts:53-55`).
- **Région `[ŷ−q̂, ŷ+q̂]`** : `buildIntervalRegion(yhat − qhat, yhat + qhat)` (`interval-conformer.ts:83`),
  constructeur unique gelé Phase 1 (`region.ts:44`), invariant M5 `lo ≤ hi` (trivial car `q̂ ≥ 0`),
  fail-closed non-fini (`region.ts:45-47`).
- **`CoverageVerdict` validé ajv strict** : test 34 compile `coverage-verdict.schema.json` en ajv
  `{strict:true}` (`interval-conformer.test.ts:27-31`) et asserte `validateVerdict(verdict) === true`
  (l.58) **et** que `p_correct` est refusé (schéma fermé, l.59). Sous-calibration fail-closed via
  `underCalibVerdict` — littéral gelé partagé avec L1 (`interval-conformer.ts:24,57-71`,
  `qhat=null`/`reason=under_calib`), aucun `q̂` clampé en silence.

### Point 3 — L3 chemin `interval` COMMIT/DEFER/ABSTAIN + non-régression `set` — **CONFORME (1 réserve mineure)**

- **Throw Phase 1 levé** : l'ancien `throw` (« interval non gérée ») est remplacé par
  `if (region.kind === "interval") return decideInterval(input, region)` (`l3-gate.ts:82`).
- **Trois états** (`decideInterval`, `l3-gate.ts:107-121`) conformes à D6.1 :
  COMMIT si `intent ∈ [lo,hi]` ET `width ≤ τ_interval` (l.116-120) ; DEFER `interval_too_wide` si
  `width > τ_interval` (horloge ouverte) sinon ABSTAIN `clock_expired` (l.112-115) ; ABSTAIN
  `intent_not_in_region` sinon (l.116-118). DEFER indépendant de l'intention = lecture littérale
  D6.1 « DEFER si largeur > τ », et DEFER est `allow:false` (pas de fuite d'engagement).
- **`τ_interval` déclaré non fondé** : commenté `l3-gate.ts:48-53` et docstring l.27 (« DÉCLARÉ, NON
  FONDÉ, pendant §4 »). Grandeur distincte de `tau` (largeur-prix ≠ cardinalité).
- **Non-régression `set`** : le hoisting des 3 gardes amont (evaluable→timedOut→nCalib) est
  **byte-neutre** (diff `l3-gate.ts` : ces gardes précédaient déjà intent/budget/size ; leur ordre
  relatif est préservé ; `const setSize` déplacé après, sans effet de bord). Champ `tauInterval:1`
  inerte ajouté aux fixtures `set` (`s2/instrument.ts:385`, `l2.test.ts:59`, `l3.test.ts:28`).
  Tests `set` verts en CI (§10) ; digests S2 (`s2_campaign_deterministic_and_coherent`,
  `s2_report_reproducible`) inchangés.
- **RÉSERVE mineure (non bloquante) R1** : divergence d'ordre de priorité des raisons entre chemins.
  Chemin `set` : `intent_not_in_region` **avant** `budget_exhausted` (`l3-gate.ts:86-91`). Chemin
  `interval` : `budget_exhausted` **avant** l'intention (`l3-gate.ts:108-118`). Pour `intent∉région`
  ET `budget<floor`, les deux chemins ABSTAIN mais avec des `reason` différents. Non spécifié par
  D6.1 (qui ne mentionne pas le budget), déclaré `l3-gate.ts:102-106`, **fail-closed des deux côtés
  (aucun ALLOW erroné)** — d'où réserve, pas défaut.

### Point 4 — D6.2 générateur seedé + ligne D10 + oracle test 34 — **CONFORME**

- **Générateur seedé** : `generateLiquidable24hPairs(seed, n)` (`liquidable-24h.ts:43-52`) réutilise
  `mulberry32` importé de `./s2/instrument.ts` (l.19), aucun `Math.random`, aucune horloge. n=300,
  α=0.01 (`LIQUIDABLE_24H_N=300`, `LIQUIDABLE_24H_ALPHA=0.01`, l.26-27).
- **Ligne D10** (`liquidable24hProvenanceLine`, `liquidable-24h.ts:58-67`) porte
  `harness_version = \`fixtures-synth\`` **et** « (synthétique) » accolé à l'identifiant **et**
  `date (injectée) = <generatedOn>` (jamais une horloge lue). Test 34 (c) l'asserte
  (`interval-conformer.test.ts:102-105`).
- **Oracle test 34 = exact + moyenne** : (a) q̂ exact à la main n=99 ⇒ q̂=99, région [901,1099]
  (`interval-conformer.test.ts:45-51`) ; (a′) q̂ exact n=300 par **recomputation indépendante** (tri +
  indice 297, l.61-72) ; (b) **couverture moyenne R=100 seeds 1..100** ≥ `1−α−0.005 = 0.985`
  (l.74-98, split calib 300 / hold-out 200 du même flux seedé, échangeables). Conforme D11 test 34.

### Point 5 — D6.3 `fictitiousDefault(sys, α, β)` — **CONFORME**

- **Éq. (1) / GA Def. 3.6** : branche solvable `value ≥ pbar ⇒ pbar` ; branche défaut
  `x_i = α·e_i + β·(Σ_j p_j Π_ji)` via le bloc linéaire `(I − βΠ_DD) x_D = α e_D + β Π_{Sc}ᵀ p̄`
  (`clearing.ts:132-140`, `phi` l.204-206). Ensemble de défaut croissant ⇒ ≤ n tours (boucle
  `iter ≤ n`, l.127 ; rounds rapportés).
- **α=β=1 byte-exact** : chemin E&N littéral `Math.min(pbar, value)` gardé par `enPath` (`phi`
  l.200-204) ; test 36 (`clearing_rv.test.ts:22-48`) compare aux **valeurs codées en dur** Phase 1
  (ring `[10,10,10,10]`, chain `[10,10.5,0]` r2, fanin `[2,0.5,0.5,0.5,0]` r2, bumped, App.2
  non-unicité) — **pas** une ré-exécution. Défauts implicites `fictitiousDefault(s)` = explicites
  `(s,1,1)` assertés (l.35). Provenance `alpha`/`beta` portée par `ClearingResult` (l.46-48 ; test l.46-47).
- **L\* et L\_\* rapportés, `unique` correct** : `clearing` renvoie `pPlus` (GA), `pMinus` (depuis 0),
  `unique = (‖L*−L_*‖₁ < tol)` (`clearing.ts:185-191`). Jamais l'unicité revendiquée hors α=β=1.
- **Test 37 = (2.2,2.2)/(1,1)/false + unique (2.2,2.2) à α=β=1** (`clearing_rv.test.ts:59-79`) :
  `half.pPlus=[2.2,2.2]`, `half.pMinus≈[1,1]`, `unique=false` ; les deux sont points fixes de Φ
  (assertions `phi` l.68-69) ; **réfutation de (2,2.2)** assertée aux deux α (l.72-73) ; α=β=1 ⇒
  `en.pPlus=[2.2,2.2]`, `unique=true`.
- **Oracle (2,2.2)→(2.2,2.2) — VÉRIFIÉ INDÉPENDAMMENT par le relecteur** (calcul propre, jamais la
  mémoire du papier ; scratchpad `rv-verify.mjs`, réexécutable). Sur `L=[[0,2.2],[2.2,0]]`, `e=(1,1)` :
  à α=β=½, `Φ(1,1)=(1,1)` **et** `Φ(2.2,2.2)=(2.2,2.2)` sont points fixes ; `Φ(2,2.2)=(2.2,2.2)≠(2,2.2)`
  (pas un point fixe) ; itération depuis 0 converge vers (1,1). À α=β=1, seul `(2.2,2.2)` est fixe.
  La correction du générateur (et l'addendum D6.3 / addendum lecture P-K4-1) est **mathématiquement
  fondée**. `error_origin` = lecteur (coquille de transcription), déjà tranché à la persistance ADR.

---

### Point 6 — Re-exécution des 4 mutants G1 + 1 mutant relecteur — **CONFORME** (détail §b)

Les 4 mutants de G1 §6 re-exécutés par le relecteur (backup par copie, JAMAIS `git checkout` qui
effacerait le lot non commité) : chacun **ROUGE** (exit 1) sur son test, restauration **byte-exacte**
prouvée (sha256 avant == après, = les valeurs G1 §6). Isolation G1 vérifiée : M36 tue 36 et laisse
37 vert ; M37 tue 37 et laisse 36 vert. **Mutant du relecteur** (chemin `interval` de L3,
`l3-gate.ts:116` `!intentInRegion`→`intentInRegion`, ligne 86 du chemin `set` intacte) : test 35
ROUGE (intent hors région ne s'abstient plus ⇒ COMMIT) **et** `l3.test.ts` (chemin `set`,
`intent_not_in_region_denied`) reste VERT ⇒ branche intent→ABSTAIN du chemin interval **couverte et
isolée**. Aucune mutation résiduelle ; `git diff` = les 7 fichiers du lot ; CI re-verte 81/81 (§10).

### Point 7 — « Pas continue par le bas » (p.885) : redémarrages, L_*=(1,1), point fixe — **CONFORME**

- **Redémarrages NON implémentés, RÉSERVE CONSIGNÉE** (conforme D6.3 qui ne les impose pas) :
  `clearingFromBelow` itère Φ depuis 0 (Picard monotone), `tol=1e-10`, `maxIter=100000`, sans logique
  de redémarrage (`clearing.ts:165-182`). Réserve consignée en **quatre** endroits : docstring noyau
  `clearing.ts:19-21`, champ `ClearingResult.pMinus` `clearing.ts:41-42`, docstring `clearingFromBelow`
  `clearing.ts:159-163`, `ukemi/README.md`.
- **L_*=(1,1) ATTEINT et point fixe sur Ex. 3.3** : `clearing_rv_ex33_two_vectors` (vert en CI) asserte
  `l1(half.pMinus,[1,1]) < 1e-6` (`clearing-rv.test.ts:65`) **et** `Φ(L_*)=L_*` (l.69). Confirmé
  indépendamment (`rv-verify.mjs`) : depuis 0 à α=β=½, convergence géométrique (ratio ½) vers (1,1).
  Sur Ex. 3.3 la réserve n'est pas exercée ; la garantie générale α,β<1 reste le pendant §4.
- **Note (sous la réserve, non un défaut de ce lot)** : pour α,β<1 arbitraire, `clearingFromBelow`
  pouvant ne pas atteindre le vrai L_*, le champ `unique` n'est SONDÉ que sur α=β=1 (E&N, Φ continue,
  from-0 exact) et Ex. 3.3 ; hors cela, aucune valeur α,β<1 n'est produite (`clearing.ts:23-25`).
  Cohérent avec « ne jamais prétendre l'unicité hors α=β=1 ».

### Point 8 — R-13 / dette nue / dépendances — **CONFORME**

- **R-13** : `grep -rniE "TODO|FIXME|XXX|HACK"` sur les 9 fichiers du lot (hors « Hacken ») = **0**.
- **G1 §9 zéro dette nue** : 4 pendants (τ_interval fondé ; (α,β) empiriques ; label réel 24h ; oracle
  Ex. 3.3) formés en *recherche* / *consultation* (jamais un « dû » nu), rattachés ADR-M003 §4 ;
  l'oracle Ex. 3.3 est en outre **tranché** (addendum D6.3, `error_origin`=lecteur). Conforme Dettes.
- **R-8** : `git status` sur `package.json`/`package-lock.json`/`packages/*/package.json` = **vide**.
  Aucune dépendance nouvelle (mulberry32, splitQuantile, ajv déjà présents). Lockfile non touché.

### Point 10 — `npm run ci` (racine worktree) — **CONFORME**, exit 0

```
> monark@0.0.0 ci   (gate:vocab && typecheck && test)
gate:vocab OK — scanned 36 file(s), no forbidden claim.
> tsc --noEmit             (aucune ligne "error TS" => 0 erreur, strict)
tests 81 | pass 81 | fail 0
```
Exit 0 (deux exécutions : campagne mutants + post-restauration). 81/81 = 77 Phase 1 + 4 nommés du lot.
`contracts_frozen` vert.

---

## (b) Mutants — rouge + restauration byte-exacte (sha256 avant == après)

Protocole relecteur : `cp` fichier vers backup ; sha256 ; mutation (`perl -0777 -pi` littéral, ou `sed`
adressé-ligne pour le mutant relecteur) ; `node --test <fichier>` (exit capturé) ; `cp` backup vers
fichier ; sha256. **JAMAIS `git checkout`** (le lot n'est pas commité). sha256 d'origine = ceux de G1 §6.

| # | Fichier:ligne | Mutation | Test visé | Résultat | sha256 (avant = après) |
|---|---|---|---|---|---|
| 34 | `l1-split.ts:40` | `sorted[p - 1]` vers `sorted[p - 2]` | `interval_conformer_coverage` | **ROUGE** exit 1 | `9543f161…a576a479` **=** |
| 35 | `l3-gate.ts:112` | `width > input.tauInterval` vers `width <` | `interval_gate_commit_defer_abstain` | **ROUGE** exit 1 | `5d77eeae…7e04c425` **=** |
| 36 | `clearing.ts:133` | `: 0) - beta *` vers `: 0) - 0.0 *` (A-matrice) | `clearing_alpha_beta_regression_en` | **ROUGE** exit 1 ; test 37 VERT (isolation) | `0052db0d…52601173` **=** |
| 37 | `clearing.ts:206` | `+ beta * interbankIn` vers `+ 1 * interbankIn` (phi) | `clearing_rv_ex33_two_vectors` | **ROUGE** exit 1 ; test 36 VERT (isolation) | `0052db0d…52601173` **=** |
| R | `l3-gate.ts:116` | `!intentInRegion` vers `intentInRegion` (chemin interval seul) | `interval_gate_commit_defer_abstain` | **ROUGE** exit 1 ; `set` `intent_not_in_region_denied` VERT | `5d77eeae…7e04c425` **=** |

sha256 complets d'origine (= restauration, chacun re-vérifié après restauration) :
- `l1-split` = `9543f161973028b04717345fe399d917fb50d083d83b115d6dba2a5ba576a479`
- `l3-gate`  = `5d77eeaeb72cedb1cdb439b138bd02d70116078f274a2460da4059377e04c425`
- `clearing` = `0052db0d127b572c80e1d164dc19cec6493be90af748e549c64ebec852601173`

Les trois == valeurs G1 §6. Reproductible : `perl -0777 -pi -e 's/.../.../' <fichier>` puis
`node --test <test>` puis `cp backup <fichier>` puis `sha256sum <fichier>`.

## (c) Passe English-only (D0.5) — INVENTAIRE (ne PAS corriger)

**Cadre D0.5** : le dépôt de gouvernance (celui-ci) est **légitimement en français** ; l'anglais est
l'**export** vers `KraidleAI/monark` (public). Cette revue *produit l'inventaire* de ce qui doit être
traduit avant export ; le français en gouvernance n'est **pas** un défaut du lot. Les noms de tests
sont **déjà anglais** (`interval_conformer_coverage`, `interval_gate_commit_defer_abstain`,
`clearing_alpha_beta_regression_en`, `clearing_rv_ex33_two_vectors` — conforme). Par priorité :

**P0 — chaîne française ÉMISE À L'EXÉCUTION (donnée, pas documentation) atteignant des artefacts publics** :
- `packages/hikae/src/liquidable-24h.ts:64-65` — `liquidable24hProvenanceLine` **retourne** la ligne
  D10 avec les tokens français `(synthétique)` et `date (injectée)`. Va dans rapports/journaux/**panneau
  atelier** (vitrine publique, Lot W). **Tension à signaler** : D6.2 exige littéralement « synthétique »
  à l'atelier ; l'export anglais devra rendre `synthetic` / `date (injected)` — à traiter à l'export
  (Lot W), hors périmètre de ce lot. *Seul item English-only qui émet de la DONNÉE française.*

**P1 — champ de données de fixture (fichier exporté)** :
- `packages/ukemi/test/fixtures/ex33-two-bank.json:3` — champ `"note"` = long paragraphe français
  (dérivation Ex. 3.3, recalculabilité). Data file exporté ⇒ à traduire.

**P2 — messages d'assertion / commentaires français (fichiers de test exportés)** — par fichier :
- `interval-conformer.test.ts` (27 lignes fr.) : commentaires 42-44, 61, 74-75, 100-101 ; messages
  d'assertion 50-51, 56, 67, 70-72, 86, 97, 103-105.
- `interval-gate.test.ts` (14 lignes fr.) : commentaires 7, 39-41, 63, 68 ; messages 47, 53, 59, 65.
- `clearing-rv.test.ts` (29 lignes fr.) : bandeau 6-10, 18-21, 50-58 ; messages 32-35, 39, 41-47,
  64-66, 68-69, 72-73, 75, 77-78.
- `l2.test.ts:59`, `l3.test.ts:28` : commentaire ajouté `// inerte : verdict set (chemin interval non exercé ici)`.

**P3 — commentaires / JSDoc français (documentation ; traduits à l'export)** — par fichier (lignes
françaises / total) :
- NOUVEAUX : `interval-conformer.ts` 29/101 ; `liquidable-24h.ts` 29/67 ; `clearing.ts` 60/210
  (réécrit par le lot) ; `l3-gate.ts` bloc interval JSDoc 1-28, 32, 48-53, 75-76, 81-84, 101-106, 119
  + commentaires 133/206.
- MODIFIÉS (lignes AJOUTÉES par le lot) : `index.ts:41` `// Interval conformer (régression UKEMI…)` ;
  `s2/instrument.ts:385` `// inerte ici : ces états de démo sont tous set…`.
- `packages/ukemi/README.md` (72/99 lignes fr.) : **section entière** « Phase 2 — coûts de défaut
  (α,β) » (l.46-86) et ajouts l.91-99 en français (README = artefact public ⇒ traduire).

Détecteur reproductible : `grep -niE '[accents]|\b(région|largeur|défaut|synth|déclar|jamais|aucun|
inerte|chemin|réutilise|recouvrement|interbancaire|banque|noeud)\b' <fichier>`.

---

## Revue 3 étapes (AgileCoder, checklist G2 du corpus)

- **Compréhension (Willison/P3)** : chaque bloc du diff expliqué sans ré-exécution « en espérant » ;
  intention conforme à ADR-M003 D6.1/2/3 + D11 (G0). ✔
- **Étape 1 — contrôles de base** : aucune implémentation vide ; imports résolus (`tsc --noEmit`
  strict 0) ; docstrings présentes (abondantes). ✔
- **Étape 2 — conformité au backlog** : chaque élément produit mappe D6.1 (conformeur interval + L3),
  D6.2 (classe 24h + ligne D10 + test 34), D6.3 (clearing α,β + tests 36/37) ; **rien en trop**
  (pas de scope creep : ni rescue Thm 4.x, ni prix endogène D6.4, hors périmètre déclaré). ✔
- **Étape 3 — critères d'acceptation + bugs** : CA-K (tests 34-37 verts ; E&N byte-exact) satisfait ;
  cas limites éprouvés (sous-calib fail-closed, borne non-finie ⇒ abstain, horloge close ⇒
  clock_expired, App.2 non-unicité). ✔
- **Pièges code généré** : pas de branche de validation supprimée (gardes amont hoistées, byte-neutre
  vérifié au diff) ; pas d'inversion booléenne non couverte (mutant relecteur `!intentInRegion` ⇒
  test rouge) ; aléa = `mulberry32` seedé explicite, aucun `Math.random`, aucune horloge (Perry Q1-Q3
  OK) ; correction fonctionnelle **non** prise pour preuve (mutation testing appliqué). ✔
- **Dépendances (R-8)** : aucune nouvelle ; lockfile intact. ✔
- **Traçabilité** : provenance G1 renseignée ; aucun TODO/FIXME nu (R-13). ✔
- **Taille (R-25)** : 200+52 modifiés + ~435 nouveaux ≈ 687 < `VIBEGATES_PR_LIMIT` 1205 (D9). ✔

## (d) VERDICT — **CLOS-AVEC-RÉSERVES**

Aucun **défaut** d'ingénierie détecté : tous les oracles (34-37) passent, chaque mutant nommé tue son
test (rouge) avec isolation vérifiée et restauration byte-exacte (sha256), CI verte 81/81 exit 0,
`contracts_frozen` vert, non-régression E&N byte-exacte, math d'Ex. 3.3 **re-vérifiée indépendamment**
par le relecteur, zéro dette nue, zéro dépendance nouvelle. Le lot est **engineering-correct** ; CA-K
est satisfait. Les réserves ci-dessous sont **fermées, numérotées**, aucune n'est un « dû » nu ni ne
bloque la correction du lot ; elles relèvent de l'arbitrage G7 (orchestrateur) et de l'export public.

**Liste fermée des réserves :**

1. **R1 — ordre de priorité des raisons divergent entre chemins** (`l3-gate.ts`). Chemin `interval`
   (`decideInterval`) teste `budget_exhausted` **avant** l'intention ; chemin `set` teste
   `intent_not_in_region` **avant** `budget_exhausted`. Pour `intent∉région ET budget<floor`, les deux
   ABSTAIN mais avec des `reason` différents. **Déclaré** (`l3-gate.ts:102-106`), **fail-closed des
   deux côtés, aucun ALLOW erroné** — chaque chemin suit l'ordre littéral de SA spec (D6.1 pour
   interval, M002 D5 pour set). De plus, le bandeau « Ordre de priorité des raisons » en tête de module
   (`l3-gate.ts:15-18`) ne décrit que l'ordre `set` (l'ordre `interval` n'est documenté que localement).
   *G7 : accepter tel que déclaré, ou demander l'harmonisation inter-chemins + mise à jour du bandeau.*

2. **Couverture du branchement budget du chemin interval** (`l3-gate.ts:108-110`) : `budget_exhausted`
   sur le chemin `interval` n'est **pas assertée directement** par le test 35 (`remainingBudget:0.1`,
   `bFloor:0` ⇒ garde passante). Fail-closed, structurellement identique à la garde budget du chemin
   `set` (elle, testée `budget_exhausted_refuses_commit`). *Observation mineure ; un test ajoutant
   `remainingBudget < bFloor` sur un verdict `interval` fermerait le trou.*

3. **English-only (D0.5) — ensemble d'export à appliquer AVANT l'export public** (inventaire §c, ne
   PAS corriger en gouvernance). Le dépôt de gouvernance est **légitimement français** ; ceci n'est
   **pas** un défaut du lot mais l'obligation d'export vers `KraidleAI/monark` (Lot W). Priorité **P0**
   `liquidable-24h.ts:64-65` : `liquidable24hProvenanceLine` **émet** une DONNÉE française
   (`(synthétique)`, `date (injectée)`) qui atteint le panneau atelier public — avec la **tension
   D6.2** (« synthétique » imposé à l'atelier vs D0.5) à trancher côté export (rendre `synthetic`).
   Puis P1 (fixture `note`), P2 (messages de test), P3 (JSDoc/README).

Rien d'autre n'est ouvert. Les 4 pendants G1 §9 (τ_interval fondé ; (α,β) empiriques ; label réel 24h ;
oracle Ex. 3.3 — ce dernier **tranché**, `error_origin`=lecteur) restent des items formés d'ADR-M003 §4
(recherche/consultation), conformes à la règle Dettes — **hors** périmètre de ce G2.

## (e) Modèle résolu du relecteur

`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` attendu, R-1 ; effort `max` ; siège worker/relecteur ;
instance séparée à contexte frais, ≠ générateur ; D10bis respecté). Aucun commit, aucun push, aucune
modification de code persistée (les 5 mutations restaurées à l'octet, prouvé sha256 §b) — seul
l'orchestrateur committe (R-20).

## Arbitrage G7 partiel (orchestrateur `claude-fable-5-1`, 2026-09-06)
- **R1** : accepté **tel que déclaré** — les deux chemins sont fail-closed et suivent chacun leur spécification (D5 M002 pour `set`, D6.1 M003 pour `interval`) ; harmonisation de l'ordre + bandeau `l3-gate.ts:15-18` = pendant formé pour le Lot I (qui touche L3 pour `GateContext`). Aucun ALLOW erroné : non bloquant.
- **R2** : observation mineure, assertion directe du branchement budget interval ajoutée au Lot I avec `GateContext`.
- **R3 (English only)** : appliqué **en un lot transverse « E »** sur tout le dépôt avant l'export public (D0.5), pas lot par lot — P0 (`synthétique` → `synthetic` dans la ligne de provenance émise) en tête. Le Lot K est commis tel quel dans `monark-governance`.
Verdict G7 du lot : **CLOS**. Commit par l'orchestrateur ; `error_origin` du finding Ex. 3.3 = lecteur (cf. journal).
