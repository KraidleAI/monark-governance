# G2 — Petit lot CI-EXPORT-CHECK (MONARK) — revue indépendante (contexte frais)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme, effort max. Opus 5 banni, non utilisé.
**Date** : 2026-09-21. **Régime** : petit lot (ADR-C01 amendement 2026-09-21 : G1 + G2, pas de checkpoint-2 — cette revue est la SEULE relecture indépendante, adversariale). **Base** `25bad38`, **HEAD** `013b4bf092e8362a631ddb288bf7b15faf759ecd`. **R-20** : aucune écriture dans le dépôt, aucun commit, aucun réseau, rien sur C:. **Preuve d'innocuité** : après TOUTE re-exécution (`npm run ci`, lint, ratchet, export:check, lang:gate, exports), `cd F:\Monark-wt-cixcheck && git status --short` = **vide** (working tree propre). Mutants dans un arbre isolé (`git archive HEAD` → `F:\tmp\g2-cixcheck\tree`, jonction `node_modules` → `F:\Monark\node_modules`, restauration byte-exacte). Jamais `git checkout`/`stash`, jamais `npm ci`/`npm install`. **Hygiène de nettoyage** : `F:\tmp\g2-cixcheck\tree\node_modules` est une JONCTION vers `F:\Monark\node_modules` ; retirer la jonction (`cmd /c rmdir F:\tmp\g2-cixcheck\tree\node_modules`) AVANT tout effacement de l'arbre — un `Remove-Item -Recurse` PowerShell sur une jonction peut traverser vers la cible et détruire le vrai `node_modules`.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le lot est fonctionnellement correct, la décision-clé de placement est juste (et de fait **forcée** par la logique du derive), tous les oracles sont verts, les mutants rougissent comme annoncé. **Une correction substantielle non bloquante** (asymétrie de garde `if:` vs `continue-on-error` dans le nouveau test) + 2 corrections mineures (déjà partiellement déclarées par le worker). Rien n'est cassé ⇒ ni FAIL. Corrections formées en §CORRECTIONS.

---

## 1. Re-exécution du socle (mesuré, pas lu)

| Commande | Résultat mesuré |
|---|---|
| `npm run ci` | **exit 0** — `ℹ tests 698 / pass 697 / fail 0 / skipped 1`. Ciblés verts : `✔ ci_gates_blocking_no_continue_on_error (test 38)`, `✔ ci_runs_export_check`, `✔ export_public_no_governance_no_french (test 42, 42566 ms)`, `✔ export_public_derived_jobs_are_byte_identical (test 42(f'))`. Le 1 skip est pré-existant (aucun skip ajouté par ce lot). |
| `npm run lint` | **exit 0** (eslint) |
| `npm run lint:ratchet` | **exit 0** — `lint-ratchet: 69/69` (inchangé) |
| `npm run export:check` (global) | **exit 0** — `check OK — 0 forbidden path, 0 non-exempt French hit in scope {…12 scopes…}`, les 12 scopes GATED, 0 hit |

sha256 pristine ci.yml de l'arbre (`git archive HEAD`) = `3b015ce3ca8343afadfe8622d3a7aec4529c19f8ae882c562cf849465ef85c4f` — **identique** au sha déclaré dans RENDU-G1 (provenance byte-exacte confirmée).

---

## 2. Décision-clé (placement dans `r25-taille-de-lot`) — JUSTE, et de fait FORCÉE

Reproduction première main de l'affirmation du worker (export dans un dossier temp, puis `--check` DANS ce dossier) :
```
$ node scripts/export-public.mjs --out /f/tmp/g2-cixcheck/pubtest        → exit 0 (miroir écrit)
$ ls .../pubtest/scripts/export-exclude-tests.json                        → No such file (non whitelisté)
$ cd .../pubtest && node scripts/export-public.mjs --check                → exit 1
  export FAILED — scripts/export-exclude-tests.json is missing or unparseable (fail-closed, D7 addendum): ENOENT
```
`export:check` est bien un gate du dépôt SOURCE qui ROUGIT sur le miroir exporté (config non whitelistée ⇒ fail-closed).

