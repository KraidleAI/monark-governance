# G1 — journal de provenance, lot P1-b3 (ADR-M017 D2(v)/D5, ADR-M019 : retrait de `crossAgentGate` + statut Ukemi)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour : préfixe `claude-opus-4-8` conforme.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-p1b1`, branche courante `lot/p1-b2` (HEAD `8cd5d32`) ; l'orchestrateur
  créera `lot/p1-b3` à partir de ces fichiers (le worker ne branche pas). **Aucun `F:\Monark` touché.**
- **Rattachement** : ADR-M017 D2(v)/D5 + Tuyaux l.119-137 ; ADR-M018 D1/D2/D3 ; checkpoint-2 b2 **K-C2-3**
  (`docs/CHECKPOINT2-M017-b2.md:26`) ; ADR-M003 D4 (amendé 2026-09-18) ; ADR-M005 D3 (supersession l.207-208) ; ADR-M015 D1(b).
  **Aucun commit** (R-20), aucune action `git` en écriture, aucun workflow : l'orchestrateur committe.
- **Portée b3 (et rien d'autre)** : (1) retrait de `crossAgentGate` + des 4 types + dépendances orphelines (`@monark/ukemi`
  mandaté, `@monark/hikae` mesuré-orphelin) de `packages/monark` ; suppression pure du test 30 ; (2) `README.md:188` et `:102`
  (texte public) ; (3) ADR-M019 (K-C2-3 : tuyau Ukemi → gate mesuré, correction de prémisse, question de registre ouverte) +
  amendement daté d'ADR-M017. **Non touché (0 octet)** : `schemas/`, `packages/contracts`, `packages/hikae`, `packages/ukemi`,
  `apps/site`, `apps/sentinel`, `apps/harness/src` (vérifié §4).

## 1. Fichiers livrés + sha256

| Fichier | État | sha256 (LF) |
|---|---|---|
| `packages/monark/src/index.ts` | modifié (retrait `crossAgentGate` + 4 types + imports ; barrel = 2 adaptateurs + `MONARK_PHASE`) | `63033eeb22d549ed089465a5263483e959f7d91bff8fb975f38eb85c03839675` |
| `packages/monark/package.json` | modifié (retrait `@monark/ukemi`+`@monark/hikae`+`"//"` ; `description` rendue honnête) | `3a86db378fb92ee29874cbfdd99a752dc97fefa21de006cf536624277372a0b2` |
| `packages/monark/test/cross-agent-gate.test.ts` | **SUPPRIMÉ** (test 30 = 3 blocs `test()`) | pré-suppression `8b988a70ed9a864ec543fecdeb4c09e1579288552ea67ed9073ac9d343fdffd3` |
| `README.md` | modifié (`:102`, `:188`) | `9230f2d44adb7db0cedb3878cf041b1b9a8edbe02fac9a5068e94de97f7959c2` |
| `package-lock.json` | modifié (bloc `packages/monark`, 1/3 lignes) | `909c4913781918ca5e3ac3b61c55b484df8e5e8b06c4b6959605438e391a658c` |
| `docs/adr/ADR-M017-attested-price-dans-gate.md` | modifié (amendement daté 2026-09-19, prémisse l.135) | `c79b74dafb7b9952b915cb90afa76e46f155e3c22744d25559ffffac9a8e1699` |
| `docs/adr/ADR-M019-p1b3-retrait-crossagentgate-statut-ukemi.md` | **créé** (ADR de b3) | `7ac7e365a9b99171996e0f10d1e6530ec8d2566d1d4a476b1562296ec4f82896` |
| `docs/G1-lot-p1b3.md` | **créé** (ce journal) | _(auto)_ |

`git status --short` : `M README.md`, `M package-lock.json`, `M packages/monark/package.json`, `M packages/monark/src/index.ts`,
`D packages/monark/test/cross-agent-gate.test.ts`, `M docs/adr/ADR-M017-…md`, `?? docs/adr/ADR-M019-…md`, `?? docs/G1-lot-p1b3.md`.
Aucun fichier parasite. **R-25** (`git diff --numstat 8cd5d32`, hors ADR/G1) : README 2/2, package-lock 1/3, package.json 2/5,
`index.ts` 16/110, test 0/149 (supprimé) ⇒ **+21 / −269** (churn 290, net −248). Bien < ~400.

