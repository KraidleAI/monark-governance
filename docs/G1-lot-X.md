claude-opus-4-8[1m]

# G1 — Journal de provenance — Lot X (ADR-M004 D7/D10/D11 test 42) : export public + gate de langue

## GATE-0 (R-1) — contrôle de résolution
- **Modèle résolu (worker) :** `claude-opus-4-8[1m]` — préfixe attendu `claude-opus-4-8` vérifié tel quel.
- **Effort :** `max` (roster mainteneur 2026-08-14). **Opus 5 banni** : non utilisé. Aucun tier nu.
- **Date :** 2026-09-06. **Worktree :** `F:\Monark-wt-export`, branche `lot-x-export`
  (= `main` + E-root + E-contracts ; HEAD merge `e038cb5`).
- **Écriture :** siège worker. **Aucun commit / push** (R-20) ; **aucune poussée vers `KraidleAI/monark`**
  (la première publication est un geste orchestrateur avec permission investisseur). **Aucun réseau.**
- **Revue G2 / verdict G7 / acceptation validateur-humain :** dus, non faits par ce worker (R-21).
- `npm ci` exécuté d'abord : **exit 0**, `added 107 packages … found 0 vulnerabilities`. Aucune dépendance
  nouvelle (R-8) — les 3 livrables sont zéro-dépendance (Node 24 natif : `node:fs/path/crypto/child_process/url/os`).

## 1. Rattachement normatif (G0)
- **ADR-M004 D7** — export vers le dépôt public : liste blanche, liste noire (défense en profondeur),
  exclusion des rapports S2 (`packages/hikae/docs/S2-*`), gate de langue à liste d'exemptions fermée, manifeste.
- **ADR-M004 D8** — Lot E (English only) : ce lot NE traduit RIEN ; il fournit le **comptage FR par package**
  en donnée d'entrée pour E-hikae-src/test, E-ukemi, E-atelier (§7).
- **ADR-M004 D10** — Lot X (avant le pivot ; dépend de E-root, E-contracts) ; **D11 test 42**
  `export_public_no_governance_no_french` (mutant : un `docs/adr/*` dans la liste blanche ⇒ rouge).
- **ADR-M003 D0.5 / décision investisseur verbatim 2026-09-05** — « tout ce qui est github, site, plateforme,
  doit être en anglais » : tout **texte nouveau** de ce lot est en anglais (code, commentaires, ce journal excepté,
  qui est un artefact de gouvernance interne comme G1-lot-E-root/contracts).
- **ADR-M001 / `contracts_frozen`** — `schemas/**` et `packages/contracts/src/**` sont **gelés au byte près**
  (manifeste `test/contracts-frozen.manifest.json`, 13 entrées) : conséquence directe sur les exemptions (§4.3).

## 2. Livrables (fichiers)
| Fichier | Rôle | LOC |
|---|---|---|
| `scripts/lang-gate.mjs` | détecteur FR (diacritiques + mots FR + identifiants gelés FR), scopes, CLI | ~230 |
| `scripts/lang-exempt.json` | **liste fermée d'exemptions**, GÉNÉRÉE des sources gelées (byte-exact) | 40 terms / 8 phrases / 4 patterns |
| `scripts/export-public.mjs` | export liste blanche→`--out`, liste noire fail-closed, manifeste, `--check` | ~180 |
| `test/export-public.test.ts` | test 42 (a..d), 1 seul `test()` (compte 83→84), typé (cliquet inchangé) | ~110 |
| `package.json` | + scripts `export:check`, `export`, `lang:gate` (aucune dépendance) | +3 lignes |

**Note d'écart déclaré** (au-delà du littéral D7, justifié) : (a) `enforcement/` ajouté à la liste blanche
(exigé par la mission) ; (b) `scripts/lang-gate.mjs` et `scripts/lang-exempt.json` ajoutés à la liste blanche —
le gate est inopérant dans le dépôt public sans son code ET sa config (même logique que `vocab-banned.json` pour
la gate vocab). `LICENSE` et `apps/site` **tolérés absents** (D7).

## 3. `scripts/lang-exempt.json` — provenance byte-exacte
GÉNÉRÉ une fois par un script lisant les **sources gelées** (jamais retapé à la main) :
`schemas/*.json` `description` (5, verbatim), `schemas/forbidden-keys.json` `forbidden_keys` (12),
`packages/contracts/src/enums.ts` `COVERAGE_REASONS` (13), identifiants `AttestedPrice`
(`octets_recalcules`, `verifier_revision`, `sens_emis_digest`, `residual`, …), clés Shōgen des fixtures
(`empreinte_du_sens_emis`, `revision_amont_deleguee`, `temoignage`), noms propres (Shōgen, Kraidle, MONARK,
HIKAE, UKEMI, nom du corpus de gouvernance), noms de jobs CI (`g1-controle-generation`, `r25-taille-de-lot`),
motifs `ADR-M00x`, `R-xx`, `§`, `harness_version`. Le fichier est **statique et commis** ; la génération sert
uniquement l'exactitude des chaînes gelées.

## 4. Décisions de conception (auditables)

### 4.1 Modèle de scopes
`root` = tous les fichiers de la liste blanche **hors `packages/`** (README, configs, `scripts/`, `schemas/`,
`fixtures/`, `enforcement/`, `.github/`, `test/` racine si exporté — cf. pendant §9.1) ; `contracts|hikae|ukemi|atelier|monark`
= `packages/<nom>/**`. **Chaque exécution calcule les hits de TOUS les scopes** (donnée E-lot gratuite) ; `--scope a,b`
ne pilote QUE le code de sortie (exit 1 ssi un hit non exempté tombe dans un scope sélectionné). Pour ce lot,
`--scope root,contracts` = **VERT** ; global = **ROUGE par conception** (E-hikae/ukemi/atelier non faits).

### 4.2 Détection à DEUX sources (le mutant mord)
Trois signaux, appliqués **après masquage des exemptions** : (1) **diacritiques** au **codepoint** (Node lit l'UTF-8 :
**aucun faux positif octet** `§`/`0xA7` — les « 4 lignes accentuées » de la mission/ADR §1.3 étaient l'octet `0xA7`,
2ᵉ octet de `ç` ; en codepoint, `packages/contracts` et `monark` rendent **0** accent réel) ; (2) **mots FR** (liste
blanche entière) ; (3) **identifiants gelés FR** (`FRENCH_IDENTIFIERS` codé DANS `lang-gate.mjs`). La liste (3) est une
**source SÉPARÉE** de `lang-exempt.json` : retirer un identifiant de l'exempt (mutant M2) le dé-masque et le fait
détecter par (3) ⇒ rouge sur le token. Prouvé §6.

