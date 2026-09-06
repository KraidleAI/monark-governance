claude-opus-4-8[1m]

# G1 — Journal de provenance, Lot V DEVOPS (ADR-M003 Phase 2)

- **GATE-0 / R-1** : modèle worker résolu = `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme au roster ADR-M003 D10 / CLAUDE.md 2026-08-14 ; `claude-opus-5` banni, non utilisé). Ligne 1 de ce fichier = cette résolution.
- **Provenance** : worktree `F:\Monark-wt-devops`, branche `lot-v-devops`, base HEAD `fee3bf9`. Généré le **2026-09-05** (effort max). Worker ne committe pas (R-20), ne crée aucun remote, ne pousse rien, ne saisit aucun secret. Réviseur G2 = instance séparée `claude-opus-4-8` à venir (D10bis) ; G7 = orchestrateur `claude-fable-5-1`.
- **Environnement mesuré** : node v24.15.0, npm 11.12.1, git 2.55.0, typescript **7.0.2** (portage natif), @types/node 24.13.3, ajv 8.20.0.

## 0. État des livrables

| Livrable | État | Preuve |
|---|---|---|
| A workflow CI (5 jobs bloquants, actions SHA-pinned) | **FAIT** | §3 ; test 38 vert |
| B eslint recommended-type-checked | **BLOQUÉ (consultation formée §4)** | portage natif TS 7.0.2 incompatible typescript-eslint |
| C vocab Hermes (scope monark) | **FAIT** | §5 ; gate vert 35 fichiers, mutants |
| D test 38 + mutant | **FAIT** | §6 ; 4 classes de mutant tuées, sha256 identique |
| E `npm run ci` vert | **FAIT (79/79)** | §7 |
| E `npm run lint` vert | **BLOQUÉ (=B)** | §4, §7 |
| F ce journal | **FAIT** | présent |

## 1. Sources consultées (URL, date, niveau)

- **ADR-M003** `docs/adr/ADR-M003-phase2-integration.md` [lu] — D1 (Lot V), D9 (`VIBEGATES_PR_LIMIT=1205`, pathspec `:(exclude)packages/*/docs/S2-*`, eslint recommended-type-checked, actions SHA complet), D10bis, D11 (test 38), D12 (Hermes nu, parcours `packages/monark/**`).
- **Template** `…/compiliance…/templates/ci-gates.yml` [lu] — invariant « chaque job BLOQUANT, aucun continue-on-error » ; structure r25/g1/g3/g4/g6 reprise.
- **doc 02** `…/docs/02-referentiel-gates-et-regles.md` [lu] — R-8 (registre AVANT npm add), R-13 (aucun TODO/FIXME nu), R-23 (chiffres par ADR), R-25 (taille de lot).
- **Script model-pinning** `…/compiliance…/vibegates/enforcement/lint-model-pinning.sh` [lu] — trouvé dans le miroir vibegates (donc PAS de substitution `.mjs`, cf. §3.1).
- `https://registry.npmjs.org/eslint/latest` — **2026-09-05**, [lu] : `version` = **10.10.0** ; `engines.node` = `^20.19.0 || ^22.13.0 || >=24`.
- `https://registry.npmjs.org/typescript-eslint/latest` — **2026-09-05**, [lu] : `version` = **8.69.0** ; `peerDependencies` = `{ eslint: "^8.57.0 || ^9.0.0 || ^10.0.0", typescript: ">=4.8.4 <6.1.0" }`. Recoupé brut `npm view typescript-eslint@8.69.0 peerDependencies` (identique) ; `dist-tags` = `{ latest: 8.69.0, canary: 8.69.1-alpha.0, rc-v8: 8.0.0-alpha.62 }` (aucun tag ne revendique TS7).
- `https://api.github.com/repos/actions/checkout/tags` + `…/releases/latest` — **2026-09-05**, [lu] : dernière release **v7.0.1** (publiée 2026-07-20), `html_url` `https://github.com/actions/checkout/releases/tag/v7.0.1`.
- `https://api.github.com/repos/actions/setup-node/tags` + `…/releases/latest` — **2026-09-05**, [lu] : dernière release **v7.0.0** (publiée 2026-07-14), `html_url` `https://github.com/actions/setup-node/releases/tag/v7.0.0`.
- Recoupement brut des SHA (curl, hors transcription LLM) : `curl -s https://api.github.com/repos/actions/checkout/commits/v7.0.1 | grep -m1 '"sha"'` et idem setup-node v7.0.0 — voir §2.
- `https://github.com/typescript-eslint/typescript-eslint/issues/10940` [2nd, cité par l'erreur runtime] — suivi du support typescript-eslint pour TS ≥ 7.1 (référencé par le message d'erreur, §4).

## 2. Versions et SHA — provenance (jamais devinés)

| Artefact | Valeur épinglée | Provenance (triple recoupée) |
|---|---|---|
| `actions/checkout` | `3d3c42e5aac5ba805825da76410c181273ba90b1` **# v7.0.1** | WebFetch `/tags` (v7.0.1→sha) + WebFetch `/releases/latest` (tag_name v7.0.1) + curl brut `/commits/v7.0.1` `"sha":"3d3c42e5…"` — **les trois concordent** |
| `actions/setup-node` | `820762786026740c76f36085b0efc47a31fe5020` **# v7.0.0** | WebFetch `/tags` (v7.0.0→sha) + WebFetch `/releases/latest` (tag_name v7.0.0) + curl brut `/commits/v7.0.0` `"sha":"820762…"` — **les trois concordent** |
| `eslint` | `10.10.0` (épinglé exact, **non installé** — §4) | registre npm `/latest` (R-8) |
| `typescript-eslint` | `8.69.0` (épinglé exact, **non installé** — §4) | registre npm `/latest` + `npm view … peerDependencies` (R-8) |

Le commentaire de version dans le workflow est indicatif ; **le SHA fait foi**. Les deux SHA sont des identifiants de commit 40-hex (vérifié par test 38, assertion 2).

## 3. Livrable A — `.github/workflows/ci.yml`

Réécrit depuis le template. `on: [pull_request]` (lecture nue du template) ; le trigger Phase 0 `push: main` (placeholder ADR-M001 D8) est **retiré** — motif : les gates VibeGates se jugent sur la PR et `r25-taille-de-lot` **exige** `github.base_ref` (indéfini sur push ⇒ fail-closed rouge à chaque push). Cinq jobs, tous bloquants, **0 `continue-on-error`** (directive) :

- **g1-controle-generation** : `bash enforcement/lint-model-pinning.sh .` (§3.1).
- **r25-taille-de-lot** : `VIBEGATES_PR_LIMIT: "1205"` (D9), `fetch-depth: 0`, décompte `git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` parsé en insertions+suppressions (awk), **fail-closed** sur borne vide/non-numérique et sur échec git (pas de merge-base).
- **g3-verification** : `npm ci` → `npm run gate:vocab` → `npm run typecheck` → `npm test`.
- **g4-architecture** : `npm ci` → `npm run lint` (eslint recommended-type-checked, D9 — voir blocage §4).
- **g6-compliance** : `npm ci` → `npm audit --audit-level=high`.

Toutes les actions `uses:` épinglées par SHA complet (§2).

### 3.1 Script model-pinning — réutilisation (pas de substitution)
Le script `lint-model-pinning.sh` **existe** dans le miroir vibegates ; la clause de substitution `.mjs` (introuvable) **ne s'applique pas**. Vendorisé tel quel dans `enforcement/` :
- source `…/vibegates/enforcement/lint-model-pinning.sh`, sha256 (copie worktree CRLF, byte-identique à la source) `607ae90470edbf09d3597dc6ac86358d7ec902aa560b9ef8a8ea7ffe1b1732d2` ;
- **normalisé LF** (le dépôt impose `.gitattributes` `* text=auto eol=lf` ; la copie CRLF aurait dérivé du blob commis), **sha256 LF canonique** `983ba1529d4e0a6ffb9d478f225c4d68539d18768fc78d6cc325ec95a3177365` — c'est cette forme (LF) que la CI exécute après commit ; contenu fonctionnel identique.
- Invariant préservé : `grep -rc "claude-opus-5" enforcement/` = **0** (l'id banni est construit au runtime, jamais littéral contigu dans la source).
- Portée : le script lint `.claude/agents|skills/**` et `settings*.json`. Le worktree Monark **n'a pas de `.claude/`** ⇒ sortie **vert-par-absence**, déclarée par le script lui-même : `OK (R-1/R-4): nothing in scope — 0 agent/skill/settings files found under ./.claude (green by absence, not by verification).` (exit 0). Honnête, non vacué en silence. **Monark est un dépôt distinct de Shogen** (dont `.claude/agents/` porte des agents) : le `.claude/` de Shogen est hors périmètre de ce gate ; si Monark était un jour exécuté depuis Shogen, la portée de g1 changerait (à re-vérifier alors).

## 4. Livrables B / E (lint) — BLOCAGE TOOLCHAIN → CONSULTATION FORMÉE

**Problème (une phrase)** : le dépôt tourne sur `typescript@7.0.2` (portage **natif**) dont l'entrée principale n'expose pas l'API classique du compilateur, et `typescript-eslint@8.69.0` **refuse explicitement TS 7.0** ; donc `@typescript-eslint/recommended-type-checked` (ADR-M003 D9) est **inexécutable** ici et `npm run lint` ne peut être vert.

**Tentatives (reproductibles)** :
1. Sonde API : `node -e "const ts=require('typescript');console.log(Object.keys(ts))"` ⇒ **`['version','versionMajorMinor']`** ; `ts.createProgram`, `ts.createSourceFile` = **undefined** ; `package.json` `exports["."]` = `./lib/version.cjs`, API programmatique seulement sous `./unstable/*` (surface nouvelle). typescript-eslint (`typescript-estree`) requiert `createSourceFile`/`createProgram` ⇒ ne peut même pas **parser** un `.ts`.
2. Registre (R-8) : `peerDependencies.typescript = ">=4.8.4 <6.1.0"` **exclut** 7.0.2.
3. `npm install --save-dev --save-exact eslint@10.10.0 typescript-eslint@8.69.0` (nu) ⇒ **ERESOLVE** (verbatim) : « Found: typescript@7.0.2 … Could not resolve dependency: peer typescript@">=4.8.4 <6.1.0" from typescript-eslint@8.69.0 ». `package.json` **non modifié** (install avortée).
4. Install **forcée** `--legacy-peer-deps` (pour preuve runtime seulement) ⇒ installe (93 paquets, **0 vulnérabilité**), puis `npx eslint` lève **verbatim** : « **typescript-eslint does not support TS 7.0.** … to run typescript-eslint using the TS 6 API. See also …/issues/10940 for tracking … TS >=7.1 » (`node_modules/typescript-eslint/dist/index.js:52`). Expérience **entièrement revertie** : `package.json`+`package-lock.json` restaurés (sha256 `0ecdc055…` / `69e322…`, identiques aux baselines), `node_modules` réinstallé propre par `npm ci`.

**Conséquence assumée** : eslint/typescript-eslint **ne sont PAS installés** dans l'état livré — les installer exigerait `--legacy-peer-deps`/`--force` (contournement interdit) et **casserait `npm ci`** (g3) en ERESOLVE, sans même faire tourner le lint. `eslint.config.mjs` est **autoré à la spec D9** (recommended-type-checked, `parserOptions.project=./tsconfig.json`, `files: **/*.ts`, JS/MJS ignorés) et **prêt à s'activer** dès résolution ; le script `lint` et le job g4 sont câblés.

**Options soumises (aucune n'est un contournement de lot ; toutes relèvent de l'ADR / mainteneur)** :
- (a) **Intérim syntaxique** : `typescript-eslint` ne **parse** pas non plus sur TS7 (même API manquante) ; un parseur tiers (Babel/oxc) parserait la *syntaxe* TS sans le paquet `typescript`, mais donnerait **0 règle type-aware** ⇒ ne satisfait pas D9 ; nécessite un ADR.
- (b) **TS 6.x classique en side-by-side** pour la seule chaîne de lint (voie recommandée par typescript-eslint via le blog TS7) — ADR toolchain (double TypeScript), risque de divergence lint/typecheck à border.
- (c) **Épingler le projet sur TS 6.x/5.x** — décision **transverse** (tout le `tsc --noEmit` de la flotte), au-dessus du périmètre Lot V ; ADR + re-validation de l'arbre.
- (d) **Attendre** le support typescript-eslint pour TS ≥ 7.1 (issue amont #10940) — puis épingler les versions déjà vérifiées (§2).

**Violations eslint** : **aucune listable** — le linter n'a jamais pu s'exécuter (blocage ci-dessus). Donc **0 corrigée, 0 non corrigée, 0 `eslint-disable`** introduit. La consigne « corrige si trivial, sinon liste » est vide par impossibilité d'exécution, déclaré tel quel.

## 5. Livrable C — vocab gate Hermes (scope `monark`)

- **Motif** (`vocab-banned.json` → `scan.monark.banned`) : `(?<!pyth-)(?<!clawpump-)\bHermes\b` (flag `i`). Round-trip vérifié sur le **fichier réel** : `JSON.parse` → source compilée `(?<!pyth-)(?<!clawpump-)\bHermes\b` ; `Hermes harness`→match, `UsePod/Hermes`→match, `pyth-hermes`/`clawpump-hermes`→no-match, `Chermes`/`Hermest`→no-match (mot entier).
- **Scopé, pas global** — justification : `packages/contracts/src/types.ts:116` (« the Hermes middleware ») est dans la **zone gelée** (`contracts_frozen`, non éditable) ; un motif global la ferait rougir sans recours. Le scope `monark` walk **tout** `packages/monark/**` (`.ts/.js/.mjs/.json/.md`) et n'applique le motif Hermes **qu'à** ce parcours. Les patterns globaux (claims marketing) restent partout. Mode CLI (`test 26`) = patterns globaux seuls (préservé).
- **Reformulation** : `packages/monark/package.json` « + Hermes harness wiring » → « + **clawpump-hermes** harness wiring » (seule occurrence Hermes nu dans le scope monark).
- **Mutants (grep réel du gate)** : naked `// Hermes harness note` injecté dans `packages/monark/src/index.ts` ⇒ **rouge** (`FORBIDDEN VOCAB … packages/monark/src/index.ts:20`), restauré `git checkout` byte-exact ; `// clawpump-hermes harness note` ⇒ **vert**, restauré. Gate courant : **vert, 35 fichiers scannés**.
- **Mentions méta déclarées (pour G2)** : le `$comment` de `vocab-banned.json` et les chaînes d'assertion de `test/ci-gates.test.ts` contiennent « Hermes » nu en tant que **description / test du motif** — hors scope de scan (racine et `test/`, jamais `packages/monark/**`), au même titre que les ADR qui discutent la collision. Non-violations, déclarées pour pré-empter le grep de revue.

## 6. Livrable D — test 38 `ci_gates_blocking_no_continue_on_error`

`test/ci-gates.test.ts` lit `.github/workflows/ci.yml` et échoue si : (1) directive `continue-on-error:` sur ligne non-commentaire ; (2) un `uses:` non 40-hex ; (3) `VIBEGATES_PR_LIMIT` ≠ `1205` ; (4) pathspec `:(exclude)packages/*/docs/S2-*` absent. (Assertion 1 corrigée en cours de passe : la mention **en prose** de « continue-on-error » dans un commentaire est licite — le template lui-même l'écrit ; seule la **directive** débloque un job.)

**Mutant nommé (D) — `continue-on-error: true` inséré** :
- sha256 ci.yml **avant** = `4fa24cc0704a1d33f803915d478b4a79dc83b7b9d1918a4c5d78108f119327b7`
- injection `continue-on-error: true` (job-level) ⇒ test 38 **ROUGE** (« directive continue-on-error présente »)
- restauration depuis copie saine ⇒ sha256 **après** = `4fa24cc0704a1d33f803915d478b4a79dc83b7b9d1918a4c5d78108f119327b7` — **identique**, test 38 **VERT**.

**Non-vacuité (3 autres classes, chacune reddie puis restaurée)** : SHA→tag mobile `@v7.0.1` ⇒ rouge ; `VIBEGATES_PR_LIMIT "1205"→"9999"` ⇒ rouge ; retrait du pathspec S2 ⇒ rouge. Restauration finale sha256 = `4fa24cc0…` (identique). Test additionnel non-numéroté `vocab_monark_scope_bans_naked_hermes` (D11 étant fermé) verrouille §5.

## 7. Oracles d'exécution (sortie complète)

- `npm ci` (propre, `rm -rf node_modules`) ⇒ `added 15 packages … found 0 vulnerabilities`, **exit 0** (g3 dépend de ceci ; le lockfile était pré-cassé, cf. §10).
- `npm run ci` (= `gate:vocab && typecheck && test`) ⇒ `gate:vocab OK — scanned 35 file(s)` ; `tests 79 / pass 79 / fail 0`, **exit 0**.
- `npm audit --audit-level=high` (g6) ⇒ `found 0 vulnerabilities`, **exit 0**.
- `npm run lint` (g4) ⇒ **exit 1** : `'eslint' n'est pas reconnu …` (eslint non installé — blocage §4). **BLOQUÉ, déclaré**.