### Correspondance décision → artefact
- **(1) Retrait `crossAgentGate`** (`packages/monark/src/index.ts`) : la fonction et les interfaces `GateContext` /
  `CalibrationState` / `BudgetState` / `GateRequest`, plus tous leurs imports (`conformInterval`/`gate` de `@monark/hikae` ; les
  `assertClosed*`/types de `@monark/contracts` propres à la fonction ; `SCHEMA_VERSION`) sont retirés. Le barrel n'exporte plus que
  les **deux adaptateurs** (Shōgen→`AttestedPrice`, Narabi `AttestedFlow`→`Prediction`) et `MONARK_PHASE` (**conservé** — non
  consommé ailleurs, mesuré ; commentaire « the cross-agent gate is REAL » rendu honnête ; retirer un export serait hors « retrait
  de `crossAgentGate` et des types »). En-tête réécrit (décrit le barrel réel ; breadcrumb vers ADR-M019 **sans** renommer les
  symboles retirés, pour que le grep §3 soit à 0 hors docs).
- **Dépendances** : `@monark/ukemi` (test-only, seul porteur du drapeau `"//"` retire-or-justify — plus aucun test) et son
  commentaire `"//"` retirés (mandaté). **`@monark/hikae` aussi** : mesuré unique consommateur src = `crossAgentGate` (0 ailleurs)
  ⇒ orphelin après retrait ⇒ retiré par la **même** règle (ADR-M015 D1(b) ; ADR-M018 « déclaré ⇔ réel »). **Extension de portée
  déclarée**, `error_origin` **planificateur** (ADR-M017 D2(v)/D5 ne traçait que la dép. drapeautée), **réversible** (1 ligne). Après
  b3 : `dependencies` = `@monark/contracts` seul.