**Le placement n'est pas seulement « correct », il est UNIQUE.** `derivePublicWorkflow` (`export-public.mjs:410`) retire **exactement et seulement** la clé `"  r25-taille-de-lot:"`. Tout AUTRE job (retenu, ou nouveau job interne) portant `export:check` serait recopié dans le miroir public — byte-identique pour un job retenu (imposé par test 42(f')) — et y rougirait. Donc `r25` est le **seul** job tenu hors du miroir : c'est la seule place zéro-dette sous la logique actuelle du derive. (Étendre le derive = l'item formé (3) du worker.)

Réponses aux sous-questions de la mission :
- **Mêmes déclencheurs ?** OUI. `on:` = `pull_request:` SEUL (source). TOUS les jobs (g1, r25, g3, g4, g6, g3-site) tournent sur `pull_request`. Le trigger `push` n'est ajouté QUE dans le workflow dérivé (miroir). Aucun gate source ne tourne sur push (livraison par PR, `ci.yml:12-13`) ⇒ parité totale entre `export:check` et les autres gates.
- **`npm ci`/checkout nécessaires ?** NON pour `npm ci`. Vérifié EMPIRIQUEMENT : `export-public.mjs` + `lang-gate.mjs` n'importent QUE des built-ins node + `./lang-gate.mjs` (grep tiers = vide) ; `npm run export:check` dans un arbre `git archive` **SANS `node_modules`** → **exit 0** (`check OK`). Le checkout du job r25 (`fetch-depth: 0`) est un SUR-ensemble du besoin (export:check ne lit que l'arbre de travail). `setup-node@<sha épinglé>` ajouté avant l'étape ⇒ node 24 présent.
- **`if:` peut-il le faire SAUTER ?** NON. Parse PyYAML indépendant : `r25 has if:? False`. test 38 interdit tout `if:` file-wide (prouvé par le mutant M5a ci-dessous). Le job n'a pas de `needs:` ⇒ il tourne toujours sur PR.
- **Check REQUIS ?** Indéterminable hors-réseau (protection de branche = réglage GitHub hors dépôt). `export:check` HÉRITE du statut « required » de r25. **Pré-existant** : même classe que l'item documenté sur g3-site (`ci.yml:143-153` : « blocking CONDITIONAL … until it joins the closed list of required status checks »). → Observation C (à confirmer par l'orchestrateur, pas un défaut introduit par ce lot).

Workflow PUBLIC dérivé (export réel, puis inspection) : `npm run export:check` ABSENT, `Public-mirror export hygiene` ABSENT, clé `r25-taille-de-lot` ABSENTE, `grep -c r25 = 0`, `on:` = {push, pull_request}, 5 jobs retenus + header de provenance. test 42(f) verrouille déjà `!/r25/.test(ciYml)` ⇒ le miroir NE contient PAS l'étape et NE rougit PAS (test 42(e) rejoue `npm ci && npm run ci` sur l'export = vert).

---

## 3. `ci_runs_export_check` — ce qu'il épingle (et le TROU)

Épingle bien : (1) **présence** `run: npm run export:check` (regex ancrée `^\s*run:\s*npm run export:check\s*$`, block-scopée r25) ; (2) **absence de `continue-on-error`** (block-scopée r25, réutilise `COE_DIRECTIVE_RE`, saute les commentaires) ; (3) **commande exacte** via `package.json:21` = `"node scripts/export-public.mjs --check"`.

**N'épingle PAS** : « le job n'est pas conditionné à sauter » (`if:`). Ce test ne teste AUCUN `if:` sur r25 ; la garde repose sur test 38 (détecteur `IF_DIRECTIVE_RE` file-wide). **Asymétrie mesurée** : le worker a block-scopé `continue-on-error` à r25 (redondant avec test 38) MAIS pas `if:` — alors qu'un check REQUIS *sauté* (`if: false`) compte comme PASSANT sur GitHub, ce que la doc du test 38 (1bis) qualifie explicitement de « WORSE than continue-on-error ». Donc la dimension la plus grave est la seule NON gardée localement. → Correction C-1.

---

## 4. Batterie de mutants (arbre isolé, restauration byte-exacte vérifiée)