## 8. R-25 — auto-mesure (méthode `git add -N` car le worker ne committe pas)

`git add -N .` puis `git diff --shortstat -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` puis `git reset` :

```
9 files changed, 513 insertions(+), 32 deletions(-)
```

Décompte lot (insertions+suppressions, hors S2 et lockfile) = **545** lignes ≪ borne **1205** (D9). Arithmétique awk du job vérifiée localement : ` 9 files changed, 513 insertions(+), 32 deletions(-)` → **545** (513+32). Par fichier (numstat, hors exclusions) : ci.yml (+82/-16), enforcement/lint-model-pinning.sh (+143), eslint.config.mjs (+31), package.json (+1), packages/monark/package.json (+1/-1), scripts/grep-forbidden.mjs (+40/-13), test/ci-gates.test.ts (+76), vocab-banned.json (+9/-2), docs/G1-lot-V.md (+130). (Mesure incluant ce journal ; le décompte croît de quelques lignes avec cette même substitution, sans approcher la borne.) `package-lock.json` **exclu** du décompte (D9).

## 9. Delta assumé vs `templates/ci-gates.yml` (pour la revue G2)

La mission A fixe g3=vocab+typecheck+test, g4=eslint, g6=`npm audit`. Ne sont **pas** instanciées (hors périmètre Lot V, à porter par un lot/ADR ultérieur, **jamais un dû nu**) : g3 SAST + scan secrets + check nouvelle-dépendance ; g4 fitness-functions + duplication ; g6 SBOM + scan licences + échéances CRA ; g5 (TODO/GIST/flags). Delta **délibéré**, listé ici pour que G2 le voie.

