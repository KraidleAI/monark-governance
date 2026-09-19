# Revue G2 — Lot D (`packages/atelier`), Phase 1 MONARK

- **Réviseur** : worker G2, instance séparée, contexte frais (≠ générateur, P6 / MAST « revue complaisante »).
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme roster 2026-08-14 ; effort max).
  Opus 5 banni — non utilisé.
- **Date** : 2026-09-04.
- **Branche / worktree** : `phase1/atelier` @ `F:\Monark-wt-atelier`.
- **Périmètre** : 100 % de `packages/atelier/**` (13 fichiers : `src/{state,render,index,market-stubs,fixtures-loader}.ts`,
  `test/atelier.test.ts`, `index.html`, `style.css`, `main.js`, `serve.js`, `tsconfig.json`, `package.json`, `README.md`).
- **Spec de rattachement (G0)** : `F:\Monark\docs\adr\ADR-M002-phase1-moteurs-hikae-ukemi.md` — D0/D1 (Lot D, l.54-64),
  D11 (tests 24-28, l.271-280), CA-D1..D5 (l.319-324), CA-0 (l.325-327).
- **Checklist appliquée** : `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\templates\checklist-revue-G2.md`.
- **Interdit respecté** : `C:\Users\KACIMI\F:\PRODUITS\downloads-monark\grok 1\src\**` **non ouvert** ; conformité « code le nôtre » vérifiée
  par la forme (commentaires citant NOS ADR/contrats/types, import `@monark/contracts`, aucun code lifté visible), pas par
  comparaison au source Grok.

## VERDICT : **ACCEPTÉ-AVEC-CORRECTIONS** — 2 corrections (aucune ne bloque le merge) + 1 action orchestrateur.

Le paquet est discipliné, sans dépendance runtime, sans réseau, sans vocabulaire interdit ; CI verte ; serveur live vérifié ;
échappement HTML prouvé liant par mutation. Les deux corrections portent sur (1) un **oracle de test faible** (test 24 ne lie
pas les champs HIKAE au verdict brut — prouvé reproductiblement) et (2) une **désalignement de la description ADR du test 24**
(« B_t non croissant sur miscover » non calculable depuis `GateDecision`). Le code de production est correct dans les deux cas.

---

## Environnement de reproduction (checklist §Scripts : chemin absolu + cwd consignés)
- **cwd** : `/f/Monark-wt-atelier` (Git Bash sous Windows 10).
- **Node** : `v24.15.0` (strip TS natif → `serve.js` importe `./src/index.ts`).
- **Commande CI** : `npm run ci` = `npm run gate:vocab && npm run typecheck && npm run test`.
- **Résultat CI** : `gate:vocab OK — scanned 22 file(s)` · `tsc --noEmit` sans erreur · **50 tests pass / 0 fail**
  (dont 24-28 atelier, `contracts_frozen` CA-0, `fixtures_root_valid` 9 états 3/2/3/1).
- **Note git** : `packages/atelier/**` est **non suivi** (`?? packages/atelier/`). `git status` ne détecte pas les
  modifications **intra**-répertoire non suivi ; la réversibilité des mutations est donc prouvée par **sha256**, pas par git.

---

## 1. Vérifications adversariales exigées (R-21)