| Mutant | exit | test 38 | ci_runs_export_check | #fail |
|---|---|---|---|---|
| M1 étape retirée (RENDU) | 1 | PASS | **FAIL** | 1 |
| M2 `continue-on-error: true` (RENDU) | 1 | **FAIL** | **FAIL** | 2 |
| M3 étape COMMENTÉE (task) | 1 | PASS | **FAIL** | 1 |
| M4 commande → `echo` (task) | 1 | PASS | **FAIL** | 1 |
| M5a `if: false` SUR le job r25 (sonde du trou) | 1 | **FAIL** | **PASS** | 1 |
| M5b étape DÉPLACÉE dans un job `if: false` (task) | 1 | **FAIL** | **FAIL** | 2 |
| baseline restauré | 0 | PASS | PASS | 0 |

Restauration après chaque mutant : `sha256 == 3b015ce3…5c4f` = **true**. M3/M4 rougissent l'assert de présence (regex exacte). M5b rougit les DEUX (l'étape quitte r25 ⇒ présence ; le nouveau job porte `if:` ⇒ test 38). **M5a est la preuve du trou §3** : `if: false` sur r25 ⇒ test 38 ROUGE mais `ci_runs_export_check` VERT. La propriété « pas de skip » EST donc défendue par la suite (test 38), mais PAS par le test dédié.

---

## 5. YAML + tests lecteurs de ci.yml