## 10. Pendants formés (zéro dette nue)

- **(i) Investisseur — hors périmètre local** : création du dépôt distant, configuration de la **clé de signature git**, choix de l'hébergement public. **Commits signés et premier push = investisseur** (ADR-M003 D0.3 / D1 ligne V) ; le worker ne crée aucun remote, ne pousse rien, ne signe rien (R-20). Sans (i) ≤ 2026-09-10 : aucun remote, CI non exécutée à distance, **déclaré tel quel** (CA-V).
- **Blocage eslint/TS7 → CONSULTATION FORMÉE (§4)** : adressée au mainteneur/orchestrateur (options a–d). Reste dû tant que non tranché ; **pas un contournement**. Une fois tranché : installer eslint@10.10.0 + typescript-eslint@8.69.0 (versions déjà vérifiées, R-8) ou la voie retenue, puis g4/`npm run lint` deviennent verts.
- **Lockfile pré-cassé (constat, résolu)** : `package-lock.json` initial était désynchronisé (`Missing: @monark/atelier` ⇒ `npm ci` échouait). Régénéré par `npm install` (nécessaire pour tout `npm ci`/typecheck/test) ; changement **exclu** du décompte R-25 (D9). Aucune dépendance runtime ajoutée.

---
*Fin G1 Lot V. Sortie destinée à la vérification adversariale de l'orchestrateur (R-21) : chaque chiffre/SHA/hash ci-dessus est rejouable par la commande citée.*

---

# Suite — résolution eslint (ADR-M003 D9 addendum 2026-09-05, option c)

- **Provenance** : worker résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, roster CLAUDE.md 2026-08-14 ; `claude-opus-5` banni). Effort max. Worktree `F:\Monark-wt-devops`, branche `lot-v-devops`. **Base réelle = merge-base `fee3bf9`** (= HEAD ; `main` est 3 commits en AVANT, cf. §S6). Généré **2026-09-05**. Worker ne committe pas (R-20), ne pousse rien, ne saisit aucun secret. Environnement : node v24.15.0, npm 11.12.1.
- **Décision appliquée** : ADR-M003 D9 addendum du 2026-09-05, **option (c)** — `typescript` épinglé **6.0.3 exact** pour tout le dépôt (un seul compilateur classique pour `tsc --noEmit` ET le lint type-checked) ; `eslint@10.10.0` + `typescript-eslint@8.69.0` installés `--save-exact` ; livraison par PR (`on: pull_request` conservé). Le texte de l'addendum est sur `main` (commit `403bd8b`), pas encore dans ce worktree (cf. §S6).

## S0. Supersession (jamais réécriture — cette section PREND LE PAS sur, sans effacer)

Le journal est un artefact de provenance : les sections d'origine restent telles quelles ; les lignes ci-dessous les **supersèdent** explicitement.

| Section d'origine | État d'origine | Nouvel état (Suite) |
|---|---|---|
| §0 ligne B (eslint recommended-type-checked) | BLOQUÉ | **Toolchain RÉSOLU** ; eslint s'exécute (§S3) |
| §0 ligne E (`npm run lint`) | BLOQUÉ | **S'exécute** ; rouge sur 182 violations (§S3), périmètre escaladé (§S9) |
| §4 (blocage TS7 → consultation) | consultation formée, options a–d | **Tranché par l'investisseur : option (c)** ; blocage toolchain LEVÉ |
| §7 ligne `npm run lint` | exit 1 « eslint non installé » | exit 1 « 182 problems » (eslint installé et exécuté, §S5) |
| §10 pendant « Blocage eslint/TS7 » | dû (non tranché) | **Clos comme blocage toolchain** ; NOUVEAU pendant de périmètre ouvert (§S9) |

## S1. R-8 — registre AVANT installation (rejouable)

