# Revue G2 DELTA — Lot D (`packages/atelier`), Phase 1 MONARK — vérification des 2 corrections

- **Réviseur** : relecteur G2 DELTA, instance séparée, **contexte frais** (≠ générateur, ≠ orchestrateur ; P6 / MAST « revue complaisante »).
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme roster 2026-08-14 ; effort max). Opus 5 banni — non utilisé.
- **Date** : 2026-09-05.
- **Branche / worktree** : `phase1/atelier` @ `F:\Monark-wt-atelier` (HEAD `fcfa4cf`).
- **Objet** : vérifier que les **2 corrections** demandées par la revue initiale (`docs/G2-lot-D.md`, verdict ACCEPTÉ-AVEC-CORRECTIONS, 2026-09-04) ont été **correctement appliquées** par l'orchestrateur. Puis `npm run ci`, gate vocab (atelier inclus), TODO nus.
- **Déviation roster — consignée [lu]** : les corrections G2 ont été appliquées par l'**orchestrateur `claude-fable-5-1`** (siège worker tenu par Fable, hors roster « workers = Opus 4.8 »), pour cause de limite d'usage session (4 morts de workers background). Consigné dans `F:\Monark\docs\JOURNAL-PROVENANCE.md` (édition working-dir, texte cité §3.2) ; **mitigation planifiée = cette relecture delta par un G2 Opus 4.8 ≠ générateur, mutants re-exécutés**. Ma revue exécute donc la mitigation prévue.
- **Je ne committe rien, ne modifie aucun fichier suivi (R-20)** ; seul livrable = ce fichier. F:\Monark n'est **pas** touché (inspections `git -C /f/Monark` en **lecture seule** ; aucun fichier modifié).
- **Réversibilité** : `packages/atelier/**` est **non suivi** → git ne voit pas les modifications intra-répertoire ; la réversibilité des mutations est prouvée par **sha256**, pas par git.

## VERDICT : **CLOS**

Les **deux corrections sont correctes et prouvées** — Corr. 1 : l'oracle du test 24 lie les champs HIKAE au verdict brut sur les **9 états**, les deux mutations prédites rougissent le test (assertions in-loop) et restaurent à l'octet ; Corr. 2 : le libellé ADR du test 24 est reformulé en une propriété **implémentable depuis `GateDecision` seul**, cohérente avec le test 24 réel, ancien libellé **barré** (jamais réécrit) et amendement **daté**, miroir `F:\Clawpumptech` md5 identique. CI verte 50/50, gate vocab (atelier inclus) OK, 0 TODO nu.

Subsistent **deux actions orchestrateur au commit** (formées, attribuées R-20 ; **ne remettant pas en cause la correction du contenu** — même statut que la « action orchestrateur » de la revue initiale, qui ne changeait pas la catégorie de verdict). Le journal consigne la déviation, le delta ADR de Corr. 2 est minimal, et l'intention de merge est écrite (« worktrees … tous à `fcfa4cf` + main fusionné », « un commit par lot ») — d'où **CLOS** et non « avec réserves » :