- **`description` `package.json`** : « MONARK — cross-agent integration layer … Phase 0: freezes the cross-agent gate signature
  only. » ⇒ **fausse** après retrait (même fausseté que `README:188`, dans le fichier déjà édité). Corrigée en la description réelle
  (adaptateurs + CBOR, Phase 2). **Extension de portée déclarée** (la mission ne cadrait `package.json` qu'au retrait dép+`"//"`) —
  ne préempte PAS le statut d'Ukemi (ne le nomme pas), réversible, soumise à G2 (§6).
- **(2) `README:188`** : « cross-agent gate — freezes the wiring signature; token budget B_t (engine = Phase two) » ⇒ **faux**
  (mesuré : aucun `B_t`/gate dans le paquet après retrait) ⇒ « integration adapters: Shōgen→AttestedPrice, Narabi
  AttestedFlow→Prediction; canonical CBOR » (colonne 20 préservée, marqueur de phase retiré faute de remplaçant honnête).
  **`README:102`** : « built end to end: `Shōgen → Hikae → Ukemi` » (portée par le test 30) ⇒ « built and served piece by piece and
  composed on the gate path » (ADR-M017 l.115), **sans nommer** le tuyau `cascade → gate` (question ouverte D4 non préemptée).
- **(3) ADR-M019** créé (tâches a–e, voir le fichier) ; **ADR-M017** amendé (amendement daté : prémisse l.135 corrigée, mesure à
  l'appui) ; **ADR-M018 non modifié** (ADR investisseur ; amendement clause (b′) **proposé** dans ADR-M019 §D3, à ratifier).

## 2. Mutants (sha256 avant → mutation → cible → résultat MESURÉ → restauration byte-exacte)
sha `index.ts` avant==après = `63033eeb…` (restauration byte-exacte vérifiée pour m1/m3). **m2** : le fichier restauré est le **vrai** —
sa sauvegarde `8b988a70…` == `git show HEAD:packages/monark/test/cross-agent-gate.test.ts | sha256sum` (lecture seule, aucun `git` en
écriture, R-20) — puis re-supprimé, `git status` = `D`.

| # | Mutant | Fichier | Cible | Résultat mesuré | Note |
|---|---|---|---|---|---|
| **m1** | réintroduire `import { emitPrediction } from "@monark/ukemi"` (+usage) dans `index.ts` | `index.ts` | `npm run typecheck` | **VERT** (exit 0) | **mutant proposé par la mission = VACUÉ** — voir ci-dessous |
| **m2** | restaurer `cross-agent-gate.test.ts` **sans** restaurer les symboles | `packages/monark/test/` | `npm run typecheck` | **ROUGE** (exit 2 ; `TS2305` sur `crossAgentGate` **et** `GateContext`) | prouve le retrait effectif des symboles du barrel |
| **m3** | retirer le re-export `fromShogen` du barrel | `index.ts` | `npm run typecheck` | **ROUGE** (exit 2 ; `TS2305` dans `apps/harness/src/tools/attest.ts:19`) | prouve que la surface adaptateur reste servie/consommée (pas sur-coupée) |

**Honnêteté (R-21) — le mutant de la mission est vert, pas rouge.** La mission demandait « réintroduire un import de `@monark/ukemi`
⇒ typecheck/ci **rouge** ». **Mesuré : VERT.** Raison : npm workspaces **hoiste** `node_modules/@monark/ukemi` (lien conservé car
`apps/harness` en dépend, `package-lock.json:1152`) ; `tsc` (`moduleResolution: nodenext`) et node résolvent le bare specifier via
ce lien, **indépendamment** de `packages/monark/package.json`. Aucune règle d'hygiène de dépendances n'existe (ni
`import/no-extraneous-dependencies` dans `eslint.config.mjs`, ni test — mesuré). Donc **l'absence de la dépendance n'est PAS prouvable
par un mutant rouge** ici ; la vraie preuve d'absence est le §3 (diff `package.json` + `grep` = 0 + `npm ls` = `(empty)`). Un test
d'hygiène « déclaré ⊇ importé » rendrait m1 rouge : **item formé** (ADR-M019 §Items formés (4)), hors portée `packages/monark`.

## 3. Grep résiduel (symboles / dépendances retirés)
- **Symboles retirés** `crossAgentGate|GateContext|CalibrationState|BudgetState|GateRequest`, **hors `docs/`** (et hors
  node_modules/.git/scratchpad) : **0 hit** (mesuré `grep -rn … | grep -v '^./docs/'`, exit 1). Le breadcrumb de l'en-tête `index.ts`
  a été formulé sans les nommer, exprès. _(Dans `docs/` : mentions historiques conservées dans ADR/journaux — autorisé.)_
- **Dépendances** `@monark/ukemi|@monark/hikae` dans `packages/monark/` : **0 hit** (exit 1).
- **Preuve d'absence** (puisque m1 est vacué) : `git diff` de `package.json` (les 3 lignes de dépendances + le `"//"` retirés) +
  `grep`=0 ci-dessus + `npm ls @monark/ukemi @monark/hikae -w packages/monark` ⇒ `` `-- (empty) `` (aucune n'est déclarée pour le
  workspace `@monark/monark`).
- **`npm ls` discrimine** (mesuré, non décoratif) : `npm ls @monark/contracts -w packages/monark` **affiche** l'arbre
  (`@monark/monark → @monark/contracts@0.0.0 -> .\packages\contracts`), tandis que `@monark/ukemi`/`@monark/hikae` ⇒ `(empty)`.
- **`@monark/ukemi` ailleurs** (inchangé, légitime) : `apps/harness` (outil `cascade`, `@monark/ukemi` réel) + `packages/ukemi` +
  le lien lockfile. **`@monark/hikae` ailleurs** : `apps/harness`, `packages/hikae`, lockfile. Non touchés.
- **Grep prose (texte public, hors `README:102`/`:188`)** — deux mentions **vérifiées, non falsifiées, non touchées** (surfaces
  intouchées) : `apps/site/lib/narabi-copy.ts:84` (« Narabi is the sensor of the first vertical. Shōgen attests, Hikae reads
  coverage, Ukemi carries the prediction contract… ») — **toujours vrai** (la prédiction cascade d'Ukemi **est** portée au gate),
  ne nomme pas la pièce retirée ; `skills/monark/DEMO.md:86` (« verified end-to-end by `test/byo-demo-probe.test.ts` ») — porte sur
  le **probe BYO**, sans lien avec `crossAgentGate`. Aucune n'est falsifiée par ce lot ⇒ inchangées (`apps/site`/`skills` hors portée).

## 4. Oracle brut

| Commande | Résultat | Exit |
|---|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | `tests 289 / pass 289 / fail 0` | `0` |
| `npm run lint` (eslint .) | (aucun message) | `0` |
| `npm run lint:ratchet` | `lint-ratchet: 69/69 (… measured_on 2026-09-16)` — **inchangé** (test supprimé = 0 violation suivie) | `0` |
| `node scripts/lang-gate.mjs --scope root` | `lang-gate OK — 0 non-exempt French hit … {root}` | `0` |
| `npm run export:check` | `check OK — 0 forbidden path, 0 non-exempt French hit …` | `0` |
| `npm run typecheck` (tsc --noEmit) | (0 erreur) | `0` |
| `npm run gate:vocab` | `gate:vocab OK — scanned 142 file(s), no forbidden claim.` | `0` |
| `git diff --stat 8cd5d32 -- schemas packages/contracts packages/hikae packages/ukemi apps/site apps/sentinel apps/harness/src` | **vide** (0 octet hors-portée) | `0` |

**Écart oracle expliqué (mission « 292 − 1 = 291 »)** : mesuré **292 → 289** (`−3`). Le test 30 (`cross-agent-gate.test.ts`) contient
**3 blocs `test()`** (l.85 chemin commit ; l.115 axe intent defer/abstain/budget ; l.136 non-fini `non_evaluable`), non 1. Sa
suppression pure retire 3 tests. Cohérence : baseline b1 = **289** (G1-b2 §4 « 289 b1 + 3 nouveaux » = 292) ⇒ b3 **revient
exactement** au compte b1 (b2 avait ajouté 3 tests `apps/harness`, b3 en retire 3 `packages/monark`).

Interdits de texte (mission) : « partner », « autonomous », « guarantee » nu, « verified » nu — **absents** de tous mes ajouts en
texte public (README `:102`/`:188`, `package.json` `description`, en-tête `index.ts`) ; `gate:vocab` + `export:check` verts (scope
`packages/monark/**` inclus).

## 5. Invariants et dettes (clôture zéro dette)
- **Dossiers hors-portée = 0 octet** : `git diff --stat 8cd5d32` sur les 7 dossiers = **vide** (item 4 de la mission). Aucun réseau,
  aucun état persistant introduit.
- **Symboles retirés = 0 hit hors docs** ; **dépendances orphelines retirées** : `@monark/ukemi` (mandaté) + `@monark/hikae`
  (mesuré-orphelin, `error_origin` **planificateur**, réversible). `@monark/contracts` conservé (utilisé par les 2 adaptateurs).
- **`MONARK_PHASE` conservé** (non consommé — mesuré ; commentaire rendu honnête) : **décision déclarée**, pas une dette (retirer un
  export dépasse « retrait de `crossAgentGate` et des types »).
- **Deux extensions de portée déclarées, réversibles, soumises à G2** (§6) : (a) `package.json` `description` corrigée (même fausseté
  que `README:188`, fichier déjà édité, ne préempte pas Ukemi) ; (b) retrait de `@monark/hikae` (orphelin mesuré). Ni l'une ni l'autre
  ne touche `apps/site` ni un contrat gelé.
- **Aucune surface publique du registre changée** : `apps/site` intouché (0 octet) ; la requalification d'Ukemi et le champ `wiring`
  = lot **W-1** (ADR-M018 Conséquences), déclenchés par la décision investisseur (§6).
- **Items formés (4)** (ADR-M019 §Items formés) : étape h5 portant `attested` ; champ `wiring` (W-1) ; `fleet.ts:70` « verified price
  testimony » (W-1) ; test d'hygiène de dépendances. **Chacun porte son déclencheur** — aucun « dû » nu.
- **Aucune dette nue, aucune procurement** (tout interne, mesuré). **Provenance** : artefacts générés par worker `claude-opus-4-8[1m]`
  épinglé, effort `max` ; sortie vérifiable (sha256 ; mutants rejouables ; diffs ciblés ; vacuité `runGate` reproductible) ;
  vérification adversariale + G7 + acceptation validateur-humain chez l'orchestrateur (R-21). **Aucun commit** (R-20).

## 6. Questions à trancher (pour l'orchestrateur / le validateur / l'investisseur)
1. **Statut de registre public d'Ukemi — `built` vs `upcoming`** _(INVESTISSEUR, escalade CA-2 ; ADR-M019 D4)_. Mesuré : la prédiction
   cascade d'Ukemi **est** consommée par le `gate` servi sur le fil MCP réel (trace h5 étape 4 `cascade-gate`, probe non-LLM) **mais**
   le gate **abstient `under_calib` par construction** (classe fixture, aucune calibration cascade committée) et le **contenu** de la
   prédiction **n'influence pas** la décision (vacuité : `yhat` ∈ {100, 999999, −5} ⇒ `GateDecision` byte-identique). ADR-M018 D1 **tel
   qu'écrit** classe Ukemi `built` (a–d satisfaits) ; **recommandation motivée : `upcoming`** (un `built` dont le seul effet servi est
   une abstention constante induit en erreur sur `/roadmap`), **conditionnée** à ratifier la clause **(b′)** « la sortie consommée doit
   **influencer** le résultat servi ». Trancher revient à l'investisseur — **pas** au worker.
2. **Ratification de l'amendement ADR-M018 D2 (clause b′)** _(INVESTISSEUR ; ADR-M019 D3)_ : ADR-M018 est un ADR investisseur, **non
   modifié** ici ; le texte exact de l'amendement est **proposé** dans ADR-M019 §D3. Sans ratification, `fleet.ts` reste `built`
   (Option B) et le champ `wiring` est ajouté en W-1.
3. **Deux extensions de portée** _(G2 / checkpoint)_ : (a) correction de la `description` `package.json` ; (b) retrait de
   `@monark/hikae` (orphelin mesuré). Toutes deux **réversibles** (une ligne / un champ), déclarées `error_origin` planificateur pour
   (b). À accepter ou refuser explicitement.
4. **Mutant de la mission vacué** _(orchestrateur)_ : le mutant « réintroduire un import de `@monark/ukemi` ⇒ rouge » est **vert**
   (hoist workspace, §2). La vraie preuve d'absence est fournie (§3) ; le mutant rouge exigerait un test d'hygiène de dépendances =
   **item formé (4)**, hors portée `packages/monark`. À valider comme substitution acceptable.
