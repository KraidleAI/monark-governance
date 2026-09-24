# G0 — LANG-GATE-CI (petit lot : `lang:gate` fail-closed en CI, épinglé par test) — DRAFT (proposé)

**Provenance** : worker `claude-opus-4-8[1m]`, effort max (R-1 : préfixe `claude-opus-4-8` conforme ; Opus 5 banni, non utilisé). **Date** 2026-09-21. **Base** `lot/etude-suite` HEAD `430e99d`. **Réviseur** = orchestrateur (Fable 5.1). **Statut** : DOCS-ONLY, tout est **proposé** — le G1 implémente, la G2 vérifie adversarialement (R-21). **Miroir exact** du lot CI-EXPORT-CHECK (`docs/G7-lot-ci-export-check.md`, `docs/G2-lot-ci-export-check.md` [lu]). Sources : toutes [lu] première main (fichiers du dépôt + mesures locales, cf. `MESURES.md`).

---

## 1. Objet

Câbler `lang:gate` (gate de langue anglais-only fail-closed du dépôt source, ADR-M004 D7 — `scripts/lang-gate.mjs` en-tête [lu]) **en CI**, épinglé par un test non-LLM, **miroir exact** de CI-EXPORT-CHECK. Ferme l'item CHANTIERS « `lang:gate` absent de CI » (CHANTIERS:222 / :313 / :587 [lu] ; déclencheur *avant la fenêtre publique* ; propriétaire orchestrateur). **AUCUN** changement au scope de `lang:gate` ni à `scripts/lang-exempt.json` — tout élargissement de scope/exemption est **un autre lot** (contrainte de mission).

État mesuré de départ (cf. `MESURES.md`) : `npm run lang:gate` (global, sans `--scope`) sort **exit 0** sur `430e99d`, **12 scopes GATED à 0 hit** ; **418 fichiers scannés** (421 collectés `.ts/.tsx/.mjs/.md/.yml/.json/...` moins 3 path-exempt whole-file : les fixtures Shogen `fixtures/s3-binance.{constat.json,registre.txt,verdict.txt}`).

---

## 2. Livrable unique

**Une** étape `lang:gate` ajoutée au job `r25-taille-de-lot` de `.github/workflows/ci.yml`.

- **Placement PROPOSÉ** : dans le job `r25` (ci.yml:34-88 [lu]), **avant** l'étape `export:check` existante (ci.yml:87-88), **après** le `setup-node` déjà présent (ci.yml:84-86, node 24 — ajouté par CI-EXPORT-CHECK). `lang-gate.mjs` est **zéro-dépendance** (built-ins node + `./lang-gate.mjs` ; en-tête ligne 2 [lu]) ⇒ `setup-node` seul suffit, **pas de `npm ci`** (même régime qu'export:check, ci.yml:82-83).
- **Forme proposée** (anglais, ASCII pur — cf. §8 contrainte de self-scan) :
  ```yaml
        - name: Language gate (source-repo English-only invariant, ADR-M004 D7; internal, stripped from the public workflow)
          run: npm run lang:gate
  ```
  (Un court commentaire d'une ligne peut précéder, en anglais ASCII, sans mot `FR_WORDS`/`gate:vocab` banni — cf. §8.)

- **Motif de l'ORDRE (`lang:gate` avant `export:check`)** : `scripts/export-public.mjs:28` **importe** `scripts/lang-gate.mjs` (`loadExempt, scanFile, isFileFrench, classifyScope, scannable, pathExempt, SCOPES` [lu]) — `lang-gate` est le module de **plus bas niveau** ; faire tourner le gate du module importé d'**abord** fait remonter un résidu français comme un échec `lang:gate` **précis** (`fichier:ligne:col:token`) AVANT le contrôle d'hygiène du miroir dérivé qui s'appuie dessus. **Honnêteté** : l'ordre **n'est PAS forcé à l'exécution** (les deux sont des scripts node indépendants, zéro-dépendance ; aucune sortie runtime de l'un n'alimente l'autre) — c'est un ordre de **diagnostic** (superposition), pas une dépendance. La G2 peut **accepter l'un ou l'autre ordre sans correction**.

