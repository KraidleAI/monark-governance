claude-opus-4-8[1m]

# G2 — Revue du Lot V (DEVOPS local), Phase 2 MONARK

- **GATE-0 / R-1** : modèle relecteur résolu = `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme au roster ADR-M003 D10 / CLAUDE.md 2026-08-14 ; `claude-opus-5` banni, non utilisé). Ligne 1 de ce fichier = cette résolution.
- **Rôle** : relecteur G2, **instance séparée à contexte frais, ≠ générateur** (D10bis). Le relecteur ne committe pas, ne pousse rien, ne modifie pas le code livré (R-20) ; les mutants sont insérés puis restaurés avec preuve sha256 avant/après à l'octet.
- **Provenance** : worktree `F:\Monark-wt-devops`, branche `lot-v-devops`, HEAD `fee3bf9` (= merge-base avec `main` ; `main` est **10 commits en avant**, `git rev-list --count HEAD..main` = 10, `main..HEAD` = 0 — la mesure R-25 se fait vs merge-base ; **elle DÉPASSE la borne tel-que-monté, cf. §R-25 ci-dessous**). Généré le **2026-09-06**, effort max. Environnement mesuré : node v24.15.0, npm 11.12.1, gh 2.96.0.
- **Références lues** : `F:\Monark\docs\adr\ADR-M003-phase2-integration.md` [lu] (D0.5, D1 Lot V, D9 + addenda D9/D9 bis/D9 ter, D10bis, D11 test 38, D12) ; `F:\Monark-wt-devops\docs\G1-lot-V.md` [lu] (3 passes) ; `templates\ci-gates.yml` [lu] ; `templates\checklist-revue-G2.md` [lu].
- **Méthode** : chaque point est jugé **conforme / réserve / défaut** avec citation `fichier:ligne` et preuve rejouable (R-21). Les SHA d'actions, les versions npm, les mutants et les oracles sont **re-vérifiés indépendamment** (non repris de G1 sur parole).

## sha256 de référence (état livré, mesuré au début de la revue)

```
200247303dc248f8397b749922627035a3965b6ffdf283d9831052233d0b0900  .github/workflows/ci.yml
e420bfe534cf2a425a049f34b431fd00a271cbcb4627b31e23552a8a41bf64a6  eslint.config.mjs
f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa  lint-ratchet.json
c8d671a4ead60aa30ab95d6f43d4b1713ae02f8f8dd03d07f4ebdf0af54d709d  scripts/lint-ratchet.mjs
8300d83d1ab493a01978250db194197633db4844827a748c5f3f35fc4bc9b5ca  vocab-banned.json
e5ab3191768bb1ef74e4452fabc03aaea6067bcfde2eadd17de5b966867c1710  scripts/grep-forbidden.mjs
6d4681cd1ed050d75cb0b47df221064b7f23edf19d653b6b0dbd98c1dcfa2e13  test/ci-gates.test.ts
983ba1529d4e0a6ffb9d478f225c4d68539d18768fc78d6cc325ec95a3177365  enforcement/lint-model-pinning.sh
d28d3eb977c3164e50380c4f26348404209cda63019685ab3f507b8c2f3ebbbb  package.json
50e74a25dc5b30f03db59a07239f455c0cd0aad343d890cf9acfbb2500350ff2  packages/monark/src/index.ts
8b7d0fbcabee1967628a07c192166ed6da4b954b9833cf924435107f4b731749  packages/hikae/src/l3-gate.ts
7ba216e4a5f58d8c291bfc1ffb49ec73199f43ac4a337021363ec7fffcb07b8b  packages/hikae/src/s2/instrument.ts
```

Les sha256 de ci.yml, eslint.config.mjs, lint-ratchet.json, lint-ratchet.mjs et lint-model-pinning.sh **concordent** avec ceux annoncés dans G1 (§P3.6, §3.1). Aucune dérive de l'état livré depuis le journal.

---

## Point 1 — `.github/workflows/ci.yml` (jobs bloquants, SHA, limite, pathspec, PR, g4, g1)

### 1.a Jobs bloquants, 0 `continue-on-error` — CONFORME
5 jobs : `g1-controle-generation` (l.22), `r25-taille-de-lot` (l.31), `g3-verification` (l.61), `g4-architecture` (l.76), `g6-compliance` (l.87). `grep -nE '^\s*continue-on-error\s*:' .github/workflows/ci.yml` = **0 occurrence** (aucune directive ; exit 1 de grep = pas de match). Chaque job échoue-bloque par défaut GitHub Actions. **Conforme.**

### 1.b Toutes les `uses:` = SHA 40-hex, re-vérifiées contre l'API GitHub — CONFORME
8 lignes `uses:` (l.25, 34, 64, 65, 79, 80, 90, 91) ; `grep -oE 'uses:\s*\S+' | uniq -c` = **5× `actions/checkout@3d3c42e5…`** + **3× `actions/setup-node@820762…`**, aucune autre. Chaque ref = 40 hex. **Re-vérification indépendante (API GitHub live, 2026-09-06, `gh api`)** :
- `repos/actions/checkout/git/ref/tags/v7.0.1` → `object.type: "commit"`, `object.sha: 3d3c42e5aac5ba805825da76410c181273ba90b1` (tag léger ⇒ SHA = commit direct, aucune déréférence d'objet annoté nécessaire). **Concorde** avec ci.yml l.25 (et les 4 autres).
- `repos/actions/setup-node/git/ref/tags/v7.0.0` → `object.type: "commit"`, `object.sha: 820762786026740c76f36085b0efc47a31fe5020`. **Concorde** avec ci.yml l.65 (et les 2 autres).
Les deux SHA sont donc les commits réels des tags annoncés (le commentaire `# v7.0.x` est indicatif, le SHA fait foi). **Conforme.**

