# Revue G2 DELTA — Lot U (`packages/ukemi`) : vérification des corrections C1-C3

- **Réviseur** : relecteur G2 DELTA, instance séparée, **contexte frais** (≠ générateur, ≠ orchestrateur qui a appliqué
  les corrections ; P6 / D13). Vérification **indépendante avant G7**.
- **Modèle résolu (R-1 / Gate-0)** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8`, effort `max`
  (roster mainteneur 2026-08-14 ; `claude-opus-5` banni, non utilisé). Déclaré à la première prise de parole.
- **Date** : 2026-09-05.
- **Worktree** : `F:\Monark-wt-ukemi`, branche `phase1/ukemi`, HEAD `fcfa4cf`.
- **Portée DELTA** : les **3 corrections** demandées par `docs/G2-lot-U.md` (§7) — C1, C2 (README, cellule « Cible A »),
  C3 (test 23, validation ajv) — appliquées par l'orchestrateur `claude-fable-5-1` (déviation roster, cf. réserve R-B).
  Fichiers touchés relus 100 % : `packages/ukemi/README.md`, `packages/ukemi/test/prediction.test.ts`.
- **Sources primaires relues moi-même** : `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` (D9 l.180-217, D11 test 23
  l.278-280, CA-U3 l.305-308) ; `schemas/prediction.schema.json` ; les mutants recalculés et exécutés (§3).
- **R-20/R-21** : je ne committe pas, je ne modifie **aucun** fichier suivi comme livrable ; unique écriture = ce fichier
  (non suivi). La campagne de mutation a modifié 2 fichiers **temporairement**, restaurés **à l'octet** (sha256), git
  status inchangé (§3). Toute preuve porte commande + chemin absolu + empreinte + cwd. Vérification adversariale, aucun
  crédit accordé sur parole.
- **git status --porcelain de DÉPART** (8 lignes, `cwd=F:/Monark-wt-ukemi`) :
  ```
   M packages/ukemi/package.json
   M packages/ukemi/src/index.ts
  ?? docs/G2-lot-U.md
  ?? packages/ukemi/README.md
  ?? packages/ukemi/src/clearing.ts
  ?? packages/ukemi/src/liquidable.ts
  ?? packages/ukemi/src/prediction.ts
  ?? packages/ukemi/test/
  ```

---

## VERDICT : CLOS-AVEC-RÉSERVES

**Corrections : C1 CLOS · C2 CLOS · C3 CLOS — 3/3.** Chacune est close avec preuve reproductible (§1-§3).

**Les réserves ne portent PAS sur C1-C3** (toutes closes). Elles **bloquent l'intégration** et sont **propriété de
l'orchestrateur (R-20)**, à écrire au G1/G7 **avant** merge (§4) :
- **R-A** — le journal de provenance n'a toujours pas (a) d'entrée de **code** Lot U ni (b) le **Gate-0/R-1** du worker
  générateur ⇒ je ne peux pas confirmer depuis le journal que le code relu a été généré par `claude-opus-4-8`.
- **R-B** — la déviation roster (C1-C3 appliquées par `claude-fable-5-1`) est **déclarée** (mission) mais **non
  consignée** dans le worktree (preuve mtime, §4).

**Bloquant d'intégration inchangé** depuis `G2-lot-U.md` P1 : R-A en est la persistance vérifiée ; R-B s'y ajoute.
Aucune de ces réserves ne rouvre C1-C3 ; ce sont des pendants **nommés et formés** (zéro dette), non des « dûs » nus.

---

## 1. C1 — README porte la conséquence (i) de D9 — **CLOS**

**Exigence** (mission + CA-U3, ADR l.305-308) : le README porte la **conséquence (i) de D9** — fenêtre non partagée ;
2e classe de tâche HIKAE 24 h `alpha=0.01` ; distincte de `btc-dir-15m`.

**Preuve — `packages/ukemi/README.md:14`** (cellule « Cible A »), verbatim :
> **Conséquence (i) de D9** : UKEMI et HIKAE **ne partagent plus la fenêtre** — la cible A devient, à l'intégration
> Phase 2, une **2e classe de tâche HIKAE** à horizon 24 h et `alpha = 0.01` (viser 99 %), **distincte de
> `btc-dir-15m`**.

**Fidélité à la source primaire — ADR-M002 D9 (i), l.202-203** (relue) :
> (i) UKEMI et HIKAE ne partagent plus la fenêtre — la cible A devient, à l'intégration Phase 2, une **2e classe de
> tâche HIKAE** à horizon 24 h et `alpha = 0.01` (viser 99 %), distincte de `btc-dir-15m`

⇒ **correspondance mot-à-mot** des quatre éléments requis. Grep de confirmation (`cwd=F:/Monark-wt-ukemi`) :
`grep -n "ne partagent plus la fenêtre\|2e classe de tâche HIKAE\|alpha = 0.01\|btc-dir-15m\|Conséquence (i)"
packages/ukemi/README.md` → **un seul hit, ligne 14**, portant les cinq motifs. Le défaut C1 de la revue initiale
(« ni fenêtre, ni classe de tâche, ni alpha, ni 0.01, ni btc-dir dans le README ») est **levé**. **CLOS.**

---

## 2. C2 — README porte « déclaré, non fondé » + réserve C13d — **CLOS**

**Exigence** (mission + CA-U3) : cible/horizon écrits avec « **déclaré, non fondé** » et la **réserve C13d** (aucun
acheteur nommé), distincte de la non-trouvaille de la dynamique.

**Preuve — `packages/ukemi/README.md:14`**, verbatim :
> **Cible/horizon = « déclaré, non fondé »** (réserve C13d) : aucun acheteur n'a encore nommé une exigence de couverture
> (G7 UKEMI, NON TROUVÉ) ; le niveau 99 % est une cible HIKAE Phase 2, pas une sortie UKEMI Phase 1.

**Fidélité à la source — ADR-M002 C13d, l.215-216** (relue) :
> **Réserve C13d — levée par la décision (d)** : l'horizon est désormais 24 h […]. Reste **déclaré, non fondé** : aucun
> acheteur n'a encore nommé une exigence de couverture (G7 UKEMI, NON TROUVÉ) ; le niveau 99 % est une cible HIKAE
> Phase 2, pas une sortie UKEMI Phase 1.

⇒ **correspondance mot-à-mot** du résidu C13d. **Précision anti-lecture-adverse** (non un défaut) : le titre ADR l.215
dit « C13d — **levée** par la décision (d) », tandis que le README dit « (réserve C13d) ». Ce n'est pas contradictoire :
la décision (d) a **levé la composante horizon** (désormais 24 h) ; **la composante « acheteur nommé » subsiste**
(l.216 : « Reste déclaré, non fondé : aucun acheteur… »). Le README porte exactement ce **résidu** — le libellé prescrit
par C2 de la revue initiale. Grep : `grep -n "déclaré, non fondé\|réserve C13d\|aucun acheteur" packages/ukemi/README.md`
→ ligne 14. Le défaut C2 (« non fondé » absent du README) est **levé**. **CLOS.**

---

## 3. C3 — Test 23 valide la `Prediction` contre le schéma gelé via ajv — **CLOS**

**Exigence** (mission + D11 test 23, ADR l.278-280) : la `Prediction` émise passe `serializePrediction` **+ schéma ajv**
contre `schemas/prediction.schema.json`.

**Preuve d'existence — `packages/ukemi/test/prediction.test.ts`** :
- `:11-19` compile le schéma : `Ajv2020` (= `ajv/dist/2020`, **dialecte draft-2020-12** correspondant au `$schema` du
  fichier) + `ajv-formats` (format `date-time`), `strict:true, allowUnionTypes:true, allErrors:true` ; le schéma est lu
  depuis `<ROOT>/schemas/prediction.schema.json`.
- `:35` `assert.equal(validatePrediction(p), true, …)` — l'instance émise est **VALIDE** ;
- `:36` `assert.equal(validatePrediction({ ...p, p_correct: 0.99 }), false, …)` — une clé étrangère la rend **INVALIDE**
  (`additionalProperties:false`). La direction « rejette » est donc **dans le test lui-même**, en plus des mutants.

**Le schéma validé est le schéma GELÉ.** `prediction.schema.json` figure au manifeste `test/contracts-frozen.manifest.json`
et le test racine `contracts_frozen — schemas/ … identiques au manifeste Phase 0 (357ef25)` est **vert aux deux runs CI**
(§5) ⇒ test 23 valide contre le contrat byte-identique à Phase 0, pas contre une copie dérivable.

**Justification de `allowUnionTypes`** : `schemas/prediction.schema.json:12` porte `"yhat": { "type": ["string",
"number"] }` — un **type union**. En `strict:true`, ajv **refuse** un `type` multi-valué sauf `allowUnionTypes:true`.
Prouvé par mutant M3 (compile ajv lève, ci-dessous). C'est la **relaxation minimale nécessaire** (une seule union dans
tout le schéma), le reste du mode strict reste actif.

### 3.1 Campagne de mutation (non-vacuité, reproductible)

Harnais : `scratchpad/mutants_delta.sh` — sauvegarde `cp -p`, mutation par **remplacement exact à occurrence unique**
(le script échoue si l'aiguille n'est pas trouvée exactement une fois), restauration en `trap EXIT`, vérification
sha256. `cwd=F:/Monark-wt-ukemi`, Node v24.15.0. Chaînes FROM→TO **inlinées** (le scratchpad est propre à la session) :

| # | Fichier | FROM → TO | Commande | Résultat (attendu ROUGE) |
|---|---|---|---|---|
| M0 | `test/prediction.test.ts` | *(intact)* | `node --test packages/ukemi/test/prediction.test.ts` | `✔ prediction_numeric_emitted`, EXIT=0 (baseline vert) |
| M1 | `test/prediction.test.ts` | `validatePrediction(p), true` → `validatePrediction({ ...p, schema_version: "1.0" }), true` | idem | **✖** `prediction_numeric_emitted`, **EXIT=1** ; ajv : `must match pattern "^\d+\.\d+\.\d+$"` @ `/schema_version` |
| M2 | `test/prediction.test.ts` | `validatePrediction(p), true` → `validatePrediction((({ produced_at, ...r }) => r)(p)), true` | idem | **✖**, **EXIT=1** ; ajv : `must have required property 'produced_at'` |
| M3 | `test/prediction.test.ts` | `strict: true, allowUnionTypes: true, allErrors: true` → `strict: true, allErrors: true` | idem | **✖** au **compile ajv**, **EXIT=1** ; `Error: strict mode: use allowUnionTypes to allow union type keyword at "…#/properties/yhat" (strictTypes)` |
| M4 | `src/liquidable.ts` | `pos.liqThreshold < pos.debt` → `pos.liqThreshold <= pos.debt` | `node --test packages/ukemi/test/liquidable.test.ts` | **✖** `liquidable_amount_eq3` (**test 22**), **EXIT=1** ; `AssertionError: P1 s=0,125 : 70 < 70 est faux — le seuil n'est pas liquidable` |