- **Motif du PLACEMENT (job `r25`)** : `r25` est le **seul** job retiré du workflow public par `derivePublicWorkflow` (export-public.mjs:397, strip :410 [lu] : supprime **exactement** la clé `  r25-taille-de-lot:` jusqu'à la prochaine clé de job 2-espaces). Y co-localiser `lang:gate` — comme `export:check` — garde ce gate d'hygiène **source** hors du workflow storefront dérivé (bucket « internal concern, not a storefront one », ci.yml:82 [lu]) ; toute étape dans un job **retenu** (g1/g3/g4/g6/g3-site) serait recopiée **byte-identique** dans le miroir (test 42(f'), cité par G2 §2 [lu]).
  - **Différence honnête d'avec export:check (à NE PAS sur-copier)** : `export:check` est **forcé** en `r25` parce qu'il **ROUGIT** sur le miroir (sa config `scripts/export-exclude-tests.json` n'est pas whitelistée ⇒ fail-closed, G2 §2 mesuré [lu]). Pour `lang:gate`, ce forçage-par-rouge-miroir **ne tient a priori PAS** : `package.json` est whitelisté **byte-identique** (export-public.mjs:65 [lu]) et `scripts/lang-gate.mjs` + `scripts/lang-exempt.json` embarquent (ligne 70 [lu]), donc `npm run lang:gate` tournerait **sur le miroir** (anglais-only) et sortirait **probablement 0** (pas de rouge). Le placement `r25` repose donc sur la **doctrine** (internal-concern + symétrie CI-EXPORT-CHECK), **pas** sur un rouge-miroir. → **Mesure G1** (item de mesure, pas une dette) : reproduire CI-EXPORT-CHECK G2 §2 pour `lang:gate` (placer temporairement l'étape dans un job retenu, `export --out`, inspecter le workflow miroir + rejouer `npm run lang:gate` dessus) et **consigner** le comportement réel du miroir avant de figer le placement.

---

## 3. Test imposé — `ci_runs_lang_gate`

Miroir de `ci_runs_export_check` (`test/ci-gates.test.ts:201-249` [lu]) dans sa forme **CORRIGÉE (post-C-1)**, donc les **4 mêmes assertions**, block-scopées sur `r25` :

1. **Présence** : `r25Block.some((l) => /^\s*run:\s*npm run lang:gate\s*$/.test(l))` — regex ancrée, commande exacte.
2. **Fail-closed COE** : `!hasDirective(r25Block, COE_DIRECTIVE_RE)` (block-scopé r25).
3. **Fail-closed SKIP** : `!hasDirective(r25Block, IF_DIRECTIVE_RE)` (block-scopé r25) — **tue les 4 formes de `if:`** (le RE ancre sur la **clé** `if:`, indépendant de la valeur, ci-gates.test.ts:60 [lu]) : `if: false`, `if: ${{ false }}`, `if: github.event_name == 'never'` (sur l'étape) et `if:` **au niveau job**.
4. **Chaîne package.json** : `pkg.scripts["lang:gate"] === "node scripts/lang-gate.mjs"` (package.json:23 [lu]) — épingle les deux bouts (ligne CI ↔ script), aucun ne peut dériver en silence.

**Block-scoping** : réutiliser l'idiome r25 (`LINES.findIndex(l => /^  r25-taille-de-lot\s*:/.test(l))` → prochaine clé 2-espaces ou colonne 0, ci-gates.test.ts:205-211 [lu]) ; `hasDirective` / `IF_DIRECTIVE_RE` / `COE_DIRECTIVE_RE` sont **déjà en portée module** (ci-gates.test.ts:60-66 [lu]) — rien à ré-écrire.

**Redondance DÉCLARÉE (à énoncer au G1, sinon correction G2)** : les assertions **(2)** COE et **(3)** `if:` de `ci_runs_lang_gate` sont **redondantes** avec `ci_runs_export_check` (2)/(2bis) — les deux tests scannent le **même** `r25Block` — **et** avec test 38 (file-wide). Le contenu **non-redondant** propre du nouveau test est **(1) présence de `lang:gate`** + **(4) chaîne `package.json`**. On **garde** (2)/(3) quand même, pour : (a) **symétrie** avec le test modèle, (b) **contrat auto-suffisant** du test si `ci_runs_export_check` est un jour refactoré/retiré. Précédent : la G2 du modèle (§3 [lu]) a **accepté** la garde COE de `ci_runs_export_check` comme « redondante avec test 38 » sur exactement cette base — la redondance **déclarée** est licite ; c'est la redondance **tue** qui est une correction G2.

**Propriété héritée (à énoncer)** : parce que le test copie la forme **post-C-1**, la garde `if:` block-scopée existe **dès le départ** — le « **trou M5a** » du modèle (où `if: false` au niveau **job** laissait `ci_runs_export_check` **VERT** avant la correction C-1, G2 §3/§4 [lu]) **n'existe JAMAIS** dans ce lot ; **aucune G2-delta** n'est requise pour l'ajouter. Les contrôles discriminants (shell `if [ … ]`, awk `{ if($i ~ …`, `if-no-files-found:`, `if` dans un `name:`, `#`-commentaire) restent verts — mêmes contrôles que test 38 (ci-gates.test.ts:86-104 [lu]) ; ils sont dans le bloc r25 mais ne portent pas de `:` après `if`, donc pas de faux-rouge (G2-mesuré [lu]).

---

## 4. Mutants nommés (attendus — **à mesurer au G1**, arbre isolé, restauration byte-exacte `sha256==3b015ce3…5c4f`)

**Fait load-bearing** : `ci_runs_export_check` **et** `ci_runs_lang_gate` block-scopent le **MÊME** `r25Block` (tout le corps du job r25). Un mutant COE/`if:` sur l'étape `lang:gate` (ou sur le job) tombe donc dans le bloc lu par **les deux** tests ⇒ il rougit **les deux** + test 38 file-wide ⇒ **#fail = 3** (redondance **déclarée**, cf. §3, pas une double-comptabilité fortuite). Les mutants qui ne touchent que la **présence** de la ligne `lang:gate` (M1/M3/M4) ne rougissent que `ci_runs_lang_gate` (l'assert de présence d'`export:check` trouve toujours **sa** ligne) ⇒ **#fail = 1**.

| Mutant | test 38 | `ci_runs_export_check` | `ci_runs_lang_gate` | #fail | assertion(s) touchée(s) |
|---|---|---|---|---|---|
| **M1** étape `lang:gate` **retirée** | PASS | PASS | **FAIL** (1) | **1** | présence lang:gate ; export:check intact |
| **M2** `continue-on-error: true` sur l'étape lang:gate | **FAIL** | **FAIL** (2) | **FAIL** (2) | **3** | COE dans r25Block ⇒ 2 tests block-scopés + test 38 |
| **M3** étape lang:gate **commentée** (`#`) | PASS | PASS | **FAIL** (1) | **1** | présence (regex n'accroche pas le commentaire) |
| **M4** commande → `echo` (`run: echo skip`) | PASS | PASS | **FAIL** (1) | **1** | présence (regex exige `npm run lang:gate`) |
| **M5** `if: false` sur le **JOB** r25 | **FAIL** | **FAIL** (2bis) | **FAIL** (3) | **3** | `if:` dans r25Block ⇒ 2 tests block-scopés + test 38 |
| **D1** `if: false` sur l'**étape** lang:gate | **FAIL** | **FAIL** (2bis) | **FAIL** (3) | **3** | idem |
| **D2** `if: ${{ false }}` sur l'étape lang:gate | **FAIL** | **FAIL** (2bis) | **FAIL** (3) | **3** | idem |
| **D3** `if: github.event_name == 'never'` sur l'étape lang:gate | **FAIL** | **FAIL** (2bis) | **FAIL** (3) | **3** | idem |
| **baseline** (restauré) | PASS | PASS | PASS | **0** | — |

> **Note M5a** : contrairement au modèle (où M5a `if: false` **job-level** laissait `ci_runs_export_check` VERT avant C-1 — le trou §3 de la G2), ici **M5 rougit `ci_runs_lang_gate`** car la garde `if:` block-scopée est présente dès l'origine (§3). Aucun mutant « survivant » attendu. **Ces `#fail` sont des attendus à MESURER au G1** : un écart mesuré (p. ex. #fail=2 là où on annonce 3) est à traiter comme « annoncé ≠ mesuré » (classe C-3 du modèle) — d'où la colonne `ci_runs_export_check` explicite.

Discipline mutants (héritée du modèle, G2 §4 / §En-tête [lu]) : arbre isolé (`git archive HEAD` → répertoire temp hors dépôt, jonction `node_modules` **retirée** avant tout effacement), **jamais** `git checkout`/`stash`, **jamais** `npm ci`, restauration `sha256` vérifiée après chaque mutant.

---

## 5. Tuyaux (règle Branchement)

- **Entrée** : `npm run lang:gate` (script existant, package.json:23 = `node scripts/lang-gate.mjs` [lu]) invoqué par le **job CI r25** de `.github/workflows/ci.yml`.
- **Sortie** : **statut de la PR** — le job r25 rougit le check de la PR si un hit français **non-exempté** tombe dans un scope gaté (exit 1) **ou** sur erreur d'usage (exit 2 : `lang-exempt.json` absent / scope inconnu, lang-gate.mjs:302-305/311 [lu]) — tout non-zéro = **red**, fail-closed comme export:check.
- **État** : **câblé localement** ; **servi au premier run réel sur runner Linux** (item CHANTIERS **existant** :222 / :313 [lu], propriétaire orchestrateur — pas une dette neuve). D'ici là, la composition est **rejouée localement** au G2 (idiome g3-site, ci.yml:148-150 [lu] : « Wired LOCALLY … never validated by these merges »).
- **Test qui prouve la composition** (non-LLM) : `ci_runs_lang_gate` rejoue la chaîne `ci.yml` (ligne `run:`, block-scopée r25) ↔ `package.json` (`scripts["lang:gate"]`) ↔ `scripts/lang-gate.mjs`. Oracle d'exécution : `npm run lang:gate` = **exit 0** mesuré (§1).

---

## 6. R-25 estimé

- `.github/workflows/ci.yml` : **+1 étape** (`name:` + `run:`) + court commentaire ⇒ **~6 lignes** ajoutées, 0 supprimée (setup-node réutilisé, ci.yml:84-86 ; aucun autre changement — la ligne pathspec R-25 ci.yml:65 reste **intacte**).
- `test/ci-gates.test.ts` : `ci_runs_lang_gate` ≈ miroir de `ci_runs_export_check` (49 lignes, 201-249) ⇒ **~49 lignes**.
- **Total CODE R-25 estimé ≈ 55** (fourchette ~50-70 selon le verbatim du commentaire). G0/ADR en `docs/**/*.md` **exclus** du R-25 (ci.yml:59-61 pathspec `:(exclude,glob)docs/**/*.md` [lu]).
- **≈ 55 < 1 205** (borne ADR-M003 D9) **et < 300** ⇒ **régime « petit lot »** (décision 116, citée G7 CI-EXPORT-CHECK:6 [lu]) : **G1 + G2 seulement, pas de checkpoint-2** (rien de servi/réseau/argent/secret/prix touché). *(Réf. modèle : R-25 réel = 89 avec le pli des commentaires ; ce lot n'a pas de C-2-like périmé à corriger ⇒ vraisemblablement plus bas.)*

- **Artefact ADR (à trancher par l'orchestrateur ; hors R-25 car `docs/**/*.md`)** : le modèle a amendé **ADR-M004** (D7 septies) pour `export:check`, et le nom d'étape `export:check` cite cet addendum (ci.yml:87 [lu]). Par **symétrie**, ce lot devrait écrire un **addendum daté ADR-M004** (p. ex. « D7 octies » / note datée sous D7) déclarant « `lang:gate` runs in CI, job r25, stripped from the public workflow » **avec les tuyaux du §5** (règle Branchement : l'ADR de pièce déclare entrée/sortie/état/test) — le nom d'étape proposé cite déjà `ADR-M004 D7`. **Alternative** : ce G0 tient lieu d'ADR du petit lot. **Recommandé** : l'addendum ADR-M004 (cohérent avec export:check ; G1 sait alors quel fichier toucher : `docs/adr/ADR-M004-infrastructure-plateforme.md` [lu, existant]).

---

## 7. Oracle

**Chaîne imposée** (worktree du lot, mission) :
```
npm run ci && npm run lint && npm run lint:ratchet && npm run lang:gate
```
- `npm run ci` = `gate:vocab && typecheck && test` (package.json:20 [lu]) ⇒ `ci_runs_lang_gate` (dans `test/ci-gates.test.ts`) tourne sous `npm test ⊂ npm run ci`, et `gate:vocab` (mots probatoires nus) est **couvert** — §F-gate-vocab:132 [lu] (le pli/la delta le relancent explicitement de toute façon, rapide, sans oracle concurrent).
- **+ `npm run export:check`** en **no-regression** (on édite **son** job r25 ; belt-and-suspenders — attendu exit 0, inchangé).

---

## 8. Critères d'acceptation (proposés)

1. `ci_runs_lang_gate` **présent**, ses 4 assertions **vertes** en baseline ; les 8 mutants (§4) **rouges** comme tabulés (M5 inclus, aucun survivant), restauration `sha256` OK.
2. Oracle §7 : **chaîne exit 0** ; `npm run lang:gate` = **exit 0**, 12 scopes / 0 hit, ~418 fichiers.
3. **Self-scan clean (contrainte load-bearing)** : les lignes **ajoutées** à `ci.yml` **et** à `test/ci-gates.test.ts` sont **anglais + ASCII pur**, **sans collision `FR_WORDS`** (piège mesuré : `par`, `sur`, `sous`, `pour`, `est`, `tout`, `le`, `la`, `des`, `une` — lang-gate.mjs:62-95 [lu]) **ni diacritique** — sinon `lang:gate` **se rougit lui-même** (`.github/*.yml` et `test/*.ts` sont **scannés** : `SKIP_DIRS` exclut `docs` mais **pas** `test`/`.github`, lang-gate.mjs:99-105 [lu]) — et **aucun mot `gate:vocab` banni** (partner/autonomous/guarantee/verified/score/accuracy/confidence) dans les lignes ajoutées.
4. **Aucun changement** au scope `lang:gate` ni à `lang-exempt.json` (diff = seulement `ci.yml` + `test/ci-gates.test.ts` [+ ADR/G-docs]).
5. R-25 ≤ 1 205 (attendu ~55), régime petit lot confirmé.
6. **Blast radius r25 vert** (§11) : `ci_runs_export_check`, test 38, `ci_jobs_have_timeout_and_test_flags_locked`, les tests de pathspec d'exclusion r25, et `lang-gate-routing.test.ts` restent **verts**.

---

## 9. Ce qui FERME / ce qui RESTE

**Ferme** :
- Item CHANTIERS « `lang:gate` absent de CI » (CHANTIERS:222 / :313 ; « **reste formé : `lang:gate` en CI** » à :587 [lu] ; déclencheur *avant la fenêtre publique*, propriétaire orchestrateur).

**Reste (items existants, NON ouverts par ce lot — pas des dettes neuves)** :
- **Premier run réel sur runner Linux** (CHANTIERS:222 / :313 [lu] ; résiduel : casse d'import invisible sous Windows — ici **faible** car `lang-gate.mjs` est du `node:fs` pur, mais la preuve Linux reste un item séparé).
- **`g3-site` required status check** (protection de branche = action **sortante** de l'orchestrateur, hors dépôt/hors-réseau ; CHANTIERS:313, G2 Observation C [lu]) — pré-existant, pas ce lot.
- **Mesure G1** du comportement miroir d'un placement en job retenu (§2, reproduction G2 §2) — item de **mesure**, consigné, pas une dette.
- **Re-mesure `timeout-minutes`** de r25 (CHANTIERS:313 [lu]) : `lang:gate` local ≈ **0,6 s** (`MESURES.md`) ⇒ `timeout-minutes: 5` de r25 (ci.yml:36 [lu]) tient avec **large** marge (règle « wall-time ×3, cap ≤ 20 ») ; à re-confirmer au premier run Linux.

---

## 10. Contrainte d'ordonnancement (à écrire dans le G0)

Ce lot **touche `.github/workflows/ci.yml`**. Le lot **GARDE-HELIUS-2b-ii** (grep CI sur `apps/sentinel/src/ukemi/**`) touchera **aussi** `ci.yml`. Pour éviter deux worktrees éditant `ci.yml` en parallèle (piège mesuré des commits récents : worktrees gelés, jonctions `node_modules`) :

> **LANG-GATE-CI doit FUSIONNER AVANT l'ouverture du worktree GARDE-HELIUS-2b-ii** (2b-ii : petit, R-25 ≈ 90). Séquence : LANG-GATE-CI (G1 → G2 → fusion `--no-ff` par l'orchestrateur) **puis** ouverture 2b-ii.

---

## 11. Tests lecteurs de `ci.yml` — blast radius r25 (proposé pour le G1)

Ajouter **une étape** au bloc r25 impacte les tests qui lisent ce bloc ; tous restent **verts** (raison mesurée) :

| Test (test/ci-gates.test.ts) | Lit quoi | Impact d'un `lang:gate` step |
|---|---|---|
| `ci_runs_export_check` (201) | `r25Block`, présence export:check, absence directives, `r25Block.length>0` | **vert** — pas de compte d'étapes ; nouveau step sans `if:`/COE |
| `ci_gates_blocking_no_continue_on_error` (test 38, 68) | file-wide COE/`if:`/SHA `uses:` | **vert** — step sans directive ; **pas** de nouveau `uses:` (setup-node réutilisé) |
| `ci_jobs_have_timeout_and_test_flags_locked` | job-level `timeout-minutes ≤ 20` par job | **vert** — **aucun compte d'étapes** (« 4 steps » de la G2 = prose, pas une assertion) ; r25 garde `timeout-minutes: 5` |
| Pathspecs d'exclusion r25 (`series_pinned…`, ~1216-1287) | la **ligne** `git diff … :(glob)…` (ci.yml:65) | **vert** — ligne pathspec **intacte** |
| `lang-gate-routing.test.ts` (`classifyScope`/`SCOPES`) | `scripts/lang-gate.mjs` (imports) | **vert** — **aucun** changement de scope/classifyScope |

*(Fin du G0 DRAFT — proposé. Le G1 fige la forme exacte + mesure les mutants ; la G2 vérifie adversarialement.)*
