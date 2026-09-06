claude-opus-4-8[1m]

# G2 — Revue Lot X (export public + gate de langue) — ADR-M004 D7 (+ addendum 2026-09-06), D11 test 42, CA-X

## GATE-0 (R-1) — contrôle de résolution du relecteur
- **Modèle résolu (relecteur G2) :** `claude-opus-4-8[1m]` — préfixe attendu `claude-opus-4-8` vérifié tel quel.
- **Effort :** `max` (roster mainteneur 2026-08-14). **Opus 5 banni** : non utilisé. Aucun tier nu.
- **Rôle :** relecteur G2, **instance séparée, contexte frais, ≠ générateur** (G1 = autre worker).
- **Date :** 2026-09-06. **Worktree :** `F:\Monark-wt-export`, branche `lot-x-export` (non commité). **Node** v24.15.0 / **npm** 11.12.1.
- **Interdits respectés :** aucun commit/push (R-20) ; aucune poussée vers `KraidleAI/monark` ; mutants restaurés
  **PAR COPIE** (jamais `git checkout`), sha256 avant/après **identiques** ; aucun `packages/**` ni `schemas/**` modifié.
- **Environnement du relecteur** : advisor intégré consulté 1 fois (cadrage, avant travail substantiel — pas un blocage,
  aucun extrait PDF sous droits dans le transcript). Tout chiffre/commande ci-dessous est **rejouable** (R-21).

---

## VERDICT : **CLOS-AVEC-RÉSERVES** (liste fermée de 4 réserves, ci-dessous §D)

Les **livrables Lot X sont sains** : tous les oracles du périmètre sont verts, les 4 mutants nommés + 1 mutant de mon
cru sont **discriminants**, les exemptions sont **byte-exact**, zéro dépendance, code **English-only**, restauration
byte-exact. **Aucun défaut de code, aucune dette nue, aucun contournement.** Les réserves portent sur des **écarts de
spec D7 / addendum** (error_origin = orchestrateur) qui **ne relèvent pas du worker** et exigent une décision avant la
**première publication** — la principale (**R1**) est que **CA-X « CI verte à distance » n'est pas établie** : le
workflow exporté est celui du dépôt de gouvernance (PR-par-lot), pas du dépôt vitrine (un commit par export).

---

## A. CONFORMITÉ (conforme / réserve / défaut — fichier:ligne)

### A.1 `scripts/export-public.mjs` — liste blanche, liste noire, exclusions, manifeste, `--check` (tâche 1)

| Point | Verdict | Preuve |
|---|---|---|
| Liste blanche ≡ D7 : `packages/*/{src,test,package.json,README.md}`, `schemas/`, `fixtures/`, `apps/site` (toléré absent), configs, 5 `scripts/*` | **conforme** | `export-public.mjs:32-47` ; `PACKAGE_SUBPATHS` l.32, `WHITELIST_DIRS` l.33, `WHITELIST_FILES` l.34-47 |
| Addendum (a) : 4 fichiers atelier `index.html,main.js,style.css,serve.js` dans la liste blanche | **conforme** | `export-public.mjs:45-46` ; export réel les copie (surface atelier 9) |
| Liste noire ≡ D7 (défense en profondeur, **fail-closed** sur inclusion) | **conforme** | `export-public.mjs:50-58` (8 patterns) ; **fail-closed prouvé** par M1/MINE-A : export « FAILED … forbidden governance path(s) », **exit 1, rien écrit** (dir non créé) |
| `docs/` absent de la sortie | **conforme** | `find <export> -type d -name docs` = **0** |
| `.github/workflows/ci.yml` exporté (répertoire caché) | **conforme** | présent dans la sortie (4689 o) |
| `export-exclude-tests.json` lu **fail-closed** | **conforme** | `export-public.mjs:72-86` ; rejoué indép. : **absent** → `exit 1, --out NON créé` ; **malformé** (`{`) → `exit 1, --out NON créé` ; `--check` hérite → `exit 1` ; `tests:[]` = valide |
| Manifeste `{files:[{path,sha256,bytes}], excluded_tests}` | **conforme** | `export-public.mjs:178` ; recompute **indépendant** : 95 entrées, **0 mismatch** sha256/bytes, ne se liste pas, 0 fichier de sortie hors manifeste |
| `--check` (scopes, exit code) | **conforme** | scoped `root,contracts` exit 0 ; global exit 1 |
| **Zéro dépendance** | **conforme** | imports = `node:fs/path/crypto/url` + local `./lang-gate.mjs` (l.20-24) ; `package-lock.json` **inchangé** (git status) |
| **Écart R3** : `enforcement/` dans `WHITELIST_DIRS` — **absent de D7** | **réserve** | `export-public.mjs:33` ; G1 §2 « exigé par la mission » (non visible du relecteur). Contenu = `enforcement/lint-model-pinning.sh` **seul** (anglais, aucune fuite gouvernance) → confirmation orchestrateur due |
| **Écart** : `scripts/lang-gate.mjs` + `lang-exempt.json` dans la liste blanche (hors D7 littéral) | **conforme (défendable)** | l.40 ; le gate est **inopérant** dans le dépôt public sans son code+config (même logique que `vocab-banned.json`) |
| **Écart R2** : `LICENSE` traité « toléré absent » — D7 l.76 ne tolère QUE `apps/site` | **réserve** | `LICENSE` absent du worktree ; `addFile` (l.102-105) **saute silencieusement** toute entrée absente (fail-**open** sur absence, non signalé, non fatal) |
| **Écart R4** : règle `.md` FR = exclusion+report (non fatal) | **réserve** | `export-public.mjs:140, 185-188` ; D7 l.77 liste « tout .md en français » **dans** la liste noire (= fail-closed selon la mission). Raisonnement G1 §4.5 correct, mais **déviation du littéral à adjuger** |