- **Action A — co-localisation de Corr. 2 au merge.** Fait distinctif (≠ « non commité », qui vaut pour *tout* dans cette passe pré-commit, R-20) : la branche du lot `phase1/atelier` (`fcfa4cf`) **commit** encore l'ancienne propriété test-24 non implémentable, tandis que la reformulation Corr. 2 est une édition **working-dir dans `F:\Monark` (main)** — un commit sur la branche du lot ne la ramènerait pas. Les deux ADR **commités** accessibles (main `9d51300`, phase1 `fcfa4cf`) portent toujours « B_t non croissant ». **Au commit Lot D**, garantir que l'amendement Corr. 2 est committé et **co-localisé** avec le test 24 corrigé dans le résultat mergé (l'intention « main fusionné » est consignée et suffit si exécutée). Le miroir `F:\Clawpumptech` est une **copie-fichier** (`git rev-parse` → « not a git repository »), fidèle (md5 identique), pas un commit.
- **Action B — provenance G1.** La ligne de provenance Lot D est **déjà rédigée** dans le working-dir de `F:\Monark\docs\JOURNAL-PROVENANCE.md` (worker `claude-opus-4-8` max, contexte, artefacts, verdict, corrections, CI 50/50 — citée §3.2) ; reste à la **committer** avec le lot. Action orchestrateur, non un défaut.

---

## Environnement de reproduction
- **cwd** : `/f/Monark-wt-atelier` (Git Bash sous Windows 10). **Node** : `v24.15.0` (strip TS natif).
- **CI** : `npm run ci` = `npm run gate:vocab && npm run typecheck && npm run test`.
- **Baseline CI (état livré, avant mutation)** : **exit 0** · `gate:vocab OK — 22 file(s)` · `tsc --noEmit` propre · **50 pass / 0 fail** (dont `atelier_state_oracle` = test 24).
- **CI finale (après mutations + restauration)** : **exit 0** · 22 file(s) · **50 pass / 0 fail** — identique baseline, aucun résidu.

---

## Correction 1 — oracle de test 24 : liaison champ-à-champ HIKAE sur les 9 états

### 1.1 Fichiers effectivement modifiés (empreintes)
| Fichier | sha256 courant | Réf. revue initiale §7 | Interprétation |
|---|---|---|---|
| `test/atelier.test.ts` | `2a97f174da63952dff54d273ca03fc1ce89a49d5d7bf52c2d57bf157c88950dd` | `cb25f282…` | **≠ → modifié** (Corr. 1 appliquée) |
| `src/state.ts` | `e819e038061acc3c5ff78e294f769c3e90f2c451a64f2501eb2a64d6c704f263` | `e819e038…` | **== → non touché** (code de prod. sain, attendu) |
| `src/render.ts` | `99e2af275bf97fabef26fc7c2f269bd76273e5d1abede5deb5d87d4ef7b3f86f` | `99e2af27…` | == inchangé |

### 1.2 Contenu (statique)
Test 24 (`test/atelier.test.ts:26-61`), boucle `for (const s of states)` (l.30 ; `states.length === 9` asserté l.28) — assertés **par état** :
l.43 `s.hikae.method === raw.verdict.method` · l.44 `s.hikae.alpha === raw.verdict.alpha` · l.45 `s.hikae.nCalib === raw.verdict.n_calib` · l.46 `s.hikae.qhat === (typeof raw.verdict.qhat === "number" ? raw.verdict.qhat : null)` · l.47-50 `s.hikae.region` dérivée de `raw.verdict.region`. Les oracles nommés l.54-55 (états `01`, `04`) sont **en plus** de la boucle. Le reproche initial (region 2/9, method/alpha/nCalib/qhat jamais) est **résolu**.

### 1.3 Preuve par mutation (rejeu revue initiale) — le test doit ROUGIR
Backup pristine `state.ts` (sha256 == `e819e038…`), substitution littérale unique (Node, byte-préservant), restauration depuis backup, vérif sha256.

| Mutation (unique) | `state.ts` | `npm run test` | Assertion qui rougit | Restauration |
|---|---|---|---|---|
| `alpha: v.alpha,` → `alpha: v.n_calib,` | l.100 | **exit 1** · `✖ atelier_state_oracle` · **49/1** | `01-commit-up: alpha` — **actual 50, expected 0.1** (swap montré invisible à l'origine, désormais capté) | sha256 `e819e038…` (== baseline) |
| `r.labels.join(", ")` → `r.labels.join(";")` | l.73 (`regionText`) | **exit 1** · `✖ atelier_state_oracle` · **49/1** | `04-defer-set-too-large: region dérivée du verdict brut` — **actual `{up;down}`, expected `{up, down}`** (message **in-loop** l.50, pas l'oracle nommé) | sha256 `e819e038…` (== baseline) |

Les deux rougissent via des assertions **in-loop** (messages templatés `${s.id}: …`), donc la couverture 9-états s'exerce. À baseline (sans mutation) test 24 passe : les 5 asserts × 9 états s'exécutent et passent.

### 1.4 Couverture des 9 états (pas 2) — énumération indépendante
Lecture directe des 9 `fixtures/*.gate-decision.json` : **9/9** portent `method/alpha/n_calib/qhat/region`, valeurs **distinctes** (non-vacantes) — `qhat ∈ {0,1,null}`, `region ∈ {up}/{down}/{up, down}/{}` ; seuls `04`/`05` ont un set multi-labels (d'où rougissement mutation 2 sur `04` d'abord). Combiné à la boucle for-of sur 9 (l.28) et aux messages in-loop rougis : **9 confirmé, pas 2**.

**Corr. 1 : RÉSOLUE.**

---

## Correction 2 — libellé ADR du test 24 reformulé « B_t porté fidèlement »

### 2.1 md5 des deux copies ADR (question posée)
`F:\Monark\docs\adr\ADR-M002-…md` = `c7680901cb4ea90424586d00ba1ed16d` · `F:\Clawpumptech\ADR-M002-…md` = `c7680901cb4ea90424586d00ba1ed16d` — **IDENTIQUES** (`cmp` exit 0). Clawpumptech n'est **pas** un dépôt git (`rev-parse` → « not a git repository ») : copie-fichier fidèle, pas un commit.

### 2.2 Reformulation (ADR l.271-276, D11 item 24)
- **Ancien libellé barré, jamais réécrit comme exigence** : `~~B_t **non croissant** sur miscover~~` (strikethrough l.272). Seule autre occurrence (l.274) = **citation** explicative du retrait (« exige le label réalisé `Y`, absent de `GateDecision` »). Aucune occurrence vive non barrée.
- **Amendement daté** : `**amendé 2026-09-04 (G2 Lot D corr. 2)**`.
- **Reformulation** : `B_t **porté fidèlement** (`remaining_budget` jamais recalculé ni inflé) + histoire de consommation montrée (`03` lowbudget 0.02, `08` budget_exhausted −0.02)`.

### 2.3 Implémentable depuis `GateDecision` seul ? cohérente avec le test 24 réel ?
- **Implémentable — OUI** : `remaining_budget` **est un champ de `GateDecision`** (`state.ts:95`, `test:35`). L'ADR n'invoque que des données de `GateDecision`, explique correctement pourquoi l'ancienne propriété ne l'était pas (miscover `1{Y∉C}` exige `Y`, hors contrat gelé D2) et la rattache au **Lot H** (tests 9-11).
- **Cohérente — OUI** : « B_t porté fidèlement / jamais recalculé » ↔ `test:35` ; « panneau HIKAE lié champ à champ au verdict brut » (ajouté l.275) ↔ `test:43-50` (= Corr. 1) ; « deux horloges » ↔ `test:36-38`. Valeurs `03`=0.02, `08`=−0.02 **confirmées** dans les fixtures. Les deux corrections sont mutuellement cohérentes.

### 2.4 Delta ADR working-dir (lecture seule, F:\Monark)
`git -C /f/Monark diff -- docs/adr/ADR-M002-…md` : **deux hunks** — (1) l.269→ : exactement la reformulation Corr. 2 test-24 (barré + daté + reformulé), **minimal** ; (2) l.355→ : **hors périmètre Lot D** — clôture datée 2026-09-05 du pendant Lot U « EN-Lemme 5 » (`error_origin` test 21, non-expansivité), consignée pour transparence, sans effet sur Corr. 2. Les ADR **commités** (main `9d51300`, phase1 `fcfa4cf`) portent encore l'ancien libellé (voir Action A). `9d51300` = amendement **distinct** (non-expansivité Lot U, test 21) ; `fcfa4cf` est ancêtre de `9d51300`.

**Corr. 2 : RÉSOLUE** (contenu) ; co-localisation au merge = Action A.

---

## Contrôles complémentaires demandés
- **`npm run ci`** : baseline **exit 0**, 50 pass / 0 fail ; finale **exit 0**, 50 pass / 0 fail. `tsc` propre.
- **Gate vocab — `packages/atelier` inclus** : `scripts/grep-forbidden.mjs` traite l'atelier par branche dédiée (l.33-42, `atelier.extensions` = `.ts/.js/.html/.css/.md`, rendu inclus). **11 fichiers atelier** dans le périmètre (`src/{state,render,index,market-stubs,fixtures-loader}.ts`, `test/atelier.test.ts`, `index.html`, `main.js`, `serve.js`, `style.css`, `README.md`) ; total scanné 22 (11 atelier + 11 `src` autres paquets) ; `OK — 0 forbidden claim`.
- **TODO/FIXME nus (R-13)** : grep bornes de mots `\b(TODO|FIXME|XXX|HACK)\b|@ts-ignore|@ts-expect-error|: any\b` sur `packages/atelier` = **0** (exit 1). *Note* : un grep `-i` sans bornes matche « **hack**athon » (`README.md:3`, « cap hackathon ») — faux positif.

---

## 3.2 — Consignation de la déviation (cité de `F:\Monark\docs\JOURNAL-PROVENANCE.md`, édition working-dir, [lu])
> « **DÉVIATION ROSTER consignée (R-1)** : les 10 corrections G2 ont été appliquées par l'orchestrateur lui-même, modèle résolu `claude-fable-5-1` (siège worker tenu par Fable — hors roster « workers = Opus 4.8 ») … Raison : limite d'usage session ; **mitigation : relecture delta par les trois relecteurs G2 Opus 4.8 (≠ générateur) avant G7, mutants re-exécutés par eux**. »

Ligne provenance Lot D (même diff) : générateur worker `claude-opus-4-8` max ; artefacts `packages/atelier/**` ; verdict ACCEPTÉ-AVEC-CORRECTIONS ; 2 corrections ; CI 50/50, vocab OK (22), tsc 0 → **provenance Lot D rédigée, à committer** (Action B).

---

## Trace — empreintes et faits reproductibles
```
# sha256 (cwd /f/Monark-wt-atelier)
e819e038061acc3c5ff78e294f769c3e90f2c451a64f2501eb2a64d6c704f263  packages/atelier/src/state.ts   (baseline == post-restauration ×2)
2a97f174da63952dff54d273ca03fc1ce89a49d5d7bf52c2d57bf157c88950dd  packages/atelier/test/atelier.test.ts  (≠ cb25f282 initial → Corr.1 appliquée)
99e2af275bf97fabef26fc7c2f269bd76273e5d1abede5deb5d87d4ef7b3f86f  packages/atelier/src/render.ts  (== initial)

# md5 ADR — Corr. 2 (working-dir F:\Monark + miroir Clawpumptech)
c7680901cb4ea90424586d00ba1ed16d  F:\Monark\docs\adr\ADR-M002-…md          (working-dir, ` M`, non commité)
c7680901cb4ea90424586d00ba1ed16d  F:\Clawpumptech\ADR-M002-…md             (copie-fichier ; pas un dépôt git)
# ADR commités portant ENCORE l'ancien libellé « non croissant » :
d58237690ce8ea64ac530a7b6ca19eeb  worktree phase1/atelier @ fcfa4cf (tracé) ; main @ 9d51300 : HEAD:docs/adr/… l.272
```

## État git final
Worktree `F:\Monark-wt-atelier` : `?? docs/G2-lot-D.md`, `?? packages/atelier/` (état de départ) **+ `?? docs/G2-lot-D-delta.md`** (ce livrable, seul artefact ajouté). Aucun fichier suivi modifié ; `F:\Monark` non touché.

---

**VERDICT : CLOS.** Corr. 1 (mutation ×2 rougit test 24 via assertions in-loop, couverture 9/9, restauration à l'octet) et Corr. 2 (md5 miroir identique, libellé barré+daté, reformulation implémentable depuis `GateDecision` et cohérente avec le test 24 réel) sont **résolues**. Déviation roster **consignée** [lu] (mitigation = cette revue). Deux **actions orchestrateur au commit**, formées et attribuées (R-20), n'impugnant pas la correction : **A** committer + co-localiser l'amendement ADR Corr. 2 (édit working-dir main, cross-branche vs le test corrigé — intention « main fusionné » consignée) ; **B** committer la ligne de provenance G1 Lot D (déjà rédigée dans le working-dir).