### 4.3 Français gelé, non modifiable — exemption comme liste fermée (zéro-dette, pas un contournement)
- **Descriptions de schéma** (`schemas/*.json` `description`, 5 chaînes) : **français en ASCII** (« Projection d'un
  temoignage… », « Aucun champ… il est interprete par… »), **gelées au byte** par `contracts_frozen`, **interdites
  de modification** (mission : « modification de … schemas/** interdit »). Elles sont exemptées comme **phrases exactes**
  (closed list). Ce n'est PAS « modifier une source pour faire passer la gate » : c'est le mécanisme prévu (liste fermée
  commise), les chaînes sont **byte-exactes** (pas un motif large : elles ne peuvent masquer AUCUN français nouveau), et
  cela permet à la vérif **globale** de virer au vert **après** les lots E (le français gelé est légitime en permanence).
  **Pendant formé** (§9.2) : ré-émettre les schémas en anglais exige un ADR de dé-gel + bump `schema_version` (ADR-M001 D9).
- **Identifiants gelés** (`octets_recalcules`, `verite`, `valide`, …) et **clés de fixtures Shōgen** : exemptés comme termes.

### 4.4 Mots FR omis (faux positifs anglais/code, mesurés — pas devinés)
Retirés de la liste après **itération empirique** sur `root,contracts` : `de`/`du` (collision : nom de job
`r25-taille-de-lot`, regex vocab `(de\s+|of\s+)`) ; `comment` (anglais « code comment » / clé JSON `$comment`) ;
`font` (CSS/typo) ; `ce` (chaîne **hex** sha256 `…c9`**ce**`41…` : `a-f` ne sont pas des lettres-frontière) ;
`son`/`ton`/`ne`/`encore` (mots anglais / abréviations). **Garde-fou de frontière** : un mot FR n'est un hit que
s'il n'est **pas adjacent à une lettre OU un tiret** — donc l'anglais **`un`**`-exemptable` n'est PAS le « un » français
(les composés FR à trait d'union, `peut-être`, rougissent quand même par leur diacritique). Le français prose reste
capté par le/la/les/un/une/est/sont/pour/… La détection finale sur `root,contracts` = **0 hit** (§5).

### 4.5 Liste noire = échec DUR (fail-closed), règle `.md` français = exclusion exempt-aware
Si la liste blanche sélectionnait un chemin de la liste noire (`docs/adr/`, `docs/G1-*`, `packages/*/docs/`, …),
l'export **échoue (exit 1), n'écrit rien** — un **drop silencieux** laisserait le mutant M1 survivre au test 42(a)
(fichier simplement absent ⇒ vert). En revanche un `.md` **de la liste blanche** détecté français (READMEs hikae/ukemi/
atelier) est **exclu de la copie + signalé** (pas fatal, exempt-aware : le `README.md` racine ne porte que le nom propre
du corpus ⇒ **conservé**). `packages/hikae/docs/S2-*` : jamais dans la liste blanche + liste noire ⇒ **absents** (test 42d).

## 5. Oracles (rejouables, sorties exactes)
Depuis `F:\Monark-wt-export`, après `npm ci` (exit 0).

| Oracle | Commande | Résultat |
|---|---|---|
| CI (vocab+typecheck+tests) | `npm run ci` | **tests 84 / pass 84 / fail 0** (83→84, un seul `test()`) |
| Lint | `npm run lint` | **exit 0** (0 problème) |
| Cliquet | `npm run lint:ratchet` | **107/92 → exit 1 (ROUGE pré-existant)** — §8 |
| Gate langue (scopé, oracle du lot) | `npm run export:check -- --scope root,contracts` | **exit 0** (0 chemin interdit, 0 FR non exempté) |
| Gate langue (globale) | `npm run export:check` | **exit 1** — 2782 hits FR (hikae/ukemi/atelier), **attendu** (E-* non faits), déclaré |
| Export write | `npm run export -- --out <tmp>` | **exit 0** — **92 fichiers**, 3 READMEs FR exclus, `EXPORT-MANIFEST.json` écrit |
| Gate langue sur la SORTIE | `node scripts/lang-gate.mjs --dir <tmp> --scope root,contracts` | **exit 0** (test 42c) |
| Manifeste cohérent | recomputation sha256 des 92 fichiers | **92/92** sha256+bytes concordent ; le manifeste **ne se liste pas** |

`ls <tmp>` (racine de la sortie) : `.github/  EXPORT-MANIFEST.json  README.md  enforcement/  eslint.config.mjs
fixtures/  lint-ratchet.json  package-lock.json  package.json  packages/  schemas/  scripts/  tsconfig.json
vocab-banned.json`. Répartition : contracts 16, hikae 22, ukemi 16, atelier 7, monark 2, schemas 5, fixtures 10,
scripts 5 (grep-forbidden, lint-ratchet, export-public, lang-gate, lang-exempt.json), + configs/README/ci.yml/enforcement.
READMEs hikae/ukemi/atelier **exclus** (FR) ; `packages/hikae/docs/` **absent**.

## 6. Mutants (test 42 reste discriminant) — restauration PAR COPIE, sha256 avant/après
Mutation en place, test rejoué, **restauration par copie de fichier** (jamais `git checkout`), backup hors worktree.

- **M1 — un `docs/adr/ADR-M001*.md` glissé dans la liste blanche.**
  `scripts/export-public.mjs` sha256 **AVANT** = `2eaa29c2a841ab781786d3d913609ee9d0f91b49f5aec4057fc8319a3bc90aad`.
  Après mutation : `export --out` ⇒ `export FAILED … forbidden governance path(s) … docs/adr/ADR-M001-phase0-…md`
  **exit 1** ; `export:check --scope root,contracts` ⇒ **exit 1** ; **`node --test test/export-public.test.ts` ⇒
  `pass 0 / fail 1`** (le fail-closed fait lever `execFileSync` ⇒ le test rougit — un drop silencieux ne l'aurait PAS
  fait). Restauré par copie ; sha256 **APRÈS** = `2eaa29c2…` (**identique**).
- **M2 — `octets_recalcules` retiré de `scripts/lang-exempt.json`.**
  `lang-exempt.json` sha256 **AVANT** = `46a7ff75e3ab8adb57143ca6e79ac7b86f7eb600be1f540c52e01e56d15a1e4d`.
  Après mutation : `export:check --scope root,contracts` ⇒ **exit 1** avec **rouge sur `octets_recalcules`** —
  `packages/contracts/src/closed-check.ts:17`, `src/types.ts:62`, `test/fixtures.ts:15`,
  `schemas/attested-price.schema.json:16,61` `[fr-id] octets_recalcules` ; test 42 ⇒ `pass 0 / fail 1`.
  Restauré par copie ; sha256 **APRÈS** = `46a7ff75…` (**identique**).

Après restauration des deux mutants : `git status --short` = exactement `M package.json` + 4 nouveaux fichiers ;
`npm run ci` = **84/84**. Aucun fichier source (`packages/**`, `schemas/**`) modifié pour faire passer la gate.

## 7. Comptage des hits FR par package restant (donnée d'entrée E-lots, D8)
Mesuré par `lang-gate` (hits non exemptés ; inclut READMEs de package, hors `docs/` gouvernance) :

| Package | total | src | test | README | package.json |
|---|---|---|---|---|---|
| **hikae** | **1837** | 1288 | 364 | 176 | 0 |
| **ukemi** | **1209** | 354 | 485 | 363 | 7 |
| **atelier** | **426** | 174 | 100 | 106 | 10 |
| **monark** | **0** | 0 | 0 | 0 | 0 |

Lecture pour l'ordonnancement E (D8) : **`monark` est déjà anglais** (ses « 2 lignes accentuées » ADR §1.3 étaient
2 `§`) ⇒ **E-monark est un no-op de traduction** (à confirmer par le lot, mesure re-jouable). `hikae/src` (1288) domine
⇒ la scission `src`/`test` de D8 est justifiée. `ukemi` et `atelier` : README FR lourd (363, 106) ⇒ à inclure au lot E
du package (la règle `.md` français les exclut de l'export tant qu'ils ne sont pas traduits). Ce sont des **hits**
(plus fin que les lignes accentuées de l'ADR), donc bornes basses du travail de traduction, pas des lignes R-25.

## 8. Cliquet `lint:ratchet` 107/92 — ROUGE **pré-existant**, hors Lot X (inchangé)
Sur HEAD **avant** ce lot, `npm run lint:ratchet` = **107/92 (exit 1)**. Attribution déjà prouvée par les lots
précédents (`docs/G1-lot-E-contracts.md` §9, `docs/G1-lot-E-root.md` §4) : la brèche 92→107 vient de l'ajout
post-`af1f95a` de `packages/hikae/test/interval-conformer.test.ts` (**Lot K**, commit `c05b7f6`), workstream D9 ter,
**pas** ce lot. **Effet de Lot X = 0** : le test 42 (`test/export-public.test.ts`) est **typé** (interface `ManifestEntry`,
cast `as ManifestEntry[]` — aucun `any`, aucun accès `any`) ⇒ **0** violation des 6 règles réactivées ; mesure
**107 avant ET après** ajout du test. **Traitement zéro-dette (P5)** : le plafond n'est **pas** modifié (interdit) ;
le worker ne type pas les fixtures Lot K (hors scope). Résolution = pendant D9 ter déjà formé (typer `interval-conformer.test.ts`)
ou ré-alignement du plafond par ADR — **décision G7 orchestrateur**, jamais un contournement.

## 9. Pendants formés (jamais un dû nu)
### 9.1 **CA-X BLOQUANT MESURÉ** : la CI du dépôt public est ROUGE — incohérences de spec D7 (pas un défaut de Lot X)
CA-X exige « CI verte à distance ». J'ai **simulé le dépôt public** (export frais → `npm ci` (exit 0, offline) →
`npm run ci`) : **77 tests, 75 pass, 2 fail (exit 1)**. J'ai suivi D7 **au littéral** ; les 2 échecs sont des
**incohérences de la spec D7 elle-même** (elle exporte `packages/*/test` en bloc, mais deux de ces tests lisent des
fichiers que D7 **n'exporte pas**), surfacés seulement en exécutant la CI exportée :
1. **`s2_report_reproducible`** (`packages/hikae/test/s2.test.ts:67-68`) lit `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md`
   et `…/S2-journal-fixtures-synth.tsv` — **exclus par décision D7** (« rapports S2 exclus de l'export ; le site rend le TSV »).
   ⇒ `ENOENT` ⇒ **fail** dans le dépôt public.
2. **`atelier_no_network`** (`packages/atelier/test/atelier.test.ts:118`, `assert files.length >= 8`) scanne la **racine du
   paquet** `packages/atelier/` — or ses fichiers de démo rendus (`index.html`, `main.js`, `serve.js`, `style.css`, « 59
   lignes rendues » ADR §1.3) sont **hors liste blanche** (D7 = `packages/*/{src,test,package.json,README.md}` seulement)
   ⇒ surface < 8 ⇒ **fail**.

**Bénin, mesuré** : `node --test` sur le glob **vide** `test/*.test.ts` (racine `test/` hors liste blanche) **n'échoue
PAS** — il exécute simplement les tests `packages/*/test` ; l'absence de la racine `test/` retire 7 tests de gouvernance
(84→77 : `ci_gates`, `contracts_frozen`×2, `fixtures_root`×2, `export_public`, `vocab_monark`) mais ne casse pas la CI.

**Demande de décision orchestrateur/validateur AVANT la première publication** (aucune n'est du ressort du worker —
`packages/**` interdit, et redéfinir D7 serait un changement de périmètre non autorisé) :
(a) exporter aussi les entrées que ces tests lisent (contredit la décision D7 « S2 exclus » et la liste blanche
atelier) ; ou (b) carve-out au niveau **test** dans D7 (ne pas exporter `s2.test.ts` / `atelier.test.ts`, à la façon
dont S2 reste en gouvernance) ; ou (c) rendre ces deux tests tolérants à l'absence de leurs entrées (change `packages/**`,
hors Lot X) ; ou (d) suivre ADR §1.3 (« atelier devient un composant du niveau live », F-live re-rend) et déclarer ces
tests **gouvernance-seule**. Idem pour la racine `test/` (ajouter le sous-ensemble public-pertinent `contracts_frozen`/
`fixtures_root` ?). **Preuve rejouable** : `node scripts/export-public.mjs --out <tmp> && cd <tmp> && npm ci && npm run ci`.

### 9.2 Descriptions de schéma françaises gelées — dé-gel = ADR
Les 5 `description` de `schemas/*.json` sont françaises (ASCII), gelées, exemptées byte-exact (§4.3). Tant qu'elles ne
sont pas ré-émises en anglais, la vérif **globale** restera rouge de leur seul fait **APRÈS** les lots E — sauf que
l'exemption les rend vertes. **Demande** : un lot/ADR futur ré-émet les schémas en anglais (dé-gel `contracts_frozen`
+ bump `schema_version`, ADR-M001 D9) ; alors l'exemption phrase peut être retirée. **Non bloquant pour X/pivot.**

### 9.3 Vérif globale rouge, READMEs FR exclus — attendu, déclaré
`export:check` global = rouge (2782 hits, §5) tant que E-hikae/ukemi/atelier ne sont pas faits ; les 3 READMEs de
package FR sont **exclus** de l'export d'ici là (règle `.md` FR). Conforme à la règle d'honnêteté D1 (« ce qui n'est pas
livré est déclaré »). Propriétaires = les lots E respectifs.

## 10. R-25 (taille de lot)
Commande mission (`git add -N . && git diff --shortstat HEAD -- . ':(exclude)package-lock.json' && git reset`) :

| Mesure | Résultat | Borne |
|---|---|---|
| Mission (exclut `package-lock.json`) | **875** (6 fichiers : 874 ins / 1 sup) | 1205 |
| Variante CI (exclut aussi `docs/G1-lot-*.md`, `docs/G2-lot-*.md`, D9 quater) | **651** (5 fichiers : 650 / 1) | 1205 |

Ventilation : `scripts/lang-gate.mjs` 269, `scripts/export-public.mjs` 208, `docs/G1-lot-X.md` ~224,
`test/export-public.test.ts` 108, `scripts/lang-exempt.json` 61, `package.json` +4/−1. **875 ≤ 1205** : pas de
scission (le code seul = 651 ; ce journal domine le reste et est exempté côté CI). `package-lock.json` **inchangé** par ce lot (aucune dépendance) ; `node_modules/` gitignoré (hors décompte).
Ce rapport est exempté du décompte R-25 côté CI (`ci.yml` : `:(exclude)docs/G1-lot-*.md`, D9 quater).

## 11. Clôture zéro dette
- Livrables : 3 scripts + 1 test + 3 scripts npm, **zéro dépendance**, aucun `eslint-disable`, aucun tier nu.
- Oracles du périmètre **verts** ; gate scopée (oracle du lot) **verte** ; mutants **discriminants** (restaurés byte-exact).
- **Aucune modification** de `packages/**` ni `schemas/**` (mesuré : `git status` = `M package.json` + 4 nouveaux).
- Rouges **déclarés, jamais contournés** : **CI du dépôt public rouge (§9.1, MESURÉE : 2 fail — incohérences D7,
  bloquant CA-X « CI verte à distance », décision orchestrateur avant publication)**, cliquet pré-existant (§8,
  attribué), gate globale (§9.3, attendue), schémas gelés (§9.2, décision formée). Aucun « dû » nu, aucun contournement :
  le worker suit D7 au littéral et surface les incohérences avec preuve rejouable.
- **Aucun commit, aucun push, aucune poussée vers `KraidleAI/monark`** (R-20). Revue G2, verdict G7 et acceptation
  validateur = orchestrateur/validateur.

---

## Suite — addendum D7 (2026-09-06) : liste blanche atelier, exclusion des tests gouvernance, CI d'export (test 42(e))

*Continuation du journal — **artefact de gouvernance interne, français, hors export** (cf. §1 et liste noire
`docs/G1-*`) ; le **code** ajouté est en anglais. Worker `claude-opus-4-8[1m]`, effort max, 2026-09-06 ; applique
**ADR-M004 Addendum D7 (2026-09-06)** en réponse au finding §9.1. Aucun commit/push (R-20). GATE-0 : modèle résolu
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`).*

### S1. Ce qui est appliqué (littéral de l'addendum)
- **(a) Liste blanche** : `packages/atelier/{index.html,main.js,style.css,serve.js}` ajoutés à `WHITELIST_FILES`
  (fichiers de démo à la **racine** du paquet, hors `src/` — non couverts par `PACKAGE_SUBPATHS`).
- **(b) `scripts/export-exclude-tests.json`** (liste fermée commise) `{reason, tests:["packages/hikae/test/s2.test.ts"]}`.
  `export-public.mjs` la lit **fail-closed** (`loadExcludedTests`) : absente / illisible / `tests` non-tableau ⇒ `exit 1` ;
  **`tests: []` est valide** (rien d'exclu — support du mutant M4 et du pendant E-hikae). `collectFiles` retire les tests
  exclus ; le manifeste devient un **objet** `{ files:[{path,sha256,bytes}], excluded_tests:[…] }` (était un tableau plat ;
  **seul** le test 42(b) lit ce manifeste — le test 44 lit `apps/site/data/manifest.sha256.json`, distinct).
- **(e) Test 42 assertion (e)** : dans le `mkdtemp` d'export, `npm ci` puis `npm run ci` via `spawnSync` (`shell:true`,
  **commande en chaîne unique** pour éviter **DEP0190**, `stdio:"pipe"`, `timeout 600000`, `maxBuffer 64 MiB`) ; exige
  `status===0` ; le message d'assertion imprime `tests N / pass N / fail N` en cas d'échec. **Piège mesuré** : `node --test`
  propage `NODE_TEST_CONTEXT`/`NODE_TEST_WORKER_ID` ; un `node --test` imbriqué qui en hérite **saute les fichiers**
  (« run() called recursively ») ⇒ faux vert. Corrigé : l'env enfant est **purgé de `NODE_TEST_*`**. La vérification
  structurelle de `excluded_tests` est **relative à la config** (compare `manifest.excluded_tests` au fichier commis),
  pour que M4 rougisse en **(e)** (ENOENT) et non sur cette vérification (advisor, point 4).

### S2. Oracles (rejouables, mesurés le 2026-09-06)
| Oracle | Commande | Résultat |
|---|---|---|
| Gouvernance CI | `npm run ci` | **tests 84 / pass 84 / fail 0**, exit 0 (assertions ajoutées au **seul** `test()` 42 ; compte inchangé) |
| Lint / typecheck | `npm run lint` ; `npm run typecheck` | **exit 0** / **exit 0** |
| Gate scopée (oracle du lot) | `npm run export:check -- --scope root,contracts` | **exit 0** (root 0, contracts 0) |
| **CI du dépôt public** | export `mkdtemp` → `npm ci` → `npm run ci` | **`npm ci` exit 0 (~2 s, offline, cache npm)** ; **`npm run ci` : tests 73 / pass 73 / fail 0, exit 0** |

**§9.1 RÉSOLU** : la CI du dépôt public simulée est **verte** (73/73/0). L'atelier passe (`atelier_no_network`,
surface 9 ≥ 8) ; les 4 tests de `s2.test.ts` sont hors export (dont `s2_report_reproducible`, qui lisait le rapport
S2 **français** exclu). `npm ci` mesuré **~2 s** (≪ 3 min) ⇒ clause « garder l'assertion sans `skip` » satisfaite sans
consigne de lenteur. Note : le rapporteur `node --test` imprime le résumé en préfixe **spec `ℹ`** ici (non-TAP `#`) ;
`summaryCount` tolère les deux (`[#ℹ]`).

**Réconciliation du compte (chiffre mesuré, pas de seconde main)** : le parenthétique de mission « 77 − 3 tests s2 = 74 »
est un **off-by-one**. La suite **exportée** = **77** `test()` (mesuré : atelier 5, contracts 41, hikae 23, ukemi 8) ;
`packages/hikae/test/s2.test.ts` porte **4** `test()` (`fixtures_hash_stable` L26, `s2_campaign_deterministic_and_coherent`
L50, `s2_report_reproducible` L64, `s2_predictors_wired` L80), pas 3. **77 − 4 = 73**. L'exclusion est **au grain fichier**
(scinder `s2.test.ts` toucherait `packages/**`, interdit). `error_origin` = **texte de mission/orchestrateur** (comptage s2).

### S3. Mutants (test 42 reste discriminant ; restauration PAR COPIE, backup hors worktree, sha256 avant/après identiques)
- **M3-littéral (mutant de mission : retirer SEUL `packages/atelier/index.html`)** ⇒ test 42 **VERT** (rc 0) —
  **NON DISCRIMINANT**. `packages/atelier/src` a **5** `.ts` ; surface d'export atelier = 5 src + 4 racine = **9** ;
  `atelier_no_network` exige `files.length >= 8` ; en retirer **un** laisse **8 ≥ 8** ⇒ passe. Le « ⇒ 42(e) rouge » de la
  mission **ne tient pas** pour une suppression **unique** (borne 9 vs 8). `error_origin` = texte de mission (même classe
  d'off-by-one que le compte s2). `export-public.mjs` sha256 avant =
  `3d8e752f8e21dfa95752936acf266a48c8c9abf333b888bac82dd7c1861b04e8` ; après restauration = **identique**.
- **M3-discriminant (retirer les QUATRE fichiers atelier = annuler l'ajout (a))** ⇒ test 42 **ROUGE** — assertion (e) :
  `tests 73 / pass 72 / fail 1` (`atelier_no_network` échoue, surface **5 < 8**). Reproduit exactement le rouge atelier
  **pré-addendum** de §9.1 ⇒ les 4 entrées de liste blanche sont **collectivement porteuses** (satisfait D11 : ce test est
  tué par ≥ 1 mutant nommé). sha256 `export-public.mjs` avant/après = `3d8e752f…b04e8` (**identique**).
- **M4 (vider `tests` dans `export-exclude-tests.json`)** ⇒ test 42 **ROUGE** — assertion (e) : `tests 77 / pass 76 / fail 1`.
  `s2.test.ts` ré-exporté ⇒ `s2_report_reproducible` **ENOENT** sur `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md`
  (liste noire structurelle). La vérification (b/d) reste **verte** (`excluded_tests = [] =` config) ⇒ le rouge est bien en
  **(e)**, comme spécifié. `export-exclude-tests.json` sha256 avant =
  `5080631544811857520eca9c2d8a534d3d8954a5ce109dbd3f3222b9ae7ec69c` ; après restauration = **identique**.

**Fail-closed de `export-exclude-tests.json` (exigence de la tâche 2, MESURÉ ; corruption temporaire, restauré par
copie, sha256 = `5080631544…ec69c` après).** Quatre chemins, tous **`exit 1`**, `--out` **jamais créé**
(`collectFiles`→`loadExcludedTests` sort **avant** `mkdirSync`) :
- **absente** (renommée) : `export FAILED … is missing or unparseable … ENOENT …` ; répertoire de sortie **non créé** (mesuré) ;
- **illisible** (`{`) : `export FAILED … is missing or unparseable … Expected property name or '}' …` ;
- **mauvaise forme** (`{"tests":"x"}`) : `export FAILED … must be an object with a "tests" array` ;
- **`--check` hérite** : `npm run export:check -- --scope root,contracts` sur la mauvaise forme ⇒ `exit 1`, même message.

Après restauration des 3 mutations : `git status --short` = `M package.json` + **6** nouveaux fichiers (les 5 du Lot X +
`scripts/export-exclude-tests.json`) ; `npm run ci` = **84/84**. **Aucun** `packages/**` ni `schemas/**` modifié pour
faire passer un test.

### S4. Pendants formés (jamais un dû nu)
- **`scripts/export-exclude-tests.json` NON ajouté à la liste blanche** (décision) : la tâche 1 énumère les ajouts (les 4
  fichiers atelier **seuls**) ; le dépôt public **n'exécute jamais l'export** (sa CI = `gate:vocab`+`typecheck`+`test`, et la
  racine `test/` qui exerce `export-public.mjs` **n'est pas exportée**), donc `export-exclude-tests.json` n'y est pas requis.
  Si une décision future veut `export-public.mjs` **exécutable dans** le dépôt public, ajouter cette entrée à la liste
  blanche (une ligne). **Non bloquant** — décision orchestrateur.
- **s2.test.ts (inchangé, ADR addendum)** : quand E-hikae émet `scripts/s2-report.mjs` en anglais (nouveau sha256 du
  rapport, test byte-exact rejoué), le rapport et `s2.test.ts` rentrent dans l'export et `export-exclude-tests.json` se **vide**.

### S5. R-25 (re-mesuré, addendum inclus)
Commande mission (`git add -N . && git diff --shortstat HEAD -- . ':(exclude)package-lock.json' && git reset`) :
**1090 insertions / 1 suppression** (7 fichiers), borne **1205** ⇒ **OK** (marge 115). Variante CI (exclut aussi
`docs/G1-lot-*.md`, D9 quater) : **772 / 1** (6 fichiers). Ventilation (`git diff --stat`) : `scripts/lang-gate.mjs` 269,
`scripts/export-public.mjs` 249, `test/export-public.test.ts` 185, `docs/G1-lot-X.md` 308 (CI-exempté), `scripts/lang-exempt.json`
61, `scripts/export-exclude-tests.json` 4, `package.json` +4/−1. `package-lock.json` inchangé (aucune dépendance).

### S6. Interdits respectés
Pas de `packages/**`/`schemas/**` ; pas d'`eslint-disable` ; pas de push ; pas de tier nu. **Revue G2 / verdict G7 /
acceptation validateur = orchestrateur** (R-21). Chaque chiffre/commande de cette suite est rejouable.

---
*Worker `claude-opus-4-8[1m]`, effort max. Chaque chiffre/commande est rejouable (R-21). Le worker ne committe pas (R-20).*

---

## Suite 2 — D7 bis (2026-09-06) : corrections post-revue G2 (réserves R1–R4, finding MINE-B)

*Continuation — **artefact de gouvernance interne, français, hors export** (liste noire `docs/G1-*`) ; le **code**
ajouté/modifié est en anglais. Worker `claude-opus-4-8[1m]`, effort max, 2026-09-06 ; applique **ADR-M004 Addendum
D7 bis** (`F:\Monark\docs\adr\ADR-M004-infrastructure-plateforme.md` l.84-89) en réponse aux 4 réserves de
`docs/G2-lot-X.md` §D. Aucun commit/push (R-20) ; aucune poussée vers `KraidleAI/monark`.*

**GATE-0 (R-1)** : modèle résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié tel quel), effort `max`,
Opus 5 banni non utilisé, aucun tier nu. Instance de relance (la précédente est morte à la planification, **zéro
édition faite** — repartie des constats réutilisés de la mission).

### SS0. Plan (arrêté AVANT code) et cadrage advisor

**Réserves traitées (source : ADR-M004 D7 bis l.85-88 + G2 §D)** :
- **R1** — `export-public.mjs` **dérive** `.github/workflows/ci.yml` (réécriture textuelle déterministe, zéro
  dépendance) : ajoute le déclencheur `push` sous `on:`, retire tout le job `r25-taille-de-lot`, préfixe un
  commentaire de provenance, **reste byte-identique** ; **fail-closed** (exit 1) si le bloc `on:` ou le job r25
  sont introuvables. Test 42(f) = assertions permanentes sur le workflow exporté.
- **R2(a)** — toute entrée de liste blanche **absente** ⇒ exit 1 (message), **seule tolérance `apps/site`**.
  `LICENSE` (non tolérée) est absente ⇒ l'export réel **échoue** (voulu, tant que Q4 investisseur n'est pas tranché).
  Le test exporte donc depuis une **copie temporaire** de l'arbre + `LICENSE` factice.
- **R3** — `enforcement/` confirmé en liste blanche (script `lint-model-pinning.sh`, anglais, requis par le job g1
  exporté) ; **commentaire citant D7 bis R3**.
- **R4** — liste noire de gouvernance **évaluée en premier** (fail-closed) AVANT la règle « `.md` français = exclusion
  avec rapport » ; **commentaire fixant l'ordre** (rend MINE-B impossible). Test 42(g) = mutant manuel MINE-B.

**Mécanique du test (un seul `test()` 42 ; compte racine reste 84)** : le test importe impossible le `.mjs`
(`tsconfig` strict `nodenext` sans `allowJs` ⇒ TS7016) ⇒ tout passe par `child_process`. Il construit une **copie
temporaire de l'arbre entier** (`cpSync`, filtrée de `node_modules`/`.git`/`dist`) + `LICENSE` factice, puis exécute
le script **copié** `tempSrc/scripts/export-public.mjs --out <out>` (le `REPO_ROOT` du script résout vers `tempSrc`
via `import.meta.url` ; **pas de flag `--root` ajouté** — évite un écart hors-D7, la classe de réserve R3).

**Cadrage advisor (consultation intégrée, avant travail substantiel ; pas d'extrait sous droits dans le transcript)
— 2 angles morts relevés + 5 décisions** :
1. **Copie temporaire = arbre ENTIER, pas chirurgicale.** `collectFiles(root)` lit `<root>/scripts/export-exclude-tests.json`
   **fail-closed**, or ce fichier n'est **pas** en liste blanche (décision S4) ⇒ une copie « liste blanche + `.github` »
   seule provoquerait `exit 1` **pour la mauvaise raison** (`loadExcludedTests` sort avant tout). L'arbre entier moins
   `node_modules`/`.git`/`dist` est la **seule** copie correcte (et elle contient déjà `scripts/{export-public,lang-gate}.mjs`,
   `lang-exempt.json`, `export-exclude-tests.json` ⇒ le script copié tourne, et les mutants **mordent** car `cpSync`
   recopie le script réel *muté* au moment du test).
2. **R-25 — deux variantes, la variante CI fait foi.** La variante « mission » (`git add -N` puis diff excluant le seul
   `package-lock.json`) capte désormais `docs/G2-lot-X.md` (248 l., créé par la revue G2) ⇒ elle **dépasse** 1205 du seul
   fait des **docs de gouvernance**. La variante **CI** (D9 quater — `ci.yml` l.49 exclut `docs/G1-lot-*.md`,
   `docs/G2-lot-*.md`, `package-lock.json`) est celle **réellement gatée** ⇒ **autoritaire**. Les DEUX seront collées ;
   le dépassement mission = gouvernance (**error_origin ≠ code du worker**), jamais masqué.
3. **`--root` inutile** (cf. mécanique ci-dessus) : script copié exécuté depuis `tempSrc`.
4. **`doExport` ET `doCheck` fail-closent** sur entrée requise absente ; conséquence déclarée : l'oracle S2 l.253
   (`export:check --scope root,contracts` sur le worktree nu) **exit 1** désormais (LICENSE absente — voulu) ; la gate
   scopée verte est prouvée via `lang-gate --dir <export>` (= 42c) et via l'export depuis la copie temporaire.
5. **42(f) = assertions permanentes ; 42(g) = mutant manuel** (la liste blanche ne s'injecte pas par `child_process`).
   Dans `doExport`, `structuralViolations` est testé **avant** `missingRequired` (garde l'en-tête « forbidden governance
   path » pour M6). Preuve byte-identique dans l'oracle (derivé = 67 l. = 96 + en-tête + push − 31 l. du job r25).

### SS1. Ce qui est appliqué (R1–R4)

**R1 — dérivation de `.github/workflows/ci.yml`.** Nouvelle section `3. DERIVE THE PUBLIC CI WORKFLOW`
(`scripts/export-public.mjs` l.185-217) : `CI_WORKFLOW_PATH` (l.195), `DERIVED_HEADER` (l.196, exactement le
commentaire de mission), `derivePublicWorkflow(raw)` (l.199). Transformation **déterministe, zéro dépendance**,
EOL-détectée (`\r\n`/`\n`) :
- (1) `on:\n  pull_request:` → `on:\n  push:\n  pull_request:` ;
- (2) job `r25-taille-de-lot` retiré (ligne-clé à 2 espaces jusqu'au prochain job à 2 espaces via `/^ {2}\S/` ;
  tout le corps r25 est à ≥ 4 espaces ⇒ premier re-match = `g3-verification`) ;
- (3) commentaire de tête `DERIVED_HEADER` préfixé ;
- (4) **suppression du commentaire « Delivery flow » (2 lignes, source l.11-12)** — voir ci-dessous.
**Fail-closed (exit 1)** si le bloc `on:` (l.201-204) ou le job r25 (l.207-210) sont introuvables. `doExport`
pré-calcule la dérivation **avant toute écriture** (`const derived = new Map()`, l.253) et écrit le contenu dérivé
au lieu de copier (`writeFileSync` conditionnel dans la boucle) ; toute autre entrée est copiée verbatim.

**Rule (4) — décision adjugée (advisor 2026-09-06), `error_origin = orchestrateur`.** La source l.12
(`# A direct push produces no run (and \`github.base_ref\` would be empty for r25) — by design.`) et sa compagne
l.11 (`# Delivery flow (ADR-M003 D9 bis): …`) survivraient à « reste byte-identique » ⇒ `grep -c r25` = **1**, en
**conflit** avec l'oracle de mission `grep -c r25 = 0`. La ligne est de plus **fausse** dans la vitrine (j'ajoute
un déclencheur `push` ⇒ une poussée directe DÉCLENCHE une exécution ; il n'y a pas de r25) et **contredit** l'en-tête
préfixé deux lignes plus haut. Arbitrage : l'oracle `grep=0` est le **critère d'acceptation**, « byte-identique »
est une **description de méthode** écrite sans voir la l.12. La transformation retire donc la paire (ancrée sur les
préfixes ASCII uniques — la l.12 porte un em-dash U+2014, un `===` complet serait fragile au codepoint ;
`derivePublicWorkflow` l.211-217), **remove-if-present, PAS fail-closed** (rien de gouvernance-spécifique à retirer
si un futur workflow ne l'a pas). Les **jobs** (SHA épinglés, « no continue-on-error ») restent byte-identiques.
**Considéré et CONSERVÉ (advisor)** : les l.15-16 source (`# Rewritten by the orchestrator … to the specification of
docs/G1-lot-V.md + docs/G2-lot-V.md`) citent des docs de gouvernance absents de la vitrine, MAIS c'est une
**provenance exacte** (histoire vraie), non une **affirmation comportementale fausse** comme la l.12 ⇒ l'argument de
rule (4) ne porte pas ; on ne retire pas une provenance vraie (et elles ne portent ni `r25` ni français ⇒ n'affectent
ni l'oracle `grep` ni 42c).

**R2(a) — entrée de liste blanche absente ⇒ exit 1.** `TOLERATED_ABSENT = new Set(["apps/site"])` (l.58) ;
`collectFiles` accumule `missingRequired` (l.113) via les boucles de liste blanche **fixe** (dirs/files) qui
poussent toute entrée absente **non tolérée**. `doExport` (l.246-250) ET `doCheck` fail-closent dessus. `apps/site`
= **seule** tolérance (D7). `LICENSE` **non tolérée** ⇒ l'export réel depuis le worktree **échoue** (mesuré SS2).
Les `PACKAGE_SUBPATHS` restent optionnels par paquet (gardés par `existsSync` avant `addFile/addDir`).
**R1 × `--check` (correction advisor)** : `doCheck` exerce AUSSI `derivePublicWorkflow` (résultat ignoré) ⇒ un
dry-run `--check` ne peut PAS rester vert alors que l'export réel échouerait fail-closed sur un workflow non
dérivable (sinon fail-open de la classe R2(a)). Mesuré SS2 : `--check` sur une copie dont le `pull_request:` est
retiré ⇒ **exit 1** (« on / pull_request trigger block not found ») — **vert avant** le correctif.

**R3 — `enforcement/` confirmé en liste blanche.** Commentaire `WHITELIST_DIRS` l.33-36 citant **D7 bis R3**
(script `lint-model-pinning.sh`, anglais, requis par le job g1 exporté ; D7 amendé).

**R4 — ordre liste noire AVANT règle `.md` FR.** Commentaire `ORDER IS LOAD-BEARING` (l.153-157) dans la boucle
de classification : (1) liste noire structurelle **fail-closed, en PREMIER** ; (2) tests gouvernance-only ;
(3) `.md` FR = exclusion **rapportée, non fatale**. Le code appliquait déjà cet ordre ; il est désormais **explicite
et documenté** (une réécriture qui inverserait l'ordre rendrait MINE-B possible). Prouvé par le mutant **M6** (SS3).

**Test (un seul `test()` 42, compte racine 84 inchangé).** En-tête mis à jour (D7 bis, assertion (f), mutants
M5/M6, mécanique copie temporaire). Le test construit une **copie temporaire de l'arbre ENTIER** (`cpSync`, filtre
`node_modules`/`.git`/`dist`, l.103-116) + `LICENSE` factice, puis exécute le script **copié** (`REPO_ROOT` résout
vers la copie via `import.meta.url` — **aucun flag `--root` ajouté**, évite l'écart hors-D7 de classe R3). Copie
ENTIÈRE obligatoire : `collectFiles` lit `scripts/export-exclude-tests.json` fail-closed, or ce fichier n'est **pas**
en liste blanche (une copie chirurgicale sortirait en exit 1 pour la mauvaise raison — advisor). Assertion **(f)**
(l.169-191) : `!/r25/` (bare, = oracle `grep -c r25 = 0`, subsume le job), `push` sous `on:`, ≥ 2 SHA épinglés,
**0 directive `continue-on-error`** — clé YAML `/^\s*continue-on-error\s*:/`, **le commentaire en prose est autorisé**
(miroir exact de test 38, `test/ci-gates.test.ts:31` ; le commentaire source l.4 « No continue-on-error » est VRAI,
conservé).

**Conséquence déclarée (advisor, décision 4)** : `export:check` sur le worktree nu **exit 1** désormais (LICENSE
absente — voulu ; l'oracle S2 l.253 pré-D7-bis est remplacé). La gate scopée verte se prouve via `lang-gate --dir
<export>` (= 42c) et via l'export depuis la copie temporaire (SS2).

### SS2. Oracles (rejouables, mesurés le 2026-09-06)

| Oracle | Commande | Résultat |
|---|---|---|
| Gouvernance CI | `npm run ci` | **tests 84 / pass 84 / fail 0**, exit 0 (9,4 s ; test 42 = **un seul** `test()`, compte inchangé) |
| Typecheck / Lint | `npm run typecheck` ; `npm run lint` | **exit 0** / **exit 0** (`.ts` du test strict `nodenext` + `noUncheckedIndexedAccess` ; `.mjs` ignorés par eslint) |
| **R2(a) export réel** (worktree, LICENSE absente) | `node scripts/export-public.mjs --out <tmp>` | **exit 1** — `export FAILED … required whitelist entr(ies) missing … LICENSE` ; **répertoire NON créé** (rien écrit) |
| R2(a) `export:check` worktree nu | `node scripts/export-public.mjs --check --scope root,contracts` | **exit 1** (LICENSE absente) |
| **Export depuis copie temporaire** (+ LICENSE factice) | copie arbre **118 ms** → export **732 ms** | **export OK — 96 fichiers** ; `s2.test.ts` exclu (1) ; 3 READMEs FR exclus |
| **`grep -c r25`** sur `ci.yml` exporté | `grep -c r25 .github/workflows/ci.yml` | **0** |
| **CI du dépôt public** (dans l'export) | `npm ci` ; `npm run ci` | `npm ci` **exit 0, 0 vuln** ; **tests 73 / pass 73 / fail 0** |
| Lint du dépôt public (dans l'export) | `npm run lint` | **exit 0** |
| Gate langue scopée sur la SORTIE (= 42c) | `node scripts/lang-gate.mjs --dir <export> --scope root,contracts` | **exit 0** |

**Preuve R1 byte-identique (isolée, `derivePublicWorkflow` sur le `ci.yml` réel)** : source 96 → dérivé **65**
(split-lignes = 96 + en-tête + `push` − 31 job r25 − 2 commentaire delivery-flow) ; en-tête = l.1 ; `push` sous `on:`
présent ; **2 SHA distincts** ; **0 directive** `continue-on-error` ; newline de fin préservé ; `grep -c r25` = **0**.
`diff(source, dérivé−en-tête−push)` = **exactement 2 hunks** : le commentaire delivery-flow (l.11-12) et le job r25
(l.29-59). Rien d'autre ne diffère.

### SS3. Mutants (test 42 discriminant ; restauration PAR COPIE, backup hors worktree — scratchpad ; sha256 avant/après)

`scripts/export-public.mjs` sha256 **baseline** = `06f01c7ea7a79486a1ac7fcd4ca2fc6ed5394a856e670f77a4248bc38a06b5f5`
(= état final revu, doCheck-derive inclus). Rejeu direct `node --test test/export-public.test.ts`.

| Mutant | Mutation (sha256 mutant) | Résultat test 42 | Discriminant ? |
|---|---|---|---|
| **M5** (R1) court-circuit : `return raw` en tête de `derivePublicWorkflow` | `c5eca62983…229235a7` | `tests 1 / pass 0 / **fail 1**` — `AssertionError: exported workflow must contain no r25 reference (D7 bis R1; grep -c r25 = 0)` (**assertion f**) | **OUI** |
| **M6** (R4, MINE-B) `docs/JOURNAL-PROVENANCE.md` glissé en `WHITELIST_FILES`, règle FR active | `25e6bdf81f…52386ad0` | `tests 1 / pass 0 / **fail 1**` — export **FAILS HARD** : `the whitelist selected forbidden governance path(s) (blacklist, D7): docs/JOURNAL-PROVENANCE.md` | **OUI** |

**M6 prouve R4** : un fichier de gouvernance **français** en liste blanche est capté **fail-closed par la liste noire
structurelle** (évaluée EN PREMIER), **jamais** masqué silencieusement par la règle `.md` FR ⇒ le finding MINE-B (G2 §B)
est **impossible**. Les deux mutants **restaurés PAR COPIE** ; sha256 **APRÈS = baseline** `06f01c7e…a06b5f5`
(byte-exact) pour chacun.

### SS4. R-25 (deux variantes ; méthode G1 §S5 `git add -N . && git diff --shortstat HEAD -- . <exclusions> && git reset`, index-only, R-20 respecté)

| Variante | Exclusions | Mesure | Borne | Verdict |
|---|---|---|---|---|
| **CI (D9 quater, `ci.yml` l.49)** — **AUTORITAIRE, seule gatée** | `package-lock.json`, `docs/G1-lot-*.md`, `docs/G2-lot-*.md`, `packages/*/docs/S2-*` | **936 ins / 1 sup** (6 fichiers) | 1205 | **OK** (marge 269) |
| Mission | `package-lock.json` seul | **= CI + (G1+G2 ins)** = 936 + G_ins (formule, docs-dominé) | 1205 | dépasse (docs seuls) |

**La variante CI est un chiffre STABLE et autoritaire : 936 (code seul) ≤ 1205 (marge 269)** — seule gatée (`ci.yml`
job r25 exclut `docs/G1-lot-*.md`/`docs/G2-lot-*.md`/`package-lock.json`, D9 quater). La variante **mission** est
donnée en **formule** et non en nombre figé, car elle compte `docs/G1-lot-X.md` — **ce journal, qui grossit en
documentant sa propre mesure** : **mission = 936 (code) + insertions (`docs/G1-lot-X.md` + `docs/G2-lot-X.md`), le G1
compté à l'instant de la mesure** ⇒ un re-mesurage par le relecteur concorde **par construction**. Indicatif à
l'écriture : `docs/G2-lot-X.md` = 247 (figé), `docs/G1-lot-X.md` ≈ 500 (croît), mission ≈ 1680. Ventilation **code**
(stable) : `scripts/export-public.mjs` **355**, `scripts/lang-gate.mjs` 269 (**inchangé** ce pass, hérité),
`test/export-public.test.ts` **243**, `scripts/lang-exempt.json` 61 (inchangé), `scripts/export-exclude-tests.json` 4
(inchangé), `package.json` +4/−1 = **936**. Le dépassement de la variante mission est **entièrement** de la
documentation de gouvernance que la gate CI **exclut par conception** (D9 quater, ADR-M003 ; test 38 (4bis) le
vérifie) ⇒ `error_origin = orchestrateur/gouvernance`, **jamais** le code du worker. Aucune scission requise ; aucune
dette ; aucun contournement. Delta de ce pass sur le code : `export-public.mjs` +106 (249→355), `test` +58
(185→243) = +164 (772 → 936).

### SS5. Interdits respectés / clôture

- **Aucun** `packages/**` ni `schemas/**` modifié : `git status --short` = `M package.json` + **7** non-commités
  (les 5 fichiers Lot X + `docs/G1-lot-X.md` + `docs/G2-lot-X.md`). `package-lock.json` **inchangé** (0 dépendance nouvelle, R-8).
- **Aucun** `eslint-disable` / `@ts-ignore` / `@ts-expect-error` ajouté ; **aucun** tier de modèle nu ; **aucun** push ;
  **aucune** poussée vers `KraidleAI/monark` (R-20). Le worker ne committe pas.
- **Aucun double-échec** : les deux mutants discriminants au premier rejeu ; tous les oracles verts. **Advisor**
  consulté 3× (cadrage avant code ; réconciliation R1/oracle `grep` ; clôture) — **conseil, jamais verdict** (R-26).
- **Zéro dette** : l'unique décision d'écart (rule (4) : suppression du commentaire delivery-flow) est **adjugée**
  (advisor) et documentée avec `error_origin = orchestrateur` ; le dépassement R-25 mission = docs de gouvernance
  (gate CI les exclut). **Revue G2 / verdict G7 / acceptation validateur = orchestrateur** (R-21) ; chaque
  chiffre/commande de cette suite est **rejouable**.

---
*Worker `claude-opus-4-8[1m]`, effort max. Chaque chiffre/commande est rejouable (R-21). Le worker ne committe pas (R-20).*