### 1.c `VIBEGATES_PR_LIMIT` = 1205 — CONFORME
ci.yml l.39 : `VIBEGATES_PR_LIMIT: "1205"` (D9). Fail-closed sur borne vide/non-numérique (l.42-46). **Conforme** (= D9, R-23).

### 1.d Pathspec `':(exclude)packages/*/docs/S2-*'` — CONFORME
ci.yml l.50 : `git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'`. Décompte insertions+suppressions par awk l.54. **Conforme** (D9 : artefacts S2 générés + lockfile exclus). Delta assumé vs template (qui n'exclut que les lockfiles) : documenté D9 (« le lot H déborderait à cause du journal TSV S2 »).

### 1.e `on: pull_request` — CONFORME
ci.yml l.18-19 : `on:` / `pull_request:`. Le trigger Phase 0 `push: main` est retiré (motif : `github.base_ref` indéfini sur push ⇒ fail-closed rouge). **Conforme** (D9 bis).

### 1.f Job g4 = `npm run lint && npm run lint:ratchet` — CONFORME
ci.yml l.85 : `run: npm run lint && npm run lint:ratchet`. Un seul step ; `&&` court-circuite (lint rouge ⇒ ratchet non lancé ⇒ job rouge). **Conforme** (D9 ter §3).

### 1.g Script g1 `enforcement/lint-model-pinning.sh` — CONFORME
Vendorisé du miroir vibegates. **Re-vérification sha256 indépendante** : miroir source `…/compiliance…/vibegates/enforcement/lint-model-pinning.sh` RAW = `607ae90470edbf09d3597dc6ac86358d7ec902aa560b9ef8a8ea7ffe1b1732d2` (= sha annoncé G1 §3.1) ; miroir **LF-normalisé** = `983ba1529d4e0a6ffb9d478f225c4d68539d18768fc78d6cc325ec95a3177365` = sha256 du fichier worktree livré (LF). `diff` (LF-normalisé des deux) = **identique**, aucune différence fonctionnelle. Exécution `bash enforcement/lint-model-pinning.sh .` (Monark n'a pas de `.claude/`) ⇒ `OK (R-1/R-4): nothing in scope — … green by absence, not by verification.` **exit 0**, honnête. `grep -rc "claude-opus-5" enforcement/` = **0** (id banni construit au runtime). **Conforme.**

**Point 1 — VERDICT : CONFORME** (7/7 sous-points : jobs bloquants, 0 continue-on-error, SHA re-vérifiés API GitHub, limite 1205, pathspec S2, pull_request, g4 lint+ratchet, script g1 sha256-identique au miroir).

---

## Point 3 — `eslint.config.mjs` conforme D9 ter — CONFORME

- **recommended-type-checked** : `...tseslint.configs.recommendedTypeChecked` (eslint.config.mjs l.32). `parserOptions.project: "./tsconfig.json"` (l.37). JS/MJS/CJS ignorés (l.31). **Conforme.**
- **allowForKnownSafeCalls forme « package » `node:test`** : l.44-51, `no-floating-promises = ["error", { allowForKnownSafeCalls: [{ from:"package", name:["test","describe","it"], package:"node:test" }] }]` — forme documentée exacte (règle conservée en erreur, non désactivée). **Conforme.**
- **Override 6 règles off sur globs tests uniquement, dérivées de lint-ratchet.json** : l.27 `const testDeferredOff = Object.fromEntries(ratchet.rules.map((r) => [r, "off"]))` ; l.54-59 bloc `files: ["**/*.test.ts", "test/**"]`, `rules: testDeferredOff`. **Source unique** = `lint-ratchet.json` (import l.24). **Conforme.**
- **`eslint --print-config` (re-vérification indépendante)** :
  - **SRC** `packages/monark/src/index.ts` : les 6 règles (no-unsafe-{member-access,assignment,call,argument,return}, no-explicit-any) = `[2]` (**error**) ; `no-floating-promises` = `[2,{allowForKnownSafeCalls:[{from:"package",name:["test","describe","it"],package:"node:test"}]}]`.
  - **TEST** `packages/contracts/test/schema.test.ts` : les 6 règles = `[0]` (**off**) ; `no-floating-promises` = `[2,{…}]` (**error, identique au SRC**).
  - ⇒ **les 6 règles = error en src, off en test** ; **no-floating-promises = error partout** (seuls les appels `node:test` exemptés). Exactement D9 ter §2/§3. **Conforme.**

**Point 3 — VERDICT : CONFORME.**

---

## Point 4 — `scripts/lint-ratchet.mjs` + `lint-ratchet.json` : fail-closed, mutant, re-mesure — CONFORME

- **Re-mesure indépendante du compte (script G2 séparé, PAS le cliquet livré)** : eslint API, 6 règles réactivées error sur tout `*.ts`, `lintFiles(["."])`, tally par règle = **34+30+15+3+1+9 = 92**, **92 en TEST, 0 en SRC, 0 autre**. Le plafond commis `ceiling=92` (lint-ratchet.json l.2) **est** le compte mesuré, pas un chiffre deviné. `npm run lint:ratchet` livré = **92/92 exit 0** (concorde).
- **Fail-closed (mutants, restauration byte-exacte depuis copie pristine ; sha256 baseline `f47ff292…`)** :
  | Mutant | Effet | Résultat | exit | sha256 après restauration |
  |---|---|---|---|---|
  | A | `ceiling` 92→91 | `92/91` · `::error:: 92 > plafond 91` | **1** | `f47ff292…` ✓ |
  | B | `ceiling` = `"quatre-vingt-douze"` (non entier) | `plafond invalide … entier >= 0 requis` | **1** | `f47ff292…` ✓ |
  | C | `rules` = `[]` (vide) | `` `rules` absent ou vide … Fail-closed`` | **1** | `f47ff292…` ✓ |
  | D | `lint-ratchet.json` absent | `lecture/parse … impossible (ENOENT) … Fail-closed` | **1** | `f47ff292…` ✓ |
  - État final : `npm run lint:ratchet` = **92/92 exit 0**, `lint-ratchet.json` sha256 = `f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa` (**identique baseline** — restauration à l'octet prouvée).
- **Robustesse supplémentaire** : le script (l.66) traite tout message `fatal===true || ruleId==null` comme run non sain ⇒ exit 1 (empêche le faux vert « 0/92 » sur config cassé). **Conforme.**

**Point 4 — VERDICT : CONFORME** (fail-closed sur les 3 conditions requises + mutant ceiling 92→91 rouge + re-mesure indépendante = 92).

---

## Point 5 — Sémantique préservée des 6 corrections de src — CONFORME

Diffs `git diff HEAD` des 3 fichiers source de production. **Toutes les corrections sont de niveau TYPE (effacées par le type-stripping TS / `tsc --noEmit`), à effet runtime nul, ou des identités de type.**

- **`packages/monark/src/index.ts:15`** : `export function crossAgentGate(_price, _prediction): GateDecision {throw…}` → `export const crossAgentGate: (price, prediction) => GateDecision = () => {throw…}`. La **signature de type à 2 paramètres est préservée** par l'annotation (les callers typecheckeraient à l'identique) ; le corps lève la **même** `Error` (message inchangé). Stub **non gelé** (ADR-M003 D4). Grep (le mien, R-21) : `grep -rn crossAgentGate --include=*.ts --include=*.js --include=*.mjs` = **une seule** occurrence, la définition `packages/monark/src/index.ts:15` — aucun appelant ailleurs (donc aucun problème d'ordre const-vs-hoisting ; la conversion function→const est sûre). Runtime : lève, identique. **Sémantique préservée.**
- **`packages/hikae/src/l3-gate.ts:49`** : `tool: GatedTool | string` → `tool: string`. `GatedTool = (typeof GATED_TOOLS)[number]` (= 2 littéraux) ; `string` **absorbe** ces littéraux ⇒ `GatedTool | string` ≡ `string` (identité de type). **Conforme au contrat GELÉ** `GateDecision.tool: string` (`packages/contracts/src/types.ts:121`, lu). `GatedTool`/`GATED_TOOLS` restent exportés (D0). `gate()` assigne `tool: input.tool` sans narrowing. **Sémantique préservée.**
- **`packages/hikae/src/s2/instrument.ts:299,311`** : retrait de `as string` sur `set.includes(p.y as string)` et `indicatorScore(p.yhat, p.y as string)`. `as` est un **cast de type effacé au runtime** (aucun effet d'exécution). **Sémantique préservée trivialement.**
- **`packages/hikae/src/s2/instrument.ts:449-451`** : retrait de `as "up" | "down"` **et** ajout de l'annotation de retour `(p): LabeledPoint =>`. Les DEUX sont des constructions de type **effacées au runtime** ; la valeur du ternaire `p.y === "up" ? "down" : "up"` et le spread `{...p, y}` sont **inchangés**. **Sémantique préservée.**

**Digests S2 inchangés — PROUVÉ empiriquement** : le test `s2_report_reproducible` (`packages/hikae/test/s2.test.ts:64`) régénère le rapport S2 par `runS2()` et exige (a) `committedReport === out.report` (égalité octet) et (b) `sha256(committedJournal) === out.journalDigest`. Ce test **PASSE** (`✔ s2_report_reproducible`, run isolé exit 0). Comme `runSplitCampaign`/`m2Campaigns` (les fonctions touchées) sont dans le chemin S2, un seul chiffre dérivé rougirait ce test. Les corrections instrument.ts n'ont **rien changé au runtime**. **Conforme.**

**Point 5 — VERDICT : CONFORME.**

---

## Point 10 — Oracles (lignes de résumé, `npm ci` depuis état propre)

Après `rm -rf node_modules && npm ci` (état propre) : `added 107 packages, and audited 113 packages … found 0 vulnerabilities`, **exit 0** (le job g3 `npm ci` passe).

| Oracle | Commande | Résumé | exit |
|---|---|---|---|
| ci | `npm run ci` | `gate:vocab OK — scanned 35 file(s)` ; `tests 79 / pass 79 / fail 0` | **0** |
| lint | `npm run lint` | `eslint .` — 0 problème | **0** |
| lint:ratchet | `npm run lint:ratchet` | `92/92` | **0** |
| typecheck | `npm run typecheck` | `tsc --noEmit` 0 erreur (TS 6.0.3) | **0** |
| audit | `npm audit --audit-level=high` | `found 0 vulnerabilities` | **0** |

**Point 10 — VERDICT : CONFORME** (tous les oracles verts, `npm ci` propre OK).

---

## Point 2 — `package.json` pins exacts + lockfile (aucune dépendance runtime ajoutée) — CONFORME

- **Pins exacts** : `package.json` l.25 `"eslint": "10.10.0"`, l.26 `"typescript": "6.0.3"`, l.27 `"typescript-eslint": "8.69.0"` — **exacts, sans `^`/`~`**. Conforme D9 addendum (option c) et R-8.
- **`npm ci` depuis état propre** : `rm -rf node_modules && npm ci` ⇒ `added 107 packages, audited 113 … found 0 vulnerabilities`, **exit 0**.
- **Diff lockfile (parse indépendant `git show HEAD:package-lock.json` vs worktree, objet `.packages`)** :
  - ADDED `node_modules/*` = **94** = **93 `dev:true`** + **1 `link:true`** (`node_modules/@monark/atelier`) ; **RUNTIME (non-dev, non-link) ajouté = 0** (liste vide).
  - ADDED hors `node_modules/` = `packages/atelier` (**membre de workspace**, pas une dépendance).
  - REMOVED = **20** (`node_modules/@typescript/typescript-<os>-<arch>`, binaires natifs de TS 7 — cohérent avec le pin 7→6, TS 6.0.3 pur JS).
  - CHANGED RUNTIME = **0** ; CHANGED DEV = **1** (`typescript 7.0.2→6.0.3`).
  - Sanity deps « runtime » : `ajv 8.20.0`, `ajv-formats 3.0.1`, `@types/node 24.13.3` **inchangés** (tous `dev:true` dans ce dépôt de contrats).
- **Conclusion** : **aucune dépendance runtime ajoutée ni changée** ; les seuls ajouts sont la chaîne de lint (dev) + le pin TS. **Conforme.**

**Point 2 — VERDICT : CONFORME.**

---

## Point 6 — Test 38 : mutants G1 re-exécutés + 1 mutant de mon cru

Baseline : `test/ci-gates.test.ts` sur `ci.yml` (sha256 `200247303…`) ⇒ **PASS**. Restauration de chaque mutant depuis copie pristine (ci.yml est suivi mais modifié ⇒ `git checkout` restaurerait HEAD, pas l'état livré). **Chaque mutant rouge sur SON assertion (non-vacuité prouvée)** :

| Mutant | Assertion touchée (message vérifié) | exit | sha256 après restauration |
|---|---|---|---|
| M1 `continue-on-error: true` inséré | (1) « directive continue-on-error présente » | **1** | `200247303…` ✓ |
| M2 `checkout@v7.0.1` (non-SHA) | (2) « uses: non épinglé par SHA de commit 40-hex » | **1** | `200247303…` ✓ |
| M3 limite `1205→9999` | (3) « VIBEGATES_PR_LIMIT = 9999 ≠ 1205 » | **1** | `200247303…` ✓ |
| M4 pathspec S2 retiré | (4) « pathspec d'exclusion S2 manquant » | **1** | `200247303…` ✓ |
| M5 `pull_request` retiré de `on:` | (5) « le workflow doit se déclencher sur pull_request » | **1** | `200247303…` ✓ |
| M6 `lint:ratchet` retiré de g4 | (6) « le job g4 doit exécuter le cliquet npm run lint:ratchet » | **1** | `200247303…` ✓ |

- **M5 — anti-masquage confirmé** : le commentaire d'en-tête (ci.yml l.9,11) cite « pull_request » mais le mutant reste **rouge** ⇒ l'assertion (5) est bien **bloc-scopée** sur `on:` (le commentaire ne masque pas). Idem la conception bloc-scopée de (6) sur `g4`.
- **FINAL** : `sha256 ci.yml = 200247303dc248f8397b749922627035a3965b6ffdf283d9831052233d0b0900` (**identique baseline**).

**MON MUTANT (M7) — `&&` → `||` dans le step g4** : `run: npm run lint || npm run lint:ratchet`. **Test 38 reste VERT (exit 0).** L'assertion (6) ne vérifie que la **présence du substring** `npm run lint:ratchet` dans le bloc g4 ; elle ne pin ni le connecteur `&&` ni la présence de `npm run lint`. Or `||` rend **le lint non bloquant** : si `npm run lint` échoue (violations) et que le cliquet passe (92/92), le step sort **0** et le job g4 est **vert malgré un lint rouge**. Retirer entièrement `npm run lint` de g4 (`run: npm run lint:ratchet` seul) **échappe de même — vérifié empiriquement : test 38 VERT (exit 0)**, ci.yml restauré `200247303…`. **RÉSERVE mineure** (le fichier livré est correct `&&` ; recommandation : assertion (7) exigeant le littéral `npm run lint && npm run lint:ratchet` dans g4, sinon accepter comme risque résiduel déclaré — MAST « tests passés ≠ propriété », couvert par la revue G2 100 % du diff). ci.yml restauré `200247303…`.

**Point 6 — VERDICT : CONFORME** (6 mutants requis rouges/restaurés, non-vacuité par assertion) **+ 1 réserve mineure** (gap M7 : test 38 ne défend pas la sémantique bloquante `&&` de g4).

---

## Point 7 — vocab-banned.json / grep-forbidden.mjs (Hermes nu) — CONFORME

- **Gate vert** : `npm run gate:vocab` ⇒ `scanned 35 file(s), no forbidden claim`.
- **Motif scopé** (`vocab-banned.json` l.22, bloc `scan.monark.banned`) : `(?<!pyth-)(?<!clawpump-)\bHermes\b` (flag i), appliqué **uniquement** au parcours de `packages/monark/**` (grep-forbidden.mjs l.61-68).
- **Scoping prouvé** : `packages/contracts/src/types.ts:116` porte « the Hermes middleware » (zone **gelée**, `contracts_frozen`) et le gate global reste **VERT** ⇒ le ban Hermes est bien **scopé monark**, pas global (un ban global rougirait la zone gelée non éditable).
- **Mutant** : `// Hermes harness note` (nu) injecté dans `packages/monark/src/index.ts` ⇒ `FORBIDDEN VOCAB: …packages\monark\src\index.ts:1`, **exit 1** ; restauré sha256 `50e74a25…`. **Contre-mutant** : `// clawpump-hermes harness note` ⇒ **vert**, restauré `50e74a25…`.
- **Reformulation** : `packages/monark/package.json:6` = « the tokenised agent + **clawpump-hermes** harness wiring » (aucun Hermes nu).

**Point 7 — VERDICT : CONFORME.**

---

## Point 8 — R-13, `eslint-disable`, secrets, zéro dette G1 — CONFORME

- **R-13 (TODO/FIXME nu)** : `grep -rniE '\b(TODO|FIXME|XXX|HACK)\b'` sur le **code livré** (`.ts/.mjs/.js/.yml/.sh` : ci.yml, eslint.config.mjs, scripts/, test/, enforcement/, packages/*/src) = **0**. Les seules occurrences sont dans `docs/*.md` (rapports G2-lot-D/H/U, JOURNAL-PROVENANCE) — prose de gouvernance qui **discute l'absence** de TODO, pas de la dette-code. **Conforme.**
- **`eslint-disable` = 0** : grep arbre (hors node_modules) = **0** ; `npx eslint . --report-unused-disable-directives` ⇒ **exit 0** (aucune directive fantôme). **Conforme** (cf. G1 P3.10, reformulation « no rule suppression »).
- **Secrets** : grep clés/tokens/PEM/`ghp_`/`sk-`/`AKIA`/`xox` sur l'arbre = **aucun secret**. Les seuls hits « token » relèvent du **domaine** (`tokenisation layer`, `the single token`, `tokenised agent` — MONARK est une couche de tokenisation) ; aucune valeur de credential. **Conforme.**
- **Zéro dette nue (G1)** : pendants tous **formés** — blocage eslint/TS7 **clos** (option c, ADR D9) ; périmètre 182 violations **clos** (D9 ter) ; cliquet de dette de test = pendant **inscrit dans l'ADR** (D9 ter §3, objectif plafond 0 avant checkpoint 2 Phase 3), mécaniquement borné ; pendant investisseur (i) (remote/clé/hébergement) **formé** (D0.3/D1), hors périmètre worker. Aucun « dû » nu. **Conforme.**

**Point 8 — VERDICT : CONFORME.**

---

## Point 9 — English only (D0.5) — RÉSERVE (inventaire fichier:ligne, non corrigé per consigne)

Détection en **UTF-8 natif** (piège byte-locale écarté : `—`/`…`/`§` ne sont PAS du français — ils apparaissent aussi dans les commentaires anglais).

- **DÉJÀ conformes (0 français)** : `scripts/grep-forbidden.mjs`, `enforcement/lint-model-pinning.sh`.
- **FRANÇAIS à traduire avant l'export public `KraidleAI/monark`** (D0.5 : « code, commentaires, noms de tests, CI … en anglais ») :

| Fichier | Lignes françaises | Nature |
|---|---|---|
| `.github/workflows/ci.yml` | 1-3,5-7,9-11,13,14,26,27,28,37,39,41,44,47,48,49,55,57,69,71,84,95 (27) | commentaires ; **noms de step** (l.26,37,69,84,95) ; **messages `echo ::error::`** (l.44,55,57) |
| `eslint.config.mjs` | 3-5,7-11,14-19,21,26,30,42,43,55,56 (21) | commentaires |
| `scripts/lint-ratchet.mjs` | 1,4-8,10-14,16,17,35,48,65,69,77,82,85,89 (21) | commentaires ; **messages runtime `console.log/error`** (l.69,77,82,85,89 — sortie CI en français) |
| `test/ci-gates.test.ts` | 3-7,9-14,25-28,30,32,42,44,47,52,55,58,61-64,66,69,75,78-80,85,91,95-99,108 (41) | JSDoc ; commentaires ; **messages d'assertion** (l.30,42,44,52,58,66,75,91,108) ; **suffixes de NOM de test** (l.25,99) |

- **Statut** : non-conformité D0.5 réelle et substantielle, **non corrigée** (consigne « ne corrige pas »). **Réserve formée** : traduction anglaise du code/CI/tests/messages avant la première PR publique (l'export produit un historique neuf ; les rapports G1/G2/G7 restent en français dans la gouvernance, D0.5). Le worker G1 n'a pas mentionné D0.5 (omission consignée).

**Point 9 — VERDICT : RÉSERVE (English-only à faire avant export ; inventaire ci-dessus).**

---

## §R-25 — Taille de lot TEL-QUE-MONTÉ — DÉFAUT bloquant-tel-que-monté (remède orchestrateur/ADR)

Arithmétique du job r25 rejouée localement (`git add -N .` ; `git diff --shortstat HEAD -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` ; `git reset` ; HEAD = merge-base(main,HEAD) ⇒ **équivalent à la sémantique three-dot `origin/base...HEAD` du job**) :

```
mi-revue (G2=201 l.) : 17 files changed, 1168 insertions(+), 50 deletions(-)  =>  1218 lignes
clôture  (G2=294 l.) : 17 files changed, 1261 insertions(+), 50 deletions(-)  =>  1311 lignes
```

**1311 > borne 1205 (D9)** — et **> 1205 quel que soit** l'instant de mesure. Le total est **auto-référentiel** (ce rapport se compte lui-même et croît en s'écrivant : 1218 → 1311) ; le nombre **stable et signifiant** est le **code-seul = 621** (hors les DEUX rapports de gouvernance G1+G2), **bien SOUS 1205** — mesuré : `git diff --shortstat HEAD -- . ':(exclude)…' ':(exclude)docs/G1-lot-V.md' ':(exclude)docs/G2-lot-V.md'` = `15 files changed, 571 insertions(+), 50 deletions(-)` = **621**. Le job `r25-taille-de-lot` **rougirait** ⇒ CA-V « CI verte à distance » est **FAUSSE tel-que-monté** (si le code + G1 + G2 atterrissent en une seule PR).

**Répartition (numstat)** — les deux rapports de gouvernance dominent :

| Fichier | ins+del |
|---|---|
| `docs/G1-lot-V.md` | 396 |
| `docs/G2-lot-V.md` (ce rapport) | 294 et croissant |
| **sous-total rapports** | **~690** |
| `.github/workflows/ci.yml` | 98 · `enforcement/lint-model-pinning.sh` 143 · `scripts/lint-ratchet.mjs` 91 · `test/ci-gates.test.ts` 111 · `eslint.config.mjs` 60 · `scripts/grep-forbidden.mjs` 53 · `package.json` 14 · `vocab-banned.json` 11 · `lint-ratchet.json` 12 · src/test (l3-gate 2, instrument 8, monark/index 7, monark/pkg 2, forbidden-keys 3, contracts-integration 6) | **~621** |
| **TOTAL** | **1311** (auto-référentiel ; > 1205 toujours) |

- **Code + CI + config + tests seuls = 621 — bien SOUS 1205.** Ce sont les **deux rapports de gouvernance** (~690) qui font franchir la borne.
- **Cause** : le pathspec D9 `':(exclude)packages/*/docs/S2-*'` exclut les artefacts S2 sous `packages/*/docs/`, mais **PAS la racine `docs/`** où vivent les rapports G1/G2. Le template n'exclut, lui, que les lockfiles.
- **Équité (error_origin)** : G1 §P3.8 a mesuré **950** AVANT son addendum P3.10 ET avant l'existence de ce G2 (201) — le worker ne pouvait pas compter le rapport du relecteur. Ce n'est **pas** une faute de code worker mais une **propriété émergente** du bundling des DEUX rapports avec le code sous un pathspec qui n'exclut pas la racine `docs/`. `error_origin` = orchestrateur/ADR (pathspec D9).
- **Remède (décision orchestrateur/ADR — R-20 : le relecteur ne repackage aucun commit)** :
  - (a) committer les rapports de gouvernance G1/G2 dans un **commit/PR séparé** du lot de code gaté (PR de code ≈ 621 < 1205) ; **ou**
  - (b) **amender D9** : étendre le pathspec pour exclure aussi les rapports racine (p. ex. `':(exclude)docs/G*-lot-*.md'`), au même titre que S2 ; **ou**
  - (c) amender la borne (R-23, sourcé).

**§R-25 — VERDICT : DÉFAUT bloquant-tel-que-monté** (le code est correct et sous-budget ; aucune ré-écriture worker requise ; remède = action orchestrateur/ADR).

---

## (b) Récapitulatif mutants + sha256 (tous restaurés à l'octet)

| # | Cible | Mutation | Résultat | sha256 avant = après |
|---|---|---|---|---|
| Ratchet-A | `lint-ratchet.json` | ceiling 92→91 | `92/91` exit 1 | `f47ff292…` ✓ |
| Ratchet-B | `lint-ratchet.json` | ceiling non entier | exit 1 (plafond invalide) | `f47ff292…` ✓ |
| Ratchet-C | `lint-ratchet.json` | rules `[]` | exit 1 (rules vide) | `f47ff292…` ✓ |
| Ratchet-D | `lint-ratchet.json` | fichier absent | exit 1 (ENOENT, fail-closed) | `f47ff292…` ✓ |
| T38-M1 | `ci.yml` | continue-on-error inséré | test 38 rouge (ass. 1) | `200247303…` ✓ |
| T38-M2 | `ci.yml` | uses non-SHA (`@v7.0.1`) | test 38 rouge (ass. 2) | `200247303…` ✓ |
| T38-M3 | `ci.yml` | limite 1205→9999 | test 38 rouge (ass. 3) | `200247303…` ✓ |
| T38-M4 | `ci.yml` | pathspec S2 retiré | test 38 rouge (ass. 4) | `200247303…` ✓ |
| T38-M5 | `ci.yml` | pull_request retiré | test 38 rouge (ass. 5 ; en-tête ne masque pas) | `200247303…` ✓ |
| T38-M6 | `ci.yml` | lint:ratchet retiré de g4 | test 38 rouge (ass. 6) | `200247303…` ✓ |
| **T38-M7 (mon cru)** | `ci.yml` | g4 `&&`→`||` **et** retrait de `npm run lint` | **test 38 VERT (gap)** | `200247303…` ✓ |
| Vocab-mut | `packages/monark/src/index.ts` | `// Hermes` nu | gate rouge (`index.ts:1`) | `50e74a25…` ✓ |
| Vocab-ctr | `packages/monark/src/index.ts` | `// clawpump-hermes` | gate vert | `50e74a25…` ✓ |

Aucun fichier livré n'a été modifié de façon durable ; chaque restauration est prouvée par sha256 identique avant/après. Le relecteur n'a ni commité ni poussé (R-20).

---

## (d) VERDICT

**Modèle résolu : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`).**

### VERDICT : **CLOS-AVEC-RÉSERVES** — liste fermée de 3 réserves.

**Conformité par point** (tous re-vérifiés indépendamment, preuves rejouables R-21) :

| Point | Objet | Verdict |
|---|---|---|
| 1 | `ci.yml` (jobs bloquants, SHA API GitHub, 1205, pathspec, PR, g4, g1) | **CONFORME** |
| 2 | `package.json` pins exacts + lockfile (0 dép runtime) | **CONFORME** |
| 3 | `eslint.config.mjs` (print-config : 6 règles error/off, no-floating-promises error partout) | **CONFORME** |
| 4 | cliquet (fail-closed ×3 + mutant 92→91 + re-mesure indépendante 92) | **CONFORME** |
| 5 | sémantique src (corrections type-erased ; S2 digests inchangés, `s2_report_reproducible` vert) | **CONFORME** |
| 6 | test 38 (6 mutants rouges/restaurés, non-vacuité par assertion) | **CONFORME** + réserve mineure (gap) |
| 7 | vocab Hermes (scopé monark ; mutant/contre-mutant) | **CONFORME** |
| 8 | R-13 / `eslint-disable`=0 / secrets=0 / zéro dette nue | **CONFORME** |
| 9 | English-only (D0.5) | **RÉSERVE** (inventaire fichier:ligne) |
| 10 | oracles (`npm ci` propre, ci 79/79, lint 0, ratchet 92/92, typecheck 0, audit 0) | **CONFORME** |
| R-25 | taille de lot tel-que-monté 1311 > 1205 (code-seul 621 < 1205) | **DÉFAUT bloquant-tel-que-monté** |

**RÉSERVES (liste fermée, à résoudre par l'orchestrateur/G7 avant clôture — aucune n'exige de ré-écriture du code worker)** :

1. **[SÉRIEUSE] R-25 tel-que-monté = 1311 > 1205** (auto-référentiel, toujours > borne) — le job `r25` rougirait si code + G1 + G2 atterrissent en une PR unique ⇒ CA-V « CI verte » fausse. **Code-seul = 621 (sous borne)** ; les ~690 lignes des deux rapports de gouvernance (G1 396 + G2 ~294) débordent. Remède orchestrateur/ADR : (a) rapports en commit/PR séparé, (b) amender le pathspec D9 pour exclure `docs/G*-lot-*.md`, ou (c) amender la borne (R-23). `error_origin` = orchestrateur/ADR (pathspec D9 n'exclut pas la racine docs/).
2. **[FORMÉE] English-only (D0.5)** — français substantiel dans `ci.yml` (27 l.), `eslint.config.mjs` (21), `scripts/lint-ratchet.mjs` (21, dont messages runtime CI), `test/ci-gates.test.ts` (41, dont messages d'assertion + suffixes de noms de test). Inventaire fichier:ligne au point 9. À traduire avant l'export public `KraidleAI/monark` ; `grep-forbidden.mjs` et `lint-model-pinning.sh` déjà anglais ; rapports G1/G2/G7 restent français (gouvernance). G1 n'a pas mentionné D0.5 (omission consignée).
3. **[MINEURE] Gap de couverture test 38** — `&&`→`||` OU retrait de `npm run lint` dans g4 laissent test 38 **vert** (lint non bloquant), vérifié empiriquement. Le fichier livré est correct (`&&`). Remède : assertion (7) exigeant le littéral `npm run lint && npm run lint:ratchet` dans g4, sinon risque résiduel déclaré (MAST « tests passés ≠ propriété » ; couvert par la revue G2 100 % du diff).

**Ce qui est solidement établi** : tous les gates fonctionnels, de sécurité et de compliance (points 1–8, 10) sont **CONFORMES** avec vérification adversariale indépendante rejouable — SHA re-vérifiés contre l'API GitHub live, pins/lockfile re-parsés, `eslint --print-config` re-résolu, compte cliquet re-mesuré (92) par un script séparé, 13 mutants (dont 1 de mon cru révélant un gap) rouges/verts comme attendu avec restauration sha256 à l'octet, oracles rejoués depuis état propre.

## (e) Modèle résolu

`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme au roster (ADR-M003 D10bis / CLAUDE.md 2026-08-14) ; `claude-opus-5` banni, non utilisé.

---
*Provenance* : relecteur G2 = instance séparée à contexte frais, `claude-opus-4-8[1m]`, effort max, 2026-09-06 ; ≠ générateur (D10bis). Environnement : node v24.15.0, npm 11.12.1, gh 2.96.0. Consultation **advisor intégré (R-26)** : 1 appel avant verdict (calibrage des réserves + détection du blind-spot R-25 tel-que-monté). Le relecteur ne committe pas, ne pousse rien, ne modifie pas le code livré (R-20) ; tous les mutants restaurés à l'octet (sha256 avant/après consignés). **Intégrité R-20 vérifiée en clôture** : les **12 fichiers livrés** touchés par la revue sont TOUS restaurés à leur sha256 de début de revue (bloc « sha256 de référence » ci-dessus) — `git status` ne montre que les changements Lot V attendus + les rapports G1/G2, aucun artefact parasite, `package-lock.json` non touché par le `npm ci` de vérification. Verdict G7 final + acceptation checkpoint 2 = orchestrateur (`claude-fable-5-1`) / validateur-humain. Chaque chiffre/SHA/hash de ce rapport est rejouable par la commande citée (R-21).