- Parse indépendant PyYAML : `YAML OK`, jobs = [g1, r25, g3-verification, g4, g6, g3-site], `r25 steps: 4`, `r25 has if:? False`. (Le `KeyError: 'on'` est le gotcha YAML 1.1 `on→True`, sans rapport avec la validité ; GitHub Actions parse correctement.)
- Verts (baseline arbre isolé, 30/30) : test 38, `ci_runs_export_check`, `series_pinned_are_declared_and_hashed`, `ci_jobs_have_timeout_and_test_flags_locked` (r25 garde `timeout-minutes: 5` avec ses 4 steps), `g3_site_builds_then_asserts_fleet_html`. Verts (suite complète) : test 42, 42(f').

---

## 6. Items formés du worker — RÉELS ?

1. **`lang-gate.mjs:37-42` périmé** (« global RED by design ») — **CONFIRMÉ RÉEL.** Mesuré : `npm run lang:gate` GLOBAL = **exit 0**, 0 hit dans TOUS les scopes (hikae/ukemi/atelier/monark inclus). `lang-gate` scanne l'arbre entier (`collectTextFiles`), pas seulement la whitelist ⇒ confirmation forte. Le commentaire est factuellement faux sur cette base.
2. **Commentaire de `sentinel_readme_is_a_kept_export` (`ci-gates.test.ts:1411-1414`)** — **CONFIRMÉ RÉEL.** La prémisse « lang:gate/export:check ne tournent pas en CI » est désormais fausse pour `export:check`. La SUBSTANCE tient : `frenchMd` reste NON-fatal dans `export:check` (`export-public.mjs:362` = reported, non fatal) ⇒ un README français serait encore exclu du miroir en silence ⇒ l'assertion d'appartenance garde ses dents. Seul le commentaire dérive.
3. **Recherche/décision — hygiène équivalente SUR le miroir** — **PRÉMISSE RÉELLE** (export:check reds sur le miroir, reproduit §2), correctement classée « décision future » (whitelister les configs OU étendre `derivePublicWorkflow`), hors périmètre fermé.

---

## 7. R-25 / vocabulaire / ASCII

- **R-25** : pathspec VERBATIM `ci.yml:65` sur `25bad38...HEAD` ⇒ `2 files changed, **65 insertions(+)**` (ci.yml 14 + test 51 ; ADR-M004 +36 exclu par `:(exclude,glob)docs/**/*.md`). **65 = annoncé, < 1205.** ✓
- **Vocabulaire interdit** dans les lignes AJOUTÉES (partner|autonomous|guarantee|verified|score|accuracy|confidence) : **aucun** (grep exit 1). `gate:vocab` vert dans `npm run ci`.
- **ASCII** : ci.yml lignes ajoutées = **pur ASCII** (`->` et non `→`). Le fichier TEST ajoute des em-dash (U+2014) et séparateurs box-drawing (U+2500) dans des COMMENTAIRES — non-ASCII, cohérent avec le style existant du fichier, non exporté, sans impact fonctionnel. ⇒ l'affirmation RENDU §7 « ci.yml et le test sont en anglais ASCII » est imprécise POUR LE TEST (Correction C-3, mineure, doc).

---

## CORRECTIONS FORMÉES

**C-1 (non bloquante, substantielle — error_origin = worker G1).** `test/ci-gates.test.ts`, dans `ci_runs_export_check` (après l'assert (2), ~ligne 227). Ajouter la garde `if:` block-scopée, symétrique de l'assert `continue-on-error`, avec `IF_DIRECTIVE_RE` (déjà en portée module) :
```ts
assert.ok(
  !hasDirective(r25Block, IF_DIRECTIVE_RE),
  "the r25 job/export:check step must carry no `if:` (a SKIPPED required check counts as PASSING on GitHub); mutant: `if: false` on r25 => red",
);
```
Justification : ferme localement la dimension `if:`/skip (plus grave que COE), aujourd'hui couverte SEULEMENT par test 38 (prouvé par M5a). **Précédent du dépôt** : ce fichier porte DÉJÀ une garde block-scopée sœur pour un autre job — l'en-tête de test 38 dit « Block-scoped sibling for g3-site in `g3_site_builds_then_asserts_fleet_html` » (`ci-gates.test.ts:11`), et `ci_runs_export_check` a DÉJÀ block-scopé `continue-on-error` à r25 (redondant avec test 38) ; le worker a suivi ce motif pour COE mais pas pour `if:`. Ce n'est donc pas du gold-plating mais la restauration de la symétrie.

**Validé EMPIRIQUEMENT (arbre isolé, patch appliqué au TEST du tree, non au dépôt ; restauration byte-exacte sha OK des deux fichiers)** :
- A) test patché + ci.yml pristine → `exit=0 test38=PASS ci_runs_export_check=PASS #fail=0 tests=30` — l'assert C-1 NE rougit PAS à tort (le `IF_DIRECTIVE_RE` ne matche ni le shell `if [ … ]` ci.yml:71 ni l'awk `{ if($i ~ …` ci.yml:69, qui n'ont pas de `:` après `if` ; r25Block n'est pourtant PAS comment-strippé).
- B) test patché + mutant M5a (`if: false` sur r25) → `exit=1 test38=FAIL ci_runs_export_check=FAIL #fail=2` — avec C-1, `ci_runs_export_check` rougit MAINTENANT (au lieu de PASS dans la batterie d'origine). Trou fermé, mesuré.

**C-2 (non bloquante — error_origin = dérive antérieure/orchestrateur ; le worker l'a DÉJÀ déclarée en item formé 1/2).** Corriger les 2 commentaires périmés : `scripts/lang-gate.mjs:40` (« global is RED by design » → global mesuré vert sur cette base) et `test/ci-gates.test.ts:1412` (« lang:gate/export:check do NOT run in CI » → `export:check` tourne désormais en CI ; garder la logique frenchMd non-fatal). Déclencheur : fusion de ce lot. Substance des tests inchangée.

**C-3 (mineure, doc — error_origin = worker G1, rédaction RENDU).** RENDU-G1 §7 : remplacer « ci.yml et le test sont en anglais ASCII » par « ci.yml (lignes ajoutées) est ASCII ; le test ajoute des em-dash/box-drawing en commentaires, non-ASCII mais non exportés/inoffensifs ».

---

## error_origin (proposé)
- C-1 : **worker G1** (garde COE block-scopée mais garde `if:` omise — asymétrie du test livré).
- C-2 : **dérive antérieure** (commentaires écrits avant l'achèvement des lots E-* de traduction / avant le branchement export:check) ; **correctement surfacée** par le worker (items formés 1 & 2) — bon traitement, pas une dette nue.
- C-3 : **worker G1** (imprécision de rédaction du RENDU).
- Aucun défaut de correction (aucun code cassé) : le placement, l'oracle et les mutants sont sains.

## Observations non bloquantes (R-21, pour l'orchestrateur)
- **B (forcé)** : le placement en r25 est l'UNIQUE option zéro-dette (derive ne retire que la clé exacte `r25-taille-de-lot`) — à consigner comme force, non comme confort.
- **C (pré-existant)** : statut « required check » de r25 = protection de branche hors dépôt, non vérifiable hors-réseau ; export:check en hérite ; même classe que l'item g3-site. À confirmer par l'orchestrateur.
- **D (inhérent)** : export:check est en AVAL de l'étape taille-de-lot dans le même job ⇒ un PR surdimensionné rougit en R-25 et masque export:check jusqu'au découpage. Inévitable tant que r25 est le seul job retiré du miroir.

---

# G2-DELTA — pli `02849b3` (par-dessus G1 `013b4bf`) — VERDICT : **PASS**

Modèle résolu : `claude-opus-4-8[1m]`. Aucun commit, aucune écriture hors `F:\tmp`, `git status --short` = **vide** à la sortie (HEAD `02849b3`). Arbre isolé `F:\tmp\g2-cixcheck\tree2` (`git archive 02849b3`, jonction `node_modules` créée puis RETIRÉE, cible intacte).

**(1) Périmètre du delta — RIEN hors C-1..C-3.** `git diff 013b4bf 02849b3` = 3 fichiers, +23/-10 : `test/ci-gates.test.ts` (C-1 : assert `!hasDirective(r25Block, IF_DIRECTIVE_RE)` block-scopé ajouté après l'assert COE, exactement la correction validée en G1 ; C-2b : commentaire `sentinel_readme_is_a_kept_export` corrigé, substance frenchMd non-fatal préservée), `scripts/lang-gate.mjs` (C-2a : « global RED by design » → « global went GREEN … measured 2026-09-21 »), `docs/adr/ADR-M004-…md` (paragraphe épingle mis à jour). **`ci.yml` INCHANGÉ** : sha `3b015ce3ca8343afadfe8622d3a7aec4529c19f8ae882c562cf849465ef85c4f` à `02849b3`.

**(2)+(3)+(4) Batterie `if:` (arbre isolé, restauration byte-exacte `sha==3b015ce3…` = true) :**

| Cas | exit | test38 | ci_runs_export_check |
|---|---|---|---|
| baseline pristine | 0 | PASS | **PASS** (30/30 — pas de faux-rouge sur `if [ … ]` shell / `{ if($i ~ …` awk) |
| D1 `if: false` sur l'ÉTAPE r25 | 1 | FAIL | **FAIL** |
| D2 `if: ${{ false }}` sur l'étape | 1 | FAIL | **FAIL** |
| D3 `if: github.event_name == 'never'` sur l'étape | 1 | FAIL | **FAIL** |
| D4 `if: false` sur le JOB r25 | 1 | FAIL | **FAIL** |

⇒ (2) le mutant `if: false` sur l'étape rougit bien `ci_runs_export_check`, ci.yml restauré byte-exact. (3) aucun faux-rouge (baseline vert). (4) **les formes expression `${{ false }}` ET condition `github.event_name == 'never'` sont AUSSI tuées** — `IF_DIRECTIVE_RE` ancre sur la CLÉ `if:` indépendamment de la valeur ; job-level tué aussi.

**(5) Oracle** (worktree `02849b3`) : `npm run ci && npm run lint && npm run lint:ratchet && npm run export:check` → **CHAIN EXIT 0**. `ci` : `tests 698 / pass 697 / fail 0 / skipped 1` (test 38 ✔, ci_runs_export_check ✔, sentinel_readme_is_a_kept_export ✔ — vert avec le commentaire corrigé, test 42 ✔, 42(f') ✔). ratchet `69/69`. export:check `check OK` exit 0.

**(6) R-25** (lot `25bad38...02849b3`, pathspec verbatim `ci.yml:65`) : `3 files changed, **83 insertions(+), 6 deletions(-)**` ⇒ CHANGED = 83+6 = **89** (< 1205 ; ADR-M004 exclu par `docs/**/*.md`).

**Bilan** : les 3 corrections G1 sont appliquées correctement, la garde C-1 tue toutes les formes de `if:` sans faux-rouge, l'oracle est vert, le périmètre est fermé, R-25 dans les bornes. Aucune correction résiduelle. **PASS.**