### A.2 `scripts/lang-gate.mjs` + `scripts/lang-exempt.json` — exemptions byte-exact, pas d'exemption large (tâche 2)

- **Byte-exact des sources gelées — VÉRIFIÉ programmatiquement** (script `verify-exempt.mjs`, croise `enums.ts`,
  `schemas/*.json`, `forbidden-keys.json`) : **40 termes / 8 phrases / 4 patterns**.
  - 13/13 `COVERAGE_REASONS` (`packages/contracts/src/enums.ts:7-21`) ⊂ terms — **conforme**.
  - 12/12 `forbidden_keys` (`schemas/forbidden-keys.json`) ⊂ terms — **conforme**.
  - 6 champs `attested-price` (`residual, utterance, observed_at, octets_recalcules, verifier_revision, sens_emis_digest`,
    `schemas/attested-price.schema.json`) ⊂ terms — **conforme**.
  - **5/5 descriptions de schéma** (`schemas/*.json` `description`) = phrases **EXACT MATCH** (byte-exact) — **conforme**.
  - **10/10 `FRENCH_IDENTIFIERS`** (`lang-gate.mjs:46-50`) ⊂ terms — **conforme** (c'est CE sous-ensemble qui rend
    `root,contracts` = 0 ; source SÉPARÉE du fichier exempt ⇒ mutant M2 mord).
- **Aucune exemption large** (le point de vigilance de la tâche) — **conforme** :
  - 4 patterns tous **étroits** : `\bADR-[A-Za-z0-9-]+`, `\bR-\d+`, `harness_version\w*`, `§\d*` — aucun ne masque de
    prose française (`lang-gate.mjs:56-59` via `lang-exempt.json`).
  - phrases = sous-chaînes **byte-exact gelées** (les 5 descriptions + nom du corpus + 2 noms de jobs) : ne peuvent
    masquer AUCUN français nouveau (elles ne matchent que leur propre chaîne intégrale).
  - terms = tokens entiers (`\b…\b`) d'identifiants gelés : un français prose reste capté par les mots environnants.
- **Scopes** (`root, contracts, hikae, ukemi, atelier, monark`) : `lang-gate.mjs:96, 115-120` — **conforme** ; `--scope`
  ne pilote QUE le code de sortie.
- **Sortie fichier:ligne:mot** : format `rel:line:col  [kind]  word` (`lang-gate.mjs:235`) — **conforme**.
- **Observations (non bloquantes)** :
  - **O1** : `empreinte_du_sens_emis`, `revision_amont_deleguee` (termes ET FRENCH_IDENTIFIERS) = **0 occurrence** dans
    le repo exporté (mesuré). Ce sont des clés du **repo Shōgen externe** (`F:\Shogen`, non exporté), pas des fixtures
    MONARK présentes ici ⇒ **exemption inerte** (ne masque rien). La traçabilité G1 §3 « clés Shōgen des fixtures » est
    **imprécise** (elles ne sont pas dans `fixtures/`). Sans risque.
  - **O2** : l'exemption **token-entier** de mots FR qui sont aussi des identifiants gelés (`valide`, `verite`) pourrait,
    **isolément**, masquer une occurrence unique en prose nouvelle — borné (le français environnant reste capté),
    acceptable puisque ce sont des identifiants de contrat gelés.
  - **O3** : `FRW_RE` exclut le trait d'union de la frontière (`lang-gate.mjs:108-109`) ⇒ des composés FR sans diacritique
    (`sous-jacent`, `au-dessus`) échappent au signal `fr-word` — **matière pour les lots E**, sans effet sur `root,contracts`
    (mesuré 0).

