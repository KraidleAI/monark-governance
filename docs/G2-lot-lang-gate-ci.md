# G2 — Petit lot LANG-GATE-CI (MONARK) — revue indépendante (contexte frais)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme, effort max. Opus 5 banni, non utilisé.
**Date** : 2026-09-21. **Régime** : petit lot (décision 116 : G1 + G2, **pas de checkpoint-2** — cette revue est la SEULE vérification indépendante, adversariale ; tout a été RE-EXÉCUTÉ, rien lu sur parole). **Base** `4ee3285e869bedf580fd29acaf00f134f884f37c` (== merge-base du lot), **HEAD** `57b9e1b30a8642f833bb064cf7080ad4fe622ad8` (`lot/lang-gate-ci`). **R-20** : aucune écriture dans un dépôt, aucun commit, aucun workflow, aucun réseau, rien sur `C:`. Tout artefact sous `F:\tmp\g2-langgate\`.
**Arbre isolé** : `F:\tmp\g2-langgate\tree` = `git archive 57b9e1b` (`.gitattributes` sans `export-ignore` — vérifié : le jeu de fichiers de l'archive == arbre commité == checkout CI). `node_modules/@monark/*` = symlinks vers cet arbre.

Provenance byte-exacte confirmée — les 3 fichiers livrés dans l'arbre == `DELIVERED.sha256` :
- `.github/workflows/ci.yml` = `468e17b632729b875a588fc2e590754444cdf3f908dc1919a6e6222553470460`
- `test/ci-gates.test.ts` = `12b193df270ca43995ede5163d7d2ef2c8d0bae71090384c055ca42870d9344e`
- `docs/adr/ADR-M004-infrastructure-plateforme.md` = `12a75923cd4357813a40da4d10a1d2a7f9ecf058b42df593cd972c3c394e0db9`

Périmètre du diff `4ee3285..57b9e1b` (= exactement le lot, 1 commit) : **3 fichiers** — `ci.yml` (9/0), `test/ci-gates.test.ts` (69/2), `docs/adr/ADR-M004-…md` (53/0). **AUCUN** autre fichier.

---

## VERDICT : **PASS**

Le lot est correct **tel que livré** : oracle intégralement vert (reproduit), R-25 = 80 (reproduit), les **8 mutants G0** rougissent au `#fail` annoncé, mes **3 mutants propres** (block-scoping / regex ancrée / garde `if:` value-indépendante) rougissent comme raisonné, restauration byte-exacte prouvée après chacun. Le test `ci_runs_lang_gate` naît **post-C-1** (garde `if:` block-scopée dès l'origine) — le lot modèle CI-EXPORT-CHECK avait obtenu PASS-AVEC-CORRECTIONS pour un **vrai trou de code** (C-1, garde `if:` absente) ; **ce trou n'existe pas ici**, donc aucune correction de code. Deux items **NON BLOQUANTS** sont formés (§CORRECTIONS) : C-G-1 confirme un item déjà formé par le worker (avec ma reproduction indépendante) ; C-G-2 est une précision de chiffre (figure « ~418 » vs 414 mesuré). Aucun n'est un défaut du code livré ⇒ ni FAIL, ni downgrade. **En prime** : le C-3 du modèle (em-dash non-ASCII en commentaire de test + RENDU sur-affirmant) **ne se reproduit pas** — 0 octet non-ASCII dans les lignes de test ajoutées.

---

## 1. Oracle re-exécuté — codes capturés DIRECTEMENT (`> log 2>&1; echo $?`, jamais après un pipe)

| Commande | exit | note mesurée (première main, arbre isolé) |
|---|---|---|
| `npm run gate:vocab` | **0** | `gate:vocab OK — scanned 203 file(s), no forbidden claim.` |
| `npm run typecheck` | **0** | `tsc --noEmit` propre |
| `npm run test` | **0** | `ℹ tests 745 / pass 744 / fail 0 / skipped 1` — le skip = `fetch_only_inside_client` (pré-existant, « until 1b », aucun skip ajouté). Aucun `not ok`. |
| `npm run lint` | **0** | eslint |
| `npm run lint:ratchet` | **0** | `lint-ratchet: 69/69` (inchangé) |
| `npm run lang:gate` | **0** | `lang-gate OK — 0 non-exempt French hit(s)` ; 12 scopes GATED `{root,contracts,schemas,hikae,ukemi,atelier,monark,site,harness,skills,sentinel,bell}` |
| `npm run export:check` | **0** | `check OK — 0 forbidden path, 0 non-exempt French hit` ; 12 scopes GATED |

Chaîne G0 §7 (`npm run ci && lint && lint:ratchet && lang:gate` + `export:check` en no-régression) = **tous exit 0**.

Tests ciblés individuellement VERTS (grep `✔`, aucun `✖`/`not ok`) : `ci_runs_lang_gate`, `ci_runs_export_check`, `ci_gates_blocking_no_continue_on_error` (test 38), `ci_jobs_have_timeout_and_test_flags_locked`, `sentinel_readme_is_a_kept_export`, `export_public_derived_jobs_are_byte_identical` (**42(f')**), `export_public_no_governance_no_french` (test 42, 40 540 ms), `lang_gate_classifyScope_routes_off_tool_app_source_trees`, `lang_gate_SCOPES_declares_the_off_tool_app_scopes`.

**Oracle == RENDU-G1** (745/744/0/1, ratchet 69/69, vocab 203, 12 scopes/0 hit) à l'identique.

---

## 2. R-25 (vs `4ee3285`, pathspec VERBATIM `ci.yml:65`)

La ligne pathspec `ci.yml:65` est **byte-identique** dans les 3 sources (base `4ee3285`, arbre `57b9e1b`, `F:\Monark` HEAD `3350eec`) — pas d'ambiguïté.

Commande EXACTE exécutée (verbatim, 14 entrées `:(exclude...)`, sans expansion d'accolades — git n'en fait pas) :
```
git diff --shortstat 4ee3285 57b9e1b -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ':(exclude,glob)fixtures/**/*.jsonl' ':(exclude,glob)fixtures/**/*.csv' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.json' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.json' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.jsonl' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.csv'
=> 2 files changed, 78 insertions(+), 2 deletions(-)      [two-dot ET three-dot identiques : merge-base(57b9e1b,4ee3285) = 4ee3285]
```
Métrique awk `ci.yml:69` (`ins+del`) = **78 + 2 = 80**. **80 ≤ 300** (et ≤ `VIBEGATES_PR_LIMIT` = 1 205) ⇒ **régime petit lot confirmé**.
Par fichier (excludes appliqués) : `ci.yml` 9/0, `test/ci-gates.test.ts` 69/2 ; `docs/adr/ADR-M004-…md` 53/0 **exclu** par `:(exclude,glob)docs/**/*.md`. **== RENDU-G1 (80).**

---

## 3. Batterie de mutants — arbre isolé, restauration byte-exacte vérifiée après CHAQUE mutant

Applicateurs : `mutate.mjs` du G1 (rejoué tel quel, paramétré sur mon arbre) pour M1..D3 ; `mutate-g2.mjs` (le mien) pour X1..X3. Mesure = filtre 3 tests via `node --test --test-reporter=tap --test-name-pattern='ci_gates_blocking_no_continue_on_error|ci_runs_export_check|ci_runs_lang_gate'` (reporter **TAP**, `not ok` en ASCII robuste). `#fail` = nombre de ces 3 tests rouges, par NOM. Restauration = `cp baseline-ci.yml` + assertion `sha256 == 468e17b6…` (le script **s'arrête** sur tout écart ; il a atteint baseline-post proprement).