| # | Exigence | Verdict | Preuve reproductible |
|---|---|---|---|
| 1 | Les 5 tests 24-28 existent, non vacuous | **PASS** | `test/atelier.test.ts:26,54,76,89,99` ; 5/5 pass. Non-vacuité **prouvée par mutation** : `render.ts` `esc→return s` fait rougir le test 25 sur `id échappé` (injection `<img>`), restauré (§Mutations). |
| 2 | Rendu sans gate vocab ni promesse rendement/exactitude ; « kill-switch≠stop-loss » HORS rendu ; deux horloges nommées ; B_t = capacité (jamais rendement) ; UKEMI non branché | **PASS** | Gate vocab sur rendu : test 26 vert + grep indépendant sur page **servie** = 0 (95%/100%/hallucination/guaranteed/everlasting/first conformal/with probability). « kill-switch »/« stop-loss » **uniquement** `README.md:16`, absents du rendu. « rendement » dans le rendu = **négation seule** `render.ts:53` « pas un rendement » (×9 servi). Horloges `render.ts:56-57` « couverture avant décision » / « label arrivé à t+w » (×9). B_t `render.ts:52-53` « capacité d'autorisation qui se consomme — pas un rendement ». UKEMI `render.ts:46` « non branchée en Phase 1 … rien n'est simulé ici » ; `state.ts:107` `status:"non-branchee-phase1"`. |
| 3 | Zéro réseau ; `serve.js` 127.0.0.1 ; aucune dépendance runtime ; stubs perps lèvent | **PASS** | Grep `fetch\|XMLHttpRequest\|WebSocket\|http\.request\|net\.connect` sur `.ts/.js/.html/.css` **hors test** = **0** (seules occurrences : `test/atelier.test.ts` et mention négative doc `README.md:33` « aucun `fetch` », `.md` non scanné par test 28). `serve.js:25` `.listen(PORT,"127.0.0.1",…)`. `package.json` **sans champ `dependencies`**. `market-stubs.ts:9-18` `perps_order_*` → `refuse()` `throw` ; test 27 vert. |
| 4 | Racine intouchée (D13) ; tsconfig atelier étend racine + lib DOM | **PASS** | `git diff main -- tsconfig.json package.json` = **vide**. `git status --porcelain` = `?? packages/atelier/` **seul** (rien d'autre modifié). `packages/atelier/tsconfig.json:2` `extends:"../../tsconfig.json"`, `:4` `lib:["ES2023","DOM"]`. |
| 5 | `esc` sur toute donnée de fixture rendue ; closed-check avant tout rendu | **PASS** | `esc` (`render.ts:9-11`) appliqué à id, reason, taskClass, résiduels, method, region, intent, tool, coverageAt, labelAt (champs texte). Nombres (`alpha,nCalib,qhat,remainingBudget`) interpolés bruts mais **typés `number`** + garantis par `fixtures_root_valid` (ajv, schéma gelé). Closed-check : `state.ts:86` `assertClosedGateDecision(d)` **1re instruction** de `buildState`, avant construction/rendu ; test 24:50 prouve le refus d'une clé étrangère (`p_correct`). Liaison prouvée par mutation (§Mutations). |
| 6 | `npm run ci` vert + `node serve.js` + curl + 9 `data-state` + arrêt serveur | **PASS** | CI verte (ci-dessus). `node packages/atelier/serve.js` depuis `/f/Monark-wt-atelier` → page servie 19 290 o ; `curl http://127.0.0.1:4173/` → **9 `data-state`** (ids exacts `01-commit-up`…`09-under-calib`), 2 horloges ×9, B_t ×9, 3 panneaux ×27, UKEMI non-branché ×9. Serveur **arrêté** : `taskkill //F //PID 57832`, port 4173 fermé (vérifié). |
| 7 | Pas de TODO nu (R-13) ; TS strict ; sources citées | **PASS** | Grep `TODO\|FIXME\|XXX\|HACK\|@ts-ignore\|@ts-expect-error\|: any` = **0**. `tsconfig` racine strict (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`) hérité ; `tsc --noEmit` exit 0. Sources citées : commentaires → ADR-M002 D0/D1/D8/D11, ADR-CERT-MONARK, `GATED_TOOLS` (Lot H) ; README → ADR-M002. |

## 2. Checklist G2 du corpus (100 %, sans échantillonnage)

| Item checklist | Verdict | Note |
|---|---|---|
| Compréhension (Willison P3) — chaque bloc expliqué | OK | Flux : fixtures disque → `buildState` (closed-check) → `AtelierState` pur → `render*` chaînes → `serve.js` (SSR local) → `main.js` (bascule DOM). |
| Intention ↔ spec/ADR (G0) | OK | Chaque fichier rattaché à D1/D11 ; tests 24-28 = D11 ; CA-D1..D5 couverts (voir §4). |
| Aucune branche/validation d'entrée absorbée (CodeScene) | OK | `assertClosedGateDecision` conservé en garde ; `regionText` gère set/interval + défensif undefined/null. |
| Inversion/simplification booléenne non testée (CodeScene) | **Corr. 1** | Test 24 ne lie pas `hikae.{method,alpha,nCalib,qhat}` au verdict brut — mapping-swap invisible (prouvé). |
| Maltraitance de `this` (extraction fn) | OK | Aucune méthode/`this` ; fonctions pures + free functions. |
| Correction fonctionnelle ≠ preuve de sécurité (Perry) | OK | Échappement testé **et** prouvé par mutation ; pas de faux certificat. |
| Aléa/crypto/chemins de fichiers/symlinks (Perry Q1-Q3) | OK (positif) | `serve.js` sert **3 routes câblées** (`/`, `/style.css`, `/main.js`) + 404 ; **aucun mapping URL→chemin** → pas de traversal. Aucune source d'aléa. |
| XSS / injection (Veracode) | OK | `esc(&,<,>,")` sur tout texte de fixture ; test 25 (id hostile) + mutation prouvent la liaison. |
| Dépendances (R-8, slopsquatting) | OK | Aucune dépendance runtime déclarée ; aucune installation. `@monark/contracts` = sibling workspace (symlink), pas un paquet tiers. Lockfile racine non modifié (racine intouchée). |
| Duplication d'un existant (R-3) | OK | B_t **jamais recalculé** (`test:35` « = remaining_budget »); aucune région reconstruite (propriété Lot H, D9/C4) ; closed-check réutilisé, pas réimplémenté. |
| Taille de lot (R-25) | OK | Un sujet (écran de démo), paquet unique isolé. |
| Traçabilité — provenance | **Action orchestrateur** | `JOURNAL-PROVENANCE.md` couvre Phase 0 + amendements ADR-M002 et nomme les fichiers racine orchestrateur ; **ligne de génération du paquet atelier à consigner au commit** (R-20/G1). |
| Aucun TODO/FIXME nu (R-13) | OK | Grep = 0. |
| AgileCoder étape 1 — impl. vides / imports / docstrings | OK | Aucune impl. vide ; imports résolus (CI) ; JSDoc en tête de chaque module. |
| AgileCoder étape 2 — conformité backlog, rien en trop | OK | Surface = D1/D11 ; pas de fonction hors périmètre. |
| AgileCoder étape 3 — critères d'acceptation + cas limites | OK (voir §4) | CA-D1..D5 vérifiés ; cas limites `under_calib` (région `{}`), `budget_exhausted` (B_t<0, couche verdict vs gate). |

## 3. Corrections numérotées

### Correction 1 — oracle faible dans le test 24 (non bloquant ; le code `state.ts` est correct)
- **Fichier / ligne** : `packages/atelier/test/atelier.test.ts:30-41` (boucle par état de `atelier_state_oracle`) ;
  `hikae.region` n'est vérifié qu'aux `:44-45` (2 états sur 9).
- **Défaut** : la boucle n'assert **jamais** `s.hikae.method`, `s.hikae.alpha`, `s.hikae.nCalib`, `s.hikae.qhat` contre
  `raw.verdict.{method,alpha,n_calib,qhat}`. Un bug de mapping entre champs `number` est donc invisible.
  **Preuve reproductible** : mutation `state.ts:100` `alpha: v.alpha` → `alpha: v.n_calib` ⇒ `tsc --noEmit` exit 0 **et**
  5/5 tests verts (alpha afficherait 50 au lieu de 0.10, non détecté). Piège CodeScene « inversion non couverte par un test ».
- **Correction proposée** : dans `for (const s of states)`, ajouter par état
  `assert.equal(s.hikae.method, raw.verdict.method)`, `assert.equal(s.hikae.alpha, raw.verdict.alpha)`,
  `assert.equal(s.hikae.nCalib, raw.verdict.n_calib)`, `assert.equal(s.hikae.qhat, raw.verdict.qhat)`, et étendre la
  vérification `region` aux 9 états (dériver l'attendu de `raw.verdict.region`).
- **Owner** : worker atelier (patch de test ; l'orchestrateur route). **Ne bloque pas le merge** (code de production sain).

### Correction 2 — description ADR du test 24 non implémentable (non bloquant ; à trancher par l'orchestrateur)
- **Fichier / ligne** : `F:\Monark\docs\adr\ADR-M002-phase1-moteurs-hikae-ukemi.md` D11, l.271-272 (« test 24 … **B_t non
  croissant sur miscover** »).
- **Défaut** : « miscover » = `1{Y∉C}` exige le **label réalisé `Y`**, **absent du contrat `GateDecision`** (gelé D2) — l'atelier
  ne peut pas le calculer ; de plus le budget des 9 fixtures n'est **pas** monotone dans l'ordre
  (`0.10, 0.08, 0.02, 0.10, 0.06, 0.10, 0.10, −0.02, 0.10` — états indépendants, pas une séquence). Le test implémenté
  substitue la propriété honnête et vérifiable : **B_t porté fidèlement** (`test:35` `s.remainingBudget === raw.remaining_budget`,
  jamais recalculé). La propriété « B_t non croissant sur miscover » relève de **HIKAE L2 / Lot H** (tests 9-11 :
  `imocp_update_direction`, `budget_ignores_pending_label`, `budget_exhausted_refuses_commit`).
- **Correction proposée** : l'orchestrateur reformule la description du test 24 en « B_t **porté fidèlement** (jamais
  recalculé/inflé) + histoire de consommation montrée (`03` lowbudget 0.02, `08` budget_exhausted −0.02) », et rattache
  explicitement « non croissant sur miscover » au remit du Lot H. (Le relecteur ne modifie pas l'ADR — R-20.)
- **Owner** : orchestrateur. **Ne bloque pas le merge.**

### Action orchestrateur (pas un défaut worker) — provenance G1
Consigner au commit la **ligne de provenance Lot D** dans `docs/JOURNAL-PROVENANCE.md` : date 2026-09-04, modèle worker
`claude-opus-4-8` effort max, contexte (ADR-M002 D1/D11 + contrats gelés + `fixtures/` racine), générateur = worker atelier,
réviseur = ce G2, verdict. Absente aujourd'hui car le paquet est non suivi (attendu jusqu'au commit) — R-20/G1.

## 4. Couverture des critères d'acceptation (D11 / CA-D)
- **CA-D1** oracle test 24 vert + visuel live (9 états, 3 panneaux, verdict/décision/raison, B_t, 2 horloges) — **oui** ;
  lancé via `node packages/atelier/serve.js` (chemin **équivalent** à `npm run atelier` : `serve.js` résout `HERE`/`ROOT`
  par `import.meta.url`, indépendant du cwd). Capture d'écran checkpoint 2 = ressort investisseur, hors ma portée.
- **CA-D2** test 25 (rejeu 9 états) — **oui** ; **CA-D3** test 26 (gate vocab sur rendu + mutant) — **oui** ;
  **CA-D4** tests 27+28 (stubs lèvent ; absence d'appel par grep + `fetch` piégé) — **oui** ;
  **CA-D5** zéro dépendance runtime, `tsconfig` DOM propre, racine intouchée — **oui**.
- **CA-0** `contracts_frozen` + `fixtures_root_valid` verts dans ce worktree — **oui**.

## 5. Observations non bloquantes (pas des corrections)
1. `@monark/contracts` importé mais non déclaré en `dependencies` : **conforme** à CA-D5 (« `package.json` sans
   dependencies ») ; résolu par symlink workspace ; l'ajouter violerait la lettre de CA-D5. Aucune action.
2. Nombres (`alpha/nCalib/qhat/remainingBudget`) interpolés sans `esc` : sûrs car typés `number` + garantis par
   `fixtures_root_valid` (ajv/schéma gelé). L'atelier seul (closed-check) ne re-valide pas les **types** — défense en
   profondeur assurée par le test racine, pas par le paquet. Observation.
3. `plusMinutes` (`state.ts:81`) normalise `.000Z→Z` : ne s'active que si ms == 000 (vrai pour toutes les fixtures, `:00Z`).
   Robuste pour ce jeu ; cosmétique si une fixture future portait des fractions de seconde.
4. Fixture `08-budget-exhausted` : badge **ABSTAIN** + `reason:budget_exhausted` au niveau **décision**, alors que le
   panneau HIKAE affiche « abstention : non » (le **verdict** a couvert, `abstain:false`). C'est **correct** — deux couches
   (verdict de couverture vs décision de gate, D4/D5) ; fidèle au contrat, pédagogiquement juste.
5. `index.html:12` (« Le produit est le droit d'agir **sous couverture attestée**, et le droit de n'avoir aucun avis ») :
   seule phrase éditoriale du rendu ; « sous couverture attestée » **rattachée** `ADR-CERT-MONARK-reconciliation.md:22`,
   « droit de n'avoir aucun avis » = paraphrase de l'abstention/silence calibré (ADR-M002 D3/D5) ; passe le gate vocab.
   Sourcée, non fautive.

## 6. Ce que je n'ai PAS pu vérifier
- **Interaction DOM de `main.js`** (bascule d'état visible/`hidden`) : non couverte par test automatisé (pas de jsdom) ;
  le rendu et le service sont vérifiés, mais le **basculement interactif** relève de la capture d'écran du checkpoint 2
  (CA-D1). Vérifié par inspection statique seulement (`main.js` : logique de bascule correcte, aucune donnée, aucun réseau).
- **Tests Lot H/U (1-23)** : hors périmètre Lot D et non présents dans ce worktree (`npm test` n'a matché qu'atelier +
  contracts + racine). Leur vert relève de leurs propres G2.
- **Rendu visuel/CSS** (lisibilité, contraste) : non évalué (hors correction fonctionnelle G2).

## 7. Trace — sha256 des 13 fichiers revus (cwd `/f/Monark-wt-atelier`, Git Bash)
Empreintes des octets **revus** ; l'orchestrateur peut prouver « octets committés == octets revus ».
```
e819e038061acc3c5ff78e294f769c3e90f2c451a64f2501eb2a64d6c704f263  packages/atelier/src/state.ts
99e2af275bf97fabef26fc7c2f269bd76273e5d1abede5deb5d87d4ef7b3f86f  packages/atelier/src/render.ts
2fb779beee44b8133865424f1413772ad84d7b9dcd76cd0da82f71fea401a808  packages/atelier/src/index.ts
ca4e733beaa832c9c788a6056eb425a396b6c5147d193663a7fdae8adba4def4  packages/atelier/src/market-stubs.ts
89d5e7e972425bb777042fd7e6dde21e205f231f5b75e8bc4a4352d3b6a368cb  packages/atelier/src/fixtures-loader.ts
cb25f282fb611ec56c455a9cca72289e4bcd5c2e8ce549e8cdf507db67bb00fa  packages/atelier/test/atelier.test.ts
1470ea3f46f8c5fb3d4d229f665b2ea3ea5dabb948706e711241a057db84a026  packages/atelier/index.html
014bab1fd155ac7ec0998bc58896f727ba7a78fa41d4f8437b5940cd2a77965c  packages/atelier/style.css
c10af1780422e7b1da34ccec109fc49d555560861498e7f73783a91cc5238c4b  packages/atelier/main.js
1010614775732a3dbe2318103e63ccb42e32a84487eff96cdfd57c0234734178  packages/atelier/serve.js
9d54348b3d3f2c0a73bdf7a9af4ad492879755bc9201cd9dc7a5bb05b44fe445  packages/atelier/tsconfig.json
629af346890ad09056a507ffa962374c9590846e9751dfd26e01115f326c3ac3  packages/atelier/package.json
9521c4eaf6248e945cd83e9efe053d4a2f8f2445b4a687d4e247fc74a3f1a17b  packages/atelier/README.md
```

## 8. Mutations effectuées (R-21) et restauration à l'octet près
| Mutation | Fichier | Effet observé | Restauration |
|---|---|---|---|
| `esc` → `return s` | `render.ts:9-11` | test 25 **rouge** sur `id échappé` (`<img>` non échappé) — l'oracle XSS lie | sha256 = `99e2af27…` (== baseline) |
| `alpha: v.alpha` → `v.n_calib` | `state.ts:100` | `tsc` exit 0 **et** 5/5 verts — **oracle faible prouvé** (Corr. 1) | sha256 = `e819e038…` (== baseline) |

Après restauration des **deux** mutations (empreintes == baseline du §7) : `npm run ci` **re-lancé → 50 pass / 0 fail,
gate:vocab OK** ; `git status --porcelain` = `?? packages/atelier/` (identique baseline). Aucun fichier hors ce livrable
n'est modifié durablement.

> **État git final attendu après écriture de ce livrable** : `?? packages/atelier/` **et** `?? docs/G2-lot-D.md`
> (ce fichier de revue est le seul artefact que j'ajoute).

---

**VERDICT : ACCEPTÉ-AVEC-CORRECTIONS — 2 corrections** (Corr. 1 test faible ; Corr. 2 libellé ADR test 24) **+ 1 action
orchestrateur** (ligne de provenance G1). Aucune ne bloque le merge ; le code de production est sain.