### A.3 English-only (D0.5) — 0 chaîne française dans les scripts et le test (tâche 6)

- `scripts/export-public.mjs` : **0** signal français. `test/export-public.test.ts` : **0**. `scripts/export-exclude-tests.json`
  : **0** (« reason » anglais). — **conforme**.
- `scripts/lang-gate.mjs` : 24 lignes à signal FR, **toutes** = **données du détecteur** (`FR_WORDS` l.58-86, `DIACRITICS`
  l.89, `LETTER` l.102) ou **exemples cités dans commentaires anglais** (l.14 « ç », l.106-107 « peut-être ») — **pas de
  prose française** (c'est le gate lui-même : il énumère les tokens FR comme donnée). — **conforme (data, pas prose)**.
- `scripts/lang-exempt.json` : 6 lignes = 5 descriptions gelées + nom du corpus = **données d'exemption par construction**.
  — **conforme**.
- Grep négatif modèle banni (checklist G2) : `claude-opus-5` / tier nu / `haiku` dans les 5 livrables = **0**. ci.yml :
  actions **épinglées par SHA** (l.25-89), aucun tier de modèle.

### A.4 R-13, R-8, R-25, eslint-disable (tâche 5)

- **R-13** : aucun `TODO/FIXME/XXX/HACK` nu dans les 5 livrables — **conforme**.
- **eslint-disable / @ts-ignore / @ts-expect-error** : **0** — **conforme**.
- **R-8** : **aucune dépendance nouvelle** ; `git diff package.json` = **+3 scripts npm** (`export:check, export, lang:gate`)
  et « ci » **sémantiquement inchangé** (virgule de reflow) ; `package-lock.json` **inchangé** (0 ligne git status) — **conforme**.
- **R-25** : code-only (variante CI, exclut `package-lock` + `docs/G1-lot-*.md` + `docs/G2-lot-*.md`, D9 quater) = **772
  insertions / 1 ≤ 1205** — **conforme**. Variante mission (exclut `package-lock` seul) = **1105 / 1** (inclut G1 318 +
  ce rapport G2, tous deux exclus par le gate CI `r25-taille-de-lot`).

### A.5 Racine (tâche 7)

- `npm run ci` racine (inclut test 42 et sa CI imbriquée) = **tests 84 / pass 84 / fail 0**, exit 0 (11 s) — **conforme**.
- `npm run lint:ratchet` = **107/92, exit 1 (ROUGE)** — **pré-existant, HORS LOT confirmé** : compte **107 AVEC et
  SANS** `test/export-public.test.ts` (mesuré, fichier restauré byte-exact) ⇒ **Lot X y contribue 0**. Attribution =
  Lot K `interval-conformer.test.ts` (G1 §8). Résolution = pendant D9 ter (typer les fixtures) ou ré-alignement par ADR,
  **décision G7 orchestrateur**, jamais un contournement — **conforme (déclaré, non contourné)**.

---

## B. MUTANTS (test 42 discriminant) — restauration PAR COPIE, backup hors worktree, sha256 avant/après

Rejeu direct `node --test test/export-public.test.ts` (chaque run refait la CI imbriquée d'export). Backups pristine
copiés dans le scratchpad ; **sha256 avant = sha256 après = baseline** pour les 3 fichiers mutés. Les baselines
**correspondent exactement** aux sha256 rapportés par G1 (atteste que les fichiers revus sont dans l'état de G1).

| Mutant | Fichier muté (sha256 mutant → restauré) | Résultat test 42 | Discriminant ? |
|---|---|---|---|
| **M1** — `docs/adr/ADR-M001-*.md` dans la liste blanche | `export-public.mjs` `e7f25b40…` → `3d8e752f…` (=baseline) | export **FAILED** (blacklist, exit 1, rien écrit) ; `tests 1 / pass 0 / fail 1` | **OUI** (satisfait D11) |
| **M2** — `octets_recalcules` retiré de `lang-exempt.json` | `lang-exempt.json` `c76e25b3…` → `46a7ff75…` (=baseline) | `(c)` rougit (fr-id dé-masqué) ; `pass 0 / fail 1` | **OUI** |
| **M3-discriminant** — les **4** fichiers atelier retirés de la liste blanche | `export-public.mjs` `53966297…` → `3d8e752f…` | `(e)` : `atelier_no_network` surface **5 < 8** ; `pass 0 / fail 1` | **OUI** (4 entrées collectivement porteuses ; atelier src = 5, +4 démo = 9) |
| **M4** — `tests:[]` dans `export-exclude-tests.json` | `export-exclude-tests.json` `3bb8e413…` → `50806315…` | `(e)` : `s2.test.ts` ré-exporté → `s2_report_reproducible` ENOENT ; `pass 0 / fail 1` ; `(b)` reste vert (config-relatif) | **OUI** |
| **MINE-A** (mission) — `docs/JOURNAL-PROVENANCE.md` dans la liste blanche | `export-public.mjs` `5ce55d8f…` → `3d8e752f…` | export **FAILED** (« forbidden governance path… docs/JOURNAL-PROVENANCE.md », **dir non créé**) ; `pass 0 / fail 1` | **OUI** — « la liste noire rougit », fail-closed |
| **MINE-B** (double, sonde d'indépendance) — pattern JOURNAL **retiré** de la liste noire du script **+** ajout en liste blanche | `export-public.mjs` `7c231280…` → `3d8e752f…` | export **OK** mais JOURNAL **silencieusement exclu par la règle `.md` FR** (0 dans l'output) ; `pass 1 / fail 0` (**VERT**) | **finding, pas défaut** |

**Finding MINE-B (renforce R4)** : pour un fichier de gouvernance **français**, si son pattern structurel était retiré,
c'est la règle `.md` FR (exclusion **silencieuse**, non fatale) qui empêche la fuite — **pas** la liste noire structurelle,
et **pas** le miroir du test. Donc la défense en profondeur tient (aucune fuite dans tous les cas testés), MAIS le miroir
liste-noire **indépendant** du test 42(a) (`test/export-public.test.ts:55-63`, dont le large `/(^|\/)docs\//`) n'est
**exercé que pour une fuite gouvernance NON-française** ; la garantie fail-closed de la liste noire structurelle n'est
prouvée indépendamment que par M1/MINE-A (échec dur). Nuance d'ordonnancement, sans fuite ni défaut.

Après tous les mutants : `git status` = `M package.json` + livrables non modifiés ; **sha256 des 3 fichiers = baselines** ;
`npm run ci` racine = **84/84**. Aucun `packages/**`/`schemas/**` touché.

---

## C. SIMULATION DÉPÔT PUBLIC (tâche 4) + CI DISTANTE (item CA-X)

Export frais (`mkdtemp`) → **95 fichiers** + `EXPORT-MANIFEST.json` (96), 3 READMEs FR exclus, `s2.test.ts` exclu,
0 fuite gouvernance, `docs/` absent, `LICENSE` absent (sauté silencieusement — R2).

| Oracle | Commande | Résultat |
|---|---|---|
| `npm ci` dans l'export | `npm ci` | **exit 0, ~3 s, 0 vuln** |
| **CI de l'export (= job g3)** | `npm run ci` | **tests 73 / pass 73 / fail 0**, exit 0 (73 `test()` exportés) |
| Lint dans l'export | `npm run lint` | **exit 0** |
| Gate langue scopée (oracle du lot) | `node scripts/lang-gate.mjs --dir <export> --scope root,contracts` | **exit 0** (root 0, contracts 0) |
| Gate langue globale | `node scripts/lang-gate.mjs --dir <export>` | **exit 1**, **2743 hits** — par package ci-dessous |

**Comptage FR par package (export, non exempté)** — hikae **1577** (19 f.) · ukemi **846** (16 f.) · atelier **320** (10 f.)
· monark **0** · root **0** · contracts **0** · **global 2743**, exit 1 (ROUGE **par conception**, E-* non faits, déclaré).
Cohérent avec G1 §7 moins les exclusions de l'export : ukemi 1209−363(README)=846 ✓ ; atelier 426−106=320 ✓ ;
hikae 1837−176(README)−84(s2.test)=1577 ✓.

### C.1 CA-X « CI verte à distance » — chaque job du workflow exporté, exécuté DANS l'export

`.github/workflows/ci.yml` (exporté verbatim) = **5 jobs, `on: pull_request`**. Exécution des `run:` dans l'export :

| Job | Étapes | Résultat DANS l'export | Remarque |
|---|---|---|---|
| `g1-controle-generation` | `bash enforcement/lint-model-pinning.sh .` | **exit 0** | vert **par absence** (pas de `.claude/` dans l'export) |
| `g3-verification` | `npm ci && gate:vocab && typecheck && test` | **exit 0** (73/73) | = test 42(e) |
| `g4-architecture` | `npm run lint && npm run lint:ratchet` | **exit 0** — ratchet **82/92** | la racine `test/` **non exportée** fait chuter 107→82 (mesuré) |
| `g6-compliance` | `npm audit --audit-level=high` | **exit 0** (0 vuln) | réseau |
| `r25-taille-de-lot` | `git diff --shortstat origin/${base_ref}...HEAD` | **PROBLÉMATIQUE** (voir R1) | `pull_request`-only ; dépend d'une base de merge |

---

## D. RÉSERVES (liste FERMÉE — décisions dues avant la première publication ; aucune n'est un défaut de code du worker)

**R1 — CA-X « CI verte à distance » NON ÉTABLIE (réserve principale, verdict-driver). error_origin = orchestrateur
(D7/addendum).** Le `ci.yml` exporté est le workflow du **dépôt de gouvernance** (PR-par-lot, `main` protégé,
`on: pull_request`, job `r25` de taille de lot, job `g1` sur `.claude/`). Transplanté **verbatim** dans le dépôt vitrine
— que D7 l.80 peuple par « **un commit par export** » sur « **historique neuf** » — :
(a) le **push de publication ne déclenche AUCUN workflow** (`pull_request`-only) ⇒ « CI verte à distance » **jamais
exercée** par le mécanisme de publication D7 ;
(b) le job `r25-taille-de-lot` est **structurellement incompatible** avec une publication en snapshot complet à historique
neuf (pas de base de merge ⇒ `|| exit 1` fail-closed ; ou diff de snapshot complet ≫ 1205).
Mesuré : les jobs **code** g3 (73/73), g4 (ratchet 82/92), g6 (0 vuln) et g1 (vide) sont **verts dans l'export** ; seul
`r25` bloque. test 42(e) prouve correctement que la **CI de code** (`npm run ci` = g3) est verte, mais l'addendum
**assimile CA-X à ce seul `npm run ci`**, plus étroit que le workflow distant réel. **Décision due** : adapter le workflow
exporté au dépôt vitrine (déclencheur `push` ; applicabilité de `r25`/`g1` ; éventuel job dédié), **ou** acter+documenter
que la publication ne fait tourner aucune CI. **Preuve rejouable** : `grep -nE '^on:|github.base_ref' .github/workflows/ci.yml`
+ D7 l.80 + les 5 exécutions de jobs ci-dessus.

**R2 — `LICENSE` : mauvaise lecture de D7 + fail-open sur absence. error_origin = générateur (lecture D7) / orchestrateur
(décision LICENSE).** D7 l.76 ne tolère absent QUE `apps/site` ; G1 §2 a étendu « toléré absent » à `LICENSE` sans base
D7. `LICENSE` est **absent** du worktree et **silencieusement sauté** (`export-public.mjs:102-105` — toute entrée
whitelist absente n'est ni signalée ni fatale : **fail-open**, contraire à la posture fail-closed du reste). Deux items :
(a) **réserve script** — une entrée whitelist **non tolérée** manquante devrait être signalée/fatale ; (b) **pendant
investisseur formé** — un dépôt vitrine public **sans fichier de licence** (ajouter `LICENSE`, ou acter la publication
sans licence).

**R3 — `enforcement/` dans la liste blanche, absent de D7. error_origin = à établir (mission non visible du relecteur).**
`export-public.mjs:33`. G1 §2 le justifie par « exigé par la mission ». Contenu = `enforcement/lint-model-pinning.sh`
**seul** (anglais, référencé par le job g1, aucune fuite gouvernance/FR). **Confirmation orchestrateur due** que la mission
Lot X requérait bien cet ajout (sinon écart de périmètre). Même classe, **défendable** : `lang-gate.mjs`+`lang-exempt.json`
(le gate est inopérant sans eux).

**R4 — Règle `.md` FR = exclusion+report, déviation du D7 littéral (fail-closed). error_origin = orchestrateur (D7 littéral
vs intention).** `export-public.mjs:140,185-188` ; D7 l.77 met « tout .md en français » **dans** la liste noire. Le
raisonnement G1 §4.5 est **correct** (un échec dur rendrait l'export impossible tant que les lots E ne sont pas finis, et
D7 whiteliste `packages/*/README.md`), mais c'est une **déviation du littéral à adjuger explicitement**. Corollaire = le
finding **MINE-B** (§B) : la garantie fail-closed n'est indépendamment prouvée que pour une fuite **non-française**.

---

## E. CHECKLIST G2 DU CORPUS (100 %, réviseur ≠ générateur)

- **Compréhension / intention ≡ ADR (G0)** : ✔ chaque bloc expliqué ; rattachement D7/addendum/D8/D10/D11/CA-X clair.
- **Pièges code généré** : ✔ validation d'entrée = **fail-closed** (config manquante/malformée → exit 1, mesuré) ; pas
  d'inversion booléenne non testée ; style fonctionnel (pas de `this`) ; chemins/crypto = sha256 correct, `toPosix`
  cohérent, **symlinks = 0** (`git ls-files -s | grep '^120000'` = 0, aucun suivi de lien malveillant) ; « correction ≠
  sécurité » : le gate est un contrôle de **conformité**, non une frontière de sécurité — noté.
- **Dépendances (R-8)** : ✔ 0 nouvelle, lockfile inchangé.
- **Structure (G4)** : ✔ pas de duplication (`export-public.mjs` **réutilise** `lang-gate.mjs` par import — DRY) ; R-25 OK.
- **Traçabilité** : ✔ provenance G1 présente ; R-13 propre.
- **Revue séquentielle 3 étapes (AgileCoder)** : ✔ étape 1 (aucune impl. vide, imports résolus, fonctions documentées) ;
  étape 2 (chaque artefact ↔ tâche D7/addendum ; « en trop » = R2/R3, déclarés en réserve) ; étape 3 (critères — la
  réserve **R1** sur CA-X ; les autres CA-X « 0 gouvernance / 0 FR hors exempt / publié par le script » = **verts**).
- **Scripts de workflow** : N/A (aucun script `Workflow` du harness dans le diff ; `ci.yml` = YAML GitHub Actions, actions
  épinglées par SHA, aucun tier de modèle).

Verdict checklist : **APPROUVÉ AVEC RÉSERVES** (motif = §D).

---

## F. SORTIE STRUCTURÉE (schéma mission)

- **(a) conformité** : §A — livrables **conformes** ; 4 réserves d'écart de spec (§D) ; observations O1-O3 non bloquantes.
- **(b) mutants + sha256** : §B — M1/M2/M3-disc/M4/MINE-A **discriminants** (fail 1) ; MINE-B = finding (vert, nuance R4) ;
  3 fichiers mutés restaurés **byte-exact** (sha256 = baselines = valeurs G1).
- **(c) simulation dépôt public** : §C — export 95 f. ; `npm ci` 3 s exit 0 ; `npm run ci` **73/73** ; `npm run lint` exit 0 ;
  lang-gate scopé **vert**, global **rouge** (hikae 1577 / ukemi 846 / atelier 320 / monark 0 / **2743**) ; **5 jobs du
  workflow** caractérisés (g1/g3/g4/g6 verts, **r25 problématique** → R1).
- **(d) verdict** : **CLOS-AVEC-RÉSERVES** (liste fermée R1-R4, §D). Pas REFUS (aucun défaut de code) ; pas CLOS (CA-X « CI
  verte à distance » non établie + R2-R4). **Aucune réserve n'est un dû nu** : chacune est une **décision orchestrateur/
  investisseur formée** ou un **écart de spec D7/addendum** (error_origin orchestrateur/générateur), à trancher **avant la
  première publication** — jamais un contournement.
- **(e) modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié, GATE-0).

---
*Relecteur G2 `claude-opus-4-8[1m]`, effort max, 2026-09-06. Instance séparée, contexte frais, ≠ générateur. Aucun commit/
push (R-20) ; aucune poussée vers `KraidleAI/monark`. Chaque chiffre/commande est rejouable (R-21). Revue = conseil au G7 ;
verdict final + acceptation validateur = orchestrateur.*