| Mutant | description | #fail MESURÉ | #fail G0 | tests rouges | restauration |
|---|---|---|---|---|---|
| **M1** | étape `lang:gate` retirée | **1** | 1 | `ci_runs_lang_gate` | sha OK |
| **M2** | `continue-on-error: true` sur l'étape | **3** | 3 | test38 + export_check + lang_gate | sha OK |
| **M3** | étape commentée (`#`) | **1** | 1 | `ci_runs_lang_gate` | sha OK |
| **M4** | commande → `echo skip` | **1** | 1 | `ci_runs_lang_gate` | sha OK |
| **M5** | `if: false` sur le **JOB** r25 | **3** | 3 | test38 + export_check + lang_gate | sha OK |
| **D1** | `if: false` sur l'**étape** | **3** | 3 | les 3 | sha OK |
| **D2** | `if: ${{ false }}` sur l'étape | **3** | 3 | les 3 | sha OK |
| **D3** | `if: github.event_name == 'never'` | **3** | 3 | les 3 | sha OK |
| **baseline** (restauré) | — | **0** | 0 | — | sha == 468e17b6 |

**MESURÉ == ATTENDU pour les 8 mutants G0**, aucun survivant. **M5 (if: job-level) rougit `ci_runs_lang_gate`** ⇒ **pas de trou M5a** (forme post-C-1, garde `if:` block-scopée dès l'origine). Restauration byte-exacte après chaque mutant + post-battery ; les **3 fichiers livrés re-vérifiés byte-exact** après la batterie.

**Mes 3 mutants propres** (adversariaux, ciblés sur les points du mandat) :

| Mutant | description | #fail | tests rouges | ce qu'il prouve |
|---|---|---|---|---|
| **X1** | étape `lang:gate` **DÉPLACÉE** de r25 vers le job **retenu g6** (vérifié : `npm run lang:gate` dans g6 avant le SBOM, r25 ne garde qu'`export:check`) | **1** | `ci_runs_lang_gate` seul | **Block-scoping** (point D-1) : un `lang:gate` dans un AUTRE job ne satisfait PAS le test ; test38/export_check restent verts (étape verte sans directive, ligne export:check intacte) |
| **X2** | `run: npm run lang:gate \|\| true` | **1** | `ci_runs_lang_gate` seul | La regex de présence est **ancrée** (`^\s*run:\s*npm run lang:gate\s*$`) ⇒ un échec masqué par `\|\| true` rougit ; `\|\| true` n'est ni COE ni `if:` ⇒ test38 vert |
| **X3** | `if: ${{ true }}` (TRUTHY) sur l'étape | **3** | les 3 | La garde `if:` est **value-indépendante** : même un `if:` vrai rougit (la regex ancre la CLÉ, pas la valeur) — fail-closed sur TOUT `if:` |

---

## 4. Points à juger (mandat §D)

**(D-1) `ci_runs_lang_gate` block-scopé sur r25 — OUI (analytique + empirique).**
`test/ci-gates.test.ts:269-283` : le test construit `r25Block` (clé r25 → prochaine clé 2-espaces / colonne 0) et vérifie la **présence DANS `r25Block`** (`r25Block.some(...)`, 281). Un `lang:gate` ailleurs n'y est pas ⇒ échec. **Preuve empirique X1** : étape déplacée dans g6 ⇒ `ci_runs_lang_gate` rouge (#fail=1). Un `lang:gate` dans un autre job **ne le satisfait pas**.

**(D-2) Mesure miroir (phases A/B) — CORRECTE, « non forçant » validé première main.**
- **Phase B (export réel de l'arbre)** : `node scripts/export-public.mjs --out …` → exit 0 ; miroir dérivé `grep -c` = **0** pour `r25`, `lang:gate` ET `export:check` ; 5 jobs retenus (g1, g3-verification, g4, g6, g3-site) ; `on:` = {push, pull_request}. `derivePublicWorkflow` **strip bien r25** (donc l'étape `lang:gate` en r25 est **absente** du miroir).
- **« Non forçant » (asymétrie MESURÉE sur le miroir réel)** : sur le miroir exporté, `package.json` / `scripts/lang-gate.mjs` / `scripts/lang-exempt.json` sont **présents et byte-identiques**, `scripts/export-exclude-tests.json` **absent** ⇒ `node scripts/lang-gate.mjs` sur le miroir = **exit 0** (12 scopes, 0 hit) TANDIS QUE `node scripts/export-public.mjs --check` sur le miroir = **exit 1** (`export-exclude-tests.json … ENOENT`, fail-closed). Donc `lang:gate` **ne rougit PAS** sur le miroir (contrairement à `export:check`) : un placement en job retenu serait une étape **verte**, pas un rouge latent. Le placement r25 repose donc sur la **doctrine** (concern interne) + **symétrie** avec CI-EXPORT-CHECK, **PAS** sur un rouge-miroir forçant — exactement ce que le lot déclare (honnêteté validée : aucune clause « where it reds » sur-copiée).
- **Phase A (étape en job retenu g6, export)** : miroir dérivé **RECOPIE** l'étape (`grep -c "npm run lang:gate"` = **1**, byte-présente avant le SBOM g6), `grep -c r25` = 0. Confirme le motif du placement (une étape en job retenu **serait** vitrine).

**(D-3) Correction du commentaire `sentinel_readme_is_a_kept_export` — substance INCHANGÉE.**
Le corps du test (`ci-gates.test.ts:1494-1500`) est intact : `assert.ok(kept.has("apps/sentinel/README.md"), …)`. Seul le commentaire change : `-// … not a red -- and // lang:gate does not run in CI.` → `+// … not a red. lang:gate now ALSO runs in CI (Lot LANG-GATE-CI, same r25 job) … but a language gate does not assert file MEMBERSHIP, so this assertion stays the teeth for … removed or renamed …`. La prémisse périmée (« lang:gate ne tourne pas en CI ») est corrigée ; la logique `frenchMd` non-fatal et l'assertion d'appartenance (les « dents » du test) demeurent. **VERT** à l'oracle. Dérive doc corrigée en ligne (classe C-2, propriétaire = ce lot).

**(D-4) « lot-size job » vs « r25 job » (42(f'), `export-public.test.ts:395`) — correction LÉGITIME et LOAD-BEARING, ne masque AUCUN rouge.**
- Le corps du job r25 (`ci.yml:35-98`) ne contient **AUCUN `r25` minuscule** (les seules occurrences du fichier : `ligne 13` en-tête et `ligne 34` clé de job — **toutes deux retirées par le derive**). L'invariant « le corps r25 ne porte aucun `r25` minuscule » est **load-bearing** pour le contrôle interne M-42f' (`export-public.test.ts:387-395`) : le mutant y injecte un commentaire indenté qui orpheline le corps r25 dans un job retenu dérivé, puis asserte `!/r25/.test(mutantDerived)` (le bare `/r25/` de 42(f) doit **RATER** la corruption car l'orphelin ne porte que « R-25 » majuscule).
- **Reproduction adversariale (première main)** : j'ai **réintroduit** `r25` minuscule dans le corps r25 (« lot-size job » → « r25 job ») ⇒ **test 42(f') ÉCHOUE** (exit 1, `not ok`, `# fail 1`) exactement à l'assertion `export-public.test.ts:395` : `error: "M-42f' control: bare /r25/ (test 42(f)) stays green on the mutant — it MISSES the corruption"`, `expected: true / actual: false`. Restauration byte-exacte (sha 468e17b6).
- **Conclusion** : le rouge d'origine (comment du worker « r25 job ») était **RÉEL** (échec CI reproductible) ; le correctif « lot-size job » **restaure l'invariant** sans toucher, désactiver ni affaiblir aucune assertion (le test **continue** de capturer la violation, prouvé ci-dessus). C'est une correction légitime, **pas** un masquage. Le worker l'a surfacée honnêtement (error_origin = G0, item formé pour nommer l'invariant en G0 §11) ⇒ voir C-G-1.
- Note : le **fichier de test** (`ci-gates.test.ts`) garde librement « r25 job » dans le NOM/commentaires du test — il n'est **pas** dérivé/exporté ; l'invariant ne porte que sur le corps de `ci.yml`. Le worker a bien ciblé le seul endroit contraint (le commentaire de `ci.yml`).

**(D-5) Addendum ADR-M004 — tuyaux déclarés + statut « servi au premier run Linux ».**
`docs/adr/ADR-M004-…md` « Addendum LANG-GATE-CI (2026-09-21) » déclare explicitement : **Entrée** (`npm run lang:gate` invoqué par le job r25) ; **Sortie** (statut de la PR — rouge sur hit français non-exempté exit 1 ou erreur d'usage exit 2, fail-closed) ; **État** (« câblé localement ; **servi au premier run réel sur runner Linux** — item CHANTIERS **existant** :222/:313, propriétaire orchestrateur ; pas une dette neuve ») ; **Test qui prouve la composition** (`ci_runs_lang_gate`, chaîne ci.yml→package.json→lang-gate.mjs ; oracle `npm run lang:gate` exit 0). Conforme à la règle Branchement (tuyaux déclarés, item existant à déclencheur, test d'intégration non-LLM présent).

**(D-6) `scripts/lang-gate.mjs`, `scripts/lang-exempt.json`, `package.json` — INTACTS.**
`git diff 4ee3285..57b9e1b -- scripts/lang-gate.mjs scripts/lang-exempt.json package.json` = **vide**. Aucun changement de scope ni d'exemption (contrainte de mission respectée). `package.json:23` = `"lang:gate": "node scripts/lang-gate.mjs"` (la cible de l'assertion (4) du test).

**(D-7) Mots interdits / ASCII / secrets — PROPRES.**
- **ci.yml** lignes ajoutées : **ASCII pur** (aucun octet > 0x7F). Aucun `r25` minuscule dans les ajouts.
- **test** lignes ajoutées : **0 octet non-ASCII** (le worker a utilisé `--`, pas l'em-dash — le **C-3 du modèle NE se reproduit PAS** ; la revendication ASCII du RENDU-G1 §7 est **exacte** ici).
- **Vocabulaire interdit** (`partner|autonomous|guarantee|verified|score|accuracy|confidence`) dans les lignes ajoutées (ci.yml + test + ADR) : **aucun**. `gate:vocab` vert.
- **Secrets** (`secret|password|api[_-]?key|bearer|ghp_|xox|BEGIN … PRIVATE|AKIA…`) dans les lignes ajoutées : **aucun**.

---

## 5. Décompte des fichiers scannés (mesure indépendante — décision 116)

Mesuré via import des fonctions exportées de `scripts/lang-gate.mjs` sur l'arbre commité (= vue checkout CI) : **417 collectés** (scannables) − **3 path-exempt** (`fixtures/s3-binance.constat.json`, `.registre.txt`, `.verdict.txt`) = **414 scannés** ; `lang:gate` exit 0, 12 scopes, 0 hit. Le jeu de fichiers scannables est **inchangé** entre la base G0 `430e99d` et le HEAD `57b9e1b` (`git diff --name-status 430e99d 57b9e1b` : 1 ajout = le `.md` du G0, dans `docs/` donc **skippé** ; 0 suppression) ⇒ toute dérive du chiffre est **pré-existante**, pas ce lot. Le figure cité « ~418 » (ADR, avec tilde) reste dans la tolérance ; le chiffre **précis** « 418 scannés / 421 collectés » de G0 §1 / RENDU §1 **ne se reproduit pas** (voir C-G-2).

---

## CORRECTIONS FORMÉES

**C-G-1 (NON BLOQUANT — error_origin = G0 ; item DÉJÀ formé par le worker, ma reproduction jointe).**
Le G0 §11 (blast-radius) OMET l'invariant « **le corps du job r25 ne porte aucun `r25` minuscule** », dont dépend le contrôle interne M-42f' (`export-public.test.ts:395`). **Déjà corrigé dans le `ci.yml` livré** (« lot-size job ») et **déjà surfacé par le worker** en item formé (amender G0 §11 pour nommer l'invariant). J'ai **reproduit le rouge** (réintroduction de `r25` minuscule ⇒ 42(f') échoue à :395). Propriétaire : orchestrateur ; déclencheur : repli du lot. **Ce n'est PAS un défaut du code livré** — c'est un item formé confirmé + reproduction indépendante.

**C-G-2 (NON BLOQUANT — error_origin = G0).**
Le chiffre de fichiers scannés. Mesure reproductible sur l'arbre commité = **414 scannés (417 collectés − 3 exempt)**. Le G0 §1 et le RENDU-G1 §1 affirment un **précis** « 418 scannés / 421 collectés » qui **ne se reproduit pas** ; le jeu de fichiers est inchangé depuis la base (donc pré-existant, pas ce lot). L'ADR livré emploie « ~418 » (avec tilde) — **dans la tolérance, non faux**. Recommandation : aligner le chiffre cité sur **414/417** au repli (ou conserver le tilde explicite comme estimation). Docs-only, propriétaire orchestrateur.

**Aucune correction BLOQUANTE. Aucun défaut de code. Aucune condition de FAIL.**

---

## error_origin
- **C-G-1** : **G0** (omission de l'invariant en §11 blast-radius). Traitement worker exemplaire : corrigé dans le livrable + item formé + `error_origin=G0` déclaré au G1.
- **C-G-2** : **G0** (chiffre de mesure), reporté approximativement (tilde) dans l'ADR livré, précisément dans G0/RENDU.
- Aucun défaut de correction (aucun code cassé) : placement, oracle, mutants, block-scoping, miroir, chaîne package.json — tous sains.

## MAST — risque résiduel
- **FM-2.x (désalignement inter-agents)** : **N/A** (worker unique).
- **FM-1.1 / FM-1.2 (spec / rôle)** : respectés — 3 fichiers, aucun changement de scope/exemption, aucun commit/workflow (R-20).
- **FM-3.2 / FM-3.3 (vérification absente / incorrecte)** : cette G2 EST la seule vérification indépendante (décision 116) ; oracle, R-25, 8+3 mutants, phases miroir A/B, reproduction load-bearing de 42(f'), jeu-de-fichiers + décompte tous RE-EXÉCUTÉS. Aucun résiduel de vérification incorrecte trouvé.
- **Résiduels PRÉ-EXISTANTS, déclarés, propriétaire orchestrateur** (pas des dettes neuves) : (a) **premier run réel sur runner Linux** (CHANTIERS:222/:313 ; résiduel Windows→Linux faible, `lang-gate.mjs` = `node:fs` pur) ; (b) **statut « required check » de r25** = protection de branche hors-dépôt, non vérifiable hors-réseau ; (c) **contrainte d'ordonnancement** (LANG-GATE-CI fusionne AVANT le worktree GARDE-HELIUS-2b-ii, G0 §10 — confirmé : l'orchestrateur gate déjà 2b-ii sur cette fusion, commit `51c4d9a` « approved for G1 after LANG-GATE-CI merge »).

---

## git status --short (les deux dépôts)
- **`F:\Monark`** : **propre** (`git status --short` = vide, exit 0). HEAD a avancé `4d102ca → 3350eec` PENDANT la revue, du fait de commits **parallèles de l'orchestrateur** (GARDE-HELIUS-1b/2b-ii, prereg U-4b-1b) — **PAS mes écritures** (working tree propre). `4ee3285` est un **ancêtre** de `3350eec` ; toutes mes mesures sont clés sur des SHA **immuables** (`4ee3285`/`57b9e1b`) + l'arbre isolé ⇒ **inaffectées** ; la ligne pathspec `ci.yml:65` à `3350eec` reste **identique** à l'arbre.
- **`F:\Monark-wt-langgate`** : **propre** (`git status --short` = vide, exit 0), HEAD `57b9e1b`, branche `lot/lang-gate-ci`, **non touché** (gelé).

## Fichiers écrits (tous sous `F:\tmp\g2-langgate\` ; rien sur `C:`, aucun réseau, aucun commit)
- `G2-lot-lang-gate-ci.md` (ce rapport)
- `mutate-g2.mjs`, `battery.sh`, `repro.sh`, `count-scanned.mjs` (outillage rejouable)
- `baseline-ci.yml` (copie pristine du `ci.yml` livré, sha `468e17b6…`)
- `logs/**` : `o-{vocab,typecheck,lint,ratchet,lang,export,test}.log`, `filter-baseline.log`, `mut/*` (13 runs + `apply-*` + `*-preview.yml`), `export-A.log`, `export-B.log`, `mirror-langgate.log`, `mirror-exportcheck.log`, `repro-42fprime.log`
- `mirror-A/`, `mirror-B/` (exports miroir inspectés)
- **`tree/.github/workflows/ci.yml`** : muté/écrasé **13 fois** — 11 en batterie (8 G0 + X1/X2/X3) + 2 en repro (Phase A `cp X1-preview.yml` + réintroduction `r25` pour 42(f')) — et **restauré byte-exact** à chaque fois (sha `468e17b6…`) ; les **3 fichiers livrés** de `tree/` re-vérifiés byte-exact **après repro.sh** (donc couvrant les 13 écrasements).

*(Fin G2 LANG-GATE-CI. Sortie brute pour l'orchestrateur ; vérification adversariale R-21 et verdict G7 lui appartiennent.)*