- `npm view typescript dist-tags` -> `latest: 7.0.2`, `beta: 6.0.0-beta`, `next: 7.1.0-dev.20260905.1` (la ligne 6.0.x est publiée).
- `npm view typescript versions --json` filtré : stables 6.0.x = **`6.0.2`, `6.0.3`** (le reste en `6.0.0-beta` / `6.0.0-dev.*` / `6.0.1-rc`) ; **aucune 6.1.x stable** (`v.filter(/^6\.[1-9]/) === []`). Donc **6.0.3 = dernière stable 6.0.x**, et `6.0.3 < 6.1.0` satisfait le peer typescript-eslint.
- `npm view typescript@6.0.3 version` -> `6.0.3` ; `npm view eslint@10.10.0 version` -> `10.10.0` ; `npm view typescript-eslint@8.69.0 version` -> `8.69.0`.
- `npm view typescript-eslint@8.69.0 peerDependencies` -> `{ eslint: "^8.57.0 || ^9.0.0 || ^10.0.0", typescript: ">=4.8.4 <6.1.0" }` — **10.10.0 et 6.0.3 satisfont les deux**.
- **Portée du pin (« tout le dépôt »)** : seul `package.json` racine déclare `typescript` ; `grep -rn '"typescript"' --include=package.json` sur `packages/*` = **aucun** (les workspaces n'ont pas de TS propre). Un seul TS hoisté => le pin racine est réellement repo-wide. `tsconfig` : racine + `packages/atelier/tsconfig.json` (extends racine) ; les deux, comme eslint (`project: ./tsconfig.json`), utilisent le compilateur unique.

## S2. Installation (étape 1) — aucun ERESOLVE

`npm install --save-dev --save-exact typescript@6.0.3 eslint@10.10.0 typescript-eslint@8.69.0`
-> `added 93 packages, removed 1 package, changed 1 package, and audited 113 packages` · `found 0 vulnerabilities` · **exit 0**. Aucun ERESOLVE (contraste avec §4 tentative 3 sous TS7).
`package.json` devDependencies après : `"eslint": "10.10.0"`, `"typescript": "6.0.3"`, `"typescript-eslint": "8.69.0"` — **exacts, sans `^`** (`--save-exact`). `@types/node`/`ajv`/`ajv-formats` inchangés.

## S3. Réfutation du blocage §4 + typecheck (étape 2)

- **API classique restaurée** (réfute §4 tentative 1) : `node -e "const ts=require('typescript');..."` -> `version=6.0.3 createProgram=function createSourceFile=function keys=2248` ; `npx tsc --version` -> `Version 6.0.3`. (Sous TS7 natif, §4 mesurait 2 clés et `undefined`.)
- **`npm run typecheck` (`tsc --noEmit`) -> exit 0, strict.** **Aucun écart TS6-vs-TS7** : 0 erreur sous TS6 comme sous TS7. **Aucun finding, aucune rustine.** (La consigne « tout écart TS7 est un finding, jamais rustiné » est vide par absence d'écart.)

## S4. `npm run lint` — décompte AVANT toute correction (étape 3)

`npx eslint . -f json` (exit 1 attendu, non avalé) puis agrégation par `ruleId`. **182 problèmes, 182 erreurs, 0 warning, 0 `ruleId` nul** (aucune erreur de parse/config : le type-checked parse tout l'arbre — toolchain saine). 22 fichiers. 4 auto-fixables.

| # | Règle (@typescript-eslint/) | Violations | Catégorie |
|---|---|---:|---|
| 1 | no-floating-promises | 79 | **Motif node:test** (voir §S9-A) |
| 2 | no-unsafe-member-access | 34 | code (any/JSON) |
| 3 | no-unsafe-assignment | 30 | code (any/JSON) |
| 4 | no-unsafe-call | 15 | code (any/JSON) |
| 5 | no-explicit-any | 9 | code |
| 6 | no-unused-vars | 6 | code |
| 7 | no-unnecessary-type-assertion | 4 | code |
| 8 | no-unsafe-argument | 3 | code (any/JSON) |
| 9 | no-unsafe-return | 1 | code |
| 10 | no-redundant-type-constituents | 1 | code |
| | **TOTAL** | **182** | |

**182 ≫ ~15 => arrêt de la correction, escalade de périmètre à l'orchestrateur (consigne étape 3).** Aucune violation corrigée, **aucun `eslint-disable` introduit**. Répartition source vs test (par fichier, JSON eslint) :
- **Production `src/` = 6 violations seulement** : `packages/hikae/src/l3-gate.ts` (no-redundant-type-constituents ×1) ; `packages/hikae/src/s2/instrument.ts` (no-unnecessary-type-assertion ×3) ; `packages/monark/src/index.ts` (no-unused-vars ×2).
- **Tests = 176** : 79 no-floating-promises (tous des appels `test(...)` nus, cf. §S9-A) + **97 autres** = 92 no-unsafe-*/no-explicit-any (34+30+15+9+3+1 ; fixtures/assertions manipulant `any`/`JSON.parse`) + 4 no-unused-vars (`packages/hikae/test/contracts-integration.test.ts`) + 1 no-unnecessary-type-assertion (`packages/contracts/test/forbidden-keys.test.ts`). Contrôle : 79+92+4+1 = **176** tests, + **6** src = **182**.

## S5. Oracles (étape 5) — état propre

- `rm -rf node_modules && npm ci` -> `added 107 packages … found 0 vulnerabilities`, **exit 0**. **Le job g3 (`npm ci`) ne casse pas** (le point dur de §4 : sous TS7, l'install exigeait `--legacy-peer-deps` et cassait `npm ci`).
- `npm run ci` (= `gate:vocab && typecheck && test`, **n'inclut PAS lint**) -> **`tests 79 / pass 79 / fail 0`, exit 0** (vert). Inclut le test 38 modifié (§S7).
- `npm run lint` (job g4) -> `✖ 182 problems (182 errors, 0 warnings)`, **exit 1** — **rouge, attendu** (sortie complète = preuve de §S4/§S9). Décompte **stable à 182 après l'ajout de l'assertion (5)** au test 38 : le fichier édité `test/ci-gates.test.ts` conserve exactement ses 11 violations pré-existantes (les ~18 lignes ajoutées n'introduisent **aucune** violation ; les `!` requis par `noUncheckedIndexedAccess` ne sont pas signalés car `no-non-null-assertion` n'est pas dans recommended-type-checked).

- `npm audit --audit-level=high` (commande exacte du job **g6**, rejouée après le changement de 93 paquets) -> `found 0 vulnerabilities`, **exit 0** (g6 reste vert ; aucun paquet de lint n'introduit de vulnérabilité haute+).

## S6. R-25 — auto-mesure corrigée (étape 6)

**Piège écarté** : `main` (`403bd8b`) est **3 commits en AVANT** de HEAD (`fee3bf9`) — commits qui ajoutent l'addendum ADR-M003 D9/D10 et un journal, absents de ce worktree. `git log HEAD..main` = 3 ; `git log main..HEAD` = 0 ; `git merge-base main HEAD` = `fee3bf9` (= HEAD).

- **Commande littérale de la mission (POLLUÉE, à ne PAS retenir)** : `git diff --shortstat main -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` -> `8 files changed, 145 insertions(+), 51 deletions(-)`. Fausse **deux fois** : (a) compte en *suppressions* le contenu des 3 commits d'avance de main (`docs/CHECKPOINT1-phase2.md` -4, `docs/JOURNAL-PROVENANCE.md` -3, `docs/adr/ADR-M003-…md` -12) que le lot n'a jamais touché ; (b) **ignore** les 4 livrables non suivis (G1, enforcement/, eslint.config.mjs, ci-gates.test.ts) que `git diff` ne voit pas.
- **Mesure HONNÊTE vs merge-base `fee3bf9` (= HEAD ; identique à la sémantique three-dot `origin/base...HEAD` du job r25)** : `git add -N .` ; `git diff --shortstat HEAD -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` ; `git reset`. Décompte de clôture ci-dessous (§S11 ; inclut cette section « Suite »). `git diff main...HEAD` (three-dot) = vide (HEAD == merge-base ; le lot vit dans le worktree).
- `.gitignore` couvre `node_modules/`/`dist/` => `git add -N .` n'intent-add jamais les dépendances.

## S7. Test 38 — assertion (5) `on: pull_request` + mutant (étape 4)

Ajout dans `test/ci-gates.test.ts`, test 38, assertion **(5)** : le bloc de haut niveau `on:` (lignes indentées jusqu'à la prochaine clé colonne-0, commentaires de fin de ligne retirés) doit matcher `/\bpull_request\b/`. **Bloc-scopé exprès** : le commentaire d'en-tête du workflow (qui cite « pull_request ») est HORS bloc `on:` et ne peut donc pas masquer un mutant qui retire le vrai déclencheur.

Séquence (rejouable) — restauration depuis **copie saine** (pas `git checkout` : `ci.yml` est modifié/non commité) :
- sha256 `ci.yml` **AVANT** = `4fa24cc0704a1d33f803915d478b4a79dc83b7b9d1918a4c5d78108f119327b7` ; 1 seule ligne `^\s*pull_request:\s*$` (L19).
- test 38 sur fichier courant -> **PASS** (exit 0).
- **MUTANT** : `sed -i '/^[[:space:]]*pull_request:[[:space:]]*$/d'` (bloc `on:` devient vide) -> test 38 **ROUGE** sur **le message d'assertion (5)** : « le workflow doit se déclencher sur pull_request … » `expected: /\bpull_request\b/` (exit 1). Les assertions (1)-(4) passent d'abord => **(5) seule tue le mutant** (non-vacuité).
- restauration depuis copie -> sha256 **APRÈS** = `4fa24cc0704a1d33f803915d478b4a79dc83b7b9d1918a4c5d78108f119327b7` — **IDENTIQUE** ; test 38 **PASS** (exit 0).

## S8. package-lock.json — preuve mécanique « aucune dépendance runtime » (étape 7)

Diff de l'objet `.packages` parsé (autoritaire, vs le grep ligne-à-ligne qui est bruité) : `git show HEAD:package-lock.json` vs worktree.
- **CHANGÉ (1)** : `node_modules/typescript` `7.0.2 -> 6.0.3` (`dev:true`).
- **RETIRÉ (20)** : tous `@typescript/typescript-<os>-<arch>` (aix-ppc64, darwin-arm64, linux-x64, win32-x64, …), tous `dev:true` — ce sont les **binaires par-plateforme du portage NATIF TS 7** ; TS 6.0.3 (classique, pur JS) n'en a aucun => retrait **cohérent avec le pin 7->6**, pas une perte de runtime.
- **AJOUTÉ (95, set-difference parsé)** = `packages/atelier` (**membre workspace** first-party, sans flag `dev` — pas une dépendance) + `node_modules/@monark/atelier` (**lien** workspace, `link:true` -> `packages/atelier`) + **93 paquets de lint tous `dev:true`**.
- **Oracle** : parmi les 94 clés `node_modules/` réellement nouvelles, `dev:true` = **93**, `link:true` = **1**, et **`node_modules` nouveau NON (dev|link) = 0**. **Runtime (non-dev, non-link) ajouté ou changé = NÉANT.**
- Le grep littéral `git diff package-lock.json | grep '^+.*"node_modules/'` montre 101 lignes-clé : les 7 en surplus (`@monark/contracts|hikae|monark|ukemi` liens, `@types/node`/`fast-deep-equal`/`fast-uri` `dev:true`) **pré-existent dans le lock HEAD** (ré-émises par le diff ligne à cause de la réécriture de hunks), donc non nouvelles.
- **Réconciliation `npm install` (disque) vs diff lock parsé (vs HEAD)** : npm a rapporté `added 93 / removed 1 / changed 1` ; le diff parsé donne `95 / 20 / 1`. (a) *added* : les **93** = exactement les paquets de lint `dev` téléchargés par CET install ; les **2** entrées atelier (`packages/atelier` + `node_modules/@monark/atelier`) **pré-datent** cet install (régénération du lock par le worker précédent, §10 — la baseline pré-install montrait déjà `+ node_modules/@monark/atelier`), d'où 93+2 = 95 vs HEAD. (b) *removed* : les 20 `@typescript/typescript-*` sont **tous `optional:true`** dans le lock HEAD ; seul le binaire de l'hôte (`win32-x64`, présent et optional) était réellement sur disque, donc `npm` en retire **1** (disque) tandis que le lock en perd **20** (les 19 autres, jamais installés sur cet OS). Post-install `node_modules/@typescript/` **n'existe plus** (TS 6.0.3 pur JS, aucun binaire par plateforme). (c) *changed* : `typescript` 7.0.2->6.0.3.
- Paquets de lint ajoutés, **93, tous `dev`** (étape 7 « liste-les » ; préfixe `node_modules/` retiré, imbriqués en chemin complet) :
```
@cacheable/memory, @cacheable/utils, @eslint-community/eslint-utils, @eslint-community/eslint-utils/node_modules/eslint-visitor-keys, @eslint-community/regexpp, @eslint/config-array, @eslint/config-helpers, @eslint/core, @eslint/object-schema, @eslint/plugin-kit, @humanfs/core, @humanfs/node, @humanfs/types, @humanwhocodes/module-importer, @humanwhocodes/retry, @keyv/bigmap, @keyv/serialize, @types/esrecurse, @types/estree, @types/json-schema, @typescript-eslint/eslint-plugin, @typescript-eslint/eslint-plugin/node_modules/ignore, @typescript-eslint/parser, @typescript-eslint/project-service, @typescript-eslint/scope-manager, @typescript-eslint/tsconfig-utils, @typescript-eslint/type-utils, @typescript-eslint/types, @typescript-eslint/typescript-estree, @typescript-eslint/utils, @typescript-eslint/visitor-keys, acorn, acorn-jsx, balanced-match, brace-expansion, cacheable, cross-spawn, debug, deep-is, escape-string-regexp, eslint, eslint-scope, eslint-visitor-keys, eslint/node_modules/ajv, eslint/node_modules/json-schema-traverse, espree, esquery, esrecurse, estraverse, esutils, fast-json-stable-stringify, fast-levenshtein, fdir, file-entry-cache, find-up, flat-cache, flatted, glob-parent, hashery, hookified, ignore, imurmurhash, is-extglob, is-glob, isexe, json-stable-stringify-without-jsonify, keyv, levn, locate-path, minimatch, ms, natural-compare, optionator, p-limit, p-locate, path-exists, path-key, picomatch, prelude-ls, punycode, qified, qified/node_modules/hookified, semver, shebang-command, shebang-regex, tinyglobby, ts-api-utils, type-check, typescript-eslint, uri-js, which, word-wrap, yocto-queue
```
Parmi eux, **5 imbriqués** (dépendances de lint dédupliquées localement, toutes `dev`) : `@eslint-community/eslint-utils/node_modules/eslint-visitor-keys`, `@typescript-eslint/eslint-plugin/node_modules/ignore`, `eslint/node_modules/ajv` (ajv **v6** propre à eslint, distinct du **runtime `ajv@8`** de contracts/atelier — les deux coexistent, le runtime n'est pas touché), `eslint/node_modules/json-schema-traverse`, `qified/node_modules/hookified`.

## S9. Pendant FORMÉ — périmètre des 182 violations (zéro dette nue, escalade orchestrateur)

Le blocage **toolchain** (§4/§10) est **clos** par l'option (c). Reste un **choix de périmètre**, au-dessus du Lot V, **formé et escaladé** (pas un dû nu, pas un contournement) :

- **(A) 79 `no-floating-promises` = motif runner `node:test`.** Preuve : les 79 sont **toutes** dans des `*.test.ts`, sur des appels `test(...)` nus (ex. `test/ci-gates.test.ts:23` = `test("ci_gates…", () => {`), et **aucune** hors dossier/suffixe test — soit l'identité **79 violations = 79 tests** de la suite (un `test()` nu non-awaité par test ; cf. §S5 `pass 79`). Le `test()` de `node:test` renvoie `Promise<void>` non awaited. **Décision de CONFIG, pas de code** : `typescript-eslint` expose `no-floating-promises` avec `allowForKnownSafeCalls` (déclarer `test`/`describe`/`it` de `node:test` comme sûrs) — c'est un **choix d'ADR** (modifie `eslint.config.mjs`, spec D9). **Non fait ici** : `void` sur 79 appels serait une rustine de masse, et modifier la config recommended-type-checked (D9) sort du périmètre worker. À trancher par l'orchestrateur/ADR.
- **(B) 103 violations « code »** (dont **6 seulement en `src/`**, cf. §S4). Choix : (i) corriger (typage strict des fixtures/`JSON.parse`, retrait des `any`) ; (ii) assouplir un sous-ensemble de règles pour les tests via override eslint ; (iii) périmètre par lot ultérieur. Décision de périmètre = orchestrateur.

**Lecture explicite de « arrête-toi après le tableau » (étape 3)** : l'arrêt vise la **correction** (aucun fix de masse, aucune pré-emption de périmètre). Les étapes 4–7 ne touchent **aucune source** et sont des livrables toolchain indépendants — **complétées**. `npm run ci` (hors lint) est **vert** ; `npm run lint` **rouge** EST la « sortie complète » demandée. **Le vert de `npm run lint` (donc du job g4) est CONDITIONNEL à la décision de périmètre orchestrateur (§S9)** — escalade formée, pas un dû nu. L'orchestrateur peut renverser cette lecture.

## S10. Correction d'artefact (véracité, pas rustine)

`eslint.config.mjs` : l'en-tête `STATUT … NON EXÉCUTABLE` (vrai sous TS7) est devenu **faux** après l'option (c) ; réécrit en `STATUT … EXÉCUTABLE et MESURÉ` (TS 6.0.3, API classique vérifiée, versions installées). **La logique de config (recommendedTypeChecked, `project: ./tsconfig.json`, `files: **/*.ts`, ignores JS/MJS) est inchangée** — seul le commentaire décrit désormais l'état mesuré.

## S11. Décompte de clôture R-25 (vs merge-base `fee3bf9` = HEAD)

`git add -N .` ; `git diff --shortstat HEAD -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` ; `git reset` (mesure de clôture, après toutes les éditions y compris les corrections R-21 finales) :

```
9 files changed, 665 insertions(+), 35 deletions(-)
```

**700 lignes** (665+35), hors artefacts S2 et lockfile, **≪ borne 1205 (D9)**. Par fichier (numstat) : `.github/workflows/ci.yml` +82/-16 · `docs/G1-lot-V.md` +258 · `enforcement/lint-model-pinning.sh` +143 · `eslint.config.mjs` +28 · `package.json` +10/-3 · `packages/monark/package.json` +1/-1 · `scripts/grep-forbidden.mjs` +40/-13 · `test/ci-gates.test.ts` +94 · `vocab-banned.json` +9/-2. Cette mesure inclut l'intégralité du présent journal (G1 = 258 lignes) ; éditer les nombres de ce §S11 ne change pas le compte de lignes. La commande littérale `git diff --shortstat main …` = `8 files, 145+/51-` est **écartée** (polluée : main 3 commits en avant + livrables non suivis ignorés, cf. §S6).

---
*Fin Suite Lot V (résolution eslint). Chaque chiffre/SHA/hash est rejouable par la commande citée (R-21). Le worker ne committe pas (R-20) ; verdict G7 et décision de périmètre §S9 = orchestrateur.*

---

# Passe 3 — D9 ter (application de la décision de périmètre eslint)

- **Provenance** : worker résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, roster ADR-M003 D10 / CLAUDE.md 2026-08-14 ; `claude-opus-5` banni, non utilisé). Effort max. Worktree `F:\Monark-wt-devops`, branche `lot-v-devops`, base merge-base HEAD `fee3bf9`. Généré le **2026-09-06**. Worker ne committe pas (R-20), ne pousse rien, ne saisit aucun secret. **Section EN CONTINUATION** (jamais réécrite) ; consignée après CHAQUE étape (anti-coupure).
- **Décision appliquée** : ADR-M003 addendum **D9 ter** (2026-09-06, commis sur main `F:\Monark`, `docs/adr/ADR-M003-phase2-integration.md` §« Addendum D9 ter ») [lu]. Quatre points : (1) `packages/*/src/**` strict intégral, 6 violations corrigées, aucun `eslint-disable` ; (2) `no-floating-promises` via option documentée `allowForKnownSafeCalls` ciblant `test`/`describe`/`it` de `node:test`, règle conservée en erreur partout ; (3) fichiers de test = 6 règles `no-unsafe-*`/`no-explicit-any` en `off` + **cliquet** mesuré `scripts/lint-ratchet.mjs` ; (4) `no-unused-vars` et `no-unnecessary-type-assertion` corrigées partout, tests compris.

## P3.0 — Orientation (état mesuré AVANT toute édition)

- Environnement : node v24.15.0. Toolchain Passe 2 en place (`package.json` devDependencies, exacts) : `eslint@10.10.0`, `typescript-eslint@8.69.0`, `typescript@6.0.3`.
- `npx eslint . -f json` (rejouable, sortie non avalée) -> **182 problèmes (182 erreurs, 0 warning)**, 22 fichiers, 0 `ruleId` nul. Agrégation par règle **identique au tableau §S4** (aucune dérive depuis la Passe 2) :

| Règle @typescript-eslint/ | N | SRC | TEST |
|---|---:|---:|---:|
| no-floating-promises | 79 | 0 | 79 |
| no-unsafe-member-access | 34 | 0 | 34 |
| no-unsafe-assignment | 30 | 0 | 30 |
| no-unsafe-call | 15 | 0 | 15 |
| no-explicit-any | 9 | 0 | 9 |
| no-unused-vars | 6 | 2 | 4 |
| no-unnecessary-type-assertion | 4 | 3 | 1 |
| no-unsafe-argument | 3 | 0 | 3 |
| no-unsafe-return | 1 | 0 | 1 |
| no-redundant-type-constituents | 1 | 1 | 0 |
| **TOTAL** | **182** | **6** | **176** |

- **11 violations à corriger** (localisées par le JSON eslint, rejouable) :
  - **SRC (6)** : `packages/hikae/src/l3-gate.ts:49:9` no-redundant-type-constituents ; `packages/hikae/src/s2/instrument.ts:299:36 / 311:37 / 451:20` no-unnecessary-type-assertion ; `packages/monark/src/index.ts:12:32 / 12:55` no-unused-vars (`_price`, `_prediction`, args de stub).
  - **TEST (5, point 4)** : `packages/hikae/test/contracts-integration.test.ts:12-15` no-unused-vars (imports morts `generateLabeledSeries`, `runSplitCampaign`, `runMutants`, `demoStates`) ; `packages/contracts/test/forbidden-keys.test.ts:47:45` no-unnecessary-type-assertion.
- **Compte cliquet = 92** (6 règles : no-unsafe-member-access 34 + no-unsafe-assignment 30 + no-unsafe-call 15 + no-unsafe-argument 3 + no-unsafe-return 1 + no-explicit-any 9), **toutes en TEST** — plafond initial à MESURER par le cliquet (§P3.4), pas deviné (attendu 92).

## P3.1 — Vérification doc `no-floating-promises` (D9 ter §2 ; source AVANT config)

- **URL** : `https://typescript-eslint.io/rules/no-floating-promises/` [lu], WebFetch 2026-09-06.
- **Option (nom exact)** : `allowForKnownSafeCalls`. Forme d'une entrée « package » (doc, format partagé `TypeOrValueSpecifier`) : `{ from: "package", name: string | string[], package: string }` ; exemple doc verbatim : `{ "from": "package", "name": ["it","describe","test"], "package": "node:test" }`. Concorde avec la forme attendue par l'ADR (`{ from:"package", name:[...], package:"node:test" }`).
- **Confirmation version installée** (empirique, rejouable) : `@typescript-eslint/eslint-plugin@8.69.0` — `pkg.rules["no-floating-promises"].meta.schema` **contient** `allowForKnownSafeCalls` (clés d'option : allowForKnownSafeCalls, allowForKnownSafePromises, checkThenables, ignoreIIFE, ignoreVoid). Le nom/forme est donc valide sous la version épinglée (une clé inconnue ferait échouer eslint en validation de schéma).

## P3.2 — Corrections source (D9 ter §1 + §4) — AVANT toute modif de config

Les 11 violations de correction (6 src + 5 test) appliquées. **Aucun `eslint-disable`, aucun `argsIgnorePattern`** (l'`_`-convention aurait été une 7ᵉ relaxation non sanctionnée par D9 ter — corrigé en source). Diffs de **source de production** (chacun justifié, mission « liste chaque diff de src ») :

| # | Fichier:ligne | Diff | Règle | Justification (1 ligne) |
|---|---|---|---|---|
| S1 | `packages/monark/src/index.ts:12` | `export function crossAgentGate(_price, _prediction)` → `export const crossAgentGate: (price, prediction) => GateDecision = () => {…}` | no-unused-vars ×2 | Signature à 2 params portée par l'**annotation de type** (callers/typecheck inchangés) ; corps sans params ⇒ 0 param inutilisé ; stub **non gelé** (ADR-M003 D4), remplacé au Lot I. `crossAgentGate` n'est référencé nulle part ailleurs (grep). |
| S2 | `packages/hikae/src/l3-gate.ts:49` | `tool: GatedTool \| string` → `tool: string` | no-redundant-type-constituents | `string` absorbe les littéraux (union redondante) ; conforme au contrat **gelé** `GateDecision.tool: string` (contracts/src/types.ts:121) ; `GatedTool`/`GATED_TOOLS` restent exportés (D0). |
| S3 | `packages/hikae/src/s2/instrument.ts:299` | `set.includes(p.y as string)` → `set.includes(p.y)` | no-unnecessary-type-assertion | Le receveur (`string[].includes`) accepte déjà le type de `p.y`. |
| S4 | `packages/hikae/src/s2/instrument.ts:311` | `indicatorScore(p.yhat, p.y as string)` → `indicatorScore(p.yhat, p.y)` | no-unnecessary-type-assertion | Idem : receveur accepte le type d'origine. |
| S5 | `packages/hikae/src/s2/instrument.ts:449-451` | retrait de `as "up" \| "down"` **et** ajout de l'annotation de retour `base.map((p): LabeledPoint => …)` | no-unnecessary-type-assertion | L'`as` (signalé « inutile » par analyse **locale** de la règle) était en fait **porteur** : le retirer nu élargit le littéral `"up"\|"down"`→`string` dans l'inférence de l'objet spread (`{ ...p, y }`) ⇒ TS2322 (mesuré). L'annotation de retour restaure le **typage contextuel** sans assertion (une annotation n'est PAS une type-assertion). `error_origin` de la fausse-« unnecessary » = limite de la règle (ignore l'élargissement aval), consigné, non rustiné. |

Diffs de **fichiers de test** (hors « source de production » ; correction D9 ter §4, listés pour complétude) :
- `packages/hikae/test/contracts-integration.test.ts` : retrait du bloc d'import mort `{ generateLabeledSeries, runSplitCampaign, runMutants, demoStates } from "../src/index.ts"` (4 no-unused-vars ; chaque nom = 1 seule occurrence = l'import, grep). Les imports `runS2`, `buildVerdict`, … conservés.
- `packages/contracts/test/forbidden-keys.test.ts:47` : retrait de `as unknown as GateDecision` (no-unnecessary-type-assertion : le receveur `serializeGateDecision` accepte `bad`) **+** retrait de l'import devenu orphelin `import type { GateDecision } from "../src/index.ts"` (sinon nouveau no-unused-vars — `GateDecision` n'était utilisé QUE dans cette assertion ; ligne 41 « GateDecision » est une chaîne de nom de test, pas une référence de type).

**Oracles intermédiaires (rejouables)** : `npm run typecheck` **exit 0** (0 erreur, TS 6.0.3) ; `npm test` **79/79 pass, exit 0** ; `npx eslint . -f json` = **171** (= 79 no-floating-promises + 92 no-unsafe-*/no-explicit-any), **SRC = 0**, aucune nouvelle violation introduite (182 − 11 = 171). Les 92 no-unsafe-*/no-explicit-any (tous en test) restent = futur compte du cliquet.

## P3.3 — `eslint.config.mjs` : deux ajouts sanctionnés + source unique (D9 ter §2, §3)

Config **EXACTEMENT deux ajouts** au bloc `**/*.ts` et un bloc de test (rien d'autre ; logique recommendedTypeChecked inchangée) :
1. **§2** `@typescript-eslint/no-floating-promises` = `["error", { allowForKnownSafeCalls: [{ from: "package", name: ["test","describe","it"], package: "node:test" }] }]`. **Règle conservée en erreur** ; seuls les appels connus-sûrs `node:test` sont exemptés (pas une désactivation). Forme vérifiée P3.1.
2. **§3** bloc `files: ["**/*.test.ts", "test/**"]` avec `rules` = `off` sur les 6 règles — **dérivées de `lint-ratchet.json`** via `Object.fromEntries(ratchet.rules.map(r => [r,"off"]))` (import `./lint-ratchet.json` with `{ type: "json" }`). **Source unique** : la config (off) et le cliquet (réactivation/compte) ne peuvent diverger sur les 6 règles — élimine le trou silencieux « une règle off non suivie ».
- **`lint-ratchet.json` créé** (racine) : `{ ceiling: 92, measured_on: "2026-09-06", rules: [6 règles] }`. `ceiling=92` = agrégat **mesuré** en P3.0/P3.2 (les 6 règles = 34+30+15+9+3+1, toutes en test) ; re-confirmé par le cliquet en P3.6 (pas deviné).
- **Empirique (rejouable)** : `npm run lint` → **exit 0** (aucune sortie d'erreur). Prouve : (a) l'import JSON single-source **se charge** sous le loader ESLint 10 / Node 24 (`with { type: "json" }` supporté) ; (b) **no-floating-promises 79→0** — la règle N'EST PAS dans le bloc off, son 0 vient uniquement de `allowForKnownSafeCalls` (donc un floating-promise hors `node:test` rougirait encore) ; (c) 92 no-unsafe-*/no-explicit-any `off` sur les tests ; (d) 182 → **0**.

## P3.4 — Cliquet `scripts/lint-ratchet.mjs` + script npm (D9 ter §3)

- **`scripts/lint-ratchet.mjs`** (API Node `ESLint`, ESLint 10) : lit `lint-ratchet.json` ; construit `overrideConfig` réactivant les `rules` (6) EN ERREUR sur `["**/*.test.ts","test/**"]` (fusionné APRÈS eslint.config.mjs ⇒ inverse exact du bloc `off`) ; `lintFiles(["."])` ; **compte** les messages dont `ruleId ∈ rules` ; imprime `count/ceiling` ; **exit 1 si count > ceiling**.
- **Fail-closed (advisor)** : (a) `lint-ratchet.json` illisible/mal-parsé ⇒ exit 1 ; (b) `ceiling` non entier≥0 ⇒ exit 1 ; (c) `rules` vide/absent ⇒ exit 1 ; (d) tout message `fatal===true` ou `ruleId==null` (parse/config cassé) ⇒ imprime + exit 1. Sans (d), un config cassé donnerait 0 message → « 0/92 » → faux vert (gate décoratif).
- **Baisse** : `count < ceiling` = **pass** (exit 0) + NOTE « abaissez le plafond » (D9 ter « toute baisse abaisse le plafond ») ; seul `count > ceiling` échoue (consigne mission).
- **Script npm** : `"lint:ratchet": "node scripts/lint-ratchet.mjs"`.
- **MESURE (rejouable)** : `npm run lint:ratchet` → **`92/92` exit 0**. Le cliquet re-mesure **indépendamment** 92 (réactivation des 6 règles sur les tests, `overrideConfig`) ⇒ le plafond commis `ceiling=92` **est le compte mesuré**, pas un chiffre deviné.

## P3.5 — Job CI g4 + test 38 assertion (6) (D9 ter §3)

- **`.github/workflows/ci.yml`** — step g4 : `run: npm run lint && npm run lint:ratchet` (lint généraliste PUIS cliquet ; un seul step ⇒ le job échoue si l'un échoue ; `&&` court-circuite si `lint` rouge). Nom du step mis à jour.
- **`test/ci-gates.test.ts`** — test 38, **assertion (6)** : le job `g4-architecture:` doit exécuter `npm run lint:ratchet`. **Bloc-scopée** (comme (5) pour `on:`) : parcours des lignes jusqu'à la prochaine clé de job (2 espaces) ou clé racine (0), commentaires de fin de ligne retirés ⇒ déplacer `lint:ratchet` hors de g4 (autre job) ou en commentaire **rougit**. Code type-propre (`LINES: string[]`, `g4Block: string[]`, ops de chaîne typées, **aucun `any`**) ⇒ n'ajoute rien au compte du cliquet (re-mesuré **92**, §P3.6).
- **Mutant (6)** (rejouable) : sha256 ci.yml AVANT = `200247303dc248f8397b749922627035a3965b6ffdf283d9831052233d0b0900` ; retrait de `&& npm run lint:ratchet` du run g4 (`sed`) ⇒ `node --test test/ci-gates.test.ts` **ROUGE** sur l'assertion (6) exacte (message « le job g4 doit exécuter le cliquet `npm run lint:ratchet` »), `tests 2 / pass 1 / fail 1` ⇒ **(6) SEULE tue le mutant** (non-vacuité : (1)-(5) passent) ; restauration depuis copie ⇒ sha256 APRÈS = `200247303dc248f8397b749922627035a3965b6ffdf283d9831052233d0b0900` **identique**.

## P3.6 — Oracles de clôture (sortie complète, rejouable — sweep final propre)

| Oracle | Commande | Résultat |
|---|---|---|
| lint vert | `npm run lint` | **exit 0** (0 problème ; 182 → 0) |
| cliquet vert | `npm run lint:ratchet` | **`92/92` exit 0** |
| ci | `npm run ci` | **tests 79 / pass 79 / fail 0, exit 0** |
| typecheck | `npm run typecheck` | **0 erreur, exit 0** (TS 6.0.3) |
| test 38 (g4 ∋ lint:ratchet) | `npm test` | **pass** (assertion 6, non-vacuité §P3.5) |
| audit (g6, non régressé) | `npm audit --audit-level=high` | **exit 0** (0 vuln) |

**État de config résolu (`eslint --print-config`, réfute « la règle a été désactivée » — R-21)** :
- **SRC** (`packages/monark/src/index.ts`) : 6 règles no-unsafe-*/no-explicit-any = `error` (2) ; `no-floating-promises` = `[2, {allowForKnownSafeCalls:[{from:"package",name:["test","describe","it"],package:"node:test"}]}]`.
- **TEST** (`packages/contracts/test/schema.test.ts`) : 6 règles = `off` (0) ; `no-floating-promises` = **`error` (2)** — identique au SRC. ⇒ la règle no-floating-promises reste en erreur **partout** (D9 ter §2), seuls les appels `node:test` sont exemptés ; les 6 règles ne sont `off` **qu'en test** (D9 ter §3). Un floating-promise hors `node:test` (src OU test) rougirait.

**sha256 de l'état livré** : `lint-ratchet.json` = `f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa` ; `.github/workflows/ci.yml` = `200247303dc248f8397b749922627035a3965b6ffdf283d9831052233d0b0900` ; `eslint.config.mjs` = `e420bfe534cf2a425a049f34b431fd00a271cbcb4627b31e23552a8a41bf64a6` ; `scripts/lint-ratchet.mjs` = `c8d671a4ead60aa30ab95d6f43d4b1713ae02f8f8dd03d07f4ebdf0af54d709d`.

## P3.7 — Mutant du cliquet (rejouable)

- sha256 `lint-ratchet.json` AVANT = `f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa` ; abaissement `ceiling` **92→91** (compte−1) ⇒ `npm run lint:ratchet` imprime `92/91`, `::error:: … 92 > plafond 91`, **exit 1** ; restauration **91→92** ⇒ sha256 APRÈS = `f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa` **identique** ; re-run `92/92` exit 0. Prouve : (a) le compte (92) est **indépendant du plafond** (affiché 92 quand plafond=91 ⇒ pas un « lu-en-retour » du plafond) ; (b) le cliquet **échoue** sur hausse de dette ; (c) restauration byte-exacte.

## P3.8 — R-25 auto-mesure (méthode §S11, vs merge-base HEAD `fee3bf9`)

- **Piège écarté** (comme §S6) : `main` est **9 commits en AVANT** de HEAD (`git rev-list --count HEAD..main` = 9 ; `git merge-base main HEAD` = `fee3bf9` = HEAD ; `git log main..HEAD` = 0). Mesurer vs `main` serait pollué (contenu d'avance de main compté en suppressions + livrables non suivis ignorés). Mesure **honnête vs HEAD**.
- `git add -N .` ; `git diff --shortstat HEAD -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)package-lock.json'` ; `git reset` :

```
16 files changed, 900 insertions(+), 50 deletions(-)
```

**950 lignes** (900+50), hors artefacts S2 et lockfile, **≪ borne 1205 (D9)**. `package-lock.json` **inchangé par la Passe 3** (aucune installation : la toolchain était déjà posée en Passe 2 ; seul ajout = le script npm `lint:ratchet`). Numstat (whole-lot ; le src n'a été touché qu'en Passe 3) : ci.yml +82/-16 · docs/G1-lot-V.md +329 · enforcement/lint-model-pinning.sh +143 · eslint.config.mjs +60 · lint-ratchet.json +12 · package.json +11/-3 · **(src)** l3-gate.ts +1/-1 · instrument.ts +4/-4 · monark/src/index.ts +5/-2 · **(test)** contracts-integration.test.ts −6 · forbidden-keys.test.ts +1/-2 · monark/package.json +1/-1 · scripts/grep-forbidden.mjs +40/-13 · scripts/lint-ratchet.mjs +91 · test/ci-gates.test.ts +111 · vocab-banned.json +9/-2.

## P3.9 — Périmètre source, supersession, zéro dette

- **Source de PRODUCTION touchée en Passe 3 = les 3 fichiers des 6 violations, rien d'autre** : `packages/monark/src/index.ts` (S1, 2 no-unused-vars), `packages/hikae/src/l3-gate.ts` (S2, 1 no-redundant-type-constituents), `packages/hikae/src/s2/instrument.ts` (S3-S5, 3 no-unnecessary-type-assertion). Les autres fichiers modifiés du worktree sont soit **tests** (contracts-integration, forbidden-keys — D9 ter §4), soit **config/CI/scripts/docs**, soit **hérités des passes 1-2** (grep-forbidden.mjs, vocab-banned.json, monark/package.json, enforcement/ — non touchés en Passe 3). Chaque diff src justifié P3.2 (tableau S1-S5).
- **Supersession (jamais réécriture)** :

| Section antérieure | État antérieur | Nouvel état (Passe 3) |
|---|---|---|
| §S9 pendant « périmètre des 182 violations » | escaladé, non tranché | **CLOS** — tranché par ADR-M003 addendum D9 ter (2026-09-06), appliqué ici : lint 0, cliquet 92/92 |
| §S9-A (79 no-floating-promises) | à trancher (ADR) | **Résolu** par `allowForKnownSafeCalls` node:test (D9 ter §2), règle conservée en erreur (P3.6) |
| §S9-B (103 « code », dont 6 src) | choix de périmètre | **Résolu** : 6 src + 5 test corrigées (P3.2) ; 92 no-unsafe/any en test `off` + **cliquet** (D9 ter §3) |
| §0/§S0 ligne « lint » | rouge 182 | **VERT** (exit 0) — job g4 = `npm run lint && npm run lint:ratchet` |

- **Zéro dette nue** — pendants **FORMÉS** restants (aucun « dû » nu) :
  - **Pendant formé, inscrit dans l'ADR (D9 ter §3)** : typage des fixtures de test (parse + validation ajv typée), un lot par package (S, I, K), **objectif plafond cliquet = 0 avant le checkpoint 2 de la Phase 3**. Le cliquet **borne** la dette (ne peut croître) et invite à la baisse à chaque réduction — pas un contournement, une trajectoire commise et mécaniquement gardée.
  - **Pendant investisseur (i) — inchangé** (hérité passes 1-2, hors périmètre worker) : dépôt distant + clé de signature + hébergement ≤ 2026-09-10 (ADR-M003 D0.3/D1) ; le worker ne crée aucun remote, ne pousse rien, ne signe rien (R-20).
- **error_origin** : D9/D9 ter = orchestrateur (D9 n'avait anticipé ni l'idiome `node:test` ni le coût des fixtures non typées) ; l'`error_origin` de la fausse-« unnecessary » sur instrument.ts:451 = **limite de règle** (no-unnecessary-type-assertion, analyse locale ignorant l'élargissement aval) — consigné P3.2 S5, corrigé sans rustine.

---
*Fin Passe 3 — D9 ter (Lot V). Worker `claude-opus-4-8[1m]`, effort max. Chaque chiffre/SHA/hash est rejouable par la commande citée (R-21). Le worker ne committe pas (R-20) ; verdict G7, relecture G2 delta (D10bis) et acceptation checkpoint = orchestrateur/validateur. Aucun secret, aucun remote, aucun push.*

---
### Addendum P3.10 (véracité R-21, post-sweep) — 2026-09-06

Vérification finale : `grep -riE eslint-disable` sur le worktree (hors node_modules) a d'abord signalé **1** occurrence — une mention EN PROSE dans le commentaire de `packages/monark/src/index.ts` (« no eslint-disable »), **jamais une directive** : ESLint ne traite comme directive qu'un commentaire *débutant* (après trim) par `eslint-disable`/`eslint-enable` ; celui-ci débute par « no ». Confirmé mécaniquement : `npx eslint . --report-unused-disable-directives` **exit 0** (aucune directive fantôme), `npx eslint packages/monark/src/index.ts` = **0 violation** (rien n'était supprimé). Reformulé « no eslint-disable » → « no rule suppression » pour lever toute ambiguïté de grep adversarial. Après reformulation : `grep -riE eslint-disable` = **0** ; oracles inchangés (typecheck 0, `npm run lint` 0, cliquet 92/92, `npm test` 79/79). Diff = commentaire seul (index.ts), sans effet sémantique ni sur le décompte R-25 (±0 ligne : substitution 1 mot).

Contrôles supplémentaires de clôture (rejouables) : `continue-on-error` en directive dans le workflow = **0** (test 38 assertion 1) ; fail-closed du cliquet non-vacue : `lint-ratchet.json` retiré ⇒ `npm run lint:ratchet` **exit 1** (« lecture/parse … impossible … Fail-closed »), fichier restauré byte-exact (sha256 `f47ff292…` avant/après).

**Couplage de config (par conception, à signaler à la revue G2)** : `eslint.config.mjs` importe `./lint-ratchet.json` (source unique des 6 règles). Conséquence mesurée : si ce JSON est absent/mal formé, **`npm run lint` lui-même échoue** au chargement de config (`ERR_MODULE_NOT_FOUND: Cannot find module 'lint-ratchet.json' imported from eslint.config.mjs`, exit 2), pas seulement le cliquet. C'est **fail-closed et voulu** (aucune divergence config/cliquet possible ; endossé advisor). Vérifié rejouable : retrait de `lint-ratchet.json` ⇒ `npm run lint` exit 2 ; restauration byte-exacte (sha256 `f47ff29294e7a62975475823df14ff7b92ea477f52a48dbb1fcc2b91cb7e1dfa` avant/après) ⇒ `npm run lint` exit 0.

# Passe 4 — corrections G2 (réserves 1 et 3) — ÉCRITE PAR L'ORCHESTRATEUR EN SIÈGE WORKER (ADR-M003 D10, option (a))

- **Modèle résolu de l'écrivain (R-1)** : `claude-fable-5-1` (orchestrateur). Déclencheur D10 : deux morts de workers `claude-opus-4-8` sur limite d'usage sur ce lot (passe 2 en fin de course, 2026-09-05 ; passe 4 à l'orientation, 2026-09-06, zéro travail).
- **Incident orchestrateur (error_origin = orchestrateur)** : lors de la restauration d'un mutant, un `git checkout -- .github/workflows/ci.yml` a **écrasé la version non commitée du Lot V** (sha256 revue G2 `200247303dc248f8…`) par la version HEAD Phase 0. Aucun blob git ni transcript ne la contenait. Le fichier a été **réécrit à la spécification** documentée (G1 §A/§S7/§P3, G2 point 1 : 5 jobs, 8 `uses:` épinglés, limite 1205, pathspec, `on: pull_request`, g4 `lint && lint:ratchet`, g1 script vendorisé) + D9 quater, **en anglais (D0.5)**. Leçon consignée : restauration de mutant **par copie de fichier** uniquement, jamais `git checkout` sur un arbre non commité (règle déjà appliquée par le relecteur G2 K, désormais impérative).
- **Corrections appliquées** : (1) pathspec r25 += `':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md'` + assertion (4bis) test 38 ; (2) assertion (7) test 38 : ligne littérale `run: npm run lint && npm run lint:ratchet` dans g4. Le décompte awk du job lit désormais `--shortstat` (insertions + deletions, 0 si absent) — vérifié sur deux entrées.
- **Oracles** : `npm test` 79/79 ; `npm run ci` vert (vocab 35 fichiers) ; `npm run lint` 0 ; `npm run lint:ratchet` 92/92 ; **6 mutants** sur ci.yml (`&&`→`||` ; retrait pathspec G1 ; `pull_request`→`push` ; SHA→tag ; 1205→1300 ; `continue-on-error: true` inséré) ⇒ chacun `fail 1` ; restauration par copie, sha256 `130115d27872273f…` avant = après.
- **R-25 (nouveau pathspec, méthode §S11)** : `15 files changed, 583 insertions(+), 53 deletions(-)` ⇒ **636 ≪ 1205**.
- **Reste** : relecture G2 delta par `claude-opus-4-8` (D10 condition 2) avant G7 ; réserve 2 (English only du reste du lot : eslint.config.mjs, lint-ratchet.mjs, ci-gates.test.ts) → lot transverse E.