- **M1/M2** prouvent que l'assertion ajv du test 23 est **non-vacuous** au niveau champ (pattern `schema_version`,
  `required produced_at`) — les deux mutants demandés par la mission rougissent avec l'**erreur ajv nommée**.
- **M3** prouve `allowUnionTypes` **load-bearing et justifié** par le `yhat` union : l'ôter fait **lever le compile**
  précisément sur `#/properties/yhat`.
- **M4** ré-exécute un mutant de la revue initiale (mutant B) : le test 22 rougit avec son assertion nommée ⇒ **la suite
  Lot U est toujours chargée et non-vacuous** (pas un artefact d'un runner cassé).

### 3.2 Restauration prouvée (à l'octet)

Empreintes baseline (`cwd=F:/Monark-wt-ukemi`) :
- `test/prediction.test.ts` sha256 = `3a8af0a6e58130fcc123acd0bfe0c38f29ea1bfc8b48608991dbb4a09d7f91f1` (2735 o)
- `src/liquidable.ts` sha256 = `c3f947b9af46b88e82613669a95866fd8939fc32e26a1310285ef13d70ebeabd` (2984 o)

Après chaque mutant : restauration `cp -p`, sha256 **re-vérifié IDENTIQUE** (M1-M4 : `RESTORE … sha256 OK`). En fin de
campagne : les deux fichiers sha256 == baseline (`ALL RESTORED BYTE-IDENTICAL`).

**Nature de la preuve de restauration** (adversarial) : `packages/ukemi/test/` est un **répertoire non suivi** (`??` en
porcelain) ⇒ `git status` **ne voit pas** les changements de contenu de `prediction.test.ts` ; la preuve de restauration
y est donc **sha256** (exigée par la mission), pas git. Pour `src/liquidable.ts` (**suivi**, ` M`), j'ai les **deux**
preuves : sha256 == baseline **et** porcelain ` M` inchangé. `git status --porcelain` après campagne = **8 lignes,
identique au départ**.

**C3 CLOS** : test 23 valide bien via ajv contre le schéma gelé, l'assertion est non-vacuous (M1/M2), `allowUnionTypes`
est justifié (M3), restauration à l'octet. Le défaut C3 (« + schéma ajv non exercé ») est **levé**.

---

## 4. Réserves (propriété orchestrateur, R-20 — ne rouvrent PAS C1-C3)

### R-A — pendant P1 de `G2-lot-U.md` : provenance Lot U + Gate-0 worker **toujours ouverts**
`docs/JOURNAL-PROVENANCE.md` (règle propre `:3-4` : « un artefact sans entrée ne s'intègre pas ») **n'a toujours pas** :
- (a) de **ligne d'entrée pour le CODE du package Lot U** (`clearing.ts`/`liquidable.ts`/`prediction.ts`/tests/README) :
  seule Phase 0 a une ligne de table (`:8`, code `357ef25`) ; la §Phase 1 (`:93-135`) couvre le **G0/ADR** (validateurs
  `claude-fable-5-1`) et les **fichiers racine écrits par l'orchestrateur**, pas le code du paquet ;
- (b) la **résolution Gate-0/R-1 du worker générateur** Lot U : le journal note (`:115-116`) que « les deux workers H/U
  initiaux sont morts sur limite d'usage **avant d'écrire** […] relancés » — mais la résolution de modèle du worker
  **abouti** n'est **pas consignée**.

⇒ **je ne peux pas confirmer depuis le journal que le code relu a été généré par `claude-opus-4-8`.** À écrire par
l'orchestrateur au G1/G7 **avant** intégration. Séparé de C1-C3 (R-20 me l'interdit, il s'écrit au merge).

### R-B — déviation roster déclarée mais **non consignée** dans le worktree
La mission déclare C1-C3 appliquées par `claude-fable-5-1` (déviation roster : un worker Opus 4.8 est la voie nominale
d'implémentation). **Dans le worktree, cette déviation n'est pas consignée** — fait, non jugement :
- mtimes (`stat`) : `docs/JOURNAL-PROVENANCE.md` = **2026-09-04 22:30:03** ; `README.md` = **23:51:07** ;
  `test/prediction.test.ts` = **23:51:32**. Le journal **précède les corrections de ~1h21**.
- `grep -niE "C1 |C2 |C3 |correction|delta|G2-lot-U" docs/JOURNAL-PROVENANCE.md` ne rend que des mentions **pré-code**
  (corrections des checkpoints 1/2 de l'ADR) — **aucune entrée d'application des corrections G2 lot-U**.

⇒ à **verser dans la même entrée de provenance** que R-A : (a) ligne code Lot U, (b) Gate-0/R-1 du générateur,
(c) **C1-C3 appliquées par `claude-fable-5-1` (déviation roster, 2026-09-04)**. Le **contenu** des corrections, lui, est
vérifié indépendamment ici (§1-§3) : la déviation n'affecte pas la correction, seulement sa traçabilité.

### Pendants inchangés hors périmètre DELTA (rappel, non bloquants pour C1-C3)
Non touchés par C1-C3, repris de `G2-lot-U.md` §9 pour la vue G7 : **P2** (branche singulière `solveLinear`
`clearing.ts:67,74` non exercée — code défensif commenté) ; **P3** (§4(l) énoncé exact du Lemme 5 sur page rendue —
lecteur Sonnet 5, `error_origin` au G7) ; **P4** (HIKAE/Phase 2 hors périmètre). Aucun n'est une correction ; aucun ne
change de statut.

---

## 5. Oracle CI, vocab, TODO (R-21 reproduit, pas cru)

**`npm run ci`** (`cwd=F:/Monark-wt-ukemi`, Node v24.15.0, npm 11.12.1), **deux exécutions encadrant la campagne** :
- baseline (avant mutants) : **EXIT=0**, `gate:vocab OK — scanned 14 file(s)`, `tests 51 · pass 51 · fail 0` ; les 6
  tests Lot U nommés verts (`clearing_fixed_point`, `fictitious_default_le_n_rounds`, `uniqueness_when_e_positive`,
  `nonexpansive_in_e`, `liquidable_amount_eq3`, `prediction_numeric_emitted`).
- final (après restauration) : **EXIT=0**, `scanned 14`, `51 / 51 / 0` — `diff` des lignes `✔/✖/scanned/forbidden`
  baseline↔final = **identique hors timings** ⇒ campagne **sans résidu**.

**Gate vocab étendu** (oracle non-LLM ; le gate CI ne scanne que `packages/*/src/**/*.ts` — **ni le README ni les
tests** ukemi, qui portent les ajouts C1-C3) :
`node scripts/grep-forbidden.mjs packages/ukemi/README.md packages/ukemi/test` → `scanned 19 file(s), no forbidden
claim`, **EXIT=0**. Les « 99 % » ajoutés par C1/C2 sont encadrés (« viser 99 % », « cible de couverture HIKAE Phase 2 »,
« pas une sortie UKEMI Phase 1 ») et ne matchent **aucun** motif banni (`vocab-banned.json` cible « X % …
corrects/accurate/winning », pas « X % de couverture ») ⇒ « aucun 99 % présenté comme une sortie » (CA-U3) **confirmé
machine** sur les fichiers modifiés.

**TODO nus (R-13)** : `grep -rn "TODO\|FIXME\|XXX\|HACK" packages/ukemi/` → **aucun match**.

---

## 6. git status final = départ + ce livrable

`git status --porcelain` (`cwd=F:/Monark-wt-ukemi`), après écriture de ce fichier — **9 lignes = 8 de départ +
`?? docs/G2-lot-U-delta.md`** (voir la capture en fin de session ci-dessous, jointe par la vérification post-écriture).
Aucun fichier suivi modifié par le relecteur ; les 2 fichiers mutés temporairement sont restaurés à l'octet (§3.2).

---

**VERDICT : CLOS-AVEC-RÉSERVES.** C1 CLOS · C2 CLOS · C3 CLOS (3/3, preuve reproductible). Réserves **hors C1-C3**,
propriété orchestrateur, bloquantes pour l'intégration au G7 : **R-A** (provenance code Lot U + Gate-0 worker) et **R-B**
(déviation roster déclarée non consignée). Pendants P2/P3/P4 inchangés. Zéro dette : chaque réserve est un pendant nommé
et formé, à écrire par l'orchestrateur au G1/G7 avant merge.
